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

export interface BuiltDesign {
  id: string
  name: string
  circuit: Circuit
}

interface BuiltPart {
  def: ComponentDef
  circuit: Circuit
  inputs: string[]
  outputs: string[]
  netlist?: Netlist
}

const built = new Map<string, BuiltPart>()
const resolving = new Set<string>()

export const builtId = (designId: string) => `built:${designId}`

export function allComponents(): ComponentDef[] {
  return [...BASE_COMPONENTS, ...Array.from(built.values(), (part) => part.def)]
}

export function getComponent(id: string): ComponentDef | undefined {
  return allComponents().find((c) => c.id === id)
}

function portsOfComponent(id: string): { inputs: string[]; outputs: string[] } | undefined {
  const resolved = resolveForSim(id)
  return resolved ? { inputs: resolved.inputs, outputs: resolved.outputs } : undefined
}

function netlistOf(part: BuiltPart): Netlist {
  if (part.netlist) return part.netlist
  if (resolving.has(part.def.id)) throw new Error(`Circular component: ${part.def.name}`)

  resolving.add(part.def.id)
  try {
    part.netlist = circuitToNetlist(part.circuit, portsOfComponent)
    return part.netlist
  } finally {
    resolving.delete(part.def.id)
  }
}

export function resolveForSim(id: string): { primitive?: string; netlist?: Netlist; inputs: string[]; outputs: string[] } | undefined {
  if (id in PRIMITIVES) return { primitive: id, inputs: PRIMITIVES[id].inputs, outputs: PRIMITIVES[id].outputs }
  const b = built.get(id)
  if (b) return { netlist: netlistOf(b), inputs: b.inputs, outputs: b.outputs }
  const netlist = NETLISTS[id]
  return netlist ? { netlist, inputs: netlist.inputs, outputs: netlist.outputs } : undefined
}

export function registerBuilt(design: BuiltDesign): ComponentDef {
  const count = design.circuit.parts.length
  const def: ComponentDef = {
    id: builtId(design.id),
    name: design.name,
    category: 'custom',
    description: `Built from ${count} part${count === 1 ? '' : 's'}.`,
  }
  built.set(def.id, {
    def,
    circuit: design.circuit,
    inputs: [...design.circuit.inputs],
    outputs: [...design.circuit.outputs],
  })
  return def
}

export function unregisterBuilt(id: string): boolean {
  return built.delete(id.startsWith('built:') ? id : builtId(id))
}

export function clearBuilt(): void {
  built.clear()
  resolving.clear()
}
