import { and3InterlockSection } from './sections/and3Interlock.ts'
import { andGateSection } from './sections/andGate.ts'
import { andWindowSection } from './sections/andWindow.ts'
import { dFlipFlopSection } from './sections/dFlipFlop.ts'
import { memoryShiftSection } from './sections/memoryShift.ts'
import { muxRouterSection } from './sections/muxRouter.ts'
import { norHazardSection } from './sections/norHazard.ts'
import { notGateSection } from './sections/notGate.ts'
import { notNandSection } from './sections/notNand.ts'
import { or3FeedSection } from './sections/or3Feed.ts'
import { orGateSection } from './sections/orGate.ts'
import { orPrioritySection } from './sections/orPriority.ts'
import { xnorPhaseSection } from './sections/xnorPhase.ts'
import { xorEchoSection } from './sections/xorEcho.ts'
import type { TutorialSection } from './types.ts'

export const TUTORIAL_SECTIONS: TutorialSection[] = [
  andGateSection,
  andWindowSection,
  orGateSection,
  orPrioritySection,
  notGateSection,
  notNandSection,
  dFlipFlopSection,
  memoryShiftSection,
  or3FeedSection,
  and3InterlockSection,
  xorEchoSection,
  xnorPhaseSection,
  norHazardSection,
  muxRouterSection,
]

export type { TutorialProgress, TutorialSection, TutorialStep } from './types.ts'
