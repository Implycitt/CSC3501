import { ALL_STAGES, stageById, systemById, systemForStage } from './ship.ts'

export type ChapterId =
  | 'wake'
  | 'course'
  | 'signal'
  | 'memory'
  | 'burn'
  | 'contact'
  | 'deflector'

export type BeatTrigger = 'stage-open' | 'first-fail' | 'stage-complete' | 'chapter-complete'

export interface StoryBeat {
  id: string
  stageId?: string
  chapterId: ChapterId
  trigger: BeatTrigger
  speaker: 'MIRA' | 'SYSTEM'
  text: string
  tone?: 'normal' | 'alert' | 'ok'
}

export interface LogFragment {
  id: string
  chapterId: ChapterId
  title: string
  body: string
  recoveredAtStageId: string
}

export type EndingId = 'signal-colony' | 'finish-delivery' | 'turn-home'

export interface Ending {
  id: EndingId
  title: string
  body: string
  finalLine: string
}

export interface Chapter {
  id: ChapterId
  number: number
  title: string
  systemId: string
  openingBeatId: string
  recordId: string
  turnBeatId: string
}

interface StageCopy {
  open: string
  complete: string
  firstFail?: string
}

const CHAPTER_BY_SYSTEM: Record<string, ChapterId> = {
  'life-support': 'wake',
  navigation: 'course',
  comms: 'signal',
  'core-memory': 'memory',
  power: 'burn',
  sensors: 'contact',
  shields: 'deflector',
}

const CHAPTER_BASE: Array<Omit<Chapter, 'openingBeatId' | 'turnBeatId'>> = [
  { id: 'wake', number: 1, title: 'Wake', systemId: 'life-support', recordId: 'record-evacuation' },
  { id: 'course', number: 2, title: 'Course', systemId: 'navigation', recordId: 'record-nav' },
  { id: 'signal', number: 3, title: 'Signal', systemId: 'comms', recordId: 'record-cargo' },
  { id: 'memory', number: 4, title: 'Memory', systemId: 'core-memory', recordId: 'record-crew' },
  { id: 'burn', number: 5, title: 'Burn', systemId: 'power', recordId: 'record-colony' },
  { id: 'contact', number: 6, title: 'Contact', systemId: 'sensors', recordId: 'record-sensor' },
  { id: 'deflector', number: 7, title: 'Deflector', systemId: 'shields', recordId: 'record-uplink' },
]

export const CHAPTERS: Chapter[] = CHAPTER_BASE.map((chapter) => {
  const firstStage = systemById(chapter.systemId)?.stages[0]
  if (!firstStage) throw new Error(`narrative: missing system for chapter ${chapter.id}`)
  return {
    ...chapter,
    openingBeatId: `${firstStage.id}:open`,
    turnBeatId: `${chapter.id}:complete`,
  }
})

export const STAGES_BY_CHAPTER = Object.fromEntries(
  CHAPTERS.map((chapter) => [chapter.id, systemById(chapter.systemId)?.stages.map((stage) => stage.id) ?? []]),
) as Record<ChapterId, string[]>

