/** Static SVG geometry for the Degasser (D-1603) page.
 *  Pure P&ID symbology — linearGradients, exact path-drawn pumps,
 *  bowtie valves with actuators, cylindrical X-1602 filters. */

export const VB_W = 1600;
export const VB_H = 900;

const STEAM = '#e02424';
const BFW   = '#00b4d8';
const CW    = '#7a1fa2';   // purple cold water return
const DW    = '#4a7bb0';   // demin water

/** Centrifugal pump P&ID symbol: body circle + tangential discharge volute
 *  rectangle. Color param tints the body (red=standby, green=running). */
function CentrifugalPump({ cx, cy, bodyFill, running, label }: {
  cx: number; cy: number; bodyFill: string; running: boolean; label: string;
}) {
  const r = 22;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bodyFill} stroke="#000" strokeWidth={1.5} />
      {/* suction flange (left) */}
      <path d={`M ${cx - r - 8} ${cy - 5} L ${cx - r} ${cy - 5} L ${cx - r} ${cy + 5} L ${cx - r - 8} ${cy + 5} Z`}
            fill="#222" stroke="#000" />
      {/* tangential volute discharge (top-right) */}
      <path d={`M ${cx + r * 0.7} ${cy - r * 0.7} L ${cx + r + 12} ${cy - r - 10} L ${cx + r + 22} ${cy - r} L ${cx + r} ${cy - r * 0.2} Z`}
            fill={bodyFill} stroke="#000" strokeWidth={1.5} />
      {/* motor/driver indicator */}
      <rect x={cx + r + 8} y={cy - r - 18} width={12} height={12}
            fill={running ? '#111' : '#c00'} stroke="#000" />
      <text x={cx + r + 14} y={cy - r - 8} textAnchor="middle"
            fontFamily="Consolas, monospace" fontSize="9" fontWeight="700" fill="#fff">
        {running ? 'M' : 'R'}
      </text>
      <text x={cx} y={cy + r + 16} textAnchor="middle" className="label-tag">{label}</text>
    </g>
  );
}

/** Bowtie control valve (two triangles meeting at stem) with actuator box. */
function BowtieValve({ x, y, orient = 'horizontal', color = '#eab308', label }: {
  x: number; y: number; orient?: 'horizontal' | 'vertical'; color?: string; label?: string;
}) {
  const r = 9;
  // horizontal bowtie: tips at left/right, pinch in the middle (triangles meet at x,y)
  const pts = orient === 'horizontal'
    ? `${x - r},${y - r} ${x - r},${y + r} ${x},${y} ${x + r},${y - r} ${x + r},${y + r} ${x},${y}`
    : `${x - r},${y - r} ${x + r},${y - r} ${x},${y} ${x - r},${y + r} ${x + r},${y + r} ${x},${y}`;
  return (
    <g>
      <polygon points={pts} fill={color} stroke="#000" strokeWidth={1} />
      {/* actuator stem + box (above for both orientations) */}
      <line x1={x} y1={y - r} x2={x} y2={y - r - 8} stroke="#000" strokeWidth={1.2} />
      <rect x={x - 7} y={y - r - 14} width={14} height={6} fill="#1a1a1a" stroke="#000" />
      {label && (
        <text x={x} y={y + r + 12} textAnchor="middle"
              fontFamily="Consolas, monospace" fontSize="10" fontWeight="700" fill="#111">{label}</text>
      )}
    </g>
  );
}

/** Flow-arrow polygon pointing in a cardinal direction. */
function FlowArrow({ x, y, dir, color }: {
  x: number; y: number; dir: 'right' | 'left' | 'up' | 'down'; color: string;
}) {
  const pts = {
    right: `${x},${y - 5} ${x + 8},${y} ${x},${y + 5}`,
    left:  `${x},${y - 5} ${x - 8},${y} ${x},${y + 5}`,
    up:    `${x - 5},${y} ${x},${y - 8} ${x + 5},${y}`,
    down:  `${x - 5},${y} ${x},${y + 8} ${x + 5},${y}`,
  }[dir];
  return <polygon points={pts} fill={color} />;
}

