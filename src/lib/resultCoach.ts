import { guideBookEntries } from '../data/questionBank'
import type { LanguageId, QuizFormatId, QuizTrackId } from '../data/quizModels'
import type { Locale } from './i18n'
import type { StoredQuizTopicMetric } from './runArchive'

type Breakdown = {
  correct: number
  wrong: number
  timeout: number
}

export type ResultCoachSnapshot = {
  locale: Locale
  format: QuizFormatId
  track: QuizTrackId
  score: number
  totalQuestions: number
  breakdown: Breakdown
  rankLabel: string
  currentTrackLabel: string
  currentFormatLabel: string
  currentModeLabel: string
  weakTopics: Array<[LanguageId, number]>
  antiCheatCount: number
  avgTimeMs: number
  hintUsedCount: number
  hesitationCount: number
  maxCorrectStreak: number
  readNextCandidates: LanguageId[]
  topicMetrics: StoredQuizTopicMetric[]
}

export type ResultCoachTopicDelta = {
  topicId: LanguageId
  accuracyDelta: number
  currentAccuracy: number
  previousAccuracy: number
  attemptDelta: number
  wrongDelta: number
  timeoutDelta: number
}

export type ResultCoachCompareContext = {
  scoreDelta: number
  wrongDelta: number
  timeoutDelta: number
  hintDelta: number
  avgTimeMsDelta: number
  maxCorrectStreakDelta: number
  repeatedWeakTopics: LanguageId[]
  improvedTopics: ResultCoachTopicDelta[]
  regressedTopics: ResultCoachTopicDelta[]
}

export type ResultCoachReadNextItem = {
  topicId: LanguageId
  reason: string
}

export type ResultCoachCompareContent = {
  headline: string
  summary: string
  metrics: ResultCoachCompareContext
}

export type ResultCoachContent = {
  opening: string
  weakness: string
  focusNote: string
  readNext: [ResultCoachReadNextItem, ResultCoachReadNextItem]
  compare: ResultCoachCompareContent | null
}

type ResultShareDetails = {
  coachReadNext?: [ResultCoachReadNextItem, ResultCoachReadNextItem] | null
  coachCompare?: ResultCoachCompareContent | null
}

const allGuideTopicIds = Object.keys(guideBookEntries) as LanguageId[]

