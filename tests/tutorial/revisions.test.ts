import { describe, expect, test } from 'bun:test'
import { matchesCircuitGoal } from '../../src/game/behavior.ts'
import { createSim } from '../../src/sections/ui/simulator.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'
import type { TutorialSection } from '../../src/tutorial/types.ts'

const sectionById = (id: string) => {
  const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === id)
  if (!section) throw new Error(`missing section ${id}`)
  return section
}

const hasPart = (section: TutorialSection, componentId: string) =>
  section.start.parts.some((part) => part.componentId === componentId)

const hasPortWire = (section: TutorialSection, suffix: string) =>
  section.start.wires.some((wire) => wire.to.endsWith(suffix))

describe('exact circuit revisions', () => {
  test('NAV-01 starts with the legacy AND rule and offers the OR replacement', () => {
    const section = sectionById('logic-or')

    expect(section.title).toBe('Gyro bus')
    expect(section.components).toEqual(['or', 'and'])
    expect(hasPart(section, 'and')).toBe(true)
    expect(hasPart(section, 'or')).toBe(false)
    expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
  })

  test('COM-01 starts with a buffer and offers NOT plus a spare buffer', () => {
    const section = sectionById('logic-not')

    expect(section.title).toBe('Carrier recovery')
    expect(section.components).toEqual(['not', 'buffer'])
    expect(hasPart(section, 'buffer')).toBe(true)
    expect(hasPart(section, 'not')).toBe(false)
    expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
  })

  test('COM-03 starts with the incomplete AND and offers NOT first', () => {
    const section = sectionById('logic-not-nand')

    expect(section.title).toBe('Carrier veto')
    expect(section.components).toEqual(['not', 'and'])
    expect(hasPart(section, 'and')).toBe(true)
    expect(hasPart(section, 'not')).toBe(false)
    expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
  })

  test('SHD-03 keeps the mux but starts with the select path missing', () => {
    const section = sectionById('logic-mux')

    expect(section.title).toBe('Shield router')
    expect(section.components).toEqual(['mux2'])
    expect(hasPart(section, 'mux2')).toBe(true)
    expect(hasPortWire(section, ':sel')).toBe(false)
    expect(section.steps.map((step) => step.id)).toEqual([
      'drive-sel',
      'select-a',
      'select-b',
      'select-blocks-a',
    ])
  })

  test('PWR-05 starts as a half-adder with cin present but unwired', () => {
    const section = sectionById('logic-full-adder')

    expect(section.components).toEqual(['xor', 'and', 'or', 'full-adder'])
    expect(hasPart(section, 'xor')).toBe(true)
    expect(hasPart(section, 'and')).toBe(true)
    expect(hasPart(section, 'full-adder')).toBe(false)
    expect(section.start.inputs).toContain('cin')
    expect(section.start.wires.some((wire) => wire.to.includes('cin'))).toBe(false)
    expect(createSim(section.start).error).toBeNull()
    expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
    expect(section.steps.map((step) => step.id)).toEqual([
      'place-adder',
      'wire-feeds',
      'wire-carry-in',
      'wire-total',
      'all-three-high',
      'carry-without-sum',
    ])
  })

  test('the three guided life-support lessons are compressed to three steps', () => {
    for (const id of ['intro-and', 'intro-or', 'intro-not']) {
      const section = sectionById(id)
      expect(section.steps).toHaveLength(3)
      expect(section.mode).not.toBe('puzzle')
    }
  })
})
