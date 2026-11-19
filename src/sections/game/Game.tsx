import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import LevelSelect from './LevelSelect.tsx'
import LevelView from './LevelView.tsx'
import FieldManual, { type ManualTab } from './FieldManual.tsx'
import BootOverlay from './BootOverlay.tsx'
import TestResetButton from './TestResetButton.tsx'
import CrtOverlay from './CrtOverlay.tsx'
import RecordOverlay from './RecordOverlay.tsx'
import ShipLogOverlay from './ShipLogOverlay.tsx'
import EndingOverlay from './EndingOverlay.tsx'
import TransmissionToast from './TransmissionToast.tsx'
import type { LogMessage } from './Companion.tsx'
import { ALL_STAGES, SHIP_SYSTEMS, stageById, stageBySection, systemById, systemForStage } from '../../game/ship.ts'
import {
  allSystemsOnline,
  isStageUnlocked,
  isSystemUnlocked,
  loadCampaign,
  markFirmwareStage,
  markIntroSeen,
  markVictorySeen,
  nextObjective,
  persistCampaign,
  phaseFor,
  stageComplete,
  stageCount,
  stageStatuses,
  type CampaignProgress,
} from '../../game/campaign.ts'
import {
  STORY_BEATS,
  beatById,
  chapterById,
  chapterForStageId,
  chapterRecord,
  chapterTurnBeat,
  stageCompleteBeat,
  stageFirstFailBeat,
  stageOpenBeat,
  type EndingId,
  type LogFragment,
  type StoryBeat,
} from '../../game/narrative.ts'
import {
  chapterComplete,
  hasRecoveredLog,
  loadStory,
  markAllLogsRead,
  markBeatSeen,
  markLogRead,
  markLogRecovered,
  persistStory,
  recoverLogsFromCompletedStages,
  setEnding,
  storyEnding,
  unreadLogIds,
  type StoryProgress,
} from '../../game/story.ts'
import { TUTORIAL_SECTIONS } from '../../tutorial/index.ts'
import { isSectionComplete, loadProgress } from '../../tutorial/progress.ts'

const MANUAL_CUE_KEY = 'csc3501.manualCue.v1'

function manualCuePending(): boolean {
  try {
    return localStorage.getItem(MANUAL_CUE_KEY) !== 'seen'
  } catch {
    return true
  }
}

function repairedSectionsFromStorage(): string[] {
  const progress = loadProgress()
  return TUTORIAL_SECTIONS.filter((section) => isSectionComplete(progress, section)).map((section) => section.id)
}

function completedStageIds(
  repairedSections: readonly string[],
  campaign: CampaignProgress,
): string[] {
  return ALL_STAGES.filter((stage) => stageComplete(stage, repairedSections, campaign)).map(
    (stage) => stage.id,
  )
}

function initialStory(): StoryProgress {
  const campaign = loadCampaign()
  const repairedSections = repairedSectionsFromStorage()
  return recoverLogsFromCompletedStages(
    loadStory(),
    completedStageIds(repairedSections, campaign),
  )
}

// Transmissions are not persisted one by one; the seen beat list is. Rebuild
// the channel from it so a reload never empties MIRA's side of the story.
function seedMessages(story: StoryProgress): LogMessage[] {
  return STORY_BEATS.filter(
    (beat) => beat.trigger !== 'chapter-complete' && story.seenBeatIds.includes(beat.id),
  ).map((beat, index) => ({
    id: index + 1,
    speaker: beat.speaker,
    text: beat.text,
    tone: beat.tone,
    chapterId: beat.chapterId,
  }))
}

