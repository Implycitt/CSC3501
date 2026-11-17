import { describe, expect, test } from 'bun:test'
import { COMPONENT_REFERENCES, referenceFor } from '../../src/game/componentReferences.ts'
import { allComponents } from '../../src/game/registry.ts'
import type { ComponentDef } from '../../src/game/types.ts'

const baseComponents = () => allComponents().filter((component) => component.category !== 'custom')

describe('component references', () => {
  test('every base component has a reference and no stale keys remain', () => {
    const baseIds = baseComponents()
      .map((component) => component.id)
      .sort()

    expect(Object.keys(COMPONENT_REFERENCES).sort()).toEqual(baseIds)
  })

  test('every reference has behavior text and structurally valid example rows', () => {
    for (const [id, reference] of Object.entries(COMPONENT_REFERENCES)) {
      expect(id.length).toBeGreaterThan(0)
      expect(reference.behavior.trim().length).toBeGreaterThan(0)
      if (!reference.example) continue

      const { caption, headers, rows } = reference.example
      expect(caption.trim().length).toBeGreaterThan(0)
      expect(headers.length).toBeGreaterThan(0)
      expect(rows.length).toBeGreaterThan(0)

      for (const header of headers) expect(header.trim().length).toBeGreaterThan(0)
      for (const row of rows) {
        expect(row).toHaveLength(headers.length)
        for (const cell of row) expect(cell.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('built parts get a generic reference', () => {
    const builtPart: ComponentDef = {
      id: 'built:test',
      name: 'Test Part',
      category: 'custom',
      description: 'Built from 2 parts.',
    }

    expect(referenceFor(builtPart)?.behavior).toContain('inputs and outputs')
  })
})
