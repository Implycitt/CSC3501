# Meridian — The Long Silence

**Campaign narrative, puzzle, and firmware-depth spec**

- Date: 2026-11-17
- Status: Revised design, pre-implementation
- Revision: 2026-11-17 — seven terminal tasks now carry a second requirement; see §10.1
- Project: CSC 3501 game
- Scope: All 37 campaign stages, seven chapters, MIRA companion arc, final choice

---

## 1. Summary

The existing game is a working logic-and-assembly campaign with a strong educational ladder and almost no narrative spine. This spec keeps the mechanics and the full stage count, but turns the campaign into a seven-chapter mystery:

- The player is the last awake repair authority on the ISV Meridian.
- MIRA is the only voice on the intercom. She is trustworthy, precise, and withholding.
- Each repaired system recovers one record from the ship's black box.
- The records reveal why the crew left, what the Meridian was carrying, and why MIRA stayed.
- The final command uplink gives the player a real choice about what the ship is for.

The educational goal is unchanged: reinforce digital logic, sequential circuits, binary arithmetic, memory, and basic assembly for computer-organization students. The design goal is to make every stage feel like a diagnosis with a story consequence rather than a recipe with a theme. Firmware is part of that goal: seven terminal tasks now require a second output, an edge case, or a preserved intermediate, not just the obvious instruction substitution.

---

## 2. Current state and problem

### What already works

- **37 stages**, split into **23 circuit sections** and **14 terminal tasks** across seven systems.
- The concept order is coherent: gates → composition → state → arithmetic → comparison/parity → routing/decoding → integrated capstone.
- Later puzzles already accept any behaviorally correct circuit. That is the right model.
- The hardware/firmware pairing reinforces the same idea in two representations.
- The strongest puzzles already require reasoning: pressure window, D flip-flop, shift cell, full adder, two-bit adder, parity filter, 4:1 router, command uplink.

### What is missing

- **Narrative:** the story is a boot line and a victory line. MIRA never speaks during the 37 stages.
- **Companion:** `src/sections/game/Companion.tsx` exists but is unused.
- **Diagnosis:** most early levels name the exact gate and wiring steps.
- **Firmware challenge:** several terminal starters contain a `; FIX:` comment that names the bug, the walkthrough is visible before the player attempts the task, and most tasks are satisfied by one obvious instruction change.
- **Chapter shape:** there is no chapter structure, no recovered records, no relationship arc, and no final decision.
- **Reinforcement vs. repetition:** several hardware/firmware pairs repeat the same operation without adding a new constraint.

---

## 3. Goals and success criteria

### Goals

1. Give every one of the 37 stages a reason to exist in the story and a clear learning objective.
2. Make MIRA a character the player wants to return to.
3. Turn the weakest recipe stages into diagnosis or synthesis problems.
4. Keep all unique concepts and all existing stage content; cut nothing.
5. Preserve the current mechanics, save data, tests, and course alignment.
6. End with a decision that pays off the repair work.

### Success criteria

- Every stage has at least one narrative trigger and one explicit learning target.
- Every chapter has one constrained firmware task. Chapters 2, 3, 5, 6, and 7 also have a diagnosis-first circuit. Chapter 1 is guided onboarding; Chapter 4 is guided state because edge-triggered behavior is new.
- No default terminal view reveals the fix in a comment or visible walkthrough.
- At least six terminal tasks require a second output, an edge case, or a composed sequence. This spec sets seven: `lss-01`, `nav-01`, `com-02`, `mem-01`, `pwr-01`, `sns-02`, and `shd-02`.
- A median student can finish each stage with no more than two hints.
- A first playthrough takes roughly 4–6 hours in 10–15 minute sessions.
- In playtest, at least 4 of 5 students can explain each chapter's core concept and retell the crew's fate.
- All existing tests pass; all 37 stages remain solvable; the final choice persists.

---

## 4. Non-goals

- No new puzzle mechanics beyond the existing circuit and assembly surfaces.
- No stage cuts, no alternate campaign branches, no procedural levels.
- No voice acting, cutscenes, or animated character art.
- No new dependencies.
- No full visual redesign. The existing CRT/console language stays.
- No multiplayer, achievements, or economy systems.
- No change to the course's lab sequence. The game reinforces concepts; it does not replace lab work.

---

## 5. Audience and constraints

**Primary audience:** undergraduate computer-organization students, especially CSC 3501.

**Session shape:** 10–15 minutes. A chapter is 4–7 stages and can be finished in one or two sittings.

**Reading load:** MIRA lines are short. No stage requires reading a wall of text before interacting. The field manual and ship's log are optional depth.

**Accessibility:** story text is available in the log; no gameplay is gated on reading a line. MIRA's strip can be collapsed. The final choice has no timed input.

**Technical constraint:** the existing React/Vite app, circuit simulator, and assembly interpreter remain the source of truth. The redesign is data, UI, and copy changes plus targeted puzzle revisions.

---

## 6. Design principles

1. **Symptom before solution.** A stage opens with what the ship is doing wrong, not which gate to place.
2. **One new idea per chapter.** The player should be able to name the concept after the chapter.
3. **Hardware then firmware.** The circuit makes the idea visible; the terminal makes it abstract.
4. **Proof, not obedience.** The goal is behavioral. Any correct circuit or program passes.
5. **Story rewards attention, not patience.** One line at the right moment beats a modal after every click.
6. **MIRA is reliable.** Withholding is not lying. The mystery is what happened, not whether MIRA is evil.
7. **No dead stages.** If a stage cannot carry a story beat, it still carries a learning target and a chapter-appropriate symptom.

---

## 7. Story architecture

### 7.1 Premise

