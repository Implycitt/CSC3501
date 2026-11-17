import { useEffect, useRef, useState } from 'react'
import UiSection from '../ui/UiSection.tsx'
import TerminalConsole from './TerminalConsole.tsx'
import type { StageStatus } from '../../game/campaign.ts'
import type { SystemStage } from '../../game/ship.ts'

interface LevelViewProps {
  stage: SystemStage
  stageIndex: number
  stages: StageStatus[]
  completed: boolean
  onBack: () => void
  onSelectStage: (stageId: string) => void
  onSectionComplete: (sectionId: string) => void
  onFirmwareComplete: (stageId: string) => void
}

const pad = (value: number) => String(value).padStart(2, '0')

function TerminalOffline() {
  return (
    <div className="unit-shut terminal-shut">
      <p className="unit-shut-kicker">Terminal offline</p>
      <p className="unit-shut-title">OFFLINE</p>
      <p className="unit-shut-copy">This procedure is panel work. The terminal stays powered down.</p>
    </div>
  )
}

function PanelClosed() {
  return (
    <div className="panel-door">
      <div className="panel-door-face">
        <div className="panel-door-id">
          <p>PANEL 01 / CIRCUIT BAY</p>
          <strong>CLOSED</strong>
          <span>480V · DOOR INTERLOCKED</span>
        </div>

        <p className="panel-door-note">This procedure is terminal work. The circuit bay is sealed.</p>
      </div>

      <span className="panel-door-hinge is-top" aria-hidden="true" />
      <span className="panel-door-hinge is-bottom" aria-hidden="true" />
      <span className="panel-door-latch" aria-hidden="true">
        <i />
      </span>
    </div>
  )
}

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
      <span className="level-complete-stamp">Repaired</span>
      <p className="unit-repaired-title">{stage.name}</p>
      <p className="level-complete-copy">{stage.restored}</p>
      {next ? (
        <button
          type="button"
          className="btn btn-action"
          disabled={!next.unlocked}
          onClick={() => onSelectStage(next.stage.id)}
        >
          Next: {next.stage.name}
        </button>
      ) : (
        <button type="button" className="btn" onClick={onBack}>
          Deck plan
        </button>
      )}
    </div>
  )
}

export default function LevelView({
  stage,
  stageIndex,
  stages,
  completed,
  onBack,
  onSelectStage,
  onSectionComplete,
  onFirmwareComplete,
}: LevelViewProps) {
  const [exitOpen, setExitOpen] = useState(false)
  const stayRef = useRef<HTMLButtonElement>(null)
  const next = stages[stageIndex + 1]

  const hasTerminal = Boolean(stage.taskId)
  const hasPanel = Boolean(stage.sectionId)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setExitOpen((open) => !open)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (exitOpen) stayRef.current?.focus()
  }, [exitOpen])

  const terminalState = !hasTerminal ? 'OFFLINE' : completed ? 'REPAIRED' : 'ONLINE'
  return (
    <div className="level-screen">
      <h1 className="sr-only">
        {stage.code} // {stage.name}
      </h1>

      <div className={`level-deck${hasTerminal ? '' : ' is-panel-only'}`}>
        <section
          className={`level-unit terminal-unit ${hasTerminal ? 'is-active' : 'is-dark'} ${completed && hasTerminal ? 'is-repaired' : ''}`}
          aria-labelledby="terminal-title"
        >
          <header className="level-unit-head">
            <div className="level-unit-heading">
              <p className="level-unit-kind">Terminal / ASM</p>
              <p id="terminal-title" className="level-unit-title">
                {hasTerminal ? stage.name : 'No code surface'}
              </p>
            </div>
            <div className="level-unit-meta">
              <span className="level-unit-code">
                {hasTerminal ? `${stage.code} · ${pad(stageIndex + 1)}/${pad(stages.length)}` : 'STANDBY'}
              </span>
              <span className={`level-unit-state ${completed && hasTerminal ? 'is-repaired' : hasTerminal ? 'is-live' : 'is-dark'}`}>
                <span className={`led ${completed && hasTerminal ? 'led-on' : hasTerminal ? 'led-on' : 'led-off'}`} aria-hidden="true" />
                {terminalState}
              </span>
            </div>
          </header>

          <div className="terminal-bezel">
            <div className="terminal-screen">
              <div className="level-unit-body terminal-unit-body">
                {hasTerminal && completed ? (
                  <RepairedState stage={stage} next={next} onBack={onBack} onSelectStage={onSelectStage} />
                ) : hasTerminal ? (
                  <TerminalConsole key={stage.id} stage={stage} onComplete={onFirmwareComplete} />
                ) : (
                  <TerminalOffline />
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

        <section
          className={`level-unit panel-unit ${hasPanel ? 'is-active' : 'is-dark'} ${completed && hasPanel ? 'is-repaired' : ''}`}
          aria-label={hasPanel ? 'Circuit panel, power on' : 'Circuit panel, power off'}
        >
          <div
            className={`panel-status-strip ${hasPanel ? 'is-on' : 'is-off'}`}
            role="status"
            aria-label={hasPanel ? 'Panel power on' : 'Panel power off'}
          >
            <div className="panel-status-lamps" aria-hidden="true">
              <span className={`panel-status-lamp is-red ${hasPanel ? '' : 'is-lit'}`} />
              <span className={`panel-status-lamp is-green ${hasPanel ? 'is-lit' : ''}`} />
            </div>
          </div>

          <div className="level-unit-body panel-unit-body">
            {hasPanel && completed ? (
              <RepairedState stage={stage} next={next} onBack={onBack} onSelectStage={onSelectStage} />
            ) : hasPanel ? (
              <>
                <p className="level-unit-brief">{stage.brief}</p>
                <UiSection
                  key={stage.id}
                  focusSectionId={stage.sectionId}
                  onSectionComplete={onSectionComplete}
                />
              </>
            ) : (
              <PanelClosed />
            )}
          </div>
        </section>
      </div>

      {exitOpen && (
        <div
          className="modal-scrim"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setExitOpen(false)
          }}
        >
          <div className="modal-card exit-card" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p className="hud-label">Procedure interrupted</p>
            <h2 id="exit-title">Leave the deck?</h2>
            <p className="exit-copy">
              Return to the deck plan? The panel keeps its current wiring, but this procedure will pause.
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
