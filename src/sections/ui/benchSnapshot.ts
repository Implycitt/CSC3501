import type { Circuit } from '../../game/circuit.ts'
import { readCircuit, type StorageLike } from '../../game/library.ts'

export const BENCH_KEY = 'csc3501.bench.v1'

export interface BenchSnapshot {
  sectionId: string
  circuit: Circuit
  values: Record<string, boolean>
  nets: Record<string, boolean>
  ticks: number
}

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isBoolRecord = (value: unknown): value is Record<string, boolean> => {
  if (!isObject(value)) return false
  return Object.values(value).every((entry) => typeof entry === 'boolean')
}

const readSnapshot = (value: unknown): BenchSnapshot | null => {
  if (!isObject(value)) return null
  if (typeof value.sectionId !== 'string' || value.sectionId.length === 0) return null

  const circuit = readCircuit(value.circuit)
  if (!circuit || !isBoolRecord(value.values) || !isBoolRecord(value.nets)) return null
  if (typeof value.ticks !== 'number' || !Number.isFinite(value.ticks) || value.ticks < 0) return null

  return {
    sectionId: value.sectionId,
    circuit,
    values: value.values,
    nets: value.nets,
    ticks: Math.floor(value.ticks),
  }
}

const readAll = (storage: StorageLike | undefined): Record<string, BenchSnapshot> => {
  if (!storage) return {}
  try {
    const parsed: unknown = JSON.parse(storage.getItem(BENCH_KEY) ?? '{}')
    if (!isObject(parsed)) return {}

    const snapshots: Record<string, BenchSnapshot> = {}
    for (const [sectionId, raw] of Object.entries(parsed)) {
      const snapshot = readSnapshot(raw)
      if (snapshot && snapshot.sectionId === sectionId) snapshots[sectionId] = snapshot
    }
    return snapshots
  } catch {
    return {}
  }
}

const defaultStorage = (): StorageLike | undefined => {
  try {
    const storage = globalThis.localStorage as StorageLike | undefined
    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function'
      ? storage
      : undefined
  } catch {
    return undefined
  }
}

export function loadBenchSnapshot(
  sectionId: string,
  storage: StorageLike | undefined = defaultStorage(),
): BenchSnapshot | null {
  return readAll(storage)[sectionId] ?? null
}

export function saveBenchSnapshot(
  snapshot: BenchSnapshot,
  storage: StorageLike | undefined = defaultStorage(),
): void {
  if (!storage) return
  try {
    const snapshots = readAll(storage)
    snapshots[snapshot.sectionId] = snapshot
    storage.setItem(BENCH_KEY, JSON.stringify(snapshots))
  } catch {}
}

export function clearBenchSnapshot(
  sectionId: string,
  storage: StorageLike | undefined = defaultStorage(),
): void {
  if (!storage) return
  try {
    const snapshots = readAll(storage)
    if (!(sectionId in snapshots)) return
    delete snapshots[sectionId]
    storage.setItem(BENCH_KEY, JSON.stringify(snapshots))
  } catch {}
}
