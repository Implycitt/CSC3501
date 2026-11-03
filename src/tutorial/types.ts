import type { Circuit } from '../game/circuit.ts'

/**
 * Name of an interface region a step can point at. Every value has to exist as
 * a `data-tutorial` attribute in the UI so the highlight overlay can find it.
 */
export type TutorialTarget = string

/** Live editor state a step can inspect to decide whether the learner is done. */
export interface TutorialContext {
  circuit: Circuit
  nets: ReadonlyMap<string, boolean>
}

export interface TutorialStep {
  id: string
  title: string
  body: string
  /** Interface region highlighted while this step is active. */
  target?: TutorialTarget
  /** Small print under the body, e.g. the exact drag the step expects. */
  hint?: string
  /** The step is finished once this returns true. */
  done?: (context: TutorialContext) => boolean
}

export interface TutorialSection {
  id: string
  title: string
  summary: string
  /** Component ids the palette exposes for this section; omit to expose everything. */
  components?: string[]
  /** Circuit the section starts from. */
  start: Circuit
  steps: TutorialStep[]
}

export interface SectionProgress {
  /** Ids of the steps the learner has finished. */
  completed: string[]
  /** Set once every step in the section is complete. */
  finishedAt?: number
}

export type TutorialProgress = Record<string, SectionProgress>
