import {
  FIX_ERROR_ALL_CORE_SCOPE,
  FIX_ERROR_ALL_GAME_SCOPE,
  fixErrorQuestionBanks,
  fixErrorSupportedCoreLanguageIds,
  fixErrorSupportedGameLanguageIds,
  type FixErrorScopeId,
  type FixErrorSupportedLanguageId,
} from '../data/fixErrorData'
import {
  DEBUG_ALL_CORE_SCOPE,
  DEBUG_ALL_GAME_SCOPE,
  debugQuestionBanks,
  debugSupportedCoreLanguageIds,
  debugSupportedGameLanguageIds,
  type DebugScopeId,
  type DebugSupportedLanguageId,
} from '../data/debugData'
import {
  VOCAB_ALL_CORE_SCOPE,
  VOCAB_ALL_GAME_SCOPE,
  vocabQuestionBanks,
  vocabSupportedCoreLanguageIds,
  vocabSupportedGameLanguageIds,
  type VocabScopeId,
  type VocabSupportedLanguageId,
} from '../data/vocabData'
import type {
  Difficulty,
  DebugChoice,
  DebugQuestionBankItem,
  FixErrorChoice,
  FixErrorQuestionBankItem,
  LanguageId,
  LanguageIdentifyQuestionBankItem,
  QuizTrackId,
  VocabChoice,
  VocabQuestionBankItem,
} from '../data/quizModels'

export type IdentifyLanguageQuizQuestion = LanguageIdentifyQuestionBankItem & {
  choices: LanguageId[]
}

export type FixErrorQuizQuestion = FixErrorQuestionBankItem & {
  choices: [FixErrorChoice, FixErrorChoice, FixErrorChoice, FixErrorChoice]
}

export type DebugQuizQuestion = DebugQuestionBankItem & {
  choices: [DebugChoice, DebugChoice, DebugChoice, DebugChoice]
}

export type VocabQuizQuestion = VocabQuestionBankItem & {
  choices: [VocabChoice, VocabChoice, VocabChoice, VocabChoice]
}

export type QuizQuestion = IdentifyLanguageQuizQuestion | FixErrorQuizQuestion | DebugQuizQuestion | VocabQuizQuestion

export type RankBand = {
  minPercent: number
  maxPercent: number
  key: string
  ladder: 'easy' | 'hard'
  label: {
    th: string
    en: string
  }
  note: {
    th: string
    en: string
  }
  iconKey: 'skull' | 'triangle' | 'wrench' | 'scale' | 'target' | 'shield' | 'crosshair' | 'crown'
  soundCue: 'noob' | 'low' | 'med' | 'high'
  perfectSoundCue?: 'max'
}

export type IdentifyLanguageOutcome = {
  questionId: string
  format: 'identify-language'
  answer: LanguageId
  selectedChoice: LanguageId | null
  isCorrect: boolean
  result: 'correct' | 'wrong' | 'timeout'
  hintUsed: boolean
  timeMs: number
  difficulty: Difficulty
  track: QuizTrackId
}

export type FixErrorOutcome = {
  questionId: string
  format: 'fix-error'
  language: LanguageId
  difficulty: Difficulty
  answer: string
  selectedChoice: string | null
  isCorrect: boolean
  result: 'correct' | 'wrong' | 'timeout'
  hintUsed: boolean
  timeMs: number
  track: QuizTrackId
}

export type DebugOutcome = {
  questionId: string
  format: 'debug'
  language: LanguageId
  difficulty: Difficulty
  answer: string
  selectedChoice: string | null
  isCorrect: boolean
  result: 'correct' | 'wrong' | 'timeout'
  hintUsed: boolean
  timeMs: number
  track: QuizTrackId
}

export type VocabOutcome = {
  questionId: string
  format: 'vocab'
  language: LanguageId
  difficulty: Difficulty
  answer: string
  selectedChoice: string | null
  isCorrect: boolean
  result: 'correct' | 'wrong' | 'timeout'
  hintUsed: boolean
  timeMs: number
  track: QuizTrackId
}

export type QuestionOutcome = IdentifyLanguageOutcome | FixErrorOutcome | DebugOutcome | VocabOutcome

const sharedRankRanges: Array<
  Pick<RankBand, 'minPercent' | 'maxPercent' | 'key' | 'soundCue' | 'iconKey' | 'perfectSoundCue'>
