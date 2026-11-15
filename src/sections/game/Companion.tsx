import { useEffect, useRef } from 'react'
import type { Objective } from '../../game/campaign.ts'
import { SHIP_INTELLIGENCE } from '../../game/ship.ts'

export interface LogMessage {
  id: number
  speaker: 'MIRA' | 'SYSTEM'
  text: string
  tone?: 'normal' | 'alert' | 'ok'
}

interface CompanionProps {
  messages: LogMessage[]
  objective: Objective | null
  compact?: boolean
}

function MiraWave() {
  return (
    <span className="mira-wave" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

export default function Companion({ messages, objective, compact = false }: CompanionProps) {
  const logRef = useRef<HTMLDivElement>(null)
  const latest = messages[messages.length - 1]

  useEffect(() => {
    if (compact) return
    const element = logRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages.length, compact])

  if (compact) {
    return (
      <section className="companion-strip">
        <span className="companion-id">
          <MiraWave />
          {SHIP_INTELLIGENCE}
        </span>
        <span className="companion-copy">
          {latest?.text ?? `${SHIP_INTELLIGENCE} is listening.`}
        </span>
        {objective && (
          <span className="companion-objective">
            {objective.stage.code} // {objective.phase}
          </span>
        )}
      </section>
    )
  }

  return (
    <section className="mission-panel companion-panel">
      <header className="companion-panel-head">
        <div>
          <p className="hud-label">Intercom</p>
          <h2>
            {SHIP_INTELLIGENCE} // ship intelligence
          </h2>
        </div>
        <span className="companion-id">
          <MiraWave />
          <span className="led led-on" aria-hidden="true" />
        </span>
      </header>

      <div ref={logRef} aria-live="polite" className="companion-log">
        {messages.length === 0 && <p className="ink-faint">{SHIP_INTELLIGENCE} is listening.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`companion-message ${
              message.tone === 'alert'
                ? 'is-alert'
                : message.tone === 'ok'
                  ? 'is-ok'
                  : 'is-normal'
            }`}
          >
            <span className="companion-speaker">
              {message.speaker === 'MIRA' ? `${SHIP_INTELLIGENCE}:` : 'SYS:'}
            </span>{' '}
            <span>{message.text}</span>
          </div>
        ))}
      </div>

      {objective ? (
        <footer className="companion-objective-bar">
          <p className="hud-label">Current objective</p>
          <p className="mt-0.5">
            {objective.stage.code} // {objective.stage.name} — {objective.phase}
          </p>
        </footer>
      ) : (
        <footer className="companion-objective-bar">
          All systems online. The ship is holding.
        </footer>
      )}
    </section>
  )
}
