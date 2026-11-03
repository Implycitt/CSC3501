import type { TutorialSection } from '../../tutorial/types.ts'
import { buttonClass } from './styles.ts'

interface TutorialPanelProps {
  section: TutorialSection
  stepIndex: number
  completed: string[]
  onBack: () => void
  onNext: () => void
  onExit: () => void
}

export default function TutorialPanel({ section, stepIndex, completed, onBack, onNext, onExit }: TutorialPanelProps) {
  const step = section.steps[stepIndex]
  if (!step) return null

  const last = stepIndex === section.steps.length - 1
  const done = section.steps.filter((candidate) => completed.includes(candidate.id)).length

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-2 border border-amber-500 bg-black/95 p-3 font-mono text-xs text-amber-400"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-amber-600">Tutorial · {section.title}</p>
          <h2 className="text-sm text-amber-200">{step.title}</h2>
        </div>
        <button
          type="button"
          aria-label="Exit tutorial"
          title="Exit tutorial"
          className="px-1 text-amber-700 hover:text-amber-300"
          onClick={onExit}
        >
          ×
        </button>
      </div>

      <p className="leading-relaxed">{step.body}</p>
      {step.hint && <p className="border-l-2 border-amber-800 pl-2 text-[11px] text-amber-600">{step.hint}</p>}

      <div className="flex gap-1" aria-hidden="true">
        {section.steps.map((candidate, index) => (
          <span
            key={candidate.id}
            className={`h-1 flex-1 ${index <= stepIndex ? 'bg-amber-400' : 'bg-amber-900'}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-amber-700">
          Step {stepIndex + 1} of {section.steps.length} · {done} done
        </span>
        <div className="flex gap-1">
          <button type="button" className={buttonClass} disabled={stepIndex === 0} onClick={onBack}>
            Back
          </button>
          <button type="button" className={buttonClass} onClick={onNext}>
            {last ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </aside>
  )
}
