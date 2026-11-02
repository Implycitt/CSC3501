import type { Netlist } from '../types.ts'

export const ARITHMETIC_NETLISTS: Record<string, Netlist> = {
  'half-adder': {
    inputs: ['a', 'b'],
    outputs: ['sum', 'carry'],
    instances: [
      { id: 'x', component: 'xor', connections: { a: 'a', b: 'b', y: 'sum' } },
      { id: 'c', component: 'and', connections: { a: 'a', b: 'b', y: 'carry' } },
    ],
  },
  'full-adder': {
    inputs: ['a', 'b', 'cin'],
    outputs: ['sum', 'cout'],
    instances: [
      { id: 'h1', component: 'half-adder', connections: { a: 'a', b: 'b', sum: 's1', carry: 'c1' } },
      { id: 'h2', component: 'half-adder', connections: { a: 's1', b: 'cin', sum: 'sum', carry: 'c2' } },
      { id: 'o', component: 'or', connections: { a: 'c1', b: 'c2', y: 'cout' } },
    ],
  },
  'half-subtractor': {
    inputs: ['a', 'b'],
    outputs: ['diff', 'borrow'],
    instances: [
      { id: 'x', component: 'xor', connections: { a: 'a', b: 'b', y: 'diff' } },
      { id: 'na', component: 'not', connections: { a: 'a', y: 'na' } },
      { id: 'b', component: 'and', connections: { a: 'na', b: 'b', y: 'borrow' } },
    ],
  },
  'full-subtractor': {
    inputs: ['a', 'b', 'bin'],
    outputs: ['diff', 'borrow'],
    instances: [
      { id: 'x1', component: 'xor', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'x2', component: 'xor', connections: { a: 't', b: 'bin', y: 'diff' } },
      { id: 'na', component: 'not', connections: { a: 'a', y: 'na' } },
      { id: 'ab', component: 'and', connections: { a: 'na', b: 'b', y: 'ab' } },
      { id: 'nt', component: 'not', connections: { a: 't', y: 'nt' } },
      { id: 'tb', component: 'and', connections: { a: 'nt', b: 'bin', y: 'tb' } },
      { id: 'o', component: 'or', connections: { a: 'ab', b: 'tb', y: 'borrow' } },
    ],
  },
  adder2: {
    inputs: ['a0', 'a1', 'b0', 'b1', 'cin'],
    outputs: ['s0', 's1', 'cout'],
    instances: [
      { id: 'fa0', component: 'full-adder', connections: { a: 'a0', b: 'b0', cin: 'cin', sum: 's0', cout: 'c1' } },
      { id: 'fa1', component: 'full-adder', connections: { a: 'a1', b: 'b1', cin: 'c1', sum: 's1', cout: 'cout' } },
    ],
  },
  adder4: {
    inputs: ['a0', 'a1', 'a2', 'a3', 'b0', 'b1', 'b2', 'b3', 'cin'],
    outputs: ['s0', 's1', 's2', 's3', 'cout'],
    instances: [
      { id: 'fa0', component: 'full-adder', connections: { a: 'a0', b: 'b0', cin: 'cin', sum: 's0', cout: 'c1' } },
      { id: 'fa1', component: 'full-adder', connections: { a: 'a1', b: 'b1', cin: 'c1', sum: 's1', cout: 'c2' } },
      { id: 'fa2', component: 'full-adder', connections: { a: 'a2', b: 'b2', cin: 'c2', sum: 's2', cout: 'c3' } },
      { id: 'fa3', component: 'full-adder', connections: { a: 'a3', b: 'b3', cin: 'c3', sum: 's3', cout: 'cout' } },
    ],
  },
}
