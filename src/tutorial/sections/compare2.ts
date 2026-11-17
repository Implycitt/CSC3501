import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const compare2Section: TutorialSection = {
  id: 'logic-compare2',
  title: 'Contact code',
  summary:
    'Compare a two-bit transponder code against the stored reference and raise the lock only when both bits agree.',
  objective: 'match = (a1 XNOR b1) AND (a0 XNOR b0)',
  mode: 'puzzle',
  goal: logicGoal(['a1', 'a0', 'b1', 'b0'], 'match', (a1, a0, b1, b0) => a1 === b1 && a0 === b0),
  components: ['xnor', 'and'],
  start: environment()
    .input('a1')
    .input('a0')
    .input('b1')
    .input('b0')
    .output('match')
    .place('xor', { as: 'high', x: 320, y: 80 })
    .place('xnor', { as: 'low', x: 320, y: 280 })
    .place('and', { as: 'both', x: 530, y: 180 })
    .wire('in:a1', 'high.a')
    .wire('in:b1', 'high.b')
    .wire('in:a0', 'low.a')
    .wire('in:b0', 'low.b')
    .wire('high.y', 'both.a')
    .wire('low.y', 'both.b')
    .wire('both.y', 'out:match')
    .build(),
  steps: [
    {
      id: 'replace-high-comparator',
      title: 'Replace the high-bit comparator',
      body: 'The high-bit column is using XOR, so it reports a match when the bits differ. Use an XNOR for that column instead.',
      target: target.paletteItem('xnor'),
      done: placed('xnor', 2),
    },
    {
      id: 'wire-high-pair',
      title: 'Compare the high bits',
      body: 'Connect a1 and b1 to the high-bit XNOR. Its output is high only when the two high bits are equal.',
      target: target.canvas,
      done: allOf(portDriven('xnor', 'a'), portDriven('xnor', 'b')),
    },
    {
      id: 'wire-low-pair',
      title: 'Compare the low bits',
      body: 'Connect a0 and b0 to the second XNOR. Both bit columns now produce a match signal.',
      target: target.canvas,
      done: portDriven('xnor', 'b'),
    },
    {
      id: 'combine-matches',
      title: 'Require both matches',
      body: 'Feed both column results into an AND gate. A contact code is confirmed only when the high and low columns agree together.',
      target: target.canvas,
      done: outputDriven('match'),
    },
    {
      id: 'exact-match',
      title: 'Confirm an exact code',
      body: 'Set a1 and b1 high and leave a0 and b0 low. Both columns match, so the lock raises match.',
      target: target.canvas,
      done: allOf(inputHigh('a1'), inputHigh('b1'), inputLow('a0'), inputLow('b0'), outputHigh('match')),
    },
    {
      id: 'one-bit-off',
      title: 'Reject a single flipped bit',
      body: 'Flip b0 high while the other three bits stay put. The low columns disagree, so the exact-match lock drops match even though the high bit still agrees.',
      hint: 'This is why the two column results are combined with AND: every bit has to agree.',
      target: target.canvas,
      done: allOf(inputHigh('b0'), outputLow('match')),
    },
  ],
}
