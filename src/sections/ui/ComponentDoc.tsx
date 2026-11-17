import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getComponent, resolveForSim } from '../../game/registry.ts'
import { referenceFor } from '../../game/componentReferences.ts'
import type { ComponentCategory } from '../../game/types.ts'
import PartGlyph from './skins/PartGlyph.tsx'
import { accentClass, skinFor } from './skins/index.ts'

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
  const accent = accentClass(skin.accent)
  const reference = referenceFor(part)

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center drape p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="component-doc-title"
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto border edge surface-deep p-4 font-mono ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3 border-b line pb-2">
          <div className="flex items-center gap-2">
            <PartGlyph glyph={skin.glyph} image={skin.image} className={`accent-ink h-4 w-7 shrink-0 ${accent}`} />
            <div>
              <h2 id="component-doc-title" className="text-base ink-strong">
                {part.name}
              </h2>
              <p className="text-[10px] uppercase tracking-widest ink-faint">{CATEGORY_LABELS[part.category]}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close documentation"
            title="Close"
            onClick={onClose}
            className="shrink-0 border edge px-2 py-0.5 text-xs edge-hover"
          >
            ×
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs ink-strong">What it does</h3>
          <p className="text-xs leading-relaxed ink-soft">{part.description}</p>
        </section>

        {reference && (
          <section className="mt-4">
            <h3 className="text-xs ink-strong">Circuit reference</h3>
            <p className="mt-1 border-l-2 border-current pl-2 text-xs leading-relaxed ink-soft">
              {reference.behavior}
            </p>
            {reference.example && (
              <div className="mt-2">
                <div className="overflow-x-auto border edge">
                  <table className="w-full border-collapse text-center font-mono text-[11px]">
                    <thead>
                      <tr className="ink-faint">
                        {reference.example.headers.map((header) => (
                          <th
                            key={header}
                            className="whitespace-nowrap border line px-1.5 py-1 text-[9px] font-normal uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reference.example.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap border line px-1.5 py-1 ink-soft">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed ink-faint">{reference.example.caption}</p>
              </div>
            )}
          </section>
        )}

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <h3 className="mb-1 text-xs ink-strong">Inputs</h3>
            {ports && ports.inputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs ink-soft">
                {ports.inputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs ink-faint">None</p>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-xs ink-strong">Outputs</h3>
            {ports && ports.outputs.length > 0 ? (
              <ul className="space-y-0.5 text-xs ink-soft">
                {ports.outputs.map((port) => (
                  <li key={port} className="truncate">
                    {port}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs ink-faint">None</p>
            )}
          </div>
        </section>

        <p className="mt-4 border-t line pt-2 text-[10px] leading-relaxed ink-faint">
          A sink accepts one incoming wire; a source can feed several sinks. Match the port names on the part to the
          signal you want to trace.
        </p>
      </div>
    </div>,
    document.body,
  )
}
