import { useEffect, useRef, useState } from 'react'
import ComponentDoc from '../ui/ComponentDoc.tsx'
import PartsReference from './PartsReference.tsx'

export type ManualTab = 'code' | 'circuits'

interface FieldManualProps {
  onClose: () => void
  initialTab: ManualTab
  initialSection?: string
}

type CodePage = 'basics' | 'operands' | 'syntax' | 'instructions' | 'jumps' | 'examples' | 'errors'
type CircuitPage = 'bench' | 'order' | 'gates' | 'blocks' | 'fixes'
type ManualPage = CodePage | CircuitPage | 'parts'

interface ManualPageDef {
  id: ManualPage
  group: string
  label: string
  title: string
  summary: string
}

const PAGE_GROUPS: { label: string; pages: ManualPageDef[] }[] = [
  {
    label: 'Reference',
    pages: [
      {
        id: 'parts',
        group: 'Ship library',
        label: 'Component reference',
        title: 'Component reference',
        summary: 'Every part, its behavior, and its ports. Search by name or function and open a part for its full truth table.',
      },
    ],
  },
  {
    label: 'Assembly',
    pages: [
      {
        id: 'basics',
        group: 'Assembly',
        label: 'Quick start',
        title: 'Run and check an image',
        summary: 'The firmware loop: replace the broken instruction, run every case, and reset if the image drifts.',
      },
      {
        id: 'operands',
        group: 'Assembly',
        label: 'Operands',
        title: 'Operands and memory',
        summary: 'What an instruction can read or write, and the addressing rules the assembler enforces.',
      },
      {
        id: 'syntax',
        group: 'Assembly',
        label: 'Syntax',
        title: 'Syntax and literals',
        summary: 'Line format, labels, comments, and the number formats accepted in an image.',
      },
      {
        id: 'instructions',
        group: 'Assembly',
        label: 'Instruction set',
        title: 'Instruction set',
        summary: 'Every opcode the terminal assembler accepts, with its effect on flags and registers.',
      },
      {
        id: 'jumps',
        group: 'Assembly',
        label: 'Jumps',
        title: 'Conditional jumps',
        summary: 'Which flag each branch tests, and how signed and unsigned comparisons differ.',
      },
      {
        id: 'examples',
        group: 'Assembly',
        label: 'Examples',
        title: 'Worked examples',
        summary: 'Small, complete images you can adapt when an instruction combination is not obvious.',
      },
      {
        id: 'errors',
        group: 'Assembly',
        label: 'Errors',
        title: 'Common errors',
        summary: 'The assembler messages you are most likely to hit and the rule behind each one.',
      },
    ],
  },
  {
    label: 'Circuit bench',
    pages: [
      {
        id: 'bench',
        group: 'Circuit bench',
        label: 'Bench basics',
        title: 'Build and wire a circuit',
        summary: 'Place parts, route signals, move things, and submit a bay for checking.',
      },
      {
        id: 'order',
        group: 'Circuit bench',
        label: 'Work order',
        title: 'Read the work order',
        summary: 'How the goal, expected tests, and clock traces describe the behavior a bay must match.',
      },
      {
        id: 'gates',
        group: 'Circuit bench',
        label: 'Gates',
        title: 'Gate behavior',
        summary: 'The core logic gates and the quickest way to distinguish them.',
      },
      {
        id: 'blocks',
        group: 'Circuit bench',
        label: 'Blocks',
        title: 'Reusable blocks',
        summary: 'Adders, multiplexers, decoders, and flip-flops: what each block gives you.',
      },
      {
        id: 'fixes',
        group: 'Circuit bench',
        label: 'Fixes',
        title: 'Troubleshooting',
        summary: 'Fast checks for a dark output, a stale wire, or a circuit that behaves at the wrong time.',
      },
    ],
  },
]

const ALL_PAGES = PAGE_GROUPS.flatMap((group) => group.pages)
const PAGE_BY_ID = Object.fromEntries(ALL_PAGES.map((page) => [page.id, page])) as Record<ManualPage, ManualPageDef>

const CODE_SECTION_PAGE: Record<string, CodePage> = {
  'code-case': 'basics',
  'code-operands': 'operands',
  'code-syntax': 'syntax',
  'code-instructions': 'instructions',
  'code-jumps': 'jumps',
  'code-examples': 'examples',
  'code-errors': 'errors',
}

