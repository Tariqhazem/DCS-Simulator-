import { InstructorScenarios, scenariosInitial } from '../sim/model';

interface Props {
  open: boolean;
  scen: InstructorScenarios;
  onToggle: () => void;
  onChange: (patch: Partial<InstructorScenarios>) => void;
  onResetSim: () => void;
}

/** Instructor panel — slide-out on the right edge. Activates refinery-style
 *  disturbances. An active-scenario banner is rendered elsewhere. */
export function InstructorPanel({ open, scen, onToggle, onChange, onResetSim }: Props) {
  return (
    <>
      <button className={`instr-tab ${open ? 'active' : ''}`} onClick={onToggle}>
        INSTRUCTOR
      </button>

      <aside className={`instr-panel ${open ? 'open' : ''}`}>
        <header>
          INSTRUCTOR STATION
          <button className="close" onClick={onToggle}>×</button>
        </header>

        <Row label="1. BFW pump A trip">
          <Toggle on={scen.bfwATrip} onClick={() => onChange({ bfwATrip: !scen.bfwATrip })} />
        </Row>

        <Row label="2. LT-A sensor drift (low)" help="Drift rate in %/min. Applied only to 16LI0012A; 2oo3 still protects LALL.">
          <Slider
            min={-3} max={0} step={0.1}
            value={scen.lt0012aDriftRate * 60}
            onChange={v => onChange({ lt0012aDriftRate: v / 60 })}
            format={v => `${v.toFixed(1)} %/min`}
          />
        </Row>

        <Row label="3. Drum tube leak" help="Continuous mass loss from D-1601 (m³/h).">
          <Slider
            min={0} max={40} step={1}
            value={scen.drumLeak}
            onChange={v => onChange({ drumLeak: v })}
            format={v => `${v.toFixed(0)} m³/h`}
          />
        </Row>

        <Row label="4. Reformer heat spike" help="Extra steam generation (m³/h). Raises drum pressure and causes SHRINK.">
          <Slider
            min={-30} max={60} step={1}
            value={scen.reformerHeatBias}
            onChange={v => onChange({ reformerHeatBias: v })}
            format={v => `${v.toFixed(0)} m³/h`}
          />
        </Row>

        <Row label="5. PIC0090A SP bump" help="Negative SP bump forces split-range: A goes 100%, B vent opens.">
          <Slider
            min={-3} max={3} step={0.1}
            value={scen.picSpBump}
            onChange={v => onChange({ picSpBump: v })}
            format={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)} bar`}
          />
        </Row>

        <Row label="6. Simulation">
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <button
              className={`scen-btn ${scen.simFrozen ? 'active' : ''}`}
              onClick={() => onChange({ simFrozen: !scen.simFrozen })}
              style={{ flex: 1 }}
            >
              {scen.simFrozen ? 'RESUME' : 'FREEZE'}
            </button>
            <button className="scen-btn danger" onClick={onResetSim} style={{ flex: 1 }}>
              RESET
            </button>
          </div>
        </Row>

        <footer>
          <button
            className="scen-btn"
            style={{ width: '100%' }}
            onClick={() => onChange(scenariosInitial())}
          >
            CLEAR ALL SCENARIOS
          </button>
        </footer>
      </aside>
    </>
  );
}

function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="instr-row">
      <div className="instr-lbl">{label}</div>
      {help && <div className="instr-help">{help}</div>}
      <div className="instr-ctrl">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`scen-btn ${on ? 'active' : ''}`} onClick={onClick} style={{ width: '100%' }}>
      {on ? 'TRIPPED' : 'NORMAL'}
    </button>
  );
}

function Slider({ min, max, step, value, onChange, format }: {
  min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ color: value !== 0 ? '#ffeb3b' : '#9fb7bf', minWidth: 72, textAlign: 'right' }}>
        {format(value)}
      </span>
    </div>
  );
}

/** Banner showing active scenarios so trainees know something is being perturbed. */
export function ScenarioBanner({ scen }: { scen: InstructorScenarios }) {
  const active: string[] = [];
  if (scen.bfwATrip) active.push('BFW-A TRIPPED');
  if (scen.lt0012aDriftRate !== 0) active.push(`LT-A DRIFT ${(scen.lt0012aDriftRate * 60).toFixed(1)}%/min`);
  if (scen.drumLeak > 0) active.push(`DRUM LEAK ${scen.drumLeak.toFixed(0)} m³/h`);
  if (scen.reformerHeatBias !== 0) active.push(`HEAT ${scen.reformerHeatBias >= 0 ? '+' : ''}${scen.reformerHeatBias.toFixed(0)} m³/h`);
  if (scen.picSpBump !== 0) active.push(`PIC SP ${scen.picSpBump >= 0 ? '+' : ''}${scen.picSpBump.toFixed(1)} bar`);
  if (scen.simFrozen) active.push('SIM FROZEN');

  if (active.length === 0) return null;
  return (
    <div className="scen-banner">
      INSTRUCTOR ACTIVE — {active.join(' · ')}
    </div>
  );
}
