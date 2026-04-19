/** Static SVG geometry for the Degasser (D-1603) page.
 *  No state, no faceplates — pure vessel/pipe/label drawing. */

export const VB_W = 1600;
export const VB_H = 900;

const STEAM = '#e02424';
const BFW   = '#00b4d8';
const CW    = '#7a1fa2';   // purple cold water return in this screen
const DW    = '#4a7bb0';   // demin water

export function DegasserGeometry() {
  return (
    <>
      <defs>
        <linearGradient id="vesselShine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#f5f5f5" />
          <stop offset="40%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#8a8a8a" />
        </linearGradient>
        <linearGradient id="domeShine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor="#bcbcbc" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#8f8f8f" />
        </linearGradient>
      </defs>

      {/* ===== LEFT NAV PILLS ===== */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#111">
        <text x={14} y={162}>RHS STEAM</text>
        <g transform="translate(14,170)">
          <rect width={60} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={30} y={10} textAnchor="middle" fill="#fff" fontWeight="700">H-1601</text>
        </g>

        <text x={14} y={252}>REGASSER MAKE-UP</text>
        <g transform="translate(14,260)">
          <rect width={60} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={30} y={10} textAnchor="middle" fill="#fff" fontWeight="700">E-1604</text>
        </g>
        <text x={14} y={286}>Terminator</text>

        <text x={14} y={322}>FLASH STEAM</text>
        <g transform="translate(14,330)">
          <rect width={60} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={30} y={10} textAnchor="middle" fill="#fff" fontWeight="700">D-1604</text>
        </g>

        <text x={14} y={462}>CWS</text>
        <g transform="translate(14,470)">
          <rect width={60} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={30} y={10} textAnchor="middle" fill="#fff" fontWeight="700">HEADER</text>
        </g>

        <text x={14} y={502}>DW</text>
        <g transform="translate(14,510)">
          <rect width={60} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={30} y={10} textAnchor="middle" fill="#fff" fontWeight="700">HEADER</text>
        </g>
      </g>

      {/* ===== RIGHT NAV PILLS ===== */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#111">
        <text x={VB_W - 100} y={500}>BFW</text>
        <g transform={`translate(${VB_W - 100}, 508)`}>
          <rect width={80} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={40} y={10} textAnchor="middle" fill="#fff" fontWeight="700">E-1603 B</text>
        </g>

        <text x={VB_W - 100} y={670}>PHOSPHATES</text>
        <g transform={`translate(${VB_W - 100}, 678)`}>
          <rect width={80} height={14} fill="#1a9d3f" stroke="#000" />
          <text x={40} y={10} textAnchor="middle" fill="#fff" fontWeight="700">H-1001</text>
        </g>
      </g>

      {/* ===== TOP PIPING (RHS STEAM to safe vent) ===== */}
      <path d="M 80 180 H 780" stroke={STEAM} strokeWidth="3" fill="none" />
      <path d="M 780 180 V 120 H 860" stroke={STEAM} strokeWidth="3" fill="none" />
      <polygon points="860,115 870,120 860,125" fill={STEAM} />

      {/* Vent to atmosphere */}
      <path d="M 810 120 V 70" stroke={STEAM} strokeWidth="2" fill="none" strokeDasharray="4,3" />
      <text x={820} y={95} fontFamily="Consolas, monospace" fontSize="10" fill="#111">ATM AT</text>
      <text x={820} y={107} fontFamily="Consolas, monospace" fontSize="10" fill="#111">SAFE</text>
      <text x={820} y={119} fontFamily="Consolas, monospace" fontSize="10" fill="#111">LOCATION</text>

      {/* ===== REGASSER MAKE-UP line ===== */}
      <path d="M 80 270 H 640 V 330" stroke={BFW} strokeWidth="3" fill="none" />
      <polygon points="636,324 644,324 640,332" fill={BFW} />

      {/* ===== FLASH STEAM line ===== */}
      <path d="M 80 340 H 340 V 330 H 640" stroke={STEAM} strokeWidth="3" fill="none" />

      {/* ===== CWS / DW lines into X-1602 ===== */}
      <path d="M 80 475 H 210 V 540" stroke={CW} strokeWidth="3" fill="none" />
      <path d="M 80 515 H 180 V 560" stroke={DW} strokeWidth="2" fill="none" />

      {/* ===== D-1603 HORIZONTAL VESSEL (centre) ===== */}
      {/* vapor dome extending up */}
      <rect x={690} y={260} width={70} height={100} fill="url(#domeShine)" stroke="#000" />
      <path d="M 690 260 Q 725 245 760 260" fill="url(#domeShine)" stroke="#000" />
      <line x1={700} y1={280} x2={750} y2={280} stroke="#000" />
      <line x1={700} y1={300} x2={750} y2={300} stroke="#000" />

      {/* horizontal body */}
      <rect x={640} y={360} width={300} height={110} fill="url(#vesselShine)" stroke="#000" strokeWidth="1.5" />
      <ellipse cx={640} cy={415} rx={22} ry={55} fill="url(#vesselShine)" stroke="#000" strokeWidth="1.5" />
      <ellipse cx={940} cy={415} rx={22} ry={55} fill="url(#vesselShine)" stroke="#000" strokeWidth="1.5" />
      <text x={790} y={420} textAnchor="middle" className="label-tag">D-1603</text>

      {/* level glass on right-end of vessel */}
      <rect x={895} y={378} width={24} height={74} fill="#fff" stroke="#000" />
      <line x1={895} y1={403} x2={919} y2={403} stroke="#000" strokeDasharray="2,2" />
      <line x1={895} y1={428} x2={919} y2={428} stroke="#000" strokeDasharray="2,2" />

      {/* ===== X-1602 DUAL FILTERS (dashed enclosure) ===== */}
      <rect x={120} y={540} width={140} height={190} fill="none" stroke="#000" strokeDasharray="4,3" />
      <text x={220} y={560} fontFamily="Consolas, monospace" fontSize="11" fontWeight="700" fill="#111">X-1602</text>
      {[0, 1].map(i => (
        <g key={i} transform={`translate(155, ${555 + i * 80})`}>
          <rect width={40} height={50} fill="url(#vesselShine)" stroke="#000" />
          <path d="M 0 50 L 20 70 L 40 50 Z" fill="url(#vesselShine)" stroke="#000" />
          <text x={55} y={35} fontFamily="Consolas, monospace" fontSize="9" fill="#111">OS</text>
        </g>
      ))}

      {/* X-1602 outlet manifold */}
      <path d="M 195 720 V 740 H 540 V 620 H 640" stroke={CW} strokeWidth="3" fill="none" />
      <path d="M 195 720 V 760 H 560 V 660 H 640" stroke={DW} strokeWidth="2" fill="none" />

      {/* ===== P-1601A centrifugal pump (red - standby/tripped) ===== */}
      <g transform="translate(1040, 500)">
        <circle cx={0} cy={0} r={22} fill="#d83a3a" stroke="#000" />
        <rect x={-22} y={-4} width={8} height={8} fill="#000" />
        <rect x={18} y={-8} width={10} height={16} fill="#c00" stroke="#000" />
        <text x={28} y={4} fontFamily="Consolas, monospace" fontSize="10" fontWeight="700" fill="#fff">R</text>
        <text x={0} y={42} textAnchor="middle" className="label-tag">P-1601A</text>
      </g>

      {/* ===== P-1601B centrifugal pump (green - running) ===== */}
      <g transform="translate(1040, 580)">
        <circle cx={0} cy={0} r={22} fill="#1aa141" stroke="#000" />
        <rect x={-22} y={-4} width={8} height={8} fill="#000" />
        <rect x={18} y={-8} width={10} height={16} fill="#111" stroke="#000" />
        <text x={0} y={42} textAnchor="middle" className="label-tag">P-1601B</text>
      </g>

      {/* ===== Pump manifold to BFW export ===== */}
      <path d="M 940 470 V 500 H 1018" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 940 470 V 580 H 1018" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 1062 500 H 1140 V 540 H 1500" stroke={BFW} strokeWidth="3" fill="none" />
      <path d="M 1062 580 H 1140 V 540" stroke={BFW} strokeWidth="3" fill="none" />
      <polygon points="1496,536 1504,540 1496,544" fill={BFW} />

      {/* ===== Bottom vertical column (packed) ===== */}
      <g>
        <rect x={500} y={580} width={36} height={150} fill="url(#vesselShine)" stroke="#000" />
        <line x1={500} y1={610} x2={536} y2={610} stroke="#000" strokeDasharray="2,2" />
        <line x1={500} y1={650} x2={536} y2={650} stroke="#000" strokeDasharray="2,2" />
        <line x1={500} y1={690} x2={536} y2={690} stroke="#000" strokeDasharray="2,2" />
      </g>

      {/* column to CSS tag */}
      <path d="M 536 710 H 780" stroke={CW} strokeWidth="3" fill="none" />
      <text x={788} y={706} fontFamily="Consolas, monospace" fontSize="11" fontWeight="700" fill="#7a1fa2">CSS</text>

      {/* ===== Static operator-info tag boxes ===== */}
      <g fontFamily="Consolas, monospace" fontSize="10" fill="#fff">
        <g transform="translate(150, 140)">
          <rect width={70} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={35} y={10} textAnchor="middle">RHS0051R</text>
        </g>
        <g transform="translate(180, 415)">
          <rect width={70} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={35} y={10} textAnchor="middle">RHS0052R</text>
        </g>
        <g transform="translate(12, 350)">
          <rect width={70} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={35} y={10} textAnchor="middle">RHS0032R</text>
        </g>
        <g transform="translate(810, 680)">
          <rect width={80} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={40} y={10} textAnchor="middle">16UK0020</text>
        </g>
        <g transform="translate(810, 696)">
          <rect width={80} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={40} y={10} textAnchor="middle">16UG0020</text>
        </g>
        <g transform="translate(1000, 380)">
          <rect width={70} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={35} y={10} textAnchor="middle">1EXA001A</text>
        </g>
        <g transform="translate(1180, 410)">
          <rect width={60} height={14} fill="#1a1a1a" stroke="#000" />
          <text x={30} y={10} textAnchor="middle">16FHS0101A</text>
        </g>
        <g transform="translate(1180, 428)">
          <rect width={40} height={14} fill="#0f5" stroke="#000">
            <title>ON</title>
          </rect>
          <text x={20} y={10} textAnchor="middle" fill="#000" fontWeight="700">ON</text>
        </g>
      </g>

      {/* ===== Valve-trigger symbols (dashed squares, small filled boxes) seen in screen ===== */}
      <rect x={370} y={174} width={8} height={8} fill="#000" />
      <rect x={438} y={174} width={8} height={8} fill="#000" />
      <rect x={688} y={174} width={8} height={8} fill="#000" />

      {/* CSS-colored purple 'y' symbol (cold-side outlet) */}
      <text x={788} y={680} fontFamily="Consolas, monospace" fontSize="16" fontWeight="700" fill="#7a1fa2">Y</text>
    </>
  );
}
