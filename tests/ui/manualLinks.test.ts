import { describe, expect, test } from 'bun:test'
import {
  manualLabel,
  manualSectionForCircuitHint,
  manualSectionForCodeHint,
  manualSectionForError,
  manualSectionForFailure,
} from '../../src/sections/manualLinks.ts'

describe('manual links', () => {
  test('assembler errors point at the rule they break', () => {
    expect(manualSectionForError('Line 3: Both operands cannot be memory addresses.')).toBe('code-operands')
    expect(manualSectionForError('Line 2: Unknown label "done".')).toBe('code-jumps')
    expect(manualSectionForError('Line 1: Unknown instruction "mvo".')).toBe('code-instructions')
    expect(manualSectionForError('Line 1: Value 70000 does not fit in 16 bits.')).toBe('code-syntax')
    expect(manualSectionForError('Program ran past 10000 instructions without halting.')).toBe('code-errors')
  })

  test('failed values explain checking, while crashes use the error map', () => {
    expect(manualSectionForFailure('ax: expected 0x00F0, got 0x0000')).toBe('code-case')
    expect(manualSectionForFailure('Program ran past 10000 instructions without halting.')).toBe('code-errors')
  })

  test('code hints choose the page they explain', () => {
    expect(manualSectionForCodeHint('Copy bx into cx, invert cx, then AND ax with cx.')).toBe('code-examples')
    expect(manualSectionForCodeHint('Load [0x20] into ax, copy it to a scratch register.')).toBe('code-operands')
    expect(manualSectionForCodeHint('Compare cx with 1. Use unsigned branches.')).toBe('code-jumps')
    expect(manualSectionForCodeHint('Which bitwise operation keeps only bits set in both operands?')).toBe(
      'code-instructions',
    )
  })

  test('circuit hints choose the page they explain', () => {
    expect(manualSectionForCircuitHint('Advance the clock with Tick in the live signal strip.')).toBe('circuit-blocks')
    expect(manualSectionForCircuitHint('Dropping a second wire on a port replaces the first.')).toBe('circuit-bench')
    expect(manualSectionForCircuitHint('NOR is the all-clear gate.')).toBe('circuit-gates')
    expect(manualSectionForCircuitHint('If y stays dark, the old AND rule is still driving the output.')).toBe(
      'circuit-fixes',
    )
  })

  test('labels name the destination page', () => {
    expect(manualLabel('code-case')).toBe('Basics')
    expect(manualLabel('circuit-fixes')).toBe('Fixes')
  })
})