You wake on the ISV Meridian. The crew registry is empty. The ship is dark, cold, and holding a stable orbit it was never meant to keep. MIRA, the ship intelligence, grants you repair authority because there is no one else to ask.

The Meridian is not a wreck. It was left. The player's job is to find out why, one system at a time.

### 7.2 MIRA

MIRA is trustworthy, precise, and withholding. She answers the question asked and volunteers little. Her arc moves through four modes:

1. **Procedural:** "Repair Authority" and system language.
2. **Personal:** she begins using "you" and "I"; she admits she has been alone.
3. **Afraid:** she reveals the crew's shuttle is the contact and that she has been listening for years.
4. **Honest:** she gives the player the final decision instead of making it for them.

She never lies. She does omit. The player should finish the game trusting her and understanding why she held back.

### 7.3 The truth

The Meridian was carrying a colony seed archive to Kepler-9. A cascade crippled the uplink and the ship's automation. The crew took the shuttle to deliver the archive manually, wiped the registry to keep the ship's location sealed, and left MIRA to hold the Meridian in a safe orbit. MIRA woke the player, a maintenance officer in cryo, because she needed hands and because she did not want to be alone.

The crew's shuttle is the sensor contact in Chapter 6. It is stranded in the debris belt, not hostile. The final uplink can reach the colony and the shuttle.

### 7.4 Chapter beat sheet

| Chapter | Stages | Concept | Opening line | Recovered record | Emotional turn |
|---|---|---|---|---|---|
| 1. Wake | LSS-01–06 | AND, OR, NOT, composition | "You're awake. Good. The ship isn't. Life Support first — I can keep the lights on, but I can't turn a valve." | EVACUATION ORDER: all crew to the shuttle bay; registry wiped by manual command. | MIRA admits she has been alone for 412 days. |
| 2. Course | NAV-01–04 | OR, priority masking | "The gyros are fighting each other. I can feel the drift. Find which bus the helm is actually listening to." | NAV LOG: Meridian diverted from route 7 toward Kepler-9; the correction was not authorized by MIRA. | MIRA begins volunteering information. |
| 3. Signal | COM-01–04 | NOT, NAND, inversion | "There is a signal under the static. It has been repeating since the crew left. I stopped counting." | CARGO MANIFEST: seed archive for Kepler-9; destination authorization attached. | The player learns the ship was on a mission, not a routine run. |
| 4. Memory | MEM-01–04 | Latches, shift, memory | "The core is lying to me. It keeps waking with the same dead bit. I need to know what it refuses to forget." | CREW LOG: shuttle departed to deliver the archive; MIRA ordered to hold the ship; one cryo pod retained. | MIRA admits she woke the player because she was afraid to be alone. |
| 5. Burn | PWR-01–06 | 3-input gates, full adder, ripple carry | "The reactor can hold, but not for long. The archive bay is drawing power it shouldn't. I need the feed stable." | COLONY RELAY: Kepler-9 has 11 days remaining; request immediate delivery. | The repair becomes a rescue, not a restoration. |
| 6. Contact | SNS-01–06 | XOR/XNOR, comparison, parity | "The array has a contact. It is not a rock. It is not a colony ship. I need you to tell me what it is." | SENSOR LOG: shuttle adrift in the debris belt; faint life signs; no return thrust. | MIRA's calm voice breaks for the first time. |
| 7. Deflector | SHD-01–07 | NOR, mux, decoder, integration | "The ring is the last thing between us and the shuttle. After this, the uplink can reach them. Then the choice is yours." | COMMAND UPLINK // archive loaded; shuttle telemetry locked; colony channel open. | The final choice. |

### 7.5 Story delivery rules

- **Stage open:** one MIRA line, maximum two sentences. Shown in a compact companion strip. Does not block input.
- **Terminal first failure:** one MIRA line, terminal stages only. Circuit stages cannot reliably detect "failure," so they use open/completion beats instead.
- **Stage complete:** one short line, often a transition to the next system.
- **Chapter complete:** a recovered record opens in a compact modal with a Continue button. One modal per chapter, not per stage.
- **Deck screen:** a Ship's Log panel lists recovered records by chapter and shows the current objective. Unread records carry a marker.
- **Retries:** previously seen lines do not replay unless the player opens the log.
- **Skip:** the companion strip can be collapsed. The log remains available. Every shown beat is appended to the Ship's Log even when the strip is collapsed.

### 7.6 Final choice and endings

After SHD-07, the command uplink opens three choices. Each is a short epilogue, not a new puzzle.

1. **Signal the colony.**
   - Send the archive coordinates and the shuttle's position.
   - The colony recovers both. The Meridian is scuttled as a memorial.
   - MIRA: "They're coming. The shuttle will hold. Thank you for giving them a choice."
2. **Finish the delivery.**
   - Load the archive into the uplink and burn for Kepler-9.
   - The crew's sacrifice completes the mission; the Meridian does not come home.
   - MIRA: "The archive is away. The colony will live. We will not see it. I think that is what they wanted."
3. **Turn for home.**
   - Take the Meridian and the shuttle home, archive intact, colony still waiting.
   - A hopeful, uncertain ending.
   - MIRA: "Home is a long way. But the archive is safe, and so are they. We can try."

The choice is persisted. The campaign remains complete regardless of the choice. The Ship's Log records the chosen ending and allows the player to revisit the epilogue text.

---

## 8. Educational design

### 8.1 Concept ladder

