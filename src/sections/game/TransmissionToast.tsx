import { useEffect } from 'react'
import type { Chapter } from '../../game/narrative.ts'
import type { LogMessage } from './Companion.tsx'
import { SHIP_INTELLIGENCE } from '../../game/ship.ts'

interface TransmissionToastProps {
  message: LogMessage
  chapter: Chapter | null
  onDismiss: () => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function TransmissionToast({
  message,
  chapter,
  onDismiss,
}: TransmissionToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 9500)
    return () => window.clearTimeout(timer)
  }, [message.id, onDismiss])

  return (
    <aside className="mira-toast" role="status">
      <div className="mira-toast-head">
        <span className="mira-toast-id">
          <i aria-hidden="true" />
          {SHIP_INTELLIGENCE} // incoming
        </span>
        <span className="mira-toast-chapter">
          {chapter ? `CH ${pad(chapter.number)} // ${chapter.title}` : 'Live channel'}
        </span>
      </div>
      <p className="mira-toast-copy">{message.text}</p>
      <button
        type="button"
        className="mira-toast-close"
        onClick={onDismiss}
        aria-label="Dismiss transmission"
      >
        ×
      </button>
    </aside>
  )
}
