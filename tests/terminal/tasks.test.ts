import { describe, expect, test } from 'bun:test'
import { TERMINAL_TASKS } from '../../src/terminal/tasks.ts'
import { assemble, runCases } from '../../src/terminal/x86.ts'

const primaryOnlyImages = {
  'lss-01': {
    image: 'and ax, bx\nhlt',
    namedCase: 'both relays high',
  },
  'nav-01': {
    image: 'or ax, bx\nhlt',
    namedCase: 'overlapping buses',
  },
  'com-02': {
    image: 'and ax, bx\nnot ax\nhlt',
    namedCase: 'partial overlap',
  },
  'mem-01': {
    image: 'mov ax, [0x20]\nand ax, 1\nmov [0x30], ax\nhlt',
    namedCase: 'dead word',
  },
  'pwr-01': {
    image: 'or ax, bx\nor ax, cx\nhlt',
    namedCase: 'all pumps cold',
  },
  'sns-02': {
    image: 'xor ax, bx\nnot ax\nhlt',
    namedCase: 'one line live',
  },
  'shd-02': {
    image: 'cmp cx, 0\nje routeA\nmov ax, bx\njmp done\nrouteA:\ndone:\nhlt',
    namedCase: 'invalid select rejects and routes A',
  },
} as const

const completeImages = {
  'lss-01': 'and ax, bx\nmov [0x40], ax\nhlt',
  'nav-01': 'mov dx, ax\nand dx, bx\nor ax, bx\nhlt',
  'com-02': 'mov dx, ax\nand dx, bx\nand ax, bx\nnot ax\nhlt',
  'mem-01': [
    'mov ax, [0x20]',
    'mov dx, ax',
    'and ax, 1',
    'mov [0x30], ax',
    'cmp dx, 0',
    'jne live',
    'mov dx, 0xffff',
    'mov [0x31], dx',
    'hlt',
    'live:',
    'mov dx, 0',
    'mov [0x31], dx',
    'hlt',
  ].join('\n'),
  'pwr-01': 'or ax, bx\nor ax, cx\nmov dx, 0\njnz live\nnot dx\nlive:\nhlt',
  'sns-02': 'mov dx, ax\nxor dx, bx\nxor ax, bx\nnot ax\nhlt',
  'shd-02': [
    'cmp cx, 1',
    'ja invalid',
    'jb routeA',
    'mov ax, bx',
    'mov dx, 0',
    'jmp done',
    'routeA:',
    'mov dx, 0',
    'jmp done',
    'invalid:',
    'mov dx, 0xffff',
    'done:',
    'hlt',
  ].join('\n'),
} as const

function task(id: string) {
  const found = TERMINAL_TASKS.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`missing ${id}`)
  return found
}

describe('terminal tasks', () => {
  test('every task has a clear contract, visible tests, and two hint tiers', () => {
    for (const candidate of TERMINAL_TASKS) {
      expect(candidate.contract.length).toBeGreaterThan(0)
      expect(candidate.tests.length).toBeGreaterThan(0)
      expect(candidate.summary.length).toBeGreaterThan(0)
      expect(candidate.conceptHint.length).toBeGreaterThan(0)
      expect(candidate.hint.length).toBeGreaterThan(0)
      expect(candidate.conceptHint).not.toBe(candidate.hint)
      expect(candidate.starter).not.toContain('FIX')
    }
  })

  test('every starter compiles and currently fails at least one case', () => {
    for (const candidate of TERMINAL_TASKS) {
      const program = assemble(candidate.starter)
      const results = runCases(program, candidate.tests)

      expect(results.length).toBe(candidate.tests.length)
      expect(results.every((result) => result.passed)).toBe(false)
    }
  })

  test('different correct images are both accepted', () => {
    const candidate = task('lss-01')

    const direct = assemble('and ax, bx\nmov [0x40], ax\nhlt')
    const viaScratch = assemble(
      'mov cx, ax\nand cx, bx\nmov ax, cx\nmov [0x40], ax\nhlt',
    )

    expect(runCases(direct, candidate.tests).every((result) => result.passed)).toBe(true)
    expect(runCases(viaScratch, candidate.tests).every((result) => result.passed)).toBe(true)
  })

  test('the seven second-requirement tasks reject the primary-only image on their named case', () => {
    for (const [id, check] of Object.entries(primaryOnlyImages)) {
      const results = runCases(assemble(check.image), task(id).tests)
      const named = results.find((result) => result.name === check.namedCase)

      expect(named).toBeDefined()
      expect(named?.passed).toBe(false)
      expect(results.every((result) => result.passed)).toBe(false)
    }
  })

  test('the seven second-requirement tasks accept a complete image', () => {
    for (const [id, image] of Object.entries(completeImages)) {
      const results = runCases(assemble(image), task(id).tests)
      expect(results.every((result) => result.passed)).toBe(true)
    }
  })
})
