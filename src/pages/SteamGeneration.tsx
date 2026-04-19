import { useEffect, useState } from 'react';
import { Faceplate } from '../components/Faceplate';
import { Indicator } from '../components/Indicator';
import { Valve } from '../components/Valve';
import { createInitialState, tick, SimState, ControllerSnapshot, InstructorScenarios } from '../sim/model';
import { InstructorPanel, ScenarioBanner } from '../components/InstructorPanel';

/** Steam Generation (page 16_04) — replica of uploaded Honeywell screen.
 *  Live loops: LIC0011A, LIC0011B (drum level), SLIC0063 (flash-drum level).
 *  Swell/shrink active on drum level; operator can step demand ±20 m³/h. */

const VB_W = 1400;
const VB_H = 720;

const STEAM_COLOR = '#e02424';
const BFW_COLOR = '#00b4d8';
const CW_COLOR  = '#0051a8';
const UTIL_COLOR = '#8a8a8a';

type LoopKey = 'lic0011a' | 'lic0011b' | 'slic0063';
const LOOP_TAGS: Record<LoopKey, string> = {
  lic0011a: '16LIC0011A',
  lic0011b: '16LIC0011B',
  slic0063: '16SLIC0063',
};
const LOOP_RANGES: Record<LoopKey, { min: number; max: number }> = {
  lic0011a: { min: 0, max: 100 },
  lic0011b: { min: 0, max: 100 },
  slic0063: { min: 0, max: 100 },
};

interface LoopDialogState {
  key: LoopKey;
  sp: string;
  op: string;
  mode: 'AUTO' | 'MAN';
}

