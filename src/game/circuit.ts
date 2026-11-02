import type { Netlist, Instance } from './types.ts'

export interface PlacedPart {
  uid: string
  componentId: string
  x: number
  y: number
}

export interface Wire {
  from: string
  to: string
}

export interface Circuit {
  parts: PlacedPart[]
  wires: Wire[]
  inputs: string[]
  outputs: string[]
  layout: Record<string, { x: number; y: number }>
}

export const EMPTY_CIRCUIT: Circuit = { parts: [], wires: [], inputs: [], outputs: [], layout: {} }

export type PortLookup = (componentId: string) => { inputs: string[]; outputs: string[] } | undefined

export function partKey(uid: string, port: string): string {
  return `part:${uid}:${port}`
}

export function netOf(source: string): string {
  if (source.startsWith('in:')) return source.slice(3)
  const [, uid, port] = source.split(':')
  return `${uid}.${port}`
}

export function connectWire(circuit: Circuit, a: string, b: string, ports: PortLookup): Circuit {
  const role = (key: string): 'source' | 'sink' | undefined => {
    if (key.startsWith('in:')) return circuit.inputs.includes(key.slice(3)) ? 'source' : undefined
    if (key.startsWith('out:')) return circuit.outputs.includes(key.slice(4)) ? 'sink' : undefined
    const [, uid, port] = key.split(':')
    const part = circuit.parts.find((p) => p.uid === uid)
    const def = part ? ports(part.componentId) : undefined
    if (!def) return undefined
    if (def.outputs.includes(port)) return 'source'
    if (def.inputs.includes(port)) return 'sink'
    return undefined
  }
  const ra = role(a)
  const rb = role(b)
  let from: string
  let to: string
  if (ra === 'source' && rb === 'sink') {
    from = a
    to = b
  } else if (ra === 'sink' && rb === 'source') {
    from = b
    to = a
  } else {
    return circuit
  }
  return { ...circuit, wires: circuit.wires.filter((w) => w.to !== to).concat({ from, to }) }
}

export function circuitToNetlist(circuit: Circuit, ports: PortLookup): Netlist {
  const instances: Instance[] = []
  for (const part of circuit.parts) {
    const def = ports(part.componentId)
    if (!def) continue
    const connections: Record<string, string> = {}
    for (const port of def.inputs) {
      const wire = circuit.wires.find((w) => w.to === partKey(part.uid, port))
      connections[port] = wire ? netOf(wire.from) : `open.${part.uid}.${port}`
    }
    for (const port of def.outputs) connections[port] = `${part.uid}.${port}`
    instances.push({ id: part.uid, component: part.componentId, connections })
  }
  for (const name of circuit.outputs) {
    const wire = circuit.wires.find((w) => w.to === `out:${name}`)
    instances.push({
      id: `out-${name}`,
      component: 'buffer',
      connections: { a: wire ? netOf(wire.from) : `open.${name}`, y: name },
    })
  }
  return { inputs: [...circuit.inputs], outputs: [...circuit.outputs], instances }
}
