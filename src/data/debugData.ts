import { fixErrorSupportedCoreLanguageIds, fixErrorSupportedGameLanguageIds } from './fixErrorData'
import { debugFormat } from './quizFormats'
import type { DebugChoice, DebugQuestionBankItem, Difficulty, GameLanguageId, LocalizedText, QuizTrackId } from './quizModels'
import {
  assertLocalizedTextPresent,
  assertNoDuplicateSurface,
  assertStringPresent,
  assertUniqueLocalizedValues,
  assertUniqueStringValues,
  extractLogHead,
  normalizeSurface,
} from './bankValidation'

export const DEBUG_ALL_CORE_SCOPE = 'all-core'
export const DEBUG_ALL_GAME_SCOPE = 'all-game'
const DEBUG_CORE_BANK_SIZE = debugFormat.questionsPerSession + 5
const DEBUG_GAME_BANK_SIZE = debugFormat.questionsPerSession + 2

export const debugSupportedCoreLanguageIds = fixErrorSupportedCoreLanguageIds
export const debugSupportedGameLanguageIds = fixErrorSupportedGameLanguageIds
export const debugSupportedLanguageIds = [
  ...debugSupportedCoreLanguageIds,
  ...debugSupportedGameLanguageIds,
] as const

export type DebugSupportedLanguageId = (typeof debugSupportedLanguageIds)[number]

export type DebugScopeId = typeof DEBUG_ALL_CORE_SCOPE | typeof DEBUG_ALL_GAME_SCOPE | DebugSupportedLanguageId

type DebugCauseKey = 'typo' | 'null' | 'range' | 'field' | 'selector' | 'config'

type DebugQuestionSpec = {
  scenario: LocalizedText
  logText: LocalizedText
  lines: [string, string, string, string]
  snippetText: string
  cause: DebugCauseKey
  patternGroupId?: string
  choiceKeys?: [DebugCauseKey, DebugCauseKey, DebugCauseKey, DebugCauseKey]
  hint?: LocalizedText
  explanation?: LocalizedText
}

const same = (value: string): LocalizedText => ({ th: value, en: value })

const bi = (th: string, en: string): LocalizedText => ({ th, en })

const scenarioByCause: Record<DebugCauseKey, LocalizedText> = {
  typo: bi('ระบบล่มตอนเรียกฟังก์ชันช่วยจัดรูปแบบข้อความ', 'The app crashes when calling a formatter helper.'),
  null: bi('หน้า detail ล่มเมื่อข้อมูลว่างหรือยังโหลดไม่เสร็จ', 'The detail view crashes when data is empty or not loaded.'),
  range: bi('หน้ารายการล่มเมื่อเลื่อนไปท้ายลิสต์', 'The list screen crashes when scrolling to the end.'),
  field: bi('API ส่งข้อมูลไม่ครบแล้วหน้าสรุปพัง', 'The summary view breaks because the API response is missing fields.'),
  selector: bi('ปุ่มกดไม่ทำงานเพราะหา element ไม่เจอ', 'The button does not work because the element is not found.'),
  config: bi('ระบบเชื่อมต่อ service ไม่ได้เพราะตั้งค่า env ผิด', 'The service fails to connect because an env/config key is wrong.'),
}

const causeChoices: Record<DebugCauseKey, DebugChoice> = {
  typo: {
    id: 'cause-typo',
    label: bi('พิมพ์ชื่อ method/field ผิด', 'Misspelled method/field'),
    detail: bi('ชื่อที่เรียกไม่ตรงกับของจริง', 'The called name does not exist.'),
  },
  null: {
    id: 'cause-null',
    label: bi('ค่าเป็น null/undefined', 'Null/undefined value'),
    detail: bi('มีการใช้งานค่าที่เป็นค่าว่าง', 'A null/undefined value is being accessed.'),
  },
  range: {
    id: 'cause-range',
    label: bi('index เกินขอบเขต', 'Index out of range'),
    detail: bi('อ่านตำแหน่งที่ไม่มีอยู่ในลิสต์/อาเรย์', 'The code reads past the list/array bounds.'),
  },
  field: {
    id: 'cause-field',
    label: bi('response ขาด field สำคัญ', 'Missing response field'),
    detail: bi('โครงสร้างข้อมูลไม่ตรงกับที่อ่าน', 'The data shape is missing the expected field.'),
  },
  selector: {
    id: 'cause-selector',
    label: bi('selector/element ไม่พบ', 'Selector/element not found'),
    detail: bi('ค้นหา element ไม่เจอจึงได้ค่า null', 'The element lookup returns null.'),
  },
  config: {
    id: 'cause-config',
    label: bi('config/env key ไม่ตรง', 'Wrong config/env key'),
    detail: bi('อ่าน key ผิดหรือไม่ได้ตั้งค่าไว้', 'The key is misspelled or unset.'),
  },
}

const choiceSets: Record<DebugCauseKey, DebugCauseKey[]> = {
  typo: ['typo', 'null', 'range', 'selector'],
  null: ['null', 'typo', 'range', 'field'],
  range: ['range', 'null', 'typo', 'field'],
  field: ['field', 'null', 'config', 'typo'],
  selector: ['selector', 'null', 'typo', 'config'],
  config: ['config', 'field', 'null', 'typo'],
}

const hardChoiceSets: Record<DebugCauseKey, [DebugCauseKey, DebugCauseKey, DebugCauseKey, DebugCauseKey]> = {
  typo: ['typo', 'field', 'config', 'null'],
  null: ['null', 'field', 'selector', 'config'],
  range: ['range', 'null', 'field', 'typo'],
  field: ['field', 'config', 'null', 'typo'],
  selector: ['selector', 'null', 'field', 'config'],
  config: ['config', 'field', 'selector', 'null'],
}

const causeHints: Record<DebugCauseKey, LocalizedText> = {
  typo: bi('เช็กการสะกดชื่อ method/field ที่ถูกเรียก', 'Check the spelling of the called method/field.'),
  null: bi('ดูว่าค่าที่ใช้อาจเป็น null/undefined หรือไม่', 'Verify whether the accessed value could be null/undefined.'),
  range: bi('เช็ก index ที่อ่านว่าเกินขอบเขตหรือไม่', 'Check whether the index exceeds bounds.'),
  field: bi('เทียบ response กับ field ที่ถูกอ่านว่าครบหรือไม่', 'Compare the response with the fields being accessed.'),
  selector: bi('ตรวจ selector/id/class ว่าตรงกับของจริงหรือไม่', 'Verify the selector/id/class matches the real element.'),
  config: bi('ตรวจชื่อ env/config ที่ถูกอ่านว่าถูกต้องหรือไม่', 'Confirm the env/config key name is correct.'),
}

const causeExplanations: Record<DebugCauseKey, LocalizedText> = {
  typo: bi('ชื่อ method/field ถูกสะกดผิดจึงไม่มีอยู่จริงและทำให้พัง', 'The method/field name is misspelled, so it does not exist.'),
  null: bi('ค่าที่ใช้งานเป็น null/undefined จึงเกิดการพังเมื่อเรียกใช้งาน', 'A null/undefined value is accessed, causing the crash.'),
  range: bi('มีการอ่าน index ที่ไม่มีอยู่จึงทำให้พัง', 'The code reads an index that does not exist.'),
  field: bi('response ไม่มี field ที่ถูกอ่านจึงทำให้พัง', 'The response is missing the accessed field.'),
  selector: bi('หา element ไม่เจอจึงได้ค่า null แล้วพังเมื่อเรียกใช้งาน', 'The element lookup returns null and crashes when used.'),
  config: bi('อ่าน env/config key ผิดทำให้ค่าไม่ถูกโหลด', 'The wrong env/config key is read, so the value is missing.'),
}

const debugGameLanguageSet = new Set<GameLanguageId>(debugSupportedGameLanguageIds)

const getDebugTrack = (language: DebugSupportedLanguageId): QuizTrackId =>
  debugGameLanguageSet.has(language as GameLanguageId) ? 'game-dev' : 'core'

const snippetCommentByLanguage: Record<DebugSupportedLanguageId, string> = {
  python: '#',
  java: '//',
  javascript: '//',
  csharp: '//',
  cpp: '//',
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

const debugContextNotes = [
  bi('หลัง sync', 'after sync'),
  bi('ระหว่าง retry', 'during retry'),
  bi('ข้างใน handler', 'inside handler'),
  bi('หลัง cache hit', 'after cache hit'),
  bi('ระหว่าง render', 'during render'),
  bi('ตอนระบบบูต', 'while booting'),
  bi('ข้างใน callback', 'inside callback'),
  bi('หลัง reload', 'after reload'),
] as const

const debugWrapperNames = new Set(['console', 'log', 'print', 'println', 'puts', 'echo', 'System', 'fmt', 'out', 'show_debug_message'])

const toText = (value: string | LocalizedText): LocalizedText => (typeof value === 'string' ? same(value) : value)

const hintSnippet = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return '[blank line]'
  }

  return trimmed.length > 68 ? `${trimmed.slice(0, 65)}...` : trimmed
}

const getQuotedValue = (value: string) => {
  const singleQuoted = value.match(/'([^']+)'/)
  if (singleQuoted?.[1]) {
    return singleQuoted[1]
  }

  const doubleQuoted = value.match(/"([^"]+)"/)
  if (doubleQuoted?.[1]) {
    return doubleQuoted[1]
  }

  return null
}

const extractTypoToken = (line: string, logText: LocalizedText) => {
  const memberCalls = [...line.matchAll(/[.:]([A-Za-z_][\w]*)\s*\(/g)]
    .map((match) => match[1])
    .filter((token) => !debugWrapperNames.has(token))
  if (memberCalls.length > 0) {
    return memberCalls.at(-1) ?? null
  }

  const bareCalls = [...line.matchAll(/\b([A-Za-z_][\w-]*)\s*\(/g)]
    .map((match) => match[1])
    .filter((token) => !debugWrapperNames.has(token))
  if (bareCalls.length > 0) {
    return bareCalls.at(-1) ?? null
  }

  const commandToken = line.trim().match(/^([A-Za-z_][\w-]*)\b/)?.[1]
  if (commandToken && !debugWrapperNames.has(commandToken)) {
    return commandToken
  }

  const quotedLogTokens = [...logText.en.matchAll(/['`"]([^'"`]+)['`"]/g)]
    .map((match) => match[1])
    .filter((token) => /^[A-Za-z_][\w-]*$/.test(token) && !debugWrapperNames.has(token))

  return quotedLogTokens.at(-1) ?? null
}

const extractReceiverName = (line: string) => {
  const memberReceivers = [...line.matchAll(/\b([A-Za-z_][\w]*)\.[A-Za-z_][\w]*/g)].map((match) => match[1])
  const colonReceivers = [...line.matchAll(/\b([A-Za-z_][\w]*):[A-Za-z_][\w]*/g)].map((match) => match[1])
  const indexedReceivers = [...line.matchAll(/\b([A-Za-z_][\w]*)\[[^\]]+\]/g)].map((match) => match[1])
  const candidates = [...memberReceivers, ...colonReceivers, ...indexedReceivers]
  const meaningfulReceiver = [...candidates].reverse().find((receiver) => !debugWrapperNames.has(receiver))

  if (meaningfulReceiver) {
    return meaningfulReceiver
  }

  return candidates.at(-1) ?? null
}

const extractRangeAccess = (line: string) => {
  const match = line.match(/\b([A-Za-z_][\w]*)\[([^\]]+)\]/)

  return match?.[1] && match?.[2]
    ? {
        collection: match[1],
        index: match[2],
      }
    : null
}

