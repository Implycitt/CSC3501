import { useMemo, useState } from 'react'
import { allComponents } from '../../game/registry.ts'
import { groupComponentsByCategory } from '../../game/componentCatalog.ts'
import { referenceFor } from '../../game/componentReferences.ts'
import PartGlyph from '../ui/skins/PartGlyph.tsx'
import { accentClass, skinFor } from '../ui/skins/index.ts'

interface PartsReferenceProps {
  onOpenPart: (componentId: string) => void
}

export default function PartsReference({ onOpenPart }: PartsReferenceProps) {
  const [query, setQuery] = useState('')
  const parts = useMemo(() => allComponents(), [])
  const groups = useMemo(() => groupComponentsByCategory(parts, query), [parts, query])
  const visibleCount = groups.reduce((count, group) => count + group.parts.length, 0)

  return (
    <div className="manual-parts">
      <div className="manual-parts-toolbar">
        <label className="manual-parts-search">
          <span className="sr-only">Search components</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search gates, adders, memory…"
          />
        </label>
        <span className="manual-parts-count" aria-live="polite">
          {visibleCount}/{parts.length} parts
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="manual-parts-empty">
          <p>No parts match “{query.trim()}”.</p>
          <span>Try a gate name, a function, or a category.</span>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.category} className="manual-part-group" aria-labelledby={`manual-parts-${group.category}`}>
            <div className="manual-part-group-head">
              <h3 id={`manual-parts-${group.category}`} className={`accent-ink ${accentClass(group.category)}`}>
                {group.label}
              </h3>
              <span>{group.parts.length}</span>
            </div>

            <div className="manual-part-grid">
              {group.parts.map((part) => {
                const skin = skinFor(part.id)
                const reference = referenceFor(part)

                return (
                  <button
                    key={part.id}
                    type="button"
                    className="manual-part-card"
                    onClick={() => onOpenPart(part.id)}
                    aria-label={`Open the ${part.name} reference`}
                  >
                    <span className="manual-part-glyph">
                      <PartGlyph
                        glyph={skin.glyph}
                        image={skin.image}
                        className={`h-5 w-7 ${accentClass(skin.accent)}`}
                      />
                    </span>
                    <span className="manual-part-copy">
                      <span className="manual-part-name">{part.name}</span>
                      <span className="manual-part-desc">{part.description}</span>
                      {reference && <span className="manual-part-behavior">{reference.behavior}</span>}
                    </span>
                    <span className="manual-part-arrow" aria-hidden="true">
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
  )
}
