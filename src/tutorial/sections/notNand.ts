import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, partDrivenBy, placed } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const notNandSection: TutorialSection = {
  id: 'logic-not-nand',
  title: 'The NAND interlock',
  summary: 'Invert an AND result to make a gate that blocks a double lockdown.',
  objective: 'y = NOT (a AND b)',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b'], 'y', (a, b) => !(a && b)),
  components: ['and', 'not'],
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
      title: 'Add the inverter',
      body: 'The carrier and lockdown lines are already combined by an AND gate. Add a NOT gate after it to turn that agreement into a veto.',
      target: target.paletteItem('not'),
      done: placed('not'),
    },
    {
      id: 'wire-and-to-not',
      title: 'Invert the combined signal',
      body: 'Drag from the AND output into the NOT input.',
      target: target.canvas,
      done: partDrivenBy('not', 'a', 'and', 'y'),
    },
    {
      id: 'wire-output',
      title: 'Wire the interlock output',
      body: 'Connect the NOT output to y. The carrier may open unless both inputs are high.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'single-assertion',
      title: 'One assertion is survivable',
      body: 'Switch a on and leave b off. The AND gate is low, so the inverter makes y high.',
      hint: 'If b is already on, switch it off first.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputHigh('y')),
    },
    {
      id: 'double-assertion',
      title: 'Block the double assertion',
      body: 'Switch b on too. The AND gate goes high and the inverter drops y. That is the NAND interlock.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), outputLow('y')),
    },
    {
      id: 'all-clear',
      title: 'Return to all-clear',
      body: 'Switch both inputs off. With no lockdown asserted, the inverter opens the carrier again.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputLow('b'), outputHigh('y')),
    },
  ],
}
