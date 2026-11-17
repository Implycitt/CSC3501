import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, partDrivenBy, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const orPrioritySection: TutorialSection = {
  id: 'logic-or-priority',
  title: 'Priority steering',
  summary: 'Merge two buses, then let one enable line veto both.',
  objective: 'y = (a OR b) AND enable',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b', 'enable'], 'y', (a, b, enable) => (a || b) && enable),
  components: ['or', 'and'],
  start: environment()
    .input('a')
    .input('b')
    .input('enable')
    .output('y')
    .place('or', { as: 'merge', x: 300, y: 120 })
    .wire('in:a', 'merge.a')
    .wire('in:b', 'merge.b')
    .build(),
  steps: [
    {
      id: 'place-and',
      title: 'Add the helm gate',
      body: 'The two gyro buses are already merged by an OR gate. Add an AND gate after it so the helm enable can veto the merged steering signal.',
      target: target.paletteItem('and'),
      done: placed('and'),
    },
    {
      id: 'wire-merged-bus',
      title: 'Feed the merged bus forward',
      body: 'Drag from the OR output into one input of the AND gate.',
      target: target.canvas,
      done: partDrivenBy('and', 'a', 'or', 'y'),
    },
    {
      id: 'wire-enable',
      title: 'Wire the helm enable',
      body: 'Connect enable to the other input of the AND gate. The OR result should only pass while this line is hot.',
      target: target.canvas,
      done: portDriven('and', 'b'),
    },
    {
      id: 'wire-output',
      title: 'Wire the steering output',
      body: 'Connect the AND output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'enable-low',
      title: 'Steer with the helm disabled',
      body: 'Switch gyro a on, keep b off, and leave enable off. The OR gate is high but the AND gate blocks it, so y stays dark.',
      hint: 'If enable is already on, switch it off for this check.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('enable'), outputLow('y')),
    },
    {
      id: 'enable-high',
      title: 'Give the helm priority',
      body: 'Switch enable on. The merged gyro bus now reaches y.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('enable'), outputHigh('y')),
    },
    {
      id: 'other-bus',
      title: 'Steer from the other gyro',
      body: 'Switch a off and b on. The OR gate still sees a live bus, and the enable still lets it through to y.',
      hint: 'This is the OR/AND interaction: either bus can steer, but the helm can always cut it.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputHigh('b'), inputHigh('enable'), outputHigh('y')),
    },
  ],
}
