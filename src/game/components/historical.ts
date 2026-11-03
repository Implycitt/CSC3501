import type { ComponentDef } from '../types.ts'

export const HISTORICAL_COMPONENTS: ComponentDef[] = [
  { id: 'vacuum-tube', name: 'Vacuum Tube', category: 'historical', description: 'Early electronic amplifier and switch.' },
  { id: 'relay', name: 'Relay', category: 'historical', description: 'Electromechanical switch.' },
  { id: 'diode', name: 'Diode', category: 'historical', description: 'Early diode logic gate that is high only when both inputs are high.' },
  { id: 'magnetic-core', name: 'Magnetic Core', category: 'historical', description: 'Stores one bit as a magnetised ring.' },
  { id: 'mercury-delay-line', name: 'Mercury Delay Line', category: 'historical', description: 'Shifts bits through a tube of mercury on each clock edge.' },
  { id: 'stepping-switch', name: 'Stepping Switch', category: 'historical', description: 'Routes one input to one of four contacts by position.' },
]
