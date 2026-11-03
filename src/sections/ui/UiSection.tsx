import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { allComponents, builtId, getComponent } from '../../game/registry.ts'
import { connectWire, EMPTY_CIRCUIT, rekeyCircuit, type Circuit, type PlacedPart, type Wire } from '../../game/circuit.ts'
import { addDesign, designsUsing, loadDesigns, removeDesign, type SavedDesign } from '../../game/library.ts'
import { CANVAS_H, CANVAS_W, CLICK_SLOP, HEAD_H, IO_H, IO_W, PART_W, anchorOf, ioPos, partHeight, portsOf } from './geometry.ts'
import { advance, createSim, type Sim } from './simulator.ts'
import PartShape from './PartShape.tsx'
import IoNode from './IoNode.tsx'
import WireLayer from './WireLayer.tsx'
import Palette from './Palette.tsx'
import Inspector from './Inspector.tsx'
import ComponentDoc from './ComponentDoc.tsx'

type Drag =
  | { kind: 'palette'; componentId: string; startX: number; startY: number; x: number; y: number }
  | { kind: 'part'; uid: string; offsetX: number; offsetY: number }
  | { kind: 'io'; key: string; offsetX: number; offsetY: number }
  | { kind: 'wire'; from: string; startX: number; startY: number; x: number; y: number; pending?: Wire }

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

let nextUid = 1

