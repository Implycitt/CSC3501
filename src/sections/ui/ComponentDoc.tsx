import { useEffect } from 'react'
import { getComponent, resolveForSim } from '../../game/registry.ts'
import type { ComponentCategory } from '../../game/types.ts'
import PartGlyph from './skins/PartGlyph.tsx'
import { ACCENTS, skinFor } from './skins/index.ts'

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  logic: 'Logic gate',
  arithmetic: 'Arithmetic',
  routing: 'Routing',
  memory: 'Memory',
  historical: 'Historical',
  custom: 'Built part',
}

interface ComponentDocProps {
  componentId: string
  onClose: () => void
}

export default function ComponentDoc({ componentId, onClose }: ComponentDocProps) {
  const part = getComponent(componentId)
  let ports: { inputs: string[]; outputs: string[] } | undefined

  try {
    ports = resolveForSim(componentId)
  } catch {
    ports = undefined
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!part) return null

  const skin = skinFor(componentId)
  const accent = ACCENTS[skin.accent]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="component-doc-title"
        className="max-h-[80vh] w-full max-w-md overflow-y-auto border border-mist-700 bg-void p-4 font-mono text-mist-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-amber-800 pb-2">
          <div className="flex items-center gap-2">
            <PartGlyph glyph={skin.glyph} image={skin.image} className={`h-4 w-7 shrink-0 ${accent.glyph}`} />
            <div>
              <h2 id="component-doc-title" className="text-base text-mist-200">
                {part.name}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-mist-600">{CATEGORY_LABELS[part.category]}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close documentation"
            title="Close"
            onClick={onClose}
            className="shrink-0 border border-mist-700 px-2 py-0.5 text-xs hover:border-signal"
          >
            ×
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs text-mist-200">What it does</h3>
          <p className="text-xs leading-relaxed text-mist-400">{part.description}</p>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <h3 className="mb-1 text-xs text-mist-200">Inputs</h3>
            {ports && ports.inputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs text-mist-400">
                {ports.inputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-mist-600">None</p>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-xs text-mist-200">Outputs</h3>
            {ports && ports.outputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs text-mist-400">
                {ports.outputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-mist-600">None</p>
            )}
          </div>
        </section>

        <p className="mt-4 border-t border-mist-900 pt-2 text-[10px] text-mist-600">
          Full documentation for this part is coming soon.
        </p>
      </div>
    </div>
  )
}
