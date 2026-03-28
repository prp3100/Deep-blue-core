import { guideBookEntries } from '../data/questionBank'
import type { DebugChoice, FixErrorChoice, LanguageId, QuizFormatId } from '../data/quizModels'
import type { Locale } from './i18n'
import type { QuizQuestion } from './quiz'

export type ArenaProviderModel = {
  id: string
  name?: string
  description?: string
  context_length?: number
  architecture?: {
    instruct_type?: string | null
    modality?: string
    tokenizer?: string
  }
}

export type ArenaOutcome = {
  questionId: string
  format: QuizFormatId
  answer: string
  selectedChoice: string | null
  isCorrect: boolean
  result: 'correct' | 'wrong' | 'timeout'
  timeMs: number
  reason?: string | null
}

export type ArenaMetrics = {
  accuracy: number
  avgTimeMs: number
  maxStreak: number
  correctCount: number
  timeoutCount: number
}

export type ArenaCommentarySnapshot = {
  locale: Locale
  totalQuestions: number
  opponentLabel: string
  matchKind: 'live-ai' | 'ghost-run'
  humanMetrics: ArenaMetrics
  opponentMetrics: ArenaMetrics
  humanRankLabel: string
  opponentRankLabel: string
  focusPenaltyCount: number
}

const choiceLetters = ['A', 'B', 'C', 'D'] as const

export type ParsedArenaResponse = {
  choiceId: string | null
  reason: string | null
}

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

const getArenaChoiceOptions = (question: QuizQuestion) => {
  if (question.format === 'identify-language') {
    return question.choices.map((choiceId) => ({
      choiceId,
      label: guideBookEntries[choiceId].label.en,
    }))
  }

  if (question.format === 'fix-error') {
    return question.choices.map((choice) => ({
      choiceId: choice.id,
      label: `${choice.label.en}: ${choice.fragment}`,
    }))
  }

  if (question.format === 'vocab') {
    return question.choices.map((choice) => ({
      choiceId: choice.id,
      label: choice.label.en,
    }))
  }

  return question.choices.map((choice) => ({
    choiceId: choice.id,
    label: `${choice.label.en}: ${'detail' in choice ? choice.detail.en : ''}`,
  }))
}

export const buildArenaResponseJsonSchema = (question: QuizQuestion) => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    choiceId: {
      type: 'string',
      enum: getArenaChoiceOptions(question).map((choice) => choice.choiceId),
      description: 'The exact choiceId from the allowed choice list.',
    },
    reason: {
      type: 'string',
      description: 'One short sentence explaining the answer.',
    },
  },
  required: ['choiceId', 'reason'],
})

const coerceArenaChoiceId = (question: QuizQuestion, value: unknown) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const directMatch = getArenaChoiceOptions(question).find((choice) => choice.choiceId === trimmed)
  if (directMatch) {
    return directMatch.choiceId
  }

  const caseInsensitiveMatch = getArenaChoiceOptions(question).find((choice) => choice.choiceId.toLowerCase() === trimmed.toLowerCase())
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch.choiceId
  }

  const legacyLetter = parseArenaChoice(trimmed)
  return legacyLetter ? mapArenaChoiceToId(question, legacyLetter) : null
}

export const buildArenaPrompt = (locale: Locale, question: QuizQuestion) => {
  const languageInstruction =
    locale === 'th'
      ? 'เหตุผลต้องเป็นภาษาไทย 1 ประโยคสั้น ๆ เท่านั้น'
      : 'The reason must be one short sentence in English only.'
  const system = `You are competing in a quiz. Reply with compact JSON only: {"choiceId":"...","reason":"..."} where choiceId exactly matches one of the listed choiceId values. Do not return A, B, C, or D unless that is literally the choiceId. ${languageInstruction}`
  const choices = getArenaChoiceOptions(question)
    .map((choice, index) => `${choiceLetters[index]}) ${choice.label}\nchoiceId: ${choice.choiceId}`)
    .join('\n\n')

  if (question.format === 'identify-language') {
    return {
      system,
      user: `Format: Identify Language\n\nSnippet:\n${question.snippetText}\n\nChoices:\n${choices}`,
    }
  }

  if (question.format === 'fix-error') {
    return {
      system,
      user: `Format: Fix Error\n\nError:\n${question.errorText.en}\n\nSnippet:\n${question.snippetText}\n\nChoices:\n${choices}`,
    }
  }

  if (question.format === 'vocab') {
    return {
      system,
      user: `Format: Vocabulary\n\nTerm:\n${question.termText.en}\n\nSnippet:\n${question.snippetText}\n\nChoices:\n${choices}`,
    }
  }

  return {
    system,
    user: `Format: Debug\n\nScenario:\n${'scenario' in question ? question.scenario.en : ''}\n\nRuntime Log:\n${'logText' in question ? question.logText.en : ''}\n\nSnippet:\n${question.snippetText}\n\nChoices:\n${choices}`,
  }
}

