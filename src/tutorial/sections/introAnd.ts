import { environment } from '../environment.ts'
import { allOf, inputHigh, outputDriven, outputHigh, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const introAndSection: TutorialSection = {
  id: 'intro-and',
  title: 'The AND gate',
  summary: 'Both relays must agree before the scrubber feed opens.',
  objective: 'y = a AND b',
  components: ['and'],
  features: {
    addPorts: false,
    saveDesign: false,
    library: false,
    clearCanvas: false,
    componentDocs: false,
  },
  start: environment().input('a').input('b').output('y').build(),
  steps: [
    {
      id: 'place-and',
      title: 'Place the AND gate',
      body: 'Both relays have to agree before the feed can open. Drop an AND gate between the inputs and the output.',
      hint: 'Click the AND Gate chip in the Parts rail to place one in the middle, or drag it onto the canvas.',
      target: target.paletteItem('and'),
      done: placed('and'),
    },
    {
      id: 'wire-inputs',
      title: 'Wire both relays',
      body: 'Connect a and b to the two inputs of the gate.',
      hint: 'Drag from the a node on the left edge to one input port, then drag from b to the other input.',
      target: target.canvas,
      done: allOf(portDriven('and', 'a'), portDriven('and', 'b')),
    },
    {
      id: 'wire-output',
      title: 'Wire the feed',
      body: 'Connect the gate output to y.',
      hint: 'Drag from the output handle on the right side of the gate to the y node.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'both-on',
      title: 'Close the interlock',
      body: 'Switch a and b on. The feed opens only when both relays are live.',
      hint: 'Click the a and b input nodes on the left edge; their wire values update immediately.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), outputHigh('y')),
    },
  ],
}
