import type { ControllerSnapshot } from '../sim/model';

interface Props {
  tag: string;
  ctrl: ControllerSnapshot;
  live?: boolean;
  onClick?: () => void;
}

const fmt = (v: number, d = 1) => v.toFixed(d);

export function Faceplate({ tag, ctrl, live, onClick }: Props) {
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
      <div className="fp-row op">
        <span className="lbl">OP</span>
        <span className="val">{fmt(ctrl.op)}</span>
        <span className="unit">{ctrl.eu}</span>
      </div>
    </div>
  );
}
