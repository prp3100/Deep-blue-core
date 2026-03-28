import type {
  CoreLanguageId,
  Difficulty,
  FixErrorChoice,
  FixErrorGuideTag,
  FixErrorHintAnchor,
  FixErrorLineRole,
  FixErrorPatternFamilyId,
  FixErrorQuestionBankItem,
  GameLanguageId,
  LanguageId,
  LocalizedText,
  QuizTrackId,
} from './quizModels'
import {
  assertLocalizedTextPresent,
  assertNoDuplicateSurface,
  assertStringPresent,
  assertUniqueLocalizedValues,
  assertUniqueStringValues,
  extractLogHead,
  normalizeSurface,
} from './bankValidation'

type LineNumber = 1 | 2 | 3 | 4

type FixErrorQuestionSpec = {
  errorText: LocalizedText
  lines: [string, string, string, string]
  culpritLine: LineNumber
  hint: LocalizedText
  explanation: LocalizedText
  familyId?: FixErrorPatternFamilyId
  lineRoles?: [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole]
  hintAnchor?: FixErrorHintAnchor
  guideTags?: FixErrorGuideTag[]
}

type ResolvedFixErrorQuestionSpec = Omit<FixErrorQuestionSpec, 'familyId' | 'lineRoles' | 'hintAnchor' | 'guideTags'> & {
  familyId: FixErrorPatternFamilyId
  lineRoles: [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole]
  hintAnchor: FixErrorHintAnchor
  guideTags: FixErrorGuideTag[]
}

type ContextCandidate = {
  id: string
  line: string
  origin: 'before' | 'after'
}

const same = (value: string): LocalizedText => ({ th: value, en: value })

const bi = (th: string, en: string): LocalizedText => ({ th, en })

const spec = (
  errorText: LocalizedText | string,
  lines: [string, string, string, string],
  culpritLine: LineNumber,
  hint: LocalizedText,
  explanation: LocalizedText,
): FixErrorQuestionSpec => ({
  errorText: typeof errorText === 'string' ? same(errorText) : errorText,
  lines,
  culpritLine,
  hint,
  explanation,
})

const specWithMeta = (
  errorText: LocalizedText | string,
  lines: [string, string, string, string],
  culpritLine: LineNumber,
  hint: LocalizedText,
  explanation: LocalizedText,
  meta: Pick<ResolvedFixErrorQuestionSpec, 'familyId' | 'hintAnchor' | 'guideTags'> &
    Partial<Pick<ResolvedFixErrorQuestionSpec, 'lineRoles'>>,
): FixErrorQuestionSpec => ({
  ...spec(errorText, lines, culpritLine, hint, explanation),
  familyId: meta.familyId,
  hintAnchor: meta.hintAnchor,
  guideTags: meta.guideTags,
  lineRoles: meta.lineRoles,
})

export const FIX_ERROR_ALL_CORE_SCOPE = 'all-core'
export const FIX_ERROR_ALL_GAME_SCOPE = 'all-game'
const FIX_ERROR_CORE_BANK_SIZE = 20
const FIX_ERROR_GAME_BANK_SIZE = 17

export const fixErrorSupportedCoreLanguageIds = [
  'python',
  'java',
  'javascript',
  'csharp',
  'cpp',
  'dart',
  'go',
  'kotlin',
  'swift',
  'ruby',
  'jsx',
  'typescript',
  'bash',
  'cloud-functions',
  'sql',
  'php',
  'rust',
] as const satisfies readonly CoreLanguageId[]

export const fixErrorSupportedGameLanguageIds = [
  'roblox-lua',
  'love2d-lua',
  'godot-gdscript',
  'godot-shader',
  'unity-csharp',
  'unity-shaderlab',
  'unreal-cpp',
  'glsl',
  'phaser-typescript',
  'rpg-maker-js',
  'gamemaker-gml',
  'defold-lua',
  'cocos-typescript',
  'bevy-rust',
  'renpy-python',
] as const satisfies readonly GameLanguageId[]

export const fixErrorSupportedLanguageIds = [
  ...fixErrorSupportedCoreLanguageIds,
  ...fixErrorSupportedGameLanguageIds,
] as const satisfies readonly LanguageId[]

export type FixErrorSupportedLanguageId = (typeof fixErrorSupportedLanguageIds)[number]
export type FixErrorScopeId =
  | typeof FIX_ERROR_ALL_CORE_SCOPE
  | typeof FIX_ERROR_ALL_GAME_SCOPE
  | FixErrorSupportedLanguageId

export const fixErrorFamilyLabels: Record<FixErrorPatternFamilyId, LocalizedText> = {
  'name-typo': bi('ชื่อตัวแปรหรือสัญลักษณ์สะกดผิด', 'Wrong variable or symbol name'),
  'method-typo': bi('ชื่อเมธอดหรือฟังก์ชันสะกดผิด', 'Misspelled method or function'),
  'null-access': bi('เรียกใช้งานค่าที่เป็น null หรือ None', 'Null or None access'),
  range: bi('เข้าถึง index หรือช่วงข้อมูลเกินขอบเขต', 'Out-of-range access'),
  syntax: bi('โครงสร้าง syntax ไม่สมบูรณ์หรือปิดไม่ครบ', 'Incomplete syntax structure'),
  'module-import': bi('import, include หรือ module path ผิด', 'Bad import or module path'),
  'field-property': bi('ชื่อ field, key หรือ property ผิด', 'Wrong field, key, alias, or property'),
  arity: bi('จำนวน argument ไม่ตรงกับที่ประกาศ', 'Wrong argument count'),
  'type-mismatch': bi('ชนิดข้อมูลไม่ตรงกัน', 'Type mismatch'),
  'selector-mismatch': bi('selector หรือ target ที่อ้างถึงไม่ตรง', 'Selector or target mismatch'),
  'engine-api': bi('เรียกใช้ API ของเอนจินผิด', 'Wrong engine API call'),
  'engine-callback': bi('ชื่อ callback หรือ lifecycle hook ผิด', 'Wrong callback or lifecycle hook'),
  'shader-builtin': bi('ใช้ built-in ของ shader ผิด', 'Wrong shader built-in usage'),
}

const lineNumbers = [1, 2, 3, 4] as const satisfies readonly LineNumber[]
const coreLinePlanBase = [1, 3, 2, 4, 2, 4, 1, 3, 3, 1, 4, 2, 4, 2, 3, 1, 1, 4, 2, 3] as const satisfies readonly LineNumber[]
const gameLinePlanBase = [1, 3, 2, 4, 2, 4, 1, 3, 3, 1, 4, 2, 4, 2, 3, 1] as const satisfies readonly LineNumber[]

const shaderLanguageSet = new Set<FixErrorSupportedLanguageId>(['godot-shader', 'unity-shaderlab', 'glsl'])

const familyGuideTags: Record<FixErrorPatternFamilyId, FixErrorGuideTag[]> = {
  'name-typo': ['typo'],
  'method-typo': ['typo'],
  'null-access': ['runtime-state'],
  range: ['range'],
  syntax: ['syntax'],
  'module-import': ['import'],
  'field-property': ['field'],
  arity: ['arity'],
  'type-mismatch': ['type'],
  'selector-mismatch': ['selector'],
  'engine-api': ['engine'],
  'engine-callback': ['engine'],
  'shader-builtin': ['shader'],
}

const familyHintAnchors: Record<FixErrorPatternFamilyId, FixErrorHintAnchor> = {
  'name-typo': 'fragment',
  'method-typo': 'fragment',
  'null-access': 'fragment',
  range: 'fragment',
  syntax: 'family',
  'module-import': 'family',
  'field-property': 'family',
  arity: 'family',
  'type-mismatch': 'family',
  'selector-mismatch': 'family',
  'engine-api': 'family',
  'engine-callback': 'symptom-vs-root',
  'shader-builtin': 'family',
}

const rolePlans: Record<Difficulty, Record<LineNumber, [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole]>> = {
  easy: {
    1: ['root-cause', 'symptom', 'safe-follow-up', 'fallback'],
    2: ['setup', 'root-cause', 'symptom', 'fallback'],
    3: ['setup', 'fallback', 'root-cause', 'symptom'],
    4: ['setup', 'fallback', 'safe-follow-up', 'root-cause'],
  },
  hard: {
    1: ['root-cause', 'fallback', 'symptom', 'safe-follow-up'],
    2: ['setup', 'root-cause', 'fallback', 'symptom'],
    3: ['setup', 'symptom', 'root-cause', 'fallback'],
    4: ['setup', 'symptom', 'fallback', 'root-cause'],
  },
}

const nonRootRoleMarkers: Record<Exclude<FixErrorLineRole, 'root-cause'>, readonly string[]> = {
  setup: ['setup anchor', 'input prep', 'state load', 'precheck'],
  symptom: ['symptom trail', 'late read', 'downstream echo', 'loud failure'],
  'safe-follow-up': ['safe branch', 'cleanup path', 'result pass', 'post step'],
  fallback: ['fallback branch', 'guard return', 'side path', 'recovery note'],
}

const errorPhasePrefixes: Record<Difficulty, readonly LocalizedText[]> = {
  easy: [
    bi('รอบ warmup แจ้งปัญหานี้', 'Warmup pass reports this issue'),
    bi('รอบตรวจข้อมูลเจออาการนี้', 'Validation pass reports this issue'),
    bi('รอบ sync เจออาการนี้', 'Sync pass reports this issue'),
    bi('รอบบันทึกผลล้มด้วยอาการนี้', 'Save pass fails with this issue'),
  ],
  hard: [
    bi('อาการปลายทางชี้มาที่ error นี้', 'The downstream symptom points to this error'),
    bi('เคสรอบลึกปล่อยอาการนี้ออกมา', 'A deeper pass exposes this error'),
    bi('รอบสุดท้ายระเบิดด้วยอาการนี้', 'The late pass collapses with this error'),
    bi('เคส symptom-heavy จบด้วย error นี้', 'A symptom-heavy case ends with this error'),
  ],
}

const lineLabel = (lineNumber: number) => bi(`บรรทัด ${lineNumber}`, `Line ${lineNumber}`)

const BLANK_LINE_FRAGMENT = '[blank line]'

const lineFragment = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 88) : BLANK_LINE_FRAGMENT
}

const hintFragment = (value: string) => {
  return lineFragment(value)
}

const fixErrorGameLanguageSet = new Set<GameLanguageId>(fixErrorSupportedGameLanguageIds)

const getFixErrorTrack = (language: FixErrorSupportedLanguageId): QuizTrackId =>
  fixErrorGameLanguageSet.has(language as GameLanguageId) ? 'game-dev' : 'core'

