import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const notGateSection: TutorialSection = {
  id: 'logic-not',
  title: 'Carrier recovery',
  summary: 'The carrier is following the lockdown line instead of opposing it. The band cannot open while the lockdown is asserted.',
  objective: 'y is the opposite of a; high only when a is low.',
  mode: 'puzzle',
  goal: logicGoal(['a'], 'y', (a) => !a),
  components: ['not', 'buffer'],
  start: environment()
    .input('a')
    .output('y')
    .place('buffer', { as: 'wrong', x: 300, y: 120 })
    .wire('in:a', 'wrong.a')
    .wire('wrong.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-not',
      title: 'Restore the inversion',
      body: 'The carrier is following the lockdown instead of opposing it. Replace the pass-through stage with one that inverts it.',
      target: target.paletteItem('not'),
      done: placed('not'),
    },
    {
      id: 'drive-a',
      title: 'Feed the lockdown line',
      body: 'Connect a to the replacement gate input.',
      target: target.canvas,
      done: portDriven('not', 'a'),
    },
    {
      id: 'drive-y',
      title: 'Restore the carrier',
      body: 'Connect the replacement output to y. A low lockdown should produce a high carrier.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'invert-on',
      title: 'Locked down',
      body: 'Switch a on. The carrier should stay dark because the lockdown is asserted.',
      hint: 'That is the whole job of an inverter: the output is the opposite of the input.',
      target: target.canvas,
      done: allOf(inputHigh('a'), outputLow('y')),
    },
    {
      id: 'invert-off',
      title: 'Band open',
      body: 'Switch a off. The carrier should go high.',
      target: target.canvas,
      done: allOf(inputLow('a'), outputHigh('y')),
    },
  ],
}
