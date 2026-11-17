import { describe, expect, test } from 'bun:test'
import type { Circuit } from '../../src/game/circuit.ts'
import { matchesCircuitGoal } from '../../src/game/behavior.ts'
import { environment } from '../../src/tutorial/environment.ts'
import { logicGoal, multiLogicGoal } from '../../src/tutorial/goals.ts'
import { TUTORIAL_SECTIONS } from '../../src/tutorial/index.ts'

const sectionById = (id: string) => {
  const section = TUTORIAL_SECTIONS.find((candidate) => candidate.id === id)
  if (!section?.goal) throw new Error(`missing puzzle goal ${id}`)
  return section
}

const goalFor = (id: string) => sectionById(id).goal!

const expectAccepted = (id: string, circuit: Circuit) => {
  expect(matchesCircuitGoal(circuit, goalFor(id))).toBe(true)
}

const expectRejected = (id: string, circuit: Circuit) => {
  expect(matchesCircuitGoal(circuit, goalFor(id))).toBe(false)
}

describe('logicGoal', () => {
  test('covers every input combination', () => {
    const twoInput = logicGoal(['a', 'b'], 'y', (a, b) => a || b)
    const threeInput = logicGoal(['a', 'b', 'c'], 'y', (a, b, c) => a && b && c)

    expect(twoInput.cases).toHaveLength(4)
    expect(threeInput.cases).toHaveLength(8)
    expect(new Set(twoInput.cases.map((test) => JSON.stringify(test.inputs))).size).toBe(4)
  })

  test('builds every output of a multi-output truth table', () => {
    const fullAdder = multiLogicGoal(['a', 'b', 'cin'], {
      sum: (a, b, cin) => (a !== b) !== cin,
      cout: (a, b, cin) => (a && b) || (cin && (a !== b)),
    })

    expect(fullAdder.outputs).toEqual(['sum', 'cout'])
    expect(fullAdder.cases).toHaveLength(8)
    expect(fullAdder.cases.find((test) => test.inputs.a && test.inputs.b && test.inputs.cin)?.outputs).toEqual({
      sum: true,
      cout: true,
    })
    expect(fullAdder.cases.find((test) => test.inputs.a && test.inputs.b && !test.inputs.cin)?.outputs).toEqual({
      sum: false,
      cout: true,
    })
  })
})