const CIRCUIT_SECTION_PAGE: Record<string, CircuitPage> = {
  'circuit-bench': 'bench',
  'circuit-order': 'order',
  'circuit-gates': 'gates',
  'circuit-blocks': 'blocks',
  'circuit-fixes': 'fixes',
}

const navGroupId = (label: string) => `manual-nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

function initialPage(tab: ManualTab, section?: string): ManualPage {
  if (section) {
    const codePage = CODE_SECTION_PAGE[section]
    if (codePage) return codePage
    const circuitPage = CIRCUIT_SECTION_PAGE[section]
    if (circuitPage) return circuitPage
  }

  return tab === 'circuits' ? 'bench' : 'basics'
}

const INSTRUCTIONS = [
  {
    op: 'mov dst, src',
    text: 'Copy a register, immediate, or [memory] word. Flags do not change.',
  },
  {
    op: 'and / or / xor dst, src',
    text: 'Bitwise logic between 16-bit words. Zero and sign update; carry and overflow clear.',
  },
  {
    op: 'not dst',
    text: 'Invert every bit of a register or memory word. Flags do not change.',
  },
  {
    op: 'add / sub dst, src',
    text: '16-bit arithmetic. Values wrap at 0xFFFF; zero, sign, carry, and overflow update.',
  },
  {
    op: 'inc / dec dst',
    text: 'Add or subtract one. Zero, sign, and overflow update; carry is preserved.',
  },
  {
    op: 'cmp left, right',
    text: 'Subtract right from left without storing. Only flags change.',
  },
  {
    op: 'jmp / je / jne / jz / jnz label',
    text: 'Jump unconditionally or from the zero flag. Labels may appear before or after the jump.',
  },
  {
    op: 'jl / jle / jg / jge label',
    text: 'Signed comparisons: less, less-or-equal, greater, greater-or-equal.',
  },
  {
    op: 'jb / jbe / ja / jae label',
    text: 'Unsigned comparisons: below, below-or-equal, above, above-or-equal.',
  },
  {
    op: 'nop / hlt',
    text: 'Do nothing / stop. End every image with hlt.',
  },
]

const JUMP_CONDITIONS = [
  { op: 'je / jz', text: 'zero = 1' },
  { op: 'jne / jnz', text: 'zero = 0' },
  { op: 'jl', text: 'signed less: sign ≠ overflow' },
  { op: 'jle', text: 'zero = 1 or signed less' },
  { op: 'jg', text: 'zero = 0 and sign = overflow' },
  { op: 'jge', text: 'sign = overflow' },
  { op: 'jb', text: 'unsigned below: carry = 1' },
  { op: 'jbe', text: 'carry = 1 or zero = 1' },
  { op: 'ja', text: 'carry = 0 and zero = 0' },
  { op: 'jae', text: 'carry = 0' },
]

function PageHeader({ page }: { page: ManualPageDef }) {
  return (
    <header className="field-manual-page-head">
      <p className="field-manual-kicker">{page.group}</p>
      <h2>{page.title}</h2>
      <p>{page.summary}</p>
    </header>
  )
}

function ReferenceLink({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="manual-inline-link" onClick={onOpen}>
      Open the component reference <span aria-hidden="true">→</span>
    </button>
  )
}

export default function FieldManual({ onClose, initialTab, initialSection }: FieldManualProps) {
  const [page, setPage] = useState<ManualPage>(() => initialPage(initialTab, initialSection))
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const activePage = PAGE_BY_ID[page]

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [page])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !selectedPart) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, selectedPart])

  const openPage = (next: ManualPage) => setPage(next)

  return (
    <div
      className="modal-scrim field-manual-scrim"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal-card field-manual"
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-manual-title"
      >
        <header className="field-manual-head">
          <div>
            <p className="hud-label">MIRA field reference</p>
            <h2 id="field-manual-title">Field manual</h2>
            <p className="field-manual-subtitle">Assembly, circuit bench, and the ship parts library.</p>
          </div>
          <button type="button" className="field-manual-close" onClick={onClose} aria-label="Close manual">
            Close <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="field-manual-layout">
          <nav className="field-manual-nav" aria-label="Manual contents">
            {PAGE_GROUPS.map((group) => (
              <section key={group.label} className="field-manual-nav-group" aria-labelledby={navGroupId(group.label)}>
                <h3 id={navGroupId(group.label)}>{group.label}</h3>
                {group.pages.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    aria-current={page === candidate.id ? 'page' : undefined}
                    className={page === candidate.id ? 'is-current' : ''}
                    onClick={() => openPage(candidate.id)}
                  >
                    {candidate.label}
                  </button>
                ))}
              </section>
            ))}
          </nav>

          <div className="field-manual-content" ref={contentRef}>
            <article className="field-manual-page">
              <PageHeader page={activePage} />

              {page === 'basics' && (
                <>
                  <div className="manual-card-grid">
                    <section>
                      <h3>Run the image</h3>
                      <ol className="manual-steps">
                        <li>Replace the broken starter line, then press <strong>Assemble &amp; run</strong>.</li>
                        <li>Read the case list. Every case must show <strong>PASS</strong> before the relay accepts.</li>
                        <li>If a case fails, change one instruction and run again. <strong>Reset</strong> restores the starter.</li>
                      </ol>
                    </section>
                    <section>
                      <h3>What is checked</h3>
                      <p>
                        Every case starts with its own registers and memory, all other words zeroed, and flags clear.
                        After your image halts, only the named registers and memory cells are checked.
                      </p>
                    </section>
                    <section>
                      <h3>Registers and memory</h3>
                      <p>
                        <code>ax</code>, <code>bx</code>, <code>cx</code>, <code>dx</code>, <code>si</code>, and{' '}
                        <code>di</code> are 16-bit registers. Memory is 256 words, <code>[0x00]</code> to{' '}
                        <code>[0xFF]</code>. Addresses are absolute: write <code>[0x20]</code>, not <code>[ax]</code>.
                      </p>
                    </section>
                    <section>
                      <h3>Flags</h3>
                      <p>
                        Arithmetic and <code>cmp</code> set zero, sign, carry, and overflow. Logic sets zero and sign.
                        {' '}<code>inc</code>/<code>dec</code> preserve carry; <code>mov</code>/<code>not</code> change
                        no flags. Branch after the instruction that sets the flag.
                      </p>
                    </section>
                  </div>
                  <p className="manual-note">
                    <kbd>ctrl</kbd> + <kbd>enter</kbd> assembles and runs. A failed run replaces the sample cases with
                    every failed case, including the expected and actual values.
                  </p>
                </>
              )}

              {page === 'operands' && (
                <>
                  <h3>Allowed operand forms</h3>
                  <div className="manual-table">
                    <div>
                      <code>register</code>
                      <span>ax, bx, cx, dx, si, or di.</span>
                    </div>
                    <div>
                      <code>immediate</code>
                      <span>Decimal, 0x hex, 0b binary, or a quoted character such as &apos;A&apos;.</span>
                    </div>
                    <div>
                      <code>[address]</code>
                      <span>One 16-bit word at an absolute address from 0x00 to 0xFF.</span>
                    </div>
                  </div>
                  <div className="manual-card-grid">
                    <section>
                      <h3>Destination first</h3>
                      <p>
                        The destination must be a register or memory cell. The source can be any operand, but both
                        operands cannot be memory: <code>mov [0x30], ax</code> is valid;{' '}
                        <code>mov [0x30], [0x20]</code> is not.
                      </p>
                    </section>
                    <section>
                      <h3>One-operand instructions</h3>
                      <p>
                        <code>not</code>, <code>inc</code>, and <code>dec</code> take one register or memory operand.
                        Register-indirect addressing is unavailable; use an absolute address.
                      </p>
                    </section>
                  </div>
                </>
              )}

              {page === 'syntax' && (
                <>
                  <pre>{`; comment
