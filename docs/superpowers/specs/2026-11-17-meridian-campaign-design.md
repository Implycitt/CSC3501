# Meridian — The Long Silence

**Campaign narrative and puzzle-redesign spec**

- Date: 2026-11-17
- Status: Approved design, pre-implementation
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

The educational goal is unchanged: reinforce digital logic, sequential circuits, binary arithmetic, memory, and basic assembly for computer-organization students. The design goal is to make every stage feel like a diagnosis with a story consequence rather than a recipe with a theme.

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
- **Firmware challenge:** several terminal starters contain a `; FIX:` comment that names the bug, and the walkthrough is visible before the player attempts the task.
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
| 4 | LSS-04 Interlock firmware (`lss-01`) | Fix `mov ax, bx` to AND; preserve bx | Bitwise AND; register preservation | First black-box signal; the record arrives at chapter end | Remove `FIX` comment; hide walkthrough; add first-failure line. |
| 5 | LSS-05 Pressure window (`logic-and-window`) | Guided AND + NOT with NOT prewired; add AND | Composition; inverted veto | Pressure window; MIRA kept the bay warm | Keep. This is the bridge from tutorial to puzzle. |
| 6 | LSS-06 Window firmware (`lss-02`) | Fix scratch-register AND-NOT image | Preserving an input while computing | Chapter log: evacuation order | Remove `FIX`; hide walkthrough; chapter-end record. |
| 7 | NAV-01 Gyro bus (`logic-or`) | Start with miswired AND; goal OR | Diagnosing OR from a symptom | Helm sees only one gyro; course change | Remove "rebuild with OR" from brief; describe the drift; keep goal. |
| 8 | NAV-02 Gyro firmware (`nav-01`) | Fix `mov ax, bx` to OR; preserve bx | Bitwise OR | MIRA says the course was not hers | Remove `FIX`; hide walkthrough. |
| 9 | NAV-03 Priority merger (`logic-or-priority`) | OR merge is wired; add enable AND | Priority gating | Helm veto; crew course | Keep; reword to symptom-first. |
| 10 | NAV-04 Priority firmware (`nav-02`) | Add missing enable AND | OR + AND composition | Chapter log: navigation record | Remove `FIX`; hide walkthrough. |
| 11 | COM-01 Carrier inverse (`logic-not`) | Start with buffer; goal NOT | Inversion | Distress burst under static | Remove "turn it into an inverter"; describe the stuck carrier; keep goal. |
| 12 | COM-02 Inverse firmware (`com-01`) | Fix `inc ax` to NOT | Bitwise NOT | Signal locked on | Remove `FIX`; hide walkthrough. |
| 13 | COM-03 NAND interlock (`logic-not-nand`) | AND is wired; add NOT | NAND | Carrier and lockdown | Remove "add the missing inversion" from brief; describe the veto symptom. |
| 14 | COM-04 NAND firmware (`com-02`) | Add missing NOT after AND | NAND | Chapter log: seed archive manifest | Remove `FIX`; hide walkthrough. |
| 15 | MEM-01 Boot latch (`memory-d-flip-flop`) | Guided D flip-flop: place, wire d/clk/q, tick/hold/release | Edge-triggered state | Boot latch; crew manifest missing | Keep nine steps, but trim repeated wording; add first-failure line. |
| 16 | MEM-02 Latch firmware (`mem-01`) | Blank image: load, mask, store | Memory load/store; bit mask | MIRA avoids the word "crew" | Keep; add conceptual hint tier. |
| 17 | MEM-03 Shift cell (`memory-shift`) | Guided two-stage D flip-flop chain | Shift register; shared clock | Core memory; fragment of crew log | Keep; trim wording; preserve clock trace. |
| 18 | MEM-04 Byte split (`mem-02`) | Load only; split high/low bytes and store | Memory addressing; masking | Chapter log: crew left; MIRA stayed | Remove `FIX`; hide walkthrough. |
| 19 | PWR-01 Reactor feed (`logic-or3`) | Partial OR with A/B; goal three-way OR | 3-input OR | Reactor cold; colony deadline | Keep; symptom-first brief. |
| 20 | PWR-02 Feed firmware (`pwr-01`) | Add missing pump C OR | 3-way OR | MIRA counts the time | Remove `FIX`; hide walkthrough. |
| 21 | PWR-03 Reactor interlock (`logic-and3`) | Partial AND with A/B; goal three-way AND | 3-input AND | Safeties must agree | Keep. |
| 22 | PWR-04 Interlock firmware (`pwr-02`) | Add missing safety C AND | 3-way AND | Reactor online | Remove `FIX`; hide walkthrough. |
| 23 | PWR-05 Carry cell (`logic-full-adder`) | Full adder prewired; only `cin` missing | Full adder; carry-in | Load-sense cell | **Revise:** start from a half-adder built from XOR/AND; palette includes XOR, AND, OR, full adder; require both sum and carry-out. |
| 24 | PWR-06 Two-bit total (`logic-adder2`) | Empty canvas; build ripple-carry adder | Ripple carry; multi-output truth table | Archive bay powered | Keep. This is a strong synthesis stage. |
| 25 | SNS-01 Echo contact (`logic-xor`) | Start with OR; goal XOR | Difference detection | Sensor contact | Keep; symptom-first brief. |
| 26 | SNS-02 Echo firmware (`sns-01`) | Fix AND to XOR | Bitwise XOR | Contact is not a rock | Remove `FIX`; hide walkthrough. |
| 27 | SNS-03 Phase lock (`logic-xnor`) | Start with XOR; goal XNOR | Match detection | Phase lock | Keep. |
| 28 | SNS-04 Phase firmware (`sns-02`) | Add NOT after XOR | XNOR | Signal repeats | Remove `FIX`; hide walkthrough. |
| 29 | SNS-05 Contact code (`logic-compare2`) | One XOR wrong in a prewired 2-bit comparator | 2-bit comparison | Transponder code | Keep; make the faulty column discoverable by trace, not prose. |
| 30 | SNS-06 Parity filter (`logic-parity4`) | Empty canvas; build 4-input parity | Parity; XOR tree | Chapter log: crew shuttle stranded | Keep. Strong empty-canvas puzzle. |
| 31 | SHD-01 Hazard veto (`logic-nor`) | Start with OR; goal NOR | NOR | Debris field | Keep; symptom-first brief. |
| 32 | SHD-02 Hazard firmware (`shd-01`) | Add NOT after OR | NOR | Shields | Remove `FIX`; hide walkthrough. |
| 33 | SHD-03 Shield router (`logic-mux`) | Mux prewired except select | Multiplexer; select | Route to the shuttle | Reword: remove "select line is dangling"; make the stuck-A symptom the clue. |
| 34 | SHD-04 Router firmware (`shd-02`) | Always routes B; add compare/branch | Branching; select | MIRA asks about the crew | Remove `FIX`; hide walkthrough. |
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