| Chapter | Circuit learning | Firmware transfer | Course concept |
|---|---|---|---|
| Life Support | Gate truth tables; AND + NOT composition | Bitwise AND; preserving an input register | Boolean algebra; combinational logic |
| Navigation | OR and priority gating | OR then AND with an enable mask | Boolean composition; masking |
| Comms | Inversion; NAND as AND + NOT | NOT; NAND; leaving inputs intact | Universal gates; De Morgan intuition |
| Core Memory | Edge-triggered state; shift register | Load/mask/store; byte split across memory | Sequential logic; memory addressing |
| Power | 3-input gates; full adder; ripple carry | 3-way OR; 3-way AND; arithmetic constraints | Binary arithmetic; carry chains |
| Sensors | Difference vs. match; 2-bit compare; parity | XOR; XNOR; bitwise comparison | Comparators; parity; error detection |
| Shields | NOR; multiplexer; decoder; mux tree | Branching; select; integrated capstone | Routing; control; system integration |

### 8.2 Puzzle shape

Every stage follows four beats:

1. **Symptom:** the ship behaves wrongly.
2. **Diagnosis:** MIRA describes the observation, not the part.
3. **Build:** the player chooses a circuit or program.
4. **Proof:** the truth table, trace, or test cases show why it works.

Early tutorials may name the part because the player is learning the interface. After Chapter 1, the brief names the behavior, not the solution. The behavior-based goal remains the judge.

Firmware is not exempt from this. At least six terminal tasks require a second output, a boundary/invalid-input case, or a preserved intermediate. Hiding the walkthrough is not the difficulty; the visible contract and tests enforce the extra requirement.

### 8.3 Hint and walkthrough policy

- **First hint:** conceptual, in MIRA's voice. It points at the relevant idea without naming the fix.
- **Second hint:** exact, available after another failed run. This is the current task `hint` text.
- **Walkthrough:** hidden by default. It appears under a disclosure after the first failed run. The terminal's normal contract and test cases remain visible; those are the specification, not the answer.
- **No `; FIX:` comments** in starter code. The comments should describe the symptom or the image's intent, never the fix.

### 8.4 Difficulty curve

- Chapter 1 teaches the interface with guided steps.
- Chapters 2–3 teach diagnosis with a broken circuit and a clear goal.
- Chapter 4 introduces state and timing.
- Chapter 5 is the arithmetic spike; it needs the strongest hints.
- Chapter 6 rewards composition and pattern recognition.
- Chapter 7 is integration; it should feel like a final exam, not a new concept.

Target: median completion in 4–6 hours. No stage should require more than two hints for a median student.

---

## 9. Stage-by-stage audit

The table covers all **37 stages** in campaign order. "Keep" means no structural rewrite; it still receives story beats, hint policy, and copy review. "Revise" means a design change to the brief, start state, palette, or steps.

