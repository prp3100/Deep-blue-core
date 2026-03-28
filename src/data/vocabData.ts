import type {
  CoreLanguageId,
  Difficulty,
  GameLanguageId,
  LanguageId,
  LocalizedText,
  QuizTrackId,
  VocabContextRole,
  VocabChoice,
  VocabQuestionBankItem,
} from './quizModels'
import {
  assertLocalizedTextPresent,
  assertNoDuplicateSurface,
  assertStringPresent,
  assertUniqueLocalizedValues,
  assertUniqueStringValues,
  localizedKey,
  normalizeSurface,
} from './bankValidation'

const bi = (th: string, en: string): LocalizedText => ({ th, en })

export const VOCAB_ALL_CORE_SCOPE = 'all-core-vocab'
export const VOCAB_ALL_GAME_SCOPE = 'all-game-vocab'
const VOCAB_BANK_SIZE = 30

export const vocabSupportedCoreLanguageIds = [
  'python','java','html','css','json','csharp','cpp','flutter','dart','jsx',
  'typescript','bash','cloud-functions','sql','php','rust','javascript','go','kotlin','swift','ruby',
] as const satisfies readonly CoreLanguageId[]

export const vocabSupportedGameLanguageIds = [
  'roblox-lua','love2d-lua','godot-gdscript','godot-shader','unity-csharp',
  'unity-shaderlab','unreal-cpp','glsl','phaser-typescript','rpg-maker-js',
  'gamemaker-gml','defold-lua','cocos-typescript','bevy-rust','renpy-python',
] as const satisfies readonly GameLanguageId[]

export const vocabSupportedLanguageIds = [
  ...vocabSupportedCoreLanguageIds,
  ...vocabSupportedGameLanguageIds,
] as const satisfies readonly LanguageId[]

export type VocabSupportedLanguageId = (typeof vocabSupportedLanguageIds)[number]
export type VocabScopeId =
  | typeof VOCAB_ALL_CORE_SCOPE
  | typeof VOCAB_ALL_GAME_SCOPE
  | VocabSupportedLanguageId

const vocabGameLanguageSet = new Set<GameLanguageId>(vocabSupportedGameLanguageIds)
const getVocabTrack = (lang: VocabSupportedLanguageId): QuizTrackId =>
  vocabGameLanguageSet.has(lang as GameLanguageId) ? 'game-dev' : 'core'

