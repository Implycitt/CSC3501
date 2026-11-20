import { useEffect, useRef, useState } from 'react'
import UiSection from '../ui/UiSection.tsx'
import TerminalConsole from './TerminalConsole.tsx'
import type { ManualTab } from './FieldManual.tsx'
import MissionIntro from './MissionIntro.tsx'
import type { StageStatus } from '../../game/campaign.ts'
import { missionIntroLines, type Chapter } from '../../game/narrative.ts'
import type { SystemStage } from '../../game/ship.ts'

interface LevelViewProps {
  stage: SystemStage
  stageIndex: number
  stages: StageStatus[]
  completed: boolean
  chapter: Chapter | null
  manualOpen: boolean
  onOpenManual: (tab: ManualTab, section?: string) => void
  onBack: () => void
  onSelectStage: (stageId: string) => void
  onSectionComplete: (sectionId: string) => void
  onFirmwareComplete: (stageId: string) => void
  onStageOpen: (stageId: string) => void
  onFirstFail: (stageId: string) => void
}

const pad = (value: number) => String(value).padStart(2, '0')

function RepairedState({
  stage,
  next,
  onBack,
  onSelectStage,
}: {
  stage: SystemStage
  next?: StageStatus
  onBack: () => void
  onSelectStage: (stageId: string) => void
}) {
  return (
    <div className="unit-repaired" role="status" aria-live="polite">
      <div className="unit-repaired-card">
        <span className="level-complete-stamp">
          <span className="level-complete-mark" aria-hidden="true">
            ✓
          </span>
          Repaired
        </span>
        <p className="unit-repaired-title">{stage.name}</p>
        <p className="level-complete-copy">{stage.restored}</p>
        <div className="unit-repaired-rule" aria-hidden="true">
          <span />
          <b>{stage.code} · Section sealed</b>
          <span />
        </div>
        {next ? (
          <button
            type="button"
            className="btn btn-action unit-repaired-next"
            disabled={!next.unlocked}
            onClick={() => onSelectStage(next.stage.id)}
          >
            Next: {next.stage.name}
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" className="btn unit-repaired-next" onClick={onBack}>
            Deck plan
          </button>
        )}
      </div>
    </div>
  )
}

export default function LevelView({
  stage,
  stageIndex,
  stages,
  completed,
  chapter,
  manualOpen,
  onOpenManual,
  onBack,
  onSelectStage,
  onSectionComplete,
  onFirmwareComplete,
  onStageOpen,
  onFirstFail,
}: LevelViewProps) {
  const [exitOpen, setExitOpen] = useState(false)
  const [introDismissedFor, setIntroDismissedFor] = useState<string | null>(null)
  const stayRef = useRef<HTMLButtonElement>(null)
  const next = stages[stageIndex + 1]

  const hasTerminal = Boolean(stage.taskId)
  const hasPanel = Boolean(stage.sectionId)
  const introLines = missionIntroLines(stage.id)
  const introOpen = !completed && introLines.length > 0 && introDismissedFor !== stage.id

  useEffect(() => {
    onStageOpen(stage.id)
  }, [onStageOpen, stage.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || introOpen || manualOpen) return
      if (document.querySelector('[data-dragging="true"]')) return
      event.preventDefault()
      setExitOpen((open) => !open)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [introOpen, manualOpen])

  useEffect(() => {
    if (exitOpen) stayRef.current?.focus()
  }, [exitOpen])

  return (
    <div className="level-screen">
      <h1 className="sr-only">
        {stage.code} // {stage.name}
      </h1>

      <div className={`level-deck ${hasTerminal ? 'is-terminal' : 'is-panel'}`}>
        {hasTerminal && (
          <section
            className={`level-unit terminal-unit is-active ${completed ? 'is-repaired' : ''}`}
            aria-labelledby="terminal-title"
          >
            <div className="terminal-bezel">
              <div className="terminal-screen">
                <header className="level-unit-head">
                  <div className="level-unit-heading">
                    <p className="level-unit-kind">Terminal / ASM · panel sealed</p>
                    <p id="terminal-title" className="level-unit-title">
                      {stage.name}
                    </p>
                  </div>
                  <div className="level-unit-meta">
                    <span className="level-unit-code">
                      {stage.code} · {pad(stageIndex + 1)}/{pad(stages.length)}
                    </span>
                  </div>
                </header>

                <div className="level-unit-body terminal-unit-body">
                  {completed ? (
                    <RepairedState stage={stage} next={next} onBack={onBack} onSelectStage={onSelectStage} />
                  ) : (
                    <TerminalConsole
                      key={stage.id}
                      stage={stage}
                      onComplete={onFirmwareComplete}
                      onFirstFail={onFirstFail}
                      onOpenManual={onOpenManual}
                    />
                  )}
                </div>
              </div>

              <div className="terminal-bezel-foot" aria-hidden="true">
                <span className="terminal-bezel-led" />
                <span>MIRA CRT / 01</span>
                <span>PWR</span>
              </div>
            </div>
          </section>
        )}

        {hasPanel && (
          <section
            className={`level-unit panel-unit is-active ${completed ? 'is-repaired' : ''}`}
            aria-labelledby="panel-title"
          >
            <header className="panel-face">
              <div className="panel-face-id">
                <p className="level-unit-kind">Circuit bay · panel 01</p>
                <p id="panel-title" className="panel-face-title">
                  {stage.name}
                </p>
              </div>

              <div className="panel-face-meta">
                <span className="level-unit-code">
                  {stage.code} · {pad(stageIndex + 1)}/{pad(stages.length)}
                </span>
                <span className="panel-face-note">Terminal offline</span>
              </div>

              <div className="panel-status-lamps" aria-hidden="true">
                <span className="panel-status-lamp is-red" />
                <span className="panel-status-lamp is-green is-lit" />
              </div>
            </header>

            <div className="level-unit-body panel-unit-body">
              {completed ? (
                <RepairedState stage={stage} next={next} onBack={onBack} onSelectStage={onSelectStage} />
              ) : (
                <UiSection
                  key={stage.id}
                  focusSectionId={stage.sectionId}
                  onSectionComplete={onSectionComplete}
                  onOpenManual={onOpenManual}
                />
              )}
            </div>
          </section>
        )}
      </div>

      {introOpen && (
        <MissionIntro
          stage={stage}
          chapter={chapter}
          stageIndex={stageIndex}
          stageTotal={stages.length}
          lines={introLines}
          onBegin={() => setIntroDismissedFor(stage.id)}
        />
      )}

      {exitOpen && (
        <div className="modal-scrim"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setExitOpen(false)
          }}
        >
          <div className="modal-card exit-card" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p className="hud-label">Procedure interrupted</p>
            <h2 id="exit-title">Leave the deck?</h2>
            <p className="exit-copy">
              Return to the deck plan? The panel keeps its current wiring, inputs, and clock count.
            </p>
            <div className="exit-actions">
              <button ref={stayRef} type="button" className="btn" onClick={() => setExitOpen(false)}>
                Stay
              </button>
              <button type="button" className="btn btn-action" onClick={onBack}>
                Deck plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