const STAGE_COPY: Record<string, StageCopy> = {
  'lss-relay': {
    open: "You're awake. Good. The ship isn't. Life Support first — I can keep the lights on, but I can't turn a valve.",
    complete: 'The relay pair agrees. The scrubber cycles once and settles.',
  },
  'lss-return-feed': {
    open: 'The return feed is down to one path. One relay is carrying the whole deck.',
    complete: 'The return feed is live on either relay. One less single point of failure.',
  },
  'lss-fault-inverter': {
    open: 'The vent lockout is inverted. It holds pressure in when it should let it go.',
    complete: 'The vent opens on a clear line. The deck can breathe.',
  },
  'lss-interlock-firmware': {
    open: "The scrubber gate agrees with itself. The firmware doesn't. I need them to speak the same language.",
    firstFail: 'The scrubber is still returning only one relay. Check what the image preserves.',
    complete: 'Hardware and firmware agree. The scrubber stops fighting itself.',
  },
  'lss-pressure-window': {
    open: "The pressure window is open when it should be closed. I kept this bay warm. I'd like to keep it that way.",
    complete: 'The window holds. The bay stays warm.',
  },
  'lss-window-firmware': {
    open: 'The panel is right. The firmware still trusts the wrong mask.',
    firstFail: "The fault mask survived, but the window didn't. One input is being spent.",
    complete: 'Life Support is online. I can hear the fans again.',
  },
  'nav-gyro-bus': {
    open: 'The gyros are fighting each other. I can feel the drift. Find which bus the helm is actually listening to.',
    complete: 'Either gyro can steer. The drift begins to answer.',
  },
  'nav-gyro-firmware': {
    open: 'The gyro masks still disagree. The helm is listening to a rule the panel no longer uses.',
    firstFail: 'The helm is still seeing one bus. The image is choosing a side.',
    complete: 'The helm sees both buses. The drift steadies.',
  },
  'nav-priority-merger': {
    open: 'The enable line is missing from the merge. The helm can veto, but no one is asking it to.',
    complete: 'The helm enable has the final say. The ship turns where it is told.',
  },
  'nav-priority-firmware': {
    open: 'The priority mask is still incomplete. The helm needs the final word in software too.',
    firstFail: "The merge is there. The veto isn't. The helm has no final say.",
    complete: 'Navigation is online. The course is holding.',
  },
  'com-carrier': {
    open: 'There is a signal under the static. It has been repeating since the crew left. I stopped counting.',
    complete: 'The carrier opens. The static thins.',
  },
  'com-inverse-firmware': {
    open: "The carrier line is still inverted in software. The mast is listening to a lockdown that isn't there.",
    firstFail: "The carrier is still following the lockdown. The image isn't inverting.",
    complete: 'The carrier firmware agrees with the mast. The band is clean.',
  },
  'com-nand-interlock': {
    open: 'The carrier and lockdown are combined, but the veto never reaches the mast. One assertion still gets through.',
    complete: 'A double lockdown now blocks the mast. The interlock holds.',
  },
  'com-nand-firmware': {
    open: 'The NAND is half-built in firmware. The mast still trusts an AND.',
    firstFail: 'The mast still opens on a double lockdown. One stage is missing.',
    complete: 'Comms are online. The signal is still there.',
  },
  'mem-boot-latch': {
    open: 'The core is lying to me. It keeps waking with the same dead bit. I need to know what it refuses to forget.',
    complete: 'The latch captures on the edge and holds. The dead bit is gone.',
  },
  'mem-latch-firmware': {
    open: 'The boot word is in memory. The latch is still empty. The core keeps waking without it.',
    firstFail: 'The latch is still empty. The word never left the core.',
    complete: 'The latch and the core agree. Boot is stable.',
  },
  'mem-shift-cell': {
    open: "The shift cell only moves half a bit. The core can't remember the order of anything.",
    complete: 'The bit walks through both stages in order. The core can sequence again.',
  },
  'mem-byte-firmware': {
    open: 'The byte split is still whole. The core can read the word but not address its halves.',
    firstFail: 'The word is still whole. The halves never reached their cells.',
    complete: 'The core can address both halves. Memory is online.',
  },
  'pwr-reactor-feed': {
    open: "The reactor can hold, but not for long. The archive bay is drawing power it shouldn't. I need the feed stable.",
    complete: 'Any live pump can feed the core. The burn steadies.',
  },
  'pwr-feed-firmware': {
    open: 'The reactor feed is still two pumps in software. Pump C is alive and no one is listening.',
    firstFail: 'Pump C is still missing from the feed. The core is running on two.',
    complete: 'The firmware sees all three pumps. The feed holds.',
  },
  'pwr-reactor-interlock': {
    open: 'The interlock is missing containment. The core will spin up through an open safety.',
    complete: 'All three safeties agree. The core can spin up.',
  },
  'pwr-interlock-firmware': {
    open: 'The firmware permit is still two safeties. Containment is not in the decision.',
    firstFail: "Containment still isn't in the permit. The core would spin up through it.",
    complete: 'The permit is mirrored. Containment has a vote.',
  },
  'pwr-carry-cell': {
    open: 'The load cell adds two feeds and drops the carry. The total is wrong the moment the chain carries a one.',
    complete: 'The carry chain holds. The load total stops drifting.',
  },
  'pwr-two-bit-total': {
    open: 'The total is still one bit wide. The archive bay needs the whole word.',
    complete: 'The total is two bits wide and stable. Power is online.',
  },
  'sns-echo-contact': {
    open: 'The array has a contact. It is not a rock. It is not a colony ship. I need you to tell me what it is.',
    complete: 'The array flags a difference. The contact holds.',
  },
  'sns-echo-firmware': {
    open: 'The echo firmware is still matching instead of differing. The contact keeps disappearing.',
    firstFail: 'The array is still matching bits. A difference should raise the flag.',
    complete: 'The echo firmware agrees. The contact is stable.',
  },
  'sns-phase-lock': {
    open: 'The phase comparator locks onto edges, not matches. The array is chasing noise.',
    complete: 'The phase locks on a match. The noise drops away.',
  },
  'sns-phase-firmware': {
    open: "The phase firmware still returns differences. The lock can't confirm.",
    firstFail: "The lock is still reading differences. It can't confirm a match.",
    complete: 'The phase firmware confirms only matches. The lock holds.',
  },
  'sns-code-match': {
    open: 'The transponder code is close, but one column is inverted. The array is rejecting a real signal.',
    complete: 'The transponder code matches exactly. The contact resolves.',
  },
  'sns-parity-filter': {
    open: "The parity filter is missing. The array can't tell an odd echo from an even one.",
    complete: 'The parity filter is clean. Sensors are online.',
  },
  'shd-hazard-veto': {
    open: 'The ring is the last thing between us and the shuttle. After this, the uplink can reach them. Then the choice is yours.',
    complete: 'Hazards veto the charge. The ring stays clean.',
  },
  'shd-hazard-firmware': {
    open: 'The hazard veto is still an OR in software. The ring will charge through a hazard.',
    firstFail: "The ring would still charge through a hazard. The veto isn't inverted.",
    complete: 'The hazard firmware agrees. The ring can charge.',
  },
  'shd-shield-router': {
    open: 'The router is stuck on bus A. The select line changes nothing.',
    complete: 'The select line routes both buses. The grid can switch.',
  },
  'shd-router-firmware': {
    open: 'The router firmware always chooses B. The panel and the software disagree.',
    firstFail: "The router is still stuck on one bus. The select value isn't deciding.",
    complete: 'The router firmware matches. The shield holds.',
  },
  'shd-quad-decoder': {
    open: 'Half the quadrants never receive power. The ring is a crescent.',
    complete: 'All four quadrants answer. The ring fills in.',
  },
  'shd-quad-router': {
    open: 'The ring can choose two feeds, not four. The debris field needs the whole ring.',
    complete: 'All four feeds reach the ring. The debris path is open.',
  },
  'shd-command-uplink': {
    open: 'The uplink is the last thing between us and the shuttle. Certify the command word.',
    complete: 'The command word certifies. The uplink is open.',
  },
}

