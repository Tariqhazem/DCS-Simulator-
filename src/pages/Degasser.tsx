import { useEffect, useState } from 'react';
import { createInitialState, tick, SimState, ControllerSnapshot, InstructorScenarios } from '../sim/model';
import { InstructorPanel, ScenarioBanner } from '../components/InstructorPanel';
import { Faceplate } from '../components/Faceplate';

type LoopKey = 'lic0011a' | 'lic0011b' | 'pic0157' | 'fic0086' | 'lic0050';

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

/** Overlay positions in % of the backdrop image.
 *  Tune these once by eye after first render. */
const POS = {
  pic0157:  { left: 22.0, top: 25.5 },
  fic0086:  { left: 37.5, top: 25.5 },
  lic0050:  { left: 29.0, top: 46.0 },
  lic0011a: { left: 82.0, top: 20.0 },
  lic0011b: { left: 91.0, top: 20.0 },
  fic0101:  { left: 77.0, top: 58.0 },
  li0052:   { left: 56.0, top: 47.0 },
  level:    { left: 48.5, top: 56.5, w: 2.0, h: 8.0 }, // 3 cyan blocks area
  disturb:  { left: 1, bottom: 1 },
};

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
    setDialog({ key, sp: ctrl.sp.toFixed(1), op: ctrl.op.toFixed(1), mode: ctrl.mode });
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
            ? Math.max(0, Math.min(100, op)) : cur.op,
          mode: dialog.mode,
        } as ControllerSnapshot,
      };
    });
    setDialog(null);
  };

  const bumpDemand = (delta: number) =>
    setSim(s => ({ ...s, steamDemandBias: s.steamDemandBias + delta }));
  const resetDemand = () => setSim(s => ({ ...s, steamDemandBias: 0 }));

  // Derived faceplate snapshots mapping existing state to Degasser tags
  const pic0157: ControllerSnapshot = {
    sp: 0.291, pv: 0.247, op: sim.pic0090a.op, mode: sim.pic0090a.mode, eu: 'bar',
  };
  const fic0086: ControllerSnapshot = {
    sp: 2150, pv: 2122, op: sim.slic0063.op, mode: sim.slic0063.mode, eu: 'kg/h',
  };
  const lic0050: ControllerSnapshot = {
    sp: NaN, pv: NaN, op: sim.lic0011a.op, mode: sim.lic0011a.mode, eu: '%',
  };
  const fic0101: ControllerSnapshot = {
    sp: 123.1, pv: 127.6 + (sim.lic0011a.op - 52) * 0.1,
    op: 61.9, mode: 'AUTO', eu: 'kg/h',
  };

  return (
    <>
      {/* Background: traced P&ID SVG filling the viewport */}
      <img
        src="/degasser.svg"
        alt="Degasser D-1603 P&ID"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center top',
          pointerEvents: 'none', userSelect: 'none',
        }}
      />

      {/* Live overlays — positioned relative to the backdrop */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Overlay pos={POS.pic0157}>
          <Faceplate tag="16PIC0157" ctrl={pic0157} live onClick={() => openDialog('pic0157')} />
        </Overlay>
        <Overlay pos={POS.fic0086}>
          <Faceplate tag="10FIC0086" ctrl={fic0086} live onClick={() => openDialog('fic0086')} />
        </Overlay>
        <Overlay pos={POS.lic0050}>
          <Faceplate tag="16LIC0050" ctrl={lic0050} pvBar={{ min: 0, max: 100 }} />
        </Overlay>
        <Overlay pos={POS.lic0011a}>
          <Faceplate tag="16LIC0011A" ctrl={sim.lic0011a} live onClick={() => openDialog('lic0011a')} />
        </Overlay>
        <Overlay pos={POS.lic0011b}>
          <Faceplate tag="16LIC0011B" ctrl={sim.lic0011b} live onClick={() => openDialog('lic0011b')} />
        </Overlay>
        <Overlay pos={POS.fic0101}>
          <Faceplate tag="16FIC0101" ctrl={fic0101} pvBar={{ min: 0, max: 200 }} />
        </Overlay>

        <Overlay pos={POS.li0052}>
          <div style={{ background: '#000', border: '1px solid #000', fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff', minWidth: 120 }}>
            <div style={{ background: '#2b2b2b', padding: '1px 4px', borderBottom: '1px solid #000' }}>16LI0052</div>
            {[['A', sim.li0012a], ['B', sim.li0012b], ['C', sim.li0012c]].map(([l, v]) => (
              <div key={l as string} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', padding: '1px 4px' }}>
                <span style={{ color: '#9fb7bf' }}>{l}</span>
                <span style={{ color: 'var(--pv)', textAlign: 'right' }}>{(v as number).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ background: '#2b2b2b', padding: '1px 4px', borderTop: '1px solid #000' }}>16LAHH0052</div>
            <div style={{
              background: sim.lall0012Tripped ? '#ff4d4d' : '#2b2b2b',
              padding: '1px 4px', borderTop: '1px solid #000',
              color: sim.lall0012Tripped ? '#000' : '#fff',
              fontWeight: sim.lall0012Tripped ? 700 : 400,
            }}>16LALL0052{sim.lall0012Tripped ? '  TRIP' : ''}</div>
          </div>
        </Overlay>
      </div>

      {/* Disturbance bar */}
      <div style={{
        position: 'fixed', left: 16, bottom: 16,
        background: 'rgba(0,0,0,0.75)', border: '1px solid #000',
        padding: '6px 10px', display: 'flex', gap: 8, alignItems: 'center',
        fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff', zIndex: 50,
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
        open={instrOpen} scen={sim.scen}
        onToggle={() => setInstrOpen(o => !o)}
        onChange={updateScenario} onResetSim={resetSim}
      />

      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>{LOOP_TAGS[dialog.key]} — LOOP TUNE</h4>
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>MODE</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {(['AUTO', 'MAN'] as const).map(m => (
                <button key={m}
                  className={dialog.mode === m ? 'primary' : ''}
                  onClick={() => setDialog({ ...dialog, mode: m })}
                  style={{ flex: 1 }}>{m}</button>
              ))}
            </div>
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>SETPOINT</label>
            <input type="number" value={dialog.sp} step="0.1"
              onChange={e => setDialog({ ...dialog, sp: e.target.value })} autoFocus />
            <label style={{ fontSize: 10, color: '#9fb7bf' }}>OUTPUT % (MAN only)</label>
            <input type="number" value={dialog.op} step="0.1" min={0} max={100}
              disabled={dialog.mode === 'AUTO'}
              onChange={e => setDialog({ ...dialog, op: e.target.value })} />
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

function Overlay({ pos, children }: {
  pos: { left: number; top: number };
  children: React.ReactNode;
}) {
  return (
    <div style={{
      position: 'absolute',
      left: `${pos.left}%`,
      top: `${pos.top}%`,
      pointerEvents: 'auto',
    }}>
      {children}
    </div>
  );
}
