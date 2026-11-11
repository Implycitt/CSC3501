import type { Netlist } from '../types.ts'

export const GATE_NETLISTS: Record<string, Netlist> = {
  not: {
    inputs: ['a'],
    outputs: ['y'],
    instances: [{ id: 'n', component: 'nand', connections: { a: 'a', b: 'a', y: 'y' } }],
  },
  buffer: {
    inputs: ['a'],
    outputs: ['y'],
    instances: [
      { id: 'i1', component: 'not', connections: { a: 'a', y: 'm' } },
      { id: 'i2', component: 'not', connections: { a: 'm', y: 'y' } },
    ],
  },
  and: {
    inputs: ['a', 'b'],
    outputs: ['y'],
    instances: [
      { id: 'n', component: 'nand', connections: { a: 'a', b: 'b', y: 'x' } },
      { id: 'i', component: 'not', connections: { a: 'x', y: 'y' } },
    ],
  },
  or: {
    inputs: ['a', 'b'],
    outputs: ['y'],
    instances: [
      { id: 'ia', component: 'not', connections: { a: 'a', y: 'na' } },
      { id: 'ib', component: 'not', connections: { a: 'b', y: 'nb' } },
      { id: 'n', component: 'nand', connections: { a: 'na', b: 'nb', y: 'y' } },
    ],
  },
  xor: {
    inputs: ['a', 'b'],
    outputs: ['y'],
    instances: [
      { id: 'n1', component: 'nand', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'n2', component: 'nand', connections: { a: 'a', b: 't', y: 'u' } },
      { id: 'n3', component: 'nand', connections: { a: 'b', b: 't', y: 'v' } },
      { id: 'n4', component: 'nand', connections: { a: 'u', b: 'v', y: 'y' } },
    ],
  },
  xnor: {
    inputs: ['a', 'b'],
    outputs: ['y'],
    instances: [
      { id: 'x', component: 'xor', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'i', component: 'not', connections: { a: 't', y: 'y' } },
    ],
  },
  and3: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y'],
    instances: [
      { id: 'g1', component: 'and', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'g2', component: 'and', connections: { a: 't', b: 'c', y: 'y' } },
    ],
  },
  or3: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y'],
    instances: [
      { id: 'g1', component: 'or', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'g2', component: 'or', connections: { a: 't', b: 'c', y: 'y' } },
    ],
  },
  nand3: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y'],
    instances: [
      { id: 'g', component: 'and3', connections: { a: 'a', b: 'b', c: 'c', y: 't' } },
      { id: 'i', component: 'not', connections: { a: 't', y: 'y' } },
    ],
  },
  nor3: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y'],
    instances: [
      { id: 'g', component: 'or3', connections: { a: 'a', b: 'b', c: 'c', y: 't' } },
      { id: 'i', component: 'not', connections: { a: 't', y: 'y' } },
    ],
  },
  xor3: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y'],
    instances: [
      { id: 'g1', component: 'xor', connections: { a: 'a', b: 'b', y: 't' } },
      { id: 'g2', component: 'xor', connections: { a: 't', b: 'c', y: 'y' } },
    ],
  },
  transistor: {
    inputs: ['a', 'g'],
    outputs: ['y'],
    instances: [{ id: 'g', component: 'and', connections: { a: 'a', b: 'g', y: 'y' } }],
  },
}
