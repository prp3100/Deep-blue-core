import type { DebugScopeId } from '../data/debugData'
import type { FixErrorScopeId } from '../data/fixErrorData'
import type { ArenaModeId, Difficulty, IdentifySessionLengthId, LanguageId, QuizFormatId, QuizTrackId, VocabSessionLengthId } from '../data/quizModels'
import type { VocabScopeId } from '../data/vocabData'
import type { ArenaOutcome } from './arena'
import type { Locale } from './i18n'
import type { QuizQuestion } from './quiz'

const QUIZ_RUN_ARCHIVE_STORAGE_KEY = 'code-language-quiz:quiz-run-archive'
const ARENA_RUN_ARCHIVE_STORAGE_KEY = 'code-language-quiz:arena-run-archive'

const QUIZ_RUN_ARCHIVE_VERSION = 2
const ARENA_RUN_ARCHIVE_VERSION = 2

type BaseQuizRunBucket = {
  format: QuizFormatId
  track: QuizTrackId
  difficulty: Difficulty
  fixErrorDifficulty: Difficulty
  debugDifficulty: Difficulty
  identifyLength: IdentifySessionLengthId
  vocabDifficulty: Difficulty
  vocabLength: VocabSessionLengthId
  fixErrorScope: FixErrorScopeId
  debugScope: DebugScopeId
  vocabScope: VocabScopeId
}

export type QuizRunBucket = BaseQuizRunBucket & {
  locale: Locale
}

export type ArenaRunBucket = {
  format: QuizFormatId
  track: QuizTrackId
  identifyMode: ArenaModeId
  fixErrorMode: ArenaModeId
  debugMode: ArenaModeId
  identifyLength: IdentifySessionLengthId
  vocabMode: ArenaModeId
  vocabLength: VocabSessionLengthId
  fixErrorScope: FixErrorScopeId
  debugScope: DebugScopeId
  vocabScope: VocabScopeId
}

type Breakdown = {
  correct: number
  wrong: number
  timeout: number
}

export type StoredQuizRunSummary = {
  version: typeof QUIZ_RUN_ARCHIVE_VERSION
  bucketKey: string
  savedAt: number
  format: QuizFormatId
  track: QuizTrackId
  locale: Locale
  score: number
  totalQuestions: number
  breakdown: Breakdown
  weakTopics: Array<[LanguageId, number]>
  antiCheatCount: number
  hintUsedCount: number
  hesitationCount: number
  avgTimeMs: number
  maxCorrectStreak: number
  topicMetrics: StoredQuizTopicMetric[]
}

export type StoredQuizTopicMetric = {
  topicId: LanguageId
  attempts: number
  correct: number
  wrong: number
  timeout: number
  accuracy: number
}

type LegacyStoredQuizRunSummary = Omit<StoredQuizRunSummary, 'version' | 'topicMetrics'> & {
  version: 1
}

export type StoredArenaRunArchive = {
  version: typeof ARENA_RUN_ARCHIVE_VERSION
  bucketKey: string
  savedAt: number
  format: QuizFormatId
  track: QuizTrackId
  humanQuestions: QuizQuestion[]
  humanOutcomes: ArenaOutcome[]
}

type QuizRunArchiveCollection = {
  version: typeof QUIZ_RUN_ARCHIVE_VERSION
  records: Record<string, StoredQuizRunSummary>
}

type LegacyQuizRunArchiveCollection = {
  version: 1
  records: Record<string, LegacyStoredQuizRunSummary>
}

type ArenaRunArchiveCollection = {
  version: typeof ARENA_RUN_ARCHIVE_VERSION
  records: Record<string, StoredArenaRunArchive>
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isBreakdown = (value: unknown): value is Breakdown =>
  isPlainObject(value) &&
  typeof value.correct === 'number' &&
  typeof value.wrong === 'number' &&
  typeof value.timeout === 'number'

const isWeakTopics = (value: unknown): value is Array<[LanguageId, number]> =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === 'string' &&
      typeof entry[1] === 'number',
  )

const isStoredQuizTopicMetric = (value: unknown): value is StoredQuizTopicMetric =>
  isPlainObject(value) &&
  typeof value.topicId === 'string' &&
  typeof value.attempts === 'number' &&
  typeof value.correct === 'number' &&
  typeof value.wrong === 'number' &&
  typeof value.timeout === 'number' &&
  typeof value.accuracy === 'number'

const isArenaOutcome = (value: unknown): value is ArenaOutcome =>
  isPlainObject(value) &&
  typeof value.questionId === 'string' &&
  typeof value.format === 'string' &&
  typeof value.answer === 'string' &&
  (typeof value.selectedChoice === 'string' || value.selectedChoice === null) &&
  typeof value.isCorrect === 'boolean' &&
  (value.result === 'correct' || value.result === 'wrong' || value.result === 'timeout') &&
  typeof value.timeMs === 'number' &&
  (value.reason === undefined || value.reason === null || typeof value.reason === 'string')