function Build() {
  const [circuit, setCircuit] = useState<Circuit>(EMPTY_CIRCUIT)
  const [sim, setSim] = useState<Sim>(() => createSim(EMPTY_CIRCUIT))
  const [designs, setDesigns] = useState<SavedDesign[]>(() => loadDesigns())
  const [docId, setDocId] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [selected, setSelected] = useState<Wire | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [status, setStatus] = useState('')
  const [scale, setScale] = useState(1)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return

    const update = () => setScale(Math.min(1, element.clientWidth / CANVAS_W))
    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const commit = (next: Circuit) => {
    setCircuit(next)
    setSim(createSim(next))
  }

  const canvasPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    return rect ? { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale } : { x: 0, y: 0 }
  }

  const capture = (e: { pointerId: number }) => rootRef.current?.setPointerCapture(e.pointerId)

  const startPalette = (componentId: string, e: ReactPointerEvent) => {
    capture(e)
    setDrag({ kind: 'palette', componentId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY })
  }

  const startPart = (uid: string, e: ReactPointerEvent) => {
    const part = circuit.parts.find((candidate) => candidate.uid === uid)
    if (!part) return

    capture(e)
    const point = canvasPoint(e.clientX, e.clientY)
    setDrag({ kind: 'part', uid, offsetX: point.x - part.x, offsetY: point.y - part.y })
  }

  const startIO = (key: string, e: ReactPointerEvent) => {
    capture(e)
    const base = ioPos(circuit, key)
    const point = canvasPoint(e.clientX, e.clientY)
    setDrag({ kind: 'io', key, offsetX: point.x - base.x, offsetY: point.y - base.y })
  }

  const startWire = (key: string, e: ReactPointerEvent) => {
    capture(e)
    const point = canvasPoint(e.clientX, e.clientY)
    const pending = circuit.wires.find((wire) => wire.to === key)
    setDrag({ kind: 'wire', from: key, startX: e.clientX, startY: e.clientY, x: point.x, y: point.y, pending })
  }

  const editWire = (wire: Wire, end: 'from' | 'to', e: { pointerId: number; clientX: number; clientY: number }) => {
    capture(e)
    const point = canvasPoint(e.clientX, e.clientY)
    setSelected(null)
    setDrag({
      kind: 'wire',
      from: end === 'to' ? wire.from : wire.to,
      startX: e.clientX,
      startY: e.clientY,
      x: point.x,
      y: point.y,
      pending: wire,
    })
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag) return

    if (drag.kind === 'palette') {
      setDrag({ ...drag, x: e.clientX, y: e.clientY })
      return
    }

    const point = canvasPoint(e.clientX, e.clientY)

    if (drag.kind === 'io') {
      const key = drag.key
      const position = {
        x: clamp(point.x - drag.offsetX, 0, CANVAS_W - IO_W),
        y: clamp(point.y - drag.offsetY, 0, CANVAS_H - IO_H),
      }
      setCircuit((current) => ({ ...current, layout: { ...current.layout, [key]: position } }))
      return
    }

    if (drag.kind === 'part') {
      const { uid, offsetX, offsetY } = drag
      const position = {
        x: clamp(point.x - offsetX, 0, CANVAS_W - PART_W),
        y: clamp(point.y - offsetY, 0, CANVAS_H - HEAD_H),
      }
      setCircuit((current) => ({
        ...current,
        parts: current.parts.map((part) => (part.uid === uid ? { ...part, ...position } : part)),
      }))
      return
    }

    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > CLICK_SLOP
    if (drag.pending && moved) {
      const pending = drag.pending
      const from = pending.to === drag.from ? pending.from : drag.from
      commit({ ...circuit, wires: circuit.wires.filter((wire) => wire !== pending) })
      setDrag({ ...drag, from, x: point.x, y: point.y, pending: undefined })
      return
    }

    setDrag({ ...drag, x: point.x, y: point.y })
  }

  const addPart = (componentId: string, x: number, y: number) => {
    const part: PlacedPart = {
      uid: `p${nextUid++}`,
      componentId,
      x: clamp(x, 0, CANVAS_W - PART_W),
      y: clamp(y, 0, CANVAS_H - partHeight(componentId)),
    }
    setSelected(null)
    commit({ ...circuit, parts: [...circuit.parts, part] })
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!drag) return
    setDrag(null)

    if (drag.kind === 'palette') {
      const rect = canvasRef.current?.getBoundingClientRect()
      const inside =
        !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom

      if (inside) {
        const point = canvasPoint(e.clientX, e.clientY)
        addPart(drag.componentId, point.x - PART_W / 2, point.y - HEAD_H / 2)
      } else if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) <= CLICK_SLOP) {
        addPart(drag.componentId, CANVAS_W / 2 - PART_W / 2 + (circuit.parts.length % 5) * 20, CANVAS_H / 2 - HEAD_H)
      }
      return
    }

    if (drag.kind !== 'wire') return

    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-port]')?.dataset.port
    if (target && target !== drag.from) commit(connectWire(circuit, drag.from, target, portsOf))
    setSelected(null)
  }

  const addIO = (kind: 'in' | 'out') => {
    const names = kind === 'in' ? circuit.inputs : circuit.outputs
    let number = names.length + 1
    while (names.includes(`${kind}${number}`)) number++

    const name = `${kind}${number}`
    setSelected(null)
    commit(
      kind === 'in'
        ? { ...circuit, inputs: [...circuit.inputs, name] }
        : { ...circuit, outputs: [...circuit.outputs, name] },
    )
  }

  const addClock = () => {
    if (circuit.inputs.includes('clk')) return
    commit({ ...circuit, inputs: [...circuit.inputs, 'clk'] })
  }

  const removeIO = (kind: 'in' | 'out', name: string) => {
    const key = `${kind}:${name}`
    const layout = { ...circuit.layout }
    delete layout[key]

    commit({
      ...circuit,
      inputs: kind === 'in' ? circuit.inputs.filter((input) => input !== name) : circuit.inputs,
      outputs: kind === 'out' ? circuit.outputs.filter((output) => output !== name) : circuit.outputs,
      wires: circuit.wires.filter((wire) => wire.from !== key && wire.to !== key),
      layout,
    })
  }

  const removePart = (uid: string) => {
    const prefix = `part:${uid}:`
    setSelected(null)
    commit({
      ...circuit,
      parts: circuit.parts.filter((part) => part.uid !== uid),
      wires: circuit.wires.filter((wire) => !wire.from.startsWith(prefix) && !wire.to.startsWith(prefix)),
    })
  }

  const removeWire = (wire: Wire) => {
    setSelected(null)
    commit({ ...circuit, wires: circuit.wires.filter((candidate) => candidate !== wire) })
  }

  const toggleInput = (name: string) => setSim(advance(sim, { ...sim.values, [name]: !sim.values[name] }, false))
  const clockTick = () => setSim(advance(sim, sim.values, true))

  const saveBuilt = () => {
    const name = nameDraft.trim()
    if (!name || circuit.parts.length === 0) return

    const design = addDesign(name, circuit)
    if (!design) return

    setDesigns(loadDesigns())
    setStatus(`Saved ${design.name}. It is now in the Built list.`)
    setNameDraft('')
    setSelected(null)
  }

  const loadSaved = (id: string) => {
    const design = designs.find((candidate) => candidate.id === id)
    if (!design) return

    setSelected(null)
    commit(rekeyCircuit(design.circuit, () => `p${nextUid++}`))
    setStatus(`Loaded ${design.name}.`)
  }

  const deleteSaved = (id: string) => {
    const design = designs.find((candidate) => candidate.id === id)
    if (!design) return

    if (circuit.parts.some((part) => part.componentId === builtId(id))) {
      setStatus(`Remove ${design.name} from the canvas before deleting it.`)
      return
    }

    const dependents = designsUsing(designs, id)
    if (dependents.length > 0) {
      setStatus(`${design.name} is used by ${dependents.map((dependent) => dependent.name).join(', ')}.`)
      return
    }

    setDesigns(removeDesign(id))
    setStatus(`Deleted ${design.name}.`)
  }

  const parts = allComponents()
  const baseParts = parts.filter((component) => component.category !== 'custom')
  const builtParts = parts.filter((component) => component.category === 'custom')
  const ghostAnchor = drag?.kind === 'wire' ? anchorOf(circuit, drag.from) : undefined
  const ghost = ghostAnchor && drag?.kind === 'wire' ? { a: ghostAnchor, b: { x: drag.x, y: drag.y } } : null

  return (
    <div
      ref={rootRef}
      className="select-none p-4 font-mono text-amber-400"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <h1 className="mb-1 text-lg text-amber-300">Circuit sandbox</h1>
      <p className="mb-4 max-w-xl text-xs leading-relaxed text-amber-500">
        Drag a part onto the grid, then drag between its ports to wire it. Every part and port node moves by drag. To
        change a connection, click the wire and drag either end somewhere else — dropping it on empty space removes it.
      </p>

      <div className="grid items-start gap-4 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_220px]">
        <Palette
          parts={baseParts}
          built={builtParts}
          onStartPart={startPalette}
          onShowDoc={setDocId}
          onAddInput={() => addIO('in')}
          onAddOutput={() => addIO('out')}
          onAddClock={addClock}
        />

        <div
          ref={canvasRef}
          onPointerDown={() => setSelected(null)}
          className="relative w-full overflow-hidden border border-amber-800"
          style={{
            maxWidth: CANVAS_W,
            aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
            backgroundImage: 'radial-gradient(circle, rgb(120 53 15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <WireLayer
              circuit={circuit}
              nets={sim.nets}
              selected={selected}
              ghost={ghost}
              onSelect={setSelected}
              onEdit={editWire}
            />

            {circuit.inputs.map((name) => {
              const key = `in:${name}`
              return (
                <IoNode
                  key={key}
                  kind="in"
                  name={name}
                  position={ioPos(circuit, key)}
                  lit={sim.nets.get(name) === true}
                  value={sim.values[name]}
                  clock={name === 'clk'}
                  onMove={startIO}
                  onWire={startWire}
                  onRemove={removeIO}
                  onToggle={toggleInput}
                />
              )
            })}

            {circuit.outputs.map((name) => {
              const key = `out:${name}`
              return (
                <IoNode
                  key={key}
                  kind="out"
                  name={name}
                  position={ioPos(circuit, key)}
                  lit={sim.nets.get(name) === true}
                  value={sim.nets.get(name)}
                  clock={false}
                  onMove={startIO}
                  onWire={startWire}
                  onRemove={removeIO}
                  onToggle={toggleInput}
                />
              )
            })}

            {circuit.parts.map((part) => (
              <PartShape
                key={part.uid}
                part={part}
                wires={circuit.wires}
                nets={sim.nets}
                onMove={startPart}
                onWire={startWire}
                onRemove={removePart}
              />
            ))}
          </div>
        </div>

        <Inspector
          circuit={circuit}
          error={sim.error}
          selected={selected}
          nameDraft={nameDraft}
          status={status}
          designs={designs}
          onTick={clockTick}
          onRemoveWire={removeWire}
          onNameDraft={setNameDraft}
          onSave={saveBuilt}
          onLoadDesign={loadSaved}
          onDeleteDesign={deleteSaved}
          onClear={() => commit(EMPTY_CIRCUIT)}
        />
      </div>

      {docId && <ComponentDoc componentId={docId} onClose={() => setDocId(null)} />}

      {drag?.kind === 'palette' && (
        <div
          className="pointer-events-none fixed border border-amber-400 bg-black px-2 py-1 text-xs"
          style={{ left: drag.x + 12, top: drag.y + 12 }}
        >
          {getComponent(drag.componentId)?.name}
        </div>
      )}
    </div>
  )
}

export default Build
