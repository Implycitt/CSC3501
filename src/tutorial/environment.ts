import type { Circuit, PlacedPart, Wire } from '../game/circuit.ts'

const DEFAULT_X = 300
const DEFAULT_Y = 120
const COLUMN_GAP = 180
const ROW_GAP = 150

export interface PartOptions {
  as?: string
  x?: number
  y?: number
}

class EnvironmentBuilder {
  private readonly inputs: string[] = []
  private readonly outputs: string[] = []
  private readonly parts: PlacedPart[] = []
  private readonly wires: Wire[] = []
  private readonly aliases = new Map<string, string>()

  input(name: string): this {
    if (!this.inputs.includes(name)) this.inputs.push(name)
    return this
  }

  output(name: string): this {
    if (!this.outputs.includes(name)) this.outputs.push(name)
    return this
  }

  clock(): this {
    return this.input('clk')
  }

  place(componentId: string, options: PartOptions = {}): this {
    const alias = options.as ?? componentId
    if (this.aliases.has(alias)) {
      throw new Error(`Tutorial part "${alias}" is already placed; pass a unique "as" name.`)
    }

    const index = this.parts.length
    const uid = `t${index}`
    this.aliases.set(alias, uid)
    this.parts.push({
      uid,
      componentId,
      x: options.x ?? DEFAULT_X + (index % 3) * COLUMN_GAP,
      y: options.y ?? DEFAULT_Y + Math.floor(index / 3) * ROW_GAP,
    })
    return this
  }

  wire(from: string, to: string): this {
    this.wires.push({ from: this.endpoint(from), to: this.endpoint(to) })
    return this
  }

  build(): Circuit {
    return {
      parts: this.parts.map((part) => ({ ...part })),
      wires: this.wires.map((wire) => ({ ...wire })),
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      layout: {},
    }
  }

  private endpoint(ref: string): string {
    if (ref.startsWith('in:') || ref.startsWith('out:')) return ref

    const dot = ref.indexOf('.')
    if (dot <= 0 || dot === ref.length - 1) {
      throw new Error(`Tutorial endpoint "${ref}" needs a port, e.g. "gate.y".`)
    }

    const alias = ref.slice(0, dot)
    const port = ref.slice(dot + 1)
    const uid = this.aliases.get(alias)
    if (!uid) {
      throw new Error(
        `Tutorial endpoint "${ref}" uses unknown part "${alias}". Place it first with .place(..., { as: "${alias}" }).`,
      )
    }

    return `part:${uid}:${port}`
  }
}

export const environment = (): EnvironmentBuilder => new EnvironmentBuilder()
