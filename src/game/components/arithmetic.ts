import type { ComponentDef } from '../types.ts'

export const ARITHMETIC_COMPONENTS: ComponentDef[] = [
  { id: 'half-adder', name: 'Half Adder', category: 'arithmetic', description: 'Adds two bits into a sum and carry.' },
  { id: 'full-adder', name: 'Full Adder', category: 'arithmetic', description: 'Adds two bits plus a carry-in into a sum and carry-out.' },
  { id: 'half-subtractor', name: 'Half Subtractor', category: 'arithmetic', description: 'Subtracts one bit from another into a difference and borrow.' },
  { id: 'full-subtractor', name: 'Full Subtractor', category: 'arithmetic', description: 'Subtracts two bits plus a borrow-in into a difference and borrow-out.' },
  { id: 'adder2', name: '2-bit Adder', category: 'arithmetic', description: 'Adds two 2-bit values with a carry-in.' },
  { id: 'adder4', name: '4-bit Adder', category: 'arithmetic', description: 'Adds two 4-bit values with a carry-in.' },
  { id: 'adder8', name: '8-bit Adder', category: 'arithmetic', description: 'Adds two 8-bit values with a carry-in.' },
  { id: 'multiplier4', name: '4-bit Multiplier', category: 'arithmetic', description: 'Multiplies two 4-bit values into an 8-bit product.' },
  { id: 'comparator4', name: '4-bit Comparator', category: 'arithmetic', description: 'Reports whether two 4-bit values are equal, or which is larger.' },
  { id: 'alu8', name: '8-bit ALU', category: 'arithmetic', description: 'Adds, subtracts, ANDs, ORs, XORs, inverts, or shifts based on three op bits.' },
]