const pluralize = (value: number, th: string, enSingular: string, enPlural: string) =>
  value === 1 ? { th: `${value} ${th}`, en: `${value} ${enSingular}` } : { th: `${value} ${th}`, en: `${value} ${enPlural}` }

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`)

const formatSignedSeconds = (valueMs: number) => {
  const seconds = valueMs / 1000
  const rounded = Math.abs(seconds) >= 10 ? seconds.toFixed(1) : seconds.toFixed(2)
  return seconds > 0 ? `+${rounded}s` : `${rounded}s`
}

const formatSeconds = (valueMs: number) => `${(valueMs / 1000).toFixed(1)}s`

const getWeakTopicLines = (snapshot: ResultCoachSnapshot) =>
  snapshot.weakTopics.slice(0, 3).map(([topicId, missCount]) => {
    const guide = guideBookEntries[topicId]
    return snapshot.locale === 'th'
      ? `${guide.label.th} พลาด ${missCount} ครั้ง จุดจำคือ ${guide.quickSpot.th}`
      : `${guide.label.en}: missed ${missCount} times. Quick spot: ${guide.quickSpot.en}`
  })

const getReadNextCandidates = (snapshot: ResultCoachSnapshot) => {
  const unique = [...new Set([...snapshot.readNextCandidates, ...snapshot.weakTopics.map(([topicId]) => topicId), ...allGuideTopicIds])]
  return unique.slice(0, 6)
}

export const buildCoachResponseJsonSchema = (
  snapshot: ResultCoachSnapshot,
  compareContext: ResultCoachCompareContext | null = null,
) => {
  const allowedTopicIds = getReadNextCandidates(snapshot)

  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      opening: {
        type: 'string',
        description: 'Briefly state what the player did well.',
      },
      weakness: {
        type: 'string',
        description: 'Identify the biggest weakness from the run.',
      },
      focusNote: {
        type: 'string',
        description: 'Give one short coaching note, mentioning focus penalties gently when they exist.',
      },
      readNext: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            topicId: {
              type: 'string',
              enum: allowedTopicIds,
              description: 'Must be one of the allowed topic ids for the current run.',
            },
            reason: {
              type: 'string',
              description: 'One short and specific reason for reviewing this topic next.',
            },
          },
          required: ['topicId', 'reason'],
        },
      },
      compare: compareContext
        ? {
            type: 'object',
            additionalProperties: false,
            properties: {
              headline: {
                type: 'string',
                description: 'Short headline for the comparison with the previous exact-bucket run.',
              },
              summary: {
                type: 'string',
                description: 'One short summary of how this run compares with the previous exact-bucket run.',
              },
            },
            required: ['headline', 'summary'],
          }
        : {
            type: 'null',
            description: 'Must be null when no comparison data is available.',
          },
    },
    required: ['opening', 'weakness', 'focusNote', 'readNext', 'compare'],
  }
}

const buildFallbackReadNext = (snapshot: ResultCoachSnapshot): [ResultCoachReadNextItem, ResultCoachReadNextItem] => {
  const [firstTopicId, secondTopicId] = getReadNextCandidates(snapshot).slice(0, 2) as [LanguageId, LanguageId]
  const firstGuide = guideBookEntries[firstTopicId]
  const secondGuide = guideBookEntries[secondTopicId]

  if (snapshot.locale === 'th') {
    return [
      {
        topicId: firstTopicId,
        reason: `ทบทวน quick spot ของ ${firstGuide.label.th} ก่อน เพราะรอบนี้ยังหลุด marker หลักของหัวข้อนี้บ่อย`,
      },
      {
        topicId: secondTopicId,
        reason: `อ่าน checklist ของ ${secondGuide.label.th} ซ้ำอีกครั้ง เพื่อให้ตัดตัวหลอกได้ไวขึ้นในรอบถัดไป`,
      },
    ]
  }

  return [
    {
      topicId: firstTopicId,
      reason: `Review ${firstGuide.label.en} first because this run still missed its strongest marker too often.`,
    },
    {
      topicId: secondTopicId,
      reason: `Re-read the ${secondGuide.label.en} checklist so you can cut through decoys faster next round.`,
    },
  ]
}

const percentLabel = (value: number) => `${Math.round(value * 100)}%`

const describeTopicDeltaList = (locale: Locale, deltas: ResultCoachTopicDelta[]) => {
  if (deltas.length === 0) {
    return locale === 'th' ? 'ไม่มีหัวข้อเด่น' : 'no standout topic'
  }

  return deltas
    .slice(0, 2)
    .map((delta) => {
      const label = guideBookEntries[delta.topicId].label[locale]
      const accuracyDelta = Math.round(delta.accuracyDelta * 100)
      return `${label} (${accuracyDelta > 0 ? '+' : ''}${accuracyDelta}% accuracy)`
    })
    .join(', ')
}

const buildFallbackCompare = (
  snapshot: ResultCoachSnapshot,
  compareContext: ResultCoachCompareContext,
): ResultCoachCompareContent => {
  const repeatedWeakLabels = compareContext.repeatedWeakTopics.map((topicId) => guideBookEntries[topicId].label[snapshot.locale])
  const compareImprovedLine = describeTopicDeltaList(snapshot.locale, compareContext.improvedTopics)
  const compareRegressedLine = describeTopicDeltaList(snapshot.locale, compareContext.regressedTopics)

  if (snapshot.locale === 'th') {
    const compareHeadline =
      compareContext.scoreDelta > 0
        ? 'รอบนี้ดีขึ้นจากรอบก่อนหน้า'
        : compareContext.scoreDelta < 0
          ? 'รอบนี้ดรอปจากรอบก่อนหน้า'
          : 'รอบนี้ใกล้เคียงรอบก่อนหน้า'

    const compareRepeatedLine =
      repeatedWeakLabels.length > 0
        ? `หัวข้อที่ยังวนกลับมาซ้ำคือ ${repeatedWeakLabels.join(', ')}`
        : 'ยังไม่มีหัวข้ออ่อนที่ซ้ำชัดเจนทั้งสองรอบ'

    return {
      headline: compareHeadline,
      summary: `คะแนน ${formatSigned(compareContext.scoreDelta)}, ตอบผิด ${formatSigned(compareContext.wrongDelta)}, หมดเวลา ${formatSigned(compareContext.timeoutDelta)}, ใช้คำใบ้ ${formatSigned(compareContext.hintDelta)}, เวลาเฉลี่ย ${formatSignedSeconds(compareContext.avgTimeMsDelta)}, สตรีค ${formatSigned(compareContext.maxCorrectStreakDelta)}. ดีขึ้นใน ${compareImprovedLine}. แย่ลงใน ${compareRegressedLine}. ${compareRepeatedLine}`,
      metrics: compareContext,
    }
  }

  const compareHeadline =
    compareContext.scoreDelta > 0
      ? 'This run improved on your previous one.'
      : compareContext.scoreDelta < 0
        ? 'This run slipped against your previous one.'
        : 'This run stayed close to your previous result.'

  const compareRepeatedLine =
    repeatedWeakLabels.length > 0
      ? `Repeated weak topics: ${repeatedWeakLabels.join(', ')}.`
      : 'No repeated weak topic dominated both runs.'

  return {
    headline: compareHeadline,
    summary: `Score ${formatSigned(compareContext.scoreDelta)}, wrong ${formatSigned(compareContext.wrongDelta)}, timeout ${formatSigned(compareContext.timeoutDelta)}, hints ${formatSigned(compareContext.hintDelta)}, avg time ${formatSignedSeconds(compareContext.avgTimeMsDelta)}, streak ${formatSigned(compareContext.maxCorrectStreakDelta)}. Improved: ${compareImprovedLine}. Regressed: ${compareRegressedLine}. ${compareRepeatedLine}`,
    metrics: compareContext,
  }

  if (snapshot.locale === 'th') {
    const trend =
      compareContext.scoreDelta > 0
        ? 'รอบนี้คะแนนดีขึ้น'
        : compareContext.scoreDelta < 0
          ? 'รอบนี้คะแนนดรอปลง'
          : 'รอบนี้คะแนนใกล้เคียงรอบก่อน'

    const repeatedLine =
      repeatedWeakLabels.length > 0
        ? `หัวข้อที่ยังวนกลับมาซ้ำคือ ${repeatedWeakLabels.join(', ')}`
        : 'ยังไม่มีหัวข้ออ่อนที่ซ้ำเด่นแบบชัดเจน'

    return {
      headline: trend,
      summary: `คะแนน ${formatSigned(compareContext.scoreDelta)}, ผิด ${formatSigned(compareContext.wrongDelta)}, หมดเวลา ${formatSigned(compareContext.timeoutDelta)}, ใช้คำใบ้ ${formatSigned(compareContext.hintDelta)}, เวลาเฉลี่ย ${formatSignedSeconds(compareContext.avgTimeMsDelta)}, สตรีค ${formatSigned(compareContext.maxCorrectStreakDelta)}. ${repeatedLine}`,
      metrics: compareContext,
    }
  }

  const trend =
    compareContext.scoreDelta > 0
      ? 'This run improved on your last one.'
      : compareContext.scoreDelta < 0
        ? 'This run slipped against your previous one.'
        : 'This run stayed close to your previous result.'

  const repeatedLine =
    repeatedWeakLabels.length > 0
      ? `The same weak topics are still showing up: ${repeatedWeakLabels.join(', ')}.`
      : 'No repeated weak topic dominated both runs.'

  return {
    headline: trend,
    summary: `Score ${formatSigned(compareContext.scoreDelta)}, wrong ${formatSigned(compareContext.wrongDelta)}, timeout ${formatSigned(compareContext.timeoutDelta)}, hints ${formatSigned(compareContext.hintDelta)}, avg time ${formatSignedSeconds(compareContext.avgTimeMsDelta)}, streak ${formatSigned(compareContext.maxCorrectStreakDelta)}. ${repeatedLine}`,
    metrics: compareContext,
  }
}

export const buildFallbackCoachContent = (
  snapshot: ResultCoachSnapshot,
  compareContext: ResultCoachCompareContext | null = null,
): ResultCoachContent => {
  const accuracy = snapshot.totalQuestions > 0 ? Math.round((snapshot.score / snapshot.totalQuestions) * 100) : 0
  const weakTopicLines = getWeakTopicLines(snapshot)
  const timeoutBits = pluralize(snapshot.breakdown.timeout, 'ครั้งที่หมดเวลา', 'timeout', 'timeouts')
  const hintBits = pluralize(snapshot.hintUsedCount, 'ครั้งที่ใช้คำใบ้', 'hint', 'hints')
  const hesitationBits = pluralize(snapshot.hesitationCount, 'ครั้งที่เริ่มลังเล', 'hesitation', 'hesitations')
  const antiCheatBits = pluralize(snapshot.antiCheatCount, 'ครั้งที่โดนจับเปลี่ยนแท็บ', 'focus penalty', 'focus penalties')
  const readNext = buildFallbackReadNext(snapshot)

  if (snapshot.locale === 'th') {
    const opening =
      accuracy >= 85
        ? `รอบนี้คุณทำได้แข็งแรงมาก ความแม่นยำประมาณ ${accuracy}% และมีสตรีคถูกสูงสุด ${snapshot.maxCorrectStreak} ข้อ แปลว่าจังหวะจับ marker หลักเริ่มนิ่งแล้ว`
        : accuracy >= 60
          ? `รอบนี้พื้นฐานเริ่มแน่นขึ้น ความแม่นยำประมาณ ${accuracy}% แต่ยังมีบางข้อที่จังหวะตัดสินใจช้ากว่าที่ควร`
          : `รอบนี้ยังมีช่องให้เก็บอีกพอสมควร ความแม่นยำประมาณ ${accuracy}% ดังนั้นรอบถัดไปควรเน้นจำ marker หลักให้ชัดก่อนกดตอบ`

    const weakness =
      weakTopicLines.length > 0
        ? `จุดอ่อนใหญ่สุดยังอยู่ที่ ${weakTopicLines.join(' | ')}`
        : `ยังไม่เห็นหัวข้ออ่อนที่โดดเดี่ยวชัดมาก แต่มี ${hesitationBits.th} และใช้คำใบ้ ${hintBits.th} ซึ่งบอกว่าจังหวะตัดสินใจยังไม่นิ่ง`

    const focusNote =
      snapshot.antiCheatCount > 0
        ? `ระบบจับการสลับแท็บได้ ${antiCheatBits.th} และใช้บทลงโทษแบบขั้นบันไดแทนการเร่งเวลา ดังนั้นถ้ายังสลับแท็บต่อจะโดนหักเวลาแรงขึ้นเรื่อย ๆ`
        : `มี ${timeoutBits.th} เวลาเฉลี่ยต่อข้ออยู่ที่ ${formatSeconds(snapshot.avgTimeMs)} และใช้คำใบ้ ${hintBits.th} ถ้าจะดันคะแนนขึ้นให้ทบทวน 2 หัวข้อด้านล่างก่อน`

    return {
      opening,
      weakness,
      focusNote,
      readNext,
      compare: compareContext ? buildFallbackCompare(snapshot, compareContext) : null,
    }
  }

  const opening =
    accuracy >= 85
      ? `Strong run. Your accuracy landed around ${accuracy}% with a max correct streak of ${snapshot.maxCorrectStreak}, which means your first-read pattern recognition is getting steady.`
      : accuracy >= 60
        ? `This run shows a solid base. Your accuracy was about ${accuracy}%, but some decisions still slow down when the timer gets tighter.`
        : `This run still has room to grow. Your accuracy was about ${accuracy}%, so the next gain comes from locking in the strongest marker before answering fast.`

  const weakness =
    weakTopicLines.length > 0
      ? `The biggest weakness still points here: ${weakTopicLines.join(' | ')}`
      : `No single weak topic dominated the run, but you still showed ${hesitationBits.en} and used ${hintBits.en}, which means the recognition step is not fully automatic yet.`

  const focusNote =
    snapshot.antiCheatCount > 0
      ? `The system detected ${antiCheatBits.en} and used the new escalating penalty ladder instead of time burn, so repeated tab switches now cost more and more time directly.`
      : `You had ${timeoutBits.en}. Your average pace was ${formatSeconds(snapshot.avgTimeMs)} with ${hintBits.en}, so rereading the two guide picks below should be the fastest improvement.`

  return {
    opening,
    weakness,
    focusNote,
    readNext,
    compare: compareContext ? buildFallbackCompare(snapshot, compareContext) : null,
  }
}

export const renderCoachSummary = (content: ResultCoachContent) => [content.opening, content.weakness, content.focusNote].filter(Boolean).join('\n\n')

const extractJsonBlock = (text: string) => {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1)
  }

  return null
}

const normalizeReadNext = (
  rawValue: unknown,
  fallback: [ResultCoachReadNextItem, ResultCoachReadNextItem],
  allowedTopicIds: Set<LanguageId>,
): [ResultCoachReadNextItem, ResultCoachReadNextItem] => {
  if (!Array.isArray(rawValue)) {
    return fallback
  }

  const normalized = rawValue
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return null
      }

      const topicId = typeof (entry as { topicId?: unknown }).topicId === 'string' ? ((entry as { topicId: string }).topicId as LanguageId) : null
      const reason = typeof (entry as { reason?: unknown }).reason === 'string' ? (entry as { reason: string }).reason.trim() : ''

      if (!topicId || !reason || !allowedTopicIds.has(topicId)) {
        return null
      }

      return { topicId, reason }
    })
    .filter((entry): entry is ResultCoachReadNextItem => Boolean(entry))
    .filter((entry, index, list) => list.findIndex((candidate) => candidate.topicId === entry.topicId) === index)

  return normalized.length === 2 ? [normalized[0], normalized[1]] : fallback
}

export const parseCoachContent = (
  rawText: string,
  snapshot: ResultCoachSnapshot,
  compareContext: ResultCoachCompareContext | null = null,
): ResultCoachContent => {
  const fallback = buildFallbackCoachContent(snapshot, compareContext)
  const jsonBlock = extractJsonBlock(rawText)
  if (!jsonBlock) {
    return fallback
  }

  try {
    const parsed = JSON.parse(jsonBlock)
    const allowedTopicIds = new Set(getReadNextCandidates(snapshot))
    const opening = typeof parsed?.opening === 'string' && parsed.opening.trim() ? parsed.opening.trim() : fallback.opening
    const weakness = typeof parsed?.weakness === 'string' && parsed.weakness.trim() ? parsed.weakness.trim() : fallback.weakness
    const focusNote = typeof parsed?.focusNote === 'string' && parsed.focusNote.trim() ? parsed.focusNote.trim() : fallback.focusNote
    const readNext = normalizeReadNext(parsed?.readNext, fallback.readNext, allowedTopicIds)

    let compare = fallback.compare
    if (compareContext) {
      const headline =
        typeof parsed?.compare?.headline === 'string' && parsed.compare.headline.trim()
          ? parsed.compare.headline.trim()
          : fallback.compare?.headline ?? ''
      const summary =
        typeof parsed?.compare?.summary === 'string' && parsed.compare.summary.trim()
          ? parsed.compare.summary.trim()
          : fallback.compare?.summary ?? ''

      compare = {
        headline,
        summary,
        metrics: compareContext,
      }
    }

    return {
      opening,
      weakness,
      focusNote,
      readNext,
      compare,
    }
  } catch {
    return fallback
  }
}

export const buildCoachPrompt = (snapshot: ResultCoachSnapshot, compareContext: ResultCoachCompareContext | null = null) => {
  const weakTopics =
    snapshot.weakTopics.length > 0
      ? snapshot.weakTopics
          .slice(0, 3)
          .map(([topicId, missCount]) => {
            const guide = guideBookEntries[topicId]
            return snapshot.locale === 'th'
              ? `- ${topicId}: ${guide.label.th}; พลาด ${missCount} ครั้ง; quick spot = ${guide.quickSpot.th}; checklist hint = ${guide.beginnerChecklist[0]?.th ?? guide.plainSummary.th}`
              : `- ${topicId}: ${guide.label.en}; missed ${missCount} times; quick spot = ${guide.quickSpot.en}; checklist hint = ${guide.beginnerChecklist[0]?.en ?? guide.plainSummary.en}`
          })
          .join('\n')
      : snapshot.locale === 'th'
        ? '- รอบนี้ยังไม่มี weak topic ที่เด่นชัด'
        : '- No dominant weak topic in this run.'

  const readNextCandidates = getReadNextCandidates(snapshot)
    .map((topicId) => {
      const guide = guideBookEntries[topicId]
      return snapshot.locale === 'th'
        ? `- ${topicId}: ${guide.label.th}; quick spot = ${guide.quickSpot.th}`
        : `- ${topicId}: ${guide.label.en}; quick spot = ${guide.quickSpot.en}`
    })
    .join('\n')
  const compareImprovedTopics = compareContext?.improvedTopics.map((topic) => topic.topicId).join(', ') || 'none'
  const compareRegressedTopics = compareContext?.regressedTopics.map((topic) => topic.topicId).join(', ') || 'none'

  const compareBlock = compareContext
    ? snapshot.locale === 'th'
      ? `ข้อมูลเปรียบเทียบกับรอบก่อนหน้าใน bucket เดียวกัน:
