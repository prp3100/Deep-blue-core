import { startTransition, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  guideBookEntries,
  questionBanks,
  trackSettings,
  trackTopicIds,
} from './data/questionBank'
import {
  FIX_ERROR_ALL_CORE_SCOPE,
  FIX_ERROR_ALL_GAME_SCOPE,
  fixErrorSupportedLanguageIds,
  fixErrorSupportedGameLanguageIds,
  type FixErrorScopeId,
  type FixErrorSupportedLanguageId,
} from './data/fixErrorData'
import {
  DEBUG_ALL_CORE_SCOPE,
  DEBUG_ALL_GAME_SCOPE,
  debugSupportedLanguageIds,
  debugSupportedGameLanguageIds,
  type DebugScopeId,
  type DebugSupportedLanguageId,
} from './data/debugData'
import {
  VOCAB_ALL_CORE_SCOPE,
  VOCAB_ALL_GAME_SCOPE,
  vocabSupportedLanguageIds,
  vocabSupportedGameLanguageIds,
  type VocabScopeId,
  type VocabSupportedLanguageId,
} from './data/vocabData'
import {
  debugFormat,
  fixErrorFormat,
  identifyLanguageFormat,
  quizFormatSettings,
  resolveDifficultyModeSetting,
  vocabFormat,
} from './data/quizFormats'
import type { ArenaModeId, Difficulty, GuideFamilyId, GuideLevel, IdentifySessionLengthId, LanguageId, QuizFormatId, QuizTrackId, VocabSessionLengthId } from './data/quizModels'
import { getInitialLocale, getLanguageLabel, LOCALE_STORAGE_KEY, uiText, type Locale } from './lib/i18n'
import { extraCopy } from './lib/extraCopy'
import { useQuizAudio } from './lib/audio'
import {
  createDebugSession,
  createFixErrorSession,
  createIdentifyLanguageSession,
  createVocabSession,
  getOutcomeBreakdown,
  getRankBand,
  type QuestionOutcome,
  type QuizQuestion,
} from './lib/quiz'
import { AppShell } from './components/layout/AppShell'
import { LandingPage } from './pages/LandingPage'
import { MenuPage } from './pages/MenuPage'
import { GuidePage } from './pages/GuidePage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { ArenaPage } from './pages/ArenaPage'
import { ArenaMatchPage } from './pages/ArenaMatchPage'
import { ArenaResultPage } from './pages/ArenaResultPage'
import { SettingsPage } from './pages/SettingsPage'
import {
  buildArenaCommentaryPrompt,
  buildArenaFallbackCommentary,
  buildArenaPrompt,
  buildArenaResponseJsonSchema,
  parseArenaResponse,
  summarizeArenaOutcomes,
  type ArenaCommentarySnapshot,
  type ArenaOutcome,
} from './lib/arena'
import {
  ARENA_AI_PROVIDERS,
  createArenaAiSettingsForProvider,
  createDefaultArenaAiSettings,
  getArenaAiModelId,
  getArenaAiProvider,
  isArenaAiReady,
  parseStoredArenaAiSettings,
  requestAiText,
  resolveArenaAiBaseUrl,
  type ArenaAiSettings,
} from './lib/aiProviders'
import {
  applyAITheme,
  getCurrentSpectrumThemeHex,
  getThemePreset,
  resetAITheme,
  startDynamicSpectrumTheme,
  startSmoothThemeTransition,
  SYSTEM_BASE_THEME,
} from './lib/musicTheme'
import { useMusicPlayer } from './lib/musicPlayer'
import {
  appendTrackToQueue,
  createDefaultMusicSettings,
  parseStoredMusicSettings,
  removeTrackFromQueue,
  replaceCurrentTrack,
  resolveNextQueueIndex,
  resolvePreviousQueueIndex,
  syncQueueState,
} from './lib/musicSettings'
import {
  createEmptyMusicDraft,
  detectSourceType,
  getYouTubeId,
  type MusicDraft,
  type PlaybackMode,
  type PlaylistItem,
  type ThemeModePreference,
  type ThemeMotionMode,
  type ThemePresetId,
} from './lib/musicTypes'
import {
  buildCoachResponseJsonSchema,
  buildCoachPrompt,
  buildFallbackCoachContent,
  parseCoachContent,
  renderCoachSummary,
  type ResultCoachCompareContext,
  type ResultCoachContent,
  type ResultCoachSnapshot,
  type ResultCoachTopicDelta,
} from './lib/resultCoach'
import {
  loadLatestArenaRunArchive,
  saveLatestArenaRunArchive,
  saveLatestQuizRunSummary,
  type ArenaRunBucket,
  type StoredQuizRunSummary,
  type StoredQuizTopicMetric,
} from './lib/runArchive'
import {
  createArenaDebugRounds,
  createArenaFixErrorRounds,
  createArenaIdentifyRounds,
  createArenaVocabRounds,
  type ArenaRound,
} from './lib/arenaSession'

type AppView = 'landing' | 'menu' | 'guide' | 'quiz' | 'result' | 'arena' | 'arena-match' | 'arena-result' | 'settings'
type SettingsReturnView = Exclude<AppView, 'settings'>

type QuizPhase = 'active' | 'feedback'

type GuideFilter = GuideFamilyId | 'all'

type ThemeMode = 'light' | 'dark'

type ComparisonState = {
  source: LanguageId
  target: LanguageId
}

type AntiCheatScope = 'quiz' | 'arena'

type AntiCheatAlertState = {
  id: number
  scope: AntiCheatScope
  message: string
  detail: string
}

type AntiCheatPenaltyProfile = {
  totalViolations: number
  lastViolationAt: number | null
}

type ArenaMatchKind = 'live-ai' | 'ghost-run'

type GhostRunEventState = {
  id: number
}

type ViewedGuidesByFormat = Record<QuizFormatId, LanguageId[]>

const TRACK_STORAGE_KEY = 'code-language-quiz:track'
const QUIZ_FORMAT_STORAGE_KEY = 'code-language-quiz:format'
const LEGACY_DIFFICULTY_STORAGE_KEY = 'code-language-quiz:difficulty'
const DIFFICULTY_STORAGE_KEY = 'code-language-quiz:identify-difficulty'
const IDENTIFY_LENGTH_STORAGE_KEY = 'code-language-quiz:identify-length'
const FIX_ERROR_DIFFICULTY_STORAGE_KEY = 'code-language-quiz:fix-error-difficulty'
const DEBUG_DIFFICULTY_STORAGE_KEY = 'code-language-quiz:debug-difficulty'
const VOCAB_DIFFICULTY_STORAGE_KEY = 'code-language-quiz:vocab-difficulty'
const VOCAB_LENGTH_STORAGE_KEY = 'code-language-quiz:vocab-length'
const FIX_ERROR_SCOPE_STORAGE_KEY = 'code-language-quiz:fix-error-scope'
const DEBUG_SCOPE_STORAGE_KEY = 'code-language-quiz:debug-scope'
const VOCAB_SCOPE_STORAGE_KEY = 'code-language-quiz:vocab-scope'
const VIEWED_GUIDES_STORAGE_KEY = 'code-language-quiz:viewed-guides'
const MUSIC_SETTINGS_STORAGE_KEY = 'code-language-quiz:music-settings'
const ARENA_AI_SETTINGS_STORAGE_KEY = 'code-language-quiz:arena-ai-settings'
const ANTI_CHEAT_PROFILE_STORAGE_KEY = 'code-language-quiz:anti-cheat-profile'
const GHOST_RUN_CHANCE = 0.05
const GHOST_RUN_AUTO_CLOSE_MS = 2200
const HESITATION_TIME_RATIO = 0.72
const ANTI_CHEAT_MIN_HIDDEN_MS = 500
const ANTI_CHEAT_SECOND_STRIKE_PENALTY_SECONDS = 10
const ANTI_CHEAT_THIRD_STRIKE_PENALTY_SECONDS = 20
const ANTI_CHEAT_SUDDEN_DEATH_SECONDS = 3
const ANTI_CHEAT_PERSISTENT_START_PENALTY_SECONDS = 10
const ANTI_CHEAT_RESET_WINDOW_MS = 3 * 60 * 60 * 1000
const ANTI_CHEAT_PERSISTENT_RESET_WINDOW_MS = 5 * 60 * 60 * 1000
const ARENA_AI_ACTIVE_LATENCY_POLL_MS = 250
const ARENA_AI_TRANSIENT_FAILURE_PATTERN =
  /(high demand|try again later|temporar(?:y|ily) unavailable|overloaded|over capacity|rate limit|too many requests|service unavailable)/i

const buildArenaAiFailureReason = (error: unknown, temporaryBusyLabel: string, fallbackLabel: string) => {
  const message = error instanceof Error && error.message ? error.message.trim() : fallbackLabel

  if (!ARENA_AI_TRANSIENT_FAILURE_PATTERN.test(message)) {
    return message
  }

  return `${temporaryBusyLabel} (${message})`
}

const fixErrorSupportedLanguageSet = new Set<LanguageId>(fixErrorSupportedLanguageIds)
const debugSupportedLanguageSet = new Set<LanguageId>(debugSupportedLanguageIds)
const vocabSupportedLanguageSet = new Set<LanguageId>(vocabSupportedLanguageIds)
const fixErrorGameLanguageSet = new Set<string>(fixErrorSupportedGameLanguageIds)
const debugGameLanguageSet = new Set<string>(debugSupportedGameLanguageIds)
const vocabGameLanguageSet = new Set<string>(vocabSupportedGameLanguageIds)
const allQuizFormats = ['identify-language', 'fix-error', 'debug', 'vocab'] as const

const getModeScopedTopicIds = (trackId: QuizTrackId, format: QuizFormatId) => {
  const topicIds = trackTopicIds[trackId]

  if (format === 'fix-error') {
    return topicIds.filter((topicId) => fixErrorSupportedLanguageSet.has(topicId))
  }

  if (format === 'debug') {
    return topicIds.filter((topicId) => debugSupportedLanguageSet.has(topicId))
  }

  if (format === 'vocab') {
    return topicIds.filter((topicId) => vocabSupportedLanguageSet.has(topicId))
  }

  return topicIds
}

const persistStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures in restricted browser contexts.
  }
}

const createEmptyViewedGuidesByFormat = (): ViewedGuidesByFormat => ({
  'identify-language': [],
  'fix-error': [],
  debug: [],
  vocab: [],
})

const normalizeViewedGuideIds = (format: QuizFormatId, values: unknown): LanguageId[] => {
  if (!Array.isArray(values)) {
    return []
  }

  const allowedTopicIds = new Set(getModeScopedTopicIds('core', format).concat(getModeScopedTopicIds('game-dev', format)))
  return values.filter(
    (value): value is LanguageId =>
      typeof value === 'string' &&
      Object.prototype.hasOwnProperty.call(guideBookEntries, value) &&
      allowedTopicIds.has(value as LanguageId),
  )
}

const getViewedGuideIdsForFormat = (viewedGuidesByFormat: ViewedGuidesByFormat, format: QuizFormatId) => viewedGuidesByFormat[format] ?? []

const getOutcomeTopicId = (outcome: QuestionOutcome) => (outcome.format === 'identify-language' ? outcome.answer : outcome.language)