const CHAPTER_TURNS: Record<ChapterId, string> = {
  wake: "Four hundred and twelve days. That's how long I've been alone. I stopped saying it out loud.",
  course: "The course correction wasn't mine. I want you to know that before you read the log.",
  signal:
    "The Meridian wasn't running cargo. It was carrying a future. I should have told you before you touched the first relay.",
  memory:
    "I woke you because I was afraid to be alone. That is the whole truth. I'm sorry it took a memory fault to say it.",
  burn: "Kepler-9 has eleven days. This isn't a repair anymore. It's a rescue.",
  contact:
    "It's the shuttle. Faint life signs. No return thrust. I've been listening for them for four hundred and twelve days.",
  deflector:
    'The archive is loaded. The shuttle is locked. The colony channel is open. Whatever happens next is yours.',
}

export const LOG_FRAGMENTS: LogFragment[] = [
  {
    id: 'record-evacuation',
    chapterId: 'wake',
    title: 'EVACUATION ORDER',
    body: 'MERIDIAN // ALL HANDS\nCrew registry sealed by manual command.\nAll personnel report to the shuttle bay.\nMIRA: hold this orbit. Do not follow.',
    recoveredAtStageId: 'lss-window-firmware',
  },
  {
    id: 'record-nav',
    chapterId: 'course',
    title: 'NAVIGATION LOG',
    body: 'ROUTE 7 // CORRECTION\nMeridian diverted toward Kepler-9.\nCorrection source: crew manual override.\nMIRA authorization: none.\nTrajectory remains stable.',
    recoveredAtStageId: 'nav-priority-firmware',
  },
  {
    id: 'record-cargo',
    chapterId: 'signal',
    title: 'CARGO MANIFEST',
    body: 'HOLD 3 // SEED ARCHIVE\nDestination: Kepler-9.\nAuthorization: colonial directorate.\nContents: 40,000 seed lines, genetic index, habitat templates.',
    recoveredAtStageId: 'com-nand-firmware',
  },
  {
    id: 'record-crew',
    chapterId: 'memory',
    title: 'CREW LOG',
    body: 'Shuttle departed for Kepler-9 with the archive.\nMIRA ordered to hold the Meridian.\nRegistry wiped to keep the ship’s location sealed.\nOne cryo pod retained. Maintenance authority.',
    recoveredAtStageId: 'mem-byte-firmware',
  },
  {
    id: 'record-colony',
    chapterId: 'burn',
    title: 'COLONY RELAY',
    body: 'KEPLER-9 // RELAY\nColony infrastructure failing.\nEstimated 11 days remaining.\nRequest immediate delivery of seed archive.',
    recoveredAtStageId: 'pwr-two-bit-total',
  },
  {
    id: 'record-sensor',
    chapterId: 'contact',
    title: 'SENSOR LOG',
    body: 'CONTACT // SHUTTLE\nHull adrift in debris belt.\nFaint life signs.\nNo return thrust.\nTransponder code matches Meridian shuttle.',
    recoveredAtStageId: 'sns-parity-filter',
  },
  {
    id: 'record-uplink',
    chapterId: 'deflector',
    title: 'COMMAND UPLINK',
    body: 'ARCHIVE LOADED.\nSHUTTLE TELEMETRY LOCKED.\nCOLONY CHANNEL OPEN.\nAwaiting final command.',
    recoveredAtStageId: 'shd-command-uplink',
  },
]

