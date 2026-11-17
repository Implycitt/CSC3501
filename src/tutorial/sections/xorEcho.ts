import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const xorEchoSection: TutorialSection = {
  id: 'logic-xor',
  title: 'Echo comparator',
  summary: 'Flag a sensor echo only when the outbound and return lines disagree.',
  objective: 'y = a XOR b',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b'], 'y', (a, b) => a !== b),
  components: ['xor'],
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
      id: 'place-xor',
      title: 'Place an XOR gate',
      body: 'The sensor array compares the ping it sent with the echo it received. An XOR gate raises its output when the two inputs differ.',
      target: target.paletteItem('xor'),
      done: placed('xor'),
    },
    {
      id: 'drive-a',
      title: 'Wire the outbound ping',
      body: 'Connect the outbound ping to input a.',
      target: target.canvas,
      done: portDriven('xor', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire the return echo',
      body: 'Connect the return echo to input b.',
      target: target.canvas,
      done: portDriven('xor', 'b'),
    },
    {
      id: 'drive-y',
      title: 'Wire the contact flag',
      body: 'Connect the gate output to y. This is the contact flag the bridge reads.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'one-line-live',
      title: 'One line live',
      body: 'Switch a on and leave b off. The lines disagree, so XOR raises y.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), outputHigh('y')),
    },
    {
      id: 'both-lines-live',
      title: 'Both lines match',
      body: 'Switch b on too. Both inputs are high now, so XOR drops y. Matching signals mean no contact.',
      hint: 'XOR is the difference detector. XNOR, the next procedure, is its matching counterpart.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputHigh('b'), outputLow('y')),
    },
  ],
}
