import { describe, expect, test } from 'bun:test'
import { checkCircuitGoal, matchesCircuitGoal, type CircuitGoal } from '../../src/game/behavior.ts'
import type { Circuit } from '../../src/game/circuit.ts'
import { logicGoal } from '../../src/tutorial/goals.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'

const goalOf = (sectionId: string): CircuitGoal => {
  const goal = TUTORIAL_SECTIONS.find((section) => section.id === sectionId)?.goal
  if (!goal) throw new Error(`missing goal for ${sectionId}`)
  return goal
}

/** One AND gate with both inputs fed from `a`, so the output follows `a`. */
const echoA: Circuit = {
  parts: [{ uid: 'p1', componentId: 'and', x: 0, y: 0 }],
  wires: [
    { from: 'in:a', to: 'part:p1:a' },
    { from: 'in:a', to: 'part:p1:b' },
    { from: 'part:p1:y', to: 'out:y' },
  ],
  inputs: ['a', 'b'],
  outputs: ['y'],
  layout: {},
}

describe('checkCircuitGoal', () => {
  test('names the failing case with the value the circuit produced', () => {
    expect(checkCircuitGoal(echoA, goalOf('intro-and'))).toEqual({
      checked: 4,
      failures: [{ index: 3, inputs: { a: true, b: false }, expected: { y: false }, actual: { y: true } }],
    })
  })

  test('reports every failing clocked step in order', () => {
    const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === 'memory-d-flip-flop')
    if (!section?.goal) throw new Error('missing D flip-flop section')

    const report = checkCircuitGoal(section.start, section.goal)
    expect(report.checked).toBe(3)
    expect(report.failures).toEqual([
      { index: 1, tick: true, inputs: { d: true }, expected: { q: true }, actual: { q: false } },
      { index: 2, tick: false, inputs: { d: false }, expected: { q: true }, actual: { q: false } },
    ])
  })

  test('says why a case could not be simulated', () => {
    const loop: Circuit = {
      parts: [{ uid: 'p1', componentId: 'not', x: 0, y: 0 }],
      wires: [{ from: 'part:p1:y', to: 'part:p1:a' }],
      inputs: ['a'],
      outputs: ['y'],
      layout: {},
    }
    const goal = logicGoal(['a'], 'y', (a) => !a)

    expect(checkCircuitGoal(loop, goal).failures.map((failure) => failure.error)).toEqual([
      'Circuit did not settle (oscillation)',
      'Circuit did not settle (oscillation)',
    ])
    expect(matchesCircuitGoal(loop, goal)).toBe(false)
  })

  test('accepts a correct circuit', () => {
    const interlock: Circuit = {
      ...echoA,
      wires: [
        { from: 'in:a', to: 'part:p1:a' },
        { from: 'in:b', to: 'part:p1:b' },
        { from: 'part:p1:y', to: 'out:y' },
      ],
    }
    expect(checkCircuitGoal(interlock, goalOf('intro-and'))).toEqual({ checked: 4, failures: [] })
    expect(matchesCircuitGoal(interlock, goalOf('intro-and'))).toBe(true)
  })
})
