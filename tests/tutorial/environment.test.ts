import { describe, expect, test } from 'bun:test'
import { environment } from '../../src/tutorial/environment.ts'

describe('environment', () => {
  test('collects inputs, outputs and the clock without duplicates', () => {
    const circuit = environment().input('a').input('a').output('y').clock().build()

    expect(circuit.inputs).toEqual(['a', 'clk'])
    expect(circuit.outputs).toEqual(['y'])
    expect(circuit.parts).toEqual([])
    expect(circuit.wires).toEqual([])
    expect(circuit.layout).toEqual({})
  })

  test('wires named parts through their aliases', () => {
    const circuit = environment()
      .input('a')
      .input('b')
      .output('y')
      .place('and', { as: 'gate' })
      .wire('in:a', 'gate.a')
      .wire('in:b', 'gate.b')
      .wire('gate.y', 'out:y')
      .build()

    expect(circuit.parts).toHaveLength(1)
    expect(circuit.wires).toEqual([
      { from: 'in:a', to: 'part:t0:a' },
      { from: 'in:b', to: 'part:t0:b' },
      { from: 'part:t0:y', to: 'out:y' },
    ])
  })

  test('defaults the alias to the component id', () => {
    const circuit = environment().place('not').wire('in:a', 'not.a').build()

    expect(circuit.wires[0]).toEqual({ from: 'in:a', to: 'part:t0:a' })
  })

  test('places parts at distinct default positions', () => {
    const circuit = environment().place('and', { as: 'one' }).place('or', { as: 'two' }).build()
    const [first, second] = circuit.parts

    expect(first.x).not.toBe(second.x)
    expect(first.uid).not.toBe(second.uid)
  })

  test('honours explicit positions', () => {
    const circuit = environment().place('and', { as: 'gate', x: 10, y: 20 }).build()

    expect(circuit.parts[0]).toMatchObject({ x: 10, y: 20 })
  })

  test('rejects a duplicate alias', () => {
    expect(() => environment().place('and', { as: 'gate' }).place('or', { as: 'gate' })).toThrow(/already placed/)
  })

  test('rejects an unknown alias while the section is defined', () => {
    expect(() => environment().wire('in:a', 'missing.a')).toThrow(/unknown part/)
  })

  test('rejects a malformed endpoint', () => {
    expect(() => environment().place('and', { as: 'gate' }).wire('in:a', 'gate')).toThrow(/needs a port/)
    expect(() => environment().wire('a', 'out:y')).toThrow(/needs a port|unknown part/)
  })

  test('returns copies so built circuits do not share state', () => {
    const builder = environment().input('a').place('and')
    const first = builder.build()
    first.inputs.push('b')
    first.parts[0].x = 999

    const second = builder.build()

    expect(second.inputs).toEqual(['a'])
    expect(second.parts[0].x).not.toBe(999)
  })
})
