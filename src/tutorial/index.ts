import { andGateSection } from './sections/andGate.ts'
import type { TutorialSection } from './types.ts'

/** Ordered lesson list. The sandbox resumes at the first unfinished section. */
export const TUTORIAL_SECTIONS: TutorialSection[] = [andGateSection]

export type { TutorialProgress, TutorialSection, TutorialStep } from './types.ts'
