import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { ComponentCategory, ComponentDef } from '../../game/types.ts'
import { buttonClass } from './styles.ts'
import PartGlyph from './skins/PartGlyph.tsx'
import { ACCENTS, skinFor } from './skins/index.ts'

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
  onAddInput: () => void
  onAddOutput: () => void
  onAddClock: () => void
  allowPorts: boolean
  allowDocs: boolean
}

function PaletteItem({
  part,
  onStartPart,
  onShowDoc,
  allowDocs,
}: {
  part: ComponentDef
  onStartPart: PaletteProps['onStartPart']
  onShowDoc: PaletteProps['onShowDoc']
  allowDocs: boolean
}) {
  const skin = skinFor(part.id)
  const accent = ACCENTS[skin.accent]

  return (
    <div
      data-tutorial={`palette:${part.id}`}
      onPointerDown={(e) => onStartPart(part.id, e)}
      className="flex cursor-grab items-center justify-between gap-1 border border-mist-700 px-2 py-1 hover:border-signal"
    >
      <span className="flex min-w-0 items-center gap-2">
        <PartGlyph glyph={skin.glyph} image={skin.image} className={`h-3 w-5 shrink-0 ${accent.glyph}`} />
        <span className="truncate">{part.name}</span>
      </span>
      {allowDocs && (
        <button
          type="button"
          aria-label={`About ${part.name}`}
          title={`About ${part.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onShowDoc(part.id)}
          className="shrink-0 px-1 text-mist-600 hover:text-mist-100"
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
  onAddInput,
  onAddOutput,
  onAddClock,
  allowPorts,
  allowDocs,
}: PaletteProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = (part: ComponentDef) => part.name.toLowerCase().includes(needle)
  const builtMatches = built.filter(visible)

  return (
    <aside data-tutorial="palette" className="flex flex-col gap-3 md:max-h-[70vh]">
      <input
        className="shrink-0 border border-mist-700 bg-transparent px-2 py-1 text-xs placeholder:text-mist-600 focus:border-signal focus:outline-none"
        placeholder="Search parts"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        {GROUPS.map((group) => {
          const groupParts = parts.filter((part) => part.category === group.category).filter(visible)
          if (groupParts.length === 0) return null

          return (
            <section key={group.category} className="space-y-1">
              <h2 className="text-mist-200">{group.label}</h2>
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

        {(builtMatches.length > 0 || needle === '') && (
          <section className="space-y-1">
            <h2 className="text-mist-200">Built</h2>
            {builtMatches.length === 0 && <p className="text-xs">None yet.</p>}
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
        <section data-tutorial="ports" className="shrink-0 space-y-1 border-t border-mist-900 pt-3">
          <h2 className="text-mist-200">Ports</h2>
          <button className={`${buttonClass} block w-full`} onClick={onAddInput}>
            Add input
          </button>
          <button className={`${buttonClass} block w-full`} onClick={onAddOutput}>
            Add output
          </button>
          <button className={`${buttonClass} block w-full`} onClick={onAddClock}>
            Add clock
          </button>
        </section>
      )}
    </aside>
  )
}
