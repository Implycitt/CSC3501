import Companion, { type LogMessage } from './Companion.tsx'
import type { Objective } from '../../game/campaign.ts'
import { CHAPTERS, chapterRecord } from '../../game/narrative.ts'
import type { StoryProgress } from '../../game/story.ts'
import { hasReadLog, hasRecoveredLog, storyEnding } from '../../game/story.ts'

interface ShipLogOverlayProps {
  story: StoryProgress
  messages: LogMessage[]
  objective: Objective | null
  onClose: () => void
  onReadLog: (logId: string) => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function ShipLogOverlay({
  story,
  messages,
  objective,
  onClose,
  onReadLog,
}: ShipLogOverlayProps) {
  const ending = storyEnding(story)

  return (
    <div className="modal-scrim ship-log-scrim" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ship-log-title"
        className="modal-card ship-log-card mission-panel"
      >
        <header className="ship-log-head">
          <div>
            <p className="hud-label">Meridian // retained memory</p>
            <h2 id="ship-log-title">Ship’s Log</h2>
          </div>
          <button type="button" className="ship-log-close" onClick={onClose} aria-label="Close ship’s log">
            ×
          </button>
        </header>

        {objective && (
          <p className="ship-log-objective">
            <span>Current objective</span> {objective.stage.code} // {objective.stage.name} — {objective.phase}
          </p>
        )}

        <Companion messages={messages} objective={objective} />

        <section className="ship-log-records" aria-labelledby="ship-log-records-title">
          <div className="ship-log-section-head">
            <h3 id="ship-log-records-title">Recovered records</h3>
            <span>{story.recoveredLogIds.length} / {CHAPTERS.length}</span>
          </div>

          {CHAPTERS.map((chapter) => {
            const record = chapterRecord(chapter.id)
            if (!record) return null
            const recovered = hasRecoveredLog(story, record.id)
            const unread = recovered && !hasReadLog(story, record.id)

            if (!recovered) {
              return (
                <div key={record.id} className="ship-log-record is-locked">
                  <p className="ship-log-record-meta">
                    CH {pad(chapter.number)} // {chapter.title}
                  </p>
                  <strong>Encrypted record</strong>
                  <p>Complete {chapter.title} to recover this entry.</p>
                </div>
              )
            }

            return (
              <details
                key={record.id}
                className={`ship-log-record${unread ? ' is-unread' : ''}`}
                onToggle={(event) => {
                  if (event.currentTarget.open) onReadLog(record.id)
                }}
              >
                <summary>
                  <span className="ship-log-record-meta">
                    CH {pad(chapter.number)} // {chapter.title}
                  </span>
                  <span className="ship-log-record-title">{record.title}</span>
                  {unread && <span className="ship-log-unread">New</span>}
                </summary>
                <pre>{record.body}</pre>
              </details>
            )
          })}
        </section>

        {ending && (
          <section className="ship-log-ending" aria-labelledby="ship-log-ending-title">
            <p className="hud-label">Final command</p>
            <h3 id="ship-log-ending-title">{ending.title}</h3>
            <p>{ending.body}</p>
            <p className="mira-quote">
              <strong>MIRA:</strong> “{ending.finalLine}”
            </p>
          </section>
        )}

        <button type="button" autoFocus className="btn mt-4 w-full" onClick={onClose}>
          Close log
        </button>
      </div>
    </div>
  )
}
