import { describe, expect, test } from 'bun:test'
import {
  EMPTY_STORY,
  STORY_KEY,
  chapterComplete,
  completedChapterIds,
  hasRecoveredLog,
  hasSeenBeat,
  loadStory,
  markAllLogsRead,
  markBeatSeen,
  markLogRead,
  markLogRecovered,
  parseStory,
  persistStory,
  recoverLogsFromCompletedStages,
  setEnding,
  storyEnding,
  unreadLogIds,
  type StoryProgress,
} from '../../src/game/story.ts'
import { ALL_STAGES, systemById } from '../../src/game/ship.ts'
import type { StorageLike } from '../../src/game/library.ts'

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
  return { storage, values }
}

const fresh = (): StoryProgress => ({ ...EMPTY_STORY, seenBeatIds: [], recoveredLogIds: [], readLogIds: [] })

const lifeSupportStages = systemById('life-support')?.stages.map((stage) => stage.id) ?? []
const navigationStages = systemById('navigation')?.stages.map((stage) => stage.id) ?? []

describe('story persistence', () => {
  test('missing and malformed storage return empty progress', () => {
    expect(parseStory(null)).toEqual(fresh())
    expect(parseStory('{')).toEqual(fresh())
    expect(parseStory(JSON.stringify({ version: 2 }))).toEqual(fresh())
  })

  test('drops unknown ids and deduplicates known ids', () => {
    const parsed = parseStory(
      JSON.stringify({
        version: 1,
        seenBeatIds: ['lss-relay:open', 'lss-relay:open', 'unknown'],
        recoveredLogIds: ['record-evacuation', 'record-evacuation', 'unknown'],
        readLogIds: ['record-evacuation', 'unknown', 'record-nav'],
        ending: 'signal-colony',
      }),
    )

    expect(parsed.seenBeatIds).toEqual(['lss-relay:open'])
    expect(parsed.recoveredLogIds).toEqual(['record-evacuation'])
    expect(parsed.readLogIds).toEqual(['record-evacuation'])
    expect(parsed.ending).toBe('signal-colony')
  })

  test('loads and persists through the versioned key', () => {
    const { storage, values } = memoryStorage()
    const progress = markBeatSeen(fresh(), 'lss-relay:open')

    persistStory(progress, storage)
    expect(values.has(STORY_KEY)).toBe(true)
    expect(loadStory(storage)).toEqual(progress)
  })

  test('marks a beat once and ignores unknown beats', () => {
    const first = markBeatSeen(fresh(), 'lss-relay:open')
    const second = markBeatSeen(first, 'lss-relay:open')
    const unknown = markBeatSeen(second, 'unknown')

    expect(first.seenBeatIds).toEqual(['lss-relay:open'])
    expect(second).toBe(first)
    expect(unknown).toBe(second)
    expect(hasSeenBeat(second, 'lss-relay:open')).toBe(true)
  })

  test('recovers and reads records once', () => {
    const recovered = markLogRecovered(fresh(), 'record-evacuation')
    const duplicate = markLogRecovered(recovered, 'record-evacuation')
    const readBeforeRecovery = markLogRead(fresh(), 'record-evacuation')
    const read = markLogRead(duplicate, 'record-evacuation')
    const readAgain = markLogRead(read, 'record-evacuation')

    expect(hasRecoveredLog(recovered, 'record-evacuation')).toBe(true)
    expect(duplicate).toBe(recovered)
    expect(readBeforeRecovery.readLogIds).toEqual([])
    expect(read.readLogIds).toEqual(['record-evacuation'])
    expect(readAgain).toBe(read)
    expect(unreadLogIds(recovered)).toEqual(['record-evacuation'])
    expect(unreadLogIds(read)).toEqual([])
  })

  test('marks all recovered records read and ignores unknowns', () => {
    let progress = markLogRecovered(fresh(), 'record-evacuation')
    progress = markLogRecovered(progress, 'record-nav')
    const read = markAllLogsRead(progress)
    const repeated = markAllLogsRead(read)

    expect(read.readLogIds).toEqual(['record-evacuation', 'record-nav'])
    expect(repeated).toBe(read)
    expect(markAllLogsRead(markLogRecovered(fresh(), 'unknown')).readLogIds).toEqual([])
  })

  test('persists only valid endings and exposes the saved ending', () => {
    const saved = setEnding(fresh(), 'finish-delivery')
    expect(saved.ending).toBe('finish-delivery')
    expect(storyEnding(saved)?.id).toBe('finish-delivery')
    expect(setEnding(saved, 'finish-delivery')).toBe(saved)
    expect(setEnding(fresh(), 'not-an-ending' as never).ending).toBeNull()
  })

  test('recovers chapter records from completed stage ids without duplicating', () => {
    const partial = recoverLogsFromCompletedStages(fresh(), lifeSupportStages.slice(0, 3))
    expect(partial.recoveredLogIds).toEqual([])

    const complete = recoverLogsFromCompletedStages(fresh(), lifeSupportStages)
    expect(complete.recoveredLogIds).toEqual(['record-evacuation'])
    expect(recoverLogsFromCompletedStages(complete, lifeSupportStages)).toBe(complete)
    expect(chapterComplete('wake', lifeSupportStages)).toBe(true)
    expect(chapterComplete('wake', lifeSupportStages.slice(0, 1))).toBe(false)
    expect(completedChapterIds([...lifeSupportStages, ...navigationStages])).toEqual([
      'wake',
      'course',
    ])
  })

  test('every stage belongs to exactly one chapter', () => {
    const seen = new Set<string>()
    for (const stage of ALL_STAGES) {
      expect(seen.has(stage.id)).toBe(false)
      seen.add(stage.id)
    }
    expect(seen.size).toBe(37)
  })
})
