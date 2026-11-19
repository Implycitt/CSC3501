import type { CircuitGoal } from '../../game/behavior.ts'

interface ExpectedTestsProps {
  goal?: CircuitGoal
}

const MAX_ROWS = 5
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

export default function ExpectedTests({ goal }: ExpectedTestsProps) {
  if (!goal) return null

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
          Showing {rows.length} of {total} · full table below
        </p>
      )}
    </section>
  )
}