> = [
  { minPercent: 0, maxPercent: 20, key: 'tier-1', soundCue: 'noob', iconKey: 'skull' as const },
  { minPercent: 20, maxPercent: 35, key: 'tier-2', soundCue: 'low', iconKey: 'triangle' as const },
  { minPercent: 35, maxPercent: 50, key: 'tier-3', soundCue: 'low', iconKey: 'wrench' as const },
  { minPercent: 50, maxPercent: 65, key: 'tier-4', soundCue: 'med', iconKey: 'scale' as const },
  { minPercent: 65, maxPercent: 75, key: 'tier-5', soundCue: 'med', iconKey: 'target' as const },
  { minPercent: 75, maxPercent: 85, key: 'tier-6', soundCue: 'high', iconKey: 'shield' as const },
  { minPercent: 85, maxPercent: 95, key: 'tier-7', soundCue: 'high', iconKey: 'crosshair' as const },
  { minPercent: 95, maxPercent: 101, key: 'tier-8', soundCue: 'high', iconKey: 'crown' as const, perfectSoundCue: 'max' as const },
]

const easyRankBands: RankBand[] = [
  {
    ...sharedRankRanges[0],
    ladder: 'easy',
    label: { th: 'Missed Basics', en: 'Missed Basics' },
    note: { th: 'ต่ำกว่า 20% แปลว่ายังพลาด marker พื้นฐานอยู่เยอะ ต้องกลับไปปักหลักใหม่ก่อน', en: 'Below 20% means the basic markers are still slipping badly. Rebuild the base first.' },
  },
  {
    ...sharedRankRanges[1],
    ladder: 'easy',
    label: { th: 'Low Accuracy', en: 'Low Accuracy' },
    note: { th: 'ช่วง 20-34% ยังแยกสัญญาณจริงกับตัวลวงได้ไม่พอ', en: '20-34% still means the real signal is getting mixed with decoys too often.' },
  },
  {
    ...sharedRankRanges[2],
    ladder: 'easy',
    label: { th: 'Patchy', en: 'Patchy' },
    note: { th: 'ช่วง 35-49% เริ่มจับบางข้อได้ แต่ภาพรวมยังไม่ต่อเนื่อง', en: '35-49% means some reads land, but the overall pattern is still patchy.' },
  },
  {
    ...sharedRankRanges[3],
    ladder: 'easy',
    label: { th: 'Fair', en: 'Fair' },
    note: { th: 'ช่วง 50-64% ถือว่าเริ่มอยู่ตัว แต่ยังไม่ใช่รอบที่นิ่งหรือคุ้มอวย', en: '50-64% is fair. It is serviceable, but not yet clean or reliable.' },
  },
  {
    ...sharedRankRanges[4],
    ladder: 'easy',
    label: { th: 'Capable', en: 'Capable' },
    note: { th: 'ช่วง 65-74% แปลว่าพื้นฐานใช้ได้จริง แต่ยังมีจุดหลุดเวลาโดนกดดัน', en: '65-74% is capable. The base works, but pressure still creates leaks.' },
  },
  {
    ...sharedRankRanges[5],
    ladder: 'easy',
    label: { th: 'Clean', en: 'Clean' },
    note: { th: 'ช่วง 75-84% แปลว่าอ่านค่อนข้างสะอาดแล้ว เหลือเก็บรายละเอียด', en: '75-84% is clean. Most reads are under control, with detail work left.' },
  },
  {
    ...sharedRankRanges[6],
    ladder: 'easy',
    label: { th: 'Sharp', en: 'Sharp' },
    note: { th: 'ช่วง 85-94% แปลว่าคมและนิ่งพอสมควร ผิดพลาดเหลือไม่มาก', en: '85-94% is sharp. The run is controlled and the remaining misses are limited.' },
  },
  {
    ...sharedRankRanges[7],
    ladder: 'easy',
    label: { th: 'Locked In', en: 'Locked In' },
    note: { th: '95-100% คือรอบที่นิ่งมาก ถ้าพลาดก็พลาดน้อยจริง และ 100% คือปิดงานสมบูรณ์', en: '95-100% is locked in. Very few misses remain, and 100% is a full clean clear.' },
  },
]

