import { useEffect, useState } from 'react';
import { createInitialState, tick, SimState, ControllerSnapshot, InstructorScenarios } from '../sim/model';
import { InstructorPanel, ScenarioBanner } from '../components/InstructorPanel';
import { DegasserGeometry, VB_W, VB_H } from './DegasserGeometry';
import { DegasserFaceplates, LoopKey } from './DegasserFaceplates';

const LOOP_TAGS: Record<LoopKey, string> = {
  lic0011a: '16LIC0011A',
  lic0011b: '16LIC0011B',
  pic0157: '16PIC0157',
  fic0086: '10FIC0086',
  lic0050: '16LIC0050',
};
const LOOP_STATE: Record<LoopKey, keyof SimState> = {
  lic0011a: 'lic0011a',
  lic0011b: 'lic0011b',
  pic0157: 'pic0090a',
  fic0086: 'slic0063',
  lic0050: 'lic0011a',
};

interface LoopDialogState {
  key: LoopKey;
  sp: string;
  op: string;
  mode: 'AUTO' | 'MAN';
}

export function Degasser() {
  const [sim, setSim] = useState<SimState>(() => createInitialState());
  const [dialog, setDialog] = useState<LoopDialogState | null>(null);
  const [instrOpen, setInstrOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSim(s => tick(s, 0.1)), 100);
    return () => clearInterval(id);
  }, []);

  const updateScenario = (patch: Partial<InstructorScenarios>) =>
    setSim(s => ({ ...s, scen: { ...s.scen, ...patch } }));

  const resetSim = () => setSim(createInitialState());

  const openDialog = (key: LoopKey) => {
    const ctrl = sim[LOOP_STATE[key]] as ControllerSnapshot;
    setDialog({
      key,
      sp: ctrl.sp.toFixed(1),
      op: ctrl.op.toFixed(1),
      mode: ctrl.mode,
    });
  };

  const applyDialog = () => {
    if (!dialog) return;
    const sp = parseFloat(dialog.sp);
    const op = parseFloat(dialog.op);
    const stateKey = LOOP_STATE[dialog.key];
    setSim(s => {
      const cur = s[stateKey] as ControllerSnapshot;
      return {
        ...s,
        [stateKey]: {
          ...cur,
          sp: Number.isFinite(sp) ? sp : cur.sp,
          op: dialog.mode === 'MAN' && Number.isFinite(op)
            ? Math.max(0, Math.min(100, op))
            : cur.op,
          mode: dialog.mode,
        } as ControllerSnapshot,
      };
    });
    setDialog(null);
  };

  const bumpDemand = (delta: number) =>
    setSim(s => ({ ...s, steamDemandBias: s.steamDemandBias + delta }));
  const resetDemand = () =>
    setSim(s => ({ ...s, steamDemandBias: 0 }));

  return (
    <>
      <svg className="pid-canvas" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <DegasserGeometry />
      </svg>

      <DegasserFaceplates sim={sim} onOpen={openDialog} />

      <div style={{
        position: 'absolute', left: 16, bottom: 28,
        background: 'rgba(0,0,0,0.6)', border: '1px solid #000',
        padding: '6px 10px', display: 'flex', gap: 8, alignItems: 'center',
        fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff',
      }}>
        <span style={{ color: '#9fb7bf' }}>DISTURBANCE — steam demand bias:</span>
        <span style={{ color: sim.steamDemandBias === 0 ? '#9fb7bf' : '#ffeb3b', minWidth: 50 }}>
          {sim.steamDemandBias >= 0 ? '+' : ''}{sim.steamDemandBias.toFixed(0)} m³/h
        </span>
        <button onClick={() => bumpDemand(-20)} className="disturb-btn">−20</button>
        <button onClick={() => bumpDemand(+20)} className="disturb-btn">+20</button>
        <button onClick={resetDemand} className="disturb-btn">RESET</button>
        <span style={{ color: '#9fb7bf', marginLeft: 12 }}>
          swell: {sim.drumSwell.toFixed(2)}%
        </span>
      </div>

      <ScenarioBanner scen={sim.scen} />
      <InstructorPanel
        open={instrOpen}
        scen={sim.scen}
        onToggle={() => setInstrOpen(o => !o)}
        onChange={updateScenario}
        onResetSim={resetSim}
      />

      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>{LOOP_TAGS[dialog.key]} — LOOP TUNE</h4>
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>MODE</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {(['AUTO', 'MAN'] as const).map(m => (
                <button
                  key={m}
                  className={dialog.mode === m ? 'primary' : ''}
                  onClick={() => setDialog({ ...dialog, mode: m })}
                  style={{ flex: 1 }}
                >
                  {m}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>SETPOINT</label>
            <input
              type="number"
              value={dialog.sp}
              step="0.1"
              onChange={e => setDialog({ ...dialog, sp: e.target.value })}
              autoFocus
            />
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>OUTPUT % (MAN only)</label>
            <input
              type="number"
              value={dialog.op}
              step="0.1"
              min={0}
              max={100}
              disabled={dialog.mode === 'AUTO'}
              onChange={e => setDialog({ ...dialog, op: e.target.value })}
            />
            <div className="row">
              <button onClick={() => setDialog(null)}>CANCEL</button>
              <button className="primary" onClick={applyDialog}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
