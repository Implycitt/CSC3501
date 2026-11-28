# ISV MERIDIAN — Full Walkthrough

This covers every relay in the campaign, every firmware terminal, the seven story records, and the final choice. It also includes the one tutorial-only circuit bay that is not attached to a deck.

**Campaign:** 7 decks, 37 relays — 23 circuit bays and 14 firmware terminals. The campaign is linear by deck: finish a deck to unlock the next one, and finish each relay to unlock the next relay in that deck.

**Spoiler note:** story beats, records, and the three possible endings are discussed near the end.

---

## Bench and terminal basics

### Building a circuit

- The **Manual** button in the stage header opens the field manual. Use its **Code** tab for assembly and its **Circuits** tab for bench reference; a circuit bay opens directly to Circuits.
- Drag a part from the tray onto the board. In compact trays, the `+` button also places it.
- Wire by dragging from a source port to a sink port. Inputs and part outputs can feed several sinks; a sink accepts only one incoming wire.
- Connecting a new source to a sink replaces the old wire at that sink. That means you can usually leave a wrong starting gate in place: once its output no longer drives the final output, it is ignored by the checker.
- Select a part or wire to remove it. `Delete` removes the selected part; the Inspector also has **Remove part** and **Remove wire** buttons.
- Toggle normal inputs in the live signal strip, or by clicking the input node on the board.
- For clocked bays, press **tick** in the signal strip (the circular-arrow button) to advance one clock edge. The `clk` node is also a tick shortcut.
- Press **Submit** to check a puzzle bay against the whole truth table or clock trace. A rejected submission lists the failing cases under **Failed cases**, with the value your circuit produced.
- Bays autosave their circuit, input values, nets, and tick count. If you leave and come back, you resume where you stopped. Use the small **reset bay** control in the Inspector to clear that bay and start it over.

### Running firmware

- Open the terminal relay and replace the starter image with the code below.
- Press **Assemble & run**. Every case in the case list must show `PASS`. A correct image is accepted automatically.
- The emulator is 16-bit, and `mov` does not change flags. The comments and spacing in the code blocks are safe to paste, but the blocks intentionally contain only the final code.
- `hlt` is required so the program stops cleanly.

---

## Deck order at a glance

| Deck | Stages in order |
| --- | --- |
| 01 — LSS Life Support | LSS-01 Relay interlock → LSS-02 Return feed → LSS-03 Fault inverter → LSS-04 Interlock firmware → LSS-05 Pressure window → LSS-06 Window firmware |
| 02 — NAV Navigation | NAV-01 Gyro bus → NAV-02 Gyro firmware → NAV-03 Priority merger → NAV-04 Priority firmware |
| 03 — COM Comms | COM-01 Carrier inverse → COM-02 Inverse firmware → COM-03 NAND interlock → COM-04 NAND firmware |
| 04 — MEM Core Memory | MEM-01 Boot latch → MEM-02 Latch firmware → MEM-03 Shift cell → MEM-04 Byte split |
| 05 — PWR Auxiliary Power | PWR-01 Reactor feed → PWR-02 Feed firmware → PWR-03 Reactor interlock → PWR-04 Interlock firmware → PWR-05 Carry cell → PWR-06 Two-bit total |
| 06 — SNS Sensor Array | SNS-01 Echo contact → SNS-02 Echo firmware → SNS-03 Phase lock → SNS-04 Phase firmware → SNS-05 Contact code → SNS-06 Parity filter |
| 07 — SHD Deflector Grid | SHD-01 Hazard veto → SHD-02 Hazard firmware → SHD-03 Shield router → SHD-04 Router firmware → SHD-05 Quadrant decoder → SHD-06 Quadrant router → SHD-07 Command uplink |

Read each new record when it appears. The record for a deck is recovered on that deck’s final relay. All recovered records remain available from the **Ship’s Log** button in the deck header.

---

# DECK 01 — LIFE SUPPORT

## LSS-01 · Relay interlock

**Section:** `intro-and`  
**Goal:** `y = a AND b`

