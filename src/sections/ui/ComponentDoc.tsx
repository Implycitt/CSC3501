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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="component-doc-title"
        className="max-h-[80vh] w-full max-w-md overflow-y-auto border border-amber-500 bg-black p-4 font-mono text-amber-400"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-amber-800 pb-2">
          <div className="flex items-center gap-2">
            <PartGlyph glyph={skin.glyph} image={skin.image} className={`h-4 w-7 shrink-0 ${accent.glyph}`} />
            <div>
              <h2 id="component-doc-title" className="text-base text-amber-300">
                {part.name}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-amber-700">{CATEGORY_LABELS[part.category]}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close documentation"
            title="Close"
            onClick={onClose}
            className="shrink-0 border border-amber-700 px-2 py-0.5 text-xs hover:border-amber-400"
          >
            ×
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs text-amber-300">What it does</h3>
          <p className="text-xs leading-relaxed text-amber-500">{part.description}</p>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <h3 className="mb-1 text-xs text-amber-300">Inputs</h3>
            {ports && ports.inputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs text-amber-500">
                {ports.inputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-amber-700">None</p>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-xs text-amber-300">Outputs</h3>
            {ports && ports.outputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs text-amber-500">
                {ports.outputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-amber-700">None</p>
            )}
          </div>
        </section>

        <p className="mt-4 border-t border-amber-800 pt-2 text-[10px] text-amber-700">
          Full documentation for this part is coming soon.
        </p>
      </div>
    </div>
  )
}