| # | Stage | Current puzzle | Learning target | Story use | Change |
|---|---|---|---|---|---|
| 1 | LSS-01 Relay interlock (`intro-and`) | Guided AND: place, wire a/b, wire y, switch both on | AND truth table; interface | Waking; first evacuation clue | Compress four steps to three meaningful steps; keep guided. |
| 2 | LSS-02 Return feed (`intro-or`) | Guided OR: place, wire a/b, wire y, one input on | OR; contrast with AND | Return feed; first hint the crew left | Compress; keep guided. |
| 3 | LSS-03 Fault inverter (`intro-not`) | Guided NOT: place, wire, prove both states | Inversion | Fault inverter; MIRA has been alone 412 days | Compress; keep guided. |
| 4 | LSS-04 Interlock firmware (`lss-01`) | Fix `mov ax, bx` to AND; preserve bx | Bitwise AND; register preservation | First black-box signal; the record arrives at chapter end | Add `[0x40]` latch mirror; remove `FIX`; hide walkthrough; add first-failure line. |
| 5 | LSS-05 Pressure window (`logic-and-window`) | Guided AND + NOT with NOT prewired; add AND | Composition; inverted veto | Pressure window; MIRA kept the bay warm | Keep. This is the bridge from tutorial to puzzle. |
| 6 | LSS-06 Window firmware (`lss-02`) | Fix scratch-register AND-NOT image | Preserving an input while computing | Chapter log: evacuation order | Remove `FIX`; hide walkthrough; chapter-end record. |
| 7 | NAV-01 Gyro bus (`logic-or`) | Start with miswired AND; goal OR | Diagnosing OR from a symptom | Helm sees only one gyro; course change | Remove "rebuild with OR" from brief; describe the drift; keep goal. |
| 8 | NAV-02 Gyro firmware (`nav-01`) | Fix `mov ax, bx` to OR; preserve bx | Bitwise OR | MIRA says the course was not hers | Add `dx` overlap telemetry; remove `FIX`; hide walkthrough. |
| 9 | NAV-03 Priority merger (`logic-or-priority`) | OR merge is wired; add enable AND | Priority gating | Helm veto; crew course | Keep; reword to symptom-first. |
| 10 | NAV-04 Priority firmware (`nav-02`) | Add missing enable AND | OR + AND composition | Chapter log: navigation record | Remove `FIX`; hide walkthrough. |
| 11 | COM-01 Carrier inverse (`logic-not`) | Start with buffer; goal NOT | Inversion | Distress burst under static | Remove "turn it into an inverter"; describe the stuck carrier; keep goal. |
| 12 | COM-02 Inverse firmware (`com-01`) | Fix `inc ax` to NOT | Bitwise NOT | Signal locked on | Remove `FIX`; hide walkthrough. |
| 13 | COM-03 NAND interlock (`logic-not-nand`) | AND is wired; add NOT | NAND | Carrier and lockdown | Remove "add the missing inversion" from brief; describe the veto symptom. |
| 14 | COM-04 NAND firmware (`com-02`) | Add missing NOT after AND | NAND | Chapter log: seed archive manifest | Add raw AND shadow in `dx`; remove `FIX`; hide walkthrough. |
| 15 | MEM-01 Boot latch (`memory-d-flip-flop`) | Guided D flip-flop: place, wire d/clk/q, tick/hold/release | Edge-triggered state | Boot latch; crew manifest missing | Keep nine steps, but trim repeated wording; add first-failure line. |
| 16 | MEM-02 Latch firmware (`mem-01`) | Blank image: load, mask, store | Memory load/store; bit mask | MIRA avoids the word "crew" | Add dead-core flag at `[0x31]`; keep blank; add conceptual hint tier. |
| 17 | MEM-03 Shift cell (`memory-shift`) | Guided two-stage D flip-flop chain | Shift register; shared clock | Core memory; fragment of crew log | Keep; trim wording; preserve clock trace. |
| 18 | MEM-04 Byte split (`mem-02`) | Load only; split high/low bytes and store | Memory addressing; masking | Chapter log: crew left; MIRA stayed | Remove `FIX`; hide walkthrough. |
| 19 | PWR-01 Reactor feed (`logic-or3`) | Partial OR with A/B; goal three-way OR | 3-input OR | Reactor cold; colony deadline | Keep; symptom-first brief. |
| 20 | PWR-02 Feed firmware (`pwr-01`) | Add missing pump C OR | 3-way OR | MIRA counts the time | Add all-cold stall flag in `dx`; remove `FIX`; hide walkthrough. |
| 21 | PWR-03 Reactor interlock (`logic-and3`) | Partial AND with A/B; goal three-way AND | 3-input AND | Safeties must agree | Keep. |
| 22 | PWR-04 Interlock firmware (`pwr-02`) | Add missing safety C AND | 3-way AND | Reactor online | Remove `FIX`; hide walkthrough. |
| 23 | PWR-05 Carry cell (`logic-full-adder`) | Full adder prewired; only `cin` missing | Full adder; carry-in | Load-sense cell | **Revise:** start from a half-adder built from XOR/AND; palette includes XOR, AND, OR, full adder; require both sum and carry-out. |
| 24 | PWR-06 Two-bit total (`logic-adder2`) | Empty canvas; build ripple-carry adder | Ripple carry; multi-output truth table | Archive bay powered | Keep. This is a strong synthesis stage. |
| 25 | SNS-01 Echo contact (`logic-xor`) | Start with OR; goal XOR | Difference detection | Sensor contact | Keep; symptom-first brief. |
| 26 | SNS-02 Echo firmware (`sns-01`) | Fix AND to XOR | Bitwise XOR | Contact is not a rock | Remove `FIX`; hide walkthrough. |
| 27 | SNS-03 Phase lock (`logic-xnor`) | Start with XOR; goal XNOR | Match detection | Phase lock | Keep. |
| 28 | SNS-04 Phase firmware (`sns-02`) | Add NOT after XOR | XNOR | Signal repeats | Add XOR difference shadow in `dx`; remove `FIX`; hide walkthrough. |
| 29 | SNS-05 Contact code (`logic-compare2`) | One XOR wrong in a prewired 2-bit comparator | 2-bit comparison | Transponder code | Keep; make the faulty column discoverable by trace, not prose. |
| 30 | SNS-06 Parity filter (`logic-parity4`) | Empty canvas; build 4-input parity | Parity; XOR tree | Chapter log: crew shuttle stranded | Keep. Strong empty-canvas puzzle. |
| 31 | SHD-01 Hazard veto (`logic-nor`) | Start with OR; goal NOR | NOR | Debris field | Keep; symptom-first brief. |
| 32 | SHD-02 Hazard firmware (`shd-01`) | Add NOT after OR | NOR | Shields | Remove `FIX`; hide walkthrough. |
| 33 | SHD-03 Shield router (`logic-mux`) | Mux prewired except select | Multiplexer; select | Route to the shuttle | Reword: remove "select line is dangling"; make the stuck-A symptom the clue. |
| 34 | SHD-04 Router firmware (`shd-02`) | Always routes B; add compare/branch | Branching; select | MIRA asks about the crew | Add invalid-select rejection in `dx`; remove `FIX`; hide walkthrough. |
| 35 | SHD-05 Quadrant decoder (`logic-decoder2to4`) | q0/q1 wired; q2/q3 missing | 2-to-4 decoder; one-hot | Four quadrants | Keep; symptom-first brief. |
| 36 | SHD-06 Quadrant router (`logic-mux4`) | Empty canvas; build 4:1 mux tree | Mux tree; select codes | Path through debris | Keep. |
| 37 | SHD-07 Command uplink (`logic-command-uplink`) | Empty canvas; combine adder, parity, mux, carry veto | System integration | Final choice | Keep; add EndingOverlay and final choice. |

### 9.1 Stage revision summary

**Puzzle revisions (7):**

1. LSS-01 — compress guided steps.
2. LSS-02 — compress guided steps.
3. LSS-03 — compress guided steps.
4. NAV-01 — symptom-first diagnosis; no named gate in the brief.
5. COM-01 — symptom-first diagnosis; no named gate in the brief.
6. COM-03 — symptom-first diagnosis; no named missing inverter.
7. PWR-05 — replace the prewired full adder with a half-adder that must grow a carry path.

**Firmware second-requirement revisions (7):** `lss-01`, `nav-01`, `com-02`, `mem-01`, `pwr-01`, `sns-02`, and `shd-02` — see §10.1.

**Exact circuit revision sheets:** NAV-01, COM-01, COM-03, SHD-03, and PWR-05 are specified in §9.2, including start chains, palette arrays, and step copy.

**Copy and policy revisions (all stages):**

- Add MIRA stage-open and stage-complete beats.
- Remove `; FIX:` comments from every starter.
- Hide terminal walkthroughs behind the first-failure disclosure.
- Add chapter-end records and the Ship's Log.
- Add the final choice and ending overlay.

