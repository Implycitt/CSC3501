import { describe, expect, test } from 'bun:test'
import type { Circuit } from '../../src/game/circuit.ts'
import {
  allOf,
  clockTicks,
  inputHigh,
  inputLow,
  outputDriven,
  outputHigh,
  outputLow,
  placed,
  portDriven,
} from '../../src/tutorial/predicates.ts'
import type { TutorialContext } from '../../src/tutorial/types.ts'

const circuit = (overrides: Partial<Circuit> = {}): Circuit => ({
  parts: [{ uid: 'g1', componentId: 'and', x: 0, y: 0 }],
  wires: [
    { from: 'in:a', to: 'part:g1:a' },
    { from: 'part:g1:y', to: 'out:y' },
  ],
  inputs: ['a', 'b'],
  outputs: ['y'],
  layout: {},
  ...overrides,
})

const context = (values: Record<string, boolean> = {}, overrides: Partial<Circuit> = {}, ticks = 0): TutorialContext => ({
  circuit: circuit(overrides),
  nets: new Map(Object.entries(values)),
  ticks,
})

const plain = (overrides: Partial<Circuit> = {}) => ({
  circuit: circuit(overrides),
  nets: new Map<string, boolean>(),
  ticks: 0,
})

describe('placed', () => {
  test('counts matching parts', () => {
    expect(placed('and')(plain())).toBe(true)
    expect(placed('or')(plain())).toBe(false)
    expect(placed('and', 2)(plain())).toBe(false)
  })
})

describe('portDriven', () => {
  test('matches the wired port of a placed component', () => {
    expect(portDriven('and', 'a')(plain())).toBe(true)
    expect(portDriven('and', 'b')(plain())).toBe(false)
    expect(portDriven('or', 'a')(plain())).toBe(false)
  })

  test('ignores wires into unknown parts', () => {
    const orphan = plain({ wires: [{ from: 'in:a', to: 'part:missing:a' }] })

    expect(portDriven('and', 'a')(orphan)).toBe(false)
  })

  test('ignores input and output wires', () => {
    expect(portDriven('and', 'y')(plain())).toBe(false)
  })
})

describe('outputDriven', () => {
  test('matches the named output', () => {
    expect(outputDriven('y')(plain())).toBe(true)
    expect(outputDriven('q')(plain())).toBe(false)
  })
})

describe('signal predicates', () => {
  test('read net values', () => {
    const high = context({ a: true })
    const low = context({ a: false })

    expect(inputHigh('a')(high)).toBe(true)
    expect(inputLow('a')(high)).toBe(false)
    expect(inputHigh('a')(low)).toBe(false)
    expect(inputLow('a')(low)).toBe(true)
  })

  test('treat missing nets as low', () => {
    expect(outputLow('y')(context({}))).toBe(true)
    expect(outputHigh('y')(context({}))).toBe(false)
  })
})

describe('clockTicks', () => {
  test('passes once the count is reached', () => {
    expect(clockTicks(1)(context({}, {}, 0))).toBe(false)
    expect(clockTicks(1)(context({}, {}, 1))).toBe(true)
    expect(clockTicks(3)(context({}, {}, 2))).toBe(false)
    expect(clockTicks(3)(context({}, {}, 5))).toBe(true)
  })
})

describe('allOf', () => {
  test('requires every predicate', () => {
    const both = allOf(inputHigh('a'), outputHigh('y'))

    expect(both(context({ a: true, y: true }))).toBe(true)
    expect(both(context({ a: true, y: false }))).toBe(false)
    expect(both(context({ a: false, y: true }))).toBe(false)
  })

  test('passes with no predicates', () => {
    expect(allOf()(context())).toBe(true)
  })
})
