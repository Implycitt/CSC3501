import type { Circuit } from '../../game/circuit.ts'
import type { Sim } from './simulator.ts'

interface SignalMonitorProps {
  circuit: Circuit
  sim: Sim
  onToggle: (name: string) => void
}

export default function SignalMonitor({ circuit, sim, onToggle }: SignalMonitorProps) {
  if (circuit.inputs.length === 0 && circuit.outputs.length === 0) return null

  return (
    <div className="signal-monitor" aria-label="Live circuit signals">
      <span className="signal-monitor-label">Live</span>

      {circuit.inputs
        .filter((name) => name !== 'clk')
        .map((name) => {
          const on = sim.values[name] === true
          return (
            <button
              key={name}
              type="button"
              className={`signal-pill is-input${on ? ' is-high' : ''}`}
              aria-pressed={on}
              onClick={() => onToggle(name)}
              title={`Toggle ${name}`}
            >
              <span className="signal-name">{name}</span>
              <b>{on ? '1' : '0'}</b>
            </button>
          )
        })}

      <span className="signal-monitor-separator" aria-hidden="true" />

      {circuit.outputs.map((name) => {
        const on = sim.nets.get(name) === true
        return (
          <span key={name} className={`signal-pill is-output${on ? ' is-high' : ''}`}>
            <span className="signal-name">{name}</span>
            <b>{on ? '1' : '0'}</b>
          </span>
        )
      })}
    </div>
  )
}
