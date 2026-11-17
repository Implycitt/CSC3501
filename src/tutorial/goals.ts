import type { CircuitGoal } from '../game/behavior.ts'

/**
 * Builds a complete truth table for a combinational circuit with any number
 * of outputs. Every input combination is checked, so the final puzzle
 * validator does not care which gates or wire layout the player chose.
 */
export function multiLogicGoal(
  inputs: string[],
  rules: Record<string, (...values: boolean[]) => boolean>,
): CircuitGoal {
  const outputs = Object.keys(rules)
  const cases = Array.from({ length: 2 ** inputs.length }, (_, mask) => {
    // Standard truth-table order: the first input is the most significant bit,
    // so cases read 000, 001, 010, ... instead of jumping between bit columns.
    const values = inputs.map((_, index) => {
      const position = inputs.length - index - 1
      return (mask & (1 << position)) !== 0
    })
    return {
      name: values.map((value) => (value ? '1' : '0')).join(''),
      inputs: Object.fromEntries(inputs.map((name, index) => [name, values[index]])),
      outputs: Object.fromEntries(outputs.map((name) => [name, rules[name](...values)])),
    }
  })

  return { inputs, outputs, cases }
}

/** Builds a complete truth table for a single-output combinational circuit. */
export function logicGoal(
  inputs: string[],
  output: string,
  rule: (...values: boolean[]) => boolean,
): CircuitGoal {
  return multiLogicGoal(inputs, { [output]: rule })
}
