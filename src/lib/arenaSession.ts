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
  FIX_ERROR_ALL_CORE_SCOPE,
  FIX_ERROR_ALL_GAME_SCOPE,
  fixErrorQuestionBanks,
  fixErrorSupportedCoreLanguageIds,
  fixErrorSupportedGameLanguageIds,
  type FixErrorScopeId,
  type FixErrorSupportedLanguageId,
} from '../data/fixErrorData'
import { resolveArenaFairProfile } from '../data/quizFormats'
import { guideBookEntries, questionBanks, trackTopicIds } from '../data/questionBank'
import type {
  ArenaAiDifficulty,
  ArenaModeId,
  DebugChoice,
  DebugQuestionBankItem,
  FixErrorChoice,
  FixErrorQuestionBankItem,
  LanguageId,
  LocalizedText,
  QuestionBankItem,
  QuizTrackId,
  VocabChoice,
  VocabQuestionBankItem,
} from '../data/quizModels'
import {
  VOCAB_ALL_CORE_SCOPE,
  VOCAB_ALL_GAME_SCOPE,
  vocabQuestionBanks,
  vocabSupportedCoreLanguageIds,
  vocabSupportedGameLanguageIds,
  type VocabScopeId,
  type VocabSupportedLanguageId,
} from '../data/vocabData'
import {
  createDebugSession,
  createFixErrorSession,
  createIdentifyLanguageSession,
  createVocabSession,
  shuffleList,
  type DebugQuizQuestion,
  type FixErrorQuizQuestion,
  type IdentifyLanguageQuizQuestion,
  type QuizQuestion,
  type VocabQuizQuestion,
} from './quiz'

export type ArenaRound = {
  humanQuestion: QuizQuestion
  opponentQuestion: QuizQuestion
  opponentDifficulty: ArenaAiDifficulty
}

const identifyCommentByLanguage: Partial<Record<LanguageId, string>> = {
  python: '#',
  java: '//',
  javascript: '//',
  html: '<!--',
  css: '/*',
  json: '//',
  csharp: '//',
  cpp: '//',
  flutter: '//',
  dart: '//',
  go: '//',
  kotlin: '//',
  swift: '//',
  ruby: '#',
  jsx: '//',
  typescript: '//',
  bash: '#',
  'cloud-functions': '//',
  sql: '--',
  php: '//',
  rust: '//',
  'roblox-lua': '--',
  'love2d-lua': '--',
  'godot-gdscript': '#',
  'godot-shader': '//',
  'unity-csharp': '//',
  'unity-shaderlab': '//',
  'unreal-cpp': '//',
  glsl: '//',
  'phaser-typescript': '//',
  'rpg-maker-js': '//',
  'gamemaker-gml': '//',
  'defold-lua': '--',
  'cocos-typescript': '//',
  'bevy-rust': '//',
  'renpy-python': '#',
}

const appendLocalizedText = (base: LocalizedText, thSuffix: string, enSuffix: string): LocalizedText => ({
  th: `${base.th}\n${thSuffix}`,
  en: `${base.en}\n${enSuffix}`,
})

const formatCommentLine = (language: LanguageId, message: string) => {
  const token = identifyCommentByLanguage[language] ?? '//'

  if (token === '<!--') {
    return `<!-- ${message} -->`
  }

  if (token === '/*') {
    return `/* ${message} */`
  }

  return `${token} ${message}`
}

const wrapSnippetWithArenaNoise = (language: LanguageId, snippetText: string, variantIndex: number) => {
  const prefix = formatCommentLine(language, `arena brutal pass ${variantIndex + 1}: nearby clues look valid too`)
  const suffix = formatCommentLine(language, `arena brutal pass ${variantIndex + 1}: a downstream symptom can outrun the root cause`)
  return `${prefix}\n${snippetText}\n${suffix}`
}

