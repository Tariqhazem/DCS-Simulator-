/** HTML overlays (faceplates and indicator blocks) for the Degasser page.
 *  Pure presentation — state comes from parent via props. */

import type { SimState, ControllerSnapshot } from '../sim/model';
import { Faceplate } from '../components/Faceplate';
import { Indicator } from '../components/Indicator';
import { VB_W, VB_H } from './DegasserGeometry';

export type LoopKey = 'lic0011a' | 'lic0011b' | 'pic0157' | 'fic0086' | 'lic0050';

interface Props {
  sim: SimState;
  onOpen: (key: LoopKey) => void;
}

export function DegasserFaceplates({ sim, onOpen }: Props) {
  // Derived "tags" from existing state (no sim-logic change)
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
    sp: 123.1,
    pv: 127.6 + (sim.lic0011a.op - 52) * 0.1,
    op: 61.9,
    mode: 'AUTO',
    eu: 'kg/h',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Top-left inline faceplates */}
      <Pos x={410} y={150}>
        <MiniTag tag="16FY0096" value="8.6" />
      </Pos>
      <Pos x={570} y={150}>
        <MiniTag tag="16FHS0096" value="" dashed />
      </Pos>
      <Pos x={680} y={150}>
        <MiniTag tag="16FY0166" value="86.9" />
      </Pos>

      {/* PIC0157 */}
      <Pos x={340} y={230}>
        <Faceplate tag="16PIC0157" ctrl={pic0157} live onClick={() => onOpen('pic0157')} />
      </Pos>

      {/* FIC0086 */}
      <Pos x={560} y={230}>
        <Faceplate tag="10FIC0086" ctrl={fic0086} live onClick={() => onOpen('fic0086')} />
      </Pos>

      {/* 16FI0095 NAN block + alarm tag */}
      <Pos x={720} y={230}>
        <MiniTag tag="16FI0095" value="NAN" />
      </Pos>
      <Pos x={720} y={272}>
        <div style={{ background: '#a80000', color: '#fff', padding: '1px 4px', fontFamily: 'Consolas, monospace', fontSize: 11, border: '1px solid #000', fontWeight: 700 }}>
          16FAHH0095
        </div>
      </Pos>

      {/* LIC0050 */}
      <Pos x={460} y={370}>
        <Faceplate tag="16LIC0050" ctrl={lic0050} pvBar={{ min: 0, max: 100 }} />
      </Pos>

      {/* FI0096 flow indicator below feed line */}
      <Pos x={540} y={310}>
        <MiniTag tag="16FI0096" value="3939" />
      </Pos>

      {/* ===== TOP-RIGHT cross-reference faceplates ===== */}
      <Pos x={VB_W - 340} y={128}>
        <Faceplate tag="16LIC0011A" ctrl={sim.lic0011a} live onClick={() => onOpen('lic0011a')} />
      </Pos>
      <Pos x={VB_W - 200} y={128}>
        <Faceplate tag="16LIC0011B" ctrl={sim.lic0011b} live onClick={() => onOpen('lic0011b')} />
      </Pos>

      {/* dimmed forward-nav labels (top-right, under faceplates) */}
      <Pos x={VB_W - 200} y={210}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, color: '#666', fontFamily: 'Consolas, monospace', fontSize: 10 }}>
          <span>16LIC0011...</span>
          <span>16LI0050</span>
          <span>16LHS0011</span>
        </div>
      </Pos>

      {/* ===== 16LI0052 A/B/C indicator group + LAHH/LALL ===== */}
      <Pos x={960} y={310}>
        <div style={{ background: '#000', border: '1px solid #000', fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff', minWidth: 120, pointerEvents: 'auto' }}>
          <div style={{ background: '#2b2b2b', padding: '1px 4px', borderBottom: '1px solid #000' }}>16LI0052</div>
          {[['A', sim.li0012a + 0.0], ['B', sim.li0012b + 0.0], ['C', sim.li0012c + 0.0]].map(([l, v]) => (
            <div key={l as string} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', padding: '1px 4px' }}>
              <span style={{ color: '#9fb7bf' }}>{l}</span>
              <span style={{ color: 'var(--pv)', textAlign: 'right' }}>{(v as number).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ background: '#2b2b2b', padding: '1px 4px', borderTop: '1px solid #000' }}>16LAHH0052</div>
          <div style={{
            background: sim.lall0012Tripped ? '#ff4d4d' : '#2b2b2b',
            padding: '1px 4px',
            borderTop: '1px solid #000',
            color: sim.lall0012Tripped ? '#000' : '#fff',
            fontWeight: sim.lall0012Tripped ? 700 : 400,
          }}>
            16LALL0052{sim.lall0012Tripped ? '  TRIP' : ''}
          </div>
        </div>
      </Pos>

      {/* ===== process indicators around D-1603 / pumps ===== */}
      <Pos x={870} y={480}><Indicator tag="16TI0158" value={155.8} /></Pos>
      <Pos x={870} y={508}><Indicator tag="16AI0041" value={2.12} /></Pos>
      <Pos x={1000} y={440}><Indicator tag="16PI0171" value={1.39} /></Pos>
      <Pos x={1060} y={640}><Indicator tag="16PI0174" value={62.26} /></Pos>
      <Pos x={900} y={640}><Indicator tag="16FI0176" value={5.4} /></Pos>
      <Pos x={560} y={735}><Indicator tag="16TI0172" value={34.1} /></Pos>
      <Pos x={360} y={435}><Indicator tag="16TI0029" value={31.6} /></Pos>

      {/* 16FY0101A output */}
      <Pos x={1240} y={410}>
        <MiniTag tag="16FY0101A" value="125.1" />
      </Pos>

      {/* FIC0101 - BFW export flow controller */}
      <Pos x={1290} y={440}>
        <Faceplate tag="16FIC0101" ctrl={fic0101} pvBar={{ min: 0, max: 200 }} />
      </Pos>

      {/* 3 FLMT small annotation near FIC0101 */}
      <Pos x={1290} y={540}>
        <div style={{ background: '#000', color: '#fff', padding: '1px 4px', fontFamily: 'Consolas, monospace', fontSize: 10, border: '1px solid #000' }}>
          16LHS0011 &nbsp; 3 FLMT
        </div>
      </Pos>

      {/* UV valve tags under top pipe */}
      <Pos x={205} y={195}><ValveLabel text="16UV0018" /></Pos>
      <Pos x={230} y={465}><ValveLabel text="16UV0037" /></Pos>
      <Pos x={470} y={465}><ValveLabel text="16UV0014" /></Pos>
      <Pos x={350} y={320}><ValveLabel text="LSS" colour="#9fb7bf" /></Pos>
    </div>
  );
}

function Pos({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  const left = `${(x / VB_W) * 100}%`;
  const top  = `${(y / VB_H) * 100}%`;
  return <div style={{ position: 'absolute', left, top, pointerEvents: 'auto' }}>{children}</div>;
}

function MiniTag({ tag, value, dashed }: { tag: string; value: string; dashed?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      background: '#000', border: dashed ? '1px dashed #000' : '1px solid #000',
      fontFamily: 'Consolas, monospace', fontSize: 11, minWidth: 52,
    }}>
      <div style={{ background: '#2b2b2b', color: '#fff', padding: '1px 4px', borderBottom: '1px solid #000' }}>{tag}</div>
      {value !== '' && (
        <div style={{ color: 'var(--pv)', padding: '1px 4px', textAlign: 'right', fontWeight: 600 }}>{value}</div>
      )}
    </div>
  );
}

function ValveLabel({ text, colour = '#fff' }: { text: string; colour?: string }) {
  return (
    <div style={{
      background: '#000', color: colour, padding: '1px 4px',
      fontFamily: 'Consolas, monospace', fontSize: 10, border: '1px solid #000', fontWeight: 600,
    }}>
      {text}
    </div>
  );
}

export { VB_W, VB_H };
