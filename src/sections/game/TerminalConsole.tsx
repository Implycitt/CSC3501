import { useState } from 'react'
import { taskById } from '../../terminal/tasks.ts'
import { assemble, runCases, type CaseResult } from '../../terminal/x86.ts'
import type { CampaignProgress } from '../../game/campaign.ts'
import type { ShipSystem, SystemStage } from '../../game/ship.ts'

interface TerminalConsoleProps {
  system: ShipSystem
  stage: SystemStage
  progress: CampaignProgress
  onComplete: (stageId: string) => void
}

export default function TerminalConsole({ system, stage, progress, onComplete }: TerminalConsoleProps) {
  const [mode, setMode] = useState<'asm' | 'c'>('asm')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [runState, setRunState] = useState<{
    taskId: string
    results: CaseResult[] | null
    error: string | null
  } | null>(null)

  const task = taskById(stage.taskId ?? '') ?? null
  const accepted = progress.firmware.includes(stage.id)
  const code = task ? drafts[task.id] ?? task.starter : ''
  const results = task && runState?.taskId === task.id ? runState.results : null
  const error = task && runState?.taskId === task.id ? runState.error : null

  const resetSource = () => {
    if (task) {
      setDrafts((current) => {
        const next = { ...current }
        delete next[task.id]
        return next
      })
    }
    setRunState(null)
  }

  const runTask = () => {
    if (!task) return

    try {
      const program = assemble(code)
      const next = runCases(program, task.tests)
      setRunState({ taskId: task.id, results: next, error: null })
      if (next.every((result) => result.passed)) onComplete(stage.id)
    } catch (caught) {
      setRunState({
        taskId: task.id,
        results: null,
        error: caught instanceof Error ? caught.message : String(caught),
      })
    }
  }

  const allPassed = results !== null && results.every((result) => result.passed)

  return (
    <section className="crt bezel terminal-shell flex min-w-0 flex-col overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--palette-line)] bg-[var(--palette-terminal)] px-3 py-2">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.3em] phosphor-dim">MIRA-OS // firmware bay</p>
          <p className="truncate text-[11px] phosphor">
            root@meridian:/{system.code.toLowerCase()}/{stage.code.toLowerCase()}$
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-pressed={mode === 'asm'}
            className={`border px-2 py-0.5 text-[10px] ${mode === 'asm' ? 'border-current phosphor' : 'edge-soft ink-faint hover-ink'}`}
            onClick={() => setMode('asm')}
          >
            ASM
          </button>
          <button
            type="button"
            aria-pressed={mode === 'c'}
            className={`border px-2 py-0.5 text-[10px] ${mode === 'c' ? 'border-current phosphor' : 'edge-soft ink-faint hover-ink'}`}
            onClick={() => setMode('c')}
          >
            C
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--palette-line)] px-3 py-1.5 text-[10px]">
        <p className="min-w-0 truncate phosphor-dim">
          {task ? `${task.code} // ${task.title}` : 'NO IMAGE MOUNTED'}
        </p>
        <p className={`shrink-0 text-[9px] uppercase tracking-[0.2em] ${accepted ? 'phosphor' : 'amber'}`}>
          {accepted ? 'online' : 'awaiting upload'}
        </p>
      </div>

      {mode === 'c' ? (
        <div className="m-3 border border-[var(--palette-line)] p-3 text-[11px] leading-relaxed text-[var(--palette-ink-soft)]">
          <p className="phosphor-dim">C TOOLCHAIN // NOT MOUNTED</p>
          <p className="mt-2">The compiler image is still in cold storage. This terminal only carries the assembly toolchain.</p>
          <p className="mt-1 text-[var(--palette-ink-faint)]">C firmware is reserved for the deeper decks.</p>
        </div>
      ) : task ? (
        <>
          <div className="border-b border-[var(--palette-line)] px-3 py-2">
            <p className="max-w-4xl text-[11px] leading-relaxed text-[var(--palette-ink-soft)]">{task.summary}</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[var(--palette-phosphor-dim)]">
              {task.contract.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>

          <div className="flex min-h-[44vh] flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-[var(--palette-line)] px-3 py-1 text-[10px] text-[var(--palette-ink-faint)]">
              <span className="phosphor">mira@meridian</span>
              <span>:~$</span>
              <span className="truncate">edit {task.code.toLowerCase()}.asm</span>
              <span className="ml-auto shrink-0 text-[9px] uppercase tracking-[0.16em]">
                {code.split('\n').length} lines
              </span>
            </div>
            <textarea
              aria-label="Assembly source"
              className="crt-input terminal-textarea h-full w-full flex-1 resize-none"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              value={code}
              onChange={(event) => {
                setDrafts((current) => ({ ...current, [task.id]: event.target.value }))
                setRunState(null)
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault()
                  runTask()
                }
              }}
            />
          </div>

          <div aria-live="polite" className="terminal-output max-h-36 overflow-y-auto border-t border-[var(--palette-line)] px-3 py-2 text-[10px] leading-relaxed">
            {error && <p className="ink-danger">{error}</p>}
            {results && (
              <div className="space-y-0.5">
                <p className={allPassed ? 'phosphor' : 'ink-danger'}>
                  {allPassed ? `${task.code} ACCEPTED // ${system.name} firmware online` : 'ASSEMBLY REJECTED'}
                </p>
                {results.map((result) => (
                  <p key={result.name} className={result.passed ? 'text-[var(--palette-ink-soft)]' : 'ink-danger'}>
                    {result.passed ? 'PASS' : 'FAIL'} · {result.name}
                    {result.detail ? ` · ${result.detail}` : ''}
                  </p>
                ))}
              </div>
            )}
            {!error && !results && (
              <p className={accepted ? 'phosphor' : 'text-[var(--palette-ink-faint)]'}>
                {accepted ? 'FIRMWARE ACCEPTED // image stays mounted for re-runs.' : '> awaiting assembly input_'}
              </p>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--palette-line)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.18em] text-[var(--palette-ink-faint)]">ctrl+enter to assemble</span>
              <details className="text-[10px] text-[var(--palette-ink-soft)]">
                <summary className="cursor-pointer select-none text-[var(--palette-ink-faint)]">MIRA hint</summary>
                <p className="mt-1 max-w-xl leading-relaxed">{task.hint}</p>
              </details>
            </div>
            <div className="flex gap-1">
              <button type="button" className="btn" onClick={resetSource}>
                Reset
              </button>
              <button type="button" className="btn btn-live" onClick={runTask}>
                {accepted ? 'Run again' : 'Assemble & run'}
              </button>
            </div>
          </footer>
        </>
      ) : (
        <div className="m-3 border border-[var(--palette-line)] p-3 text-[11px] leading-relaxed text-[var(--palette-ink-soft)]">
          <p className="phosphor-dim">NO FIRMWARE IMAGE</p>
          <p className="mt-2">No firmware image is mounted for this procedure.</p>
        </div>
      )}
    </section>
  )
}
