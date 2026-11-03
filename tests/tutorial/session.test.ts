import { describe, expect, test } from 'bun:test'
import { EMPTY_CIRCUIT } from '../../src/game/circuit.ts'
import { environment } from '../../src/tutorial/environment.ts'
import { featuresFor } from '../../src/tutorial/features.ts'
import {
  advanceSession,
  closeSession,
  resumeSession,
  retreatSession,
  sectionCircuit,
  settleSession,
  startSession,
} from '../../src/tutorial/session.ts'
import type { TutorialSection } from '../../src/tutorial/types.ts'

const lesson = (overrides: Partial<TutorialSection> = {}): TutorialSection => ({
  id: 'one',
  title: 'One',
  summary: '',
  components: [],
  start: EMPTY_CIRCUIT,
  steps: [
    { id: 'a', title: 'A', body: '' },
    { id: 'b', title: 'B', body: '' },
  ],
  ...overrides,
})

describe('startSession', () => {
  test('opens the first section with work left', () => {
    const first = lesson({ id: 'first' })
    const second = lesson({ id: 'second' })
    const session = startSession([first, second], {})

    expect(session).toEqual({ progress: {}, sectionId: 'first', stepIndex: 0, ticks: 0, paused: false })
  })

  test('skips finished sections and resumes mid-section', () => {
    const first = lesson({ id: 'first' })
    const second = lesson({ id: 'second' })
    const session = startSession([first, second], {
      first: { completed: ['a', 'b'], finishedAt: 1 },
      second: { completed: ['a'] },
    })

    expect(session.sectionId).toBe('second')
    expect(session.stepIndex).toBe(1)
  })

  test('opens on nothing when every section is finished', () => {
    const finished = lesson({ id: 'first' })
    const session = startSession([finished], { first: { completed: ['a', 'b'], finishedAt: 1 } })

    expect(session.sectionId).toBeNull()
    expect(session.ticks).toBe(0)
  })
})

describe('sectionCircuit', () => {
  const withStart = lesson({
    start: environment().input('a').output('y').place('and', { as: 'gate' }).wire('in:a', 'gate.a').build(),
  })

  test('rekeys parts so repeated loads cannot collide', () => {
    const first = sectionCircuit([withStart], 'one')
    const second = sectionCircuit([withStart], 'one')

    expect(first.parts).toHaveLength(1)
    expect(second.parts).toHaveLength(1)
    expect(first.parts[0].uid).not.toBe(second.parts[0].uid)
    expect(first.wires[0]).toEqual({ from: 'in:a', to: `part:${first.parts[0].uid}:a` })
  })

  test('does not mutate the section start', () => {
    const before = JSON.stringify(withStart.start)
    sectionCircuit([withStart], 'one')
    const loaded = sectionCircuit([withStart], 'one')
    loaded.parts[0].x = 999

    expect(JSON.stringify(withStart.start)).toBe(before)
    expect(sectionCircuit([withStart], 'one').parts[0].x).not.toBe(999)
  })

  test('falls back to an empty circuit', () => {
    expect(sectionCircuit([withStart], null)).toBe(EMPTY_CIRCUIT)
    expect(sectionCircuit([withStart], 'missing')).toBe(EMPTY_CIRCUIT)
  })
})

describe('settleSession', () => {
  test('returns the same session when nothing is satisfied', () => {
    const session = { progress: {}, sectionId: 'one', stepIndex: 0, ticks: 0 }
    const settled = settleSession([lesson()], session, EMPTY_CIRCUIT, new Map())

    expect(settled).toBe(session)
  })

  test('records ticks even without completing a step', () => {
    const session = { progress: {}, sectionId: 'one', stepIndex: 0, ticks: 0 }
    const settled = settleSession([lesson()], session, EMPTY_CIRCUIT, new Map(), 4)

    expect(settled.ticks).toBe(4)
    expect(settled.stepIndex).toBe(0)
    expect(settled.progress).toEqual({})
  })

  test('completes a step whose predicate passes', () => {
    const clocked = lesson({
      steps: [{ id: 'a', title: 'A', body: '', done: (context) => context.ticks >= 2 }],
    })
    const session = { progress: {}, sectionId: 'one', stepIndex: 0, ticks: 0 }
    const settled = settleSession([clocked], session, EMPTY_CIRCUIT, new Map(), 2)

    expect(settled.progress.one.completed).toEqual(['a'])
    expect(settled.sectionId).toBeNull()
    expect(settled.ticks).toBe(2)
  })

  test('ignores a session with no active section', () => {
    const session = { progress: {}, sectionId: null, stepIndex: 0, ticks: 0 }

    expect(settleSession([lesson()], session, EMPTY_CIRCUIT, new Map(), 3)).toBe(session)
  })
})

