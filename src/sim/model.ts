/** Steam generation process model (v2).
 *
 *  Live loops:
 *    16LIC0011A  — reverse PID, BFW-A inlet, controls drum level
 *    16LIC0011B  — reverse PID, BFW-B inlet (parallel trim), controls drum level
 *    16SLIC0063  — direct  PID, D-1604 flash-drum drain valve
 *
 *  Drum dynamics include a swell/shrink term:
 *    level_PV = level_true + swell
 *    swell(t+dt) = swell(t) * exp(-dt/τ) + K_swell * Δdemand
 *
 *  When both LIC0011A and LIC0011B are in AUTO with the same PV they drive
 *  toward their individual SPs; differing SPs produce a natural load split
 *  dictated by each controller's integral wind-up. Same plant behaviour as
 *  two parallel level controllers on separate feedwater trains.
 */

import { PidParams, PidState, newPidState, pidStep } from './pid';

export interface ControllerSnapshot {
  sp: number;
  pv: number;
  op: number;
  mode: 'AUTO' | 'MAN';
  eu: string;
}

export interface SimState {
  t: number;

  // --- D-1601 steam drum ---
  drumLevelTrue: number;       // mass-balance level (%)
  drumSwell: number;           // transient swell/shrink offset (%)
  drumPressure: number;        // bar
  steamDemandNominal: number;  // m³/h
  steamDemandBias: number;     // operator-added disturbance (m³/h)

  bfwAFlow: number;
  bfwBFlow: number;

  // --- D-1604 flash drum ---
  d1604Level: number;          // %
  d1604InFlow: number;         // m³/h (small constant for v2)

  // --- Loops ---
  lic0011a: ControllerSnapshot;
  lic0011b: ControllerSnapshot;
  pic0090a: ControllerSnapshot;
  pic0090b: ControllerSnapshot;
  slic0063: ControllerSnapshot;

  pidA: PidState;
  pidB: PidState;
  pidSlic: PidState;

  // --- Redundant LTs on D-1601 ---
  li0012a: number;
  li0012b: number;
  li0012c: number;

  // --- Indicators ---
  fi0050: number;
  fi0051: number;
  pi0094: number;
  ai0011: number;
  lall0012Tripped: boolean;
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

// drum geometry
const DRUM_VOLUME_M3 = 20;            // effective water holdup at 50%
const BFW_A_MAX = 180;                // m³/h at 100% valve
const BFW_B_MAX = 90;                 // B trim valve is smaller
const STEAM_NOMINAL = 150;            // m³/h liquid equivalent
const BLOWDOWN = 2;                   // m³/h

// swell/shrink
const SWELL_TAU = 10;                 // s
const SWELL_K = 0.3;                  // %/(m³/h impulse)

// D-1604 flash drum
const FLASH_VOL = 4;                  // m³
const FLASH_DRAIN_MAX = 12;           // m³/h at 100% valve

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

    fi0050: 127747,
    fi0051: 2.12,
    pi0094: 20.76,
    ai0011: 65,
    lall0012Tripped: false,
  };
}

export function tick(s: SimState, dt: number): SimState {
  const ns: SimState = {
    ...s,
    pidA: { ...s.pidA },
    pidB: { ...s.pidB },
    pidSlic: { ...s.pidSlic },
  };
  ns.t = s.t + dt;

  // --- total steam demand: nominal + small wander + operator bias
  const wander = Math.sin(ns.t / 45) * 4;
  const steamDemand = ns.steamDemandNominal + wander + ns.steamDemandBias;
  const demandDelta =
    steamDemand -
    (s.steamDemandNominal + Math.sin(s.t / 45) * 4 + s.steamDemandBias);

  // --- LIC0011A
  const pvA = s.drumLevelTrue + s.drumSwell;
  if (ns.lic0011a.mode === 'AUTO') {
    const { op } = pidStep(pidParamsLIC_A, ns.pidA, ns.lic0011a.sp, pvA, dt, 52);
    ns.lic0011a = { ...ns.lic0011a, op, pv: pvA };
  } else {
    ns.lic0011a = { ...ns.lic0011a, pv: pvA };
  }
  ns.bfwAFlow = (ns.lic0011a.op / 100) * BFW_A_MAX;

  // --- LIC0011B
  if (ns.lic0011b.mode === 'AUTO') {
    const { op } = pidStep(pidParamsLIC_B, ns.pidB, ns.lic0011b.sp, pvA, dt, 50);
    ns.lic0011b = { ...ns.lic0011b, op, pv: pvA };
  } else {
    ns.lic0011b = { ...ns.lic0011b, pv: pvA };
  }
  ns.bfwBFlow = (ns.lic0011b.op / 100) * BFW_B_MAX;

  // --- drum true-mass integration
  const qIn = ns.bfwAFlow + ns.bfwBFlow;
  const qOut = steamDemand + BLOWDOWN;
  const dV = (qIn - qOut) * (dt / 3600);
  ns.drumLevelTrue = Math.max(
    0, Math.min(100, s.drumLevelTrue + (dV / DRUM_VOLUME_M3) * 100)
  );

  // --- swell/shrink: exponential decay + demand-delta impulse
  ns.drumSwell = s.drumSwell * Math.exp(-dt / SWELL_TAU) + SWELL_K * demandDelta;

  // --- SLIC0063 (direct: PV up -> open drain)
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

  // --- redundant LTs (offsets match reference screenshot anomaly for LI-A)
  const pv = ns.drumLevelTrue + ns.drumSwell;
  ns.li0012a = pv - 21;
  ns.li0012b = pv - 15;
  ns.li0012c = pv - 15.3;
  ns.lall0012Tripped =
    [ns.li0012a, ns.li0012b, ns.li0012c].filter(v => v < 20).length >= 2;

  // --- pressure loops: small wobble (static in v2)
  const pWobble = Math.sin(ns.t / 30) * 0.03;
  ns.drumPressure = 45.18 + pWobble;
  ns.pic0090a = { ...ns.pic0090a, pv: ns.drumPressure };
  ns.pic0090b = { ...ns.pic0090b, pv: ns.drumPressure };

  return ns;
}
