import type { Netlist } from '../types.ts'
import { GATE_NETLISTS } from './gates.ts'
import { ARITHMETIC_NETLISTS } from './arithmetic.ts'
import { ROUTING_NETLISTS } from './routing.ts'
import { SEQUENTIAL_NETLISTS } from './sequential.ts'
import { HISTORICAL_NETLISTS } from './historical.ts'

export const NETLISTS: Record<string, Netlist> = {
  ...GATE_NETLISTS,
  ...ARITHMETIC_NETLISTS,
  ...ROUTING_NETLISTS,
  ...SEQUENTIAL_NETLISTS,
  ...HISTORICAL_NETLISTS,
}
