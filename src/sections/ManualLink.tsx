import type { ReactNode } from 'react'
import type { ManualTab } from './game/FieldManual.tsx'
import { manualLabel, manualTabFor, type ManualSection } from './manualLinks.ts'

interface ManualLinkProps {
  section: ManualSection
  onOpen?: (tab: ManualTab, section?: string) => void
  className?: string
  children?: ReactNode
}

export default function ManualLink({
  section,
  onOpen,
  className = 'manual-link',
  children,
}: ManualLinkProps) {
  if (!onOpen) return null

  return (
    <button
      type="button"
      className={className}
      aria-label={`Open the ${manualLabel(section)} manual section`}
      onClick={() => onOpen(manualTabFor(section), section)}
    >
      {children ?? `Manual · ${manualLabel(section)} →`}
    </button>
  )
}
