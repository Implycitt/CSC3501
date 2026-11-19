import { environment } from '../environment.ts'
import {
  allOf,
  clockTicks,
  everyPortDriven,
  inputHigh,
  inputLow,
  outputDriven,
  outputHigh,
  outputLow,
  partDrivenBy,
  placed,
  portDriven,
} from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const memoryShiftSection: TutorialSection = {
  id: 'memory-shift',
  title: 'The shift cell',
  summary: 'Chain two latch stages so one bit moves through them on each clock edge.',
  objective: 'push one bit through q0, then q1, on each clock tick',
  mode: 'puzzle',
  goal: {
    inputs: ['d', 'clk'],
    outputs: ['q0', 'q1'],
    requiredTicks: 1,
    traces: [
      {
        name: 'one bit walks the chain',
        steps: [
          { inputs: { d: false }, outputs: { q0: false, q1: false } },
          { inputs: { d: true }, tick: true, outputs: { q0: true, q1: false } },
          { inputs: { d: true }, tick: true, outputs: { q0: true, q1: true } },
          { inputs: { d: false }, tick: true, outputs: { q0: false, q1: true } },
          { inputs: { d: false }, tick: true, outputs: { q0: false, q1: false } },
        ],
      },
    ],
  },
  components: ['d-flip-flop'],
  start: environment().input('d').clock().output('q0').output('q1').build(),
  steps: [
    {
      id: 'place-latches',
      title: 'Place two latch stages',
      body: 'A shift cell is built from two D flip-flops in a row. Drag two of them onto the grid.',
      hint: 'Put the first stage on the left and the second stage to its right.',
      target: target.paletteItem('d-flip-flop'),
      done: placed('d-flip-flop', 2),
    },
    {
      id: 'wire-data',
      title: 'Feed the first stage',
      body: 'Connect d into the data port of the first flip-flop. This is the bit that will move through the chain.',
      target: target.canvas,
      done: portDriven('d-flip-flop', 'd'),
    },
    {
      id: 'wire-clocks',
      title: 'Share the clock',
      body: 'Connect clk to both flip-flops. Both stages have to advance on the same edge for the bit to move as one word.',
      target: target.canvas,
      done: everyPortDriven('d-flip-flop', 'clk'),
    },
    {
      id: 'chain-stages',
      title: 'Chain the stages',
      body: 'Connect the first flip-flop output to the second flip-flop data input. The first stage now feeds the next one.',
      hint: 'One flip-flop should take its data from the other, not from the d input.',
      target: target.canvas,
      done: partDrivenBy('d-flip-flop', 'd', 'd-flip-flop', 'q'),
    },
    {
      id: 'wire-outputs',
      title: 'Expose both stored bits',
      body: 'Connect the first stage output to q0 and the second stage output to q1. The first stage is the one closest to d.',
      target: target.canvas,
      done: allOf(outputDriven('q0'), outputDriven('q1')),
    },
    {
      id: 'load-bit',
      title: 'Load a high bit',
      body: 'Switch d on. Nothing is captured yet; the flip-flops only change on a clock edge.',
      target: target.canvas,
      done: inputHigh('d'),
    },
    {
      id: 'first-edge',
      title: 'Shift the first edge',
      body: 'Press Tick in the live signal strip once. The first stage captures 1, so q0 lights. The second stage still sees the old zero and q1 stays dark.',
      target: target.simulation,
      done: allOf(clockTicks(1), outputHigh('q0'), outputLow('q1')),
    },
    {
      id: 'second-edge',
      title: 'Shift the bit forward',
      body: 'Press Tick again. The first stage keeps 1 and the second stage captures it, so both q0 and q1 are lit.',
      target: target.simulation,
      done: allOf(clockTicks(2), outputHigh('q0'), outputHigh('q1')),
    },
    {
      id: 'stop-input',
      title: 'Remove the input',
      body: 'Switch d off. The stored bits do not move until the next clock edge.',
      target: target.canvas,
      done: allOf(inputLow('d'), outputHigh('q1')),
    },
    {
      id: 'third-edge',
      title: 'Push zero into the chain',
      body: 'Press Tick once more. Zero enters the first stage while the old 1 moves into the second, so q0 goes dark and q1 stays lit.',
      hint: 'This is a shift register: the bits walk one stage per clock edge.',
      target: target.simulation,
      done: allOf(clockTicks(3), outputLow('q0'), outputHigh('q1')),
    },
  ],
}
