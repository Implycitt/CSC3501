import type { CircuitCase, CircuitTraceStep } from '../../game/behavior.ts'
import type { TutorialSection } from '../../tutorial/types.ts'

interface PuzzleBriefProps {
  section: TutorialSection
}

const bit = (value: boolean | undefined) => (value ? '1' : '0')

const bitsFor = (names: string[], values: Record<string, boolean>) =>
  names.map((name) => bit(values[name])).join('')

const labelFor = (names: string[], values: Record<string, boolean>) =>
  names.map((name) => `${name}=${bit(values[name])}`).join(' ')

function codeTitle(inputs: string[], outputs: string[], step?: CircuitTraceStep): string {
  const inputText = labelFor(inputs, step?.inputs ?? {})
  const outputText = labelFor(outputs, step?.outputs ?? {})
  return `${inputText} → ${outputText}`
}

function CaseChip({
  inputs,
  outputs,
  values,
}: {
  inputs: string[]
  outputs: string[]
  values: CircuitCase
}) {
  return (
    <span className="expected-case" title={codeTitle(inputs, outputs, values)}>
      <span className="expected-inputs">{bitsFor(inputs, values.inputs)}</span>
      <span className="expected-arrow" aria-hidden="true">
        →
      </span>
      <span className="expected-outputs">{bitsFor(outputs, values.outputs)}</span>
    </span>
  )
}

function StepChip({
  inputs,
  outputs,
  step,
  index,
}: {
  inputs: string[]
  outputs: string[]
  step: CircuitTraceStep
  index: number
}) {
  return (
    <span className={`expected-case${step.tick ? ' is-tick' : ''}`} title={codeTitle(inputs, outputs, step)}>
      <span className="expected-step">#{index + 1}</span>
      {step.tick && <span className="expected-tick">TICK</span>}
      <span className="expected-inputs">{bitsFor(inputs, step.inputs)}</span>
      <span className="expected-arrow" aria-hidden="true">
        →
      </span>
      <span className="expected-outputs">{bitsFor(outputs, step.outputs)}</span>
    </span>
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
        <div className="puzzle-expected" role="region" aria-label="Expected output for every input case">
          <div className="puzzle-expected-head">
            <span className="puzzle-expected-title">Expected output</span>
            <span className="puzzle-expected-legend">
              <b>{goal.inputs.join(' ')}</b>
              <span aria-hidden="true"> → </span>
              <b className="is-output">{goal.outputs.join(' ')}</b>
            </span>
          </div>
          <div className="puzzle-expected-cases">
            {cases.map((values, index) => (
              <CaseChip
                key={values.name ?? index}
                inputs={goal.inputs}
                outputs={goal.outputs}
                values={values}
              />
            ))}
          </div>
          <p className="puzzle-brief-note">
            All {cases.length} input combinations are shown. Any gate choice and layout passes.
          </p>
        </div>
      )}

      {goal && cases.length === 0 && traces.length > 0 && (
        <div className="puzzle-expected" role="region" aria-label="Expected output for each clocked trace">
          <div className="puzzle-expected-head">
            <span className="puzzle-expected-title">Expected output</span>
            <span className="puzzle-expected-legend">
              <b>step · {traceInputs.join(' ')}</b>
              <span aria-hidden="true"> → </span>
              <b className="is-output">{goal.outputs.join(' ')}</b>
            </span>
          </div>
          {traces.map((trace, traceIndex) => (
            <div className="puzzle-expected-trace" key={trace.name ?? traceIndex}>
              <p className="puzzle-expected-trace-name">{trace.name ?? `Trace ${traceIndex + 1}`}</p>
              <div className="puzzle-expected-cases">
                {trace.steps.map((step, stepIndex) => (
                  <StepChip
                    key={`${traceIndex}-${stepIndex}`}
                    inputs={traceInputs}
                    outputs={goal.outputs}
                    step={step}
                    index={stepIndex}
                  />
                ))}
              </div>
            </div>
          ))}
          <p className="puzzle-brief-note">
            TICK marks a clock edge. Advance at least one edge; the check runs automatically. Any latch choice and layout
            passes.
          </p>
        </div>
      )}
    </section>
  )
}
