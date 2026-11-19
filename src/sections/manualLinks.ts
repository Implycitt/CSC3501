import type { ManualTab } from './game/FieldManual.tsx'

export type ManualSection =
  | 'code-case'
  | 'code-operands'
  | 'code-syntax'
  | 'code-instructions'
  | 'code-jumps'
  | 'code-examples'
  | 'code-errors'
  | 'circuit-bench'
  | 'circuit-order'
  | 'circuit-gates'
  | 'circuit-blocks'
  | 'circuit-fixes'

const LABELS: Record<ManualSection, string> = {
  'code-case': 'Basics',
  'code-operands': 'Operands',
  'code-syntax': 'Syntax',
  'code-instructions': 'Instructions',
  'code-jumps': 'Jumps',
  'code-examples': 'Examples',
  'code-errors': 'Errors',
  'circuit-bench': 'Bench',
  'circuit-order': 'Work order',
  'circuit-gates': 'Gates',
  'circuit-blocks': 'Blocks',
  'circuit-fixes': 'Fixes',
}

export const manualLabel = (section: ManualSection): string => LABELS[section]

export const manualTabFor = (section: ManualSection): ManualTab =>
  section.startsWith('code-') ? 'code' : 'circuits'

/** Map an assembler error to the page that explains the rule it broke. */
export function manualSectionForError(message: string): ManualSection {
  const lower = message.toLowerCase()

  if (lower.includes('ran past') || lower.includes('without halting')) return 'code-errors'
  if (lower.includes('closing bracket') || lower.includes('does not fit in 16 bits')) return 'code-syntax'
  if (lower.includes('label') || lower.includes('jump')) return 'code-jumps'
  if (lower.includes('unknown instruction')) return 'code-instructions'
  if (
    lower.includes('takes no operands') ||
    lower.includes('takes one operand') ||
    lower.includes('takes two operands')
  ) {
    return 'code-instructions'
  }
  if (
    lower.includes('memory') ||
    lower.includes('operand') ||
    lower.includes('destination') ||
    lower.includes('indirect')
  ) {
    return 'code-operands'
  }
  if (lower.includes('number') || lower.includes('value')) return 'code-syntax'

  return 'code-errors'
}

/** A value mismatch is a checking question; a crash inside a case is an error. */
export function manualSectionForFailure(detail?: string): ManualSection {
  if (!detail) return 'code-case'
  if (detail.includes('expected 0x') && detail.includes('got 0x')) return 'code-case'
  return manualSectionForError(detail)
}

/** Pick the Code page that explains the task's hint. */
export function manualSectionForCodeHint(hint: string): ManualSection {
  const lower = hint.toLowerCase()

  if (
    lower.includes('cmp') ||
    lower.includes('flag') ||
    lower.includes('branch') ||
    lower.includes('jump') ||
    lower.includes('label')
  ) {
    return 'code-jumps'
  }
  if (
    lower.includes('[0x') ||
    lower.includes('memory') ||
    lower.includes('load ') ||
    lower.includes('address') ||
    lower.includes('byte') ||
    lower.includes('word')
  ) {
    return 'code-operands'
  }
  if (
    lower.includes('copy') ||
    lower.includes('copies') ||
    lower.includes('scratch') ||
    lower.includes('preserve') ||
    lower.includes('borrow')
  ) {
    return 'code-examples'
  }
  if (/(instruction|operation|bitwise|\band\b|\bor\b|\bxor\b|\bnot\b|invert|mask|logic|shift)/.test(lower)) {
    return 'code-instructions'
  }
  if (
    lower.includes('operand') ||
    lower.includes('register') ||
    lower.includes('immediate') ||
    lower.includes('destination') ||
    lower.includes('store')
  ) {
    return 'code-operands'
  }
  if (lower.includes('syntax') || lower.includes('comment') || lower.includes('literal') || lower.includes('number')) {
    return 'code-syntax'
  }

  return 'code-examples'
}

/** Pick the Circuits page that explains the step's hint. */
export function manualSectionForCircuitHint(hint: string): ManualSection {
  const lower = hint.toLowerCase()

  if (/(old|still|stays dark|driv)/.test(lower)) return 'circuit-fixes'
  if (/(clock|tick|flip-flop|latch|shift register|memory|decoder|multiplexer|mux|select|carry|adder|route)/.test(lower)) {
    return 'circuit-blocks'
  }
  if (
    /(\bplace\b|\bput\b|\bdrag\b|\bdrop\b|\bclick\b|\bchip\b|parts rail|canvas|\bport\b|\bwire\b|\bswitch\b|already on|turn .* (on|off)|between)/.test(
      lower,
    )
  ) {
    return 'circuit-bench'
  }
  if (/(gate|inverter|inversion|veto|\band\b|\bor\b|\bnot\b|\bxor\b|\bxnor\b|\bnor\b|\bnand\b)/.test(lower)) {
    return 'circuit-gates'
  }
  if (/(truth|timing|trace|work order|case)/.test(lower)) return 'circuit-order'

  return 'circuit-bench'
}
