import { describe, expect, test } from 'bun:test'
import type { Circuit } from '../../src/game/circuit.ts'
import {
  BENCH_KEY,
  clearBenchSnapshot,
  loadBenchSnapshot,
  saveBenchSnapshot,
  type BenchSnapshot,
} from '../../src/sections/ui/benchSnapshot.ts'

const circuit: Circuit = {
  parts: [{ uid: 'p7', componentId: 'and', x: 180, y: 20 }],
  wires: [{ from: 'in:a', to: 'part:p7:a' }],
  inputs: ['a'],
  outputs: ['y'],
  layout: {},
}

const snapshot = (sectionId: string, ticks = 1): BenchSnapshot => ({
  sectionId,
  circuit,
  values: { a: true },
  nets: { a: true, 'p7.y': true, y: true },
  ticks,
})

const fakeStorage = () => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

describe('bench snapshots', () => {
  test('round-trips a circuit, values, nets and tick count', () => {
    const storage = fakeStorage()
    saveBenchSnapshot(snapshot('memory-shift', 3), storage)

    expect(storage.data.get(BENCH_KEY)).toBeTruthy()
    expect(loadBenchSnapshot('memory-shift', storage)).toEqual(snapshot('memory-shift', 3))
    expect(loadBenchSnapshot('memory-d-flip-flop', storage)).toBeNull()
  })

  test('keeps missions isolated and clears only the requested bay', () => {
    const storage = fakeStorage()
    saveBenchSnapshot(snapshot('memory-shift', 2), storage)
    saveBenchSnapshot(snapshot('memory-d-flip-flop', 1), storage)

    clearBenchSnapshot('memory-shift', storage)

    expect(loadBenchSnapshot('memory-shift', storage)).toBeNull()
    expect(loadBenchSnapshot('memory-d-flip-flop', storage)).toEqual(snapshot('memory-d-flip-flop', 1))
  })

  test('ignores corrupt snapshots and malformed storage', () => {
    const storage = fakeStorage()
    storage.setItem(
      BENCH_KEY,
      JSON.stringify({
        good: snapshot('good', 1),
        badCircuit: { ...snapshot('badCircuit'), circuit: { parts: 'nope' } },
        badTick: { ...snapshot('badTick'), ticks: -1 },
        badId: { ...snapshot('other'), sectionId: 'different' },
      }),
    )

    expect(loadBenchSnapshot('good', storage)).toEqual(snapshot('good', 1))
    expect(loadBenchSnapshot('badCircuit', storage)).toBeNull()
    expect(loadBenchSnapshot('badTick', storage)).toBeNull()
    expect(loadBenchSnapshot('different', storage)).toBeNull()

    storage.setItem(BENCH_KEY, 'not json')
    expect(loadBenchSnapshot('good', storage)).toBeNull()
  })

  test('survives missing or throwing storage', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }

    expect(loadBenchSnapshot('memory-shift', undefined)).toBeNull()
    expect(() => saveBenchSnapshot(snapshot('memory-shift'), undefined)).not.toThrow()
    expect(loadBenchSnapshot('memory-shift', broken)).toBeNull()
    expect(() => saveBenchSnapshot(snapshot('memory-shift'), broken)).not.toThrow()
    expect(() => clearBenchSnapshot('memory-shift', broken)).not.toThrow()
  })
})