const hardRankBands: RankBand[] = [
  {
    ...sharedRankRanges[0],
    ladder: 'hard',
    label: { th: 'Overwhelmed', en: 'Overwhelmed' },
    note: { th: 'ต่ำกว่า 20% ใน hard คือยังรับแรงกดดันของโจทย์ไม่ไหว', en: 'Below 20% on hard means the pressure and ambiguity are overwhelming the read.' },
  },
  {
    ...sharedRankRanges[1],
    ladder: 'hard',
    label: { th: 'Shaky', en: 'Shaky' },
    note: { th: 'ช่วง 20-34% ยังไม่นิ่งพอสำหรับ hard และโดนตัวลวงดึงง่าย', en: '20-34% on hard is still shaky, with decoys pulling the run apart.' },
  },
  {
    ...sharedRankRanges[2],
    ladder: 'hard',
    label: { th: 'Recovering', en: 'Recovering' },
    note: { th: 'ช่วง 35-49% แปลว่าเริ่มประคองเกมได้ แต่ยังไม่เสถียร', en: '35-49% on hard means recovery has started, but the run is not stable yet.' },
  },
  {
    ...sharedRankRanges[3],
    ladder: 'hard',
    label: { th: 'Fair', en: 'Fair' },
    note: { th: 'ช่วง 50-64% บน hard ถือว่าเอาอยู่ระดับหนึ่ง แต่ยังไม่ใช่ผลลัพธ์ที่ควรฉลอง', en: '50-64% on hard is fair. It is respectable, but not a reward tier.' },
  },
  {
    ...sharedRankRanges[4],
    ladder: 'hard',
    label: { th: 'Competent', en: 'Competent' },
    note: { th: 'ช่วง 65-74% บน hard แปลว่าคุมพื้นฐานได้จริงแล้ว', en: '65-74% on hard is competent. The base is holding under harder pressure.' },
  },
  {
    ...sharedRankRanges[5],
    ladder: 'hard',
    label: { th: 'Reliable', en: 'Reliable' },
    note: { th: 'ช่วง 75-84% บน hard แปลว่ารอบนี้ไว้ใจได้และหลุดไม่บ่อย', en: '75-84% on hard is reliable. The run holds together and breaks less often.' },
  },
  {
    ...sharedRankRanges[6],
    ladder: 'hard',
    label: { th: 'Sharp', en: 'Sharp' },
    note: { th: 'ช่วง 85-94% บน hard คืออ่านคมและตอบได้แน่นแล้ว', en: '85-94% on hard is sharp. Reads are disciplined and consistently strong.' },
  },
  {
    ...sharedRankRanges[7],
    ladder: 'hard',
    label: { th: 'Hard Clear', en: 'Hard Clear' },
    note: { th: '95-100% บน hard คือเคลียร์โหดจริง และ 100% คือปิดงานแทบไร้ช่องโหว่', en: '95-100% on hard is a real hard clear, and 100% is nearly flawless.' },
  },
]

