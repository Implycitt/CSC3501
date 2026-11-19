import { environment } from '../environment.ts'
import { multiLogicGoal } from '../goals.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const fullAdderSection: TutorialSection = {
  id: 'logic-full-adder',
  title: 'Reactor carry cell',
  summary: 'The cell adds the two coolant feeds but ignores the carry from the previous column. Extend the half-adder so three live inputs produce both sum and carry-out.',
  objective: 'sum = a XOR b XOR cin; cout = majority(a, b, cin)',
  mode: 'puzzle',
  goal: multiLogicGoal(['a', 'b', 'cin'], {
    sum: (a, b, cin) => (a !== b) !== cin,
    cout: (a, b, cin) => (a && b) || (cin && (a !== b)),
  }),
  components: ['xor', 'and', 'or', 'full-adder'],
  start: environment()
    .input('a')
    .input('b')
    .input('cin')
    .output('sum')
    .output('cout')
    .place('xor', { as: 'half-sum', x: 300, y: 100 })
    .place('and', { as: 'half-carry', x: 300, y: 260 })
    .wire('in:a', 'half-sum.a')
    .wire('in:b', 'half-sum.b')
    .wire('in:a', 'half-carry.a')
    .wire('in:b', 'half-carry.b')
    .wire('half-sum.y', 'out:sum')
    .wire('half-carry.y', 'out:cout')
    .build(),
  steps: [
    {
      id: 'place-adder',
      title: 'Trace the half-adder',
      body: 'The cell already adds a and b into sum and carry. It has no path for cin, so it fails as soon as the previous column carries a 1.',
      target: target.canvas,
    },
    {
      id: 'wire-feeds',
      title: 'Check the half-adder feeds',
      body: 'The two coolant feeds already reach the first XOR and AND. Leave that half-adder in place; the missing input is cin.',
      target: target.canvas,
    },
    {
      id: 'wire-carry-in',
      title: 'Add the carry path',
      body: "Bring cin into the sum path, and use it in the carry-out term. If you build from gates, the half-adder's XOR feeds a second XOR with cin, and its carry feeds an OR with cin AND that XOR.",
      target: target.canvas,
    },
    {
      id: 'wire-total',
      title: 'Expose sum and carry-out',
      body: 'Connect the full sum to sum and the combined carry to cout. The reactor bus reads both bits as one two-bit total.',
      target: target.canvas,
    },
    {
      id: 'all-three-high',
      title: 'Prove the carry chain',
      body: 'Switch a, b, and cin all high. One plus one plus one is 11 in binary, so both sum and cout must be high.',
      target: target.canvas,
    },
    {
      id: 'carry-without-sum',
      title: 'Keep the carry, drop the sum',
      body: 'Switch cin off while a and b stay high. The total is 10: sum goes dark and cout stays high.',
      target: target.canvas,
    },
  ],
}