const isQuizQuestion = (value: unknown): value is QuizQuestion => {
  if (
    !isPlainObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.format !== 'string' ||
    typeof value.snippetText !== 'string' ||
    !Array.isArray(value.choices) ||
    value.choices.length !== 4
  ) {
    return false
  }

  if (value.format === 'identify-language') {
    return typeof value.answer === 'string' && value.choices.every((choice) => typeof choice === 'string')
  }

  return typeof value.answer === 'string' && typeof value.language === 'string'
}

const isStoredQuizRunSummary = (value: unknown): value is StoredQuizRunSummary =>
  isPlainObject(value) &&
  value.version === QUIZ_RUN_ARCHIVE_VERSION &&
  typeof value.bucketKey === 'string' &&
  typeof value.savedAt === 'number' &&
  typeof value.format === 'string' &&
  typeof value.track === 'string' &&
  (value.locale === 'th' || value.locale === 'en') &&
  typeof value.score === 'number' &&
  typeof value.totalQuestions === 'number' &&
  isBreakdown(value.breakdown) &&
  isWeakTopics(value.weakTopics) &&
  typeof value.antiCheatCount === 'number' &&
  typeof value.hintUsedCount === 'number' &&
  typeof value.hesitationCount === 'number' &&
  typeof value.avgTimeMs === 'number' &&
  typeof value.maxCorrectStreak === 'number' &&
  Array.isArray(value.topicMetrics) &&
  value.topicMetrics.every(isStoredQuizTopicMetric)

const isLegacyStoredQuizRunSummary = (value: unknown): value is LegacyStoredQuizRunSummary =>
  isPlainObject(value) &&
  value.version === 1 &&
  typeof value.bucketKey === 'string' &&
  typeof value.savedAt === 'number' &&
  typeof value.format === 'string' &&
  typeof value.track === 'string' &&
  (value.locale === 'th' || value.locale === 'en') &&
  typeof value.score === 'number' &&
  typeof value.totalQuestions === 'number' &&
  isBreakdown(value.breakdown) &&
  isWeakTopics(value.weakTopics) &&
  typeof value.antiCheatCount === 'number' &&
  typeof value.hintUsedCount === 'number' &&
  typeof value.hesitationCount === 'number' &&
  typeof value.avgTimeMs === 'number' &&
  typeof value.maxCorrectStreak === 'number'

const migrateLegacyQuizRunSummary = (value: LegacyStoredQuizRunSummary): StoredQuizRunSummary => ({
  ...value,
  version: QUIZ_RUN_ARCHIVE_VERSION,
  topicMetrics: [],
})

const isStoredArenaRunArchive = (value: unknown): value is StoredArenaRunArchive =>
  isPlainObject(value) &&
  value.version === ARENA_RUN_ARCHIVE_VERSION &&
  typeof value.bucketKey === 'string' &&
  typeof value.savedAt === 'number' &&
  typeof value.format === 'string' &&
  typeof value.track === 'string' &&
  Array.isArray(value.humanQuestions) &&
  value.humanQuestions.every(isQuizQuestion) &&
  Array.isArray(value.humanOutcomes) &&
  value.humanOutcomes.every(isArenaOutcome)

const readStorageValue = (key: string) => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorageValue = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures in restricted browser contexts.
  }
}

const readQuizRunArchiveCollection = (): QuizRunArchiveCollection => {
  const raw = readStorageValue(QUIZ_RUN_ARCHIVE_STORAGE_KEY)
  if (!raw) {
    return { version: QUIZ_RUN_ARCHIVE_VERSION, records: {} }
  }

  try {
    const parsed = JSON.parse(raw) as QuizRunArchiveCollection | LegacyQuizRunArchiveCollection
    if (!isPlainObject(parsed) || !isPlainObject(parsed.records) || (parsed.version !== 1 && parsed.version !== QUIZ_RUN_ARCHIVE_VERSION)) {
      return { version: QUIZ_RUN_ARCHIVE_VERSION, records: {} }
    }

    const records = Object.entries(parsed.records).reduce<Record<string, StoredQuizRunSummary>>((accumulator, [bucketKey, value]) => {
      if (isStoredQuizRunSummary(value) && value.bucketKey === bucketKey) {
        accumulator[bucketKey] = value
      } else if (isLegacyStoredQuizRunSummary(value) && value.bucketKey === bucketKey) {
        accumulator[bucketKey] = migrateLegacyQuizRunSummary(value)
      }
      return accumulator
    }, {})

    return { version: QUIZ_RUN_ARCHIVE_VERSION, records }
  } catch {
    return { version: QUIZ_RUN_ARCHIVE_VERSION, records: {} }
  }
}

