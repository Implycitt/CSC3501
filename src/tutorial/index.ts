import { and3InterlockSection } from './sections/and3Interlock.ts'
import { andGateSection } from './sections/andGate.ts'
import { andWindowSection } from './sections/andWindow.ts'
import { commandUplinkSection } from './sections/commandUplink.ts'
import { compare2Section } from './sections/compare2.ts'
import { dFlipFlopSection } from './sections/dFlipFlop.ts'
import { fullAdderSection } from './sections/fullAdder.ts'
import { introAndSection } from './sections/introAnd.ts'
import { introNotSection } from './sections/introNot.ts'
import { introOrSection } from './sections/introOr.ts'
import { memoryShiftSection } from './sections/memoryShift.ts'
import { muxRouterSection } from './sections/muxRouter.ts'
import { norHazardSection } from './sections/norHazard.ts'
import { notGateSection } from './sections/notGate.ts'
import { notNandSection } from './sections/notNand.ts'
import { or3FeedSection } from './sections/or3Feed.ts'
import { orGateSection } from './sections/orGate.ts'
import { parityFilterSection } from './sections/parityFilter.ts'
import { quadRouterSection } from './sections/quadRouter.ts'
import { quadrantDecoderSection } from './sections/quadrantDecoder.ts'
import { orPrioritySection } from './sections/orPriority.ts'
import { twoBitAdderSection } from './sections/twoBitAdder.ts'
import { xnorPhaseSection } from './sections/xnorPhase.ts'
import { xorEchoSection } from './sections/xorEcho.ts'
import type { TutorialSection } from './types.ts'

export const TUTORIAL_SECTIONS: TutorialSection[] = [
  introAndSection,
  introOrSection,
  introNotSection,
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
  fullAdderSection,
  xorEchoSection,
  xnorPhaseSection,
  compare2Section,
  norHazardSection,
  muxRouterSection,
  quadrantDecoderSection,
  twoBitAdderSection,
  parityFilterSection,
  quadRouterSection,
  commandUplinkSection,
]

export type { TutorialProgress, TutorialSection, TutorialStep } from './types.ts'
