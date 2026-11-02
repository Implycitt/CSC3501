import type { Netlist } from '../types.ts'

export const HISTORICAL_NETLISTS: Record<string, Netlist> = {
  'vacuum-tube': {
    inputs: ['a'],
    outputs: ['y'],
    instances: [{ id: 'amp', component: 'not', connections: { a: 'a', y: 'y' } }],
  },
  relay: {
    inputs: ['a'],
    outputs: ['y'],
    instances: [{ id: 'coil', component: 'buffer', connections: { a: 'a', y: 'y' } }],
  },
}