const extractPropertyPath = (line: string) => {
  const propertyPaths = [...line.matchAll(/\b([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)+)\b/g)]
    .map((match) => match[1])
    .filter((path) => !path.startsWith('console.') && !path.startsWith('System.out.') && !path.startsWith('fmt.') && !path.startsWith('std.'))

  return propertyPaths.sort((left, right) => right.length - left.length)[0] ?? null
}

const extractConfigKey = (line: string, logText: LocalizedText) => {
  const quotedValue = getQuotedValue(line) ?? getQuotedValue(logText.en) ?? getQuotedValue(logText.th)
  if (quotedValue) {
    return quotedValue
  }

  const envLikeToken = line.match(/\b[A-Z][A-Z0-9_]+\b/)
  return envLikeToken?.[0] ?? null
}

const getDebugFocusLine = (item: DebugQuestionSpec) => {
  if (item.cause === 'range') {
    return item.lines.find((line) => /\[[^\]]+\]/.test(line)) ?? item.lines[2] ?? item.lines[1]
  }

  if (item.cause === 'selector' || item.cause === 'config') {
    return item.lines[0] || item.lines[1]
  }

  return item.lines[1] || item.lines[0]
}

const createDebugSpecificHint = (item: DebugQuestionSpec): LocalizedText => {
  const focusLine = getDebugFocusLine(item)
  const focusSnippet = hintSnippet(focusLine)

  switch (item.cause) {
    case 'typo': {
      const typoToken = extractTypoToken(focusLine, item.logText)

      return typoToken
        ? bi(
            `ดูชื่อที่ถูกเรียกอย่าง \`${typoToken}\` ในบรรทัด \`${focusSnippet}\` ว่าสะกดตรงกับของจริงไหม`,
            `Check whether the called name \`${typoToken}\` in \`${focusSnippet}\` is spelled exactly like the real API/member.`,
          )
        : bi(
            `เทียบข้อความ error กับบรรทัด \`${focusSnippet}\` ว่ามีชื่อไหนสะกดผิด`,
            `Compare the error text with \`${focusSnippet}\` and look for the misspelled name.`,
          )
    }
    case 'null': {
      const receiver = extractReceiverName(item.lines[1]) ?? extractReceiverName(focusLine)

      return receiver
        ? bi(
            `ไล่ค่าของ \`${receiver}\` จากบรรทัด \`${focusSnippet}\` ย้อนกลับไป ว่ามันยังเป็นค่าว่างก่อนถูกอ่านหรือไม่`,
            `Trace \`${receiver}\` backward from \`${focusSnippet}\` and verify it is not still null/undefined before access.`,
          )
        : bi(
            `ดูว่าค่าที่ถูกอ่านใน \`${focusSnippet}\` ถูกตั้งมาก่อนหรือยัง`,
            `Check whether the value accessed in \`${focusSnippet}\` was ever initialized first.`,
          )
    }
    case 'range': {
      const rangeAccess = extractRangeAccess(focusLine)

      return rangeAccess
        ? bi(
            `เทียบ index \`${rangeAccess.index}\` กับจำนวนสมาชิกของ \`${rangeAccess.collection}\` ในบรรทัด \`${focusSnippet}\` ก่อน`,
            `Compare index \`${rangeAccess.index}\` against the size of \`${rangeAccess.collection}\` in \`${focusSnippet}\` first.`,
          )
        : bi(
            `ดูบรรทัด \`${focusSnippet}\` ว่ามีการอ่านตำแหน่งเกินขอบเขตหรือไม่`,
            `Inspect \`${focusSnippet}\` for an access that goes past the available bounds.`,
          )
    }
    case 'field': {
      const propertyPath = extractPropertyPath(focusLine)

      return propertyPath
        ? bi(
            `เช็ก path \`${propertyPath}\` ในบรรทัด \`${focusSnippet}\` ว่ามี field นี้ครบจริงใน response หรือไม่`,
            `Check whether the response really contains the path \`${propertyPath}\` used in \`${focusSnippet}\`.`,
          )
        : bi(
            `เทียบ response ที่คาดหวังกับบรรทัด \`${focusSnippet}\` ว่ากำลังอ่าน field ไหนอยู่`,
            `Compare the expected response shape with \`${focusSnippet}\` to see which field path is being read.`,
          )
    }
    case 'selector': {
      const selectorValue = getQuotedValue(item.lines[0]) ?? getQuotedValue(focusLine)

      return selectorValue
        ? bi(
            `เริ่มจาก selector/id \`${selectorValue}\` ในบรรทัด \`${focusSnippet}\` ว่าตรงกับของจริงหรือไม่`,
            `Start with selector/id \`${selectorValue}\` in \`${focusSnippet}\` and verify it matches a real element.`,
          )
        : bi(
            `อย่าดูแต่บรรทัดที่ใช้ element ให้ย้อนกลับไปเช็กบรรทัด \`${focusSnippet}\` ที่ค้นหา element ก่อน`,
            `Do not stop at the usage line. Go back to \`${focusSnippet}\`, the line that tries to find the element first.`,
          )
    }
    case 'config': {
      const configKey = extractConfigKey(item.lines[0], item.logText)

      return configKey
        ? bi(
            `เทียบชื่อ env/config key \`${configKey}\` ในบรรทัด \`${focusSnippet}\` กับ key ที่ระบบคาดหวังจาก log`,
            `Compare env/config key \`${configKey}\` in \`${focusSnippet}\` with the key the log says the system expects.`,
          )
        : bi(
            `ดูบรรทัดอ่าน config \`${focusSnippet}\` ก่อนบรรทัดสร้าง client ว่าชื่อ key ตรงกันหรือไม่`,
            `Inspect the config-read line \`${focusSnippet}\` before client creation and verify the key names match.`,
          )
    }
  }
}

const createDebugQuestionHint = (item: DebugQuestionSpec, difficulty: Difficulty): LocalizedText => {
  const baseHint = item.hint ?? causeHints[item.cause]
  const specificHint = createDebugSpecificHint(item)

  return difficulty === 'hard'
    ? bi(
        `${baseHint.th} ${specificHint.th} ในข้อนี้ log มีไว้ล่อให้โฟกัสอาการปลายทางก่อน`,
        `${baseHint.en} ${specificHint.en} In this hard variant, the log is trying to pull you toward the downstream symptom first.`,
      )
    : bi(
        `${baseHint.th} ${specificHint.th}`,
        `${baseHint.en} ${specificHint.en}`,
      )
}

const makeSpec = (
  cause: DebugCauseKey,
  logText: string | LocalizedText,
  lines: [string, string, string, string],
  scenario: LocalizedText = scenarioByCause[cause],
): DebugQuestionSpec => ({
  scenario,
  logText: toText(logText),
  lines,
  snippetText: lines.join('\n'),
  cause,
})

const createDebugVariant = (
  language: DebugSupportedLanguageId,
  item: DebugQuestionSpec,
  variantIndex: number,
): DebugQuestionSpec => ({
  ...item,
  scenario: bi(
    `${item.scenario.th} โดยอาการจะโผล่${debugContextNotes[variantIndex % debugContextNotes.length].th}`,
    `${item.scenario.en} The symptom shows up ${debugContextNotes[variantIndex % debugContextNotes.length].en}.`,
  ),
  logText: bi(
    `runtime note ${variantIndex + 2}: ${item.logText.th}`,
    `runtime note ${variantIndex + 2}: ${item.logText.en}`,
  ),
  snippetText: `${snippetCommentByLanguage[language]} ${debugContextNotes[variantIndex % debugContextNotes.length].en}\n${item.snippetText}`,
})

const createHardDebugSpec = (
  language: DebugSupportedLanguageId,
  item: DebugQuestionSpec,
  variantIndex: number,
): DebugQuestionSpec => ({
  ...item,
  choiceKeys: hardChoiceSets[item.cause],
  scenario: bi(
    `${item.scenario.th} แต่อาการจะโผล่ตอน flow ช่วงท้ายมากกว่าเดิม`,
    `${item.scenario.en} The symptom only becomes obvious later in the flow.`,
  ),
  logText: bi(
    `late-trace ${variantIndex + 1}: ${item.logText.th}`,
    `late-trace ${variantIndex + 1}: ${item.logText.en}`,
  ),
  snippetText: `${snippetCommentByLanguage[language]} downstream-pass-${variantIndex + 1}\n${item.snippetText}`,
  explanation: bi(
    `${causeExplanations[item.cause].th} จุดยากคือ log หลอกให้โฟกัสอาการปลายทางก่อน`,
    `${causeExplanations[item.cause].en} The harder part is that the log tries to pull your attention toward the downstream symptom first.`,
  ),
})

const getSupplementalDebugSpecs = (language: DebugSupportedLanguageId): DebugQuestionSpec[] => {
  switch (language) {
    case 'python':
    case 'renpy-python':
      return buildPythonStyleSupplementalDebugSpecs()
    case 'javascript':
    case 'jsx':
    case 'typescript':
    case 'cloud-functions':
    case 'phaser-typescript':
    case 'rpg-maker-js':
    case 'cocos-typescript':
      return buildJsStyleSupplementalDebugSpecs(language)
    case 'roblox-lua':
    case 'love2d-lua':
    case 'defold-lua':
    case 'godot-gdscript':
    case 'gamemaker-gml':
      return buildLuaStyleSupplementalDebugSpecs(language)
    default:
      return buildTypedStyleSupplementalDebugSpecs(language)
  }
}

const createQuestion = (
  language: DebugSupportedLanguageId,
  itemIndex: number,
  item: DebugQuestionSpec,
  difficulty: Difficulty,
): DebugQuestionBankItem => {
  const choiceKeys = item.choiceKeys ?? (choiceSets[item.cause] as [DebugCauseKey, DebugCauseKey, DebugCauseKey, DebugCauseKey])
  const choices = choiceKeys.map((key) => causeChoices[key]) as [
    DebugChoice,
    DebugChoice,
    DebugChoice,
    DebugChoice,
  ]

  return {
    id: `debug-${language}-${itemIndex + 1}`,
    format: 'debug',
    track: getDebugTrack(language),
    language,
    difficulty,
    patternGroupId:
      item.patternGroupId ??
      `${language}::${item.cause}::${normalizeSurface(extractLogHead(item.logText.en) || item.logText.en)}::${normalizeSurface(getDebugFocusLine(item))}`.slice(
        0,
        240,
      ),
    scenario: item.scenario,
    logText: item.logText,
    snippetText: item.snippetText,
    choices,
    answer: causeChoices[item.cause].id,
    hint: createDebugQuestionHint(item, difficulty),
    explanation: {
      correct: item.explanation ?? causeExplanations[item.cause],
    },
  }
}

