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
  diode: {
    inputs: ['a', 'b'],
    outputs: ['y'],
    instances: [{ id: 'and', component: 'and', connections: { a: 'a', b: 'b', y: 'y' } }],
  },
  'magnetic-core': {
    inputs: ['d', 'clk'],
    outputs: ['q'],
    instances: [{ id: 'core', component: 'd-flip-flop', connections: { d: 'd', clk: 'clk', q: 'q' } }],
  },
  'mercury-delay-line': {
    inputs: ['d', 'clk'],
    outputs: ['q0', 'q1', 'q2', 'q3'],
    instances: [
      { id: 'line', component: 'shift-register4', connections: { d: 'd', clk: 'clk', q0: 'q0', q1: 'q1', q2: 'q2', q3: 'q3' } },
    ],
  },
  'stepping-switch': {
    inputs: ['a', 's0', 's1'],
    outputs: ['y0', 'y1', 'y2', 'y3'],
    instances: [
      { id: 'bank', component: 'demux4', connections: { a: 'a', s0: 's0', s1: 's1', y0: 'y0', y1: 'y1', y2: 'y2', y3: 'y3' } },
    ],
  },
}