1. Drag an **AND** gate onto the empty bay.
2. Wire `a` to `AND.a`.
3. Wire `b` to `AND.b`.
4. Wire `AND.y` to `out y`.
5. Turn both `a` and `b` on. `y` should light.

This is the basic interlock: both relays must agree.

## LSS-02 · Return feed

**Section:** `intro-or`  
**Goal:** `y = a OR b`

1. Drag an **OR** gate onto the empty bay.
2. Wire `a` to `OR.a`.
3. Wire `b` to `OR.b`.
4. Wire `OR.y` to `out y`.
5. Turn `a` on and leave `b` off. `y` should light on one relay.

## LSS-03 · Fault inverter

**Section:** `intro-not`  
**Goal:** `y = NOT a`

1. Drag a **NOT** gate onto the empty bay.
2. Wire `a` to `NOT.a`.
3. Wire `NOT.y` to `out y`.
4. Turn `a` on: `y` should be dark.
5. Turn `a` off: `y` should light.

## LSS-04 · Interlock firmware

**Terminal task:** LSS-04 · `lss-01`  
**Work order:** `ax = relay A AND relay B; [0x40] = ax`

Replace the starter image with:

```asm
and ax, bx
mov [0x40], ax
hlt
```

Press **Assemble & run**. This keeps `bx` unchanged and mirrors the combined mask to `[0x40]`.

## LSS-05 · Pressure window

**Section:** `logic-and-window`  
**Goal:** `y = arm AND NOT fault`

The starting bay already has a NOT gate fed by `fault`. You only need to finish the interlock.

1. Drag an **AND** gate onto the bay.
2. Wire the existing NOT output (`NOT.y`) to `AND.b`.
3. Wire `arm` to `AND.a`.
4. Wire `AND.y` to `out y`.
5. Turn `arm` on and leave `fault` off. `y` should light.
6. Keep `arm` on and turn `fault` on. `y` should go dark.

## LSS-06 · Window firmware

**Terminal task:** LSS-06 · `lss-02`  
**Work order:** `ax = arm AND NOT fault`

```asm
mov cx, bx
not cx
and ax, cx
hlt
```

The copy into `cx` gives you a scratch register, so the fault mask in `bx` is preserved. Every case must pass before the relay completes.

---

# DECK 02 — NAVIGATION

## NAV-01 · Gyro bus

**Section:** `logic-or`  
**Goal:** `y = a OR b`

The bay starts with an AND gate, which is the wrong rule. You can leave it in place and simply replace its output wire.

1. Drag an **OR** gate onto the bay.
2. Wire `a` to `OR.a`.
3. Wire `b` to `OR.b`.
4. Wire `OR.y` to `out y`. This replaces the old AND-to-output wire.
5. Confirm that either input alone lights `y`.

If you prefer a clean board, select the old AND gate and press `Delete` before placing the OR.

## NAV-02 · Gyro firmware

**Terminal task:** NAV-02 · `nav-01`  
**Work order:** `ax = A OR B; dx = A AND B`

```asm
mov dx, ax
and dx, bx
or ax, bx
hlt
```

`dx` is built from the original `ax` before `ax` is changed, so it is the overlap mask. `bx` stays intact.

## NAV-03 · Priority merger

**Section:** `logic-or-priority`  
**Goal:** `y = (a OR b) AND enable`

The OR gate is already fed by both buses; its output is not connected yet.

1. Drag an **AND** gate onto the bay.
2. Wire `OR.y` to `AND.a`.
3. Wire `enable` to `AND.b`.
4. Wire `AND.y` to `out y`.
5. Check with `enable` off: `y` must stay dark even when a gyro bus is live.
6. Turn `enable` on: the merged bus should reach `y`.

## NAV-04 · Priority firmware

**Terminal task:** NAV-04 · `nav-02`  
**Work order:** `ax = (A OR B) AND enable`

```asm
or ax, bx
and ax, cx
hlt
```

The enable is a permission mask, so it is ANDed with the merged bus. `bx` and `cx` are untouched.

---

# DECK 03 — COMMS

## COM-01 · Carrier inverse

