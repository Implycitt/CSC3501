export const REGISTER_NAMES = ['ax', 'bx', 'cx', 'dx', 'si', 'di'] as const
export type Register = (typeof REGISTER_NAMES)[number]
export type Registers = Record<Register, number>

export const MEMORY_WORDS = 256
export const DEFAULT_STEP_LIMIT = 10000

export type Opcode =
  | 'mov'
  | 'add'
  | 'sub'
  | 'and'
  | 'or'
  | 'xor'
  | 'cmp'
  | 'not'
  | 'inc'
  | 'dec'
  | 'jmp'
  | 'je'
  | 'jne'
  | 'jz'
  | 'jnz'
  | 'jl'
  | 'jle'
  | 'jg'
  | 'jge'
  | 'jb'
  | 'jbe'
  | 'ja'
  | 'jae'
  | 'nop'
  | 'hlt'

export type Operand =
  | { kind: 'reg'; name: Register }
  | { kind: 'imm'; value: number }
  | { kind: 'mem'; address: number }

export interface Instruction {
  op: Opcode
  operands: Operand[]
  line: number
  target?: string
}

export interface Program {
  instructions: Instruction[]
  labels: Record<string, number>
}

export interface Flags {
  zero: boolean
  sign: boolean
  carry: boolean
  overflow: boolean
}

export interface MachineState {
  regs: Registers
  memory: number[]
  flags: Flags
  pc: number
  steps: number
  halted: boolean
}

export interface MachineSetup {
  regs?: Partial<Record<Register, number>>
  memory?: Record<number, number>
}

export interface MachineExpectation {
  regs?: Partial<Record<Register, number>>
  memory?: Record<number, number>
}

export interface TestCase {
  name: string
  setup?: MachineSetup
  expect: MachineExpectation
}

export interface CaseResult {
  name: string
  passed: boolean
  detail?: string
}

const REGISTER_SET = new Set<string>(REGISTER_NAMES)
const JUMP_OPS = new Set<Opcode>(['jmp', 'je', 'jne', 'jz', 'jnz', 'jl', 'jle', 'jg', 'jge', 'jb', 'jbe', 'ja', 'jae'])
const ZERO_OPERAND_OPS = new Set<Opcode>(['nop', 'hlt'])
const ONE_OPERAND_OPS = new Set<Opcode>(['not', 'inc', 'dec'])
const TWO_OPERAND_OPS = new Set<Opcode>(['mov', 'add', 'sub', 'and', 'or', 'xor', 'cmp'])
const MNEMONICS = new Set<Opcode>([
  ...JUMP_OPS,
  ...ZERO_OPERAND_OPS,
  ...ONE_OPERAND_OPS,
  ...TWO_OPERAND_OPS,
])

export class AssemblyError extends Error {
  line: number

  constructor(message: string, line = 0) {
    super(line > 0 ? `Line ${line}: ${message}` : message)
    this.name = 'AssemblyError'
    this.line = line
  }
}

function stripComment(line: string): string {
  let quoted = false
  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    if (character === "'") quoted = !quoted
    if (character === ';' && !quoted) return line.slice(0, index)
  }
  return line
}

