import type { ArenaAiDifficulty, ArenaModeId, Difficulty, IdentifySessionLengthId, LocalizedText, QuizFormatId, QuizTrackId, VocabSessionLengthId } from './quizModels'

export type DifficultyModeSetting = {
  label: LocalizedText
  description: LocalizedText
  hintLimit: number
  badge: LocalizedText
}

export type ArenaModeSetting = {
  label: LocalizedText
  description: LocalizedText
  badge: LocalizedText
}

type HintQuestionCountBucket = 15 | 30

export type HintProfile = {
  questionCountBucket: HintQuestionCountBucket
  hintLimit: number
}

export type ArenaFairProfile = {
  questionCountBucket: HintQuestionCountBucket
  humanEasyCount: number
  humanHardCount: number
  aiQuestionCount: number
  aiDifficulty: ArenaAiDifficulty
}

const hintLimitByQuestionCount: Record<HintQuestionCountBucket, Record<Difficulty, number>> = {
  15: {
    easy: 3,
    hard: 5,
  },
  30: {
    easy: 5,
    hard: 7,
  },
}

const resolveHintQuestionCountBucket = (questionCount: number): HintQuestionCountBucket => (questionCount <= 15 ? 15 : 30)

const createHintBadge = (formatId: QuizFormatId, questionCount: number, hintLimit: number): LocalizedText =>
  formatId === 'fix-error' || formatId === 'debug'
    ? {
        th: `${questionCount} ข้อ / ${hintLimit} hints`,
        en: `${questionCount} questions / ${hintLimit} hints`,
      }
    : {
        th: `Hints ${hintLimit} ครั้ง`,
        en: `${hintLimit} hints`,
      }

export const resolveHintProfile = (questionCount: number, difficulty: Difficulty): HintProfile => {
  const questionCountBucket = resolveHintQuestionCountBucket(questionCount)

  return {
    questionCountBucket,
    hintLimit: hintLimitByQuestionCount[questionCountBucket][difficulty],
  }
}

export const resolveArenaFairProfile = (questionCount: number): ArenaFairProfile => {
  const questionCountBucket = resolveHintQuestionCountBucket(questionCount)

  return questionCountBucket === 15
    ? {
        questionCountBucket,
        humanEasyCount: 8,
        humanHardCount: 7,
        aiQuestionCount: 15,
        aiDifficulty: 'brutal',
      }
    : {
        questionCountBucket,
        humanEasyCount: 15,
        humanHardCount: 15,
        aiQuestionCount: 30,
        aiDifficulty: 'brutal',
      }
}

export const resolveDifficultyModeSetting = (
  formatId: QuizFormatId,
  difficulty: Difficulty,
  questionCount: number,
): DifficultyModeSetting => {
  const baseSetting = quizFormatSettings[formatId].difficulties[difficulty]
  const { hintLimit } = resolveHintProfile(questionCount, difficulty)

  return {
    ...baseSetting,
    hintLimit,
    badge: createHintBadge(formatId, questionCount, hintLimit),
  }
}

export const resolveArenaModeSetting = (
  formatId: QuizFormatId,
  arenaMode: ArenaModeId,
  questionCount: number,
): ArenaModeSetting => {
  if (arenaMode !== 'fair-for-human') {
    const base = resolveDifficultyModeSetting(formatId, arenaMode, questionCount)
    return {
      label: base.label,
      description: base.description,
      badge: {
        th: `${questionCount} ข้อ`,
        en: `${questionCount}Q`,
      },
    }
  }

  const profile = resolveArenaFairProfile(questionCount)

  return {
    label: {
      th: 'Fair For Human',
      en: 'Fair For Human',
    },
    description: {
      th: `ผู้เล่นได้ข้อ easy ${profile.humanEasyCount} + hard ${profile.humanHardCount} ส่วน AI ได้ ${profile.aiQuestionCount} ข้อแบบ brutal คนละชุด`,
      en: `The human gets ${profile.humanEasyCount} easy + ${profile.humanHardCount} hard questions while the AI fights on a separate ${profile.aiQuestionCount}-question brutal board.`,
    },
    badge: {
      th: `Human ${profile.humanEasyCount}/${profile.humanHardCount} · AI brutal`,
      en: `Human ${profile.humanEasyCount}/${profile.humanHardCount} · AI brutal`,
    },
  }
}

export type IdentifyLanguageFormatSetting = {
  id: 'identify-language'
  label: LocalizedText
  description: LocalizedText
  availableTracks: QuizTrackId[]
  questionsPerSession: number
  questionTimeLimitSeconds: number
  answerModel: 'language-id'
  difficulties: Record<Difficulty, DifficultyModeSetting>
  lengths: Record<
    IdentifySessionLengthId,
    {
      id: IdentifySessionLengthId
      label: LocalizedText
      description: LocalizedText
      questionsPerSession: number
      badge: LocalizedText
    }
  >
}