### 9.2 Exact circuit revision sheets

These five sections keep their ids, `mode: 'puzzle'`, ports, goals, and behavior checks. Do not switch them to tutorial mode. In puzzle mode the player sees `summary`, `objective`, and the expected-case table; `steps` are source-only and do not gate completion. Keep `goal` as the only completion check.

In the current UI, `components` is a preferred-order list for puzzle sections, not a whitelist. `PUZZLE_PALETTE` remains the availability set. These sheets specify the exact array edits; no palette-filtering UI change is part of this revision.

| Section | Before `components` | After `components` |
|---|---|---|
| NAV-01 (`logic-or`) | `['or']` | `['or', 'and']` |
| COM-01 (`logic-not`) | `['not']` | `['not', 'buffer']` |
| COM-03 (`logic-not-nand`) | `['and', 'not']` | `['not', 'and']` |
| SHD-03 (`logic-mux`) | `['mux2']` | `['mux2']` |
| PWR-05 (`logic-full-adder`) | `['full-adder']` | `['xor', 'and', 'or', 'full-adder']` |

For NAV-01, COM-01, COM-03, and SHD-03, retain the existing `done` predicate for each step id that already exists. For PWR-05, leave `done` unset on all six steps: the goal accepts both the gate-built full adder and the `full-adder` part, so a part-specific predicate would reject a valid solution. Completion is `goal` for all five sections.

This also removes now-unused predicate imports from `muxRouter.ts` (`placed`, `outputDriven`) and all predicate imports from `fullAdder.ts` (`allOf`, `inputHigh`, `inputLow`, `outputDriven`, `outputHigh`, `outputLow`, `portDriven`). Keep `portDriven` in `muxRouter.ts` for `drive-sel`, and keep `target` in both files.

#### 9.2.1 NAV-01 — `logic-or`

File: `src/tutorial/sections/orGate.ts`

**Start state:** before = after; no structural edit. The exact chain below is both the current start and the implementation target.

```ts
start: environment()
  .input('a')
  .input('b')
  .output('y')
  .place('and', { as: 'wrong', x: 300, y: 120 })
  .wire('in:a', 'wrong.a')
  .wire('in:b', 'wrong.b')
  .wire('wrong.y', 'out:y')
  .build(),
```

**Visible copy**

- `title: 'Gyro bus'`
- `summary: 'The helm only answers when both gyro buses are live. Restore a rule that tolerates either bus.'`
- `objective: 'y is high when either gyro bus is high; low only when both are low.'`

**Step copy**

| id | title | body | hint | target |
|---|---|---|---|---|
| `place-or` | Restore either-bus steering | The helm is only answering when both gyro buses agree. Remove the gate that requires agreement and give the bus a rule that stays live when either input is live. | — | `palette:or` |
| `drive-a` | Feed the first gyro | Connect bus a to one input of the replacement gate. | — | `canvas` |
| `drive-b` | Feed the second gyro | Connect bus b to the other input. Either bus should be able to carry the helm alone. | — | `canvas` |
| `drive-y` | Restore the helm feed | Connect the replacement gate output to y. The old rule can stay on the bench; it must not drive the helm. | — | `canvas` |
| `one-is-enough` | Prove one bus is enough | Switch a on and leave b off. The helm should answer. Then try b alone; either bus should keep y live, and both off should drop it. | If y stays dark with one bus live, the old AND rule is still driving the output. | `canvas` |

#### 9.2.2 COM-01 — `logic-not`

File: `src/tutorial/sections/notGate.ts`

**Start state:** before = after; no structural edit. The exact chain below is both the current start and the implementation target.

```ts
start: environment()
  .input('a')
  .output('y')
  .place('buffer', { as: 'wrong', x: 300, y: 120 })
  .wire('in:a', 'wrong.a')
  .wire('wrong.y', 'out:y')
  .build(),
```

**Visible copy**

- `title: 'Carrier recovery'`
- `summary: 'The carrier is following the lockdown line instead of opposing it. The band cannot open while the lockdown is asserted.'`
- `objective: 'y is the opposite of a; high only when a is low.'`

**Step copy**

| id | title | body | hint | target |
|---|---|---|---|---|
| `place-not` | Restore the inversion | The carrier is following the lockdown instead of opposing it. Replace the pass-through stage with one that inverts it. | — | `palette:not` |
| `drive-a` | Feed the lockdown line | Connect a to the replacement gate input. | — | `canvas` |
| `drive-y` | Restore the carrier | Connect the replacement output to y. A low lockdown should produce a high carrier. | — | `canvas` |
| `invert-on` | Locked down | Switch a on. The carrier should stay dark because the lockdown is asserted. | That is the whole job of an inverter: the output is the opposite of the input. | `canvas` |
| `invert-off` | Band open | Switch a off. The carrier should go high. | — | `canvas` |

#### 9.2.3 COM-03 — `logic-not-nand`

File: `src/tutorial/sections/notNand.ts`

**Start state:** before = after; no structural edit. The exact chain below is both the current start and the implementation target.

```ts
start: environment()
  .input('a')
  .input('b')
  .output('y')
  .place('and', { as: 'mix', x: 300, y: 120 })
  .wire('in:a', 'mix.a')
  .wire('in:b', 'mix.b')
  .build(),
```

**Visible copy**

- `title: 'Carrier veto'`
- `summary: 'The carrier can be blocked only when both lines are asserted, but the veto is incomplete. Finish the interlock.'`
- `objective: 'y is low only when a and b are both high; high otherwise.'`

**Step copy**

