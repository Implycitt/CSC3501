import { environment } from '../environment.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const introOrSection: TutorialSection = {
  id: 'intro-or',
  title: 'The OR gate',
  summary: 'Either relay can keep the return feed alive.',
  objective: 'y = a OR b',
  components: ['or'],
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
      id: 'place-or',
      title: 'Place the OR gate',
      body: 'Either relay can carry the feed. Drop an OR gate onto the grid.',
      target: target.paletteItem('or'),
      done: placed('or'),
    },
    {
      id: 'wire-inputs',
      title: 'Wire both relays',
      body: 'Connect a and b to the two inputs of the gate.',
      target: target.canvas,
      done: allOf(portDriven('or', 'a'), portDriven('or', 'b')),
    },
    {
      id: 'wire-output',
      title: 'Wire the feed',
      body: 'Connect the gate output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'either-on',
      title: 'Run on one relay',
      body: 'Switch a on and leave b off. The feed stays live because one relay is enough.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputHigh('y')),
    },
  ],
}
