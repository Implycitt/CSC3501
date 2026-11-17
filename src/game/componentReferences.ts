import type { ComponentDef } from './types.ts'

export interface ReferenceTable {
  caption: string
  headers: string[]
  rows: string[][]
}

export interface ComponentReference {
  behavior: string
  example?: ReferenceTable
}

const CUSTOM_REFERENCE: ComponentReference = {
  behavior: 'A saved circuit. Its ports are the inputs and outputs you defined when you built it.',
}

export const COMPONENT_REFERENCES: Record<string, ComponentReference> = {
  not: {
    behavior: 'y = NOT a.',
    example: {
      caption: 'The output is always the inverse of a.',
      headers: ['a', 'y'],
      rows: [
        ['0', '1'],
        ['1', '0'],
      ],
    },
  },
  buffer: {
    behavior: 'y = a.',
    example: {
      caption: 'The output follows the input unchanged.',
      headers: ['a', 'y'],
      rows: [
        ['0', '0'],
        ['1', '1'],
      ],
    },
  },
  and: {
    behavior: 'y = a AND b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    },
  },
  nand: {
    behavior: 'y = NOT (a AND b).',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '1'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '0'],
      ],
    },
  },
  or: {
    behavior: 'y = a OR b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '1'],
      ],
    },
  },
  nor: {
    behavior: 'y = NOT (a OR b).',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '1'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '0'],
      ],
    },
  },
  xor: {
    behavior: 'y = a XOR b.',
    example: {
      caption: 'The output is high when the inputs differ.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '1'],
        ['1', '0', '1'],
        ['1', '1', '0'],
      ],
    },
  },
  xnor: {
    behavior: 'y = NOT (a XOR b).',
    example: {
      caption: 'The output is high when the inputs match.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '1'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    },
  },
  and3: {
    behavior: 'y = a AND b AND c.',
    example: {
      caption: 'Selected rows; y is high only for three high inputs.',
      headers: ['a', 'b', 'c', 'y'],
      rows: [
        ['0', '0', '0', '0'],
        ['0', '0', '1', '0'],
        ['0', '1', '1', '0'],
        ['1', '1', '1', '1'],
      ],
    },
  },
  or3: {
    behavior: 'y = a OR b OR c.',
    example: {
      caption: 'Selected rows; y is high when any input is high.',
      headers: ['a', 'b', 'c', 'y'],
      rows: [
        ['0', '0', '0', '0'],
        ['0', '0', '1', '1'],
        ['0', '1', '1', '1'],
        ['1', '1', '1', '1'],
      ],
    },
  },
  nand3: {
    behavior: 'y = NOT (a AND b AND c).',
    example: {
      caption: 'Selected rows; y is low only for three high inputs.',
      headers: ['a', 'b', 'c', 'y'],
      rows: [
        ['0', '0', '0', '1'],
        ['0', '0', '1', '1'],
        ['0', '1', '1', '1'],
        ['1', '1', '1', '0'],
      ],
    },
  },
  nor3: {
    behavior: 'y = NOT (a OR b OR c).',
    example: {
      caption: 'Selected rows; y is high only when every input is low.',
      headers: ['a', 'b', 'c', 'y'],
      rows: [
        ['0', '0', '0', '1'],
        ['0', '0', '1', '0'],
        ['0', '1', '1', '0'],
        ['1', '1', '1', '0'],
      ],
    },
  },
  xor3: {
    behavior: 'y = a XOR b XOR c.',
    example: {
      caption: 'Selected rows; y is high for an odd number of high inputs.',
      headers: ['a', 'b', 'c', 'y'],
      rows: [
        ['0', '0', '0', '0'],
        ['0', '0', '1', '1'],
        ['0', '1', '1', '0'],
        ['1', '1', '1', '1'],
      ],
    },
  },
  transistor: {
    behavior: 'y = a AND g. The input passes to y while the gate g is high.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'g', 'y'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    },
  },
  const0: {
    behavior: 'Always drives y = 0.',
  },
  const1: {
    behavior: 'Always drives y = 1.',
  },

  'half-adder': {
    behavior: 'sum = a XOR b; carry = a AND b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'sum', 'carry'],
      rows: [
        ['0', '0', '0', '0'],
        ['0', '1', '1', '0'],
        ['1', '0', '1', '0'],
        ['1', '1', '0', '1'],
      ],
    },
  },
  'full-adder': {
    behavior: 'sum = a XOR b XOR cin; cout is high when at least two inputs are high.',
    example: {
      caption: 'Selected rows covering carry-in and carry-out.',
      headers: ['a', 'b', 'cin', 'sum', 'cout'],
      rows: [
        ['0', '0', '0', '0', '0'],
        ['0', '0', '1', '1', '0'],
        ['0', '1', '1', '0', '1'],
        ['1', '1', '1', '1', '1'],
      ],
    },
  },
  'half-subtractor': {
    behavior: 'diff = a XOR b; borrow = (NOT a) AND b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'diff', 'borrow'],
      rows: [
        ['0', '0', '0', '0'],
        ['0', '1', '1', '1'],
        ['1', '0', '1', '0'],
        ['1', '1', '0', '0'],
      ],
    },
  },
  'full-subtractor': {
    behavior: 'diff = a XOR b XOR bin; borrow is high when b + bin exceeds a.',
    example: {
      caption: 'Selected rows covering borrow-in and borrow-out.',
      headers: ['a', 'b', 'bin', 'diff', 'borrow'],
      rows: [
        ['0', '0', '0', '0', '0'],
        ['0', '0', '1', '1', '1'],
        ['0', '1', '1', '0', '1'],
        ['1', '1', '1', '1', '1'],
      ],
    },
  },
  adder2: {
    behavior: 'Adds a1a0 + b1b0 + cin into s1s0 and cout.',
    example: {
      caption: 'Bit strings are MSB first; selected examples.',
      headers: ['a1 a0', 'b1 b0', 'cin', 's1 s0', 'cout'],
      rows: [
        ['01', '01', '0', '10', '0'],
        ['11', '01', '0', '00', '1'],
        ['10', '11', '1', '10', '1'],
      ],
    },
  },
  adder4: {
    behavior: 'Adds a3..a0 + b3..b0 + cin into s3..s0 and cout.',
    example: {
      caption: 'Bit strings are MSB first; selected examples.',
      headers: ['a3..a0', 'b3..b0', 'cin', 's3..s0', 'cout'],
      rows: [
        ['0011', '0101', '0', '1000', '0'],
        ['1111', '0001', '0', '0000', '1'],
        ['1010', '0110', '1', '0001', '1'],
      ],
    },
  },
  adder8: {
    behavior: 'Adds a7..a0 + b7..b0 + cin into s7..s0 and cout.',
    example: {
      caption: 'Bit strings are MSB first; selected examples.',
      headers: ['a7..a0', 'b7..b0', 'cin', 's7..s0', 'cout'],
      rows: [
        ['00000001', '00000001', '0', '00000010', '0'],
        ['11111111', '00000001', '0', '00000000', '1'],
        ['00110101', '00001010', '1', '01000000', '0'],
      ],
    },
  },
  multiplier4: {
    behavior: 'P = A x B, producing the 8-bit product of two 4-bit values.',
    example: {
      caption: 'Bit strings are MSB first; product is p7..p0.',
      headers: ['a3..a0', 'b3..b0', 'p7..p0'],
      rows: [
        ['0011', '0011', '00001001'],
        ['1010', '0110', '00111100'],
        ['1111', '1111', '11100001'],
      ],
    },
  },
  comparator4: {
    behavior: 'Unsigned comparison: eq is high when A = B, lt when A < B, gt when A > B.',
    example: {
      caption: 'Bit strings are MSB first.',
      headers: ['a3..a0', 'b3..b0', 'eq', 'lt', 'gt'],
      rows: [
        ['0101', '0101', '1', '0', '0'],
        ['0011', '0110', '0', '1', '0'],
        ['1000', '0111', '0', '0', '1'],
      ],
    },
  },
  alu8: {
    behavior:
      'Three op bits select an 8-bit operation on a and b. carry is the add/subtract carry; zero is high when y is all zeros.',
    example: {
      caption: 'Operations selected by op2 op1 op0.',
      headers: ['op2 op1 op0', 'operation', 'y'],
      rows: [
        ['000', 'add', 'a + b'],
        ['001', 'subtract', 'a - b'],
        ['010', 'AND', 'a AND b'],
        ['011', 'OR', 'a OR b'],
        ['100', 'XOR', 'a XOR b'],
        ['101', 'NOT', 'NOT a'],
        ['110', 'shift left', 'a << 1'],
        ['111', 'shift right', 'a >> 1'],
      ],
    },
  },

  mux2: {
    behavior: 'y = a when sel = 0; y = b when sel = 1.',
    example: {
      caption: 'The selected input appears on y.',
      headers: ['a', 'b', 'sel', 'y'],
      rows: [
        ['1', '0', '0', '1'],
        ['1', '0', '1', '0'],
        ['0', '1', '0', '0'],
        ['0', '1', '1', '1'],
      ],
    },
  },
  mux4: {
    behavior: 's1s0 selects one of the four inputs.',
    example: {
      caption: 'The selected input appears on y.',
      headers: ['s1 s0', 'y'],
      rows: [
        ['00', 'a'],
        ['01', 'b'],
        ['10', 'c'],
        ['11', 'd'],
      ],
    },
  },
  mux8: {
    behavior: 's2s1s0 selects one of the eight inputs.',
    example: {
      caption: 'The selected input appears on y.',
      headers: ['s2 s1 s0', 'y'],
      rows: [
        ['000', 'a'],
        ['001', 'b'],
        ['010', 'c'],
        ['011', 'd'],
        ['100', 'e'],
        ['101', 'f'],
        ['110', 'g'],
        ['111', 'h'],
      ],
    },
  },
  mux16: {
    behavior: 's3s2s1s0 selects one of the sixteen inputs.',
    example: {
      caption: 'The selected input appears on y.',
      headers: ['s3 s2 s1 s0', 'y'],
      rows: [
        ['0000', 'a'],
        ['0001', 'b'],
        ['0010', 'c'],
        ['0011', 'd'],
        ['0100', 'e'],
        ['0101', 'f'],
        ['0110', 'g'],
        ['0111', 'h'],
        ['1000', 'i'],
        ['1001', 'j'],
        ['1010', 'k'],
        ['1011', 'l'],
        ['1100', 'm'],
        ['1101', 'n'],
        ['1110', 'o'],
        ['1111', 'p'],
      ],
    },
  },
  demux2: {
    behavior: 'a is routed to y0 when sel = 0 and to y1 when sel = 1; the unselected output is 0.',
    example: {
      caption: 'a stands for the value on the input; unselected outputs are 0.',
      headers: ['sel', 'y0', 'y1'],
      rows: [
        ['0', 'a', '0'],
        ['1', '0', 'a'],
      ],
    },
  },
  demux4: {
    behavior: 's1s0 routes a to one of y0..y3; the other outputs are 0.',
    example: {
      caption: 'a stands for the value on the input; unselected outputs are 0.',
      headers: ['s1 s0', 'y0', 'y1', 'y2', 'y3'],
      rows: [
        ['00', 'a', '0', '0', '0'],
        ['01', '0', 'a', '0', '0'],
        ['10', '0', '0', 'a', '0'],
        ['11', '0', '0', '0', 'a'],
      ],
    },
  },
  decoder2to4: {
    behavior: 'Exactly one output is high for each 2-bit code; a is the low bit.',
    example: {
      caption: 'All input combinations; every other output is low.',
      headers: ['a b', 'y3 y2 y1 y0'],
      rows: [
        ['0 0', '0 0 0 1'],
        ['1 0', '0 0 1 0'],
        ['0 1', '0 1 0 0'],
        ['1 1', '1 0 0 0'],
      ],
    },
  },
  decoder3to8: {
    behavior: 'Exactly one output is high for each 3-bit code; a is the low bit.',
    example: {
      caption: 'All input combinations; every other output is low.',
      headers: ['c b a', 'high output'],
      rows: [
        ['000', 'y0'],
        ['001', 'y1'],
        ['010', 'y2'],
        ['011', 'y3'],
        ['100', 'y4'],
        ['101', 'y5'],
        ['110', 'y6'],
        ['111', 'y7'],
      ],
    },
  },
  decoder4to16: {
    behavior: 'Exactly one output is high for each 4-bit code; a is the low bit.',
    example: {
      caption: 'All input combinations; every other output is low.',
      headers: ['d c b a', 'high output'],
      rows: [
        ['0000', 'y0'],
        ['0001', 'y1'],
        ['0010', 'y2'],
        ['0011', 'y3'],
        ['0100', 'y4'],
        ['0101', 'y5'],
        ['0110', 'y6'],
        ['0111', 'y7'],
        ['1000', 'y8'],
        ['1001', 'y9'],
        ['1010', 'y10'],
        ['1011', 'y11'],
        ['1100', 'y12'],
        ['1101', 'y13'],
        ['1110', 'y14'],
        ['1111', 'y15'],
      ],
    },
  },
  encoder4to2: {
    behavior: 'Encodes which data input is high into b a; a is the low bit.',
    example: {
      caption: 'One input high. With none high the code is 00.',
      headers: ['d3 d2 d1 d0', 'b a'],
      rows: [
        ['0001', '00'],
        ['0010', '01'],
        ['0100', '10'],
        ['1000', '11'],
        ['0000', '00'],
      ],
    },
  },
  encoder8to3: {
    behavior: 'Encodes which data input is high into c b a; a is the low bit.',
    example: {
      caption: 'One input high. With none high the code is 000.',
      headers: ['d7 d6 d5 d4 d3 d2 d1 d0', 'c b a'],
      rows: [
        ['00000001', '000'],
        ['00000010', '001'],
        ['00000100', '010'],
        ['00001000', '011'],
        ['00010000', '100'],
        ['00100000', '101'],
        ['01000000', '110'],
        ['10000000', '111'],
        ['00000000', '000'],
      ],
    },
  },
  comparator1: {
    behavior: 'eq is high when a = b, lt when a < b, gt when a > b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'eq', 'lt', 'gt'],
      rows: [
        ['0', '0', '1', '0', '0'],
        ['0', '1', '0', '1', '0'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '0'],
      ],
    },
  },

  'sr-latch': {
    behavior: 'NOR-based set-reset latch. s sets q, r resets q, and s = r = 0 holds the stored bit.',
    example: {
      caption: 'q(next) is the value after the inputs settle.',
      headers: ['s', 'r', 'q(next)'],
      rows: [
        ['0', '0', 'hold'],
        ['0', '1', '0'],
        ['1', '0', '1'],
        ['1', '1', 'not allowed'],
      ],
    },
  },
  'sr-latch-nand': {
    behavior: 'NAND-based set-reset latch with active-low inputs: 0 on s sets q, 0 on r resets q.',
    example: {
      caption: 'q(next) is the value after the inputs settle.',
      headers: ['s', 'r', 'q(next)'],
      rows: [
        ['0', '1', '1'],
        ['1', '0', '0'],
        ['1', '1', 'hold'],
        ['0', '0', 'not allowed'],
      ],
    },
  },
  'gated-d-latch': {
    behavior: 'q follows d while en = 1 and holds its value while en = 0.',
    example: {
      caption: 'x means the input does not affect the result.',
      headers: ['en', 'd', 'q(next)'],
      rows: [
        ['0', 'x', 'hold'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    },
  },
  'd-flip-flop': {
    behavior: 'Captures d into q on the rising clock edge; q holds at all other times.',
    example: {
      caption: 'q changes only on a rising clock edge.',
      headers: ['clk', 'd', 'q(next)'],
      rows: [
        ['rising', '0', '0'],
        ['rising', '1', '1'],
        ['no edge', 'x', 'hold'],
      ],
    },
  },
  'd-flip-flop-en': {
    behavior: 'Captures d into q on the rising clock edge while en = 1; otherwise q holds.',
    example: {
      caption: 'q changes only on a rising clock edge with the enable high.',
      headers: ['clk', 'en', 'd', 'q(next)'],
      rows: [
        ['rising', '1', '0', '0'],
        ['rising', '1', '1', '1'],
        ['rising', '0', 'x', 'hold'],
        ['no edge', 'x', 'x', 'hold'],
      ],
    },
  },
  'jk-flip-flop': {
    behavior: 'On the rising clock edge: j sets q, k resets q, j = k = 1 toggles, and j = k = 0 holds.',
    example: {
      caption: 'Actions on a rising clock edge; q is the previous value.',
      headers: ['j', 'k', 'q(next)'],
      rows: [
        ['0', '0', 'hold'],
        ['0', '1', '0'],
        ['1', '0', '1'],
        ['1', '1', 'toggle'],
      ],
    },
  },
  't-flip-flop': {
    behavior: 'On the rising clock edge: t = 1 toggles q and t = 0 holds it.',
    example: {
      caption: 'Actions on a rising clock edge; q is the previous value.',
      headers: ['t', 'q(next)'],
      rows: [
        ['0', 'hold'],
        ['1', 'toggle'],
      ],
    },
  },
  register4: {
    behavior: 'Four D flip-flops share en and clk. On the rising edge, q3..q0 captures d3..d0 while en = 1.',
    example: {
      caption: 'Selected operations; x means the inputs are ignored.',
      headers: ['clk', 'en', 'd3..d0', 'q3..q0'],
      rows: [
        ['rising', '1', '1010', '1010'],
        ['rising', '0', 'xxxx', 'hold'],
        ['no edge', 'x', 'xxxx', 'hold'],
      ],
    },
  },
  register8: {
    behavior: 'Eight D flip-flops share en and clk. On the rising edge, q7..q0 captures d7..d0 while en = 1.',
    example: {
      caption: 'Selected operations; x means the inputs are ignored.',
      headers: ['clk', 'en', 'd7..d0', 'q7..q0'],
      rows: [
        ['rising', '1', '10101010', '10101010'],
        ['rising', '0', 'xxxxxxxx', 'hold'],
        ['no edge', 'x', 'xxxxxxxx', 'hold'],
      ],
    },
  },
  'shift-register4': {
    behavior: 'On each rising edge, q0 takes d and each later stage copies the one before it.',
    example: {
      caption: 'Starting from 0000, clock in 1, 0, then 1.',
      headers: ['clock edge', 'd', 'q3 q2 q1 q0'],
      rows: [
        ['1', '1', '0 0 0 1'],
        ['2', '0', '0 0 1 0'],
        ['3', '1', '0 1 0 1'],
      ],
    },
  },
  'shift-register8': {
    behavior: 'On each rising edge, q0 takes d and each later stage copies the one before it.',
    example: {
      caption: 'Starting from 00000000, clock in 1, 0, then 1.',
      headers: ['clock edge', 'd', 'q7..q0'],
      rows: [
        ['1', '1', '00000001'],
        ['2', '0', '00000010'],
        ['3', '1', '00000101'],
      ],
    },
  },
  counter2: {
    behavior: 'Counts rising clock edges modulo 4; reset = 1 loads 00 on the edge.',
    example: {
      caption: 'Count sequence with reset low.',
      headers: ['clock edges', 'reset', 'q1 q0'],
      rows: [
        ['0', '0', '0 0'],
        ['1', '0', '0 1'],
        ['2', '0', '1 0'],
        ['3', '0', '1 1'],
        ['4', '0', '0 0'],
        ['x', '1', '0 0'],
      ],
    },
  },
  counter4: {
    behavior: 'Counts rising clock edges modulo 16; reset = 1 loads 0000 on the edge.',
    example: {
      caption: 'Selected points in the count sequence with reset low.',
      headers: ['clock edges', 'reset', 'q3..q0'],
      rows: [
        ['0', '0', '0000'],
        ['1', '0', '0001'],
        ['2', '0', '0010'],
        ['15', '0', '1111'],
        ['16', '0', '0000'],
        ['x', '1', '0000'],
      ],
    },
  },
  counter8: {
    behavior: 'Counts rising clock edges modulo 256; reset = 1 loads 00000000 on the edge.',
    example: {
      caption: 'Selected points in the count sequence with reset low.',
      headers: ['clock edges', 'reset', 'q7..q0'],
      rows: [
        ['0', '0', '00000000'],
        ['1', '0', '00000001'],
        ['2', '0', '00000010'],
        ['255', '0', '11111111'],
        ['256', '0', '00000000'],
        ['x', '1', '00000000'],
      ],
    },
  },
  ram16x8: {
    behavior:
      'Sixteen 8-bit words. a3..a0 selects the word; writes happen on the rising clock edge while we = 1; reads are asynchronous.',
    example: {
      caption: 'Operations; q always shows the word at the selected address.',
      headers: ['we', 'clk', 'action'],
      rows: [
        ['1', 'rising', 'write d7..d0 to word a3..a0'],
        ['1', 'no edge', 'no write'],
        ['0', 'any', 'read word a3..a0 on q7..q0'],
      ],
    },
  },

  'vacuum-tube': {
    behavior: 'Early inverting amplifier; in this simulator y = NOT a.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'y'],
      rows: [
        ['0', '1'],
        ['1', '0'],
      ],
    },
  },
  relay: {
    behavior: 'Electromechanical switch; y follows a.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'y'],
      rows: [
        ['0', '0'],
        ['1', '1'],
      ],
    },
  },
  diode: {
    behavior: 'Diode logic AND: y = a AND b.',
    example: {
      caption: 'All input combinations.',
      headers: ['a', 'b', 'y'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1'],
      ],
    },
  },
  'magnetic-core': {
    behavior: 'Stores one bit; q captures d on the rising clock edge.',
    example: {
      caption: 'q changes only on a rising clock edge.',
      headers: ['clk', 'd', 'q(next)'],
      rows: [
        ['rising', '0', '0'],
        ['rising', '1', '1'],
        ['no edge', 'x', 'hold'],
      ],
    },
  },
  'mercury-delay-line': {
    behavior: 'Four-stage shift register that delays bits by four clock edges.',
    example: {
      caption: 'Starting from 0000, clock in 1, 0, then 1.',
      headers: ['clock edge', 'd', 'q3 q2 q1 q0'],
      rows: [
        ['1', '1', '0 0 0 1'],
        ['2', '0', '0 0 1 0'],
        ['3', '1', '0 1 0 1'],
      ],
    },
  },
  'stepping-switch': {
    behavior: 'Routes a to the contact selected by s1s0; the other contacts are 0.',
    example: {
      caption: 'a stands for the value on the input; unselected outputs are 0.',
      headers: ['s1 s0', 'y0', 'y1', 'y2', 'y3'],
      rows: [
        ['00', 'a', '0', '0', '0'],
        ['01', '0', 'a', '0', '0'],
        ['10', '0', '0', 'a', '0'],
        ['11', '0', '0', '0', 'a'],
      ],
    },
  },
}

export function referenceFor(component: ComponentDef): ComponentReference | undefined {
  return COMPONENT_REFERENCES[component.id] ?? (component.category === 'custom' ? CUSTOM_REFERENCE : undefined)
}