export const shuffleList = <T,>(items: T[]) => {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

type CreateIdentifyLanguageSessionOptions = {
  priorityTopics?: LanguageId[]
  priorityTopicLimit?: number
}

const shuffleFixErrorChoices = (choices: readonly FixErrorChoice[]) =>
  shuffleList([...choices]) as [FixErrorChoice, FixErrorChoice, FixErrorChoice, FixErrorChoice]

const shuffleDebugChoices = (choices: readonly DebugChoice[]) =>
  shuffleList([...choices]) as [DebugChoice, DebugChoice, DebugChoice, DebugChoice]

const shuffleVocabChoices = (choices: readonly VocabChoice[]) =>
  shuffleList([...choices]) as [VocabChoice, VocabChoice, VocabChoice, VocabChoice]

export const createIdentifyLanguageSession = (
  bank: LanguageIdentifyQuestionBankItem[],
  totalQuestions: number,
  options: CreateIdentifyLanguageSessionOptions = {},
) => {
  const groupedByLanguage = new Map<LanguageId, LanguageIdentifyQuestionBankItem[]>()

  for (const item of bank) {
    const group = groupedByLanguage.get(item.answer) ?? []
    groupedByLanguage.set(item.answer, [...group, item])
  }

  for (const [language, items] of groupedByLanguage.entries()) {
    groupedByLanguage.set(language, shuffleList(items))
  }

  const selected: LanguageIdentifyQuestionBankItem[] = []
  const priorityTopics = [...new Set(options.priorityTopics ?? [])].filter((topicId) => groupedByLanguage.has(topicId))
  const priorityTopicLimit = Math.min(
    totalQuestions,
    options.priorityTopicLimit ?? Math.max(priorityTopics.length * 2, 6),
  )

  if (priorityTopics.length > 0) {
    while (selected.length < priorityTopicLimit) {
      let addedAny = false

      for (const topicId of priorityTopics) {
        if (selected.length === priorityTopicLimit) {
          break
        }

        const queue = groupedByLanguage.get(topicId)
        const nextQuestion = queue?.pop()

        if (nextQuestion) {
          selected.push(nextQuestion)
          addedAny = true
        }
      }

      if (!addedAny) {
        break
      }
    }
  }

  while (selected.length < totalQuestions) {
    const availableLanguages = shuffleList(
      [...groupedByLanguage.entries()]
        .filter(([, items]) => items.length > 0)
        .map(([language]) => language),
    )

    if (availableLanguages.length === 0) {
      break
    }

    for (const language of availableLanguages) {
      if (selected.length === totalQuestions) {
        break
      }

      const queue = groupedByLanguage.get(language)
      const nextQuestion = queue?.pop()

      if (nextQuestion) {
        selected.push(nextQuestion)
      }
    }
  }

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question identify-language session.`)
  }

  return shuffleList(selected).map<IdentifyLanguageQuizQuestion>((item) => ({
    ...item,
    choices: shuffleList([item.answer, ...item.distractors]),
  }))
}

const createFixErrorSingleLanguageSession = (
  language: FixErrorSupportedLanguageId,
  difficulty: Difficulty,
  totalQuestions: number,
): FixErrorQuizQuestion[] => {
  const selected = shuffleList(fixErrorQuestionBanks[language][difficulty]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question fix-error session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleFixErrorChoices(item.choices),
  }))
}

const createDebugSingleLanguageSession = (
  language: DebugSupportedLanguageId,
  difficulty: Difficulty,
  totalQuestions: number,
): DebugQuizQuestion[] => {
  const selected = shuffleList(debugQuestionBanks[language][difficulty]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question debug session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleDebugChoices(item.choices),
  }))
}

const createFixErrorAllSession = (
  languages: FixErrorSupportedLanguageId[],
  difficulty: Difficulty,
  totalQuestions: number,
  label: string,
): FixErrorQuizQuestion[] => {
  const grouped = new Map<FixErrorSupportedLanguageId, FixErrorQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(fixErrorQuestionBanks[language][difficulty])]),
  )

  const selected: FixErrorQuestionBankItem[] = []

  while (selected.length < totalQuestions) {
    const cycleLanguages = shuffleList(
      [...grouped.entries()]
        .filter(([, items]) => items.length > 0)
        .map(([language]) => language),
    )

    if (cycleLanguages.length === 0) {
      break
    }

    let addedAny = false

    for (const language of cycleLanguages) {
      if (selected.length === totalQuestions) {
        break
      }

      const queue = grouped.get(language)
      const nextQuestion = queue?.pop()

      if (nextQuestion) {
        selected.push(nextQuestion)
        addedAny = true
      }
    }

    if (!addedAny) {
      break
    }
  }

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} fix-error session.`)
  }

  return shuffleList(selected).map((item) => ({
    ...item,
    choices: shuffleFixErrorChoices(item.choices),
  }))
}

const createFixErrorAllCoreSession = (difficulty: Difficulty, totalQuestions: number) =>
  createFixErrorAllSession([...fixErrorSupportedCoreLanguageIds], difficulty, totalQuestions, 'all-core')

const createFixErrorAllGameSession = (difficulty: Difficulty, totalQuestions: number) =>
  createFixErrorAllSession([...fixErrorSupportedGameLanguageIds], difficulty, totalQuestions, 'all-game')

export const createFixErrorSession = (scope: FixErrorScopeId, difficulty: Difficulty, totalQuestions: number) =>
  scope === FIX_ERROR_ALL_CORE_SCOPE
    ? createFixErrorAllCoreSession(difficulty, totalQuestions)
    : scope === FIX_ERROR_ALL_GAME_SCOPE
      ? createFixErrorAllGameSession(difficulty, totalQuestions)
      : createFixErrorSingleLanguageSession(scope, difficulty, totalQuestions)