label:
  mov ax, bx        ; ax = bx
  and ax, 0x00ff    ; keep the low byte
  mov [0x30], ax    ; store one word
  cmp ax, 0
  je done
done:
  hlt`}</pre>
                  <div className="manual-card-grid">
                    <section>
                      <h3>Labels and jumps</h3>
                      <p>
                        Labels end with a colon, are case-insensitive, and may appear before an instruction. A jump
                        target must exist somewhere in the image.
                      </p>
                    </section>
                    <section>
                      <h3>Literals</h3>
                      <p>
                        Values from -32768 through 65535 are accepted, then masked to 16 bits. A semicolon starts a
                        comment outside a quoted character.
                      </p>
                    </section>
                  </div>
                </>
              )}

              {page === 'instructions' && (
                <>
                  <h3>Opcode reference</h3>
                  <div className="manual-table">
                    {INSTRUCTIONS.map((instruction) => (
                      <div key={instruction.op}>
                        <code>{instruction.op}</code>
                        <span>{instruction.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="manual-note">
                    The emulator is 16-bit. <code>mov</code> does not change flags, and every image should stop with{' '}
                    <code>hlt</code>.
                  </p>
                </>
              )}

              {page === 'jumps' && (
                <>
                  <h3>Conditional jumps</h3>
                  <div className="manual-table">
                    {JUMP_CONDITIONS.map((condition) => (
                      <div key={condition.op}>
                        <code>{condition.op}</code>
                        <span>{condition.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="manual-note">
                    Use signed jumps after signed comparisons and unsigned jumps after masks or addresses.{' '}
                    <code>je</code>/<code>jz</code> and <code>jne</code>/<code>jnz</code> are aliases.
                  </p>
                </>
              )}

              {page === 'examples' && (
                <div className="manual-examples">
                  <section>
                    <h3>AND</h3>
                    <pre>{`; ax = A, bx = B
