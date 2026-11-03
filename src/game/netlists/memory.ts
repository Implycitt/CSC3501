import type { Instance, Netlist } from '../types.ts'

const WORDS = 16
const WIDTH = 8
const DATA_LETTERS = 'abcdefghijklmnop'.split('')

function ram16x8(): Netlist {
  const instances: Instance[] = [
    {
      id: 'dec',
      component: 'decoder4to16',
      connections: {
        a: 'a0',
        b: 'a1',
        c: 'a2',
        d: 'a3',
        ...Object.fromEntries(Array.from({ length: WORDS }, (_, word) => [`y${word}`, `sel${word}`])),
      },
    },
  ]

  for (let word = 0; word < WORDS; word++) {
    instances.push({
      id: `en${word}`,
      component: 'and',
      connections: { a: 'we', b: `sel${word}`, y: `write${word}` },
    })

    const register: Record<string, string> = { en: `write${word}`, clk: 'clk' }
    for (let bit = 0; bit < WIDTH; bit++) {
      register[`d${bit}`] = `d${bit}`
      register[`q${bit}`] = `w${word}_${bit}`
    }
    instances.push({ id: `reg${word}`, component: 'register8', connections: register })
  }

  for (let bit = 0; bit < WIDTH; bit++) {
    const mux: Record<string, string> = {
      s0: 'a0',
      s1: 'a1',
      s2: 'a2',
      s3: 'a3',
      y: `q${bit}`,
    }
    DATA_LETTERS.forEach((letter, word) => (mux[letter] = `w${word}_${bit}`))
    instances.push({ id: `read${bit}`, component: 'mux16', connections: mux })
  }

  return {
    inputs: ['a0', 'a1', 'a2', 'a3', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'we', 'clk'],
    outputs: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
    instances,
  }
}

export const MEMORY_NETLISTS: Record<string, Netlist> = {
  ram16x8: ram16x8(),
}
