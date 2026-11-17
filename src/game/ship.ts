export const SHIP_NAME = 'ISV MERIDIAN'
export const SHIP_INTELLIGENCE = 'MIRA'

export type StageKind = 'circuit' | 'firmware'

export interface SystemStage {
  id: string
  code: string
  name: string
  kind: StageKind
  brief: string
  restored: string
  sectionId?: string
  taskId?: string
}

export interface ShipSystem {
  id: string
  code: string
  name: string
  deck: string
  fault: string
  restored: string
  stages: SystemStage[]
}

export const SHIP_SYSTEMS: ShipSystem[] = [
  {
    id: 'life-support',
    code: 'LSS',
    name: 'Life Support',
    deck: 'DECK 01 / ATMOSPHERICS',
    fault: 'The scrubber interlock is dead, the return feed has collapsed to one path, and the pressure window is stuck open.',
    restored: 'Air moves through the deck again. Cold, thin, but breathable.',
    stages: [
      {
        id: 'lss-relay',
        code: 'LSS-01',
        name: 'Relay interlock',
        kind: 'circuit',
        sectionId: 'intro-and',
        brief: 'Rebuild the scrubber interlock in the panel. Both relay inputs have to drive the output before the bay will cycle.',
        restored: 'The relay pair agrees. The scrubber cycles once and settles.',
      },
      {
        id: 'lss-return-feed',
        code: 'LSS-02',
        name: 'Return feed',
        kind: 'circuit',
        sectionId: 'intro-or',
        brief: 'Either scrubber relay should keep the return feed live. Rebuild the feed junction with an OR gate.',
        restored: 'The return feed stays live on either relay.',
      },
      {
        id: 'lss-fault-inverter',
        code: 'LSS-03',
        name: 'Fault inverter',
        kind: 'circuit',
        sectionId: 'intro-not',
        brief: 'The vent lockout is wired backwards. Invert the fault line so a clear bay can open.',
        restored: 'The vent opens only when the fault line is clear.',
      },
      {
        id: 'lss-interlock-firmware',
        code: 'LSS-04',
        name: 'Interlock firmware',
        kind: 'firmware',
        taskId: 'lss-01',
        brief: 'The gate array is fixed; the firmware image is not. In the terminal, ax starts as relay A and bx as relay B. Make ax equal A AND B, leave bx unchanged, then run every case.',
        restored: 'Firmware and gate array agree. The scrubber is no longer fighting itself.',
      },
      {
        id: 'lss-pressure-window',
        code: 'LSS-05',
        name: 'Pressure window',
        kind: 'circuit',
        sectionId: 'logic-and-window',
        brief: 'The safety rule is arm AND NOT fault. Start from the half-wired panel: the fault line is already inverted. Add an AND gate and connect both conditions to the output, then toggle the inputs to watch it change.',
        restored: 'The pressure window opens only when the bay is armed and the fault line is clear.',
      },
      {
        id: 'lss-window-firmware',
        code: 'LSS-06',
        name: 'Window firmware',
        kind: 'firmware',
        taskId: 'lss-02',
        brief: 'The panel is fixed; the firmware image is not. In the terminal, ax starts as the arm mask and bx as the fault mask. Compute arm AND NOT fault in ax without modifying bx, then run every case.',
        restored: 'The scrubber now follows the pressure window in hardware and software.',
      },
    ],
  },
  {
    id: 'navigation',
    code: 'NAV',
    name: 'Navigation',
    deck: 'DECK 02 / GYRO BAY',
    fault: 'Either gyro bus should be able to steer the ship. The helm cannot see either of them.',
    restored: 'The helm answers the gyros again. The deck tilts a few degrees and settles.',
    stages: [
      {
        id: 'nav-gyro-bus',
        code: 'NAV-01',
        name: 'Gyro bus',
        kind: 'circuit',
        sectionId: 'logic-or',
        brief: 'The steering junction is miswired: it currently uses an AND gate. Trace the output and rebuild it so either gyro bus can drive the helm.',
        restored: 'The first gyro bus reaches the helm again.',
      },
      {
        id: 'nav-gyro-firmware',
        code: 'NAV-02',
        name: 'Gyro firmware',
        kind: 'firmware',
        taskId: 'nav-01',
        brief: 'Write the steering firmware in the terminal. Combine the two gyro masks without losing either bus.',
        restored: 'The helm and the gyro bus now use the same OR mask.',
      },
      {
        id: 'nav-priority-merger',
        code: 'NAV-03',
        name: 'Priority merger',
        kind: 'circuit',
        sectionId: 'logic-or-priority',
        brief: 'The two gyro buses are already merged, but the helm enable never reaches the output. Complete the veto path so enable can cut both buses.',
        restored: 'The helm enable now has the final say over both gyro buses.',
      },
      {
        id: 'nav-priority-firmware',
        code: 'NAV-04',
        name: 'Priority firmware',
        kind: 'firmware',
        taskId: 'nav-02',
        brief: 'Compute the same priority mask: (bus A OR bus B) AND helm enable.',
        restored: 'Steering is gated by the helm in both the panel and the firmware.',
      },
    ],
  },
  {
    id: 'comms',
    code: 'COM',
    name: 'Comms',
    deck: 'DECK 03 / RELAY MAST',
    fault: 'The emergency carrier is locked on. We need the inverse of the lockdown line to reopen the band.',
    restored: 'The relay mast is transmitting. The silence outside gets quieter.',
    stages: [
      {
        id: 'com-carrier',
        code: 'COM-01',
        name: 'Carrier inverse',
        kind: 'circuit',
        sectionId: 'logic-not',
        brief: 'The carrier line passes straight through instead of inverting. Trace the path and turn it into a real inverter.',
        restored: 'The carrier line can open again.',
      },
      {
        id: 'com-inverse-firmware',
        code: 'COM-02',
        name: 'Inverse firmware',
        kind: 'firmware',
        taskId: 'com-01',
        brief: 'Write the carrier firmware in the terminal. Invert the entire lockdown mask.',
        restored: 'The carrier firmware now inverts the lockdown line cleanly.',
      },
      {
        id: 'com-nand-interlock',
        code: 'COM-03',
        name: 'NAND interlock',
        kind: 'circuit',
        sectionId: 'logic-not-nand',
        brief: 'The carrier and lockdown are already combined by AND, but the result never reaches the veto. Add the missing inversion and wire it to the output.',
        restored: 'The relay mast will not transmit through a double lockdown anymore.',
      },
      {
        id: 'com-nand-firmware',
        code: 'COM-04',
        name: 'NAND firmware',
        kind: 'firmware',
        taskId: 'com-02',
        brief: 'Return the NAND of the carrier and lockdown masks, leaving the lockdown input intact.',
        restored: 'The NAND interlock is mirrored in firmware. The band is stable.',
      },
    ],
  },
  {
    id: 'core-memory',
    code: 'MEM',
    name: 'Core Memory',
    deck: 'DECK 04 / CORE LATTICE',
    fault: 'The boot latch is holding a dead bit. Every restart sends the same wrong word.',
    restored: 'The core remembers which state is real. Every deck light steadies at once.',
    stages: [
      {
        id: 'mem-boot-latch',
        code: 'MEM-01',
        name: 'Boot latch',
        kind: 'circuit',
        sectionId: 'memory-d-flip-flop',
        brief: 'Rebuild the boot latch in the panel. One bit must enter, survive a Tick clock edge, and stay held when the input drops. Any latch circuit that does this is accepted.',
        restored: 'The boot latch captures and holds again.',
      },
      {
        id: 'mem-latch-firmware',
        code: 'MEM-02',
        name: 'Latch firmware',
        kind: 'firmware',
        taskId: 'mem-01',
        brief: 'Move the stored bit out of the core word and into the boot latch in the terminal.',
        restored: 'The core and the latch agree on the boot bit.',
      },
      {
        id: 'mem-shift-cell',
        code: 'MEM-03',
        name: 'Shift cell',
        kind: 'circuit',
        sectionId: 'memory-shift',
        brief: 'Chain two latch cells so one bit moves through them in order. Tick the clock and watch the bit walk from the first stage to the second. Any correct latch chain is accepted.',
        restored: 'The shift cell moves a bit through both latches in order.',
      },
      {
        id: 'mem-byte-firmware',
        code: 'MEM-04',
        name: 'Byte split',
        kind: 'firmware',
        taskId: 'mem-02',
        brief: 'Split the boot word into low and high bytes, then store both halves in neighbouring memory cells.',
        restored: 'The core can address both halves of the boot word without losing either one.',
      },
    ],
  },
  {
    id: 'power',
    code: 'PWR',
    name: 'Auxiliary Power',
    deck: 'DECK 05 / REACTOR BAY',
    fault: 'The auxiliary reactor is running on a single coolant loop. The feed bus cannot hold, and the interlock cannot agree on a safe spin-up.',
    restored: 'The auxiliary reactor settles into a steady burn. Every deck light stops flickering at once.',
    stages: [
      {
        id: 'pwr-reactor-feed',
        code: 'PWR-01',
        name: 'Reactor feed',
        kind: 'circuit',
        sectionId: 'logic-or3',
        brief: 'The feed only sees pumps A and B; pump C is disconnected from the decision. Extend the OR path so any live pump can keep the core supplied.',
        restored: 'The reactor bus takes its first live coolant pump.',
      },
      {
        id: 'pwr-feed-firmware',
        code: 'PWR-02',
        name: 'Feed firmware',
        kind: 'firmware',
        taskId: 'pwr-01',
        brief: 'Mirror the three-pump feed in firmware. Any one live coolant mask must be enough to keep the reactor bus alive.',
        restored: 'Firmware and hardware agree on the reactor feed.',
      },
      {
        id: 'pwr-reactor-interlock',
        code: 'PWR-03',
        name: 'Reactor interlock',
        kind: 'circuit',
        sectionId: 'logic-and3',
        brief: 'The interlock only checks pressure and temperature; containment is missing. Complete the three-way permit before the core can spin up.',
        restored: 'The reactor will not spin up until all three safeties agree.',
      },
      {
        id: 'pwr-interlock-firmware',
        code: 'PWR-04',
        name: 'Interlock firmware',
        kind: 'firmware',
        taskId: 'pwr-02',
        brief: 'Combine all three safety masks in firmware. A single missing safety must hold the spin-up permit low.',
        restored: 'The reactor interlock is mirrored in firmware. The core can burn safely.',
      },
      {
        id: 'pwr-carry-cell',
        code: 'PWR-05',
        name: 'Carry cell',
        kind: 'circuit',
        sectionId: 'logic-full-adder',
        brief: 'The load-sense cell can add two coolant feeds but drops the carry from the previous cell. Rebuild it as a full adder so sum and carry-out both match the expected table.',
        restored: 'The reactor carry chain holds. The load total stays stable across every cell.',
      },
      {
        id: 'pwr-two-bit-total',
        code: 'PWR-06',
        name: 'Two-bit total',
        kind: 'circuit',
        sectionId: 'logic-adder2',
        brief: 'The load total is still one bit wide. Build a two-bit adder from scratch: add the two coolant feeds plus the incoming carry, and expose both sum bits plus the carry-out. Any correct adder is accepted.',
        restored: 'The reactor total now spans two bits and the carry chain holds.',
      },
    ],
  },
  {
    id: 'sensors',
    code: 'SNS',
    name: 'Sensor Array',
    deck: 'DECK 06 / DORSAL ARRAY',
    fault: 'The dorsal array cannot tell a real echo from a matching return. Every contact flickers between confirmed and lost.',
    restored: 'The array resolves the field again. Contacts hold steady on the bridge plot.',
    stages: [
      {
        id: 'sns-echo-contact',
        code: 'SNS-01',
        name: 'Echo contact',
        kind: 'circuit',
        sectionId: 'logic-xor',
        brief: 'The contact detector is using OR, so it also flags matching pings. Replace the comparison so it flags only a difference.',
        restored: 'The array can tell a real echo from a matching return.',
      },
      {
        id: 'sns-echo-firmware',
        code: 'SNS-02',
        name: 'Echo firmware',
        kind: 'firmware',
        taskId: 'sns-01',
        brief: 'Return the difference between the ping and echo masks. Equal bits mean no contact; differing bits raise the flag.',
        restored: 'The contact firmware now compares the return signal bit by bit.',
      },
      {
        id: 'sns-phase-lock',
        code: 'SNS-03',
        name: 'Phase lock',
        kind: 'circuit',
        sectionId: 'logic-xnor',
        brief: 'The phase comparator is using XOR, so it locks onto differences instead of matches. Add the missing inversion.',
        restored: 'The array confirms a phase match instead of chasing every edge.',
      },
      {
        id: 'sns-phase-firmware',
        code: 'SNS-04',
        name: 'Phase firmware',
        kind: 'firmware',
        taskId: 'sns-02',
        brief: 'Mirror the phase match in firmware. Matching masks confirm the lock; any differing bit rejects it.',
        restored: 'The phase lock is stable in hardware and software. The bridge plot clears.',
      },
      {
        id: 'sns-code-match',
        code: 'SNS-05',
        name: 'Contact code',
        kind: 'circuit',
        sectionId: 'logic-compare2',
        brief: 'The array has recovered the two-bit transponder code, but the high-bit comparator is inverted. Build an exact two-bit match so a single flipped bit rejects the contact.',
        restored: 'The array confirms only exact transponder codes. The bridge plot locks cleanly.',
      },
      {
        id: 'sns-parity-filter',
        code: 'SNS-06',
        name: 'Parity filter',
        kind: 'circuit',
        sectionId: 'logic-parity4',
        brief: 'The array can spot a difference but cannot tell an odd echo count from an even one. Build a four-input parity filter from scratch and wire its single output.',
        restored: 'The dorsal array rejects even echo counts and flags only odd contacts.',
      },
    ],
  },
  {
    id: 'shields',
    code: 'SHD',
    name: 'Deflector Grid',
    deck: 'DECK 07 / SHIELD RING',
    fault: 'The deflector ring is charging through a hazard, the router is stuck on the wrong shield bus, and half the quadrants never receive power.',
    restored: 'The deflector ring comes up clean. The hull outline sharpens on the plot.',
    stages: [
      {
        id: 'shd-hazard-veto',
        code: 'SHD-01',
        name: 'Hazard veto',
        kind: 'circuit',
        sectionId: 'logic-nor',
        brief: 'The hazard warning is merged by OR but never inverted, so it raises the charge instead of vetoing it. Correct the output path.',
        restored: 'The deflector will not charge through an asserted hazard.',
      },
      {
        id: 'shd-hazard-firmware',
        code: 'SHD-02',
        name: 'Hazard firmware',
        kind: 'firmware',
        taskId: 'shd-01',
        brief: 'Return the all-clear mask. Any hazard bit must veto the whole deflector charge.',
        restored: 'Hazard vetoes are mirrored in firmware. The ring can charge cleanly.',
      },
      {
        id: 'shd-shield-router',
        code: 'SHD-03',
        name: 'Shield router',
        kind: 'circuit',
        sectionId: 'logic-mux',
        brief: 'The router is wired to both shield buses, but its select line is dangling and stuck on bus A. Complete the route so select chooses the grid feed.',
        restored: 'The deflector grid can switch between shield buses on command.',
      },
      {
        id: 'shd-router-firmware',
        code: 'SHD-04',
        name: 'Router firmware',
        kind: 'firmware',
        taskId: 'shd-02',
        brief: 'Route the selected shield bus in firmware. Select low takes A; select high takes B.',
        restored: 'The shield router is mirrored in firmware. The deflector ring holds.',
      },
      {
        id: 'shd-quad-decoder',
        code: 'SHD-05',
        name: 'Quadrant decoder',
        kind: 'circuit',
        sectionId: 'logic-decoder2to4',
        brief: 'The ring can reach only two quadrants because the decoder outputs are half-wired. Complete the 2-to-4 decoder so exactly one quadrant receives power for each select code.',
        restored: 'All four shield quadrants answer the decoder. The deflector ring comes up clean.',
      },
      {
        id: 'shd-quad-router',
        code: 'SHD-06',
        name: 'Quadrant router',
        kind: 'circuit',
        sectionId: 'logic-mux4',
        brief: 'The ring can choose between two feeds but not four. Build a 4:1 router from scratch using a tree of 2:1 multiplexers, then prove every select code reaches the output.',
        restored: 'All four shield feeds reach the ring through the new quadrant router.',
      },
      {
        id: 'shd-command-uplink',
        code: 'SHD-07',
        name: 'Command uplink',
        kind: 'circuit',
        sectionId: 'logic-command-uplink',
        brief: 'The ring is whole, but the command uplink cannot certify a firing solution. The four alignment lines double as the shield feeds: add a1 a0 and b1 b0, use the sum bits to route one feed, and gate that route with odd parity and a clear carry-out.',
        restored: 'The load total, parity check, and quadrant route settle into one command word. The bridge and the deflector ring answer together.',
      },
    ],
  },
]

export const ALL_STAGES: SystemStage[] = SHIP_SYSTEMS.flatMap((system) => system.stages)

export function systemById(systemId: string): ShipSystem | undefined {
  return SHIP_SYSTEMS.find((system) => system.id === systemId)
}

export function stageById(stageId: string): SystemStage | undefined {
  return ALL_STAGES.find((stage) => stage.id === stageId)
}

export function systemForStage(stageId: string): ShipSystem | undefined {
  return SHIP_SYSTEMS.find((system) => system.stages.some((stage) => stage.id === stageId))
}

export function stageBySection(sectionId: string): SystemStage | undefined {
  return ALL_STAGES.find((stage) => stage.sectionId === sectionId)
}

export function systemBySection(sectionId: string): ShipSystem | undefined {
  return SHIP_SYSTEMS.find((system) => system.stages.some((stage) => stage.sectionId === sectionId))
}

export function stageByTask(taskId: string): SystemStage | undefined {
  return ALL_STAGES.find((stage) => stage.taskId === taskId)
}
