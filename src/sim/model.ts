/** Steam generation process model (v3).
 *
 *  Live loops: LIC0011A, LIC0011B, SLIC0063 (all PID).
 *  Split-range: PIC0090A/B proxy controller driven by (SP - PV).
 *
 *  Drum PV includes swell/shrink:
 *    swell(t+dt) = swell(t)·exp(-dt/τ) + K·(Δdemand − Δheat)
 *
 *  Instructor scenarios stack additively:
 *    • bfwATrip            — zero BFW-A max flow (pump-A failure)
 *    • lt0012aDriftRate    — 16LI0012A readout drifts low (sensor fault)
 *    • drumLeak            — continuous mass loss (tube rupture)
 *    • reformerHeatBias    — extra steam generation (not extra demand)
 *    • picSpBump           — delta on 16PIC0090A SP (exercise split range)
 *    • simFrozen           — pause integration
 */

import { PidParams, PidState, newPidState, pidStep } from './pid';

export interface ControllerSnapshot {
  sp: number;
  pv: number;
  op: number;
  mode: 'AUTO' | 'MAN';
  eu: string;
}

export interface InstructorScenarios {
  bfwATrip: boolean;
  lt0012aDriftRate: number;   // % per second (accumulates into lt0012aDrift)
  drumLeak: number;           // m³/h
  reformerHeatBias: number;   // m³/h equivalent extra generation
  picSpBump: number;          // bar delta on PIC0090A SP
  simFrozen: boolean;
}

export interface SimState {
  t: number;

  drumLevelTrue: number;
  drumSwell: number;
  drumPressure: number;
  steamDemandNominal: number;
  steamDemandBias: number;

  bfwAFlow: number;
  bfwBFlow: number;

  d1604Level: number;
  d1604InFlow: number;

  lic0011a: ControllerSnapshot;
  lic0011b: ControllerSnapshot;
  pic0090a: ControllerSnapshot;
  pic0090b: ControllerSnapshot;
  slic0063: ControllerSnapshot;

  pidA: PidState;
  pidB: PidState;
  pidSlic: PidState;

  li0012a: number;
  li0012b: number;
  li0012c: number;
  lt0012aDrift: number;

  fi0050: number;
  fi0051: number;
  pi0094: number;
  ai0011: number;
  lall0012Tripped: boolean;

  scen: InstructorScenarios;
}

const pidParamsLIC_A: PidParams = {
  kp: 1.8, ti: 60, td: 0, action: 'reverse', opMin: 0, opMax: 100,
};
const pidParamsLIC_B: PidParams = {
  kp: 1.5, ti: 80, td: 0, action: 'reverse', opMin: 0, opMax: 100,
};
const pidParamsSLIC: PidParams = {
  kp: 2.5, ti: 40, td: 0, action: 'direct',  opMin: 0, opMax: 100,
};

const DRUM_VOLUME_M3 = 20;
const BFW_A_MAX = 180;
const BFW_B_MAX = 90;
const STEAM_NOMINAL = 150;
const BLOWDOWN = 2;
const SWELL_TAU = 10;
const SWELL_K = 0.3;
const FLASH_VOL = 4;
const FLASH_DRAIN_MAX = 12;

export const scenariosInitial = (): InstructorScenarios => ({
  bfwATrip: false,
  lt0012aDriftRate: 0,
  drumLeak: 0,
  reformerHeatBias: 0,
  picSpBump: 0,
  simFrozen: false,
});

export function createInitialState(): SimState {
  return {
    t: 0,
    drumLevelTrue: 54.7,
    drumSwell: 0,
    drumPressure: 45.18,
    steamDemandNominal: STEAM_NOMINAL,
    steamDemandBias: 0,

    bfwAFlow: 0,
    bfwBFlow: 0,

    d1604Level: 28.5,
    d1604InFlow: 1.8,

    lic0011a: { sp: 55.0, pv: 54.7, op: 52.2, mode: 'AUTO', eu: '%' },
    lic0011b: { sp: 55.0, pv: 54.7, op: 52.7, mode: 'MAN',  eu: '%' },
    pic0090a: { sp: 45.22, pv: 45.18, op: 58.4, mode: 'AUTO', eu: 'bar' },
    pic0090b: { sp: 45.22, pv: 45.18, op: 0.0,  mode: 'AUTO', eu: 'bar' },
    slic0063: { sp: 28.5,  pv: 28.5,  op: 15.4, mode: 'AUTO', eu: '%'   },

    pidA: newPidState(),
    pidB: newPidState(),
    pidSlic: newPidState(),

    li0012a: 33.22,
    li0012b: 39.85,
    li0012c: 39.43,
    lt0012aDrift: 0,

    fi0050: 127747,
    fi0051: 2.12,
    pi0094: 20.76,
    ai0011: 65,
    lall0012Tripped: false,

    scen: scenariosInitial(),
  };
}

/** Split-range proxy on pressure. signal in [0..100]:
 *   signal 0..50  → A strokes 0..100, B = 0
 *   signal 50..100 → A = 100, B strokes 0..100
 *  PIC-A is direct acting: PV rising (pressure high) raises signal.
 */
