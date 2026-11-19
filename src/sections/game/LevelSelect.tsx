import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Objective, StageStatus, SystemPhase } from '../../game/campaign.ts'
import type { Chapter } from '../../game/narrative.ts'
import { SHIP_NAME, type ShipSystem } from '../../game/ship.ts'
import ShipBlueprint from './ShipBlueprint.tsx'
import MiraChannel from './MiraChannel.tsx'
import type { LogMessage } from './Companion.tsx'

interface SystemStatus {
  system: ShipSystem
  phase: SystemPhase
  unlocked: boolean
  completed: number
  total: number
  stages: StageStatus[]
}

interface LevelSelectProps {
  statuses: SystemStatus[]
  objective: Objective | null
  restoredStageIds: readonly string[]
  chapter: Chapter | null
  messages: LogMessage[]
  logUnreadCount: number
  logRecoveredCount: number
  onOpenLog: () => void
  onOpenManual: () => void
  showManualCue: boolean
  onDismissManualCue: () => void
  onSelectSystem: (systemId: string) => void
  onSelectStage: (stageId: string) => void
}

type StationSide = 'left' | 'right'

const pad = (value: number) => String(value).padStart(2, '0')

function relayState(stageStatus: StageStatus, objective: Objective | null): string {
  if (stageStatus.completed) return 'is-done'
  if (!stageStatus.unlocked) return 'is-locked'
  if (objective?.stage.id === stageStatus.stage.id) return 'is-current'
  return 'is-ready'
}

function relayStatusLabel(stageStatus: StageStatus, objective: Objective | null): string {
  if (stageStatus.completed) return 'online'
  if (!stageStatus.unlocked) return 'sealed'
  if (objective?.stage.id === stageStatus.stage.id) return 'next relay'
  return 'ready'
}

function firstActionableStage(status: SystemStatus): StageStatus | undefined {
  return (
    status.stages.find((stageStatus) => !stageStatus.completed && stageStatus.unlocked) ??
    status.stages[status.stages.length - 1]
  )
}

interface RelayStationProps {
  status: SystemStatus
  index: number
  objective: Objective | null
  hovered: boolean
  restoredStageIds: readonly string[]
  jumpPulse: { stageId: string; token: number } | null
  onSelectSystem: (systemId: string) => void
  onSelectStage: (stageId: string) => void
  onHover: (index: number | null) => void
}