const inlineCommentByLanguage: Record<FixErrorSupportedLanguageId, string> = {
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

const appendInlineMarker = (line: string, language: FixErrorSupportedLanguageId, marker: string) => {
  const token = inlineCommentByLanguage[language]
  return line.trim().length > 0 ? `${line} ${token} ${marker}` : `${token} ${marker}`
}

const asLineNumber = (value: number): LineNumber => {
  if (!lineNumbers.includes(value as LineNumber)) {
    throw new Error(`Unsupported line number ${value}.`)
  }

  return value as LineNumber
}

const buildBaselineLineRoles = (culpritLine: LineNumber): [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole] =>
  lineNumbers.map((lineNumber) => {
    if (lineNumber === culpritLine) {
      return 'root-cause'
    }

    if (lineNumber < culpritLine) {
      return 'setup'
    }

    return lineNumber === culpritLine + 1 ? 'symptom' : 'safe-follow-up'
  }) as [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole]

const inferPatternFamilyId = (language: FixErrorSupportedLanguageId, item: FixErrorQuestionSpec): FixErrorPatternFamilyId => {
  const culpritSurface = normalizeSurface(item.lines[item.culpritLine - 1] ?? '')
  const surface = normalizeSurface(`${item.errorText.en} ${item.lines.join(' ')}`)

  if (shaderLanguageSet.has(language) && /(gl_fragcolor|gl_position|fragcolor|vertex|color\s*=|texture2d|texture\(|albedo|sampler|uv)/.test(culpritSurface)) {
    return 'shader-builtin'
  }

  if (fixErrorGameLanguageSet.has(language as GameLanguageId) && /(_ready|_process|start\(|update\(|preload\(|create\(|love\.draw|love\.update|on_message|tick\(|_physics_process|mainimage)\b/.test(culpritSurface)) {
    return 'engine-callback'
  }

  if (fixErrorGameLanguageSet.has(language as GameLanguageId) && /(getcomponent|game:getservice|msg\.post|go\.get|instance_create_layer|commands\.spawn|this\.add|this\.physics|\$gamevariables|\$gameswitches|sprite_|audio_|draw_|move_|add_child|queue_free|emit_signal|commands\.spawn|assetserver|timer\.|scene\.)/.test(culpritSurface)) {
    return 'engine-api'
  }

  if (/(no module named|cannot find module|cannot resolve module|package .* does not exist|unresolved import|unknown package|include file not found|cannot import name|require_relative|namespace .* could not be found|use of undeclared crate)/.test(surface)) {
    return 'module-import'
  }

  if (/(missing .* positional argument|too many arguments|wrong number of arguments|expected [0-9]+ arguments|not enough arguments|takes [0-9]+ positional arguments|cannot be applied to given types|argument count)/.test(surface)) {
    return 'arity'
  }

  if (/(queryselector|getelementbyid|findnode|nodepath|selector|missing node|node not found|unknown selector)/.test(surface)) {
    return 'selector-mismatch'
  }

  if (
    /(keyerror|unknown column|no such column|property .* does not exist|cannot resolve property|undefined property|named parameter .* doesn't exist|no field|no member named|unknown key)/.test(surface) ||
    (/cannot read properties of undefined/.test(surface) && /\.\w+/.test(culpritSurface))
  ) {
    return 'field-property'
  }

  if (/(null|none|nil|undefined is not an object|nullreference|optional value|nonetype|nil pointer)/.test(surface)) {
    return 'null-access'
  }

  if (/(index|range|bounds|out of range|outofbounds)/.test(surface)) {
    return 'range'
  }

  if (/(typeerror|type mismatch|incompatible types|cannot convert|mismatched types|unsupported operand|borrow|expected .* but found)/.test(surface)) {
    return 'type-mismatch'
  }

  if (
    /(attributeerror|nomethoderror|has no attribute|undefined method|cannot find symbol: method|is not a function|no such function|does not contain a definition for|no member named)/.test(surface) &&
    /(\.\w+\(|->\w+\(|::\w+\()/.test(culpritSurface)
  ) {
    return 'method-typo'
  }

  if (/(syntax|unexpected|parse error|parser|invalid syntax|indentationerror|mismatched input|missing ;|missing :|unclosed|unterminated|expected)/.test(surface)) {
    return 'syntax'
  }

  return 'name-typo'
}

const resolveFixErrorSpec = (language: FixErrorSupportedLanguageId, item: FixErrorQuestionSpec): ResolvedFixErrorQuestionSpec => {
  const familyId = item.familyId ?? inferPatternFamilyId(language, item)

  return {
    ...item,
    familyId,
    lineRoles: item.lineRoles ?? buildBaselineLineRoles(item.culpritLine),
    hintAnchor: item.hintAnchor ?? familyHintAnchors[familyId],
    guideTags: item.guideTags ?? familyGuideTags[familyId],
  }
}

const renderErrorText = (difficulty: Difficulty, original: LocalizedText, slotIndex: number): LocalizedText => {
  const prefix = errorPhasePrefixes[difficulty][slotIndex % errorPhasePrefixes[difficulty].length] ?? errorPhasePrefixes[difficulty][0]
  return bi(`${prefix.th} #${slotIndex + 1}: ${original.th}`, `${prefix.en} #${slotIndex + 1}: ${original.en}`)
}

const getLinePlan = (language: FixErrorSupportedLanguageId, difficulty: Difficulty, targetSize: number): LineNumber[] => {
  if (!fixErrorGameLanguageSet.has(language as GameLanguageId)) {
    if (targetSize !== FIX_ERROR_CORE_BANK_SIZE) {
      throw new Error(`Core fix-error banks must use ${FIX_ERROR_CORE_BANK_SIZE} items.`)
    }

    return [...coreLinePlanBase]
  }

  if (targetSize !== FIX_ERROR_GAME_BANK_SIZE) {
    throw new Error(`Game fix-error banks must use ${FIX_ERROR_GAME_BANK_SIZE} items.`)
  }

  const rotationSeed = fixErrorSupportedLanguageIds.indexOf(language) + (difficulty === 'hard' ? 2 : 0)
  return [...gameLinePlanBase, asLineNumber((rotationSeed % 4) + 1)]
}

const easyContextNotes = [
  'retry branch',
  'render path',
  'guard clause',
  'cache check',
  'fallback branch',
  'save flow',
  'sync step',
  'result pass',
] as const

const buildContextCandidates = (item: ResolvedFixErrorQuestionSpec) => {
  const before = item.lines
    .slice(0, item.culpritLine - 1)
    .map((line, index) => ({ id: `before-${index}`, line, origin: 'before' as const }))
  const after = item.lines
    .slice(item.culpritLine)
    .map((line, index) => ({ id: `after-${index}`, line, origin: 'after' as const }))

  return [...before, ...after]
}

const takeContextCandidate = (
  available: ContextCandidate[],
  preferredOrigins: readonly ('before' | 'after')[],
): ContextCandidate | null => {
  for (const origin of preferredOrigins) {
    const index = available.findIndex((candidate) => candidate.origin === origin)
    if (index >= 0) {
      return available.splice(index, 1)[0] ?? null
    }
  }

  return available.shift() ?? null
}

const addRoleMarker = (
  line: string,
  language: FixErrorSupportedLanguageId,
  role: Exclude<FixErrorLineRole, 'root-cause'>,
  markerIndex: number,
) => appendInlineMarker(line, language, nonRootRoleMarkers[role][markerIndex % nonRootRoleMarkers[role].length] ?? role)

const renderHintText = (
  item: ResolvedFixErrorQuestionSpec,
  difficulty: Difficulty,
  renderedLines: [string, string, string, string],
  culpritLine: LineNumber,
  lineRoles: [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole],
): LocalizedText => {
  const culpritFragment = hintFragment(renderedLines[culpritLine - 1])
  const symptomLine = lineRoles.findIndex((role) => role === 'symptom') + 1
  const symptomFragment = symptomLine > 0 ? hintFragment(renderedLines[symptomLine - 1]) : ''
  const familyLabel = fixErrorFamilyLabels[item.familyId]

  if (difficulty === 'hard' || item.hintAnchor === 'symptom-vs-root') {
    return bi(
      `${item.hint.th} แยกบรรทัดที่ดูเป็นอาการอย่าง \`${symptomFragment || culpritFragment}\` ออกจากบรรทัดที่ทำให้พังจริงอย่าง \`${culpritFragment}\` ให้ชัด`,
      `${item.hint.en} Separate the symptom-looking line such as \`${symptomFragment || culpritFragment}\` from the line that truly breaks the run, \`${culpritFragment}\`.`,
    )
  }

  if (item.hintAnchor === 'family') {
    return bi(
      `${item.hint.th} ให้คิดจากแพตเทิร์น ${familyLabel.th} แล้วค่อยผูกกลับมาที่ fragment \`${culpritFragment}\``,
      `${item.hint.en} Read it as a ${familyLabel.en} pattern, then anchor back to \`${culpritFragment}\`.`,
    )
  }

  return bi(
    `${item.hint.th} โฟกัส fragment \`${culpritFragment}\` ว่าเป็นจุดแรกที่ผิดจริง`,
    `${item.hint.en} Focus on \`${culpritFragment}\` as the first fragment that is truly wrong.`,
  )
}

const renderExplanationText = (
  item: ResolvedFixErrorQuestionSpec,
  difficulty: Difficulty,
  culpritLine: LineNumber,
  lineRoles: [FixErrorLineRole, FixErrorLineRole, FixErrorLineRole, FixErrorLineRole],
): LocalizedText => {
  const familyLabel = fixErrorFamilyLabels[item.familyId]
  const symptomLine = lineRoles.findIndex((role) => role === 'symptom') + 1

  if (difficulty === 'hard' && symptomLine > 0) {
    return bi(
      `${item.explanation.th} ข้อนี้เป็นแพตเทิร์น ${familyLabel.th} โดยบรรทัด ${culpritLine} คือ root cause ส่วนบรรทัด ${symptomLine} เป็นแค่อาการหรือเสียงรบกวนที่ถูกดันให้เด่น`,
      `${item.explanation.en} This is a ${familyLabel.en} pattern. Line ${culpritLine} is the root cause, while line ${symptomLine} is only a louder symptom or distraction.`,
    )
  }

  return bi(
    `${item.explanation.th} แพตเทิร์นนี้อยู่ในกลุ่ม ${familyLabel.th} และบรรทัด ${culpritLine} คือจุดแรกที่ทำให้ flow พังจริง`,
    `${item.explanation.en} This belongs to the ${familyLabel.en} family, and line ${culpritLine} is the first line that truly breaks the flow.`,
  )
}

const renderLineLayout = (
  language: FixErrorSupportedLanguageId,
  item: ResolvedFixErrorQuestionSpec,
  difficulty: Difficulty,
  culpritLine: LineNumber,
  slotIndex: number,
): ResolvedFixErrorQuestionSpec => {
  const renderedLines = ['', '', '', ''] as [string, string, string, string]
  const lineRoles = rolePlans[difficulty][culpritLine]
  const rootLine = item.lines[item.culpritLine - 1]
  const available = buildContextCandidates(item)

  lineRoles.forEach((role, index) => {
    if (role === 'root-cause') {
      renderedLines[index] = rootLine
      return
    }

    const preferredOrigins =
      role === 'setup'
        ? (['before', 'after'] as const)
        : role === 'symptom'
          ? (['after', 'before'] as const)
          : role === 'safe-follow-up'
            ? (['after', 'before'] as const)
            : (['before', 'after'] as const)
    const picked = takeContextCandidate(available, preferredOrigins)
    const baseLine = picked?.line ?? item.lines.find((line) => line !== rootLine) ?? 'pass'
    renderedLines[index] = addRoleMarker(baseLine, language, role, slotIndex + index)
  })

  const uniquenessIndex = lineRoles.findIndex((role) => role !== 'root-cause')
  if (uniquenessIndex >= 0) {
    renderedLines[uniquenessIndex] = appendInlineMarker(renderedLines[uniquenessIndex], language, `case-${slotIndex + 1}`)
  }

  return {
    ...item,
    culpritLine,
    lines: renderedLines,
    lineRoles,
    errorText: renderErrorText(difficulty, item.errorText, slotIndex),
    hint: renderHintText(item, difficulty, renderedLines, culpritLine, lineRoles),
    explanation: renderExplanationText(item, difficulty, culpritLine, lineRoles),
  }
}

const getSupplementalFixErrorSpecs = (language: FixErrorSupportedLanguageId): FixErrorQuestionSpec[] => {
  void language
  void specWithMeta
  void createWrongChoiceExplanation
  void createFixErrorQuestionHint
  void createFixErrorVariant
  void createHardFixErrorSpec
  void expandFixErrorItems
  return []
}

const createWrongChoiceExplanation = (wrongLine: number, culpritLine: number): LocalizedText =>
  wrongLine < culpritLine
    ? bi(
        `บรรทัด ${wrongLine} ยังเป็นแค่บริบทก่อนถึงจุดพังจริง ต้นเหตุหลักเริ่มที่บรรทัด ${culpritLine}`,
        `Line ${wrongLine} is still setup context. The actual failure starts at line ${culpritLine}.`,
      )
    : bi(
        `บรรทัด ${wrongLine} เป็นผลต่อเนื่องหรือโค้ดถัดจากจุดพัง ไม่ใช่ต้นเหตุแรก จุดที่ทำให้ error เริ่มคือบรรทัด ${culpritLine}`,
        `Line ${wrongLine} is downstream from the real issue. The first breaking statement is line ${culpritLine}.`,
      )

const createFixErrorQuestionHint = (item: FixErrorQuestionSpec, difficulty: Difficulty): LocalizedText => {
  const culpritFragment = hintFragment(item.lines[item.culpritLine - 1])

  if (difficulty === 'hard' || item.hint.th.includes(`\`${culpritFragment}\``) || item.hint.en.includes(`\`${culpritFragment}\``)) {
    return item.hint
  }

  return bi(
    `${item.hint.th} ให้โฟกัสบรรทัดที่มี \`${culpritFragment}\` เป็นพิเศษ`,
    `${item.hint.en} Focus especially on the line containing \`${culpritFragment}\`.`,
  )
}

const createRoleAwareWrongChoiceExplanation = (
  wrongLine: number,
  culpritLine: number,
  role: FixErrorLineRole,
): LocalizedText => {
  switch (role) {
    case 'setup':
      return bi(
        `บรรทัด ${wrongLine} ยังเป็นแค่ setup หรือการเตรียม state ก่อนถึงจุดพังจริง ต้นเหตุแรกอยู่ที่บรรทัด ${culpritLine}`,
        `Line ${wrongLine} is still setup context. The first real break starts at line ${culpritLine}.`,
      )
    case 'symptom':
      return bi(
        `บรรทัด ${wrongLine} เป็นอาการที่โผล่ตามมา ไม่ใช่จุดที่ทำให้ flow เริ่มเสียจริง ต้นเหตุตัวแรกอยู่ที่บรรทัด ${culpritLine}`,
        `Line ${wrongLine} is only a downstream symptom, not the first point of failure. The root cause starts at line ${culpritLine}.`,
      )
    case 'safe-follow-up':
      return bi(
        `บรรทัด ${wrongLine} เป็นโค้ดตามหลังหรือเส้นทางปลอดภัยที่เพิ่งได้รับ state ที่พังมาแล้ว จึงไม่ใช่ตัวเริ่มปัญหา`,
        `Line ${wrongLine} is a later follow-up or safe branch that only receives the broken state after the real issue.`,
      )
    case 'fallback':
      return bi(
        `บรรทัด ${wrongLine} เป็นทางเบี่ยงหรือ guard ประกอบฉากในข้อนี้ ยังไม่ใช่จุดแรกที่ทำให้ระบบล้ม`,
        `Line ${wrongLine} is a fallback or guard line in this layout, not the first line that breaks the run.`,
      )
    default:
      return bi(
        `บรรทัด ${wrongLine} ยังไม่ใช่ต้นเหตุแรก จุดที่ทำให้ error เริ่มจริงอยู่ที่บรรทัด ${culpritLine}`,
        `Line ${wrongLine} is not the first cause. The real failure begins at line ${culpritLine}.`,
      )
  }
}

const createQuestion = (
  language: FixErrorSupportedLanguageId,
  itemIndex: number,
  item: ResolvedFixErrorQuestionSpec,
  difficulty: Difficulty,
): FixErrorQuestionBankItem => {
  const choices = item.lines.map((line, index) => ({
    id: `line-${index + 1}`,
    label: lineLabel(index + 1),
    lineNumber: index + 1,
    fragment: lineFragment(line),
  })) as [FixErrorChoice, FixErrorChoice, FixErrorChoice, FixErrorChoice]

  const wrongChoices = Object.fromEntries(
    choices
      .filter((choice) => choice.lineNumber !== item.culpritLine)
      .map((choice) => [
        choice.id,
        createRoleAwareWrongChoiceExplanation(choice.lineNumber, item.culpritLine, item.lineRoles[choice.lineNumber - 1]),
      ]),
  )

  return {
    id: `fix-error-${language}-${itemIndex + 1}`,
    format: 'fix-error',
    track: getFixErrorTrack(language),
    language,
    difficulty,
    familyId: item.familyId,
    lineRoles: item.lineRoles,
    hintAnchor: item.hintAnchor,
    guideTags: item.guideTags,
    errorText: item.errorText,
    snippetText: item.lines.join('\n'),
    choices,
    answer: `line-${item.culpritLine}`,
    hint: item.hint,
    explanation: {
      correct: item.explanation,
      wrongChoices,
    },
  }
}

const createFixErrorVariant = (
  language: FixErrorSupportedLanguageId,
  item: FixErrorQuestionSpec,
  variantIndex: number,
): FixErrorQuestionSpec => {
  const lines = [...item.lines] as [string, string, string, string]
  const markerLine = item.culpritLine === 4 ? 1 : 4
  const contextNote = easyContextNotes[variantIndex % easyContextNotes.length]
  lines[markerLine - 1] = appendInlineMarker(lines[markerLine - 1], language, contextNote)

  return {
    ...item,
    lines,
    errorText: bi(
      `ระหว่าง flow รอบ ${variantIndex + 2} เกิดอาการนี้: ${item.errorText.th}`,
      `During pass ${variantIndex + 2}, this failure appears: ${item.errorText.en}`,
    ),
    hint: bi(
      `${item.hint.th} แล้วเทียบ clue นี้กับบรรทัดที่มี \`${hintFragment(item.lines[item.culpritLine - 1])}\` โดยตรง อย่าหลงกับบรรทัด setup รอบข้าง`,
      `${item.hint.en} Then compare that clue directly against \`${hintFragment(item.lines[item.culpritLine - 1])}\` instead of getting stuck on the surrounding setup lines.`,
    ),
    explanation: bi(
      `${item.explanation.th} แม้รอบนี้จะมีบริบทเพิ่ม แต่บรรทัดต้นเหตุแรกยังเป็นจุดเดิม`,
      `${item.explanation.en} Even with the added context in this run, the first breaking line is still the same spot.`,
    ),
  }
}

const createHardFixErrorHint = (item: FixErrorQuestionSpec, symptomLine: number): LocalizedText => {
  const culpritFragment = hintFragment(item.lines[item.culpritLine - 1])
  const symptomFragment = symptomLine === item.culpritLine ? '' : hintFragment(item.lines[symptomLine - 1])

  return symptomLine === item.culpritLine
    ? bi(
        `${item.hint.th} ให้ผูก error นี้กับบรรทัดที่มี \`${culpritFragment}\` ซึ่งเป็นจุดแรกที่ทำให้ flow เพี้ยน`,
        `${item.hint.en} Tie the error back to \`${culpritFragment}\`, which is the first line that actually corrupts the flow.`,
      )
    : bi(
        `${item.hint.th} ในข้อนี้ \`${symptomFragment}\` เป็นแค่อาการปลายทาง ให้ไล่กลับไปที่ \`${culpritFragment}\` ซึ่งเป็นบรรทัดแรกที่ทำให้พังจริง`,
        `${item.hint.en} In this variant, \`${symptomFragment}\` is only a downstream symptom. Trace back to \`${culpritFragment}\`, the first line that truly breaks the run.`,
      )
}

const createHardFixErrorSpec = (
  language: FixErrorSupportedLanguageId,
  item: FixErrorQuestionSpec,
  variantIndex: number,
): FixErrorQuestionSpec => {
  const lines = [...item.lines] as [string, string, string, string]
  const symptomLine: number = item.culpritLine === 4 ? 2 : 4
  const contextLine: number = item.culpritLine === 1 ? 3 : 1

  if (symptomLine !== item.culpritLine) {
    lines[symptomLine - 1] = appendInlineMarker(lines[symptomLine - 1], language, `symptom-only-${variantIndex + 1}`)
  }

  if (contextLine !== item.culpritLine && contextLine !== symptomLine) {
    lines[contextLine - 1] = appendInlineMarker(lines[contextLine - 1], language, `context-shift-${variantIndex + 1}`)
  }

  return {
    ...item,
    lines,
    errorText: bi(
      `เคสนี้ล่มตอนส่งผลลัพธ์ปลายทาง: ${item.errorText.th}`,
      `This run collapses during the downstream pass: ${item.errorText.en}`,
    ),
    hint: createHardFixErrorHint(item, symptomLine),
    explanation: bi(
      `${item.explanation.th} บรรทัดอื่นอาจดูเหมือนเป็นอาการตามมา แต่ต้นเหตุแรกยังอยู่ตรงจุดนี้`,
      `${item.explanation.en} Other lines may look like downstream symptoms, but this is still the first true breaking point.`,
    ),
  }
}

const expandFixErrorItems = (
  language: FixErrorSupportedLanguageId,
  items: FixErrorQuestionSpec[],
  targetSize: number,
  createVariant: (language: FixErrorSupportedLanguageId, item: FixErrorQuestionSpec, variantIndex: number) => FixErrorQuestionSpec,
) => {
  if (items.length >= targetSize) {
    return items.slice(0, targetSize)
  }

  const extrasNeeded = targetSize - items.length

  const extras = Array.from({ length: extrasNeeded }).map((_, index) => createVariant(language, items[index % items.length], index))

  return [...items, ...extras]
}

const fillPatternSpecsToSize = (
  language: FixErrorSupportedLanguageId,
  items: ResolvedFixErrorQuestionSpec[],
  targetSize: number,
): ResolvedFixErrorQuestionSpec[] => {
  if (items.length === 0) {
    throw new Error(`No fix-error patterns available for ${language}.`)
  }

  const uniqueItems = items.filter((item, index, source) => {
    const key = `${extractLogHead(item.errorText.en)}|||${normalizeSurface(item.lines[item.culpritLine - 1])}|||${item.familyId}`
    return source.findIndex((candidate) => `${extractLogHead(candidate.errorText.en)}|||${normalizeSurface(candidate.lines[candidate.culpritLine - 1])}|||${candidate.familyId}` === key) === index
  })

  const grouped = new Map<FixErrorPatternFamilyId, ResolvedFixErrorQuestionSpec[]>()
  for (const item of uniqueItems) {
    grouped.set(item.familyId, [...(grouped.get(item.familyId) ?? []), item])
  }

  const preferredFamilies: readonly FixErrorPatternFamilyId[] = fixErrorGameLanguageSet.has(language as GameLanguageId)
    ? ['engine-api', 'engine-callback', 'shader-builtin']
    : []

  const orderedFamilies = [
    ...preferredFamilies.filter((familyId) => grouped.has(familyId)),
    ...Array.from(grouped.keys()).filter((familyId) => !preferredFamilies.includes(familyId)),
  ]

  const selected: ResolvedFixErrorQuestionSpec[] = []
  let cursor = 0

  while (selected.length < targetSize) {
    const familyId = orderedFamilies[cursor % orderedFamilies.length] ?? orderedFamilies[0]
    const familyItems = grouped.get(familyId)
    if (!familyItems || familyItems.length === 0) {
      cursor += 1
      continue
    }

    const item = familyItems[Math.floor(cursor / orderedFamilies.length) % familyItems.length]
    selected.push(item)
    cursor += 1
  }

  return selected
}

const createDifficultyBank = (
  language: FixErrorSupportedLanguageId,
  items: FixErrorQuestionSpec[],
  targetSize: number,
  difficulty: Difficulty,
) => {
  const sourceSpecs = [...items, ...getSupplementalFixErrorSpecs(language)].map((item) => resolveFixErrorSpec(language, item))
  const expandedItems = fillPatternSpecsToSize(language, sourceSpecs, targetSize)
  const linePlan = getLinePlan(language, difficulty, targetSize)

  if (expandedItems.length !== targetSize || linePlan.length !== targetSize) {
    throw new Error(`Expected ${targetSize} ${difficulty} fix-error items for ${language} but received ${expandedItems.length}/${linePlan.length}.`)
  }

  return expandedItems.map((item, index) =>
    createQuestion(language, index, renderLineLayout(language, item, difficulty, linePlan[index] ?? 1, index), difficulty),
  )
}

const coreDifficultyPlan = undefined

const createBank = (
  language: FixErrorSupportedLanguageId,
  items: FixErrorQuestionSpec[],
  targetSize: number,
  _legacyDifficultyPlan?: unknown,
) => {
  void _legacyDifficultyPlan
  const easy = createDifficultyBank(language, items, targetSize, 'easy')
  const hard = createDifficultyBank(language, items, targetSize, 'hard')
  return { easy, hard } as const satisfies Record<Difficulty, FixErrorQuestionBankItem[]>
}

const createPythonBank = () => {
  const variableTypos = [
    { fn: 'render_total', good: 'total', bad: 'totla', call: '4' },
    { fn: 'greet', good: 'name', bad: 'nmae', call: '"Ada"' },
    { fn: 'bonus', good: 'score', bad: 'scroe', call: '9' },
  ] as const

  const methodTypos = [
    {
      setup: `colors = ["red", "blue"]`,
      call: `colors.appned("green")`,
      error: "AttributeError: 'list' object has no attribute 'appned'",
    },
    { setup: `text = "hello"`, call: 'print(text.upcase())', error: "AttributeError: 'str' object has no attribute 'upcase'" },
    { setup: `profile = {"name": "Ada"}`, call: 'print(profile.keyz())', error: "AttributeError: 'dict' object has no attribute 'keyz'" },
  ] as const

  const noneAccess = [
    { setup: 'profile = None', call: 'print(profile.get("name"))', error: "AttributeError: 'NoneType' object has no attribute 'get'" },
    { setup: 'items = None', call: 'print(items.append("x"))', error: "AttributeError: 'NoneType' object has no attribute 'append'" },
    { setup: 'user = None', call: 'print(user["id"])', error: "TypeError: 'NoneType' object is not subscriptable" },
  ] as const

  const outOfRange = [
    { setup: 'scores = [10, 20, 30]', call: 'print(scores[3])' },
    { setup: 'names = ["Ada", "Lin"]', call: 'print(names[2].upper())' },
    { setup: 'flags = [True, False]', call: 'print(flags[5])' },
  ] as const

  const syntaxErrors = [
    { line: 'if total > 2', body: '    print(total)', prelude: 'total = 4' },
    { line: 'for name in names', body: '    print(name)', prelude: 'names = ["Ada", "Lin"]' },
    { line: 'def show_total(total)', body: '    print(total)', prelude: 'value = 6' },
  ] as const

  return createBank('python', [
    ...variableTypos.map(({ fn, good, bad, call }) =>
      spec(
        `NameError: name '${bad}' is not defined`,
        [`def ${fn}(${good}):`, `    print(${bad} + 1)`, `    return ${good}`, `${fn}(${call})`],
        2,
        bi('เช็กว่าชื่อตัวแปรในฟังก์ชันสะกดตรงกับพารามิเตอร์ไหม', 'Check whether the variable name matches the function parameter.'),
        bi(`บรรทัดนี้เรียก ${bad} แต่ตัวที่มีจริงคือ ${good} จึงเกิด NameError ทันที`, `This line uses ${bad}, but the defined parameter is ${good}, so it throws a NameError immediately.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'print("ok")', 'print("done")'],
        2,
        bi('มองหาชื่อ method ที่สะกดแปลกจากของมาตรฐาน', 'Look for the method name that is misspelled.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่จริงบน object ตัวนั้น จึงแตกทันทีเมื่อรันถึงจุดนี้', 'This line calls a method that does not exist on that object, so it fails as soon as execution reaches it.'),
      ),
    ),
    ...noneAccess.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'print("fallback")', 'print("done")'],
        2,
        bi('เช็กค่าที่อาจเป็น None ก่อนบรรทัดที่เรียก method หรือ index', 'Check whether a value can be None before calling a method or index on it.'),
        bi('บรรทัดนี้พยายามใช้งานค่า None เหมือน object ปกติ จึงเป็นจุดที่ทำให้พังจริง', 'This line tries to use a None value like a normal object, so it is the real breaking point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'IndexError: list index out of range',
        [setup, 'print("range check")', call, 'print("done")'],
        3,
        bi('ดู index ที่ถูกเรียกว่ามันเกินจำนวนสมาชิกหรือไม่', 'Check whether the accessed index is outside the available range.'),
        bi('บรรทัดนี้เรียกตำแหน่งที่ไม่มีอยู่ใน list จึงเกิด IndexError ที่นี่โดยตรง', 'This line accesses a list position that does not exist, so the IndexError is triggered here directly.'),
      ),
    ),
    ...syntaxErrors.map(({ prelude, line, body }) =>
      spec(
        "SyntaxError: expected ':'",
        [prelude, line, body, 'print("done")'],
        2,
        bi('ดูบรรทัดที่เปิด if, for หรือ def ว่าขาด colon หรือไม่', 'Inspect the line that opens the if, for, or def block for a missing colon.'),
        bi('บรรทัดนี้เปิด block แต่ขาด : ปิดท้าย ทำให้ parser หยุดที่จุดนี้ทันที', 'This line opens a block but is missing the trailing colon, so the parser stops here immediately.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createJavaBank = () => {
  const variableTypos = [
    { type: 'int', good: 'total', bad: 'totla', init: '4' },
    { type: 'String', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'double', good: 'score', bad: 'scroe', init: '9.5' },
  ] as const

  const methodTypos = [
    { setup: 'String text = "hello";', call: 'System.out.println(text.trimm());', error: 'cannot find symbol: method trimm()' },
    { setup: 'List<String> names = List.of("Ada", "Lin");', call: 'System.out.println(names.szie());', error: 'cannot find symbol: method szie()' },
    { setup: 'String code = "abc";', call: 'System.out.println(code.toUppercase());', error: 'cannot find symbol: method toUppercase()' },
  ] as const

  const nullAccess = [
    { setup: 'String title = null;', call: 'System.out.println(title.length());' },
    { setup: 'String city = null;', call: 'System.out.println(city.toUpperCase());' },
    { setup: 'String email = null;', call: 'System.out.println(email.trim());' },
  ] as const

  const outOfRange = [
    { setup: 'int[] scores = {10, 20, 30};', call: 'System.out.println(scores[3]);' },
    { setup: 'String[] names = {"Ada", "Lin"};', call: 'System.out.println(names[2].toUpperCase());' },
    { setup: 'int[] flags = {1, 0};', call: 'System.out.println(flags[5]);' },
  ] as const

  const syntaxErrors = [
    { line: 'int total = 4', next: 'System.out.println(total);' },
    { line: 'String name = "Ada"', next: 'System.out.println(name);' },
    { line: 'double score = 9.5', next: 'System.out.println(score);' },
  ] as const

  return createBank('java', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `cannot find symbol: variable ${bad}`,
        [`${type} ${good} = ${init};`, `System.out.println(${bad});`, `System.out.println(${good});`, 'System.out.println("done");'],
        2,
        bi('เทียบชื่อตัวแปรที่ประกาศกับชื่อที่ถูกเรียกใช้', 'Compare the declared variable name with the one being used.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่ประกาศไว้คือ ${good} จึงคอมไพล์ไม่ผ่านตรงนี้`, `This line references ${bad}, but the declared variable is ${good}, so compilation fails here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'System.out.println("ok");', 'System.out.println("done");'],
        2,
        bi('มองหาชื่อ method ที่สะกดผิดจาก API จริง', 'Look for the method name that does not match the real API.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่ใน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line calls a method that does not exist on that type, so it is the source of the compile error.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'NullPointerException',
        [setup, call, 'System.out.println("fallback");', 'System.out.println("done");'],
        2,
        bi('เช็กค่าที่เป็น null ก่อนบรรทัดที่เรียก method', 'Check for a null value before the line that calls the method.'),
        bi('บรรทัดนี้ dereference ค่า null โดยตรง จึงเป็นจุดที่โยน NullPointerException', 'This line dereferences a null value directly, so it is where the NullPointerException is thrown.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'ArrayIndexOutOfBoundsException',
        [setup, 'System.out.println("len check");', call, 'System.out.println("done");'],
        3,
        bi('ดูเลข index ว่าเกินขนาด array หรือไม่', 'Inspect whether the index is beyond the array size.'),
        bi('บรรทัดนี้เข้าถึงตำแหน่งที่ไม่มีอยู่ใน array จึงแตกที่นี่', 'This line accesses an array position that does not exist, so the failure happens here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "';' expected",
        ['public class Demo {', `  ${line}`, `  ${next}`, '}'],
        2,
        bi('เช็กบรรทัดประกาศหรือ assignment ที่อาจลืม semicolon', 'Check the declaration or assignment line for a missing semicolon.'),
        bi('บรรทัดนี้ปิดคำสั่งไม่ครบเพราะขาด ; จึงทำให้ parser แจ้ง error ตรงนี้', 'This line does not terminate the statement with a semicolon, so the parser reports the error here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createJavaScriptBank = () => {
  const variableTypos = [
    { good: 'total', bad: 'totla', init: '4' },
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'const text = "hello"', call: 'console.log(text.trimm())', error: 'TypeError: text.trimm is not a function' },
    { setup: 'const names = ["Ada", "Lin"]', call: 'console.log(names.jion(","))', error: 'TypeError: names.jion is not a function' },
    { setup: 'const data = { id: 2 }', call: 'console.log(data.keyz())', error: 'TypeError: data.keyz is not a function' },
  ] as const

  const undefinedAccess = [
    { setup: 'const user = undefined', call: 'console.log(user.name)', error: "TypeError: Cannot read properties of undefined (reading 'name')" },
    { setup: 'const profile = undefined', call: 'console.log(profile.email)', error: "TypeError: Cannot read properties of undefined (reading 'email')" },
    { setup: 'const item = undefined', call: 'console.log(item.id)', error: "TypeError: Cannot read properties of undefined (reading 'id')" },
  ] as const

  const outOfRange = [
    { setup: 'const scores = [10, 20, 30]', call: 'console.log(scores[3].toFixed(0))' },
    { setup: 'const names = ["Ada", "Lin"]', call: 'console.log(names[2].toUpperCase())' },
    { setup: 'const flags = [true, false]', call: 'console.log(flags[5].valueOf())' },
  ] as const

  const syntaxErrors = [
    { line: 'if (total > 2 {', body: '  console.log(total)' },
    { line: 'for (const name of names {', body: '  console.log(name)' },
    { line: 'function showTotal(total {', body: '  return total' },
  ] as const

  return createBank('javascript', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `ReferenceError: ${bad} is not defined`,
        [`const ${good} = ${init}`, `console.log(${bad})`, `console.log(${good})`, 'console.log("done")'],
        2,
        bi('ดูว่าบรรทัดที่ใช้งานเรียกชื่อตัวแปรตรงกับที่ประกาศไว้หรือไม่', 'Check whether the used variable name matches the declaration.'),
        bi(`บรรทัดนี้อ้าง ${bad} ทั้งที่ตัวแปรที่มีจริงคือ ${good} จึงเกิด ReferenceError ที่นี่`, `This line references ${bad} even though the declared variable is ${good}, so the ReferenceError starts here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('มองหาชื่อ method ที่พิมพ์ผิดจากของจริง', 'Look for the method name that is spelled incorrectly.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่บนค่าตัวนั้น จึงเป็นต้นเหตุของ TypeError', 'This line calls a method that does not exist on that value, so it is the source of the TypeError.'),
      ),
    ),
    ...undefinedAccess.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("fallback")', 'console.log("done")'],
        2,
        bi('เช็กว่าค่าที่ถูกอ่าน property อาจเป็น undefined หรือไม่', 'Check whether the value being read from could be undefined.'),
        bi('บรรทัดนี้พยายามอ่าน property จาก undefined โดยตรง จึงแตกที่จุดนี้', 'This line tries to read a property from undefined directly, so the crash happens here.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        "TypeError: Cannot read properties of undefined",
        [setup, 'console.log("range check")', call, 'console.log("done")'],
        3,
        bi('ดู index ที่ถูกอ่านว่ามีสมาชิกจริงหรือไม่', 'Inspect whether the chosen index actually exists in the array.'),
        bi('บรรทัดนี้หยิบค่าจาก index ที่ไม่มีอยู่แล้วเรียก method ต่อ จึงเป็นจุดที่พังจริง', 'This line pulls an element from a missing index and then calls a method on it, so it is the real breaking point.'),
      ),
    ),
    ...syntaxErrors.map(({ line, body }) =>
      spec(
        "SyntaxError: Unexpected token '{'",
        ['const total = 4', line, body, 'console.log("done")'],
        2,
        bi('เช็กวงเล็บเปิดปิดในบรรทัดที่เปิด if, for หรือ function', 'Check the parentheses in the line that opens the if, for, or function.'),
        bi('บรรทัดนี้เปิดโครงสร้างแต่ปิดวงเล็บไม่ครบ จึงทำให้ parser หยุดที่นี่', 'This line opens a structure but does not close the parentheses correctly, so the parser stops here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createCsharpBank = () => {
  const variableTypos = [
    { type: 'int', good: 'total', bad: 'totla', init: '4' },
    { type: 'string', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'double', good: 'score', bad: 'scroe', init: '9.5' },
  ] as const

  const methodTypos = [
    { setup: 'var text = "hello";', call: 'Console.WriteLine(text.Trimm());', error: "'string' does not contain a definition for 'Trimm'" },
    { setup: 'var names = new[] { "Ada", "Lin" };', call: 'Console.WriteLine(names.Cout());', error: "'string[]' does not contain a definition for 'Cout'" },
    { setup: 'var user = new { Name = "Ada" };', call: 'Console.WriteLine(user.ToJsonn());', error: "does not contain a definition for 'ToJsonn'" },
  ] as const

  const nullAccess = [
    { setup: 'string? title = null;', call: 'Console.WriteLine(title.Length);' },
    { setup: 'string? city = null;', call: 'Console.WriteLine(city.ToUpper());' },
    { setup: 'string? email = null;', call: 'Console.WriteLine(email.Trim());' },
  ] as const

  const outOfRange = [
    { setup: 'var scores = new[] { 10, 20, 30 };', call: 'Console.WriteLine(scores[3]);' },
    { setup: 'var names = new[] { "Ada", "Lin" };', call: 'Console.WriteLine(names[2].ToUpper());' },
    { setup: 'var flags = new[] { true, false };', call: 'Console.WriteLine(flags[5]);' },
  ] as const

  const syntaxErrors = [
    { line: 'var total = 4', next: 'Console.WriteLine(total);' },
    { line: 'var name = "Ada"', next: 'Console.WriteLine(name);' },
    { line: 'var score = 9.5', next: 'Console.WriteLine(score);' },
  ] as const

  return createBank('csharp', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `CS0103: The name '${bad}' does not exist in the current context`,
        [`${type} ${good} = ${init};`, `Console.WriteLine(${bad});`, `Console.WriteLine(${good});`, 'Console.WriteLine("done");'],
        2,
        bi('เทียบชื่อที่ประกาศกับชื่อที่ถูกเรียกในบรรทัดใช้งาน', 'Compare the declared name with the one used on the failing line.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวที่ประกาศไว้คือ ${good} จึงเกิด CS0103 ตรงนี้`, `This line references ${bad}, but the declared name is ${good}, so CS0103 is triggered here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        `CS1061: ${error}`,
        [setup, call, 'Console.WriteLine("ok");', 'Console.WriteLine("done");'],
        2,
        bi('ดู method ที่ถูกเรียกว่าอยู่จริงบน type นั้นไหม', 'Check whether the called method really exists on that type.'),
        bi('บรรทัดนี้เรียก member ที่ไม่มีอยู่บนค่าตัวนั้น จึงเป็นต้นเหตุของ CS1061', 'This line calls a member that does not exist on that value, so it is the source of CS1061.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'NullReferenceException',
        [setup, call, 'Console.WriteLine("fallback");', 'Console.WriteLine("done");'],
        2,
        bi('เช็กว่าค่าที่เรียก property หรือ method อาจเป็น null', 'Check whether the value used for property or method access can be null.'),
        bi('บรรทัดนี้ dereference ค่า null ตรง ๆ จึงเป็นจุดที่โยน NullReferenceException', 'This line dereferences a null value directly, so it is where the NullReferenceException is thrown.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'IndexOutOfRangeException',
        [setup, 'Console.WriteLine("range check");', call, 'Console.WriteLine("done");'],
        3,
        bi('ดูเลข index ว่าเกินขนาด array หรือไม่', 'Inspect whether the index exceeds the array size.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่ใน array จึงเกิด IndexOutOfRangeException ที่นี่', 'This line reads an index that does not exist in the array, so IndexOutOfRangeException happens here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        'CS1002: ; expected',
        ['using System;', line, next, 'Console.WriteLine("done");'],
        2,
        bi('เช็กบรรทัด assignment หรือ declaration ว่าขาด ; ไหม', 'Check the assignment or declaration line for a missing semicolon.'),
        bi('บรรทัดนี้ปิดคำสั่งไม่ครบเพราะขาด ; จึงเป็นต้นตอของ parse error', 'This line leaves the statement unfinished because it is missing a semicolon, so it causes the parse error.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createCppBank = () => {
  const variableTypos = [
    { type: 'int', good: 'total', bad: 'totla', init: '4' },
    { type: 'std::string', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'double', good: 'score', bad: 'scroe', init: '9.5' },
  ] as const

  const methodTypos = [
    { setup: 'std::string text = "hello";', call: 'std::cout << text.trimm() << std::endl;', error: "no member named 'trimm' in 'std::string'" },
    { setup: 'std::vector<int> scores = {10, 20, 30};', call: 'std::cout << scores.puhs_back(40) << std::endl;', error: "no member named 'puhs_back' in 'std::vector<int>'" },
    { setup: 'std::string code = "abc";', call: 'std::cout << code.toUpper() << std::endl;', error: "no member named 'toUpper' in 'std::string'" },
  ] as const

  const nullAccess = [
    { setup: 'std::string* title = nullptr;', call: 'std::cout << title->size() << std::endl;' },
    { setup: 'std::string* city = nullptr;', call: 'std::cout << city->length() << std::endl;' },
    { setup: 'std::string* email = nullptr;', call: 'std::cout << email->substr(0, 2) << std::endl;' },
  ] as const

  const outOfRange = [
    { setup: 'std::vector<int> scores = {10, 20, 30};', call: 'std::cout << scores.at(3) << std::endl;' },
    { setup: 'std::vector<std::string> names = {"Ada", "Lin"};', call: 'std::cout << names.at(2) << std::endl;' },
    { setup: 'std::vector<int> flags = {1, 0};', call: 'std::cout << flags.at(5) << std::endl;' },
  ] as const

  const syntaxErrors = [
    { line: 'int total = 4', next: 'std::cout << total << std::endl;' },
    { line: 'std::string name = "Ada"', next: 'std::cout << name << std::endl;' },
    { line: 'double score = 9.5', next: 'std::cout << score << std::endl;' },
  ] as const

  return createBank('cpp', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `'${bad}' was not declared in this scope`,
        [`${type} ${good} = ${init};`, `std::cout << ${bad} << std::endl;`, `std::cout << ${good} << std::endl;`, 'return 0;'],
        2,
        bi('ดูว่าชื่อตัวแปรที่ใช้ตรงกับตัวที่ประกาศหรือไม่', 'Check whether the variable name in use matches the declared one.'),
        bi(`บรรทัดนี้อ้าง ${bad} ทั้งที่ตัวแปรที่มีจริงคือ ${good} จึงคอมไพล์ไม่ผ่านตรงนี้`, `This line references ${bad} even though the declared variable is ${good}, so compilation fails here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'std::cout << "ok" << std::endl;', 'return 0;'],
        2,
        bi('มองหาชื่อ member function ที่สะกดผิด', 'Look for the member function name that is misspelled.'),
        bi('บรรทัดนี้เรียก member function ที่ไม่มีอยู่ใน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line calls a member function that does not exist on that type, so it causes the compile error.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'Segmentation fault (null pointer dereference)',
        [setup, call, 'std::cout << "fallback" << std::endl;', 'return 0;'],
        2,
        bi('เช็ก pointer ว่าเป็น nullptr ก่อนใช้ ->', 'Check whether the pointer is nullptr before using ->.'),
        bi('บรรทัดนี้ dereference pointer ที่เป็น nullptr จึงเป็นจุดที่ทำให้โปรแกรมล้ม', 'This line dereferences a nullptr, so it is where the program crashes.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'std::out_of_range',
        [setup, 'std::cout << "range check" << std::endl;', call, 'return 0;'],
        3,
        bi('ดูเลข index ใน at(...) ว่าเกินจำนวนสมาชิกไหม', 'Inspect the index in at(...) and see whether it exceeds the available elements.'),
        bi('บรรทัดนี้เรียก at(...) ด้วย index ที่ไม่มีอยู่ใน vector จึงโยน std::out_of_range ที่นี่', 'This line calls at(...) with an index that does not exist in the vector, so std::out_of_range is thrown here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "expected ';' after expression",
        ['#include <iostream>', line, next, 'return 0;'],
        2,
        bi('เช็กบรรทัด declaration หรือ assignment ว่าขาด ; ท้ายบรรทัด', 'Check the declaration or assignment line for a missing semicolon.'),
        bi('บรรทัดนี้ปิดคำสั่งไม่ครบเพราะขาด ; ทำให้ parser แจ้ง error ที่จุดนี้', 'This line leaves the statement unfinished because it is missing a semicolon, so the parser reports the error here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createDartBank = () => {
  const variableTypos = [
    { type: 'int', good: 'total', bad: 'totla', init: '4' },
    { type: 'String', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'double', good: 'score', bad: 'scroe', init: '9.5' },
  ] as const

  const methodTypos = [
    { setup: 'final text = "hello";', call: 'print(text.trimm());', error: "The method 'trimm' isn't defined for the type 'String'." },
    { setup: 'final names = ["Ada", "Lin"];', call: 'print(names.jion(","));', error: "The method 'jion' isn't defined for the type 'List<String>'." },
    { setup: 'final code = "abc";', call: 'print(code.toUpper());', error: "The method 'toUpper' isn't defined for the type 'String'." },
  ] as const

  const nullAccess = [
    { setup: 'String? title = null;', call: 'print(title!.length);' },
    { setup: 'String? city = null;', call: 'print(city!.toUpperCase());' },
    { setup: 'String? email = null;', call: 'print(email!.trim());' },
  ] as const

  const outOfRange = [
    { setup: 'final scores = [10, 20, 30];', call: 'print(scores[3]);' },
    { setup: 'final names = ["Ada", "Lin"];', call: 'print(names[2].toUpperCase());' },
    { setup: 'final flags = [true, false];', call: 'print(flags[5]);' },
  ] as const

  const syntaxErrors = [
    { line: 'final total = 4', next: 'print(total);' },
    { line: 'final name = "Ada"', next: 'print(name);' },
    { line: 'final score = 9.5', next: 'print(score);' },
  ] as const

  return createBank('dart', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `Undefined name '${bad}'.`,
        [`${type} ${good} = ${init};`, `print(${bad});`, `print(${good});`, 'print("done");'],
        2,
        bi('เทียบชื่อที่ประกาศกับชื่อที่บรรทัดนี้เรียกใช้', 'Compare the declared name with the one used on this line.'),
        bi(`บรรทัดนี้อ้าง ${bad} ทั้งที่ประกาศไว้เป็น ${good} จึงเกิด Undefined name ตรงนี้`, `This line references ${bad}, but the declaration uses ${good}, so the undefined-name error starts here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'print("ok");', 'print("done");'],
        2,
        bi('มองหาชื่อ method ที่สะกดไม่ตรงกับของจริง', 'Look for the method name that does not match the real one.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีใน type นั้น จึงทำให้ analyzer ฟ้องที่จุดนี้', 'This line calls a method that does not exist on that type, so the analyzer flags it here.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'Null check operator used on a null value',
        [setup, call, 'print("fallback");', 'print("done");'],
        2,
        bi('เช็กว่า ! ถูกใช้กับค่าที่อาจเป็น null หรือไม่', 'Check whether ! is being used on a value that can still be null.'),
        bi('บรรทัดนี้บังคับ unwrap ค่า null ด้วย ! จึงเป็นจุดที่แอปล้ม', 'This line force-unwraps a null value with !, so it is where the app crashes.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'RangeError (index): Invalid value',
        [setup, 'print("range check");', call, 'print("done");'],
        3,
        bi('ดูเลข index ว่าเกินขอบเขตของ list หรือไม่', 'Inspect whether the index is outside the list bounds.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่ใน list จึงโยน RangeError ตรงนี้', 'This line accesses an index that does not exist in the list, so RangeError is thrown here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "Expected ';' after this.",
        ['void main() {', `  ${line}`, `  ${next}`, '}'],
        2,
        bi('เช็กบรรทัดประกาศค่าใน main ว่าปิดด้วย ; หรือยัง', 'Check whether the value declaration inside main ends with a semicolon.'),
        bi('บรรทัดนี้ปิดคำสั่งไม่ครบเพราะขาด ; จึงเป็นต้นตอของ parse error', 'This line does not finish the statement because it is missing a semicolon, so it causes the parse error.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createGoBank = () => {
  const variableTypos = [
    { good: 'total', bad: 'totla', init: '4' },
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'text := "hello"', call: 'fmt.Println(text.Trimm())', error: 'text.Trimm undefined (type string has no field or method Trimm)' },
    { setup: 'user := Person{Name: "Ada"}', call: 'fmt.Println(user.Nmae)', error: 'user.Nmae undefined (type Person has no field or method Nmae)' },
    { setup: 'items := []int{1, 2, 3}', call: 'fmt.Println(items.Len())', error: 'items.Len undefined (type []int has no field or method Len)' },
  ] as const

  const nilAccess = [
    { setup: 'var profile *Profile', call: 'fmt.Println(profile.Name)' },
    { setup: 'var user *User', call: 'fmt.Println(user.Email)' },
    { setup: 'var city *City', call: 'fmt.Println(city.Title)' },
  ] as const

  const outOfRange = [
    { setup: 'scores := []int{10, 20, 30}', call: 'fmt.Println(scores[3])' },
    { setup: 'names := []string{"Ada", "Lin"}', call: 'fmt.Println(names[2])' },
    { setup: 'flags := []bool{true, false}', call: 'fmt.Println(flags[5])' },
  ] as const

  const syntaxErrors = [
    { line: 'if total > 2', body: 'fmt.Println(total)' },
    { line: 'for _, name := range names', body: 'fmt.Println(name)' },
    { line: 'func showTotal(total int)', body: 'fmt.Println(total)' },
  ] as const

  return createBank('go', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `undefined: ${bad}`,
        [`${good} := ${init}`, `fmt.Println(${bad})`, `fmt.Println(${good})`, 'fmt.Println("done")'],
        2,
        bi('ดูชื่อ identifier ที่ถูกใช้งานว่าเขียนตรงกับตอนประกาศไหม', 'Check whether the used identifier matches the declaration.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่ประกาศจริงคือ ${good} จึงคอมไพล์ไม่ผ่านตรงนี้`, `This line references ${bad}, but the actual declared variable is ${good}, so compilation fails here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'fmt.Println("ok")', 'fmt.Println("done")'],
        2,
        bi('มองหาฟิลด์หรือ method ที่ไม่มีอยู่จริงบน type นั้น', 'Look for the field or method that does not really exist on that type.'),
        bi('บรรทัดนี้เรียก field หรือ method ที่ไม่มีใน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line uses a field or method that does not exist on that type, so it causes the compile error.'),
      ),
    ),
    ...nilAccess.map(({ setup, call }) =>
      spec(
        'panic: runtime error: invalid memory address or nil pointer dereference',
        [setup, call, 'fmt.Println("fallback")', 'fmt.Println("done")'],
        2,
        bi('เช็ก pointer ว่าเป็น nil ก่อนอ่าน field', 'Check whether the pointer is nil before reading its field.'),
        bi('บรรทัดนี้ dereference pointer ที่ยังเป็น nil จึงทำให้ panic ที่จุดนี้', 'This line dereferences a pointer that is still nil, so the panic happens here.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'panic: runtime error: index out of range',
        [setup, 'fmt.Println("range check")', call, 'fmt.Println("done")'],
        3,
        bi('ดูเลข index ว่าเกินขนาด slice หรือไม่', 'Inspect whether the index is larger than the slice length.'),
        bi('บรรทัดนี้เข้าถึงตำแหน่งที่ไม่มีอยู่ใน slice จึงเป็นจุดที่ panic จริง', 'This line accesses a position that does not exist in the slice, so it is the actual panic point.'),
      ),
    ),
    ...syntaxErrors.map(({ line, body }) =>
      spec(
        "syntax error: unexpected newline, expected {",
        ['package main', line, body, 'fmt.Println("done")'],
        2,
        bi('เช็กบรรทัดที่เปิด if, for หรือ func ว่าขาด { หรือไม่', 'Check whether the line opening if, for, or func is missing { .'),
        bi('บรรทัดนี้เปิดโครงสร้างแต่ไม่ใส่ { จึงทำให้ parser ฟ้องตรงนี้ทันที', 'This line opens a structure but omits {, so the parser reports the error right here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createKotlinBank = () => {
  const variableTypos = [
    { type: 'val', good: 'total', bad: 'totla', init: '4' },
    { type: 'val', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'val', good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'val text = "hello"', call: 'println(text.trimm())', error: 'Unresolved reference: trimm' },
    { setup: 'val names = listOf("Ada", "Lin")', call: 'println(names.jionToString(","))', error: 'Unresolved reference: jionToString' },
    { setup: 'val code = "abc"', call: 'println(code.toUpper())', error: 'Unresolved reference: toUpper' },
  ] as const

  const nullAccess = [
    { setup: 'val title: String? = null', call: 'println(title!!.length)' },
    { setup: 'val city: String? = null', call: 'println(city!!.uppercase())' },
    { setup: 'val email: String? = null', call: 'println(email!!.trim())' },
  ] as const

  const outOfRange = [
    { setup: 'val scores = listOf(10, 20, 30)', call: 'println(scores[3])' },
    { setup: 'val names = listOf("Ada", "Lin")', call: 'println(names[2].uppercase())' },
    { setup: 'val flags = listOf(true, false)', call: 'println(flags[5])' },
  ] as const

  const syntaxErrors = [
    { line: 'val total = 4)', next: 'println(total)' },
    { line: 'val name = "Ada")', next: 'println(name)' },
    { line: 'val score = 9)', next: 'println(score)' },
  ] as const

  return createBank('kotlin', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `Unresolved reference: ${bad}`,
        [`${type} ${good} = ${init}`, `println(${bad})`, `println(${good})`, 'println("done")'],
        2,
        bi('เช็กว่าชื่อที่บรรทัดนี้เรียกตรงกับตัวแปรที่ประกาศไว้ไหม', 'Check whether the name used on this line matches the declared variable.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรจริงคือ ${good} จึงเกิด Unresolved reference ที่นี่`, `This line references ${bad}, but the real variable is ${good}, so the unresolved-reference error starts here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'println("ok")', 'println("done")'],
        2,
        bi('ดูชื่อ function/member ว่าสะกดถูกหรือไม่', 'Check whether the function or member name is spelled correctly.'),
        bi('บรรทัดนี้เรียก member ที่ไม่มีอยู่ใน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line calls a member that does not exist on that type, so it causes the compile error.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'NullPointerException',
        [setup, call, 'println("fallback")', 'println("done")'],
        2,
        bi('เช็กว่า !! ถูกใช้กับค่าที่อาจเป็น null หรือไม่', 'Check whether !! is being used on a value that can still be null.'),
        bi('บรรทัดนี้บังคับ unwrap ค่า null ด้วย !! จึงเป็นจุดที่แอปล้มจริง', 'This line force-unwraps a null value with !!, so it is the real crash point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'IndexOutOfBoundsException',
        [setup, 'println("range check")', call, 'println("done")'],
        3,
        bi('ดูเลข index ว่าเกินจำนวนสมาชิกใน list หรือไม่', 'Inspect whether the index is outside the list size.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่ใน list จึงเกิด IndexOutOfBoundsException ที่นี่', 'This line accesses an index that does not exist in the list, so IndexOutOfBoundsException occurs here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        'Expecting an element',
        ['fun main() {', `  ${line}`, `  ${next}`, '}'],
        2,
        bi('เช็กบรรทัด declaration ว่ามีวงเล็บหรืออักขระเกินเข้ามาไหม', 'Inspect the declaration line for an extra bracket or stray character.'),
        bi('บรรทัดนี้มีอักขระปิดเกินเข้ามา ทำให้ parser อ่านต่อไม่ได้และหยุดที่นี่', 'This line contains an extra closing character, so the parser cannot continue and stops here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createSwiftBank = () => {
  const variableTypos = [
    { good: 'total', bad: 'totla', init: '4' },
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'let text = "hello"', call: 'print(text.trimm())', error: "value of type 'String' has no member 'trimm'" },
    { setup: 'let names = ["Ada", "Lin"]', call: 'print(names.jion(separator: ","))', error: "value of type '[String]' has no member 'jion'" },
    { setup: 'let code = "abc"', call: 'print(code.toUpper())', error: "value of type 'String' has no member 'toUpper'" },
  ] as const

  const nilAccess = [
    { setup: 'let title: String? = nil', call: 'print(title!.count)' },
    { setup: 'let city: String? = nil', call: 'print(city!.uppercased())' },
    { setup: 'let email: String? = nil', call: 'print(email!.trimmingCharacters(in: .whitespaces))' },
  ] as const

  const outOfRange = [
    { setup: 'let scores = [10, 20, 30]', call: 'print(scores[3])' },
    { setup: 'let names = ["Ada", "Lin"]', call: 'print(names[2].uppercased())' },
    { setup: 'let flags = [true, false]', call: 'print(flags[5])' },
  ] as const

  const syntaxErrors = [
    { line: 'let total = 4)', next: 'print(total)' },
    { line: 'let name = "Ada")', next: 'print(name)' },
    { line: 'let score = 9)', next: 'print(score)' },
  ] as const

  return createBank('swift', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `cannot find '${bad}' in scope`,
        [`let ${good} = ${init}`, `print(${bad})`, `print(${good})`, 'print("done")'],
        2,
        bi('ดูว่าชื่อที่เรียกใช้ตรงกับตัวแปรที่ประกาศไว้ไหม', 'Check whether the used name matches the declared variable.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่อยู่ใน scope จริงคือ ${good} จึงฟ้องที่นี่`, `This line references ${bad}, but the variable actually in scope is ${good}, so the error is reported here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'print("ok")', 'print("done")'],
        2,
        bi('มองหา member ที่สะกดผิดจาก API จริง', 'Look for the member name that is misspelled from the real API.'),
        bi('บรรทัดนี้เรียก member ที่ไม่มีอยู่ใน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line calls a member that does not exist on that type, so it is the source of the compile error.'),
      ),
    ),
    ...nilAccess.map(({ setup, call }) =>
      spec(
        'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
        [setup, call, 'print("fallback")', 'print("done")'],
        2,
        bi('เช็กว่า ! ถูกใช้กับ Optional ที่ยังเป็น nil หรือไม่', 'Check whether ! is being used on an Optional that is still nil.'),
        bi('บรรทัดนี้ force unwrap ค่า nil ด้วย ! จึงทำให้โปรแกรมล้มที่จุดนี้', 'This line force-unwraps a nil value with !, so the program crashes at this point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'Fatal error: Index out of range',
        [setup, 'print("range check")', call, 'print("done")'],
        3,
        bi('ดูเลข index ว่าเกินขนาด array หรือไม่', 'Inspect whether the index is beyond the array size.'),
        bi('บรรทัดนี้เข้าถึงตำแหน่งที่ไม่มีอยู่ใน array จึงเป็นจุดที่เกิด fatal error', 'This line accesses a position that does not exist in the array, so it is where the fatal error occurs.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "consecutive statements on a line must be separated by ';'",
        ['func run() {', `  ${line}`, `  ${next}`, '}'],
        2,
        bi('เช็กบรรทัด declaration ว่ามีวงเล็บปิดเกินหรือ syntax แปลกเพิ่มเข้ามาไหม', 'Inspect the declaration line for an extra closing bracket or stray syntax.'),
        bi('บรรทัดนี้มีอักขระปิดเกิน ทำให้ parser แยก statement ผิดและแจ้ง error ตรงนี้', 'This line contains an extra closing character, so the parser splits the statement incorrectly and reports the error here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createRubyBank = () => {
  const variableTypos = [
    { good: 'total', bad: 'totla', init: '4' },
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'text = "hello"', call: 'puts text.upcasee', error: "undefined method `upcasee' for \"hello\":String" },
    { setup: 'names = ["Ada", "Lin"]', call: 'puts names.lenght', error: "undefined method `lenght' for [\"Ada\", \"Lin\"]:Array" },
    { setup: 'profile = { name: "Ada" }', call: 'puts profile.keyz', error: "undefined method `keyz' for {:name=>\"Ada\"}:Hash" },
  ] as const

  const nilAccess = [
    { setup: 'title = nil', call: 'puts title.length' },
    { setup: 'city = nil', call: 'puts city.upcase' },
    { setup: 'email = nil', call: 'puts email.strip' },
  ] as const

  const outOfRange = [
    { setup: 'scores = [10, 20, 30]', call: 'puts scores.fetch(3)' },
    { setup: 'names = ["Ada", "Lin"]', call: 'puts names.fetch(2).upcase' },
    { setup: 'flags = [true, false]', call: 'puts flags.fetch(5)' },
  ] as const

  const syntaxErrors = [
    { line: 'if total > 2', body: '  puts total', tail: 'puts "done"' },
    { line: 'def show_total(total)', body: '  puts total', tail: 'puts "done"' },
    { line: 'items.each do |item|', body: '  puts item', tail: 'puts "done"' },
  ] as const

  return createBank('ruby', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `undefined local variable or method \`${bad}'`,
        [`${good} = ${init}`, `puts ${bad}`, `puts ${good}`, 'puts "done"'],
        2,
        bi('ดูว่าชื่อ local variable ที่เรียกใช้ตรงกับตัวที่ประกาศไหม', 'Check whether the used local variable name matches the declared one.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ local variable จริงคือ ${good} จึงเป็นต้นเหตุของ NameError`, `This line references ${bad}, but the real local variable is ${good}, so it causes the NameError.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'puts "ok"', 'puts "done"'],
        2,
        bi('มองหาชื่อ method ที่สะกดผิดจากของจริง', 'Look for the method name that is spelled incorrectly.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีบน object ตัวนั้น จึงทำให้เกิด NoMethodError ที่นี่', 'This line calls a method that does not exist on that object, so it raises NoMethodError here.'),
      ),
    ),
    ...nilAccess.map(({ setup, call }) =>
      spec(
        'undefined method for nil:NilClass',
        [setup, call, 'puts "fallback"', 'puts "done"'],
        2,
        bi('เช็กว่าค่าก่อนหน้าอาจเป็น nil ก่อนเรียก method', 'Check whether the earlier value can be nil before calling a method.'),
        bi('บรรทัดนี้เรียก method บนค่า nil โดยตรง จึงเป็นจุดที่พังจริง', 'This line calls a method directly on nil, so it is the real breaking point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'IndexError',
        [setup, 'puts "range check"', call, 'puts "done"'],
        3,
        bi('ดู index ใน fetch ว่าเกินจำนวนสมาชิกหรือไม่', 'Inspect the index in fetch and check whether it exceeds the available elements.'),
        bi('บรรทัดนี้ใช้ fetch กับ index ที่ไม่มีอยู่ จึงเกิด IndexError ที่นี่', 'This line uses fetch with an index that does not exist, so IndexError is raised here.'),
      ),
    ),
    ...syntaxErrors.map(({ line, body, tail }) =>
      spec(
        'syntax error, unexpected end-of-input',
        ['total = 4', line, body, tail],
        2,
        bi('ดูบรรทัดที่เปิด if, def หรือ do ว่ามี end ปิดครบหรือไม่', 'Inspect the line that opens if, def, or do and check whether the closing end is missing.'),
        bi('บรรทัดนี้เปิด block แต่ไม่มี end ปิดให้ครบ จึงทำให้ parser ไปสุดไฟล์แล้ว error', 'This line opens a block without a matching end, so the parser reaches the end of the file and errors out.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createJsxBank = () => {
  const variableTypos = [
    { good: 'title', bad: 'titlle' },
    { good: 'name', bad: 'nmae' },
    { good: 'count', bad: 'counnt' },
  ] as const

  const methodTypos = [
    { setup: 'const items = ["Ada", "Lin"]', call: 'return <ul>{items.mapp((item) => <li key={item}>{item}</li>)}</ul>', error: 'TypeError: items.mapp is not a function' },
    { setup: 'const text = "hello"', call: 'return <p>{text.trimm()}</p>', error: 'TypeError: text.trimm is not a function' },
    { setup: 'const tags = ["js", "ts"]', call: 'return <div>{tags.jion(", ")}</div>', error: 'TypeError: tags.jion is not a function' },
  ] as const

  const undefinedAccess = [
    { setup: 'const user = undefined', call: 'return <p>{user.name}</p>', error: "TypeError: Cannot read properties of undefined (reading 'name')" },
    { setup: 'const profile = undefined', call: 'return <p>{profile.email}</p>', error: "TypeError: Cannot read properties of undefined (reading 'email')" },
    { setup: 'const item = undefined', call: 'return <p>{item.id}</p>', error: "TypeError: Cannot read properties of undefined (reading 'id')" },
  ] as const

  const outOfRange = [
    { setup: 'const tags = ["js", "ts"]', call: 'return <p>{tags[2].toUpperCase()}</p>' },
    { setup: 'const names = ["Ada", "Lin"]', call: 'return <p>{names[3].toLowerCase()}</p>' },
    { setup: 'const levels = ["easy", "hard"]', call: 'return <p>{levels[5].toUpperCase()}</p>' },
  ] as const

  const syntaxErrors = [
    { line: 'return <section><h1>{title}</section>' },
    { line: 'return <div><span>{name}</div>' },
    { line: 'return <main><p>{count}</main>' },
  ] as const

  return createBank('jsx', [
    ...variableTypos.map(({ good, bad }) =>
      spec(
        `ReferenceError: ${bad} is not defined`,
        [`const ${good} = "Demo"`, `return <h1>{${bad}}</h1>`, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('เช็กชื่อค่าที่ถูกฝังใน { } ว่าตรงกับตัวแปรที่ประกาศไหม', 'Check whether the value inside { } matches the declared variable name.'),
        bi(`บรรทัดนี้ฝัง ${bad} ลงใน JSX แต่ตัวแปรที่มีจริงคือ ${good} จึงเกิด ReferenceError ตรงนี้`, `This line injects ${bad} into JSX, but the real variable is ${good}, so the ReferenceError starts here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('มองหาชื่อ method ใน expression ของ JSX ที่อาจสะกดผิด', 'Look for the method name inside the JSX expression that may be misspelled.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่บนค่าตัวนั้น จึงเป็นต้นเหตุของ TypeError', 'This line calls a method that does not exist on that value, so it is the source of the TypeError.'),
      ),
    ),
    ...undefinedAccess.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("fallback")', 'console.log("done")'],
        2,
        bi('เช็ก object ที่ถูกอ่าน property ใน JSX ว่าอาจเป็น undefined', 'Check whether the object being read in JSX could be undefined.'),
        bi('บรรทัดนี้อ่าน property จาก undefined ตรง ๆ ใน JSX จึงพังที่จุดนี้', 'This line reads a property directly from undefined inside JSX, so it fails at this point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        "TypeError: Cannot read properties of undefined",
        [setup, 'console.log("range check")', call, 'console.log("done")'],
        3,
        bi('ดู index ที่ดึงไป render ว่าเกินจำนวนสมาชิกหรือไม่', 'Inspect whether the rendered index goes beyond the available items.'),
        bi('บรรทัดนี้ดึงสมาชิกที่ไม่มีอยู่แล้วเรียก method ต่อใน JSX จึงเป็นต้นเหตุจริง', 'This line pulls a missing item and then calls a method on it in JSX, so it is the real culprit.'),
      ),
    ),
    ...syntaxErrors.map(({ line }) =>
      spec(
        'Expected corresponding JSX closing tag',
        ['const title = "Demo"', line, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('เช็กแท็กที่เปิดกับแท็กที่ปิดว่าเป็นคู่เดียวกันหรือไม่', 'Check whether the opened and closed tags actually match.'),
        bi('บรรทัดนี้ปิด JSX tag ไม่ตรงกับที่เปิดไว้ จึงทำให้ parser แจ้ง error ตรงนี้', 'This line closes a JSX tag that does not match the opening tag, so the parser reports the error here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createTypeScriptBank = () => {
  const variableTypos = [
    { type: 'number', good: 'total', bad: 'totla', init: '4' },
    { type: 'string', good: 'name', bad: 'nmae', init: '"Ada"' },
    { type: 'number', good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'const text: string = "hello"', call: 'console.log(text.trimm())', error: "Property 'trimm' does not exist on type 'string'." },
    { setup: 'const names: string[] = ["Ada", "Lin"]', call: 'console.log(names.jion(","))', error: "Property 'jion' does not exist on type 'string[]'." },
    { setup: 'const code: string = "abc"', call: 'console.log(code.toUpper())', error: "Property 'toUpper' does not exist on type 'string'." },
  ] as const

  const undefinedAccess = [
    { setup: 'const user: { name: string } | undefined = undefined', call: 'console.log(user.name)', error: "Object is possibly 'undefined'." },
    { setup: 'const profile: { email: string } | undefined = undefined', call: 'console.log(profile.email)', error: "Object is possibly 'undefined'." },
    { setup: 'const item: { id: number } | undefined = undefined', call: 'console.log(item.id)', error: "Object is possibly 'undefined'." },
  ] as const

  const outOfRange = [
    { setup: 'const scores: number[] = [10, 20, 30]', call: 'console.log(scores[3].toFixed(0))' },
    { setup: 'const names: string[] = ["Ada", "Lin"]', call: 'console.log(names[2].toUpperCase())' },
    { setup: 'const flags: boolean[] = [true, false]', call: 'console.log(flags[5].valueOf())' },
  ] as const

  const syntaxErrors = [
    { line: 'function showTotal(total: number {' },
    { line: 'for (const name of names {' },
    { line: 'if (total > 2 {' },
  ] as const

  return createBank('typescript', [
    ...variableTypos.map(({ type, good, bad, init }) =>
      spec(
        `Cannot find name '${bad}'.`,
        [`const ${good}: ${type} = ${init}`, `console.log(${bad})`, `console.log(${good})`, 'console.log("done")'],
        2,
        bi('เทียบชื่อที่ถูกใช้งานกับตัวแปรที่ประกาศไว้พร้อม type', 'Compare the used name with the declared typed variable.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่ประกาศคือ ${good} จึงเกิด Cannot find name ตรงนี้`, `This line references ${bad}, but the declared variable is ${good}, so the cannot-find-name error begins here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('มองหาชื่อ property หรือ method ที่ไม่มีใน type นั้น', 'Look for the property or method name that does not exist on that type.'),
        bi('บรรทัดนี้เรียก member ที่ไม่มีอยู่ใน type นั้น จึงเป็นต้นเหตุของ TypeScript error', 'This line calls a member that does not exist on that type, so it is the source of the TypeScript error.'),
      ),
    ),
    ...undefinedAccess.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("fallback")', 'console.log("done")'],
        2,
        bi('เช็ก union ที่มี undefined ก่อนอ่าน property', 'Check the union that can still be undefined before reading a property.'),
        bi('บรรทัดนี้อ่าน property จากค่าที่ type ยังบอกว่าอาจเป็น undefined จึงฟ้องที่นี่', 'This line reads a property from a value whose type can still be undefined, so the checker flags it here.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        "TypeError: Cannot read properties of undefined",
        [setup, 'console.log("range check")', call, 'console.log("done")'],
        3,
        bi('ดู index ว่าอาจคืน undefined ก่อนเรียก method ต่อหรือไม่', 'Check whether the index access can yield undefined before chaining a method.'),
        bi('บรรทัดนี้หยิบสมาชิกที่ไม่มีอยู่แล้วเรียก method ต่อทันที จึงเป็นจุดที่พังจริง', 'This line pulls a missing element and immediately chains a method call, so it is the true breaking point.'),
      ),
    ),
    ...syntaxErrors.map(({ line }) =>
      spec(
        "TS1005: ')' expected.",
        [line, '  console.log("ok")', '}', 'console.log("done")'],
        1,
        bi('เช็กวงเล็บในบรรทัดที่เปิด function, loop หรือ if', 'Inspect the parentheses on the line that opens the function, loop, or if.'),
        bi('บรรทัดนี้เปิดโครงสร้างแต่ปิดวงเล็บไม่ครบ จึงทำให้ parser หยุดตั้งแต่บรรทัดนี้', 'This line opens a structure without closing the parentheses properly, so the parser stops on this line.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createBashBank = () => {
  const unboundVars = [
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'path', bad: 'paht', init: '"/tmp/demo"' },
    { good: 'count', bad: 'cont', init: '3' },
  ] as const

  const commandTypos = [
    { command: 'mkidr /tmp/demo', error: 'mkidr: command not found' },
    { command: 'grpe "Ada" users.txt', error: 'grpe: command not found' },
    { command: 'ech0 "done"', error: 'ech0: command not found' },
  ] as const

  const badSubstitutions = [
    { line: 'echo ${name.upper}', error: 'bad substitution' },
    { line: 'echo ${path.base}', error: 'bad substitution' },
    { line: 'echo ${count.value}', error: 'bad substitution' },
  ] as const

  const arithmeticIssues = [
    { setup: 'count=""', line: 'if [ "$count" -gt 2 ]; then', error: 'integer expression expected' },
    { setup: 'total=""', line: 'if [ "$total" -gt 5 ]; then', error: 'integer expression expected' },
    { setup: 'score=""', line: 'if [ "$score" -gt 1 ]; then', error: 'integer expression expected' },
  ] as const

  const syntaxErrors = [
    { line: 'if [ "$total" -gt 2 ]', error: "syntax error near unexpected token `fi'" },
    { line: 'if [ "$name" = "Ada" ]', error: "syntax error near unexpected token `fi'" },
    { line: 'if [ "$count" -gt 1 ]', error: "syntax error near unexpected token `fi'" },
  ] as const

  return createBank('bash', [
    ...unboundVars.map(({ good, bad, init }) =>
      spec(
        `bash: ${bad}: unbound variable`,
        ['set -u', `${good}=${init}`, `echo "$${bad}"`, 'echo "done"'],
        3,
        bi('เช็กชื่อ shell variable ที่ถูกอ้างหลังจาก set -u', 'Check the shell variable name referenced after set -u.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่มีจริงคือ ${good} จึงทำให้ shell หยุดตรงนี้`, `This line references ${bad}, but the real variable is ${good}, so the shell stops here.`),
      ),
    ),
    ...commandTypos.map(({ command, error }) =>
      spec(
        error,
        ['#!/usr/bin/env bash', command, 'echo "ok"', 'echo "done"'],
        2,
        bi('มองหาชื่อคำสั่งที่สะกดผิดจาก command จริง', 'Look for the command name that is misspelled.'),
        bi('บรรทัดนี้เรียกคำสั่งที่ไม่มีอยู่จริงบน shell จึงเป็นต้นเหตุของ error', 'This line invokes a command that does not exist in the shell, so it causes the error.'),
      ),
    ),
    ...badSubstitutions.map(({ line, error }) =>
      spec(
        error,
        ['name="Ada"', line, 'echo "ok"', 'echo "done"'],
        2,
        bi('เช็ก syntax ของ ${...} ว่าใช้รูปแบบที่ bash รองรับจริงไหม', 'Check whether the ${...} syntax matches what Bash actually supports.'),
        bi('บรรทัดนี้ใช้ parameter expansion แบบที่ Bash ไม่รองรับ จึงเกิด bad substitution ตรงนี้', 'This line uses a parameter-expansion form that Bash does not support, so it triggers bad substitution here.'),
      ),
    ),
    ...arithmeticIssues.map(({ setup, line, error }) =>
      spec(
        error,
        [setup, line, '  echo "ok"', 'fi'],
        2,
        bi('ดูค่าที่ถูกเทียบด้วย -gt ว่าเป็นตัวเลขจริงหรือเปล่า', 'Inspect whether the value compared with -gt is actually numeric.'),
        bi('บรรทัดนี้นำค่าที่ว่างหรือไม่ใช่ตัวเลขไปเทียบแบบจำนวนเต็ม จึงเป็นจุดที่ error เกิดจริง', 'This line compares an empty or non-numeric value as an integer, so this is where the error actually begins.'),
      ),
    ),
    ...syntaxErrors.map(({ line, error }) =>
      spec(
        error,
        ['total=4', line, '  echo "ok"', 'fi'],
        2,
        bi('เช็กบรรทัด if ว่าขาด then หรือไม่', 'Check whether the if line is missing then.'),
        bi('บรรทัดนี้เปิด if แต่ไม่ใส่ then ทำให้ shell ไปเจอ fi โดยไม่มีโครงสร้างครบ จึงฟ้องที่จุดนี้', 'This line opens an if without then, so the shell later reaches fi with an incomplete structure and reports the error from here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createCloudFunctionsBank = () => {
  const variableTypos = [
    { good: 'request', bad: 'requset' },
    { good: 'response', bad: 'repsonse' },
    { good: 'snapshot', bad: 'snapshoot' },
  ] as const

  const methodTypos = [
    { setup: 'const payload = request.body', call: 'response.jon(payload)', error: 'TypeError: response.jon is not a function' },
    { setup: 'const ids = snapshot.docs', call: 'return ids.mapp((doc) => doc.id)', error: 'TypeError: ids.mapp is not a function' },
    { setup: 'const text = "ok"', call: 'response.sendd(text)', error: 'TypeError: response.sendd is not a function' },
  ] as const

  const undefinedAccess = [
    { setup: 'const payload = undefined', call: 'response.send(payload.name)', error: "TypeError: Cannot read properties of undefined (reading 'name')" },
    { setup: 'const params = undefined', call: 'response.send(params.id)', error: "TypeError: Cannot read properties of undefined (reading 'id')" },
    { setup: 'const data = undefined', call: 'response.send(data.email)', error: "TypeError: Cannot read properties of undefined (reading 'email')" },
  ] as const

  const outOfRange = [
    { setup: 'const docs = snapshot.docs', call: 'return docs[5].data()', error: "TypeError: Cannot read properties of undefined (reading 'data')" },
    { setup: 'const ids = ["a", "b"]', call: 'response.send(ids[3].toUpperCase())', error: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')" },
    { setup: 'const parts = ["one", "two"]', call: 'response.send(parts[4].trim())', error: "TypeError: Cannot read properties of undefined (reading 'trim')" },
  ] as const

  const syntaxErrors = [
    { line: 'exports.run = onRequest((request, response => {' },
    { line: 'exports.sync = onDocumentCreated("users/{id}", (event => {' },
    { line: 'exports.clean = onSchedule("every 24 hours", (event => {' },
  ] as const

  return createBank('cloud-functions', [
    ...variableTypos.map(({ good, bad }) =>
      spec(
        `ReferenceError: ${bad} is not defined`,
        [`const ${good} = request`, `response.send(${bad}.body)`, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('เช็กชื่อ object ใน handler ว่าสะกดตรงกับที่ประกาศไหม', 'Check whether the handler object name is spelled the same way as the declaration.'),
        bi(`บรรทัดนี้อ้าง ${bad} ทั้งที่ตัวแปรจริงคือ ${good} จึงเป็นต้นเหตุของ ReferenceError`, `This line references ${bad}, while the real variable is ${good}, so it causes the ReferenceError.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("ok")', 'console.log("done")'],
        2,
        bi('มองหาชื่อ method ของ response หรือ array ที่สะกดผิด', 'Look for the misspelled method name on response or the array.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่จริงใน runtime จึงเป็นจุดที่ฟังก์ชันพัง', 'This line calls a method that does not actually exist at runtime, so it is where the function breaks.'),
      ),
    ),
    ...undefinedAccess.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'console.log("fallback")', 'console.log("done")'],
        2,
        bi('เช็กว่าข้อมูลจาก request/event อาจยังเป็น undefined ก่อนอ่าน property', 'Check whether request or event data may still be undefined before reading a property.'),
        bi('บรรทัดนี้อ่าน property จากค่า undefined ตรง ๆ จึงทำให้ handler ล้มที่นี่', 'This line reads a property directly from undefined, so the handler fails here.'),
      ),
    ),
    ...outOfRange.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, 'console.log("range check")', call, 'console.log("done")'],
        3,
        bi('ดู index ของ array หรือ docs list ว่าเกินจำนวนข้อมูลจริงไหม', 'Inspect whether the array or docs index exceeds the actual amount of data.'),
        bi('บรรทัดนี้หยิบข้อมูลที่ไม่มีอยู่จริงแล้วเรียก method ต่อ จึงเป็นจุดที่พังจริง', 'This line fetches data that does not exist and then chains another method, so it is the true breaking point.'),
      ),
    ),
    ...syntaxErrors.map(({ line }) =>
      spec(
        "SyntaxError: Unexpected token '=>'",
        [line, '  console.log("ok")', '})', 'console.log("done")'],
        1,
        bi('เช็กวงเล็บของ callback ในการประกาศ function trigger', 'Inspect the callback parentheses in the function trigger declaration.'),
        bi('บรรทัดนี้เปิด callback แต่ปิดวงเล็บผิดตำแหน่ง ทำให้ parser หยุดตั้งแต่บรรทัดนี้', 'This line opens the callback with the wrong parenthesis placement, so the parser stops on this line.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createSqlBank = () => {
  const columnTypos = [
    { query: 'SELECT emial FROM users;', token: 'emial' },
    { query: 'SELECT totla FROM invoices;', token: 'totla' },
    { query: 'SELECT adress FROM customers;', token: 'adress' },
  ] as const

  const functionTypos = [
    { query: 'SELECT UPPPER(name) FROM users;', token: 'UPPPER' },
    { query: 'SELECT COUNTT(*) FROM orders;', token: 'COUNTT' },
    { query: 'SELECT SUBSTRNG(code, 1, 2) FROM items;', token: 'SUBSTRNG' },
  ] as const

  const aliasIssues = [
    { line2: 'SELECT o.total', line3: 'FROM orders AS ord', line4: 'WHERE o.total > 0;' },
    { line2: 'SELECT c.name', line3: 'FROM customers AS cust', line4: 'WHERE c.id = 1;' },
    { line2: 'SELECT p.title', line3: 'FROM posts AS post', line4: 'WHERE p.id = 2;' },
  ] as const

  const divideByZero = [
    { line2: 'SELECT total / 0', line3: 'FROM invoices', line4: 'WHERE id = 1;' },
    { line2: 'SELECT score / 0', line3: 'FROM results', line4: 'WHERE id = 2;' },
    { line2: 'SELECT amount / 0', line3: 'FROM payments', line4: 'WHERE id = 3;' },
  ] as const

  const syntaxErrors = [
    { line2: 'SELECT id name', line3: 'FROM users', line4: 'WHERE active = true;' },
    { line2: 'SELECT id, name', line3: 'users', line4: 'WHERE active = true;' },
    { line2: 'SELECT (id', line3: 'FROM users', line4: 'WHERE active = true;' },
  ] as const

  return createBank('sql', [
    ...columnTypos.map(({ query, token }) =>
      spec(
        `column "${token}" does not exist`,
        ['-- query', query, 'SELECT 1;', '-- done'],
        2,
        bi('เช็กชื่อ column ว่าสะกดตรงกับ schema จริงหรือไม่', 'Check whether the column name matches the real schema spelling.'),
        bi(`บรรทัดนี้อ้าง column ${token} ที่ไม่มีอยู่จริงในตาราง จึงเป็นต้นเหตุของ error`, `This line references the column ${token}, which does not exist in the table, so it causes the error.`),
      ),
    ),
    ...functionTypos.map(({ query, token }) =>
      spec(
        `function ${token.toLowerCase()} does not exist`,
        ['-- query', query, 'SELECT 1;', '-- done'],
        2,
        bi('มองหาชื่อ function ที่สะกดผิดจากของจริง', 'Look for the function name that is spelled incorrectly.'),
        bi(`บรรทัดนี้เรียก function ${token} ที่ไม่มีอยู่จริง จึงเป็นจุดที่ query ล้ม`, `This line calls the function ${token}, which does not exist, so the query fails here.`),
      ),
    ),
    ...aliasIssues.map(({ line2, line3, line4 }) =>
      spec(
        'missing FROM-clause entry for table alias',
        ['-- query', line2, line3, line4],
        2,
        bi('เทียบ alias ใน SELECT/WHERE กับ alias ที่ประกาศใน FROM', 'Compare the alias used in SELECT or WHERE with the one declared in FROM.'),
        bi('บรรทัดนี้ใช้งาน alias ที่ไม่เคยประกาศไว้ใน FROM clause จึงเป็นต้นเหตุของ error', 'This line uses an alias that was never declared in the FROM clause, so it causes the error.'),
      ),
    ),
    ...divideByZero.map(({ line2, line3, line4 }) =>
      spec(
        'division by zero',
        ['-- query', line2, line3, line4],
        2,
        bi('ดูนิพจน์หารว่ามีตัวหารเป็น 0 หรือไม่', 'Inspect the division expression and check whether the divisor is 0.'),
        bi('บรรทัดนี้หารด้วย 0 โดยตรง จึงเป็นจุดที่ฐานข้อมูลโยน error', 'This line divides by 0 directly, so it is where the database raises the error.'),
      ),
    ),
    ...syntaxErrors.map(({ line2, line3, line4 }) =>
      spec(
        'syntax error at or near the highlighted token',
        ['-- query', line2, line3, line4],
        2,
        bi('เช็กบรรทัด SELECT ว่าขาด comma, FROM หรือวงเล็บปิดหรือไม่', 'Check the SELECT line for a missing comma, FROM, or closing parenthesis.'),
        bi('บรรทัดนี้เขียนโครงสร้าง SELECT ไม่ครบ ทำให้ parser หยุดที่บรรทัดนี้ก่อน', 'This line leaves the SELECT structure incomplete, so the parser stops on this line first.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createPhpBank = () => {
  const variableTypos = [
    { good: '$total', bad: '$totla', init: '4' },
    { good: '$name', bad: '$nmae', init: '"Ada"' },
    { good: '$score', bad: '$scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: '$text = "hello";', call: 'echo $text->trimm();', error: 'Call to undefined method' },
    { setup: '$user = new User();', call: 'echo $user->savve();', error: 'Call to undefined method' },
    { setup: '$report = new Report();', call: 'echo $report->renderr();', error: 'Call to undefined method' },
  ] as const

  const nullAccess = [
    { setup: '$profile = null;', call: 'echo $profile->name;' },
    { setup: '$user = null;', call: 'echo $user->email;' },
    { setup: '$city = null;', call: 'echo $city->title;' },
  ] as const

  const keyIssues = [
    { setup: '$scores = [10, 20, 30];', call: 'echo $scores[3];' },
    { setup: '$names = ["Ada", "Lin"];', call: 'echo strtoupper($names[2]);' },
    { setup: '$flags = [true, false];', call: 'echo $flags[5];' },
  ] as const

  const syntaxErrors = [
    { line: '$total = 4', next: 'echo $total;' },
    { line: '$name = "Ada"', next: 'echo $name;' },
    { line: '$score = 9', next: 'echo $score;' },
  ] as const

  return createBank('php', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `Undefined variable ${bad}`,
        [`${good} = ${init};`, `echo ${bad};`, `echo ${good};`, 'echo "done";'],
        2,
        bi('เช็กชื่อตัวแปร $ ว่าสะกดตรงกับตัวที่ประกาศไว้หรือไม่', 'Check whether the $variable name matches the declared one.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรที่ประกาศคือ ${good} จึงเกิด Undefined variable ที่นี่`, `This line references ${bad}, but the declared variable is ${good}, so the undefined-variable error starts here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'echo "ok";', 'echo "done";'],
        2,
        bi('มองหาชื่อ method ของ object ที่สะกดผิด', 'Look for the object method name that is misspelled.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีอยู่ใน object นั้น จึงเป็นต้นเหตุของ fatal error', 'This line calls a method that does not exist on that object, so it is the source of the fatal error.'),
      ),
    ),
    ...nullAccess.map(({ setup, call }) =>
      spec(
        'Attempt to read property on null',
        [setup, call, 'echo "fallback";', 'echo "done";'],
        2,
        bi('เช็ก object ว่าอาจเป็น null ก่อนอ่าน property', 'Check whether the object can be null before reading a property.'),
        bi('บรรทัดนี้พยายามอ่าน property จาก null ตรง ๆ จึงทำให้แอพล้มที่นี่', 'This line tries to read a property directly from null, so the app fails here.'),
      ),
    ),
    ...keyIssues.map(({ setup, call }) =>
      spec(
        'Undefined array key',
        [setup, 'echo "range check";', call, 'echo "done";'],
        3,
        bi('ดู index ของ array ว่าเกินจำนวนสมาชิกหรือไม่', 'Inspect whether the array index goes beyond the available items.'),
        bi('บรรทัดนี้เข้าถึง key/index ที่ไม่มีใน array จึงเป็นจุดที่เกิด warning/error', 'This line accesses a key or index that is not present in the array, so it is where the warning or error occurs.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "Parse error: syntax error, unexpected token 'echo'",
        ['<?php', line, next, 'echo "done";'],
        2,
        bi('เช็กบรรทัด assignment ว่าขาด ; ก่อนไปบรรทัดถัดไปหรือไม่', 'Check whether the assignment line is missing a semicolon before the next statement.'),
        bi('บรรทัดนี้ขาด ; ทำให้ parser ไปเจอ echo บรรทัดถัดไปแบบผิดรูป จึงต้นเหตุอยู่ที่บรรทัดนี้', 'This line is missing a semicolon, so the parser meets the next echo in an invalid shape; the real cause is here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createRustBank = () => {
  const variableTypos = [
    { good: 'total', bad: 'totla', init: '4' },
    { good: 'name', bad: 'nmae', init: '"Ada"' },
    { good: 'score', bad: 'scroe', init: '9' },
  ] as const

  const methodTypos = [
    { setup: 'let text = String::from("hello");', call: 'println!("{}", text.trimm());', error: "no method named `trimm` found for struct `String`" },
    { setup: 'let names = vec!["Ada", "Lin"];', call: 'println!("{:?}", names.jion(","));', error: "no method named `jion` found for struct `Vec<&str>`" },
    { setup: 'let code = String::from("abc");', call: 'println!("{}", code.to_upper());', error: "no method named `to_upper` found for struct `String`" },
  ] as const

  const unwrapIssues = [
    { setup: 'let title: Option<String> = None;', call: 'println!("{}", title.unwrap());' },
    { setup: 'let city: Option<String> = None;', call: 'println!("{}", city.unwrap());' },
    { setup: 'let email: Option<String> = None;', call: 'println!("{}", email.unwrap());' },
  ] as const

  const outOfRange = [
    { setup: 'let scores = vec![10, 20, 30];', call: 'println!("{}", scores[3]);' },
    { setup: 'let names = vec!["Ada", "Lin"];', call: 'println!("{}", names[2]);' },
    { setup: 'let flags = vec![true, false];', call: 'println!("{}", flags[5]);' },
  ] as const

  const syntaxErrors = [
    { line: 'let total = 4', next: 'println!("{}", total);' },
    { line: 'let name = "Ada"', next: 'println!("{}", name);' },
    { line: 'let score = 9', next: 'println!("{}", score);' },
  ] as const

  return createBank('rust', [
    ...variableTypos.map(({ good, bad, init }) =>
      spec(
        `cannot find value \`${bad}\` in this scope`,
        [`let ${good} = ${init};`, `println!("{}", ${bad});`, `println!("{}", ${good});`, 'println!("done");'],
        2,
        bi('เช็กชื่อ value ที่อยู่ใน scope ให้ตรงกับบรรทัดประกาศ', 'Check that the value name in scope matches the declaration line.'),
        bi(`บรรทัดนี้อ้าง ${bad} แต่ตัวแปรใน scope จริงคือ ${good} จึงคอมไพล์ไม่ผ่านตรงนี้`, `This line references ${bad}, but the value actually in scope is ${good}, so compilation fails here.`),
      ),
    ),
    ...methodTypos.map(({ setup, call, error }) =>
      spec(
        error,
        [setup, call, 'println!("ok");', 'println!("done");'],
        2,
        bi('มองหาชื่อ method ที่ไม่ตรงกับของจริงบน type นั้น', 'Look for the method name that does not match the real one on that type.'),
        bi('บรรทัดนี้เรียก method ที่ไม่มีบน type นั้น จึงเป็นต้นเหตุของ compile error', 'This line calls a method that does not exist on that type, so it causes the compile error.'),
      ),
    ),
    ...unwrapIssues.map(({ setup, call }) =>
      spec(
        'called `Option::unwrap()` on a `None` value',
        [setup, call, 'println!("fallback");', 'println!("done");'],
        2,
        bi('เช็กว่า unwrap ถูกใช้กับ Option ที่ยังเป็น None หรือไม่', 'Check whether unwrap is being used on an Option that is still None.'),
        bi('บรรทัดนี้เรียก unwrap() กับค่า None โดยตรง จึงเป็นจุดที่ panic จริง', 'This line calls unwrap() directly on None, so it is the true panic point.'),
      ),
    ),
    ...outOfRange.map(({ setup, call }) =>
      spec(
        'index out of bounds',
        [setup, 'println!("range check");', call, 'println!("done");'],
        3,
        bi('ดูเลข index ว่าเกินความยาวของ vec หรือไม่', 'Inspect whether the index exceeds the vec length.'),
        bi('บรรทัดนี้เข้าถึงตำแหน่งที่ไม่มีอยู่ใน vec จึงเป็นจุดที่ panic จริง', 'This line accesses a position that does not exist in the vec, so it is the real panic point.'),
      ),
    ),
    ...syntaxErrors.map(({ line, next }) =>
      spec(
        "expected `;`, found `println`",
        ['fn main() {', `  ${line}`, `  ${next}`, '}'],
        2,
        bi('เช็กบรรทัด let ว่าขาด ; ก่อนคำสั่งถัดไปหรือไม่', 'Check whether the let line is missing a semicolon before the next statement.'),
        bi('บรรทัดนี้ขาด ; ทำให้ parser ไปชน println ของบรรทัดถัดไปแบบผิดรูป จึงต้นเหตุอยู่ที่นี่', 'This line is missing a semicolon, so the parser collides with the next println in the wrong shape; the root cause is here.'),
      ),
    ),
  ], FIX_ERROR_CORE_BANK_SIZE, coreDifficultyPlan)
}

const createLuaGameBank = (language: FixErrorSupportedLanguageId, engineLine: string) =>
  createBank(
    language,
    [
      spec(
        'attempt to index a nil value',
        [engineLine, 'local player = nil', 'print(player.Name)', 'print("ready")'],
        3,
        bi('เช็กว่า player ถูกสร้างก่อนเรียกใช้หรือไม่', 'Check whether player is initialized before use.'),
        bi('บรรทัดนี้อ่าน Name จากค่า nil จึงเกิด error', 'This line reads Name from nil, causing the error.'),
      ),
      spec(
        "attempt to call method 'emit' (a nil value)",
        ['local emitter = nil', 'emitter:emit("hit")', 'print("ok")', 'return emitter'],
        2,
        bi('เช็กว่า emitter มีการสร้างจริงก่อนเรียก method หรือไม่', 'Verify the emitter exists before calling the method.'),
        bi('บรรทัดนี้เรียกเมธอดจากค่า nil จึงพังทันที', 'This line calls a method on nil and crashes.'),
      ),
      spec(
        "attempt to call global 'pritn' (a nil value)",
        ['local score = 10', 'pritn(score)', 'print("done")', 'return score'],
        2,
        bi('เช็กชื่อฟังก์ชันที่สะกดผิด', 'Check the misspelled function name.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่ไม่มีอยู่จริง', 'This line calls a function that does not exist.'),
      ),
      spec(
        "module 'utilz' not found",
        ['local utils = require("utilz")', 'local total = utils.sum(1, 2)', 'print(total)', 'return total'],
        1,
        bi('เช็กชื่อไฟล์หรือโมดูลใน require ว่าตรงจริงหรือไม่', 'Verify the module name used in require.'),
        bi('บรรทัดนี้ require โมดูลที่ไม่มีอยู่จึงพัง', 'This line requires a missing module.'),
      ),
      spec(
        'attempt to perform arithmetic on a nil value',
        ['local hp', 'local nextHp = hp + 1', 'print(nextHp)', 'return nextHp'],
        2,
        bi('เช็กว่าค่าที่นำมาคำนวณถูกกำหนดหรือยัง', 'Check whether the value is defined before arithmetic.'),
        bi('บรรทัดนี้นำ nil มาคำนวณจึงเกิด error', 'This line performs arithmetic on nil.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createGdscriptBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        "Invalid call. Nonexistent function 'movee' in base 'CharacterBody2D'.",
        ['extends CharacterBody2D', 'func _physics_process(delta):', '  movee(Vector2.ZERO)', '  print("ok")'],
        3,
        bi('เช็กชื่อฟังก์ชันที่เรียกว่าถูกต้องหรือไม่', 'Check whether the function name is correct.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่ไม่มีอยู่จริง', 'This line calls a function that does not exist.'),
      ),
      spec(
        "Invalid get index 'text' (on base: 'Nil').",
        ['var hud = null', 'func _ready():', '  print(hud.text)', '  print("ready")'],
        3,
        bi('เช็กว่า hud ถูก assign ก่อนใช้งานหรือไม่', 'Check whether hud is assigned before use.'),
        bi('บรรทัดนี้อ่าน property จากค่า null จึงพัง', 'This line reads a property on null.'),
      ),
      spec(
        'Index 3 out of bounds',
        ['var items = [1, 2]', 'func _ready():', '  print(items[3])', '  print("done")'],
        3,
        bi('เช็ก index ว่าเกินขนาด array หรือไม่', 'Check whether the index is out of bounds.'),
        bi('บรรทัดนี้เข้าถึงตำแหน่งที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        "Invalid call. Nonexistent function '_on_pressd' in base 'Node'.",
        ['func _ready():', '  button.pressed.connect(_on_pressd)', '  print("ready")', '  pass'],
        2,
        bi('เช็กชื่อ callback ที่ connect ให้ตรงกับฟังก์ชันจริง', 'Ensure the connected callback name matches the real function.'),
        bi('บรรทัดนี้ชี้ไปที่ฟังก์ชันที่ไม่มีอยู่', 'This line points to a missing callback.'),
      ),
      spec(
        "Parser Error: Expected ':' after condition.",
        ['func _ready():', '  if health > 0', '    print(health)', '  pass'],
        2,
        bi('เช็กเครื่องหมาย : หลังเงื่อนไข if', 'Check for the missing : after the condition.'),
        bi('บรรทัดนี้ขาด : ทำให้ parser error', 'This line is missing :, triggering the parse error.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createGodotShaderBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        "ERROR: 0:3: 'uv' : undeclared identifier",
        ['shader_type canvas_item;', 'void fragment() {', '  COLOR = texture(TEXTURE, uv);', '}'],
        3,
        bi('เช็กตัวแปรที่ใช้ใน shader ว่าชื่อถูกต้องหรือไม่', 'Check that shader identifiers are spelled correctly.'),
        bi('บรรทัดนี้ใช้ uv ที่ไม่ได้ประกาศ', 'This line uses an undeclared identifier.'),
      ),
      spec(
        "ERROR: 0:3: 'texturee' : no matching overloaded function found",
        ['shader_type canvas_item;', 'void fragment() {', '  COLOR = texturee(TEXTURE, UV);', '}'],
        3,
        bi('เช็กชื่อฟังก์ชัน texture ว่าสะกดถูกไหม', 'Check the spelling of texture().'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
      spec(
        'ERROR: 0:2: syntax error',
        ['shader_type canvas_item;', 'uniform vec4 tint', 'void fragment() {', '  COLOR = tint; }'],
        2,
        bi('เช็กว่า uniform ลงท้ายด้วย ; หรือไม่', 'Check whether the uniform line ends with a semicolon.'),
        bi('บรรทัดนี้ขาด ; ทำให้ syntax error', 'This line is missing a semicolon.'),
      ),
      spec(
        'ERROR: 0:3: cannot assign vec3 to vec4',
        ['shader_type canvas_item;', 'void fragment() {', '  COLOR = vec3(1.0, 0.5, 0.2);', '}'],
        3,
        bi('เช็กชนิดข้อมูลฝั่งซ้าย/ขวาให้ตรงกัน', 'Make sure the types match on assignment.'),
        bi('บรรทัดนี้ส่ง vec3 ให้ COLOR ที่ต้องเป็น vec4', 'This line assigns a vec3 to a vec4.'),
      ),
      spec(
        "ERROR: 0:3: 'tintColor' : undeclared identifier",
        ['shader_type canvas_item;', 'void fragment() {', '  COLOR = tintColor;', '}'],
        3,
        bi('ตรวจว่าประกาศตัวแปร tintColor แล้วหรือไม่', 'Verify tintColor is declared before use.'),
        bi('บรรทัดนี้ใช้ตัวแปรที่ยังไม่ประกาศ', 'This line uses an undeclared variable.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createUnityCsharpGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        'NullReferenceException: Object reference not set to an instance of an object',
        ['GameObject player = null;', 'var pos = player.transform.position;', 'Debug.Log(pos);', 'return;'],
        2,
        bi('เช็กว่า player ถูกกำหนดก่อนเรียก transform หรือไม่', 'Ensure player is assigned before accessing transform.'),
        bi('บรรทัดนี้เรียก transform จากค่า null', 'This line accesses transform on null.'),
      ),
      spec(
        "CS0103: The name 'scroe' does not exist in the current context",
        ['int score = 10;', 'Debug.Log(scroe);', 'return;', '// done'],
        2,
        bi('เช็กชื่อตัวแปรที่สะกดผิด', 'Check the misspelled variable name.'),
        bi('บรรทัดนี้ใช้ชื่อตัวแปรที่ไม่มีอยู่จริง', 'This line uses a variable name that does not exist.'),
      ),
      spec(
        "CS1061: 'Rigidbody' does not contain a definition for 'AddForcce'",
        ['var rb = GetComponent<Rigidbody>();', 'rb.AddForcce(Vector3.up);', 'Debug.Log("jump");', 'return;'],
        2,
        bi('เช็กชื่อเมธอดของ Rigidbody ว่าสะกดถูกไหม', 'Check the method name on Rigidbody.'),
        bi('บรรทัดนี้เรียกเมธอดที่ไม่มีอยู่จริง', 'This line calls a method that does not exist.'),
      ),
      spec(
        'IndexOutOfRangeException: Index was outside the bounds of the array.',
        ['var items = new int[] { 1, 2 };', 'Debug.Log(items[3]);', 'return;', '// done'],
        2,
        bi('เช็ก index ของ array ว่าเกินขนาดหรือไม่', 'Check whether the array index is out of range.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        'NullReferenceException: Object reference not set to an instance of an object',
        ['var audio = GetComponent<AudioSource>();', 'audio.Play();', 'return;', '// done'],
        2,
        bi('เช็กว่า component ที่ต้องใช้มีอยู่จริงหรือไม่', 'Verify the component exists before calling it.'),
        bi('บรรทัดนี้เรียกเมธอดจาก component ที่เป็น null', 'This line calls a method on a null component.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createUnityShaderlabBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        "Shader error: undeclared identifier 'colorr'",
        ['CGPROGRAM', 'fixed4 frag() : SV_Target { return colorr; }', 'ENDCG', ''],
        2,
        bi('เช็กชื่อ variable ใน shader ว่าสะกดถูกไหม', 'Check the shader variable name spelling.'),
        bi('บรรทัดนี้ใช้ตัวแปรที่ไม่ได้ประกาศ', 'This line uses an undeclared variable.'),
      ),
      spec(
        "Shader error: no matching function for 'tex2dd'",
        ['CGPROGRAM', 'fixed4 frag() : SV_Target { return tex2dd(_MainTex, i.uv); }', 'ENDCG', ''],
        2,
        bi('เช็กชื่อฟังก์ชัน tex2D ว่าสะกดถูกไหม', 'Check the spelling of tex2D.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
      spec(
        'Shader error: syntax error',
        ['CGPROGRAM', 'uniform float4 _Tint', 'fixed4 frag() : SV_Target { return _Tint; }', 'ENDCG'],
        2,
        bi('เช็กว่า uniform ลงท้ายด้วย ; หรือไม่', 'Check for the missing semicolon.'),
        bi('บรรทัดนี้ขาด ; ทำให้ syntax error', 'This line is missing a semicolon.'),
      ),
      spec(
        'Shader error: cannot convert from "float3" to "float4"',
        ['CGPROGRAM', 'fixed4 frag() : SV_Target { return float3(1, 0, 0); }', 'ENDCG', ''],
        2,
        bi('เช็กชนิดข้อมูลที่คืนจากฟังก์ชัน', 'Check the returned type matches the function signature.'),
        bi('บรรทัดนี้คืนค่า float3 แต่ต้องเป็น float4', 'This line returns a float3 instead of float4.'),
      ),
      spec(
        "Shader error: undeclared identifier 'uv'",
        ['CGPROGRAM', 'fixed4 frag() : SV_Target { return tex2D(_MainTex, uv); }', 'ENDCG', ''],
        2,
        bi('เช็กตัวแปร uv ว่ามีอยู่จริงใน struct หรือไม่', 'Check whether uv is defined in the input struct.'),
        bi('บรรทัดนี้ใช้ uv ที่ไม่ได้ประกาศ', 'This line uses an undeclared uv.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createUnrealCppGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        'Access violation reading location 0x00000000',
        ['AActor* Door = nullptr;', 'Door->SetActorHiddenInGame(true);', 'UE_LOG(LogTemp, Warning, TEXT("done"));', 'return;'],
        2,
        bi('เช็ก pointer ว่าเป็น nullptr หรือไม่', 'Check whether the pointer is nullptr.'),
        bi('บรรทัดนี้เรียกเมธอดจาก pointer ที่เป็น null', 'This line calls a method on a null pointer.'),
      ),
      spec(
        "error: identifier 'Movee' is undefined",
        ['void Tick(float DeltaTime) {', '  Movee(DeltaTime);', '  return;', '}'],
        2,
        bi('เช็กชื่อฟังก์ชันที่สะกดผิด', 'Check the misspelled function name.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่ไม่มีอยู่จริง', 'This line calls a function that does not exist.'),
      ),
      spec(
        "error: use of undeclared identifier 'Speeed'",
        ['float Speed = 10.f;', 'float dist = Speeed * DeltaTime;', 'UE_LOG(LogTemp, Warning, TEXT("tick"));', 'return;'],
        2,
        bi('เช็กชื่อตัวแปรให้ตรงกับที่ประกาศ', 'Verify the variable name matches the declaration.'),
        bi('บรรทัดนี้ใช้ชื่อตัวแปรที่ไม่มีอยู่', 'This line uses an undeclared variable.'),
      ),
      spec(
        'error: request for member \'SetActorLocation\' in \'Door\', which is of pointer type',
        ['AActor* Door;', 'Door.SetActorLocation(Location);', 'UE_LOG(LogTemp, Warning, TEXT("move"));', 'return;'],
        2,
        bi('เช็กการใช้ . กับ pointer ควรใช้ ->', 'Check pointer member access uses -> instead of .'),
        bi('บรรทัดนี้ใช้ . กับ pointer จึงผิดรูป', 'This line uses . on a pointer.'),
      ),
      spec(
        "error: no matching function for call to 'FVector::Fector'",
        ['FVector Location;', 'Location = FVector::Fector(0.f, 0.f, 0.f);', 'return;', ''],
        2,
        bi('เช็กชื่อฟังก์ชันที่สะกดผิด', 'Check the misspelled function name.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createGlslGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        "ERROR: 0:3: 'uv' : undeclared identifier",
        ['#version 330 core', 'void main() {', '  gl_FragColor = texture(uTexture, uv);', '}'],
        3,
        bi('เช็กตัวแปร uv ว่ามีการประกาศหรือไม่', 'Check that uv is declared before use.'),
        bi('บรรทัดนี้ใช้ uv ที่ไม่ได้ประกาศ', 'This line uses an undeclared uv.'),
      ),
      spec(
        "ERROR: 0:3: 'texturee' : no matching overloaded function",
        ['#version 330 core', 'void main() {', '  gl_FragColor = texturee(uTexture, vUv);', '}'],
        3,
        bi('เช็กชื่อฟังก์ชัน texture ว่าสะกดถูกไหม', 'Check the spelling of texture().'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
      spec(
        'ERROR: 0:2: syntax error',
        ['#version 330 core', 'uniform vec4 tint', 'void main() {', '  gl_FragColor = tint; }'],
        2,
        bi('เช็กว่า uniform ลงท้ายด้วย ; หรือไม่', 'Check for the missing semicolon.'),
        bi('บรรทัดนี้ขาด ; ทำให้ syntax error', 'This line is missing a semicolon.'),
      ),
      spec(
        'ERROR: 0:3: cannot convert from "vec3" to "vec4"',
        ['#version 330 core', 'void main() {', '  gl_FragColor = vec3(1.0, 0.0, 0.0);', '}'],
        3,
        bi('เช็กชนิดข้อมูลที่คืนออกมาให้ตรงกับ vec4', 'Ensure the returned type matches vec4.'),
        bi('บรรทัดนี้คืนค่า vec3 แต่ต้องเป็น vec4', 'This line returns a vec3 instead of vec4.'),
      ),
      spec(
        "ERROR: 0:3: 'color' : undeclared identifier",
        ['#version 330 core', 'void main() {', '  gl_FragColor = color;', '}'],
        3,
        bi('เช็กตัวแปรที่ใช้ใน fragment ว่าประกาศแล้วหรือไม่', 'Check that the variable is declared.'),
        bi('บรรทัดนี้ใช้ตัวแปรที่ยังไม่ประกาศ', 'This line uses an undeclared variable.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createJsGameBank = (language: FixErrorSupportedLanguageId, engineLabel: string) =>
  createBank(
    language,
    [
      spec(
        'TypeError: Cannot read properties of undefined (reading "x")',
        [`const player = undefined`, 'console.log(player.x)', 'console.log("ready")', `// ${engineLabel}`],
        2,
        bi('เช็กว่า player ถูกกำหนดก่อนเรียก property หรือไม่', 'Check whether player is defined before accessing properties.'),
        bi('บรรทัดนี้อ่าน property จาก undefined จึงพัง', 'This line reads a property on undefined.'),
      ),
      spec(
        'TypeError: this.anims.creat is not a function',
        ['const scene = this', 'scene.anims.creat("run")', 'console.log("ok")', `// ${engineLabel}`],
        2,
        bi('เช็กชื่อเมธอดที่สะกดผิด', 'Check the misspelled method name.'),
        bi('บรรทัดนี้เรียกเมธอดที่ไม่มีอยู่จริง', 'This line calls a method that does not exist.'),
      ),
      spec(
        'TypeError: Cannot read properties of null (reading "addEventListener")',
        ['const button = document.querySelector(".btn-primary")', 'button.addEventListener("click", start)', 'console.log("ok")', `// ${engineLabel}`],
        2,
        bi('เช็ก selector ว่าตรงกับ element จริงหรือไม่', 'Check whether the selector matches a real element.'),
        bi('บรรทัดนี้ใช้ค่า null เป็น element จึงพัง', 'This line uses null as an element.'),
      ),
      spec(
        'TypeError: Cannot read properties of undefined (reading "name")',
        ['const items = [{ name: "A" }]', 'console.log(items[2].name)', 'console.log("done")', `// ${engineLabel}`],
        2,
        bi('เช็ก index ว่าเกินจำนวน item หรือไม่', 'Check whether the index exceeds the list length.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        'TypeError: Cannot read properties of undefined (reading "level")',
        ['const config = undefined', 'console.log(config.level)', 'console.log("ready")', `// ${engineLabel}`],
        2,
        bi('เช็กว่า config ถูกโหลดก่อนใช้งานหรือไม่', 'Check whether config is loaded before use.'),
        bi('บรรทัดนี้อ่านค่าจาก config ที่เป็น undefined', 'This line reads from an undefined config.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createGmlGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        'Variable score not set before reading it.',
        ['var score = 0;', 'scrore += 1;', 'show_debug_message(score);', 'return;'],
        2,
        bi('เช็กชื่อตัวแปรที่สะกดผิด', 'Check the misspelled variable name.'),
        bi('บรรทัดนี้ใช้ตัวแปรที่ไม่ได้ประกาศ', 'This line uses an undeclared variable.'),
      ),
      spec(
        'Unknown function draw_textt.',
        ['draw_set_color(c_white);', 'draw_textt(20, 20, "score");', 'draw_set_color(c_gray);', 'return;'],
        2,
        bi('เช็กชื่อฟังก์ชัน draw_text ว่าสะกดถูกไหม', 'Check the spelling of draw_text.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
      spec(
        'Array index out of range.',
        ['var items = [1, 2];', 'show_debug_message(items[3]);', 'return;', ''],
        2,
        bi('เช็ก index ของ array ว่าเกินขนาดหรือไม่', 'Check whether the array index is out of range.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        'Variable obj_player not set before reading it.',
        ['var obj_player;', 'obj_player.hp -= 1;', 'show_debug_message("hit");', 'return;'],
        2,
        bi('เช็กว่า obj_player ถูกกำหนดก่อนใช้งานหรือไม่', 'Check that obj_player is assigned before use.'),
        bi('บรรทัดนี้ใช้งานตัวแปรที่ยังเป็น undefined', 'This line uses an undefined variable.'),
      ),
      spec(
        'Unknown function instance_creat_layer.',
        ['instance_creat_layer(0, 0, "Instances", obj_enemy);', 'show_debug_message("spawn");', 'return;', ''],
        1,
        bi('เช็กชื่อฟังก์ชัน instance_create_layer ว่าสะกดถูกไหม', 'Check the spelling of instance_create_layer.'),
        bi('บรรทัดนี้เรียกฟังก์ชันที่สะกดผิด', 'This line calls a misspelled function.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createBevyRustGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        'cannot find value `speeed` in this scope',
        ['let speed = 10.0;', 'println!("{}", speeed);', 'println!("tick");', 'println!("done");'],
        2,
        bi('เช็กชื่อตัวแปรใน scope ให้ตรงกับที่ประกาศ', 'Check the variable name matches the declaration.'),
        bi('บรรทัดนี้ใช้ตัวแปรที่ไม่มีอยู่', 'This line references an undefined variable.'),
      ),
      spec(
        'no method named `updae` found for struct `Transform`',
        ['let mut transform = Transform::default();', 'transform.updae();', 'println!("tick");', 'println!("done");'],
        2,
        bi('เช็กชื่อเมธอดที่สะกดผิด', 'Check the misspelled method name.'),
        bi('บรรทัดนี้เรียกเมธอดที่ไม่มีอยู่จริง', 'This line calls a method that does not exist.'),
      ),
      spec(
        'called `Option::unwrap()` on a `None` value',
        ['let handle: Option<Handle> = None;', 'println!("{:?}", handle.unwrap());', 'println!("tick");', 'println!("done");'],
        2,
        bi('เช็กว่า Option ยังเป็น None ก่อน unwrap', 'Check the Option value before unwrap.'),
        bi('บรรทัดนี้ unwrap ค่า None จึง panic', 'This line unwraps None and panics.'),
      ),
      spec(
        'index out of bounds',
        ['let items = vec![1, 2];', 'println!("{}", items[3]);', 'println!("tick");', 'println!("done");'],
        2,
        bi('เช็ก index ว่าเกินขนาด vec หรือไม่', 'Check whether the index exceeds vec length.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        "expected `;`, found `println`",
        ['fn main() {', '  let score = 10', '  println!("{}", score);', '}'],
        2,
        bi('เช็กบรรทัด let ว่าขาด ; หรือไม่', 'Check whether the let line is missing a semicolon.'),
        bi('บรรทัดนี้ขาด ; ทำให้ parser error', 'This line is missing a semicolon.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createRenpyPythonGameBank = (language: FixErrorSupportedLanguageId) =>
  createBank(
    language,
    [
      spec(
        "NameError: name 'scroe' is not defined",
        ['score = 10', 'print(scroe)', 'print("done")', 'return'],
        2,
        bi('เช็กชื่อตัวแปรที่สะกดผิด', 'Check the misspelled variable name.'),
        bi('บรรทัดนี้ใช้ชื่อตัวแปรที่ไม่มีอยู่จริง', 'This line uses an undefined variable name.'),
      ),
      spec(
        "AttributeError: 'NoneType' object has no attribute 'strip'",
        ['title = None', 'print(title.strip())', 'print("ok")', 'return'],
        2,
        bi('เช็กว่า title ถูกกำหนดก่อนเรียกใช้งานหรือไม่', 'Check whether title is set before use.'),
        bi('บรรทัดนี้เรียกเมธอดจากค่า None', 'This line calls a method on None.'),
      ),
      spec(
        'IndexError: list index out of range',
        ['labels = ["intro", "end"]', 'print(labels[3])', 'print("ok")', 'return'],
        2,
        bi('เช็ก index ว่าเกินจำนวน list หรือไม่', 'Check whether the index exceeds list length.'),
        bi('บรรทัดนี้เข้าถึง index ที่ไม่มีอยู่', 'This line accesses a missing index.'),
      ),
      spec(
        "TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'",
        ['points = None', 'total = points + 1', 'print(total)', 'return'],
        2,
        bi('เช็กว่าค่าที่นำมาบวกเป็น None หรือไม่', 'Check whether the value is None before arithmetic.'),
        bi('บรรทัดนี้นำ None มาบวกกับตัวเลขจึงพัง', 'This line adds None to a number.'),
      ),
      spec(
        'SyntaxError: invalid syntax',
        ['if score > 2', '    print(score)', 'print("done")', 'return'],
        1,
        bi('เช็กบรรทัด if ว่าขาด : หรือไม่', 'Check whether the if line is missing a colon.'),
        bi('บรรทัดนี้รูปแบบ if ผิด ทำให้ syntax error', 'This line has an invalid if syntax.'),
      ),
    ],
    FIX_ERROR_GAME_BANK_SIZE,
  )

const createFixErrorQuestionBanks = (): Record<FixErrorSupportedLanguageId, Record<Difficulty, FixErrorQuestionBankItem[]>> => ({
  python: createPythonBank(),
  java: createJavaBank(),
  javascript: createJavaScriptBank(),
  csharp: createCsharpBank(),
  cpp: createCppBank(),
  dart: createDartBank(),
  go: createGoBank(),
  kotlin: createKotlinBank(),
  swift: createSwiftBank(),
  ruby: createRubyBank(),
  jsx: createJsxBank(),
  typescript: createTypeScriptBank(),
  bash: createBashBank(),
  'cloud-functions': createCloudFunctionsBank(),
  sql: createSqlBank(),
  php: createPhpBank(),
  rust: createRustBank(),
  'roblox-lua': createLuaGameBank('roblox-lua', 'local Players = game:GetService("Players")'),
  'love2d-lua': createLuaGameBank('love2d-lua', 'function love.draw()'),
  'defold-lua': createLuaGameBank('defold-lua', 'function init(self)'),
  'godot-gdscript': createGdscriptBank('godot-gdscript'),
  'godot-shader': createGodotShaderBank('godot-shader'),
  'unity-csharp': createUnityCsharpGameBank('unity-csharp'),
  'unity-shaderlab': createUnityShaderlabBank('unity-shaderlab'),
  'unreal-cpp': createUnrealCppGameBank('unreal-cpp'),
  glsl: createGlslGameBank('glsl'),
  'phaser-typescript': createJsGameBank('phaser-typescript', 'Phaser'),
  'rpg-maker-js': createJsGameBank('rpg-maker-js', 'RPG Maker'),
  'cocos-typescript': createJsGameBank('cocos-typescript', 'Cocos'),
  'gamemaker-gml': createGmlGameBank('gamemaker-gml'),
  'bevy-rust': createBevyRustGameBank('bevy-rust'),
  'renpy-python': createRenpyPythonGameBank('renpy-python'),
})

const getFixErrorBankSize = (language: FixErrorSupportedLanguageId) =>
  fixErrorGameLanguageSet.has(language as GameLanguageId) ? FIX_ERROR_GAME_BANK_SIZE : FIX_ERROR_CORE_BANK_SIZE

const countAnswerLineDistribution = (bank: FixErrorQuestionBankItem[]) =>
  bank.reduce(
    (counts, item) => {
      const answerLine = Number(item.answer.replace('line-', ''))
      counts[answerLine as LineNumber] += 1
      return counts
    },
    { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<LineNumber, number>,
  )

const validateFixErrorBank = (language: FixErrorSupportedLanguageId, difficulty: Difficulty, bank: FixErrorQuestionBankItem[]) => {
  const expectedSize = getFixErrorBankSize(language)
  if (bank.length !== expectedSize) {
    throw new Error(`Expected ${expectedSize} ${difficulty} questions for ${language} but received ${bank.length}.`)
  }

  const expectedLineDistribution = getLinePlan(language, difficulty, expectedSize).reduce(
    (counts, lineNumber) => {
      counts[lineNumber] += 1
      return counts
    },
    { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<LineNumber, number>,
  )
  const actualLineDistribution = countAnswerLineDistribution(bank)

  for (const lineNumber of lineNumbers) {
    if (actualLineDistribution[lineNumber] !== expectedLineDistribution[lineNumber]) {
      throw new Error(
        `Unexpected answer-line distribution for ${language}/${difficulty} on line ${lineNumber}: expected ${expectedLineDistribution[lineNumber]}, received ${actualLineDistribution[lineNumber]}.`,
      )
    }
  }

  assertNoDuplicateSurface(bank, `${language}/${difficulty}/fix-error snippet freshness`, (item) => item.snippetText)
  assertNoDuplicateSurface(bank, `${language}/${difficulty}/fix-error culprit freshness`, (item) => {
    const culprit = item.choices.find((choice) => choice.id === item.answer)?.fragment ?? ''
    return `${extractLogHead(item.errorText.en)}|||${culprit}|||${item.familyId}`
  })

  for (const item of bank) {
    if (item.difficulty !== difficulty) {
      throw new Error(`Expected ${difficulty} metadata for ${item.id} but received ${item.difficulty}.`)
    }

    assertLocalizedTextPresent(item.errorText, `${item.id} errorText`)
    assertLocalizedTextPresent(item.hint, `${item.id} hint`)
    assertLocalizedTextPresent(item.explanation.correct, `${item.id} explanation.correct`)
    assertStringPresent(item.snippetText, `${item.id} snippetText`)
    assertStringPresent(item.familyId, `${item.id} familyId`)

    if (item.guideTags.length === 0) {
      throw new Error(`Guide tags are missing for ${item.id}.`)
    }

    if (item.lineRoles.length !== 4) {
      throw new Error(`Expected 4 line roles for ${item.id}.`)
    }

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

    const answerLine = Number(item.answer.replace('line-', '')) as LineNumber
    const rootCauseCount = item.lineRoles.filter((role) => role === 'root-cause').length
    if (rootCauseCount !== 1) {
      throw new Error(`Expected exactly one root-cause role in ${item.id}.`)
    }

    if (item.lineRoles[answerLine - 1] !== 'root-cause') {
      throw new Error(`Answer line does not match the root-cause role in ${item.id}.`)
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
      if (!choice.lineNumber || choice.fragment === undefined) {
        throw new Error(`Choice metadata is incomplete for ${item.id}.`)
      }

      assertLocalizedTextPresent(choice.label, `${item.id} -> ${choice.id} label`)
      assertStringPresent(choice.fragment, `${item.id} -> ${choice.id} fragment`)
    }

    for (const [choiceId, explanation] of Object.entries(item.explanation.wrongChoices)) {
      if (!choiceIds.has(choiceId)) {
        throw new Error(`Wrong-choice explanation ${choiceId} does not map to a real choice in ${item.id}.`)
      }

      assertLocalizedTextPresent(explanation, `${item.id} -> wrong choice ${choiceId}`)
    }

    if (difficulty === 'easy' && /review-pass/i.test(normalizeSurface(item.snippetText))) {
      throw new Error(`Synthetic easy marker detected in ${item.id}.`)
    }
  }
}

export const fixErrorQuestionBanks = createFixErrorQuestionBanks()

for (const language of fixErrorSupportedLanguageIds) {
  validateFixErrorBank(language, 'easy', fixErrorQuestionBanks[language].easy)
  validateFixErrorBank(language, 'hard', fixErrorQuestionBanks[language].hard)
}
