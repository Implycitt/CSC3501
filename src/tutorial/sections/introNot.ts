import { environment } from '../environment.ts'
import { logicGoal } from '../goals.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const introNotSection: TutorialSection = {
  id: 'intro-not',
  title: 'The NOT gate',
  summary: 'Invert the fault line so a clear vent can open.',
  objective: 'y = NOT a',
  goal: logicGoal(['a'], 'y', (a) => !a),
  components: ['not'],
  features: {
    saveDesign: false,
    library: false,
    clearCanvas: false,
    componentDocs: false,
  },
  start: environment().input('a').output('y').build(),
  steps: [
    {
      id: 'place-not',
      title: 'Restore the inverter',
      body: 'The vent lockout is wired backwards. Drop a NOT gate between the fault input and the output, then connect a to its input and the gate output to y.',
      target: target.paletteItem('not'),
      done: allOf(placed('not'), portDriven('not', 'a'), outputDriven('y')),
    },
    {
      id: 'fault-live',
      title: 'Hold the vent shut',
      body: 'Switch a on. The live fault is inverted, so y stays dark.',
      target: target.canvas,
      done: allOf(inputHigh('a'), outputLow('y')),
    },
    {
      id: 'fault-clear',
      title: 'Open the vent',
      body: 'Switch a off. The clear line is inverted to a live output, so y lights.',
      target: target.canvas,
      done: allOf(inputLow('a'), outputHigh('y')),
    },
  ],
}
