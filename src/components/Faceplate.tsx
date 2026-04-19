import type { ControllerSnapshot } from '../sim/model';

interface Props {
  tag: string;
  ctrl: ControllerSnapshot;
  live?: boolean;
  onClick?: () => void;
  /** Optional 0-100 PV bar (cyan fill) drawn under the PV row. Omit to hide. */
  pvBar?: { min: number; max: number };
}

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : 'NaN');

export function Faceplate({ tag, ctrl, live, onClick, pvBar }: Props) {
  const pct = pvBar
    ? Math.max(0, Math.min(100, ((ctrl.pv - pvBar.min) / (pvBar.max - pvBar.min)) * 100))
    : 0;

  return (
    <div className={`faceplate ${live ? 'live' : ''}`} onClick={onClick} title={live ? 'Click to change SP' : tag}>
      <div className="fp-head">
        <span className={`fp-mode ${ctrl.mode === 'MAN' ? 'man' : ''}`}>{ctrl.mode[0]}</span>
        <span className="fp-tag">{tag}</span>
      </div>
      <div className="fp-row sp">
        <span className="lbl">SP</span>
        <span className="val">{fmt(ctrl.sp)}</span>
        <span className="unit" />
      </div>
      <div className="fp-row pv">
        <span className="lbl">PV</span>
        <span className="val">{fmt(ctrl.pv)}</span>
        <span className="unit" />
      </div>
      {pvBar && (
        <div className="fp-bar">
          <div className="fp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="fp-row op">
        <span className="lbl">OP</span>
        <span className="val">{fmt(ctrl.op)}</span>
        <span className="unit">{ctrl.eu}</span>
      </div>
    </div>
  );
}