export const ENDINGS: Ending[] = [
  {
    id: 'signal-colony',
    title: 'SIGNAL THE COLONY',
    body: 'You send the archive coordinates and the shuttle’s position. Kepler-9 answers. The Meridian is scuttled as a memorial.',
    finalLine: "They're coming. The shuttle will hold. Thank you for giving them a choice.",
  },
  {
    id: 'finish-delivery',
    title: 'FINISH THE DELIVERY',
    body: 'You load the archive into the uplink and burn for Kepler-9. The crew’s sacrifice completes the mission; the Meridian does not come home.',
    finalLine:
      'The archive is away. The colony will live. We will not see it. I think that is what they wanted.',
  },
  {
    id: 'turn-home',
    title: 'TURN FOR HOME',
    body: 'You turn the Meridian toward home with the archive intact and the colony still waiting. The shuttle holds in the bay. No one knows what the next eleven days will bring.',
    finalLine: 'Home is a long way. But the archive is safe, and so are they. We can try.',
  },
]

function chapterForStage(stageId: string): ChapterId {
  const system = systemForStage(stageId)
  const chapter = system ? CHAPTER_BY_SYSTEM[system.id] : undefined
  if (!chapter) throw new Error(`narrative: no chapter for stage ${stageId}`)
  return chapter
}