const fillClosestDistractors = (answer: LanguageId, track: QuizTrackId, fallbackDistractors: readonly LanguageId[]) => {
  const candidatePool = [
    ...guideBookEntries[answer].falseFriends,
    ...fallbackDistractors,
    ...trackTopicIds[track],
  ]

  const selected: LanguageId[] = []

  for (const candidate of candidatePool) {
    if (candidate === answer || selected.includes(candidate)) {
      continue
    }

    selected.push(candidate)

    if (selected.length === 3) {
      break
    }
  }

  if (selected.length !== 3) {
    throw new Error(`Unable to resolve brutal identify distractors for ${answer}.`)
  }

  return selected as [LanguageId, LanguageId, LanguageId]
}

const createBrutalIdentifyItem = (
  track: QuizTrackId,
  item: QuestionBankItem,
  index: number,
): QuestionBankItem => {
  const brutalDistractors = fillClosestDistractors(item.answer, track, item.distractors)
  const firstFalseFriend = brutalDistractors[0]
  const firstFalseFriendLabel = guideBookEntries[firstFalseFriend].label.en

  return {
    ...item,
    id: `arena-brutal-${item.id}`,
    distractors: brutalDistractors,
    snippetText: wrapSnippetWithArenaNoise(
      item.answer,
      item.snippetText,
      index,
    ),
    hint: appendLocalizedText(
      item.hint,
      `ข้อ arena brutal จะชอบเอาตัวหลอกที่หน้าคล้าย ${guideBookEntries[firstFalseFriend].label.th} เข้ามาปน`,
      `Arena brutal variants deliberately pull in lookalikes such as ${firstFalseFriendLabel}.`,
    ),
    signals: [...item.signals, `closest-false-friend:${firstFalseFriend}`],
  }
}

const createBrutalFixErrorItem = (item: FixErrorQuestionBankItem, index: number): FixErrorQuestionBankItem => ({
  ...item,
  id: `arena-brutal-${item.id}`,
  errorText: appendLocalizedText(
    item.errorText,
    'trace นี้ตั้งใจปล่อยอาการปลายทางมาปนกับต้นเหตุจริง',
    'This trace deliberately mixes downstream symptoms with the real break.',
  ),
  snippetText: wrapSnippetWithArenaNoise(item.language, item.snippetText, index),
  hint: appendLocalizedText(
    item.hint,
    'โหมด brutal จะทำให้บรรทัดข้างเคียงดูมีพิรุธพอ ๆ กัน',
    'Brutal mode keeps nearby lines looking suspicious on purpose.',
  ),
})

const createBrutalDebugItem = (item: DebugQuestionBankItem, index: number): DebugQuestionBankItem => ({
  ...item,
  id: `arena-brutal-${item.id}`,
  scenario: appendLocalizedText(
    item.scenario,
    'ทีมรายงานว่าระบบพังหลายอาการพร้อมกันจนชี้ผิดทางได้ง่าย',
    'The team reports multiple symptoms at once, making the first read easier to misdirect.',
  ),
  logText: appendLocalizedText(
    item.logText,
    'มี log ปลายทางปนอยู่ในชุดเดียวกัน อย่าเผลอตอบจากอาการอย่างเดียว',
    'A downstream log is mixed into the same trace, so answering from the symptom alone will backfire.',
  ),
  snippetText: wrapSnippetWithArenaNoise(item.language, item.snippetText, index),
  hint: appendLocalizedText(
    item.hint,
    'โหมด brutal จะดัน symptom ให้อยู่ใกล้ root cause มากขึ้น',
    'Brutal mode pushes the symptom much closer to the root cause.',
  ),
})

const createBrutalVocabItem = (item: VocabQuestionBankItem, index: number): VocabQuestionBankItem => ({
  ...item,
  id: `arena-brutal-${item.id}`,
  snippetText: wrapSnippetWithArenaNoise(item.language, item.snippetText, index),
  hint: appendLocalizedText(
    item.hint,
    'โหมด brutal จะเอา context รอบคำศัพท์มาหลอกให้หลุดจากหน้าที่จริงของมัน',
    'Brutal mode makes the surrounding context try to pull you away from the term’s actual role.',
  ),
})