const commentPrefixByLanguage: Record<VocabSupportedLanguageId, string> = {
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

type VocabSpec = {
  term: LocalizedText
  snippet: string
  correct: LocalizedText
  wrong: [LocalizedText, LocalizedText, LocalizedText]
  hint: LocalizedText
  explanation: LocalizedText
}

type SimpleVocabEntry = {
  term: LocalizedText
  snippet: string
  meaning: LocalizedText
}

const vocabContextRoles: VocabContextRole[] = [
  'direct',
  'inside-flow',
  'result-check',
  'loop-pass',
  'fallback-branch',
  'handler-setup',
  'state-update',
  'render-pass',
]

const vocabRoleNotes: Record<VocabContextRole, string> = {
  direct: 'direct example',
  'inside-flow': 'inside flow',
  'result-check': 'result check',
  'loop-pass': 'loop pass',
  'fallback-branch': 'fallback branch',
  'handler-setup': 'handler setup',
  'state-update': 'state update',
  'render-pass': 'render pass',
}

const getVocabContextRole = (round: number) => vocabContextRoles[round % vocabContextRoles.length]

const uniqueWrongChoices = (items: LocalizedText[], answer: LocalizedText): [LocalizedText, LocalizedText, LocalizedText] => {
  const seen = new Set<string>([localizedKey(answer)])
  const unique: LocalizedText[] = []

  for (const item of items) {
    const key = localizedKey(item)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(item)
    if (unique.length === 3) {
      break
    }
  }

  if (unique.length < 3) {
    throw new Error(`Unable to build 3 unique vocab distractors for ${answer.en}.`)
  }

  return unique as [LocalizedText, LocalizedText, LocalizedText]
}

const createSnippetVariant = (
  language: VocabSupportedLanguageId,
  difficulty: Difficulty,
  snippet: string,
  role: VocabContextRole,
) => {
  const prefix = commentPrefixByLanguage[language]
  const marker = difficulty === 'hard' ? `${vocabRoleNotes[role]} with a nearby lookalike` : vocabRoleNotes[role]

  if (role === 'direct') {
    return snippet
  }

  if (language === 'html') {
    return `<!-- ${marker} -->\n${snippet}`
  }

  if (language === 'css') {
    return `/* ${marker} */\n${snippet}`
  }

  if (language === 'json') {
    return snippet
  }

  return `${prefix} ${marker}\n${snippet}`
}

const extractVocabTermTokens = (term: LocalizedText) => {
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

const vocabHintSnippet = (term: LocalizedText, snippet: string) => {
  const lines = snippet
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const visibleLines = lines.filter((line) => !/^(#|\/\/|--|\/\*|<!--)/.test(line))
  const termTokens = extractVocabTermTokens(term)
  const focusLine =
    visibleLines.find((line) => termTokens.some((token) => (token === '$' ? line.includes('$') : line.toLowerCase().includes(token)))) ??
    visibleLines[0] ??
    lines[0] ??
    '[blank line]'

  return focusLine.length > 72 ? `${focusLine.slice(0, 69)}...` : focusLine
}

const inferVocabUsage = (focusLine: string): LocalizedText => {
  const normalizedLine = focusLine.toLowerCase()

  if (/^\s*(if|else|elseif|for|foreach|while|switch|case|match|try|except|catch|finally|break|continue|return)\b/.test(normalizedLine)) {
    return bi('ควบคุม flow หรือเงื่อนไข', 'control flow or branching')
  }

  if (/^\s*yield\b/.test(normalizedLine)) {
    return bi('ส่งค่าทีละรอบจาก generator', 'yielding a value from a generator')
  }

  if (
    /^\s*(class|struct|interface|enum|trait|protocol|def|func|function|fn|let|const|var|local|uniform|shader_type|import|from|use|package|module|label|type|#include)\b/.test(normalizedLine) ||
    /\blambda\b/.test(normalizedLine) ||
    /\b(extends|implements|required|final|props|exports)\b/.test(normalizedLine) ||
    /^\s*[\w$.]+\s*=\s*(async\s+)?\(/.test(normalizedLine) ||
    /^\s*[\w$.]+\s*=/.test(normalizedLine)
  ) {
    return bi('ประกาศหรือกำหนดสิ่งใหม่', 'declaration or definition')
  }

  if (/\|/.test(normalizedLine) || /\$[A-Za-z_][\w]*/.test(normalizedLine)) {
    return bi('ส่งค่าหรือดึงค่ามาใช้งานต่อ', 'passing or reading values through the pipeline')
  }

  if (/\w+\s*\(|\.\w+|:\w+/.test(normalizedLine)) {
    return bi('เรียกใช้หรือเข้าถึงค่า', 'invocation or value access')
  }

  return bi('บทบาทของ syntax นี้ในบริบท', 'the role this syntax plays in context')
}

const createHintVariant = (spec: VocabSpec, difficulty: Difficulty, round: number): LocalizedText => {
  const focusLine = vocabHintSnippet(spec.term, spec.snippet)
  const usage = inferVocabUsage(focusLine)

  return difficulty === 'hard'
    ? bi(
        `${spec.hint.th} ดูบรรทัด \`${focusLine}\` ว่ากำลังใช้เพื่อ${usage.th} แล้วตัดตัวเลือกที่กว้างเกิน snippet นี้`,
        `${spec.hint.en} Use \`${focusLine}\` to judge whether it acts as ${usage.en}, then eliminate choices that are broader than this snippet.`,
      )
    : round === 0
      ? bi(
          `${spec.hint.th} ลองผูกกับบรรทัด \`${focusLine}\` ว่ากำลังใช้เพื่อ${usage.th}`,
          `${spec.hint.en} Tie it to \`${focusLine}\` and check whether it acts as ${usage.en}.`,
        )
      : bi(
          `${spec.hint.th} ลองผูกกับบรรทัด \`${focusLine}\` ว่ากำลังใช้เพื่อ${usage.th} มากกว่าดูคำศัพท์ลอย ๆ`,
          `${spec.hint.en} Tie it to \`${focusLine}\` and check whether it acts as ${usage.en} instead of reading the term in isolation.`,
        )
}

const createExplanationVariant = (spec: VocabSpec, difficulty: Difficulty): LocalizedText =>
  difficulty === 'hard'
    ? bi(
        `${spec.explanation.th} โจทย์โหมดยากจะใช้ตัวลวงที่ใกล้กับศัพท์จากภาษาใกล้เคียงมากขึ้น จึงต้องอาศัยบริบทจาก snippet มากกว่าเดิม`,
        `${spec.explanation.en} Hard mode uses distractors that are closer to terms from neighboring languages, so the snippet context has to carry more of the decision.`,
      )
    : spec.explanation

const createWrongChoices = (
  specs: VocabSpec[],
  specIndex: number,
  spec: VocabSpec,
  difficulty: Difficulty,
): [LocalizedText, LocalizedText, LocalizedText] =>
  difficulty === 'hard'
    ? uniqueWrongChoices(
        [
          specs[(specIndex + 1) % specs.length].correct,
          specs[(specIndex + 2) % specs.length].correct,
          specs[(specIndex + 3) % specs.length].correct,
          ...spec.wrong,
          specs[(specIndex + 4) % specs.length].correct,
        ],
        spec.correct,
      )
    : spec.wrong

const buildBank = (
  lang: VocabSupportedLanguageId,
  difficulty: Difficulty,
  specs: VocabSpec[],
): VocabQuestionBankItem[] =>
  Array.from({ length: VOCAB_BANK_SIZE }, (_, itemIndex) => {
    const specIndex = itemIndex % specs.length
    const round = Math.floor(itemIndex / specs.length)
    const contextRole = getVocabContextRole(round)
    const spec = specs[specIndex]
    const wrongChoices = createWrongChoices(specs, specIndex, spec, difficulty)
    const choices: [VocabChoice, VocabChoice, VocabChoice, VocabChoice] = [
      { id: 'a', label: spec.correct },
      { id: 'b', label: wrongChoices[0] },
      { id: 'c', label: wrongChoices[1] },
      { id: 'd', label: wrongChoices[2] },
    ]
    return {
      id: `vocab-${difficulty}-${lang}-${itemIndex + 1}`,
      format: 'vocab',
      track: getVocabTrack(lang),
      language: lang,
      difficulty,
      contextRole,
      termText: spec.term,
      snippetText: createSnippetVariant(lang, difficulty, spec.snippet, contextRole),
      choices,
      answer: 'a',
      hint: createHintVariant(spec, difficulty, round),
      explanation: { correct: createExplanationVariant(spec, difficulty) },
    }
  })

const buildLanguageBanks = (language: VocabSupportedLanguageId, specs: VocabSpec[]) => ({
  easy: buildBank(language, 'easy', specs),
  hard: buildBank(language, 'hard', specs),
})

const v = (
  termTh: string, termEn: string,
  snippet: string,
  correctTh: string, correctEn: string,
  w1Th: string, w1En: string,
  w2Th: string, w2En: string,
  w3Th: string, w3En: string,
  hintTh: string, hintEn: string,
  expTh: string, expEn: string,
): VocabSpec => ({
  term: bi(termTh, termEn),
  snippet,
  correct: bi(correctTh, correctEn),
  wrong: [bi(w1Th, w1En), bi(w2Th, w2En), bi(w3Th, w3En)],
  hint: bi(hintTh, hintEn),
  explanation: bi(expTh, expEn),
})

const simpleEntry = (termTh: string, termEn: string, snippet: string, meaningTh: string, meaningEn: string): SimpleVocabEntry => ({
  term: bi(termTh, termEn),
  snippet,
  meaning: bi(meaningTh, meaningEn),
})

const buildSimpleSpecs = (entries: SimpleVocabEntry[]): VocabSpec[] =>
  entries.map((entry, index) => {
    const wrong = entries
      .filter((_, candidateIndex) => candidateIndex !== index)
      .map((candidate) => candidate.meaning)

    return {
      term: entry.term,
      snippet: entry.snippet,
      correct: entry.meaning,
      wrong: wrong as [LocalizedText, LocalizedText, LocalizedText],
      hint: bi(
        `ดูว่าคำว่า "${entry.term.th}" ถูกใช้ทำหน้าที่อะไรใน snippet นี้`,
        `Check what role "${entry.term.en}" plays in this snippet.`,
      ),
      explanation: bi(
        `${entry.term.th} ในบริบทนี้หมายถึง ${entry.meaning.th}`,
        `In this context, ${entry.term.en} means ${entry.meaning.en}.`,
      ),
    }
  })

// ──────────────────────── PYTHON ────────────────────────
const pythonSpecs: VocabSpec[] = [
  v('def','def','def greet(name):\n    return f"Hello {name}"',
    'ประกาศฟังก์ชัน','Define a function',
    'ประกาศตัวแปร','Declare a variable',
    'ลบข้อมูล','Delete data',
    'นำเข้าโมดูล','Import a module',
    'def ย่อมาจาก define','def is short for define',
    'def ใช้สร้างฟังก์ชันใหม่ใน Python','def is used to create a new function in Python.'),
  v('lambda','lambda','square = lambda x: x ** 2',
    'สร้างฟังก์ชันนิรนาม','Create an anonymous function',
    'วนลูป','Loop iteration',
    'นำเข้าไลบรารี','Import a library',
    'ประกาศคลาส','Declare a class',
    'lambda สร้างฟังก์ชันแบบไม่ต้องตั้งชื่อ','lambda creates a nameless function',
    'lambda สร้างฟังก์ชันสั้นๆ แบบ inline ที่ไม่ต้องใช้ def','lambda creates a short inline function without needing def.'),
  v('import','import','import os\nprint(os.getcwd())',
    'นำเข้าโมดูล','Import a module',
    'ส่งออก','Export',
    'พิมพ์ข้อความ','Print text',
    'ประกาศตัวแปร','Declare a variable',
    'import ดึงโมดูลเข้ามาใช้งาน','import brings a module into scope',
    'import โหลดโมดูลภายนอกเข้ามาใช้ในไฟล์ปัจจุบัน','import loads an external module into the current file.'),
  v('try / except','try / except','try:\n    int("abc")\nexcept ValueError:\n    print("error")',
    'จัดการข้อผิดพลาด','Handle exceptions',
    'วนลูป','Loop',
    'ประกาศคลาส','Define a class',
    'เปรียบเทียบค่า','Compare values',
    'try ใช้ดัก error ที่อาจเกิดขึ้น','try catches potential errors',
    'try/except ดัก exception เพื่อไม่ให้โปรแกรมหยุดทำงาน','try/except catches exceptions so the program does not crash.'),
  v('yield','yield','def gen():\n    yield 1\n    yield 2',
    'คืนค่าแบบ generator','Yield a value from a generator',
    'หยุดโปรแกรม','Stop the program',
    'นำเข้าโมดูล','Import a module',
    'ลบตัวแปร','Delete a variable',
    'yield ทำให้ฟังก์ชันกลายเป็น generator','yield turns a function into a generator',
    'yield คืนค่าทีละตัวจาก generator function','yield returns values one at a time from a generator function.'),
  v('list comprehension','list comprehension','squares = [x**2 for x in range(5)]',
    'สร้าง list ด้วย expression สั้นๆ','Create a list with a short expression',
    'ลบสมาชิกใน list','Remove list items',
    'เรียงลำดับ list','Sort a list',
    'แปลง list เป็น tuple','Convert list to tuple',
    'ดูที่ [ ... for ... in ... ]','Look at [ ... for ... in ... ]',
    'list comprehension สร้าง list ใหม่จาก expression ใน 1 บรรทัด','List comprehension creates a new list from an expression in one line.'),
  v('with','with','with open("f.txt") as f:\n    data = f.read()',
    'จัดการ context (เปิด/ปิดอัตโนมัติ)','Manage context (auto open/close)',
    'วนลูป','Loop',
    'เปรียบเทียบค่า','Compare values',
    'ประกาศฟังก์ชัน','Define a function',
    'with จัดการ resource อัตโนมัติ','with manages resources automatically',
    'with ใช้กับ context manager เพื่อเปิดและปิด resource อัตโนมัติ','with uses a context manager to automatically open and close resources.'),
  v('self','self','class Dog:\n    def bark(self):\n        print("Woof")',
    'อ้างถึง instance ปัจจุบัน','Refer to the current instance',
    'สร้าง instance ใหม่','Create a new instance',
    'ลบ object','Delete an object',
    'เรียก superclass','Call superclass',
    'self คือตัว object ที่เรียก method','self is the object that called the method',
    'self อ้างถึง instance ของ class ที่เรียก method นั้น','self refers to the instance of the class that called the method.'),
  v('__init__','__init__','class User:\n    def __init__(self, name):\n        self.name = name',
    'constructor ของ class','Class constructor',
    'destructor','Destructor',
    'static method','Static method',
    'class method','Class method',
    '__init__ ถูกเรียกตอนสร้าง object ใหม่','__init__ is called when creating a new object',
    '__init__ เป็น constructor ที่รันอัตโนมัติเมื่อสร้าง instance ใหม่','__init__ is the constructor that auto-runs when creating a new instance.'),
  v('pip','pip','pip install requests',
    'ตัวจัดการ package ของ Python','Python package manager',
    'คำสั่งรันไฟล์','Command to run files',
    'ตัวแปลภาษา','Interpreter',
    'เครื่องมือ debug','Debug tool',
    'pip ใช้ติดตั้ง library','pip installs libraries',
    'pip เป็น package manager สำหรับติดตั้งและจัดการ library ใน Python','pip is the package manager for installing and managing Python libraries.'),
  v('decorator (@)','decorator (@)','@app.route("/")\ndef home():\n    return "Hello"',
    'ครอบฟังก์ชันเพื่อเพิ่มพฤติกรรม','Wrap a function to add behavior',
    'ประกาศตัวแปร','Declare a variable',
    'สร้าง class','Create a class',
    'นำเข้าโมดูล','Import a module',
    '@ นำหน้าฟังก์ชันเพื่อ wrap มัน','@ precedes a function to wrap it',
    'decorator ครอบฟังก์ชันเดิมเพื่อเพิ่มหรือเปลี่ยนพฤติกรรมโดยไม่แก้โค้ดภายใน','A decorator wraps a function to add or change behavior without modifying its internals.'),
  v('range()','range()','for i in range(5):\n    print(i)',
    'สร้างลำดับตัวเลข','Generate a sequence of numbers',
    'สุ่มตัวเลข','Generate random numbers',
    'นับจำนวนสมาชิก','Count elements',
    'แปลงเป็น string','Convert to string',
    'range สร้างตัวเลขต่อเนื่อง','range creates consecutive numbers',
    'range() สร้างลำดับตัวเลขที่ใช้กับ for loop ได้','range() generates a number sequence usable with for loops.'),
  v('dict','dict','user = {"name": "Ada", "age": 30}',
    'โครงสร้างข้อมูลแบบ key-value','Key-value data structure',
    'ลำดับข้อมูลแบบ list','Ordered list structure',
    'ชุดข้อมูลไม่ซ้ำ','Set of unique values',
    'ข้อมูลแบบ tuple','Tuple data',
    'dict ใช้ {} กับ key: value','dict uses {} with key: value',
    'dict เก็บข้อมูลแบบ key-value pair เข้าถึงได้เร็วผ่าน key','dict stores key-value pairs with fast access by key.'),
  v('None','None','result = None',
    'ค่าว่างเปล่า (ไม่มีค่า)','Represents no value',
    'ค่า 0','Value 0',
    'ค่า false','Value false',
    'สตริงว่าง','Empty string',
    'None ไม่ใช่ 0 หรือ ""','None is not 0 or ""',
    'None เป็นค่าพิเศษที่หมายถึง "ไม่มีค่า" ใน Python','None is a special value meaning "no value" in Python.'),
  v('async / await','async / await','async def fetch():\n    data = await get_data()',
    'เขียนโค้ดแบบ asynchronous','Write asynchronous code',
    'สร้าง thread','Create a thread',
    'จัดการ error','Handle errors',
    'ประกาศตัวแปร global','Declare global variable',
    'async ทำให้ฟังก์ชันเป็น coroutine','async makes a function a coroutine',
    'async/await ใช้เขียนโค้ด asynchronous ที่อ่านง่ายเหมือน synchronous','async/await writes asynchronous code that reads like synchronous code.'),
]

// ──────────────────────── JAVASCRIPT ────────────────────────
const javascriptSpecs: VocabSpec[] = [
  v('const','const','const name = "Ada"',
    'ประกาศตัวแปรที่เปลี่ยนค่าไม่ได้','Declare an immutable binding',
    'ประกาศฟังก์ชัน','Declare a function','ลบตัวแปร','Delete a variable','วนลูป','Loop',
    'const ไม่สามารถ reassign ได้','const cannot be reassigned',
    'const สร้าง binding ที่ไม่สามารถ reassign ได้หลังประกาศ','const creates a binding that cannot be reassigned after declaration.'),
  v('let','let','let count = 0\ncount += 1',
    'ประกาศตัวแปรแบบ block scope','Declare a block-scoped variable',
    'ประกาศค่าคงที่','Declare a constant','นำเข้า module','Import module','ส่งออก','Export',
    'let จำกัดขอบเขตอยู่ใน block','let is limited to block scope',
    'let ประกาศตัวแปรที่มีขอบเขตอยู่ใน block {} ที่ประกาศ','let declares a variable scoped to its enclosing block {}.'),
  v('arrow function (=>)','arrow function (=>)','const add = (a, b) => a + b',
    'ฟังก์ชันแบบย่อ','Shorthand function syntax',
    'ตัวเปรียบเทียบ','Comparison operator','ตัวกำหนดค่า','Assignment','ตัวชี้ pointer','Pointer',
    '=> เป็น syntax สั้นแทน function','=> is short syntax for function',
    'arrow function ใช้ => เพื่อเขียนฟังก์ชันสั้นๆ พร้อม lexical this','Arrow functions use => for short functions with lexical this.'),
  v('Promise','Promise','fetch(url).then(res => res.json())',
    'แทนค่าที่จะมาในอนาคต','Represents a future value',
    'วนลูป','Loop','จัดการ error','Handle errors','สร้าง array','Create array',
    'Promise จัดการงาน async','Promise handles async work',
    'Promise แทนผลลัพธ์ของ async operation ที่ยังไม่เสร็จ','Promise represents the result of an async operation that has not completed yet.'),
  v('async / await','async / await','async function load() {\n  const data = await fetch(url)\n}',
    'เขียน async แบบอ่านง่าย','Write async code readably',
    'สร้าง thread','Create thread','ประกาศ class','Declare class','นำเข้า module','Import module',
    'await หยุดรอ Promise','await pauses for a Promise',
    'async/await ทำให้เขียน async code ที่อ่านเหมือน sync','async/await makes async code read like synchronous code.'),
  v('map()','map()','[1,2,3].map(x => x * 2)',
    'แปลงทุกสมาชิกใน array','Transform every array element',
    'กรองสมาชิก','Filter elements','เรียงลำดับ','Sort','หาค่าเดียว','Find single value',
    'map สร้าง array ใหม่จากการแปลง','map creates a new array from transformation',
    'map() เรียก callback กับทุกสมาชิกแล้วคืน array ใหม่','map() calls a callback on every element and returns a new array.'),
  v('spread (...)','spread (...)','const arr = [...a, ...b]',
    'กระจายสมาชิกออก','Spread elements out',
    'ลบสมาชิก','Remove elements','รวมเป็น string','Join as string','สร้าง object','Create object',
    '... กระจาย array/object','... spreads array/object',
    'spread operator กระจายสมาชิกจาก array หรือ object เข้าที่ใหม่','Spread operator distributes elements from an array or object into a new location.'),
  v('destructuring','destructuring','const { name, age } = user',
    'แยกค่าจาก object/array','Extract values from object/array',
    'รวมค่า','Merge values','ลบค่า','Delete values','เปรียบเทียบค่า','Compare values',
    'ดูว่าด้านซ้ายของ = เป็น {} หรือ []','Check if left side of = is {} or []',
    'destructuring แยกค่าจาก object หรือ array ลงตัวแปรหลายตัวพร้อมกัน','Destructuring extracts values from objects or arrays into multiple variables at once.'),
  v('template literal','template literal','const msg = `Hello ${name}`',
    'สร้าง string แบบแทรกค่าได้','Create a string with interpolation',
    'สร้าง regex','Create regex','สร้าง comment','Create comment','ประกาศ type','Declare type',
    'ใช้ backtick ` กับ ${}','Uses backtick ` with ${}',
    'template literal ใช้ backtick เพื่อแทรก expression ลงใน string','Template literals use backticks to embed expressions in strings.'),
  v('typeof','typeof','console.log(typeof 42)',
    'ตรวจ type ของค่า','Check the type of a value',
    'แปลง type','Convert type','ประกาศ type','Declare type','ลบ type','Delete type',
    'typeof คืนชื่อ type เป็น string','typeof returns the type name as a string',
    'typeof คืนค่า string ที่บอก type ของ operand','typeof returns a string indicating the type of the operand.'),
  v('null vs undefined','null vs undefined','let x;\nconsole.log(x)',
    'undefined = ยังไม่กำหนดค่า, null = กำหนดให้ว่าง','undefined = not assigned, null = intentionally empty',
    'เหมือนกันทุกประการ','Exactly the same','null = 0','null = 0','undefined = false','undefined = false',
    'แยก undefined กับ null ด้วยความตั้งใจ','Distinguish by intent',
    'undefined คือค่าที่ยังไม่ถูกกำหนด ส่วน null คือค่าที่ตั้งใจให้ว่าง','undefined means not yet assigned while null means intentionally empty.'),
  v('forEach()','forEach()','[1,2,3].forEach(x => console.log(x))',
    'วนทำทุกสมาชิกใน array','Execute for every array element',
    'สร้าง array ใหม่','Create new array','กรองสมาชิก','Filter elements','หาค่ารวม','Sum values',
    'forEach ไม่คืน array ใหม่','forEach does not return a new array',
    'forEach() เรียก callback กับทุกสมาชิกโดยไม่คืนค่า','forEach() calls a callback on every element without returning a value.'),
  v('filter()','filter()','[1,2,3,4].filter(x => x > 2)',
    'กรองสมาชิกตามเงื่อนไข','Filter elements by condition',
    'แปลงทุกสมาชิก','Transform elements','เรียงลำดับ','Sort','หาค่าเดียว','Find one value',
    'filter คืน array ใหม่เฉพาะตัวที่ผ่านเงื่อนไข','filter returns a new array with only matching items',
    'filter() คืน array ใหม่ที่มีเฉพาะสมาชิกที่ callback คืน true','filter() returns a new array of elements for which the callback returns true.'),
  v('reduce()','reduce()','[1,2,3].reduce((sum, x) => sum + x, 0)',
    'รวมค่าทั้ง array เป็นค่าเดียว','Reduce array to a single value',
    'กรองสมาชิก','Filter elements','แปลงสมาชิก','Transform elements','เรียงลำดับ','Sort',
    'reduce ย่อ array เหลือค่าเดียว','reduce collapses array to one value',
    'reduce() รวมทุกสมาชิกใน array ด้วย accumulator เป็นค่าเดียว','reduce() combines all array elements via an accumulator into a single value.'),
  v('class','class','class Animal {\n  constructor(name) {\n    this.name = name\n  }\n}',
    'ประกาศ class (blueprint ของ object)','Declare a class (object blueprint)',
    'ประกาศฟังก์ชัน','Declare function','สร้าง module','Create module','นำเข้า library','Import library',
    'class เป็น template สำหรับสร้าง object','class is a template for creating objects',
    'class ใน JS เป็น syntactic sugar สำหรับ prototype-based inheritance','class in JS is syntactic sugar for prototype-based inheritance.'),
]

// ──────────────────────── HTML ────────────────────────
const htmlSpecs: VocabSpec[] = [
  v('section','section','<section>\n  <h2>Latest news</h2>\n</section>',
    'แบ่งเนื้อหาเป็นส่วนเชิงความหมาย','Group related semantic content',
    'ลิงก์ไปหน้าอื่น','Link to another page','แสดงรูปภาพ','Render an image','ส่งฟอร์มทันที','Submit a form instantly',
    'section มักครอบ block เนื้อหาเรื่องเดียวกัน','section usually wraps one related content block',
    'section ใช้แบ่งเอกสารออกเป็นส่วนที่มีหัวข้อหรือความหมายชัดเจน','section divides a document into a meaningful content area with its own heading or purpose.'),
  v('href','href','<a href="/docs">Read docs</a>',
    'กำหนดปลายทางของลิงก์','Define a link destination',
    'ตั้งชื่อ class','Set a class name','ใส่ข้อความสำรองรูปภาพ','Provide image fallback text','กำหนดสีตัวอักษร','Set text color',
    'href มักอยู่ในแท็ก <a>','href usually appears on an <a> tag',
    'href ระบุ URL หรือ path ที่ browser ต้องเปิดเมื่อคลิกลิงก์','href specifies the URL or path the browser should open when the link is clicked.'),
  v('alt','alt','<img src="banner.jpg" alt="Summer sale banner" />',
    'คำอธิบายข้อความสำหรับรูปภาพ','Text description for an image',
    'ขนาดของรูป','Image size','ที่อยู่ลิงก์','Link address','ชื่อไฟล์ CSS','CSS file name',
    'alt ช่วยตอนรูปไม่โหลดหรือใช้ screen reader','alt helps when images fail or screen readers are used',
    'alt ให้ข้อความอธิบายรูปภาพเพื่อการเข้าถึงและใช้แทนรูปเมื่อโหลดไม่สำเร็จ','alt provides accessible descriptive text for an image and is used when the image cannot load.'),
  v('form','form','<form>\n  <input type="email" />\n</form>',
    'ครอบชุดข้อมูลที่ผู้ใช้จะส่ง','Wrap user input fields for submission',
    'สร้างตาราง','Create a table','ใส่สไตล์ให้ element','Style an element','แสดงวิดีโอ','Render a video',
    'form มักมี input, button อยู่ข้างใน','form usually contains inputs and buttons',
    'form รวม field หลายตัวไว้เพื่อส่งข้อมูลของผู้ใช้ไปยังปลายทางเดียวกัน','form groups multiple fields so user input can be submitted together.'),
  v('label','label','<label for="email">Email</label>\n<input id="email" />',
    'ป้ายชื่อที่ผูกกับช่องกรอกข้อมูล','Caption tied to an input field',
    'ปุ่มส่งข้อมูล','Submit button','container ของรายการ','List container','ข้อความอธิบายลิงก์','Link description text',
    'ดูคู่ for กับ id ว่าจับคู่กัน','Check whether for and id are paired',
    'label ให้ข้อความอธิบาย field และช่วยให้กดข้อความเพื่อโฟกัส input ได้','label gives an input a readable caption and can focus the input when clicked.'),
  v('charset','charset','<meta charset="UTF-8" />',
    'กำหนด encoding ของเอกสาร','Declare the document character encoding',
    'กำหนดขนาด viewport','Define viewport size','ตั้งชื่อหน้าเว็บ','Set page title','เชื่อมไฟล์ script','Attach a script file',
    'charset มักอยู่ในแท็ก meta','charset often appears inside a meta tag',
    'charset บอก browser ว่าต้องตีความตัวอักษรในเอกสารด้วย encoding ใด','charset tells the browser which text encoding to use when reading the document.'),
  v('required','required','<input type="text" required />',
    'บังคับให้กรอกก่อน submit','Require input before submit',
    'ซ่อน field นี้','Hide the field','เปลี่ยน field เป็น readonly','Make the field readonly','ล้างค่าหลังพิมพ์','Clear value after typing',
    'required เป็น validation ฝั่ง browser','required is browser-side validation',
    'required ทำให้ browser ไม่ยอมส่งฟอร์มหาก field นี้ยังว่างอยู่','required prevents the browser from submitting the form while the field is empty.'),
  v('li','li','<ul>\n  <li>Install</li>\n  <li>Deploy</li>\n</ul>',
    'รายการย่อยหนึ่งข้อใน list','One item inside a list',
    'หัวเรื่องหลักของหน้า','The page main heading','คอนเทนเนอร์ของฟอร์ม','A form container','แท็กฝังสคริปต์','A script embedding tag',
    'li มักอยู่ใน ul หรือ ol','li usually appears inside ul or ol',
    'li แทนรายการเดี่ยวแต่ละข้อภายใน list แบบลำดับหรือไม่ลำดับ','li represents each individual item inside an ordered or unordered list.'),
]

// ──────────────────────── CSS ────────────────────────
const cssSpecs: VocabSpec[] = [
  v('display: flex','display: flex','.toolbar {\n  display: flex;\n}',
    'จัดวางลูกด้วย Flexbox','Lay out children with Flexbox',
    'เปลี่ยนสีตัวอักษร','Change text color','ซ่อน element','Hide the element','บังคับให้เต็มจอ','Force fullscreen mode',
    'flex มักใช้กับ container ไม่ใช่ลูกแต่ละตัว','flex usually styles the container, not each child',
    'display: flex เปลี่ยน element ให้เป็น flex container เพื่อจัดวางลูกในแนวแถวหรือคอลัมน์ได้ง่าย','display: flex turns an element into a flex container so its children can be aligned in rows or columns.'),
  v('gap','gap','.cards {\n  display: grid;\n  gap: 16px;\n}',
    'ระยะห่างระหว่างลูกใน flex/grid','Space between flex/grid children',
    'ความกว้างของเส้นขอบ','Border width','ระยะห่างนอกกล่อง','Outer margin','ความสูงบรรทัด','Line height',
    'gap มีผลกับ flex/grid container','gap affects flex/grid containers',
    'gap กำหนดช่องว่างระหว่าง item ภายใน flex หรือ grid โดยไม่ต้องใส่ margin ให้ทุกชิ้น','gap defines spacing between items in flex or grid layouts without adding margins to every item.'),
  v('@media','@media','@media (max-width: 768px) {\n  .panel { padding: 16px; }\n}',
    'เขียน style ตามเงื่อนไขหน้าจอ','Apply styles conditionally by viewport/device',
    'นำเข้าไฟล์ CSS','Import a CSS file','สร้าง animation','Create an animation','เลือก pseudo-element','Select a pseudo-element',
    '@media มักตามด้วยเงื่อนไขเช่น max-width','@media is usually followed by conditions like max-width',
    '@media ใช้เขียน responsive rules ที่ทำงานเฉพาะเมื่อเงื่อนไขของหน้าจอเป็นจริง','@media writes responsive rules that only apply when the viewport condition is true.'),
  v(':hover',':hover','.button:hover {\n  background: #111827;\n}',
    'style ตอนเมาส์ชี้อยู่บน element','Style an element while it is hovered',
    'style ตอน element ถูกคลิกค้าง','Style while the element is active','เลือก element ลูกตัวแรก','Select the first child','สร้างตัวแปร CSS','Create a CSS variable',
    ':hover เป็น pseudo-class ตามสถานะผู้ใช้',':hover is a user-state pseudo-class',
    ':hover ใช้เปลี่ยนสไตล์ชั่วคราวเมื่อผู้ใช้เลื่อนเมาส์มาชี้บน element',':hover temporarily changes styles when the pointer is over the element.'),
  v('position: absolute','position: absolute','.badge {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}',
    'วางตำแหน่งอิงขอบของ container ที่เกี่ยวข้อง','Position relative to a containing box',
    'จัดลูกเรียงแนวนอน','Lay out children horizontally','ล็อก element ติดจอเสมอ','Keep element fixed to viewport','ซ่อน element จาก flow ทั้งหมด','Hide element from layout',
    'absolute มักใช้คู่ top/right/left/bottom','absolute is commonly paired with top/right/left/bottom',
    'position: absolute นำ element ออกจาก flow ปกติแล้ววางด้วย offset ตาม containing block','position: absolute removes an element from normal flow and positions it using offsets from its containing block.'),
  v('grid-template-columns','grid-template-columns','.layout {\n  display: grid;\n  grid-template-columns: 1fr 280px;\n}',
    'กำหนดจำนวนและขนาดคอลัมน์ของ grid','Define grid column count and sizes',
    'กำหนดช่องว่างระหว่างแถว','Define row gaps','เลือกคอลัมน์แรกของ table','Select the first table column','ตั้งความกว้างสูงสุดของรูป','Set an image max width',
    'มองหา display: grid อยู่บรรทัดใกล้ ๆ','Look for display: grid nearby',
    'grid-template-columns ระบุว่า grid ต้องมีคอลัมน์กี่คอลัมน์และแต่ละคอลัมน์กว้างเท่าไร','grid-template-columns declares how many columns a grid has and how wide each one should be.'),
  v('var(--token)','var(--token)','color: var(--accent);',
    'ดึงค่าจาก CSS custom property','Read a CSS custom property value',
    'เรียกฟังก์ชัน JavaScript','Call a JavaScript function','แปลงสีเป็น rgba','Convert a color to rgba','import ตัวแปรจากไฟล์อื่น','Import a variable from another file',
    'var() มักอ้างถึงชื่อที่ขึ้นต้นด้วย --','var() usually references names that start with --',
    'var(--token) ดึงค่าจาก CSS variable ที่ประกาศไว้ก่อนหน้าเพื่อใช้ซ้ำทั้งระบบ','var(--token) reads a previously declared CSS variable so values can be reused consistently.'),
  v('rem','rem','font-size: 1.125rem;',
    'หน่วยที่อิงขนาด font ของ root','Unit based on the root font size',
    'หน่วยอิง parent โดยตรง','Unit based directly on the parent','หน่วยเปอร์เซ็นต์ของความกว้างจอ','Percentage of viewport width','หน่วยสำหรับเวลา animation','Unit for animation time',
    'rem ต่างจาก em เพราะอิง root','rem differs from em because it references the root',
    'rem เป็นหน่วยที่อิง font-size ของ root element ทำให้ scale ทั้งระบบได้ง่าย','rem is a unit based on the root element font size, making global scaling easier.'),
]

// ──────────────────────── JSON ────────────────────────
const jsonSpecs: VocabSpec[] = [
  v('object {}','object {}','{\n  "name": "Ada",\n  "score": 98\n}',
    'ชุดข้อมูลแบบ key-value ภายในวงเล็บปีกกา','A key-value data object inside braces',
    'ลำดับคำสั่งที่รันต่อกัน','A sequence of executable statements','รายการสไตล์ CSS','A list of CSS rules','ฟังก์ชันที่คืนค่า object','A function returning an object',
    'ดูว่ามีคู่ "key": value อยู่ใน { }','Look for "key": value pairs inside { }',
    'object ใน JSON ใช้ { } เพื่อเก็บข้อมูลหลายคู่แบบ key-value ภายใต้โครงสร้างเดียวกัน','A JSON object uses { } to store multiple key-value pairs under one structured record.'),
  v('array []','array []','{\n  "tags": ["ui", "quiz", "react"]\n}',
    'ลิสต์ข้อมูลหลายค่าในลำดับเดียวกัน','An ordered list of multiple values',
    'คำสั่งเงื่อนไข if','An if conditional','ชุด property ของ CSS','A set of CSS properties','ชุด route ของ server','A server route list',
    'array ใน JSON ใช้ [ ]','arrays in JSON use [ ]',
    'array ใน JSON ใช้ [ ] เพื่อเก็บหลายค่าเรียงตามลำดับเดียวกัน','A JSON array uses [ ] to store multiple ordered values together.'),
  v('double quotes','double quotes','{\n  "title": "Core Language"\n}',
    'รูปแบบการครอบ key และ string ใน JSON','The required quoting style for keys and strings',
    'เครื่องหมาย comment หลักของ JSON','The main JSON comment marker','วิธีเปิด block คำสั่ง','How JSON opens a statement block','ตัวแบ่งระหว่าง object กับ array','The separator between objects and arrays',
    'JSON ใช้ "..." ไม่ใช่ single quote','JSON uses "..." rather than single quotes',
    'JSON มาตรฐานกำหนดให้ key และ string ใช้ double quotes เพื่อให้ parser อ่านได้ตรงกัน','Standard JSON requires double quotes for keys and string values so parsers can read them consistently.'),
  v('boolean','boolean','{\n  "enabled": true,\n  "beta": false\n}',
    'ค่าจริง/เท็จแบบ true หรือ false','A true/false value',
    'ค่าตัวเลขจำนวนเต็ม','An integer number','ค่าที่ยังไม่ถูกประกาศ','An undeclared value','ข้อความหลายบรรทัด','A multiline text block',
    'boolean ใน JSON คือ true หรือ false','boolean in JSON is true or false',
    'boolean ใน JSON ใช้แทนสถานะสองค่า เช่น เปิด/ปิด หรือจริง/เท็จ','A JSON boolean represents a two-state value such as on/off or true/false.'),
  v('null','null','{\n  "avatar": null\n}',
    'ค่าที่ตั้งใจบอกว่าไม่มีข้อมูล','An explicit no-value placeholder',
    'สตริงว่าง','An empty string','ค่า false','A false value','เลขศูนย์','The number zero',
    'null ไม่เท่ากับ "" หรือ 0','null is not the same as "" or 0',
    'null ใน JSON ใช้บอกอย่างชัดเจนว่าฟิลด์นี้ยังไม่มีข้อมูลหรือจงใจเว้นว่างไว้','null in JSON explicitly marks a field as having no value.'),
  v('nested object','nested object','{\n  "user": {\n    "id": 7,\n    "role": "admin"\n  }\n}',
    'object ที่ซ้อนอยู่ภายใน object อีกชั้น','An object placed inside another object',
    'array ซ้อนหลายชั้น','A multi-level array','comment block ของไฟล์','A file comment block','รูปแบบ import ของ module','A module import pattern',
    'ดูว่าค่า value ทางขวาเป็น { } อีกชั้น','Check whether the value on the right is another { } block',
    'nested object ช่วยจัดกลุ่มข้อมูลย่อยภายใต้ key หลักเดียวกันให้โครงสร้างชัดขึ้น','A nested object groups related subfields under one main key for clearer structure.'),
  v('colon (:)','colon (:)','{\n  "name": "Ada"\n}',
    'ตัวคั่นระหว่าง key กับ value','Separator between a key and its value',
    'ตัวคั่นระหว่าง item ใน array','Separator between items in an array','ตัวจบ object','Object terminator','ตัวเริ่ม comment','Comment starter',
    'ใน JSON รูปแบบคือ "key": value','In JSON the pattern is "key": value',
    'colon ใน JSON คั่นชื่อ field ทางซ้ายออกจากค่าจริงทางขวา','A colon in JSON separates the field name on the left from its value on the right.'),
  v('comma separator','comma separator','{\n  "id": 1,\n  "name": "Ada",\n  "active": true\n}',
    'ตัวคั่นสมาชิกหรือคู่ข้อมูลแต่ละตัว','Separator between adjacent items or pairs',
    'ตัวเปิด array','Array opener','ตัวปิด string','String closer','ตัวบอก type ของ field','Field type marker',
    'comma จะคั่น item ถัดไป ไม่ใช่ปิด block','a comma separates the next item; it does not close the block',
    'comma ใน JSON ใช้คั่นระหว่างคู่ key-value หรือสมาชิก array ที่อยู่ติดกัน','A comma in JSON separates neighboring key-value pairs or array items.'),
]

// ──────────────────────── FLUTTER ────────────────────────
const flutterSpecs: VocabSpec[] = [
  v('StatelessWidget','StatelessWidget','class ProfileCard extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return const Text("Hi");\n  }\n}',
    'widget ที่ไม่มี state เปลี่ยนภายในตัวเอง','A widget with no mutable local state',
    'widget ที่เรียก setState ได้','A widget that calls setState','service สำหรับ route','A routing service','โครง layout แบบ grid','A grid layout primitive',
    'StatelessWidget ใช้เมื่อ UI ขึ้นกับ input ล้วน ๆ','Use StatelessWidget when UI depends only on incoming configuration',
    'StatelessWidget เหมาะกับ UI ที่ไม่ต้องเก็บ state เปลี่ยนแปลงระหว่างการใช้งาน','StatelessWidget is used for UI that does not manage changing local state over time.'),
  v('StatefulWidget','StatefulWidget','class CounterCard extends StatefulWidget {\n  const CounterCard({super.key});\n  @override\n  State<CounterCard> createState() => _CounterCardState();\n}',
    'widget ที่มี state เปลี่ยนได้ระหว่างใช้งาน','A widget that owns mutable UI state',
    'widget สำหรับ render รูปภาพเท่านั้น','A widget only for images','คำสั่ง async ของ Dart','A Dart async keyword','ตัวแปร global ของแอป','A global app variable',
    'มองหา createState() เพื่อแยก state class','Look for createState() creating a separate state class',
    'StatefulWidget ใช้เมื่อ UI ต้องเปลี่ยนตาม interaction หรือข้อมูลที่อัปเดตได้ภายในตัว widget','StatefulWidget is used when UI must change in response to interaction or mutable local data.'),
  v('build()','build()','@override\nWidget build(BuildContext context) {\n  return const Text("Ready");\n}',
    'เมทอดที่คืน widget tree เพื่อวาด UI','Method that returns the widget tree for rendering',
    'เมทอดสำหรับโหลด dependency','Method for loading dependencies','คำสั่งรัน animation ทุกเฟรม','Command that runs animation every frame','เมทอดบันทึกข้อมูลลง storage','Method that saves data to storage',
    'build() มักคืนค่า Widget เสมอ','build() always returns a Widget',
    'build() เป็นเมทอดหลักที่ Flutter เรียกเพื่อสร้างหน้าตา UI จาก state ปัจจุบัน','build() is the main method Flutter calls to produce UI from the current state.'),
  v('setState()','setState()','setState(() {\n  count += 1;\n});',
    'แจ้ง Flutter ให้ rebuild หลัง state เปลี่ยน','Notify Flutter to rebuild after state changes',
    'ส่ง request ไป API','Send an API request','เปิดหน้าใหม่ทันที','Open a new page instantly','แปลง widget เป็น const','Convert a widget to const',
    'setState() มักครอบโค้ดที่แก้ state','setState() usually wraps the state mutation',
    'setState() ใช้ใน State class เพื่อบอก framework ว่าค่าข้างในเปลี่ยนและ UI ต้อง rebuild','setState() tells the framework that state changed and the UI must rebuild.'),
  v('Scaffold','Scaffold','return Scaffold(\n  appBar: AppBar(title: const Text("Home")),\n  body: const Center(child: Text("Hello")),\n);',
    'โครงหน้าพื้นฐานของหนึ่ง screen','Basic page structure for one screen',
    'widget สำหรับจัดแถวแนวนอน','A widget for horizontal rows','ระบบเก็บ state ส่วนกลาง','A global state system','คำสั่ง import package','A package import command',
    'Scaffold มักมี appBar, body, floatingActionButton','Scaffold commonly contains appBar, body, and floatingActionButton',
    'Scaffold ให้โครงหลักของหน้า เช่น app bar, body, drawer และปุ่มลอย','Scaffold provides the main structure of a screen, such as app bar, body, drawer, and floating actions.'),
  v('Column','Column','Column(\n  children: [\n    Text("A"),\n    Text("B"),\n  ],\n)',
    'จัด widget ลูกเรียงจากบนลงล่าง','Lay out children vertically',
    'จัด widget ลูกซ้ายไปขวา','Lay out children horizontally','ซ้อน widget ทับกัน','Stack widgets on top of each other','ทำ list เลื่อนอัตโนมัติ','Create an automatically scrolling list',
    'Column จัดลูกตามแกนตั้ง','Column arranges children on the vertical axis',
    'Column ใช้จัด widget หลายตัวเรียงในแนวตั้งภายใน parent เดียวกัน','Column arranges multiple widgets vertically inside one parent.'),
  v('Expanded','Expanded','Row(\n  children: [\n    Expanded(child: Text("Wide")),\n  ],\n)',
    'บังคับลูกให้กินพื้นที่ว่างที่เหลือ','Make a child fill remaining available space',
    'ล็อกขนาดให้ตายตัว','Lock the size to a fixed value','ทำให้ widget ซ่อนตัว','Hide a widget','ทำให้ widget เป็นปุ่มกด','Turn a widget into a button',
    'Expanded ใช้ใน Row/Column/Flex','Expanded is used inside Row, Column, or Flex',
    'Expanded ทำให้ลูกใน flex layout ขยายตัวเพื่อแบ่งพื้นที่ว่างตามสัดส่วน','Expanded makes a child grow inside a flex layout to consume remaining space.'),
  v('FutureBuilder','FutureBuilder','FutureBuilder<User>(\n  future: loadUser(),\n  builder: (context, snapshot) {\n    return Text("${snapshot.data}");\n  },\n)',
    'สร้าง UI ตามสถานะของ Future','Build UI from the state of a Future',
    'widget สำหรับ animation แบบ implicit','A widget for implicit animation','ตัวช่วยจัด grid สองคอลัมน์','A helper for two-column grids','เมทอดแปลง JSON เป็น model','A method for parsing JSON into a model',
    'FutureBuilder มักมี future และ builder','FutureBuilder usually includes future and builder',
    'FutureBuilder ช่วย render loading, success, หรือ error state จาก asynchronous future โดยไม่ต้องจัด flow เองทั้งหมด','FutureBuilder renders loading, success, and error UI from an asynchronous future without wiring all state manually.'),
]

// ──────────────────────── JAVA ────────────────────────
const javaSpecs: VocabSpec[] = [
  v('public','public','public class Main { }',
    'กำหนดให้เข้าถึงได้จากทุกที่','Accessible from anywhere',
    'เข้าถึงได้เฉพาะใน class','Class-only access','ประกาศตัวแปร','Declare variable','สร้าง object','Create object',
    'public คือ access modifier ที่เปิดกว้างที่สุด','public is the most open access modifier',
    'public ทำให้ class/method/field เข้าถึงได้จากทุก class','public makes class/method/field accessible from any class.'),
  v('static','static','public static void main(String[] args) { }',
    'สมาชิกของ class ไม่ต้องสร้าง instance','Class member, no instance needed',
    'สมาชิกของ instance','Instance member','ค่าคงที่','Constant','ตัวแปร local','Local variable',
    'static เรียกผ่านชื่อ class ได้เลย','static can be called via class name',
    'static หมายถึงสมาชิกที่ผูกกับ class ไม่ใช่ instance','static means a member bound to the class, not an instance.'),
  v('final','final','final int MAX = 100;',
    'ค่าคงที่ เปลี่ยนไม่ได้','Constant, cannot be changed',
    'ตัวแปร local','Local variable','ตัวแปร global','Global variable','ประเภท generic','Generic type',
    'final ป้องกันการ reassign','final prevents reassignment',
    'final ทำให้ตัวแปรไม่สามารถ reassign ค่าใหม่ได้หลังจากกำหนดครั้งแรก','final prevents a variable from being reassigned after initialization.'),
  v('void','void','public void greet() { System.out.println("Hi"); }',
    'ฟังก์ชันไม่คืนค่า','Function returns nothing',
    'คืนค่า int','Returns int','คืน null','Returns null','คืน boolean','Returns boolean',
    'void หมายถึง "ไม่มีค่ากลับ"','void means "no return value"',
    'void ระบุว่า method ไม่คืนค่าใดๆ กลับ','void specifies that a method does not return any value.'),
  v('extends','extends','class Dog extends Animal { }',
    'สืบทอด class','Inherit from a class',
    'สร้าง interface','Create interface','สร้าง instance','Create instance','ลบ class','Delete class',
    'extends ใช้ทำ inheritance','extends is used for inheritance',
    'extends ทำให้ subclass สืบทอดพฤติกรรมจาก superclass','extends lets a subclass inherit behavior from a superclass.'),
  v('implements','implements','class Cat implements Speakable { }',
    'ทำตาม interface','Implement an interface',
    'สืบทอด class','Extend a class','สร้าง object','Create object','ลบ interface','Delete interface',
    'implements บังคับให้ทำตามสัญญาของ interface','implements forces compliance with an interface contract',
    'implements หมายถึง class ต้องจัดเตรียม method ทุกตัวที่ interface กำหนด','implements means the class must provide every method defined by the interface.'),
  v('new','new','Dog dog = new Dog("Rex");',
    'สร้าง instance ใหม่จาก class','Create a new instance from a class',
    'ลบ object','Delete object','ประกาศตัวแปร','Declare variable','นำเข้า class','Import class',
    'new เรียก constructor','new calls the constructor',
    'new จัดสรร memory และเรียก constructor ของ class เพื่อสร้าง object ใหม่','new allocates memory and calls the class constructor to create a new object.'),
  v('this','this','this.name = name;',
    'อ้างถึง instance ปัจจุบัน','Refer to the current instance',
    'อ้างถึง class','Refer to class','อ้างถึง superclass','Refer to superclass','อ้างถึง method','Refer to method',
    'this ชี้ไปที่ object ตัวเอง','this points to the object itself',
    'this อ้างถึง instance ของ class ที่กำลังรัน method อยู่','this refers to the instance of the class currently running the method.'),
  v('try / catch','try / catch','try { int x = 1/0; } catch (Exception e) { }',
    'จัดการ exception','Handle exceptions',
    'วนลูป','Loop','ประกาศ class','Declare class','สร้าง array','Create array',
    'try ดัก error ที่อาจเกิด','try catches potential errors',
    'try/catch ดัก exception เพื่อจัดการ error แทนปล่อยให้โปรแกรมพัง','try/catch catches exceptions to handle errors instead of letting the program crash.'),
  v('interface','interface','interface Drawable { void draw(); }',
    'กำหนดสัญญาที่ class ต้องทำตาม','Define a contract classes must follow',
    'สร้าง class','Create a class','สร้าง object','Create object','ประกาศตัวแปร','Declare variable',
    'interface มีแต่ method signature ไม่มี body','interface has only method signatures, no body',
    'interface กำหนด method ที่ class ต้อง implement โดยไม่มีรายละเอียดการทำงาน','interface defines methods a class must implement without providing implementation details.'),
  v('ArrayList','ArrayList','ArrayList<String> list = new ArrayList<>();',
    'list ที่ขยายขนาดได้อัตโนมัติ','Auto-resizable list',
    'array ขนาดคงที่','Fixed-size array','linked list','Linked list','stack','Stack',
    'ArrayList เพิ่ม/ลบสมาชิกได้ไม่จำกัด','ArrayList can add/remove elements freely',
    'ArrayList เป็น dynamic array ที่ขยายขนาดเองเมื่อเพิ่มสมาชิก','ArrayList is a dynamic array that auto-resizes when elements are added.'),
  v('@Override','@Override','@Override\npublic String toString() { return "Hi"; }',
    'ระบุว่า method override จาก superclass','Mark method as overriding superclass',
    'สร้าง method ใหม่','Create new method','ลบ method','Delete method','ซ่อน method','Hide method',
    '@Override ช่วยให้ compiler ตรวจว่า override จริง','@Override lets compiler verify the override',
    '@Override บอก compiler ว่า method นี้ตั้งใจ override จาก parent class','@Override tells the compiler this method intentionally overrides a parent class method.'),
  v('System.out.println','System.out.println','System.out.println("Hello");',
    'พิมพ์ข้อความออกหน้าจอ','Print text to console',
    'รับ input','Read input','บันทึกไฟล์','Save file','ส่ง network request','Send network request',
    'println พิมพ์แล้วขึ้นบรรทัดใหม่','println prints and adds a newline',
    'System.out.println พิมพ์ข้อความไปยัง standard output แล้วขึ้นบรรทัดใหม่','System.out.println prints text to standard output followed by a newline.'),
  v('String','String','String name = "Ada";',
    'ชนิดข้อมูลข้อความ','Text data type',
    'ชนิดตัวเลข','Number type','ชนิด boolean','Boolean type','ชนิด array','Array type',
    'String เก็บข้อความ','String stores text',
    'String เป็น immutable object ที่เก็บลำดับ character','String is an immutable object that stores a sequence of characters.'),
  v('for-each','for-each','for (String s : list) { System.out.println(s); }',
    'วนลูปทุกสมาชิกใน collection','Iterate every element in a collection',
    'วนลูปตาม index','Index-based loop','สร้าง collection','Create collection','ลบสมาชิก','Remove elements',
    'for-each ใช้ : แทน index','for-each uses : instead of index',
    'enhanced for (for-each) วนทุกสมาชิกใน array/collection โดยไม่ต้องจัดการ index เอง','Enhanced for (for-each) iterates every element without manual index management.'),
]

// Remaining banks - using the same pattern but compact
const csharpSpecs: VocabSpec[] = [
  v('var','var','var x = 10;','ให้ compiler อนุมาน type','Let compiler infer the type','ประกาศค่าคงที่','Declare constant','ประกาศ global','Declare global','ลบตัวแปร','Delete variable','var ให้ compiler เดา type จากค่าที่กำหนด','var lets compiler guess type from the assigned value','var ให้ compiler อนุมาน type จากค่าที่กำหนดโดยอัตโนมัติ','var lets the compiler automatically infer the type from the assigned value.'),
  v('namespace','namespace','namespace MyApp { class Foo {} }','จัดกลุ่มโค้ดเป็น scope','Group code into a scope','สร้าง class','Create class','นำเข้า library','Import library','ลบไฟล์','Delete file','namespace จัดระเบียบ code','namespace organizes code','namespace จัดกลุ่ม class และ type ให้อยู่ใน scope เดียวกัน','namespace groups classes and types into the same scope.'),
  v('async / await','async / await','async Task<int> GetAsync() { return await FetchData(); }','เขียนโค้ด asynchronous','Write asynchronous code','สร้าง thread','Create thread','จัดการ error','Handle error','ประกาศ event','Declare event','await หยุดรอ Task','await pauses for a Task','async/await ใน C# ใช้กับ Task เพื่อเขียน async แบบอ่านง่าย','async/await in C# uses Task for readable asynchronous code.'),
  v('LINQ','LINQ','var result = list.Where(x => x > 2).ToList();','query ข้อมูลใน collection','Query data in collections','สร้าง database','Create database','เชื่อม network','Network connection','จัดการไฟล์','File management','LINQ ใช้ query syntax กับ collection','LINQ uses query syntax with collections','LINQ ให้เขียน query ข้อมูลใน collection ด้วย syntax ที่คล้าย SQL','LINQ lets you query collection data with SQL-like syntax.'),
  v('delegate','delegate','delegate void MyAction(int x);','ตัวแทนของ method','A reference to a method','ตัวแปร','Variable','class','Class','interface','Interface','delegate เก็บ reference ไปยัง method','delegate stores a reference to a method','delegate เป็น type-safe function pointer ที่เก็บ reference ไปยัง method','delegate is a type-safe function pointer that stores a reference to a method.'),
  v('event','event','public event EventHandler OnClick;','ส่งสัญญาณเมื่อเกิดเหตุการณ์','Signal when something happens','สร้าง thread','Create thread','ลบ object','Delete object','ประกาศ class','Declare class','event ใช้ pub/sub pattern','event uses pub/sub pattern','event ใช้ pattern publish/subscribe เพื่อแจ้งเตือนเมื่อมีเหตุการณ์เกิดขึ้น','event uses publish/subscribe pattern to notify when something happens.'),
  v('using','using','using System;','นำเข้า namespace','Import a namespace','ส่งออก','Export','ลบ','Delete','ประกาศ','Declare','using ดึง namespace เข้ามาใช้','using brings a namespace into scope','using ดึง namespace เข้ามาใช้งานในไฟล์ปัจจุบัน','using brings a namespace into scope for the current file.'),
  v('interface','interface','interface IAnimal { void Speak(); }','กำหนดสัญญาที่ class ต้องทำตาม','Define a contract for classes','สร้าง class','Create class','สร้าง object','Create object','ลบ method','Delete method','interface มีแค่ signature','interface has only signatures','interface กำหนด method ที่ class ต้อง implement','interface defines methods a class must implement.'),
  v('override','override','public override string ToString() { }','เขียนทับ method ของ parent','Override parent method','สร้าง method ใหม่','Create new method','ลบ method','Delete method','ซ่อน method','Hide method','override ต้องมี virtual ที่ parent','override requires virtual in parent','override เขียนทับ virtual method จาก base class','override replaces a virtual method from the base class.'),
  v('readonly','readonly','public readonly int Max = 100;','กำหนดค่าได้แค่ตอนประกาศหรือ constructor','Assignable only at declaration or constructor','เปลี่ยนได้ตลอด','Changeable anytime','ลบได้','Can be deleted','เฉพาะ static','Static only','readonly ต่างจาก const ตรงที่กำหนดใน constructor ได้','readonly differs from const: assignable in constructor','readonly ทำให้ field กำหนดค่าได้แค่ตอนประกาศหรือใน constructor','readonly makes a field assignable only at declaration or in the constructor.'),
  v('null','null','string? name = null;','ค่าว่างเปล่า (ไม่มี reference)','Empty value (no reference)','ค่า 0','Value 0','ค่า false','Value false','สตริงว่าง','Empty string','null หมายถึงไม่ชี้ไปที่ object ใด','null means pointing to no object','null หมายถึงตัวแปรไม่ได้ชี้ไปที่ object ใดเลย','null means the variable does not point to any object.'),
  v('List<T>','List<T>','List<int> nums = new List<int>();','list แบบ generic ที่ขยายขนาดได้','Generic resizable list','array คงที่','Fixed array','dictionary','Dictionary','queue','Queue','List<T> เป็น dynamic array','List<T> is a dynamic array','List<T> เป็น generic collection ที่ขยายขนาดอัตโนมัติ','List<T> is a generic collection that auto-resizes.'),
  v('properties','properties','public string Name { get; set; }','getter/setter แบบย่อ','Shorthand getter/setter','field ธรรมดา','Plain field','method','Method','constructor','Constructor','property ใช้ get/set','property uses get/set','property จัดการ access ไปยัง field ด้วย get/set accessor','property manages field access via get/set accessors.'),
  v('abstract','abstract','abstract class Shape { abstract double Area(); }','class/method ที่ต้อง implement ใน subclass','Must be implemented in subclass','class สมบูรณ์','Complete class','interface','Interface','static class','Static class','abstract บังคับ subclass ต้อง override','abstract forces subclass to override','abstract class ไม่สามารถสร้าง instance ตรงๆ ต้องใช้ subclass','abstract class cannot be instantiated directly; a subclass is required.'),
  v('try / catch / finally','try / catch / finally','try { } catch (Exception e) { } finally { }','จัดการ exception','Handle exceptions','วนลูป','Loop','ประกาศ class','Declare class','สร้าง array','Create array','finally รันเสมอไม่ว่าจะ error หรือไม่','finally always runs regardless of error','try/catch/finally จัดการ exception โดย finally รันเสมอ','try/catch/finally handles exceptions; finally always runs.'),
]

const cppSpecs = buildSimpleSpecs([
  simpleEntry('#include', '#include', '#include <vector>\n#include <iostream>', 'นำเข้า header ที่ต้องใช้', 'Import a required header'),
  simpleEntry('std::vector', 'std::vector', 'std::vector<int> scores = {1, 2, 3};', 'array แบบขยายขนาดได้', 'A dynamically sized array'),
  simpleEntry('nullptr', 'nullptr', 'Node* current = nullptr;', 'pointer ว่างที่ยังไม่ชี้ไป object ไหน', 'A pointer that does not point to an object'),
  simpleEntry('template<typename T>', 'template<typename T>', 'template<typename T>\nT maxOf(T a, T b) { return a > b ? a : b; }', 'ประกาศโค้ด generic ใช้ได้หลาย type', 'Declare generic code that works with multiple types'),
])

const dartSpecs = buildSimpleSpecs([
  simpleEntry('final', 'final', 'final total = 42;', 'ค่าที่กำหนดได้ครั้งเดียวหลัง runtime เริ่ม', 'A value assigned once after runtime starts'),
  simpleEntry('Future', 'Future', 'Future<String> loadUser() async => "Ada";', 'ค่าที่จะมาในภายหลังจากงาน async', 'A value that arrives later from async work'),
  simpleEntry('required', 'required', 'void greet({required String name}) { print(name); }', 'บังคับให้ named parameter ต้องถูกส่งมา', 'Make a named parameter mandatory'),
  simpleEntry('extension', 'extension', 'extension NumberTools on int {\n  int doubled() => this * 2;\n}', 'เพิ่ม method ให้ type เดิมโดยไม่แก้ class ต้นฉบับ', 'Add methods to an existing type without editing its original class'),
])

const jsxCoreSpecs = buildSimpleSpecs([
  simpleEntry('props', 'props', 'function Card(props) {\n  return <h2>{props.title}</h2>\n}', 'ข้อมูลที่ parent ส่งเข้า component', 'Data passed from a parent into a component'),
  simpleEntry('useState', 'useState', 'const [count, setCount] = useState(0)', 'hook สำหรับเก็บ state ใน component', 'A hook for local component state'),
  simpleEntry('useEffect', 'useEffect', 'useEffect(() => {\n  fetchData()\n}, [])', 'hook สำหรับทำ side effect หลัง render', 'A hook for side effects after render'),
  simpleEntry('className', 'className', '<section className="hero">Hello</section>', 'attribute สำหรับใส่ class ใน JSX', 'The attribute used for CSS classes in JSX'),
])

const typescriptCoreSpecs = buildSimpleSpecs([
  simpleEntry('interface', 'interface', 'interface User {\n  id: number\n  name: string\n}', 'กำหนดรูปร่างของ object', 'Define the shape of an object'),
  simpleEntry('type', 'type', 'type Status = "idle" | "done"', 'ตั้งชื่อ alias ให้ type หรือ union', 'Create an alias for a type or union'),
  simpleEntry('generic <T>', 'generic <T>', 'function wrap<T>(value: T): T[] {\n  return [value]\n}', 'ทำให้ function ใช้ได้หลาย type แบบปลอดภัย', 'Make a function work with many types safely'),
  simpleEntry('union type', 'union type', 'let result: string | number = "ok"', 'ตัวแปรที่ยอมรับได้มากกว่าหนึ่ง type', 'A value that can be one of multiple types'),
])

const bashSpecs = buildSimpleSpecs([
  simpleEntry('$VAR', '$VAR', 'echo "$USER_NAME"', 'การอ่านค่าจากตัวแปร shell', 'Read the value stored in a shell variable'),
  simpleEntry('pipe |', 'pipe |', 'cat app.log | grep ERROR', 'ส่ง output ของคำสั่งหนึ่งไปอีกคำสั่ง', 'Send one command output into the next command'),
  simpleEntry('if / fi', 'if / fi', 'if [ "$count" -gt 0 ]; then\n  echo "ok"\nfi', 'เปิดและปิดเงื่อนไขใน Bash', 'Open and close a Bash conditional block'),
  simpleEntry('chmod +x', 'chmod +x', 'chmod +x deploy.sh', 'ให้ไฟล์สามารถรันเป็น executable ได้', 'Make a file executable'),
])

const cloudFunctionsSpecs = buildSimpleSpecs([
  simpleEntry('exports', 'exports', 'exports.hello = (req, res) => {\n  res.send("hi")\n}', 'ส่งออก handler สำหรับ deploy', 'Expose a handler for deployment'),
  simpleEntry('req / res', 'req / res', 'exports.ping = (req, res) => {\n  res.json({ ok: true })\n}', 'object request/response ของ HTTP trigger', 'The request and response objects of an HTTP trigger'),
  simpleEntry('process.env', 'process.env', 'const apiKey = process.env.API_KEY', 'อ่านค่าคอนฟิกจาก environment variable', 'Read configuration from an environment variable'),
  simpleEntry('onRequest', 'onRequest', 'exports.api = onRequest((req, res) => {\n  res.send("ok")\n})', 'ประกาศ Cloud Function แบบ HTTP endpoint', 'Declare a Cloud Function as an HTTP endpoint'),
])

const sqlCoreSpecs = buildSimpleSpecs([
  simpleEntry('SELECT', 'SELECT', 'SELECT id, name\nFROM users;', 'เลือกคอลัมน์ที่ต้องการจากตาราง', 'Choose which columns to return from a table'),
  simpleEntry('WHERE', 'WHERE', 'SELECT *\nFROM orders\nWHERE status = "paid";', 'กรองแถวตามเงื่อนไข', 'Filter rows by a condition'),
  simpleEntry('JOIN', 'JOIN', 'SELECT users.name, orders.total\nFROM users\nJOIN orders ON users.id = orders.user_id;', 'เชื่อมข้อมูลจากหลายตาราง', 'Combine rows from multiple tables'),
  simpleEntry('GROUP BY', 'GROUP BY', 'SELECT category, COUNT(*)\nFROM products\nGROUP BY category;', 'จัดกลุ่มแถวก่อนใช้ aggregate', 'Group rows before applying aggregates'),
])

const phpCoreSpecs = buildSimpleSpecs([
  simpleEntry('$variable', '$variable', '$name = "Ada";\necho $name;', 'ตัวแปรใน PHP ที่ต้องมีเครื่องหมาย $', 'A PHP variable that must start with $'),
  simpleEntry('echo', 'echo', 'echo "Hello world";', 'พิมพ์ข้อความออกไปยัง output', 'Print text to the output'),
  simpleEntry('->', '->', '$user->save();', 'เข้าถึง method หรือ property ของ object', 'Access an object method or property'),
  simpleEntry('array()', 'array()', '$items = array("a", "b");', 'สร้าง array ใน PHP', 'Create an array in PHP'),
])

const rustCoreSpecs = buildSimpleSpecs([
  simpleEntry('ownership', 'ownership', 'let name = String::from("Ada");\nlet saved = name;', 'ระบบที่บอกว่าใครเป็นเจ้าของข้อมูลในหน่วยความจำ', 'The system that tracks who owns a value in memory'),
  simpleEntry('match', 'match', 'match status {\n  Ok(value) => println!("{value}"),\n  Err(_) => println!("error"),\n}', 'pattern matching ที่ครอบคลุมทุกกรณี', 'Pattern matching that covers every case'),
  simpleEntry('Result<T, E>', 'Result<T, E>', 'fn load() -> Result<String, io::Error> {\n  read_to_string("user.txt")\n}', 'ชนิดข้อมูลสำหรับคืนค่าที่อาจ success หรือ error', 'A type for values that may be success or error'),
  simpleEntry('borrow &', 'borrow &', 'fn print_name(name: &String) {\n  println!("{name}")\n}', 'ยืมค่าไปใช้โดยไม่ย้าย ownership', 'Use a value without moving its ownership'),
])

const goCoreSpecs = buildSimpleSpecs([
  simpleEntry('goroutine', 'goroutine', 'go sendEmail(userID)', 'รันฟังก์ชันแบบ concurrent ด้วย keyword go', 'Run a function concurrently with the go keyword'),
  simpleEntry('channel', 'channel', 'jobs <- "build"', 'ส่งข้อมูลระหว่าง goroutine อย่างปลอดภัย', 'Pass data safely between goroutines'),
  simpleEntry('defer', 'defer', 'defer file.Close()', 'เลื่อนการเรียกฟังก์ชันไปตอนจบฟังก์ชันปัจจุบัน', 'Delay a call until the surrounding function returns'),
  simpleEntry('struct', 'struct', 'type User struct {\n  Name string\n}', 'กำหนดโครงสร้างข้อมูลหลักของ Go', 'Define a data structure in Go'),
])

const kotlinCoreSpecs = buildSimpleSpecs([
  simpleEntry('data class', 'data class', 'data class User(val id: Int, val name: String)', 'class สำหรับข้อมูลที่มี equals/toString อัตโนมัติ', 'A class for data that auto-generates equals and toString'),
  simpleEntry('val', 'val', 'val total = 10', 'ค่าที่เปลี่ยนไม่ได้หลัง assign ครั้งแรก', 'A value that cannot be reassigned'),
  simpleEntry('when', 'when', 'val label = when (state) {\n  "idle" -> "Ready"\n  else -> "Busy"\n}', 'switch แบบคืนค่าได้และไม่ต้อง break', 'A switch-like expression that returns values without break'),
  simpleEntry('suspend', 'suspend', 'suspend fun loadProfile() = api.getProfile()', 'ฟังก์ชันที่ใช้กับ coroutine และงาน async', 'A function used with coroutines and async work'),
])

const swiftCoreSpecs = buildSimpleSpecs([
  simpleEntry('guard let', 'guard let', 'guard let user = currentUser else {\n  return\n}', 'เช็กค่าแล้ว early return ถ้ายังไม่มีข้อมูล', 'Check a value and exit early if it is missing'),
  simpleEntry('Optional ?', 'Optional ?', 'var name: String? = nil', 'type ที่บอกว่าค่าอาจเป็น nil ได้', 'A type that may contain nil'),
  simpleEntry('struct', 'struct', 'struct Card {\n  let title: String\n}', 'value type สำหรับเก็บข้อมูล', 'A value type used to model data'),
  simpleEntry('protocol', 'protocol', 'protocol Renderable {\n  func render()\n}', 'สัญญาที่ type อื่นต้องทำตาม', 'A contract that other types must follow'),
])

const rubyCoreSpecs = buildSimpleSpecs([
  simpleEntry('symbol', 'symbol', 'status = :active', 'identifier แบบ immutable ที่เบากว่า string', 'An immutable identifier lighter than a string'),
  simpleEntry('block', 'block', 'items.each do |item|\n  puts item\nend', 'ก้อนโค้ดที่ส่งเข้า method ได้', 'A chunk of code passed into a method'),
  simpleEntry('end', 'end', 'def greet(name)\n  puts name\nend', 'คำที่ใช้ปิด block ใน Ruby', 'The keyword used to close a Ruby block'),
  simpleEntry('gem', 'gem', 'gem "rails"', 'แพ็กเกจหรือไลบรารีที่ติดตั้งผ่าน RubyGems', 'A package installed through RubyGems'),
])

const robloxLuaSpecs = buildSimpleSpecs([
  simpleEntry('Instance.new', 'Instance.new', 'local part = Instance.new("Part")', 'สร้าง object ใหม่ใน Roblox', 'Create a new Roblox object'),
  simpleEntry('game.Players', 'game.Players', 'local players = game.Players:GetPlayers()', 'เข้าถึง service ที่เก็บข้อมูลผู้เล่น', 'Access the service that stores players'),
  simpleEntry(': method call', ': method call', 'tool:Activate()', 'การเรียก method พร้อมส่ง self อัตโนมัติ', 'Call a method while passing self automatically'),
  simpleEntry('WaitForChild', 'WaitForChild', 'local button = gui:WaitForChild("PlayButton")', 'รอ object ที่อาจยังโหลดมาไม่ครบ', 'Wait for an object that may not be loaded yet'),
])

const love2dSpecs = buildSimpleSpecs([
  simpleEntry('love.load', 'love.load', 'function love.load()\n  player = {}\nend', 'callback ที่เรียกตอนเริ่มเกม', 'The callback that runs when the game starts'),
  simpleEntry('love.update', 'love.update', 'function love.update(dt)\n  player.x = player.x + 120 * dt\nend', 'callback ที่รันทุกเฟรมเพื่ออัปเดต state', 'The callback that updates state every frame'),
  simpleEntry('love.draw', 'love.draw', 'function love.draw()\n  love.graphics.print("Hello", 20, 20)\nend', 'callback สำหรับวาดทุกอย่างลงจอ', 'The callback that draws to the screen'),
  simpleEntry('dt', 'dt', 'player.x = player.x + speed * dt', 'เวลาที่ผ่านไประหว่างเฟรมสำหรับคำนวณ movement', 'Elapsed frame time used for frame-independent movement'),
])

const gdscriptSpecs = buildSimpleSpecs([
  simpleEntry('extends', 'extends', 'extends CharacterBody2D', 'ระบุ base class ที่ script นี้สืบทอด', 'Specify the base class a script inherits from'),
  simpleEntry('_ready()', '_ready()', 'func _ready():\n  print("ready")', 'callback ที่เรียกเมื่อ node พร้อมใช้งาน', 'The callback that runs when a node is ready'),
  simpleEntry('signal', 'signal', 'signal health_changed(value)', 'ประกาศ event ที่ node อื่นสามารถเชื่อมต่อได้', 'Declare an event other nodes can connect to'),
  simpleEntry('$NodeName', '$NodeName', 'var sprite = $Sprite2D', 'shorthand สำหรับเข้าถึง child node', 'A shorthand for accessing a child node'),
])

const godotShaderSpecs = buildSimpleSpecs([
  simpleEntry('shader_type', 'shader_type', 'shader_type canvas_item;', 'บอกว่า shader นี้ใช้กับ pipeline แบบไหน', 'Declare which rendering pipeline the shader targets'),
  simpleEntry('uniform', 'uniform', 'uniform vec4 tint_color;', 'ค่าที่ส่งเข้ามาจาก editor หรือ script', 'A value sent in from the editor or a script'),
  simpleEntry('COLOR', 'COLOR', 'COLOR = texture(TEXTURE, UV);', 'ตัวแปร output สีของ fragment', 'The fragment color output variable'),
  simpleEntry('vec4', 'vec4', 'vec4 final_color = vec4(1.0, 0.2, 0.5, 1.0);', 'vector 4 มิติสำหรับเก็บ RGBA หรือค่าชุดใหญ่', 'A 4D vector used for RGBA or grouped values'),
])

const unityCsharpSpecs = buildSimpleSpecs([
  simpleEntry('MonoBehaviour', 'MonoBehaviour', 'public class PlayerController : MonoBehaviour { }', 'base class หลักของ script ใน Unity', 'The main base class for Unity scripts'),
  simpleEntry('Start()', 'Start()', 'void Start() {\n  Debug.Log("ready");\n}', 'lifecycle method ที่เรียกตอนเริ่มต้น object', 'A lifecycle method that runs when the object starts'),
  simpleEntry('GetComponent<T>()', 'GetComponent<T>()', 'var rb = GetComponent<Rigidbody>();', 'ค้นหา component บน GameObject เดียวกัน', 'Find a component on the same GameObject'),
  simpleEntry('[SerializeField]', '[SerializeField]', '[SerializeField] private float speed;', 'เปิดให้ private field ตั้งค่าใน Inspector ได้', 'Expose a private field in the Inspector'),
])

const shaderlabSpecs = buildSimpleSpecs([
  simpleEntry('Properties', 'Properties', 'Properties {\n  _MainTex ("Texture", 2D) = "white" {}\n}', 'ประกาศค่าที่ปรับได้จาก Inspector', 'Declare values that can be edited from the Inspector'),
  simpleEntry('SubShader', 'SubShader', 'SubShader {\n  Pass { }\n}', 'กลุ่ม pass ที่ใช้ render ใน pipeline หนึ่ง', 'A group of rendering passes for one pipeline'),
  simpleEntry('Pass', 'Pass', 'Pass {\n  CGPROGRAM\n  ENDCG\n}', 'ขั้นตอน render ย่อยภายใน shader', 'A rendering step inside the shader'),
  simpleEntry('CGPROGRAM', 'CGPROGRAM', 'CGPROGRAM\n#pragma vertex vert\n#pragma fragment frag\nENDCG', 'ส่วนที่ครอบโค้ด shader จริง', 'The block that wraps the actual shader code'),
])

const unrealCppSpecs = buildSimpleSpecs([
  simpleEntry('UPROPERTY', 'UPROPERTY', 'UPROPERTY(EditAnywhere)\nfloat Speed;', 'macro ที่ทำให้ property มองเห็นได้ใน editor/Blueprint', 'A macro that exposes a property to the editor or Blueprint'),
  simpleEntry('UFUNCTION', 'UFUNCTION', 'UFUNCTION(BlueprintCallable)\nvoid Fire();', 'macro ที่ทำให้ฟังก์ชันเรียกจาก Blueprint ได้', 'A macro that makes a function callable from Blueprint'),
  simpleEntry('AActor', 'AActor', 'class AEnemy : public AActor { };', 'base class ของ object ที่วางใน level ได้', 'The base class for objects placed in a level'),
  simpleEntry('Cast<T>()', 'Cast<T>()', 'APlayerPawn* Pawn = Cast<APlayerPawn>(OtherActor);', 'แปลง type แบบปลอดภัยใน Unreal', 'Safely cast a type in Unreal'),
])

const glslSpecs = buildSimpleSpecs([
  simpleEntry('uniform', 'uniform', 'uniform vec2 u_resolution;', 'ค่าที่ส่งจาก CPU เข้ามาใน shader', 'A value sent from the CPU into the shader'),
  simpleEntry('varying', 'varying', 'varying vec2 v_uv;', 'ค่าที่ส่งจาก vertex ไป fragment shader', 'A value passed from the vertex to the fragment shader'),
  simpleEntry('gl_FragColor', 'gl_FragColor', 'gl_FragColor = vec4(color, 1.0);', 'ตัวแปร output สีของ fragment shader', 'The color output variable of a fragment shader'),
  simpleEntry('vec3', 'vec3', 'vec3 color = vec3(0.1, 0.4, 0.9);', 'vector 3 มิติที่มักใช้เก็บสีหรือทิศทาง', 'A 3D vector often used for color or direction'),
])

const phaserSpecs = buildSimpleSpecs([
  simpleEntry('preload', 'preload', 'preload() {\n  this.load.image("hero", "hero.png")\n}', 'โหลด asset ก่อน scene เริ่ม', 'Load assets before the scene starts'),
  simpleEntry('create', 'create', 'create() {\n  this.add.image(100, 100, "hero")\n}', 'สร้าง object ตอน scene พร้อมใช้งาน', 'Create objects when the scene is ready'),
  simpleEntry('this.physics', 'this.physics', 'this.physics.add.sprite(120, 80, "hero")', 'เข้าถึงระบบ physics ของ Phaser', 'Access the Phaser physics system'),
  simpleEntry('Scene', 'Scene', 'export class PlayScene extends Phaser.Scene { }', 'คลาสที่แทนหน้าหรือ state หนึ่งของเกม', 'A class that represents one game screen or state'),
])

const rpgMakerSpecs = buildSimpleSpecs([
  simpleEntry('$gameVariables', '$gameVariables', '$gameVariables.setValue(1, 99)', 'เก็บและอ่านค่าตัวแปรของเกม', 'Store and read game variable values'),
  simpleEntry('Scene_Base', 'Scene_Base', 'function Scene_Menu() {\n  this.initialize(...arguments)\n}\nScene_Menu.prototype = Object.create(Scene_Base.prototype)', 'base class ของ scene ต่าง ๆ', 'The base class for scenes'),
  simpleEntry('Window_Base', 'Window_Base', 'Window_Status.prototype = Object.create(Window_Base.prototype)', 'base class ของหน้าต่าง UI', 'The base class for UI windows'),
  simpleEntry('PluginManager.registerCommand', 'PluginManager.registerCommand', 'PluginManager.registerCommand("MyPlugin", "OpenShop", args => {\n  SceneManager.push(Scene_Shop)\n})', 'ลงทะเบียนคำสั่งให้ plugin เรียกใช้ได้', 'Register a command that a plugin can invoke'),
])

const gmlSpecs = buildSimpleSpecs([
  simpleEntry('var', 'var', 'var speed = 4;', 'ประกาศ local variable ใน GML', 'Declare a local variable in GML'),
  simpleEntry('instance_create_layer', 'instance_create_layer', 'instance_create_layer(x, y, "Instances", obj_bullet);', 'สร้าง object instance ใหม่ใน room', 'Create a new object instance in the room'),
  simpleEntry('draw_text', 'draw_text', 'draw_text(32, 32, "Score: " + string(score));', 'วาดข้อความลงหน้าจอ', 'Draw text on the screen'),
  simpleEntry('Create event', 'Create event', 'hp = 3;\nspeed = 2;', 'event ที่ใช้กำหนดค่าเริ่มต้นของ object', 'The event used to initialize an object'),
])

const defoldSpecs = buildSimpleSpecs([
  simpleEntry('msg.post', 'msg.post', 'msg.post("/enemy#script", "wake_up")', 'ส่ง message ไปยัง game object หรือ component อื่น', 'Send a message to another game object or component'),
  simpleEntry('go.get', 'go.get', 'local pos = go.get_position()', 'อ่าน property ของ game object', 'Read a game object property'),
  simpleEntry('on_message', 'on_message', 'function on_message(self, message_id, message, sender)\nend', 'callback ที่รับ message ที่ถูกส่งมา', 'The callback that receives incoming messages'),
  simpleEntry('hash', 'hash', 'local walk_id = hash("walk")', 'แปลง string เป็น hashed id สำหรับอ้างอิงเร็วขึ้น', 'Convert a string into a hashed id'),
])

const cocosSpecs = buildSimpleSpecs([
  simpleEntry('@ccclass', '@ccclass', '@ccclass("Player")\nexport class Player extends Component {}', 'decorator ที่ลงทะเบียน class กับ editor', 'The decorator that registers a class with the editor'),
  simpleEntry('@property', '@property', '@property(Node)\nplayerRoot: Node | null = null', 'decorator ที่เปิดให้ property ตั้งค่าจาก editor', 'The decorator that exposes a property in the editor'),
  simpleEntry('this.node', 'this.node', 'this.node.setPosition(200, 120)', 'node ปัจจุบันที่ script นี้ผูกอยู่ด้วย', 'The current node this script is attached to'),
  simpleEntry('schedule', 'schedule', 'this.schedule(() => {\n  this.spawnEnemy()\n}, 1)', 'เรียก callback ซ้ำตามเวลาใน Cocos', 'Call a callback repeatedly on a timer in Cocos'),
])

const bevySpecs = buildSimpleSpecs([
  simpleEntry('#[derive(Component)]', '#[derive(Component)]', '#[derive(Component)]\nstruct Velocity(Vec3);', 'ทำให้ struct กลายเป็น ECS component', 'Turn a struct into an ECS component'),
  simpleEntry('Query<T>', 'Query<T>', 'fn move_units(mut query: Query<&mut Transform>) {\n}', 'ดึง entity ที่มี component ตาม type ที่ต้องการ', 'Fetch entities that match component types'),
  simpleEntry('Commands', 'Commands', 'commands.spawn(PlayerBundle::default());', 'ใช้ spawn หรือ despawn entity ตอน runtime', 'Spawn or despawn entities at runtime'),
  simpleEntry('Res<T>', 'Res<T>', 'fn tick(time: Res<Time>) {\n  println!("{:?}", time.delta());\n}', 'อ่าน resource ที่แชร์ทั้งโลกเกม', 'Read a shared game-wide resource'),
])

const renpySpecs = buildSimpleSpecs([
  simpleEntry('label', 'label', 'label intro:\n    "Welcome!"', 'จุดเริ่มต้นของบล็อกบทสนทนา', 'The starting point of a dialogue block'),
  simpleEntry('jump', 'jump', 'jump town_square', 'กระโดดไปยัง label อื่นทันที', 'Jump immediately to another label'),
  simpleEntry('define', 'define', 'define e = Character("Eileen")', 'ประกาศตัวละครหรือค่าคงที่ระดับสคริปต์', 'Declare a character or script-level constant'),
  simpleEntry('$', '$', '$ affection += 1', 'รัน Python code ในบรรทัดของ Ren\'Py', 'Run Python code inside a Ren\'Py script line'),
])

// Build all banks
export const vocabQuestionBanks: Record<VocabSupportedLanguageId, Record<Difficulty, VocabQuestionBankItem[]>> = {
  python: buildLanguageBanks('python', pythonSpecs),
  java: buildLanguageBanks('java', javaSpecs),
  html: buildLanguageBanks('html', htmlSpecs),
  css: buildLanguageBanks('css', cssSpecs),
  json: buildLanguageBanks('json', jsonSpecs),
  csharp: buildLanguageBanks('csharp', csharpSpecs),
  cpp: buildLanguageBanks('cpp', cppSpecs),
  flutter: buildLanguageBanks('flutter', flutterSpecs),
  dart: buildLanguageBanks('dart', dartSpecs),
  jsx: buildLanguageBanks('jsx', jsxCoreSpecs),
  typescript: buildLanguageBanks('typescript', typescriptCoreSpecs),
  bash: buildLanguageBanks('bash', bashSpecs),
  'cloud-functions': buildLanguageBanks('cloud-functions', cloudFunctionsSpecs),
  sql: buildLanguageBanks('sql', sqlCoreSpecs),
  php: buildLanguageBanks('php', phpCoreSpecs),
  rust: buildLanguageBanks('rust', rustCoreSpecs),
  javascript: buildLanguageBanks('javascript', javascriptSpecs),
  go: buildLanguageBanks('go', goCoreSpecs),
  kotlin: buildLanguageBanks('kotlin', kotlinCoreSpecs),
  swift: buildLanguageBanks('swift', swiftCoreSpecs),
  ruby: buildLanguageBanks('ruby', rubyCoreSpecs),
  'roblox-lua': buildLanguageBanks('roblox-lua', robloxLuaSpecs),
  'love2d-lua': buildLanguageBanks('love2d-lua', love2dSpecs),
  'godot-gdscript': buildLanguageBanks('godot-gdscript', gdscriptSpecs),
  'godot-shader': buildLanguageBanks('godot-shader', godotShaderSpecs),
  'unity-csharp': buildLanguageBanks('unity-csharp', unityCsharpSpecs),
  'unity-shaderlab': buildLanguageBanks('unity-shaderlab', shaderlabSpecs),
  'unreal-cpp': buildLanguageBanks('unreal-cpp', unrealCppSpecs),
  glsl: buildLanguageBanks('glsl', glslSpecs),
  'phaser-typescript': buildLanguageBanks('phaser-typescript', phaserSpecs),
  'rpg-maker-js': buildLanguageBanks('rpg-maker-js', rpgMakerSpecs),
  'gamemaker-gml': buildLanguageBanks('gamemaker-gml', gmlSpecs),
  'defold-lua': buildLanguageBanks('defold-lua', defoldSpecs),
  'cocos-typescript': buildLanguageBanks('cocos-typescript', cocosSpecs),
  'bevy-rust': buildLanguageBanks('bevy-rust', bevySpecs),
  'renpy-python': buildLanguageBanks('renpy-python', renpySpecs),
}

const validateVocabBank = (language: VocabSupportedLanguageId, difficulty: Difficulty, bank: VocabQuestionBankItem[]) => {
  if (bank.length !== VOCAB_BANK_SIZE) {
    throw new Error(`Expected ${VOCAB_BANK_SIZE} ${difficulty} vocab questions for ${language} but received ${bank.length}.`)
  }

  if (difficulty === 'easy') {
    assertNoDuplicateSurface(
      bank,
      `${language}/${difficulty}/vocab freshness`,
      (item) => {
        const correctChoice = item.choices.find((choice) => choice.id === item.answer)?.label ?? item.choices[0]?.label
        return `${item.termText.th}|||${item.termText.en}|||${correctChoice.th}|||${correctChoice.en}|||${item.contextRole}`
      },
    )
  }

  for (const item of bank) {
    if (item.difficulty !== difficulty) {
      throw new Error(`Expected ${difficulty} metadata for ${item.id} but received ${item.difficulty}.`)
    }

    assertLocalizedTextPresent(item.termText, `${item.id} termText`)
    assertLocalizedTextPresent(item.hint, `${item.id} hint`)
    assertLocalizedTextPresent(item.explanation.correct, `${item.id} explanation.correct`)
    assertStringPresent(item.snippetText, `${item.id} snippetText`)

    if (item.choices.length !== 4) {
      throw new Error(`Expected 4 choices for ${item.id}.`)
    }

    const choiceIds = item.choices.map((choice) => choice.id)
    if (!choiceIds.includes(item.answer)) {
      throw new Error(`Answer ${item.answer} is missing from choices for ${item.id}.`)
    }

    assertUniqueStringValues(choiceIds, `${item.id} choice ids`)
    assertUniqueLocalizedValues(
      item.choices.map((choice) => choice.label),
      `${item.id} choice labels`,
    )

    for (const choice of item.choices) {
      assertLocalizedTextPresent(choice.label, `${item.id} -> ${choice.id} label`)
    }

    if (difficulty === 'easy') {
      const surface = normalizeSurface(item.snippetText)
      if (surface.includes('warmup')) {
        throw new Error(`Synthetic easy marker detected in ${item.id}.`)
      }
    }
  }
}

for (const language of vocabSupportedLanguageIds) {
  validateVocabBank(language, 'easy', vocabQuestionBanks[language].easy)
  validateVocabBank(language, 'hard', vocabQuestionBanks[language].hard)
}
