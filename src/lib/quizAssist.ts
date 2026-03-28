import { guideBookEntries } from '../data/guideData'
import type { DebugChoice, FixErrorChoice, LanguageId, LocalizedText, VocabChoice, VocabContextRole } from '../data/quizModels'
import type { Locale } from './i18n'
import type { DebugQuizQuestion, FixErrorQuizQuestion, IdentifyLanguageQuizQuestion, QuizQuestion, VocabQuizQuestion } from './quiz'

export type ChoiceAssist = {
  body?: string
}

export type ActiveQuizGuide = {
  title: string
  body: string
}

const t = (locale: Locale, value: LocalizedText) => value[locale]

const text = (th: string, en: string): LocalizedText => ({ th, en })

const truncate = (value: string, limit = 86) => (value.length > limit ? `${value.slice(0, limit - 3)}...` : value)

const quoteCode = (value: string) => `\`${value}\``

const getVisibleLines = (snippetText: string) =>
  snippetText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(#|\/\/|--|\/\*|<!--)/.test(line))

const getErrorLead = (value: string) => {
  const firstLine = value
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  return truncate(firstLine ?? value.trim())
}

const getLogLead = (value: string) => {
  const firstLine = value
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  return truncate(firstLine ?? value.trim())
}

const extractVocabTokens = (term: LocalizedText) => {
  const tokens = term.en
    .toLowerCase()
    .split(/[^a-z0-9$#:_|]+/g)
    .filter((token) => token.length > 1)

  if (term.en.includes('|')) {
    tokens.push('|')
  }

  if (term.en.includes('$')) {
    tokens.push('$')
  }

  return [...new Set(tokens)]
}

const getVocabFocusLine = (question: VocabQuizQuestion) => {
  const visibleLines = getVisibleLines(question.snippetText)
  const termTokens = extractVocabTokens(question.termText)

  const focusLine =
    visibleLines.find((line) =>
      termTokens.some((token) => (token === '$' ? line.includes('$') : line.toLowerCase().includes(token))),
    ) ??
    visibleLines[0] ??
    '[blank line]'

  return truncate(focusLine, 72)
}

const inferVocabUsage = (focusLine: string): LocalizedText => {
  const normalizedLine = focusLine.toLowerCase()

  if (/^\s*(if|else|elseif|for|foreach|while|switch|case|match|try|except|catch|finally|break|continue|return)\b/.test(normalizedLine)) {
    return text('การคุม flow หรือเงื่อนไข', 'control flow or branching')
  }

  if (/^\s*yield\b/.test(normalizedLine)) {
    return text('การส่งค่าทีละรอบจาก generator', 'yielding values from a generator')
  }

  if (
    /^\s*(class|struct|interface|enum|trait|protocol|def|func|function|fn|let|const|var|local|uniform|shader_type|import|from|use|package|module|label|type|#include)\b/.test(
      normalizedLine,
    ) ||
    /\blambda\b/.test(normalizedLine) ||
    /\b(extends|implements|required|final|props|exports)\b/.test(normalizedLine) ||
    /^\s*[\w$.]+\s*=\s*(async\s+)?\(/.test(normalizedLine) ||
    /^\s*[\w$.]+\s*=/.test(normalizedLine)
  ) {
    return text('การประกาศหรือกำหนดสิ่งใหม่', 'declaration or definition')
  }

  if (/\|/.test(normalizedLine) || /\$[A-Za-z_][\w]*/.test(normalizedLine)) {
    return text('การส่งผ่านหรือดึงค่าไปใช้งานต่อ', 'passing or reading values through a pipeline')
  }

  if (/\w+\s*\(|\.\w+|:\w+/.test(normalizedLine)) {
    return text('การเรียกใช้หรือเข้าถึงค่า', 'invocation or value access')
  }

  return text('บทบาทของ syntax นี้ในบริบท', 'the role this syntax plays in context')
}

const vocabContextRoleLabel = (role: VocabContextRole): LocalizedText =>
  ({
    direct: text('ตัวอย่างตรง ๆ', 'direct usage'),
    'inside-flow': text('อยู่ใน flow', 'inside flow'),
    'result-check': text('ใช้เช็กผลลัพธ์', 'result check'),
    'loop-pass': text('อยู่ในรอบของ loop', 'loop pass'),
    'fallback-branch': text('อยู่ในทาง fallback', 'fallback branch'),
    'handler-setup': text('อยู่ในขั้น setup ของ handler', 'handler setup'),
    'state-update': text('อยู่ในขั้นอัปเดต state', 'state update'),
    'render-pass': text('อยู่ในช่วง render', 'render pass'),
  })[role]

const classifyVocabChoiceMeaning = (choice: VocabChoice): LocalizedText => {
  const label = choice.label.en.toLowerCase()

  if (/(flow|branch|condition|loop|iteration|fallback|handler|guard)/.test(label)) {
    return text('คำอธิบายแนว flow หรือเงื่อนไข', 'a flow or condition style meaning')
  }

  if (/(module|package|library|import|dependency)/.test(label)) {
    return text('คำอธิบายแนวโหลด module หรือ package', 'a module or import style meaning')
  }

  if (/(function|method|call|callable|generator|action)/.test(label)) {
    return text('คำอธิบายแนวฟังก์ชันหรือการเรียกใช้งาน', 'a function or action style meaning')
  }

  if (/(class|object|instance|constructor|type|struct|trait|protocol)/.test(label)) {
    return text('คำอธิบายแนวโครงสร้างหรือ type', 'a structure or type style meaning')
  }

  if (/(value|variable|state|field|property|data|response|result)/.test(label)) {
    return text('คำอธิบายแนวข้อมูลหรือค่า', 'a data or value style meaning')
  }

  if (/(render|display|view|output|ui)/.test(label)) {
    return text('คำอธิบายแนวการแสดงผล', 'a render or output style meaning')
  }

  return text('ดูว่าความหมายนี้เข้ากับบทบาทใน snippet หรือไม่', 'check whether this meaning fits the snippet role')
}

const getIdentifyChoiceAssist = (languageId: LanguageId, locale: Locale) => {
  const guide = guideBookEntries[languageId]
  const signature = guide.signature.filter(Boolean).slice(0, 2).join(' · ')

  if (signature) {
    return locale === 'th' ? `มักมาคู่กับ marker อย่าง ${signature}` : `Often appears with markers like ${signature}`
  }

  return locale === 'th'
    ? `สังเกตแนว syntax ตาม clue นี้: ${guide.difficultyHint.th}`
    : `Use this syntax direction: ${guide.difficultyHint.en}`
}

const isIdentifyQuestion = (question: QuizQuestion): question is IdentifyLanguageQuizQuestion => question.format === 'identify-language'

const isFixErrorQuestion = (question: QuizQuestion): question is FixErrorQuizQuestion => question.format === 'fix-error'

const isDebugQuestion = (question: QuizQuestion): question is DebugQuizQuestion => question.format === 'debug'

const isVocabQuestion = (question: QuizQuestion): question is VocabQuizQuestion => question.format === 'vocab'

export const buildQuizDisplayHint = (question: QuizQuestion, locale: Locale) => {
  if (isIdentifyQuestion(question)) {
    const firstSignal = question.signals[0] ?? 'syntax marker'
    const secondSignal = question.signals[1]

    if (question.difficulty === 'easy') {
      return locale === 'th'
        ? `โฟกัส marker ที่โผล่จริงใน snippet อย่าง ${quoteCode(firstSignal)}${secondSignal ? ` และ ${quoteCode(secondSignal)}` : ''} แล้วถามว่ามันเป็นกลิ่น syntax หรือ ecosystem ที่ยืนได้ทั้งก้อนจริงไหม ถ้าตัวเลือกไหนหน้าตาคล้ายแต่ marker พวกนี้ไม่ต่อกัน ให้ตัดออกก่อน`
        : `Focus on signals that truly appear in the snippet like ${quoteCode(firstSignal)}${secondSignal ? ` and ${quoteCode(secondSignal)}` : ''}. Ask whether they form a real syntax or ecosystem pattern. Eliminate choices that only look similar on the surface.`
    }

    return locale === 'th'
      ? `ล็อก marker หลักอย่าง ${quoteCode(firstSignal)} แล้วดูว่ามันเป็นตัวแยกชั้นลึกของ snippet นี้หรือไม่ อย่าตัดสินจาก family กว้าง ๆ หรือคำที่บังเอิญคล้ายกัน`
      : `Lock onto a deep separator like ${quoteCode(firstSignal)} and judge whether it truly anchors this snippet. Do not decide from broad families or accidental lookalikes alone.`
  }

  if (isFixErrorQuestion(question)) {
    const culpritFragment = truncate(question.choices.find((choice) => choice.id === question.answer)?.fragment ?? '[blank line]', 64)
    const errorLead = getErrorLead(question.errorText[locale])

    if (question.difficulty === 'easy') {
      return locale === 'th'
        ? `${question.hint.th} ผูกข้อความ error "${errorLead}" กับบรรทัดที่มี ${quoteCode(culpritFragment)} แล้วถามว่าตรงนี้คือจุดเริ่มพังจริง หรือแค่บรรทัดที่รับผลต่อจากต้นเหตุ`
        : `${question.hint.en} Tie the error "${errorLead}" to the line containing ${quoteCode(culpritFragment)}, then ask whether that line starts the failure or only reacts to it.`
    }

    return locale === 'th'
      ? `${question.hint.th} ใช้ข้อความ error "${errorLead}" ล็อกอาการ แล้วแยกให้ได้ว่าบรรทัดไหนเป็นต้นเหตุจริง ไม่ใช่บรรทัดที่พังตามหลัง`
      : `${question.hint.en} Use the error "${errorLead}" to lock the symptom, then separate the first bad line from lines that only fail downstream.`
  }

  if (isDebugQuestion(question)) {
    const logLead = getLogLead(question.logText[locale])

    if (question.difficulty === 'easy') {
      return locale === 'th'
        ? `${question.hint.th} เริ่มจาก log "${logLead}" แล้วถามว่าอาการนี้เข้ากับสาเหตุแบบไหนจริงเมื่อเทียบกับ scenario จากนั้นตัดตัวเลือกที่ไม่สอดคล้องกับทั้งสองด้าน`
        : `${question.hint.en} Start from the log "${logLead}" and ask which kind of failure truly fits it together with the scenario, then remove choices that do not match both.`
    }

    return locale === 'th'
      ? `${question.hint.th} ใช้ log "${logLead}" เป็นข้อจำกัดหลัก แล้วดูว่าปัญหาเกิดตอนอ่านค่า หา element หรือเรียกชื่อผิด อย่าดูแค่ผิวของ snippet`
      : `${question.hint.en} Treat the log "${logLead}" as the main constraint and decide whether the issue comes from value access, element lookup, or a wrong name. Do not judge from surface syntax alone.`
  }

  const focusLine = getVocabFocusLine(question)
  const usage = inferVocabUsage(focusLine)
  const role = vocabContextRoleLabel(question.contextRole)

  if (question.difficulty === 'easy') {
    return locale === 'th'
      ? `${question.hint.th} ดูบรรทัด ${quoteCode(focusLine)} แล้วถามว่าคำนี้ทำหน้าที่เป็น${usage.th}ในบริบท ${role.th} ไม่ใช่แปลคำลอย ๆ`
      : `${question.hint.en} Look at ${quoteCode(focusLine)} and decide whether the term acts as ${usage.en} in this ${role.en} context instead of translating it in isolation.`
  }

  return locale === 'th'
    ? `${question.hint.th} ใช้บรรทัด ${quoteCode(focusLine)} กับบริบท ${role.th} ช่วยตัดความหมายที่กว้างหรือไกลจากหน้าที่จริงของคำนี้`
    : `${question.hint.en} Use ${quoteCode(focusLine)} and the ${role.en} context to cut meanings that are too broad or too far from the term's actual job here.`
}

export const shouldShowChoiceAssist = (question: QuizQuestion, quizPhase: 'active' | 'feedback') => {
  if (quizPhase === 'feedback') {
    return true
  }

  if (isIdentifyQuestion(question)) {
    return question.difficulty === 'easy'
  }

  if (isDebugQuestion(question)) {
    return question.difficulty === 'easy'
  }

  if (isVocabQuestion(question)) {
    return question.difficulty === 'easy'
  }

  return false
}

export const buildChoiceAssist = (
  question: QuizQuestion,
  choice: LanguageId | FixErrorChoice | DebugChoice | VocabChoice,
  locale: Locale,
  quizPhase: 'active' | 'feedback',
): ChoiceAssist | null => {
  if (!shouldShowChoiceAssist(question, quizPhase)) {
    return null
  }

  if (isIdentifyQuestion(question) && typeof choice === 'string') {
    if (quizPhase === 'feedback') {
      return { body: guideBookEntries[choice].quickSpot[locale] }
    }

    return { body: getIdentifyChoiceAssist(choice, locale) }
  }

  if (isDebugQuestion(question) && typeof choice !== 'string' && 'detail' in choice) {
    return { body: choice.detail[locale] }
  }

  if (isVocabQuestion(question) && typeof choice !== 'string' && !('fragment' in choice) && !('detail' in choice)) {
    return { body: t(locale, classifyVocabChoiceMeaning(choice)) }
  }

  return null
}

export const buildActiveQuizGuide = (question: QuizQuestion, locale: Locale): ActiveQuizGuide | null => {
  if (!isIdentifyQuestion(question)) {
    return null
  }

  if (question.difficulty === 'easy') {
    return {
      title: locale === 'th' ? 'แนวทางอ่านข้อแบบไม่เดาสุ่ม' : 'Read without guessing',
      body:
        locale === 'th'
          ? 'เริ่มจาก keyword ที่โผล่จริง, รูปแบบ block, และกลิ่นของ runtime หรือ engine ก่อน อย่าตัดสินจากป้ายหมวดหรือคำที่หน้าตาคล้ายกันเพียงคำเดียว'
          : 'Start from real keywords, block shape, and runtime or engine smell. Do not decide from a broad category or a single lookalike token.',
    }
  }

  return {
    title: locale === 'th' ? 'แนวทางอ่านข้อแบบลึกขึ้น' : 'Deep-read guide',
    body:
      locale === 'th'
        ? 'ใน hard ให้หาตัวแยกระดับลึก เช่น marker ที่อยู่คู่กัน, สำเนียงของ ecosystem, และโครงสร้างที่ตัวหลอกมักเลียนได้ไม่ครบ'
        : 'On hard, look for deeper separators such as paired markers, ecosystem-specific accents, and structures that lookalikes rarely reproduce completely.',
  }
}
