import type { ComponentDef } from '../types.ts'

export const ARITHMETIC_COMPONENTS: ComponentDef[] = [
  { id: 'half-adder', name: 'Half Adder', category: 'arithmetic', description: 'Adds two bits into a sum and carry.' },
  { id: 'full-adder', name: 'Full Adder', category: 'arithmetic', description: 'Adds two bits plus a carry-in into a sum and carry-out.' },
  { id: 'half-subtractor', name: 'Half Subtractor', category: 'arithmetic', description: 'Subtracts one bit from another into a difference and borrow.' },
  { id: 'full-subtractor', name: 'Full Subtractor', category: 'arithmetic', description: 'Subtracts two bits plus a borrow-in into a difference and borrow-out.' },
  { id: 'adder2', name: '2-bit Adder', category: 'arithmetic', description: 'Adds two 2-bit values with a carry-in.' },
  { id: 'adder4', name: '4-bit Adder', category: 'arithmetic', description: 'Adds two 4-bit values with a carry-in.' },
]
