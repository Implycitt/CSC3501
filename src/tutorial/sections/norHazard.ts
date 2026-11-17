import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const norHazardSection: TutorialSection = {
  id: 'logic-nor',
  title: 'Hazard veto',
  summary: 'Raise the shield only while both hazard lines are clear.',
  objective: 'y = NOT (a OR b)',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b'], 'y', (a, b) => !(a || b)),
  components: ['nor'],
  start: environment()
    .input('a')
    .input('b')
    .output('y')
    .place('or', { as: 'wrong', x: 300, y: 120 })
    .wire('in:a', 'wrong.a')
    .wire('in:b', 'wrong.b')
    .wire('wrong.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-nor',
      title: 'Place a NOR gate',
      body: 'The deflector grid can charge only when both hazard lines are clear. A NOR gate is high only while every input is low.',
      target: target.paletteItem('nor'),
      done: placed('nor'),
    },
    {
      id: 'drive-a',
      title: 'Wire hazard A',
      body: 'Connect hazard a to the first input.',
      target: target.canvas,
      done: portDriven('nor', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire hazard B',
      body: 'Connect hazard b to the second input.',
      target: target.canvas,
      done: portDriven('nor', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Wire the shield permit',
      body: 'Connect the gate output to y. This line tells the deflector ring it is safe to charge.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'hazard-asserted',
      title: 'Assert a hazard',
      body: 'Switch a on. NOR drops y immediately, vetoing the shield charge even though b is still clear.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputLow('y')),
    },
    {
      id: 'hazards-clear',
      title: 'Clear the hazard',
      body: 'Switch a off. With both hazard lines low, NOR raises y and the deflector grid can charge.',
      hint: 'NOR is the all-clear gate: any single hazard is enough to veto it.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputLow('b'), outputHigh('y')),
    },
  ],
}
