import type { StorageLike } from '../game/library.ts'
import type { TutorialProgress, TutorialSection } from './types.ts'

export const PROGRESS_KEY = 'csc3501.tutorial.v1'

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isStepId = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 120

function defaultStorage(): StorageLike | undefined {
  try {
    const storage = globalThis.localStorage as StorageLike | undefined
    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function' ? storage : undefined
  } catch {
    return undefined
  }
}

export function parseProgress(raw: string | null): TutorialProgress {
  if (!raw) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!isObject(parsed)) return {}

  const progress: TutorialProgress = {}
  for (const [sectionId, value] of Object.entries(parsed)) {
    if (!sectionId || !isObject(value)) continue

    const completed = Array.isArray(value.completed) ? [...new Set(value.completed.filter(isStepId))] : []
    progress[sectionId] = {
      completed,
      ...(typeof value.finishedAt === 'number' && Number.isFinite(value.finishedAt)
        ? { finishedAt: value.finishedAt }
        : {}),
    }
  }
  return progress
}

export function loadProgress(storage: StorageLike | undefined = defaultStorage()): TutorialProgress {
  return parseProgress(storage?.getItem(PROGRESS_KEY) ?? null)
}

export function persistProgress(
  progress: TutorialProgress,
  storage: StorageLike | undefined = defaultStorage(),
): void {
  if (!storage) return
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {}
}

export function isStepComplete(progress: TutorialProgress, sectionId: string, stepId: string): boolean {
  return progress[sectionId]?.completed.includes(stepId) ?? false
}

export function markStepComplete(
  progress: TutorialProgress,
  section: TutorialSection,
  stepId: string,
): TutorialProgress {
  const known = progress[section.id]?.completed ?? []
  const completed = known.includes(stepId) ? known : [...known, stepId]
  const finished = section.steps.length > 0 && section.steps.every((step) => completed.includes(step.id))

  return {
    ...progress,
    [section.id]: {
      completed,
      ...(finished ? { finishedAt: progress[section.id]?.finishedAt ?? Date.now() } : {}),
    },
  }
}

export function resetSection(progress: TutorialProgress, sectionId: string): TutorialProgress {
  const next = { ...progress }
  delete next[sectionId]
  return next
}

export function isSectionComplete(progress: TutorialProgress, section: TutorialSection): boolean {
  const completed = progress[section.id]?.completed ?? []
  return section.steps.length > 0 && section.steps.every((step) => completed.includes(step.id))
}

export function firstIncompleteStep(section: TutorialSection, progress: TutorialProgress): number {
  const completed = progress[section.id]?.completed ?? []
  const index = section.steps.findIndex((step) => !completed.includes(step.id))
  return index === -1 ? Math.max(0, section.steps.length - 1) : index
}

export function nextIncompleteSection(
  sections: readonly TutorialSection[],
  progress: TutorialProgress,
): TutorialSection | undefined {
  return sections.find((section) => section.steps.length > 0 && !isSectionComplete(progress, section))
}