- score delta = ${formatSigned(compareContext.scoreDelta)}
- wrong delta = ${formatSigned(compareContext.wrongDelta)}
- timeout delta = ${formatSigned(compareContext.timeoutDelta)}
- hint delta = ${formatSigned(compareContext.hintDelta)}
- avg time delta = ${formatSignedSeconds(compareContext.avgTimeMsDelta)}
- max streak delta = ${formatSigned(compareContext.maxCorrectStreakDelta)}
- repeated weak topics = ${
          compareContext.repeatedWeakTopics.length > 0 ? compareContext.repeatedWeakTopics.join(', ') : 'none'
        }
- improved topics = ${compareImprovedTopics}
- regressed topics = ${compareRegressedTopics}`
      : `Comparison with the previous exact-bucket run:
- score delta = ${formatSigned(compareContext.scoreDelta)}
- wrong delta = ${formatSigned(compareContext.wrongDelta)}
- timeout delta = ${formatSigned(compareContext.timeoutDelta)}
- hint delta = ${formatSigned(compareContext.hintDelta)}
- avg time delta = ${formatSignedSeconds(compareContext.avgTimeMsDelta)}
- max streak delta = ${formatSigned(compareContext.maxCorrectStreakDelta)}
- repeated weak topics = ${
          compareContext.repeatedWeakTopics.length > 0 ? compareContext.repeatedWeakTopics.join(', ') : 'none'
        }