export function DegasserGeometry() {
  return (
    <>
      {/* ============ METALLIC GRADIENTS ============ */}
      <defs>
        <linearGradient id="drumShell" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#f2f2f2" />
          <stop offset="18%"  stopColor="#e0e0e0" />
          <stop offset="50%"  stopColor="#b5b5b5" />
          <stop offset="82%"  stopColor="#808080" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <linearGradient id="drumCap" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#8a8a8a" />
          <stop offset="50%"  stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#707070" />
        </linearGradient>
        <linearGradient id="domeShell" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#9a9a9a" />
          <stop offset="50%"  stopColor="#ededed" />
          <stop offset="100%" stopColor="#7a7a7a" />
        </linearGradient>
        <linearGradient id="filterShell" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#8e8e8e" />
          <stop offset="50%"  stopColor="#efefef" />
          <stop offset="100%" stopColor="#6b6b6b" />
        </linearGradient>
        <linearGradient id="columnShell" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#8e8e8e" />
          <stop offset="50%"  stopColor="#efefef" />
          <stop offset="100%" stopColor="#6b6b6b" />
        </linearGradient>
      </defs>

      {/* ============ LEFT NAV PILLS ============ */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#111">
        <text x={14} y={162}>RHS STEAM</text>
        <NavPill x={14} y={170} label="H-1601" />

        <text x={14} y={252}>REGASSER MAKE-UP</text>
        <NavPill x={14} y={260} label="E-1604" />
        <text x={14} y={286}>Terminator</text>

        <text x={14} y={322}>FLASH STEAM</text>
        <NavPill x={14} y={330} label="D-1604" />

        <text x={14} y={462}>CWS</text>
        <NavPill x={14} y={470} label="HEADER" />

        <text x={14} y={502}>DW</text>
        <NavPill x={14} y={510} label="HEADER" />
      </g>

      {/* ============ RIGHT NAV PILLS ============ */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#111">
        <text x={VB_W - 100} y={556}>BFW</text>
        <NavPill x={VB_W - 100} y={564} label="E-1603 B" w={80} />

        <text x={VB_W - 100} y={734}>PHOSPHATES</text>
        <NavPill x={VB_W - 100} y={742} label="H-1001" w={80} />
      </g>

      {/* ============ TOP PIPING (RHS STEAM → safe vent) ============ */}
      <path d="M 80 180 H 780" stroke={STEAM} strokeWidth="3" fill="none" />
      <path d="M 780 180 V 120 H 860" stroke={STEAM} strokeWidth="3" fill="none" />
      <FlowArrow x={862} y={120} dir="right" color={STEAM} />

      {/* 3-arrow vent symbols per screen */}
      <g fontFamily="Consolas, monospace" fontSize="12" fontWeight="700" fill={STEAM}>
        <text x={875} y={124}>{'>>>'}</text>
      </g>

      {/* Vent to atmosphere */}
      <path d="M 810 120 V 70" stroke={STEAM} strokeWidth="2" fill="none" strokeDasharray="4,3" />
      <text x={820} y={95} fontFamily="Consolas, monospace" fontSize="10" fill="#111">ATM AT</text>
      <text x={820} y={107} fontFamily="Consolas, monospace" fontSize="10" fill="#111">SAFE</text>
      <text x={820} y={119} fontFamily="Consolas, monospace" fontSize="10" fill="#111">LOCATION</text>

      {/* inline top-line valves (16UV0018 on RHS STEAM) */}
      <BowtieValve x={270} y={180} orient="horizontal" color="#d83a3a" label="16UV0018" />
      <BowtieValve x={420} y={180} orient="horizontal" color="#eab308" />
      <BowtieValve x={770} y={180} orient="horizontal" color="#1aa141" />
      <BowtieValve x={820} y={120} orient="vertical"   color="#1aa141" />

      {/* ============ REGASSER MAKE-UP (BFW) ============ */}
      <path d="M 80 270 H 640 V 330" stroke={BFW} strokeWidth="3" fill="none" />
      <FlowArrow x={640} y={328} dir="down" color={BFW} />
      <BowtieValve x={375} y={270} orient="horizontal" color="#1aa141" />

      {/* ============ FLASH STEAM line ============ */}
      <path d="M 80 340 H 340 V 330 H 640" stroke={STEAM} strokeWidth="3" fill="none" />
      <BowtieValve x={290} y={340} orient="horizontal" color="#1aa141" />

      {/* ============ CWS / DW lines into X-1602 ============ */}
      <path d="M 80 475 H 260 V 600" stroke={CW} strokeWidth="3" fill="none" />
      <path d="M 80 515 H 230 V 600" stroke={DW} strokeWidth="2" fill="none" />
      <BowtieValve x={310} y={475} orient="horizontal" color="#d83a3a" label="16UV0037" />

      {/* 16UV0014 on drum inlet (left side of D-1603, near top) */}
      <BowtieValve x={500} y={445} orient="horizontal" color="#eab308" label="16UV0014" />

      {/* ============ D-1603 HORIZONTAL VESSEL (centre) ============ */}
      {/* vapor dome stack extending up */}
      <rect x={695} y={260} width={60} height={105} fill="url(#domeShell)" stroke="#000" strokeWidth="1.5" />
      {/* top mixer/screen 'X' mark */}
      <rect x={695} y={252} width={60} height={14} fill="#d0d0d0" stroke="#000" />
      <line x1={695} y1={252} x2={755} y2={266} stroke="#000" />
      <line x1={755} y1={252} x2={695} y2={266} stroke="#000" />

      {/* horizontal body */}
      <rect x={640} y={365} width={320} height={120} fill="url(#drumShell)" stroke="#000" strokeWidth="1.5" />
      <ellipse cx={640} cy={425} rx={28} ry={60} fill="url(#drumCap)" stroke="#000" strokeWidth="1.5" />
      <ellipse cx={960} cy={425} rx={28} ry={60} fill="url(#drumCap)" stroke="#000" strokeWidth="1.5" />
      {/* highlight strip */}
      <rect x={640} y={375} width={320} height={6} fill="#ffffff" opacity="0.35" />
      <text x={790} y={432} textAnchor="middle" className="label-tag">D-1603</text>

      {/* LEVEL BLOCKS inside drum (right-interior) — 3 stacked cyan rectangles */}
      <rect x={905} y={390} width={18} height={24} fill="#00b4d8" stroke="#000" />
      <rect x={905} y={416} width={18} height={24} fill="#00b4d8" stroke="#000" />
      <rect x={905} y={442} width={18} height={24} fill="#00b4d8" stroke="#000" />

      {/* ============ X-1602 DUAL FILTERS (dashed enclosure) ============ */}
      <rect x={130} y={600} width={170} height={220} fill="none" stroke="#000" strokeDasharray="4,3" />
      <text x={265} y={620} fontFamily="Consolas, monospace" fontSize="11" fontWeight="700" fill="#111">X-1602</text>
      {[0, 1].map(i => (
        <g key={i} transform={`translate(175, ${620 + i * 95})`}>
          {/* body */}
          <rect width={50} height={55} fill="url(#filterShell)" stroke="#000" strokeWidth="1.3" />
          <ellipse cx={25} cy={0} rx={25} ry={6} fill="url(#filterShell)" stroke="#000" />
          {/* conical bottom */}
          <path d="M 0 55 L 25 85 L 50 55 Z" fill="url(#filterShell)" stroke="#000" strokeWidth="1.3" />
          {/* OS nozzle tag */}
          <text x={60} y={48} fontFamily="Consolas, monospace" fontSize="9" fill="#111">OS</text>
          {/* drain stub */}
          <line x1={25} y1={85} x2={25} y2={92} stroke="#000" strokeWidth="1.5" />
          <FlowArrow x={25} y={93} dir="down" color={CW} />
        </g>
      ))}

      {/* X-1602 outlet manifold */}
      <path d="M 200 720 V 850 H 560 V 620 H 640" stroke={CW} strokeWidth="3" fill="none" />
      <path d="M 200 720 V 830 H 580 V 660 H 640" stroke={DW} strokeWidth="2" fill="none" />

      {/* ============ CENTRIFUGAL PUMPS ============ */}
      <CentrifugalPump cx={1040} cy={500} bodyFill="#d83a3a" running={false} label="P-1601A" />
      <CentrifugalPump cx={1040} cy={600} bodyFill="#1aa141" running={true}  label="P-1601B" />

      {/* ============ Pump manifold to BFW export ============ */}
      <path d="M 960 485 V 500 H 1018" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 960 485 V 600 H 1018" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 1080 500 H 1180 V 570 H 1500" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 1080 600 H 1180 V 570" stroke={BFW} strokeWidth="3" fill="none" />
      <BowtieValve x={1460} y={570} orient="horizontal" color="#1aa141" />
      <FlowArrow x={1496} y={570} dir="right" color={BFW} />

      {/* ============ Bottom packed column ============ */}
      <g>
        <rect x={525} y={620} width={40} height={160} fill="url(#columnShell)" stroke="#000" strokeWidth="1.3" />
        <ellipse cx={545} cy={620} rx={20} ry={5} fill="url(#columnShell)" stroke="#000" />
        <line x1={525} y1={655} x2={565} y2={655} stroke="#000" strokeDasharray="2,2" />
        <line x1={525} y1={695} x2={565} y2={695} stroke="#000" strokeDasharray="2,2" />
        <line x1={525} y1={735} x2={565} y2={735} stroke="#000" strokeDasharray="2,2" />
      </g>

      {/* column bottom to CSS */}
      <path d="M 565 760 H 800" stroke={CW} strokeWidth="3" fill="none" />
      <text x={810} y={756} fontFamily="Consolas, monospace" fontSize="12" fontWeight="700" fill={CW}>CSS</text>
      <text x={810} y={775} fontFamily="Consolas, monospace" fontSize="18" fontWeight="700" fill={CW}>Y</text>

      {/* ============ Static operator-info tag boxes ============ */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#fff">
        <TagLabel x={150} y={140} text="RHS0051R" />
        <TagLabel x={180} y={465} text="RHS0052R" />
        <TagLabel x={12} y={350} text="RHS0032R" />
        <TagLabel x={830} y={730} text="16UK0020" w={76} />
        <TagLabel x={830} y={748} text="16UG0020" w={76} />
        <TagLabel x={1000} y={380} text="1EXA001A" />
        <TagLabel x={1180} y={410} text="16FHS0101A" w={70} />
        <g transform="translate(1180,428)">
          <rect width={40} height={14} fill="#0f5" stroke="#000" />
          <text x={20} y={10} textAnchor="middle" fill="#000" fontWeight="700">ON</text>
        </g>
      </g>
    </>
  );
}

function NavPill({ x, y, label, w = 60 }: { x: number; y: number; label: string; w?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={w} height={14} fill="#1a9d3f" stroke="#000" />
      <text x={w / 2} y={10} textAnchor="middle" fill="#fff" fontWeight="700"
            fontFamily="Consolas, monospace" fontSize="10">{label}</text>
    </g>
  );
}

function TagLabel({ x, y, text, w = 70 }: { x: number; y: number; text: string; w?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={w} height={14} fill="#1a1a1a" stroke="#000" />
      <text x={w / 2} y={10} textAnchor="middle">{text}</text>
    </g>
  );
}
