import { describe, expect, test } from 'bun:test'
import { getComponent } from '../../src/game/registry.ts'
import { REFERENCE_GATE_COUNTS, gateLimitFor } from '../../src/tutorial/gateLimits.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'

describe('gate limits', () => {
  test('every tutorial section has a reference build and budget', () => {
    expect(Object.keys(REFERENCE_GATE_COUNTS).sort()).toEqual(TUTORIAL_SECTIONS.map((section) => section.id).sort())

    for (const section of TUTORIAL_SECTIONS) {
      const reference = REFERENCE_GATE_COUNTS[section.id]

      expect(reference).toBeGreaterThan(0)
      expect(gateLimitFor(section)).toBe(reference + 2)
      expect(gateLimitFor(section)).toBeGreaterThan(section.start.parts.length)
    }
  })

  test('budgets cover the largest reference builds', () => {
    expect(gateLimitFor({ id: 'logic-full-adder' })).toBe(7)
    expect(gateLimitFor({ id: 'logic-command-uplink' })).toBe(12)
  })

  test('every board lists a focused, real component set', () => {
    for (const section of TUTORIAL_SECTIONS) {
      expect(section.components?.length).toBeGreaterThan(0)
      for (const id of section.components ?? []) expect(getComponent(id)).toBeDefined()
    }
  })

  test('free bench has no gate budget', () => {
    expect(gateLimitFor(undefined)).toBeUndefined()
  })
})