const brutalIdentifyBanks: Record<QuizTrackId, QuestionBankItem[]> = {
  core: questionBanks.core.hard.map((item, index) => createBrutalIdentifyItem('core', item, index)),
  'game-dev': questionBanks['game-dev'].hard.map((item, index) => createBrutalIdentifyItem('game-dev', item, index)),
}

const brutalFixErrorQuestionBanks: Record<FixErrorSupportedLanguageId, FixErrorQuestionBankItem[]> = Object.fromEntries(
  [...fixErrorSupportedCoreLanguageIds, ...fixErrorSupportedGameLanguageIds].map((language) => [
    language,
    fixErrorQuestionBanks[language].hard.map((item, index) => createBrutalFixErrorItem(item, index)),
  ]),
) as Record<FixErrorSupportedLanguageId, FixErrorQuestionBankItem[]>

const brutalDebugQuestionBanks: Record<DebugSupportedLanguageId, DebugQuestionBankItem[]> = Object.fromEntries(
  [...debugSupportedCoreLanguageIds, ...debugSupportedGameLanguageIds].map((language) => [
    language,
    debugQuestionBanks[language].hard.map((item, index) => createBrutalDebugItem(item, index)),
  ]),
) as Record<DebugSupportedLanguageId, DebugQuestionBankItem[]>

const brutalVocabQuestionBanks: Record<VocabSupportedLanguageId, VocabQuestionBankItem[]> = Object.fromEntries(
  [...vocabSupportedCoreLanguageIds, ...vocabSupportedGameLanguageIds].map((language) => [
    language,
    vocabQuestionBanks[language].hard.map((item, index) => createBrutalVocabItem(item, index)),
  ]),
) as Record<VocabSupportedLanguageId, VocabQuestionBankItem[]>

const shuffleFixErrorChoices = (choices: readonly FixErrorChoice[]) =>
  shuffleList([...choices]) as [FixErrorChoice, FixErrorChoice, FixErrorChoice, FixErrorChoice]

const shuffleDebugChoices = (choices: readonly DebugChoice[]) =>
  shuffleList([...choices]) as [DebugChoice, DebugChoice, DebugChoice, DebugChoice]

const shuffleVocabChoices = (choices: readonly VocabChoice[]) =>
  shuffleList([...choices]) as [VocabChoice, VocabChoice, VocabChoice, VocabChoice]

const mixQuestions = <T extends QuizQuestion>(easyQuestions: T[], hardQuestions: T[]) =>
  shuffleList([...easyQuestions, ...hardQuestions])

const pairSymmetricRounds = (questions: QuizQuestion[]): ArenaRound[] =>
  questions.map((question) => ({
    humanQuestion: question,
    opponentQuestion: question,
    opponentDifficulty: 'hard',
  }))

const pairAsymmetricRounds = (humanQuestions: QuizQuestion[], opponentQuestions: QuizQuestion[]): ArenaRound[] => {
  if (humanQuestions.length !== opponentQuestions.length) {
    throw new Error(`Arena round mismatch: ${humanQuestions.length} human questions vs ${opponentQuestions.length} opponent questions.`)
  }

  return humanQuestions.map((humanQuestion, index) => ({
    humanQuestion,
    opponentQuestion: opponentQuestions[index],
    opponentDifficulty: 'brutal',
  }))
}

const createArenaIdentifyMixedSession = (track: QuizTrackId, totalQuestions: number): IdentifyLanguageQuizQuestion[] => {
  const profile = resolveArenaFairProfile(totalQuestions)
  const easyQuestions = createIdentifyLanguageSession(questionBanks[track].easy, profile.humanEasyCount)
  const hardQuestions = createIdentifyLanguageSession(questionBanks[track].hard, profile.humanHardCount)
  return mixQuestions(easyQuestions, hardQuestions)
}

