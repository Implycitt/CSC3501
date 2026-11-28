import { describe, expect, test } from 'bun:test'
import { DESIGNS_KEY, resetProgress } from '../../src/game/library.ts'

describe('resetProgress', () => {
  test('clears everything the game saved except saved designs', () => {
    const data = new Map<string, string>(
      Object.entries({
        'csc3501.campaign.v1': '{}',
        'csc3501.story.v1': '{"ending":"turn-home"}',
        'csc3501.bench.v1': '{"intro-and":{"ticks":0}}',
        'csc3501.tutorial.v1': '{}',
        'csc3501.manualCue.v1': 'seen',
        'csc3501.anything-added-later.v9': 'x',
        [DESIGNS_KEY]: '[]',
        'someone-elses-key': 'keep',
      }),
    )
    const storage = {
      get length() {
        return data.size
      },
      key: (index: number) => [...data.keys()][index] ?? null,
      removeItem: (key: string) => {
        data.delete(key)
      },
    }

    resetProgress(storage)

    expect([...data.keys()]).toEqual([DESIGNS_KEY, 'someone-elses-key'])
  })
})
