import { useEffect, useState } from 'react'

export type ManualTab = 'code' | 'circuits'

interface FieldManualProps {
  onClose: () => void
  initialTab: ManualTab
  initialSection?: string
}

type CodePage = 'basics' | 'operands' | 'syntax' | 'instructions' | 'jumps' | 'examples' | 'errors'
type CircuitPage = 'bench' | 'order' | 'gates' | 'blocks' | 'fixes'

const CODE_PAGES: { id: CodePage; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'operands', label: 'Operands' },
  { id: 'syntax', label: 'Syntax' },
  { id: 'instructions', label: 'Instructions' },
  { id: 'jumps', label: 'Jumps' },
  { id: 'examples', label: 'Examples' },
  { id: 'errors', label: 'Errors' },
]

const CIRCUIT_PAGES: { id: CircuitPage; label: string }[] = [
  { id: 'bench', label: 'Bench' },
  { id: 'order', label: 'Work order' },
  { id: 'gates', label: 'Gates' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'fixes', label: 'Fixes' },
]

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

function codePageForSection(section?: string): CodePage {
  return (section && CODE_SECTION_PAGE[section]) || 'basics'
}

function circuitPageForSection(section?: string): CircuitPage {
  return (section && CIRCUIT_SECTION_PAGE[section]) || 'bench'
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

export default function FieldManual({ onClose, initialTab, initialSection }: FieldManualProps) {
  const [tab, setTab] = useState<ManualTab>(initialTab)
  const [codePage, setCodePage] = useState<CodePage>(() => codePageForSection(initialSection))
  const [circuitPage, setCircuitPage] = useState<CircuitPage>(() => circuitPageForSection(initialSection))
  const isCode = tab === 'code'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const chooseTab = (next: ManualTab) => {
    setTab(next)
  }

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
        <div className="field-manual-head">
          <div>
            <p className="hud-label">MIRA field reference</p>
            <h2 id="field-manual-title">Field manual</h2>
          </div>
          <button type="button" className="btn" onClick={onClose} aria-label="Close manual">
            Close
          </button>
        </div>

        <nav className="field-manual-tabs" aria-label="Reference section">
          <button
            type="button"
            aria-pressed={isCode}
            className={isCode ? 'is-current' : ''}
            onClick={() => chooseTab('code')}
          >
            Code
          </button>
          <button
            type="button"
            aria-pressed={!isCode}
            className={!isCode ? 'is-current' : ''}
            onClick={() => chooseTab('circuits')}
          >
            Circuits
          </button>
        </nav>

        <nav className="field-manual-topics" aria-label="Reference topic">
          {isCode
            ? CODE_PAGES.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  aria-pressed={codePage === page.id}
                  className={codePage === page.id ? 'is-current' : ''}
                  onClick={() => setCodePage(page.id)}
                >
                  {page.label}
                </button>
              ))
            : CIRCUIT_PAGES.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  aria-pressed={circuitPage === page.id}
                  className={circuitPage === page.id ? 'is-current' : ''}
                  onClick={() => setCircuitPage(page.id)}
                >
                  {page.label}
                </button>
              ))}
        </nav>

        <div className="field-manual-body">
          {isCode ? (
            <div className="field-manual-page">
              {codePage === 'basics' && (
                <div className="manual-copy-grid">
                    <section>
                      <h3>Quick start</h3>
                      <p>
                        Replace the broken starter instruction, then press <strong>Assemble &amp; run</strong> or{' '}
                        <code>ctrl+enter</code>. A green PASS on every case accepts the image. <strong>Reset</strong>{' '}
                        restores the starter.
                      </p>
                    </section>
                    <section>
                      <h3>How a case runs</h3>
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
                        <code>inc</code>/<code>dec</code> preserve carry; <code>mov</code>/<code>not</code> change no
                        flags. Branch after the flag-setting instruction.
                      </p>
                    </section>
                </div>
              )}

              {codePage === 'operands' && (
                <>
                  <h3>Operands</h3>
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
                  <p>
                    The destination must be a register or memory cell. The source can be any operand, but both
                    operands cannot be memory: <code>mov [0x30], ax</code> is valid; <code>mov [0x30], [0x20]</code>{' '}
                    is not. <code>not</code>, <code>inc</code>, and <code>dec</code> take one register or memory
                    operand.
                  </p>
                </>
              )}

              {codePage === 'syntax' && (
                <>
                  <h3>Syntax and literals</h3>
                  <pre>{`; comment
label:
  mov ax, bx        ; ax = bx
  and ax, 0x00ff    ; keep the low byte
  mov [0x30], ax    ; store one word
  cmp ax, 0
  je done
done:
  hlt`}</pre>
                  <p>
                    Separate operands with commas. A semicolon starts a comment outside a quoted character. Labels end
                    with a colon, are case-insensitive, and may appear before an instruction. Jump targets must exist.
                    Values from -32768 through 65535 are accepted, then masked to 16 bits.
                  </p>
                </>
              )}

              {codePage === 'instructions' && (
                <>
                  <h3>Instruction reference</h3>
                  <div className="manual-table">
                    {INSTRUCTIONS.map((instruction) => (
                      <div key={instruction.op}>
                        <code>{instruction.op}</code>
                        <span>{instruction.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {codePage === 'jumps' && (
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
                  <p>
                    Use signed jumps after signed comparisons and unsigned jumps after masks or addresses.{' '}
                    <code>je</code>/<code>jz</code> and <code>jne</code>/<code>jnz</code> are aliases.
                  </p>
                </>
              )}

              {codePage === 'examples' && (
                <>
                  <h3>Worked examples</h3>
                  <div className="manual-examples">
                    <section>
                      <h4>AND</h4>
                      <pre>{`; ax = A, bx = B
and ax, bx
hlt`}</pre>
                      <p>One solution. A scratch register also works when bx must stay intact.</p>
                    </section>
                    <section>
                      <h4>NOT with scratch</h4>
                      <pre>{`; ax = arm, bx = fault
mov cx, bx
not cx
and ax, cx
hlt`}</pre>
                      <p>Invert a copy of the fault mask, then combine it with arm. Never overwrite bx.</p>
                    </section>
                    <section>
                      <h4>Conditional route</h4>
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
                </>
              )}

              {codePage === 'errors' && (
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
                </>
              )}
            </div>
          ) : (
            <div className="field-manual-page">
              {circuitPage === 'bench' && (
                <div className="manual-copy-grid">
                  <section>
                    <h3>Bench basics</h3>
                    <p>
                      Drag a part from the tray onto the board, or tap <code>+</code> beside it. Drag a part anywhere
                      on its body to move it. Drag from a source port to a sink port to wire them.
                    </p>
                  </section>
                  <section>
                    <h3>Live inputs</h3>
                    <p>
                      Use the Live strip above the board to switch inputs on and off. One sink accepts one wire; a
                      source can feed several. Lit wires show which nets are high.
                    </p>
                  </section>
                  <section>
                    <h3>Editing</h3>
                    <p>
                      Click a wire and use <strong>Remove wire</strong> in the Inspector. Select a part and press{' '}
                      <code>Delete</code> to remove it. Wiring, inputs, and ticks autosave.
                    </p>
                  </section>
                  <section>
                    <h3>Checking</h3>
                    <p>
                      The checker runs automatically. Only the named outputs matter: gate choice, placement, and wiring
                      are free. <strong>reset bay</strong> restores the starting state.
                    </p>
                  </section>
                </div>
              )}

              {circuitPage === 'order' && (
                <>
                  <h3>Reading a work order</h3>
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
                </>
              )}

              {circuitPage === 'gates' && (
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
                </>
              )}

              {circuitPage === 'blocks' && (
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
                </>
              )}

              {circuitPage === 'fixes' && (
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
