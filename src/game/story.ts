import {
  CHAPTERS,
  LOG_FRAGMENTS,
  STORY_BEATS,
  allStagesForChapter,
  beatById,
  endingById,
  logById,
  type ChapterId,
  type EndingId,
} from './narrative.ts'
import type { StorageLike } from './library.ts'

export const STORY_KEY = 'csc3501.story.v1'

export interface StoryProgress {
  version: 1
  seenBeatIds: string[]
  recoveredLogIds: string[]
  readLogIds: string[]
  ending: EndingId | null
}

export const EMPTY_STORY: StoryProgress = {
  version: 1,
  seenBeatIds: [],
  recoveredLogIds: [],
  readLogIds: [],
  ending: null,
}

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isId = (value: unknown): value is string => typeof value === 'string' && value.length > 0

const knownBeatIds = new Set(STORY_BEATS.map((beat) => beat.id))
const knownLogIds = new Set(LOG_FRAGMENTS.map((fragment) => fragment.id))

function uniqueKnown(values: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(values)) return []
  const result: string[] = []
  for (const value of values) {
    if (!isId(value) || !known.has(value) || result.includes(value)) continue
    result.push(value)
  }
  return result
}

function emptyStory(): StoryProgress {
  return { ...EMPTY_STORY, seenBeatIds: [], recoveredLogIds: [], readLogIds: [] }
}

export function parseStory(raw: string | null): StoryProgress {
  if (!raw) return emptyStory()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyStory()
  }
  if (!isObject(parsed) || parsed.version !== 1) return emptyStory()

  const recoveredLogIds = uniqueKnown(parsed.recoveredLogIds, knownLogIds)
  const readLogIds = uniqueKnown(parsed.readLogIds, knownLogIds).filter((id) => recoveredLogIds.includes(id))
  const ending = isId(parsed.ending) && endingById(parsed.ending) ? (parsed.ending as EndingId) : null

  return {
    version: 1,
    seenBeatIds: uniqueKnown(parsed.seenBeatIds, knownBeatIds),
    recoveredLogIds,
    readLogIds,
    ending,
  }
}

function defaultStorage(): StorageLike | undefined {
  try {
    const storage = globalThis.localStorage as StorageLike | undefined
    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function'
      ? storage
      : undefined
  } catch {
    return undefined
  }
}

export function loadStory(storage: StorageLike | undefined = defaultStorage()): StoryProgress {
  if (!storage) return emptyStory()
  try {
    return parseStory(storage.getItem(STORY_KEY))
  } catch {
    return emptyStory()
  }
}

export function persistStory(
  progress: StoryProgress,
  storage: StorageLike | undefined = defaultStorage(),
): void {
  if (!storage) return
  try {
    storage.setItem(STORY_KEY, JSON.stringify(progress))
  } catch {}
}

export function hasSeenBeat(progress: StoryProgress, beatId: string): boolean {
  return progress.seenBeatIds.includes(beatId)
}

export function markBeatSeen(progress: StoryProgress, beatId: string): StoryProgress {
  if (!beatById(beatId) || progress.seenBeatIds.includes(beatId)) return progress
  return { ...progress, seenBeatIds: [...progress.seenBeatIds, beatId] }
}

export function hasRecoveredLog(progress: StoryProgress, logId: string): boolean {
  return progress.recoveredLogIds.includes(logId)
}

export function markLogRecovered(progress: StoryProgress, logId: string): StoryProgress {
  if (!logById(logId) || progress.recoveredLogIds.includes(logId)) return progress
  return { ...progress, recoveredLogIds: [...progress.recoveredLogIds, logId] }
}

export function hasReadLog(progress: StoryProgress, logId: string): boolean {
  return progress.readLogIds.includes(logId)
}

export function markLogRead(progress: StoryProgress, logId: string): StoryProgress {
  if (!progress.recoveredLogIds.includes(logId) || progress.readLogIds.includes(logId)) return progress
  return { ...progress, readLogIds: [...progress.readLogIds, logId] }
}

export function markAllLogsRead(progress: StoryProgress): StoryProgress {
  const readLogIds = [...new Set([...progress.readLogIds, ...progress.recoveredLogIds])]
  if (readLogIds.length === progress.readLogIds.length) return progress
  return { ...progress, readLogIds }
}

export function setEnding(progress: StoryProgress, ending: EndingId): StoryProgress {
  if (!endingById(ending) || progress.ending === ending) return progress
  return { ...progress, ending }
}

export function chapterComplete(chapterId: ChapterId, completedStageIds: readonly string[]): boolean {
  const stages = allStagesForChapter(chapterId)
  return stages.length > 0 && stages.every((stageId) => completedStageIds.includes(stageId))
}

export function recoverLogsFromCompletedStages(
  progress: StoryProgress,
  completedStageIds: readonly string[],
): StoryProgress {
  let next = progress
  for (const chapter of CHAPTERS) {
    if (chapterComplete(chapter.id, completedStageIds)) {
      next = markLogRecovered(next, chapter.recordId)
    }
  }
  return next
}

export function completedChapterIds(completedStageIds: readonly string[]): ChapterId[] {
  return CHAPTERS.filter((chapter) => chapterComplete(chapter.id, completedStageIds)).map(
    (chapter) => chapter.id,
  )
}

export function unreadLogIds(progress: StoryProgress): string[] {
  return progress.recoveredLogIds.filter((id) => !progress.readLogIds.includes(id))
}

export function storyEnding(progress: StoryProgress) {
  return progress.ending ? endingById(progress.ending) : undefined
}
