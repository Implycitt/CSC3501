export const target = {
  palette: 'palette',
  paletteItem: (componentId: string) => `palette:${componentId}` as const,
  canvas: 'canvas',
  inspector: 'inspector',
  simulation: 'simulation',
  save: 'save',
  library: 'library',
  clear: 'clear',
} as const

export type TutorialTarget =
  | 'palette'
  | `palette:${string}`
  | 'canvas'
  | 'inspector'
  | 'simulation'
  | 'save'
  | 'library'
  | 'clear'
