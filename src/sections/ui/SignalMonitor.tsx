import type { Circuit } from '../../game/circuit.ts'
import type { Sim } from './simulator.ts'

interface SignalMonitorProps {
  circuit: Circuit
  sim: Sim
  ticks: number
  onToggle: (name: string) => void
  onTick: () => void
}

export default function SignalMonitor({ circuit, sim, ticks, onToggle, onTick }: SignalMonitorProps) {
  const inputs = circuit.inputs.filter((name) => name !== 'clk')
  const hasClock = circuit.inputs.includes('clk')
  const hint =
    inputs.length > 0
      ? hasClock
        ? 'tap inputs · tick for clock'
        : 'tap an input to switch'
      : hasClock
        ? 'tick to pulse the clock'
        : ''

  if (circuit.inputs.length === 0 && circuit.outputs.length === 0) return null

  return (
    <div className="signal-monitor" aria-label="Live circuit signals">
      <div className="signal-channels">
        {inputs.length > 0 && <span className="signal-group">in</span>}

        {inputs.map((name) => {
          const on = sim.values[name] === true
          return (
            <button
              key={name}
              type="button"
              className={`signal-pill is-input${on ? ' is-high' : ''}`}
              aria-pressed={on}
              aria-label={`Toggle input ${name}, currently ${on ? '1' : '0'}`}
              onClick={() => onToggle(name)}
              title={`Toggle ${name}`}
            >
              <span className="signal-name">{name}</span>
              <b>{on ? '1' : '0'}</b>
            </button>
          )
        })}

        {circuit.outputs.length > 0 && <span className="signal-group">out</span>}

        {circuit.outputs.map((name) => {
          const on = sim.nets.get(name) === true
          return (
            <span
              key={name}
              className={`signal-pill is-output${on ? ' is-high' : ''}`}
              title={`${name} is ${on ? '1' : '0'}`}
            >
              <span className="signal-name">{name}</span>
              <b>{on ? '1' : '0'}</b>
            </span>
          )
        })}

        {hasClock && (
          <button
            type="button"
            className="signal-clock"
            onClick={onTick}
            title="Advance the clock one tick"
            aria-label={`Advance the clock one tick, currently ${ticks} ticks`}
          >
            <span aria-hidden="true">↻</span>
            <span>tick</span>
            <b>{String(ticks).padStart(2, '0')}</b>
          </button>
        )}
      </div>

      {hint && <span className="signal-monitor-hint">{hint}</span>}
    </div>
  )
}