**Section:** `logic-not`  
**Goal:** `y = NOT a`

The bay starts with a buffer, which passes the signal through. Add the inverter and replace the buffer’s output wire.

1. Drag a **NOT** gate onto the bay.
2. Wire `a` to `NOT.a`.
3. Wire `NOT.y` to `out y`.
4. Confirm `a = 1` gives `y = 0`, and `a = 0` gives `y = 1`.

## COM-02 · Inverse firmware

**Terminal task:** COM-02 · `com-01`  
**Work order:** `ax = NOT lockdown`

```asm
not ax
hlt
```

The whole 16-bit mask is inverted in one instruction.

## COM-03 · NAND interlock

**Section:** `logic-not-nand`  
**Goal:** `y = NOT (a AND b)`

The starting AND gate is already fed by both inputs; its output is open.

1. Drag a **NOT** gate onto the bay.
2. Wire `AND.y` to `NOT.a`.
3. Wire `NOT.y` to `out y`.
4. Check that both inputs high gives `y = 0`; every other combination gives `y = 1`.

## COM-04 · NAND firmware

**Terminal task:** COM-04 · `com-02`  
**Work order:** `ax = NOT (carrier AND lockdown); dx = carrier AND lockdown`

```asm
mov dx, ax
and dx, bx
and ax, bx
not ax
hlt
```

`dx` preserves the raw overlap before `ax` is inverted. `bx` remains the lockdown mask.

---

# DECK 04 — CORE MEMORY

## MEM-01 · Boot latch

**Section:** `memory-d-flip-flop`  
**Goal:** capture `d` on a clock edge and hold `q` between edges.

1. Drag a **D Flip-Flop** onto the bay.
2. Wire `d` to `FF.d`.
3. Wire `clk` to `FF.clk`.
4. Wire `FF.q` to `out q`.
5. With `d` off, press **tick**. `q` stays dark.
6. Turn `d` on. `q` should not change yet.
7. Press **tick** again. `q` lights.
8. Turn `d` off without ticking. `q` stays lit: the bit is being held.
9. Press **tick** once more. `q` goes dark.

A D flip-flop is the one-bit memory cell for the rest of this deck.

## MEM-02 · Latch firmware

**Terminal task:** MEM-02 · `mem-01`  
**Work order:** `[0x30] = [0x20] AND 1; [0x31] = 0xFFFF only when [0x20] is zero`

```asm
mov ax, [0x20]
mov dx, ax
and ax, 1
mov [0x30], ax
cmp dx, 0
jne live
mov dx, 0xffff
mov [0x31], dx
hlt
live:
mov dx, 0
mov [0x31], dx
hlt
```

The copy in `dx` is tested before `ax` is masked, so the dead-core flag reflects the whole boot word, not just bit 0. `ax` is left holding the isolated bit.

## MEM-03 · Shift cell

**Section:** `memory-shift`  
**Goal:** two D flip-flops in a chain; `q0` is the first stage, `q1` is the second.

1. Drag two **D Flip-Flop** parts onto the bay. Put the first stage on the left and the second on the right.
2. Wire `d` to the first flip-flop’s `d`.
3. Wire the shared `clk` to both flip-flops’ `clk` inputs.
4. Wire the first flip-flop’s `q` to the second flip-flop’s `d`.
5. Wire the first flip-flop’s `q` to `out q0`.
6. Wire the second flip-flop’s `q` to `out q1`.
7. Turn `d` on. Nothing is captured yet.
8. Press **tick** once: `q0 = 1`, `q1 = 0`.
9. Press **tick** again: `q0 = 1`, `q1 = 1`.
10. Turn `d` off, then press **tick** once more: `q0 = 0`, `q1 = 1`.

The old bit moves one stage per edge while the new bit enters the first stage.

## MEM-04 · Byte split

**Terminal task:** MEM-04 · `mem-02`  
**Work order:** `[0x30] = low byte of [0x20]; [0x31] = high byte`

```asm
mov ax, [0x20]
mov bx, ax
and ax, 0xff00
mov [0x31], ax
and bx, 0x00ff
mov [0x30], bx
hlt
```