**Copy and policy revisions (all stages):**

- Add MIRA stage-open and stage-complete beats.
- Remove `; FIX:` comments from every starter.
- Hide terminal walkthroughs behind the first-failure disclosure.
- Add chapter-end records and the Ship's Log.
- Add the final choice and ending overlay.

---

## 10. Firmware task audit

All 14 terminal tasks stay. The learning target does not change. The changes are to comments, hint tiers, and walkthrough visibility.

| Task | Stage | Current starter bug | Learning target | Concept hint | Change |
|---|---|---|---|---|---|
| `lss-01` | LSS-04 | Copies B into ax | Bitwise AND; preserve bx | "Which bitwise operation keeps only bits set in both operands?" | Remove `FIX`; hide walkthrough; add first-failure line. |
| `lss-02` | LSS-06 | Overwrites bx | AND NOT; preserve input | "You need a copy of the fault mask. Which register can you borrow?" | Remove `FIX`; hide walkthrough. |
| `nav-01` | NAV-02 | Copies B into ax | Bitwise OR | "What operation turns either live input into a live output?" | Remove `FIX`; hide walkthrough. |
| `nav-02` | NAV-04 | Missing enable mask | OR + AND | "The enable must clear the merged mask. Which operation applies a mask?" | Remove `FIX`; hide walkthrough. |
| `com-01` | COM-02 | Increments instead of inverting | Bitwise NOT | "Which instruction flips every bit instead of changing the value by one?" | Remove `FIX`; hide walkthrough. |
| `com-02` | COM-04 | Stops after AND | NAND | "The panel used two stages. Which instruction is the second stage?" | Remove `FIX`; hide walkthrough. |
| `mem-01` | MEM-02 | Blank image | Load/mask/store | "Which mask isolates bit 0, and which operand writes memory?" | Keep blank; add conceptual hint tier. |
| `mem-02` | MEM-04 | Loads but never splits/stores | Byte split | "You need two copies of the word. Which one holds the high byte at the end?" | Remove `FIX`; hide walkthrough. |
| `pwr-01` | PWR-02 | Missing pump C | 3-way OR | "Three inputs, one result: how do you extend the existing OR?" | Remove `FIX`; hide walkthrough. |
| `pwr-02` | PWR-04 | Missing containment | 3-way AND | "Three safeties, one permit: how do you extend the existing AND?" | Remove `FIX`; hide walkthrough. |
| `sns-01` | SNS-02 | Uses AND | XOR | "Which operation is high only when the inputs differ?" | Remove `FIX`; hide walkthrough. |
| `sns-02` | SNS-04 | Uses XOR only | XNOR | "XOR gives differences. What turns differences into matches?" | Remove `FIX`; hide walkthrough. |
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
- Add puzzle regression tests:
  - All 37 stages remain solvable.
  - PWR-05 accepts both the gate-built full adder and the full-adder part.
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
4. **Terminal policy.** Remove `FIX` comments, hide walkthroughs, add concept hints, and verify all 14 tasks.
5. **Puzzle revisions.** Start with PWR-05, NAV-01, COM-01, and COM-03; then compress LSS-01–03.
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
| Rewriting stages breaks existing behavior | Keep goals and test cases; change start states and copy only where specified. |
| Save migration loses progress | New key only; derive recovered logs from existing progress; never rewrite campaign/tutorial keys. |
| Scope grows beyond the course project | All 37 stages stay; only 7 puzzle revisions; no new mechanics or dependencies. |
| Story text becomes too large to maintain | Single `narrative.ts` data file; records and beats are data, not JSX. |
| Players skip the story and miss the ending | Final choice is explicit; log is always reachable; no gameplay is gated on reading. |

---

## 15. Assumptions and decisions

- The player is unnamed and has no voice. MIRA addresses them directly.
- The campaign remains linear. The only branch is the final choice.
- MIRA is text-only. No voice acting or portrait animation is in scope.
- The existing `logic-and` tutorial section remains in `TUTORIAL_SECTIONS` for tests/backward compatibility, even though it is not mapped to a campaign stage.
- The existing stage count and system order are preserved.
- The existing behavior-based circuit goals and assembly test cases remain the source of truth.
- The Ship's Log is optional depth; no puzzle requires reading a record.
- `Kepler-9` is a fictional colony name and can be changed without affecting the design.

---

## 16. Definition of done

- The seven chapters and 37 stages are playable in order.
- Every stage has a story trigger and a learning target.
- Every chapter has an opening line, a recovered record, and a clear emotional turn.
- The seven puzzle revisions are implemented and tested.
- The 14 firmware tasks have no `FIX` comments, no default walkthrough, and two hint tiers.
- The Ship's Log and final choice persist across reloads.
- All existing tests pass; new narrative/persistence tests pass; `bun run build` and `bun run lint` pass.
- A 5-student playtest meets the comprehension and hint targets, or the remaining gaps are documented with a revision plan.
