import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { allComponents } from '../../game/registry.ts'
import { groupComponentsByCategory } from '../../game/componentCatalog.ts'
import { referenceFor } from '../../game/componentReferences.ts'
import PartGlyph from './skins/PartGlyph.tsx'
import { accentClass, skinFor } from './skins/index.ts'

interface ComponentBrowserProps {
  onClose: () => void
  onSelectComponent: (componentId: string) => void
  escapeDisabled?: boolean
}

export default function ComponentBrowser({
  onClose,
  onSelectComponent,
  escapeDisabled = false,
}: ComponentBrowserProps) {
  const [query, setQuery] = useState('')
  const parts = allComponents()
  const groups = groupComponentsByCategory(parts, query)
  const visibleCount = groups.reduce((count, group) => count + group.parts.length, 0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !escapeDisabled) onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [escapeDisabled, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center drape p-3 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="component-browser-title"
        className="flex max-h-[88vh] w-full max-w-5xl flex-col border edge surface-deep font-mono ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b line p-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] ink-faint">Ship library / parts</p>
            <h2 id="component-browser-title" className="text-base ink-strong">
              Component reference
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close component reference"
            title="Close"
            onClick={onClose}
            className="shrink-0 border edge px-2 py-0.5 text-xs edge-hover"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-2 border-b line p-3">
          <input
            type="search"
            autoFocus
            aria-label="Search component reference"
            placeholder="Search by name, function, or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 border edge bg-transparent px-2 py-1 text-xs placeholder-faint edge-focus focus:outline-none"
          />
          <span className="shrink-0 text-[10px] tabular-nums ink-faint" aria-live="polite">
            {visibleCount}/{parts.length}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {groups.length === 0 ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs ink-strong">No parts match “{query.trim()}”</p>
              <p className="text-[10px] ink-faint">Try a gate name, a function, or a category.</p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.category} className="mb-5 last:mb-0" aria-labelledby={`component-group-${group.category}`}>
                <div className="surface-deep sticky top-0 z-10 mb-2 flex items-baseline justify-between gap-2 border-b line pb-1">
                  <h3
                    id={`component-group-${group.category}`}
                    className={`text-[10px] uppercase tracking-[0.16em] accent-ink ${accentClass(group.category)}`}
                  >
                    {group.label}
                  </h3>
                  <span className="text-[9px] tabular-nums ink-faint">{group.parts.length} parts</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {group.parts.map((part) => {
                    const skin = skinFor(part.id)
                    const accent = accentClass(skin.accent)
                    const reference = referenceFor(part)

                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => onSelectComponent(part.id)}
                        className="group flex min-h-[5rem] cursor-pointer items-start gap-2 border edge-soft bg-transparent p-2 text-left hover-sunk edge-hover"
                      >
                        <span className="mt-0.5 flex h-8 w-10 shrink-0 items-center justify-center border edge-soft">
                          <PartGlyph
                            glyph={skin.glyph}
                            image={skin.image}
                            className={`h-5 w-7 ${accent}`}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs ink-strong">{part.name}</span>
                          <span className="mt-0.5 block text-[10px] leading-snug ink-soft">{part.description}</span>
                          {reference && (
                            <span className="mt-1 block text-[9px] leading-snug ink-faint">{reference.behavior}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs ink-faint" aria-hidden="true">
                          →
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <p className="border-t line px-3 py-2 text-[10px] leading-relaxed ink-faint">
          Every registered part appears here, grouped by category. Select one for its full circuit reference. Esc
          closes.
        </p>
      </div>
    </div>,
    document.body,
  )
}