const createDifficultyBank = (
  language: DebugSupportedLanguageId,
  items: DebugQuestionSpec[],
  difficulty: Difficulty,
) => {
  const targetSize = getDebugTrack(language) === 'game-dev' ? DEBUG_GAME_BANK_SIZE : DEBUG_CORE_BANK_SIZE
  const sourceItems = [...items, ...getSupplementalDebugSpecs(language)]
  const expandedItems =
    difficulty === 'hard'
      ? (() => {
          const hardBaseItems = sourceItems.map((item, index) => createHardDebugSpec(language, item, index))
          return hardBaseItems.length >= targetSize
            ? hardBaseItems.slice(0, targetSize)
            : [
                ...hardBaseItems,
                ...Array.from({ length: targetSize - hardBaseItems.length }, (_, index) =>
                  createHardDebugSpec(language, sourceItems[index % sourceItems.length], index + sourceItems.length),
                ),
              ]
        })()
      : sourceItems.length >= targetSize
        ? sourceItems.slice(0, targetSize)
        : [
            ...sourceItems,
            ...Array.from({ length: targetSize - sourceItems.length }, (_, index) =>
              createDebugVariant(language, sourceItems[index % sourceItems.length], index),
            ),
          ]

  if (expandedItems.length !== targetSize) {
    throw new Error(`Expected ${targetSize} ${difficulty} debug items for ${language} but received ${expandedItems.length}.`)
  }

  return expandedItems.map((item, index) => createQuestion(language, index, item, difficulty))
}

const createBank = (language: DebugSupportedLanguageId, items: DebugQuestionSpec[]) => {
  const easy = createDifficultyBank(language, items, 'easy')
  return {
    easy,
    hard: createDifficultyBank(language, items, 'hard'),
  } as const satisfies Record<Difficulty, DebugQuestionBankItem[]>
}

const createJsLikeDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'const text = "hello"', call: 'console.log(text.trimm())', log: 'TypeError: text.trimm is not a function' },
    { setup: 'const names = ["Ada", "Lin"]', call: 'console.log(names.jion(","))', log: 'TypeError: names.jion is not a function' },
    { setup: 'const data = { id: 2 }', call: 'console.log(data.keyz())', log: 'TypeError: data.keyz is not a function' },
  ] as const

  const undefinedAccess = [
    { setup: 'const user = undefined', call: 'console.log(user.name)', log: "TypeError: Cannot read properties of undefined (reading 'name')" },
    { setup: 'const profile = undefined', call: 'console.log(profile.email)', log: "TypeError: Cannot read properties of undefined (reading 'email')" },
    { setup: 'const item = undefined', call: 'console.log(item.id)', log: "TypeError: Cannot read properties of undefined (reading 'id')" },
  ] as const

  const outOfRange = [
    { setup: 'const scores = [10, 20, 30]', call: 'console.log(scores[3].toFixed(0))', log: 'TypeError: Cannot read properties of undefined' },
    { setup: 'const names = ["Ada", "Lin"]', call: 'console.log(names[2].toUpperCase())', log: 'TypeError: Cannot read properties of undefined' },
    { setup: 'const flags = [true, false]', call: 'console.log(flags[5].valueOf())', log: 'TypeError: Cannot read properties of undefined' },
  ] as const

  const backendCrashes = [
    {
      setup: 'const payload = await fetchReport()',
      call: 'const total = payload.summary.total',
      log: "TypeError: Cannot read properties of undefined (reading 'summary')",
      cause: 'field',
    },
    {
      setup: 'const apiKey = process.env.API_KEy',
      call: 'const client = createClient(apiKey)',
      log: 'Error: API_KEY is missing',
      cause: 'config',
    },
    {
      setup: 'const data = await fetchUser()',
      call: 'const role = data.profile.role',
      log: "TypeError: Cannot read properties of undefined (reading 'profile')",
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'const button = document.querySelector(".btn-primmary")',
      call: 'button.addEventListener("click", handleSave)',
      log: "TypeError: Cannot read properties of null (reading 'addEventListener')",
    },
    {
      setup: 'const submit = document.getElementById("submt")',
      call: 'submit.classList.add("active")',
      log: "TypeError: Cannot read properties of null (reading 'classList')",
    },
    {
      setup: 'const card = document.querySelector("[data-role=\'cardd\']")',
      call: 'card.style.opacity = "1"',
      log: "TypeError: Cannot read properties of null (reading 'style')",
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) =>
      makeSpec('typo', log, [setup, call, 'console.log("ok")', 'console.log("done")']),
    ),
    ...undefinedAccess.map(({ setup, call, log }) =>
      makeSpec('null', log, [setup, call, 'console.log("fallback")', 'console.log("done")']),
    ),
    ...outOfRange.map(({ setup, call, log }) =>
      makeSpec('range', log, [setup, 'console.log("range check")', call, 'console.log("done")']),
    ),
    ...backendCrashes.map(({ setup, call, log, cause }) =>
      makeSpec(cause, log, [setup, call, 'console.log("report")', 'return total']),
    ),
    ...uiSelectors.map(({ setup, call, log }) =>
      makeSpec('selector', log, [setup, call, 'console.log("ready")', 'console.log("done")']),
    ),
  ]

  return createBank(language, items)
}

const createPythonDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'text = "hello"', call: 'print(text.upcase())', log: "AttributeError: 'str' object has no attribute 'upcase'" },
    { setup: 'names = ["Ada", "Lin"]', call: 'print(names.jion(","))', log: "AttributeError: 'list' object has no attribute 'jion'" },
    { setup: 'data = {"id": 2}', call: 'print(data.keyz())', log: "AttributeError: 'dict' object has no attribute 'keyz'" },
  ] as const

  const noneAccess = [
    { setup: 'profile = None', call: 'print(profile.get("name"))', log: "AttributeError: 'NoneType' object has no attribute 'get'" },
    { setup: 'items = None', call: 'print(items.append("x"))', log: "AttributeError: 'NoneType' object has no attribute 'append'" },
    { setup: 'user = None', call: 'print(user["id"])', log: "TypeError: 'NoneType' object is not subscriptable" },
  ] as const

  const outOfRange = [
    { setup: 'scores = [10, 20, 30]', call: 'print(scores[3])', log: 'IndexError: list index out of range' },
    { setup: 'names = ["Ada", "Lin"]', call: 'print(names[2].upper())', log: 'IndexError: list index out of range' },
    { setup: 'flags = [True, False]', call: 'print(flags[5])', log: 'IndexError: list index out of range' },
  ] as const

  const backendCrashes = [
    {
      setup: 'payload = fetch_report()',
      call: 'total = payload["summary"]["total"]',
      log: "KeyError: 'summary'",
      cause: 'field',
    },
    {
      setup: 'api_key = os.environ["API_KEy"]',
      call: 'client = build_client(api_key)',
      log: "KeyError: 'API_KEy'",
      cause: 'config',
    },
    {
      setup: 'data = fetch_user()',
      call: 'role = data["profile"]["role"]',
      log: "KeyError: 'profile'",
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'button = soup.select_one(".btn-primmary")',
      call: 'button["class"].append("active")',
      log: "TypeError: 'NoneType' object is not subscriptable",
    },
    {
      setup: 'title = soup.select_one("#titel")',
      call: 'print(title.text.strip())',
      log: "AttributeError: 'NoneType' object has no attribute 'text'",
    },
    {
      setup: 'card = soup.select_one("[data-role="cardd"]")',
      call: 'print(card.get("data-id"))',
      log: "AttributeError: 'NoneType' object has no attribute 'get'",
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'print("ok")', 'print("done")'])),
    ...noneAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'print("fallback")', 'print("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'print("range check")', call, 'print("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'print("report")', 'print(total)'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'print("ready")', 'print("done")'])),
  ]

  return createBank(language, items)
}

const createJavaDebugBank = () => {
  const methodTypos = [
    { setup: 'String text = "hello";', call: 'System.out.println(text.trimm());', log: 'cannot find symbol: method trimm()' },
    { setup: 'List<String> names = List.of("Ada", "Lin");', call: 'System.out.println(names.szie());', log: 'cannot find symbol: method szie()' },
    { setup: 'String code = "abc";', call: 'System.out.println(code.toUppercase());', log: 'cannot find symbol: method toUppercase()' },
  ] as const

  const nullAccess = [
    { setup: 'String title = null;', call: 'System.out.println(title.length());', log: 'NullPointerException' },
    { setup: 'String city = null;', call: 'System.out.println(city.toUpperCase());', log: 'NullPointerException' },
    { setup: 'String email = null;', call: 'System.out.println(email.trim());', log: 'NullPointerException' },
  ] as const

  const outOfRange = [
    { setup: 'List<Integer> scores = List.of(10, 20, 30);', call: 'System.out.println(scores.get(3));', log: 'IndexOutOfBoundsException: Index 3 out of bounds' },
    { setup: 'List<String> names = List.of("Ada", "Lin");', call: 'System.out.println(names.get(2).toUpperCase());', log: 'IndexOutOfBoundsException: Index 2 out of bounds' },
    { setup: 'List<Boolean> flags = List.of(true, false);', call: 'System.out.println(flags.get(5));', log: 'IndexOutOfBoundsException: Index 5 out of bounds' },
  ] as const

  const backendCrashes = [
    {
      setup: 'JSONObject payload = fetchReport();',
      call: 'int total = payload.getJSONObject("summary").getInt("total");',
      log: 'JSONException: JSONObject["summary"] not found',
      cause: 'field',
    },
    {
      setup: 'String apiKey = System.getenv("API_KEy");',
      call: 'Client client = buildClient(apiKey);',
      log: 'IllegalStateException: API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'JSONObject data = fetchUser();',
      call: 'String role = data.getJSONObject("profile").getString("role");',
      log: 'JSONException: JSONObject["profile"] not found',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'Button button = findViewById(R.id.btn_primmary);',
      call: 'button.setOnClickListener(this::handleSave);',
      log: 'NullPointerException: button is null',
    },
    {
      setup: 'TextView title = findViewById(R.id.titel);',
      call: 'title.setText(userName);',
      log: 'NullPointerException: title is null',
    },
    {
      setup: 'View card = findViewById(R.id.cardd);',
      call: 'card.setAlpha(1f);',
      log: 'NullPointerException: card is null',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'System.out.println("ok");', 'System.out.println("done");'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'System.out.println("fallback");', 'System.out.println("done");'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'System.out.println("range check");', call, 'System.out.println("done");'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'System.out.println("report");', 'System.out.println(total);'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'System.out.println("ready");', 'System.out.println("done");'])),
  ]

  return createBank('java', items)
}

const createCsharpDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'var text = "hello";', call: 'Console.WriteLine(text.Trimm());', log: "'string' does not contain a definition for 'Trimm'" },
    { setup: 'var names = new[] { "Ada", "Lin" };', call: 'Console.WriteLine(names.Cout());', log: "'string[]' does not contain a definition for 'Cout'" },
    { setup: 'var user = new { Name = "Ada" };', call: 'Console.WriteLine(user.ToJsonn());', log: "does not contain a definition for 'ToJsonn'" },
  ] as const

  const nullAccess = [
    { setup: 'User user = null;', call: 'Console.WriteLine(user.Name);', log: 'NullReferenceException: Object reference not set to an instance of an object.' },
    { setup: 'Profile profile = null;', call: 'Console.WriteLine(profile.Email);', log: 'NullReferenceException: Object reference not set to an instance of an object.' },
    { setup: 'Item item = null;', call: 'Console.WriteLine(item.Id);', log: 'NullReferenceException: Object reference not set to an instance of an object.' },
  ] as const

  const outOfRange = [
    { setup: 'var scores = new[] { 10, 20, 30 };', call: 'Console.WriteLine(scores[5]);', log: 'IndexOutOfRangeException: Index was outside the bounds of the array.' },
    { setup: 'var names = new[] { "Ada", "Lin" };', call: 'Console.WriteLine(names[2].ToUpper());', log: 'IndexOutOfRangeException: Index was outside the bounds of the array.' },
    { setup: 'var flags = new[] { true, false };', call: 'Console.WriteLine(flags[3]);', log: 'IndexOutOfRangeException: Index was outside the bounds of the array.' },
  ] as const

  const backendCrashes = [
    {
      setup: 'var payload = await FetchReport();',
      call: 'var total = payload.Summary.Total;',
      log: 'NullReferenceException: Summary is null',
      cause: 'field',
    },
    {
      setup: 'var apiKey = Environment.GetEnvironmentVariable("API_KEy");',
      call: 'var client = BuildClient(apiKey);',
      log: 'InvalidOperationException: API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'var data = await FetchUser();',
      call: 'var role = data.Profile.Role;',
      log: 'NullReferenceException: Profile is null',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'var button = FindName("btn_primmary") as Button;',
      call: 'button.Click += HandleSave;',
      log: 'NullReferenceException: button is null',
    },
    {
      setup: 'var title = FindName("titel") as TextBlock;',
      call: 'title.Text = userName;',
      log: 'NullReferenceException: title is null',
    },
    {
      setup: 'var card = FindName("cardd") as Border;',
      call: 'card.Opacity = 1;',
      log: 'NullReferenceException: card is null',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'Console.WriteLine("ok");', 'Console.WriteLine("done");'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'Console.WriteLine("fallback");', 'Console.WriteLine("done");'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'Console.WriteLine("range check");', call, 'Console.WriteLine("done");'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'Console.WriteLine("report");', 'Console.WriteLine(total);'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'Console.WriteLine("ready");', 'Console.WriteLine("done");'])),
  ]

  return createBank(language, items)
}

const createCppDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'std::string text = "hello";', call: 'std::cout << text.trimm() << std::endl;', log: "no member named 'trimm' in 'std::string'" },
    { setup: 'std::vector<int> scores = {10, 20, 30};', call: 'std::cout << scores.puhs_back(40) << std::endl;', log: "no member named 'puhs_back' in 'std::vector<int>'" },
    { setup: 'std::string code = "abc";', call: 'std::cout << code.toUpper() << std::endl;', log: "no member named 'toUpper' in 'std::string'" },
  ] as const

  const nullAccess = [
    { setup: 'User* user = nullptr;', call: 'std::cout << user->name << std::endl;', log: 'Segmentation fault (null pointer dereference)' },
    { setup: 'Profile* profile = nullptr;', call: 'std::cout << profile->email << std::endl;', log: 'Segmentation fault (null pointer dereference)' },
    { setup: 'Item* item = nullptr;', call: 'std::cout << item->id << std::endl;', log: 'Segmentation fault (null pointer dereference)' },
  ] as const

  const outOfRange = [
    { setup: 'std::vector<int> scores = {10, 20, 30};', call: 'std::cout << scores.at(5) << std::endl;', log: 'std::out_of_range: vector::_M_range_check' },
    { setup: 'std::vector<std::string> names = {"Ada", "Lin"};', call: 'std::cout << names.at(2) << std::endl;', log: 'std::out_of_range: vector::_M_range_check' },
    { setup: 'std::vector<bool> flags = {true, false};', call: 'std::cout << flags.at(3) << std::endl;', log: 'std::out_of_range: vector::_M_range_check' },
  ] as const

  const backendCrashes = [
    {
      setup: 'auto payload = fetchReport();',
      call: 'auto total = payload["summary"]["total"].get<int>();',
      log: 'json.exception.out_of_range: key "summary" not found',
      cause: 'field',
    },
    {
      setup: 'auto apiKey = std::getenv("API_KEy");',
      call: 'auto client = buildClient(apiKey);',
      log: 'API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'auto data = fetchUser();',
      call: 'auto role = data["profile"]["role"].get<std::string>();',
      log: 'json.exception.out_of_range: key "profile" not found',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'auto button = ui->Find("btn-primmary");',
      call: 'button->OnClick(handleSave);',
      log: 'Segmentation fault: button is null',
    },
    {
      setup: 'auto title = ui->Find("titel");',
      call: 'title->SetText(userName);',
      log: 'Segmentation fault: title is null',
    },
    {
      setup: 'auto card = ui->Find("cardd");',
      call: 'card->SetOpacity(1.0f);',
      log: 'Segmentation fault: card is null',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'std::cout << "ok" << std::endl;', 'std::cout << "done" << std::endl;'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'std::cout << "fallback" << std::endl;', 'std::cout << "done" << std::endl;'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'std::cout << "range check" << std::endl;', call, 'std::cout << "done" << std::endl;'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'std::cout << "report" << std::endl;', 'std::cout << total << std::endl;'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'std::cout << "ready" << std::endl;', 'std::cout << "done" << std::endl;'])),
  ]

  return createBank(language, items)
}

const createDartDebugBank = () => {
  const methodTypos = [
    { setup: 'final text = "hello";', call: 'print(text.trimm());', log: "The method 'trimm' isn't defined for the type 'String'." },
    { setup: 'final names = ["Ada", "Lin"];', call: 'print(names.jion(","));', log: "The method 'jion' isn't defined for the type 'List<String>'." },
    { setup: 'final code = "abc";', call: 'print(code.toUpper());', log: "The method 'toUpper' isn't defined for the type 'String'." },
  ] as const

  const nullAccess = [
    { setup: 'User? user = null;', call: 'print(user!.name);', log: 'Null check operator used on a null value' },
    { setup: 'Profile? profile = null;', call: 'print(profile!.email);', log: 'Null check operator used on a null value' },
    { setup: 'Item? item = null;', call: 'print(item!.id);', log: 'Null check operator used on a null value' },
  ] as const

  const outOfRange = [
    { setup: 'final scores = [10, 20, 30];', call: 'print(scores[5]);', log: 'RangeError (index): Invalid value: Not in range' },
    { setup: 'final names = ["Ada", "Lin"];', call: 'print(names[2].toUpperCase());', log: 'RangeError (index): Invalid value: Not in range' },
    { setup: 'final flags = [true, false];', call: 'print(flags[3]);', log: 'RangeError (index): Invalid value: Not in range' },
  ] as const

  const backendCrashes = [
    {
      setup: 'final payload = await fetchReport();',
      call: 'final total = payload["summary"]["total"];',
      log: "NoSuchMethodError: The getter '[]' was called on null",
      cause: 'field',
    },
    {
      setup: 'const apiKey = String.fromEnvironment("API_KEy");',
      call: 'final client = buildClient(apiKey);',
      log: 'Missing environment variable: API_KEY',
      cause: 'config',
    },
    {
      setup: 'final data = await fetchUser();',
      call: 'final role = data["profile"]["role"];',
      log: "NoSuchMethodError: The getter '[]' was called on null",
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'final button = widgetMap["btn-primmary"];',
      call: 'button!.onPressed!();',
      log: 'Null check operator used on a null value',
    },
    {
      setup: 'final title = widgetMap["titel"];',
      call: 'title!.setText(userName);',
      log: 'Null check operator used on a null value',
    },
    {
      setup: 'final card = widgetMap["cardd"];',
      call: 'card!.setOpacity(1);',
      log: 'Null check operator used on a null value',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'print("ok");', 'print("done");'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'print("fallback");', 'print("done");'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'print("range check");', call, 'print("done");'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'print("report");', 'print(total);'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'print("ready");', 'print("done");'])),
  ]

  return createBank('dart', items)
}

