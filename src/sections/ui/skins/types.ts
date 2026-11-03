import type { ComponentCategory } from '../../../game/types.ts'

export type GlyphName =
  | 'not'
  | 'buffer'
  | 'and'
  | 'nand'
  | 'or'
  | 'nor'
  | 'xor'
  | 'xnor'
  | 'switch'
  | 'constant'
  | 'mux'
  | 'demux'
  | 'decode'
  | 'encode'
  | 'compare'
  | 'latch'
  | 'flipflop'
  | 'register'
  | 'shift'
  | 'counter'
  | 'ram'
  | 'adder'
  | 'subtractor'
  | 'multiplier'
  | 'alu'
  | 'tube'
  | 'diode'
  | 'core'
  | 'relay'
  | 'build'
  | 'generic'

export interface PartSkin {
  accent: ComponentCategory
  glyph: GlyphName
  image?: string
}