describe('advanceSession', () => {
  test('completes the current step and moves on', () => {
    const session = { progress: {}, sectionId: 'one', stepIndex: 0, ticks: 0 }
    const advanced = advanceSession([lesson()], session)

    expect(advanced.progress.one.completed).toEqual(['a'])
    expect(advanced.stepIndex).toBe(1)
  })

  test('closes the section after the last step', () => {
    const session = { progress: { one: { completed: ['a'] } }, sectionId: 'one', stepIndex: 1, ticks: 2 }
    const advanced = advanceSession([lesson()], session)

    expect(advanced.progress.one.completed).toEqual(['a', 'b'])
    expect(advanced.progress.one.finishedAt).toBeGreaterThan(0)
    expect(advanced.sectionId).toBeNull()
  })

  test('leaves an inactive session alone', () => {
    const session = { progress: {}, sectionId: 'missing', stepIndex: 0, ticks: 0 }

    expect(advanceSession([lesson()], session)).toBe(session)
  })
})

describe('retreatSession and closeSession', () => {
  test('clamps retreat at the first step', () => {
    expect(retreatSession({ progress: {}, sectionId: 'one', stepIndex: 0, ticks: 0 }).stepIndex).toBe(0)
    expect(retreatSession({ progress: {}, sectionId: 'one', stepIndex: 2, ticks: 0 }).stepIndex).toBe(1)
  })

  test('closing pauses the section and keeps progress, step and ticks', () => {
    const session = {
      progress: { one: { completed: ['a'] } },
      sectionId: 'one',
      stepIndex: 1,
      ticks: 5,
      paused: false,
    }
    const closed = closeSession(session)

    expect(closed).toEqual({ ...session, paused: true })
  })

  test('closing an inactive session stays inactive', () => {
    const closed = closeSession({ progress: {}, sectionId: null, stepIndex: 0, ticks: 0, paused: false })

    expect(closed.paused).toBe(false)
  })
})

describe('resumeSession', () => {
  test('opens a fresh section at its first unfinished step', () => {
    const session = {
      progress: { one: { completed: ['a'] } },
      sectionId: null,
      stepIndex: 0,
      ticks: 7,
      paused: false,
    }
    const resumed = resumeSession([lesson()], session, 'one')

    expect(resumed).toEqual({ progress: session.progress, sectionId: 'one', stepIndex: 1, ticks: 0, paused: false })
  })

  test('unpauses the same section without disturbing work or ticks', () => {
    const session = {
      progress: { one: { completed: ['a'] } },
      sectionId: 'one',
      stepIndex: 1,
      ticks: 4,
      paused: true,
    }
    const resumed = resumeSession([lesson()], session, 'one')

    expect(resumed).toEqual({ ...session, paused: false })
  })

  test('ignores an unknown section', () => {
    const session = { progress: {}, sectionId: null, stepIndex: 0, ticks: 0, paused: false }

    expect(resumeSession([lesson()], session, 'missing')).toBe(session)
  })

  test('paused sessions ignore completion signals', () => {
    const completed = lesson({
      steps: [{ id: 'a', title: 'A', body: '', done: () => true }],
    })
    const session = { progress: {}, sectionId: 'one', stepIndex: 0, ticks: 2, paused: true }

    expect(settleSession([completed], session, EMPTY_CIRCUIT, new Map())).toBe(session)
    expect(advanceSession([completed], session)).toBe(session)
  })
})

describe('featuresFor', () => {
  test('enables everything by default', () => {
    expect(featuresFor(undefined)).toEqual({
      addPorts: true,
      saveDesign: true,
      library: true,
      clearCanvas: true,
      componentDocs: true,
    })
  })

  test('applies section overrides only', () => {
    expect(featuresFor(lesson({ features: { addPorts: false, library: false } }))).toEqual({
      addPorts: false,
      saveDesign: true,
      library: false,
      clearCanvas: true,
      componentDocs: true,
    })
  })
})
