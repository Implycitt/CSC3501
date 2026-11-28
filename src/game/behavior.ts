import { circuitToNetlist, type Circuit } from './circuit.ts'
import { resolveForSim } from './registry.ts'
import { flatten, newState, settle, tick, type FlatGate } from './simulate.ts'

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

export interface GoalFailure {
  /** 1-based position among the goal's cases, or among every trace step when the goal is clocked. */
  index: number
  /** Trace steps only: whether the row advances the clock before its outputs are checked. */
  tick?: boolean
  inputs: Record<string, boolean>
  expected: Record<string, boolean>
  /** Missing when the row could not be simulated; `error` says why. */
  actual?: Record<string, boolean>
  error?: string
}

export interface GoalReport {
  /** Cases plus trace steps that were checked. */
  checked: number
  failures: GoalFailure[]
  /** Set when the circuit could not be flattened into gates, so no row was checked. */
  error?: string
}

const gatesOf = (circuit: Circuit): { gates: FlatGate[] } | { error: string } => {
  try {
    return { gates: flatten(circuitToNetlist(circuit, portsOfComponent), resolveForSim) }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

function rowFailure(
  index: number,
  tick: boolean | undefined,
  inputs: Record<string, boolean>,
  expected: Record<string, boolean>,
  outputs: readonly string[],
  simulate: () => Map<string, boolean>,
): GoalFailure | null {
  const clock = tick === undefined ? {} : { tick }
  let nets: Map<string, boolean>
  try {
    nets = simulate()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { index, ...clock, inputs, expected, error: message }
  }

  if (outputs.every((name) => (nets.get(name) ?? false) === (expected[name] ?? false))) return null
  return {
    index,
    ...clock,
    inputs,
    expected,
    actual: Object.fromEntries(outputs.map((name) => [name, nets.get(name) ?? false])),
  }
}

function* failedRows(gates: FlatGate[], goal: CircuitGoal): Generator<GoalFailure> {
  for (const [position, test] of (goal.cases ?? []).entries()) {
    const inputs = Object.fromEntries(goal.inputs.map((name) => [name, test.inputs[name] ?? false]))
    const failure = rowFailure(position + 1, undefined, inputs, test.outputs, goal.outputs, () =>
      settle(gates, newState(), inputs),
    )
    if (failure) yield failure
  }

  let position = 0
  for (const trace of goal.traces ?? []) {
    const state = newState()
    for (const step of trace.steps) {
      position += 1
      const failure = rowFailure(position, step.tick === true, step.inputs, step.outputs, goal.outputs, () =>
        step.tick ? tick(gates, state, step.inputs) : settle(gates, state, step.inputs),
      )
      if (failure) yield failure
    }
  }
}

/** Lists every row the circuit gets wrong, with the value it produced instead. */
export function checkCircuitGoal(circuit: Circuit, goal: CircuitGoal): GoalReport {
  const prepared = gatesOf(circuit)
  if ('error' in prepared) return { checked: 0, failures: [], error: prepared.error }
  const steps = (goal.traces ?? []).reduce((sum, trace) => sum + trace.steps.length, 0)
  return { checked: (goal.cases?.length ?? 0) + steps, failures: [...failedRows(prepared.gates, goal)] }
}

/**
 * A goal is checked by simulating the finished circuit against every row,
 * not by looking for a particular gate or wire layout. Any circuit that
 * produces the required outputs is accepted.
 */
export function matchesCircuitGoal(circuit: Circuit, goal: CircuitGoal): boolean {
  const prepared = gatesOf(circuit)
  return !('error' in prepared) && failedRows(prepared.gates, goal).next().done === true
}