`ax` ends up holding the high byte, as required. The low byte is stored from `bx`.

---

# DECK 05 — AUXILIARY POWER

## PWR-01 · Reactor feed

**Section:** `logic-or3`  
**Goal:** `y = a OR b OR c`

The bay starts with a two-input OR, missing pump C.

1. Drag a **3-Input OR** onto the bay.
2. Wire `a` to `OR3.a`.
3. Wire `b` to `OR3.b`.
4. Wire `c` to `OR3.c`.
5. Wire `OR3.y` to `out y`.
6. Test each pump alone; any one should light the reactor feed.

## PWR-02 · Feed firmware

**Terminal task:** PWR-02 · `pwr-01`  
**Work order:** `ax = A OR B OR C; dx = 0xFFFF only when all pumps are cold`

```asm
or ax, bx
or ax, cx
mov dx, 0
cmp ax, 0
jne live
not dx
live:
hlt
```

`dx` is cleared for the live case. If the final OR result is zero, `not dx` turns the all-cold flag into `0xFFFF`. `bx` and `cx` are untouched.

## PWR-03 · Reactor interlock

**Section:** `logic-and3`  
**Goal:** `y = a AND b AND c`

The bay starts with a two-input AND, missing containment.

1. Drag a **3-Input AND** onto the bay.
2. Wire `a` to `AND3.a`.
3. Wire `b` to `AND3.b`.
4. Wire `c` to `AND3.c`.
5. Wire `AND3.y` to `out y`.
6. Confirm that all three inputs must be on for `y` to light.

## PWR-04 · Interlock firmware

**Terminal task:** PWR-04 · `pwr-02`  
**Work order:** `ax = pressure AND temperature AND containment`

```asm
and ax, bx
and ax, cx
hlt
```

One cold safety clears the permit. `bx` and `cx` remain available to the panel.

## PWR-05 · Carry cell

**Section:** `logic-full-adder`  
**Goal:** `sum = a XOR b XOR cin; cout = majority(a,b,cin)`

The starting half-adder has a XOR feeding `sum` and a AND feeding `cout`, but no `cin`.

1. Drag a **Full Adder** onto the bay.
2. Wire `a` to `FA.a`.
3. Wire `b` to `FA.b`.
4. Wire `cin` to `FA.cin`.
5. Wire `FA.sum` to `out sum`. This replaces the old XOR-to-sum wire.
6. Wire `FA.cout` to `out cout`. This replaces the old AND-to-cout wire.

You can leave the old half-adder parts in place; their outputs no longer drive the two output nodes. Test a few rows, especially `a=1, b=1, cin=0` (sum 0, carry 1) and `a=1, b=0, cin=1` (sum 0, carry 1).

## PWR-06 · Two-bit total

**Section:** `logic-adder2`  
**Goal:** add `a1 a0` + `b1 b0` + `cin`, exposing `s0`, `s1`, and `cout`.

1. Drag two **Full Adder** parts onto the bay. Put the low-column adder on the left and the high-column adder on the right.
2. Wire `a0` to the low adder’s `a`.
3. Wire `b0` to the low adder’s `b`.
4. Wire `cin` to the low adder’s `cin`.
5. Wire the low adder’s `sum` to `out s0`.
6. Wire `a1` to the high adder’s `a`.
7. Wire `b1` to the high adder’s `b`.
8. Wire the low adder’s `cout` to the high adder’s `cin`.
9. Wire the high adder’s `sum` to `out s1`.
10. Wire the high adder’s `cout` to `out cout`.

This is the same carry chain you will reuse in the command uplink.

---

# DECK 06 — SENSOR ARRAY

## SNS-01 · Echo contact

**Section:** `logic-xor`  
**Goal:** `y = a XOR b`

The starting OR flags matching pings, which is exactly wrong for a contact detector.

1. Drag an **XOR** gate onto the bay.
2. Wire `a` to `XOR.a`.
3. Wire `b` to `XOR.b`.
4. Wire `XOR.y` to `out y`. This replaces the old OR output wire.
5. Confirm that matching inputs give `y = 0`, and differing inputs give `y = 1`.

