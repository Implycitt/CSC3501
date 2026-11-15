import type { Circuit, PlacedPart } from '../game/circuit.ts'
import type { TutorialContext } from './types.ts'

const endpointPart = (circuit: Circuit, key: string): PlacedPart | undefined => {
  if (!key.startsWith('part:')) return undefined
  const [, uid] = key.split(':')
  return circuit.parts.find((part) => part.uid === uid)
}

const portOn = (key: string, port: string): boolean => key.endsWith(`:${port}`)

export const placed = (componentId: string, count = 1) => {
  return (context: TutorialContext): boolean =>
    context.circuit.parts.filter((part) => part.componentId === componentId).length >= count
}

export const portDriven = (componentId: string, port: string) => {
  return (context: TutorialContext): boolean => {
    return context.circuit.wires.some((wire) => {
      const part = endpointPart(context.circuit, wire.to)
      return part?.componentId === componentId && portOn(wire.to, port)
    })
  }
}

export const everyPortDriven = (componentId: string, port: string) => {
  return (context: TutorialContext): boolean => {
    const parts = context.circuit.parts.filter((part) => part.componentId === componentId)
    return (
      parts.length > 0 &&
      parts.every((part) =>
        context.circuit.wires.some((wire) => wire.to === `part:${part.uid}:${port}`),
      )
    )
  }
}

export const partDrivenBy = (
  componentId: string,
  port: string,
  sourceComponentId: string,
  sourcePort: string,
) => {
  return (context: TutorialContext): boolean => {
    return context.circuit.wires.some((wire) => {
      const sink = endpointPart(context.circuit, wire.to)
      const source = endpointPart(context.circuit, wire.from)
      return (
        sink?.componentId === componentId &&
        portOn(wire.to, port) &&
        source?.componentId === sourceComponentId &&
        portOn(wire.from, sourcePort)
      )
    })
  }
}

export const outputDriven = (name: string) => {
  return (context: TutorialContext): boolean => context.circuit.wires.some((wire) => wire.to === `out:${name}`)
}

export const inputHigh = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) === true
}

export const outputHigh = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) === true
}

export const inputLow = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) !== true
}

export const outputLow = (name: string) => {
  return (context: TutorialContext): boolean => context.nets.get(name) !== true
}

export const clockTicks = (count: number) => {
  return (context: TutorialContext): boolean => context.ticks >= count
}

export const allOf = (...predicates: ((context: TutorialContext) => boolean)[]) => {
  return (context: TutorialContext): boolean => predicates.every((predicate) => predicate(context))
}
