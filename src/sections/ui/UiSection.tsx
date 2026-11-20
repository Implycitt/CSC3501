import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { allComponents, builtId, getComponent } from '../../game/registry.ts'
import { connectWire, EMPTY_CIRCUIT, rekeyCircuit, type Circuit, type PlacedPart, type Wire } from '../../game/circuit.ts'
import { addDesign, designsUsing, loadDesigns, removeDesign, type SavedDesign } from '../../game/library.ts'
import {
  CANVAS_H,
  CANVAS_W,
  CLICK_SLOP,
  HEAD_H,
  IO_H,
  IO_MARGIN,
  IO_W,
  PART_W,
  PART_X_MAX,
  PART_X_MIN,
  anchorOf,
  freePartSpot,
  ioPos,
  partHeight,
  portsOf,
} from './geometry.ts'
import { advance, createSim, type Sim } from './simulator.ts'
import PartShape from './PartShape.tsx'
import IoNode from './IoNode.tsx'
import WireLayer from './WireLayer.tsx'
import Palette from './Palette.tsx'
import Inspector from './Inspector.tsx'
import ComponentDoc from './ComponentDoc.tsx'
import TutorialPanel from './TutorialPanel.tsx'
import TutorialOverlay from './TutorialOverlay.tsx'
import PuzzleBrief from './PuzzleBrief.tsx'
import ExpectedTests from './ExpectedTests.tsx'
import SignalMonitor from './SignalMonitor.tsx'
import { TUTORIAL_SECTIONS } from '../../tutorial/index.ts'
import { isSectionComplete, loadProgress, nextIncompleteSection, persistProgress } from '../../tutorial/progress.ts'
import {
  closeSession,
  resumeSession,
  sectionCircuit,
  settleSession,
  startSession,
  submitSession,
  type TutorialSession,
} from '../../tutorial/session.ts'
import type { TutorialSection } from '../../tutorial/types.ts'
import { featuresFor } from '../../tutorial/features.ts'
import { gateLimitFor } from '../../tutorial/gateLimits.ts'
import { clearBenchSnapshot, loadBenchSnapshot, saveBenchSnapshot } from './benchSnapshot.ts'
import type { ManualTab } from '../game/FieldManual.tsx'

type Drag =
  | {
      kind: 'palette'
      componentId: string
      startX: number
      startY: number
      x: number
      y: number
      overBoard: boolean
      boardX: number
      boardY: number
    }
  | { kind: 'part'; uid: string; offsetX: number; offsetY: number }
  | { kind: 'io'; key: string; offsetX: number; offsetY: number }
  | { kind: 'wire'; from: string; startX: number; startY: number; x: number; y: number; pending?: Wire; target?: string }

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

interface UiSectionProps {
  focusSectionId?: string
  onSectionComplete?: (sectionId: string) => void
  onOpenManual?: (tab: ManualTab, section?: string) => void
}

let nextUid = 1

const reserveRestoredUids = (circuit: Circuit) => {
  for (const part of circuit.parts) {
    const match = /^p(\d+)$/.exec(part.uid)
    if (match) nextUid = Math.max(nextUid, Number(match[1]) + 1)
  }
}

interface InitialBench {
  tutorial: TutorialSession
  circuit: Circuit
  sim: Sim
}

function initialBench(sections: TutorialSection[], focusSectionId?: string): InitialBench {
  const progress = loadProgress()
  const tutorial = startSession(sections, progress)
  const section = focusSectionId ? sections.find((candidate) => candidate.id === focusSectionId) : undefined
  const snapshot = section && !isSectionComplete(progress, section) ? loadBenchSnapshot(section.id) : null
  const circuit = snapshot?.circuit ?? sectionCircuit(sections, tutorial.sectionId ?? focusSectionId ?? null)

  if (snapshot) reserveRestoredUids(circuit)
  const sim = createSim(circuit)
  if (!snapshot) return { tutorial, circuit, sim }

  return {
    tutorial: { ...tutorial, ticks: snapshot.ticks },
    circuit,
    sim: {
      ...sim,
      values: Object.fromEntries(circuit.inputs.map((name) => [name, snapshot.values[name] === true])),
      nets: new Map(Object.entries(snapshot.nets)),
    },
  }
}