export const parseArenaChoice = (text: string) => {
  const match = text.toUpperCase().match(/\b[A-D]\b/)
  return match ? match[0] : null
}

export const parseArenaResponse = (question: QuizQuestion, text: string): ParsedArenaResponse => {
  const jsonBlock = extractJsonBlock(text)

  if (jsonBlock) {
    try {
      const parsed = JSON.parse(jsonBlock)
      const choiceId =
        coerceArenaChoiceId(question, parsed?.choiceId) ??
        coerceArenaChoiceId(question, parsed?.choice) ??
        coerceArenaChoiceId(question, parsed?.answer) ??
        coerceArenaChoiceId(question, parsed?.id)
      const reason = typeof parsed?.reason === 'string' ? parsed.reason.trim() : ''

      if (choiceId) {
        return {
          choiceId,
          reason: reason ? reason : null,
        }
      }
    } catch {
      // Fall back to plain-text letter extraction below.
    }
  }

  return {
    choiceId: coerceArenaChoiceId(question, text),
    reason: null,
  }
}

export const mapArenaChoiceToId = (question: QuizQuestion, letter: string | null) => {
  if (!letter) {
    return null
  }

  const index = choiceLetters.indexOf(letter as (typeof choiceLetters)[number])
  if (index < 0) {
    return null
  }

  if (question.format === 'identify-language') {
    return question.choices[index] ?? null
  }

  return question.choices[index]?.id ?? null
}

const formatFixErrorChoice = (choice: FixErrorChoice) => `${choice.label.th}: ${choice.fragment}`
const formatDebugChoice = (choice: DebugChoice) => `${choice.label.th}: ${choice.detail.th}`

export const formatArenaChoiceLabel = (locale: 'th' | 'en', question: QuizQuestion, choiceId: string) => {
  if (question.format === 'identify-language') {
    return guideBookEntries[choiceId as LanguageId]?.label[locale] ?? choiceId
  }

  const choice = question.choices.find((item) => item.id === choiceId)
  if (!choice) {
    return choiceId
  }

  if ('fragment' in choice) {
    return locale === 'th' ? formatFixErrorChoice(choice as FixErrorChoice) : `${choice.label.en}: ${(choice as FixErrorChoice).fragment}`
  }

  if ('detail' in choice) {
    return locale === 'th' ? formatDebugChoice(choice as DebugChoice) : `${choice.label.en}: ${(choice as DebugChoice).detail.en}`
  }
  
  return choice.label[locale]
}

