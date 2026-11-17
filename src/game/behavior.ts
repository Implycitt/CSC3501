import { circuitToNetlist, type Circuit } from './circuit.ts'
import { resolveForSim } from './registry.ts'
import { flatten, settle, tick } from './simulate.ts'

export interface CircuitCase {
  name?: string
  inputs: Record<string, boolean>
  outputs: Record<string, boolean>
}

export interface CircuitTraceStep {
  name?: string
  inputs: Record<string, boolean>
  /** Pulse the clock once before checking outputs. */
  tick?: boolean
  outputs: Record<string, boolean>
}

export interface CircuitTrace {
  name?: string
  steps: CircuitTraceStep[]
}

export interface CircuitGoal {
  inputs: string[]
  outputs: string[]
  /** Clock edges the player must have advanced before a trace goal can pass. */
  requiredTicks?: number
  /** Static truth-table rows for combinational circuits. */
  cases?: CircuitCase[]
  /** Stateful clocked traces for sequential circuits. */
  traces?: CircuitTrace[]
}

const portsOfComponent = (componentId: string) => {
  const resolved = resolveForSim(componentId)
  return resolved ? { inputs: resolved.inputs, outputs: resolved.outputs } : undefined
}

/**
 * A goal is checked by simulating the finished circuit against every row,
 * not by looking for a particular gate or wire layout. Any circuit that
 * produces the required outputs is accepted.
 */
export function matchesCircuitGoal(circuit: Circuit, goal: CircuitGoal): boolean {
  try {
    const gates = flatten(circuitToNetlist(circuit, portsOfComponent), resolveForSim)

    const checkOutputs = (nets: Map<string, boolean>, expected: Record<string, boolean>) => {
      for (const name of goal.outputs) {
        if ((nets.get(name) ?? false) !== (expected[name] ?? false)) return false
      }
      return true
    }

    for (const test of goal.cases ?? []) {
      const values = Object.fromEntries(goal.inputs.map((name) => [name, test.inputs[name] ?? false]))
      const nets = settle(gates, { nets: new Map() }, values)

      if (!checkOutputs(nets, test.outputs)) return false
    }

    for (const trace of goal.traces ?? []) {
      const state = { nets: new Map<string, boolean>() }

      for (const step of trace.steps) {
        const nets = step.tick ? tick(gates, state, step.inputs) : settle(gates, state, step.inputs)

        if (!checkOutputs(nets, step.outputs)) return false
      }
    }

    return true
  } catch {
    return false
  }
}
