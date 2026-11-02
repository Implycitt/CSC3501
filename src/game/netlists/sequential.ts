import type { Netlist } from '../types.ts'

export const SEQUENTIAL_NETLISTS: Record<string, Netlist> = {
  'sr-latch': {
    inputs: ['s', 'r'],
    outputs: ['q'],
    instances: [
      { id: 'g1', component: 'nor', connections: { a: 'r', b: 'qn', y: 'q' } },
      { id: 'g2', component: 'nor', connections: { a: 's', b: 'q', y: 'qn' } },
    ],
  },
  'sr-latch-nand': {
    inputs: ['s', 'r'],
    outputs: ['q', 'qn'],
    instances: [
      { id: 'g1', component: 'nand', connections: { a: 's', b: 'qn', y: 'q' } },
      { id: 'g2', component: 'nand', connections: { a: 'r', b: 'q', y: 'qn' } },
    ],
  },
  'gated-d-latch': {
    inputs: ['d', 'en'],
    outputs: ['q'],
    instances: [{ id: 'hold', component: 'mux2', connections: { a: 'q', b: 'd', sel: 'en', y: 'q' } }],
  },
  'd-flip-flop': {
    inputs: ['d', 'clk'],
    outputs: ['q'],
    instances: [
      { id: 'nclk', component: 'not', connections: { a: 'clk', y: 'nclk' } },
      { id: 'master', component: 'gated-d-latch', connections: { d: 'd', en: 'nclk', q: 'mq' } },
      { id: 'slave', component: 'gated-d-latch', connections: { d: 'mq', en: 'clk', q: 'q' } },
    ],
  },
  'd-flip-flop-en': {
    inputs: ['d', 'en', 'clk'],
    outputs: ['q'],
    instances: [
      { id: 'hold', component: 'mux2', connections: { a: 'q', b: 'd', sel: 'en', y: 'din' } },
      { id: 'ff', component: 'd-flip-flop', connections: { d: 'din', clk: 'clk', q: 'q' } },
    ],
  },
  'jk-flip-flop': {
    inputs: ['j', 'k', 'clk'],
    outputs: ['q'],
    instances: [
      { id: 'nq', component: 'not', connections: { a: 'q', y: 'nq' } },
      { id: 'jq', component: 'and', connections: { a: 'j', b: 'nq', y: 'jq' } },
      { id: 'nk', component: 'not', connections: { a: 'k', y: 'nk' } },
      { id: 'kq', component: 'and', connections: { a: 'nk', b: 'q', y: 'kq' } },
      { id: 'd', component: 'or', connections: { a: 'jq', b: 'kq', y: 'din' } },
      { id: 'ff', component: 'd-flip-flop', connections: { d: 'din', clk: 'clk', q: 'q' } },
    ],
  },
  't-flip-flop': {
    inputs: ['t', 'clk'],
    outputs: ['q'],
    instances: [
      { id: 'x', component: 'xor', connections: { a: 't', b: 'q', y: 'din' } },
      { id: 'ff', component: 'd-flip-flop', connections: { d: 'din', clk: 'clk', q: 'q' } },
    ],
  },
  register4: {
    inputs: ['d0', 'd1', 'd2', 'd3', 'en', 'clk'],
    outputs: ['q0', 'q1', 'q2', 'q3'],
    instances: [
      { id: 'm0', component: 'mux2', connections: { a: 'q0', b: 'd0', sel: 'en', y: 'n0' } },
      { id: 'm1', component: 'mux2', connections: { a: 'q1', b: 'd1', sel: 'en', y: 'n1' } },
      { id: 'm2', component: 'mux2', connections: { a: 'q2', b: 'd2', sel: 'en', y: 'n2' } },
      { id: 'm3', component: 'mux2', connections: { a: 'q3', b: 'd3', sel: 'en', y: 'n3' } },
      { id: 'f0', component: 'd-flip-flop', connections: { d: 'n0', clk: 'clk', q: 'q0' } },
      { id: 'f1', component: 'd-flip-flop', connections: { d: 'n1', clk: 'clk', q: 'q1' } },
      { id: 'f2', component: 'd-flip-flop', connections: { d: 'n2', clk: 'clk', q: 'q2' } },
      { id: 'f3', component: 'd-flip-flop', connections: { d: 'n3', clk: 'clk', q: 'q3' } },
    ],
  },
  'shift-register4': {
    inputs: ['d', 'clk'],
    outputs: ['q0', 'q1', 'q2', 'q3'],
    instances: [
      { id: 'f0', component: 'd-flip-flop', connections: { d: 'd', clk: 'clk', q: 'q0' } },
      { id: 'f1', component: 'd-flip-flop', connections: { d: 'q0', clk: 'clk', q: 'q1' } },
      { id: 'f2', component: 'd-flip-flop', connections: { d: 'q1', clk: 'clk', q: 'q2' } },
      { id: 'f3', component: 'd-flip-flop', connections: { d: 'q2', clk: 'clk', q: 'q3' } },
    ],
  },
  counter2: {
    inputs: ['clk', 'reset'],
    outputs: ['q0', 'q1'],
    instances: [
      { id: 'zero', component: 'const0', connections: { y: 'zero' } },
      { id: 'nq0', component: 'not', connections: { a: 'q0', y: 'nq0' } },
      { id: 'nq1', component: 'xor', connections: { a: 'q1', b: 'q0', y: 'nq1' } },
      { id: 'd0', component: 'mux2', connections: { a: 'nq0', b: 'zero', sel: 'reset', y: 'd0' } },
      { id: 'd1', component: 'mux2', connections: { a: 'nq1', b: 'zero', sel: 'reset', y: 'd1' } },
      { id: 'f0', component: 'd-flip-flop', connections: { d: 'd0', clk: 'clk', q: 'q0' } },
      { id: 'f1', component: 'd-flip-flop', connections: { d: 'd1', clk: 'clk', q: 'q1' } },
    ],
  },
  counter4: {
    inputs: ['clk', 'reset'],
    outputs: ['q0', 'q1', 'q2', 'q3'],
    instances: [
      { id: 'zero', component: 'const0', connections: { y: 'zero' } },
      { id: 'nq0', component: 'not', connections: { a: 'q0', y: 'nq0' } },
      { id: 'nq1', component: 'xor', connections: { a: 'q1', b: 'q0', y: 'nq1' } },
      { id: 'c2', component: 'and', connections: { a: 'q0', b: 'q1', y: 'c2' } },
      { id: 'nq2', component: 'xor', connections: { a: 'q2', b: 'c2', y: 'nq2' } },
      { id: 'c3', component: 'and3', connections: { a: 'q0', b: 'q1', c: 'q2', y: 'c3' } },
      { id: 'nq3', component: 'xor', connections: { a: 'q3', b: 'c3', y: 'nq3' } },
      { id: 'd0', component: 'mux2', connections: { a: 'nq0', b: 'zero', sel: 'reset', y: 'd0' } },
      { id: 'd1', component: 'mux2', connections: { a: 'nq1', b: 'zero', sel: 'reset', y: 'd1' } },
      { id: 'd2', component: 'mux2', connections: { a: 'nq2', b: 'zero', sel: 'reset', y: 'd2' } },
      { id: 'd3', component: 'mux2', connections: { a: 'nq3', b: 'zero', sel: 'reset', y: 'd3' } },
      { id: 'f0', component: 'd-flip-flop', connections: { d: 'd0', clk: 'clk', q: 'q0' } },
      { id: 'f1', component: 'd-flip-flop', connections: { d: 'd1', clk: 'clk', q: 'q1' } },
      { id: 'f2', component: 'd-flip-flop', connections: { d: 'd2', clk: 'clk', q: 'q2' } },
      { id: 'f3', component: 'd-flip-flop', connections: { d: 'd3', clk: 'clk', q: 'q3' } },
    ],
  },
}
