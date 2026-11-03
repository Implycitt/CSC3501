import { environment } from '../environment.ts'
import {
  allOf,
  clockTicks,
  inputHigh,
  inputLow,
  outputDriven,
  outputHigh,
  outputLow,
  placed,
  portDriven,
} from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const dFlipFlopSection: TutorialSection = {
  id: 'memory-d-flip-flop',
  title: 'The D flip-flop',
  summary: 'Store one bit and release it on a clock edge.',
  components: ['d-flip-flop'],
  features: { addPorts: false },
  start: environment().input('d').clock().output('q').build(),
  steps: [
    {
      id: 'place-flip-flop',
      title: 'Place a D flip-flop',
      body: 'A flip-flop remembers one bit. Drag it onto the grid between the input and the output.',
      target: target.paletteItem('d-flip-flop'),
      done: placed('d-flip-flop'),
    },
    {
      id: 'wire-d',
      title: 'Wire the data input',
      body: 'Connect d to the flip-flop data port.',
      target: target.canvas,
      done: portDriven('d-flip-flop', 'd'),
    },
    {
      id: 'wire-clock',
      title: 'Wire the clock',
      body: 'Connect clk to the clock port. Sequential parts only change state on a clock edge.',
      hint: 'The clock node pulses from the Simulation panel, not from clicking it.',
      target: target.canvas,
      done: portDriven('d-flip-flop', 'clk'),
    },
    {
      id: 'wire-q',
      title: 'Wire the output',
      body: 'Connect the q output to the y-style output named q.',
      target: target.canvas,
      done: outputDriven('q'),
    },
    {
      id: 'first-tick',
      title: 'Tick with d off',
      body: 'Press Tick clock in the Simulation panel. The flip-flop captures d, which is off, so q stays dark.',
      target: target.simulation,
      done: allOf(clockTicks(1), outputLow('q')),
    },
    {
      id: 'set-d',
      title: 'Switch d on',
      body: 'Turn the data input on. q does not change yet: nothing reaches the output until the next clock edge.',
      target: target.canvas,
      done: inputHigh('d'),
    },
    {
      id: 'capture',
      title: 'Tick again',
      body: 'Press Tick clock once more. The flip-flop captures the high input and q lights up.',
      target: target.simulation,
      done: allOf(clockTicks(2), outputHigh('q')),
    },
    {
      id: 'hold',
      title: 'Hold the bit',
      body: 'Switch d off, but do not tick. q stays lit, because the stored bit only changes on a clock edge.',
      hint: 'That is the difference between a wire and memory: the value survives the input going away.',
      target: target.canvas,
      done: allOf(inputLow('d'), outputHigh('q')),
    },
    {
      id: 'release',
      title: 'Tick once more',
      body: 'Press Tick clock. Now the flip-flop captures the low input and q goes dark.',
      target: target.simulation,
      done: allOf(clockTicks(3), outputLow('q')),
    },
  ],
}
