import { type Circuit, type Wire } from '../../game/circuit.ts'
import { getComponent } from '../../game/registry.ts'
import type { SavedDesign } from '../../game/library.ts'

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
  onNameDraft: (value: string) => void
  onSave: () => void
  onLoadDesign: (id: string) => void
  onDeleteDesign: (id: string) => void
  onClear: () => void
  allowSave: boolean
  allowLibrary: boolean
  allowClear: boolean
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
  onNameDraft,
  onSave,
  onLoadDesign,
  onDeleteDesign,
  onClear,
  allowSave,
  allowLibrary,
  allowClear,
}: InspectorProps) {
  return (
    <aside data-tutorial="inspector" className="space-y-4 md:col-span-2 lg:col-span-1">
      <section data-tutorial="simulation" className="space-y-2">
        <h2 className="ink-strong">Simulation</h2>
        {error && <p className="ink-danger">{error}</p>}
        {circuit.inputs.includes('clk') && (
          <button className={`btn block w-full`} onClick={onTick}>
            Tick clock
          </button>
        )}
        {circuit.outputs.length === 0 && <p className="text-xs">Add an output to see a result.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="text-amber-300">Selected part</h2>
        {selectedPart ? (
          <>
            <p className="text-xs">{selectedPart.name}</p>
            <button className={`btn block w-full`} onClick={onRemoveSelectedPart}>
              Remove part
            </button>
          </>
        ) : (
          <p className="text-xs">Click a part to select it, then press Delete to remove it.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="ink-strong">Selected wire</h2>
        {selected ? (
          <>
            <p className="text-xs">
              {endpointLabel(circuit, selected.from)} → {endpointLabel(circuit, selected.to)}
            </p>
            <p className="text-xs ink-dim">Drag either end to move the connection.</p>
            <button className={`btn block w-full`} onClick={() => onRemoveWire(selected)}>
              Remove wire
            </button>
          </>
        ) : (
          <p className="text-xs">Click a wire to select it.</p>
        )}
      </section>

      {allowSave && (
        <section data-tutorial="save" className="space-y-2">
          <h2 className="ink-strong">Save to library</h2>
          <input
            className="w-full border edge bg-transparent px-2 py-1 placeholder-faint"
            placeholder="Part name"
            value={nameDraft}
            onChange={(e) => onNameDraft(e.target.value)}
          />
          <button
            className={`btn block w-full`}
            disabled={circuit.parts.length === 0}
            onClick={onSave}
          >
            Save as part
          </button>
          {status && <p className="text-xs">{status}</p>}
        </section>
      )}

      {allowLibrary && (
        <section data-tutorial="library" className="space-y-2">
          <h2 className="ink-strong">Library</h2>
          {designs.length === 0 && <p className="text-xs">Saved parts appear here and in the Built list.</p>}
          {designs.map((design) => (
            <div key={design.id} className="space-y-1 border line p-2">
              <p className="truncate text-xs" title={design.name}>
                {design.name}
              </p>
              <p className="text-[10px] ink-faint">
                {design.circuit.parts.length} part{design.circuit.parts.length === 1 ? '' : 's'}
              </p>
              <div className="flex gap-1">
                <button className={`btn flex-1`} onClick={() => onLoadDesign(design.id)}>
                  Load
                </button>
                <button className={`btn flex-1`} onClick={() => onDeleteDesign(design.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {allowClear && (
        <button data-tutorial="clear" className={`btn block w-full`} onClick={onClear}>
          Clear canvas
        </button>
      )}
    </aside>
  )
}