export type FixErrorFormatSetting = {
  id: 'fix-error'
  label: LocalizedText
  description: LocalizedText
  availableTracks: QuizTrackId[]
  questionsPerSession: number
  questionTimeLimitSeconds: number
  answerModel: 'choice-id'
  difficulties: Record<Difficulty, DifficultyModeSetting>
}

export type DebugFormatSetting = {
  id: 'debug'
  label: LocalizedText
  description: LocalizedText
  availableTracks: QuizTrackId[]
  questionsPerSession: number
  questionTimeLimitSeconds: number
  answerModel: 'choice-id'
  difficulties: Record<Difficulty, DifficultyModeSetting>
}

export type VocabFormatSetting = {
  id: 'vocab'
  label: LocalizedText
  description: LocalizedText
  availableTracks: QuizTrackId[]
  questionsPerSession: number
  questionTimeLimitSeconds: number
  answerModel: 'choice-id'
  difficulties: Record<Difficulty, DifficultyModeSetting>
  lengths: Record<
    VocabSessionLengthId,
    {
      id: VocabSessionLengthId
      label: LocalizedText
      description: LocalizedText
      questionsPerSession: number
      badge: LocalizedText
    }
  >
}

export type QuizFormatSetting = IdentifyLanguageFormatSetting | FixErrorFormatSetting | DebugFormatSetting | VocabFormatSetting

