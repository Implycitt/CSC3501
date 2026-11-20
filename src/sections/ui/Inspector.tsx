import { type Circuit, type Wire } from '../../game/circuit.ts'
import { getComponent } from '../../game/registry.ts'
import type { SavedDesign } from '../../game/library.ts'
import type { ManualTab } from '../game/FieldManual.tsx'
import ManualLink from '../ManualLink.tsx'

function endpointLabel(circuit: Circuit, key: string): string {
  if (key.startsWith('in:')) return key.slice(3)
  if (key.startsWith('out:')) return key.slice(4)

  const [, uid, port] = key.split(':')
  const part = circuit.parts.find((candidate) => candidate.uid === uid)
  return `${getComponent(part?.componentId ?? '')?.name ?? uid}.${port}`
}

interface InspectorProps {
  circuit: Circuit
  error: string | null
  selected: Wire | null
  nameDraft: string
  status: string
  designs: SavedDesign[]
  onTick: () => void
  onRemoveWire: (wire: Wire) => void
  selectedPart: { name: string } | null
  onRemoveSelectedPart: () => void
  onDeselect: () => void
  onNameDraft: (value: string) => void
  onSave: () => void
  onLoadDesign: (id: string) => void
  onDeleteDesign: (id: string) => void
  onClear: () => void
  onOpenManual?: (tab: ManualTab, section?: string) => void
  allowSave: boolean
  allowLibrary: boolean
  allowClear: boolean
  compact?: boolean
}

export default function Inspector({
  circuit,
  error,
  selected,
  nameDraft,
  status,
  designs,
  onTick,
  onRemoveWire,
  selectedPart,
  onRemoveSelectedPart,
  onDeselect,
  onNameDraft,
  onSave,
  onLoadDesign,
  onDeleteDesign,
  onClear,
  onOpenManual,
  allowSave,
  allowLibrary,
  allowClear,
  compact = false,
}: InspectorProps) {
  const hasClock = circuit.inputs.includes('clk')
  const showSimulation = Boolean(error) || (hasClock && !compact)
  const hasContent = Boolean(showSimulation || selectedPart || selected || allowSave || allowLibrary || allowClear)

  if (!hasContent) return null

  return (
    <aside
      data-tutorial="inspector"
      className={compact ? 'inspector-rail' : 'space-y-3 md:col-span-2 lg:col-span-1'}
    >
      {showSimulation && (
        <section data-tutorial="simulation" className="space-y-2">
          {error && (
            <>
              <p className="ink-danger">{error}</p>
              <ManualLink section="circuit-fixes" onOpen={onOpenManual} />
            </>
          )}
          {hasClock && !compact && (
            <button className="btn block w-full" onClick={onTick}>
              Tick clock
            </button>
          )}
        </section>
      )}

      {selectedPart && (
        <section className="space-y-2">
          <div className="inspector-section-head">
            <h2 className="amber">Selected part</h2>
          </div>
          <p className="text-xs">{selectedPart.name}</p>
          <button className="btn block w-full" onClick={onRemoveSelectedPart}>
            Remove part
          </button>
        </section>
      )}

      {selected && (
        <section className="space-y-2">
          <div className="inspector-section-head">
            <h2 className="ink-strong">Selected wire</h2>
            <button type="button" className="inspector-link" onClick={onDeselect}>
              clear
            </button>
          </div>
          <p className="inspector-endpoints">
            <b>{endpointLabel(circuit, selected.from)}</b>
            <span aria-hidden="true">→</span>
            <b>{endpointLabel(circuit, selected.to)}</b>
          </p>
          <button className="btn block w-full" onClick={() => onRemoveWire(selected)}>
            Remove wire
          </button>
        </section>
      )}

      {allowSave && (
        <section data-tutorial="save" className="space-y-2">
          <h2 className="ink-strong">Save to library</h2>
          <input
            className="w-full border edge bg-transparent px-2 py-1 placeholder-faint"
            placeholder="Part name"
            value={nameDraft}
            onChange={(e) => onNameDraft(e.target.value)}
          />
          <button className="btn block w-full" disabled={circuit.parts.length === 0} onClick={onSave}>
            Save as part
          </button>
          {status && (
            <p className="text-xs" role="status">
              {status}
            </p>
          )}
        </section>
      )}

      {allowLibrary && (
        <section data-tutorial="library" className="space-y-2">
          <h2 className="ink-strong">Library</h2>
          {designs.length === 0 && <p className="text-xs">Nothing saved yet.</p>}
          {designs.map((design) => (
            <div key={design.id} className="space-y-1 border line p-2">
              <p className="truncate text-xs" title={design.name}>
                {design.name}
              </p>
              <p className="text-[10px] ink-faint">
                {design.circuit.parts.length} part{design.circuit.parts.length === 1 ? '' : 's'}
              </p>
              <div className="flex gap-1">
                <button className="btn flex-1" onClick={() => onLoadDesign(design.id)}>
                  Load
                </button>
                <button className="btn flex-1" onClick={() => onDeleteDesign(design.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {allowClear && (
        <button data-tutorial="clear" className="btn block w-full" onClick={onClear}>
          Clear canvas
        </button>
      )}
    </aside>
  )
}
