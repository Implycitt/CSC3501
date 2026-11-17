import { CAMPAIGN_KEY } from '../../game/campaign.ts'
import { PROGRESS_KEY } from '../../tutorial/progress.ts'

// TEMPORARY testing control. Remove this component and its render in Game.tsx
// once playtesting is finished.
export default function TestResetButton() {
  const resetProgress = () => {
    if (!window.confirm('Reset all circuit, firmware, and campaign progress? Saved custom parts will stay.')) {
      return
    }

    try {
      localStorage.removeItem(PROGRESS_KEY)
      localStorage.removeItem(CAMPAIGN_KEY)
    } catch {
      window.alert('Could not clear saved progress. Check that local storage is available for this origin.')
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={resetProgress}
      title="Testing only: clear circuit and campaign progress"
      className="fixed bottom-3 left-3 z-40 border border-dashed border-[var(--palette-amber)] bg-[var(--palette-surface)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--palette-amber)] opacity-80 hover:opacity-100"
    >
      Reset progress
    </button>
  )
}
