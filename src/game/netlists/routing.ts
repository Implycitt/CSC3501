import type { Netlist } from '../types.ts'

export const ROUTING_NETLISTS: Record<string, Netlist> = {
  mux2: {
    inputs: ['a', 'b', 'sel'],
    outputs: ['y'],
    instances: [
      { id: 'ns', component: 'not', connections: { a: 'sel', y: 'nsel' } },
      { id: 'ga', component: 'and', connections: { a: 'a', b: 'nsel', y: 'ya' } },
      { id: 'gb', component: 'and', connections: { a: 'b', b: 'sel', y: 'yb' } },
      { id: 'o', component: 'or', connections: { a: 'ya', b: 'yb', y: 'y' } },
    ],
  },
  mux4: {
    inputs: ['a', 'b', 'c', 'd', 's0', 's1'],
    outputs: ['y'],
    instances: [
      { id: 'lo', component: 'mux2', connections: { a: 'a', b: 'b', sel: 's0', y: 'lo' } },
      { id: 'hi', component: 'mux2', connections: { a: 'c', b: 'd', sel: 's0', y: 'hi' } },
      { id: 'out', component: 'mux2', connections: { a: 'lo', b: 'hi', sel: 's1', y: 'y' } },
    ],
  },
  demux2: {
    inputs: ['a', 'sel'],
    outputs: ['y0', 'y1'],
    instances: [
      { id: 'ns', component: 'not', connections: { a: 'sel', y: 'nsel' } },
      { id: 'g0', component: 'and', connections: { a: 'a', b: 'nsel', y: 'y0' } },
      { id: 'g1', component: 'and', connections: { a: 'a', b: 'sel', y: 'y1' } },
    ],
  },
  decoder2to4: {
    inputs: ['a', 'b'],
    outputs: ['y0', 'y1', 'y2', 'y3'],
    instances: [
      { id: 'na', component: 'not', connections: { a: 'a', y: 'na' } },
      { id: 'nb', component: 'not', connections: { a: 'b', y: 'nb' } },
      { id: 'g0', component: 'and', connections: { a: 'na', b: 'nb', y: 'y0' } },
      { id: 'g1', component: 'and', connections: { a: 'a', b: 'nb', y: 'y1' } },
      { id: 'g2', component: 'and', connections: { a: 'na', b: 'b', y: 'y2' } },
      { id: 'g3', component: 'and', connections: { a: 'a', b: 'b', y: 'y3' } },
    ],
  },
  decoder3to8: {
    inputs: ['a', 'b', 'c'],
    outputs: ['y0', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7'],
    instances: [
      { id: 'lo', component: 'decoder2to4', connections: { a: 'a', b: 'b', y0: 'd0', y1: 'd1', y2: 'd2', y3: 'd3' } },
      { id: 'nc', component: 'not', connections: { a: 'c', y: 'nc' } },
      { id: 'e0', component: 'and', connections: { a: 'd0', b: 'nc', y: 'y0' } },
      { id: 'e1', component: 'and', connections: { a: 'd1', b: 'nc', y: 'y1' } },
      { id: 'e2', component: 'and', connections: { a: 'd2', b: 'nc', y: 'y2' } },
      { id: 'e3', component: 'and', connections: { a: 'd3', b: 'nc', y: 'y3' } },
      { id: 'e4', component: 'and', connections: { a: 'd0', b: 'c', y: 'y4' } },
      { id: 'e5', component: 'and', connections: { a: 'd1', b: 'c', y: 'y5' } },
      { id: 'e6', component: 'and', connections: { a: 'd2', b: 'c', y: 'y6' } },
      { id: 'e7', component: 'and', connections: { a: 'd3', b: 'c', y: 'y7' } },
    ],
  },
  encoder4to2: {
    inputs: ['d0', 'd1', 'd2', 'd3'],
    outputs: ['a', 'b'],
    instances: [
      { id: 'oa', component: 'or', connections: { a: 'd1', b: 'd3', y: 'a' } },
      { id: 'ob', component: 'or', connections: { a: 'd2', b: 'd3', y: 'b' } },
    ],
  },
  comparator1: {
    inputs: ['a', 'b'],
    outputs: ['eq', 'lt', 'gt'],
    instances: [
      { id: 'x', component: 'xnor', connections: { a: 'a', b: 'b', y: 'eq' } },
      { id: 'na', component: 'not', connections: { a: 'a', y: 'na' } },
      { id: 'lt', component: 'and', connections: { a: 'na', b: 'b', y: 'lt' } },
      { id: 'nb', component: 'not', connections: { a: 'b', y: 'nb' } },
      { id: 'gt', component: 'and', connections: { a: 'a', b: 'nb', y: 'gt' } },
    ],
  },
}
