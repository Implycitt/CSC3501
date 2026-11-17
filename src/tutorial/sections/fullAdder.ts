import { environment } from '../environment.ts'
import { multiLogicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const fullAdderSection: TutorialSection = {
  id: 'logic-full-adder',
  title: 'Reactor carry cell',
  summary:
    'Add two coolant feeds plus the carry from the previous cell, then report both the sum and the carry-out to the reactor bus.',
  objective: 'sum = a XOR b XOR cin; cout = majority(a, b, cin)',
  mode: 'puzzle',
  goal: multiLogicGoal(['a', 'b', 'cin'], {
    sum: (a, b, cin) => (a !== b) !== cin,
    cout: (a, b, cin) => (a && b) || (cin && (a !== b)),
  }),
  components: ['full-adder'],
  start: environment()
    .input('a')
    .input('b')
    .input('cin')
    .output('sum')
    .output('cout')
    .place('full-adder', { as: 'add', x: 330, y: 120 })
    .wire('in:a', 'add.a')
    .wire('in:b', 'add.b')
    .wire('add.sum', 'out:sum')
    .wire('add.cout', 'out:cout')
    .build(),
  steps: [
    {
      id: 'place-adder',
      title: 'Place a full adder',
      body: 'The reactor load cell needs a full adder: two coolant feeds plus the carry arriving from the previous cell.',
      target: target.paletteItem('full-adder'),
      done: allOf(portDriven('full-adder', 'a'), portDriven('full-adder', 'b')),
    },
    {
      id: 'wire-feeds',
      title: 'Wire both coolant feeds',
      body: 'Connect a and b to the two main data inputs. These are the two live coolant feeds being combined.',
      target: target.canvas,
      done: allOf(portDriven('full-adder', 'a'), portDriven('full-adder', 'b')),
    },
    {
      id: 'wire-carry-in',
      title: 'Wire the carry-in',
      body: 'Connect cin to the carry input. Leaving it dark only works for two-input sums, so the cell fails as soon as a previous stage carries a 1.',
      target: target.canvas,
      done: portDriven('full-adder', 'cin'),
    },
    {
      id: 'wire-total',
      title: 'Expose sum and carry-out',
      body: 'Connect sum and cout to their output nodes. The reactor bus reads both bits as one two-bit total.',
      target: target.canvas,
      done: allOf(outputDriven('sum'), outputDriven('cout')),
    },
    {
      id: 'all-three-high',
      title: 'Add three live inputs',
      body: 'Switch a, b and cin all high. One plus one plus one is 11 in binary, so both sum and cout must be high.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputHigh('cin'), outputHigh('sum'), outputHigh('cout')),
    },
    {
      id: 'carry-without-sum',
      title: 'Keep the carry, drop the sum',
      body: 'Switch cin off while a and b stay high. The total is 10: sum goes dark and cout stays high.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), inputLow('cin'), outputLow('sum'), outputHigh('cout')),
    },
  ],
}
