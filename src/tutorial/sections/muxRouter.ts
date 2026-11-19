import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputHigh, outputLow, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const muxRouterSection: TutorialSection = {
  id: 'logic-mux',
  title: 'Shield router',
  summary: 'The deflector is stuck on shield bus A even when the select line changes. Restore the missing route to B.',
  objective: 'y follows bus A when sel is low; y follows bus B when sel is high.',
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
      id: 'drive-sel',
      title: 'Restore the select path',
      body: 'The grid is stuck on bus A. The multiplexer already has both data buses and an output, but the control input is not connected. Wire sel into the select port.',
      target: target.canvas,
      done: portDriven('mux2', 'sel'),
    },
    {
      id: 'select-a',
      title: 'Confirm bus A',
      body: 'Leave sel low and switch bus a on. The grid should take A.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), inputLow('sel'), outputHigh('y')),
    },
    {
      id: 'select-b',
      title: 'Confirm bus B',
      body: 'Switch a off, b on, and sel high. The route should flip to B.',
      target: target.canvas,
      done: allOf(inputLow('a'), inputHigh('b'), inputHigh('sel'), outputHigh('y')),
    },
    {
      id: 'select-blocks-a',
      title: 'Prove the control line wins',
      body: 'Switch b off and a back on while sel stays high. A is live, but the grid should stay dark because sel still points at B.',
      hint: 'That is the difference between a wire and a route: the select line decides which input gets through.',
      target: target.canvas,
      done: allOf(inputHigh('a'), inputLow('b'), inputHigh('sel'), outputLow('y')),
    },
  ],
}
