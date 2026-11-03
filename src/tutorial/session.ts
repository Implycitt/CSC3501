import { EMPTY_CIRCUIT, rekeyCircuit, type Circuit } from '../game/circuit.ts'
import { firstIncompleteStep, markStepComplete, nextIncompleteSection } from './progress.ts'
import type { TutorialProgress, TutorialSection } from './types.ts'

export interface TutorialSession {
  progress: TutorialProgress
  sectionId: string | null
  stepIndex: number
  ticks: number
}

let nextCircuitPart = 1

const findSection = (sections: readonly TutorialSection[], sectionId: string | null) =>
  sections.find((section) => section.id === sectionId)

export function startSession(sections: readonly TutorialSection[], progress: TutorialProgress): TutorialSession {
  const section = nextIncompleteSection(sections, progress)
  return {
    progress,
    sectionId: section?.id ?? null,
    stepIndex: section ? firstIncompleteStep(section, progress) : 0,
    ticks: 0,
  }
}

export function sectionCircuit(sections: readonly TutorialSection[], sectionId: string | null): Circuit {
  const section = findSection(sections, sectionId)
  return section ? rekeyCircuit(section.start, () => `t${nextCircuitPart++}`) : EMPTY_CIRCUIT
}

function completeStep(section: TutorialSection, session: TutorialSession, stepId: string): TutorialSession {
  const progress = markStepComplete(session.progress, section, stepId)
  const finished = session.stepIndex + 1 >= section.steps.length

  return {
    progress,
    sectionId: finished ? null : section.id,
    stepIndex: finished ? 0 : session.stepIndex + 1,
    ticks: session.ticks,
  }
}

export function settleSession(
  sections: readonly TutorialSection[],
  session: TutorialSession,
  circuit: Circuit,
  nets: ReadonlyMap<string, boolean>,
  ticks: number = session.ticks,
): TutorialSession {
  const section = findSection(sections, session.sectionId)
  const step = section?.steps[session.stepIndex]
  const current = ticks === session.ticks ? session : { ...session, ticks }
  if (!section || !step?.done || !step.done({ circuit, nets, ticks })) return current

  return completeStep(section, current, step.id)
}

export function advanceSession(sections: readonly TutorialSection[], session: TutorialSession): TutorialSession {
  const section = findSection(sections, session.sectionId)
  const step = section?.steps[session.stepIndex]
  if (!section || !step) return session

  return completeStep(section, session, step.id)
}

export function retreatSession(session: TutorialSession): TutorialSession {
  return { ...session, stepIndex: Math.max(0, session.stepIndex - 1) }
}

export function closeSession(session: TutorialSession): TutorialSession {
  return { ...session, sectionId: null }
}

export function resumeSession(
  sections: readonly TutorialSection[],
  session: TutorialSession,
  sectionId: string,
): TutorialSession {
  const section = findSection(sections, sectionId)
  if (!section) return session

  return { ...session, sectionId, stepIndex: firstIncompleteStep(section, session.progress), ticks: 0 }
}
