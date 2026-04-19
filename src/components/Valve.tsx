/** Control-valve glyph, Honeywell-style:
 *  body = two triangles meeting at the stem; color by OP%.
 *  Stem position (top actuator) rotates/sizes with OP.
 */

interface Props {
  x: number;
  y: number;
  op: number;              // 0..100
  size?: number;
  orient?: 'vertical' | 'horizontal';
  label?: string;
}

function valveColor(op: number): string {
  if (op < 2) return 'var(--valve-closed)';
  if (op > 95) return 'var(--valve-open)';
  return 'var(--valve-mid)';
}

export function Valve({ x, y, op, size = 18, orient = 'vertical', label }: Props) {
  const c = valveColor(op);
  const r = size;
  // bowtie body
  const body = orient === 'vertical'
    ? `M ${x - r} ${y - r} L ${x + r} ${y - r} L ${x - r} ${y + r} L ${x + r} ${y + r} Z`
    : `M ${x - r} ${y - r} L ${x - r} ${y + r} L ${x + r} ${y - r} L ${x + r} ${y + r} Z`;

  // actuator (small rectangle + round top)
  const stemH = 8;
  const actW = r * 1.2;
  const actH = 8;
  const ax = x - actW / 2;
  const ay = orient === 'vertical' ? y - r - stemH - actH : y - actW / 2;
  return (
    <g>
      <path d={body} fill={c} stroke="#000" strokeWidth={1} />
      {orient === 'vertical' ? (
        <>
          <line x1={x} y1={y - r} x2={x} y2={y - r - stemH} stroke="#000" strokeWidth={1.2} />
          <rect x={ax} y={ay} width={actW} height={actH} fill="#1a1a1a" stroke="#000" />
        </>
      ) : (
        <>
          <line x1={x} y1={y - r} x2={x} y2={y - r - stemH} stroke="#000" strokeWidth={1.2} />
          <rect x={x - actW / 2} y={y - r - stemH - actH} width={actW} height={actH} fill="#1a1a1a" stroke="#000" />
        </>
      )}
      {label && (
        <text x={x} y={y + r + 12} textAnchor="middle" className="label-text" fontSize="10">
          {label}
        </text>
      )}
    </g>
  );
}