function splitOperands(text: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quoted = false

  for (const character of text) {
    if (character === "'") quoted = !quoted
    else if (!quoted && character === '[') depth++
    else if (!quoted && character === ']') depth--

    if (!quoted && depth === 0 && character === ',') {
      if (current.trim()) parts.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseImmediate(text: string, line: number): number {
  let value: number | undefined

  if (/^-?\d+$/.test(text)) value = Number(text)
  else if (/^0x[0-9a-f]+$/i.test(text)) value = Number.parseInt(text.slice(2), 16)
  else if (/^0b[01]+$/i.test(text)) value = Number.parseInt(text.slice(2), 2)
  else if (/^'.'$/s.test(text)) value = text.charCodeAt(1)

  if (value === undefined || !Number.isFinite(value)) {
    throw new AssemblyError(`"${text}" is not a number, register or memory address.`, line)
  }
  if (value < -32768 || value > 65535) {
    throw new AssemblyError(`Value ${text} does not fit in 16 bits.`, line)
  }
  return value & 0xffff
}

function parseOperand(text: string, line: number): Operand {
  const token = text.trim()
  if (!token) throw new AssemblyError('Missing operand.', line)

  const lower = token.toLowerCase()
  if (REGISTER_SET.has(lower)) return { kind: 'reg', name: lower as Register }

  if (token.startsWith('[')) {
    if (!token.endsWith(']')) throw new AssemblyError(`Memory operand "${token}" is missing its closing bracket.`, line)
    const inner = token.slice(1, -1).trim()
    if (!inner) throw new AssemblyError('Memory operand is empty.', line)
    if (REGISTER_SET.has(inner.toLowerCase())) {
      throw new AssemblyError('Register indirect addressing is not available. Use an absolute address like [0x20].', line)
    }
    const address = parseImmediate(inner, line)
    if (address >= MEMORY_WORDS) {
      throw new AssemblyError(
        `Memory address 0x${address.toString(16)} is outside 0x00..0x${(MEMORY_WORDS - 1).toString(16)}.`,
        line,
      )
    }
    return { kind: 'mem', address }
  }

  return { kind: 'imm', value: parseImmediate(token, line) }
}

function isMemory(operand: Operand): boolean {
  return operand.kind === 'mem'
}

function validateOperands(op: Opcode, operands: Operand[], line: number): void {
  if (ZERO_OPERAND_OPS.has(op)) {
    if (operands.length > 0) throw new AssemblyError(`${op.toUpperCase()} takes no operands.`, line)
    return
  }

  if (ONE_OPERAND_OPS.has(op)) {
    if (operands.length !== 1) throw new AssemblyError(`${op.toUpperCase()} takes one operand.`, line)
    if (operands[0].kind === 'imm') {
      throw new AssemblyError(`The operand of ${op.toUpperCase()} must be a register or memory address.`, line)
    }
    return
  }

  if (TWO_OPERAND_OPS.has(op)) {
    if (operands.length !== 2) throw new AssemblyError(`${op.toUpperCase()} takes two operands.`, line)
    if (isMemory(operands[0]) && isMemory(operands[1])) {
      throw new AssemblyError('Both operands cannot be memory addresses.', line)
    }
    if (operands[0].kind === 'imm') {
      throw new AssemblyError(`The destination of ${op.toUpperCase()} must be a register or memory address.`, line)
    }
    return
  }

  if (operands.length > 0) throw new AssemblyError(`${op.toUpperCase()} takes a label, not operands.`, line)
}

export function assemble(source: string): Program {
  const instructions: Instruction[] = []
  const labels: Record<string, number> = {}

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1
    let text = stripComment(rawLine).trim()
    if (!text) return

    const labelMatch = text.match(/^([A-Za-z_.][A-Za-z0-9_.]*):\s*(.*)$/)
    if (labelMatch) {
      const name = labelMatch[1].toLowerCase()
      if (labels[name] !== undefined) throw new AssemblyError(`Label "${labelMatch[1]}" is already defined.`, line)
      labels[name] = instructions.length
      text = labelMatch[2].trim()
      if (!text) return
    }

    const [head, ...restWords] = text.split(/\s+/)
    const op = head.toLowerCase() as Opcode
    if (!MNEMONICS.has(op)) throw new AssemblyError(`Unknown instruction "${head}".`, line)

    const argumentText = restWords.join(' ').trim()

    if (JUMP_OPS.has(op)) {
      if (!argumentText || argumentText.includes(',')) {
        throw new AssemblyError(`${op.toUpperCase()} needs a single label.`, line)
      }
      instructions.push({ op, operands: [], line, target: argumentText.toLowerCase() })
      return
    }

    const operands = argumentText ? splitOperands(argumentText).map((operand) => parseOperand(operand, line)) : []
    validateOperands(op, operands, line)
    instructions.push({ op, operands, line })
  })

  for (const instruction of instructions) {
    if (instruction.target !== undefined && labels[instruction.target] === undefined) {
      throw new AssemblyError(`Unknown label "${instruction.target}".`, instruction.line)
    }
  }

  return { instructions, labels }
}

export function createMachine(setup: MachineSetup = {}): MachineState {
  const regs = Object.fromEntries(REGISTER_NAMES.map((name) => [name, 0])) as Registers
  for (const name of REGISTER_NAMES) {
    const value = setup.regs?.[name]
    if (value !== undefined) regs[name] = value & 0xffff
  }

  const memory = Array.from({ length: MEMORY_WORDS }, () => 0)
  for (const [address, value] of Object.entries(setup.memory ?? {})) {
    const index = Number(address)
    if (Number.isInteger(index) && index >= 0 && index < MEMORY_WORDS) memory[index] = value & 0xffff
  }

  return {
    regs,
    memory,
    flags: { zero: false, sign: false, carry: false, overflow: false },
    pc: 0,
    steps: 0,
    halted: false,
  }
}

function flagsFor(result: number, carry: boolean, overflow: boolean): Flags {
  return {
    zero: (result & 0xffff) === 0,
    sign: (result & 0x8000) !== 0,
    carry,
    overflow,
  }
}

function addFlags(left: number, right: number, result: number): Flags {
  return flagsFor(
    result,
    left + right > 0xffff,
    ((left ^ result) & (right ^ result) & 0x8000) !== 0,
  )
}

function subtractFlags(left: number, right: number, result: number): Flags {
  return flagsFor(
    result,
    left < right,
    ((left ^ right) & (left ^ result) & 0x8000) !== 0,
  )
}

function readOperand(state: MachineState, operand: Operand): number {
  if (operand.kind === 'reg') return state.regs[operand.name]
  if (operand.kind === 'imm') return operand.value
  return state.memory[operand.address] ?? 0
}

function writeOperand(state: MachineState, operand: Operand, value: number): void {
  const masked = value & 0xffff
  if (operand.kind === 'reg') {
    state.regs[operand.name] = masked
    return
  }
  if (operand.kind === 'mem') state.memory[operand.address] = masked
}

function jumpTaken(op: Opcode, flags: Flags): boolean {
  switch (op) {
    case 'jmp':
      return true
    case 'je':
    case 'jz':
      return flags.zero
    case 'jne':
    case 'jnz':
      return !flags.zero
    case 'jl':
      return flags.sign !== flags.overflow
    case 'jle':
      return flags.zero || flags.sign !== flags.overflow
    case 'jg':
      return !flags.zero && flags.sign === flags.overflow
    case 'jge':
      return flags.sign === flags.overflow
    case 'jb':
      return flags.carry
    case 'jbe':
      return flags.carry || flags.zero
    case 'ja':
      return !flags.carry && !flags.zero
    case 'jae':
      return !flags.carry
    default:
      return false
  }
}

function execute(state: MachineState, program: Program, instruction: Instruction): void {
  const [destination, source] = instruction.operands

  switch (instruction.op) {
    case 'mov':
      writeOperand(state, destination, readOperand(state, source))
      return

    case 'add': {
      const left = readOperand(state, destination)
      const right = readOperand(state, source)
      const result = (left + right) & 0xffff
      writeOperand(state, destination, result)
      state.flags = addFlags(left, right, result)
      return
    }

    case 'sub': {
      const left = readOperand(state, destination)
      const right = readOperand(state, source)
      const result = (left - right) & 0xffff
      writeOperand(state, destination, result)
      state.flags = subtractFlags(left, right, result)
      return
    }

    case 'and': {
      const result = readOperand(state, destination) & readOperand(state, source)
      writeOperand(state, destination, result)
      state.flags = flagsFor(result, false, false)
      return
    }

    case 'or': {
      const result = readOperand(state, destination) | readOperand(state, source)
      writeOperand(state, destination, result)
      state.flags = flagsFor(result, false, false)
      return
    }

    case 'xor': {
      const result = readOperand(state, destination) ^ readOperand(state, source)
      writeOperand(state, destination, result)
      state.flags = flagsFor(result, false, false)
      return
    }

    case 'cmp': {
      const left = readOperand(state, destination)
      const right = readOperand(state, source)
      state.flags = subtractFlags(left, right, (left - right) & 0xffff)
      return
    }

    case 'not': {
      writeOperand(state, destination, ~readOperand(state, destination))
      return
    }

    case 'inc': {
      const left = readOperand(state, destination)
      const result = (left + 1) & 0xffff
      writeOperand(state, destination, result)
      const flags = addFlags(left, 1, result)
      state.flags = { ...flags, carry: state.flags.carry }
      return
    }

    case 'dec': {
      const left = readOperand(state, destination)
      const result = (left - 1) & 0xffff
      writeOperand(state, destination, result)
      const flags = subtractFlags(left, 1, result)
      state.flags = { ...flags, carry: state.flags.carry }
      return
    }

    case 'nop':
      return

    case 'hlt':
      state.halted = true
      return

    default:
      if (jumpTaken(instruction.op, state.flags) && instruction.target !== undefined) {
        state.pc = program.labels[instruction.target] ?? 0
      }
  }
}

export function run(program: Program, setup: MachineSetup = {}, stepLimit: number = DEFAULT_STEP_LIMIT): MachineState {
  const state = createMachine(setup)

  while (!state.halted) {
    if (state.pc >= program.instructions.length) {
      state.halted = true
      break
    }
    if (state.steps >= stepLimit) {
      throw new AssemblyError(`Program ran past ${stepLimit} instructions without halting.`)
    }

    const instruction = program.instructions[state.pc]
    state.pc += 1
    state.steps += 1
    execute(state, program, instruction)
  }

  return state
}

const hex = (value: number) => value.toString(16).toUpperCase().padStart(4, '0')

export function runCases(program: Program, cases: readonly TestCase[]): CaseResult[] {
  return cases.map((test) => {
    try {
      const state = run(program, test.setup)
      const details: string[] = []

      for (const name of REGISTER_NAMES) {
        const expected = test.expect.regs?.[name]
        if (expected === undefined) continue
        const actual = state.regs[name]
        if (actual !== (expected & 0xffff)) {
          details.push(`${name}: expected 0x${hex(expected)}, got 0x${hex(actual)}`)
        }
      }

      for (const [address, expected] of Object.entries(test.expect.memory ?? {})) {
        const index = Number(address)
        const actual = state.memory[index] ?? 0
        if (actual !== (expected & 0xffff)) {
          details.push(`[0x${Number(address).toString(16).toUpperCase()}]: expected 0x${hex(expected)}, got 0x${hex(actual)}`)
        }
      }

      return {
        name: test.name,
        passed: details.length === 0,
        ...(details.length > 0 ? { detail: details.join(' · ') } : {}),
      }
    } catch (error) {
      return {
        name: test.name,
        passed: false,
        detail: error instanceof Error ? error.message : String(error),
      }
    }
  })
}
