import { circuitToNetlist, type Circuit } from '../../game/circuit.ts'
import { resolveForSim } from '../../game/registry.ts'
import { flatten, settle, tick, type FlatGate } from '../../game/simulate.ts'
import { portsOf } from './geometry.ts'

export interface Sim {
  gates: FlatGate[]
  values: Record<string, boolean>
  nets: Map<string, boolean>
  error: string | null
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function createSim(circuit: Circuit): Sim {
  const values = Object.fromEntries(circuit.inputs.map((name) => [name, false]))
  try {
    const gates = flatten(circuitToNetlist(circuit, portsOf), resolveForSim)
    return { gates, values, nets: settle(gates, { nets: new Map() }, values), error: null }
  } catch (error) {
    return { gates: [], values, nets: new Map(), error: message(error) }
  }
}

export function advance(sim: Sim, values: Record<string, boolean>, ticking: boolean): Sim {
  try {
    const state = { nets: new Map(sim.nets) }
    const nets = ticking ? tick(sim.gates, state, values, 'clk') : settle(sim.gates, state, values)
    return { ...sim, values, nets, error: null }
  } catch (error) {
    return { ...sim, values, error: message(error) }
  }
}
