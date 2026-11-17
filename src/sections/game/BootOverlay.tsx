import { useState } from 'react'
import { SHIP_INTELLIGENCE, SHIP_NAME, SHIP_SYSTEMS } from '../../game/ship.ts'

interface BootOverlayProps {
  onBegin: () => void
}

const BOOT_LINES = [
  ['01', 'crew registry', 'EMPTY'],
  ['02', 'reactor', 'COLD'],
  ['03', 'main systems', `0 / ${SHIP_SYSTEMS.length}`],
  ['04', 'repair authority', 'GRANTED'],
] as const

export default function BootOverlay({ onBegin }: BootOverlayProps) {
  const [exiting, setExiting] = useState(false)

  const handleBegin = () => {
    if (exiting) return

    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      onBegin()
      return
    }

    setExiting(true)
    window.setTimeout(onBegin, 480)
  }

  return (
    <div className={`modal-scrim boot-scrim ${exiting ? 'is-exiting' : ''}`} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="boot-title"
        aria-busy={exiting}
        className="modal-card boot-card mission-panel"
      >
        <p className="hud-label">Emergency relay // cold boot</p>
        <h2 id="boot-title">{SHIP_NAME}</h2>

        <div className="boot-log">
          {BOOT_LINES.map(([index, label, value], lineIndex) => (
            <p key={label} className={`boot-line ${lineIndex === BOOT_LINES.length - 1 ? 'is-good' : ''}`}>
              <span>{index}</span>
              <span>{label}</span>
              <strong>{value}</strong>
            </p>
          ))}
        </div>

        <div className="mira-quote">
          <p>
            <strong>{SHIP_INTELLIGENCE}:</strong> “You&apos;re awake. Good. The ship isn&apos;t.”
          </p>
          <p className="mt-2">
            <strong>{SHIP_INTELLIGENCE}:</strong> “{SHIP_SYSTEMS.length} systems are dark. Open Life
            Support from the deck plan. Each deck runs a short chain of panel and firmware procedures.”
          </p>
        </div>

        <button
          type="button"
          autoFocus
          disabled={exiting}
          className="btn btn-live mt-4 w-full"
          onClick={handleBegin}
        >
          {exiting ? 'HANDING OFF // DECK CONTROL' : 'BEGIN REPAIR'}
        </button>
      </div>
    </div>
  )
}
