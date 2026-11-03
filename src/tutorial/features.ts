import type { TutorialFeatures, TutorialSection } from './types.ts'

export const DEFAULT_FEATURES: TutorialFeatures = {
  addPorts: true,
  saveDesign: true,
  library: true,
  clearCanvas: true,
  componentDocs: true,
}

export function featuresFor(section?: TutorialSection): TutorialFeatures {
  return { ...DEFAULT_FEATURES, ...section?.features }
}