const createGoDebugBank = () => {
  const methodTypos = [
    { setup: 'text := "hello"', call: 'fmt.Println(text.Trimm())', log: 'text.Trimm undefined (type string has no field or method Trimm)' },
    { setup: 'names := []string{"Ada", "Lin"}', call: 'fmt.Println(names.Jion(","))', log: 'names.Jion undefined (type []string has no field or method Jion)' },
    { setup: 'code := "abc"', call: 'fmt.Println(code.ToUpper())', log: 'code.ToUpper undefined (type string has no field or method ToUpper)' },
  ] as const

  const nullAccess = [
    { setup: 'var user *User = nil', call: 'fmt.Println(user.Name)', log: 'panic: runtime error: invalid memory address or nil pointer dereference' },
    { setup: 'var profile *Profile = nil', call: 'fmt.Println(profile.Email)', log: 'panic: runtime error: invalid memory address or nil pointer dereference' },
    { setup: 'var item *Item = nil', call: 'fmt.Println(item.Id)', log: 'panic: runtime error: invalid memory address or nil pointer dereference' },
  ] as const

  const outOfRange = [
    { setup: 'scores := []int{10, 20, 30}', call: 'fmt.Println(scores[5])', log: 'panic: runtime error: index out of range' },
    { setup: 'names := []string{"Ada", "Lin"}', call: 'fmt.Println(names[2])', log: 'panic: runtime error: index out of range' },
    { setup: 'flags := []bool{true, false}', call: 'fmt.Println(flags[3])', log: 'panic: runtime error: index out of range' },
  ] as const

  const backendCrashes = [
    {
      setup: 'payload := fetchReport()',
      call: 'total := payload["summary"].(map[string]any)["total"].(int)',
      log: 'panic: interface conversion: nil is not map',
      cause: 'field',
    },
    {
      setup: 'apiKey := os.Getenv("API_KEy")',
      call: 'client := buildClient(apiKey)',
      log: 'panic: API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'data := fetchUser()',
      call: 'role := data["profile"].(map[string]any)["role"].(string)',
      log: 'panic: interface conversion: nil is not map',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'button := ui.Find("btn-primmary")',
      call: 'button.OnClick(handleSave)',
      log: 'panic: runtime error: invalid memory address or nil pointer dereference',
    },
    {
      setup: 'title := ui.Find("titel")',
      call: 'title.SetText(userName)',
      log: 'panic: runtime error: invalid memory address or nil pointer dereference',
    },
    {
      setup: 'card := ui.Find("cardd")',
      call: 'card.SetOpacity(1)',
      log: 'panic: runtime error: invalid memory address or nil pointer dereference',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'fmt.Println("ok")', 'fmt.Println("done")'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'fmt.Println("fallback")', 'fmt.Println("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'fmt.Println("range check")', call, 'fmt.Println("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'fmt.Println("report")', 'fmt.Println(total)'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'fmt.Println("ready")', 'fmt.Println("done")'])),
  ]

  return createBank('go', items)
}

const createKotlinDebugBank = () => {
  const methodTypos = [
    { setup: 'val text = "hello"', call: 'println(text.trimm())', log: 'Unresolved reference: trimm' },
    { setup: 'val names = listOf("Ada", "Lin")', call: 'println(names.jionToString(","))', log: 'Unresolved reference: jionToString' },
    { setup: 'val code = "abc"', call: 'println(code.toUpper())', log: 'Unresolved reference: toUpper' },
  ] as const

  const nullAccess = [
    { setup: 'val user: User? = null', call: 'println(user!!.name)', log: 'KotlinNullPointerException' },
    { setup: 'val profile: Profile? = null', call: 'println(profile!!.email)', log: 'KotlinNullPointerException' },
    { setup: 'val item: Item? = null', call: 'println(item!!.id)', log: 'KotlinNullPointerException' },
  ] as const

  const outOfRange = [
    { setup: 'val scores = listOf(10, 20, 30)', call: 'println(scores[5])', log: 'IndexOutOfBoundsException: Index 5 out of bounds' },
    { setup: 'val names = listOf("Ada", "Lin")', call: 'println(names[2])', log: 'IndexOutOfBoundsException: Index 2 out of bounds' },
    { setup: 'val flags = listOf(true, false)', call: 'println(flags[3])', log: 'IndexOutOfBoundsException: Index 3 out of bounds' },
  ] as const

  const backendCrashes = [
    {
      setup: 'val payload = fetchReport()',
      call: 'val total = payload["summary"]!!["total"]',
      log: 'KotlinNullPointerException',
      cause: 'field',
    },
    {
      setup: 'val apiKey = System.getenv("API_KEy")',
      call: 'val client = buildClient(apiKey)',
      log: 'IllegalStateException: API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'val data = fetchUser()',
      call: 'val role = data["profile"]!!["role"]',
      log: 'KotlinNullPointerException',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'val button = findViewById<Button>(R.id.btn_primmary)',
      call: 'button.setOnClickListener { handleSave() }',
      log: 'NullPointerException: button is null',
    },
    {
      setup: 'val title = findViewById<TextView>(R.id.titel)',
      call: 'title.text = userName',
      log: 'NullPointerException: title is null',
    },
    {
      setup: 'val card = findViewById<View>(R.id.cardd)',
      call: 'card.alpha = 1f',
      log: 'NullPointerException: card is null',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'println("ok")', 'println("done")'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'println("fallback")', 'println("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'println("range check")', call, 'println("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'println("report")', 'println(total)'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'println("ready")', 'println("done")'])),
  ]

  return createBank('kotlin', items)
}

const createSwiftDebugBank = () => {
  const methodTypos = [
    { setup: 'let text = "hello"', call: 'print(text.trimm())', log: "value of type 'String' has no member 'trimm'" },
    { setup: 'let names = ["Ada", "Lin"]', call: 'print(names.jion(separator: ","))', log: "value of type '[String]' has no member 'jion'" },
    { setup: 'let code = "abc"', call: 'print(code.toUpper())', log: "value of type 'String' has no member 'toUpper'" },
  ] as const

  const nullAccess = [
    { setup: 'let user: User? = nil', call: 'print(user!.name)', log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value' },
    { setup: 'let profile: Profile? = nil', call: 'print(profile!.email)', log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value' },
    { setup: 'let item: Item? = nil', call: 'print(item!.id)', log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value' },
  ] as const

  const outOfRange = [
    { setup: 'let scores = [10, 20, 30]', call: 'print(scores[5])', log: 'Fatal error: Index out of range' },
    { setup: 'let names = ["Ada", "Lin"]', call: 'print(names[2])', log: 'Fatal error: Index out of range' },
    { setup: 'let flags = [true, false]', call: 'print(flags[3])', log: 'Fatal error: Index out of range' },
  ] as const

  const backendCrashes = [
    {
      setup: 'let payload = fetchReport()',
      call: 'let total = payload["summary"]!["total"] as! Int',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
      cause: 'field',
    },
    {
      setup: 'let apiKey = ProcessInfo.processInfo.environment["API_KEy"]!',
      call: 'let client = buildClient(apiKey)',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
      cause: 'config',
    },
    {
      setup: 'let data = fetchUser()',
      call: 'let role = data["profile"]!["role"] as! String',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'let button = view.viewWithTag(404) as? UIButton',
      call: 'button!.addTarget(self, action: #selector(save), for: .touchUpInside)',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
    },
    {
      setup: 'let title = view.viewWithTag(405) as? UILabel',
      call: 'title!.text = userName',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
    },
    {
      setup: 'let card = view.viewWithTag(406) as? UIView',
      call: 'card!.alpha = 1',
      log: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'print("ok")', 'print("done")'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'print("fallback")', 'print("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'print("range check")', call, 'print("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'print("report")', 'print(total)'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'print("ready")', 'print("done")'])),
  ]

  return createBank('swift', items)
}

const createRubyDebugBank = () => {
  const methodTypos = [
    { setup: 'text = "hello"', call: 'puts text.upcasee', log: 'undefined method `upcasee` for "hello":String' },
    { setup: 'names = ["Ada", "Lin"]', call: 'puts names.lenght', log: 'undefined method `lenght` for ["Ada", "Lin"]:Array' },
    { setup: 'profile = { name: "Ada" }', call: 'puts profile.keyz', log: 'undefined method `keyz` for {:name=>"Ada"}:Hash' },
  ] as const

  const nullAccess = [
    { setup: 'user = nil', call: 'puts user.name', log: "undefined method `name` for nil:NilClass" },
    { setup: 'profile = nil', call: 'puts profile.email', log: "undefined method `email` for nil:NilClass" },
    { setup: 'item = nil', call: 'puts item.id', log: "undefined method `id` for nil:NilClass" },
  ] as const

  const outOfRange = [
    { setup: 'scores = [10, 20, 30]', call: 'puts scores[5].to_s', log: "undefined method `to_s` for nil:NilClass" },
    { setup: 'names = ["Ada", "Lin"]', call: 'puts names[2].upcase', log: "undefined method `upcase` for nil:NilClass" },
    { setup: 'flags = [true, false]', call: 'puts flags[3].to_s', log: "undefined method `to_s` for nil:NilClass" },
  ] as const

  const backendCrashes = [
    {
      setup: 'payload = fetch_report',
      call: 'total = payload["summary"]["total"]',
      log: "undefined method `[]' for nil:NilClass",
      cause: 'field',
    },
    {
      setup: 'api_key = ENV.fetch("API_KEy")',
      call: 'client = build_client(api_key)',
      log: 'KeyError: key not found: "API_KEy"',
      cause: 'config',
    },
    {
      setup: 'data = fetch_user',
      call: 'role = data["profile"]["role"]',
      log: "undefined method `[]' for nil:NilClass",
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'button = doc.at_css(".btn-primmary")',
      call: 'button["class"] << " active"',
      log: "undefined method `[]' for nil:NilClass",
    },
    {
      setup: 'title = doc.at_css("#titel")',
      call: 'puts title.text.strip',
      log: "undefined method `text' for nil:NilClass",
    },
    {
      setup: 'card = doc.at_css("[data-role=cardd]")',
      call: 'puts card["data-id"]',
      log: "undefined method `[]' for nil:NilClass",
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'puts "ok"', 'puts "done"'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'puts "fallback"', 'puts "done"'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'puts "range check"', call, 'puts "done"'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'puts "report"', 'puts total'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'puts "ready"', 'puts "done"'])),
  ]

  return createBank('ruby', items)
}

const createPhpDebugBank = () => {
  const methodTypos = [
    { setup: '$text = "hello";', call: 'echo $text->trimm();', log: 'Call to undefined method' },
    { setup: '$names = ["Ada", "Lin"];', call: 'echo $names->lenght();', log: 'Call to undefined method' },
    { setup: '$profile = ["name" => "Ada"];', call: 'echo $profile->keyz();', log: 'Call to undefined method' },
  ] as const

  const nullAccess = [
    { setup: '$user = null;', call: 'echo $user->name;', log: 'Trying to get property of non-object' },
    { setup: '$profile = null;', call: 'echo $profile->email;', log: 'Trying to get property of non-object' },
    { setup: '$item = null;', call: 'echo $item->id;', log: 'Trying to get property of non-object' },
  ] as const

  const outOfRange = [
    { setup: '$scores = [10, 20, 30];', call: 'echo $scores[5];', log: 'Undefined offset: 5' },
    { setup: '$names = ["Ada", "Lin"];', call: 'echo strtoupper($names[2]);', log: 'Undefined offset: 2' },
    { setup: '$flags = [true, false];', call: 'echo $flags[3];', log: 'Undefined offset: 3' },
  ] as const

  const backendCrashes = [
    {
      setup: '$payload = fetch_report();',
      call: '$total = $payload["summary"]["total"];',
      log: 'Undefined array key "summary"',
      cause: 'field',
    },
    {
      setup: '$apiKey = getenv("API_KEy");',
      call: '$client = build_client($apiKey);',
      log: 'API_KEY missing',
      cause: 'config',
    },
    {
      setup: '$data = fetch_user();',
      call: '$role = $data["profile"]["role"];',
      log: 'Undefined array key "profile"',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: '$button = $dom->getElementById("btn-primmary");',
      call: '$button->setAttribute("class", "active");',
      log: 'Call to a member function setAttribute() on null',
    },
    {
      setup: '$title = $dom->getElementById("titel");',
      call: '$title->textContent = $userName;',
      log: 'Call to a member function on null',
    },
    {
      setup: '$card = $dom->getElementById("cardd");',
      call: '$card->setAttribute("data-active", "1");',
      log: 'Call to a member function setAttribute() on null',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'echo "ok";', 'echo "done";'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'echo "fallback";', 'echo "done";'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'echo "range check";', call, 'echo "done";'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'echo "report";', 'echo $total;'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'echo "ready";', 'echo "done";'])),
  ]

  return createBank('php', items)
}

const createRustDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'let text = String::from("hello");', call: 'println!("{}", text.trimm());', log: "no method named `trimm` found for struct `String`" },
    { setup: 'let names = vec!["Ada", "Lin"];', call: 'println!("{:?}", names.jion(","));', log: "no method named `jion` found for struct `Vec<&str>`" },
    { setup: 'let code = String::from("abc");', call: 'println!("{}", code.to_upper());', log: "no method named `to_upper` found for struct `String`" },
  ] as const

  const nullAccess = [
    { setup: 'let user: Option<User> = None;', call: 'println!("{}", user.unwrap().name);', log: 'thread panicked at called `Option::unwrap()` on a `None` value' },
    { setup: 'let profile: Option<Profile> = None;', call: 'println!("{}", profile.unwrap().email);', log: 'thread panicked at called `Option::unwrap()` on a `None` value' },
    { setup: 'let item: Option<Item> = None;', call: 'println!("{}", item.unwrap().id);', log: 'thread panicked at called `Option::unwrap()` on a `None` value' },
  ] as const

  const outOfRange = [
    { setup: 'let scores = vec![10, 20, 30];', call: 'println!("{}", scores[5]);', log: 'thread panicked at index out of bounds' },
    { setup: 'let names = vec!["Ada", "Lin"];', call: 'println!("{}", names[2]);', log: 'thread panicked at index out of bounds' },
    { setup: 'let flags = vec![true, false];', call: 'println!("{}", flags[3]);', log: 'thread panicked at index out of bounds' },
  ] as const

  const backendCrashes = [
    {
      setup: 'let payload = fetch_report();',
      call: 'let total = payload["summary"]["total"].as_i64().unwrap();',
      log: 'thread panicked at called `Option::unwrap()` on a `None` value',
      cause: 'field',
    },
    {
      setup: 'let api_key = std::env::var("API_KEy").unwrap();',
      call: 'let client = build_client(api_key);',
      log: 'thread panicked at called `Result::unwrap()` on an `Err` value',
      cause: 'config',
    },
    {
      setup: 'let data = fetch_user();',
      call: 'let role = data["profile"]["role"].as_str().unwrap();',
      log: 'thread panicked at called `Option::unwrap()` on a `None` value',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'let button = doc.select(".btn-primmary").next();',
      call: 'button.unwrap().click();',
      log: 'thread panicked at called `Option::unwrap()` on a `None` value',
    },
    {
      setup: 'let title = doc.select("#titel").next();',
      call: 'println!("{}", title.unwrap().text());',
      log: 'thread panicked at called `Option::unwrap()` on a `None` value',
    },
    {
      setup: 'let card = doc.select("[data-role=cardd]").next();',
      call: 'println!("{}", card.unwrap().attr("data-id").unwrap());',
      log: 'thread panicked at called `Option::unwrap()` on a `None` value',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'println!("ok");', 'println!("done");'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'println!("fallback");', 'println!("done");'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'println!("range check");', call, 'println!("done");'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'println!("report");', 'println!("total");'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'println!("ready");', 'println!("done");'])),
  ]

  return createBank(language, items)
}

