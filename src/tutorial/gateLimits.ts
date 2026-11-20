import type { TutorialSection } from './types.ts'

/**
 * Gate count used by each board's reference build. The budget is this count
 * plus two spare gates, so the reference build always fits and there is room
 * to try a different arrangement.
 */
export const REFERENCE_GATE_COUNTS: Record<string, number> = {
  'intro-and': 1,
  'intro-or': 1,
  'intro-not': 1,
  'logic-and': 1,
  'logic-or': 1,
  'logic-or-priority': 2,
  'logic-not': 1,
  'logic-not-nand': 2,
  'logic-or3': 1,
  'logic-and3': 1,
  'logic-xor': 1,
  'logic-xnor': 1,
  'logic-nor': 1,
  'logic-mux': 1,
  'logic-full-adder': 5,
  'logic-compare2': 3,
  'logic-decoder2to4': 1,
  'logic-and-window': 2,
  'logic-adder2': 2,
  'logic-parity4': 3,
  'logic-mux4': 3,
  'logic-command-uplink': 10,
  'memory-d-flip-flop': 1,
  'memory-shift': 2,
}

const GATE_LIMIT_BUFFER = 2

export function gateLimitFor(section: Pick<TutorialSection, 'id'> | undefined): number | undefined {
  const reference = section ? REFERENCE_GATE_COUNTS[section.id] : undefined
  return reference === undefined ? undefined : reference + GATE_LIMIT_BUFFER
}
