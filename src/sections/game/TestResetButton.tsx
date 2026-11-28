import { resetProgress } from '../../game/library.ts'

// TEMPORARY testing control. Remove this component and its render in Game.tsx
// once playtesting is finished.
export default function TestResetButton() {
  const confirmReset = () => {
    if (!window.confirm('Reset all circuit, firmware, campaign, and story progress? Saved custom parts will stay.')) {
      return
    }

    try {
      resetProgress(localStorage)
    } catch {
      window.alert('Could not clear saved progress. Check that local storage is available for this origin.')
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={confirmReset}
      title="Testing only: clear circuit, campaign, and story progress"
      className="fixed bottom-3 left-3 z-40 border border-dashed border-[var(--palette-amber)] bg-[var(--palette-surface)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--palette-amber)] opacity-80 hover:opacity-100"
    >
      Reset progress
    </button>
  )
}
