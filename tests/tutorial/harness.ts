import { connectWire, type Circuit } from '../../src/game/circuit.ts'
import { advance, createSim } from '../../src/sections/ui/simulator.ts'
import { portsOf } from '../../src/sections/ui/geometry.ts'
import { settleSession, type TutorialSession } from '../../src/tutorial/session.ts'
import type { TutorialSection } from '../../src/tutorial/types.ts'

export function cloneStart(section: TutorialSection): Circuit {
  return {
    parts: section.start.parts.map((part) => ({ ...part })),
    wires: section.start.wires.map((wire) => ({ ...wire })),
    inputs: [...section.start.inputs],
    outputs: [...section.start.outputs],
    layout: {},
  }
}

export function harness(section: TutorialSection, sections: readonly TutorialSection[]) {
  let circuit = cloneStart(section)
  let sim = createSim(circuit)
  let session: TutorialSession = { progress: {}, sectionId: section.id, stepIndex: 0, ticks: 0 }

  const settle = (ticks: number = session.ticks) => {
    session = settleSession(sections, session, circuit, sim.nets, ticks)
  }

  return {
    get session() {
      return session
    },
    get nets() {
      return sim.nets
    },
    get circuit() {
      return circuit
    },
    place(componentId: string, uid: string) {
      circuit = { ...circuit, parts: [...circuit.parts, { uid, componentId, x: 300, y: 200 }] }
      sim = createSim(circuit)
      settle()
      return this
    },
    wire(from: string, to: string) {
      circuit = connectWire(circuit, from, to, portsOf)
      sim = createSim(circuit)
      settle()
      return this
    },
    set(name: string, value: boolean) {
      sim = advance(sim, { ...sim.values, [name]: value }, false)
      settle()
      return this
    },
    tick() {
      sim = advance(sim, sim.values, true)
      settle(session.ticks + 1)
      return this
    },
  }
}
