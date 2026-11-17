import { referenceFor } from './componentReferences.ts'
import type { ComponentCategory, ComponentDef } from './types.ts'

export interface ComponentCategoryGroup {
  category: ComponentCategory
  label: string
}

export interface ComponentGroup extends ComponentCategoryGroup {
  parts: ComponentDef[]
}

export const COMPONENT_CATEGORY_GROUPS: readonly ComponentCategoryGroup[] = [
  { category: 'logic', label: 'Logic gates' },
  { category: 'arithmetic', label: 'Arithmetic' },
  { category: 'routing', label: 'Routing' },
  { category: 'memory', label: 'Memory' },
  { category: 'historical', label: 'Historical' },
  { category: 'custom', label: 'Built parts' },
]

export const componentCategoryLabel = (category: ComponentCategory): string =>
  COMPONENT_CATEGORY_GROUPS.find((group) => group.category === category)?.label ?? category

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Searches the same text a player is likely to know: the part's name, id,
 * description, category, and the short behavior line from its reference.
 */
export function componentMatchesQuery(part: ComponentDef, query: string): boolean {
  const needle = normalize(query)
  if (!needle) return true

  const reference = referenceFor(part)
  return normalize(
    [part.id, part.name, part.description, componentCategoryLabel(part.category), reference?.behavior ?? ''].join(' '),
  ).includes(needle)
}

export function groupComponentsByCategory(parts: readonly ComponentDef[], query = ''): ComponentGroup[] {
  const visible = parts.filter((part) => componentMatchesQuery(part, query))

  return COMPONENT_CATEGORY_GROUPS.flatMap((group) => {
    const groupParts = visible.filter((part) => part.category === group.category)
    return groupParts.length > 0 ? [{ ...group, parts: groupParts }] : []
  })
}