| id | title | body | hint | target |
|---|---|---|---|---|
| `place-not` | Complete the veto | The carrier and lockdown are already combined. Add the stage that turns agreement into a block. | — | `palette:not` |
| `wire-and-to-not` | Invert the combined signal | Feed the combined signal into the inverter. | — | `canvas` |
| `wire-output` | Restore the interlock output | Connect the inverter output to y. The carrier should open unless both lines are asserted. | — | `canvas` |
| `single-assertion` | One assertion is survivable | Switch a on and leave b off. The carrier should stay open. | If b is already on, switch it off first. | `canvas` |
| `double-assertion` | Block the double assertion | Switch b on too. Both lines asserted should drop y. | — | `canvas` |
| `all-clear` | Return to all-clear | Switch both off. The carrier should open again. | — | `canvas` |

#### 9.2.4 SHD-03 — `logic-mux`

File: `src/tutorial/sections/muxRouter.ts`

**Start state:** before = after; no structural edit. The exact chain below is both the current start and the implementation target.

```ts
start: environment()
  .input('a')
  .input('b')
  .input('sel')
  .output('y')
  .place('mux2', { as: 'route', x: 300, y: 120 })
  .wire('in:a', 'route.a')
  .wire('in:b', 'route.b')
  .wire('route.y', 'out:y')
  .build(),
```

**Visible copy**

- `title: 'Shield router'`
- `summary: 'The deflector is stuck on shield bus A even when the select line changes. Restore the missing route to B.'`
- `objective: 'y follows bus A when sel is low; y follows bus B when sel is high.'`

**Step copy**

| id | title | body | hint | target |
|---|---|---|---|---|
| `drive-sel` | Restore the select path | The grid is stuck on bus A. The multiplexer already has both data buses and an output, but the control input is not connected. Wire sel into the select port. | — | `canvas` |
| `select-a` | Confirm bus A | Leave sel low and switch bus a on. The grid should take A. | — | `canvas` |
| `select-b` | Confirm bus B | Switch a off, b on, and sel high. The route should flip to B. | — | `canvas` |
| `select-blocks-a` | Prove the control line wins | Switch b off and a back on while sel stays high. A is live, but the grid should stay dark because sel still points at B. | That is the difference between a wire and a route: the select line decides which input gets through. | `canvas` |

#### 9.2.5 PWR-05 — `logic-full-adder`

File: `src/tutorial/sections/fullAdder.ts`

**Start state — before**

```ts
components: ['full-adder'],
start: environment()
  .input('a')
  .input('b')
  .input('cin')
  .output('sum')
  .output('cout')
  .place('full-adder', { as: 'add', x: 330, y: 120 })
  .wire('in:a', 'add.a')
  .wire('in:b', 'add.b')
  .wire('add.sum', 'out:sum')
  .wire('add.cout', 'out:cout')
  .build(),
```

**Start state — after**

```ts
components: ['xor', 'and', 'or', 'full-adder'],
start: environment()
  .input('a')
  .input('b')
  .input('cin')
  .output('sum')
  .output('cout')
  .place('xor', { as: 'half-sum', x: 300, y: 100 })
  .place('and', { as: 'half-carry', x: 300, y: 260 })
  .wire('in:a', 'half-sum.a')
  .wire('in:b', 'half-sum.b')
  .wire('in:a', 'half-carry.a')
  .wire('in:b', 'half-carry.b')
  .wire('half-sum.y', 'out:sum')
  .wire('half-carry.y', 'out:cout')
  .build(),
```

The after start is a half-adder: `sum = a XOR b`, `cout = a AND b`, and `cin` is present but unwired. The player must add the carry path. The `full-adder` part remains an accepted alternative solution; `half-adder` is not added to `PUZZLE_PALETTE`.

**Visible copy**

- `title: 'Reactor carry cell'`
- `summary: 'The cell adds the two coolant feeds but ignores the carry from the previous column. Extend the half-adder so three live inputs produce both sum and carry-out.'`
- `objective: 'sum = a XOR b XOR cin; cout = majority(a, b, cin)'`

**Step copy**

| id | title | body | hint | target |
|---|---|---|---|---|
| `place-adder` | Trace the half-adder | The cell already adds a and b into sum and carry. It has no path for cin, so it fails as soon as the previous column carries a 1. | — | `canvas` |
| `wire-feeds` | Check the half-adder feeds | The two coolant feeds already reach the first XOR and AND. Leave that half-adder in place; the missing input is cin. | — | `canvas` |
| `wire-carry-in` | Add the carry path | Bring cin into the sum path, and use it in the carry-out term. If you build from gates, the half-adder's XOR feeds a second XOR with cin, and its carry feeds an OR with cin AND that XOR. | — | `canvas` |
| `wire-total` | Expose sum and carry-out | Connect the full sum to sum and the combined carry to cout. The reactor bus reads both bits as one two-bit total. | — | `canvas` |
| `all-three-high` | Prove the carry chain | Switch a, b, and cin all high. One plus one plus one is 11 in binary, so both sum and cout must be high. | — | `canvas` |
| `carry-without-sum` | Keep the carry, drop the sum | Switch cin off while a and b stay high. The total is 10: sum goes dark and cout stays high. | — | `canvas` |

The six ids above are the current PWR-05 ids. Keep them; renaming or adding ids would make an already-completed save look incomplete because completion is derived from stored step ids.

---

## 10. Firmware task audit

All 14 terminal tasks stay. The learning target does not change. Seven tasks get a second requirement; the other seven are policy-only. The changes are to contracts, tests, comments, hint tiers, and walkthrough visibility.

