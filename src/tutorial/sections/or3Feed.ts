import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const or3FeedSection: TutorialSection = {
  id: 'logic-or3',
  title: 'Three-way reactor feed',
  summary: 'Keep a reactor bus alive when any one of three coolant pumps is running.',
  objective: 'y = a OR b OR c',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b', 'c'], 'y', (a, b, c) => a || b || c),
  components: ['or3'],
  start: environment()
    .input('a')
    .input('b')
    .input('c')
    .output('y')
    .place('or', { as: 'partial', x: 300, y: 120 })
    .wire('in:a', 'partial.a')
    .wire('in:b', 'partial.b')
    .wire('partial.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-or3',
      title: 'Place a three-input OR gate',
      body: 'The auxiliary reactor has three coolant pumps and only one feed bus. Any pump should be able to keep that bus live, so place a 3-input OR gate.',
      target: target.paletteItem('or3'),
      done: placed('or3'),
    },
    {
      id: 'drive-a',
      title: 'Wire coolant pump A',
      body: 'Connect pump a to the first input of the OR gate.',
      target: target.canvas,
      done: portDriven('or3', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire coolant pump B',
      body: 'Connect pump b to the second input.',
      target: target.canvas,
      done: portDriven('or3', 'b'),
    },
    {
      id: 'drive-c',
      title: 'Wire coolant pump C',
      body: 'Connect pump c to the third input. The reactor only needs one of these paths to stay alive.',
      target: target.canvas,
      done: portDriven('or3', 'c'),
    },
    {
      id: 'drive-y',
      title: 'Wire the reactor feed',
      body: 'Connect the gate output to y. That is the feed bus the reactor will read.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'single-pump',
      title: 'Run on one pump',
      body: 'Switch a on and leave b and c off. The OR gate passes the live pump straight through to y.',
      hint: 'This is the whole point of the auxiliary feed: one live pump is enough.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), inputLow('c'), outputHigh('y')),
    },
    {
      id: 'all-pumps-cold',
      title: 'Lose the last pump',
      body: 'Switch a off again. With no pump running, the feed bus drops and y goes dark.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputLow('b'), inputLow('c'), outputLow('y')),
    },
  ],
}
