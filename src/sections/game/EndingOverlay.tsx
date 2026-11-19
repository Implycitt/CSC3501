import { useState } from 'react'
import { ENDINGS, type Ending, type EndingId } from '../../game/narrative.ts'
import { SHIP_INTELLIGENCE } from '../../game/ship.ts'

interface EndingOverlayProps {
  savedEnding: Ending | null
  onChoose: (ending: EndingId) => void
  onClose?: () => void
}

export default function EndingOverlay({ savedEnding, onChoose, onClose }: EndingOverlayProps) {
  const [selected, setSelected] = useState<EndingId | null>(null)
  const choice = selected ? ENDINGS.find((ending) => ending.id === selected) ?? null : null

  if (savedEnding) {
    return (
      <div className="modal-scrim ending-scrim" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ending-title"
          className="modal-card ending-card mission-panel"
        >
          <p className="hud-label">Command uplink // committed</p>
          <h2 id="ending-title">{savedEnding.title}</h2>
          <p className="ending-copy">{savedEnding.body}</p>
          <div className="mira-quote">
            <p>
              <strong>{SHIP_INTELLIGENCE}:</strong> “{savedEnding.finalLine}”
            </p>
          </div>
          {onClose && (
            <button type="button" autoFocus className="btn btn-live mt-4 w-full" onClick={onClose}>
              Return to the deck
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="modal-scrim ending-scrim" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ending-title"
        className="modal-card ending-card mission-panel"
      >
        <p className="hud-label">Command uplink // final authority</p>
        <h2 id="ending-title">The choice is yours</h2>
        <p className="ending-intro">
          The archive is loaded. The shuttle is locked. The colony channel is open. MIRA will carry out
          whichever command you commit.
        </p>

        <div className="ending-choices" role="group" aria-label="Final command">
          {ENDINGS.map((ending, index) => {
            const active = selected === ending.id
            return (
              <button
                key={ending.id}
                type="button"
                autoFocus={index === 0}
                className={`ending-choice${active ? ' is-selected' : ''}`}
                aria-pressed={active}
                onClick={() => setSelected(ending.id)}
              >
                <span className="ending-choice-code">0{index + 1}</span>
                <strong>{ending.title}</strong>
                <span className="ending-choice-body">{ending.body}</span>
              </button>
            )
          })}
        </div>

        {choice && (
          <div className="ending-commit" aria-live="polite">
            <p className="ending-commit-label">Selected command</p>
            <p>{choice.title}</p>
            <div className="mira-quote">
              <p>
                <strong>{SHIP_INTELLIGENCE}:</strong> “{choice.finalLine}”
              </p>
            </div>
            <button type="button" className="btn btn-live mt-4 w-full" onClick={() => onChoose(choice.id)}>
              Commit command
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