const readArenaRunArchiveCollection = (): ArenaRunArchiveCollection => {
  const raw = readStorageValue(ARENA_RUN_ARCHIVE_STORAGE_KEY)
  if (!raw) {
    return { version: ARENA_RUN_ARCHIVE_VERSION, records: {} }
  }

  try {
    const parsed = JSON.parse(raw)
    if (!isPlainObject(parsed) || parsed.version !== ARENA_RUN_ARCHIVE_VERSION || !isPlainObject(parsed.records)) {
      return { version: ARENA_RUN_ARCHIVE_VERSION, records: {} }
    }

    const records = Object.entries(parsed.records).reduce<Record<string, StoredArenaRunArchive>>((accumulator, [bucketKey, value]) => {
      if (isStoredArenaRunArchive(value) && value.bucketKey === bucketKey) {
        accumulator[bucketKey] = value
      }
      return accumulator
    }, {})

    return { version: ARENA_RUN_ARCHIVE_VERSION, records }
  } catch {
    return { version: ARENA_RUN_ARCHIVE_VERSION, records: {} }
  }
}

const serializeQuizBucket = (bucket: QuizRunBucket) => {
  const parts = [`format=${bucket.format}`, `track=${bucket.track}`, `locale=${bucket.locale}`]

  if (bucket.format === 'identify-language') {
    parts.push(`difficulty=${bucket.difficulty}`, `length=${bucket.identifyLength}`)
    return parts.join('|')
  }

  if (bucket.format === 'fix-error') {
    parts.push(`difficulty=${bucket.fixErrorDifficulty}`, `scope=${bucket.fixErrorScope}`)
    return parts.join('|')
  }

  if (bucket.format === 'debug') {
    parts.push(`difficulty=${bucket.debugDifficulty}`, `scope=${bucket.debugScope}`)
    return parts.join('|')
  }

  parts.push(`difficulty=${bucket.vocabDifficulty}`, `length=${bucket.vocabLength}`, `scope=${bucket.vocabScope}`)
  return parts.join('|')
}

const serializeArenaBucket = (bucket: ArenaRunBucket) => {
  const parts = [`format=${bucket.format}`, `track=${bucket.track}`]

  if (bucket.format === 'identify-language') {
    parts.push(`mode=${bucket.identifyMode}`, `length=${bucket.identifyLength}`)
    return parts.join('|')
  }

  if (bucket.format === 'fix-error') {
    parts.push(`mode=${bucket.fixErrorMode}`, `scope=${bucket.fixErrorScope}`)
    return parts.join('|')
  }

  if (bucket.format === 'debug') {
    parts.push(`mode=${bucket.debugMode}`, `scope=${bucket.debugScope}`)
    return parts.join('|')
  }

  parts.push(`mode=${bucket.vocabMode}`, `length=${bucket.vocabLength}`, `scope=${bucket.vocabScope}`)
  return parts.join('|')
}

export const buildQuizRunBucketKey = (bucket: QuizRunBucket) => serializeQuizBucket(bucket)

export const buildArenaRunBucketKey = (bucket: ArenaRunBucket) => serializeArenaBucket(bucket)

export const loadLatestQuizRunSummary = (bucket: QuizRunBucket) => {
  const bucketKey = buildQuizRunBucketKey(bucket)
  return readQuizRunArchiveCollection().records[bucketKey] ?? null
}

export const saveLatestQuizRunSummary = (
  bucket: QuizRunBucket,
  snapshot: Omit<StoredQuizRunSummary, 'version' | 'bucketKey' | 'savedAt'>,
) => {
  const bucketKey = buildQuizRunBucketKey(bucket)
  const collection = readQuizRunArchiveCollection()
  const previous = collection.records[bucketKey] ?? null

  collection.records[bucketKey] = {
    ...snapshot,
    version: QUIZ_RUN_ARCHIVE_VERSION,
    bucketKey,
    savedAt: Date.now(),
  }

  writeStorageValue(QUIZ_RUN_ARCHIVE_STORAGE_KEY, JSON.stringify(collection))
  return previous
}

export const loadLatestArenaRunArchive = (bucket: ArenaRunBucket) => {
  const bucketKey = buildArenaRunBucketKey(bucket)
  return readArenaRunArchiveCollection().records[bucketKey] ?? null
}

export const saveLatestArenaRunArchive = (
  bucket: ArenaRunBucket,
  archive: Omit<StoredArenaRunArchive, 'version' | 'bucketKey' | 'savedAt'>,
) => {
  const bucketKey = buildArenaRunBucketKey(bucket)
  const collection = readArenaRunArchiveCollection()
  const previous = collection.records[bucketKey] ?? null

  collection.records[bucketKey] = {
    ...archive,
    version: ARENA_RUN_ARCHIVE_VERSION,
    bucketKey,
    savedAt: Date.now(),
  }

  writeStorageValue(ARENA_RUN_ARCHIVE_STORAGE_KEY, JSON.stringify(collection))
  return previous
}