const createBrutalIdentifySession = (track: QuizTrackId, totalQuestions: number): IdentifyLanguageQuizQuestion[] =>
  createIdentifyLanguageSession(brutalIdentifyBanks[track], totalQuestions)

const createBrutalFixErrorSingleLanguageSession = (
  language: FixErrorSupportedLanguageId,
  totalQuestions: number,
): FixErrorQuizQuestion[] => {
  const selected = shuffleList(brutalFixErrorQuestionBanks[language]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question brutal fix-error session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleFixErrorChoices(item.choices),
  }))
}

const createBrutalFixErrorAllSession = (
  languages: FixErrorSupportedLanguageId[],
  totalQuestions: number,
  label: string,
): FixErrorQuizQuestion[] => {
  const grouped = new Map<FixErrorSupportedLanguageId, FixErrorQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(brutalFixErrorQuestionBanks[language])]),
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
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} brutal fix-error session.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleFixErrorChoices(item.choices),
  }))
}

const createBrutalFixErrorSession = (scope: FixErrorScopeId, totalQuestions: number) =>
  scope === FIX_ERROR_ALL_CORE_SCOPE
    ? createBrutalFixErrorAllSession([...fixErrorSupportedCoreLanguageIds], totalQuestions, 'all-core')
    : scope === FIX_ERROR_ALL_GAME_SCOPE
      ? createBrutalFixErrorAllSession([...fixErrorSupportedGameLanguageIds], totalQuestions, 'all-game')
      : createBrutalFixErrorSingleLanguageSession(scope, totalQuestions)

const createArenaFixErrorMixedSession = (scope: FixErrorScopeId, totalQuestions: number): FixErrorQuizQuestion[] => {
  const profile = resolveArenaFairProfile(totalQuestions)
  const easyQuestions = createFixErrorSession(scope, 'easy', profile.humanEasyCount)
  const hardQuestions = createFixErrorSession(scope, 'hard', profile.humanHardCount)
  return mixQuestions(easyQuestions, hardQuestions)
}

const createBrutalDebugSingleLanguageSession = (
  language: DebugSupportedLanguageId,
  totalQuestions: number,
): DebugQuizQuestion[] => {
  const selected = shuffleList(brutalDebugQuestionBanks[language]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question brutal debug session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleDebugChoices(item.choices),
  }))
}

const createBrutalDebugAllSession = (
  languages: DebugSupportedLanguageId[],
  totalQuestions: number,
  label: string,
): DebugQuizQuestion[] => {
  const grouped = new Map<DebugSupportedLanguageId, DebugQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(brutalDebugQuestionBanks[language])]),
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
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} brutal debug session.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleDebugChoices(item.choices),
  }))
}

const createBrutalDebugSession = (scope: DebugScopeId, totalQuestions: number) =>
  scope === DEBUG_ALL_CORE_SCOPE
    ? createBrutalDebugAllSession([...debugSupportedCoreLanguageIds], totalQuestions, 'all-core')
    : scope === DEBUG_ALL_GAME_SCOPE
      ? createBrutalDebugAllSession([...debugSupportedGameLanguageIds], totalQuestions, 'all-game')
      : createBrutalDebugSingleLanguageSession(scope, totalQuestions)

const createArenaDebugMixedSession = (scope: DebugScopeId, totalQuestions: number): DebugQuizQuestion[] => {
  const profile = resolveArenaFairProfile(totalQuestions)
  const easyQuestions = createDebugSession(scope, 'easy', profile.humanEasyCount)
  const hardQuestions = createDebugSession(scope, 'hard', profile.humanHardCount)
  return mixQuestions(easyQuestions, hardQuestions)
}

