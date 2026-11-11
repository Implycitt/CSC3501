export type ComponentCategory = 'logic' | 'arithmetic' | 'routing' | 'memory' | 'historical' | 'custom'

export interface ComponentDef {
  id: string
  name: string
  category: ComponentCategory
  description: string
}

export interface Netlist {
  inputs: string[]
  outputs: string[]
  instances: Instance[]
}

export interface Instance {
  id: string
  component: string
  connections: Record<string, string>
}

export interface Recipe {
  inputs: string[]
  output: string
}
