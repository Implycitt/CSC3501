import type { Netlist } from './types.ts'

export const PRIMITIVES: Record<string, { inputs: string[]; outputs: string[]; eval: (i: Record<string, boolean>) => boolean }> = {
  nand: { inputs: ['a', 'b'], outputs: ['y'], eval: (i) => !(i.a && i.b) },
  nor: { inputs: ['a', 'b'], outputs: ['y'], eval: (i) => !(i.a || i.b) },
  const0: { inputs: [], outputs: ['y'], eval: () => false },
  const1: { inputs: [], outputs: ['y'], eval: () => true },
}

export interface FlatGate {
  type: keyof typeof PRIMITIVES
  inputs: Record<string, string>
  output: string
}

export type ResolveComponent = (id: string) => { netlist?: Netlist; primitive?: string; inputs: string[]; outputs: string[] } | undefined

export function flatten(
  netlist: Netlist,
  resolve: ResolveComponent,
  prefix = '',
  portMap: Record<string, string> = {},
  out: FlatGate[] = [],
): FlatGate[] {
  const net = (name: string) => portMap[name] ?? `${prefix}${name}`
  for (const inst of netlist.instances) {
    const def = resolve(inst.component)
    if (!def) throw new Error(`Unknown component: ${inst.component}`)
    const innerMap: Record<string, string> = {}
    for (const [port, n] of Object.entries(inst.connections)) innerMap[port] = net(n)
    const path = `${prefix}${inst.id}/`
    if (def.primitive) {
      const p = PRIMITIVES[def.primitive]
      out.push({ type: def.primitive as keyof typeof PRIMITIVES, inputs: pick(innerMap, p.inputs), output: innerMap.y ?? '' })
    } else if (def.netlist) {
      flatten(def.netlist, resolve, path, innerMap, out)
    }
  }
  return out
}

function pick(map: Record<string, string>, keys: string[]): Record<string, string> {
  const r: Record<string, string> = {}
  for (const k of keys) r[k] = map[k] ?? ''
  return r
}

export interface SimState {
  nets: Map<string, boolean>
}

export function newState(): SimState {
  return { nets: new Map() }
}

export function tick(gates: FlatGate[], state: SimState, inputs: Record<string, boolean>, clockNet = 'clk'): Map<string, boolean> {
  settle(gates, state, { ...inputs, [clockNet]: false })
  settle(gates, state, { ...inputs, [clockNet]: true })
  return settle(gates, state, { ...inputs, [clockNet]: false })
}

export function settle(gates: FlatGate[], state: SimState, inputs: Record<string, boolean>, maxPasses = 100): Map<string, boolean> {
  for (const [k, v] of Object.entries(inputs)) state.nets.set(k, v)
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false
    for (const g of gates) {
      const vals: Record<string, boolean> = {}
      for (const [port, n] of Object.entries(g.inputs)) vals[port] = state.nets.get(n) ?? false
      const y = PRIMITIVES[g.type].eval(vals)
      if (state.nets.get(g.output) !== y) {
        state.nets.set(g.output, y)
        changed = true
      }
    }
    if (!changed) return state.nets
  }
  throw new Error('Circuit did not settle (oscillation)')
}