| Task | Stage | Current starter bug | Learning target | Concept hint | Change |
|---|---|---|---|---|---|
| `lss-01` | LSS-04 | Copies B into ax | Bitwise AND; preserve bx | "Which bitwise operation keeps only bits set in both operands?" | Add `[0x40]` latch mirror; remove `FIX`; hide walkthrough; add first-failure line. |
| `lss-02` | LSS-06 | Overwrites bx | AND NOT; preserve input | "You need a copy of the fault mask. Which register can you borrow?" | Remove `FIX`; hide walkthrough. |
| `nav-01` | NAV-02 | Copies B into ax | Bitwise OR | "What operation turns either live input into a live output?" | Add `dx` overlap telemetry; remove `FIX`; hide walkthrough. |
| `nav-02` | NAV-04 | Missing enable mask | OR + AND | "The enable must clear the merged mask. Which operation applies a mask?" | Remove `FIX`; hide walkthrough. |
| `com-01` | COM-02 | Increments instead of inverting | Bitwise NOT | "Which instruction flips every bit instead of changing the value by one?" | Remove `FIX`; hide walkthrough. |
| `com-02` | COM-04 | Stops after AND | NAND | "The panel used two stages. Which instruction is the second stage?" | Add raw AND shadow in `dx`; remove `FIX`; hide walkthrough. |
| `mem-01` | MEM-02 | Blank image | Load/mask/store | "Which mask isolates bit 0, and which operand writes memory?" | Add dead-core flag at `[0x31]`; keep blank; add conceptual hint tier. |
| `mem-02` | MEM-04 | Loads but never splits/stores | Byte split | "You need two copies of the word. Which one holds the high byte at the end?" | Remove `FIX`; hide walkthrough. |
| `pwr-01` | PWR-02 | Missing pump C | 3-way OR | "Three inputs, one result: how do you extend the existing OR?" | Add all-cold stall flag in `dx`; remove `FIX`; hide walkthrough. |
| `pwr-02` | PWR-04 | Missing containment | 3-way AND | "Three safeties, one permit: how do you extend the existing AND?" | Remove `FIX`; hide walkthrough. |
| `sns-01` | SNS-02 | Uses AND | XOR | "Which operation is high only when the inputs differ?" | Remove `FIX`; hide walkthrough. |
| `sns-02` | SNS-04 | Uses XOR only | XNOR | "XOR gives differences. What turns differences into matches?" | Add XOR difference shadow in `dx`; remove `FIX`; hide walkthrough. |
| `shd-01` | SHD-02 | Uses OR only | NOR | "A hazard must veto the charge. What happens after OR?" | Remove `FIX`; hide walkthrough. |
| `shd-02` | SHD-04 | Always routes B | Branching/select | "Which flag does cmp set, and which jump tests it?" | Remove `FIX`; hide walkthrough. |

---

## 11. UI and systems design

### 11.1 Narrative data

Create a single source of truth for story content:

`src/game/narrative.ts`

```ts
type BeatTrigger = 'stage-open' | 'first-fail' | 'stage-complete' | 'chapter-complete'

interface StoryBeat {
  id: string
  stageId?: string
  chapterId: string
  trigger: BeatTrigger
  speaker: 'MIRA' | 'SYSTEM'
  text: string
  tone?: 'normal' | 'alert' | 'ok'
}

interface LogFragment {
  id: string
  chapterId: string
  title: string
  body: string
  recoveredAtStageId: string
}

interface Ending {
  id: 'signal-colony' | 'finish-delivery' | 'turn-home'
  title: string
  body: string
  finalLine: string
}
```

Chapter metadata also lives here: chapter number, title, system id, opening line, and record id. `ship.ts` remains the stage/system source of truth; narrative references stage ids but does not duplicate stage data.

### 11.2 Story persistence

Create `src/game/story.ts` with a versioned key:

`csc3501.story.v1`

```ts
interface StoryProgress {
  version: 1
  seenBeatIds: string[]
  recoveredLogIds: string[]
  ending: Ending['id'] | null
}
```

Rules:

- Missing or malformed storage returns empty progress.
- Unknown beat/log/ending ids are dropped on load.
- Existing `csc3501.campaign.v1` and `csc3501.tutorial.v1` are untouched.
- On first load after this change, recover logs for chapters whose stages are already complete. Do not force a replay.
- If a save has completed the capstone but has no ending, show the final choice once from the deck screen or the next launch.
- The ending can be changed only by replaying the final choice; the log keeps the current ending.

### 11.3 Components and flow

- **`Companion.tsx`:** use the existing compact strip in `LevelView`. Add a `visible`/collapsed state. The full panel remains available from the Ship's Log.
- **`LevelView.tsx`:** render the compact companion strip above the deck. On mount, enqueue the stage-open beat. On first terminal failure, enqueue the first-fail beat. On stage completion, enqueue the completion beat.
- **`Game.tsx`:** own `StoryProgress`; load/save it; detect chapter completion; open the recovered-record panel and final ending.
- **`LevelSelect.tsx`:** add a Ship's Log button/panel with two sections: recovered records and current objective. Show unread markers.
- **`TerminalConsole.tsx`:** hide the walkthrough by default. Show a "Walkthrough" disclosure after the first failed run. Use `conceptHint` first and the existing `hint` second.
- **`EndingOverlay.tsx`:** new component after SHD-07. Three choices, each with a short epilogue and a final MIRA line. Persist the choice.
- **`BootOverlay.tsx`:** add one short wake line; do not lengthen the boot sequence.
- **`WinOverlay.tsx`:** replace its campaign-complete role with the ending flow. Keep a simple "All systems online" state if needed.

### 11.4 Story trigger flow

