import { resolveForSim } from '../../game/registry.ts'
import type { Circuit } from '../../game/circuit.ts'

export const CANVAS_W = 820
export const CANVAS_H = 560
export const PART_W = 140
export const HEAD_H = 26
export const ROW_H = 24
export const PART_PAD = 8
export const IO_W = 104
export const IO_H = 28
export const IO_GAP = 44
export const MARGIN = 20
export const OUT_X = CANVAS_W - MARGIN - IO_W
export const CLICK_SLOP = 4

export interface Point {
  x: number
  y: number
}

export interface Ports {
  inputs: string[]
  outputs: string[]
}

export function portsOf(componentId: string): Ports | undefined {
  const resolved = resolveForSim(componentId)
  return resolved ? { inputs: resolved.inputs, outputs: resolved.outputs } : undefined
}

export function rowCount(componentId: string): number {
  const ports = portsOf(componentId)
  return Math.max(ports?.inputs.length ?? 0, ports?.outputs.length ?? 0, 1)
}

export function partHeight(componentId: string): number {
  return HEAD_H + rowCount(componentId) * ROW_H + PART_PAD
}

export function ioPos(circuit: Circuit, key: string): Point {
  const saved = circuit.layout[key]
  if (saved) return saved

  if (key.startsWith('in:')) {
    const index = Math.max(0, circuit.inputs.indexOf(key.slice(3)))
    return { x: MARGIN, y: MARGIN + index * IO_GAP }
  }

  const index = Math.max(0, circuit.outputs.indexOf(key.slice(4)))
  return { x: OUT_X, y: MARGIN + index * IO_GAP }
}

export function anchorOf(circuit: Circuit, key: string): Point | undefined {
  if (key.startsWith('in:') || key.startsWith('out:')) {
    const isInput = key.startsWith('in:')
    const name = isInput ? key.slice(3) : key.slice(4)
    if (!(isInput ? circuit.inputs : circuit.outputs).includes(name)) return undefined

    const position = ioPos(circuit, key)
    return { x: isInput ? position.x + IO_W : position.x, y: position.y + IO_H / 2 }
  }

  const [, uid, port] = key.split(':')
  const part = circuit.parts.find((candidate) => candidate.uid === uid)
  const ports = part && portsOf(part.componentId)
  if (!part || !ports) return undefined

  const outputRow = ports.outputs.indexOf(port)
  if (outputRow >= 0) return { x: part.x + PART_W, y: part.y + HEAD_H + outputRow * ROW_H + ROW_H / 2 }

  const inputRow = ports.inputs.indexOf(port)
  if (inputRow >= 0) return { x: part.x, y: part.y + HEAD_H + inputRow * ROW_H + ROW_H / 2 }

  return undefined
}

export function wirePath(a: Point, b: Point): string {
  const bend = Math.max(40, Math.abs(b.x - a.x) / 2)
  return `M${a.x} ${a.y} C${a.x + bend} ${a.y} ${b.x - bend} ${b.y} ${b.x} ${b.y}`
}