function splitRange(prevA: ControllerSnapshot, prevB: ControllerSnapshot, pv: number, spA: number): { opA: number; opB: number } {
  const K = 20;   // %/bar — cosmetic gain; high enough to exercise split on small SP bumps
  const bias = 58.4;
  const signal = Math.max(0, Math.min(100, bias + K * (pv - spA)));
  const opA = signal <= 50 ? signal * 2 : 100;
  const opB = signal > 50 ? (signal - 50) * 2 : 0;
  // slew slightly to avoid step artefacts
  const slew = (prev: number, next: number) => prev + (next - prev) * 0.2;
  return {
    opA: slew(prevA.op, opA),
    opB: slew(prevB.op, opB),
  };
}

export function tick(s: SimState, dt: number): SimState {
  if (s.scen.simFrozen) return s;

  const ns: SimState = {
    ...s,
    pidA: { ...s.pidA },
    pidB: { ...s.pidB },
    pidSlic: { ...s.pidSlic },
    scen: { ...s.scen },
  };
  ns.t = s.t + dt;

  // --- total steam demand (mass leaving drum)
  const wander = Math.sin(ns.t / 45) * 2;
  const wanderPrev = Math.sin(s.t / 45) * 2;
  const steamDemand = ns.steamDemandNominal + wander + ns.steamDemandBias;
  const steamDemandPrev = s.steamDemandNominal + wanderPrev + s.steamDemandBias;
  const demandDelta = steamDemand - steamDemandPrev;

  // --- reformer heat bias: pressure/gen driver, not mass-loss driver
  const heatDelta = ns.scen.reformerHeatBias - s.scen.reformerHeatBias;

  // --- LIC0011A
  const pvA = s.drumLevelTrue + s.drumSwell;
  if (ns.lic0011a.mode === 'AUTO') {
    const { op } = pidStep(pidParamsLIC_A, ns.pidA, ns.lic0011a.sp, pvA, dt, 52);
    ns.lic0011a = { ...ns.lic0011a, op, pv: pvA };
  } else {
    ns.lic0011a = { ...ns.lic0011a, pv: pvA };
  }
  const bfwAmax = ns.scen.bfwATrip ? 0 : BFW_A_MAX;
  ns.bfwAFlow = (ns.lic0011a.op / 100) * bfwAmax;

  // --- LIC0011B
  if (ns.lic0011b.mode === 'AUTO') {
    const { op } = pidStep(pidParamsLIC_B, ns.pidB, ns.lic0011b.sp, pvA, dt, 50);
    ns.lic0011b = { ...ns.lic0011b, op, pv: pvA };
  } else {
    ns.lic0011b = { ...ns.lic0011b, pv: pvA };
  }
  ns.bfwBFlow = (ns.lic0011b.op / 100) * BFW_B_MAX;

  // --- drum mass balance (heat does NOT shift steady-state mass balance)
  const qIn = ns.bfwAFlow + ns.bfwBFlow;
  const qOut = steamDemand + BLOWDOWN + ns.scen.drumLeak;
  const dV = (qIn - qOut) * (dt / 3600);
  ns.drumLevelTrue = Math.max(
    0, Math.min(100, s.drumLevelTrue + (dV / DRUM_VOLUME_M3) * 100)
  );

  // --- swell/shrink: +dDemand causes swell, +dHeat causes shrink
  ns.drumSwell =
    s.drumSwell * Math.exp(-dt / SWELL_TAU) +
    SWELL_K * (demandDelta - heatDelta);

  // --- SLIC0063 direct-acting level-on-outlet
  const pvSlic = s.d1604Level;
  if (ns.slic0063.mode === 'AUTO') {
    const { op } = pidStep(pidParamsSLIC, ns.pidSlic, ns.slic0063.sp, pvSlic, dt, 15);
    ns.slic0063 = { ...ns.slic0063, op, pv: pvSlic };
  } else {
    ns.slic0063 = { ...ns.slic0063, pv: pvSlic };
  }
  const drainFlow = (ns.slic0063.op / 100) * FLASH_DRAIN_MAX;
  const d1604dV = (ns.d1604InFlow - drainFlow) * (dt / 3600);
  ns.d1604Level = Math.max(
    0, Math.min(100, s.d1604Level + (d1604dV / FLASH_VOL) * 100)
  );

  // --- redundant LTs (drift applied only to A)
  ns.lt0012aDrift = s.lt0012aDrift + ns.scen.lt0012aDriftRate * dt;
  const basePv = ns.drumLevelTrue + ns.drumSwell;
  ns.li0012a = basePv - 21 + ns.lt0012aDrift;  // drift is negative so "low" drift
  ns.li0012b = basePv - 15;
  ns.li0012c = basePv - 15.3;
  ns.lall0012Tripped =
    [ns.li0012a, ns.li0012b, ns.li0012c].filter(v => v < 20).length >= 2;

  // --- drum pressure: heat raises it (cosmetic integration)
  const pWobble = Math.sin(ns.t / 30) * 0.03;
  const pFromHeat = ns.scen.reformerHeatBias * 0.02;  // 0.02 bar per m³/h of heat
  ns.drumPressure = 45.18 + pWobble + pFromHeat;

  // --- PIC0090A/B split-range (direct action; SP can be bumped by scenario)
  const PIC_SP_BASE = 45.22;
  const effectiveSpA = PIC_SP_BASE + ns.scen.picSpBump;
  const { opA, opB } = splitRange(s.pic0090a, s.pic0090b, ns.drumPressure, effectiveSpA);
  ns.pic0090a = { ...ns.pic0090a, pv: ns.drumPressure, op: opA, sp: effectiveSpA };
  ns.pic0090b = { ...ns.pic0090b, pv: ns.drumPressure, op: opB, sp: effectiveSpA };

  return ns;
}
