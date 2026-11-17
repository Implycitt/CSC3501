import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const and3InterlockSection: TutorialSection = {
  id: 'logic-and3',
  title: 'Reactor interlock',
  summary: 'Allow the reactor to spin up only when all three safeties agree.',
  objective: 'y = a AND b AND c',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b', 'c'], 'y', (a, b, c) => a && b && c),
  components: ['and3'],
  start: environment()
    .input('a')
    .input('b')
    .input('c')
    .output('y')
    .place('and', { as: 'partial', x: 300, y: 120 })
    .wire('in:a', 'partial.a')
    .wire('in:b', 'partial.b')
    .wire('partial.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-and3',
      title: 'Place a three-input AND gate',
      body: 'The reactor interlock needs three independent safeties: pressure, temperature, and containment. All three must agree before the core can spin up.',
      target: target.paletteItem('and3'),
      done: placed('and3'),
    },
    {
      id: 'drive-a',
      title: 'Wire pressure safety',
      body: 'Connect safety a to the first input of the AND gate.',
      target: target.canvas,
      done: portDriven('and3', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire temperature safety',
      body: 'Connect safety b to the second input.',
      target: target.canvas,
      done: portDriven('and3', 'b'),
    },
    {
      id: 'drive-c',
      title: 'Wire containment safety',
      body: 'Connect safety c to the third input. One missing safety has to hold the whole interlock closed.',
      target: target.canvas,
      done: portDriven('and3', 'c'),
    },
    {
      id: 'drive-y',
      title: 'Wire the spin-up permit',
      body: 'Connect the gate output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'all-safeties-clear',
      title: 'Bring all three safeties into agreement',
      body: 'Switch a, b, and c on. Only then does the AND gate raise y and permit the reactor to spin up.',
      hint: 'The three-input AND is the same agreement rule as a two-input AND, with one more veto.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputHigh('c'), outputHigh('y')),
    },
    {
      id: 'one-safety-drops',
      title: 'Drop containment',
      body: 'Switch c off. The other two safeties are still clear, but the interlock closes y immediately.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputLow('c'), outputLow('y')),
    },
  ],
}