const createDebugAllSession = (
  languages: DebugSupportedLanguageId[],
  difficulty: Difficulty,
  totalQuestions: number,
  label: string,
): DebugQuizQuestion[] => {
  const grouped = new Map<DebugSupportedLanguageId, DebugQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(debugQuestionBanks[language][difficulty])]),
  )

  const selected: DebugQuestionBankItem[] = []

  while (selected.length < totalQuestions) {
    const cycleLanguages = shuffleList(
      [...grouped.entries()]
        .filter(([, items]) => items.length > 0)
        .map(([language]) => language),
    )

    if (cycleLanguages.length === 0) {
      break
    }

    let addedAny = false

    for (const language of cycleLanguages) {
      if (selected.length === totalQuestions) {
        break
      }

      const queue = grouped.get(language)
      const nextQuestion = queue?.pop()

      if (nextQuestion) {
        selected.push(nextQuestion)
        addedAny = true
      }
    }

    if (!addedAny) {
      break
    }
  }

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} debug session.`)
  }

  return shuffleList(selected).map((item) => ({
    ...item,
    choices: shuffleDebugChoices(item.choices),
  }))
}

export const createDebugSession = (scope: DebugScopeId, difficulty: Difficulty, totalQuestions: number) =>
  scope === DEBUG_ALL_CORE_SCOPE
    ? createDebugAllSession([...debugSupportedCoreLanguageIds], difficulty, totalQuestions, 'all-core')
    : scope === DEBUG_ALL_GAME_SCOPE
      ? createDebugAllSession([...debugSupportedGameLanguageIds], difficulty, totalQuestions, 'all-game')
      : createDebugSingleLanguageSession(scope, difficulty, totalQuestions)

const createVocabSingleLanguageSession = (
  language: VocabSupportedLanguageId,
  difficulty: Difficulty,
  totalQuestions: number,
): VocabQuizQuestion[] => {
  const selected = shuffleList(vocabQuestionBanks[language][difficulty]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question vocab session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleVocabChoices(item.choices),
  }))
}

const createVocabAllSession = (
  languages: VocabSupportedLanguageId[],
  difficulty: Difficulty,
  totalQuestions: number,
  label: string,
): VocabQuizQuestion[] => {
  const grouped = new Map<VocabSupportedLanguageId, VocabQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(vocabQuestionBanks[language][difficulty])]),
  )

  const selected: VocabQuestionBankItem[] = []

  while (selected.length < totalQuestions) {
    const cycleLanguages = shuffleList(
      [...grouped.entries()]
        .filter(([, items]) => items.length > 0)
        .map(([language]) => language),
    )

    if (cycleLanguages.length === 0) {
      break
    }

    let addedAny = false

    for (const language of cycleLanguages) {
      if (selected.length === totalQuestions) {
        break
      }

      const queue = grouped.get(language)
      const nextQuestion = queue?.pop()

      if (nextQuestion) {
        selected.push(nextQuestion)
        addedAny = true
      }
    }

    if (!addedAny) {
      break
    }
  }

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} vocab session.`)
  }

  return shuffleList(selected).map((item) => ({
    ...item,
    choices: shuffleVocabChoices(item.choices),
  }))
}

export const createVocabSession = (scope: VocabScopeId, difficulty: Difficulty, totalQuestions: number) =>
  scope === VOCAB_ALL_CORE_SCOPE
    ? createVocabAllSession([...vocabSupportedCoreLanguageIds], difficulty, totalQuestions, 'all-core')
    : scope === VOCAB_ALL_GAME_SCOPE
      ? createVocabAllSession([...vocabSupportedGameLanguageIds], difficulty, totalQuestions, 'all-game')
      : createVocabSingleLanguageSession(scope, difficulty, totalQuestions)

export const getRankBand = (score: number, totalQuestions: number, ladder: 'easy' | 'hard' = 'easy') => {
  if (totalQuestions <= 0) {
    throw new Error(`Cannot resolve rank for ${score}/${totalQuestions}.`)
  }

  const percent = (score / totalQuestions) * 100
  const rankPool = ladder === 'hard' ? hardRankBands : easyRankBands
  const rank = rankPool.find((band) => percent >= band.minPercent && percent < band.maxPercent)

  if (!rank) {
    throw new Error(`No rank band configured for score ${score}/${totalQuestions}.`)
  }

  return rank
}

export const getRatingBand = getRankBand

export const getOutcomeBreakdown = (outcomes: QuestionOutcome[]) => ({
  correct: outcomes.filter((outcome) => outcome.result === 'correct').length,
  wrong: outcomes.filter((outcome) => outcome.result === 'wrong').length,
  timeout: outcomes.filter((outcome) => outcome.result === 'timeout').length,
  hintsUsed: outcomes.filter((outcome) => outcome.hintUsed).length,
})