- improved topics = ${compareImprovedTopics}
- regressed topics = ${compareRegressedTopics}`
    : snapshot.locale === 'th'
      ? 'ข้อมูลเปรียบเทียบกับรอบก่อนหน้าใน bucket เดียวกัน: null'
      : 'Comparison with previous exact-bucket run: null'

  if (snapshot.locale === 'th') {
    return {
      system:
        'คุณคือโค้ชด้านการเขียนโปรแกรมที่ใจดี ตอบเป็น JSON เท่านั้น ห้ามใส่ markdown หรือ code fence ทุกข้อความต้องเป็นภาษาไทยล้วนแบบอ่านง่ายสำหรับคนทั่วไป',
      user: `ส่งกลับ JSON เท่านั้นตาม schema นี้:
{
  "opening": "string",
  "weakness": "string",
  "focusNote": "string",
  "readNext": [
    { "topicId": "string", "reason": "string" },
    { "topicId": "string", "reason": "string" }
  ],
  "compare": { "headline": "string", "summary": "string" } | null
}

ข้อมูลรอบนี้:
Track: ${snapshot.currentTrackLabel}
Format: ${snapshot.currentFormatLabel}
Mode: ${snapshot.currentModeLabel}
Score: ${snapshot.score}/${snapshot.totalQuestions}
Correct: ${snapshot.breakdown.correct}
Wrong: ${snapshot.breakdown.wrong}
Timeout: ${snapshot.breakdown.timeout}
Rank: ${snapshot.rankLabel}
Average time: ${formatSeconds(snapshot.avgTimeMs)}
Hints used: ${snapshot.hintUsedCount}
Derived hesitation count: ${snapshot.hesitationCount}
Max correct streak: ${snapshot.maxCorrectStreak}
Focus penalties: ${snapshot.antiCheatCount}

