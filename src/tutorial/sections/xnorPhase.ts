import { environment } from '../environment.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const xnorPhaseSection: TutorialSection = {
  id: 'logic-xnor',
  title: 'Phase match',
  summary: 'Confirm a sensor lock only when both phase lines agree.',
  components: ['xnor'],
  start: environment().input('a').input('b').output('y').build(),
  steps: [
    {
      id: 'place-xnor',
      title: 'Place an XNOR gate',
      body: 'The array needs to confirm that two phase lines match. An XNOR gate raises its output when its inputs are the same.',
      target: target.paletteItem('xnor'),
      done: placed('xnor'),
    },
    {
      id: 'drive-a',
      title: 'Wire phase A',
      body: 'Connect phase a to the first input.',
      target: target.canvas,
      done: portDriven('xnor', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire phase B',
      body: 'Connect phase b to the second input.',
      target: target.canvas,
      done: portDriven('xnor', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Wire the lock confirmation',
      body: 'Connect the gate output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'out-of-phase',
      title: 'Break the phase match',
      body: 'Switch a on and leave b off. The lines disagree, so XNOR drops y and the lock is not confirmed.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputLow('y')),
    },
    {
      id: 'back-in-phase',
      title: 'Restore the match',
      body: 'Switch a off. Both lines are low again, so XNOR raises y. Agreement is what matters, whether the pair is low or high.',
      hint: 'Try both lines high as well; XNOR stays high whenever the inputs match.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputLow('b'), outputHigh('y')),
    },
  ],
}
