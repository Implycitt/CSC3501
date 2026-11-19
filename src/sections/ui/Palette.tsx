import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { ComponentCategory, ComponentDef } from '../../game/types.ts'
import PartGlyph from './skins/PartGlyph.tsx'
import { accentClass, skinFor } from './skins/index.ts'

const GROUPS: { category: ComponentCategory; label: string }[] = [
  { category: 'logic', label: 'Gates' },
  { category: 'arithmetic', label: 'Arithmetic' },
  { category: 'routing', label: 'Routing' },
  { category: 'memory', label: 'Memory' },
  { category: 'historical', label: 'Historical' },
]

interface PaletteProps {
  parts: ComponentDef[]
  built: ComponentDef[]
  onStartPart: (componentId: string, e: ReactPointerEvent) => void
  onAddPart: (componentId: string) => void
  onShowDoc: (componentId: string) => void
  onBrowseDocs: () => void
  allowDocs: boolean
  allowLibrary: boolean
  preferred?: string[]
  compact?: boolean
}

function PaletteItem({
  part,
  onStartPart,
  onAddPart,
  onShowDoc,
  allowDocs,
  compact = false,
}: {
  part: ComponentDef
  onStartPart: PaletteProps['onStartPart']
  onAddPart: PaletteProps['onAddPart']
  onShowDoc: PaletteProps['onShowDoc']
  allowDocs: boolean
  compact?: boolean
}) {
  const skin = skinFor(part.id)
  const accent = accentClass(skin.accent)

  return (
    <div
      data-tutorial={`palette:${part.id}`}
      role={compact ? 'listitem' : undefined}
      title={compact ? `Drag ${part.name} onto the board, or use +` : undefined}
      onPointerDown={(e) => onStartPart(part.id, e)}
      className={
        compact
          ? 'palette-chip flex shrink-0 cursor-grab items-center gap-1 border edge py-1 pl-1.5 pr-2 edge-hover'
          : 'flex cursor-grab items-center justify-between gap-1 border edge py-1 pl-1.5 pr-2 edge-hover'
      }
    >
      <span className={compact ? 'palette-chip-main flex min-w-0 flex-1 items-center gap-2' : 'flex min-w-0 items-center gap-2'}>
        <PartGlyph glyph={skin.glyph} image={skin.image} className={`accent-ink h-3 w-5 shrink-0 ${accent}`} />
        <span className={compact ? 'palette-chip-name truncate' : 'truncate'}>{part.name}</span>
      </span>

      <span className="palette-chip-actions flex shrink-0 items-center">
        {compact && (
          <button
            type="button"
            aria-label={`Add ${part.name} to the board`}
            title={`Add ${part.name} to the board`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onAddPart(part.id)
            }}
            className="palette-add"
          >
            +
          </button>
        )}
        {allowDocs && (
          <button
            type="button"
            aria-label={`About ${part.name}`}
            title={`About ${part.name}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onShowDoc(part.id)}
            className="palette-doc shrink-0 ink-faint hover-ink"
          >
            ?
          </button>
        )}
      </span>
    </div>
  )
}

export default function Palette({
  parts,
  built,
  onStartPart,
  onAddPart,
  onShowDoc,
  onBrowseDocs,
  allowDocs,
  allowLibrary,
  preferred = [],
  compact = false,
}: PaletteProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = (part: ComponentDef) => part.name.toLowerCase().includes(needle)
  const partsMatches = parts.filter(visible)
  const builtMatches = built.filter(visible)
  const total = parts.length + built.length

  if (compact) {
    const suggested = new Set(preferred)
    const grouped = GROUPS.map((group) => ({
      ...group,
      parts: partsMatches.filter((part) => part.category === group.category),
    }))
      .filter((group) => group.parts.length > 0)
      .sort(
        (left, right) =>
          Number(right.parts.some((part) => suggested.has(part.id))) -
          Number(left.parts.some((part) => suggested.has(part.id))),
      )
    const empty = grouped.length === 0 && builtMatches.length === 0

    return (
      <div data-tutorial="palette" className="palette-rail">
        <span className="palette-rail-label">
          Parts
          <em>{total} · drag or tap +</em>
        </span>

        {total > 8 && (
          <input
            type="search"
            className="palette-rail-search"
            aria-label="Filter available parts"
            placeholder="Filter parts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        <div className="palette-rail-list" role="list" aria-label="Available parts">
          {grouped.map((group) => (
            <div key={group.category} className="palette-group" role="presentation">
              <span className={`palette-group-label ${accentClass(group.category)}`}>
                {group.label}
                <em>{group.parts.length}</em>
              </span>
              <div className="palette-group-list" role="presentation">
                {group.parts.map((part) => (
                  <PaletteItem
                    key={part.id}
                    part={part}
                    onStartPart={onStartPart}
                    onAddPart={onAddPart}
                    onShowDoc={onShowDoc}
                    allowDocs={allowDocs}
                    compact
                  />
                ))}
              </div>
            </div>
          ))}

          {allowLibrary && builtMatches.length > 0 && (
            <div className="palette-group" role="presentation">
              <span className={`palette-group-label ${accentClass('custom')}`}>
                Built
                <em>{builtMatches.length}</em>
              </span>
              <div className="palette-group-list" role="presentation">
                {builtMatches.map((part) => (
                  <PaletteItem
                    key={part.id}
                    part={part}
                    onStartPart={onStartPart}
                    onAddPart={onAddPart}
                    onShowDoc={onShowDoc}
                    allowDocs={allowDocs}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {empty && <p className="palette-empty">No parts match “{query.trim()}”.</p>}

        {allowDocs && (
          <button
            type="button"
            onClick={onBrowseDocs}
            aria-label="Browse all component references"
            title="Browse all component references"
            className="shrink-0 border edge px-2 py-1 text-[9px] uppercase tracking-wider ink-faint edge-hover hover-ink"
          >
            Reference
          </button>
        )}
      </div>
    )
  }

  return (
    <aside data-tutorial="palette" className="flex flex-col gap-3 md:max-h-[70vh]">
      {parts.length + built.length > 4 && (
        <input
          className="shrink-0 border edge bg-transparent px-2 py-1 text-xs placeholder-faint edge-focus focus:outline-none"
          placeholder="Search parts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {allowDocs && (
        <button type="button" onClick={onBrowseDocs} className="btn block w-full text-xs">
          Browse component reference
        </button>
      )}

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        {GROUPS.map((group) => {
          const groupParts = parts.filter((part) => part.category === group.category).filter(visible)
          if (groupParts.length === 0) return null

          return (
            <section key={group.category} className="space-y-1">
              <h2 className={`accent-ink ${accentClass(group.category)}`}>{group.label}</h2>
              {groupParts.map((part) => (
                <PaletteItem
                  key={part.id}
                  part={part}
                  onStartPart={onStartPart}
                  onAddPart={onAddPart}
                  onShowDoc={onShowDoc}
                  allowDocs={allowDocs}
                />
              ))}
            </section>
          )
        })}

        {allowLibrary && (builtMatches.length > 0 || needle === '') && (
          <section className="space-y-1">
            <h2 className={`accent-ink ${accentClass('custom')}`}>Built</h2>
            {builtMatches.length === 0 && <p className="text-xs">Nothing saved yet.</p>}
            {builtMatches.map((part) => (
              <PaletteItem
                key={part.id}
                part={part}
                onStartPart={onStartPart}
                onAddPart={onAddPart}
                onShowDoc={onShowDoc}
                allowDocs={allowDocs}
              />
            ))}
          </section>
        )}
      </div>

    </aside>
  )
}