const createBashDebugBank = () => {
  const commandTypos = [
    { setup: 'mkidr /tmp/demo', call: 'echo "done"', log: 'mkidr: command not found' },
    { setup: 'grpe "Ada" users.txt', call: 'echo "done"', log: 'grpe: command not found' },
    { setup: 'ech0 "done"', call: 'echo "ok"', log: 'ech0: command not found' },
  ] as const

  const nullAccess = [
    { setup: 'set -u', call: 'echo "$name"', log: 'unbound variable' },
    { setup: 'set -u', call: 'echo "$profile"', log: 'unbound variable' },
    { setup: 'set -u', call: 'echo "$item"', log: 'unbound variable' },
  ] as const

  const outOfRange = [
    { setup: 'items=(a b)', call: 'echo "${items[5]}"', log: 'bad array subscript' },
    { setup: 'names=(Ada Lin)', call: 'echo "${names[3]}"', log: 'bad array subscript' },
    { setup: 'flags=(true false)', call: 'echo "${flags[4]}"', log: 'bad array subscript' },
  ] as const

  const backendCrashes = [
    {
      setup: 'api_key="$API_KEy"',
      call: 'curl -H "Authorization: $api_key" https://api.example.com',
      log: 'API_KEY missing',
      cause: 'config',
    },
    {
      setup: 'payload=$(cat report.json)',
      call: 'echo "$payload" | jq -r ".summary.total"',
      log: 'jq: error: summary/0 is not defined',
      cause: 'field',
    },
    {
      setup: 'data=$(cat user.json)',
      call: 'echo "$data" | jq -r ".profile.role"',
      log: 'jq: error: profile/0 is not defined',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'html=$(cat page.html)',
      call: 'echo "$html" | grep -n "btn-primmary"',
      log: 'pattern not found',
    },
    {
      setup: 'html=$(cat page.html)',
      call: 'echo "$html" | grep -n "titel"',
      log: 'pattern not found',
    },
    {
      setup: 'html=$(cat page.html)',
      call: 'echo "$html" | grep -n "cardd"',
      log: 'pattern not found',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...commandTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'echo "ok"', 'echo "done"'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'echo "fallback"', 'echo "done"'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'echo "range check"', call, 'echo "done"'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'echo "report"', 'echo "done"'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'echo "ready"', 'echo "done"'])),
  ]

  return createBank('bash', items)
}

const createSqlDebugBank = () => {
  const methodTypos = [
    { setup: 'SELECT TRIMM(name) FROM users;', call: 'SELECT 1;', log: 'function trimm(text) does not exist' },
    { setup: 'SELECT LENGHT(name) FROM users;', call: 'SELECT 1;', log: 'function lenght(text) does not exist' },
    { setup: 'SELECT UPPERCASE(name) FROM users;', call: 'SELECT 1;', log: 'function uppercase(text) does not exist' },
  ] as const

  const nullAccess = [
    { setup: 'INSERT INTO users (email) VALUES (NULL);', call: 'SELECT 1;', log: 'null value in column "email" violates not-null constraint' },
    { setup: 'INSERT INTO profiles (name) VALUES (NULL);', call: 'SELECT 1;', log: 'null value in column "name" violates not-null constraint' },
    { setup: 'INSERT INTO orders (total) VALUES (NULL);', call: 'SELECT 1;', log: 'null value in column "total" violates not-null constraint' },
  ] as const

  const outOfRange = [
    { setup: 'SELECT 10 / 0;', call: 'SELECT 1;', log: 'division by zero' },
    { setup: 'SELECT 100 / 0;', call: 'SELECT 1;', log: 'division by zero' },
    { setup: 'SELECT 5 / 0;', call: 'SELECT 1;', log: 'division by zero' },
  ] as const

  const backendCrashes = [
    {
      setup: 'SELECT summary.total FROM reports;',
      call: 'SELECT 1;',
      log: 'column "summary" does not exist',
      cause: 'field',
    },
    {
      setup: 'SELECT * FROM reportss;',
      call: 'SELECT 1;',
      log: 'relation "reportss" does not exist',
      cause: 'config',
    },
    {
      setup: 'SELECT profile.role FROM users;',
      call: 'SELECT 1;',
      log: 'column "profile" does not exist',
      cause: 'field',
    },
  ] as const

  const uiSelectors = [
    {
      setup: 'SELECT * FROM ui_buttons WHERE id = "btn-primmary";',
      call: 'SELECT 1;',
      log: '0 rows returned',
    },
    {
      setup: 'SELECT * FROM ui_titles WHERE id = "titel";',
      call: 'SELECT 1;',
      log: '0 rows returned',
    },
    {
      setup: 'SELECT * FROM ui_cards WHERE id = "cardd";',
      call: 'SELECT 1;',
      log: '0 rows returned',
    },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'SELECT "ok";', 'SELECT "done";'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'SELECT "fallback";', 'SELECT "done";'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, call, 'SELECT "range check";', 'SELECT "done";'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'SELECT "report";', 'SELECT "done";'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'SELECT "ready";', 'SELECT "done";'])),
  ]

  return createBank('sql', items)
}

const createLuaDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'local player = { reset = function() end }', call: 'player:rset()', log: "attempt to call method 'rset' (a nil value)" },
    { setup: 'local audio = { play = function() end }', call: 'audio:plai()', log: "attempt to call method 'plai' (a nil value)" },
    { setup: 'local spawner = { spawn = function() end }', call: 'spawner:spwn()', log: "attempt to call method 'spwn' (a nil value)" },
  ] as const

  const nullAccess = [
    { setup: 'local hud = nil', call: 'print(hud.text)', log: 'attempt to index a nil value' },
    { setup: 'local player = nil', call: 'print(player.name)', log: 'attempt to index a nil value' },
    { setup: 'local score = nil', call: 'print(score.value)', log: 'attempt to index a nil value' },
  ] as const

  const outOfRange = [
    { setup: 'local items = {"a", "b"}', call: 'print(items[3].lower())', log: 'attempt to index a nil value' },
    { setup: 'local enemies = {"one", "two"}', call: 'print(enemies[4].id)', log: 'attempt to index a nil value' },
    { setup: 'local stats = {"hp", "mp"}', call: 'print(stats[5].name)', log: 'attempt to index a nil value' },
  ] as const

  const backendCrashes = [
    { setup: 'local payload = {}', call: 'print(payload.profile.name)', log: 'attempt to index a nil value', cause: 'field' },
    { setup: 'local apiKey = os.getenv("API_KEy")', call: 'print(apiKey)', log: 'API_KEY is missing', cause: 'config' },
    { setup: 'local data = {}', call: 'print(data.summary.total)', log: 'attempt to index a nil value', cause: 'field' },
  ] as const

  const uiSelectors = [
    { setup: 'local button = ui.find("btn-primary")', call: 'button:onClick()', log: 'attempt to index a nil value' },
    { setup: 'local panel = ui.find("hud-title")', call: 'panel:set_text("hi")', log: 'attempt to index a nil value' },
    { setup: 'local card = ui.find("card-main")', call: 'card:show()', log: 'attempt to index a nil value' },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'print("ok")', 'print("done")'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'print("fallback")', 'print("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'print("range check")', call, 'print("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'print("report")', 'print("done")'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'print("ready")', 'print("done")'])),
  ]

  return createBank(language, items)
}

const createGdscriptDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'var body = CharacterBody2D.new()', call: 'body.movee(Vector2.ZERO)', log: "Invalid call. Nonexistent function 'movee' in base 'CharacterBody2D'." },
    { setup: 'var anim = AnimationPlayer.new()', call: 'anim.plai("run")', log: "Invalid call. Nonexistent function 'plai' in base 'AnimationPlayer'." },
    { setup: 'var node = Node.new()', call: 'node.ad_child(Node.new())', log: "Invalid call. Nonexistent function 'ad_child' in base 'Node'." },
  ] as const

  const nullAccess = [
    { setup: 'var hud = null', call: 'print(hud.text)', log: "Invalid get index 'text' (on base: 'Nil')." },
    { setup: 'var player = null', call: 'print(player.position)', log: "Invalid get index 'position' (on base: 'Nil')." },
    { setup: 'var score = null', call: 'print(score.value)', log: "Invalid get index 'value' (on base: 'Nil')." },
  ] as const

  const outOfRange = [
    { setup: 'var items = [1, 2]', call: 'print(items[3])', log: 'Index 3 out of bounds' },
    { setup: 'var names = ["Ada", "Lin"]', call: 'print(names[2])', log: 'Index 2 out of bounds' },
    { setup: 'var flags = [true, false]', call: 'print(flags[5])', log: 'Index 5 out of bounds' },
  ] as const

  const backendCrashes = [
    { setup: 'var data = {}', call: 'print(data.profile.name)', log: "Invalid get index 'profile' (on base: 'Dictionary').", cause: 'field' },
    { setup: 'var api = {}', call: 'print(api.API_KEy)', log: "Invalid get index 'API_KEy' (on base: 'Dictionary').", cause: 'config' },
    { setup: 'var payload = {}', call: 'print(payload.summary.total)', log: "Invalid get index 'summary' (on base: 'Dictionary').", cause: 'field' },
  ] as const

  const uiSelectors = [
    { setup: 'var button = get_node("Buttons/Primary")', call: 'button.disabled = true', log: "Invalid get index 'disabled' (on base: 'Nil')." },
    { setup: 'var title = get_node("HUD/Title")', call: 'title.text = "Ready"', log: "Invalid get index 'text' (on base: 'Nil')." },
    { setup: 'var card = get_node("Cards/Main")', call: 'card.show()', log: "Invalid call. Nonexistent function 'show' in base 'Nil'." },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'print("ok")', 'print("done")'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'print("fallback")', 'print("done")'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'print("range check")', call, 'print("done")'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'print("report")', 'print("done")'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'print("ready")', 'print("done")'])),
  ]

  return createBank(language, items)
}

const createShaderDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: '#version 330 core', call: 'gl_FragColor = texturee(uTexture, vUv);', log: "ERROR: 0:2: 'texturee' : no matching overloaded function found" },
    { setup: '#version 330 core', call: 'gl_FragColor = tex2dd(uTexture, vUv);', log: "ERROR: 0:2: 'tex2dd' : no matching overloaded function found" },
    { setup: '#version 330 core', call: 'gl_FragColor = sampel(uTexture, vUv);', log: "ERROR: 0:2: 'sampel' : undeclared identifier" },
  ] as const

  const nullAccess = [
    { setup: '#version 330 core', call: 'gl_FragColor = color;', log: "ERROR: 0:2: 'color' : undeclared identifier" },
    { setup: '#version 330 core', call: 'gl_FragColor = tintColor;', log: "ERROR: 0:2: 'tintColor' : undeclared identifier" },
    { setup: '#version 330 core', call: 'gl_FragColor = lightColor;', log: "ERROR: 0:2: 'lightColor' : undeclared identifier" },
  ] as const

  const outOfRange = [
    { setup: 'const int LEN = 2;', call: 'float v = weights[5];', log: 'ERROR: 0:2: array index out of range' },
    { setup: 'const int LEN = 3;', call: 'float v = weights[4];', log: 'ERROR: 0:2: array index out of range' },
    { setup: 'const int LEN = 1;', call: 'float v = weights[2];', log: 'ERROR: 0:2: array index out of range' },
  ] as const

  const backendCrashes = [
    { setup: '#define USE_FOG 0', call: '#if USE_FOG\nfloat fog = FogAmount;\n#endif', log: "ERROR: 0:3: 'FogAmount' : undeclared identifier", cause: 'config' },
    { setup: 'uniform vec4 Tint;', call: 'gl_FragColor = Tintt;', log: "ERROR: 0:2: 'Tintt' : undeclared identifier", cause: 'field' },
    { setup: 'uniform sampler2D MainTex;', call: 'gl_FragColor = texture(MainTexx, vUv);', log: "ERROR: 0:2: 'MainTexx' : undeclared identifier", cause: 'field' },
  ] as const

  const uiSelectors = [
    { setup: 'in vec2 vUv;', call: 'gl_FragColor = texture(uTexture, uv);', log: "ERROR: 0:2: 'uv' : undeclared identifier" },
    { setup: 'in vec2 vTex;', call: 'gl_FragColor = texture(uTexture, texCoord);', log: "ERROR: 0:2: 'texCoord' : undeclared identifier" },
    { setup: 'in vec2 vCoord;', call: 'gl_FragColor = texture(uTexture, vUv2);', log: "ERROR: 0:2: 'vUv2' : undeclared identifier" },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'gl_FragColor = vec4(1.0);', ''])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'gl_FragColor = vec4(1.0);', ''])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, call, 'gl_FragColor = vec4(1.0);', ''])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'gl_FragColor = vec4(1.0);', ''])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'gl_FragColor = vec4(1.0);', ''])),
  ]

  return createBank(language, items)
}

const createGmlDebugBank = (language: DebugSupportedLanguageId) => {
  const methodTypos = [
    { setup: 'draw_set_color(c_white);', call: 'draw_textt(20, 20, "score");', log: 'Unknown function draw_textt' },
    { setup: 'var inst = instance_find(obj_player, 0);', call: 'inst.damge = 1;', log: 'Unknown variable damge' },
    { setup: 'var score = 0;', call: 'scrore += 1;', log: 'Variable scrore not set before reading it' },
  ] as const

  const nullAccess = [
    { setup: 'var player = noone;', call: 'player.hp -= 1;', log: 'Unable to access instance' },
    { setup: 'var target = noone;', call: 'target.x += 1;', log: 'Unable to access instance' },
    { setup: 'var hud = noone;', call: 'hud.visible = true;', log: 'Unable to access instance' },
  ] as const

  const outOfRange = [
    { setup: 'var items = array_create(2, 0);', call: 'show_debug_message(items[5]);', log: 'Array index out of range' },
    { setup: 'var names = array_create(1, "A");', call: 'show_debug_message(names[3]);', log: 'Array index out of range' },
    { setup: 'var flags = array_create(2, false);', call: 'show_debug_message(flags[4]);', log: 'Array index out of range' },
  ] as const

  const backendCrashes = [
    { setup: 'var data = ds_map_create();', call: 'show_debug_message(data[? "profile"]);', log: 'Key not found', cause: 'field' },
    { setup: 'var api_key = os_get_info("API_KEy");', call: 'show_debug_message(api_key);', log: 'API_KEY missing', cause: 'config' },
    { setup: 'var payload = ds_map_create();', call: 'show_debug_message(payload[? "summary"]);', log: 'Key not found', cause: 'field' },
  ] as const

  const uiSelectors = [
    { setup: 'var btn = layer_get_instance(layer, "btn-primary");', call: 'btn.visible = true;', log: 'Unable to access instance' },
    { setup: 'var title = layer_get_instance(layer, "title");', call: 'title.text = "Ready";', log: 'Unable to access instance' },
    { setup: 'var card = layer_get_instance(layer, "card");', call: 'card.visible = true;', log: 'Unable to access instance' },
  ] as const

  const items: DebugQuestionSpec[] = [
    ...methodTypos.map(({ setup, call, log }) => makeSpec('typo', log, [setup, call, 'show_debug_message("ok");', 'show_debug_message("done");'])),
    ...nullAccess.map(({ setup, call, log }) => makeSpec('null', log, [setup, call, 'show_debug_message("fallback");', 'show_debug_message("done");'])),
    ...outOfRange.map(({ setup, call, log }) => makeSpec('range', log, [setup, 'show_debug_message("range check");', call, 'show_debug_message("done");'])),
    ...backendCrashes.map(({ setup, call, log, cause }) => makeSpec(cause, log, [setup, call, 'show_debug_message("report");', 'show_debug_message("done");'])),
    ...uiSelectors.map(({ setup, call, log }) => makeSpec('selector', log, [setup, call, 'show_debug_message("ready");', 'show_debug_message("done");'])),
  ]

  return createBank(language, items)
}

function buildPythonStyleSupplementalDebugSpecs(): DebugQuestionSpec[] {
  return [
    {
      ...makeSpec('config', "ConnectionError: service handshake failed after auth retry", ['api_key = os.environ["API_KEy"]', 'client = build_client(api_key)', 'report = client.fetch()', 'print(report)']),
      scenario: bi('ระบบค้างตอนคุยกับ service หลัง retry หลายรอบ', 'The service stalls after several retries during handshake.'),
      patternGroupId: 'supp-python-config-auth-retry',
      hint: bi('อย่ามองแค่ log ปลายทาง ให้ย้อนกลับไปดู key ที่อ่านมาก่อนสร้าง client', 'Do not stare at the downstream log alone. Trace back to the key loaded before the client is built.'),
    },
    {
      ...makeSpec('field', "TypeError: 'NoneType' object is not subscriptable", ['payload = fetch_report()', 'summary = payload["meta"]["summary"]', 'print(summary["total"])', 'return summary']),
      scenario: bi('หน้าสรุปล่มตอน render ตอนท้าย แม้ fetch ผ่านแล้ว', 'The summary screen crashes late in render even though fetch already succeeded.'),
      patternGroupId: 'supp-python-field-meta-summary',
      hint: bi('แยกอาการปลายทางออกจาก root cause แล้วไล่ดู path ของข้อมูลที่ถูกอ่าน', 'Separate the downstream symptom from the root cause and inspect the data path being read.'),
    },
    {
      ...makeSpec('selector', "AttributeError: 'NoneType' object has no attribute 'text'", ['title = soup.select_one("#score-panl")', 'label = title.text.strip()', 'print(label)', 'return label']),
      scenario: bi('ข้อความ HUD ไม่ขึ้นแล้วล่มตอนสรุป label', 'The HUD text never appears and the label step crashes later.'),
      patternGroupId: 'supp-python-selector-score-panel',
      hint: bi('เริ่มจากบรรทัดหา target ก่อน ไม่ใช่บรรทัดที่อาการระเบิดออกมา', 'Start from the lookup line, not the later symptom line.'),
    },
    {
      ...makeSpec('typo', "AttributeError: 'dict' object has no attribute 'mergge'", ['profile = {"name": "Ada"}', 'profile.mergge({"rank": "A"})', 'print(profile)', 'return profile']),
      scenario: bi('ขั้น merge โปรไฟล์พังก่อนบันทึกผล', 'The profile merge step breaks before saving results.'),
      patternGroupId: 'supp-python-typo-merge',
      hint: bi('เช็กชื่อ method ที่ถูกเรียกให้ครบทุกตัวอักษร', 'Check the called method name character by character.'),
    },
  ]
}