and ax, bx
hlt`}</pre>
                    <p>One solution. A scratch register also works when bx must stay intact.</p>
                  </section>
                  <section>
                    <h3>NOT with scratch</h3>
                    <pre>{`; ax = arm, bx = fault
mov cx, bx
not cx
and ax, cx
hlt`}</pre>
                    <p>Invert a copy of the fault mask, then combine it with arm. Never overwrite bx.</p>
                  </section>
                  <section>
                    <h3>Conditional route</h3>
                    <pre>{`; if cx = 0 keep A
cmp cx, 0
je keep_a
mov ax, bx
keep_a:
hlt`}</pre>
                    <p>
                      <code>cmp cx, 0</code> makes <code>je</code> true only when select is zero.
                    </p>
                  </section>
                </div>
              )}

              {page === 'errors' && (
                <>
                  <h3>Common errors</h3>
                  <div className="manual-table">
                    <div>
                      <code>mov [0x30], [0x20]</code>
                      <span>Both operands are memory. Load into a register first.</span>
                    </div>
                    <div>
                      <code>mov 1, ax</code>
                      <span>The destination cannot be an immediate value.</span>
                    </div>
                    <div>
                      <code>mov ax, [bx]</code>
                      <span>Register-indirect addressing is unavailable. Use an absolute address.</span>
                    </div>
                    <div>
                      <code>jmp missing</code>
                      <span>The target label must be defined somewhere in the image.</span>
                    </div>
                    <div>
                      <code>loop:</code>
                      <span>A loop with no exit hits the 10,000-instruction step limit.</span>
                    </div>
                  </div>
                  <p className="manual-note">
                    Fix the first error before rerunning. Later errors are often a consequence of the first bad line.
                  </p>
                </>
              )}

              {page === 'bench' && (
                <>
                  <div className="manual-card-grid">
                    <section>
                      <h3>Place a part</h3>
                      <p>
                        Drag a part from the tray onto the board, or tap <code>+</code> beside it. A campaign bay only
                        offers the parts relevant to its procedure.
                      </p>
                    </section>
                    <section>
                      <h3>Wire it</h3>
                      <p>
                        Drag from a source port to a sink port. A sink accepts one wire; a source can feed several
                        sinks. Lit wires show which nets are high.
                      </p>
                    </section>
                    <section>
                      <h3>Move and remove</h3>
                      <p>
                        Drag a part by its body to move it. Select a wire and use <strong>Remove wire</strong>, or
                        select a part and press <code>Delete</code>. Wiring and inputs autosave.
                      </p>
                    </section>
                    <section>
                      <h3>Submit</h3>
                      <p>
                        In a campaign bay, press <strong>Submit</strong> to check the circuit. The free bench checks
                        automatically. Only the named outputs matter; gate choice, placement, and wiring are free.{' '}
                        <strong>Reset bay</strong> restores the starting circuit.
                      </p>
                    </section>
                  </div>
                  <p className="manual-note">
                    <kbd>esc</kbd> clears a drag or selection. On clocked bays, press <strong>Tick</strong> to advance
                    one edge before comparing the output.
                  </p>
                </>
              )}

              {page === 'order' && (
                <>
                  <h3>What the work order gives you</h3>
                  <div className="manual-table">
                    <div>
                      <code>input → output</code>
                      <span>Each row&apos;s inputs must produce the required named outputs.</span>
                    </div>
                    <div>
                      <code>T</code>
                      <span>A clocked row: press Tick before comparing it. Timing traces run top to bottom.</span>
                    </div>
                    <div>
                      <code>truth table</code>
                      <span>The full expected table is in the right-hand work order.</span>
                    </div>
                  </div>
                  <p className="manual-note">
                    The expected tests are the contract. A compact objective is only a summary; if it differs from the
                    tests, trust the tests.
                  </p>
                </>
              )}

              {page === 'gates' && (
                <>
                  <h3>Logic gates</h3>
                  <div className="manual-table">
                    <div>
                      <code>AND</code>
                      <span>Output is high only when every input is high.</span>
                    </div>
                    <div>
                      <code>OR</code>
                      <span>Output is high when at least one input is high.</span>
                    </div>
                    <div>
                      <code>NOT</code>
                      <span>Output is the opposite of the input.</span>
                    </div>
                    <div>
                      <code>XOR / XNOR</code>
                      <span>XOR flags differences; XNOR flags matches.</span>
                    </div>
                    <div>
                      <code>NAND / NOR</code>
                      <span>Inverted AND / inverted OR. Either can veto a signal.</span>
                    </div>
                  </div>
                  <ReferenceLink onOpen={() => openPage('parts')} />
                </>
              )}

              {page === 'blocks' && (
                <>
                  <h3>Useful blocks</h3>
                  <div className="manual-table">
                    <div>
                      <code>D flip-flop</code>
                      <span>Captures d on a Tick and holds q between edges.</span>
                    </div>
                    <div>
                      <code>Full adder</code>
                      <span>sum = a XOR b XOR cin; cout is high when at least two inputs are high.</span>
                    </div>
                    <div>
                      <code>2:1 mux</code>
                      <span>sel = 0 selects a; sel = 1 selects b.</span>
                    </div>
                    <div>
                      <code>4:1 mux</code>
                      <span>s1 s0 = 00, 01, 10, 11 selects a, b, c, d respectively.</span>
                    </div>
                    <div>
                      <code>2-to-4 decoder</code>
                      <span>a is the low select bit; exactly one of y0–y3 is high for each code.</span>
                    </div>
                  </div>
                  <ReferenceLink onOpen={() => openPage('parts')} />
                </>
              )}

              {page === 'fixes' && (
                <>
                  <h3>Common mistakes</h3>
                  <div className="manual-table">
                    <div>
                      <code>output stays dark</code>
                      <span>No wire reaches the named output, or the driving gate has an open input.</span>
                    </div>
                    <div>
                      <code>old gate still drives</code>
                      <span>A sink accepts one wire; rewire so the old gate is disconnected.</span>
                    </div>
                    <div>
                      <code>wrong select order</code>
                      <span>Read selectors high bit first: s1 s0, not s0 s1.</span>
                    </div>
                    <div>
                      <code>missing carry</code>
                      <span>The low adder&apos;s carry-out feeds the high adder&apos;s carry-in.</span>
                    </div>
                    <div>
                      <code>input did not change</code>
                      <span>A flip-flop needs a Tick; flipping d alone does not move q.</span>
                    </div>
                  </div>
                  <p className="manual-note">
                    If a wire will not connect, check that you started on a source and released on a sink. A sink can
                    only have one incoming wire.
                  </p>
                </>
              )}

              {page === 'parts' && <PartsReference onOpenPart={setSelectedPart} />}
            </article>
          </div>
        </div>

        {selectedPart && <ComponentDoc componentId={selectedPart} onClose={() => setSelectedPart(null)} />}
      </div>
    </div>
  )
}