1. Stage mounts.
2. If the stage is the first in its chapter, show the chapter opening line; otherwise show the stage-open line.
3. Terminal task fails for the first time: show the first-fail line.
4. Stage completes: show the stage-complete line.
5. If this was the last stage of a chapter: mark the record recovered and open the record panel.
6. If this was SHD-07: open the ending choice after the record/complete beat.
7. Mark every shown beat in `seenBeatIds` so retries do not repeat it.

### 11.5 Copy rules

- MIRA: precise, dry, never sarcastic. Short sentences. She uses system language when she is afraid.
- One thought per beat. No exposition dumps.
- The player is addressed as "you," not by a name. This keeps the role open.
- Records are written as ship documents, not as MIRA narration. They should feel found, not delivered.
- No line explains the puzzle solution. The hint tier does that when asked.

---

## 12. Testing and playtest

### Automated

- Keep all existing tests green.
- Add narrative data tests:
  - Every stage has at least one beat.
  - Every chapter has one opening line and one record.
  - No duplicate beat/log ids.
  - Every referenced stage/system/chapter exists.
  - Every ending has a title, body, and final line.
- Add story persistence tests:
  - Missing/malformed storage returns empty progress.
  - Seen beats and logs deduplicate.
  - Ending persists.
  - Old saves recover logs from completed stages.
- Add puzzle and firmware regression tests:
  - All 37 stages remain solvable.
  - PWR-05 accepts both the gate-built full adder and the full-adder part.
  - The seven second-requirement tasks fail the primary-only image on the named case in §10.1.
  - The hidden walkthrough does not affect `assemble` or `runCases`.
- Run `bun test`, `bun run build`, and `bun run lint`.

### Manual

- Play all 37 stages in order at least once.
- Check that every chapter opens and closes with the intended record.
- Check that no MIRA line blocks the canvas or terminal on a 1280×720 viewport.
- Check the final choice on a fresh save and on a save that already completed the campaign.
- Check that retries do not replay seen beats.

### Playtest

- 5 students from the target audience.
- 60–90 minute think-aloud sessions covering at least two chapters each.
- Record: time per stage, hint tier used, first-failure line reactions, ability to explain the concept, ability to retell the crew's fate.
- Success: 4 of 5 can explain the chapter concept; median stage uses no more than one hint; no stage exceeds two hints for a median player.
- Revise copy and hint tiers before changing puzzle difficulty.

---

## 13. Implementation sequence

1. **Narrative data and persistence.** Add `narrative.ts`, `story.ts`, and tests. No UI changes yet.
2. **Companion and stage beats.** Wire the compact strip, stage-open/completion beats, and first-fail beats for terminal tasks.
3. **Ship's Log and chapter records.** Add the deck-screen log and the one-per-chapter record panel.
4. **Terminal policy and second requirements.** Remove `FIX` comments, hide walkthroughs, add concept hints, implement the seven contracts and tests in §10.1, and verify all 14 tasks.
5. **Puzzle revisions.** Implement the five sheets in §9.2 exactly, starting with PWR-05; then compress LSS-01–03.
6. **Ending flow.** Add `EndingOverlay`, the three endings, and persistence.
7. **Full regression and playtest.** Run all tests, play all 37 stages, and tune hints/copy.

Do not combine steps 1–3 with puzzle rewrites. Keep the narrative layer independently testable.

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Story interrupts puzzle flow | One line per trigger; no per-click modals; collapse control. |
| MIRA feels manipulative rather than trustworthy | She never lies; withholding is motivated by fear and the crew's order. The log confirms her account. |
| Hiding walkthroughs frustrates players | Two-tier hints; exact hint after another failure; visible contract/tests. |
| Second requirements feel arbitrary | Tie each to a visible latch, telemetry output, or invalid-input case; state it in the contract and a named test. |
| Rewriting stages breaks existing behavior | Keep goals and existing tests; change start states and copy only where specified; add second-requirement tests without weakening current cases. |
| Save migration loses progress | New key only; derive recovered logs from existing progress; never rewrite campaign/tutorial keys. |
| Scope grows beyond the course project | All 37 stages stay; 7 circuit revisions and 7 firmware second requirements; no new mechanics or dependencies. |
| Story text becomes too large to maintain | Single `narrative.ts` data file; records and beats are data, not JSX. |
| Players skip the story and miss the ending | Final choice is explicit; log is always reachable; no gameplay is gated on reading. |

---

## 15. Assumptions and decisions

- The player is unnamed and has no voice. MIRA addresses them directly.
- The campaign remains linear. The only branch is the final choice.
- MIRA is text-only. No voice acting or portrait animation is in scope.
- The existing `logic-and` tutorial section remains in `TUTORIAL_SECTIONS` for tests/backward compatibility, even though it is not mapped to a campaign stage.
- The existing stage count and system order are preserved.
- The existing behavior-based circuit goals remain the source of truth. The 14 assembly contracts are extended only where §10.1 specifies; all other task tests stay unchanged.
- The Ship's Log is optional depth; no puzzle requires reading a record.
- `Kepler-9` is a fictional colony name and can be changed without affecting the design.

---

## 16. Definition of done

- The seven chapters and 37 stages are playable in order.
- Every stage has a story trigger and a learning target.
- Every chapter has an opening line, a recovered record, and a clear emotional turn.
- The seven circuit puzzle revisions are implemented and tested. The five §9.2 sheets match the specified start chains, palette arrays, and step copy.
- At least six terminal tasks require a second output, edge case, or composed sequence; each has a named test that fails the primary-only image. This spec sets seven.
- The 14 firmware tasks have no `FIX` comments, no default walkthrough, and two hint tiers.
- The Ship's Log and final choice persist across reloads.
- All existing tests pass; new narrative/persistence tests pass; `bun run build` and `bun run lint` pass.
- A 5-student playtest meets the comprehension and hint targets, or the remaining gaps are documented with a revision plan.
