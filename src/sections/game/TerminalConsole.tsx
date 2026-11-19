import { useState } from 'react'
import { taskById } from '../../terminal/tasks.ts'
import { assemble, runCases, type CaseResult } from '../../terminal/x86.ts'
import type { SystemStage } from '../../game/ship.ts'
import type { ManualTab } from './FieldManual.tsx'
import ManualLink from '../ManualLink.tsx'
import {
  manualLabel,
  manualSectionForCodeHint,
  manualSectionForError,
  manualSectionForFailure,
} from '../manualLinks.ts'

interface TerminalConsoleProps {
  stage: SystemStage
  onComplete: (stageId: string) => void
  onFirstFail?: (stageId: string) => void
  onOpenManual?: (tab: ManualTab, section?: string) => void
}

export default function TerminalConsole({ stage, onComplete, onFirstFail, onOpenManual }: TerminalConsoleProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [results, setResults] = useState<CaseResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasFailed, setHasFailed] = useState(false)

  const task = taskById(stage.taskId ?? '') ?? null
  const code = draft ?? task?.starter ?? ''

  const resetSource = () => {
    setDraft(null)
    setResults(null)
    setError(null)
    setHasFailed(false)
  }

  const registerFailure = () => {
    if (hasFailed) return
    setHasFailed(true)
    onFirstFail?.(stage.id)
  }

  const runTask = () => {
    if (!task) return

    try {
      const program = assemble(code)
      const next = runCases(program, task.tests)
      setResults(next)
      setError(null)
      if (next.every((result) => result.passed)) {
        onComplete(stage.id)
      } else {
        registerFailure()
      }
    } catch (caught) {
      setResults(null)
      setError(caught instanceof Error ? caught.message : String(caught))
      registerFailure()
    }
  }

  const allPassed = results !== null && results.every((result) => result.passed)
  const firstFailedIndex = results?.findIndex((result) => !result.passed) ?? -1
  const failedSection = manualSectionForFailure(
    firstFailedIndex >= 0 ? results?.[firstFailedIndex]?.detail : undefined,
  )

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
      <div className="terminal-main">
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

        {hasFailed && task.walkthrough && (
          <details className="terminal-walkthrough">
            <summary>Walkthrough</summary>
            <ol>
              {task.walkthrough.map((step, index) => (
                <li key={step}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </details>
        )}

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
        {error && (
          <>
            <p className="ink-danger">{error}</p>
            <ManualLink section={manualSectionForError(error)} onOpen={onOpenManual} />
          </>
        )}
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
            {!allPassed && firstFailedIndex >= 0 && (
              <ManualLink section={failedSection} onOpen={onOpenManual}>
                Case {String(firstFailedIndex + 1).padStart(2, '0')} failed · Manual · {manualLabel(failedSection)} →
              </ManualLink>
            )}
          </>
        )}
        {!error && !results && <p className="terminal-ready">READY · ctrl+enter to assemble</p>}
      </div>

      <div className="terminal-actions">
        <div className="terminal-help">
          <details className="terminal-hint">
            <summary>Hint</summary>
            <p>{task.conceptHint ?? task.hint}</p>
            <ManualLink
              section={manualSectionForCodeHint(task.conceptHint ?? task.hint)}
              onOpen={onOpenManual}
            />
          </details>
          {hasFailed && (
            <details className="terminal-hint">
              <summary>Exact hint</summary>
              <p>{task.hint}</p>
              <ManualLink section={manualSectionForCodeHint(task.hint)} onOpen={onOpenManual} />
            </details>
          )}
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
      </div>

      <aside className="terminal-tests-rail" aria-label="Expected test cases">
        <div className="terminal-tests-rail-head">
          <span>Expected tests</span>
          <span>{task.tests.length} cases</span>
        </div>
        <ol className="terminal-test-rail-list">
          {task.tests.map((test, index) => (
            <li key={`${test.name}-${index}`}>
              <span className="terminal-test-rail-name">
                {String(index + 1).padStart(2, '0')} · {test.name}
              </span>
              <code>
                <span>{formatSetup(test.setup)}</span>
                <span className="terminal-test-rail-arrow" aria-hidden="true">→</span>
                <span>{formatExpectation(test.expect)}</span>
              </code>
            </li>
          ))}
        </ol>
        <p className="terminal-acceptance">Any image that passes every case is accepted.</p>
      </aside>
    </div>
  )
}
