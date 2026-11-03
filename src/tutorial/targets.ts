export const target = {
  palette: 'palette',
  paletteItem: (componentId: string) => `palette:${componentId}` as const,
  ports: 'ports',
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
  | 'ports'
  | 'canvas'
  | 'inspector'
  | 'simulation'
  | 'save'
  | 'library'
  | 'clear'
