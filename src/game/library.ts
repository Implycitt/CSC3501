import type { Circuit, PlacedPart, Wire } from './circuit.ts'
import { builtId, registerBuilt, unregisterBuilt } from './registry.ts'

export interface SavedDesign {
  id: string
  name: string
  circuit: Circuit
  createdAt: number
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const DESIGNS_KEY = 'csc3501.designs.v1'
export const MAX_NAME_LENGTH = 60

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isName = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 80

function isEndpoint(key: string): boolean {
  const [kind, ...rest] = key.split(':')
  if (kind === 'in' || kind === 'out') return rest.length === 1 && rest[0].length > 0
  if (kind === 'part') return rest.length === 2 && rest[0].length > 0 && rest[1].length > 0
  return false
}

function endpointUid(key: string): string | undefined {
  return key.startsWith('part:') ? key.split(':')[1] : undefined
}

function readNames(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null

  const names: string[] = []
  for (const item of value) {
    if (typeof item !== 'string' || item.length === 0 || item.length > 80) return null
    if (!names.includes(item)) names.push(item)
  }
  return names
}

function readPart(value: unknown): PlacedPart | null {
  if (!isObject(value)) return null
  if (!isName(value.uid) || !isName(value.componentId)) return null
  if (value.x !== undefined && !isNumber(value.x)) return null
  if (value.y !== undefined && !isNumber(value.y)) return null

  return {
    uid: value.uid,
    componentId: value.componentId,
    x: isNumber(value.x) ? value.x : 0,
    y: isNumber(value.y) ? value.y : 0,
  }
}

function readWire(value: unknown): Wire | null {
  if (!isObject(value)) return null
  if (typeof value.from !== 'string' || typeof value.to !== 'string') return null
  if (!isEndpoint(value.from) || !isEndpoint(value.to) || value.from === value.to) return null
  return { from: value.from, to: value.to }
}

export function readCircuit(value: unknown): Circuit | null {
  if (!isObject(value)) return null

  const inputs = readNames(value.inputs)
  const outputs = readNames(value.outputs)
  if (!inputs || !outputs || !Array.isArray(value.parts) || !Array.isArray(value.wires)) return null

  const parts: PlacedPart[] = []
  const uids = new Set<string>()
  for (const raw of value.parts) {
    const part = readPart(raw)
    if (part && !uids.has(part.uid)) {
      uids.add(part.uid)
      parts.push(part)
    }
  }

  const wiresBySink = new Map<string, Wire>()
  for (const raw of value.wires) {
    const wire = readWire(raw)
    if (!wire) continue

    const sourceUid = endpointUid(wire.from)
    const sinkUid = endpointUid(wire.to)
    if (sourceUid && !uids.has(sourceUid)) continue
    if (sinkUid && !uids.has(sinkUid)) continue
    if (wire.from.startsWith('out:')) continue
    if (wire.to.startsWith('in:')) continue
    if (wire.from.startsWith('in:') && !inputs.includes(wire.from.slice(3))) continue
    if (wire.to.startsWith('out:') && !outputs.includes(wire.to.slice(4))) continue

    wiresBySink.set(wire.to, wire)
  }

  const layout: Circuit['layout'] = {}
  if (isObject(value.layout)) {
    for (const [key, point] of Object.entries(value.layout)) {
      if (isEndpoint(key) && isObject(point) && isNumber(point.x) && isNumber(point.y)) {
        layout[key] = { x: point.x, y: point.y }
      }
    }
  }

  return { parts, wires: [...wiresBySink.values()], inputs, outputs, layout }
}

export function readDesign(value: unknown): SavedDesign | null {
  if (!isObject(value)) return null
  if (!isName(value.id) || typeof value.name !== 'string') return null

  const name = value.name.trim().slice(0, MAX_NAME_LENGTH)
  const circuit = readCircuit(value.circuit)
  if (!name || !circuit) return null

  return {
    id: value.id,
    name,
    circuit,
    createdAt: isNumber(value.createdAt) ? value.createdAt : Date.now(),
  }
}

export function parseDesigns(raw: string | null): SavedDesign[] {
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const designs: SavedDesign[] = []
  const ids = new Set<string>()
  for (const value of parsed) {
    const design = readDesign(value)
    if (!design || ids.has(design.id)) continue
    ids.add(design.id)
    designs.push(design)
  }
  return designs
}

function defaultStorage(): StorageLike | undefined {
  try {
    const storage = globalThis.localStorage as StorageLike | undefined
    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function' ? storage : undefined
  } catch {
    return undefined
  }
}

export function loadDesigns(storage: StorageLike | undefined = defaultStorage()): SavedDesign[] {
  const designs = parseDesigns(storage?.getItem(DESIGNS_KEY) ?? null)
  for (const design of designs) registerBuilt(design)
  return designs
}

export function persistDesigns(designs: SavedDesign[], storage: StorageLike | undefined = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(DESIGNS_KEY, JSON.stringify(designs))
  } catch {}

}

function newId(designs: SavedDesign[]): string {
  let id = ''
  do {
    id = `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  } while (designs.some((design) => design.id === id))
  return id
}

export function addDesign(
  name: string,
  circuit: Circuit,
  storage: StorageLike | undefined = defaultStorage(),
): SavedDesign | null {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
  if (!trimmed) return null

  const designs = loadDesigns(storage)
  const snapshot = readCircuit(circuit)
  if (!snapshot) return null

  const design: SavedDesign = { id: newId(designs), name: trimmed, circuit: snapshot, createdAt: Date.now() }
  persistDesigns([...designs, design], storage)
  registerBuilt(design)
  return design
}

export function removeDesign(id: string, storage: StorageLike | undefined = defaultStorage()): SavedDesign[] {
  const remaining = loadDesigns(storage).filter((design) => design.id !== id)
  persistDesigns(remaining, storage)
  unregisterBuilt(id)
  return remaining
}

export function designsUsing(designs: SavedDesign[], id: string): SavedDesign[] {
  const defId = builtId(id)
  return designs.filter((design) => design.circuit.parts.some((part) => part.componentId === defId))
}
