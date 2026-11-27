import { useState } from 'react'
import type { CircuitGoal, GoalFailure, GoalReport } from '../../game/behavior.ts'

interface ExpectedTestsProps {
  goal?: CircuitGoal
  /** The rejected submission whose failing rows replace the examples. */
  report?: GoalReport
}

const MAX_ROWS = 2
const MAX_FAILED_ROWS = 3
const bit = (value: boolean | undefined) => (value ? '1' : '0')

/** Pick evenly spaced rows so large truth tables show both ends of the range. */
function sampleIndices(total: number, limit: number): number[] {
  if (total <= limit) return Array.from({ length: total }, (_, index) => index)

  return Array.from({ length: limit }, (_, index) => Math.round((index * (total - 1)) / (limit - 1)))
}

function Values({ names, values }: { names: string[]; values: Record<string, boolean> }) {
  return (
    <>
      {names.map((name) => (
        <span className="expected-test-token" key={name}>
          <b>{name}</b>={bit(values[name])}
        </span>
      ))}
    </>
  )
}

export default function ExpectedTests({ goal, report }: ExpectedTestsProps) {
  if (!goal) return null
  if (report && report.failures.length > 0) {
    return <FailedCases goal={goal} failures={report.failures} checked={report.checked} />
  }

  const cases = goal.cases ?? []
  const traceSteps = (goal.traces ?? []).flatMap((trace) =>
    trace.steps.map((step) => ({ ...step, traceName: trace.name })),
  )
  const total = cases.length || traceSteps.length
  if (total === 0) return null

  const rows = cases.length
    ? sampleIndices(cases.length, MAX_ROWS).map((index) => {
        const values = cases[index]
        return {
          key: `${values.name ?? 'case'}-${index}`,
          index,
          tick: false,
          inputs: values.inputs,
          outputs: values.outputs,
        }
      })
    : traceSteps.slice(0, MAX_ROWS).map((step, index) => ({
        key: `${step.traceName ?? 'trace'}-${index}`,
        index,
        tick: step.tick === true,
        inputs: step.inputs,
        outputs: step.outputs,
      }))

  const inputNames = goal.inputs.filter((name) => name !== 'clk')
  const noun = cases.length ? (total === 1 ? 'case' : 'cases') : total === 1 ? 'step' : 'steps'

  return (
    <section className="expected-tests" aria-label="Expected test cases">
      <div className="expected-tests-head">
        <span className="level-unit-kind">Expected tests</span>
        <span className="expected-tests-count">
          {total} {noun}
        </span>
      </div>
      <div className="expected-test-list">
        {rows.map((row) => (
          <div className="expected-test-row" key={row.key}>
            <span className="expected-test-index">
              {String(row.index + 1).padStart(2, '0')}
              {row.tick && <em title="Clock edge">T</em>}
            </span>
            <span className="expected-test-values">
              <Values names={inputNames} values={row.inputs} />
              <span className="expected-test-arrow" aria-hidden="true">
                →
              </span>
              <Values names={goal.outputs} values={row.outputs} />
            </span>
          </div>
        ))}
      </div>
      {total > rows.length && (
        <p className="expected-tests-more">
          {rows.length} examples · {total} {noun} checked
        </p>
      )}
    </section>
  )
}

function FailedCases({ goal, failures, checked }: { goal: CircuitGoal; failures: GoalFailure[]; checked: number }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? failures : failures.slice(0, MAX_FAILED_ROWS)
  const hidden = failures.length - shown.length
  const inputNames = goal.inputs.filter((name) => name !== 'clk')

  return (
    <section className="expected-tests is-failed" aria-label="Failed test cases">
      <div className="expected-tests-head">
        <span className="level-unit-kind">Failed cases</span>
        <span className="expected-tests-count">
          {failures.length} of {checked}
        </span>
      </div>
      <div className="expected-test-list">
        {shown.map((failure) => (
          <div className="expected-test-row is-failed" key={`${failure.index}-${failure.tick}`}>
            <span className="expected-test-index">
              {String(failure.index).padStart(2, '0')}
              {failure.tick && <em title="Clock edge">T</em>}
            </span>
            <span className="expected-test-values">
              <Values names={inputNames} values={failure.inputs} />
              <span className="expected-test-arrow" aria-hidden="true">
                →
              </span>
              {goal.outputs.map((name) => (
                <span className="expected-test-token" key={name}>
                  <b>{name}</b>={bit(failure.expected[name])}
                  {failure.actual && failure.actual[name] !== failure.expected[name] && (
                    <span className="expected-test-got">got {bit(failure.actual[name])}</span>
                  )}
                </span>
              ))}
              {failure.error && <span className="expected-test-got">{failure.error}</span>}
            </span>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <p className="expected-tests-more">
          {hidden} more failed ·{' '}
          <button type="button" className="expected-tests-toggle" onClick={() => setShowAll(true)}>
            Show all {failures.length}
          </button>
        </p>
      )}
      {showAll && failures.length > MAX_FAILED_ROWS && (
        <p className="expected-tests-more">
          <button type="button" className="expected-tests-toggle" onClick={() => setShowAll(false)}>
            Show fewer
          </button>
        </p>
      )}
    </section>
  )
}
