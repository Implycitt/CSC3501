import type { ComponentDef, Netlist } from './types.ts'
import { LOGIC_COMPONENTS } from './components/logic.ts'
import { ARITHMETIC_COMPONENTS } from './components/arithmetic.ts'
import { ROUTING_COMPONENTS } from './components/routing.ts'
import { SEQUENTIAL_COMPONENTS } from './components/sequential.ts'
import { HISTORICAL_COMPONENTS } from './components/historical.ts'
import { NETLISTS } from './netlists/index.ts'
import { PRIMITIVES } from './simulate.ts'
import { circuitToNetlist, type Circuit } from './circuit.ts'

const BASE_COMPONENTS: ComponentDef[] = [
  ...LOGIC_COMPONENTS,
  ...ARITHMETIC_COMPONENTS,
  ...ROUTING_COMPONENTS,
  ...SEQUENTIAL_COMPONENTS,
  ...HISTORICAL_COMPONENTS,
]

interface BuiltPart {
  def: ComponentDef
  netlist: Netlist
  inputs: string[]
  outputs: string[]
}

const built = new Map<string, BuiltPart>()

export function allComponents(): ComponentDef[] {
  return [...BASE_COMPONENTS, ...Array.from(built.values(), (part) => part.def)]
}

export function getComponent(id: string): ComponentDef | undefined {
  return allComponents().find((c) => c.id === id)
}

export function resolveForSim(id: string): { primitive?: string; netlist?: Netlist; inputs: string[]; outputs: string[] } | undefined {
  if (id in PRIMITIVES) return { primitive: id, inputs: PRIMITIVES[id].inputs, outputs: PRIMITIVES[id].outputs }
  const b = built.get(id)
  if (b) return { netlist: b.netlist, inputs: b.inputs, outputs: b.outputs }
  const netlist = NETLISTS[id]
  return netlist ? { netlist, inputs: netlist.inputs, outputs: netlist.outputs } : undefined
}

export function registerBuilt(name: string, circuit: Circuit): ComponentDef {
  const id = `built:${built.size + 1}:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const def: ComponentDef = { id, name, category: 'custom', description: `Built from ${circuit.parts.length} parts.` }
  const netlist = circuitToNetlist(circuit, (cid) => {
    const r = resolveForSim(cid)
    return r ? { inputs: r.inputs, outputs: r.outputs } : undefined
  })
  built.set(id, { def, netlist, inputs: [...circuit.inputs], outputs: [...circuit.outputs] })
  return def
}
