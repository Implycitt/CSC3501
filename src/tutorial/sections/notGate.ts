import { environment } from '../environment.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const notGateSection: TutorialSection = {
  id: 'logic-not',
  title: 'The NOT gate',
  summary: 'Invert a single signal and watch the output do the opposite.',
  components: ['not'],
  features: {
    addPorts: false,
    saveDesign: false,
    library: false,
    clearCanvas: false,
    componentDocs: false,
  },
  start: environment().input('a').output('y').build(),
  steps: [
    {
      id: 'place-not',
      title: 'Place a NOT gate',
      body: 'This lesson keeps things small: one part, one input and one output. Drag NOT Gate onto the grid.',
      hint: 'Everything else in the interface is switched off so there is nothing to undo.',
      target: target.paletteItem('not'),
      done: placed('not'),
    },
    {
      id: 'drive-a',
      title: 'Wire the input',
      body: 'Drag from a to the input port of the gate.',
      target: target.canvas,
      done: portDriven('not', 'a'),
    },
    {
      id: 'drive-y',
      title: 'Wire the output',
      body: 'Drag from the gate output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'invert-on',
      title: 'Switch a on',
      body: 'Click a. The gate inverts its input, so y stays dark while a is on.',
      hint: 'That is the whole job of a NOT gate: the output is the opposite of the input.',
      target: target.canvas,
      done: allOf(inputHigh('a'), outputLow('y')),
    },
    {
      id: 'invert-off',
      title: 'Switch a off',
      body: 'Click a again. With the input low, y lights up.',
      target: target.canvas,
      done: allOf(inputLow('a'), outputHigh('y')),
    },
  ],
}