## SNS-02 · Echo firmware

**Terminal task:** SNS-02 · `sns-01`  
**Work order:** `ax = ping XOR echo`

```asm
xor ax, bx
hlt
```

Equal masks produce zero; differing bits raise the contact flag. `bx` is unchanged.

## SNS-03 · Phase lock

**Section:** `logic-xnor`  
**Goal:** `y = NOT (a XOR b)`

The starting XOR locks onto differences. Replace its rule with XNOR.

1. Drag an **XNOR** gate onto the bay.
2. Wire `a` to `XNOR.a`.
3. Wire `b` to `XNOR.b`.
4. Wire `XNOR.y` to `out y`. This replaces the old XOR output wire.
5. Confirm that matching inputs give `y = 1`, and differing inputs give `y = 0`.

## SNS-04 · Phase firmware

**Terminal task:** SNS-04 · `sns-02`  
**Work order:** `ax = NOT (A XOR B); dx = A XOR B`

```asm
mov dx, ax
xor dx, bx
xor ax, bx
not ax
hlt
```

`dx` is the raw difference shadow; `ax` is the final match mask. `bx` is preserved.

## SNS-05 · Contact code

**Section:** `logic-compare2`  
**Goal:** `match = (a1 XNOR b1) AND (a0 XNOR b0)`

The low-bit comparator is already XNOR, but the high-bit comparator is a XOR.

1. Drag an **XNOR** gate onto the bay.
2. Wire `a1` to the new XNOR’s `a`.
3. Wire `b1` to the new XNOR’s `b`.
4. Wire the new XNOR’s `y` to the AND gate’s upper input (`AND.a`).
5. Leave the existing low-bit XNOR feeding the lower input (`AND.b`).
6. Confirm that an exact code gives `match = 1`, and flipping either bit gives `match = 0`.

The new wire into `AND.a` replaces the old XOR-to-AND wire, so the old high-bit XOR is ignored.

## SNS-06 · Parity filter

**Section:** `logic-parity4`  
**Goal:** `y = a XOR b XOR c XOR d`

1. Drag three **XOR** gates onto the bay.
2. Wire `a` to XOR1’s `a`.
3. Wire `b` to XOR1’s `b`.
4. Wire `c` to XOR2’s `a`.
5. Wire `d` to XOR2’s `b`.
6. Wire XOR1’s `y` to XOR3’s `a`.
7. Wire XOR2’s `y` to XOR3’s `b`.
8. Wire XOR3’s `y` to `out y`.
9. Confirm that an odd number of live inputs lights `y`, and an even number leaves it dark.

---

# DECK 07 — DEFLECTOR GRID

## SHD-01 · Hazard veto

**Section:** `logic-nor`  
**Goal:** `y = NOT (a OR b)`

The starting OR warns of hazards but does not veto the charge.

1. Drag a **NOR** gate onto the bay.
2. Wire `a` to `NOR.a`.
3. Wire `b` to `NOR.b`.
4. Wire `NOR.y` to `out y`. This replaces the old OR output wire.
5. Confirm that both hazards clear gives `y = 1`, and either hazard gives `y = 0`.

## SHD-02 · Hazard firmware

**Terminal task:** SHD-02 · `shd-01`  
**Work order:** `ax = NOT (hazard A OR hazard B)`

```asm
or ax, bx
not ax
hlt
```

The merged hazard mask is inverted to produce the all-clear mask. `bx` is preserved.

## SHD-03 · Shield router

**Section:** `logic-mux`  
**Goal:** `y = a when sel = 0; y = b when sel = 1`

The multiplexer already has both data buses and the output. Only the select path is missing.

1. Wire `sel` to `MUX.sel`.
2. With `sel = 0` and `a = 1`, `y` should follow A.
3. With `sel = 1` and `b = 1`, `y` should follow B.
4. Confirm that the data input not selected is ignored.

## SHD-04 · Router firmware