function Build({ focusSectionId, onSectionComplete, onOpenManual }: UiSectionProps) {
  const sections = focusSectionId
    ? TUTORIAL_SECTIONS.filter((section) => section.id === focusSectionId)
    : TUTORIAL_SECTIONS
  const [initial] = useState(() => initialBench(sections, focusSectionId))
  const [tutorial, setTutorial] = useState<TutorialSession>(initial.tutorial)
  const [circuit, setCircuit] = useState<Circuit>(initial.circuit)
  const [sim, setSim] = useState<Sim>(initial.sim)
  const [designs, setDesigns] = useState<SavedDesign[]>(() => loadDesigns())
  const [docId, setDocId] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [selected, setSelected] = useState<Wire | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [status, setStatus] = useState('')
  const [submitNote, setSubmitNote] = useState('')
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
    observer.observe(document.documentElement)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const activeSection = tutorial.paused
    ? undefined
    : sections.find((section) => section.id === tutorial.sectionId)
  const activeStep = activeSection?.steps[tutorial.stepIndex]
  const puzzleMode = activeSection?.mode === 'puzzle'
  const baseFeatures = featuresFor(activeSection)
  const features = focusSectionId
    ? { ...baseFeatures, saveDesign: false, library: false, clearCanvas: false }
    : baseFeatures
  const focusedSection = focusSectionId ? sections[0] : undefined
  const gateLimit = gateLimitFor(focusedSection)
  const sectionComplete = focusedSection ? isSectionComplete(tutorial.progress, focusedSection) : false
  const resumeSection = tutorial.paused
    ? sections.find((section) => section.id === tutorial.sectionId)
    : nextIncompleteSection(sections, tutorial.progress)
  const benchComplete = useRef(sectionComplete)
  const latestBench = useRef({ circuit, sim, ticks: tutorial.ticks })

  useEffect(() => {
    latestBench.current = { circuit, sim, ticks: tutorial.ticks }
    benchComplete.current = sectionComplete
  }, [circuit, sim, tutorial.ticks, sectionComplete])

  useEffect(() => {
    if (!focusSectionId || !focusedSection) return
    if (sectionComplete) {
      clearBenchSnapshot(focusSectionId)
      return
    }

    const snapshot = {
      sectionId: focusSectionId,
      circuit,
      values: sim.values,
      nets: Object.fromEntries(sim.nets),
      ticks: tutorial.ticks,
    }
    const timer = window.setTimeout(() => saveBenchSnapshot(snapshot), 180)
    return () => window.clearTimeout(timer)
  }, [focusSectionId, focusedSection, sectionComplete, circuit, sim, tutorial.ticks])

  useEffect(() => {
    return () => {
      if (!focusSectionId || benchComplete.current) return

      const latest = latestBench.current
      saveBenchSnapshot({
        sectionId: focusSectionId,
        circuit: latest.circuit,
        values: latest.sim.values,
        nets: Object.fromEntries(latest.sim.nets),
        ticks: latest.ticks,
      })
    }
  }, [focusSectionId])

  const applySession = (next: TutorialSession) => {
    if (next === tutorial) return

    persistProgress(next.progress)
    setTutorial(next)

    for (const section of sections) {
      if (isSectionComplete(next.progress, section) && !isSectionComplete(tutorial.progress, section)) {
        onSectionComplete?.(section.id)
        clearBenchSnapshot(section.id)
        benchComplete.current = true
      }
    }
  }

  const settleTutorial = (nextCircuit: Circuit, nextSim: Sim, ticks: number = tutorial.ticks) =>
    applySession(settleSession(sections, tutorial, nextCircuit, nextSim.nets, ticks))

  const commit = (next: Circuit) => {
    const nextSim = createSim(next)
    setCircuit(next)
    setSim(nextSim)
    setSubmitNote('')
    if (!focusSectionId) settleTutorial(next, nextSim)
  }

  const exitTutorial = () => applySession(closeSession(tutorial))

  const resumeTutorial = (sectionId: string) => {
    const pausedHere = tutorial.paused && tutorial.sectionId === sectionId
    if (!pausedHere) {
      const next = sectionCircuit(sections, sectionId)
      setSelected(null)
      setCircuit(next)
      setSim(createSim(next))
    }
    applySession(resumeSession(sections, tutorial, sectionId))
  }

  const canvasPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    return rect ? { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale } : { x: 0, y: 0 }
  }

  const capture = (e: { pointerId: number }) => rootRef.current?.setPointerCapture(e.pointerId)

  const startPalette = (componentId: string, e: ReactPointerEvent) => {
    capture(e)
    setDrag({
      kind: 'palette',
      componentId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      overBoard: false,
      boardX: 0,
      boardY: 0,
    })
  }

  const startPart = (uid: string, e: ReactPointerEvent) => {
    const part = circuit.parts.find((candidate) => candidate.uid === uid)
    if (!part) return

    capture(e)
    const point = canvasPoint(e.clientX, e.clientY)
    setSelected(null)
    setSelectedPart(uid)
    setDrag({ kind: 'part', uid, offsetX: point.x - part.x, offsetY: point.y - part.y })

    if (circuit.parts[circuit.parts.length - 1]?.uid !== uid) {
      setCircuit((current) => ({ ...current, parts: [...current.parts.filter((p) => p.uid !== uid), part] }))
    }
  }

  const startIO = (key: string, e: ReactPointerEvent) => {
    capture(e)
    setSelected(null)
    setSelectedPart(null)
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
      const rect = canvasRef.current?.getBoundingClientRect()
      const overBoard =
        !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      const point = overBoard ? canvasPoint(e.clientX, e.clientY) : undefined
      setDrag({
        ...drag,
        x: e.clientX,
        y: e.clientY,
        overBoard,
        boardX: point?.x ?? 0,
        boardY: point?.y ?? 0,
      })
      return
    }

    const point = canvasPoint(e.clientX, e.clientY)

    if (drag.kind === 'io') {
      const key = drag.key
      const position = {
        x: clamp(point.x - drag.offsetX, IO_MARGIN, CANVAS_W - IO_W - IO_MARGIN),
        y: clamp(point.y - drag.offsetY, IO_MARGIN, CANVAS_H - IO_H - IO_MARGIN),
      }
      setCircuit((current) => ({ ...current, layout: { ...current.layout, [key]: position } }))
      return
    }

    if (drag.kind === 'part') {
      const { uid, offsetX, offsetY } = drag
      const position = {
        x: clamp(point.x - offsetX, PART_X_MIN, PART_X_MAX),
        y: clamp(point.y - offsetY, 0, CANVAS_H - HEAD_H),
      }
      setCircuit((current) => ({
        ...current,
        parts: current.parts.map((part) => (part.uid === uid ? { ...part, ...position } : part)),
      }))
      return
    }

    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-port]')?.dataset.port
    const wireTarget = target && target !== drag.from ? target : undefined
    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > CLICK_SLOP
    if (drag.pending && moved) {
      const pending = drag.pending
      const from = pending.to === drag.from ? pending.from : drag.from
      commit({ ...circuit, wires: circuit.wires.filter((wire) => wire !== pending) })
      setDrag({ ...drag, from, x: point.x, y: point.y, pending: undefined, target: wireTarget })
      return
    }

    setDrag({ ...drag, x: point.x, y: point.y, target: wireTarget })
  }

  const addPart = (componentId: string, x: number, y: number) => {
    if (gateLimit !== undefined && circuit.parts.length >= gateLimit) {
      setSubmitNote(`Gate limit reached (${gateLimit}). Remove a gate to try another combination.`)
      return
    }

    const part: PlacedPart = {
      uid: `p${nextUid++}`,
      componentId,
      x: clamp(x, PART_X_MIN, PART_X_MAX),
      y: clamp(y, 0, CANVAS_H - partHeight(componentId)),
    }
    setSelected(null)
    commit({ ...circuit, parts: [...circuit.parts, part] })
  }

  const addFromTray = (componentId: string) => {
    const spot = freePartSpot(circuit, componentId)
    addPart(componentId, spot.x, spot.y)
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!drag) return
    setDrag(null)

    if (drag.kind === 'palette') {
      if (drag.overBoard) {
        addPart(drag.componentId, drag.boardX - PART_W / 2, drag.boardY - HEAD_H / 2)
      } else if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) <= CLICK_SLOP) {
        addFromTray(drag.componentId)
      }
      return
    }

    if (drag.kind !== 'wire') return

    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-port]')?.dataset.port
    if (target && target !== drag.from) commit(connectWire(circuit, drag.from, target, portsOf))
    setSelected(null)
  }

  const removePart = (uid: string) => {
    const prefix = `part:${uid}:`
    setSelected(null)
    setSelectedPart(null)
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

  const resetBay = () => {
    if (!focusSectionId || !focusedSection) return

    clearBenchSnapshot(focusSectionId)
    benchComplete.current = false
    setDrag(null)
    setSelected(null)
    setSelectedPart(null)

    const next = sectionCircuit(sections, focusedSection.id)
    const nextSim = createSim(next)
    latestBench.current = { circuit: next, sim: nextSim, ticks: 0 }
    setCircuit(next)
    setSim(nextSim)
    setSubmitNote('')
    setTutorial((current) => ({ ...current, ticks: 0 }))
  }

  const toggleInput = (name: string) => {
    const next = advance(sim, { ...sim.values, [name]: !sim.values[name] }, false)
    setSim(next)
    setSubmitNote('')
    if (!focusSectionId) settleTutorial(circuit, next)
  }
  const clockTick = () => {
    const next = advance(sim, sim.values, true)
    setSim(next)
    setSubmitNote('')
    if (focusSectionId) {
      setTutorial((current) => ({ ...current, ticks: current.ticks + 1 }))
    } else {
      settleTutorial(circuit, next, tutorial.ticks + 1)
    }
  }

  const submitCircuit = () => {
    if (!activeSection) return

    const next = submitSession(sections, tutorial, circuit, tutorial.ticks)
    if (next === tutorial) {
      setSubmitNote('Not accepted yet — check the expected tests.')
      return
    }

    setSubmitNote('')
    applySession(next)
  }

  const saveBuilt = () => {
    const name = nameDraft.trim()
    if (!name || circuit.parts.length === 0) return

    const design = addDesign(name, circuit)
    if (!design) return

    setDesigns(loadDesigns())
    setStatus(`Saved ${design.name}. You can find it under Built.`)
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
      setStatus(`Take ${design.name} off the canvas before deleting it.`)
      return
    }

    const dependents = designsUsing(designs, id)
    if (dependents.length > 0) {
      setStatus(`${design.name} is still used by ${dependents.map((dependent) => dependent.name).join(', ')}.`)
      return
    }

    setDesigns(removeDesign(id))
    setStatus(`Deleted ${design.name}.`)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (drag) event.preventDefault()
        setDrag(null)
        setSelected(null)
        setSelectedPart(null)
        return
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') return

      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (selectedPart) {
        event.preventDefault()
        removePart(selectedPart)
        return
      }

      if (selected) {
        event.preventDefault()
        removeWire(selected)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const parts = allComponents()
  const selectedPartDef = circuit.parts.find((part) => part.uid === selectedPart)
  // Campaign boards expose only the parts relevant to their procedure, even
  // while paused; the free bench shows the full catalogue.
  const preferred = (activeSection ?? focusedSection)?.components ?? []
  const baseParts = parts
    .filter(
      (component) =>
        component.category !== 'custom' && (preferred.length === 0 || preferred.includes(component.id)),
    )
    .sort((left, right) => preferred.indexOf(left.id) - preferred.indexOf(right.id))
  const builtParts = parts.filter((component) => component.category === 'custom')
  const wireDrag = drag?.kind === 'wire' ? drag : null
  const wireStart = wireDrag ? anchorOf(circuit, wireDrag.from) : undefined
  const wireSnap = wireDrag?.target ? anchorOf(circuit, wireDrag.target) : undefined
  const ghost = wireStart && wireDrag ? { a: wireStart, b: wireSnap ?? { x: wireDrag.x, y: wireDrag.y } } : null

  const paletteDrag = drag?.kind === 'palette' && drag.overBoard ? drag : null
  const paletteGhost = paletteDrag
    ? (() => {
        const height = partHeight(paletteDrag.componentId)
        return {
          name: getComponent(paletteDrag.componentId)?.name ?? paletteDrag.componentId,
          height,
          x: clamp(paletteDrag.boardX - PART_W / 2, PART_X_MIN, PART_X_MAX),
          y: clamp(paletteDrag.boardY - HEAD_H / 2, 0, CANVAS_H - height),
        }
      })()
    : null

  const renderInspector = () => (
    <Inspector
      circuit={circuit}
      error={sim.error}
      selected={selected}
      nameDraft={nameDraft}
      status={status}
      designs={designs}
      onTick={clockTick}
      onRemoveWire={removeWire}
      selectedPart={selectedPartDef ? { name: getComponent(selectedPartDef.componentId)?.name ?? selectedPartDef.componentId } : null}
      onRemoveSelectedPart={() => selectedPart && removePart(selectedPart)}
      onDeselect={() => {
        setSelected(null)
        setSelectedPart(null)
      }}
      onNameDraft={setNameDraft}
      onSave={saveBuilt}
      onLoadDesign={loadSaved}
      onDeleteDesign={deleteSaved}
      onClear={() => commit(EMPTY_CIRCUIT)}
      onOpenManual={onOpenManual}
      allowSave={features.saveDesign}
      allowLibrary={features.library}
      allowClear={features.clearCanvas}
      compact={Boolean(focusSectionId)}
    />
  )

  return (
    <div
      ref={rootRef}
      className={focusSectionId ? 'level-panel-work select-none font-mono ink' : 'select-none p-2 font-mono ink sm:p-3'}
      data-dragging={drag ? 'true' : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <h1 className={`mb-1 text-lg ink-strong ${focusSectionId ? 'hidden' : ''}`}>Repair bench</h1>
      <p className={`mb-4 max-w-xl text-xs leading-relaxed ink-soft ${focusSectionId ? 'hidden' : ''}`}>
        Drag a part onto the board, then drag from one port to another to wire them together. Parts and inputs can both
        be moved by dragging. To change a connection, click the wire and drag one end somewhere else. Drop a wire on
        empty space and it is removed. Click a part and press Delete to take it off the canvas.
      </p>

      {focusSectionId && !activeSection && focusedSection && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border edge-soft px-3 py-2">
          <p className="text-[10px] amber">Procedure paused.</p>
          <button type="button" className="btn" onClick={() => resumeTutorial(focusedSection.id)}>
            Resume
          </button>
        </div>
      )}

      <div
        className={
          focusSectionId
            ? 'level-bench'
            : 'grid items-start gap-4 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_220px]'
        }
      >
        <Palette
          parts={baseParts}
          built={builtParts}
          onStartPart={startPalette}
          onAddPart={addFromTray}
          onShowDoc={setDocId}
          allowDocs={features.componentDocs}
          allowLibrary={features.library}
          preferred={preferred}
          gateCount={circuit.parts.length}
          gateLimit={gateLimit}
          compact={Boolean(focusSectionId)}
        />

        <div className={focusSectionId ? 'level-bench-stage' : 'contents'}>
          {focusSectionId && (
            <SignalMonitor circuit={circuit} sim={sim} ticks={tutorial.ticks} onToggle={toggleInput} onTick={clockTick} />
          )}

          <div
            ref={canvasRef}
            data-tutorial="canvas"
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('[data-part]')) return
              setSelected(null)
              setSelectedPart(null)
            }}
            className={`canvas-grid relative w-full overflow-hidden border edge-soft${focusSectionId ? ' level-bench-canvas' : ''}${wireDrag ? ' is-wiring' : ''}${paletteDrag ? ' is-drop-ready' : ''}`}
            style={{
              maxWidth: CANVAS_W,
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
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
              snapAt={wireSnap}
              onSelect={setSelected}
              onEdit={editWire}
            />

            {paletteGhost && (
              <div
                className="part-ghost"
                style={{ left: paletteGhost.x, top: paletteGhost.y, width: PART_W, height: paletteGhost.height }}
                aria-hidden="true"
              >
                <span className="part-ghost-name">{paletteGhost.name}</span>
                <span className="part-ghost-note">release to place</span>
              </div>
            )}

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
                  onMove={startIO}
                  onWire={startWire}
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
                  onMove={startIO}
                  onWire={startWire}
                />
              )
            })}

            {circuit.parts.map((part) => (
              <PartShape
                key={part.uid}
                part={part}
                wires={circuit.wires}
                nets={sim.nets}
                selected={part.uid === selectedPart}
                onMove={startPart}
                onWire={startWire}
                onRemove={removePart}
              />
            ))}
            </div>
          </div>

        </div>

        {focusSectionId ? (
          <aside className="level-bench-side" aria-label="Work order and bench controls">
            <div className="level-bench-side-main">
              {activeSection && !puzzleMode && activeStep && (
                <TutorialPanel
                  section={activeSection}
                  stepIndex={tutorial.stepIndex}
                  onExit={exitTutorial}
                  onOpenManual={onOpenManual}
                  compact
                />
              )}
              {activeSection && puzzleMode && <PuzzleBrief section={activeSection} />}
              {activeSection && <ExpectedTests goal={activeSection.goal} />}
              {renderInspector()}
            </div>
            <div className="level-bench-side-actions">
              {activeSection && (
                <button type="button" className="bench-submit" onClick={submitCircuit}>
                  Submit
                </button>
              )}
              {onOpenManual && (
                <button type="button" className="level-action" onClick={() => onOpenManual('circuits')}>
                  Manual
                </button>
              )}
              <button
                type="button"
                className="bench-reset"
                onClick={resetBay}
                title="Clear this bay's circuit, inputs, and clock count"
              >
                Reset bay
              </button>
              {submitNote && (
                <p className="level-bench-submit-note" role="status">
                  {submitNote}
                </p>
              )}
            </div>
          </aside>
        ) : (
          renderInspector()
        )}
      </div>

      {docId && <ComponentDoc componentId={docId} onClose={() => setDocId(null)} />}

      {!focusSectionId && activeSection && activeStep && (
        <TutorialPanel
          section={activeSection}
          stepIndex={tutorial.stepIndex}
          onExit={exitTutorial}
          onOpenManual={onOpenManual}
        />
      )}

      {!focusSectionId && !activeSection && resumeSection && (
        <button
          className={`btn fixed bottom-4 right-4 z-40`}
          onClick={() => resumeTutorial(resumeSection.id)}
        >
          Resume repair: {resumeSection.title}
        </button>
      )}

      {!focusSectionId && !puzzleMode && <TutorialOverlay target={activeStep?.target} />}

      {drag?.kind === 'palette' && !drag.overBoard && (
        <div className="palette-drag-chip" style={{ left: drag.x + 14, top: drag.y + 14 }} aria-hidden="true">
          <span className="palette-drag-plus">+</span>
          <span>{getComponent(drag.componentId)?.name}</span>
          <em>drag onto the board</em>
        </div>
      )}
    </div>
  )
}

export default Build
