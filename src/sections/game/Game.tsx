import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import LevelSelect from './LevelSelect.tsx'
import LevelView from './LevelView.tsx'
import type { LogMessage } from './Companion.tsx'
import BootOverlay from './BootOverlay.tsx'
import WinOverlay from './WinOverlay.tsx'
import { SHIP_SYSTEMS, stageById, stageBySection, systemById, systemForStage } from '../../game/ship.ts'
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
  stagesComplete,
  type CampaignProgress,
} from '../../game/campaign.ts'
import { TUTORIAL_SECTIONS } from '../../tutorial/index.ts'
import { isSectionComplete, loadProgress } from '../../tutorial/progress.ts'
import CrtOverlay from './CrtOverlay.tsx'

function repairedSectionsFromStorage(): string[] {
  const progress = loadProgress()
  return TUTORIAL_SECTIONS.filter((section) => isSectionComplete(progress, section)).map((section) => section.id)
}

export default function Game() {
  const [campaign, setCampaign] = useState<CampaignProgress>(() => loadCampaign())
  const [repairedSections, setRepairedSections] = useState<string[]>(() => repairedSectionsFromStorage())
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null)
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [bootOpen, setBootOpen] = useState(() => !campaign.introSeen)
  const [deckReveal, setDeckReveal] = useState(false)
  const [restoredStageIds, setRestoredStageIds] = useState<string[]>([])
  const [winOpen, setWinOpen] = useState(
    () => allSystemsOnline(repairedSections, campaign) && !campaign.victorySeen,
  )
  const deckRevealTimer = useRef<number | null>(null)
  const [messages, setMessages] = useState<LogMessage[]>(() => {
    if (!campaign.introSeen) return []

    const objective = nextObjective(repairedSections, campaign)
    return [
      {
        id: 1,
        speaker: 'MIRA',
        text: objective ? 'Repair authority resumed. The deck plan is yours.' : 'All systems holding. I am still listening.',
      },
    ]
  })
  const nextMessageId = useRef(10)
  const deckScreenOpen = activeSystemId === null

  // The deck blueprint and level view are different heights. Without this,
  // opening a relay keeps the old window offset and the level opens mid-page.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [deckScreenOpen])

  // Let a newly completed relay play its one-shot restore once the deck plan is visible again.
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

  const pushMessage = (text: string, tone?: LogMessage['tone']) => {
    setMessages((current) => [...current, { id: nextMessageId.current++, speaker: 'MIRA', text, ...(tone ? { tone } : {}) }])
  }

  const commitCampaign = (next: CampaignProgress) => {
    setCampaign(next)
    persistCampaign(next)
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

    const objective = nextObjective(repairedSections, next)
    if (objective) {
      pushMessage(
        `${objective.stage.code} // ${objective.stage.name}: ${objective.stage.brief}`,
        objective.phase === 'circuit' ? 'alert' : undefined,
      )
    } else {
      pushMessage('All systems are already holding. I kept the channel open.')
    }
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
    pushMessage(
      `${stage.code} // ${stage.name}: ${stage.brief}`,
      stage.kind === 'circuit' ? 'alert' : undefined,
    )
  }

  const handleSelectStage = (stageId: string) => {
    const stage = stageById(stageId)
    const system = systemForStage(stageId)
    if (!stage || !system || !isStageUnlocked(system, stage, repairedSections, campaign)) return

    if (deckScreenOpen) setRestoredStageIds([])

    setActiveSystemId(system.id)
    setActiveStageId(stage.id)
    pushMessage(
      `${stage.code} // ${stage.name}: ${stage.brief}`,
      stage.kind === 'circuit' ? 'alert' : undefined,
    )
  }

  const handleSectionComplete = (sectionId: string) => {
    if (repairedSections.includes(sectionId)) return
    const nextRepaired = [...repairedSections, sectionId]
    setRepairedSections((current) => (current.includes(sectionId) ? current : [...current, sectionId]))

    const stage = stageBySection(sectionId)
    const system = systemForStage(stage?.id ?? '')
    if (!stage || !system) return

    if (!stageComplete(stage, repairedSections, campaign) && stageComplete(stage, nextRepaired, campaign)) {
      markStageRestored(stage.id)
    }

    const index = system.stages.findIndex((candidate) => candidate.id === stage.id)
    const next = system.stages[index + 1]
    pushMessage(stage.restored, 'ok')

    if (next) pushMessage(`${next.code} // ${next.name} is mounted. ${next.brief}`)
  }

  const handleFirmwareComplete = (stageId: string) => {
    const stage = stageById(stageId)
    const system = systemForStage(stageId)
    if (!stage || !system || campaign.firmware.includes(stage.id)) return

    if (!stageComplete(stage, repairedSections, campaign)) {
      markStageRestored(stage.id)
    }

    const next = markFirmwareStage(campaign, stage.id)
    commitCampaign(next)
    pushMessage(stage.restored, 'ok')

    if (stagesComplete(system, repairedSections, next)) {
      pushMessage(system.restored, 'ok')
    }

    if (allSystemsOnline(repairedSections, next)) {
      pushMessage(
        `That is all ${SHIP_SYSTEMS.length} systems. The Meridian is holding.`,
        'ok',
      )
      setWinOpen(true)
      return
    }

    const index = system.stages.findIndex((candidate) => candidate.id === stage.id)
    const nextStage = system.stages[index + 1]
    if (nextStage) pushMessage(`${nextStage.code} // ${nextStage.name} is mounted. ${nextStage.brief}`)
  }

  const handleVictoryClose = () => {
    commitCampaign(markVictorySeen(campaign))
    setWinOpen(false)
    setActiveSystemId(null)
    setActiveStageId(null)
    revealDeck()
    pushMessage('I will keep the channel open.', 'ok')
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

  return (
    <div className={`mission-screen min-h-screen ${deckReveal ? 'is-deck-reveal' : ''} ${activeSystem ? '' : 'is-deck-screen'}`}>
      {activeSystem && activeStage && activeStatus && activeUnlocked ? (
        <LevelView
          system={activeSystem}
          stage={activeStage}
          stageIndex={activeStageIndex}
          stages={activeStatuses}
          completed={activeStatus.completed}
          progress={campaign}
          messages={messages}
          objective={objective}
          onBack={() => {
            setActiveSystemId(null)
            setActiveStageId(null)
          }}
          onSelectStage={handleSelectStage}
          onSectionComplete={handleSectionComplete}
          onFirmwareComplete={handleFirmwareComplete}
        />
      ) : (
        <LevelSelect
          statuses={statuses}
          objective={objective}
          restoredStageIds={restoredStageIds}
          onSelectSystem={handleOpenSystem}
          onSelectStage={handleSelectStage}
        />
      )}

      {bootOpen && <BootOverlay onBegin={handleBegin} />}
      {winOpen && <WinOverlay onClose={handleVictoryClose} />}
      <CrtOverlay />
    </div>
  )
}