export default function Game() {
  const [campaign, setCampaign] = useState<CampaignProgress>(() => loadCampaign())
  const [repairedSections, setRepairedSections] = useState<string[]>(() => repairedSectionsFromStorage())
  const [story, setStory] = useState<StoryProgress>(initialStory)
  const [manual, setManual] = useState<{ tab: ManualTab; section?: string } | null>(null)
  const [manualCue, setManualCue] = useState(manualCuePending)
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null)
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [bootOpen, setBootOpen] = useState(() => !campaign.introSeen)
  const [deckReveal, setDeckReveal] = useState(false)
  const [restoredStageIds, setRestoredStageIds] = useState<string[]>([])
  const [messages, setMessages] = useState<LogMessage[]>(() => seedMessages(story))
  const [transmission, setTransmission] = useState<LogMessage | null>(null)
  const [record, setRecord] = useState<LogFragment | null>(null)
  const [logOpen, setLogOpen] = useState(false)
  const deckRevealTimer = useRef<number | null>(null)
  const messageId = useRef(messages.length)
  const storyRef = useRef(story)
  const deckScreenOpen = activeSystemId === null
  const openingRecordTurn = record ? chapterTurnBeat(record.chapterId) : undefined

  // The deck blueprint and level view are different heights. Without this,
  // opening a relay keeps the old window offset and the level opens mid-page.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [deckScreenOpen])

  // Let a newly completed relay play its one-shot restore once the deck plan is visible again.
  useEffect(() => {
    storyRef.current = story
  }, [story])

  useEffect(() => {
    if (!deckScreenOpen || restoredStageIds.length === 0) return
    const timer = window.setTimeout(() => setRestoredStageIds([]), 1000)
    return () => window.clearTimeout(timer)
  }, [deckScreenOpen, restoredStageIds])

  const markStageRestored = (stageId: string) => {
    setRestoredStageIds((current) =>
      current.includes(stageId) ? current : [...current, stageId],
    )
  }

  const commitCampaign = (next: CampaignProgress) => {
    setCampaign(next)
    persistCampaign(next)
  }

  const commitStory = (next: StoryProgress) => {
    if (next === storyRef.current) return
    storyRef.current = next
    setStory(next)
    persistStory(next)
  }

  const revealBeat = (beat: StoryBeat | undefined) => {
    if (!beat || storyRef.current.seenBeatIds.includes(beat.id)) return
    commitStory(markBeatSeen(storyRef.current, beat.id))
    messageId.current += 1
    const message: LogMessage = {
      id: messageId.current,
      speaker: beat.speaker,
      text: beat.text,
      tone: beat.tone,
      chapterId: beat.chapterId,
    }
    setMessages((current) => [...current, message])
    // The deck feed already carries stage open/complete lines. Only a first
    // failure interrupts the player while they are heads-down in the puzzle.
    if (beat.trigger === 'first-fail') setTransmission(message)
  }

  const dismissTransmission = useCallback(() => setTransmission(null), [])

  const dismissManualCue = useCallback(() => {
    setManualCue(false)
    try {
      localStorage.setItem(MANUAL_CUE_KEY, 'seen')
    } catch {}
  }, [])

  const openManual = useCallback(
    (tab: ManualTab, section?: string) => {
      setManual({ tab, section })
      dismissManualCue()
    },
    [dismissManualCue],
  )

  const handleStageOpen = (stageId: string) => {
    revealBeat(stageOpenBeat(stageId))
  }

  const handleFirstFail = (stageId: string) => {
    revealBeat(stageFirstFailBeat(stageId))
  }

  const handleStageStoryComplete = (
    stageId: string,
    repaired: readonly string[],
    nextCampaign: CampaignProgress,
  ) => {
    revealBeat(stageCompleteBeat(stageId))

    const chapter = chapterForStageId(stageId)
    if (!chapter) return
    const completed = completedStageIds(repaired, nextCampaign)
    if (!chapterComplete(chapter.id, completed)) return

    const recovered = chapterRecord(chapter.id)
    const turn = chapterTurnBeat(chapter.id)
    if (recovered && !hasRecoveredLog(storyRef.current, recovered.id)) {
      commitStory(markLogRecovered(storyRef.current, recovered.id))
      setRecord(recovered)
    }
    revealBeat(turn)
  }

  const revealDeck = () => {
    setDeckReveal(true)
    if (deckRevealTimer.current !== null) window.clearTimeout(deckRevealTimer.current)
    deckRevealTimer.current = window.setTimeout(() => {
      setDeckReveal(false)
      deckRevealTimer.current = null
    }, 1200)
  }

  const handleBegin = () => {
    const next = markIntroSeen(campaign)
    commitCampaign(next)
    setBootOpen(false)
    revealDeck()
  }

  const handleOpenSystem = (systemId: string) => {
    const system = systemById(systemId)
    if (!system || !isSystemUnlocked(system, repairedSections, campaign)) return

    // Leaving the deck plan ends any restore that was already on screen.
    if (deckScreenOpen) setRestoredStageIds([])

    const statuses = stageStatuses(system, repairedSections, campaign)
    const stage = statuses.find((status) => !status.completed && status.unlocked)?.stage ?? system.stages[system.stages.length - 1]
    setActiveSystemId(system.id)
    setActiveStageId(stage.id)
  }

  const handleSelectStage = (stageId: string) => {
    const stage = stageById(stageId)
    const system = systemForStage(stageId)
    if (!stage || !system || !isStageUnlocked(system, stage, repairedSections, campaign)) return

    if (deckScreenOpen) setRestoredStageIds([])

    setActiveSystemId(system.id)
    setActiveStageId(stage.id)
  }

  const handleSectionComplete = (sectionId: string) => {
    const stage = stageBySection(sectionId)
    if (!stage) return

    const alreadyRepaired = repairedSections.includes(sectionId)
    const nextRepaired = alreadyRepaired ? repairedSections : [...repairedSections, sectionId]

    if (!alreadyRepaired) {
      setRepairedSections(nextRepaired)

      if (!stageComplete(stage, repairedSections, campaign) && stageComplete(stage, nextRepaired, campaign)) {
        markStageRestored(stage.id)
      }
    }

    if (!alreadyRepaired && stageComplete(stage, nextRepaired, campaign)) {
      handleStageStoryComplete(stage.id, nextRepaired, campaign)
    }
  }

  const handleFirmwareComplete = (stageId: string) => {
    const stage = stageById(stageId)
    const system = systemForStage(stageId)
    if (!stage || !system || campaign.firmware.includes(stage.id)) return

    const wasComplete = stageComplete(stage, repairedSections, campaign)
    const next = markFirmwareStage(campaign, stage.id)
    commitCampaign(next)

    if (!wasComplete && stageComplete(stage, repairedSections, next)) {
      markStageRestored(stage.id)
      handleStageStoryComplete(stage.id, repairedSections, next)
    }
  }

  const handleRecordClose = () => {
    if (record) commitStory(markLogRead(storyRef.current, record.id))
    setRecord(null)
  }

  const handleChooseEnding = (ending: EndingId) => {
    commitStory(setEnding(storyRef.current, ending))
    commitCampaign(markVictorySeen(campaign))
    setActiveSystemId(null)
    setActiveStageId(null)
    revealDeck()
  }

  const handleCloseLog = () => {
    commitStory(markAllLogsRead(storyRef.current))
    setLogOpen(false)
  }

  const statuses = SHIP_SYSTEMS.map((system) => {
    const stages = stageStatuses(system, repairedSections, campaign)
    return {
      system,
      phase: phaseFor(system, repairedSections, campaign),
      unlocked: isSystemUnlocked(system, repairedSections, campaign),
      completed: stageCount(system, repairedSections, campaign),
      total: system.stages.length,
      stages,
    }
  })
  const objective = nextObjective(repairedSections, campaign)
  const activeSystem = activeSystemId ? systemById(activeSystemId) : null
  const activeStage = activeStageId ? stageById(activeStageId) : null
  const activeStatuses = activeSystem ? stageStatuses(activeSystem, repairedSections, campaign) : []
  const activeStatus = activeStatuses.find((status) => status.stage.id === activeStage?.id)
  const activeStageIndex = activeStatuses.findIndex((status) => status.stage.id === activeStage?.id)
  const activeUnlocked =
    activeSystem && activeStage ? isStageUnlocked(activeSystem, activeStage, repairedSections, campaign) : false
  const logUnreadCount = unreadLogIds(story).length
  const endingReady =
    !story.ending &&
    !bootOpen &&
    !record &&
    !logOpen &&
    allSystemsOnline(repairedSections, campaign)
  const deckChapter = objective ? chapterForStageId(objective.stage.id) ?? null : null
  const levelChapter = activeStage ? chapterForStageId(activeStage.id) ?? null : null
  const latestMira = [...messages].reverse().find((message) => message.speaker === 'MIRA')
  const chapterMira = deckChapter
    ? [...messages]
        .reverse()
        .find((message) => message.speaker === 'MIRA' && message.chapterId === deckChapter.id)
    : undefined
  const openingBeat = deckChapter ? beatById(deckChapter.openingBeatId) : undefined
  const deckMessage: LogMessage | null =
    chapterMira ??
    (openingBeat
      ? {
          id: -1,
          speaker: 'MIRA',
          text: openingBeat.text,
          chapterId: openingBeat.chapterId,
        }
      : latestMira ?? null)

  return (
    <div className={`mission-screen min-h-screen ${deckReveal ? 'is-deck-reveal' : ''} ${activeSystem ? 'is-level-screen' : 'is-deck-screen'}`}>
      {activeSystem && activeStage && activeStatus && activeUnlocked ? (
        <LevelView
          stage={activeStage}
          stageIndex={activeStageIndex}
          stages={activeStatuses}
          completed={activeStatus.completed}
          chapter={levelChapter}
          manualOpen={manual !== null}
          onOpenManual={openManual}
          onBack={() => {
            setActiveSystemId(null)
            setActiveStageId(null)
          }}
          onSelectStage={handleSelectStage}
          onSectionComplete={handleSectionComplete}
          onFirmwareComplete={handleFirmwareComplete}
          onStageOpen={handleStageOpen}
          onFirstFail={handleFirstFail}
        />
      ) : (
        <LevelSelect
          statuses={statuses}
          objective={objective}
          restoredStageIds={restoredStageIds}
          chapter={deckChapter}
          messages={deckMessage ? [deckMessage] : []}
          logUnreadCount={logUnreadCount}
          logRecoveredCount={story.recoveredLogIds.length}
          onOpenLog={() => setLogOpen(true)}
          onOpenManual={() => openManual('code')}
          showManualCue={manualCue && !bootOpen}
          onDismissManualCue={dismissManualCue}
          onSelectSystem={handleOpenSystem}
          onSelectStage={handleSelectStage}
        />
      )}

      {/* TEMPORARY: remove with TestResetButton after playtesting. Kept off the
          mission surface so it cannot overlap the console or be hit by accident. */}
      {!activeSystem && <TestResetButton />}

      {bootOpen && (
        <BootOverlay
          onBegin={handleBegin}
          onOpenManual={() => openManual('code')}
          showManualCue={manualCue}
        />
      )}
      {record && (
        <RecordOverlay
          record={record}
          turn={openingRecordTurn}
          onClose={handleRecordClose}
        />
      )}
      {logOpen && (
        <ShipLogOverlay
          story={story}
          messages={messages}
          objective={objective}
          onClose={handleCloseLog}
          onReadLog={(logId) => commitStory(markLogRead(storyRef.current, logId))}
        />
      )}
      {endingReady && (
        <EndingOverlay
          savedEnding={storyEnding(story) ?? null}
          onChoose={handleChooseEnding}
        />
      )}
      {transmission && !record && !logOpen && (
        <TransmissionToast
          message={transmission}
          chapter={transmission.chapterId ? chapterById(transmission.chapterId) ?? null : null}
          onDismiss={dismissTransmission}
        />
      )}
      {!activeSystem && <CrtOverlay />}
      {manual && (
        <FieldManual
          initialTab={manual.tab}
          initialSection={manual.section}
          onClose={() => setManual(null)}
        />
      )}
    </div>
  )
}
