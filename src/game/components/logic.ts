import type { ComponentDef } from '../types.ts'

export const LOGIC_COMPONENTS: ComponentDef[] = [
  { id: 'not', name: 'NOT Gate', category: 'logic', description: 'Inverts its input.' },
  { id: 'buffer', name: 'Buffer', category: 'logic', description: 'Passes its input through unchanged.' },
  { id: 'and', name: 'AND Gate', category: 'logic', description: 'Output is 1 only when both inputs are 1.' },
  { id: 'nand', name: 'NAND Gate', category: 'logic', description: 'Output is 0 only when both inputs are 1.' },
  { id: 'or', name: 'OR Gate', category: 'logic', description: 'Output is 1 when either input is 1.' },
  { id: 'nor', name: 'NOR Gate', category: 'logic', description: 'Output is 1 only when both inputs are 0.' },
  { id: 'xor', name: 'XOR Gate', category: 'logic', description: 'Output is 1 when the inputs differ.' },
  { id: 'xnor', name: 'XNOR Gate', category: 'logic', description: 'Output is 1 when the inputs match.' },
  { id: 'and3', name: '3-Input AND', category: 'logic', description: 'Output is 1 only when all three inputs are 1.' },
  { id: 'or3', name: '3-Input OR', category: 'logic', description: 'Output is 1 when any of the three inputs is 1.' },
  { id: 'nand3', name: '3-Input NAND', category: 'logic', description: 'Output is 0 only when all three inputs are 1.' },
  { id: 'nor3', name: '3-Input NOR', category: 'logic', description: 'Output is 1 only when all three inputs are 0.' },
  { id: 'xor3', name: '3-Input XOR', category: 'logic', description: 'Output is 1 when an odd number of inputs are 1.' },
  { id: 'transistor', name: 'Transistor', category: 'logic', description: 'Switch that passes its input while the gate is high.' },
  { id: 'const0', name: 'Constant 0', category: 'logic', description: 'Always outputs 0.' },
  { id: 'const1', name: 'Constant 1', category: 'logic', description: 'Always outputs 1.' },
]
