import { useEffect, useRef, useState } from 'react';
import { Faceplate } from '../components/Faceplate';
import { Indicator } from '../components/Indicator';
import { Valve } from '../components/Valve';
import { createInitialState, tick, SimState } from '../sim/model';

/** Steam Generation (page 16_04) — replica of uploaded Honeywell screen.
 *  Live loop: 16LIC0011A (drum level). Other loops are snapshot-static. */

const VB_W = 1400;
const VB_H = 720;

// ------------------ pipe paths (hand-traced from the reference) ------------------
// steam drum D-1601 center: (600, 300), length 280, height 90
// E-1601 center (580, 560), length 240, height 60
// D-1604 center (1050, 470) w80 h160
// E-1606 center (1230, 600)

const STEAM_COLOR = '#e02424';
const BFW_COLOR = '#00b4d8';
const CW_COLOR  = '#0051a8';
const UTIL_COLOR = '#8a8a8a';

export function SteamGeneration() {
  const [sim, setSim] = useState<SimState>(() => createInitialState());
  const simRef = useRef(sim);
  simRef.current = sim;
  const [spDialog, setSpDialog] = useState<null | 'LIC0011A'>(null);
  const [spDraft, setSpDraft] = useState('');

  // --- simulation driver: 100 ms tick
  useEffect(() => {
    const id = setInterval(() => {
      setSim(s => tick(s, 0.1));
    }, 100);
    return () => clearInterval(id);
  }, []);

  // drum level bar (0..100) → blue fill height (drum interior: y 275..325, h=50)
  const levelFillY = (lvl: number) => 325 - (lvl / 100) * 50;
  const levelFillH = (lvl: number) => (lvl / 100) * 50;

  return (
    <>
      <svg className="pid-canvas" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        {/* ================== LEFT NAV PILL COLUMN ================== */}
        <g transform="translate(0,0)">
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
        {/* BFW header (cyan) from left entering drum from left side */}
        {/* BFW-A line (via LIC0011A valve) */}
        <path d="M 100 495 H 240 V 470 H 330 V 400 H 430 V 335" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        {/* BFW-B line */}
        <path d="M 100 515 H 230 V 490 H 330 V 420 H 450 V 340" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        {/* BFW feed to right side of drum */}
        <path d="M 330 455 H 770 V 330" stroke={BFW_COLOR} strokeWidth="3" fill="none" />

        {/* steam outlets from D-1601 top → to PIC0090B (left valve) and PIC0090A (right valve) */}
        <path d="M 570 258 V 175 H 660" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 640 258 V 200 H 780 V 175 H 830" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        {/* split-range manifold to steam header */}
        <path d="M 690 175 H 840" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 880 175 H 1380" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 880 175 V 140 H 1380" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        {/* drum to downcomer → E-1601 (natural circulation) */}
        <path d="M 530 347 V 420 H 470 V 548" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        {/* E-1601 riser back to drum */}
        <path d="M 670 548 V 470 H 640 V 347" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        {/* reformer effluent hot side through E-1601 tubes */}
        <path d="M 100 625 H 380 V 578" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        <path d="M 720 578 V 540 H 1200 V 490" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />

        {/* flash steam to D-1604 */}
        <path d="M 700 400 H 990" stroke={STEAM_COLOR} strokeWidth="3" fill="none" />
        {/* D-1604 bottom to SLIC0063 valve → E-1606 */}
        <path d="M 1050 560 V 620 H 1160" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1200 620 H 1230" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        {/* E-1606 to OS */}
        <path d="M 1260 620 H 1380" stroke={BFW_COLOR} strokeWidth="3" fill="none" />
        {/* CWS/CWR */}
        <path d="M 1230 580 V 540 H 1380" stroke={CW_COLOR} strokeWidth="3" fill="none" />
        <path d="M 1230 660 V 690 H 1380" stroke={CW_COLOR} strokeWidth="3" fill="none" />

        {/* phosphates injection */}
        <path d="M 100 555 H 200 V 340 H 600 V 258" stroke={UTIL_COLOR} strokeWidth="2" strokeDasharray="3,3" fill="none" />

        {/* ================== D-1601 STEAM DRUM (horizontal) ================== */}
        <g>
          {/* shell */}
          <rect x={460} y={258} width={280} height={90} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={460} cy={303} rx={20} ry={45} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={740} cy={303} rx={20} ry={45} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          {/* water region */}
          <rect x={460} y={303} width={280} height={45} fill="#b0b0b0" />
          {/* left level bar */}
          <rect x={475} y={275} width={18} height={50} fill="#fff" stroke="#000" />
          <rect
            x={475}
            y={levelFillY(sim.drumLevel)}
            width={18}
            height={levelFillH(sim.drumLevel)}
            fill="#00b4d8"
          />
          {/* right level bar */}
          <rect x={706} y={275} width={18} height={50} fill="#fff" stroke="#000" />
          <rect
            x={706}
            y={levelFillY(sim.drumLevel)}
            width={18}
            height={levelFillH(sim.drumLevel)}
            fill="#00b4d8"
          />
          {/* steam domes (top vents) */}
          <rect x={560} y={250} width={14} height={10} fill="#000" />
          <rect x={630} y={250} width={14} height={10} fill="#000" />
          {/* demister symbol */}
          <rect x={585} y={262} width={40} height={6} fill="none" stroke="#000" strokeDasharray="2,1" />
          {/* tag name */}
          <text x={600} y={310} textAnchor="middle" className="label-tag">D-1601</text>
        </g>

        {/* ================== E-1601 WASTE-HEAT BOILER ================== */}
        <g>
          <rect x={460} y={548} width={260} height={60} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={460} cy={578} rx={20} ry={30} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={720} cy={578} rx={20} ry={30} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          {/* tube bundle representation */}
          <line x1={475} y1={568} x2={705} y2={568} stroke="#000" />
          <line x1={475} y1={588} x2={705} y2={588} stroke="#000" />
          {/* level sight glass at top */}
          <rect x={640} y={538} width={60} height={10} fill="#16a34a" stroke="#000" />
          <text x={590} y={584} textAnchor="middle" className="label-tag">E-1601</text>
          {/* bottom blowdown valve (yellow) */}
        </g>

        {/* ================== D-1604 FLASH DRUM (vertical) ================== */}
        <g>
          <rect x={1010} y={400} width={80} height={160} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={1050} cy={400} rx={40} ry={18} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <ellipse cx={1050} cy={560} rx={40} ry={18} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          {/* level bar */}
          <rect x={1020} y={430} width={12} height={120} fill="#fff" stroke="#000" />
          <rect
            x={1020}
            y={430 + (1 - sim.slic0063.pv / 100) * 120}
            width={12}
            height={(sim.slic0063.pv / 100) * 120}
            fill="#00b4d8"
          />
          <text x={1050} y={490} textAnchor="middle" className="label-tag">D-1604</text>
        </g>

        {/* ================== E-1606 COOLER (circle) ================== */}
        <g>
          <circle cx={1230} cy={620} r={22} fill="#d8d8d8" stroke="#000" strokeWidth="1.5" />
          <path d="M 1212 620 L 1248 620 M 1230 602 L 1230 638" stroke="#000" />
          <text x={1230} y={660} textAnchor="middle" className="label-tag">E-1606</text>
        </g>

        {/* ================== HEAT EXCHANGER BOX (left representation of E-1601 tube path marker) ================== */}
        {/* already drawn above; label markers */}
        <text x={560} y={520} className="label-text">16FI0051  16AI0011</text>
        <text x={1080} y={380} className="label-text">16PI0094</text>

        {/* ================== VALVES ================== */}
        {/* PIC0090B vent valve (expected closed, red) */}
        <Valve x={680} y={175} op={sim.pic0090b.op} size={12} orient="vertical" />
        {/* PIC0090A steam export valve */}
        <Valve x={860} y={175} op={sim.pic0090a.op} size={12} orient="vertical" label="M-1601" />

        {/* BFW-A valve - driven live by LIC0011A */}
        <Valve x={330} y={440} op={sim.bfwAValveOp} size={12} orient="vertical" label="FV-0011A" />
        {/* BFW-B valve - fixed */}
        <Valve x={330} y={490} op={sim.bfwBValveOp} size={12} orient="vertical" label="FV-0011B" />

        {/* drum bottom blowdown (yellow static) */}
        <Valve x={600} y={380} op={50} size={11} orient="vertical" />

        {/* SLIC0063 outlet valve */}
        <Valve x={1180} y={620} op={sim.slic0063.op} size={11} orient="horizontal" />

        {/* E-1606 outlet valve (static green) */}
        <Valve x={1310} y={620} op={100} size={10} orient="horizontal" />

        {/* ================== EQUIPMENT LABELS ================== */}
        <text x={45} y={148} className="label-text">SITEAM STEAM</text>
        <text x={45} y={555} className="label-text">PHOSPHATES</text>
        <text x={45} y={590} className="label-text">BFW</text>
        <text x={45} y={630} className="label-text">REFORMER EFFLUENT</text>
      </svg>

      {/* ================== HTML OVERLAYS: FACEPLATES + INDICATORS ================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Overlay vbW={VB_W} vbH={VB_H}>
          {/* top pressure loops */}
          <Positioned x={555} y={90}>
            <Faceplate tag="16PIC0090B" ctrl={sim.pic0090b} />
          </Positioned>
          <Positioned x={720} y={90}>
            <Faceplate tag="16PIC0090A" ctrl={sim.pic0090a} />
          </Positioned>

          {/* LIC0011A live */}
          <Positioned x={135} y={320}>
            <Faceplate
              tag="16LIC0011A"
              ctrl={sim.lic0011a}
              live
              onClick={() => { setSpDraft(sim.lic0011a.sp.toFixed(1)); setSpDialog('LIC0011A'); }}
            />
          </Positioned>
          <Positioned x={135} y={395}>
            <Faceplate tag="16LIC0011B" ctrl={sim.lic0011b} />
          </Positioned>

          {/* D-1601 triple LT block */}
          <Positioned x={610} y={320}>
            <div style={{ background: '#000', border: '1px solid #000', fontFamily: 'Consolas, monospace', fontSize: 11, color: '#fff', minWidth: 120 }}>
              <div style={{ background: '#2b2b2b', padding: '1px 4px', borderBottom: '1px solid #000' }}>16LI0012</div>
              {[
                ['A', sim.li0012a],
                ['B', sim.li0012b],
                ['C', sim.li0012c],
              ].map(([l, v]) => (
                <div key={l as string} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', padding: '1px 4px' }}>
                  <span style={{ color: '#9fb7bf' }}>{l}</span>
                  <span style={{ color: 'var(--pv)', textAlign: 'right' }}>{(v as number).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ background: sim.lall0012Tripped ? '#ff4d4d' : '#2b2b2b', padding: '1px 4px', borderTop: '1px solid #000', color: sim.lall0012Tripped ? '#000' : '#fff' }}>
                16LALL0012
              </div>
            </div>
          </Positioned>

          {/* SLIC0063 - D-1604 level */}
          <Positioned x={1100} y={460}>
            <Faceplate tag="16SLIC0063" ctrl={sim.slic0063} />
          </Positioned>

          {/* Indicators scattered on the screen */}
          <Positioned x={960} y={195}><Indicator tag="16FI0050" value={sim.fi0050} decimals={0} /></Positioned>
          <Positioned x={965} y={300}><Indicator tag="16PI0094" value={sim.pi0094} /></Positioned>
          <Positioned x={595} y={475}><Indicator tag="16FI0051" value={sim.fi0051} /></Positioned>
          <Positioned x={660} y={475}><Indicator tag="16AI0011" value={sim.ai0011} decimals={0} /></Positioned>
        </Overlay>
      </div>

      {/* ================== SP CHANGE DIALOG ================== */}
      {spDialog === 'LIC0011A' && (
        <div className="modal-backdrop" onClick={() => setSpDialog(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>16LIC0011A — CHANGE SETPOINT</h4>
            <input
              type="number"
              value={spDraft}
              step="0.1"
              min={0}
              max={100}
              onChange={e => setSpDraft(e.target.value)}
              autoFocus
            />
            <div style={{ fontSize: 10, color: '#9fb7bf', marginBottom: 8 }}>Range 0 – 100 %</div>
            <div className="row">
              <button onClick={() => setSpDialog(null)}>CANCEL</button>
              <button
                className="primary"
                onClick={() => {
                  const next = parseFloat(spDraft);
                  if (!Number.isNaN(next)) {
                    setSim(s => ({ ...s, lic0011a: { ...s.lic0011a, sp: Math.max(0, Math.min(100, next)) } }));
                  }
                  setSpDialog(null);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- helpers: convert SVG viewBox coords to overlay pixel positions ---
function Overlay({ vbW, vbH, children }: { vbW: number; vbH: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // use a container that preserves aspect like the SVG's xMidYMid meet
        pointerEvents: 'none',
      }}
      data-vbw={vbW}
      data-vbh={vbH}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{children}</div>
    </div>
  );
}

function Positioned({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  // percentages relative to viewBox so positions scale with the SVG
  const left = `${(x / VB_W) * 100}%`;
  const top = `${(y / VB_H) * 100}%`;
  return (
    <div style={{ position: 'absolute', left, top, pointerEvents: 'auto' }}>
      {children}
    </div>
  );
}