const getMaxCorrectStreak = <T extends { isCorrect: boolean }>(outcomes: T[]) => {
  let maxStreak = 0
  let currentStreak = 0

  for (const outcome of outcomes) {
    if (outcome.isCorrect) {
      currentStreak += 1
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

const getAverageTimeMs = <T extends { timeMs: number }>(outcomes: T[]) =>
  outcomes.length > 0 ? outcomes.reduce((sum, outcome) => sum + outcome.timeMs, 0) / outcomes.length : 0

const getDerivedHesitationCount = (outcomes: QuestionOutcome[], timeLimitMs: number) =>
  outcomes.filter((outcome) => outcome.result !== 'timeout' && (outcome.hintUsed || outcome.timeMs >= timeLimitMs * HESITATION_TIME_RATIO)).length

const pickReadNextCandidates = (trackId: QuizTrackId, weakTopics: Array<[LanguageId, number]>, outcomes: QuestionOutcome[]) => {
  const orderedTopicIds = [
    ...weakTopics.map(([topicId]) => topicId),
    ...outcomes.filter((outcome) => !outcome.isCorrect).map(getOutcomeTopicId),
    ...outcomes.map(getOutcomeTopicId),
    ...trackTopicIds[trackId],
  ]

  return [...new Set(orderedTopicIds)].slice(0, 4)
}

const getRepeatedWeakTopics = (current: Array<[LanguageId, number]>, previous: Array<[LanguageId, number]>) => {
  const previousSet = new Set(previous.map(([topicId]) => topicId))
  return current.map(([topicId]) => topicId).filter((topicId) => previousSet.has(topicId))
}

const buildTopicMetrics = (outcomes: QuestionOutcome[]): StoredQuizTopicMetric[] => {
  const metrics = new Map<LanguageId, Omit<StoredQuizTopicMetric, 'accuracy'>>()

  for (const outcome of outcomes) {
    const topicId = getOutcomeTopicId(outcome)
    const current = metrics.get(topicId) ?? {
      topicId,
      attempts: 0,
      correct: 0,
      wrong: 0,
      timeout: 0,
    }

    current.attempts += 1
    if (outcome.result === 'correct') {
      current.correct += 1
    } else if (outcome.result === 'timeout') {
      current.timeout += 1
    } else {
      current.wrong += 1
    }

    metrics.set(topicId, current)
  }

  return [...metrics.values()]
    .map((metric) => ({
      ...metric,
      accuracy: metric.attempts > 0 ? metric.correct / metric.attempts : 0,
    }))
    .sort((left, right) => {
      if (right.attempts !== left.attempts) {
        return right.attempts - left.attempts
      }

      return left.topicId.localeCompare(right.topicId)
    })
}

const getMostMissedTopics = (metrics: StoredQuizTopicMetric[]) =>
  [...metrics]
    .filter((metric) => metric.wrong + metric.timeout > 0)
    .sort((left, right) => {
      const missDelta = right.wrong + right.timeout - (left.wrong + left.timeout)
      if (missDelta !== 0) {
        return missDelta
      }

      return right.attempts - left.attempts
    })
    .slice(0, 3)

const getMostStableTopics = (metrics: StoredQuizTopicMetric[]) =>
  [...metrics]
    .filter((metric) => metric.attempts >= 2)
    .sort((left, right) => {
      const accuracyDelta = right.accuracy - left.accuracy
      if (accuracyDelta !== 0) {
        return accuracyDelta
      }

      return right.attempts - left.attempts
    })
    .slice(0, 2)

const buildTopicDeltaList = (
  currentMetrics: StoredQuizTopicMetric[],
  previousMetrics: StoredQuizTopicMetric[],
): { improved: ResultCoachTopicDelta[]; regressed: ResultCoachTopicDelta[] } => {
  const previousByTopic = new Map(previousMetrics.map((metric) => [metric.topicId, metric]))
  const deltas = currentMetrics
    .map<ResultCoachTopicDelta | null>((metric) => {
      const previous = previousByTopic.get(metric.topicId)
      if (!previous) {
        return null
      }

      return {
        topicId: metric.topicId,
        accuracyDelta: metric.accuracy - previous.accuracy,
        currentAccuracy: metric.accuracy,
        previousAccuracy: previous.accuracy,
        attemptDelta: metric.attempts - previous.attempts,
        wrongDelta: metric.wrong - previous.wrong,
        timeoutDelta: metric.timeout - previous.timeout,
      }
    })
    .filter((delta): delta is ResultCoachTopicDelta => Boolean(delta))

  const sortByMagnitude = (left: ResultCoachTopicDelta, right: ResultCoachTopicDelta) => {
    const accuracyDelta = Math.abs(right.accuracyDelta) - Math.abs(left.accuracyDelta)
    if (accuracyDelta !== 0) {
      return accuracyDelta
    }

    return right.attemptDelta - left.attemptDelta
  }

  return {
    improved: deltas.filter((delta) => delta.accuracyDelta > 0).sort(sortByMagnitude).slice(0, 3),
    regressed: deltas.filter((delta) => delta.accuracyDelta < 0).sort(sortByMagnitude).slice(0, 3),
  }
}

const resolveQuizRankLadder = (format: QuizFormatId, identifyDifficulty: Difficulty, fixDifficulty: Difficulty, debugDifficulty: Difficulty, vocabDifficulty: Difficulty) =>
  (format === 'fix-error'
    ? fixDifficulty
    : format === 'debug'
      ? debugDifficulty
      : format === 'vocab'
        ? vocabDifficulty
        : identifyDifficulty) === 'hard'
    ? 'hard'
    : 'easy'

const resolveArenaRankLadder = (
  format: QuizFormatId,
  identifyMode: ArenaModeId,
  fixErrorMode: ArenaModeId,
  debugMode: ArenaModeId,
  vocabMode: ArenaModeId,
) =>
  (format === 'fix-error'
    ? fixErrorMode
    : format === 'debug'
      ? debugMode
      : format === 'vocab'
        ? vocabMode
        : identifyMode) === 'hard'
    ? 'hard'
    : 'easy'

const isGhostReplayArchiveReady = (archive: ReturnType<typeof loadLatestArenaRunArchive>) =>
  Boolean(
    archive &&
      archive.humanQuestions.length > 0 &&
      archive.humanQuestions.length === archive.humanOutcomes.length &&
      archive.humanQuestions.every((question, index) => archive.humanOutcomes[index]?.questionId === question.id),
  )

const getFixErrorScopeTrack = (scope: FixErrorScopeId): QuizTrackId =>
  scope === FIX_ERROR_ALL_GAME_SCOPE || fixErrorGameLanguageSet.has(scope as FixErrorSupportedLanguageId)
    ? 'game-dev'
    : 'core'

const getDebugScopeTrack = (scope: DebugScopeId): QuizTrackId =>
  scope === DEBUG_ALL_GAME_SCOPE || debugGameLanguageSet.has(scope as DebugSupportedLanguageId)
    ? 'game-dev'
    : 'core'

const getVocabScopeTrack = (scope: VocabScopeId): QuizTrackId =>
  scope === VOCAB_ALL_GAME_SCOPE || vocabGameLanguageSet.has(scope as VocabSupportedLanguageId)
    ? 'game-dev'
    : 'core'

const buildArenaTurnKey = (sessionId: number, index: number) => `${sessionId}:${index}`

const createDefaultAntiCheatProfile = (): AntiCheatPenaltyProfile => ({
  totalViolations: 0,
  lastViolationAt: null,
})

const areAntiCheatProfilesEqual = (left: AntiCheatPenaltyProfile, right: AntiCheatPenaltyProfile) =>
  left.totalViolations === right.totalViolations && left.lastViolationAt === right.lastViolationAt

const hasPersistentAntiCheatPenalty = (profile: AntiCheatPenaltyProfile) => profile.totalViolations >= 5

const resolveAntiCheatResetWindowMs = (profile: AntiCheatPenaltyProfile) =>
  hasPersistentAntiCheatPenalty(profile) ? ANTI_CHEAT_PERSISTENT_RESET_WINDOW_MS : ANTI_CHEAT_RESET_WINDOW_MS

const resolveActiveAntiCheatProfile = (profile: AntiCheatPenaltyProfile, now = Date.now()): AntiCheatPenaltyProfile => {
  if (profile.totalViolations <= 0) {
    return createDefaultAntiCheatProfile()
  }

  if (!Number.isFinite(profile.lastViolationAt) || profile.lastViolationAt === null || profile.lastViolationAt <= 0) {
    return createDefaultAntiCheatProfile()
  }

  return now - profile.lastViolationAt >= resolveAntiCheatResetWindowMs(profile) ? createDefaultAntiCheatProfile() : profile
}

const parseStoredAntiCheatProfile = (value: string | null): AntiCheatPenaltyProfile => {
  if (!value) {
    return createDefaultAntiCheatProfile()
  }

  try {
    const parsed = JSON.parse(value)
    const totalViolations = Number(parsed?.totalViolations)
    const normalizedTotalViolations = Math.floor(totalViolations)

    if (!Number.isFinite(totalViolations) || normalizedTotalViolations < 0) {
      return createDefaultAntiCheatProfile()
    }

    if (normalizedTotalViolations === 0) {
      return createDefaultAntiCheatProfile()
    }

    const lastViolationAt = Number(parsed?.lastViolationAt)
    if (!Number.isFinite(lastViolationAt) || lastViolationAt <= 0) {
      return createDefaultAntiCheatProfile()
    }

    return resolveActiveAntiCheatProfile({
      totalViolations: normalizedTotalViolations,
      lastViolationAt: Math.floor(lastViolationAt),
    })
  } catch {
    return createDefaultAntiCheatProfile()
  }
}

const resolveAntiCheatPenaltyTier = (violationCount: number) => {
  if (violationCount <= 1) {
    return 'warning'
  }

  if (violationCount === 2) {
    return 'minus-10'
  }

  if (violationCount === 3) {
    return 'minus-20'
  }

  return 'sudden-death'
}

const applyPersistentAntiCheatPenalty = (seconds: number, profile: AntiCheatPenaltyProfile) =>
  hasPersistentAntiCheatPenalty(profile)
    ? Math.max(ANTI_CHEAT_SUDDEN_DEATH_SECONDS, seconds - ANTI_CHEAT_PERSISTENT_START_PENALTY_SECONDS)
    : seconds

const buildArenaRepairPrompt = (locale: Locale, question: QuizQuestion, previousReply: string) => {
  const { user } = buildArenaPrompt(locale, question)
  const system =
    locale === 'th'
      ? 'ตอบเป็น JSON เท่านั้นในรูป {"choiceId":"...","reason":"..."} โดย choiceId ต้องตรงกับ choiceId ที่มีในโจทย์ และ reason เป็นภาษาไทย 1 ประโยคสั้น ๆ'
      : 'Reply with JSON only in the form {"choiceId":"...","reason":"..."} where choiceId exactly matches one of the listed choiceId values and reason is one short English sentence.'

  return {
    system,
    user: `${user}\n\nPrevious invalid reply:\n${previousReply.trim() || '(empty)'}\n\nReturn valid JSON only.`,
  }
}

const getInitialTrack = (): QuizTrackId => {
  if (typeof window === 'undefined') {
    return 'core'
  }

  const storedValue = window.localStorage.getItem(TRACK_STORAGE_KEY)
  return storedValue === 'core' || storedValue === 'game-dev' ? storedValue : 'core'
}

const getInitialQuizFormat = (): QuizFormatId => {
  if (typeof window === 'undefined') {
    return 'identify-language'
  }

  const storedValue = window.localStorage.getItem(QUIZ_FORMAT_STORAGE_KEY)
  return storedValue === 'identify-language' || storedValue === 'fix-error' || storedValue === 'debug' || storedValue === 'vocab'
    ? storedValue
    : 'identify-language'
}

const getInitialDifficulty = (): Difficulty => {
  if (typeof window === 'undefined') {
    return 'easy'
  }

  const storedValue = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_DIFFICULTY_STORAGE_KEY)
  return storedValue === 'easy' || storedValue === 'hard' ? storedValue : 'easy'
}

const getInitialArenaMode = (difficulty: Difficulty): ArenaModeId => difficulty

const getInitialIdentifyLength = (): IdentifySessionLengthId => {
  if (typeof window === 'undefined') {
    return 'standard'
  }

  const storedValue = window.localStorage.getItem(IDENTIFY_LENGTH_STORAGE_KEY)
  return storedValue === 'short' || storedValue === 'standard' ? storedValue : 'standard'
}

const getInitialFixErrorScope = (): FixErrorScopeId => {
  if (typeof window === 'undefined') {
    return FIX_ERROR_ALL_CORE_SCOPE
  }

  const storedValue = window.localStorage.getItem(FIX_ERROR_SCOPE_STORAGE_KEY)

  if (storedValue === FIX_ERROR_ALL_CORE_SCOPE || storedValue === FIX_ERROR_ALL_GAME_SCOPE) {
    return storedValue
  }

  return fixErrorSupportedLanguageSet.has(storedValue as FixErrorSupportedLanguageId)
    ? (storedValue as FixErrorSupportedLanguageId)
    : FIX_ERROR_ALL_CORE_SCOPE
}

const getInitialVocabDifficulty = (): Difficulty => {
  if (typeof window === 'undefined') {
    return 'easy'
  }

  const storedValue = window.localStorage.getItem(VOCAB_DIFFICULTY_STORAGE_KEY)
  return storedValue === 'easy' || storedValue === 'hard' ? storedValue : 'easy'
}

const getInitialFixErrorDifficulty = (): Difficulty => {
  if (typeof window === 'undefined') {
    return 'easy'
  }

  const storedValue = window.localStorage.getItem(FIX_ERROR_DIFFICULTY_STORAGE_KEY)
  return storedValue === 'easy' || storedValue === 'hard' ? storedValue : 'easy'
}

const getInitialDebugDifficulty = (): Difficulty => {
  if (typeof window === 'undefined') {
    return 'easy'
  }

  const storedValue = window.localStorage.getItem(DEBUG_DIFFICULTY_STORAGE_KEY)
  return storedValue === 'easy' || storedValue === 'hard' ? storedValue : 'easy'
}

const getInitialVocabLength = (): VocabSessionLengthId => {
  if (typeof window === 'undefined') {
    return 'short'
  }

  const storedValue = window.localStorage.getItem(VOCAB_LENGTH_STORAGE_KEY)
  return storedValue === 'short' || storedValue === 'standard' ? storedValue : 'short'
}

const getInitialDebugScope = (): DebugScopeId => {
  if (typeof window === 'undefined') {
    return DEBUG_ALL_CORE_SCOPE
  }

  const storedValue = window.localStorage.getItem(DEBUG_SCOPE_STORAGE_KEY)

  if (storedValue === DEBUG_ALL_CORE_SCOPE || storedValue === DEBUG_ALL_GAME_SCOPE) {
    return storedValue
  }

  return debugSupportedLanguageSet.has(storedValue as DebugSupportedLanguageId)
    ? (storedValue as DebugSupportedLanguageId)
    : DEBUG_ALL_CORE_SCOPE
}

const getInitialVocabScope = (): VocabScopeId => {
  if (typeof window === 'undefined') {
    return VOCAB_ALL_CORE_SCOPE
  }

  const storedValue = window.localStorage.getItem(VOCAB_SCOPE_STORAGE_KEY)

  if (storedValue === VOCAB_ALL_CORE_SCOPE || storedValue === VOCAB_ALL_GAME_SCOPE) {
    return storedValue
  }

  return vocabSupportedLanguageSet.has(storedValue as VocabSupportedLanguageId)
    ? (storedValue as VocabSupportedLanguageId)
    : VOCAB_ALL_CORE_SCOPE
}

const getInitialViewedGuideIds = (): ViewedGuidesByFormat => {
  if (typeof window === 'undefined') {
    return createEmptyViewedGuidesByFormat()
  }

  try {
    const storedValue = window.localStorage.getItem(VIEWED_GUIDES_STORAGE_KEY)
    const parsed = storedValue ? JSON.parse(storedValue) : createEmptyViewedGuidesByFormat()

    if (Array.isArray(parsed)) {
      return {
        ...createEmptyViewedGuidesByFormat(),
        'identify-language': normalizeViewedGuideIds('identify-language', parsed),
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return createEmptyViewedGuidesByFormat()
    }

    const nextViewedGuides = createEmptyViewedGuidesByFormat()

    for (const format of allQuizFormats) {
      nextViewedGuides[format] = normalizeViewedGuideIds(format, parsed[format])
    }

    return nextViewedGuides
  } catch {
    return createEmptyViewedGuidesByFormat()
  }
}

const supportsHardGuideLevel = (_trackId: QuizTrackId, format: QuizFormatId) =>
  format === 'identify-language' || format === 'fix-error' || format === 'debug'

const getHardUnlockedGuideIds = (trackId: QuizTrackId, format: QuizFormatId, viewedGuideIds: LanguageId[]) =>
  supportsHardGuideLevel(trackId, format)
    ? getModeScopedTopicIds(trackId, format).filter((topicId) => viewedGuideIds.includes(topicId))
    : []

const resolveDefaultGuideLevel = (
  trackId: QuizTrackId,
  format: QuizFormatId,
  difficulty: Difficulty,
  viewedGuideIds: LanguageId[],
): GuideLevel => (difficulty === 'hard' && getHardUnlockedGuideIds(trackId, format, viewedGuideIds).length > 0 ? 'hard' : 'easy')

const resolveExpandedGuideIdForGuideLevel = (
  currentExpandedId: LanguageId | null,
  trackId: QuizTrackId,
  format: QuizFormatId,
  guideLevel: GuideLevel,
  viewedGuideIds: LanguageId[],
) => {
  if (guideLevel === 'hard' && supportsHardGuideLevel(trackId, format)) {
    const unlockedTopicIds = getHardUnlockedGuideIds(trackId, format, viewedGuideIds)
    if (currentExpandedId && unlockedTopicIds.includes(currentExpandedId)) {
      return currentExpandedId
    }

    return unlockedTopicIds[0] ?? trackSettings[trackId].defaultGuideId
  }

  if (currentExpandedId && trackTopicIds[trackId].includes(currentExpandedId)) {
    return currentExpandedId
  }

  return trackSettings[trackId].defaultGuideId
}

const getInitialMusicSettings = () => {
  if (typeof window === 'undefined') {
    return createDefaultMusicSettings()
  }

  return parseStoredMusicSettings(window.localStorage.getItem(MUSIC_SETTINGS_STORAGE_KEY))
}

const getInitialArenaAiSettings = () => {
  if (typeof window === 'undefined') {
    return createDefaultArenaAiSettings()
  }

  return parseStoredArenaAiSettings(window.localStorage.getItem(ARENA_AI_SETTINGS_STORAGE_KEY))
}

const getInitialAntiCheatProfile = () => {
  if (typeof window === 'undefined') {
    return createDefaultAntiCheatProfile()
  }

  return parseStoredAntiCheatProfile(window.localStorage.getItem(ANTI_CHEAT_PROFILE_STORAGE_KEY))
}

const resolveSettingsReturnView = (candidate: AppView): SettingsReturnView => (candidate === 'settings' ? 'landing' : candidate)

function AppContent() {
  const initialQuizFormat = getInitialQuizFormat()
  const initialDifficulty = getInitialDifficulty()
  const initialFixErrorDifficulty = getInitialFixErrorDifficulty()
  const initialDebugDifficulty = getInitialDebugDifficulty()
  const initialFixErrorScope = getInitialFixErrorScope()
  const initialDebugScope = getInitialDebugScope()
  const initialVocabScope = getInitialVocabScope()
  const initialVocabDifficulty = getInitialVocabDifficulty()
  const initialVocabLength = getInitialVocabLength()
  const initialViewedGuidesByFormat = getInitialViewedGuideIds()
  const initialMusicSettings = getInitialMusicSettings()
  const initialArenaAiSettings = getInitialArenaAiSettings()
  const initialAntiCheatProfile = getInitialAntiCheatProfile()
  const initialTrack =
    initialQuizFormat === 'fix-error'
      ? getFixErrorScopeTrack(initialFixErrorScope)
      : initialQuizFormat === 'debug'
        ? getDebugScopeTrack(initialDebugScope)
        : initialQuizFormat === 'vocab'
          ? getVocabScopeTrack(initialVocabScope)
          : getInitialTrack()

  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const theme: ThemeMode = 'dark'
  const [quizFormat, setQuizFormat] = useState<QuizFormatId>(initialQuizFormat)
  const [track, setTrack] = useState<QuizTrackId>(initialTrack)
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [fixErrorDifficulty, setFixErrorDifficulty] = useState<Difficulty>(initialFixErrorDifficulty)
  const [debugDifficulty, setDebugDifficulty] = useState<Difficulty>(initialDebugDifficulty)
  const [identifyLength, setIdentifyLength] = useState<IdentifySessionLengthId>(getInitialIdentifyLength)
  const [vocabDifficulty, setVocabDifficulty] = useState<Difficulty>(initialVocabDifficulty)
  const [vocabLength, setVocabLength] = useState<VocabSessionLengthId>(initialVocabLength)
  const [fixErrorScope, setFixErrorScope] = useState<FixErrorScopeId>(initialFixErrorScope)
  const [debugScope, setDebugScope] = useState<DebugScopeId>(initialDebugScope)
  const [vocabScope, setVocabScope] = useState<VocabScopeId>(initialVocabScope)
  const [view, setView] = useState<AppView>('landing')
  const [settingsReturnView, setSettingsReturnView] = useState<SettingsReturnView>('landing')
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('active')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(identifyLanguageFormat.questionTimeLimitSeconds)
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>([])
  const [currentOutcome, setCurrentOutcome] = useState<QuestionOutcome | null>(null)
  const [hintedQuestionIds, setHintedQuestionIds] = useState<string[]>([])
  const [familyFilter, setFamilyFilter] = useState<GuideFilter>('all')
  const [guideLevel, setGuideLevel] = useState<GuideLevel>(
    resolveDefaultGuideLevel(
      initialTrack,
      initialQuizFormat,
      initialQuizFormat === 'fix-error'
        ? initialFixErrorDifficulty
        : initialQuizFormat === 'debug'
          ? initialDebugDifficulty
          : initialQuizFormat === 'vocab'
            ? initialVocabDifficulty
            : initialDifficulty,
      getViewedGuideIdsForFormat(initialViewedGuidesByFormat, initialQuizFormat),
    ),
  )
  const [expandedGuideId, setExpandedGuideId] = useState<LanguageId | null>(
    resolveExpandedGuideIdForGuideLevel(
      trackSettings[initialTrack].defaultGuideId,
      initialTrack,
      initialQuizFormat,
      resolveDefaultGuideLevel(
        initialTrack,
        initialQuizFormat,
        initialQuizFormat === 'fix-error'
          ? initialFixErrorDifficulty
          : initialQuizFormat === 'debug'
            ? initialDebugDifficulty
            : initialQuizFormat === 'vocab'
              ? initialVocabDifficulty
              : initialDifficulty,
        getViewedGuideIdsForFormat(initialViewedGuidesByFormat, initialQuizFormat),
      ),
      getViewedGuideIdsForFormat(initialViewedGuidesByFormat, initialQuizFormat),
    ),
  )
  const [comparison, setComparison] = useState<ComparisonState | null>(null)
  const [viewedGuidesByFormat, setViewedGuidesByFormat] = useState<ViewedGuidesByFormat>(initialViewedGuidesByFormat)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const [arenaFormat, setArenaFormat] = useState<QuizFormatId>('identify-language')
  const [arenaTrack, setArenaTrack] = useState<QuizTrackId>(initialTrack)
  const [arenaIdentifyMode, setArenaIdentifyMode] = useState<ArenaModeId>(getInitialArenaMode(initialDifficulty))
  const [arenaFixErrorMode, setArenaFixErrorMode] = useState<ArenaModeId>(getInitialArenaMode(initialFixErrorDifficulty))
  const [arenaDebugMode, setArenaDebugMode] = useState<ArenaModeId>(getInitialArenaMode(initialDebugDifficulty))
  const [arenaIdentifyLength, setArenaIdentifyLength] = useState<IdentifySessionLengthId>(identifyLength)
  const [arenaVocabMode, setArenaVocabMode] = useState<ArenaModeId>(getInitialArenaMode(initialVocabDifficulty))
  const [arenaVocabLength, setArenaVocabLength] = useState<VocabSessionLengthId>(initialVocabLength)
  const [arenaFixErrorScope, setArenaFixErrorScope] = useState<FixErrorScopeId>(initialFixErrorScope)
  const [arenaDebugScope, setArenaDebugScope] = useState<DebugScopeId>(initialDebugScope)
  const [arenaVocabScope, setArenaVocabScope] = useState<VocabScopeId>(initialVocabScope)
  const [arenaAiSettings, setArenaAiSettings] = useState<ArenaAiSettings>(initialArenaAiSettings)
  const [arenaApiKey, setArenaApiKey] = useState('')
  const [arenaFormError, setArenaFormError] = useState<string | null>(null)
  const [arenaRounds, setArenaRounds] = useState<ArenaRound[]>([])
  const [arenaHumanQuestions, setArenaHumanQuestions] = useState<QuizQuestion[]>([])
  const [arenaCurrentIndex, setArenaCurrentIndex] = useState(0)
  const [arenaPhase, setArenaPhase] = useState<'active' | 'feedback'>('active')
  const [arenaTimeLeft, setArenaTimeLeft] = useState(0)
  const [arenaHumanOutcomes, setArenaHumanOutcomes] = useState<ArenaOutcome[]>([])
  const [arenaAiOutcomes, setArenaAiOutcomes] = useState<ArenaOutcome[]>([])
  const [arenaAiStatus, setArenaAiStatus] = useState<'idle' | 'loading' | 'done' | 'timeout' | 'request-failed' | 'invalid-response'>('idle')
  const [arenaAiFailureReason, setArenaAiFailureReason] = useState<string | null>(null)
  const [arenaAiLastLatencyMs, setArenaAiLastLatencyMs] = useState<number | null>(null)
  const [arenaAiActiveLatencyMs, setArenaAiActiveLatencyMs] = useState<number | null>(null)
  const [arenaAiRequestBudgetMs, setArenaAiRequestBudgetMs] = useState<number | null>(null)
  const [arenaCommentary, setArenaCommentary] = useState('')
  const [arenaCommentarySource, setArenaCommentarySource] = useState<'local' | 'ai'>('local')
  const [arenaCommentaryStatus, setArenaCommentaryStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [arenaMatchKind, setArenaMatchKind] = useState<ArenaMatchKind>('live-ai')
  const [arenaGhostReplayOutcomes, setArenaGhostReplayOutcomes] = useState<ArenaOutcome[]>([])
  const [arenaGhostEvent, setArenaGhostEvent] = useState<GhostRunEventState | null>(null)
  const [quizFocusPenaltyCount, setQuizFocusPenaltyCount] = useState(0)
  const [arenaFocusPenaltyCount, setArenaFocusPenaltyCount] = useState(0)
  const [antiCheatAlert, setAntiCheatAlert] = useState<AntiCheatAlertState | null>(null)
  const [antiCheatProfile, setAntiCheatProfile] = useState<AntiCheatPenaltyProfile>(initialAntiCheatProfile)
  const [resultCoachContent, setResultCoachContent] = useState<ResultCoachContent | null>(null)
  const [resultCoachSummary, setResultCoachSummary] = useState('')
  const [resultCoachStatus, setResultCoachStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [resultCoachError, setResultCoachError] = useState<string | null>(null)
  const [resultCoachSource, setResultCoachSource] = useState<'local' | 'ai'>('local')
  const [resultCoachRefreshNonce, setResultCoachRefreshNonce] = useState(0)
  const [previousQuizRun, setPreviousQuizRun] = useState<StoredQuizRunSummary | null>(null)
  const [musicDraft, setMusicDraft] = useState<MusicDraft>(initialMusicSettings.draftTrack)
  const [musicQueue, setMusicQueue] = useState<PlaylistItem[]>(initialMusicSettings.queue)
  const [musicQueueIndex, setMusicQueueIndex] = useState(initialMusicSettings.queueIndex)
  const [musicPlaybackMode, setMusicPlaybackMode] = useState<PlaybackMode>(initialMusicSettings.playbackMode)
  const [musicThemeMode, setMusicThemeMode] = useState<ThemeModePreference>(initialMusicSettings.themeMode)
  const [musicThemeMotion, setMusicThemeMotion] = useState<ThemeMotionMode>(initialMusicSettings.themeMotion)
  const [musicThemePreset, setMusicThemePreset] = useState<ThemePresetId>(initialMusicSettings.themePreset)
  const [musicSpectrumSpeed, setMusicSpectrumSpeed] = useState(initialMusicSettings.spectrumSpeed)
  const [musicSpectrumIntensity, setMusicSpectrumIntensity] = useState(initialMusicSettings.spectrumIntensity)
  const [musicShowDiagnostics, setMusicShowDiagnostics] = useState(initialMusicSettings.showDiagnostics)
  const [musicVolume, setMusicVolume] = useState(initialMusicSettings.volume)
  const [sfxVolume, setSfxVolume] = useState(initialMusicSettings.sfxVolume)
  const [musicIsPlaying, setMusicIsPlaying] = useState(false)
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null)
  const soundcloudContainerRef = useRef<HTMLDivElement | null>(null)
  const antiCheatCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const quizQuestionStartRef = useRef(0)
  const arenaQuestionStartRef = useRef(0)
  const arenaAiAbortRef = useRef<AbortController | null>(null)
  const arenaAiTimeoutRef = useRef<number | null>(null)
  const arenaAiTurnKeyRef = useRef<string | null>(null)
  const arenaAiRequestStartedAtRef = useRef<number | null>(null)
  const arenaCommentaryAbortRef = useRef<AbortController | null>(null)
  const arenaCommentaryRequestKeyRef = useRef<string | null>(null)
  const quizDeadlineRef = useRef<number | null>(null)
  const arenaDeadlineRef = useRef<number | null>(null)
  const quizHiddenAtRef = useRef<number | null>(null)
  const arenaHiddenAtRef = useRef<number | null>(null)
  const settingsAntiCheatScopeRef = useRef<AntiCheatScope | null>(null)
  const antiCheatProfileRef = useRef<AntiCheatPenaltyProfile>(initialAntiCheatProfile)
  const resultCoachAbortRef = useRef<AbortController | null>(null)
  const resultCoachRequestVersionRef = useRef(0)
  const resultCoachRequestKeyRef = useRef<string | null>(null)
  const lastArenaEntryViewRef = useRef<AppView>('landing')
  const quizSessionIdRef = useRef(0)
  const arenaSessionIdRef = useRef(0)
  const archivedQuizSessionIdRef = useRef<number | null>(null)
  const archivedArenaSessionIdRef = useRef<number | null>(null)
  const playedQuizResultSoundSessionRef = useRef<number | null>(null)
  const audio = useQuizAudio(sfxVolume)
  const musicPlayer = useMusicPlayer({ youtubeContainerRef, soundcloudContainerRef, onEnded: handleMusicPlaybackEnded })

  const copy = uiText[locale]
  const formatCopy = extraCopy[locale]
  const formatConfig = quizFormatSettings[quizFormat]
  const isFixErrorMode = quizFormat === 'fix-error'
  const isDebugMode = quizFormat === 'debug'
  const isVocabMode = quizFormat === 'vocab'
  const isScopeMode = isFixErrorMode || isDebugMode || isVocabMode
  const activeTrack = track
  const currentGuideDifficulty =
    quizFormat === 'fix-error'
      ? fixErrorDifficulty
      : quizFormat === 'debug'
        ? debugDifficulty
        : quizFormat === 'vocab'
          ? vocabDifficulty
          : difficulty
  const viewedGuideIds = getViewedGuideIdsForFormat(viewedGuidesByFormat, quizFormat)
  const identifyLengthSetting = identifyLanguageFormat.lengths[identifyLength]
  const vocabLengthSetting = vocabFormat.lengths[vocabLength]
  const identifyQuestionCount = identifyLengthSetting.questionsPerSession
  const vocabQuestionCount = vocabLengthSetting.questionsPerSession
  const mode = isFixErrorMode
    ? resolveDifficultyModeSetting('fix-error', fixErrorDifficulty, fixErrorFormat.questionsPerSession)
    : isDebugMode
      ? resolveDifficultyModeSetting('debug', debugDifficulty, debugFormat.questionsPerSession)
      : isVocabMode
        ? resolveDifficultyModeSetting('vocab', vocabDifficulty, vocabQuestionCount)
        : resolveDifficultyModeSetting('identify-language', difficulty, identifyQuestionCount)
  const currentTrack = trackSettings[activeTrack]
  const currentQuestion = questions[currentIndex] ?? null
  const hintsRemaining = Math.max(0, mode.hintLimit - hintedQuestionIds.length)
  const currentQuestionHintVisible = currentQuestion ? hintedQuestionIds.includes(currentQuestion.id) : false
  const score = outcomes.filter((outcome) => outcome.isCorrect).length
  const breakdown = getOutcomeBreakdown(outcomes)
  const topicMetrics = useMemo(() => buildTopicMetrics(outcomes), [outcomes])
  const weakTopics = Object.entries(
    outcomes.reduce<Record<string, number>>((totals, outcome) => {
      if (!outcome.isCorrect) {
        const topicId = getOutcomeTopicId(outcome)
        totals[topicId] = (totals[topicId] ?? 0) + 1
      }

      return totals
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3) as Array<[LanguageId, number]>
  const weakTopicsKey = weakTopics.map(([topicId, count]) => `${topicId}:${count}`).join('|')
  const quizRankLadder = resolveQuizRankLadder(quizFormat, difficulty, fixErrorDifficulty, debugDifficulty, vocabDifficulty)
  const totalQuestions =
    questions.length ||
    (quizFormat === 'identify-language'
      ? identifyQuestionCount
      : quizFormat === 'vocab'
        ? vocabQuestionCount
        : formatConfig.questionsPerSession)
  const rank = getRankBand(score, totalQuestions, quizRankLadder)
  const isLastQuestion = currentIndex === questions.length - 1
  const timerProgress = `${(timeLeft / formatConfig.questionTimeLimitSeconds) * 100}%`
  const trackTopicList = getModeScopedTopicIds(activeTrack, quizFormat)
  const familyOptions = [...new Set(trackTopicList.map((topicId) => guideBookEntries[topicId].family))] as GuideFamilyId[]
  const effectiveFamilyFilter =
    familyFilter === 'all' || familyOptions.includes(familyFilter)
      ? familyFilter
      : 'all'
  const filteredGuideIds =
    effectiveFamilyFilter === 'all'
      ? trackTopicList
      : trackTopicList.filter((topicId) => guideBookEntries[topicId].family === effectiveFamilyFilter)
  const hardUnlockedTopicIds = getHardUnlockedGuideIds(activeTrack, quizFormat, viewedGuideIds)
  const trackViewedCount = trackTopicList.filter((topicId) => viewedGuideIds.includes(topicId)).length
  const arenaFormatConfig = quizFormatSettings[arenaFormat]
  const arenaTimeLimitSeconds = arenaFormatConfig.questionTimeLimitSeconds
  const arenaTimerProgress = arenaTimeLeft > 0 ? `${(arenaTimeLeft / arenaTimeLimitSeconds) * 100}%` : '0%'
  const arenaCurrentRound = arenaRounds[arenaCurrentIndex] ?? null
  const arenaCurrentQuestion = arenaCurrentRound?.humanQuestion ?? null
  const arenaCurrentOpponentQuestion = arenaCurrentRound?.opponentQuestion ?? null
  const arenaAiProvider = getArenaAiProvider(arenaAiSettings.providerId)
  const arenaAiRetryProfile = arenaAiProvider.runtimeProfile.arenaAnswer
  const arenaResolvedModelId = getArenaAiModelId(arenaAiSettings)
  const arenaResolvedBaseUrl = resolveArenaAiBaseUrl(arenaAiSettings)
  const arenaResolvedModelLabel =
    arenaAiProvider.recommendedModels.find((model) => model.id === arenaResolvedModelId)?.label ?? (arenaResolvedModelId || copy.arenaAiLabel)

  useEffect(() => {
    if (familyFilter !== effectiveFamilyFilter) {
      setFamilyFilter(effectiveFamilyFilter)
    }
  }, [effectiveFamilyFilter, familyFilter])
  const arenaTotalQuestions =
    arenaHumanQuestions.length > 0
      ? arenaHumanQuestions.length
      : arenaFormat === 'identify-language'
        ? identifyLanguageFormat.lengths[arenaIdentifyLength].questionsPerSession
        : arenaFormat === 'vocab'
          ? vocabFormat.lengths[arenaVocabLength].questionsPerSession
        : arenaFormatConfig.questionsPerSession
  const arenaHumanCorrect = arenaHumanOutcomes.filter((outcome) => outcome?.isCorrect).length
  const arenaAiCorrect = arenaAiOutcomes.filter((outcome) => outcome?.isCorrect).length
  const arenaCanProceed =
    arenaPhase === 'feedback' &&
    Boolean(arenaHumanOutcomes[arenaCurrentIndex]) &&
    Boolean(arenaAiOutcomes[arenaCurrentIndex])
  const arenaHumanMetrics = useMemo(
    () => summarizeArenaOutcomes(arenaHumanOutcomes, arenaTotalQuestions),
    [arenaHumanOutcomes, arenaTotalQuestions],
  )
  const arenaAiMetrics = useMemo(
    () => summarizeArenaOutcomes(arenaAiOutcomes, arenaTotalQuestions),
    [arenaAiOutcomes, arenaTotalQuestions],
  )
  const arenaRankLadder = resolveArenaRankLadder(
    arenaFormat,
    arenaIdentifyMode,
    arenaFixErrorMode,
    arenaDebugMode,
    arenaVocabMode,
  )
  const arenaHumanRank = useMemo(
    () => (arenaTotalQuestions > 0 ? getRankBand(arenaHumanMetrics.correctCount, arenaTotalQuestions, arenaRankLadder) : null),
    [arenaHumanMetrics.correctCount, arenaRankLadder, arenaTotalQuestions],
  )
  const arenaOpponentRank = useMemo(
    () => (arenaTotalQuestions > 0 ? getRankBand(arenaAiMetrics.correctCount, arenaTotalQuestions, arenaRankLadder) : null),
    [arenaAiMetrics.correctCount, arenaRankLadder, arenaTotalQuestions],
  )
  const screenView: AppView =
    view === 'quiz' && !currentQuestion
      ? 'menu'
      : view === 'arena-match' && !arenaCurrentQuestion
        ? 'arena'
        : view
  const currentFormatLabel = formatConfig.label[locale]
  const currentModeLabel = isScopeMode
    ? isVocabMode
      ? `${mode.label[locale]} · ${vocabLengthSetting.badge[locale]}`
      : mode.label[locale]
    : `${mode.label[locale]} · ${identifyLengthSetting.badge[locale]}`
  const currentModeBadge = isScopeMode
    ? isVocabMode
      ? `${vocabLengthSetting.badge[locale]} · ${mode.badge[locale]}`
      : mode.badge[locale]
    : `${identifyLengthSetting.badge[locale]} · ${mode.badge[locale]}`
  const currentScopeLabel = isFixErrorMode
    ? fixErrorScope === FIX_ERROR_ALL_CORE_SCOPE
      ? formatCopy.allCoreLabel
      : fixErrorScope === FIX_ERROR_ALL_GAME_SCOPE
        ? formatCopy.allGameLabel
        : getLanguageLabel(locale, fixErrorScope)
    : isDebugMode
      ? debugScope === DEBUG_ALL_CORE_SCOPE
        ? formatCopy.allCoreLabel
        : debugScope === DEBUG_ALL_GAME_SCOPE
          ? formatCopy.allGameLabel
          : getLanguageLabel(locale, debugScope)
      : isVocabMode
        ? vocabScope === VOCAB_ALL_CORE_SCOPE
          ? formatCopy.allCoreLabel
          : vocabScope === VOCAB_ALL_GAME_SCOPE
            ? formatCopy.allGameLabel
            : getLanguageLabel(locale, vocabScope)
        : currentModeLabel
  const activeIntroRules = isFixErrorMode ? formatCopy.fixErrorRules : isDebugMode ? formatCopy.debugRules : isVocabMode ? formatCopy.vocabRules : copy.introRules
  const activeMusicTrack = musicQueueIndex >= 0 ? musicQueue[musicQueueIndex] ?? null : null
  const themeTrackSource = activeMusicTrack ?? musicDraft
  const quizAverageTimeMs = getAverageTimeMs(outcomes)
  const quizHintUsedCount = outcomes.filter((outcome) => outcome.hintUsed).length
  const quizMaxCorrectStreak = getMaxCorrectStreak(outcomes)
  const quizHesitationCount = getDerivedHesitationCount(outcomes, formatConfig.questionTimeLimitSeconds * 1000)
  const mostMissedTopics = useMemo(() => getMostMissedTopics(topicMetrics), [topicMetrics])
  const mostStableTopics = useMemo(() => getMostStableTopics(topicMetrics), [topicMetrics])
  const topicCompareDeltas = useMemo(
    () => buildTopicDeltaList(topicMetrics, previousQuizRun?.topicMetrics ?? []),
    [previousQuizRun?.topicMetrics, topicMetrics],
  )
  const shouldShowResultCompare = Boolean(previousQuizRun)
  const resultCompareContext: ResultCoachCompareContext | null =
    shouldShowResultCompare && previousQuizRun
      ? {
          scoreDelta: score - previousQuizRun.score,
          wrongDelta: breakdown.wrong - previousQuizRun.breakdown.wrong,
          timeoutDelta: breakdown.timeout - previousQuizRun.breakdown.timeout,
          hintDelta: quizHintUsedCount - previousQuizRun.hintUsedCount,
          avgTimeMsDelta: quizAverageTimeMs - previousQuizRun.avgTimeMs,
          maxCorrectStreakDelta: quizMaxCorrectStreak - previousQuizRun.maxCorrectStreak,
          repeatedWeakTopics: getRepeatedWeakTopics(weakTopics, previousQuizRun.weakTopics),
          improvedTopics: topicCompareDeltas.improved,
          regressedTopics: topicCompareDeltas.regressed,
        }
      : null
  const readNextCandidates = pickReadNextCandidates(activeTrack, weakTopics, outcomes)
  const resolveFormatDifficulty = (
    format: QuizFormatId,
    nextIdentifyDifficulty: Difficulty = difficulty,
    nextFixErrorDifficulty: Difficulty = fixErrorDifficulty,
    nextDebugDifficulty: Difficulty = debugDifficulty,
    nextVocabDifficulty: Difficulty = vocabDifficulty,
  ) =>
    format === 'fix-error'
      ? nextFixErrorDifficulty
      : format === 'debug'
        ? nextDebugDifficulty
        : format === 'vocab'
          ? nextVocabDifficulty
          : nextIdentifyDifficulty
  const arenaRunBucket: ArenaRunBucket = {
    format: arenaFormat,
    track: arenaTrack,
    identifyMode: arenaIdentifyMode,
    fixErrorMode: arenaFixErrorMode,
    debugMode: arenaDebugMode,
    identifyLength: arenaIdentifyLength,
    vocabMode: arenaVocabMode,
    vocabLength: arenaVocabLength,
    fixErrorScope: arenaFixErrorScope,
    debugScope: arenaDebugScope,
    vocabScope: arenaVocabScope,
  }
  const hasMusicDrivenPalette = Boolean(themeTrackSource.aiBaseHex && themeTrackSource.aiMood)
  const arenaOpponentLabel = arenaMatchKind === 'ghost-run' ? copy.arenaGhostLabel : copy.arenaAiLabel
  const arenaOpponentModelLabel =
    arenaMatchKind === 'ghost-run' ? copy.arenaGhostResultLabel : `${arenaAiProvider.label} · ${arenaResolvedModelLabel || copy.arenaAiLabel}`
  const arenaCommentarySnapshot: ArenaCommentarySnapshot | null = useMemo(
    () =>
      arenaHumanRank && arenaOpponentRank
        ? {
            locale,
            totalQuestions: arenaTotalQuestions,
            opponentLabel: arenaOpponentLabel,
            matchKind: arenaMatchKind,
            humanMetrics: arenaHumanMetrics,
            opponentMetrics: arenaAiMetrics,
            humanRankLabel: arenaHumanRank.label[locale],
            opponentRankLabel: arenaOpponentRank.label[locale],
            focusPenaltyCount: arenaFocusPenaltyCount,
          }
        : null,
    [
      arenaAiMetrics,
      arenaFocusPenaltyCount,
      arenaHumanMetrics,
      arenaHumanRank,
      arenaMatchKind,
      arenaOpponentLabel,
      arenaOpponentRank,
      arenaTotalQuestions,
      locale,
    ],
  )
  const navLocked =
    (screenView === 'quiz' && quizPhase === 'active') ||
    (screenView === 'arena-match' && arenaPhase === 'active') ||
    (screenView === 'settings' && settingsAntiCheatScopeRef.current !== null)
  const setMusicPlayerVolume = musicPlayer.setVolume

  antiCheatProfileRef.current = antiCheatProfile

  const syncAntiCheatProfile = useCallback((nextProfile: AntiCheatPenaltyProfile) => {
    antiCheatProfileRef.current = nextProfile
    setAntiCheatProfile((current) => (areAntiCheatProfilesEqual(current, nextProfile) ? current : nextProfile))
  }, [])

  const getResolvedAntiCheatProfile = useCallback((now = Date.now()) => {
    const resolvedProfile = resolveActiveAntiCheatProfile(antiCheatProfileRef.current, now)

    if (!areAntiCheatProfilesEqual(resolvedProfile, antiCheatProfileRef.current)) {
      syncAntiCheatProfile(resolvedProfile)
    }

    return resolvedProfile
  }, [syncAntiCheatProfile])

  const dismissAntiCheatAlert = useCallback((options?: { skipTimerRestore?: boolean }) => {
    void options
    setAntiCheatAlert(null)
  }, [])

  const clearResultCoachRequest = (options?: { resetKey?: boolean; resetStatus?: boolean; resetError?: boolean }) => {
    if (resultCoachAbortRef.current) {
      resultCoachAbortRef.current.abort()
      resultCoachAbortRef.current = null
    }

    resultCoachRequestVersionRef.current += 1

    if (options?.resetKey) {
      resultCoachRequestKeyRef.current = null
    }

    if (options?.resetStatus) {
      setResultCoachStatus('idle')
    }

    if (options?.resetError) {
      setResultCoachError(null)
    }
  }
  const syncQuizTimer = useEffectEvent(() => {
    const deadline = quizDeadlineRef.current
    if (!deadline) {
      return
    }

    const remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    setTimeLeft(remainingSeconds)
  })
  const syncArenaTimer = useEffectEvent(() => {
    const deadline = arenaDeadlineRef.current
    if (!deadline) {
      return
    }

    const remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    setArenaTimeLeft(remainingSeconds)
  })
  const startQuizTimer = useCallback((seconds: number) => {
    const adjustedSeconds = applyPersistentAntiCheatPenalty(seconds, getResolvedAntiCheatProfile())
    quizDeadlineRef.current = Date.now() + adjustedSeconds * 1000
    quizHiddenAtRef.current = null
    setTimeLeft(adjustedSeconds)
  }, [getResolvedAntiCheatProfile])
  const startArenaTimer = useCallback((seconds: number) => {
    const adjustedSeconds = applyPersistentAntiCheatPenalty(seconds, getResolvedAntiCheatProfile())
    arenaDeadlineRef.current = Date.now() + adjustedSeconds * 1000
    arenaHiddenAtRef.current = null
    setArenaTimeLeft(adjustedSeconds)
  }, [getResolvedAntiCheatProfile])
  const applyTimerPenaltySeconds = useEffectEvent((scope: AntiCheatScope, penaltySeconds: number) => {
    if (scope === 'quiz' && quizDeadlineRef.current) {
      quizDeadlineRef.current -= penaltySeconds * 1000
      syncQuizTimer()
    }

    if (scope === 'arena' && arenaDeadlineRef.current) {
      arenaDeadlineRef.current -= penaltySeconds * 1000
      syncArenaTimer()
    }
  })
  const applySuddenDeathPenalty = useEffectEvent((scope: AntiCheatScope) => {
    const cappedDeadline = Date.now() + ANTI_CHEAT_SUDDEN_DEATH_SECONDS * 1000

    if (scope === 'quiz' && quizDeadlineRef.current) {
      quizDeadlineRef.current = Math.min(quizDeadlineRef.current, cappedDeadline)
      syncQuizTimer()
    }

    if (scope === 'arena' && arenaDeadlineRef.current) {
      arenaDeadlineRef.current = Math.min(arenaDeadlineRef.current, cappedDeadline)
      syncArenaTimer()
    }
  })
  const showAntiCheatAlert = useEffectEvent((scope: AntiCheatScope, message: string, detail: string) => {
    setAntiCheatAlert({
      id: Date.now(),
      scope,
      message,
      detail,
    })
  })
  const applyVisibilityPenalty = useEffectEvent((scope: AntiCheatScope, hiddenAt: number) => {
    const now = Date.now()
    const hiddenDurationMs = Math.max(0, now - hiddenAt)
    if (hiddenDurationMs < ANTI_CHEAT_MIN_HIDDEN_MS) {
      return
    }

    const activeProfile = getResolvedAntiCheatProfile(now)
    const nextProfile = {
      totalViolations: activeProfile.totalViolations + 1,
      lastViolationAt: now,
    }
    syncAntiCheatProfile(nextProfile)

    const violationCount = nextProfile.totalViolations
    const tier = resolveAntiCheatPenaltyTier(violationCount)
    const hiddenSeconds = Math.max(1, Math.round(hiddenDurationMs / 1000))

    if (scope === 'quiz') {
      setQuizFocusPenaltyCount((current) => current + 1)
    }

    if (scope === 'arena') {
      setArenaFocusPenaltyCount((current) => current + 1)
    }

    if (tier === 'minus-10') {
      applyTimerPenaltySeconds(scope, ANTI_CHEAT_SECOND_STRIKE_PENALTY_SECONDS)
    } else if (tier === 'minus-20') {
      applyTimerPenaltySeconds(scope, ANTI_CHEAT_THIRD_STRIKE_PENALTY_SECONDS)
    } else if (tier === 'sudden-death') {
      applySuddenDeathPenalty(scope)
    }

    const detailParts = [
      copy.focusPenaltyDetected.replace('{count}', String(violationCount)),
      copy.focusPenaltyHiddenDetail.replace('{seconds}', String(hiddenSeconds)),
    ]

    if (hasPersistentAntiCheatPenalty(nextProfile)) {
      detailParts.push(copy.focusPenaltyPersistentUnlock)
    }

    showAntiCheatAlert(
      scope,
      tier === 'warning'
        ? copy.focusPenaltyFirstStrike
        : tier === 'minus-10'
          ? copy.focusPenaltySecondStrike
          : tier === 'minus-20'
            ? copy.focusPenaltyThirdStrike
            : copy.focusPenaltySuddenDeath,
      detailParts.join(' '),
    )
  })

  useEffect(() => {
    persistStorage(LOCALE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (!antiCheatAlert) {
      return
    }

    const previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frameId = window.requestAnimationFrame(() => {
      antiCheatCloseButtonRef.current?.focus()
    })
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismissAntiCheatAlert()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frameId)
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusedElement && previousFocusedElement.isConnected) {
        previousFocusedElement.focus()
      }
    }
  }, [antiCheatAlert, dismissAntiCheatAlert])

  useEffect(() => {
    if (view === 'quiz' || view === 'arena-match') {
      return
    }

    dismissAntiCheatAlert({ skipTimerRestore: true })
  }, [dismissAntiCheatAlert, view])

  useEffect(() => {
    if (view !== 'settings') {
      settingsAntiCheatScopeRef.current = null
    }
  }, [view])

  useEffect(() => {
    persistStorage(QUIZ_FORMAT_STORAGE_KEY, quizFormat)
  }, [quizFormat])

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  useEffect(() => {
    const fallbackPreset = getThemePreset(musicThemePreset)
    const autoBaseHex = themeTrackSource.aiBaseHex
    const autoMood = themeTrackSource.aiMood
    const hasTrackPalette = Boolean(autoBaseHex && autoMood)
    const spectrumBaseHex = hasTrackPalette ? autoBaseHex : fallbackPreset.baseHex
    const spectrumMood = hasTrackPalette ? autoMood : fallbackPreset.mood
    const shouldBlendPreset = musicThemeMode === 'spectrum' && hasTrackPalette
    const shouldReduceThemeMotion = screenView === 'quiz' || screenView === 'arena-match'

    if (antiCheatAlert) {
      return startSmoothThemeTransition({
        targetBaseHex: '#ff4328',
        targetMood: 'phonk',
        durationMs: 780,
        fallbackBaseHex: hasTrackPalette ? autoBaseHex : SYSTEM_BASE_THEME.accent,
        fallbackMood: hasTrackPalette ? autoMood : 'ambient',
      })
    }

    if (shouldReduceThemeMotion && musicThemeMode === 'spectrum') {
      applyAITheme(
        getCurrentSpectrumThemeHex({
          baseHex: spectrumBaseHex,
          mood: spectrumMood,
          speedSeconds: musicSpectrumSpeed,
          intensity: musicSpectrumIntensity,
          mixBaseHex: shouldBlendPreset ? fallbackPreset.baseHex : undefined,
          mixMood: shouldBlendPreset ? fallbackPreset.mood : undefined,
          mixWeight: shouldBlendPreset ? 0.3 : 0,
        }),
        spectrumMood,
      )
      return
    }

    if (musicThemeMode === 'auto') {
      if (hasTrackPalette) {
        applyAITheme(autoBaseHex, autoMood)
      } else {
        resetAITheme()
      }
      return
    }

    return startDynamicSpectrumTheme({
      baseHex: spectrumBaseHex,
      mood: spectrumMood,
      speedSeconds: musicSpectrumSpeed,
      intensity: musicSpectrumIntensity,
      mixBaseHex: shouldBlendPreset ? fallbackPreset.baseHex : undefined,
      mixMood: shouldBlendPreset ? fallbackPreset.mood : undefined,
      mixWeight: shouldBlendPreset ? 0.3 : 0,
    })
  }, [
    antiCheatAlert,
    hasMusicDrivenPalette,
    musicThemeMode,
    musicThemeMotion,
    musicThemePreset,
    musicSpectrumIntensity,
    musicSpectrumSpeed,
    screenView,
    themeTrackSource,
  ])

  useEffect(() => {
    setMusicIsPlaying(musicPlayer.isPlaying)
  }, [musicPlayer.isPlaying])

  useEffect(() => {
    setMusicPlayerVolume(musicVolume)
  }, [setMusicPlayerVolume, musicVolume])

  useEffect(() => {
    persistStorage(TRACK_STORAGE_KEY, track)
  }, [track])

  useEffect(() => {
    persistStorage(DIFFICULTY_STORAGE_KEY, difficulty)
  }, [difficulty])

  useEffect(() => {
    persistStorage(FIX_ERROR_DIFFICULTY_STORAGE_KEY, fixErrorDifficulty)
  }, [fixErrorDifficulty])

  useEffect(() => {
    persistStorage(DEBUG_DIFFICULTY_STORAGE_KEY, debugDifficulty)
  }, [debugDifficulty])

  useEffect(() => {
    persistStorage(IDENTIFY_LENGTH_STORAGE_KEY, identifyLength)
  }, [identifyLength])

  useEffect(() => {
    persistStorage(VOCAB_DIFFICULTY_STORAGE_KEY, vocabDifficulty)
  }, [vocabDifficulty])

  useEffect(() => {
    persistStorage(VOCAB_LENGTH_STORAGE_KEY, vocabLength)
  }, [vocabLength])

  useEffect(() => {
    persistStorage(FIX_ERROR_SCOPE_STORAGE_KEY, fixErrorScope)
  }, [fixErrorScope])

  useEffect(() => {
    persistStorage(DEBUG_SCOPE_STORAGE_KEY, debugScope)
  }, [debugScope])

  useEffect(() => {
    persistStorage(VOCAB_SCOPE_STORAGE_KEY, vocabScope)
  }, [vocabScope])

  useEffect(() => {
    persistStorage(VIEWED_GUIDES_STORAGE_KEY, JSON.stringify(viewedGuidesByFormat))
  }, [viewedGuidesByFormat])

  useEffect(() => {
    persistStorage(ARENA_AI_SETTINGS_STORAGE_KEY, JSON.stringify(arenaAiSettings))
  }, [arenaAiSettings])

  useEffect(() => {
    persistStorage(ANTI_CHEAT_PROFILE_STORAGE_KEY, JSON.stringify(antiCheatProfile))
  }, [antiCheatProfile])

  useEffect(() => {
    const resolvedProfile = resolveActiveAntiCheatProfile(antiCheatProfile)
    if (!areAntiCheatProfilesEqual(resolvedProfile, antiCheatProfile)) {
      antiCheatProfileRef.current = resolvedProfile
      setAntiCheatProfile(resolvedProfile)
      return
    }

    if (antiCheatProfile.totalViolations === 0 || antiCheatProfile.lastViolationAt === null) {
      return
    }

    const remainingMs = antiCheatProfile.lastViolationAt + resolveAntiCheatResetWindowMs(antiCheatProfile) - Date.now()
    if (remainingMs <= 0) {
      const clearedProfile = createDefaultAntiCheatProfile()
      antiCheatProfileRef.current = clearedProfile
      setAntiCheatProfile(clearedProfile)
      return
    }

    const timeoutId = window.setTimeout(() => {
      const clearedProfile = resolveActiveAntiCheatProfile(antiCheatProfileRef.current)
      if (!areAntiCheatProfilesEqual(clearedProfile, antiCheatProfileRef.current)) {
        antiCheatProfileRef.current = clearedProfile
        setAntiCheatProfile(clearedProfile)
      }
    }, remainingMs)

    return () => window.clearTimeout(timeoutId)
  }, [antiCheatProfile])

  useEffect(() => {
    const payload = JSON.stringify({
      version: 2,
      draftTrack: musicDraft,
      activeTrack: activeMusicTrack,
      queue: musicQueue,
      queueIndex: musicQueueIndex,
      playbackMode: musicPlaybackMode,
      volume: musicVolume,
      sfxVolume,
      themeMode: musicThemeMode,
      themeMotion: musicThemeMotion,
      themePreset: musicThemePreset,
      spectrumSpeed: musicSpectrumSpeed,
      spectrumIntensity: musicSpectrumIntensity,
      showDiagnostics: musicShowDiagnostics,
    })
    persistStorage(MUSIC_SETTINGS_STORAGE_KEY, payload)
  }, [
    activeMusicTrack,
    musicDraft,
    musicPlaybackMode,
    musicQueue,
    musicQueueIndex,
    musicShowDiagnostics,
    musicSpectrumIntensity,
    musicSpectrumSpeed,
    musicThemeMode,
    musicThemeMotion,
    musicThemePreset,
    musicVolume,
    sfxVolume,
  ])

  useEffect(() => {
    if (view !== 'quiz' || quizPhase !== 'active') {
      quizHiddenAtRef.current = null
      return
    }

    syncQuizTimer()
    const intervalId = window.setInterval(syncQuizTimer, 250)

    return () => window.clearInterval(intervalId)
  }, [currentIndex, quizPhase, view])

  useEffect(() => {
    if (view !== 'arena-match' || arenaPhase !== 'active' || arenaGhostEvent) {
      arenaHiddenAtRef.current = null
      return
    }

    syncArenaTimer()
    const intervalId = window.setInterval(syncArenaTimer, 250)

    return () => window.clearInterval(intervalId)
  }, [arenaCurrentIndex, arenaGhostEvent, arenaPhase, view])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (arenaGhostEvent) {
        return
      }

      if (document.hidden) {
        if (view === 'quiz' && quizPhase === 'active' && !quizHiddenAtRef.current) {
          quizHiddenAtRef.current = Date.now()
        }

        if (view === 'arena-match' && arenaPhase === 'active' && !arenaHiddenAtRef.current) {
          arenaHiddenAtRef.current = Date.now()
        }

        if (view === 'settings' && settingsAntiCheatScopeRef.current === 'quiz' && !quizHiddenAtRef.current) {
          quizHiddenAtRef.current = Date.now()
        }

        if (view === 'settings' && settingsAntiCheatScopeRef.current === 'arena' && !arenaHiddenAtRef.current) {
          arenaHiddenAtRef.current = Date.now()
        }
        return
      }

      if (view === 'quiz' && quizPhase === 'active' && quizHiddenAtRef.current) {
        const hiddenAt = quizHiddenAtRef.current
        quizHiddenAtRef.current = null
        applyVisibilityPenalty('quiz', hiddenAt)
      }

      if (view === 'arena-match' && arenaPhase === 'active' && arenaHiddenAtRef.current) {
        const hiddenAt = arenaHiddenAtRef.current
        arenaHiddenAtRef.current = null
        applyVisibilityPenalty('arena', hiddenAt)
      }

      if (view === 'settings' && settingsAntiCheatScopeRef.current === 'quiz' && quizHiddenAtRef.current) {
        const hiddenAt = quizHiddenAtRef.current
        quizHiddenAtRef.current = null
        applyVisibilityPenalty('quiz', hiddenAt)
      }

      if (view === 'settings' && settingsAntiCheatScopeRef.current === 'arena' && arenaHiddenAtRef.current) {
        const hiddenAt = arenaHiddenAtRef.current
        arenaHiddenAtRef.current = null
        applyVisibilityPenalty('arena', hiddenAt)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [arenaGhostEvent, arenaPhase, quizPhase, view])

  useEffect(() => {
    if (view !== 'landing' || !pendingScrollId) {
      return
    }

    const target = document.getElementById(pendingScrollId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const timeoutId = window.setTimeout(() => setPendingScrollId(null), 0)
    return () => window.clearTimeout(timeoutId)
  }, [view, pendingScrollId])

  async function playPlaylistTrack(track: PlaylistItem) {
    if (track.sourceType === 'direct') {
      await musicPlayer.playDirect(track.url)
      return
    }

    if (track.sourceType === 'youtube') {
      const videoId = getYouTubeId(track.url)
      if (!videoId) {
        throw new Error(copy.settingsInvalidUrl)
      }
      await musicPlayer.playYouTube(videoId)
      return
    }

    if (track.sourceType === 'soundcloud') {
      await musicPlayer.playSoundCloud(track.url)
      return
    }

    throw new Error(copy.settingsInvalidUrl)
  }

  async function playQueueIndex(nextIndex: number) {
    const nextState = syncQueueState(musicQueue, nextIndex)
    if (!nextState.activeTrack) {
      musicPlayer.stop()
      setMusicIsPlaying(false)
      return
    }

    setMusicQueueIndex(nextState.queueIndex)
    setMusicDraft({
      url: nextState.activeTrack.url,
      sourceType: nextState.activeTrack.sourceType,
      title: nextState.activeTrack.title,
      artist: nextState.activeTrack.artist,
      aiMood: nextState.activeTrack.aiMood,
      aiBaseHex: nextState.activeTrack.aiBaseHex,
    })
    await playPlaylistTrack(nextState.activeTrack)
  }

  async function handleMusicPlaybackEnded() {
    const nextIndex = resolveNextQueueIndex(musicQueue, musicQueueIndex, musicPlaybackMode)
    if (nextIndex < 0) {
      setMusicIsPlaying(false)
      return
    }

    try {
      await playQueueIndex(nextIndex)
    } catch {
      setMusicIsPlaying(false)
    }
  }

  const recordArenaOutcome = useCallback(
    (
      participant: 'human' | 'ai',
      question: QuizQuestion,
      index: number,
      selectedChoice: string | null,
      result: 'correct' | 'wrong' | 'timeout',
      timeMs: number,
      reason?: string | null,
    ) => {
      const answer = String(question.answer)
      const isCorrect = result === 'correct'
      const nextOutcome: ArenaOutcome = {
        questionId: question.id,
        format: question.format,
        answer,
        selectedChoice,
        isCorrect,
        result,
        timeMs,
        reason: reason ?? null,
      }

      if (participant === 'human') {
        if (arenaHumanOutcomes[index]) {
          return
        }
        setArenaHumanOutcomes((current) => {
          if (current[index]) {
            return current
          }
          const next = [...current]
          next[index] = nextOutcome
          return next
        })
        return
      }

      if (arenaAiOutcomes[index]) {
        return
      }
      setArenaAiOutcomes((current) => {
        if (current[index]) {
          return current
        }
        const next = [...current]
        next[index] = nextOutcome
        return next
      })
    },
    [arenaAiOutcomes, arenaHumanOutcomes],
  )

  const onTimeout = useEffectEvent(() => {
    const question = questions[currentIndex]

    if (!question || view !== 'quiz' || quizPhase !== 'active') {
      return
    }

    const elapsed = Math.min(performance.now() - quizQuestionStartRef.current, formatConfig.questionTimeLimitSeconds * 1000)

    const nextOutcome: QuestionOutcome =
      question.format === 'identify-language'
        ? {
            questionId: question.id,
            format: question.format,
            answer: question.answer,
            selectedChoice: null,
            isCorrect: false,
            result: 'timeout',
            hintUsed: hintedQuestionIds.includes(question.id),
            timeMs: elapsed,
            difficulty,
            track: activeTrack,
          }
        : question.format === 'vocab'
          ? {
              questionId: question.id,
              format: question.format,
              language: question.language,
              difficulty: question.difficulty,
              answer: question.answer,
              selectedChoice: null,
              isCorrect: false,
              result: 'timeout',
              hintUsed: hintedQuestionIds.includes(question.id),
              timeMs: elapsed,
              track: question.track,
            }
        : {
            questionId: question.id,
            format: question.format,
            language: question.language,
            difficulty: question.difficulty,
            answer: question.answer,
            selectedChoice: null,
            isCorrect: false,
            result: 'timeout',
            hintUsed: hintedQuestionIds.includes(question.id),
            timeMs: elapsed,
            track: question.track,
          }

    setCurrentOutcome(nextOutcome)
    setOutcomes((current) => [...current, nextOutcome])
    audio.playAnswerWrong()
    setQuizPhase('feedback')
  })

  useEffect(() => {
    if (view === 'quiz' && quizPhase === 'active' && timeLeft === 0) {
      onTimeout()
    }
  }, [view, quizPhase, timeLeft])

  const onArenaTimeout = useEffectEvent(() => {
    const question = arenaCurrentQuestion

    if (!question || view !== 'arena-match' || arenaPhase !== 'active') {
      return
    }

    if (arenaHumanOutcomes[arenaCurrentIndex]) {
      return
    }

    recordArenaOutcome('human', question, arenaCurrentIndex, null, 'timeout', arenaTimeLimitSeconds * 1000)
    audio.playAnswerWrong()
    setArenaPhase('feedback')
  })

  useEffect(() => {
    if (view === 'arena-match' && arenaPhase === 'active' && arenaTimeLeft === 0) {
      onArenaTimeout()
    }
  }, [view, arenaPhase, arenaTimeLeft])

  const clearArenaAiRequest = useCallback((options?: { controller?: AbortController; timeoutId?: number; abort?: boolean }) => {
    const shouldAbort = options?.abort ?? true

    if (arenaAiAbortRef.current && (!options?.controller || arenaAiAbortRef.current === options.controller)) {
      if (shouldAbort) {
        arenaAiAbortRef.current.abort()
      }
      arenaAiAbortRef.current = null
    }

    if (arenaAiTimeoutRef.current !== null && (options?.timeoutId === undefined || arenaAiTimeoutRef.current === options.timeoutId)) {
      window.clearTimeout(arenaAiTimeoutRef.current)
      arenaAiTimeoutRef.current = null
    }

    if (!options?.controller || arenaAiAbortRef.current === null) {
      arenaAiRequestStartedAtRef.current = null
      setArenaAiActiveLatencyMs(null)
    }
  }, [])

  const resetArenaAiTurnState = useCallback((options?: { abort?: boolean; resetStatus?: boolean }) => {
    clearArenaAiRequest({ abort: options?.abort })
    arenaAiTurnKeyRef.current = null
    setArenaAiFailureReason(null)
    setArenaAiRequestBudgetMs(null)
    setArenaAiLastLatencyMs(null)

    if (options?.resetStatus ?? true) {
      setArenaAiStatus('idle')
    }
  }, [clearArenaAiRequest])

  const startArenaAiRequest = useEffectEvent(async (question: QuizQuestion, index: number, turnKey: string) => {
    if (!arenaApiKey.trim() || !arenaResolvedBaseUrl || !arenaResolvedModelId) {
      return
    }

    const runtimeProfile = arenaAiRetryProfile
    const controller = new AbortController()
    const timeLimitMs = arenaTimeLimitSeconds * 1000
    const requestBudgetMs = Math.min(timeLimitMs, runtimeProfile.timeoutBudgetMs)
    const startTime = performance.now()

    const commitNoAnswerOutcome = (
      status: 'timeout' | 'request-failed' | 'invalid-response',
      failureReason: string | null,
    ) => {
      const elapsed = Math.min(performance.now() - startTime, timeLimitMs)

      recordArenaOutcome(
        'ai',
        question,
        index,
        null,
        'timeout',
        elapsed,
        null,
      )
      setArenaAiLastLatencyMs(Math.round(elapsed))
      setArenaAiFailureReason(failureReason)
      setArenaAiStatus(status)
    }

    clearArenaAiRequest()
    arenaAiAbortRef.current = controller
    arenaAiTurnKeyRef.current = turnKey
    arenaAiRequestStartedAtRef.current = startTime
    setArenaAiRequestBudgetMs(requestBudgetMs)
    setArenaAiActiveLatencyMs(0)
    setArenaAiFailureReason(null)
    setArenaAiStatus('loading')

    const timeoutId = window.setTimeout(() => {
      controller.abort()
    }, requestBudgetMs)
    arenaAiTimeoutRef.current = timeoutId

    try {
      const prompt = buildArenaPrompt(locale, question)
      let content = ''
      let parsed = { choiceId: null, reason: null } as ReturnType<typeof parseArenaResponse>

      for (let attempt = 0; attempt <= runtimeProfile.retryCount; attempt += 1) {
        const nextPrompt = attempt === 0 ? prompt : buildArenaRepairPrompt(locale, question, content)
        content = await requestAiText({
          config: {
            ...arenaAiSettings,
            apiKey: arenaApiKey,
          },
          system: nextPrompt.system,
          user: nextPrompt.user,
          temperature: runtimeProfile.temperature,
          topP: runtimeProfile.topP,
          maxTokens: runtimeProfile.maxTokens,
          structuredOutput:
            runtimeProfile.responseStrategy === 'compact-json'
              ? {
                  name: 'arena_answer',
                  description: 'Return the quiz answer as compact JSON with the exact choiceId and one short reason.',
                  schema: buildArenaResponseJsonSchema(question),
                }
              : undefined,
          retryCount: runtimeProfile.transientRetryCount,
          retryBackoffMs: runtimeProfile.transientRetryBackoffMs,
          signal: controller.signal,
        })

        parsed = parseArenaResponse(question, content)
        if (parsed.choiceId) {
          break
        }
      }

      if (view !== 'arena-match' || arenaAiTurnKeyRef.current !== turnKey) {
        return
      }

      const choiceId = parsed.choiceId
      if (!choiceId) {
        commitNoAnswerOutcome('invalid-response', 'AI returned a reply, but no valid choiceId could be parsed.')
        return
      }

      const elapsed = Math.min(performance.now() - startTime, timeLimitMs)
      const isCorrect = String(question.answer) === choiceId
      recordArenaOutcome('ai', question, index, choiceId, isCorrect ? 'correct' : 'wrong', elapsed, parsed.reason)
      setArenaAiLastLatencyMs(Math.round(elapsed))
      setArenaAiFailureReason(null)
      setArenaAiStatus('done')
    } catch (error) {
      if (view !== 'arena-match' || arenaAiTurnKeyRef.current !== turnKey) {
        return
      }

      if (controller.signal.aborted) {
        commitNoAnswerOutcome('timeout', `Timed out after ${requestBudgetMs} ms.`)
      } else {
        commitNoAnswerOutcome(
          'request-failed',
          buildArenaAiFailureReason(error, copy.arenaAiProviderBusy, 'AI request failed before a valid answer was returned.'),
        )
      }
    } finally {
      clearArenaAiRequest({ controller, timeoutId, abort: false })
    }
  })

  useEffect(() => {
    if (view !== 'arena-match' || arenaAiStatus !== 'loading' || arenaAiRequestStartedAtRef.current === null) {
      return
    }

    const updateLatency = () => {
      if (arenaAiRequestStartedAtRef.current === null) {
        return
      }

      setArenaAiActiveLatencyMs(Math.round(performance.now() - arenaAiRequestStartedAtRef.current))
    }

    updateLatency()
    const intervalId = window.setInterval(updateLatency, ARENA_AI_ACTIVE_LATENCY_POLL_MS)
    return () => window.clearInterval(intervalId)
  }, [arenaAiStatus, view])

  const dismissGhostRunEvent = useCallback(() => {
    if (!arenaGhostEvent) {
      return
    }

    setArenaGhostEvent(null)

    if (view === 'arena-match' && arenaPhase === 'active' && !arenaDeadlineRef.current) {
      startArenaTimer(arenaTimeLimitSeconds)
      arenaQuestionStartRef.current = performance.now()
    }
  }, [arenaGhostEvent, arenaPhase, arenaTimeLimitSeconds, startArenaTimer, view])

  useEffect(() => {
    if (!arenaGhostEvent) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dismissGhostRunEvent()
    }, GHOST_RUN_AUTO_CLOSE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [arenaGhostEvent, dismissGhostRunEvent])

  useEffect(() => {
    if (view !== 'arena-match' || arenaPhase !== 'active' || arenaAiStatus !== 'idle' || !arenaCurrentOpponentQuestion || arenaMatchKind !== 'live-ai' || arenaGhostEvent) {
      return
    }

    if (
      !isArenaAiReady({
        ...arenaAiSettings,
        apiKey: arenaApiKey,
      })
    ) {
      return
    }

    const turnKey = buildArenaTurnKey(arenaSessionIdRef.current, arenaCurrentIndex)

    if (arenaAiTurnKeyRef.current === turnKey) {
      return
    }

    startArenaAiRequest(arenaCurrentOpponentQuestion, arenaCurrentIndex, turnKey)
  }, [
    arenaApiKey,
    arenaAiStatus,
    arenaAiSettings,
    arenaCurrentIndex,
    arenaCurrentOpponentQuestion,
    arenaGhostEvent,
    arenaMatchKind,
    arenaPhase,
    arenaResolvedBaseUrl,
    arenaResolvedModelId,
    locale,
    view,
  ])

  useEffect(() => {
    if (view !== 'arena-match' || arenaPhase !== 'active' || arenaAiStatus !== 'idle' || !arenaCurrentQuestion || arenaMatchKind !== 'ghost-run' || arenaGhostEvent) {
      return
    }

    const archivedGhostOutcome = arenaGhostReplayOutcomes[arenaCurrentIndex]
    if (!archivedGhostOutcome) {
      recordArenaOutcome('ai', arenaCurrentQuestion, arenaCurrentIndex, null, 'timeout', arenaTimeLimitSeconds * 1000, null)
      setArenaAiStatus('timeout')
      return
    }

    const turnKey = buildArenaTurnKey(arenaSessionIdRef.current, arenaCurrentIndex)

    if (arenaAiTurnKeyRef.current === turnKey) {
      return
    }

    const replayDelayMs = Math.min(Math.max(0, archivedGhostOutcome.timeMs), arenaTimeLimitSeconds * 1000)
    arenaAiTurnKeyRef.current = turnKey
    setArenaAiStatus('loading')

    const timeoutId = window.setTimeout(() => {
      if (view !== 'arena-match' || arenaAiTurnKeyRef.current !== turnKey) {
        return
      }

      recordArenaOutcome(
        'ai',
        arenaCurrentQuestion,
        arenaCurrentIndex,
        archivedGhostOutcome.selectedChoice,
        archivedGhostOutcome.result,
        replayDelayMs,
        null,
      )
      setArenaAiStatus(archivedGhostOutcome.result === 'timeout' ? 'timeout' : 'done')
    }, replayDelayMs)

    arenaAiTimeoutRef.current = timeoutId

    return () => {
      if (arenaAiTimeoutRef.current === timeoutId) {
        window.clearTimeout(timeoutId)
        arenaAiTimeoutRef.current = null
      }
    }
  }, [
    arenaAiStatus,
    arenaCurrentIndex,
    arenaCurrentQuestion,
    arenaGhostEvent,
    arenaGhostReplayOutcomes,
    arenaMatchKind,
    arenaPhase,
    arenaTimeLimitSeconds,
    recordArenaOutcome,
    view,
  ])

  useEffect(() => {
    if (view !== 'arena-match') {
      resetArenaAiTurnState()
      setArenaGhostEvent(null)
    }
  }, [resetArenaAiTurnState, view])

  const handleArenaFormatChange = (nextFormat: QuizFormatId) => {
    setArenaFormat(nextFormat)
    setArenaFormError(null)
    if (nextFormat === 'fix-error') {
      setArenaFixErrorScope(arenaTrack === 'core' ? FIX_ERROR_ALL_CORE_SCOPE : FIX_ERROR_ALL_GAME_SCOPE)
    }
    if (nextFormat === 'debug') {
      setArenaDebugScope(arenaTrack === 'core' ? DEBUG_ALL_CORE_SCOPE : DEBUG_ALL_GAME_SCOPE)
    }
    if (nextFormat === 'vocab') {
      setArenaVocabMode('easy')
      setArenaVocabLength('short')
      setArenaVocabScope(arenaTrack === 'core' ? VOCAB_ALL_CORE_SCOPE : VOCAB_ALL_GAME_SCOPE)
    }
  }

  const handleArenaTrackChange = (nextTrack: QuizTrackId) => {
    setArenaTrack(nextTrack)
    if (arenaFormat === 'fix-error') {
      setArenaFixErrorScope(nextTrack === 'core' ? FIX_ERROR_ALL_CORE_SCOPE : FIX_ERROR_ALL_GAME_SCOPE)
    }
    if (arenaFormat === 'debug') {
      setArenaDebugScope(nextTrack === 'core' ? DEBUG_ALL_CORE_SCOPE : DEBUG_ALL_GAME_SCOPE)
    }
    if (arenaFormat === 'vocab') {
      setArenaVocabScope(nextTrack === 'core' ? VOCAB_ALL_CORE_SCOPE : VOCAB_ALL_GAME_SCOPE)
    }
  }

  const startArenaMatch = () => {
    if (!arenaApiKey.trim()) {
      setArenaFormError(copy.arenaNoKeyError)
      return
    }
    if (!arenaResolvedBaseUrl) {
      setArenaFormError(arenaAiProvider.extraField ? copy.arenaMissingExtraFieldError : copy.arenaMissingBaseUrlError)
      return
    }
    if (!arenaResolvedModelId) {
      setArenaFormError(copy.arenaNoModelError)
      return
    }

    try {
      arenaSessionIdRef.current += 1
      archivedArenaSessionIdRef.current = null

      const generatedRounds =
        arenaFormat === 'identify-language'
          ? createArenaIdentifyRounds(
              arenaTrack,
              arenaIdentifyMode,
              identifyLanguageFormat.lengths[arenaIdentifyLength].questionsPerSession,
            )
          : arenaFormat === 'fix-error'
            ? createArenaFixErrorRounds(arenaFixErrorScope, arenaFixErrorMode, fixErrorFormat.questionsPerSession)
            : arenaFormat === 'vocab'
              ? createArenaVocabRounds(
                  arenaVocabScope,
                  arenaVocabMode,
                  vocabFormat.lengths[arenaVocabLength].questionsPerSession,
                )
              : createArenaDebugRounds(arenaDebugScope, arenaDebugMode, debugFormat.questionsPerSession)
      const archivedGhostRun = loadLatestArenaRunArchive(arenaRunBucket)
      const shouldTriggerGhost = isGhostReplayArchiveReady(archivedGhostRun) && Math.random() < GHOST_RUN_CHANCE
      const nextRounds =
        shouldTriggerGhost && archivedGhostRun
          ? archivedGhostRun.humanQuestions.map<ArenaRound>((question) => ({
              humanQuestion: question,
              opponentQuestion: question,
              opponentDifficulty: 'hard',
            }))
          : generatedRounds
      const nextHumanQuestions = nextRounds.map((round) => round.humanQuestion)

      audio.playTap()
      dismissAntiCheatAlert({ skipTimerRestore: true })
      resetArenaAiTurnState()
      setArenaCommentary('')
      setArenaCommentarySource('local')
      setArenaCommentaryStatus('idle')
      arenaCommentaryRequestKeyRef.current = null
      arenaCommentaryAbortRef.current?.abort()
      arenaCommentaryAbortRef.current = null
      setArenaFormError(null)
      setArenaMatchKind(shouldTriggerGhost ? 'ghost-run' : 'live-ai')
      setArenaGhostReplayOutcomes(shouldTriggerGhost && archivedGhostRun ? archivedGhostRun.humanOutcomes : [])
      setArenaGhostEvent(shouldTriggerGhost ? { id: Date.now() } : null)
      setArenaRounds(nextRounds)
      setArenaHumanQuestions(nextHumanQuestions)
      setArenaCurrentIndex(0)
      setArenaPhase('active')
      if (shouldTriggerGhost) {
        arenaDeadlineRef.current = null
        arenaHiddenAtRef.current = null
        setArenaTimeLeft(applyPersistentAntiCheatPenalty(arenaTimeLimitSeconds, getResolvedAntiCheatProfile()))
      } else {
        startArenaTimer(arenaTimeLimitSeconds)
      }
      setArenaHumanOutcomes([])
      setArenaAiOutcomes([])
      setArenaFocusPenaltyCount(0)
      arenaQuestionStartRef.current = shouldTriggerGhost ? 0 : performance.now()
      setView('arena-match')
    } catch {
      setArenaFormError(copy.arenaSetupError)
    }
  }

  const handleArenaChoice = (choiceId: string) => {
    const question = arenaCurrentQuestion
    if (!question || view !== 'arena-match' || arenaPhase !== 'active') {
      return
    }

    const elapsed = Math.min(performance.now() - arenaQuestionStartRef.current, arenaTimeLimitSeconds * 1000)
    const isCorrect = String(question.answer) === choiceId
    recordArenaOutcome('human', question, arenaCurrentIndex, choiceId, isCorrect ? 'correct' : 'wrong', elapsed)
    if (isCorrect) {
      audio.playAnswerCorrect()
    } else {
      audio.playAnswerWrong()
    }
    setArenaPhase('feedback')
  }

  const handleArenaNextQuestion = () => {
    if (!arenaCanProceed) {
      return
    }

    if (arenaCurrentIndex >= arenaHumanQuestions.length - 1) {
      dismissAntiCheatAlert({ skipTimerRestore: true })
      setView('arena-result')
      return
    }

    const nextIndex = arenaCurrentIndex + 1
    resetArenaAiTurnState()
    setArenaCurrentIndex(nextIndex)
    setArenaPhase('active')
    startArenaTimer(arenaTimeLimitSeconds)
    arenaQuestionStartRef.current = performance.now()
  }

  const handleArenaBackToArena = () => {
    dismissAntiCheatAlert({ skipTimerRestore: true })
    resetArenaAiTurnState()
    setArenaGhostEvent(null)
    setView('arena')
  }

  const handleArenaBack = () => {
    dismissAntiCheatAlert({ skipTimerRestore: true })
    resetArenaAiTurnState()
    setArenaGhostEvent(null)
    audio.playTap()

    const target = lastArenaEntryViewRef.current
    if (target === 'arena' || target === 'arena-match' || target === 'arena-result') {
      setView('landing')
      return
    }

    setView(target)
  }

  const handleArenaBackToLanding = () => {
    dismissAntiCheatAlert({ skipTimerRestore: true })
    resetArenaAiTurnState()
    setArenaGhostEvent(null)
    setView('landing')
  }

  const handleSettingsBack = () => {
    audio.playTap()
    settingsAntiCheatScopeRef.current = null
    setView(settingsReturnView)
  }

  const handleStartArenaFromLanding = () => {
    audio.playTap()
    lastArenaEntryViewRef.current = 'landing'
    setView('arena')
  }

  const handleOpenSettings = () => {
    audio.playTap()
    if (screenView === 'settings') {
      return
    }

    setSettingsReturnView(resolveSettingsReturnView(screenView))
    settingsAntiCheatScopeRef.current =
      screenView === 'quiz' && quizPhase === 'active'
        ? 'quiz'
        : screenView === 'arena-match' && arenaPhase === 'active' && !arenaGhostEvent
          ? 'arena'
          : null
    setView('settings')
  }

  const handleMusicDraftUrlChange = (url: string) => {
    setMusicDraft({
      url,
      sourceType: detectSourceType(url),
      title: '',
      artist: '',
      aiMood: '',
      aiBaseHex: '',
    })
  }

  const handleMusicDraftChange = (patch: Partial<MusicDraft>) => {
    setMusicDraft((current) => ({ ...current, ...patch }))
  }

  const handleApplyMusicTrack = async (track: PlaylistItem) => {
    const nextState = replaceCurrentTrack(musicQueue, musicQueueIndex, track)
    await playPlaylistTrack(track)
    setMusicQueue(nextState.queue)
    setMusicQueueIndex(nextState.queueIndex)
    setMusicDraft({
      url: track.url,
      sourceType: track.sourceType,
      title: track.title,
      artist: track.artist,
      aiMood: track.aiMood,
      aiBaseHex: track.aiBaseHex,
    })
  }

  const handleAddTrackToQueue = (track: PlaylistItem) => {
    const nextState = appendTrackToQueue(musicQueue, musicQueueIndex, track)
    setMusicQueue(nextState.queue)
    setMusicQueueIndex(nextState.queueIndex)
    setMusicDraft({
      url: track.url,
      sourceType: track.sourceType,
      title: track.title,
      artist: track.artist,
      aiMood: track.aiMood,
      aiBaseHex: track.aiBaseHex,
    })
  }

  const handlePauseMusic = () => {
    musicPlayer.pause()
    setMusicIsPlaying(false)
  }

  const handleResumeMusic = async () => {
    await musicPlayer.resume()
    setMusicIsPlaying(true)
  }

  const handleStopMusic = () => {
    musicPlayer.stop()
    setMusicIsPlaying(false)
  }

  const handlePlayQueueTrack = async (trackId: string) => {
    const nextIndex = musicQueue.findIndex((item) => item.id === trackId)
    if (nextIndex < 0) {
      return
    }

    audio.playTap()
    await playQueueIndex(nextIndex)
  }

  const handlePreviousMusicTrack = async () => {
    const nextIndex = resolvePreviousQueueIndex(musicQueue, musicQueueIndex, musicPlaybackMode)
    if (nextIndex < 0) {
      return
    }

    audio.playTap()
    await playQueueIndex(nextIndex)
  }

  const handleNextMusicTrack = async () => {
    const nextIndex = resolveNextQueueIndex(musicQueue, musicQueueIndex, musicPlaybackMode)
    if (nextIndex < 0) {
      musicPlayer.stop()
      setMusicIsPlaying(false)
      return
    }

    audio.playTap()
    await playQueueIndex(nextIndex)
  }

  const handleRemoveQueueTrack = async (trackId: string) => {
    const removingCurrent = activeMusicTrack?.id === trackId
    const nextState = removeTrackFromQueue(musicQueue, musicQueueIndex, trackId)

    setMusicQueue(nextState.queue)
    setMusicQueueIndex(nextState.queueIndex)

    if (!removingCurrent) {
      return
    }

    if (!nextState.activeTrack) {
      musicPlayer.stop()
      setMusicIsPlaying(false)
      return
    }

    if (musicIsPlaying) {
      try {
        await playPlaylistTrack(nextState.activeTrack)
      } catch {
        setMusicIsPlaying(false)
      }
    }
  }

  const handleMusicPlaybackModeChange = (mode: PlaybackMode) => {
    setMusicPlaybackMode(mode)
  }

  const handleMusicThemeModeChange = (mode: ThemeModePreference) => {
    setMusicThemeMode(mode)
    setMusicThemeMotion(mode === 'spectrum' ? 'spectrum' : 'static')
  }

  const handleSfxVolumeChange = useCallback(
    (value: number) => {
      const next = Math.min(1, Math.max(0, Number(value.toFixed(2))))
      setSfxVolume(next)
      audio.playTap(next)
    },
    [audio],
  )

  const handleClearMusicSettings = () => {
    musicPlayer.stop()
    resetAITheme()
    const defaults = createDefaultMusicSettings()
    setMusicDraft(createEmptyMusicDraft())
    setMusicQueue([])
    setMusicQueueIndex(-1)
    setMusicPlaybackMode('normal')
    setMusicThemeMode('auto')
    setMusicThemeMotion('static')
    setMusicThemePreset('aurora')
    setMusicSpectrumSpeed(105)
    setMusicSpectrumIntensity(0.55)
    setMusicShowDiagnostics(false)
    setMusicVolume(defaults.volume)
    setSfxVolume(defaults.sfxVolume)
    setMusicIsPlaying(false)
  }

  const applyTrackSelection = (
    nextTrack: QuizTrackId,
    nextFormat: QuizFormatId = quizFormat,
    nextDifficulty: Difficulty = resolveFormatDifficulty(nextFormat),
  ) => {
    const nextViewedGuideIds = getViewedGuideIdsForFormat(viewedGuidesByFormat, nextFormat)
    const nextGuideLevel = resolveDefaultGuideLevel(nextTrack, nextFormat, nextDifficulty, nextViewedGuideIds)

    setTrack(nextTrack)
    setFamilyFilter('all')
    setGuideLevel(nextGuideLevel)
    setExpandedGuideId((current) =>
      resolveExpandedGuideIdForGuideLevel(current, nextTrack, nextFormat, nextGuideLevel, nextViewedGuideIds),
    )
    setComparison(null)
  }

  const markGuideViewed = (format: QuizFormatId, topicId: LanguageId) => {
    setViewedGuidesByFormat((current) => {
      const currentIds = getViewedGuideIdsForFormat(current, format)
      if (currentIds.includes(topicId)) {
        return current
      }

      return {
        ...current,
        [format]: [...currentIds, topicId],
      }
    })
  }

  const startNewQuiz = ({
    nextFormat = quizFormat,
    nextTrack = activeTrack,
    nextDifficulty = difficulty,
    nextFixErrorDifficulty = fixErrorDifficulty,
    nextDebugDifficulty = debugDifficulty,
    nextVocabDifficulty = vocabDifficulty,
    nextVocabLength = vocabLength,
    nextFixErrorScope = fixErrorScope,
    nextDebugScope = debugScope,
    nextVocabScope = vocabScope,
    priorityTopics,
    priorityTopicLimit = 6,
  }: {
    nextFormat?: QuizFormatId
    nextTrack?: QuizTrackId
    nextDifficulty?: Difficulty
    nextFixErrorDifficulty?: Difficulty
    nextDebugDifficulty?: Difficulty
    nextVocabDifficulty?: Difficulty
    nextVocabLength?: VocabSessionLengthId
    nextFixErrorScope?: FixErrorScopeId
    nextDebugScope?: DebugScopeId
    nextVocabScope?: VocabScopeId
    priorityTopics?: LanguageId[]
    priorityTopicLimit?: number
	  } = {}) => {
    quizSessionIdRef.current += 1
    archivedQuizSessionIdRef.current = null
    const identifyQuestionsPerSession = identifyLanguageFormat.lengths[identifyLength].questionsPerSession
    const vocabQuestionsPerSession = vocabFormat.lengths[nextVocabLength].questionsPerSession
    const nextQuestions =
      nextFormat === 'identify-language'
        ? createIdentifyLanguageSession(questionBanks[nextTrack][nextDifficulty], identifyQuestionsPerSession, {
            priorityTopics,
            priorityTopicLimit,
          })
        : nextFormat === 'fix-error'
          ? createFixErrorSession(nextFixErrorScope, nextFixErrorDifficulty, fixErrorFormat.questionsPerSession)
        : nextFormat === 'vocab'
            ? createVocabSession(nextVocabScope, nextVocabDifficulty, vocabQuestionsPerSession)
            : createDebugSession(nextDebugScope, nextDebugDifficulty, debugFormat.questionsPerSession)

    audio.playTap()

    startTransition(() => {
      dismissAntiCheatAlert()
      clearResultCoachRequest({ resetKey: true })
      const targetTrack =
        nextFormat === 'fix-error'
          ? getFixErrorScopeTrack(nextFixErrorScope)
          : nextFormat === 'debug'
            ? getDebugScopeTrack(nextDebugScope)
            : nextFormat === 'vocab'
              ? getVocabScopeTrack(nextVocabScope)
              : nextTrack

      if (targetTrack !== track) {
        applyTrackSelection(targetTrack, nextFormat, nextDifficulty)
      }

      setQuizFormat(nextFormat)
      setDifficulty(nextDifficulty)
      setFixErrorDifficulty(nextFixErrorDifficulty)
      setDebugDifficulty(nextDebugDifficulty)
      setVocabDifficulty(nextVocabDifficulty)
      setVocabLength(nextVocabLength)
      setFixErrorScope(nextFixErrorScope)
      setDebugScope(nextDebugScope)
      setVocabScope(nextVocabScope)
      setQuestions(nextQuestions)
      setCurrentIndex(0)
      startQuizTimer(
        nextFormat === 'identify-language'
          ? identifyLanguageFormat.questionTimeLimitSeconds
          : nextFormat === 'fix-error'
            ? fixErrorFormat.questionTimeLimitSeconds
            : nextFormat === 'vocab'
              ? vocabFormat.questionTimeLimitSeconds
              : debugFormat.questionTimeLimitSeconds,
      )
      setOutcomes([])
      setCurrentOutcome(null)
      setHintedQuestionIds([])
      setQuizFocusPenaltyCount(0)
      setPreviousQuizRun(null)
      setResultCoachContent(null)
      setResultCoachSummary('')
      setResultCoachStatus('idle')
      setResultCoachError(null)
      setResultCoachSource('local')
      setResultCoachRefreshNonce(0)
      resultCoachRequestKeyRef.current = null
      quizQuestionStartRef.current = performance.now()
      setQuizPhase('active')
      setView('quiz')
    })
  }

  const startFixErrorTopicQuiz = (topicId: FixErrorSupportedLanguageId) => {
    startNewQuiz({
      nextFormat: 'fix-error',
      nextTrack: getFixErrorScopeTrack(topicId),
      nextFixErrorDifficulty: fixErrorDifficulty,
      nextFixErrorScope: topicId,
    })
  }

  const startDebugTopicQuiz = (topicId: DebugSupportedLanguageId) => {
    startNewQuiz({
      nextFormat: 'debug',
      nextTrack: getDebugScopeTrack(topicId),
      nextDebugDifficulty: debugDifficulty,
      nextDebugScope: topicId,
    })
  }

  const startVocabTopicQuiz = (topicId: VocabSupportedLanguageId) => {
    startNewQuiz({
      nextFormat: 'vocab',
      nextTrack: getVocabScopeTrack(topicId),
      nextVocabDifficulty: 'easy',
      nextVocabLength: 'short',
      nextVocabScope: topicId,
    })
  }

  const revealFeedback = (choice: string | null, result: QuestionOutcome['result']) => {
    const question = questions[currentIndex]

    if (!question) {
      return
    }

    const elapsed = Math.min(performance.now() - quizQuestionStartRef.current, formatConfig.questionTimeLimitSeconds * 1000)

    const nextOutcome: QuestionOutcome =
      question.format === 'identify-language'
        ? {
            questionId: question.id,
            format: question.format,
            answer: question.answer,
            selectedChoice: choice as LanguageId | null,
            isCorrect: result === 'correct',
            result,
            hintUsed: hintedQuestionIds.includes(question.id),
            timeMs: elapsed,
            difficulty,
            track: activeTrack,
          }
        : question.format === 'vocab'
          ? {
              questionId: question.id,
              format: question.format,
              language: question.language,
              difficulty: question.difficulty,
              answer: question.answer,
              selectedChoice: choice,
              isCorrect: result === 'correct',
              result,
              hintUsed: hintedQuestionIds.includes(question.id),
              timeMs: elapsed,
              track: question.track,
            }
          : {
              questionId: question.id,
              format: question.format,
              language: question.language,
              difficulty: question.difficulty,
              answer: question.answer,
              selectedChoice: choice,
              isCorrect: result === 'correct',
              result,
              hintUsed: hintedQuestionIds.includes(question.id),
              timeMs: elapsed,
              track: question.track,
            }

    if (result === 'correct') {
      audio.playAnswerCorrect()
    } else {
      audio.playAnswerWrong()
    }

    setCurrentOutcome(nextOutcome)
    setOutcomes((current) => [...current, nextOutcome])
    setQuizPhase('feedback')
  }

  const handleChoice = (choice: LanguageId | string) => {
    if (!currentQuestion || view !== 'quiz' || quizPhase !== 'active') {
      return
    }

    revealFeedback(choice, choice === currentQuestion.answer ? 'correct' : 'wrong')
  }

  const handleHint = () => {
    if (!currentQuestion || view !== 'quiz' || quizPhase !== 'active' || currentQuestionHintVisible || hintsRemaining <= 0) {
      return
    }

    audio.playHint()
    setHintedQuestionIds((current) => [...current, currentQuestion.id])
  }

  const handleNextQuestion = () => {
    audio.playNext()

    if (isLastQuestion) {
      dismissAntiCheatAlert()
      setView('result')
      return
    }

    setCurrentIndex((index) => index + 1)
    setCurrentOutcome(null)
    startQuizTimer(formatConfig.questionTimeLimitSeconds)
    quizQuestionStartRef.current = performance.now()
    setQuizPhase('active')
  }

  const handleFormatChange = (nextFormat: QuizFormatId) => {
    audio.playTap()
    setQuizFormat(nextFormat)
    const nextViewedGuideIds = getViewedGuideIdsForFormat(viewedGuidesByFormat, nextFormat)

    const nextTrack =
      nextFormat === 'fix-error'
        ? getFixErrorScopeTrack(fixErrorScope)
        : nextFormat === 'debug'
          ? getDebugScopeTrack(debugScope)
          : nextFormat === 'vocab'
            ? getVocabScopeTrack(vocabScope)
            : track

    if (nextTrack !== track) {
      applyTrackSelection(nextTrack, nextFormat, resolveFormatDifficulty(nextFormat))
      return
    }

    const nextGuideLevel = resolveDefaultGuideLevel(track, nextFormat, resolveFormatDifficulty(nextFormat), nextViewedGuideIds)
    setGuideLevel(nextGuideLevel)
    setExpandedGuideId((current) =>
      resolveExpandedGuideIdForGuideLevel(current, track, nextFormat, nextGuideLevel, nextViewedGuideIds),
    )
    setComparison(null)
  }

  const handleTrackChange = (nextTrack: QuizTrackId) => {
    audio.playTap()
    applyTrackSelection(nextTrack, quizFormat)

    if (isFixErrorMode) {
      setFixErrorScope(nextTrack === 'core' ? FIX_ERROR_ALL_CORE_SCOPE : FIX_ERROR_ALL_GAME_SCOPE)
    }

    if (isDebugMode) {
      setDebugScope(nextTrack === 'core' ? DEBUG_ALL_CORE_SCOPE : DEBUG_ALL_GAME_SCOPE)
    }

    if (isVocabMode) {
      setVocabScope(nextTrack === 'core' ? VOCAB_ALL_CORE_SCOPE : VOCAB_ALL_GAME_SCOPE)
    }
  }

  const handleDifficultyChange = (nextDifficulty: Difficulty) => {
    audio.playTap()
    if (isFixErrorMode) {
      setFixErrorDifficulty(nextDifficulty)
    } else if (isDebugMode) {
      setDebugDifficulty(nextDifficulty)
    } else if (isVocabMode) {
      setVocabDifficulty(nextDifficulty)
    } else {
      setDifficulty(nextDifficulty)
    }

    const nextGuideLevel = resolveDefaultGuideLevel(track, quizFormat, nextDifficulty, viewedGuideIds)
    setGuideLevel(nextGuideLevel)
    setExpandedGuideId((current) =>
      resolveExpandedGuideIdForGuideLevel(current, track, quizFormat, nextGuideLevel, viewedGuideIds),
    )
    setComparison(null)
  }

  const handleIdentifyLengthChange = (nextLength: IdentifySessionLengthId) => {
    audio.playTap()
    setIdentifyLength(nextLength)
  }

  const handleVocabLengthChange = (nextLength: VocabSessionLengthId) => {
    audio.playTap()
    setVocabLength(nextLength)
  }

  const handleFixErrorScopeChange = (nextScope: FixErrorScopeId) => {
    audio.playTap()
    setFixErrorScope(nextScope)
    const scopeTrack = getFixErrorScopeTrack(nextScope)
    if (scopeTrack !== track) {
      applyTrackSelection(scopeTrack)
    }
  }

  const handleDebugScopeChange = (nextScope: DebugScopeId) => {
    audio.playTap()
    setDebugScope(nextScope)
    const scopeTrack = getDebugScopeTrack(nextScope)
    if (scopeTrack !== track) {
      applyTrackSelection(scopeTrack)
    }
  }

  const handleVocabScopeChange = (nextScope: VocabScopeId) => {
    audio.playTap()
    setVocabScope(nextScope)
    const scopeTrack = getVocabScopeTrack(nextScope)
    if (scopeTrack !== track) {
      applyTrackSelection(scopeTrack)
    }
  }

  const handleOpenGuide = (nextTrack = activeTrack) => {
    audio.playTap()
    const nextDifficulty = resolveFormatDifficulty(quizFormat)

    if (nextTrack !== activeTrack) {
      applyTrackSelection(nextTrack, quizFormat, nextDifficulty)
    } else {
      const nextGuideLevel = resolveDefaultGuideLevel(nextTrack, quizFormat, nextDifficulty, viewedGuideIds)
      setGuideLevel(nextGuideLevel)
      setExpandedGuideId((current) =>
        resolveExpandedGuideIdForGuideLevel(current, nextTrack, quizFormat, nextGuideLevel, viewedGuideIds),
      )
    }

    setView('guide')
  }

  const handleGuideLevelChange = (nextGuideLevel: GuideLevel) => {
    audio.playTap()
    setGuideLevel(nextGuideLevel)
    setExpandedGuideId((current) =>
      resolveExpandedGuideIdForGuideLevel(current, activeTrack, quizFormat, nextGuideLevel, viewedGuideIds),
    )
    setComparison(null)
  }

  const handleReadGuide = (topicId: LanguageId) => {
    audio.playTap()
    markGuideViewed(quizFormat, topicId)
    setComparison((current) => (current?.source === topicId ? current : null))
    setExpandedGuideId((current) => (current === topicId ? null : topicId))
  }

  const handleCompare = (topicId: LanguageId, targetId?: LanguageId) => {
    const falseFriend = targetId ?? guideBookEntries[topicId].falseFriends[0]

    if (!falseFriend) {
      return
    }

    audio.playTap()
    setExpandedGuideId(topicId)
    setComparison({ source: topicId, target: falseFriend })
  }

  const handleBackToMenu = () => {
    audio.playTap()
    setView('menu')
  }

  const handleBackToGuide = () => {
    audio.playTap()
    setView('guide')
  }

  const handleNavigateSection = (sectionId: string) => {
    if (view !== 'landing') {
      setPendingScrollId(sectionId)
      setView('landing')
      return
    }

    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleStartFromLanding = () => {
    audio.playTap()
    setView('menu')
  }

  const handleQuickStartFromLanding = (format: QuizFormatId) => {
    if (format === 'fix-error') {
      const scope = activeTrack === 'game-dev' ? FIX_ERROR_ALL_GAME_SCOPE : FIX_ERROR_ALL_CORE_SCOPE
      startNewQuiz({ nextFormat: 'fix-error', nextFixErrorDifficulty: fixErrorDifficulty, nextFixErrorScope: scope })
      return
    }

    if (format === 'debug') {
      const scope = activeTrack === 'game-dev' ? DEBUG_ALL_GAME_SCOPE : DEBUG_ALL_CORE_SCOPE
      startNewQuiz({ nextFormat: 'debug', nextDebugDifficulty: debugDifficulty, nextDebugScope: scope })
      return
    }

    if (format === 'vocab') {
      const scope = activeTrack === 'game-dev' ? VOCAB_ALL_GAME_SCOPE : VOCAB_ALL_CORE_SCOPE
      startNewQuiz({ nextFormat: 'vocab', nextVocabDifficulty: 'easy', nextVocabLength: 'short', nextVocabScope: scope })
      return
    }

    startNewQuiz({ nextFormat: format, nextTrack: activeTrack })
  }

  const handleOpenWeakTopic = (topicId: LanguageId) => {
    markGuideViewed(quizFormat, topicId)
    setExpandedGuideId(topicId)
    setView('guide')
  }

  const resultCoachSnapshot: ResultCoachSnapshot = {
    locale,
    format: quizFormat,
    track: activeTrack,
    score,
    totalQuestions,
    breakdown,
    rankLabel: rank.label[locale],
    currentTrackLabel: currentTrack.label[locale],
    currentFormatLabel,
    currentModeLabel,
    weakTopics,
    antiCheatCount: quizFocusPenaltyCount,
    avgTimeMs: quizAverageTimeMs,
    hintUsedCount: quizHintUsedCount,
    hesitationCount: quizHesitationCount,
    maxCorrectStreak: quizMaxCorrectStreak,
    readNextCandidates,
    topicMetrics,
  }

  useEffect(() => {
    if (screenView !== 'result' || archivedQuizSessionIdRef.current === quizSessionIdRef.current || outcomes.length === 0) {
      return
    }

    const previous = saveLatestQuizRunSummary(
      {
        format: quizFormat,
        track: activeTrack,
        locale,
        difficulty,
        fixErrorDifficulty,
        debugDifficulty,
        identifyLength,
        vocabDifficulty,
        vocabLength,
        fixErrorScope,
        debugScope,
        vocabScope,
      },
      {
        format: quizFormat,
        track: activeTrack,
        locale,
        score,
        totalQuestions,
        breakdown,
        weakTopics,
        antiCheatCount: quizFocusPenaltyCount,
        hintUsedCount: quizHintUsedCount,
        hesitationCount: quizHesitationCount,
        avgTimeMs: quizAverageTimeMs,
        maxCorrectStreak: quizMaxCorrectStreak,
        topicMetrics,
      },
    )

    archivedQuizSessionIdRef.current = quizSessionIdRef.current
    setPreviousQuizRun(previous)
  }, [
    activeTrack,
    breakdown,
    locale,
    outcomes.length,
    quizAverageTimeMs,
    quizFocusPenaltyCount,
    quizFormat,
    quizHintUsedCount,
    quizHesitationCount,
    quizMaxCorrectStreak,
    difficulty,
    fixErrorDifficulty,
    debugDifficulty,
    identifyLength,
    vocabDifficulty,
    vocabLength,
    fixErrorScope,
    debugScope,
    vocabScope,
    score,
    screenView,
    totalQuestions,
    topicMetrics,
    weakTopics,
  ])

  useEffect(() => {
    if (screenView !== 'result' || outcomes.length === 0) {
      return
    }

    if (playedQuizResultSoundSessionRef.current === quizSessionIdRef.current) {
      return
    }

    playedQuizResultSoundSessionRef.current = quizSessionIdRef.current
    audio.playRankCue(score === totalQuestions ? rank.perfectSoundCue ?? rank.soundCue : rank.soundCue)
  }, [audio, outcomes.length, rank.perfectSoundCue, rank.soundCue, score, screenView, totalQuestions])

  useEffect(() => {
    if (
      screenView !== 'arena-result' ||
      archivedArenaSessionIdRef.current === arenaSessionIdRef.current ||
      arenaHumanQuestions.length === 0 ||
      arenaHumanOutcomes.length !== arenaHumanQuestions.length
    ) {
      return
    }

    saveLatestArenaRunArchive(
      {
        format: arenaFormat,
        track: arenaTrack,
        identifyMode: arenaIdentifyMode,
        fixErrorMode: arenaFixErrorMode,
        debugMode: arenaDebugMode,
        identifyLength: arenaIdentifyLength,
        vocabMode: arenaVocabMode,
        vocabLength: arenaVocabLength,
        fixErrorScope: arenaFixErrorScope,
        debugScope: arenaDebugScope,
        vocabScope: arenaVocabScope,
      },
      {
        format: arenaFormat,
        track: arenaTrack,
        humanQuestions: arenaHumanQuestions,
        humanOutcomes: arenaHumanOutcomes,
      },
    )

    archivedArenaSessionIdRef.current = arenaSessionIdRef.current
  }, [
    arenaDebugScope,
    arenaDebugMode,
    arenaFixErrorScope,
    arenaFixErrorMode,
    arenaFormat,
    arenaHumanOutcomes,
    arenaHumanQuestions,
    arenaIdentifyMode,
    arenaIdentifyLength,
    arenaTrack,
    arenaVocabMode,
    arenaVocabLength,
    arenaVocabScope,
    screenView,
  ])

  useEffect(() => {
    if (screenView !== 'arena-result' || !arenaCommentarySnapshot) {
      arenaCommentaryAbortRef.current?.abort()
      arenaCommentaryAbortRef.current = null

      if (screenView !== 'arena-result') {
        setArenaCommentary('')
        setArenaCommentarySource('local')
        setArenaCommentaryStatus('idle')
        arenaCommentaryRequestKeyRef.current = null
      }
      return
    }

    const fallbackCommentary = buildArenaFallbackCommentary(arenaCommentarySnapshot)
    setArenaCommentary(fallbackCommentary)
    setArenaCommentarySource('local')

    if (
      arenaMatchKind !== 'live-ai' ||
      !isArenaAiReady({
        ...arenaAiSettings,
        apiKey: arenaApiKey,
      })
    ) {
      setArenaCommentaryStatus('ready')
      arenaCommentaryRequestKeyRef.current = null
      arenaCommentaryAbortRef.current?.abort()
      arenaCommentaryAbortRef.current = null
      return
    }

    const requestKey = JSON.stringify({
      locale,
      totalQuestions: arenaCommentarySnapshot.totalQuestions,
      humanCorrect: arenaCommentarySnapshot.humanMetrics.correctCount,
      opponentCorrect: arenaCommentarySnapshot.opponentMetrics.correctCount,
      humanRank: arenaCommentarySnapshot.humanRankLabel,
      opponentRank: arenaCommentarySnapshot.opponentRankLabel,
      focusPenaltyCount: arenaCommentarySnapshot.focusPenaltyCount,
      provider: arenaAiSettings.providerId,
      modelId: arenaResolvedModelId,
      baseUrl: arenaResolvedBaseUrl,
    })

    arenaCommentaryAbortRef.current?.abort()
    const controller = new AbortController()
    arenaCommentaryAbortRef.current = controller
    arenaCommentaryRequestKeyRef.current = requestKey
    setArenaCommentaryStatus('loading')

    const { system, user } = buildArenaCommentaryPrompt(arenaCommentarySnapshot)
    const commentaryRuntimeProfile = arenaAiRetryProfile

    void requestAiText({
      config: {
        ...arenaAiSettings,
        apiKey: arenaApiKey,
      },
      system,
      user,
      maxTokens: 220,
      temperature: 0.62,
      topP: 0.92,
      retryCount: commentaryRuntimeProfile.transientRetryCount,
      retryBackoffMs: commentaryRuntimeProfile.transientRetryBackoffMs,
      signal: controller.signal,
    })
      .then((content) => {
        if (controller.signal.aborted || arenaCommentaryRequestKeyRef.current !== requestKey) {
          return
        }

        const normalized = content.trim()
        if (!normalized) {
          throw new Error(copy.arenaAiError)
        }

        setArenaCommentary(normalized)
        setArenaCommentarySource('ai')
        setArenaCommentaryStatus('ready')
      })
      .catch(() => {
        if (controller.signal.aborted || arenaCommentaryRequestKeyRef.current !== requestKey) {
          return
        }

        setArenaCommentary(fallbackCommentary)
        setArenaCommentarySource('local')
        setArenaCommentaryStatus('error')
      })
      .finally(() => {
        if (arenaCommentaryAbortRef.current === controller) {
          arenaCommentaryAbortRef.current = null
        }
      })

    return () => {
      controller.abort()
      if (arenaCommentaryAbortRef.current === controller) {
        arenaCommentaryAbortRef.current = null
      }
    }
  }, [
    arenaAiSettings,
    arenaApiKey,
    arenaCommentarySnapshot,
    arenaMatchKind,
    arenaResolvedBaseUrl,
    arenaResolvedModelId,
    arenaAiRetryProfile,
    copy.arenaAiError,
    locale,
    screenView,
  ])

  const runResultCoachRequest = useEffectEvent(async (force = false) => {
    const fallbackContent = buildFallbackCoachContent(resultCoachSnapshot, resultCompareContext)
    const fallbackSummary = renderCoachSummary(fallbackContent)
    setResultCoachContent(fallbackContent)
    setResultCoachSummary(fallbackSummary)
    setResultCoachSource('local')
    setResultCoachError(null)

    if (
      !arenaAiProvider.supportsCoach ||
      !isArenaAiReady({
        ...arenaAiSettings,
        apiKey: arenaApiKey,
      })
    ) {
      clearResultCoachRequest({ resetKey: true })
      setResultCoachStatus('ready')
      return
    }

    const requestKey = JSON.stringify({
      locale,
      format: quizFormat,
      score,
      totalQuestions,
      breakdown,
      weakTopics: weakTopicsKey,
      penalties: quizFocusPenaltyCount,
      hints: quizHintUsedCount,
      hesitation: quizHesitationCount,
      avgTimeMs: Math.round(quizAverageTimeMs),
      streak: quizMaxCorrectStreak,
      compare: resultCompareContext,
      provider: arenaAiSettings.providerId,
      baseUrl: arenaResolvedBaseUrl,
      modelId: arenaResolvedModelId,
    })

    if (!force && resultCoachRequestKeyRef.current === requestKey) {
      setResultCoachStatus('ready')
      return
    }

    clearResultCoachRequest()
    const controller = new AbortController()
    const requestVersion = resultCoachRequestVersionRef.current
    resultCoachAbortRef.current = controller
    setResultCoachStatus('loading')
    const { system, user } = buildCoachPrompt(resultCoachSnapshot, resultCompareContext)
    const coachRuntimeProfile = arenaAiRetryProfile

    try {
      const nextSummary = await requestAiText({
        config: {
          ...arenaAiSettings,
          apiKey: arenaApiKey,
        },
        system,
        user,
        maxTokens: 420,
        temperature: 0.35,
        structuredOutput: {
          name: 'result_coach_summary',
          description: 'Return the coaching summary as a JSON object that matches the required schema exactly.',
          schema: buildCoachResponseJsonSchema(resultCoachSnapshot, resultCompareContext),
        },
        retryCount: coachRuntimeProfile.transientRetryCount,
        retryBackoffMs: coachRuntimeProfile.transientRetryBackoffMs,
        signal: controller.signal,
      })

      if (resultCoachRequestVersionRef.current !== requestVersion) {
        return
      }

      const normalized = nextSummary.trim()
      if (!normalized) {
        throw new Error(copy.resultCoachEmpty)
      }

      const nextContent = parseCoachContent(normalized, resultCoachSnapshot, resultCompareContext)
      resultCoachRequestKeyRef.current = requestKey
      setResultCoachContent(nextContent)
      setResultCoachSummary(renderCoachSummary(nextContent))
      setResultCoachSource('ai')
      setResultCoachStatus('ready')
    } catch (error) {
      if (controller.signal.aborted || resultCoachRequestVersionRef.current !== requestVersion) {
        return
      }

      resultCoachRequestKeyRef.current = requestKey
      setResultCoachError(error instanceof Error ? error.message : copy.resultCoachError)
      setResultCoachStatus('error')
      setResultCoachContent(fallbackContent)
      setResultCoachSummary(fallbackSummary)
      setResultCoachSource('local')
    } finally {
      if (resultCoachRequestVersionRef.current === requestVersion) {
        resultCoachAbortRef.current = null
      }
    }
  })

  useEffect(() => {
    if (screenView !== 'result') {
      clearResultCoachRequest({ resetKey: true, resetStatus: true, resetError: true })
      return
    }

    void runResultCoachRequest(resultCoachRefreshNonce > 0)

    return () => {
      clearResultCoachRequest()
    }
  }, [
    arenaAiProvider.supportsCoach,
    screenView,
    score,
    totalQuestions,
    locale,
    quizFocusPenaltyCount,
    quizFormat,
    quizAverageTimeMs,
    quizHintUsedCount,
    quizHesitationCount,
    quizMaxCorrectStreak,
    arenaApiKey,
    arenaAiSettings.apiBaseUrl,
    arenaAiSettings.extraFieldValue,
    arenaAiSettings.modelId,
    arenaAiSettings.providerId,
    breakdown.correct,
    breakdown.timeout,
    breakdown.wrong,
    previousQuizRun,
    resultCoachRefreshNonce,
    weakTopicsKey,
  ])

  return (
    <AppShell
      locale={locale}
      onLocaleChange={(value) => {
        audio.playTap()
        setLocale(value)
      }}
      onNavigateSection={handleNavigateSection}
      onOpenGuide={() => handleOpenGuide()}
      onOpenSettings={handleOpenSettings}
      onGoToQuiz={handleStartFromLanding}
      isLanding={screenView === 'landing'}
      navLocked={navLocked}
      reduceAmbientEffects={screenView === 'quiz' || screenView === 'arena-match'}
      transitionKey={screenView}
    >
      <AnimatePresence mode="wait">
        {screenView === 'landing' && (
          <LandingPage
            key="landing"
            locale={locale}
            familyOptions={familyOptions}
            familyFilter={effectiveFamilyFilter}
            activeTrack={activeTrack}
            activeFormat={quizFormat}
            onFamilyChange={setFamilyFilter}
            onTrackChange={handleTrackChange}
            onFormatChange={handleFormatChange}
            onOpenGuide={() => handleOpenGuide()}
            onStartQuickQuiz={handleQuickStartFromLanding}
            onStartArena={handleStartArenaFromLanding}
          />
        )}
        {screenView === 'settings' && (
          <SettingsPage
            key="settings"
            locale={locale}
            draftTrack={musicDraft}
            activeTrack={activeMusicTrack}
            queue={musicQueue}
            queueIndex={musicQueueIndex}
            playbackMode={musicPlaybackMode}
            themeMode={musicThemeMode}
            themeMotion={musicThemeMotion}
            themePreset={musicThemePreset}
            spectrumSpeed={musicSpectrumSpeed}
            spectrumIntensity={musicSpectrumIntensity}
            showDiagnostics={musicShowDiagnostics}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            musicIsPlaying={musicIsPlaying}
            onDraftUrlChange={handleMusicDraftUrlChange}
            onDraftChange={handleMusicDraftChange}
            onApplyTrack={handleApplyMusicTrack}
            onAddTrack={handleAddTrackToQueue}
            onPause={handlePauseMusic}
            onResume={handleResumeMusic}
            onStop={handleStopMusic}
            onPlayTrack={handlePlayQueueTrack}
            onNextTrack={handleNextMusicTrack}
            onPreviousTrack={handlePreviousMusicTrack}
            onRemoveTrack={handleRemoveQueueTrack}
            onPlaybackModeChange={handleMusicPlaybackModeChange}
            onThemeModeChange={handleMusicThemeModeChange}
            onThemePresetChange={setMusicThemePreset}
            onSpectrumSpeedChange={setMusicSpectrumSpeed}
            onSpectrumIntensityChange={setMusicSpectrumIntensity}
            onDiagnosticsToggle={setMusicShowDiagnostics}
            onMusicVolumeChange={setMusicVolume}
            onSfxVolumeChange={handleSfxVolumeChange}
            onBack={handleSettingsBack}
            onClearSettings={handleClearMusicSettings}
          />
        )}
        {screenView === 'arena' && (
          <ArenaPage
            key="arena"
            locale={locale}
            formatCopy={formatCopy}
            baseFormat={arenaFormat}
            track={arenaTrack}
            identifyMode={arenaIdentifyMode}
            fixErrorMode={arenaFixErrorMode}
            debugMode={arenaDebugMode}
            identifyLength={arenaIdentifyLength}
            vocabMode={arenaVocabMode}
            vocabLength={arenaVocabLength}
            fixErrorScope={arenaFixErrorScope}
            debugScope={arenaDebugScope}
            vocabScope={arenaVocabScope}
            provider={arenaAiProvider}
            providerOptions={ARENA_AI_PROVIDERS}
            apiKey={arenaApiKey}
            apiBaseUrl={arenaAiSettings.apiBaseUrl}
            extraFieldValue={arenaAiSettings.extraFieldValue}
            modelId={arenaAiSettings.modelId}
            resolvedBaseUrl={arenaResolvedBaseUrl}
            resolvedModelId={arenaResolvedModelId}
            formError={arenaFormError}
            onBaseFormatChange={handleArenaFormatChange}
            onTrackChange={handleArenaTrackChange}
            onIdentifyModeChange={setArenaIdentifyMode}
            onFixErrorModeChange={setArenaFixErrorMode}
            onDebugModeChange={setArenaDebugMode}
            onIdentifyLengthChange={(value) => setArenaIdentifyLength(value)}
            onVocabModeChange={(value) => setArenaVocabMode(value)}
            onVocabLengthChange={(value) => setArenaVocabLength(value)}
            onFixErrorScopeChange={(value) => setArenaFixErrorScope(value)}
            onDebugScopeChange={(value) => setArenaDebugScope(value)}
            onVocabScopeChange={(value) => setArenaVocabScope(value)}
            onProviderChange={(value) => {
              setArenaAiSettings(createArenaAiSettingsForProvider(value))
              setArenaApiKey('')
              setArenaFormError(null)
            }}
            onApiBaseUrlChange={(value) => {
              setArenaAiSettings((current) => ({ ...current, apiBaseUrl: value }))
              setArenaFormError(null)
            }}
            onExtraFieldChange={(value) => {
              setArenaAiSettings((current) => ({ ...current, extraFieldValue: value }))
              setArenaFormError(null)
            }}
            onApiKeyChange={(value) => {
              setArenaApiKey(value)
              setArenaFormError(null)
            }}
            onClearKey={() => {
              setArenaApiKey('')
            }}
            onModelChange={(value) => {
              setArenaAiSettings((current) => ({ ...current, modelId: value }))
              setArenaFormError(null)
            }}
            onStartMatch={startArenaMatch}
            onBack={handleArenaBack}
          />
        )}
        {screenView === 'menu' && (
          <MenuPage
            key="menu"
            locale={locale}
            formatCopy={formatCopy}
            quizFormat={quizFormat}
            identifyDifficulty={difficulty}
            fixErrorDifficulty={fixErrorDifficulty}
            debugDifficulty={debugDifficulty}
            identifyLength={identifyLength}
            vocabDifficulty={vocabDifficulty}
            vocabLength={vocabLength}
            activeTrack={activeTrack}
            isFixErrorMode={isFixErrorMode}
            isDebugMode={isDebugMode}
            isVocabMode={isVocabMode}
            fixErrorScope={fixErrorScope}
            debugScope={debugScope}
            vocabScope={vocabScope}
            currentScopeLabel={currentScopeLabel}
            currentModeBadge={currentModeBadge}
            activeIntroRules={activeIntroRules}
            trackViewedCount={trackViewedCount}
            trackTopicList={trackTopicList}
            viewedGuideIds={viewedGuideIds}
            onFormatChange={handleFormatChange}
            onTrackChange={handleTrackChange}
            onDifficultyChange={handleDifficultyChange}
            onIdentifyLengthChange={handleIdentifyLengthChange}
            onVocabDifficultyChange={setVocabDifficulty}
            onVocabLengthChange={handleVocabLengthChange}
            onFixErrorScopeChange={handleFixErrorScopeChange}
            onDebugScopeChange={handleDebugScopeChange}
            onVocabScopeChange={handleVocabScopeChange}
            onOpenGuide={() => handleOpenGuide()}
            onStartQuiz={() => startNewQuiz()}
          />
        )}
        {screenView === 'guide' && (
          <GuidePage
            key="guide"
            locale={locale}
            theme={theme}
            formatCopy={formatCopy}
            quizFormat={quizFormat}
            difficulty={currentGuideDifficulty}
            guideLevel={guideLevel}
            isFixErrorMode={isFixErrorMode}
            isDebugMode={isDebugMode}
            isVocabMode={isVocabMode}
            currentTrackId={activeTrack}
            trackTopicList={trackTopicList}
            trackViewedCount={trackViewedCount}
            questionTimeLimitSeconds={formatConfig.questionTimeLimitSeconds}
            familyFilter={effectiveFamilyFilter}
            familyOptions={familyOptions}
            filteredGuideIds={filteredGuideIds}
            hardUnlockedTopicIds={hardUnlockedTopicIds}
            expandedGuideId={expandedGuideId}
            comparison={comparison}
            viewedGuideIds={viewedGuideIds}
            onBackToMenu={handleBackToMenu}
            onStartQuiz={() => startNewQuiz()}
            onReadGuide={handleReadGuide}
            onStartFixErrorTopicQuiz={startFixErrorTopicQuiz}
            onStartDebugTopicQuiz={startDebugTopicQuiz}
            onStartVocabTopicQuiz={startVocabTopicQuiz}
            onCompare={handleCompare}
            onFamilyFilterChange={setFamilyFilter}
            onGuideLevelChange={handleGuideLevelChange}
            onFormatChange={handleFormatChange}
            onHideComparison={() => setComparison(null)}
          />
        )}
        {screenView === 'quiz' && (
          <QuizPage
            key="quiz"
            locale={locale}
            theme={theme}
            copy={copy}
            formatCopy={formatCopy}
            currentTrackLabel={currentTrack.label[locale]}
            currentFormatLabel={currentFormatLabel}
            currentModeLabel={currentModeLabel}
            currentQuestion={currentQuestion}
            questions={questions}
            currentIndex={currentIndex}
            timeLeft={timeLeft}
            hintsRemaining={hintsRemaining}
            quizPhase={quizPhase}
            currentOutcome={currentOutcome}
            timerProgress={timerProgress}
            currentQuestionHintVisible={currentQuestionHintVisible}
            isLastQuestion={isLastQuestion}
            onChoice={handleChoice}
            onHint={handleHint}
            onNextQuestion={handleNextQuestion}
          />
        )}
        {screenView === 'arena-match' && arenaCurrentQuestion && (
          <ArenaMatchPage
            key="arena-match"
            locale={locale}
            theme={theme}
            formatCopy={formatCopy}
            currentQuestion={arenaCurrentQuestion}
            currentIndex={arenaCurrentIndex}
            totalQuestions={arenaTotalQuestions}
            timeLeft={arenaTimeLeft}
            timerProgress={arenaTimerProgress}
            phase={arenaPhase}
            matchKind={arenaMatchKind}
            opponentLabel={arenaOpponentLabel}
            humanOutcome={arenaHumanOutcomes[arenaCurrentIndex] ?? null}
            aiOutcome={arenaAiOutcomes[arenaCurrentIndex] ?? null}
            aiStatus={arenaAiStatus}
            aiActiveLatencyMs={arenaAiActiveLatencyMs}
            aiLastLatencyMs={arenaAiLastLatencyMs}
            aiRequestBudgetMs={arenaAiRequestBudgetMs}
            aiFailureReason={arenaAiFailureReason}
            humanCorrect={arenaHumanCorrect}
            aiCorrect={arenaAiCorrect}
            onChoice={handleArenaChoice}
            onNextQuestion={handleArenaNextQuestion}
            canProceed={arenaCanProceed}
            onBackToArena={handleArenaBackToArena}
          />
        )}
        {screenView === 'result' && (
          <ResultPage
            key="result"
            locale={locale}
            formatCopy={formatCopy}
            isFixErrorMode={isFixErrorMode}
            isDebugMode={isDebugMode}
            isVocabMode={isVocabMode}
            score={score}
            totalQuestions={totalQuestions}
            outcomes={outcomes}
            breakdown={breakdown}
            rank={rank}
            currentTrackLabel={currentTrack.label[locale]}
            currentFormatLabel={currentFormatLabel}
            currentModeLabel={currentModeLabel}
            resultSnapshot={resultCoachSnapshot}
            mostMissedTopics={mostMissedTopics}
            mostStableTopics={mostStableTopics}
            hasPreviousRun={Boolean(previousQuizRun)}
            antiCheatCount={quizFocusPenaltyCount}
            showCoach={true}
            coachReadNext={resultCoachContent?.readNext ?? null}
            coachCompare={resultCoachContent?.compare ?? null}
            coachSummary={resultCoachSummary}
            coachStatus={resultCoachStatus}
            coachSource={resultCoachSource}
            coachError={resultCoachError}
            onRefreshCoach={() => setResultCoachRefreshNonce((current) => current + 1)}
            onStartNewQuiz={() => startNewQuiz()}
            onBackToGuide={handleBackToGuide}
            onBackToMenu={handleBackToMenu}
            onOpenWeakTopic={handleOpenWeakTopic}
          />
        )}
        {screenView === 'arena-result' && (
          <ArenaResultPage
            key="arena-result"
            locale={locale}
            totalQuestions={arenaTotalQuestions}
            humanMetrics={arenaHumanMetrics}
            aiMetrics={arenaAiMetrics}
            humanRank={arenaHumanRank}
            aiRank={arenaOpponentRank}
            focusPenaltyCount={arenaFocusPenaltyCount}
            opponentLabel={arenaOpponentLabel}
            modelLabel={arenaOpponentModelLabel}
            commentary={arenaCommentary}
            commentarySource={arenaCommentarySource}
            commentaryStatus={arenaCommentaryStatus}
            onRematch={startArenaMatch}
            onBackToArena={handleArenaBackToArena}
            onBackToLanding={handleArenaBackToLanding}
          />
        )}
      </AnimatePresence>
      {arenaGhostEvent && screenView === 'arena-match' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(109,186,255,0.24),transparent_36%),rgba(3,9,18,0.82)] px-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[34px] border border-sky-300/28 bg-[linear-gradient(155deg,rgba(8,20,38,0.96),rgba(12,31,57,0.98))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(143,255,199,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(99,212,255,0.2),transparent_30%),radial-gradient(circle_at_50%_120%,rgba(124,92,255,0.18),transparent_48%)]"
              animate={{ opacity: [0.55, 0.95, 0.55] }}
              transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-sky-300/26 bg-sky-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100">
                {copy.arenaGhostEventBadge}
              </div>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl" style={{ fontFamily: 'Sora, sans-serif' }}>
                {copy.arenaGhostEventTitle}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-sky-100/82 md:text-base">{copy.arenaGhostEventBody}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-sky-200/72">{copy.arenaGhostEventAuto}</p>
              <button
                type="button"
                onClick={dismissGhostRunEvent}
                className="mt-6 inline-flex items-center justify-center rounded-2xl border border-sky-200/28 bg-sky-300/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-300/18"
              >
                {copy.arenaGhostEventClose}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {antiCheatAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,0,0,0.56)] px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="anti-cheat-alert-title"
            aria-describedby="anti-cheat-alert-detail"
            className="w-full max-w-lg rounded-[30px] border border-rose-400/35 bg-[linear-gradient(180deg,rgba(56,8,8,0.97),rgba(22,4,6,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-200">
              {antiCheatAlert.scope === 'arena' ? copy.antiCheatScopeArena : copy.antiCheatScopeQuiz}
            </div>
            <h2 id="anti-cheat-alert-title" className="mt-4 text-2xl font-semibold text-rose-50">
              {copy.focusPenaltyModalTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-rose-100/88">{antiCheatAlert.message}</p>
            <p id="anti-cheat-alert-detail" className="mt-3 text-xs leading-6 text-rose-200/72">
              {antiCheatAlert.detail}
            </p>
            <button
              ref={antiCheatCloseButtonRef}
              type="button"
              onClick={() => dismissAntiCheatAlert()}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-rose-300/30 bg-rose-500/12 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/20"
            >
              {copy.focusPenaltyModalClose}
            </button>
          </div>
        </div>
      )}
      <div className="sr-only" aria-hidden="true">
        <div ref={youtubeContainerRef} />
        <div ref={soundcloudContainerRef} />
      </div>
    </AppShell>
  )
}

function App() {
  return <AppContent />
}

export default App