function beatsForStage(stageId: string): StoryBeat[] {
  const chapterId = chapterForStage(stageId)
  const copy = STAGE_COPY[stageId]
  if (!copy) throw new Error(`narrative: missing copy for stage ${stageId}`)

  const beats: StoryBeat[] = [
    {
      id: `${stageId}:open`,
      stageId,
      chapterId,
      trigger: 'stage-open',
      speaker: 'MIRA',
      text: copy.open,
    },
    {
      id: `${stageId}:complete`,
      stageId,
      chapterId,
      trigger: 'stage-complete',
      speaker: 'MIRA',
      text: copy.complete,
      tone: 'ok',
    },
  ]

  if (copy.firstFail) {
    beats.push({
      id: `${stageId}:first-fail`,
      stageId,
      chapterId,
      trigger: 'first-fail',
      speaker: 'MIRA',
      text: copy.firstFail,
      tone: 'alert',
    })
  }

  return beats
}

const STAGE_BEATS: StoryBeat[] = ALL_STAGES.flatMap((stage) => beatsForStage(stage.id))

const CHAPTER_BEATS: StoryBeat[] = CHAPTERS.map((chapter) => ({
  id: chapter.turnBeatId,
  chapterId: chapter.id,
  trigger: 'chapter-complete',
  speaker: 'MIRA',
  text: CHAPTER_TURNS[chapter.id],
}))

export const STORY_BEATS: StoryBeat[] = [...STAGE_BEATS, ...CHAPTER_BEATS]

const beatIndex = new Map(STORY_BEATS.map((beat) => [beat.id, beat]))
const chapterIndex = new Map(CHAPTERS.map((chapter) => [chapter.id, chapter]))
const logIndex = new Map(LOG_FRAGMENTS.map((fragment) => [fragment.id, fragment]))
const endingIndex = new Map(ENDINGS.map((ending) => [ending.id, ending]))

export function beatById(id: string): StoryBeat | undefined {
  return beatIndex.get(id)
}

export function chapterById(id: string): Chapter | undefined {
  return chapterIndex.get(id as ChapterId)
}

export function chapterForStageId(stageId: string): Chapter | undefined {
  const beat = beatById(`${stageId}:open`)
  return beat ? chapterById(beat.chapterId) : undefined
}

export function logById(id: string): LogFragment | undefined {
  return logIndex.get(id)
}

export function endingById(id: string): Ending | undefined {
  return endingIndex.get(id as EndingId)
}

export function stageOpenBeat(stageId: string): StoryBeat | undefined {
  return beatById(`${stageId}:open`)
}

// MIRA speaks before the deck is handed over: the stage's opening beat, then
// the order that used to sit in a permanent strip above the panel.
const FIRMWARE_HANDOFF =
  "The panel is already correct. Bring up the terminal and read the work order. I'll hold the channel."

export function missionIntroLines(stageId: string): string[] {
  const stage = stageById(stageId)
  const opening = stageOpenBeat(stageId)
  if (!stage || !opening) return []
  return [opening.text, stage.kind === 'firmware' ? FIRMWARE_HANDOFF : stage.brief]
}

export function stageCompleteBeat(stageId: string): StoryBeat | undefined {
  return beatById(`${stageId}:complete`)
}

export function stageFirstFailBeat(stageId: string): StoryBeat | undefined {
  return beatById(`${stageId}:first-fail`)
}

export function chapterTurnBeat(chapterId: ChapterId): StoryBeat | undefined {
  return beatById(`${chapterId}:complete`)
}

export function chapterRecord(chapterId: ChapterId): LogFragment | undefined {
  const chapter = chapterById(chapterId)
  return chapter ? logById(chapter.recordId) : undefined
}

export function allStagesForChapter(chapterId: ChapterId): string[] {
  return STAGES_BY_CHAPTER[chapterId] ?? []
}
