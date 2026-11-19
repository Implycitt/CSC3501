import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, partDrivenBy, placed } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const notNandSection: TutorialSection = {
  id: 'logic-not-nand',
  title: 'Carrier veto',
  summary: 'The carrier can be blocked only when both lines are asserted, but the veto is incomplete. Finish the interlock.',
  objective: 'y is low only when a and b are both high; high otherwise.',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b'], 'y', (a, b) => !(a && b)),
  components: ['not', 'and'],
  start: environment()
    .input('a')
    .input('b')
    .output('y')
    .place('and', { as: 'mix', x: 300, y: 120 })
    .wire('in:a', 'mix.a')
    .wire('in:b', 'mix.b')
    .build(),
  steps: [
    {
      id: 'place-not',
      title: 'Complete the veto',
      body: 'The carrier and lockdown are already combined. Add the stage that turns agreement into a block.',
      target: target.paletteItem('not'),
      done: placed('not'),
    },
    {
      id: 'wire-and-to-not',
      title: 'Invert the combined signal',
      body: 'Feed the combined signal into the inverter.',
      target: target.canvas,
      done: partDrivenBy('not', 'a', 'and', 'y'),
    },
    {
      id: 'wire-output',
      title: 'Restore the interlock output',
      body: 'Connect the inverter output to y. The carrier should open unless both lines are asserted.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'single-assertion',
      title: 'One assertion is survivable',
      body: 'Switch a on and leave b off. The carrier should stay open.',
      hint: 'If b is already on, switch it off first.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputHigh('y')),
    },
    {
      id: 'double-assertion',
      title: 'Block the double assertion',
      body: 'Switch b on too. Both lines asserted should drop y.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), outputLow('y')),
    },
    {
      id: 'all-clear',
      title: 'Return to all-clear',
      body: 'Switch both off. The carrier should open again.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputLow('b'), outputHigh('y')),
    },
  ],
}