export const quizFormatSettings = {
  'identify-language': {
    id: 'identify-language',
    label: { th: 'ทายภาษา', en: 'Identify language' },
    description: {
      th: 'โหมดปัจจุบันที่ให้ดู snippet แล้วเลือกว่าภาษาอะไร',
      en: 'The current mode where players inspect a snippet and identify the language.',
    },
    availableTracks: ['core', 'game-dev'],
    questionsPerSession: 30,
    questionTimeLimitSeconds: 30,
    answerModel: 'language-id',
    difficulties: {
      easy: {
        label: { th: 'โหมดง่าย', en: 'Easy mode' },
        description: {
          th: 'snippet สั้นกว่า มอง marker หลักให้ไว และเหมาะกับการฝึกจับกลิ่นครั้งแรก',
          en: 'Shorter snippets that focus on the main markers and first-pass pattern recognition.',
        },
        hintLimit: 5,
        badge: { th: 'Hints 5 ครั้ง', en: '5 hints' },
      },
      hard: {
        label: { th: 'โหมดยาก', en: 'Hard mode' },
        description: {
          th: 'snippet ยาวขึ้น marker ลึกขึ้น และมีโครงสร้างที่แยกภาษาคล้ายกันได้ชัดกว่า',
          en: 'Longer snippets with deeper markers and structures that separate lookalike options more clearly.',
        },
        hintLimit: 7,
        badge: { th: 'Hints 7 ครั้ง', en: '7 hints' },
      },
    },
    lengths: {
      short: {
        id: 'short',
        label: { th: '15 ข้อ', en: '15 questions' },
        description: {
          th: 'โหมดสั้นสำหรับการฝึกแบบเร็ว',
          en: 'A shorter round for quick drills.',
        },
        questionsPerSession: 15,
        badge: { th: '15 ข้อ', en: '15Q' },
      },
      standard: {
        id: 'standard',
        label: { th: '30 ข้อ', en: '30 questions' },
        description: {
          th: 'โหมดมาตรฐาน 30 ข้อเต็ม',
          en: 'The standard full 30-question round.',
        },
        questionsPerSession: 30,
        badge: { th: '30 ข้อ', en: '30Q' },
      },
    },
  },
  'fix-error': {
    id: 'fix-error',
    label: { th: 'Fix Error', en: 'Fix Error' },
    description: {
      th: 'อ่าน snippet แล้วใช้อาการ error ด้านล่างช่วยหา line ที่ทำให้โค้ดพัง',
      en: 'Inspect the snippet, then use the error underneath to locate the line that actually breaks the run.',
    },
    availableTracks: ['core', 'game-dev'],
    questionsPerSession: 15,
    questionTimeLimitSeconds: 35,
    answerModel: 'choice-id',
    difficulties: {
      easy: {
        label: { th: 'โหมดง่าย', en: 'Easy mode' },
        description: {
          th: 'error ชี้ตรงกว่า บรรทัดต้นเหตุชัดกว่า และเหมาะกับการฝึกไล่หาจุดพังทีละขั้น',
          en: 'Uses more direct errors, clearer culprit lines, and a gentler path for learning how to isolate the breaking line.',
        },
        hintLimit: 3,
        badge: { th: '15 ข้อ / 3 hints', en: '15 questions / 3 hints' },
      },
      hard: {
        label: { th: 'โหมดยาก', en: 'Hard mode' },
        description: {
          th: 'เพิ่มบริบทหลอก อาการที่ชวนสับสน และบรรทัด symptom ที่ใกล้กับต้นเหตุจริงมากขึ้น',
          en: 'Adds misleading context, closer symptom lines, and more indirect failure clues around the real culprit.',
        },
        hintLimit: 5,
        badge: { th: '15 ข้อ / 5 hints', en: '15 questions / 5 hints' },
      },
    },
  },
  debug: {
    id: 'debug',
    label: { th: 'Debug', en: 'Debug' },
    description: {
      th: 'อ่าน scenario + log runtime แล้วชี้สาเหตุหลักที่ทำให้ระบบพัง',
      en: 'Read the scenario and runtime log, then pinpoint the root cause that breaks the system.',
    },
    availableTracks: ['core', 'game-dev'],
    questionsPerSession: 15,
    questionTimeLimitSeconds: 50,
    answerModel: 'choice-id',
    difficulties: {
      easy: {
        label: { th: 'โหมดง่าย', en: 'Easy mode' },
        description: {
          th: 'scenario กับ log จะบอกทิศทางค่อนข้างตรง เหมาะกับการฝึกจับ root cause ให้แม่นก่อน',
          en: 'Keeps the scenario and log fairly direct so you can practice locking onto the root cause first.',
        },
        hintLimit: 3,
        badge: { th: '15 ข้อ / 3 hints', en: '15 questions / 3 hints' },
      },
      hard: {
        label: { th: 'โหมดยาก', en: 'Hard mode' },
        description: {
          th: 'log จะ subtle ขึ้น choice จะใกล้กันขึ้น และต้องแยก symptom ออกจาก root cause ให้ชัด',
          en: 'Uses subtler logs, closer distractors, and a stronger need to separate surface symptoms from the real root cause.',
        },
        hintLimit: 5,
        badge: { th: '15 ข้อ / 5 hints', en: '15 questions / 5 hints' },
      },
    },
  },
  vocab: {
    id: 'vocab',
    label: { th: 'ฝึกศัพท์', en: 'Vocab Drill' },
    description: {
      th: 'ฝึกจำ keyword, built-in function และ syntax term พื้นฐานของแต่ละภาษา',
      en: 'Drill core keywords, built-in functions, and syntax terms for each language.',
    },
    availableTracks: ['core', 'game-dev'],
    questionsPerSession: 30,
    questionTimeLimitSeconds: 25,
    answerModel: 'choice-id',
    difficulties: {
      easy: {
        label: { th: 'โหมดง่าย', en: 'Easy mode' },
        description: {
          th: 'เน้นคำศัพท์และ syntax ที่เด่นชัด เหมาะกับการจับความหมายจาก snippet ให้ไว',
          en: 'Focuses on the clearest keywords and syntax so meaning can be recognized quickly from the snippet.',
        },
        hintLimit: 5,
        badge: { th: 'Hints 5 ครั้ง', en: '5 hints' },
      },
      hard: {
        label: { th: 'โหมดยาก', en: 'Hard mode' },
        description: {
          th: 'ใช้ context ที่ยาวขึ้นและ choice ที่ใกล้กันกว่าเดิม เพื่อวัดความเข้าใจศัพท์เชิงลึก',
          en: 'Uses longer context and closer distractors to test deeper understanding of the term.',
        },
        hintLimit: 7,
        badge: { th: 'Hints 7 ครั้ง', en: '7 hints' },
      },
    },
    lengths: {
      short: {
        id: 'short',
        label: { th: '15 ข้อ', en: '15 questions' },
        description: {
          th: 'โหมดสั้นสำหรับซ้อมศัพท์เฉพาะจุดแบบเร็ว',
          en: 'A shorter round for quick targeted vocab drills.',
        },
        questionsPerSession: 15,
        badge: { th: '15 ข้อ', en: '15Q' },
      },
      standard: {
        id: 'standard',
        label: { th: '30 ข้อ', en: '30 questions' },
        description: {
          th: 'โหมดเต็ม 30 ข้อที่ใช้ได้แม้เลือกเจาะภาษาเดียว',
          en: 'A full 30-question round, including single-language drills.',
        },
        questionsPerSession: 30,
        badge: { th: '30 ข้อ', en: '30Q' },
      },
    },
  },
} satisfies Record<QuizFormatId, QuizFormatSetting>

export const identifyLanguageFormat = quizFormatSettings['identify-language']
export const fixErrorFormat = quizFormatSettings['fix-error']
export const debugFormat = quizFormatSettings['debug']
export const vocabFormat = quizFormatSettings['vocab']
