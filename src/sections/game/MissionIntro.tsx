import { useState } from 'react'
import type { Chapter } from '../../game/narrative.ts'
import { SHIP_INTELLIGENCE, type SystemStage } from '../../game/ship.ts'

interface MissionIntroProps {
  stage: SystemStage
  chapter: Chapter | null
  stageIndex: number
  stageTotal: number
  lines: string[]
  onBegin: () => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function MissionIntro({
  stage,
  chapter,
  stageIndex,
  stageTotal,
  lines,
  onBegin,
}: MissionIntroProps) {
  const [step, setStep] = useState(0)
  const last = step >= lines.length - 1
  const advance = () => {
    if (last) onBegin()
    else setStep((current) => current + 1)
  }

  return (
    <div className="modal-scrim mission-intro-scrim" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-intro-title"
        className="modal-card mission-intro-card mission-panel"
      >
        <header className="mission-intro-head">
          <span className="mission-intro-source">
            <span className="mira-sigil" aria-hidden="true">
              M
            </span>
            <span>
              <span className="mission-intro-name">{SHIP_INTELLIGENCE}</span>
              <span className="mission-intro-role">Pre-procedure transmission</span>
            </span>
          </span>
          <span className="mission-intro-chapter">
            {chapter ? `CH ${pad(chapter.number)} // ${chapter.title}` : 'Ship intelligence'}
          </span>
        </header>

        <p className="mission-intro-code">
          {stage.code} · {pad(stageIndex + 1)} / {pad(stageTotal)}
        </p>
        <h2 id="mission-intro-title">{stage.name}</h2>

        <ol className="mission-intro-lines" aria-live="polite">
          {lines.slice(0, step + 1).map((line, index) => (
            <li key={line} className={index === step ? 'is-current' : ''}>
              <span className="mission-intro-speaker">{SHIP_INTELLIGENCE}</span>
              <p>{line}</p>
            </li>
          ))}
        </ol>

        <div className="mission-intro-foot">
          <span className="mission-intro-progress" aria-hidden="true">
            {lines.map((line, index) => (
              <i key={line} className={index <= step ? 'is-lit' : ''} />
            ))}
          </span>
          <span className="mission-intro-count">
            {step + 1} / {lines.length}
          </span>
          <button type="button" className="mission-intro-skip" onClick={onBegin}>
            Skip
          </button>
          <button type="button" autoFocus className="btn btn-live" onClick={advance}>
            {last ? 'Begin procedure' : 'Next transmission'}
          </button>
        </div>
      </div>
    </div>
  )
}
