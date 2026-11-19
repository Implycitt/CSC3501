import type { CircuitCase, CircuitTrace, CircuitTraceStep } from '../../game/behavior.ts'
import type { TutorialSection } from '../../tutorial/types.ts'

interface PuzzleBriefProps {
  section: TutorialSection
}

const bit = (value: boolean | undefined) => (value ? '1' : '0')

const labelFor = (names: string[], values: Record<string, boolean>) =>
  names.map((name) => `${name}=${bit(values[name])}`).join(' ')

function caseTitle(inputs: string[], outputs: string[], values: CircuitCase): string {
  return `${labelFor(inputs, values.inputs)} → ${labelFor(outputs, values.outputs)}`
}

function stepTitle(inputs: string[], outputs: string[], step: CircuitTraceStep): string {
  return `${step.tick ? 'TICK · ' : ''}${labelFor(inputs, step.inputs)} → ${labelFor(outputs, step.outputs)}`
}

function TruthTable({ inputs, outputs, rows }: { inputs: string[]; outputs: string[]; rows: CircuitCase[] }) {
  return (
    <div className="truth-wrap">
      <table className="truth-table" aria-label="Expected output for every input case">
        <thead>
          <tr>
            {inputs.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
            <th className="truth-divider" aria-hidden="true">
              →
            </th>
            {outputs.map((name) => (
              <th key={name} scope="col" className="is-output">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((values, index) => (
            <tr key={values.name ?? index} title={caseTitle(inputs, outputs, values)}>
              {inputs.map((name) => (
                <td key={name} className={values.inputs[name] ? 'is-one' : ''}>
                  {bit(values.inputs[name])}
                </td>
              ))}
              <td className="truth-divider" aria-hidden="true" />
              {outputs.map((name) => (
                <td key={name} className={`is-output${values.outputs[name] ? ' is-one' : ''}`}>
                  {bit(values.outputs[name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TraceTable({
  inputs,
  outputs,
  trace,
}: {
  inputs: string[]
  outputs: string[]
  trace: CircuitTrace
}) {
  return (
    <div className="truth-wrap">
      <table className="truth-table truth-table-trace" aria-label={`Expected output for ${trace.name ?? 'clocked trace'}`}>
        <thead>
          <tr>
            <th className="truth-step-head">step</th>
            {inputs.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
            <th className="truth-divider" aria-hidden="true">
              →
            </th>
            {outputs.map((name) => (
              <th key={name} scope="col" className="is-output">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trace.steps.map((step, index) => (
            <tr key={`${index}-${step.tick ? 'tick' : 'set'}`} className={step.tick ? 'is-tick' : ''} title={stepTitle(inputs, outputs, step)}>
              <td className="truth-step">
                #{index + 1}
                {step.tick && (
                  <span className="truth-tick" title="Clock edge">
                    T
                  </span>
                )}
              </td>
              {inputs.map((name) => (
                <td key={name} className={step.inputs[name] ? 'is-one' : ''}>
                  {bit(step.inputs[name])}
                </td>
              ))}
              <td className="truth-divider" aria-hidden="true" />
              {outputs.map((name) => (
                <td key={name} className={`is-output${step.outputs[name] ? ' is-one' : ''}`}>
                  {bit(step.outputs[name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PuzzleBrief({ section }: PuzzleBriefProps) {
  const goal = section.goal
  const cases = goal?.cases ?? []
  const traces = goal?.traces ?? []
  const traceInputs = (goal?.inputs ?? []).filter((name) => name !== 'clk')

  return (
    <section className="puzzle-brief" aria-label={`Goal: ${section.title}`}>
      <div className="puzzle-brief-head">
        <p className="level-unit-kind">Work order · {section.title}</p>
        <span className="puzzle-verdict">Any valid circuit passes</span>
      </div>
      {section.objective && <p className="puzzle-objective">{section.objective}</p>}
      <p className="puzzle-brief-copy">{section.summary}</p>

      {goal && cases.length > 0 && (
        <details className="puzzle-expected">
          <summary className="puzzle-expected-head">
            <span className="puzzle-expected-title">Full truth table</span>
            <span className="puzzle-expected-count">{cases.length} cases</span>
          </summary>
          <TruthTable inputs={goal.inputs} outputs={goal.outputs} rows={cases} />
        </details>
      )}

      {goal && cases.length === 0 && traces.length > 0 && (
        <details className="puzzle-expected">
          <summary className="puzzle-expected-head">
            <span className="puzzle-expected-title">Full timing trace</span>
            <span className="puzzle-expected-count">
              {traces.length} trace{traces.length === 1 ? '' : 's'}
            </span>
          </summary>

          {traces.map((trace, traceIndex) => (
            <div className="puzzle-expected-trace" key={trace.name ?? traceIndex}>
              <p className="puzzle-expected-trace-name">{trace.name ?? `Trace ${traceIndex + 1}`}</p>
              <TraceTable inputs={traceInputs} outputs={goal.outputs} trace={trace} />
            </div>
          ))}
        </details>
      )}
    </section>
  )
}
