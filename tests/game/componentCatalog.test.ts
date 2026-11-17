import { describe, expect, test } from 'bun:test'
import {
  COMPONENT_CATEGORY_GROUPS,
  componentMatchesQuery,
  groupComponentsByCategory,
} from '../../src/game/componentCatalog.ts'
import { allComponents } from '../../src/game/registry.ts'

const baseParts = () => allComponents().filter((part) => part.category !== 'custom')

const partById = (id: string) => {
  const part = baseParts().find((candidate) => candidate.id === id)
  if (!part) throw new Error(`missing component ${id}`)
  return part
}

describe('component catalog', () => {
  test('groups every base part exactly once, in category order', () => {
    const parts = baseParts()
    const groups = groupComponentsByCategory(parts)
    const grouped = groups.flatMap((group) => group.parts)
    const expectedCategories = COMPONENT_CATEGORY_GROUPS.filter((group) =>
      parts.some((part) => part.category === group.category),
    ).map((group) => group.category)

    expect(grouped).toHaveLength(parts.length)
    expect(new Set(grouped.map((part) => part.id)).size).toBe(parts.length)
    expect(groups.map((group) => group.category)).toEqual(expectedCategories)
  })

  test('search matches names, ids, descriptions, categories, and behavior', () => {
    expect(componentMatchesQuery(partById('full-adder'), 'full adder')).toBe(true)
    expect(componentMatchesQuery(partById('adder2'), 'adder2')).toBe(true)
    expect(componentMatchesQuery(partById('full-adder'), 'carry out')).toBe(true)
    expect(componentMatchesQuery(partById('and'), 'logic gates')).toBe(true)
    expect(componentMatchesQuery(partById('and'), 'not a real part')).toBe(false)
  })

  test('filtering removes empty categories and reports no results', () => {
    const registers = groupComponentsByCategory(baseParts(), 'register')

    expect(registers.map((group) => group.category)).toEqual(['memory', 'historical'])
    expect(registers[0].parts.map((part) => part.id)).toContain('register4')
    expect(registers[1].parts.map((part) => part.id)).toContain('mercury-delay-line')
    expect(groupComponentsByCategory(baseParts(), 'not a real part')).toEqual([])
  })
})