function RelayStation({
  status,
  index,
  objective,
  hovered,
  restoredStageIds,
  jumpPulse,
  onSelectSystem,
  onSelectStage,
  onHover,
}: RelayStationProps) {
  const side: StationSide = index % 2 === 0 ? 'left' : 'right'
  const isPriority = objective?.system.id === status.system.id
  const isOnline = status.completed === status.total
  const nextStage = firstActionableStage(status)
  const isCoreRestoring = status.stages.some(
    (stageStatus) => stageStatus.completed && restoredStageIds.includes(stageStatus.stage.id),
  )
  const stationState = isOnline ? 'ONLINE' : !status.unlocked ? 'SEALED' : isPriority ? 'NEXT' : 'STANDBY'
  const stationClass = [
    'relay-station',
    `is-${side}`,
    isPriority ? 'is-priority' : '',
    isOnline ? 'is-online' : '',
    !status.unlocked ? 'is-sealed' : '',
    hovered ? 'is-hovered' : '',
    isCoreRestoring ? 'is-core-restoring' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={stationClass}
      style={{ '--station-row': index } as CSSProperties}
      data-deck-index={index}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onHover(null)
      }}
      role="group"
      aria-label={`${status.system.code} ${status.system.name}, ${status.completed} of ${status.total} relays`}
    >
      <div className="relay-float">
        <div className="relay-station-head">
          <span className="relay-station-index">DECK {pad(index + 1)}</span>
          <span className="relay-station-state">{stationState}</span>
        </div>

        <button
          type="button"
          className={`relay-core ${isPriority ? 'is-priority' : ''}`}
          disabled={!status.unlocked}
          onClick={() => onSelectSystem(status.system.id)}
          aria-label={
            status.unlocked
              ? `Open the next relay for ${status.system.name}`
              : `${status.system.name} is sealed`
          }
          title={
            status.unlocked
              ? `${status.system.code} // ${nextStage?.stage.name ?? status.system.name}`
              : `${status.system.name} // sealed`
          }
        >
          <span className="relay-core-code">{status.system.code}</span>
          <span className="relay-core-meta">
            {status.completed}/{status.total}
          </span>
        </button>

        <div className="relay-chain">
          {status.stages.map((stageStatus, stageIndex) => {
            const isCurrent = objective?.stage.id === stageStatus.stage.id
            const state = relayState(stageStatus, objective)
            const isRestoring = stageStatus.completed && restoredStageIds.includes(stageStatus.stage.id)
            const statusLabel = relayStatusLabel(stageStatus, objective)
            const nodeLabel = pad(stageIndex + 1)

            return (
              <button
                key={stageStatus.stage.id}
                type="button"
                className={`relay-node ${state}${isRestoring ? ' is-restoring' : ''}`}
                data-label={nodeLabel}
                data-stage-id={stageStatus.stage.id}
                style={{ '--node-index': stageIndex } as CSSProperties}
                disabled={!stageStatus.unlocked}
                onClick={() => onSelectStage(stageStatus.stage.id)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${status.system.code} relay ${nodeLabel}, ${stageStatus.stage.name}, ${statusLabel}`}
                title={`${stageStatus.stage.code} // ${stageStatus.stage.name}`}
              >
                {nodeLabel}
                {jumpPulse?.stageId === stageStatus.stage.id && (
                  <span
                    key={jumpPulse.token}
                    className="relay-node-jump-pulse"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        <span className="relay-station-name">{status.system.name}</span>
        <span className="relay-socket" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function LevelSelect({
  statuses,
  objective,
  restoredStageIds,
  chapter,
  messages,
  logUnreadCount,
  logRecoveredCount,
  onOpenLog,
  onOpenManual,
  showManualCue,
  onDismissManualCue,
  onSelectSystem,
  onSelectStage,
}: LevelSelectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [jumpPulse, setJumpPulse] = useState<{ stageId: string; token: number } | null>(null)
  const jumpPulseToken = useRef(0)
  const jumpPulseTimer = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeIndex = objective
    ? statuses.findIndex((status) => status.system.id === objective.system.id)
    : -1
  const currentRailStatus = statuses[scrollIndex] ?? statuses[0]
  const nextUnfinishedStage = currentRailStatus?.stages.find((stageStatus) => !stageStatus.completed)
  const restoredInReadout =
    currentRailStatus?.stages.some(
      (stageStatus) => stageStatus.completed && restoredStageIds.includes(stageStatus.stage.id),
    ) ?? false
  const chapterStatus = chapter
    ? statuses.find((status) => status.system.id === chapter.systemId)
    : undefined

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const stations = stageRef.current?.querySelectorAll<HTMLElement>('.relay-station')
      if (!stations?.length) return

      const focalLine = window.innerHeight * 0.38
      let bestIndex = 0
      let bestDistance = Number.POSITIVE_INFINITY

      stations.forEach((station, index) => {
        const rect = station.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - focalLine)
        if (distance < bestDistance) {
          bestDistance = distance
          bestIndex = index
        }
      })

      setScrollIndex(bestIndex)
    }

    const schedule = () => {
      if (!frame) {
        frame = window.setTimeout(() => {
          frame = 0
          update()
        }, 16)
      }
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.clearTimeout(frame)
    }
  }, [statuses.length])

  useEffect(
    () => () => {
      if (jumpPulseTimer.current !== null) window.clearTimeout(jumpPulseTimer.current)
    },
    [],
  )

  const jumpToDeck = (index: number) => {
    const station = stageRef.current?.querySelector<HTMLElement>(
      `.relay-station[data-deck-index="${index}"]`,
    )
    if (!station) return

    setScrollIndex(index)

    const rect = station.getBoundingClientRect()
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canAnimate = !reducedMotion && document.visibilityState === 'visible'

    window.scrollTo({
      top: Math.max(0, top),
      behavior: canAnimate ? 'smooth' : 'auto',
    })
  }

  const jumpToNextSection = () => {
    if (!nextUnfinishedStage) return

    const targetStageId = nextUnfinishedStage.stage.id

    const node = stageRef.current?.querySelector<HTMLButtonElement>(
      `.relay-node[data-stage-id="${targetStageId}"]`,
    )
    if (!node) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canAnimate = !reducedMotion && document.visibilityState === 'visible'

    node.scrollIntoView({ behavior: canAnimate ? 'smooth' : 'auto', block: 'center' })
    if (!node.disabled) node.focus({ preventScroll: true })

    if (reducedMotion) return

    if (jumpPulseTimer.current !== null) window.clearTimeout(jumpPulseTimer.current)
    const token = jumpPulseToken.current + 1
    jumpPulseToken.current = token
    setJumpPulse({ stageId: targetStageId, token })
    jumpPulseTimer.current = window.setTimeout(() => {
      setJumpPulse(null)
      jumpPulseTimer.current = null
    }, 850)
  }

  return (
    <div className="deck-select">
      <h1 className="sr-only">{SHIP_NAME} deck select</h1>
      <MiraChannel
        chapter={chapter}
        message={messages.length > 0 ? messages[messages.length - 1] : null}
        completed={chapterStatus?.completed ?? 0}
        total={chapterStatus?.total ?? 0}
        recovered={logRecoveredCount}
        unreadCount={logUnreadCount}
        onOpenLog={onOpenLog}
      />
      <div
        className="deck-stage"
        ref={stageRef}
        role="group"
        aria-label={`${SHIP_NAME} deck schematic. Each deck has a chain of numbered relays.`}
      >
        <ShipBlueprint
          objectiveIndex={activeIndex}
          hoveredIndex={hoveredIndex}
          onHoverConnection={setHoveredIndex}
        />
        <div className="deck-callouts">
          {statuses.map((status, index) => (
            <RelayStation
              key={status.system.id}
              status={status}
              index={index}
              objective={objective}
              hovered={hoveredIndex === index}
              restoredStageIds={restoredStageIds}
              jumpPulse={jumpPulse}
              onSelectSystem={onSelectSystem}
              onSelectStage={onSelectStage}
              onHover={setHoveredIndex}
            />
          ))}
        </div>
      </div>

      <nav className="deck-jump-rail" aria-label="Jump to deck">
        {currentRailStatus && (
          <div
            className={`deck-jump-readout ${scrollIndex === activeIndex ? 'is-priority' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="deck-jump-readout-deck">{currentRailStatus.system.deck}</span>
            <span className="deck-jump-readout-main">
              <span className="deck-jump-readout-name">{currentRailStatus.system.name}</span>
              <button
                type="button"
                className="deck-jump-readout-progress"
                aria-label={
                  nextUnfinishedStage
                    ? `${currentRailStatus.completed} of ${currentRailStatus.total} sections complete. Jump to ${nextUnfinishedStage.stage.name}.`
                    : `${currentRailStatus.completed} of ${currentRailStatus.total} sections complete.`
                }
                disabled={!nextUnfinishedStage}
                onClick={jumpToNextSection}
                title={
                  nextUnfinishedStage
                    ? `Jump to ${nextUnfinishedStage.stage.name}`
                    : 'All sections complete'
                }
              >
                <span className="deck-jump-readout-label">Sections</span>
                <span className={`deck-jump-readout-count${restoredInReadout ? ' is-restoring' : ''}`}>
                  {currentRailStatus.completed}/{currentRailStatus.total}
                </span>
                <span className="deck-jump-readout-bars" aria-hidden="true">
                  {currentRailStatus.stages.map((stageStatus) => {
                    const filled = stageStatus.completed
                    const isRestoring = filled && restoredStageIds.includes(stageStatus.stage.id)

                    return (
                      <span
                        key={stageStatus.stage.id}
                        className={`deck-jump-readout-bar${filled ? ' is-filled' : ''}${isRestoring ? ' is-restoring' : ''}`}
                      />
                    )
                  })}
                </span>
              </button>
            </span>
          </div>
        )}

        <div className="deck-jump-list">
          {statuses.map((status, index) => {
            const isRestoring = status.stages.some(
              (stageStatus) => stageStatus.completed && restoredStageIds.includes(stageStatus.stage.id),
            )
            const buttonClass = [
              'deck-jump-button',
              index === scrollIndex ? 'is-current' : '',
              index === activeIndex ? 'is-priority' : '',
              status.completed === status.total ? 'is-complete' : '',
              !status.unlocked ? 'is-sealed' : '',
              isRestoring ? 'is-restoring' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={status.system.id}
                type="button"
                className={buttonClass}
                onClick={() => jumpToDeck(index)}
                aria-current={index === scrollIndex ? 'true' : undefined}
                aria-label={`Jump to ${status.system.name} deck, ${status.completed} of ${status.total} relays`}
                title={`${status.system.name} // ${status.completed} of ${status.total} relays`}
              >
                <span className="deck-jump-code">{status.system.code}</span>
                <span className="deck-jump-dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </nav>

      <div className="deck-manual-tools">
        {showManualCue && (
          <aside className="deck-manual-cue" aria-label="Field manual introduction">
            <div className="deck-manual-cue-head">
              <span>New reference</span>
              <button
                type="button"
                className="deck-manual-cue-close"
                onClick={onDismissManualCue}
                aria-label="Dismiss manual introduction"
              >
                ×
              </button>
            </div>
            <p>
              Open the field manual for code and circuit reference. It stays available here and in every stage header.
            </p>
          </aside>
        )}
        <button type="button" className="deck-manual-button" onClick={onOpenManual}>
          <span>Manual</span>
          <span>Code / circuits</span>
        </button>
      </div>
    </div>
  )
}
