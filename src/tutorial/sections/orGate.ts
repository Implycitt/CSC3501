import { environment } from '../environment.ts'
import { allOf, inputHigh, outputDriven, outputHigh, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const orGateSection: TutorialSection = {
  id: 'logic-or',
  title: 'The OR gate',
  summary: 'Find out how little it takes to turn an OR gate on.',
  components: ['or'],
  start: environment().input('a').input('b').output('y').build(),
  steps: [
    {
      id: 'place-or',
      title: 'Place an OR gate',
      body: 'Drop an OR gate on the grid. Same layout as the AND lesson: inputs on the left, output on the right.',
      target: target.paletteItem('or'),
      done: placed('or'),
    },
    {
      id: 'drive-a',
      title: 'Wire input a',
      body: 'Drag from a to the upper input of the gate.',
      target: target.canvas,
      done: portDriven('or', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire input b',
      body: 'Drag from b to the lower input of the gate.',
      target: target.canvas,
      done: portDriven('or', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Wire the output',
      body: 'Connect the gate output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'one-is-enough',
      title: 'One input is enough',
      body: 'Switch a on and leave b off. y lights up. An OR gate only needs one input on, which is exactly how it differs from AND.',
      hint: 'Switch b on too and y stays on; switch both off and it goes dark.',
      target: target.canvas,
      done: allOf(inputHigh('a'), outputHigh('y')),
    },
  ],
}