export const summarizeArenaOutcomes = (outcomes: ArenaOutcome[], totalQuestions: number): ArenaMetrics => {
  const validOutcomes = outcomes.filter(Boolean)
  const correctCount = validOutcomes.filter((outcome) => outcome.isCorrect).length
  const timeoutCount = validOutcomes.filter((outcome) => outcome.result === 'timeout').length
  const totalTime = validOutcomes.reduce((sum, outcome) => sum + outcome.timeMs, 0)
  const avgTimeMs = validOutcomes.length > 0 ? totalTime / validOutcomes.length : 0

  let maxStreak = 0
  let currentStreak = 0

  for (const outcome of validOutcomes) {
    if (outcome.isCorrect) {
      currentStreak += 1
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return {
    accuracy: totalQuestions > 0 ? correctCount / totalQuestions : 0,
    avgTimeMs,
    maxStreak,
    correctCount,
    timeoutCount,
  }
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`
const formatSeconds = (valueMs: number) => `${(valueMs / 1000).toFixed(1)}s`

export const buildArenaFallbackCommentary = (snapshot: ArenaCommentarySnapshot) => {
  const humanScore = `${snapshot.humanMetrics.correctCount}/${snapshot.totalQuestions}`
  const opponentScore = `${snapshot.opponentMetrics.correctCount}/${snapshot.totalQuestions}`
  const humanWon = snapshot.humanMetrics.correctCount > snapshot.opponentMetrics.correctCount
  const opponentWon = snapshot.humanMetrics.correctCount < snapshot.opponentMetrics.correctCount
  const accuracyLine = `${formatPercent(snapshot.humanMetrics.accuracy)} vs ${formatPercent(snapshot.opponentMetrics.accuracy)}`
  const speedLine = `${formatSeconds(snapshot.humanMetrics.avgTimeMs)} vs ${formatSeconds(snapshot.opponentMetrics.avgTimeMs)}`
  const streakLine = `${snapshot.humanMetrics.maxStreak} vs ${snapshot.opponentMetrics.maxStreak}`
  const focusPenaltyLine =
    snapshot.focusPenaltyCount > 0
      ? snapshot.locale === 'th'
        ? ` แถมยังโดน focus penalty ${snapshot.focusPenaltyCount} ครั้งอีก`
        : ` You also triggered ${snapshot.focusPenaltyCount} focus penalties.`
      : ''

  if (snapshot.locale === 'th') {
    if (snapshot.matchKind === 'ghost-run') {
      return humanWon
        ? `รอบนี้คุณแซงเงารอบเก่าของตัวเองได้แล้ว ${humanScore} ต่อ ${opponentScore} แรงก์คุณคือ ${snapshot.humanRankLabel} ส่วนเงาเก่าอยู่ที่ ${snapshot.opponentRankLabel}. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
        : opponentWon
          ? `รอบนี้เงารอบเก่ายังชนะอยู่ ${humanScore} ต่อ ${opponentScore} คุณจบที่แรงก์ ${snapshot.humanRankLabel} ส่วนเงาเก่าอยู่ที่ ${snapshot.opponentRankLabel}. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
          : `รอบนี้คุณเสมอกับเงารอบเก่าของตัวเอง ${humanScore} ต่อ ${opponentScore} คุณอยู่แรงก์ ${snapshot.humanRankLabel} เท่ากันพอดี. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
    }

    if (humanWon) {
      return `รอบนี้คุณกด ${snapshot.opponentLabel} ลงได้ ${humanScore} ต่อ ${opponentScore} คุณอยู่แรงก์ ${snapshot.humanRankLabel} ส่วนฝั่งตรงข้ามอยู่ที่ ${snapshot.opponentRankLabel}. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
    }

    if (opponentWon) {
      return `${snapshot.opponentLabel} ยังเก็บคุณได้อยู่ ${humanScore} ต่อ ${opponentScore} คุณอยู่แรงก์ ${snapshot.humanRankLabel} ส่วนอีกฝั่งอยู่ที่ ${snapshot.opponentRankLabel}. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
    }

    return `รอบนี้คุณเสมอกับ ${snapshot.opponentLabel} ที่ ${humanScore} ต่อ ${opponentScore} คุณอยู่แรงก์ ${snapshot.humanRankLabel} ส่วนอีกฝั่งอยู่ที่ ${snapshot.opponentRankLabel}. ความแม่นยำ ${accuracyLine}, ความเร็วเฉลี่ย ${speedLine}, สตรีค ${streakLine}.${focusPenaltyLine}`
  }

  if (snapshot.matchKind === 'ghost-run') {
    return humanWon
      ? `You finally outran your last ghost ${humanScore} to ${opponentScore}. Your rank is ${snapshot.humanRankLabel} while the ghost stayed at ${snapshot.opponentRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
      : opponentWon
        ? `Your last ghost still beats you ${humanScore} to ${opponentScore}. You finished at ${snapshot.humanRankLabel} while the ghost held ${snapshot.opponentRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
        : `You tied your last ghost at ${humanScore} to ${opponentScore}. Both sides landed on ${snapshot.humanRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
  }

  if (humanWon) {
    return `You put ${snapshot.opponentLabel} down ${humanScore} to ${opponentScore}. Your rank is ${snapshot.humanRankLabel} while the other side finished at ${snapshot.opponentRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
  }

  if (opponentWon) {
    return `${snapshot.opponentLabel} still beats you ${humanScore} to ${opponentScore}. You landed on ${snapshot.humanRankLabel} while the opponent stayed at ${snapshot.opponentRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
  }

  return `You tied ${snapshot.opponentLabel} at ${humanScore} to ${opponentScore}. Your rank is ${snapshot.humanRankLabel} and the opponent holds ${snapshot.opponentRankLabel}. Accuracy ${accuracyLine}, average speed ${speedLine}, streak ${streakLine}.${focusPenaltyLine}`
}

export const buildArenaCommentaryPrompt = (snapshot: ArenaCommentarySnapshot) => {
  const system =
    snapshot.locale === 'th'
      ? 'คุณคือคู่ต่อสู้ใน Arena ให้ตอบสั้น 2-4 ประโยค ภาษาไทยเท่านั้น น้ำเสียงเหมือนคู่ต่อสู้ที่แซวได้ แต่ต้องอิงตัวเลขจริงทั้งหมด ห้ามมั่ว ห้ามชมเกินเหตุ'
      : 'You are the Arena opponent. Reply in 2-4 short sentences in English only. Sound like a sharp rival, but every claim must stay grounded in the provided metrics. No random praise.'

  const user =
    snapshot.locale === 'th'
      ? `สรุปแมตช์\n- Human score: ${snapshot.humanMetrics.correctCount}/${snapshot.totalQuestions}\n- Opponent score: ${snapshot.opponentMetrics.correctCount}/${snapshot.totalQuestions}\n- Human rank: ${snapshot.humanRankLabel}\n- Opponent rank: ${snapshot.opponentRankLabel}\n- Human accuracy: ${formatPercent(snapshot.humanMetrics.accuracy)}\n- Opponent accuracy: ${formatPercent(snapshot.opponentMetrics.accuracy)}\n- Human avg speed: ${formatSeconds(snapshot.humanMetrics.avgTimeMs)}\n- Opponent avg speed: ${formatSeconds(snapshot.opponentMetrics.avgTimeMs)}\n- Human max streak: ${snapshot.humanMetrics.maxStreak}\n- Opponent max streak: ${snapshot.opponentMetrics.maxStreak}\n- Human timeout: ${snapshot.humanMetrics.timeoutCount}\n- Opponent timeout: ${snapshot.opponentMetrics.timeoutCount}\n- Focus penalties: ${snapshot.focusPenaltyCount}\n- Opponent label: ${snapshot.opponentLabel}\n- Match kind: ${snapshot.matchKind}\n\nเขียนเหมือนคู่ต่อสู้กำลังคอมเมนต์ผลงานของผู้เล่นจริง ๆ`
      : `Match summary\n- Human score: ${snapshot.humanMetrics.correctCount}/${snapshot.totalQuestions}\n- Opponent score: ${snapshot.opponentMetrics.correctCount}/${snapshot.totalQuestions}\n- Human rank: ${snapshot.humanRankLabel}\n- Opponent rank: ${snapshot.opponentRankLabel}\n- Human accuracy: ${formatPercent(snapshot.humanMetrics.accuracy)}\n- Opponent accuracy: ${formatPercent(snapshot.opponentMetrics.accuracy)}\n- Human avg speed: ${formatSeconds(snapshot.humanMetrics.avgTimeMs)}\n- Opponent avg speed: ${formatSeconds(snapshot.opponentMetrics.avgTimeMs)}\n- Human max streak: ${snapshot.humanMetrics.maxStreak}\n- Opponent max streak: ${snapshot.opponentMetrics.maxStreak}\n- Human timeout: ${snapshot.humanMetrics.timeoutCount}\n- Opponent timeout: ${snapshot.opponentMetrics.timeoutCount}\n- Focus penalties: ${snapshot.focusPenaltyCount}\n- Opponent label: ${snapshot.opponentLabel}\n- Match kind: ${snapshot.matchKind}\n\nWrite like the opponent is commenting on the player's real performance.`

  return { system, user }
}
