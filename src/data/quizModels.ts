export type Difficulty = 'easy' | 'hard'
export type GuideLevel = 'easy' | 'hard'
export type ArenaModeId = 'easy' | 'hard' | 'fair-for-human'
export type ArenaAiDifficulty = 'hard' | 'brutal'

export type QuizTrackId = 'core' | 'game-dev'

export type QuizFormatId = 'identify-language' | 'fix-error' | 'debug' | 'vocab'

export type IdentifySessionLengthId = 'short' | 'standard'
export type VocabSessionLengthId = 'short' | 'standard'

export type CoreLanguageId =
  | 'python'
  | 'java'
  | 'javascript'
  | 'html'
  | 'css'
  | 'json'
  | 'csharp'
  | 'cpp'
  | 'flutter'
  | 'dart'
  | 'go'
  | 'kotlin'
  | 'swift'
  | 'ruby'
  | 'jsx'
  | 'typescript'
  | 'bash'
  | 'cloud-functions'
  | 'sql'
  | 'php'
  | 'rust'

export type GameLanguageId =
  | 'roblox-lua'
  | 'love2d-lua'
  | 'godot-gdscript'
  | 'godot-shader'
  | 'unity-csharp'
  | 'unity-shaderlab'
  | 'unreal-cpp'
  | 'glsl'
  | 'phaser-typescript'
  | 'rpg-maker-js'
  | 'gamemaker-gml'
  | 'defold-lua'
  | 'cocos-typescript'
  | 'bevy-rust'
  | 'renpy-python'

export type LanguageId = CoreLanguageId | GameLanguageId

export type GuideFamilyId = 'web' | 'app' | 'backend' | 'data' | 'system' | 'gameplay' | 'lifecycle' | 'shader'

export type LocalizedText = {
  th: string
  en: string
}

export type QuestionSeed = {
  snippetText: string
  distractors: [LanguageId, LanguageId, LanguageId]
  hint: LocalizedText
  signals: string[]
}

export type LanguageIdentifyQuestionSeed = QuestionSeed

export type QuestionBankItem = LanguageIdentifyQuestionSeed & {
  id: string
  format: 'identify-language'
  difficulty: Difficulty
  answer: LanguageId
}

export type LanguageIdentifyQuestionBankItem = QuestionBankItem

export type FixErrorChoice = {
  id: string
  label: LocalizedText
  lineNumber: number
  fragment: string
}

export type FixErrorPatternFamilyId =
  | 'name-typo'
  | 'method-typo'
  | 'null-access'
  | 'range'
  | 'syntax'
  | 'module-import'
  | 'field-property'
  | 'arity'
  | 'type-mismatch'
  | 'selector-mismatch'
  | 'engine-api'
  | 'engine-callback'
  | 'shader-builtin'

export type FixErrorLineRole = 'setup' | 'root-cause' | 'symptom' | 'safe-follow-up' | 'fallback'

export type FixErrorHintAnchor = 'fragment' | 'family' | 'symptom-vs-root'

export type FixErrorGuideTag =
  | 'typo'
  | 'runtime-state'
  | 'range'
  | 'syntax'
  | 'import'
  | 'field'
  | 'arity'
  | 'type'
  | 'selector'
  | 'engine'
  | 'shader'

export type FixErrorDifficulty = 'easy' | 'medium' | 'hard'

export type FixErrorExplanation = {
  correct: LocalizedText
  wrongChoices: Record<string, LocalizedText>
}

export type FixErrorQuestionSeed = {
  format: 'fix-error'
  track: QuizTrackId
  language: LanguageId
  difficulty: Difficulty
  patternGroupId: string
  familyId: FixErrorPatternFamilyId
  lineRoles: [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole]
  hintAnchor: FixErrorHintAnchor
  guideTags: FixErrorGuideTag[]
  errorText: LocalizedText
  snippetText: string
  choices: [FixErrorChoice, FixErrorChoice, FixErrorChoice, FixErrorChoice]
  answer: string
  hint: LocalizedText
  explanation: FixErrorExplanation
}

export type FixErrorQuestionBankItem = FixErrorQuestionSeed & {
  id: string
}

export type DebugChoice = {
  id: string
  label: LocalizedText
  detail: LocalizedText
}

export type DebugExplanation = {
  correct: LocalizedText
}

export type DebugQuestionSeed = {
  format: 'debug'
  track: QuizTrackId
  language: LanguageId
  difficulty: Difficulty
  patternGroupId: string
  scenario: LocalizedText
  logText: LocalizedText
  snippetText: string
  choices: [DebugChoice, DebugChoice, DebugChoice, DebugChoice]
  answer: string
  hint: LocalizedText
  explanation: DebugExplanation
}

export type DebugQuestionBankItem = DebugQuestionSeed & {
  id: string
}

export type VocabChoice = {
  id: string
  label: LocalizedText
}

export type VocabContextRole =
  | 'direct'
  | 'inside-flow'
  | 'result-check'
  | 'loop-pass'
  | 'fallback-branch'
  | 'handler-setup'
  | 'state-update'
  | 'render-pass'

export type VocabQuestionSeed = {
  format: 'vocab'
  track: QuizTrackId
  language: LanguageId
  difficulty: Difficulty
  contextRole: VocabContextRole
  termText: LocalizedText
  snippetText: string
  choices: [VocabChoice, VocabChoice, VocabChoice, VocabChoice]
  answer: string
  hint: LocalizedText
  explanation: {
    correct: LocalizedText
  }
}

export type VocabQuestionBankItem = VocabQuestionSeed & {
  id: string
}

export type FutureQuizQuestionBankItem =
  | LanguageIdentifyQuestionBankItem
  | FixErrorQuestionBankItem
  | DebugQuestionBankItem
  | VocabQuestionBankItem

export const createQuestionSet = (
  difficulty: Difficulty,
  answer: LanguageId,
  seeds: LanguageIdentifyQuestionSeed[],
): QuestionBankItem[] =>
  seeds.map((seed, index) => ({
    ...seed,
    id: `${difficulty}-${answer}-${index + 1}`,
    format: 'identify-language',
    difficulty,
    answer,
  }))
