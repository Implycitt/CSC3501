import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, partDrivenBy, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

const select = (s1: boolean, s0: boolean) => (s1 ? 2 : 0) + (s0 ? 1 : 0)

export const quadRouterSection: TutorialSection = {
  id: 'logic-mux4',
  title: 'Quadrant router',
  summary: 'Build a 4:1 shield router from a tree of 2:1 multiplexers and prove every select code reaches the output.',
  objective: 'y = a / b / c / d at s1 s0 = 00 / 01 / 10 / 11',
  mode: 'puzzle',
  goal: logicGoal(
    ['a', 'b', 'c', 'd', 's0', 's1'],
    'y',
    (a, b, c, d, s0, s1) => [a, b, c, d][select(s1, s0)],
  ),
  components: ['mux2'],
  start: environment()
    .input('a')
    .input('b')
    .input('c')
    .input('d')
    .input('s0')
    .input('s1')
    .output('y')
    .build(),
  steps: [
    {
      id: 'place-muxes',
      title: 'Place three 2:1 multiplexers',
      body: 'A 4:1 router is a tree of 2:1 routes: two first-stage multiplexers choose between input pairs, and a final multiplexer chooses between those results.',
      target: target.paletteItem('mux2'),
      done: placed('mux2', 3),
    },
    {
      id: 'wire-pairs',
      title: 'Wire both input pairs',
      body: 'Connect a and b to the first multiplexer, c and d to the second, and share s0 between their select lines.',
      target: target.canvas,
      done: allOf(portDriven('mux2', 'a'), portDriven('mux2', 'b'), portDriven('mux2', 'c'), portDriven('mux2', 'd')),
    },
    {
      id: 'combine-pairs',
      title: 'Combine the pair results',
      body: 'Feed both first-stage outputs into the final multiplexer and connect s1 to its select line.',
      target: target.canvas,
      done: allOf(partDrivenBy('mux2', 'a', 'mux2', 'y'), partDrivenBy('mux2', 'b', 'mux2', 'y'), portDriven('mux2', 'sel')),
    },
    {
      id: 'expose-route',
      title: 'Expose the selected feed',
      body: 'Connect the final multiplexer output to y. The tree now routes one of four shield feeds into the ring.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'select-a',
      title: 'Select feed A',
      body: 'Switch a on, leave the other feeds off, and leave both selects low. The 00 code should route A to y.',
      target: target.canvas,
      done: allOf(
        inputHigh('a'),
        inputLow('b'),
        inputLow('c'),
        inputLow('d'),
        inputLow('s0'),
        inputLow('s1'),
        outputHigh('y'),
      ),
    },
    {
      id: 'select-d',
      title: 'Select feed D',
      body: 'Switch d on and everything else off, then raise both selects. The 11 code should route D all the way through the tree.',
      target: target.canvas,
      done: allOf(
        inputLow('a'),
        inputLow('b'),
        inputLow('c'),
        inputHigh('d'),
        inputHigh('s0'),
        inputHigh('s1'),
        outputHigh('y'),
      ),
    },
    {
      id: 'select-c',
      title: 'Select feed C',
      body: 'Switch c on, d off, s1 high, and s0 low. The 10 code selects the second first-stage multiplexer, so C reaches y.',
      target: target.canvas,
      done: allOf(
        inputLow('a'),
        inputLow('b'),
        inputHigh('c'),
        inputLow('d'),
        inputLow('s0'),
        inputHigh('s1'),
        outputHigh('y'),
      ),
    },
  ],
}
