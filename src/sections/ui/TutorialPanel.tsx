import type { TutorialSection } from '../../tutorial/types.ts'
import type { ManualTab } from '../game/FieldManual.tsx'
import ManualLink from '../ManualLink.tsx'
import { manualSectionForCircuitHint } from '../manualLinks.ts'

interface TutorialPanelProps {
  section: TutorialSection
  stepIndex: number
  onExit: () => void
  onOpenManual?: (tab: ManualTab, section?: string) => void
  compact?: boolean
}

export default function TutorialPanel({
  section,
  stepIndex,
  onExit,
  onOpenManual,
  compact = false,
}: TutorialPanelProps) {
  const step = section.steps[stepIndex]
  if (!step) return null

  if (compact) {
    return (
      <section aria-live="polite" className="procedure-strip">
        <div className="procedure-strip-head">
          <div>
            <p className="level-unit-kind">Procedure · {section.title}</p>
            <h2>{step.title}</h2>
          </div>
          <span className="procedure-count">
            {stepIndex + 1} / {section.steps.length}
          </span>
        </div>
        {section.objective && (
          <p className="procedure-objective">
            <span>Goal</span>
            {section.objective}
          </p>
        )}
        <p className="procedure-copy">{step.body}</p>
        {step.hint && (
          <details className="procedure-hint">
            <summary>Hint</summary>
            <p>{step.hint}</p>
            <ManualLink section={manualSectionForCircuitHint(step.hint)} onOpen={onOpenManual} />
          </details>
        )}
        <div className="procedure-bars" aria-hidden="true">
          {section.steps.map((candidate, index) => (
            <span key={candidate.id} className={index <= stepIndex ? 'is-done' : ''} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-h-[calc(100vh-2rem)] w-[min(22rem,calc(100vw-2rem))] space-y-2 overflow-y-auto border edge bg-[var(--palette-surface)] p-3 font-mono text-xs ink"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest ink-dim">Procedure · {section.title}</p>
          <h2 className="text-sm ink-strong">{step.title}</h2>
        </div>
        <button
          type="button"
          aria-label="Close repair procedure"
          title="Close repair procedure"
          className="px-1 ink-faint hover-ink"
          onClick={onExit}
        >
          ×
        </button>
      </div>

      {section.objective && (
        <p className="border-l-2 line pl-2 text-[10px] ink-soft">
          <span className="mr-1 uppercase tracking-widest ink-faint">Goal</span>
          {section.objective}
        </p>
      )}

      <p className="leading-relaxed">{step.body}</p>

      {step.hint && (
        <details className="border-l-2 line pl-2 text-[11px] ink-dim">
          <summary className="cursor-pointer select-none">Hint</summary>
          <p className="mt-1 leading-relaxed">{step.hint}</p>
          <ManualLink section={manualSectionForCircuitHint(step.hint)} onOpen={onOpenManual} />
        </details>
      )}

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[10px] ink-faint">
          Step {stepIndex + 1} / {section.steps.length}
        </span>
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {section.steps.map((candidate, index) => (
            <span
              key={candidate.id}
              className={`h-1 flex-1 ${index <= stepIndex ? 'live-fill' : 'surface-track'}`}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