const createBrutalVocabSingleLanguageSession = (
  language: VocabSupportedLanguageId,
  totalQuestions: number,
): VocabQuizQuestion[] => {
  const selected = shuffleList(brutalVocabQuestionBanks[language]).slice(0, totalQuestions)

  if (selected.length !== totalQuestions) {
    throw new Error(`Unable to build a ${totalQuestions}-question brutal vocab session for ${language}.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleVocabChoices(item.choices),
  }))
}

const createBrutalVocabAllSession = (
  languages: VocabSupportedLanguageId[],
  totalQuestions: number,
  label: string,
): VocabQuizQuestion[] => {
  const grouped = new Map<VocabSupportedLanguageId, VocabQuestionBankItem[]>(
    languages.map((language) => [language, shuffleList(brutalVocabQuestionBanks[language])]),
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
    throw new Error(`Unable to build a ${totalQuestions}-question ${label} brutal vocab session.`)
  }

  return selected.map((item) => ({
    ...item,
    choices: shuffleVocabChoices(item.choices),
  }))
}

const createBrutalVocabSession = (scope: VocabScopeId, totalQuestions: number) =>
  scope === VOCAB_ALL_CORE_SCOPE
    ? createBrutalVocabAllSession([...vocabSupportedCoreLanguageIds], totalQuestions, 'all-core')
    : scope === VOCAB_ALL_GAME_SCOPE
      ? createBrutalVocabAllSession([...vocabSupportedGameLanguageIds], totalQuestions, 'all-game')
      : createBrutalVocabSingleLanguageSession(scope, totalQuestions)

const createArenaVocabMixedSession = (scope: VocabScopeId, totalQuestions: number): VocabQuizQuestion[] => {
  const profile = resolveArenaFairProfile(totalQuestions)
  const easyQuestions = createVocabSession(scope, 'easy', profile.humanEasyCount)
  const hardQuestions = createVocabSession(scope, 'hard', profile.humanHardCount)
  return mixQuestions(easyQuestions, hardQuestions)
}

export const createArenaIdentifyRounds = (
  track: QuizTrackId,
  arenaMode: ArenaModeId,
  totalQuestions: number,
): ArenaRound[] => {
  if (arenaMode === 'fair-for-human') {
    const humanQuestions = createArenaIdentifyMixedSession(track, totalQuestions)
    const opponentQuestions = createBrutalIdentifySession(track, totalQuestions)
    return pairAsymmetricRounds(humanQuestions, opponentQuestions)
  }

  return pairSymmetricRounds(createIdentifyLanguageSession(questionBanks[track][arenaMode], totalQuestions))
}

export const createArenaFixErrorRounds = (
  scope: FixErrorScopeId,
  arenaMode: ArenaModeId,
  totalQuestions: number,
): ArenaRound[] => {
  if (arenaMode === 'fair-for-human') {
    const humanQuestions = createArenaFixErrorMixedSession(scope, totalQuestions)
    const opponentQuestions = createBrutalFixErrorSession(scope, totalQuestions)
    return pairAsymmetricRounds(humanQuestions, opponentQuestions)
  }

  return pairSymmetricRounds(createFixErrorSession(scope, arenaMode, totalQuestions))
}

export const createArenaDebugRounds = (
  scope: DebugScopeId,
  arenaMode: ArenaModeId,
  totalQuestions: number,
): ArenaRound[] => {
  if (arenaMode === 'fair-for-human') {
    const humanQuestions = createArenaDebugMixedSession(scope, totalQuestions)
    const opponentQuestions = createBrutalDebugSession(scope, totalQuestions)
    return pairAsymmetricRounds(humanQuestions, opponentQuestions)
  }

  return pairSymmetricRounds(createDebugSession(scope, arenaMode, totalQuestions))
}

export const createArenaVocabRounds = (
  scope: VocabScopeId,
  arenaMode: ArenaModeId,
  totalQuestions: number,
): ArenaRound[] => {
  if (arenaMode === 'fair-for-human') {
    const humanQuestions = createArenaVocabMixedSession(scope, totalQuestions)
    const opponentQuestions = createBrutalVocabSession(scope, totalQuestions)
    return pairAsymmetricRounds(humanQuestions, opponentQuestions)
  }

  return pairSymmetricRounds(createVocabSession(scope, arenaMode, totalQuestions))
}
