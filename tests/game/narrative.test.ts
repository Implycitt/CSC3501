import { describe, expect, test } from 'bun:test'
import {
  CHAPTERS,
  ENDINGS,
  LOG_FRAGMENTS,
  STAGES_BY_CHAPTER,
  STORY_BEATS,
  allStagesForChapter,
  beatById,
  chapterRecord,
  endingById,
  logById,
  missionIntroLines,
} from '../../src/game/narrative.ts'
import { ALL_STAGES, systemById } from '../../src/game/ship.ts'

describe('narrative data', () => {
  test('covers all 37 stages and all seven chapters', () => {
    expect(CHAPTERS).toHaveLength(7)
    expect(LOG_FRAGMENTS).toHaveLength(7)
    expect(ENDINGS).toHaveLength(3)
    expect(ALL_STAGES).toHaveLength(37)
    expect(STORY_BEATS.filter((beat) => beat.trigger === 'stage-open')).toHaveLength(37)
    expect(STORY_BEATS.filter((beat) => beat.trigger === 'stage-complete')).toHaveLength(37)
    expect(STORY_BEATS.filter((beat) => beat.trigger === 'first-fail')).toHaveLength(14)
    expect(Object.values(STAGES_BY_CHAPTER).flat()).toHaveLength(37)
  })

  test('every stage has an open beat and a completion beat', () => {
    for (const stage of ALL_STAGES) {
      const beats = STORY_BEATS.filter((beat) => beat.stageId === stage.id)
      expect(beats.filter((beat) => beat.trigger === 'stage-open')).toHaveLength(1)
      expect(beats.filter((beat) => beat.trigger === 'stage-complete')).toHaveLength(1)
    }
  })

  test('every mission opens with a two-line MIRA introduction', () => {
    for (const stage of ALL_STAGES) {
      const lines = missionIntroLines(stage.id)
      expect(lines).toHaveLength(2)
      expect(lines[0]).toBe(beatById(`${stage.id}:open`)?.text)
      expect(lines[1].length).toBeGreaterThan(0)
    }
    expect(missionIntroLines('missing-stage')).toEqual([])
  })

  test('only firmware stages have a first-fail beat', () => {
    for (const stage of ALL_STAGES) {
      const firstFail = beatById(`${stage.id}:first-fail`)
      expect(Boolean(firstFail)).toBe(stage.kind === 'firmware')
    }
  })

  test('every chapter opens on its first stage and has one record and turn', () => {
    for (const chapter of CHAPTERS) {
      const system = systemById(chapter.systemId)
      expect(system).toBeDefined()
      const firstStage = system?.stages[0]
      const lastStage = system?.stages[system.stages.length - 1]
      const opening = beatById(chapter.openingBeatId)
      const turn = beatById(chapter.turnBeatId)
      const record = logById(chapter.recordId)

      expect(firstStage).toBeDefined()
      expect(opening?.stageId).toBe(firstStage?.id)
      expect(opening?.trigger).toBe('stage-open')
      expect(turn?.trigger).toBe('chapter-complete')
      expect(turn?.chapterId).toBe(chapter.id)
      expect(record?.chapterId).toBe(chapter.id)
      expect(record?.recoveredAtStageId).toBe(lastStage?.id)
      expect(chapterRecord(chapter.id)?.id).toBe(chapter.recordId)
    }
  })

  test('beat, log, and ending ids are unique and resolvable', () => {
    const beatIds = STORY_BEATS.map((beat) => beat.id)
    const logIds = LOG_FRAGMENTS.map((fragment) => fragment.id)
    const endingIds = ENDINGS.map((ending) => ending.id)

    expect(new Set(beatIds).size).toBe(beatIds.length)
    expect(new Set(logIds).size).toBe(logIds.length)
    expect(new Set(endingIds).size).toBe(endingIds.length)

    for (const beat of STORY_BEATS) {
      expect(beat.text.length).toBeGreaterThan(0)
      expect(beatById(beat.id)).toBe(beat)
    }
    for (const fragment of LOG_FRAGMENTS) {
      expect(fragment.title.length).toBeGreaterThan(0)
      expect(fragment.body.length).toBeGreaterThan(0)
      expect(logById(fragment.id)).toBe(fragment)
    }
    for (const ending of ENDINGS) {
      expect(ending.title.length).toBeGreaterThan(0)
      expect(ending.body.length).toBeGreaterThan(0)
      expect(ending.finalLine.length).toBeGreaterThan(0)
      expect(endingById(ending.id)).toBe(ending)
    }
  })

  test('every beat references a real chapter and stage, and every chapter owns real stages', () => {
    const chapterIds = new Set(CHAPTERS.map((chapter) => chapter.id))
    const stageIds = new Set(ALL_STAGES.map((stage) => stage.id))

    for (const beat of STORY_BEATS) {
      expect(chapterIds.has(beat.chapterId)).toBe(true)
      if (beat.stageId) expect(stageIds.has(beat.stageId)).toBe(true)
    }

    for (const chapter of CHAPTERS) {
      const stages = allStagesForChapter(chapter.id)
      expect(stages.length).toBeGreaterThan(0)
      for (const stageId of stages) expect(stageIds.has(stageId)).toBe(true)
    }
  })

  test('keeps MIRA copy short and free of visible fix instructions', () => {
    for (const beat of STORY_BEATS) {
      expect(beat.text.length).toBeLessThanOrEqual(220)
      expect(beat.text.toLowerCase()).not.toContain('fix:')
    }
  })
})
