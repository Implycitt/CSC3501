import { environment } from '../environment.ts'
import { allOf, inputHigh, inputLow, outputDriven, outputHigh, outputLow, partDrivenBy, placed, portDriven } from '../predicates.ts'
import { target } from '../targets.ts'
import type { TutorialSection } from '../types.ts'

export const andWindowSection: TutorialSection = {
  id: 'logic-and-window',
  title: 'The pressure window',
  summary: 'Combine a live signal with an inverted lockout.',
  objective: 'y = arm AND NOT fault',
  components: ['not', 'and'],
  start: environment()
    .input('arm')
    .input('fault')
    .output('y')
    .place('not', { as: 'lockout', x: 300, y: 120 })
    .wire('in:fault', 'lockout.a')
    .build(),
  steps: [
    {
      id: 'place-and',
      title: 'Add the interlock gate',
      body: 'The NOT gate is already in the circuit, but its output goes nowhere. Add an AND gate to combine the live arm line with the inverted fault line.',
      target: target.paletteItem('and'),
      done: placed('and'),
    },
    {
      id: 'wire-inverted-fault',
      title: 'Bring in the inverted fault',
      body: 'Drag from the NOT gate output to the lower input (b) of the AND gate. The fault line is now inverted before it reaches the interlock.',
      hint: 'The NOT output is the small handle on the right side of the NOT gate. Use the AND gate lower input b; the arm line will take the upper input a.',
      target: target.canvas,
      done: partDrivenBy('and', 'b', 'not', 'y'),
    },
    {
      id: 'wire-arm',
      title: 'Wire the arm line',
      body: 'Connect arm to the upper input (a) of the AND gate. The window should only open when the bay is armed.',
      target: target.canvas,
      done: portDriven('and', 'a'),
    },
    {
      id: 'wire-output',
      title: 'Wire the window output',
      body: 'Connect the AND output to y. Now the output depends on both the arm line and the absence of a fault.',
      target: target.canvas,
      done: outputDriven('y'),
    },
    {
      id: 'armed-clear',
      title: 'Arm the bay with no fault',
      body: 'Switch arm on and leave fault off. The inverted fault is high, so the AND output lights y. This is the safe pressure window.',
      hint: 'If fault is already on, switch it off first.',
      target: target.canvas,
      done: allOf(inputHigh('arm'), inputLow('fault'), outputHigh('y')),
    },
    {
      id: 'fault-closes-window',
      title: 'Assert a fault while armed',
      body: 'Keep arm on and switch fault on. The NOT gate goes low, so the AND gate closes and y goes dark even though the bay is armed.',
      hint: 'This is why the inversion matters: a fault has to veto the window, not enable it.',
      target: target.canvas,
      done: allOf(inputHigh('arm'), inputHigh('fault'), outputLow('y')),
    },
  ],
}
