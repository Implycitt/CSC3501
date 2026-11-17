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
  onShowDoc: (componentId: string) => void
  onBrowseDocs: () => void
  onAddInput: () => void
  onAddOutput: () => void
  onAddClock: () => void
  allowPorts: boolean
  allowDocs: boolean
  allowLibrary: boolean
  compact?: boolean
}

function PaletteItem({
  part,
  onStartPart,
  onShowDoc,
  allowDocs,
  compact = false,
}: {
  part: ComponentDef
  onStartPart: PaletteProps['onStartPart']
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
      onPointerDown={(e) => onStartPart(part.id, e)}
      className={
        compact
          ? 'palette-chip flex shrink-0 cursor-grab items-center gap-1.5 border edge py-1 pl-1.5 pr-2 edge-hover'
          : 'flex cursor-grab items-center justify-between gap-1 border edge py-1 pl-1.5 pr-2 edge-hover'
      }
    >
      <span className="flex min-w-0 items-center gap-2">
        <PartGlyph glyph={skin.glyph} image={skin.image} className={`accent-ink h-3 w-5 shrink-0 ${accent}`} />
        <span className="truncate">{part.name}</span>
      </span>
      {allowDocs && (
        <button
          type="button"
          aria-label={`About ${part.name}`}
          title={`About ${part.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onShowDoc(part.id)}
          className="shrink-0 px-1 ink-faint hover-ink"
        >
          ?
        </button>
      )}
    </div>
  )
}

export default function Palette({
  parts,
  built,
  onStartPart,
  onShowDoc,
  onBrowseDocs,
  onAddInput,
  onAddOutput,
  onAddClock,
  allowPorts,
  allowDocs,
  allowLibrary,
  compact = false,
}: PaletteProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = (part: ComponentDef) => part.name.toLowerCase().includes(needle)
  const builtMatches = built.filter(visible)

  if (compact) {
    return (
      <div data-tutorial="palette" className="palette-rail">
        <span className="palette-rail-label">Parts</span>
        <div className="palette-rail-list" role="list" aria-label="Available parts">
          {parts.map((part) => (
            <PaletteItem
              key={part.id}
              part={part}
              onStartPart={onStartPart}
              onShowDoc={onShowDoc}
              allowDocs={allowDocs}
              compact
            />
          ))}
        </div>
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
                onShowDoc={onShowDoc}
                allowDocs={allowDocs}
              />
            ))}
          </section>
        )}
      </div>

      {allowPorts && (
        <section data-tutorial="ports" className="shrink-0 space-y-1 border-t line pt-3">
          <h2 className="ink-strong">Ports</h2>
          <button className={`btn block w-full`} onClick={onAddInput}>
            Add input
          </button>
          <button className={`btn block w-full`} onClick={onAddOutput}>
            Add output
          </button>
          <button className={`btn block w-full`} onClick={onAddClock}>
            Add clock
          </button>
        </section>
      )}
    </aside>
  )
}
