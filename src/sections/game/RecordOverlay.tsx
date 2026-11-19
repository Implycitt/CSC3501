import { chapterById, type LogFragment, type StoryBeat } from '../../game/narrative.ts'
import { SHIP_INTELLIGENCE } from '../../game/ship.ts'

const pad = (value: number) => String(value).padStart(2, '0')

interface RecordOverlayProps {
  record: LogFragment
  turn?: StoryBeat
  onClose: () => void
}

export default function RecordOverlay({ record, turn, onClose }: RecordOverlayProps) {
  const chapter = chapterById(record.chapterId)

  return (
    <div className="modal-scrim record-scrim" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-title"
        className="modal-card record-card mission-panel"
      >
        <p className="hud-label">
          Recovered record //{' '}
          {chapter ? `CH ${pad(chapter.number)} — ${chapter.title}` : record.chapterId}
        </p>
        <h2 id="record-title">{record.title}</h2>
        <pre className="record-body">{record.body}</pre>
        {turn && (
          <div className="mira-quote">
            <p>
              <strong>{SHIP_INTELLIGENCE}:</strong> “{turn.text}”
            </p>
          </div>
        )}
        <button type="button" autoFocus className="btn btn-live mt-4 w-full" onClick={onClose}>
          Return to the deck
        </button>
      </div>
    </div>
  )
}
