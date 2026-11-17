import { environment } from '../environment.ts'
import { multiLogicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const quadrantDecoderSection: TutorialSection = {
  id: 'logic-decoder2to4',
  title: 'Quadrant decoder',
  summary:
    'Turn a two-bit quadrant select into one-hot shield power for the four sides of the deflector ring.',
  objective: 'q0/q1/q2/q3 = one-hot at s1 s0 = 00/01/10/11',
  mode: 'puzzle',
  goal: multiLogicGoal(['s1', 's0'], {
    q0: (s1, s0) => !s1 && !s0,
    q1: (s1, s0) => !s1 && s0,
    q2: (s1, s0) => s1 && !s0,
    q3: (s1, s0) => s1 && s0,
  }),
  components: ['decoder2to4'],
  start: environment()
    .input('s1')
    .input('s0')
    .output('q0')
    .output('q1')
    .output('q2')
    .output('q3')
    .place('decoder2to4', { as: 'quad', x: 350, y: 130 })
    .wire('in:s1', 'quad.b')
    .wire('in:s0', 'quad.a')
    .wire('quad.y0', 'out:q0')
    .wire('quad.y1', 'out:q1')
    .build(),
  steps: [
    {
      id: 'place-decoder',
      title: 'Place a 2-to-4 decoder',
      body: 'The deflector ring has four quadrants but only two select lines. A 2-to-4 decoder turns those two bits into four one-hot outputs.',
      target: target.paletteItem('decoder2to4'),
      done: placed('decoder2to4'),
    },
    {
      id: 'wire-selects',
      title: 'Wire both select bits',
      body: 'Connect s1 to the high select input and s0 to the low select input. Together they choose one of four quadrants.',
      target: target.canvas,
      done: allOf(portDriven('decoder2to4', 'a'), portDriven('decoder2to4', 'b')),
    },
    {
      id: 'wire-low-quadrants',
      title: 'Expose the low quadrants',
      body: 'Connect q0 and q1 to the first two decoder outputs. These cover the two select codes where s1 is low.',
      target: target.canvas,
      done: allOf(outputDriven('q0'), outputDriven('q1')),
    },
    {
      id: 'wire-high-quadrants',
      title: 'Expose the high quadrants',
      body: 'Connect q2 and q3 to the remaining outputs. All four quadrants now have a path from the decoder.',
      target: target.canvas,
      done: allOf(outputDriven('q2'), outputDriven('q3')),
    },
    {
      id: 'select-00',
      title: 'Route quadrant 00',
      body: 'Leave both select bits off. Only q0 should be high; the other three quadrants stay cold.',
      target: target.canvas,
      done: allOf(inputLow('s1'), inputLow('s0'), outputHigh('q0'), outputLow('q1'), outputLow('q2'), outputLow('q3')),
    },
    {
      id: 'select-11',
      title: 'Route quadrant 11',
      body: 'Switch both select bits on. The one-hot pattern moves all the way to q3.',
      target: target.canvas,
      done: allOf(inputHigh('s1'), inputHigh('s0'), outputLow('q0'), outputLow('q1'), outputLow('q2'), outputHigh('q3')),
    },
    {
      id: 'one-hot-check',
      title: 'Check that only one quadrant is live',
      body: 'Set s1 high and s0 low. Only q2 should be high, proving the decoder selects exactly one quadrant instead of dimming several at once.',
      hint: 'A decoder is not a set of independent switches: every select code maps to exactly one output.',
      target: target.canvas,
      done: allOf(inputHigh('s1'), inputLow('s0'), outputLow('q0'), outputLow('q1'), outputHigh('q2'), outputLow('q3')),
    },
  ],
}
