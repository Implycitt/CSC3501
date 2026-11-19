import type { Chapter } from '../../game/narrative.ts'
import { CHAPTERS } from '../../game/narrative.ts'
import type { LogMessage } from './Companion.tsx'
import { SHIP_INTELLIGENCE } from '../../game/ship.ts'

interface MiraChannelProps {
  chapter: Chapter | null
  message: LogMessage | null
  completed: number
  total: number
  recovered: number
  unreadCount: number
  onOpenLog: () => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function MiraChannel({
  chapter,
  message,
  completed,
  total,
  recovered,
  unreadCount,
  onOpenLog,
}: MiraChannelProps) {
  return (
    <section
      className={`mira-channel${message ? ' is-live' : ''}`}
      aria-label={`${SHIP_INTELLIGENCE} transmission channel`}
    >
      <span className="mira-sigil" aria-hidden="true">
        M
      </span>

      <div className="mira-channel-id">
        <p className="mira-channel-name">{SHIP_INTELLIGENCE}</p>
        <p className="mira-channel-role">Ship intelligence // ISV Meridian</p>
      </div>

      <div className="mira-channel-body">
        <p className="mira-channel-meta">
          {chapter ? `Chapter ${pad(chapter.number)} // ${chapter.title}` : 'Channel idle'}
          {chapter && (
            <span>
              {' '}
              · {completed}/{total} relays
            </span>
          )}
        </p>
        <p className="mira-channel-copy" aria-live="polite">
          {message?.text ?? `${SHIP_INTELLIGENCE} is holding the channel open.`}
        </p>
      </div>

      <button
        type="button"
        className="mira-channel-log"
        onClick={onOpenLog}
        aria-label={
          unreadCount > 0
            ? `Open ship’s log, ${unreadCount} unread record${unreadCount === 1 ? '' : 's'}`
            : 'Open ship’s log'
        }
      >
        <span>Records</span>
        <strong>
          {recovered}/{CHAPTERS.length}
          {unreadCount > 0 ? ` · ${unreadCount} new` : ''}
        </strong>
      </button>
    </section>
  )
}