Weak topics:
${weakTopics}

Allowed readNext topicIds:
${readNextCandidates}

${compareBlock}

Rules:
- opening ต้องบอกสิ่งที่ทำได้ดี
- weakness ต้องบอกจุดอ่อนใหญ่สุด
- focusNote ต้องสั้น กระชับ และถ้ามี focus penalty ให้พูดอย่างนุ่มนวลเรื่องความยุติธรรมของ timer
- readNext ต้องมี 2 รายการพอดี
- topicId ใน readNext ต้องเลือกจาก Allowed readNext topicIds เท่านั้น
- reason ของแต่ละรายการต้องสั้นและเฉพาะเจาะจง
- compare ต้องเป็น null ถ้าไม่มีข้อมูลเปรียบเทียบ
- ห้ามปนภาษาอังกฤษนอกจาก topicId`,
    }
  }

  return {
    system:
      'You are a kind coding coach. Reply with JSON only. Do not use markdown or code fences. Every string must be plain English for everyday users.',
    user: `Return JSON only using this schema:
{
  "opening": "string",
  "weakness": "string",
  "focusNote": "string",
  "readNext": [
    { "topicId": "string", "reason": "string" },
    { "topicId": "string", "reason": "string" }
  ],
  "compare": { "headline": "string", "summary": "string" } | null
}

Current run:
Track: ${snapshot.currentTrackLabel}
Format: ${snapshot.currentFormatLabel}
Mode: ${snapshot.currentModeLabel}
Score: ${snapshot.score}/${snapshot.totalQuestions}
Correct: ${snapshot.breakdown.correct}
Wrong: ${snapshot.breakdown.wrong}
Timeout: ${snapshot.breakdown.timeout}
Rank: ${snapshot.rankLabel}
Average time: ${formatSeconds(snapshot.avgTimeMs)}
Hints used: ${snapshot.hintUsedCount}
Derived hesitation count: ${snapshot.hesitationCount}
Max correct streak: ${snapshot.maxCorrectStreak}
Focus penalties: ${snapshot.antiCheatCount}

Weak topics:
${weakTopics}

Allowed readNext topicIds:
${readNextCandidates}

${compareBlock}