describe('behavior-based circuit goals', () => {
  test('accepts a direct OR and a De Morgan OR', () => {
    const direct = environment().input('a').input('b').output('y').place('or', { as: 'g' }).wire('in:a', 'g.a').wire('in:b', 'g.b').wire('g.y', 'out:y').build()

    const deMorgan = environment()
      .input('a')
      .input('b')
      .output('y')
      .place('not', { as: 'na' })
      .place('not', { as: 'nb' })
      .place('and', { as: 'both' })
      .place('not', { as: 'result' })
      .wire('in:a', 'na.a')
      .wire('in:b', 'nb.a')
      .wire('na.y', 'both.a')
      .wire('nb.y', 'both.b')
      .wire('both.y', 'result.a')
      .wire('result.y', 'out:y')
      .build()

    expectAccepted('logic-or', direct)
    expectAccepted('logic-or', deMorgan)
    expectRejected('logic-or', environment().input('a').input('b').output('y').place('and', { as: 'g' }).wire('in:a', 'g.a').wire('in:b', 'g.b').wire('g.y', 'out:y').build())
  })

  test('rejects a circuit that only covers some cases', () => {
    const partial = environment()
      .input('a')
      .input('b')
      .output('y')
      .place('or', { as: 'g' })
      .wire('in:a', 'g.a')
      .wire('g.y', 'out:y')
      .build()

    expectRejected('logic-or', partial)
  })

  test('accepts a straightforward solution for every puzzle section', () => {
    expectAccepted('logic-not', environment().input('a').output('y').place('not', { as: 'g' }).wire('in:a', 'g.a').wire('g.y', 'out:y').build())

    expectAccepted(
      'logic-or-priority',
      environment()
        .input('a')
        .input('b')
        .input('enable')
        .output('y')
        .place('or', { as: 'merge' })
        .place('and', { as: 'gate' })
        .wire('in:a', 'merge.a')
        .wire('in:b', 'merge.b')
        .wire('merge.y', 'gate.a')
        .wire('in:enable', 'gate.b')
        .wire('gate.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'logic-not-nand',
      environment()
        .input('a')
        .input('b')
        .output('y')
        .place('and', { as: 'mix' })
        .place('not', { as: 'gate' })
        .wire('in:a', 'mix.a')
        .wire('in:b', 'mix.b')
        .wire('mix.y', 'gate.a')
        .wire('gate.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'logic-or3',
      environment()
        .input('a')
        .input('b')
        .input('c')
        .output('y')
        .place('or', { as: 'ab' })
        .place('or', { as: 'abc' })
        .wire('in:a', 'ab.a')
        .wire('in:b', 'ab.b')
        .wire('ab.y', 'abc.a')
        .wire('in:c', 'abc.b')
        .wire('abc.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'logic-and3',
      environment()
        .input('a')
        .input('b')
        .input('c')
        .output('y')
        .place('and', { as: 'ab' })
        .place('and', { as: 'abc' })
        .wire('in:a', 'ab.a')
        .wire('in:b', 'ab.b')
        .wire('ab.y', 'abc.a')
        .wire('in:c', 'abc.b')
        .wire('abc.y', 'out:y')
        .build(),
    )

    expectAccepted('logic-xor', environment().input('a').input('b').output('y').place('xor', { as: 'g' }).wire('in:a', 'g.a').wire('in:b', 'g.b').wire('g.y', 'out:y').build())

    expectAccepted(
      'logic-xnor',
      environment()
        .input('a')
        .input('b')
        .output('y')
        .place('xor', { as: 'diff' })
        .place('not', { as: 'same' })
        .wire('in:a', 'diff.a')
        .wire('in:b', 'diff.b')
        .wire('diff.y', 'same.a')
        .wire('same.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'logic-nor',
      environment()
        .input('a')
        .input('b')
        .output('y')
        .place('or', { as: 'merge' })
        .place('not', { as: 'gate' })
        .wire('in:a', 'merge.a')
        .wire('in:b', 'merge.b')
        .wire('merge.y', 'gate.a')
        .wire('gate.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'logic-mux',
      environment()
        .input('a')
        .input('b')
        .input('sel')
        .output('y')
        .place('mux2', { as: 'route' })
        .wire('in:a', 'route.a')
        .wire('in:b', 'route.b')
        .wire('in:sel', 'route.sel')
        .wire('route.y', 'out:y')
        .build(),
    )

    expectAccepted(
      'memory-d-flip-flop',
      environment()
        .input('d')
        .clock()
        .output('q')
        .place('d-flip-flop', { as: 'latch' })
        .wire('in:d', 'latch.d')
        .wire('in:clk', 'latch.clk')
        .wire('latch.q', 'out:q')
        .build(),
    )

    expectAccepted(
      'memory-shift',
      environment()
        .input('d')
        .clock()
        .output('q0')
        .output('q1')
        .place('d-flip-flop', { as: 'first' })
        .place('d-flip-flop', { as: 'second' })
        .wire('in:d', 'first.d')
        .wire('in:clk', 'first.clk')
        .wire('in:clk', 'second.clk')
        .wire('first.q', 'second.d')
        .wire('first.q', 'out:q0')
        .wire('second.q', 'out:q1')
        .build(),
    )
  })

  test('accepts direct and alternate constructions for the later capstone puzzles', () => {
    expectAccepted(
      'logic-full-adder',
      environment()
        .input('a')
        .input('b')
        .input('cin')
        .output('sum')
        .output('cout')
        .place('full-adder', { as: 'add' })
        .wire('in:a', 'add.a')
        .wire('in:b', 'add.b')
        .wire('in:cin', 'add.cin')
        .wire('add.sum', 'out:sum')
        .wire('add.cout', 'out:cout')
        .build(),
    )

    expectAccepted(
      'logic-full-adder',
      environment()
        .input('a')
        .input('b')
        .input('cin')
        .output('sum')
        .output('cout')
        .place('xor', { as: 'feed-sum' })
        .place('xor', { as: 'total-sum' })
        .place('and', { as: 'feed-carry' })
        .place('and', { as: 'carry-in' })
        .place('or', { as: 'carry-out' })
        .wire('in:a', 'feed-sum.a')
        .wire('in:b', 'feed-sum.b')
        .wire('feed-sum.y', 'total-sum.a')
        .wire('in:cin', 'total-sum.b')
        .wire('in:a', 'feed-carry.a')
        .wire('in:b', 'feed-carry.b')
        .wire('feed-sum.y', 'carry-in.a')
        .wire('in:cin', 'carry-in.b')
        .wire('feed-carry.y', 'carry-out.a')
        .wire('carry-in.y', 'carry-out.b')
        .wire('total-sum.y', 'out:sum')
        .wire('carry-out.y', 'out:cout')
        .build(),
    )

    expectAccepted(
      'logic-compare2',
      environment()
        .input('a1')
        .input('a0')
        .input('b1')
        .input('b0')
        .output('match')
        .place('xnor', { as: 'high' })
        .place('xnor', { as: 'low' })
        .place('and', { as: 'both' })
        .wire('in:a1', 'high.a')
        .wire('in:b1', 'high.b')
        .wire('in:a0', 'low.a')
        .wire('in:b0', 'low.b')
        .wire('high.y', 'both.a')
        .wire('low.y', 'both.b')
        .wire('both.y', 'out:match')
        .build(),
    )

    expectAccepted(
      'logic-compare2',
      environment()
        .input('a1')
        .input('a0')
        .input('b1')
        .input('b0')
        .output('match')
        .place('xor', { as: 'high-diff' })
        .place('xor', { as: 'low-diff' })
        .place('nor', { as: 'same' })
        .wire('in:a1', 'high-diff.a')
        .wire('in:b1', 'high-diff.b')
        .wire('in:a0', 'low-diff.a')
        .wire('in:b0', 'low-diff.b')
        .wire('high-diff.y', 'same.a')
        .wire('low-diff.y', 'same.b')
        .wire('same.y', 'out:match')
        .build(),
    )

    expectAccepted(
      'logic-decoder2to4',
      environment()
        .input('s1')
        .input('s0')
        .output('q0')
        .output('q1')
        .output('q2')
        .output('q3')
        .place('decoder2to4', { as: 'quad' })
        .wire('in:s1', 'quad.b')
        .wire('in:s0', 'quad.a')
        .wire('quad.y0', 'out:q0')
        .wire('quad.y1', 'out:q1')
        .wire('quad.y2', 'out:q2')
        .wire('quad.y3', 'out:q3')
        .build(),
    )

    expectAccepted(
      'logic-decoder2to4',
      environment()
        .input('s1')
        .input('s0')
        .output('q0')
        .output('q1')
        .output('q2')
        .output('q3')
        .place('not', { as: 'ns1' })
        .place('not', { as: 'ns0' })
        .place('and', { as: 'q0' })
        .place('and', { as: 'q1' })
        .place('and', { as: 'q2' })
        .place('and', { as: 'q3' })
        .wire('in:s1', 'ns1.a')
        .wire('in:s0', 'ns0.a')
        .wire('ns1.y', 'q0.a')
        .wire('ns0.y', 'q0.b')
        .wire('ns1.y', 'q1.a')
        .wire('in:s0', 'q1.b')
        .wire('in:s1', 'q2.a')
        .wire('ns0.y', 'q2.b')
        .wire('in:s1', 'q3.a')
        .wire('in:s0', 'q3.b')
        .wire('q0.y', 'out:q0')
        .wire('q1.y', 'out:q1')
        .wire('q2.y', 'out:q2')
        .wire('q3.y', 'out:q3')
        .build(),
    )
  })

  test('later circuit stages are puzzle mode and carry a goal', () => {
    const puzzleIds = [
      'logic-or',
      'logic-or-priority',
      'logic-not',
      'logic-not-nand',
      'logic-or3',
      'logic-and3',
      'logic-xor',
      'logic-xnor',
      'logic-nor',
      'logic-mux',
      'logic-full-adder',
      'logic-compare2',
      'logic-decoder2to4',
      'memory-d-flip-flop',
      'memory-shift',
    ]

    for (const id of puzzleIds) {
      const section = sectionById(id)
      expect(section.mode).toBe('puzzle')
      expect((section.goal?.cases?.length ?? 0) + (section.goal?.traces?.length ?? 0)).toBeGreaterThan(0)
      expect(matchesCircuitGoal(section.start, section.goal!)).toBe(false)
    }

    for (const id of ['logic-full-adder', 'logic-compare2', 'logic-decoder2to4']) {
      const goal = goalFor(id)
      expect(goal.cases).toHaveLength(2 ** goal.inputs.length)
    }
  })
})
