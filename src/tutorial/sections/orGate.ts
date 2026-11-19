import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, outputDriven, outputHigh, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const orGateSection: TutorialSection = {
  id: 'logic-or',
  title: 'Gyro bus',
  summary: 'The helm only answers when both gyro buses are live. Restore a rule that tolerates either bus.',
  objective: 'y is high when either gyro bus is high; low only when both are low.',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b'], 'y', (a, b) => a || b),
  components: ['or', 'and'],
  start: environment()
    .input('a')
    .input('b')
    .output('y')
    .place('and', { as: 'wrong', x: 300, y: 120 })
    .wire('in:a', 'wrong.a')
    .wire('in:b', 'wrong.b')
    .wire('wrong.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-or',
      title: 'Restore either-bus steering',
      body: 'The helm is only answering when both gyro buses agree. Remove the gate that requires agreement and give the bus a rule that stays live when either input is live.',
      target: target.paletteItem('or'),
      done: placed('or'),
    },
    {
      id: 'drive-a',
      title: 'Feed the first gyro',
      body: 'Connect bus a to one input of the replacement gate.',
      target: target.canvas,
      done: portDriven('or', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Feed the second gyro',
      body: 'Connect bus b to the other input. Either bus should be able to carry the helm alone.',
      target: target.canvas,
      done: portDriven('or', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Restore the helm feed',
      body: 'Connect the replacement gate output to y. The old rule can stay on the bench; it must not drive the helm.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'one-is-enough',
      title: 'Prove one bus is enough',
      body: 'Switch a on and leave b off. The helm should answer. Then try b alone; either bus should keep y live, and both off should drop it.',
      hint: 'If y stays dark with one bus live, the old AND rule is still driving the output.',
      target: target.canvas,
      done: allOf(inputHigh('a'), outputHigh('y')),
    },
  ],
}
