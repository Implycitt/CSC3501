import { describe, expect, test } from 'bun:test'
import { allComponents } from '../../src/game/registry.ts'
import { createSim } from '../../src/sections/ui/simulator.ts'
import { featuresFor } from '../../src/tutorial/features.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'
import { harness } from './harness.ts'

const KNOWN_TARGETS = new Set(['palette', 'ports', 'canvas', 'inspector', 'simulation', 'save', 'library', 'clear'])

const sectionById = (id: string) => {
  const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === id)
  if (!section) throw new Error(`missing section ${id}`)
  return section
}

describe('section definitions', () => {
  test('ids are unique and every section has steps', () => {
    const ids = new Set(TUTORIAL_SECTIONS.map((section) => section.id))

    expect(ids.size).toBe(TUTORIAL_SECTIONS.length)
    for (const section of TUTORIAL_SECTIONS) {
      expect(section.steps.length).toBeGreaterThan(0)
      expect(section.title.length).toBeGreaterThan(0)
      expect(section.summary.length).toBeGreaterThan(0)
    }
  })

  test('step ids are unique inside each section', () => {
    for (const section of TUTORIAL_SECTIONS) {
      expect(new Set(section.steps.map((step) => step.id)).size).toBe(section.steps.length)
    }
  })

  test('palette components exist in the registry', () => {
    const known = new Set(allComponents().map((component) => component.id))

    for (const section of TUTORIAL_SECTIONS) {
      expect(section.components?.length ?? 0).toBeGreaterThan(0)
      for (const id of section.components ?? []) expect(known.has(id)).toBe(true)
      for (const part of section.start.parts) expect(known.has(part.componentId)).toBe(true)
    }
  })

  test('targets resolve to real markers or allowed palette parts', () => {
    for (const section of TUTORIAL_SECTIONS) {
      for (const step of section.steps) {
        if (!step.target) continue
        const palette = step.target.startsWith('palette:')
        expect(palette || KNOWN_TARGETS.has(step.target)).toBe(true)
        if (palette) {
          expect(section.components ?? []).toContain(step.target.slice('palette:'.length))
        }
      }
    }
  })

  test('starting circuits simulate without error', () => {
    for (const section of TUTORIAL_SECTIONS) {
      expect(createSim(section.start).error).toBeNull()
    }
  })
})

describe('AND lesson', () => {
  test('completes when both inputs are on', () => {
    const section = sectionById('logic-and')
    const run = harness(section, TUTORIAL_SECTIONS)

    run.place('and', 'g1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:a', 'part:g1:a')
    expect(run.session.stepIndex).toBe(2)
    run.wire('in:b', 'part:g1:b')
    expect(run.session.stepIndex).toBe(3)
    run.wire('part:g1:y', 'out:y')
    expect(run.session.stepIndex).toBe(4)

    run.set('a', true)
    expect(run.nets.get('y')).toBe(false)
    run.set('b', true)

    expect(run.nets.get('y')).toBe(true)
    expect(run.session.sectionId).toBeNull()
    expect(run.session.progress[section.id].completed).toHaveLength(section.steps.length)
  })
})

describe('OR lesson', () => {
  test('completes with a single input on', () => {
    const section = sectionById('logic-or')
    const run = harness(section, TUTORIAL_SECTIONS)

    run.place('or', 'g1')
    run.wire('in:a', 'part:g1:a')
    run.wire('in:b', 'part:g1:b')
    run.wire('part:g1:y', 'out:y')
    run.set('a', true)

    expect(run.nets.get('y')).toBe(true)
    expect(run.session.sectionId).toBeNull()
  })
})

describe('NOT lesson', () => {
  test('completes through both inversion states', () => {
    const section = sectionById('logic-not')
    const run = harness(section, TUTORIAL_SECTIONS)

    run.place('not', 'g1')
    run.wire('in:a', 'part:g1:a')
    run.wire('part:g1:y', 'out:y')

    run.set('a', true)
    expect(run.nets.get('y')).toBe(false)
    run.set('a', false)

    expect(run.nets.get('y')).toBe(true)
    expect(run.session.sectionId).toBeNull()
  })

  test('locks down the interface', () => {
    expect(featuresFor(sectionById('logic-not'))).toEqual({
      addPorts: false,
      saveDesign: false,
      library: false,
      clearCanvas: false,
      componentDocs: false,
    })
  })
})

describe('D flip-flop lesson', () => {
  test('captures, holds and releases a bit across clock ticks', () => {
    const section = sectionById('memory-d-flip-flop')
    const run = harness(section, TUTORIAL_SECTIONS)

    run.place('d-flip-flop', 'p1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:d', 'part:p1:d')
    expect(run.session.stepIndex).toBe(2)
    run.wire('in:clk', 'part:p1:clk')
    expect(run.session.stepIndex).toBe(3)
    run.wire('part:p1:q', 'out:q')
    expect(run.session.stepIndex).toBe(4)

    run.tick()
    expect(run.session.ticks).toBe(1)
    expect(run.nets.get('q')).toBe(false)
    expect(run.session.stepIndex).toBe(5)

    run.set('d', true)
    expect(run.session.stepIndex).toBe(6)
    expect(run.nets.get('q')).toBe(false)

    run.tick()
    expect(run.nets.get('q')).toBe(true)
    expect(run.session.stepIndex).toBe(7)

    run.set('d', false)
    expect(run.nets.get('q')).toBe(true)
    expect(run.session.stepIndex).toBe(8)

    run.tick()
    expect(run.nets.get('q')).toBe(false)
    expect(run.session.sectionId).toBeNull()
    expect(run.session.progress[section.id].completed).toHaveLength(section.steps.length)
  })

  test('starts with a clock input wired into the environment', () => {
    const section = sectionById('memory-d-flip-flop')

    expect(section.start.inputs).toContain('clk')
    expect(featuresFor(section).addPorts).toBe(false)
  })
})
