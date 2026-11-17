import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, partDrivenBy, placed } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const parityFilterSection: TutorialSection = {
  id: 'logic-parity4',
  title: 'Parity filter',
  summary: 'Fold four echo lines into one signal that is high only when an odd number of contacts are live.',
  objective: 'y = a XOR b XOR c XOR d',
  mode: 'puzzle',
  goal: logicGoal(
    ['a', 'b', 'c', 'd'],
    'y',
    (a, b, c, d) => [a, b, c, d].filter(Boolean).length % 2 === 1,
  ),
  components: ['xor'],
  start: environment().input('a').input('b').input('c').input('d').output('y').build(),
  steps: [
    {
      id: 'place-xors',
      title: 'Place three XOR gates',
      body: 'Parity is built by folding pairs together. Two XOR gates compare the two input pairs, and a third combines their results.',
      target: target.paletteItem('xor'),
      done: placed('xor', 3),
    },
    {
      id: 'build-tree',
      title: 'Build the parity tree',
      body: 'Wire a and b into the first XOR, c and d into the second, then feed both pair results into the final XOR.',
      target: target.canvas,
      done: allOf(partDrivenBy('xor', 'a', 'xor', 'y'), partDrivenBy('xor', 'b', 'xor', 'y')),
    },
    {
      id: 'expose-parity',
      title: 'Expose the parity bit',
      body: 'Connect the final XOR output to y. The array now has one bit that represents the parity of all four echo lines.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'odd-contact',
      title: 'Flag an odd count',
      body: 'Switch a, b, and c on. Three live contacts is odd, so the parity filter should raise y.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputHigh('c'), inputLow('d'), outputHigh('y')),
    },
    {
      id: 'even-contact',
      title: 'Reject an even count',
      body: 'Switch d on as well. Four live contacts is even, so y drops even though every input is high.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputHigh('c'), inputHigh('d'), outputLow('y')),
    },
  ],
}
