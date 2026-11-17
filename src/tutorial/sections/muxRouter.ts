import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const muxRouterSection: TutorialSection = {
  id: 'logic-mux',
  title: 'Shield router',
  summary: 'Route one of two shield buses into the grid with a select line.',
  objective: 'y = sel ? b : a',
  mode: 'puzzle',
  goal: logicGoal(['a', 'b', 'sel'], 'y', (a, b, sel) => (sel ? b : a)),
  components: ['mux2'],
  start: environment()
    .input('a')
    .input('b')
    .input('sel')
    .output('y')
    .place('mux2', { as: 'route', x: 300, y: 120 })
    .wire('in:a', 'route.a')
    .wire('in:b', 'route.b')
    .wire('route.y', 'out:y')
    .build(),
  steps: [
    {
      id: 'place-mux',
      title: 'Place a 2:1 multiplexer',
      body: 'The deflector grid has two shield buses but only one feed. A multiplexer selects which bus reaches the grid.',
      target: target.paletteItem('mux2'),
      done: placed('mux2'),
    },
    {
      id: 'drive-a',
      title: 'Wire shield bus A',
      body: 'Connect bus a to the first data input.',
      target: target.canvas,
      done: portDriven('mux2', 'a'),
    },
    {
      id: 'drive-b',
      title: 'Wire shield bus B',
      body: 'Connect bus b to the second data input.',
      target: target.canvas,
      done: portDriven('mux2', 'b'),
    },
    {
      id: 'drive-sel',
      title: 'Wire the select line',
      body: 'Connect sel to the select port. Low selects bus A; high selects bus B.',
      target: target.canvas,
      done: portDriven('mux2', 'sel'),
    },
    {
      id: 'drive-y',
      title: 'Wire the grid feed',
      body: 'Connect the multiplexer output to y.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'select-a',
      title: 'Route bus A',
      body: 'Leave sel off and switch bus a on. The multiplexer passes A through to y.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), inputLow('sel'), outputHigh('y')),
    },
    {
      id: 'select-b',
      title: 'Route bus B',
      body: 'Switch a off, b on, and sel on. The route flips and B reaches y instead.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputHigh('b'), inputHigh('sel'), outputHigh('y')),
    },
    {
      id: 'select-blocks-a',
      title: 'Prove the select line is in control',
      body: 'Switch b off and a back on while sel stays high. Bus A is live, but the grid stays dark because the select line is still pointing at B.',
      hint: 'That is the difference between a wire and a route: the select line decides which input gets through.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), inputHigh('sel'), outputLow('y')),
    },
  ],
}
