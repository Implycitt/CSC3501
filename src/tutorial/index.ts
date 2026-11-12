import { andGateSection } from './sections/andGate.ts'
import { dFlipFlopSection } from './sections/dFlipFlop.ts'
import { notGateSection } from './sections/notGate.ts'
import { orGateSection } from './sections/orGate.ts'
import type { TutorialSection } from './types.ts'

export const TUTORIAL_SECTIONS: TutorialSection[] = [
  andGateSection,
  orGateSection,
  notGateSection,
  dFlipFlopSection,
]

export type { TutorialProgress, TutorialSection, TutorialStep } from './types.ts'
