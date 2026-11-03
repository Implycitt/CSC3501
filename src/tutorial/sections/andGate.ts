import { environment } from '../environment.ts'
import { outputDriven, outputHigh, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const andGateSection: TutorialSection = {
  id: 'logic-and',
  title: 'The AND gate',
  summary: 'Build a circuit that lights up only when both switches are on.',
  components: ['and'],
  start: environment().input('a').input('b').output('y').build(),
  steps: [
    {
      id: 'place-and',
      title: 'Place an AND gate',
      body: 'The palette only lists the parts this lesson needs. Drag AND Gate onto the grid, or click it to drop it in the middle.',
      hint: 'The gate belongs between the inputs on the left and the output on the right.',
      target: target.paletteItem('and'),
      done: placed('and'),
    },
    {
      id: 'drive-a',
      title: 'Wire input a',
      body: 'Drag from the a node on the left edge of the canvas onto the upper input port of the gate.',
      hint: 'Ports are drag handles. The wire follows the pointer and connects to whatever port you drop it on.',
      target: target.canvas,
      done: portDriven('and', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire input b',
      body: 'Connect b to the lower input port of the gate.',
      hint: 'One wire per port. Dropping a second wire on a port replaces the first.',
      target: target.canvas,
      done: portDriven('and', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Wire the output',
      body: 'Drag from the gate output to the y node on the right edge. The y node lights up as soon as a wire drives it.',
      hint: 'The output reads the value on the wire feeding it.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'both-on',
      title: 'Switch both inputs on',
      body: 'Click a and b on the canvas. With both inputs on, y lights up. That is what AND does: the output goes on only when every input is on.',
      hint: 'Turn either input off and y goes dark again.',
      target: target.canvas,
      done: outputHigh('y'),
    },
  ],
}
