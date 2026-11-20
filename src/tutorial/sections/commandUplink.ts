import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

const total = (a1: boolean, a0: boolean, b1: boolean, b0: boolean, cin: boolean) =>
  (a1 ? 2 : 0) + (a0 ? 1 : 0) + (b1 ? 2 : 0) + (b0 ? 1 : 0) + (cin ? 1 : 0)

const commandPermit = (a1: boolean, a0: boolean, b1: boolean, b0: boolean, cin: boolean) => {
  const sum = total(a1, a0, b1, b0, cin)
  const feeds = [a1, a0, b1, b0]
  const oddParity = feeds.filter(Boolean).length % 2 === 1
  const s1 = Math.floor(sum / 2) % 2 === 1
  const s0 = sum % 2 === 1
  const routed = feeds[(s1 ? 2 : 0) + (s0 ? 1 : 0)]

  return oddParity && routed && sum < 4
}

export const commandUplinkSection: TutorialSection = {
  id: 'logic-command-uplink',
  title: 'Command uplink',
  summary:
    'The four alignment lines double as the shield feeds. Treat a1 a0 and b1 b0 as two 2-bit words, add them, use the sum bits s1 s0 to route one of those four lines, then gate the route with odd parity and a clear carry.',
  objective: 'y = oddParity(a1,a0,b1,b0) AND feed[s1 s0] AND NOT cout',
  mode: 'puzzle',
  goal: logicGoal(['a1', 'a0', 'b1', 'b0', 'cin'], 'y', commandPermit),
  components: ['full-adder', 'xor', 'mux2', 'not', 'and3'],
  start: environment()
    .input('a1')
    .input('a0')
    .input('b1')
    .input('b0')
    .input('cin')
    .output('y')
    .build(),
  steps: [
    {
      id: 'add-the-words',
      title: 'Add the alignment words',
      body: 'Build the two-bit adder again: a full adder for the low column and a second for the high column, with the low carry feeding the high carry-in.',
      target: target.paletteItem('full-adder'),
    },
    {
      id: 'build-parity',
      title: 'Check feed parity',
      body: 'Fold the four feed lines together with XOR gates. The parity result is high only when an odd number of feeds are live.',
      target: target.paletteItem('xor'),
    },
    {
      id: 'build-route',
      title: 'Route the selected feed',
      body: 'Build the 4:1 router from a tree of 2:1 multiplexers. The low sum bit is s0 and the high sum bit is s1; together they choose one of the four feeds.',
      target: target.paletteItem('mux2'),
    },
    {
      id: 'combine-the-interlock',
      title: 'Combine all three checks',
      body: 'The command permit needs the routed feed, the parity check, and no carry-out. Invert the carry and combine all three conditions at the output.',
      target: target.canvas,
    },
  ],
}