**Terminal task:** SHD-04 · `shd-02`  
**Work order:** select `0` routes A, select `1` routes B; invalid select routes A and sets `dx = 0xFFFF`

```asm
cmp cx, 1
ja invalid
jb routeA
mov ax, bx
mov dx, 0
jmp done
routeA:
mov dx, 0
jmp done
invalid:
mov dx, 0xffff
done:
hlt
```

For `cx = 0`, `jb routeA` takes the A path. For `cx = 1`, neither branch is taken, so the image copies B and clears `dx`. Any value above 1 jumps to `invalid`, leaves `ax` on A, and sets the flag.

## SHD-05 · Quadrant decoder

**Section:** `logic-decoder2to4`  
**Goal:** exactly one of `q0`–`q3` follows each `s1 s0` code.

The decoder is already wired for the low two quadrants.

1. Wire `decoder.y2` to `out q2`.
2. Wire `decoder.y3` to `out q3`.
3. Check the four select codes; only the selected quadrant should be live.

Keep the existing select wiring: `s1` goes to decoder input `b` (the high bit), and `s0` goes to input `a` (the low bit).

## SHD-06 · Quadrant router

**Section:** `logic-mux4`  
**Goal:** route `a`, `b`, `c`, `d` according to `s1 s0`.

1. Drag three **2:1 Multiplexer** parts onto the bay: `M0` for A/B, `M1` for C/D, and `M2` for the final pair.
2. Wire `a` to `M0.a`.
3. Wire `b` to `M0.b`.
4. Wire `c` to `M1.a`.
5. Wire `d` to `M1.b`.
6. Wire `s0` to both `M0.sel` and `M1.sel`.
7. Wire `M0.y` to `M2.a`.
8. Wire `M1.y` to `M2.b`.
9. Wire `s1` to `M2.sel`.
10. Wire `M2.y` to `out y`.

Selection order is `s1 s0`: `00 = a`, `01 = b`, `10 = c`, `11 = d`.

## SHD-07 · Command uplink

**Section:** `logic-command-uplink`  
**Goal:** `y = oddParity(a1,a0,b1,b0) AND feed[s1 s0] AND NOT cout`, where `s1 s0` is the sum of the two 2-bit words plus `cin`.

This is the final circuit. Build it in four groups. The two full adders produce the sum bits; three XORs produce parity; three 2:1 muxes build the 4:1 router; a NOT and a 3-input AND combine the three permissions.

### Parts to place

- Two **Full Adder** parts: **FA-low** (left) and **FA-high** (right).
- Three **XOR** gates: **P1**, **P2**, **P3**.
- Three **2:1 Multiplexer** parts: **M0**, **M1**, **M2**.
- One **NOT** gate.
- One **3-Input AND** gate.

### 1. Two-bit adder

Wire the low adder:

- `a0` → `FA-low.a`
- `b0` → `FA-low.b`
- `cin` → `FA-low.cin`

Wire the high adder:

- `a1` → `FA-high.a`
- `b1` → `FA-high.b`
- `FA-low.cout` → `FA-high.cin`

The sum outputs are internal:

- `FA-low.sum` is **s0**.
- `FA-high.sum` is **s1**.

Do not wire the sum outputs to the final `y`; they are select signals.

### 2. Parity tree

- `a1` → `P1.a`
- `b1` → `P1.b`
- `a0` → `P2.a`
- `b0` → `P2.b`
- `P1.y` → `P3.a`
- `P2.y` → `P3.b`

`P3.y` is high only when an odd number of the four alignment feeds are live.

### 3. 4:1 feed router

- `a1` → `M0.a`
- `a0` → `M0.b`
- `b1` → `M1.a`
- `b0` → `M1.b`
- `FA-low.sum` → both `M0.sel` and `M1.sel`
- `M0.y` → `M2.a`
- `M1.y` → `M2.b`
- `FA-high.sum` → `M2.sel`

This gives the required feed order:

| `s1 s0` | Routed feed |
| --- | --- |
| 00 | `a1` |
| 01 | `a0` |
| 10 | `b1` |
| 11 | `b0` |

### 4. Final interlock

