import { useEffect, useState } from 'react'

interface TerminalManualProps {
  onClose: () => void
}

const INSTRUCTIONS = [
  {
    op: 'mov dst, src',
    text: 'Copy a register, immediate, or [memory] word into a register or memory address. Flags do not change.',
  },
  {
    op: 'and / or / xor dst, src',
    text: 'Bitwise logic between two 16-bit words. The result replaces the destination; zero and sign update, carry and overflow clear.',
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
    text: 'Subtract right from left without storing the result. Only zero, sign, carry, and overflow change.',
  },
  {
    op: 'jmp / je / jne / jz / jnz label',
    text: 'Jump unconditionally or from the zero flag. The label may appear before or after the jump.',
  },
  {
    op: 'jl / jle / jg / jge label',
    text: 'Signed comparisons after cmp or sub: less, less-or-equal, greater, greater-or-equal.',
  },
  {
    op: 'jb / jbe / ja / jae label',
    text: 'Unsigned comparisons after cmp or sub: below, below-or-equal, above, above-or-equal.',
  },
  {
    op: 'nop / hlt',
    text: 'Do nothing / stop the program. End every image with hlt so its stopping point is explicit.',
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

export default function TerminalManual({ onClose }: TerminalManualProps) {
  const [tab, setTab] = useState<'assembly' | 'circuits'>('assembly')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-scrim"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal-card terminal-manual"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-manual-title"
      >
        <div className="terminal-manual-head">
          <div>
            <p className="hud-label">MIRA field reference</p>
            <h2 id="terminal-manual-title">Manual</h2>
          </div>
          <button type="button" className="btn" onClick={onClose} aria-label="Close manual">
            Close
          </button>
        </div>

        <div className="terminal-manual-tabs" role="tablist" aria-label="Reference section">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'assembly'}
            className={tab === 'assembly' ? 'is-current' : ''}
            onClick={() => setTab('assembly')}
          >
            Assembly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'circuits'}
            className={tab === 'circuits' ? 'is-current' : ''}
            onClick={() => setTab('circuits')}
          >
            Circuits
          </button>
        </div>

        {tab === 'assembly' ? (
          <div className="terminal-manual-body">
            <section>
              <h3>Quick start</h3>
              <p>
                The editor opens with a deliberately broken starter image. Replace the failing instruction, then press{' '}
                <strong>Assemble &amp; run</strong> or <code>ctrl+enter</code>. A green PASS on every case means the image
                is accepted. <strong>Reset</strong> discards the draft and restores the starter.
              </p>
            </section>

            <section>
              <h3>How a case runs</h3>
              <p>
                Each case starts a fresh machine with the registers and memory from its setup, all other words zeroed,
                and every flag clear. Your image begins at the first instruction. After it halts, the checker compares
                only the named registers and memory cells. Instruction order, scratch registers, and comments are free.
              </p>
            </section>

            <section>
              <h3>Registers and memory</h3>
              <p>
                <code>ax</code>, <code>bx</code>, <code>cx</code>, <code>dx</code>, <code>si</code>, and <code>di</code>{' '}
                are six general-purpose 16-bit registers; none has a special role. Memory is 256 words from{' '}
                <code>[0x00]</code> to <code>[0xFF]</code>, each 16 bits wide and initially zero. Addressing is absolute
                only: write <code>[0x20]</code>, not <code>[ax]</code>. Every read and write is one full 16-bit word, so
                mask a value before storing a byte.
              </p>
            </section>

            <section>
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
                  <span>One 16-bit memory word at an absolute address from 0x00 to 0xFF.</span>
                </div>
              </div>
              <p>
                For two-operand instructions, the destination must be a register or memory cell and the source can be any
                operand. Both operands cannot be memory: <code>mov [0x30], ax</code> and <code>mov ax, [0x20]</code> are
                valid; <code>mov [0x30], [0x20]</code> is not. <code>not</code>, <code>inc</code>, and <code>dec</code>{' '}
                take one register or memory operand.
              </p>
            </section>

            <section>
              <h3>Syntax and literals</h3>
              <pre>{`; comment
label:
  mov ax, bx        ; ax = bx
  and ax, 0x00ff    ; keep the low byte
  mov [0x30], ax    ; store one word
  cmp ax, 0
  je done           ; jump if ax became zero
done:
  hlt`}</pre>
              <p>
                Separate operands with commas. A semicolon starts a comment outside a quoted character. Labels end with a
                colon, are case-insensitive, and may sit on their own line or before an instruction. Jump targets must
                exist. Numeric values from -32768 through 65535 are accepted, then masked to 16 bits.
              </p>
            </section>

            <section>
              <h3>Instruction reference</h3>
              <div className="manual-table">
                {INSTRUCTIONS.map((instruction) => (
                  <div key={instruction.op}>
                    <code>{instruction.op}</code>
                    <span>{instruction.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3>Flags</h3>
              <p>
                Arithmetic and comparison set zero, sign, carry, and overflow. Logic instructions set zero and sign and
                clear carry and overflow. <code>inc</code> and <code>dec</code> preserve carry. <code>mov</code> and{' '}
                <code>not</code> leave flags unchanged. Branch instructions read the flags left by the most recent
                flag-setting instruction, so compare before you branch.
              </p>
            </section>

            <section>
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
                Use the signed jumps after comparing signed values and the unsigned jumps after comparing masks or
                addresses. <code>je</code>/<code>jz</code> and <code>jne</code>/<code>jnz</code> are aliases.
              </p>
            </section>

            <section>
              <h3>Worked AND</h3>
              <pre>{`; ax = A, bx = B, result in ax
and ax, bx
hlt`}</pre>
              <p>
                This is one solution, not the only one. Copying A into a scratch register, combining there, and writing
                it back to ax is equally valid when bx must stay intact.
              </p>
            </section>

            <section>
              <h3>Worked NOT with a scratch register</h3>
              <pre>{`; ax = arm, bx = fault, preserve bx
mov cx, bx
not cx
and ax, cx
hlt`}</pre>
              <p>
                Invert a copy of the fault mask, then combine it with the arm mask. Overwriting <code>bx</code> would
                destroy the input the test still checks.
              </p>
            </section>

            <section>
              <h3>Worked conditional route</h3>
              <pre>{`; if cx = 0 keep A, otherwise take B
cmp cx, 0
je keep_a
mov ax, bx
keep_a:
hlt`}</pre>
              <p>
                <code>cmp cx, 0</code> makes <code>je</code> true only when the select line is zero. When select is
                nonzero, execution falls through and copies B into ax.
              </p>
            </section>

            <section>
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
                  <span>A loop with no exit runs until the 10,000-instruction step limit fails the case.</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="terminal-manual-body">
            <section>
              <h3>How a circuit is judged</h3>
              <p>
                Circuit goals are checked by behavior rather than layout. In puzzle mode, the panel simulates your
                finished circuit against the goal&apos;s input cases and compares the named outputs. Gate choice,
                placement, and wire routing are free. Two different circuits pass if they produce the same outputs.
              </p>
            </section>

            <section>
              <h3>Signals</h3>
              <p>
                Inputs are sources; outputs are sinks. Drag from a source handle to a sink handle. One wire per sink; a
                second wire replaces the first. The Live strip above the bench shows the current input and output
                values, and clicking an input pill in that strip toggles it.
              </p>
            </section>

            <section>
              <h3>Combinational logic</h3>
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
            </section>

            <section>
              <h3>Clocks and memory</h3>
              <p>
                A flip-flop only captures data on a clock edge. Switch the data input, then press Tick clock. The
                output keeps its stored bit between ticks, even if the input changes.
              </p>
            </section>

            <section>
              <h3>Debugging a circuit</h3>
              <p>
                Follow one signal at a time. Check the input at the source, the port it reaches, and the output that
                port drives. The Live strip and the lit wires are your trace. A dark output is not always a missing
                part; it can be a gate with one wrong input.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
