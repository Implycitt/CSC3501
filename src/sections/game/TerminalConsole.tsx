import { useState } from 'react'
import { taskById } from '../../terminal/tasks.ts'
import { assemble, runCases, type CaseResult } from '../../terminal/x86.ts'
import type { SystemStage } from '../../game/ship.ts'
import TerminalManual from './TerminalManual.tsx'

interface TerminalConsoleProps {
  stage: SystemStage
  onComplete: (stageId: string) => void
}

export default function TerminalConsole({ stage, onComplete }: TerminalConsoleProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [results, setResults] = useState<CaseResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)

  const task = taskById(stage.taskId ?? '') ?? null
  const code = draft ?? task?.starter ?? ''

  const resetSource = () => {
    setDraft(null)
    setResults(null)
    setError(null)
  }

  const runTask = () => {
    if (!task) return

    try {
      const program = assemble(code)
      const next = runCases(program, task.tests)
      setResults(next)
      setError(null)
      if (next.every((result) => result.passed)) onComplete(stage.id)
    } catch (caught) {
      setResults(null)
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  const allPassed = results !== null && results.every((result) => result.passed)

  const formatRegs = (regs?: Partial<Record<string, number>>) =>
    regs
      ? Object.entries(regs)
          .map(([name, value]) => `${name}=${Number(value).toString(16).toUpperCase().padStart(4, '0')}`)
          .join(' ')
      : ''

  const formatMemory = (memory?: Record<number, number>) =>
    memory
      ? Object.entries(memory)
          .map(([address, value]) => `[${Number(address).toString(16).toUpperCase()}]=${Number(value).toString(16).toUpperCase().padStart(4, '0')}`)
          .join(' ')
      : ''

  const formatSetup = (setup?: { regs?: Partial<Record<string, number>>; memory?: Record<number, number> }) =>
    [formatRegs(setup?.regs), formatMemory(setup?.memory)].filter(Boolean).join(' · ') || 'empty machine'

  const formatExpectation = (expect: { regs?: Partial<Record<string, number>>; memory?: Record<number, number> }) =>
    [formatRegs(expect.regs), formatMemory(expect.memory)].filter(Boolean).join(' · ') || 'no named result'

  if (!task) {
    return (
      <div className="terminal-empty">
        <p className="unit-shut-kicker">No image mounted</p>
        <p>This terminal has no firmware image for the procedure.</p>
      </div>
    )
  }

  return (
    <div className="terminal-console">
      <div className="terminal-brief">
        <div className="terminal-brief-head">
          <span>Work order · {stage.code}</span>
          <span className="terminal-brief-accept">Behavior checked</span>
        </div>
        <p className="terminal-brief-copy">{task.summary}</p>
        <p className="terminal-objective">{task.objective}</p>

        <div className="terminal-rules">
          <span className="terminal-rules-label">Rules</span>
          <ul>
            {task.contract.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        {task.walkthrough && (
          <ol className="terminal-walkthrough">
            {task.walkthrough.map((step, index) => (
              <li key={step}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        <details className="terminal-tests">
          <summary>
            Test cases · {task.tests.length} <span>inputs → required result</span>
          </summary>
          <div className="terminal-test-list">
            {task.tests.map((test, index) => (
              <div key={test.name}>
                <span className="terminal-test-name">
                  {String(index + 1).padStart(2, '0')} · {test.name}
                </span>
                <code>
                  {formatSetup(test.setup)} → {formatExpectation(test.expect)}
                </code>
              </div>
            ))}
          </div>
        </details>

        <p className="terminal-acceptance">Any image that passes every case is accepted.</p>
      </div>

      <div className="terminal-editor">
        <textarea
          aria-label="Assembly source"
          className="terminal-textarea"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={code}
          onChange={(event) => {
            setDraft(event.target.value)
            setResults(null)
            setError(null)
          }}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
              event.preventDefault()
              runTask()
            }
          }}
        />
      </div>

      <div aria-live="polite" className="terminal-output">
        {error && <p className="ink-danger">{error}</p>}
        {results && (
          <>
            <p className={allPassed ? 'phosphor' : 'ink-danger'}>
              {allPassed ? 'ACCEPTED // firmware online' : 'ASSEMBLY REJECTED'}
            </p>
            {results.map((result) => (
              <p key={result.name} className={result.passed ? 'terminal-pass' : 'ink-danger'}>
                {result.passed ? 'PASS' : 'FAIL'} · {result.name}
                {result.detail ? ` · ${result.detail}` : ''}
              </p>
            ))}
          </>
        )}
        {!error && !results && <p className="terminal-ready">READY · ctrl+enter to assemble</p>}
      </div>

      <div className="terminal-actions">
        <div className="terminal-help">
          <details className="terminal-hint">
            <summary>Hint</summary>
            <p>{task.hint}</p>
          </details>
          <button type="button" className="terminal-manual-button" onClick={() => setManualOpen(true)}>
            Manual
          </button>
        </div>
        <div className="terminal-buttons">
          <button type="button" className="btn" onClick={resetSource}>
            Reset
          </button>
          <button type="button" className="btn btn-live" onClick={runTask}>
            Assemble & run
          </button>
        </div>
      </div>

      {manualOpen && <TerminalManual onClose={() => setManualOpen(false)} />}
    </div>
  )
}
