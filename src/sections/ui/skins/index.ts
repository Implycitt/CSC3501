import { getComponent } from '../../../game/registry.ts'
import type { ComponentCategory } from '../../../game/types.ts'
import { GLYPH_IMAGES } from './art.ts'
import type { GlyphName, PartSkin } from './types.ts'

const CATEGORY_GLYPHS: Record<ComponentCategory, GlyphName> = {
  logic: 'and',
  arithmetic: 'adder',
  routing: 'mux',
  memory: 'flipflop',
  historical: 'tube',
  custom: 'build',
}

const COMPONENT_GLYPHS: Record<string, GlyphName> = {
  not: 'not',
  buffer: 'buffer',
  and: 'and',
  and3: 'and',
  nand: 'nand',
  nand3: 'nand',
  or: 'or',
  or3: 'or',
  nor: 'nor',
  nor3: 'nor',
  xor: 'xor',
  xor3: 'xor',
  xnor: 'xnor',
  transistor: 'switch',
  const0: 'constant',
  const1: 'constant',
  'half-adder': 'adder',
  'full-adder': 'adder',
  adder2: 'adder',
  adder4: 'adder',
  adder8: 'adder',
  'half-subtractor': 'subtractor',
  'full-subtractor': 'subtractor',
  multiplier4: 'multiplier',
  alu8: 'alu',
  comparator1: 'compare',
  comparator4: 'compare',
  mux2: 'mux',
  mux4: 'mux',
  mux8: 'mux',
  mux16: 'mux',
  demux2: 'demux',
  demux4: 'demux',
  decoder2to4: 'decode',
  decoder3to8: 'decode',
  decoder4to16: 'decode',
  encoder4to2: 'encode',
  encoder8to3: 'encode',
  'sr-latch': 'latch',
  'sr-latch-nand': 'latch',
  'gated-d-latch': 'latch',
  'd-flip-flop': 'flipflop',
  'd-flip-flop-en': 'flipflop',
  'jk-flip-flop': 'flipflop',
  't-flip-flop': 'flipflop',
  register4: 'register',
  register8: 'register',
  'shift-register4': 'shift',
  'shift-register8': 'shift',
  counter2: 'counter',
  counter4: 'counter',
  counter8: 'counter',
  ram16x8: 'ram',
  'vacuum-tube': 'tube',
  relay: 'relay',
  diode: 'diode',
  'magnetic-core': 'core',
  'mercury-delay-line': 'shift',
  'stepping-switch': 'decode',
}

export function skinFor(componentId: string): PartSkin {
  const category = getComponent(componentId)?.category ?? 'custom'
  const glyph = COMPONENT_GLYPHS[componentId] ?? CATEGORY_GLYPHS[category]
  return { accent: category, glyph, image: GLYPH_IMAGES[glyph] }
}

export type { GlyphName, PartSkin } from './types.ts'

export const accentClass = (category: ComponentCategory): string => `accent-${category}`
