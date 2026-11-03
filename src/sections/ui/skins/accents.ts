import type { ComponentCategory } from '../../../game/types.ts'

export interface AccentStyle {
  border: string
  band: string
  glyph: string
  bar: string
}

export const ACCENTS: Record<ComponentCategory, AccentStyle> = {
  logic: {
    border: 'border-amber-600',
    band: 'border-amber-800 bg-amber-950/40',
    glyph: 'text-amber-300',
    bar: 'bg-amber-400',
  },
  arithmetic: {
    border: 'border-sky-700',
    band: 'border-sky-900 bg-sky-950/40',
    glyph: 'text-sky-300',
    bar: 'bg-sky-400',
  },
  routing: {
    border: 'border-violet-700',
    band: 'border-violet-900 bg-violet-950/40',
    glyph: 'text-violet-300',
    bar: 'bg-violet-400',
  },
  memory: {
    border: 'border-emerald-700',
    band: 'border-emerald-900 bg-emerald-950/40',
    glyph: 'text-emerald-300',
    bar: 'bg-emerald-400',
  },
  historical: {
    border: 'border-rose-800',
    band: 'border-rose-900 bg-rose-950/40',
    glyph: 'text-rose-300',
    bar: 'bg-rose-400',
  },
  custom: {
    border: 'border-teal-700',
    band: 'border-teal-900 bg-teal-950/40',
    glyph: 'text-teal-300',
    bar: 'bg-teal-400',
  },
}
