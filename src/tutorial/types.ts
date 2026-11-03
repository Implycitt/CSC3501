import type { Circuit } from '../game/circuit.ts'
import type { TutorialTarget } from './targets.ts'

export type { TutorialTarget } from './targets.ts'

export interface TutorialContext {
  circuit: Circuit
  nets: ReadonlyMap<string, boolean>
}

export interface TutorialStep {
  id: string
  title: string
  body: string
  target?: TutorialTarget
  hint?: string
  done?: (context: TutorialContext) => boolean
}

export interface TutorialSection {
  id: string
  title: string
  summary: string
  components?: string[]
  start: Circuit
  steps: TutorialStep[]
}

export interface SectionProgress {
  completed: string[]
  finishedAt?: number
}

export type TutorialProgress = Record<string, SectionProgress>
