import UiSection from '../ui/UiSection.tsx'
import TerminalConsole from './TerminalConsole.tsx'
import Companion, { type LogMessage } from './Companion.tsx'
import type { CampaignProgress, Objective, StageStatus } from '../../game/campaign.ts'
import { SHIP_NAME, type ShipSystem, type SystemStage } from '../../game/ship.ts'

interface LevelViewProps {
  system: ShipSystem
  stage: SystemStage
  stageIndex: number
  stages: StageStatus[]
  completed: boolean
  progress: CampaignProgress
  messages: LogMessage[]
  objective: Objective | null
  onBack: () => void
  onSelectStage: (stageId: string) => void
  onSectionComplete: (sectionId: string) => void
  onFirmwareComplete: (stageId: string) => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function LevelView({
  system,
  stage,
  stageIndex,
  stages,
  completed,
  progress,
  messages,
  objective,
  onBack,
  onSelectStage,
  onSectionComplete,
  onFirmwareComplete,
}: LevelViewProps) {
  const next = stages[stageIndex + 1]
  const statusLabel = completed
    ? 'Procedure complete'
    : stage.kind === 'circuit'
      ? 'Circuit fault'
      : 'Firmware wait'
  const statusTone = completed ? 'phosphor' : stage.kind === 'circuit' ? 'ink-danger' : 'amber'
  const statusLed = completed ? 'led-on' : stage.kind === 'circuit' ? 'led-fault' : 'led-wait'
  const stampClass = completed ? 'stamp-live' : stage.kind === 'circuit' ? 'stamp-fault' : 'stamp-amber'

  return (
    <div className="min-h-screen p-2 sm:p-3">
      <header className="level-topbar">
        <button type="button" className="btn shrink-0" onClick={onBack}>
          ← Deck plan
        </button>

        <div className="level-breadcrumb">
          <span>{SHIP_NAME}</span>
          <span className="level-breadcrumb-sep">/</span>
          <span>{system.deck}</span>
          <span className="level-breadcrumb-sep">/</span>
          <span className="ink-strong">{stage.code}</span>
        </div>

        <div className={`level-status ${statusTone}`}>
          <span className={`led ${statusLed}`} aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <main className="level-layout mt-2">
        <aside className="level-aside">
          <section className="mission-panel level-objective">
          <div className="level-objective-head">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="hud-label">Procedure {pad(stageIndex + 1)} / {pad(stages.length)}</p>
              <span className="level-divider" aria-hidden="true" />
              <p className="hud-label">{stage.kind === 'circuit' ? 'Panel work' : 'Terminal work'}</p>
            </div>
            <span className={`stamp ${stampClass}`}>{statusLabel}</span>
          </div>

          <div className="level-objective-body">
            <div>
              <p className="level-code">{stage.code}</p>
              <h1 className="level-title font-display">{stage.name}</h1>
              <p className="level-brief">{stage.brief}</p>
            </div>

            <div className="level-success">
              <p className="hud-label">What success looks like</p>
              <p>{stage.restored}</p>
            </div>
          </div>
        </section>

        <nav className="level-rail" aria-label="Deck procedures">
          {stages.map(({ stage: candidate, index, completed: done, unlocked }) => (
            <button
              key={candidate.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelectStage(candidate.id)}
              aria-current={index === stageIndex ? 'step' : undefined}
              className={`level-rail-step ${index === stageIndex ? 'is-current' : ''} ${
                done ? 'is-done' : ''
              } ${!unlocked ? 'is-locked' : ''}`}
            >
              <span className="level-rail-num">{pad(index + 1)}</span>
              <span className="level-rail-main">
                <span className="level-rail-kind">
                  {candidate.kind === 'circuit' ? 'Panel' : 'Terminal'}
                </span>
                <span className="level-rail-name">{candidate.name}</span>
              </span>
              <span
                className={`led ${
                  done ? 'led-on' : !unlocked ? '' : candidate.kind === 'circuit' ? 'led-fault' : 'led-wait'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </nav>

          <div className="level-companion">
            <Companion messages={messages} objective={objective} compact />
          </div>
        </aside>

        <div className="level-main">
        {completed && (
          <section className="mission-panel level-complete" aria-live="polite">
            <span className="level-complete-stamp font-display">Repaired</span>
            <div className="min-w-0 flex-1">
              <p className="hud-label">Procedure complete</p>
              <p className="level-complete-copy">{stage.restored}</p>
            </div>
            {next ? (
              <button
                type="button"
                className="btn btn-action shrink-0"
                disabled={!next.unlocked}
                onClick={() => onSelectStage(next.stage.id)}
              >
                Next: {next.stage.name}
              </button>
            ) : (
              <button type="button" className="btn shrink-0" onClick={onBack}>
                Return to deck plan
              </button>
            )}
          </section>
        )}

        <section className="mission-panel level-workbench">
          <div className="level-workbench-head">
            <div>
              <p className="hud-label">
                {stage.kind === 'circuit' ? 'Panel // gate array' : 'Terminal // firmware bay'}
              </p>
              <h2 className="font-display">
                {stage.kind === 'circuit'
                  ? completed
                    ? 'Circuit seated'
                    : 'Repair the circuit'
                  : completed
                    ? 'Firmware accepted'
                    : 'Write the firmware'}
              </h2>
            </div>
            <p className="hud-label">{stage.code} // {system.code}</p>
          </div>

          {stage.kind === 'firmware' ? (
            <TerminalConsole
              key={stage.id}
              system={system}
              stage={stage}
              progress={progress}
              onComplete={onFirmwareComplete}
            />
          ) : completed ? (
            <div className="level-repaired">
              <p className="hud-label">Panel // circuit seated</p>
              <h3 className="font-display">{stage.name}</h3>
              <p>{stage.brief}</p>
              <p className="level-repaired-note">
                The gate array is holding. This procedure&apos;s firmware is mounted in the terminal.
              </p>
            </div>
          ) : (
            <UiSection
              key={stage.id}
              focusSectionId={stage.sectionId}
              onSectionComplete={onSectionComplete}
            />
          )}
        </section>
        </div>
      </main>
    </div>
  )
}
