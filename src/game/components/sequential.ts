import type { ComponentDef } from '../types.ts'

export const SEQUENTIAL_COMPONENTS: ComponentDef[] = [
  { id: 'sr-latch', name: 'SR Latch', category: 'memory', description: 'Stores one bit using two cross-coupled NOR gates.' },
  { id: 'sr-latch-nand', name: 'SR Latch (NAND)', category: 'memory', description: 'Stores one bit using two cross-coupled NAND gates with active-low inputs.' },
  { id: 'gated-d-latch', name: 'Gated D Latch', category: 'memory', description: 'Stores one bit while its enable input is high.' },
  { id: 'd-flip-flop', name: 'D Flip-Flop', category: 'memory', description: 'Captures its input on each clock edge.' },
  { id: 'd-flip-flop-en', name: 'D Flip-Flop with Enable', category: 'memory', description: 'Captures its input on each clock edge while enabled.' },
  { id: 'jk-flip-flop', name: 'JK Flip-Flop', category: 'memory', description: 'Sets, resets, toggles, or holds on each clock edge.' },
  { id: 't-flip-flop', name: 'T Flip-Flop', category: 'memory', description: 'Toggles on each clock edge while its input is high.' },
  { id: 'register4', name: '4-bit Register', category: 'memory', description: 'Stores four bits on each clock edge while enabled.' },
  { id: 'shift-register4', name: '4-bit Shift Register', category: 'memory', description: 'Shifts one bit through four stages on each clock edge.' },
  { id: 'counter2', name: '2-bit Counter', category: 'memory', description: 'Counts clock edges modulo four, with a synchronous reset.' },
  { id: 'counter4', name: '4-bit Counter', category: 'memory', description: 'Counts clock edges modulo sixteen, with a synchronous reset.' },
]
