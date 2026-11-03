import type { ComponentDef } from '../types.ts'

export const ROUTING_COMPONENTS: ComponentDef[] = [
  { id: 'mux2', name: '2:1 Multiplexer', category: 'routing', description: 'Selects one of two inputs.' },
  { id: 'mux4', name: '4:1 Multiplexer', category: 'routing', description: 'Selects one of four inputs with two select bits.' },
  { id: 'mux8', name: '8:1 Multiplexer', category: 'routing', description: 'Selects one of eight inputs with three select bits.' },
  { id: 'mux16', name: '16:1 Multiplexer', category: 'routing', description: 'Selects one of sixteen inputs with four select bits.' },
  { id: 'demux2', name: '1:2 Demultiplexer', category: 'routing', description: 'Routes one input to one of two outputs.' },
  { id: 'demux4', name: '1:4 Demultiplexer', category: 'routing', description: 'Routes one input to one of four outputs.' },
  { id: 'decoder2to4', name: '2-to-4 Decoder', category: 'routing', description: 'Raises exactly one of four outputs for each input code.' },
  { id: 'decoder3to8', name: '3-to-8 Decoder', category: 'routing', description: 'Raises exactly one of eight outputs for each input code.' },
  { id: 'decoder4to16', name: '4-to-16 Decoder', category: 'routing', description: 'Raises exactly one of sixteen outputs for each input code.' },
  { id: 'encoder4to2', name: '4-to-2 Encoder', category: 'routing', description: 'Encodes which of four inputs is high into two bits.' },
  { id: 'encoder8to3', name: '8-to-3 Encoder', category: 'routing', description: 'Encodes which of eight inputs is high into three bits.' },
  { id: 'comparator1', name: '1-bit Comparator', category: 'routing', description: 'Reports whether two bits are equal, or which is larger.' },
]
