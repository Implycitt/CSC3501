import { describe, expect, test } from 'bun:test'
import { EMPTY_CIRCUIT } from '../../src/game/circuit.ts'
import {
  PROGRESS_KEY,
  firstIncompleteStep,
  isSectionComplete,
  isStepComplete,
  loadProgress,
  markStepComplete,
  nextIncompleteSection,
  parseProgress,
  persistProgress,
  resetSection,
} from '../../src/tutorial/progress.ts'
import type { TutorialSection } from '../../src/tutorial/types.ts'

const section = (id: string, stepIds: string[]): TutorialSection => ({
  id,
  title: id,
  summary: '',
  start: EMPTY_CIRCUIT,
  steps: stepIds.map((stepId) => ({ id: stepId, title: stepId, body: '' })),
})

const fakeStorage = () => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

describe('parseProgress', () => {
  test('returns empty progress for missing or malformed data', () => {
    expect(parseProgress(null)).toEqual({})
    expect(parseProgress('')).toEqual({})
    expect(parseProgress('not json')).toEqual({})
    expect(parseProgress('[]')).toEqual({})
    expect(parseProgress('null')).toEqual({})
    expect(parseProgress('"text"')).toEqual({})
  })

  test('keeps valid sections and drops junk', () => {
    const raw = JSON.stringify({
      first: { completed: ['a', 'a', 'b'], finishedAt: 123 },
      second: { completed: ['c', 42, '', null], finishedAt: 'later' },
      third: 'nope',
      '': { completed: ['x'] },
    })

    expect(parseProgress(raw)).toEqual({
      first: { completed: ['a', 'b'], finishedAt: 123 },
      second: { completed: ['c'] },
    })
  })

  test('drops non-finite timestamps', () => {
    const raw = JSON.stringify({ first: { completed: [], finishedAt: Infinity } })

    expect(parseProgress(raw)).toEqual({ first: { completed: [] } })
  })
})

describe('loadProgress and persistProgress', () => {
  test('round-trips through storage', () => {
    const storage = fakeStorage()
    persistProgress({ first: { completed: ['a'] } }, storage)

    expect(storage.data.get(PROGRESS_KEY)).toBeTruthy()
    expect(loadProgress(storage)).toEqual({ first: { completed: ['a'] } })
  })

  test('survives a storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }

    expect(loadProgress(broken)).toEqual({})
    expect(() => persistProgress({}, broken)).not.toThrow()
  })

  test('handles missing storage', () => {
    expect(loadProgress(undefined)).toEqual({})
    expect(() => persistProgress({}, undefined)).not.toThrow()
  })
})

describe('step bookkeeping', () => {
  test('marks a step complete without duplicating it', () => {
    const lesson = section('one', ['a', 'b'])
    const first = markStepComplete({}, lesson, 'a')
    const again = markStepComplete(first, lesson, 'a')

    expect(first.one.completed).toEqual(['a'])
    expect(first.one.finishedAt).toBeUndefined()
    expect(again.one.completed).toEqual(['a'])
  })

  test('stamps finishedAt once every step is complete', () => {
    const lesson = section('one', ['a', 'b'])
    const progress = markStepComplete(markStepComplete({}, lesson, 'a'), lesson, 'b')

    expect(progress.one.finishedAt).toBeGreaterThan(0)
    expect(isSectionComplete(progress, lesson)).toBe(true)
    expect(isStepComplete(progress, 'one', 'a')).toBe(true)
    expect(isStepComplete(progress, 'one', 'missing')).toBe(false)
  })

  test('keeps the original timestamp when re-marking a finished section', () => {
    const lesson = section('one', ['a'])
    const finished = markStepComplete({}, lesson, 'a')
    const again = markStepComplete(finished, lesson, 'a')

    expect(again.one.finishedAt).toBe(finished.one.finishedAt!)
  })

  test('resets a section without touching others', () => {
    const progress = { one: { completed: ['a'] }, two: { completed: ['b'] } }

    expect(resetSection(progress, 'one')).toEqual({ two: { completed: ['b'] } })
  })
})

describe('navigation helpers', () => {
  test('finds the first unfinished step', () => {
    const lesson = section('one', ['a', 'b', 'c'])

    expect(firstIncompleteStep(lesson, {})).toBe(0)
    expect(firstIncompleteStep(lesson, { one: { completed: ['a'] } })).toBe(1)
    expect(firstIncompleteStep(lesson, { one: { completed: ['a', 'b', 'c'] } })).toBe(2)
  })

  test('finds the next section with work left', () => {
    const first = section('one', ['a'])
    const second = section('two', ['b'])
    const empty = section('three', [])

    expect(nextIncompleteSection([first, second], {})).toBe(first)
    expect(nextIncompleteSection([first, second], { one: { completed: ['a'] } })).toBe(second)
    expect(nextIncompleteSection([empty], {})).toBeUndefined()
    expect(nextIncompleteSection([], {})).toBeUndefined()
  })

  test('treats a section without steps as incomplete', () => {
    expect(isSectionComplete({}, section('empty', []))).toBe(false)
  })
})