function buildJsStyleSupplementalDebugSpecs(language: DebugSupportedLanguageId): DebugQuestionSpec[] {
  const selectorLine =
    language === 'phaser-typescript'
      ? 'const hud = this.children.getByName("score-panl")'
      : language === 'rpg-maker-js'
        ? 'const hud = SceneManager._scene.findChildByName("score-panl")'
        : language === 'cocos-typescript'
          ? 'const hud = this.node.getChildByName("score-panl")'
          : 'const hud = document.querySelector("#score-panl")'

  return [
    {
      ...makeSpec('config', 'Error: request signed with an empty API key', ['const apiKey = process.env.API_KEy', 'const client = createClient(apiKey)', 'const report = await client.fetch()', 'console.log(report)']),
      scenario: bi('รอบ retry หลังบ้านพาไปโฟกัส auth failure ตอนปลายทาง', 'The backend retry cycle pushes attention toward a late auth failure.'),
      patternGroupId: `supp-${language}-config-api-key`,
    },
    {
      ...makeSpec('field', "TypeError: Cannot read properties of undefined (reading 'total')", ['const payload = await fetchReport()', 'const summary = payload.meta.summary', 'console.log(summary.total)', 'return summary']),
      scenario: bi('หน้า summary ผ่าน fetch มาแล้วแต่ยังล่มตอนท้าย flow', 'The summary page survives fetch but still collapses late in the flow.'),
      patternGroupId: `supp-${language}-field-meta-summary`,
    },
    {
      ...makeSpec('selector', "TypeError: Cannot read properties of null (reading 'classList')", [selectorLine, 'hud.classList.add("ready")', 'console.log("done")', 'return']),
      scenario: bi('อาการล่มโผล่ตอนแตะ UI ปลายทาง แต่ต้นเหตุมาจาก lookup ก่อนหน้า', 'The crash appears during late UI work, but the root cause starts in the earlier lookup.'),
      patternGroupId: `supp-${language}-selector-score-panel`,
    },
    {
      ...makeSpec('typo', 'TypeError: cache.claer is not a function', ['const cache = new Map()', 'cache.claer()', 'console.log("done")', 'return']),
      scenario: bi('ขั้น clear cache พังและ log พยายามพาไปมอง state หลังบ้านแทน', 'The cache clear step breaks and the log tries to pull attention toward later state fallout.'),
      patternGroupId: `supp-${language}-typo-cache-clear`,
    },
  ]
}

function buildLuaStyleSupplementalDebugSpecs(language: DebugSupportedLanguageId): DebugQuestionSpec[] {
  const selectorLine =
    language === 'godot-gdscript'
      ? '$HUD/ScorePanl'
      : language === 'gamemaker-gml'
        ? 'layer_get_element("score_panl")'
        : 'ui:find("score_panl")'

  return [
    {
      ...makeSpec('config', 'auth retry failed: missing API key', ['local api_key = ENV.API_KEy', 'local client = build_client(api_key)', 'local report = client:fetch()', 'print(report)']),
      scenario: bi('ระบบล้มหลัง retry หลายรอบและ log โยนความสนใจไปที่ auth ตอนท้าย', 'The system fails after several retries and the log points attention at late auth trouble.'),
      patternGroupId: `supp-${language}-config-api-key`,
    },
    {
      ...makeSpec('field', 'attempt to index field \'summary\' (a nil value)', ['local payload = fetch_report()', 'local summary = payload.meta.summary', 'print(summary.total)', 'return summary']),
      scenario: bi('หน้าสรุปล่มตอนท้ายทั้งที่ขั้นโหลดผ่านแล้ว', 'The summary screen crashes late even though the loading step succeeded.'),
      patternGroupId: `supp-${language}-field-meta-summary`,
    },
    {
      ...makeSpec('selector', 'attempt to index a nil value', [`local hud = ${selectorLine}`, 'hud.visible = true', 'print("done")', 'return']),
      scenario: bi('อาการระเบิดโผล่ตอนใช้งาน HUD แต่ต้นเหตุเริ่มจากการหา target', 'The visible crash shows up during HUD usage, but the root cause starts in target lookup.'),
      patternGroupId: `supp-${language}-selector-score-panel`,
    },
    {
      ...makeSpec('typo', "attempt to call method 'claer' (a nil value)", ['local cache = Cache.new()', 'cache:claer()', 'print("done")', 'return']),
      scenario: bi('ขั้น clear cache พังและบรรทัดข้าง ๆ ถูกวางมาให้ดูน่าสงสัยเหมือนกัน', 'The cache clear step breaks and nearby lines were staged to look suspicious too.'),
      patternGroupId: `supp-${language}-typo-cache-clear`,
    },
  ]
}

function buildTypedStyleSupplementalDebugSpecs(language: DebugSupportedLanguageId): DebugQuestionSpec[] {
  return [
    {
      ...makeSpec('config', 'Connection retry failed because the service key is empty', ['var apiKey = ENV.API_KEy;', 'var client = buildClient(apiKey);', 'var report = client.fetch();', 'print(report);']),
      scenario: bi('ระบบล้มตอนคุยกับ service หลังผ่าน retry ไปแล้วหลายรอบ', 'The system fails while talking to the service after several retries.'),
      patternGroupId: `supp-${language}-config-api-key`,
    },
    {
      ...makeSpec('field', 'Property summary is missing', ['var payload = fetchReport();', 'var summary = payload.meta.summary;', 'print(summary.total);', 'return summary;']),
      scenario: bi('หน้าสรุปพังตอนท้าย flow แม้ขั้นโหลดรายงานผ่านแล้ว', 'The summary screen breaks late in the flow even though the report load succeeded.'),
      patternGroupId: `supp-${language}-field-meta-summary`,
    },
    {
      ...makeSpec('selector', 'Target lookup returned null before UI update', ['var hud = findNode("hud/score-panl");', 'hud.show();', 'print("done");', 'return;']),
      scenario: bi('อาการโผล่ตอนอัปเดต UI แต่ root cause ซ่อนอยู่ในบรรทัดหา target', 'The symptom appears during UI update, but the root cause hides in the target lookup line.'),
      patternGroupId: `supp-${language}-selector-score-panel`,
    },
    {
      ...makeSpec('typo', "Method 'claer' does not exist", ['var cache = new Cache();', 'cache.claer();', 'print("done");', 'return;']),
      scenario: bi('ขั้น clear cache พังก่อน save และ log พยายามพาไปสนใจอาการปลายทาง', 'The cache clear step breaks before save and the log tries to pull attention toward the downstream symptom.'),
      patternGroupId: `supp-${language}-typo-cache-clear`,
    },
  ]
}

const createDebugQuestionBanks = (): Record<DebugSupportedLanguageId, Record<Difficulty, DebugQuestionBankItem[]>> => ({
  python: createPythonDebugBank('python'),
  java: createJavaDebugBank(),
  javascript: createJsLikeDebugBank('javascript'),
  csharp: createCsharpDebugBank('csharp'),
  cpp: createCppDebugBank('cpp'),
  dart: createDartDebugBank(),
  go: createGoDebugBank(),
  kotlin: createKotlinDebugBank(),
  swift: createSwiftDebugBank(),
  ruby: createRubyDebugBank(),
  jsx: createJsLikeDebugBank('jsx'),
  typescript: createJsLikeDebugBank('typescript'),
  bash: createBashDebugBank(),
  'cloud-functions': createJsLikeDebugBank('cloud-functions'),
  sql: createSqlDebugBank(),
  php: createPhpDebugBank(),
  rust: createRustDebugBank('rust'),
  'roblox-lua': createLuaDebugBank('roblox-lua'),
  'love2d-lua': createLuaDebugBank('love2d-lua'),
  'defold-lua': createLuaDebugBank('defold-lua'),
  'godot-gdscript': createGdscriptDebugBank('godot-gdscript'),
  'godot-shader': createShaderDebugBank('godot-shader'),
  'unity-csharp': createCsharpDebugBank('unity-csharp'),
  'unity-shaderlab': createShaderDebugBank('unity-shaderlab'),
  'unreal-cpp': createCppDebugBank('unreal-cpp'),
  glsl: createShaderDebugBank('glsl'),
  'phaser-typescript': createJsLikeDebugBank('phaser-typescript'),
  'rpg-maker-js': createJsLikeDebugBank('rpg-maker-js'),
  'gamemaker-gml': createGmlDebugBank('gamemaker-gml'),
  'cocos-typescript': createJsLikeDebugBank('cocos-typescript'),
  'bevy-rust': createRustDebugBank('bevy-rust'),
  'renpy-python': createPythonDebugBank('renpy-python'),
})

const getDebugBankSize = (language: DebugSupportedLanguageId) =>
  getDebugTrack(language) === 'game-dev' ? DEBUG_GAME_BANK_SIZE : DEBUG_CORE_BANK_SIZE

const validateDebugBank = (language: DebugSupportedLanguageId, difficulty: Difficulty, bank: DebugQuestionBankItem[]) => {
  const expectedSize = getDebugBankSize(language)
  if (bank.length !== expectedSize) {
    throw new Error(`Expected ${expectedSize} ${difficulty} questions for ${language} but received ${bank.length}.`)
  }

  assertNoDuplicateSurface(
    bank,
    `${language}/${difficulty}/debug freshness`,
    (item) =>
      `${item.scenario.th}|||${item.scenario.en}|||${item.answer}|||${extractLogHead(item.logText.en)}|||${item.snippetText}`,
  )
  assertNoDuplicateSurface(
    bank,
    `${language}/${difficulty}/debug culprit freshness`,
    (item) => `${item.answer}|||${extractLogHead(item.logText.en)}|||${normalizeSurface(item.snippetText)}`,
  )

  const patternGroupCoverage = new Set(bank.map((item) => item.patternGroupId)).size
  if (patternGroupCoverage < 15) {
    throw new Error(`Debug pattern-group coverage is too thin for ${language}/${difficulty}: expected at least 15 groups, received ${patternGroupCoverage}.`)
  }

  for (const item of bank) {
    if (item.difficulty !== difficulty) {
      throw new Error(`Expected ${difficulty} metadata for ${item.id} but received ${item.difficulty}.`)
    }

    assertLocalizedTextPresent(item.scenario, `${item.id} scenario`)
    assertLocalizedTextPresent(item.logText, `${item.id} logText`)
    assertLocalizedTextPresent(item.hint, `${item.id} hint`)
    assertLocalizedTextPresent(item.explanation.correct, `${item.id} explanation.correct`)
    assertStringPresent(item.snippetText, `${item.id} snippetText`)
    assertStringPresent(item.patternGroupId, `${item.id} patternGroupId`)

    if (item.choices.length !== 4) {
      throw new Error(`Expected 4 choices for ${item.id}.`)
    }

    const choiceIds = new Set(item.choices.map((choice) => choice.id))
    if (choiceIds.size !== 4) {
      throw new Error(`Duplicate choices detected for ${item.id}.`)
    }

    if (!choiceIds.has(item.answer)) {
      throw new Error(`Answer ${item.answer} is missing from choices for ${item.id}.`)
    }

    assertUniqueStringValues(
      item.choices.map((choice) => choice.id),
      `${item.id} choice ids`,
    )
    assertUniqueLocalizedValues(
      item.choices.map((choice) => choice.label),
      `${item.id} choice labels`,
    )

    for (const choice of item.choices) {
      assertLocalizedTextPresent(choice.label, `${item.id} -> ${choice.id} label`)
      assertLocalizedTextPresent(choice.detail, `${item.id} -> ${choice.id} detail`)
    }

    if (difficulty === 'easy' && /trace-pass/i.test(normalizeSurface(item.snippetText))) {
      throw new Error(`Synthetic easy marker detected in ${item.id}.`)
    }
  }
}

export const debugQuestionBanks = createDebugQuestionBanks()

for (const language of debugSupportedLanguageIds) {
  validateDebugBank(language, 'easy', debugQuestionBanks[language].easy)
  validateDebugBank(language, 'hard', debugQuestionBanks[language].hard)
}
