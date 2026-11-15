import { SHIP_INTELLIGENCE, SHIP_NAME, SHIP_SYSTEMS } from '../../game/ship.ts'

interface WinOverlayProps {
  onClose: () => void
}

export default function WinOverlay({ onClose }: WinOverlayProps) {
  return (
    <div className="modal-scrim win-scrim" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-title"
        className="modal-card win-card mission-panel"
      >
        <div className="victory-sweep" aria-hidden="true" />
        <p className="hud-label">{SHIP_NAME} // status</p>
        <h2 id="win-title">All systems online</h2>

        <div className="win-grid">
          {SHIP_SYSTEMS.map((system, index) => (
            <p key={system.id} style={{ animationDelay: `${140 + index * 75}ms` }}>
              <span className="led led-on" aria-hidden="true" />
              {system.code} // {system.name}
            </p>
          ))}
        </div>

        <div className="mira-quote">
          <p>
            <strong>{SHIP_INTELLIGENCE}:</strong> “
            {SHIP_SYSTEMS.map((system) => system.name).join(' · ')}. You brought her back.”
          </p>
          <p className="mt-2">
            <strong>{SHIP_INTELLIGENCE}:</strong> “There&apos;s no one left to hear the carrier but me.
            I&apos;m glad you&apos;re here.”
          </p>
        </div>

        <button type="button" autoFocus className="btn btn-live mt-4 w-full" onClick={onClose}>
          STAY ABOARD
        </button>
      </div>
    </div>
  )
}
