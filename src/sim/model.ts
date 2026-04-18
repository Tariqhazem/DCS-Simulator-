/** Steam generation process model (v1).
 *
 *  Live loop: 16LIC0011A — drum level controlled by BFW-A inlet valve.
 *  Other loops hold the static values from the reference screen so the
 *  operator sees a realistic snapshot; they become live in later iterations.
 *
 *  Mass balance (simplified, no swell/shrink yet):
 *    dV/dt = Q_bfwA + Q_bfwB - Q_steam - Q_blowdown
 *  Level% = V / V_drum * 100
 *
 *  Valve characteristics: linear with %OP for teaching clarity (real valves
 *  are equal-percentage; we can swap later).
 */

import { PidParams, PidState, newPidState, pidStep } from './pid';

export interface Tag {
  value: number;
  eu: string;
  lo?: number;
  hi?: number;
  hihi?: number;
  lolo?: number;
}

export interface ControllerSnapshot {
  sp: number;
  pv: number;
  op: number;
  mode: 'AUTO' | 'MAN' | 'CAS';
  eu: string;
}

export interface SimState {
  t: number;  // sim seconds since start

  // --- D-1601 steam drum ---
  drumLevel: number;           // % (the live PV)
  drumPressure: number;        // bar, held by PIC loops
  steamDemand: number;         // m³/h equivalent - disturbance source

  // --- BFW inlets ---
  bfwAValveOp: number;         // %  driven by 16LIC0011A
  bfwBValveOp: number;         // %  fixed until B loop goes live
  bfwAFlow: number;            // m³/h
  bfwBFlow: number;

  // --- Steam / pressure loop snapshots (static for v1) ---
  pic0090a: ControllerSnapshot;   // main steam-export valve
  pic0090b: ControllerSnapshot;   // vent / split-range B
  slic0063: ControllerSnapshot;   // D-1604 flash drum level

  // --- Drum triple-redundant LTs (2oo3 voted PV shown as LIC PV) ---
  li0012a: number;
  li0012b: number;
  li0012c: number;

  // --- Indicators ---
  fi0050: number;
  fi0051: number;
  pi0094: number;
  ai0011: number;
  lall0012Tripped: boolean;

  // --- LIC0011A/B controller state & setpoints ---
  lic0011a: ControllerSnapshot;
  lic0011b: ControllerSnapshot;

  pidA: PidState;
}

const pidParamsLIC_A: PidParams = {
  kp: 1.8,
  ti: 60,    // 60 s integral - typical for slow level loops
  td: 0,
  action: 'reverse',  // PV high => close inlet => OP down
  opMin: 0,
  opMax: 100,
};

// drum geometry (teaching values, not plant-specific)
const DRUM_VOLUME_M3 = 20;            // effective water holdup at 50%
const BFW_MAX_FLOW = 180;             // m³/h at 100% valve
const STEAM_NOMINAL = 150;            // m³/h liquid equivalent
const BLOWDOWN = 2;                   // m³/h continuous

export function createInitialState(): SimState {
  return {
    t: 0,
    drumLevel: 54.7,
    drumPressure: 45.18,
    steamDemand: STEAM_NOMINAL,

    bfwAValveOp: 52.2,
    bfwBValveOp: 52.7,
    bfwAFlow: 0,
    bfwBFlow: 0,

    pic0090a: { sp: 45.22, pv: 45.18, op: 58.4, mode: 'AUTO', eu: 'bar' },
    pic0090b: { sp: 45.22, pv: 45.18, op: 0.0,  mode: 'AUTO', eu: 'bar' },
    slic0063: { sp: 28.5,  pv: 28.5,  op: 15.4, mode: 'AUTO', eu: '%'   },

    li0012a: 33.22,
    li0012b: 39.85,
    li0012c: 39.43,

    fi0050: 127747,
    fi0051: 2.12,
    pi0094: 20.76,
    ai0011: 65,
    lall0012Tripped: false,

    lic0011a: { sp: 35.0, pv: 54.7, op: 52.2, mode: 'AUTO', eu: '%' },
    lic0011b: { sp: 55.0, pv: 54.7, op: 52.7, mode: 'MAN',  eu: '%' },

    pidA: newPidState(),
  };
}

/** Advance the simulation by `dt` seconds. */
export function tick(s: SimState, dt: number): SimState {
  const ns: SimState = { ...s, pidA: { ...s.pidA } };
  ns.t = s.t + dt;

  // --- mild periodic steam-demand wander so the operator sees the loop work
  ns.steamDemand = STEAM_NOMINAL + Math.sin(ns.t / 45) * 6;

  // --- LIC0011A live PID
  if (ns.lic0011a.mode === 'AUTO') {
    const { op } = pidStep(
      pidParamsLIC_A,
      ns.pidA,
      ns.lic0011a.sp,
      ns.drumLevel,
      dt,
      52,
    );
    ns.lic0011a = { ...ns.lic0011a, op };
    ns.bfwAValveOp = op;
  } else {
    ns.bfwAValveOp = ns.lic0011a.op;
  }

  // --- flows from valve positions
  ns.bfwAFlow = (ns.bfwAValveOp / 100) * BFW_MAX_FLOW;
  ns.bfwBFlow = (ns.bfwBValveOp / 100) * BFW_MAX_FLOW * 0.5; // B is smaller trim

  // --- drum level integration
  const qIn = ns.bfwAFlow + ns.bfwBFlow;
  const qOut = ns.steamDemand + BLOWDOWN;
  const dV = (qIn - qOut) * (dt / 3600);   // m³
  const newLevel = ns.drumLevel + (dV / DRUM_VOLUME_M3) * 100;
  ns.drumLevel = Math.max(0, Math.min(100, newLevel));
  ns.lic0011a = { ...ns.lic0011a, pv: ns.drumLevel };

  // 2oo3 voted LTs — v1: all track drum level with small fixed offsets
  ns.li0012a = ns.drumLevel - 21;   // the screenshot anomaly
  ns.li0012b = ns.drumLevel - 15;
  ns.li0012c = ns.drumLevel - 15.3;

  ns.lall0012Tripped = [ns.li0012a, ns.li0012b, ns.li0012c]
    .filter(v => v < 20).length >= 2;

  // other loops: held static for v1 (snapshot displayed)
  // small harmless pressure wobble for visual life
  const pWobble = Math.sin(ns.t / 30) * 0.03;
  ns.drumPressure = 45.18 + pWobble;
  ns.pic0090a = { ...ns.pic0090a, pv: ns.drumPressure };
  ns.pic0090b = { ...ns.pic0090b, pv: ns.drumPressure };

  return ns;
}