export function SteamGeneration() {
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
    const ctrl = sim[key];
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
    const r = LOOP_RANGES[dialog.key];
    setSim(s => ({
      ...s,
      [dialog.key]: {
        ...s[dialog.key],
        sp: Number.isFinite(sp) ? Math.max(r.min, Math.min(r.max, sp)) : s[dialog.key].sp,
        op: dialog.mode === 'MAN' && Number.isFinite(op)
          ? Math.max(0, Math.min(100, op))
          : s[dialog.key].op,
        mode: dialog.mode,
      } as ControllerSnapshot,
    }));
    setDialog(null);
  };

  const bumpDemand = (delta: number) =>
    setSim(s => ({ ...s, steamDemandBias: s.steamDemandBias + delta }));
  const resetDemand = () =>
    setSim(s => ({ ...s, steamDemandBias: 0 }));

  const drumPV = sim.drumLevelTrue + sim.drumSwell;
  const levelFillY = (lvl: number) => 325 - (lvl / 100) * 50;
  const levelFillH = (lvl: number) => (lvl / 100) * 50;

  return (
    <>
      <svg className="pid-canvas" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        {/* ================== LEFT NAV PILLS ================== */}
        <g>
          {[
            ['SITEAM STEAM', '1610', 160],
            ['1606 A', '', 215],
            ['1608 DI', 'STEAM / WATER', 240],
            ['1608 BII', 'STEAM / WATER', 265],
            ['16TH01001', '', 310],
            ['16F1010T9', '', 455],
            ['PHOSPHATES', '2-1602', 555],
            ['BFW', 'E-1603', 590],
            ['REFORMER EFFLUENT', 'H-1601', 630],
            ['E-1608 BII', 'BFW from E-1608A', 490],
            ['E-1608 B.', 'BFW from E-1608A', 512],
          ].map(([a, b, y]) => (
            <g key={`${a}-${y}`} transform={`translate(8, ${y})`}>
              <rect width={90} height={14} fill="#1a9d3f" stroke="#000" />
              <text x={45} y={10} textAnchor="middle" fontSize="9" fontFamily="Consolas, monospace" fill="#fff" fontWeight="600">{a as string}</text>
              {b && <text x={100} y={10} fontSize="9" fontFamily="Consolas, monospace" fill="#fff">{b as string}</text>}
            </g>
          ))}
          <g transform="translate(8, 678)">
            <rect width={90} height={14} fill="#6e6e6e" stroke="#000" />
            <text x={45} y={10} textAnchor="middle" fontSize="9" fontFamily="Consolas, monospace" fill="#fff" fontWeight="600">X.160022</text>
          </g>
        </g>

        {/* ================== RIGHT NAV PILLS ================== */}
        <g>
          {[
            ['HSS HEADER', 200],
            ['STEAM  E-1610', 330],
            ['16PI00104', 390],
            ['REFORMER EFFLUENT  R-1803', 425],
            ['FLASH STEAM  D-1603', 460],
            ['16FTY161A', 300],
          ].map(([t, y]) => (
            <g key={`r-${y}`} transform={`translate(${VB_W - 180}, ${y})`}>
              <rect width={170} height={14} fill="#1a9d3f" stroke="#000" />
              <text x={85} y={10} textAnchor="middle" fontSize="9" fontFamily="Consolas, monospace" fill="#fff" fontWeight="600">{t as string}</text>
            </g>
          ))}
        </g>

        {/* ================== PIPES ================== */}
        <path d="M 100 495 H 240 V 470 H 330 V 400 H 430 V 335" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 100 515 H 230 V 490 H 330 V 420 H 450 V 340" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 330 455 H 770 V 330" stroke={BFW_COLOR} strokeWidth="3" fill="none" />

        <path d="M 570 258 V 175 H 660" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 640 258 V 200 H 780 V 175 H 830" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 690 175 H 840" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 880 175 H 1380" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 880 175 V 140 H 1380" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        <path d="M 530 347 V 420 H 470 V 548" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 670 548 V 470 H 640 V 347" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        <path d="M 100 625 H 380 V 578" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 720 578 V 540 H 1200 V 490" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        <path d="M 700 400 H 990" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1050 560 V 620 H 1160" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1200 620 H 1230" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1260 620 H 1380" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1230 580 V 540 H 1380" stroke={CW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1230 660 V 690 H 1380" stroke={CW_COLOR} strokeWidth="3" fill="none" />

        <path d="M 100 555 H 200 V 340 H 600 V 258" stroke={UTIL_COLOR} strokeWidth="2" strokeDasharray="3,3" fill="none" />

        {/* ================== D-1601 STEAM DRUM ================== */}
        <g>
          <rect x={460} y={258} width={280} height={90} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={460} cy={303} rx={20} ry={45} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={740} cy={303} rx={20} ry={45} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <rect x={460} y={303} width={280} height={45} fill="#b0b0b0" />

          <rect x={475} y={275} width={18} height={50} fill="#fff" stroke="#000" />
          <rect x={475} y={levelFillY(drumPV)} width={18} height={levelFillH(drumPV)} fill="#00b4d8" />
          <rect x={706} y={275} width={18} height={50} fill="#fff" stroke="#000" />
          <rect x={706} y={levelFillY(drumPV)} width={18} height={levelFillH(drumPV)} fill="#00b4d8" />

          <rect x={560} y={250} width={14} height={10} fill="#000" />
          <rect x={630} y={250} width={14} height={10} fill="#000" />
          <rect x={585} y={262} width={40} height={6} fill="none" stroke="#000" strokeDasharray="2,1" />
          <text x={600} y={310} textAnchor="middle" className="label-tag">D-1601</text>
        </g>

        {/* ================== E-1601 WHB ================== */}
        <g>
          <rect x={460} y={548} width={260} height={60} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={460} cy={578} rx={20} ry={30} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={720} cy={578} rx={20} ry={30} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <line x1={475} y1={568} x2={705} y2={568} stroke="#000" />
          <line x1={475} y1={588} x2={705} y2={588} stroke="#000" />
          <rect x={640} y={538} width={60} height={10} fill="#16a34a" stroke="#000" />
          <text x={590} y={584} textAnchor="middle" className="label-tag">E-1601</text>
        </g>

        {/* ================== D-1604 FLASH DRUM ================== */}
        <g>
          <rect x={1010} y={400} width={80} height={160} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={1050} cy={400} rx={40} ry={18} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={1050} cy={560} rx={40} ry={18} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <rect x={1020} y={430} width={12} height={120} fill="#fff" stroke="#000" />
          <rect
            x={1020}
            y={430 + (1 - sim.d1604Level / 100) * 120}
            width={12}
            height={(sim.d1604Level / 100) * 120}
            fill="#00b4d8"
          />
          <text x={1050} y={490} textAnchor="middle" className="label-tag">D-1604</text>
        </g>

        {/* ================== E-1606 COOLER ================== */}
        <g>
          <circle cx={1230} cy={620} r={22} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <path d="M 1212 620 L 1248 620 M 1230 602 L 1230 638" stroke="#000" />
          <text x={1230} y={660} textAnchor="middle" className="label-tag">E-1606</text>
        </g>

        <text x={560} y={520} className="label-text">16FI0051  16AI0011</text>
        <text x={1080} y={380} className="label-text">16PI0094</text>

        {/* ================== VALVES ================== */}
        <Valve x={680} y={175} op={sim.pic0090b.op} size={12} orient="vertical" />
        <Valve x={860} y={175} op={sim.pic0090a.op} size={12} orient="vertical" label="M-1601" />
        <Valve x={330} y={440} op={sim.lic0011a.op} size={12} orient="vertical" label="FV-0011A" />
        <Valve x={330} y={490} op={sim.lic0011b.op} size={12} orient="vertical" label="FV-0011B" />
        <Valve x={600} y={380} op={50} size={11} orient="vertical" />
        <Valve x={1180} y={620} op={sim.slic0063.op} size={11} orient="horizontal" />
        <Valve x={1310} y={620} op={100} size={10} orient="horizontal" />

        <text x={45} y={148} className="label-text">SITEAM STEAM</text>
        <text x={45} y={555} className="label-text">PHOSPHATES</text>
        <text x={45} y={590} className="label-text">BFW</text>
        <text x={45} y={630} className="label-text">REFORMER EFFLUENT</text>
      </svg>

      {/* ================== HTML OVERLAYS ================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Positioned x={555} y={90}><Faceplate tag="16PIC0090B" ctrl={sim.pic0090b} /></Positioned>
        <Positioned x={720} y={90}><Faceplate tag="16PIC0090A" ctrl={sim.pic0090a} /></Positioned>

        <Positioned x={135} y={320}>
          <Faceplate tag="16LIC0011A" ctrl={sim.lic0011a} live onClick={() => openDialog('lic0011a')} />
        </Positioned>
        <Positioned x={135} y={395}>
          <Faceplate tag="16LIC0011B" ctrl={sim.lic0011b} live onClick={() => openDialog('lic0011b')} />
        </Positioned>
        <Positioned x={1100} y={460}>
          <Faceplate tag="16SLIC0063" ctrl={sim.slic0063} live onClick={() => openDialog('slic0063')} />
        </Positioned>

        <Positioned x={610} y={320}>
          <div style={{ background: '#000', border: '1px solid #000', fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff', minWidth: 120, pointerEvents: 'auto' }}>
            <div style={{ background: '#2b2b2b', padding: '1px 4px', borderBottom: '1px solid #000' }}>16LI0012</div>
            {[['A', sim.li0012a], ['B', sim.li0012b], ['C', sim.li0012c]].map(([l, v]) => (
              <div key={l as string} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', padding: '1px 4px' }}>
                <span style={{ color: '#9fb7bf' }}>{l}</span>
                <span style={{ color: 'var(--pv)', textAlign: 'right' }}>{(v as number).toFixed(2)}</span>
              </div>
            ))}
            <div style={{
              background: sim.lall0012Tripped ? '#ff4d4d' : '#2b2b2b',
              padding: '1px 4px',
              borderTop: '1px solid #000',
              color: sim.lall0012Tripped ? '#000' : '#fff',
              fontWeight: sim.lall0012Tripped ? 700 : 400,
            }}>
              16LALL0012{sim.lall0012Tripped ? '  TRIP' : ''}
            </div>
          </div>
        </Positioned>

        <Positioned x={960} y={195}><Indicator tag="16FI0050" value={sim.fi0050} decimals={0} /></Positioned>
        <Positioned x={965} y={300}><Indicator tag="16PI0094" value={sim.pi0094} /></Positioned>
        <Positioned x={595} y={475}><Indicator tag="16FI0051" value={sim.fi0051} /></Positioned>
        <Positioned x={660} y={475}><Indicator tag="16AI0011" value={sim.ai0011} decimals={0} /></Positioned>
      </div>

      {/* ================== DISTURBANCE BAR ================== */}
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

      {/* ================== INSTRUCTOR PANEL + BANNER ================== */}
      <ScenarioBanner scen={sim.scen} />
      <InstructorPanel
        open={instrOpen}
        scen={sim.scen}
        onToggle={() => setInstrOpen(o => !o)}
        onChange={updateScenario}
        onResetSim={resetSim}
      />

      {/* ================== UNIFIED LOOP DIALOG ================== */}
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

            <label style={{ fontSize: 10, color: '#9fb7bf' }}>SETPOINT ({sim[dialog.key].eu})</label>
            <input
              type="number"
              value={dialog.sp}
              step="0.1"
              min={LOOP_RANGES[dialog.key].min}
              max={LOOP_RANGES[dialog.key].max}
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

function Positioned({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  const left = `${(x / VB_W) * 100}%`;
  const top = `${(y / VB_H) * 100}%`;
  return (
    <div style={{ position: 'absolute', left, top, pointerEvents: 'auto' }}>
      {children}
    </div>
  );
}
