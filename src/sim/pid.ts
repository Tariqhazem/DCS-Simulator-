/** Discrete PID with anti-windup clamping.
 *
 *  Action convention (Honeywell PKS):
 *    REVERSE — PV ↑ makes OP ↓  (level-on-inlet, flow-on-inlet, cooling heater)
 *    DIRECT  — PV ↑ makes OP ↑  (level-on-outlet, heater cooling jacket)
 *
 *  Implementation: error carries the action sign, so Kp stays positive.
 *    reverse:  e = SP - PV     (positive e → OP up → push PV toward SP)
 *    direct :  e = PV - SP
 *
 *  Derivative is taken on PV (bumpless on SP change) with the same action sign.
 */

export interface PidParams {
  kp: number;     // proportional gain  (%/EU)
  ti: number;     // integral time (s) - 0 disables I
  td: number;     // derivative time (s)
  action: 'direct' | 'reverse';
  opMin: number;
  opMax: number;
}

export interface PidState {
  integral: number;   // accumulated integral term (already multiplied by Kp/Ti)
  prevPv: number;
  initialised: boolean;
}

export const newPidState = (): PidState => ({
  integral: 0,
  prevPv: 0,
  initialised: false,
});

export function pidStep(
  params: PidParams,
  state: PidState,
  sp: number,
  pv: number,
  dt: number,
  opBias = 50,
): { op: number; state: PidState } {
  const sign = params.action === 'reverse' ? 1 : -1;
  const e = sign * (sp - pv);

  if (!state.initialised) {
    state.prevPv = pv;
    state.initialised = true;
  }

  const pTerm = params.kp * e;
  const iTermTrial = params.ti > 0
    ? state.integral + (params.kp * e * dt) / params.ti
    : 0;
  const dTerm = params.td > 0
    ? -sign * params.kp * params.td * ((pv - state.prevPv) / dt)
    : 0;

  let op = opBias + pTerm + iTermTrial + dTerm;

  const saturatedHi = op > params.opMax;
  const saturatedLo = op < params.opMin;
  if (saturatedHi) op = params.opMax;
  if (saturatedLo) op = params.opMin;

  // anti-windup: freeze integrator if it would push further into saturation
  const integratorWouldGrow = e > 0;
  const lockIntegrator =
    (saturatedHi && integratorWouldGrow) || (saturatedLo && !integratorWouldGrow);
  if (!lockIntegrator) state.integral = iTermTrial;

  state.prevPv = pv;
  return { op, state };
}