Rules:
- opening must mention what the player did well
- weakness must identify the biggest weakness
- focusNote must stay short and, if focus penalties exist, gently mention timer fairness
- readNext must contain exactly 2 items
- each readNext.topicId must come from the allowed topic list
- each readNext.reason must stay short and specific
- compare must be null when no comparison data exists
- do not mix languages`,
  }
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const getMostMissedTopics = (snapshot: ResultCoachSnapshot) =>
  [...snapshot.topicMetrics]
    .filter((metric) => metric.wrong + metric.timeout > 0)
    .sort((left, right) => {
      const missDelta = right.wrong + right.timeout - (left.wrong + left.timeout)
      if (missDelta !== 0) {
        return missDelta
      }
      return right.attempts - left.attempts
    })
    .slice(0, 3)

const getMostStableTopics = (snapshot: ResultCoachSnapshot) =>
  [...snapshot.topicMetrics]
    .filter((metric) => metric.attempts >= 2)
    .sort((left, right) => {
      const accuracyDelta = right.accuracy - left.accuracy
      if (accuracyDelta !== 0) {
        return accuracyDelta
      }
      return right.attempts - left.attempts
    })
    .slice(0, 2)

const renderCompareTopicLines = (locale: Locale, compare: ResultCoachCompareContent | null) => {
  if (!compare) {
    return null
  }

  const improved = compare.metrics.improvedTopics
    .slice(0, 3)
    .map((topic) =>
      locale === 'th'
        ? `${guideBookEntries[topic.topicId].label[locale]} ดีขึ้น ${Math.round(topic.accuracyDelta * 100)}%`
        : `${guideBookEntries[topic.topicId].label[locale]} improved ${Math.round(topic.accuracyDelta * 100)}%`,
    )
  const regressed = compare.metrics.regressedTopics
    .slice(0, 3)
    .map((topic) =>
      locale === 'th'
        ? `${guideBookEntries[topic.topicId].label[locale]} แย่ลง ${Math.abs(Math.round(topic.accuracyDelta * 100))}%`
        : `${guideBookEntries[topic.topicId].label[locale]} dropped ${Math.abs(Math.round(topic.accuracyDelta * 100))}%`,
    )

  return { improved, regressed }
}

export const buildResultShareText = (
  snapshot: ResultCoachSnapshot,
  coachSummary: string,
  details: ResultShareDetails = {},
) => {
  const mostMissed = getMostMissedTopics(snapshot)
  const mostStable = getMostStableTopics(snapshot)
  const compareTopics = renderCompareTopicLines(snapshot.locale, details.coachCompare ?? null)
  const readNext = details.coachReadNext ?? null

  const upgradedLines =
    snapshot.locale === 'th'
      ? [
          'ผลลัพธ์ Deep Blue Core',
          `คะแนน: ${snapshot.score}/${snapshot.totalQuestions}`,
          `แรงก์: ${snapshot.rankLabel}`,
          `Track: ${snapshot.currentTrackLabel}`,
          `รูปแบบ: ${snapshot.currentFormatLabel}`,
          `โหมด: ${snapshot.currentModeLabel}`,
          `ถูก ${snapshot.breakdown.correct} | ผิด ${snapshot.breakdown.wrong} | หมดเวลา ${snapshot.breakdown.timeout}`,
          `เวลาเฉลี่ย ${formatSeconds(snapshot.avgTimeMs)} | คำใบ้ ${snapshot.hintUsedCount} | ลังเล ${snapshot.hesitationCount} | สตรีค ${snapshot.maxCorrectStreak}`,
          snapshot.antiCheatCount > 0 ? `Focus penalties: ${snapshot.antiCheatCount}` : 'ไม่มี focus penalty',
          '',
          'Most Missed',
          ...(mostMissed.length > 0
            ? mostMissed.map((metric) => `- ${guideBookEntries[metric.topicId].label[snapshot.locale]}: ผิด ${metric.wrong} | หมดเวลา ${metric.timeout}`)
            : ['- ยังไม่มีหัวข้อที่พลาดเด่นชัด']),
          '',
          'Most Stable',
          ...(mostStable.length > 0
            ? mostStable.map((metric) => `- ${guideBookEntries[metric.topicId].label[snapshot.locale]}: แม่น ${percentLabel(metric.accuracy)} จาก ${metric.attempts} ข้อ`)
            : ['- ยังไม่มีข้อมูลพอให้จัดเป็นหัวข้อที่นิ่ง']),
          '',
          'AI Coach',
          coachSummary,
          ...(readNext
            ? ['', 'Read Next', ...readNext.map((item) => `- ${guideBookEntries[item.topicId].label[snapshot.locale]}: ${item.reason}`)]
            : []),
          ...(details.coachCompare
            ? [
                '',
                'Compared to Previous',
                details.coachCompare.headline,
                details.coachCompare.summary,
                ...(compareTopics?.improved.length ? ['ดีขึ้น', ...compareTopics.improved.map((line) => `- ${line}`)] : []),
                ...(compareTopics?.regressed.length ? ['แย่ลง', ...compareTopics.regressed.map((line) => `- ${line}`)] : []),
              ]
            : []),
        ]
      : [
          'Deep Blue Core result',
          `Score: ${snapshot.score}/${snapshot.totalQuestions}`,
          `Rank: ${snapshot.rankLabel}`,
          `Track: ${snapshot.currentTrackLabel}`,
          `Format: ${snapshot.currentFormatLabel}`,
          `Mode: ${snapshot.currentModeLabel}`,
          `Correct ${snapshot.breakdown.correct} | Wrong ${snapshot.breakdown.wrong} | Timeout ${snapshot.breakdown.timeout}`,
          `Avg time ${formatSeconds(snapshot.avgTimeMs)} | Hints ${snapshot.hintUsedCount} | Hesitations ${snapshot.hesitationCount} | Streak ${snapshot.maxCorrectStreak}`,
          snapshot.antiCheatCount > 0 ? `Focus penalties: ${snapshot.antiCheatCount}` : 'No focus penalties',
          '',
          'Most Missed',
          ...(mostMissed.length > 0
            ? mostMissed.map((metric) => `- ${guideBookEntries[metric.topicId].label[snapshot.locale]}: wrong ${metric.wrong} | timeout ${metric.timeout}`)
            : ['- No dominant weak topic yet']),
          '',
          'Most Stable',
          ...(mostStable.length > 0
            ? mostStable.map((metric) => `- ${guideBookEntries[metric.topicId].label[snapshot.locale]}: ${percentLabel(metric.accuracy)} accuracy over ${metric.attempts} attempts`)
            : ['- Not enough repeat attempts yet']),
          '',
          'AI Coach',
          coachSummary,
          ...(readNext
            ? ['', 'Read Next', ...readNext.map((item) => `- ${guideBookEntries[item.topicId].label[snapshot.locale]}: ${item.reason}`)]
            : []),
          ...(details.coachCompare
            ? [
                '',
                'Compared to Previous',
                details.coachCompare.headline,
                details.coachCompare.summary,
                ...(compareTopics?.improved.length ? ['Improved', ...compareTopics.improved.map((line) => `- ${line}`)] : []),
                ...(compareTopics?.regressed.length ? ['Regressed', ...compareTopics.regressed.map((line) => `- ${line}`)] : []),
              ]
            : []),
        ]

  return upgradedLines.filter((line, index, list) => !(line === '' && list[index - 1] === '')).join('\n')

  const weakTopics = snapshot.weakTopics
    .slice(0, 3)
    .map(([topicId, misses]) => {
      const guide = guideBookEntries[topicId]
      return snapshot.locale === 'th'
        ? `- ${guide.label.th}: พลาด ${misses} ครั้ง`
        : `- ${guide.label.en}: missed ${misses} times`
    })
    .join('\n')

  const lines =
    snapshot.locale === 'th'
      ? [
          'ผลลัพธ์ Deep Blue Core',
          `คะแนน: ${snapshot.score}/${snapshot.totalQuestions}`,
          `รูปแบบ: ${snapshot.currentFormatLabel}`,
          `โหมด: ${snapshot.currentModeLabel}`,
          `Track: ${snapshot.currentTrackLabel}`,
          `ถูก ${snapshot.breakdown.correct} | ผิด ${snapshot.breakdown.wrong} | หมดเวลา ${snapshot.breakdown.timeout}`,
          snapshot.antiCheatCount > 0 ? `โดน focus penalty ${snapshot.antiCheatCount} ครั้ง` : 'ไม่มี focus penalty',
          weakTopics ? `หัวข้อที่ควรอ่านต่อ:\n${weakTopics}` : 'ยังไม่มีหัวข้ออ่อนชัดเจน',
          '',
          coachSummary,
        ]
      : [
          'Deep Blue Core result',
          `Score: ${snapshot.score}/${snapshot.totalQuestions}`,
          `Format: ${snapshot.currentFormatLabel}`,
          `Mode: ${snapshot.currentModeLabel}`,
          `Track: ${snapshot.currentTrackLabel}`,
          `Correct ${snapshot.breakdown.correct} | Wrong ${snapshot.breakdown.wrong} | Timeout ${snapshot.breakdown.timeout}`,
          snapshot.antiCheatCount > 0 ? `Focus penalties: ${snapshot.antiCheatCount}` : 'No focus penalties',
          weakTopics ? `Read next:\n${weakTopics}` : 'No dominant weak topic yet',
          '',
          coachSummary,
        ]

  return lines.filter((line, index, list) => !(line === '' && list[index - 1] === '')).join('\n')
}

export const buildResultShareHtml = (
  snapshot: ResultCoachSnapshot,
  coachSummary: string,
  details: ResultShareDetails = {},
) => {
  const locale = snapshot.locale
  const mostMissed = getMostMissedTopics(snapshot)
  const mostStable = getMostStableTopics(snapshot)
  const compareTopics = renderCompareTopicLines(locale, details.coachCompare ?? null)
  const reportTitle = locale === 'th' ? 'ผลลัพธ์ Deep Blue Core' : 'Deep Blue Core Result'
  const mostMissedItems =
    mostMissed.length > 0
      ? mostMissed.map((metric) =>
          locale === 'th'
            ? `${guideBookEntries[metric.topicId].label[locale]} - ผิด ${metric.wrong} | หมดเวลา ${metric.timeout} | ${guideBookEntries[metric.topicId].quickSpot[locale]}`
            : `${guideBookEntries[metric.topicId].label[locale]} - wrong ${metric.wrong} | timeout ${metric.timeout} | ${guideBookEntries[metric.topicId].quickSpot[locale]}`,
        )
      : [locale === 'th' ? 'ยังไม่มีหัวข้อที่พลาดเด่นชัด' : 'No dominant weak topic yet']
  const mostStableItems =
    mostStable.length > 0
      ? mostStable.map((metric) =>
          locale === 'th'
            ? `${guideBookEntries[metric.topicId].label[locale]} - แม่น ${percentLabel(metric.accuracy)} จาก ${metric.attempts} ข้อ`
            : `${guideBookEntries[metric.topicId].label[locale]} - ${percentLabel(metric.accuracy)} accuracy over ${metric.attempts} attempts`,
        )
      : [locale === 'th' ? 'ยังไม่มีข้อมูลพอให้จัดเป็นหัวข้อที่นิ่ง' : 'Not enough repeat attempts yet']
  const readNextItems =
    details.coachReadNext?.map((item) => `${guideBookEntries[item.topicId].label[locale]} - ${item.reason}`) ?? []
  const renderList = (items: string[]) =>
    items.length > 0 ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : `<p>${escapeHtml(locale === 'th' ? 'ไม่มีข้อมูล' : 'No data')}</p>`

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(reportTitle)}</title>
    <style>
      :root{color-scheme:dark;--bg:#04101d;--bg-2:#0c1b2f;--surface:rgba(11,26,43,.92);--line:rgba(121,206,255,.2);--ink:#ecf8ff;--muted:#9dc2dc}
      *{box-sizing:border-box} body{margin:0;min-height:100vh;padding:32px;background:radial-gradient(circle at top left,rgba(99,212,255,.16),transparent 30%),radial-gradient(circle at top right,rgba(143,255,199,.12),transparent 32%),linear-gradient(155deg,var(--bg),var(--bg-2));color:var(--ink);font-family:"Sora","Segoe UI",sans-serif}
      .report{max-width:980px;margin:0 auto;border:1px solid var(--line);border-radius:28px;background:var(--surface);padding:28px}.pill{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}h1{margin:18px 0 10px;font-size:40px;line-height:1.05}h3{margin:12px 0 8px;font-size:22px}p,li{color:var(--muted);line-height:1.7}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:20px}.stack{display:grid;gap:18px;margin-top:24px}.card{border:1px solid var(--line);border-radius:20px;padding:18px;background:rgba(7,18,31,.62)}.label,.subhead{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}.subhead{margin-top:14px}.value{margin-top:8px;font-size:28px;color:var(--ink);font-weight:700}ul{padding-left:18px}pre{white-space:pre-wrap;font-family:inherit;line-height:1.8;color:var(--ink);margin:0}@media print{body{background:#fff;color:#111827;padding:0}.report{border:none;border-radius:0;max-width:none;background:#fff;color:#111827}p,li,.label,.subhead{color:#374151}.card{background:#fff;border-color:#d1d5db;break-inside:avoid}}
    </style>
  </head>
  <body>
    <main class="report">
      <span class="pill">${escapeHtml(reportTitle)}</span>
      <h1>${escapeHtml(`${snapshot.score}/${snapshot.totalQuestions}`)}</h1>
      <p>${escapeHtml(`${snapshot.rankLabel} · ${snapshot.currentTrackLabel} · ${snapshot.currentFormatLabel} · ${snapshot.currentModeLabel}`)}</p>
      <section class="grid">
        <article class="card"><div class="label">${escapeHtml(locale === 'th' ? 'คะแนน' : 'Score')}</div><div class="value">${escapeHtml(`${snapshot.score}/${snapshot.totalQuestions}`)}</div></article>
        <article class="card"><div class="label">${escapeHtml(locale === 'th' ? 'ถูก / ผิด / หมดเวลา' : 'Correct / Wrong / Timeout')}</div><div class="value" style="font-size:20px">${escapeHtml(`${snapshot.breakdown.correct} / ${snapshot.breakdown.wrong} / ${snapshot.breakdown.timeout}`)}</div></article>
        <article class="card"><div class="label">${escapeHtml(locale === 'th' ? 'แรงก์' : 'Rank')}</div><div class="value" style="font-size:22px">${escapeHtml(snapshot.rankLabel)}</div></article>
        <article class="card"><div class="label">${escapeHtml(locale === 'th' ? 'เวลาเฉลี่ย / คำใบ้ / สตรีค' : 'Avg time / Hints / Streak')}</div><div class="value" style="font-size:20px">${escapeHtml(`${formatSeconds(snapshot.avgTimeMs)} / ${snapshot.hintUsedCount} / ${snapshot.maxCorrectStreak}`)}</div></article>
      </section>
      <section class="stack">
        <section class="card"><div class="label">Most Missed</div>${renderList(mostMissedItems)}</section>
        <section class="card"><div class="label">Most Stable</div>${renderList(mostStableItems)}</section>
        ${readNextItems.length ? `<section class="card"><div class="label">Read Next</div>${renderList(readNextItems)}</section>` : ''}
        <section class="card"><div class="label">AI Coach</div><pre>${escapeHtml(coachSummary)}</pre></section>
        ${
          details.coachCompare
            ? `<section class="card"><div class="label">${escapeHtml(locale === 'th' ? 'เทียบกับรอบก่อนหน้า' : 'Compared to Previous')}</div><h3>${escapeHtml(details.coachCompare.headline)}</h3><p>${escapeHtml(details.coachCompare.summary)}</p>${compareTopics?.improved.length ? `<div class="subhead">${escapeHtml(locale === 'th' ? 'ดีขึ้น' : 'Improved')}</div>${renderList(compareTopics.improved)}` : ''}${compareTopics?.regressed.length ? `<div class="subhead">${escapeHtml(locale === 'th' ? 'แย่ลง' : 'Regressed')}</div>${renderList(compareTopics.regressed)}` : ''}</section>`
            : ''
        }
      </section>
    </main>
  </body>
</html>`

  const weakTopics = snapshot.weakTopics
    .slice(0, 3)
    .map(([topicId, misses]) => {
      const guide = guideBookEntries[topicId]
      return `<li><strong>${escapeHtml(guide.label[snapshot.locale])}</strong> - ${escapeHtml(
        snapshot.locale === 'th' ? `พลาด ${misses} ครั้ง | ${guide.quickSpot.th}` : `Missed ${misses} times | ${guide.quickSpot.en}`,
      )}</li>`
    })
    .join('')

  const title = snapshot.locale === 'th' ? 'ผลลัพธ์ Deep Blue Core' : 'Deep Blue Core Result'
  const coachTitle = snapshot.locale === 'th' ? 'AI Coach Beta Note' : 'AI Coach Beta Note'

  return `<!doctype html>
<html lang="${snapshot.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #04101d;
        --bg-2: #0c1b2f;
        --surface: rgba(11, 26, 43, 0.82);
        --line: rgba(121, 206, 255, 0.2);
        --ink: #ecf8ff;
        --muted: #9dc2dc;
        --accent: #63d4ff;
        --accent-2: #8fffc7;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        padding: 32px;
        background:
          radial-gradient(circle at top left, rgba(99, 212, 255, 0.18), transparent 30%),
          radial-gradient(circle at top right, rgba(143, 255, 199, 0.12), transparent 32%),
          linear-gradient(155deg, var(--bg), var(--bg-2));
        color: var(--ink);
        font-family: "Sora", "Segoe UI", sans-serif;
      }
      .report {
        max-width: 920px;
        margin: 0 auto;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: var(--surface);
        padding: 28px;
        backdrop-filter: blur(16px);
      }
      .pill {
        display: inline-block;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }
      h1 {
        margin: 18px 0 10px;
        font-size: 40px;
        line-height: 1.05;
      }
      p {
        color: var(--muted);
        line-height: 1.7;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 18px;
        background: rgba(7, 18, 31, 0.62);
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }
      .value {
        margin-top: 8px;
        font-size: 28px;
        color: var(--ink);
        font-weight: 700;
      }
      .coach {
        margin-top: 24px;
      }
      .coach pre {
        white-space: pre-wrap;
        font-family: inherit;
        margin: 0;
        line-height: 1.8;
        color: var(--ink);
      }
      ul {
        padding-left: 18px;
      }
      li {
        margin: 10px 0;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main class="report">
      <span class="pill">${escapeHtml(title)}</span>
      <h1>${escapeHtml(snapshot.score.toString())}/${escapeHtml(snapshot.totalQuestions.toString())}</h1>
      <p>${escapeHtml(snapshot.currentTrackLabel)} · ${escapeHtml(snapshot.currentFormatLabel)} · ${escapeHtml(snapshot.currentModeLabel)}</p>

      <section class="grid">
        <article class="card">
          <div class="label">${escapeHtml(snapshot.locale === 'th' ? 'คะแนน' : 'Score')}</div>
          <div class="value">${escapeHtml(`${snapshot.score}/${snapshot.totalQuestions}`)}</div>
        </article>
        <article class="card">
          <div class="label">${escapeHtml(snapshot.locale === 'th' ? 'ถูก / ผิด / หมดเวลา' : 'Correct / Wrong / Timeout')}</div>
          <div class="value" style="font-size: 20px">${escapeHtml(
            `${snapshot.breakdown.correct} / ${snapshot.breakdown.wrong} / ${snapshot.breakdown.timeout}`,
          )}</div>
        </article>
        <article class="card">
          <div class="label">${escapeHtml(snapshot.locale === 'th' ? 'แรงก์' : 'Rank')}</div>
          <div class="value" style="font-size: 22px">${escapeHtml(snapshot.rankLabel)}</div>
        </article>
      </section>

      <section class="card" style="margin-top: 24px">
        <div class="label">${escapeHtml(snapshot.locale === 'th' ? 'หัวข้อที่ยังอ่อน' : 'Weak Topics')}</div>
        ${
          weakTopics
            ? `<ul>${weakTopics}</ul>`
            : `<p>${escapeHtml(snapshot.locale === 'th' ? 'ยังไม่มีหัวข้ออ่อนชัดเจน' : 'No dominant weak topic yet.')}</p>`
        }
      </section>

      <section class="card coach">
        <div class="label">${escapeHtml(coachTitle)}</div>
        <pre>${escapeHtml(coachSummary)}</pre>
      </section>
    </main>
  </body>
</html>`
}