- `FA-high.cout` → `NOT.a`
- `NOT.y` → `AND3.c`
- `P3.y` → `AND3.a`
- `M2.y` → `AND3.b`
- `AND3.y` → `out y`

The 3-input AND now requires all three conditions: odd parity, a live routed feed, and no carry-out. The checker tests all 32 input combinations automatically.

---

# Story records and all three endings

## Records

Each deck recovers one record when its final relay is completed. The record overlay appears immediately; read it and close it to add it to the Ship’s Log.

| Record | Deck | Recovered after |
| --- | --- | --- |
| EVACUATION ORDER | LSS 01 | LSS-06 Window firmware |
| NAVIGATION LOG | NAV 02 | NAV-04 Priority firmware |
| CARGO MANIFEST | COM 03 | COM-04 NAND firmware |
| CREW LOG | MEM 04 | MEM-04 Byte split |
| COLONY RELAY | PWR 05 | PWR-06 Two-bit total |
| SENSOR LOG | SNS 06 | SNS-06 Parity filter |
| COMMAND UPLINK | SHD 07 | SHD-07 Command uplink |

The deck-completion MIRA lines are separate from the records. They play when the final relay of a deck is repaired, so don’t skip the record/turn overlay if you want the full story.

## The final choice

When all seven systems are online, close the final record and the Command Uplink opens the final authority screen. There are three possible commands:

1. **SIGNAL THE COLONY** — send the archive coordinates and the shuttle’s position.
2. **FINISH THE DELIVERY** — load the archive and burn for Kepler-9.
3. **TURN FOR HOME** — turn the Meridian home with the archive intact.

Select one to read its full text, then press **Commit command**. The game records one ending per save, and the committed ending remains readable from the Ship’s Log. If you want to see multiple endings, keep a separate browser profile or back up the story save before committing; the game does not present the other two commands again on that save.

## Optional extra story line

A few firmware relays have a unique MIRA line on the first failed image. You do not need to fail on purpose to finish the game. If you want every transmission, submit one deliberately incomplete image before the correct solution, then read the alert line when it appears.

---

# Appendix — tutorial-only bay

This section is in the tutorial catalogue but is not attached to a campaign deck. It teaches the same gate as the opening LSS relay with a little more explanation.

## `logic-and` — AND gate

1. Drag an **AND** gate onto the empty bay.
2. Wire `a` to `AND.a`.
3. Wire `b` to `AND.b`.
4. Wire `AND.y` to `out y`.
5. Turn both inputs on; `y` should light.

---

# Quick reference — all firmware images

```asm
; LSS-04
and ax, bx
mov [0x40], ax
hlt

; LSS-06
mov cx, bx
not cx
and ax, cx
hlt

; NAV-02
mov dx, ax
and dx, bx
or ax, bx
hlt

; NAV-04
or ax, bx
and ax, cx
hlt

; COM-02
not ax
hlt

; COM-04
mov dx, ax
and dx, bx
and ax, bx
not ax
hlt

; MEM-02
mov ax, [0x20]
mov dx, ax
and ax, 1
mov [0x30], ax
cmp dx, 0
jne live
mov dx, 0xffff
mov [0x31], dx
hlt
live:
mov dx, 0
mov [0x31], dx
hlt

; MEM-04
mov ax, [0x20]
mov bx, ax
and ax, 0xff00
mov [0x31], ax
and bx, 0x00ff
mov [0x30], bx
hlt

; PWR-02
or ax, bx
or ax, cx
mov dx, 0
cmp ax, 0
jne live
not dx
live:
hlt

; PWR-04
and ax, bx
and ax, cx
hlt

; SNS-02
xor ax, bx
hlt

; SNS-04
mov dx, ax
xor dx, bx
xor ax, bx
not ax
hlt

; SHD-02
or ax, bx
not ax
hlt

; SHD-04
cmp cx, 1
ja invalid
jb routeA
mov ax, bx
mov dx, 0
jmp done
routeA:
mov dx, 0
jmp done
invalid:
mov dx, 0xffff
done:
hlt
```
