import { ALL_STAGES, SHIP_SYSTEMS, type ShipSystem, type SystemStage } from './ship.ts'
import type { StorageLike } from './library.ts'

export const CAMPAIGN_KEY = 'csc3501.campaign.v1'

export interface CampaignProgress {
  /** IDs of completed firmware stages. Circuit stages live in tutorial progress. */
  firmware: string[]
  introSeen: boolean
  victorySeen: boolean
}

export type SystemPhase = 'circuit' | 'firmware' | 'online'

export interface Objective {
  system: ShipSystem
  stage: SystemStage
  stageIndex: number
  phase: 'circuit' | 'firmware'
}

export interface StageStatus {
  stage: SystemStage
  index: number
  completed: boolean
  unlocked: boolean
}

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const firmwareStageIds = new Set(
  ALL_STAGES.filter((stage) => stage.kind === 'firmware').map((stage) => stage.id),
)

const legacySystemFirmware = new Map(
  SHIP_SYSTEMS.map((system) => [
    system.id,
    system.stages.find((stage) => stage.kind === 'firmware')?.id,
  ]),
)

export const EMPTY_CAMPAIGN: CampaignProgress = { firmware: [], introSeen: false, victorySeen: false }

function defaultStorage(): StorageLike | undefined {
  try {
    const storage = globalThis.localStorage as StorageLike | undefined
    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function' ? storage : undefined
  } catch {
    return undefined
  }
}

export function parseCampaign(raw: string | null): CampaignProgress {
  if (!raw) return { ...EMPTY_CAMPAIGN, firmware: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ...EMPTY_CAMPAIGN, firmware: [] }
  }
  if (!isObject(parsed)) return { ...EMPTY_CAMPAIGN, firmware: [] }

  const firmware: string[] = []
  if (Array.isArray(parsed.firmware)) {
    for (const value of parsed.firmware) {
      if (typeof value !== 'string') continue
      if (firmwareStageIds.has(value)) {
        firmware.push(value)
        continue
      }

      // Saves from the first campaign stored one firmware id per main system.
      const migrated = legacySystemFirmware.get(value)
      if (migrated) firmware.push(migrated)
    }
  }

  return {
    firmware: [...new Set(firmware)],
    introSeen: parsed.introSeen === true,
    victorySeen: parsed.victorySeen === true,
  }
}

export function loadCampaign(storage: StorageLike | undefined = defaultStorage()): CampaignProgress {
  if (!storage) return { ...EMPTY_CAMPAIGN, firmware: [] }
  try {
    return parseCampaign(storage.getItem(CAMPAIGN_KEY))
  } catch {
    return { ...EMPTY_CAMPAIGN, firmware: [] }
  }
}

export function persistCampaign(progress: CampaignProgress, storage: StorageLike | undefined = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(CAMPAIGN_KEY, JSON.stringify(progress))
  } catch {}
}

export function stageComplete(
  stage: SystemStage,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): boolean {
  if (stage.kind === 'circuit') return !!stage.sectionId && repairedSections.includes(stage.sectionId)
  return progress.firmware.includes(stage.id)
}

export function stagesComplete(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): boolean {
  return system.stages.every((stage) => stageComplete(stage, repairedSections, progress))
}

export function stageCount(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): number {
  return system.stages.filter((stage) => stageComplete(stage, repairedSections, progress)).length
}

export function nextStage(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): SystemStage | undefined {
  return system.stages.find((stage) => !stageComplete(stage, repairedSections, progress))
}

export function stageStatuses(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): StageStatus[] {
  const systemOpen = isSystemUnlocked(system, repairedSections, progress)
  let previousDone = true

  return system.stages.map((stage, index) => {
    const completed = stageComplete(stage, repairedSections, progress)
    const unlocked = systemOpen && (completed || previousDone)
    previousDone = previousDone && completed
    return { stage, index, completed, unlocked }
  })
}

export function markFirmwareStage(progress: CampaignProgress, stageId: string): CampaignProgress {
  if (progress.firmware.includes(stageId)) return progress
  return { ...progress, firmware: [...progress.firmware, stageId] }
}

export function markIntroSeen(progress: CampaignProgress): CampaignProgress {
  return progress.introSeen ? progress : { ...progress, introSeen: true }
}

export function markVictorySeen(progress: CampaignProgress): CampaignProgress {
  return progress.victorySeen ? progress : { ...progress, victorySeen: true }
}

export function phaseFor(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): SystemPhase {
  return nextStage(system, repairedSections, progress)?.kind ?? 'online'
}

export function isSystemUnlocked(
  system: ShipSystem,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): boolean {
  const index = SHIP_SYSTEMS.findIndex((candidate) => candidate.id === system.id)
  if (index < 0) return false

  const ownProgress = system.stages.some((stage) => stageComplete(stage, repairedSections, progress))
  if (ownProgress) return true
  if (index === 0) return true

  return stagesComplete(SHIP_SYSTEMS[index - 1], repairedSections, progress)
}

export function isStageUnlocked(
  system: ShipSystem,
  stage: SystemStage,
  repairedSections: readonly string[],
  progress: CampaignProgress,
): boolean {
  if (!isSystemUnlocked(system, repairedSections, progress)) return false
  const index = system.stages.findIndex((candidate) => candidate.id === stage.id)
  if (index < 0) return false
  if (stageComplete(stage, repairedSections, progress)) return true

  return system.stages.slice(0, index).every((candidate) => stageComplete(candidate, repairedSections, progress))
}

export function onlineCount(repairedSections: readonly string[], progress: CampaignProgress): number {
  return SHIP_SYSTEMS.filter((system) => stagesComplete(system, repairedSections, progress)).length
}

export function allSystemsOnline(repairedSections: readonly string[], progress: CampaignProgress): boolean {
  return onlineCount(repairedSections, progress) === SHIP_SYSTEMS.length
}

export function nextObjective(repairedSections: readonly string[], progress: CampaignProgress): Objective | null {
  for (const system of SHIP_SYSTEMS) {
    const index = system.stages.findIndex((stage) => !stageComplete(stage, repairedSections, progress))
    if (index >= 0) {
      const stage = system.stages[index]
      return { system, stage, stageIndex: index, phase: stage.kind }
    }
  }
  return null
}
