import { describe, expect, test } from 'bun:test'
import { matchesCircuitGoal } from '../../src/game/behavior.ts'
import { allSystemsOnline } from '../../src/game/campaign.ts'
import { SHIP_SYSTEMS, stageById } from '../../src/game/ship.ts'
import { environment } from '../../src/tutorial/environment.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'

const LATER_PUZZLES = ['logic-adder2', 'logic-parity4', 'logic-mux4', 'logic-command-uplink'] as const

const sectionFor = (id: string) => {
  const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === id)
  if (!section?.goal) throw new Error(`missing later puzzle ${id}`)
  return section
}

describe('new later-stage puzzles', () => {
  test('start from an empty canvas with complete behavior goals', () => {
    for (const id of LATER_PUZZLES) {
      const section = sectionFor(id)

      expect(section.mode).toBe('puzzle')
      expect(section.start.parts).toHaveLength(0)
      expect(section.start.wires).toHaveLength(0)
      expect(section.start.inputs.length).toBeGreaterThan(0)
      expect(section.start.outputs.length).toBeGreaterThan(0)
      expect(section.goal!.cases).toHaveLength(2 ** section.goal!.inputs.length)
      expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
    }
  })

  test('accept short reference solutions', () => {
    const adder2 = environment()
      .input('a1')
      .input('a0')
      .input('b1')
      .input('b0')
      .input('cin')
      .output('s0')
      .output('s1')
      .output('cout')
      .place('full-adder', { as: 'low' })
      .place('full-adder', { as: 'high' })
      .wire('in:a0', 'low.a')
      .wire('in:b0', 'low.b')
      .wire('in:cin', 'low.cin')
      .wire('low.sum', 'out:s0')
      .wire('low.cout', 'high.cin')
      .wire('in:a1', 'high.a')
      .wire('in:b1', 'high.b')
      .wire('high.sum', 'out:s1')
      .wire('high.cout', 'out:cout')
      .build()

    const parity = environment()
      .input('a')
      .input('b')
      .input('c')
      .input('d')
      .output('y')
      .place('xor', { as: 'ab' })
      .place('xor', { as: 'cd' })
      .place('xor', { as: 'all' })
      .wire('in:a', 'ab.a')
      .wire('in:b', 'ab.b')
      .wire('in:c', 'cd.a')
      .wire('in:d', 'cd.b')
      .wire('ab.y', 'all.a')
      .wire('cd.y', 'all.b')
      .wire('all.y', 'out:y')
      .build()

    const mux4 = environment()
      .input('a')
      .input('b')
      .input('c')
      .input('d')
      .input('s0')
      .input('s1')
      .output('y')
      .place('mux2', { as: 'low' })
      .place('mux2', { as: 'high' })
      .place('mux2', { as: 'final' })
      .wire('in:a', 'low.a')
      .wire('in:b', 'low.b')
      .wire('in:s0', 'low.sel')
      .wire('in:c', 'high.a')
      .wire('in:d', 'high.b')
      .wire('in:s0', 'high.sel')
      .wire('low.y', 'final.a')
      .wire('high.y', 'final.b')
      .wire('in:s1', 'final.sel')
      .wire('final.y', 'out:y')
      .build()

    const capstone = environment()
      .input('a1')
      .input('a0')
      .input('b1')
      .input('b0')
      .input('cin')
      .output('y')
      .place('full-adder', { as: 'low' })
      .place('full-adder', { as: 'high' })
      .place('xor', { as: 'parity-high' })
      .place('xor', { as: 'parity-low' })
      .place('xor', { as: 'parity-all' })
      .place('mux2', { as: 'route-low' })
      .place('mux2', { as: 'route-high' })
      .place('mux2', { as: 'route-final' })
      .place('not', { as: 'no-carry' })
      .place('and3', { as: 'permit' })
      .wire('in:a0', 'low.a')
      .wire('in:b0', 'low.b')
      .wire('in:cin', 'low.cin')
      .wire('low.cout', 'high.cin')
      .wire('in:a1', 'high.a')
      .wire('in:b1', 'high.b')
      .wire('in:a1', 'parity-high.a')
      .wire('in:a0', 'parity-high.b')
      .wire('in:b1', 'parity-low.a')
      .wire('in:b0', 'parity-low.b')
      .wire('parity-high.y', 'parity-all.a')
      .wire('parity-low.y', 'parity-all.b')
      .wire('in:a1', 'route-low.a')
      .wire('in:a0', 'route-low.b')
      .wire('in:b1', 'route-high.a')
      .wire('in:b0', 'route-high.b')
      .wire('low.sum', 'route-low.sel')
      .wire('low.sum', 'route-high.sel')
      .wire('route-low.y', 'route-final.a')
      .wire('route-high.y', 'route-final.b')
      .wire('high.sum', 'route-final.sel')
      .wire('high.cout', 'no-carry.a')
      .wire('parity-all.y', 'permit.a')
      .wire('route-final.y', 'permit.b')
      .wire('no-carry.y', 'permit.c')
      .wire('permit.y', 'out:y')
      .build()

    expect(matchesCircuitGoal(adder2, sectionFor('logic-adder2').goal!)).toBe(true)
    expect(matchesCircuitGoal(parity, sectionFor('logic-parity4').goal!)).toBe(true)
    expect(matchesCircuitGoal(mux4, sectionFor('logic-mux4').goal!)).toBe(true)
    expect(matchesCircuitGoal(capstone, sectionFor('logic-command-uplink').goal!)).toBe(true)

    expect(adder2.parts).toHaveLength(2)
    expect(parity.parts).toHaveLength(3)
    expect(mux4.parts).toHaveLength(3)
    expect(capstone.parts).toHaveLength(10)
  })

  test('accepts an alternate short parity build', () => {
    const alternate = environment()
      .input('a')
      .input('b')
      .input('c')
      .input('d')
      .output('y')
      .place('xor3', { as: 'first-three' })
      .place('xor', { as: 'with-last' })
      .wire('in:a', 'first-three.a')
      .wire('in:b', 'first-three.b')
      .wire('in:c', 'first-three.c')
      .wire('first-three.y', 'with-last.a')
      .wire('in:d', 'with-last.b')
      .wire('with-last.y', 'out:y')
      .build()

    expect(matchesCircuitGoal(alternate, sectionFor('logic-parity4').goal!)).toBe(true)
    expect(alternate.parts).toHaveLength(2)
  })

  test('are wired into the late campaign stages and the capstone ends the campaign', () => {
    expect(stageById('pwr-two-bit-total')?.sectionId).toBe('logic-adder2')
    expect(stageById('sns-parity-filter')?.sectionId).toBe('logic-parity4')
    expect(stageById('shd-quad-router')?.sectionId).toBe('logic-mux4')
    expect(stageById('shd-command-uplink')?.sectionId).toBe('logic-command-uplink')

    const finalSystem = SHIP_SYSTEMS[SHIP_SYSTEMS.length - 1]
    expect(finalSystem.stages[finalSystem.stages.length - 1].id).toBe('shd-command-uplink')
  })

  test('gates the victory state until the capstone is repaired', () => {
    const circuitSections = SHIP_SYSTEMS.flatMap((system) =>
      system.stages.flatMap((stage) =>
        stage.kind === 'circuit' && stage.sectionId && stage.sectionId !== 'logic-command-uplink'
          ? [stage.sectionId]
          : [],
      ),
    )
    const firmware = SHIP_SYSTEMS.flatMap((system) =>
      system.stages.flatMap((stage) => (stage.kind === 'firmware' ? [stage.id] : [])),
    )
    const progress = { firmware, introSeen: true, victorySeen: false }

    expect(allSystemsOnline(circuitSections, progress)).toBe(false)
    expect(allSystemsOnline([...circuitSections, 'logic-command-uplink'], progress)).toBe(true)
  })
})
