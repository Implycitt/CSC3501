import { environment } from '../environment.ts'
import { multiLogicGoal } from '../goals.ts'
import {
  allOf,
  everyPortDriven,
  inputHigh,
  inputLow,
  outputDriven,
  outputHigh,
  outputLow,
  partDrivenBy,
  placed,
  portDriven,
} from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

const total = (a1: boolean, a0: boolean, b1: boolean, b0: boolean, cin: boolean) =>
  (a1 ? 2 : 0) + (a0 ? 1 : 0) + (b1 ? 2 : 0) + (b0 ? 1 : 0) + (cin ? 1 : 0)

export const twoBitAdderSection: TutorialSection = {
  id: 'logic-adder2',
  title: 'Two-bit total',
  summary: 'Add two 2-bit coolant feeds and the incoming carry, then report a 2-bit sum with carry-out.',
  objective: 's1 s0 = a1 a0 + b1 b0 + cin; cout = overflow',
  mode: 'puzzle',
  goal: multiLogicGoal(['a1', 'a0', 'b1', 'b0', 'cin'], {
    s0: (a1, a0, b1, b0, cin) => total(a1, a0, b1, b0, cin) % 2 === 1,
    s1: (a1, a0, b1, b0, cin) => Math.floor(total(a1, a0, b1, b0, cin) / 2) % 2 === 1,
    cout: (a1, a0, b1, b0, cin) => total(a1, a0, b1, b0, cin) >= 4,
  }),
  components: ['full-adder'],
  start: environment()
    .input('a1')
    .input('a0')
    .input('b1')
    .input('b0')
    .input('cin')
    .output('s0')
    .output('s1')
    .output('cout')
    .build(),
  steps: [
    {
      id: 'place-low-adder',
      title: 'Place the low adder',
      body: 'Start with the low bit column. A full adder handles a0, b0, and the incoming carry, producing the low sum bit and a carry into the next column.',
      target: target.paletteItem('full-adder'),
      done: placed('full-adder'),
    },
    {
      id: 'place-high-adder',
      title: 'Place the high adder',
      body: 'The high column also needs a full adder so it can accept the carry from the low column along with a1 and b1.',
      target: target.paletteItem('full-adder'),
      done: placed('full-adder', 2),
    },
    {
      id: 'wire-low-column',
      title: 'Wire the low column',
      body: 'Connect a0 and b0 to the low adder data inputs and route cin into its carry input.',
      target: target.canvas,
      done: allOf(portDriven('full-adder', 'a'), portDriven('full-adder', 'b'), portDriven('full-adder', 'cin')),
    },
    {
      id: 'wire-high-column',
      title: 'Wire the high column',
      body: 'Connect a1 and b1 to the high adder. Both columns now have their data feeds attached.',
      target: target.canvas,
      done: allOf(everyPortDriven('full-adder', 'a'), everyPortDriven('full-adder', 'b')),
    },
    {
      id: 'chain-carry',
      title: 'Chain the carry',
      body: 'Connect the low adder carry-out to the high adder carry-in. This is what makes two full adders behave as one two-bit adder.',
      target: target.canvas,
      done: partDrivenBy('full-adder', 'cin', 'full-adder', 'cout'),
    },
    {
      id: 'expose-total',
      title: 'Expose the total',
      body: 'Connect the low sum to s0, the high sum to s1, and the high carry-out to cout.',
      target: target.canvas,
      done: allOf(outputDriven('s0'), outputDriven('s1'), outputDriven('cout')),
    },
    {
      id: 'add-small-feeds',
      title: 'Add two small feeds',
      body: 'Set a0 and b1 high and leave the rest low. 01 + 10 = 11, so both sum bits rise and cout stays dark.',
      target: target.canvas,
      done: allOf(
        inputLow('a1'),
        inputHigh('a0'),
        inputHigh('b1'),
        inputLow('b0'),
        inputLow('cin'),
        outputHigh('s1'),
        outputHigh('s0'),
        outputLow('cout'),
      ),
    },
    {
      id: 'carry-out',
      title: 'Carry past the top bit',
      body: 'Set a1, a0, and b0 high. 11 + 01 = 100, so both sum bits drop and cout takes the overflow.',
      target: target.canvas,
      done: allOf(
        inputHigh('a1'),
        inputHigh('a0'),
        inputLow('b1'),
        inputHigh('b0'),
        inputLow('cin'),
        outputLow('s1'),
        outputLow('s0'),
        outputHigh('cout'),
      ),
    },
    {
      id: 'maximum-total',
      title: 'Add at the limit',
      body: 'Set every input high. 11 + 11 + 1 = 111, so both sum bits and the carry-out are high.',
      target: target.canvas,
      done: allOf(
        inputHigh('a1'),
        inputHigh('a0'),
        inputHigh('b1'),
        inputHigh('b0'),
        inputHigh('cin'),
        outputHigh('s1'),
        outputHigh('s0'),
        outputHigh('cout'),
      ),
    },
  ],
}
