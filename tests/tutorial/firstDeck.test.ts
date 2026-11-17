import { describe, expect, test } from 'bun:test'
import { taskById } from '../../src/terminal/tasks.ts'
import { assemble, runCases } from '../../src/terminal/x86.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'
import type { TutorialSection } from '../../src/tutorial/types.ts'
import { harness } from './harness.ts'

const play = (id: string) => {
  const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === id) as TutorialSection | undefined
  if (!section) throw new Error(`missing first-deck section ${id}`)
  return harness(section, TUTORIAL_SECTIONS)
}

const expectFirmwareAccepted = (taskId: string, source: string) => {
  const task = taskById(taskId)
  if (!task) throw new Error(`missing first-deck firmware task ${taskId}`)

  const results = runCases(assemble(source), task.tests)
  expect(results.every((result) => result.passed)).toBe(true)
}

describe('first deck playthrough', () => {
  test('LSS-01 AND interlock advances through every step', () => {
    const run = play('intro-and')

    expect(run.session.stepIndex).toBe(0)
    run.place('and', 'g1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:a', 'part:g1:a')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:b', 'part:g1:b')
    expect(run.session.stepIndex).toBe(2)
    run.wire('part:g1:y', 'out:y')
    expect(run.session.stepIndex).toBe(3)

    run.set('a', true)
    expect(run.session.sectionId).toBe('intro-and')
    run.set('b', true)
    expect(run.session.sectionId).toBeNull()
  })

  test('LSS-02 OR return feed advances through every step', () => {
    const run = play('intro-or')

    run.place('or', 'g1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:a', 'part:g1:a')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:b', 'part:g1:b')
    expect(run.session.stepIndex).toBe(2)
    run.wire('part:g1:y', 'out:y')
    expect(run.session.stepIndex).toBe(3)

    run.set('a', true)
    expect(run.session.sectionId).toBeNull()
  })

  test('LSS-03 NOT inverter advances through every step', () => {
    const run = play('intro-not')

    run.place('not', 'g1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('in:a', 'part:g1:a')
    expect(run.session.stepIndex).toBe(1)
    run.wire('part:g1:y', 'out:y')
    expect(run.session.stepIndex).toBe(2)

    run.set('a', true)
    expect(run.session.stepIndex).toBe(3)
    run.set('a', false)
    expect(run.session.sectionId).toBeNull()
  })

  test('LSS-05 pressure window advances through every step', () => {
    const run = play('logic-and-window')

    expect(run.circuit.parts).toHaveLength(1)
    run.place('and', 'g1')
    expect(run.session.stepIndex).toBe(1)
    run.wire('part:t0:y', 'part:g1:b')
    expect(run.session.stepIndex).toBe(2)
    run.wire('in:arm', 'part:g1:a')
    expect(run.session.stepIndex).toBe(3)
    run.wire('part:g1:y', 'out:y')
    expect(run.session.stepIndex).toBe(4)

    run.set('arm', true)
    expect(run.session.stepIndex).toBe(5)
    run.set('arm', false)
    run.set('fault', true)
    expect(run.session.sectionId).toBe('logic-and-window')
    run.set('arm', true)
    expect(run.session.sectionId).toBeNull()
  })

  test('LSS-04 and LSS-06 firmware images are accepted by their tests', () => {
    const lss04 = taskById('lss-01')
    const lss06 = taskById('lss-02')
    if (!lss04 || !lss06) throw new Error('missing first-deck firmware tasks')

    expectFirmwareAccepted('lss-01', lss04.starter.replace('mov ax, bx', 'and ax, bx'))
    expectFirmwareAccepted('lss-02', lss06.starter.replace('not bx\nand ax, bx', 'not cx\nand ax, cx'))
  })
})
