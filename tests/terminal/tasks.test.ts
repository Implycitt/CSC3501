import { describe, expect, test } from 'bun:test'
import { TERMINAL_TASKS } from '../../src/terminal/tasks.ts'
import { assemble, runCases } from '../../src/terminal/x86.ts'

describe('terminal tasks', () => {
  test('every task has a clear contract and visible test cases', () => {
    for (const task of TERMINAL_TASKS) {
      expect(task.contract.length).toBeGreaterThan(0)
      expect(task.tests.length).toBeGreaterThan(0)
      expect(task.summary.length).toBeGreaterThan(0)
      expect(task.hint.length).toBeGreaterThan(0)
    }
  })

  test('every starter compiles and currently fails at least one case', () => {
    for (const task of TERMINAL_TASKS) {
      const program = assemble(task.starter)
      const results = runCases(program, task.tests)

      expect(results.length).toBe(task.tests.length)
      expect(results.every((result) => result.passed)).toBe(false)
    }
  })

  test('different correct images are both accepted', () => {
    const task = TERMINAL_TASKS.find((candidate) => candidate.id === 'lss-01')
    if (!task) throw new Error('missing lss-01')

    const direct = assemble('and ax, bx\nhlt')
    const viaScratch = assemble('mov cx, ax\nand cx, bx\nmov ax, cx\nhlt')

    expect(runCases(direct, task.tests).every((result) => result.passed)).toBe(true)
    expect(runCases(viaScratch, task.tests).every((result) => result.passed)).toBe(true)
  })
})
