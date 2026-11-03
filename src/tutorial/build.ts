import type { Circuit, PlacedPart, Wire } from '../game/circuit.ts'
import type { TutorialContext } from './types.ts'

const DEFAULT_X = 300
const DEFAULT_Y = 120
const COLUMN_GAP = 180
const ROW_GAP = 150

export interface PartOptions {
  /** Unique handle used to wire this part later. Defaults to the component id. */
  as?: string
  x?: number
  y?: number
}

/**
 * Fluent helper for writing tutorial environments by hand. Parts are named once
 * and wired by `name.port`, so a section file stays readable:
 *
 *   environment()
 *     .input('a').input('b').output('y')
 *     .place('and', { as: 'gate' })
 *     .wire('in:a', 'gate.a')
 *     .wire('in:b', 'gate.b')
 *     .wire('gate.y', 'out:y')
 *     .build()
 *
 * Endpoint errors are raised while the section is defined, which keeps broken
 * lessons from reaching the browser.
 */
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

  /** Adds the clock input the sequential components expect. */
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

/** True once at least `count` parts of this component type are on the canvas. */
export const placed = (componentId: string, count = 1) => {
  return (context: TutorialContext): boolean =>
    context.circuit.parts.filter((part) => part.componentId === componentId).length >= count
}

const endpointPart = (circuit: Circuit, key: string): PlacedPart | undefined => {
  if (!key.startsWith('part:')) return undefined
  const [, uid] = key.split(':')
  return circuit.parts.find((part) => part.uid === uid)
}

/** True once something is wired into the given port of a placed component. */
export const portDriven = (componentId: string, port: string) => {
  return (context: TutorialContext): boolean =>
    context.circuit.wires.some((wire) => {
      const part = endpointPart(context.circuit, wire.to)
      return part?.componentId === componentId && wire.to.endsWith(`:${port}`)
    })
}

/** Combines step predicates into one that only passes when all of them do. */
export const allOf = (...predicates: ((context: TutorialContext) => boolean)[]) => {
  return (context: TutorialContext): boolean => predicates.every((predicate) => predicate(context))
}

/** True once a wire drives the named output. */
export const outputDriven = (name: string) => {
  return (context: TutorialContext): boolean => context.circuit.wires.some((wire) => wire.to === `out:${name}`)
}

/** True while the named input is switched on. */
export const inputHigh = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) === true
}

/** True while the named output is lit. */
export const outputHigh = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) === true
}
