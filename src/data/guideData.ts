import type { CoreLanguageId, GameLanguageId, GuideFamilyId, LanguageId, LocalizedText, QuizTrackId } from './quizModels'
import { coreLanguageGuideExtensions, gameLanguageGuideExtensions } from './guideExtensions'

export type GuidePrimerSection = {
  id: string
  marker: string
  title: LocalizedText
  description: LocalizedText
}

export type LanguageGuide = {
  track: QuizTrackId
  label: LocalizedText
  family: GuideFamilyId
  difficultyHint: LocalizedText
  plainSummary: LocalizedText
  metaphor: LocalizedText
  quickSpot: LocalizedText
  spottingRules: LocalizedText[]
  falseFriends: LanguageId[]
  beginnerChecklist: LocalizedText[]
  miniSnippetNotes: LocalizedText[]
  signature: string[]
  debugFocus: {
    th: string[]
    en: string[]
  }
}

export type TrackSetting = {
  label: LocalizedText
  description: LocalizedText
  badge: LocalizedText
  defaultGuideId: LanguageId
}

const t = (th: string, en: string): LocalizedText => ({ th, en })

const list = (items: Array<[string, string]>) => items.map(([th, en]) => t(th, en))

export const guidePrimerSections: GuidePrimerSection[] = [
  {
    id: 'braces',
    marker: '{ ... }',
    title: t('ปีกกามักหมายถึง block', 'Braces usually mean a block'),
    description: t(
      'ถ้าเห็น { } ครอบหลายบรรทัด แปลว่าโค้ดในนั้นทำงานเป็นก้อนเดียวกัน มักเจอใน Java, C#, C++, TypeScript และภาษาเกมหลายตัว',
      'If you see { } wrapping several lines, the code inside belongs to one block. You often see this in Java, C#, C++, TypeScript, and many game stacks.',
    ),
  },
  {
    id: 'indentation',
    marker: 'indent',
    title: t('การย่อหน้าก็เป็น block ได้', 'Indentation can define a block'),
    description: t(
      'บางภาษาไม่ใช้ปีกกา แต่ใช้การย่อหน้าแทน ถ้าบรรทัดขยับเข้าไปคืออยู่ในชุดคำสั่งเดียวกัน เช่น Python',
      'Some languages avoid braces and use indentation instead. If a line is pushed inward, it belongs to the same block, as in Python.',
    ),
  },
  {
    id: 'tags',
    marker: '<tag>',
    title: t('แท็กเปิดปิดมักเป็น markup', 'Opening and closing tags usually mean markup'),
    description: t(
      'ถ้าเห็น <tag> ... </tag> โค้ดมักกำลังบอกโครงหน้าเอกสารหรือ UI มากกว่าจะเป็นคำสั่งคำนวณ',
      'If you see <tag> ... </tag>, the code is usually describing document or UI structure rather than calculations.',
    ),
  },
  {
    id: 'key-value',
    marker: 'key: value',
    title: t('รูปแบบ key: value มักเป็นข้อมูล', 'Key: value often means data'),
    description: t(
      'ถ้าโค้ดดูเหมือนรายการชื่อและค่า เช่น title: หรือ "name": มักเป็น config หรือ data มากกว่าภาษาที่ใช้ควบคุม flow',
      'If the code looks like a list of names and values such as title: or "name":, it is often config or data rather than control-flow code.',
    ),
  },
  {
    id: 'signature-words',
    marker: 'SELECT / def / fn / $var',
    title: t('จำคำเด่นให้ไว', 'Memorize standout keywords'),
    description: t(
      'คำอย่าง SELECT, def, fn, className, $variable, #include ช่วยเดาได้เร็วมากว่าคุณอยู่ในโลกไหนของโค้ด',
      'Words like SELECT, def, fn, className, $variable, and #include quickly tell you which world of code you are in.',
    ),
  },
  {
    id: 'engine-smell',
    marker: 'game. / this. / love. / Shader',
    title: t('ดูว่ามันอยู่ในโลกของใคร', 'Look at which engine world it belongs to'),
    description: t(
      'ภาษาเกมหลายตัวแยกกันด้วยคำเฉพาะของ engine มากกว่ารูปไวยากรณ์ เช่น game.Players, love.graphics, MonoBehaviour หรือ shader_type',
      'Many game stacks differ more by engine-specific vocabulary than by raw syntax, such as game.Players, love.graphics, MonoBehaviour, or shader_type.',
    ),
  },
]

export const fixErrorPrimerSections: GuidePrimerSection[] = [
  {
    id: 'read-error-first',
    marker: '⚠ error',
    title: t('อ่านข้อความ error ก่อนเสมอ', 'Always read the error message first'),
    description: t(
      'ข้อความ error จะบอกว่าโปรแกรม "คาดว่า" จะเจออะไร กับสิ่งที่ "เกิดขึ้นจริง" เช่น NameError: name \'totla\' is not defined หมายถึงชื่อตัวแปรพิมพ์ผิด อ่านตรงนี้ก่อนจะช่วยตัดตัวเลือกที่ไม่เกี่ยวออกได้ทันที',
      'The error message tells you what the program expected vs. what actually happened. For example, NameError: name \'totla\' is not defined means a variable name typo. Reading this first helps eliminate irrelevant choices immediately.',
    ),
  },
  {
    id: 'find-line-number',
    marker: 'line / culprit',
    title: t('หา "จุดที่ error ชี้" ก่อนเสมอ', 'Start with the spot the error points to'),
    description: t(
      'ถ้า error บอกเลขบรรทัดชัด ให้เริ่มจากจุดนั้นก่อน แต่ถ้าไม่บอกตรง ๆ ให้เทียบข้อความ error กับ 4 บรรทัดที่เห็น แล้วหาบรรทัดที่มีการเรียก method ผิด ใช้ค่าที่เป็น null หรือเข้าถึง index เกินขนาด',
      'If the error includes a line number, start there. If it does not, match the error text against the 4 visible lines and look for the one that calls the wrong method, uses a null value, or reaches past an index boundary.',
    ),
  },
  {
    id: 'check-the-line',
    marker: '→ code',
    title: t('เช็กโค้ดในบรรทัดนั้น — หา typo, method ผิด, ค่า null', 'Check that line — look for typos, wrong methods, null values'),
    description: t(
      'ดูว่าบรรทัดนั้นมีชื่อตัวแปร/method ที่พิมพ์ผิดหรือไม่ (เช่น appned แทน append, lenght แทน length) มีค่าที่อาจเป็น null/undefined หรือไม่ หรือเข้าถึง index ที่เกินขนาด array — เหล่านี้คือสาเหตุหลักที่พบบ่อยที่สุดในโจทย์แก้ Error',
      'Check for misspelled variable/method names (e.g., appned instead of append, lenght instead of length), possible null/undefined values, or out-of-range array indexes. These are the most common causes in Fix Error questions.',
    ),
  },
  {
    id: 'expected-vs-actual',
    marker: '≠ diff',
    title: t('เทียบ "คาดว่า" กับ "ที่เกิดจริง" — เห็นจุดพังทันที', 'Compare expected vs. actual — spot the break instantly'),
    description: t(
      'Error มักบอกทั้งสิ่งที่ "expected" และสิ่งที่ "got" เช่น TypeError: expected number, got string หรือจำนวน argument ไม่ตรง ถ้าเทียบสองอันนี้ได้จะเห็นจุดพังทันที — บรรทัดอื่นที่โค้ดยังถูกอยู่ก็ตัดออกได้เลย',
      'Errors often state both what was "expected" and what was "got" — e.g., TypeError: expected number, got string, or wrong argument count. Comparing these two reveals the mismatch instantly, letting you eliminate correct lines right away.',
    ),
  },
]

export const vocabPrimerSections: GuidePrimerSection[] = [
  {
    id: 'read-term-first',
    marker: '📖 term',
    title: t('ดูคำศัพท์เป้าหมายให้ชัด', 'Focus on the target vocabulary term'),
    description: t(
      'ในโหมดฝึกศัพท์ เราจะสุ่มคีย์เวิร์ดเจาะจงหรือ syntax เฉพาะทางมาทดสอบ ให้อ่านคำศัพท์นั้นก่อน ว่ามันหมายถึงตัวแปร ฟังก์ชัน คลาส หรือเป็นคำสั่งพิเศษของรันไทม์ใด',
      'In Vocab Drill mode, we test specific keywords or unique syntax. Read the term first to see if it stands for a variable, function, class, or special runtime command.',
    ),
  },
  {
    id: 'check-snippet-context',
    marker: '🔍 snippet',
    title: t('ดูบริบทย่อยใน Snippet เสมอ', 'Always check the snippet context'),
    description: t(
      'คำเดียวกันอาจแปลความหมายไม่เหมือนกันในคนละภาษา ให้ดูว่าใน snippet มันถูกใช้ตอนประกาศ เรียกใช้ ส่งค่า หรือควบคุม flow เพื่อยืนยันหน้าที่จริงของมัน',
      'The same term can imply different things in different languages. Check whether the snippet is using it for declaration, invocation, value passing, or flow control before deciding on the meaning.',
    ),
  },
  {
    id: 'eliminate-false-friends',
    marker: '❌ options',
    title: t('ตัดความหมายที่คล้ายคลึงทิ้ง', 'Eliminate similar false distractor options'),
    description: t(
      'ตัวเลือกรองมักจะตั้งใจหลอกด้วยความหมายที่เหมือนจะคุ้นในภาษาฮิตอื่นๆ ในโลกโปรแกรมมิ่ง ให้ระวังดีๆ แล้วตอบความหมายที่แม่นยำที่สุดตามภาษานั้น',
      'Distractor choices are usually designed to trick you with valid meanings from other popular languages. Be careful and pick the most precise meaning for the current language.',
    ),
  },
]

export const debugPrimerSections: GuidePrimerSection[] = [
  {
    id: 'read-scenario',
    marker: '📋 scenario',
    title: t('อ่านสถานการณ์จำลองก่อนดูโค้ด', 'Read the scenario before looking at code'),
    description: t(
      'สถานการณ์จำลองจะบอกบริบทว่าระบบทำอะไรอยู่ตอนพัง เช่น "ผู้ใช้กด submit แล้วหน้าค้าง" หรือ "API คืน 500" — เข้าใจบริบทก่อนจะช่วยตัดสาเหตุที่ไม่เกี่ยวออกได้ทันที โดยไม่ต้องอ่านโค้ดทุกบรรทัด',
      'The scenario tells you what the system was doing when it broke — e.g., "user clicks submit and the page freezes" or "API returns 500". Understanding context first helps you eliminate irrelevant causes without reading every code line.',
    ),
  },
  {
    id: 'check-log',
    marker: '🔍 log',
    title: t('เช็กข้อมูล log ให้ละเอียด', 'Check the log output carefully'),
    description: t(
      'ข้อมูล log จะบอกลำดับเหตุการณ์จริงที่เกิดขึ้น — ดูว่า log หยุดตรงไหน ค่าไหนเป็น null ค่าไหนผิดปกติ จุดที่ log ขาดหายหรือค่าแปลก ๆ นั้นมักอยู่ใกล้ต้นเหตุ (สาเหตุหลักมี 6 กลุ่ม: typo, null, range, field ผิด, selector ผิด, config ผิด)',
      'The log shows the actual sequence of events — notice where the log stops, which values are null or abnormal. The spot where logs break or show unexpected values is usually near the root cause (6 cause groups: typo, null, range, wrong field, wrong selector, wrong config).',
    ),
  },
  {
    id: 'match-log-to-code',
    marker: '↔ match',
    title: t('จับคู่ข้อมูล log กับโค้ด', 'Match log entries to code lines'),
    description: t(
      'นำข้อความจาก log มาหาว่าโค้ดบรรทัดไหนสั่ง print/log ข้อความนั้น แล้วดูว่าจาก flow หลังจากจุดนั้นผิดพลาดตรงไหน เช่น log บอก "user = null" แสดงว่าโค้ดที่ดึง user มาอาจ query ผิด field หรือ path ผิด',
      'Take the log text and find which code line produces it. Then trace the flow after that point — e.g., if the log says "user = null", the code fetching the user may be querying the wrong field or path.',
    ),
  },
  {
    id: 'identify-cause-type',
    marker: '🎯 cause',
    title: t('ระบุประเภทของสาเหตุ — จำ 6 กลุ่มหลัก', 'Identify the cause type — remember the 6 main groups'),
    description: t(
      'สาเหตุในโจทย์ Debug จะเป็นหนึ่งใน 6 กลุ่มเสมอ: (1) typo = ชื่อผิด (2) null = ข้อมูลว่าง (3) range = index เกิน (4) field = ใช้ key/property ผิด (5) selector = เลือก element ผิดตัว (6) config = ตั้งค่าผิด — จำแนกกลุ่มได้เร็วจะตอบถูกง่ายขึ้น',
      'Debug question causes always fall into 6 groups: (1) typo = wrong name (2) null = empty data (3) range = index overflow (4) field = wrong key/property (5) selector = wrong element selected (6) config = misconfigured setting. Classifying quickly makes answering much easier.',
    ),
  },
]

export const guideFamilyLabels: Record<GuideFamilyId, LocalizedText> = {
  web: t('Web / UI', 'Web / UI'),
  app: t('App / Framework', 'App / Framework'),
  backend: t('Backend / Service', 'Backend / Service'),
  data: t('Data / Query', 'Data / Query'),
  system: t('System / Low-level', 'System / Low-level'),
  gameplay: t('Gameplay Script', 'Gameplay Script'),
  lifecycle: t('Engine Lifecycle', 'Engine Lifecycle'),
  shader: t('Shader Language', 'Shader Language'),
}

export const trackTopicIds: Record<QuizTrackId, LanguageId[]> = {
  core: [
    'python',
    'java',
    'html',
    'css',
    'json',
    'csharp',
    'cpp',
    'flutter',
    'dart',
    'jsx',
    'typescript',
    'bash',
    'cloud-functions',
    'sql',
    'php',
    'rust',
    'javascript',
    'go',
    'kotlin',
    'swift',
    'ruby',
  ],
  'game-dev': [
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
  ],
}

export const trackSettings: Record<QuizTrackId, TrackSetting> = {
  core: {
    label: t('Core Languages', 'Core Languages'),
    description: t(
      'เส้นทางหลักสำหรับฝึกดูทรงของภาษาเว็บ แอป data backend และ system แบบที่คนเริ่มต้นก็อ่านรู้เรื่อง',
      'The main track for learning the shape of web, app, data, backend, and system languages in a beginner-friendly way.',
    ),
    badge: t('21 หัวข้อหลัก', '21 core topics'),
    defaultGuideId: 'python',
  },
  'game-dev': {
    label: t('Game Dev Mode', 'Game Dev Mode'),
    description: t(
      'โหมดพิเศษที่แยกกลิ่นของ engine, gameplay script, lifecycle, และ shader ออกจากกันให้เห็นชัด',
      'A special track focused on separating engine smell, gameplay scripts, lifecycle code, and shaders.',
    ),
    badge: t('15 game stacks', '15 game stacks'),
    defaultGuideId: 'roblox-lua',
  },
}

type AddedCoreLanguageId = keyof typeof coreLanguageGuideExtensions
type AddedGameLanguageId = keyof typeof gameLanguageGuideExtensions
type ExistingCoreLanguageId = Exclude<CoreLanguageId, AddedCoreLanguageId>
type ExistingGameLanguageId = Exclude<GameLanguageId, AddedGameLanguageId>

const coreLanguageGuides: Record<ExistingCoreLanguageId, LanguageGuide> = {
  python: {
    track: 'core',
    label: t('Python', 'Python'),
    family: 'backend',
    difficultyHint: t('เริ่มดูที่การย่อหน้าและคำว่า def', 'Start with indentation and the word def'),
    plainSummary: t(
      'ภาษานี้ชอบเขียนให้ดูเหมือนรายการคำสั่งที่ย่อหน้าเข้าไปทีละชั้น อ่านแล้วคล้าย outline มากกว่ากำแพงปีกกา',
      'This language often looks like an outline with nested indentation rather than a wall of braces.',
    ),
    metaphor: t('เหมือนโน้ตที่เลื่อนบรรทัดเข้าไปเพื่อบอกว่าอะไรอยู่ข้างในอะไร', 'It feels like notes that shift inward to show nesting.'),
    quickSpot: t('ไม่มีปีกกา แต่ย่อหน้าคือ block', 'No braces; indentation is the block.'),
    spottingRules: list([
      ['มักเห็น def, print(), if, for แล้วตามด้วย :', 'You often see def, print(), if, or for followed by a colon.'],
      ['list หรือ dict มักถูกจัดการแบบสั้นและอ่านง่าย', 'Lists and dicts are often handled in a short, readable style.'],
      ['ไม่ค่อยบังคับ type ทุกตัวแปรแบบเข้มมาก', 'It does not force strict type declarations on every variable.'],
    ]),
    falseFriends: ['bash', 'php', 'rust'],
    beginnerChecklist: list([
      ['มองหาการย่อหน้าแทน { }', 'Look for indentation instead of { }.'],
      ['ดูว่ามี def หรือ not in หรือ .items() ไหม', 'Check for def, not in, or .items().'],
      ['ถ้าอ่านคล้ายภาษาอังกฤษง่าย ๆ มักเป็นตัวเต็ง', 'If it reads like simple English, it is a strong candidate.'],
    ]),
    miniSnippetNotes: list([
      ['def greet(name):', 'def greet(name):'],
      ['for key, value in data.items():', 'for key, value in data.items():'],
    ]),
    signature: ['def', 'indentation', 'print()', 'list comprehension'],
    debugFocus: {
      th: ['เช็กการย่อหน้าให้ตรง block', 'เช็ก colon หลัง if, for, def', 'ระวังชื่อตัวแปรและ method แบบ dynamic'],
      en: ['Check indentation levels carefully', 'Verify colons after if, for, and def', 'Watch dynamic variable and method usage'],
    },
  },
  java: {
    track: 'core',
    label: t('Java', 'Java'),
    family: 'app',
    difficultyHint: t('เริ่มดู class และชนิดข้อมูลที่ประกาศชัด', 'Start with classes and explicit types'),
    plainSummary: t(
      'Java ชอบบอกให้ชัดว่าอะไรเป็นชนิดอะไร มักเห็น class, public, static และชื่อ type เต็ม ๆ',
      'Java likes to make types explicit, so you often see class, public, static, and full type names.',
    ),
    metaphor: t('เหมือนเอกสารราชการที่กรอกช่องครบทุกช่องก่อนเริ่มทำงาน', 'It feels like a formal document where every field is filled in before work starts.'),
    quickSpot: t('class + type ชัด + System.out.println', 'class + explicit types + System.out.println'),
    spottingRules: list([
      ['มักเห็น public class, private int, String name', 'You often see public class, private int, or String name.'],
      ['นิยมใช้ ; ปิดท้ายเกือบทุกคำสั่ง', 'It usually ends statements with semicolons.'],
      ['ถ้าเห็น System.out.println เป็นสัญญาณแรงมาก', 'System.out.println is a very strong clue.'],
    ]),
    falseFriends: ['csharp', 'cpp', 'typescript'],
    beginnerChecklist: list([
      ['เริ่มจากมองคำว่า class หรือ interface', 'Start by looking for class or interface.'],
      ['ถ้าเห็น generics แบบ List<String> ให้คิดถึงโลกนี้', 'If you see generics like List<String>, think about this world.'],
      ['ดูว่าคำสั่งต่าง ๆ อยู่ในปีกกาและปิด ; ไหม', 'Check whether code lives inside braces and ends with semicolons.'],
    ]),
    miniSnippetNotes: list([
      ['public record UserSummary(...) {}', 'public record UserSummary(...) {}'],
      ['System.out.println("ok");', 'System.out.println("ok");'],
    ]),
    signature: ['class', 'public static void main', 'System.out.println', 'explicit types'],
    debugFocus: {
      th: ['เช็กชื่อ class และ constructor', 'ดู generic type ให้ครบ', 'ระวัง semicolon และ visibility modifier'],
      en: ['Verify class and constructor names', 'Inspect generic type declarations', 'Watch semicolons and visibility modifiers'],
    },
  },
  html: {
    track: 'core',
    label: t('HTML', 'HTML'),
    family: 'web',
    difficultyHint: t('มองหาแท็กเปิดปิดก่อนอย่างแรก', 'Look for opening and closing tags first'),
    plainSummary: t(
      'HTML ไม่ได้สั่งให้โปรแกรมคำนวณ แต่มักกำลังบอกโครงของหน้าเว็บหรือเอกสารว่าอะไรอยู่ตรงไหน',
      'HTML is not usually telling a program how to calculate. It is describing where pieces of a page or document go.',
    ),
    metaphor: t('เหมือนโครงกระดูกของหน้าเว็บ', 'It is the skeleton of a webpage.'),
    quickSpot: t('เห็น <tag> เปิดปิด = มักเป็น HTML', 'If you see opening and closing <tag>, it is usually HTML.'),
    spottingRules: list([
      ['มีแท็กอย่าง <div>, <button>, <section>, <article>', 'It uses tags such as <div>, <button>, <section>, and <article>.'],
      ['attribute อย่าง class, id, href, src อยู่ในแท็ก', 'Attributes like class, id, href, and src live inside tags.'],
      ['ไม่มี logic แบบ loop หรือ type annotation เด่น ๆ', 'It usually lacks obvious loops or type annotations.'],
    ]),
    falseFriends: ['jsx', 'css', 'json'],
    beginnerChecklist: list([
      ['มองว่ามันกำลังบอกหน้าตาหรือโครงสร้าง ไม่ใช่คำนวณ', 'Ask whether it is describing structure rather than calculations.'],
      ['ดูว่ามีแท็กปิดคู่กันไหม', 'Check whether tags close in pairs.'],
      ['ถ้าเห็น class= มากกว่า className = HTML มาก่อน', 'If you see class= rather than className, HTML is the better bet.'],
    ]),
    miniSnippetNotes: list([
      ['<article class="card">...</article>', '<article class="card">...</article>'],
      ['<img src="/hero.webp" alt="preview" />', '<img src="/hero.webp" alt="preview" />'],
    ]),
    signature: ['opening and closing tags', 'attributes', 'markup tree', 'angle brackets'],
    debugFocus: {
      th: ['เช็ก tag nesting', 'ดู attribute ว่าปิดครบหรือไม่', 'ระวังแท็กปิดผิดลำดับ'],
      en: ['Check tag nesting', 'Make sure attributes are complete', 'Watch for mismatched closing tags'],
    },
  },
  css: {
    track: 'core',
    label: t('CSS', 'CSS'),
    family: 'web',
    difficultyHint: t('มองหา selector กับ property-value', 'Look for selectors and property-value pairs'),
    plainSummary: t(
      'CSS คือกติกาการแต่งหน้าตาและ layout ของหน้าเว็บ มักบอกว่าอะไรควรมีสี ขนาด ระยะห่าง หรือการจัดวางแบบไหน',
      'CSS is a styling rulebook for web pages. It tells the page which colors, sizes, spacing, or layout rules to use.',
    ),
    metaphor: t('เหมือนตู้เสื้อผ้ากับกติกาการแต่งตัวของหน้าเว็บ', 'It feels like the wardrobe and styling rules for a webpage.'),
    quickSpot: t('selector แล้วตามด้วย { color: ...; }', 'A selector followed by { color: ...; }'),
    spottingRules: list([
      ['บรรทัดแรกมักเป็น selector เช่น .card, #app, button:hover', 'The first line is often a selector like .card, #app, or button:hover.'],
      ['ในปีกกามักเป็น property: value;', 'Inside braces, you usually see property: value;.'],
      ['มักมีคำอย่าง display, color, margin, padding, grid', 'You often see words like display, color, margin, padding, or grid.'],
    ]),
    falseFriends: ['html', 'jsx', 'json'],
    beginnerChecklist: list([
      ['ดูว่ามันกำลังบอก “หน้าตา” มากกว่า “การทำงาน”', 'Check whether it describes appearance rather than behavior.'],
      ['หาเครื่องหมาย : และ ; ที่อยู่ใน declaration', 'Look for : and ; inside declarations.'],
      ['ถ้ามี selector อย่าง .box หรือ :hover ให้คิดถึง CSS ก่อน', 'If you see selectors like .box or :hover, think of CSS first.'],
    ]),
    miniSnippetNotes: list([
      ['.panel { border-radius: 24px; }', '.panel { border-radius: 24px; }'],
      ['@media (min-width: 768px) { ... }', '@media (min-width: 768px) { ... }'],
    ]),
    signature: ['selector', 'property-value', ':hover', 'media query'],
    debugFocus: {
      th: ['ดู selector specificity', 'เช็ก : และ ; ให้ครบ', 'แยก pseudo-class กับ pseudo-element ให้ชัด'],
      en: ['Check selector specificity', 'Verify : and ; in declarations', 'Separate pseudo-classes from pseudo-elements'],
    },
  },
  json: {
    track: 'core',
    label: t('JSON', 'JSON'),
    family: 'data',
    difficultyHint: t('เริ่มจากดูว่าเป็นข้อมูลล้วนหรือไม่', 'Start by asking whether it is pure data'),
    plainSummary: t(
      'JSON เป็นข้อมูลล้วน ๆ ไม่มีคำสั่งให้วิ่ง ไม่มี function ไม่มี comment มักเก็บค่าไว้เป็น object และ array',
      'JSON is pure data. It does not run loops or functions, and it usually stores values in objects and arrays.',
    ),
    metaphor: t('เหมือนกล่องฉลากชื่อแล้วใส่ค่าไว้ข้างใน', 'It feels like labeled boxes that hold values.'),
    quickSpot: t('มีแต่ข้อมูล ไม่มีคำสั่งทำงาน', 'Data only, no executable instructions.'),
    spottingRules: list([
      ['key มักถูกครอบด้วย double quote', 'Keys are usually wrapped in double quotes.'],
      ['มักเห็น { }, [ ] และค่า string/number/boolean', 'You often see { }, [ ], and string/number/boolean values.'],
      ['ไม่มี function, class, หรือคำสั่ง loop', 'There are no functions, classes, or loop statements.'],
    ]),
    falseFriends: ['sql', 'typescript', 'html'],
    beginnerChecklist: list([
      ['ถามก่อนว่า “นี่คือข้อมูลหรือคำสั่ง”', 'First ask: is this data or instructions?'],
      ['ดูว่ามีชื่อ field ตามด้วยค่าเต็มไปหมดไหม', 'Check whether it is mostly field names followed by values.'],
      ['ถ้าไม่มีคำสั่งให้ทำอะไร มักเป็น JSON', 'If nothing is telling the program what to do, JSON is likely.'],
    ]),
    miniSnippetNotes: list([
      ['"theme": { "accent": "#d96235" }', '"theme": { "accent": "#d96235" }'],
      ['"languages": ["python", "rust"]', '"languages": ["python", "rust"]'],
    ]),
    signature: ['quoted keys', 'objects and arrays', 'pure data', 'no functions'],
    debugFocus: {
      th: ['เช็ก comma ระหว่าง field', 'ดูว่า key ใช้ double quote', 'ระวัง trailing comma และ comment'],
      en: ['Check commas between fields', 'Ensure keys use double quotes', 'Watch trailing commas and comments'],
    },
  },
  csharp: {
    track: 'core',
    label: t('C#', 'C#'),
    family: 'app',
    difficultyHint: t('ดู using, property และกลิ่น .NET', 'Look for using, properties, and .NET-style clues'),
    plainSummary: t(
      'C# คล้าย Java แต่จะมีกลิ่นของ .NET ชัด เช่น property แบบ get/set, Console.WriteLine หรือ class ที่ใช้กับ framework ต่าง ๆ',
      'C# can look like Java, but it has a strong .NET flavor with get/set properties, Console.WriteLine, and framework-oriented classes.',
    ),
    metaphor: t('เหมือน Java ที่ใส่กลิ่นเครื่องมือ Microsoft เข้าไปชัด ๆ', 'It feels like Java with strong Microsoft/.NET fingerprints.'),
    quickSpot: t('using + { get; set; } + Console.WriteLine', 'using + { get; set; } + Console.WriteLine'),
    spottingRules: list([
      ['มักมี using อยู่บนไฟล์', 'A file often begins with using statements.'],
      ['property แบบ public string Name { get; set; } เจอบ่อยมาก', 'Properties like public string Name { get; set; } are common.'],
      ['async Task และ var เป็นสัญญาณที่เจอบ่อย', 'async Task and var are common clues.'],
    ]),
    falseFriends: ['java', 'cpp', 'typescript'],
    beginnerChecklist: list([
      ['มองหา property แบบ get/set', 'Look for get/set style properties.'],
      ['ถ้าเห็น Console.WriteLine ให้คะแนนทางนี้เยอะ', 'If you see Console.WriteLine, heavily favor this option.'],
      ['ดูว่ามี using กับ namespace ไหม', 'Check for using and namespaces.'],
    ]),
    miniSnippetNotes: list([
      ['public string Name { get; set; }', 'public string Name { get; set; }'],
      ['await Task.Delay(200);', 'await Task.Delay(200);'],
    ]),
    signature: ['using', '{ get; set; }', 'Console.WriteLine', 'Task'],
    debugFocus: {
      th: ['เช็ก property และ access modifier', 'ดู async/await ให้ครบ', 'ระวังชนิดคืนค่าของ method'],
      en: ['Inspect properties and access modifiers', 'Verify async/await pairs', 'Check method return types'],
    },
  },
  cpp: {
    track: 'core',
    label: t('C++', 'C++'),
    family: 'system',
    difficultyHint: t('เริ่มจาก #include และ std::', 'Start with #include and std::'),
    plainSummary: t(
      'C++ มักดูเหมือนภาษาระดับต่ำที่ต้องจัดของให้ครบ มี header, namespace, pointer/reference และ syntax แน่น ๆ',
      'C++ often looks like a lower-level language with headers, namespaces, pointers/references, and dense syntax.',
    ),
    metaphor: t('เหมือนกล่องเครื่องมือช่างที่ต้องหยิบอะไหล่เองหลายชิ้น', 'It feels like a toolbox where you pick parts by hand.'),
    quickSpot: t('#include + std:: + ::', '#include + std:: + ::'),
    spottingRules: list([
      ['ไฟล์มักขึ้นต้นด้วย #include', 'Files often begin with #include.'],
      ['std::vector, std::string, std::cout เป็นคำคุ้นมาก', 'std::vector, std::string, and std::cout are familiar clues.'],
      ['อาจมี & หรือ * เพื่อบอก reference และ pointer', 'You may see & or * for references and pointers.'],
    ]),
    falseFriends: ['rust', 'csharp', 'java'],
    beginnerChecklist: list([
      ['ดู #include ก่อน', 'Look for #include first.'],
      ['ถ้าเห็น std:: หลายจุด ให้คิดถึง C++ มาก', 'If std:: appears in several places, strongly consider C++.'],
      ['ระวังว่า class ใน C++ มักมาพร้อม ; ปิดท้าย', 'Remember that classes in C++ often end with a semicolon.'],
    ]),
    miniSnippetNotes: list([
      ['#include <vector>', '#include <vector>'],
      ['std::cout << "ready";', 'std::cout << "ready";'],
    ]),
    signature: ['#include', 'std::', '::', 'constructor initializer'],
    debugFocus: {
      th: ['ดู namespace และ header ให้ถูก', 'ระวัง ; หลัง class', 'เช็ก reference, pointer และ iterator'],
      en: ['Verify namespaces and headers', 'Watch the ; after classes', 'Inspect references, pointers, and iterators'],
    },
  },
  flutter: {
    track: 'core',
    label: t('Flutter', 'Flutter'),
    family: 'app',
    difficultyHint: t('มองว่าเป็นต้นไม้ของ widget', 'Look at it as a tree of widgets'),
    plainSummary: t(
      'Flutter ไม่ได้เน้นภาษาล้วน แต่เน้นวิธีประกอบ UI เป็นต้นไม้ของ widget เช่น Scaffold, Column, Padding, Text',
      'Flutter is not just about the language. It is about building UI as a widget tree with pieces like Scaffold, Column, Padding, and Text.',
    ),
    metaphor: t('เหมือนต่อเลโก้ UI ทีละชิ้นให้เป็นหน้าจอ', 'It feels like snapping UI Lego pieces into a screen.'),
    quickSpot: t('Scaffold / Column / Text / child:', 'Scaffold / Column / Text / child:'),
    spottingRules: list([
      ['มักเห็น widget ชื่อขึ้นต้นตัวใหญ่และซ้อนกันลึก', 'You often see capitalized widget names nested deeply.'],
      ['มีคำว่า child:, children:, padding:, const อยู่บ่อย', 'Words like child:, children:, padding:, and const appear often.'],
      ['ถึงจะใช้ Dart แต่กลิ่นของ UI tree เด่นกว่าภาษาเปล่า', 'Even though it uses Dart, the UI tree smell is stronger than the raw language.'],
    ]),
    falseFriends: ['dart', 'jsx', 'unity-csharp'],
    beginnerChecklist: list([
      ['ดูว่าเป็น UI tree หรือไม่', 'Check whether it looks like a UI tree.'],
      ['มองหา Scaffold, Container, Text, Row, Column', 'Look for Scaffold, Container, Text, Row, and Column.'],
      ['ถ้ามี child หรือ children บ่อยมาก มักใช่', 'If child or children appears often, it is a strong clue.'],
    ]),
    miniSnippetNotes: list([
      ['Scaffold(body: Center(child: Text("Hi")))', 'Scaffold(body: Center(child: Text("Hi")))'],
      ['ListView.builder(...)', 'ListView.builder(...)'],
    ]),
    signature: ['Scaffold', 'widget tree', 'Text(', 'builder'],
    debugFocus: {
      th: ['เช็ก widget nesting', 'ดู comma และวงเล็บปิดท้ายใน tree', 'ระวัง const, context และ property ของ widget'],
      en: ['Check widget nesting', 'Inspect commas and trailing parentheses in the tree', 'Watch const, context, and widget props'],
    },
  },
  dart: {
    track: 'core',
    label: t('Dart', 'Dart'),
    family: 'app',
    difficultyHint: t('ดู final, named parameter และความเป็นมิตรกับ null safety', 'Look for final, named parameters, and null safety'),
    plainSummary: t(
      'Dart เป็นภาษาที่สะอาดและค่อนข้างอ่านง่าย มี named parameter, final และ syntax ที่ไม่แข็งเท่า Java แต่ยังเป็นภาษาที่ค่อนข้างเป็นระเบียบ',
      'Dart is a clean and readable language with named parameters, final, and a style that is tidy but less formal than Java.',
    ),
    metaphor: t('เหมือนภาษาที่จัดโต๊ะเรียบร้อยและชอบบอกชื่อช่องให้ครบ', 'It feels like a tidy language that labels its slots clearly.'),
    quickSpot: t('final + named parameter + String interpolation', 'final + named parameters + string interpolation'),
    spottingRules: list([
      ['มักเห็น final, String, List<T>, required', 'You often see final, String, List<T>, and required.'],
      ['constructor และ function ชอบใช้ named parameter แบบ { ... }', 'Constructors and functions often use named parameters inside { ... }.'],
      ['ถ้าไม่มีกลิ่น widget tree แรง ๆ มันอาจเป็น Dart ล้วน ไม่ใช่ Flutter', 'Without a strong widget-tree smell, it may be plain Dart rather than Flutter.'],
    ]),
    falseFriends: ['flutter', 'typescript', 'csharp'],
    beginnerChecklist: list([
      ['ดูคำว่า final และ required', 'Look for final and required.'],
      ['เช็กว่ามี named parameter ไหม', 'Check whether named parameters are used.'],
      ['ถ้า syntax สะอาดแต่ไม่ใช่ Java หรือ TS ชัด ๆ ให้คิดถึง Dart', 'If the syntax is clean but not clearly Java or TS, think of Dart.'],
    ]),
    miniSnippetNotes: list([
      ['String greet({required String name})', 'String greet({required String name})'],
      ['final total = scores.fold(0, ...)', 'final total = scores.fold(0, ...)'],
    ]),
    signature: ['final', 'named parameters', 'String', 'interpolation'],
    debugFocus: {
      th: ['เช็ก null safety และชนิดข้อมูล', 'ดู named parameter ให้ครบ', 'ระวัง generic type และ constructor shorthand'],
      en: ['Inspect null safety and types', 'Verify named parameters', 'Watch generics and constructor shorthand'],
    },
  },
  jsx: {
    track: 'core',
    label: t('JSX', 'JSX'),
    family: 'web',
    difficultyHint: t('ดูว่าเหมือน HTML แต่มี JavaScript แทรกไหม', 'Ask whether it looks like HTML with JavaScript inside'),
    plainSummary: t(
      'JSX คือหน้าตาแบบ HTML ที่แทรกอยู่ใน JavaScript หรือ React component จึงดูเหมือน markup แต่มี expression และ event handler แทรกอยู่',
      'JSX looks like HTML living inside JavaScript or React components, so it resembles markup with expressions and handlers embedded in it.',
    ),
    metaphor: t('เหมือน HTML ที่คุยกับ JavaScript อยู่ตลอดเวลา', 'It feels like HTML constantly talking to JavaScript.'),
    quickSpot: t('หน้าตาคล้าย HTML แต่มี { } และ className', 'Looks like HTML but uses { } and className'),
    spottingRules: list([
      ['มักเห็น className แทน class', 'You often see className instead of class.'],
      ['มี { ... } สำหรับ expression หรือ conditional render', 'It uses { ... } for expressions or conditional rendering.'],
      ['event handler อย่าง onClick มักรับ function', 'Event handlers like onClick often receive functions.'],
    ]),
    falseFriends: ['html', 'typescript', 'flutter'],
    beginnerChecklist: list([
      ['ถ้าแท็กดูเหมือน HTML แต่มี {} แทรก ให้นึกถึง JSX', 'If tags look like HTML but include {}, think of JSX.'],
      ['ดูว่ามี component ชื่อขึ้นต้นตัวใหญ่ไหม', 'Check whether component names start with capital letters.'],
      ['className เป็นคำใบ้แรงมาก', 'className is a strong clue.'],
    ]),
    miniSnippetNotes: list([
      ['<Panel title={title} />', '<Panel title={title} />'],
      ['{items.map((item) => <Chip ... />)}', '{items.map((item) => <Chip ... />)}'],
    ]),
    signature: ['className', '{} expressions', 'component tags', 'onClick'],
    debugFocus: {
      th: ['เช็ก key ตอน map list', 'ดูการเปิดปิดแท็กใน JSX tree', 'ระวัง expression ใน {} และชื่อ prop'],
      en: ['Check key in mapped lists', 'Inspect opening and closing tags in the JSX tree', 'Watch expressions in {} and prop names'],
    },
  },
  typescript: {
    track: 'core',
    label: t('TypeScript', 'TypeScript'),
    family: 'web',
    difficultyHint: t('ดู type annotation และ interface', 'Look for type annotations and interfaces'),
    plainSummary: t(
      'TypeScript คือ JavaScript ที่ใส่ระบบ type เพิ่มเข้ามา จึงมักเห็น interface, type, generic และการระบุชนิดหลัง :',
      'TypeScript is JavaScript with added type information, so you often see interfaces, type aliases, generics, and annotations after colons.',
    ),
    metaphor: t('เหมือน JavaScript ที่ถือสมุดเช็กชื่อชนิดข้อมูลติดมือไว้', 'It feels like JavaScript carrying a type checklist everywhere.'),
    quickSpot: t('JavaScript syntax + interface/type + : string', 'JavaScript syntax + interface/type + : string'),
    spottingRules: list([
      ['มักเห็น interface, type, Record, Promise<T>', 'You often see interface, type, Record, or Promise<T>.'],
      ['parameter และ return type มักมี : type กำกับ', 'Parameters and return values often carry : type annotations.'],
      ['ยังดูคล้ายโลก JavaScript แต่มี type เสริม', 'It still looks like JavaScript, just with extra type information.'],
    ]),
    falseFriends: ['jsx', 'csharp', 'java'],
    beginnerChecklist: list([
      ['ดูคำว่า interface หรือ type ก่อน', 'Look for interface or type first.'],
      ['ถ้า syntax คล้าย JS แต่มี type annotation แทรกอยู่ ให้คิดถึง TS', 'If it looks like JS with type annotations, think of TS.'],
      ['Promise, union type, generic function เป็นคำช่วยจำที่ดี', 'Promise, union types, and generic functions are good memory hooks.'],
    ]),
    miniSnippetNotes: list([
      ['type Result = Success | Failure', 'type Result = Success | Failure'],
      ['const toMap = <T extends { id: string }>(...) => ...', 'const toMap = <T extends { id: string }>(...) => ...'],
    ]),
    signature: ['interface', 'type', ': number', 'generic functions'],
    debugFocus: {
      th: ['ดู type annotation ตรง parameter/return', 'เช็ก generic และ union type', 'ระวัง object shape กับ interface'],
      en: ['Inspect parameter and return type annotations', 'Check generics and union types', 'Watch object shapes against interfaces'],
    },
  },
  bash: {
    track: 'core',
    label: t('Bash', 'Bash'),
    family: 'system',
    difficultyHint: t('มองหา $VAR, pipe และคำสั่ง shell', 'Look for $VAR, pipes, and shell commands'),
    plainSummary: t(
      'Bash คือภาษาสคริปต์ของ shell จึงชอบใช้คำสั่งระบบ, ตัวแปรแบบ $NAME, pipe และไฟล์/command redirection',
      'Bash is a shell scripting language, so it leans on system commands, $NAME variables, pipes, and redirection.',
    ),
    metaphor: t('เหมือนคนสั่งงานเครื่องด้วยประโยคสั้น ๆ ต่อกันหลายคำสั่ง', 'It feels like someone issuing short system commands in sequence.'),
    quickSpot: t('$VAR + pipe + done/fi', '$VAR + pipes + done/fi'),
    spottingRules: list([
      ['มักขึ้นต้นด้วย shebang เช่น #!/usr/bin/env bash', 'It often begins with a shebang like #!/usr/bin/env bash.'],
      ['มีคำสั่งอย่าง echo, printf, grep, jq, find', 'It uses commands like echo, printf, grep, jq, or find.'],
      ['loop และ if มักปิดด้วย done หรือ fi', 'Loops and if blocks often end with done or fi.'],
    ]),
    falseFriends: ['python', 'sql', 'php'],
    beginnerChecklist: list([
      ['ดูว่ามันเรียก command ของระบบหรือไม่', 'Check whether it is calling system commands.'],
      ['มองหาตัวแปรแบบ $NAME', 'Look for variables like $NAME.'],
      ['ถ้าเห็น pipe | และ redirection < > บ่อยมาก ให้คิดถึง Bash', 'If pipes and redirection appear often, think of Bash.'],
    ]),
    miniSnippetNotes: list([
      ['for file in *.json; do ... done', 'for file in *.json; do ... done'],
      ['set -euo pipefail', 'set -euo pipefail'],
    ]),
    signature: ['#!/usr/bin/env bash', '$VAR', 'pipe', 'fi/done'],
    debugFocus: {
      th: ['เช็ก quote รอบ path และตัวแปร', 'ดู block ที่ปิดด้วย fi หรือ done', 'ระวัง whitespace ใน test expression'],
      en: ['Check quotes around paths and variables', 'Inspect blocks closed by fi or done', 'Watch whitespace in test expressions'],
    },
  },
  'cloud-functions': {
    track: 'core',
    label: t('Cloud Functions', 'Cloud Functions'),
    family: 'backend',
    difficultyHint: t('ดู trigger และ handler ที่ export ออกไป', 'Look for exported triggers and handlers'),
    plainSummary: t(
      'โค้ดแนวนี้คือฟังก์ชันที่รันบนแพลตฟอร์มตาม event เช่น request, schedule หรือ document change จึงมีกลิ่นของ handler ชัดมาก',
      'This style is platform code that runs on events like requests, schedules, or document changes, so it has a strong handler smell.',
    ),
    metaphor: t('เหมือนพนักงานรอรับสัญญาณแล้วค่อยทำงาน', 'It feels like a worker waiting for an event before acting.'),
    quickSpot: t('exports/onCall/onRequest/onSchedule', 'exports/onCall/onRequest/onSchedule'),
    spottingRules: list([
      ['มักมี exports.xxx = handler', 'It often assigns exports.xxx = handler.'],
      ['ชื่อ trigger อย่าง onCall, onRequest, onSchedule, onDocumentCreated เจอบ่อย', 'Triggers like onCall, onRequest, onSchedule, or onDocumentCreated appear often.'],
      ['โค้ดด้านในมักแตะ database หรือ event object', 'The body often touches a database or an event object.'],
    ]),
    falseFriends: ['typescript', 'bash', 'php'],
    beginnerChecklist: list([
      ['ถามว่าโค้ดนี้ถูกเรียกเพราะ event หรือไม่', 'Ask whether this code is triggered by an event.'],
      ['ดูคำว่า exports หรือ handler ที่เหมือนประกาศ service', 'Look for exports or handler-like service definitions.'],
      ['ถ้ามี request/event object และ async logic บ่อย ๆ ให้คิดถึงหมวดนี้', 'If request/event objects and async logic dominate, think of this category.'],
    ]),
    miniSnippetNotes: list([
      ['exports.cleanOldSessions = onSchedule(...)', 'exports.cleanOldSessions = onSchedule(...)'],
      ['exports.rebuildScoreboard = onCall(...)', 'exports.rebuildScoreboard = onCall(...)'],
    ]),
    signature: ['exports.', 'onRequest', 'onSchedule', 'trigger handler'],
    debugFocus: {
      th: ['ดูชื่อ trigger และ path pattern', 'เช็ก async handler และ return flow', 'ระวัง config ของ request/event object'],
      en: ['Inspect trigger names and path patterns', 'Check async handlers and return flow', 'Watch request/event object usage'],
    },
  },
  sql: {
    track: 'core',
    label: t('SQL', 'SQL'),
    family: 'data',
    difficultyHint: t('เริ่มจาก SELECT, FROM, WHERE', 'Start with SELECT, FROM, and WHERE'),
    plainSummary: t(
      'SQL คือภาษาสำหรับถามและจัดการข้อมูลในตาราง จึงมักดูเหมือนประโยค query มากกว่าภาษาเขียนโปรแกรมทั่วไป',
      'SQL is for asking questions of tables and managing data, so it looks more like a query than a general-purpose programming language.',
    ),
    metaphor: t('เหมือนการสั่งพนักงานหาข้อมูลจากชั้นเอกสาร', 'It feels like asking a librarian to fetch records from shelves.'),
    quickSpot: t('SELECT / FROM / WHERE / JOIN', 'SELECT / FROM / WHERE / JOIN'),
    spottingRules: list([
      ['มักใช้ตัวพิมพ์ใหญ่กับคำสั่งหลัก', 'Major keywords are often uppercase.'],
      ['มีคำอย่าง SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY', 'It uses words like SELECT, INSERT, UPDATE, DELETE, JOIN, or GROUP BY.'],
      ['มักอ้าง table, column และเงื่อนไขข้อมูล', 'It usually refers to tables, columns, and data conditions.'],
    ]),
    falseFriends: ['json', 'php', 'bash'],
    beginnerChecklist: list([
      ['มองหาคำว่า SELECT ก่อน', 'Look for SELECT first.'],
      ['ถามว่าโค้ดนี้กำลังดึง/แก้ข้อมูลในตารางหรือไม่', 'Ask whether it is reading or editing table data.'],
      ['ถ้าอ่านเหมือนคำสั่งถามข้อมูล มักเป็น SQL', 'If it reads like a data query, it is often SQL.'],
    ]),
    miniSnippetNotes: list([
      ['SELECT name FROM users WHERE active = true;', 'SELECT name FROM users WHERE active = true;'],
      ['GROUP BY day ORDER BY score DESC', 'GROUP BY day ORDER BY score DESC'],
    ]),
    signature: ['SELECT', 'FROM', 'JOIN', 'GROUP BY'],
    debugFocus: {
      th: ['เช็ก alias และชื่อ column', 'ดูเงื่อนไข join', 'ระวัง comma กับ aggregate ใน GROUP BY'],
      en: ['Check aliases and column names', 'Inspect join conditions', 'Watch commas and aggregates in GROUP BY'],
    },
  },
  php: {
    track: 'core',
    label: t('PHP', 'PHP'),
    family: 'backend',
    difficultyHint: t('ดูตัวแปรที่ขึ้นต้นด้วย $', 'Look for variables that start with $'),
    plainSummary: t(
      'PHP เป็นภาษา server-side ที่เด่นมากจากตัวแปรแบบ $name และ function/class ที่ใช้ในโลกเว็บฝั่งเซิร์ฟเวอร์',
      'PHP is a server-side language that stands out through $name variables and web-backend style functions and classes.',
    ),
    metaphor: t('เหมือนภาษาที่ติดป้าย $ ไว้หน้าตัวแปรทุกตัว', 'It feels like a language that puts a $ label in front of every variable.'),
    quickSpot: t('$variable + public function + ->', '$variable + public function + ->'),
    spottingRules: list([
      ['ตัวแปรแทบทุกตัวขึ้นต้นด้วย $', 'Almost every variable starts with $.'],
      ['method และ property มักเข้าถึงด้วย ->', 'Methods and properties are often accessed with ->.'],
      ['มักเห็น $_GET, $_POST, array_map, echo หรือ match', 'You often see $_GET, $_POST, array_map, echo, or match.'],
    ]),
    falseFriends: ['sql', 'python', 'typescript'],
    beginnerChecklist: list([
      ['มองหา $ ให้ไว', 'Look for $ first.'],
      ['ถ้าเห็น $_GET หรือ $_POST ยิ่งชัด', '$_GET or $_POST makes it even clearer.'],
      ['ดูว่าโค้ดคล้ายงานเว็บฝั่งเซิร์ฟเวอร์หรือไม่', 'Check whether it feels like server-side web code.'],
    ]),
    miniSnippetNotes: list([
      ['$mode = $_GET["mode"] ?? "easy";', '$mode = $_GET["mode"] ?? "easy";'],
      ['$pdo->prepare("UPDATE users ...")', '$pdo->prepare("UPDATE users ...")'],
    ]),
    signature: ['$variable', 'echo', 'public function', 'array syntax'],
    debugFocus: {
      th: ['เช็ก $ หน้าตัวแปร', 'ดู array access และ string concat', 'ระวังชนิดคืนค่าและ syntax ของ function'],
      en: ['Check $ prefixes on variables', 'Inspect array access and string concatenation', 'Watch return types and function syntax'],
    },
  },
  rust: {
    track: 'core',
    label: t('Rust', 'Rust'),
    family: 'system',
    difficultyHint: t('ดู fn, let, match และ Result', 'Look for fn, let, match, and Result'),
    plainSummary: t(
      'Rust เป็นภาษาระดับค่อนข้างต่ำที่จริงจังกับความปลอดภัยและชนิดข้อมูล จึงมักมี Result, Option, match และสัญลักษณ์ ?',
      'Rust is a lower-level language that takes safety and types seriously, so you often see Result, Option, match, and the ? operator.',
    ),
    metaphor: t('เหมือนภาษาที่เช็กความเรียบร้อยก่อนออกจากบ้านทุกครั้ง', 'It feels like a language that checks everything before leaving the house.'),
    quickSpot: t('fn + let + match + Result', 'fn + let + match + Result'),
    spottingRules: list([
      ['ขึ้นต้น function ด้วย fn', 'Functions begin with fn.'],
      ['มี let, match, impl, trait, Ok(...) และ Err(...) บ่อย', 'It often uses let, match, impl, trait, Ok(...), and Err(...).'],
      ['generic parse แบบ parse::<u32>() เป็นกลิ่นเฉพาะ', 'Generic parsing like parse::<u32>() is a distinctive clue.'],
    ]),
    falseFriends: ['cpp', 'typescript', 'csharp'],
    beginnerChecklist: list([
      ['มองคำว่า fn ก่อน', 'Look for fn first.'],
      ['ถ้าเห็น Result หรือ Option ให้คิดถึง Rust มาก', 'If Result or Option appears, strongly consider Rust.'],
      ['ดูว่ามี match และ ? operator หรือไม่', 'Check for match and the ? operator.'],
    ]),
    miniSnippetNotes: list([
      ['fn load_score(path: &str) -> Result<u32, ...>', 'fn load_score(path: &str) -> Result<u32, ...>'],
      ['items.iter().filter(...).collect()', 'items.iter().filter(...).collect()'],
    ]),
    signature: ['fn', 'let', 'match', 'impl'],
    debugFocus: {
      th: ['เช็ก borrowing และ reference', 'ดู pattern ใน match', 'ระวังชนิดข้อมูลและ ownership flow'],
      en: ['Inspect borrowing and references', 'Review patterns inside match', 'Watch types and ownership flow'],
    },
  },
}

const gameLanguageGuides: Record<ExistingGameLanguageId, LanguageGuide> = {
  'roblox-lua': {
    track: 'game-dev',
    label: t('Roblox Lua', 'Roblox Lua'),
    family: 'gameplay',
    difficultyHint: t('มองคำของ Roblox เช่น game, workspace, Players', 'Look for Roblox words like game, workspace, and Players'),
    plainSummary: t(
      'Lua แบบนี้ไม่ได้บอกแค่ว่าเป็น Lua แต่บอกชัดว่าอยู่ในโลก Roblox ผ่าน object tree และ service ของแพลตฟอร์ม',
      'This is not just Lua. It clearly belongs to the Roblox world through platform services and object-tree vocabulary.',
    ),
    metaphor: t('เหมือน Lua ที่ยืนอยู่กลางแผนที่ของ Roblox', 'It feels like Lua standing inside a Roblox map.'),
    quickSpot: t('game:GetService / workspace / Instance.new', 'game:GetService / workspace / Instance.new'),
    spottingRules: list([
      ['มักเห็น game:GetService(...) และ workspace', 'You often see game:GetService(...) and workspace.'],
      ['object ของเกมเข้าถึงด้วย path อย่าง script.Parent หรือ player.Character', 'Game objects are accessed by paths like script.Parent or player.Character.'],
      ['event ชอบต่อด้วย :Connect(function(...)', 'Events often use :Connect(function(...).'],
    ]),
    falseFriends: ['love2d-lua', 'godot-gdscript', 'gamemaker-gml'],
    beginnerChecklist: list([
      ['ถ้าเห็น game. หรือ workspace ให้เริ่มจาก Roblox', 'If you see game. or workspace, start with Roblox.'],
      ['มองหา Players, Humanoid, RemoteEvent', 'Look for Players, Humanoid, or RemoteEvent.'],
      ['Lua อย่างเดียวไม่พอ ต้องมีกลิ่น engine ด้วย', 'Lua syntax alone is not enough; the engine smell matters too.'],
    ]),
    miniSnippetNotes: list([
      ['game.Players.PlayerAdded:Connect(...)', 'game.Players.PlayerAdded:Connect(...)'],
      ['local part = Instance.new("Part")', 'local part = Instance.new("Part")'],
    ]),
    signature: ['game:GetService', 'workspace', 'Instance.new', ':Connect(function'],
    debugFocus: {
      th: ['เช็ก path ของ object tree', 'ดู service ที่เรียกใช้', 'ระวัง client/server event คนละฝั่ง'],
      en: ['Inspect object-tree paths', 'Check which service is being used', 'Watch client/server event boundaries'],
    },
  },
  'love2d-lua': {
    track: 'game-dev',
    label: t('Love2D Lua', 'Love2D Lua'),
    family: 'gameplay',
    difficultyHint: t('มอง prefix love. ให้ไว', 'Look for the love. prefix quickly'),
    plainSummary: t(
      'นี่คือ Lua ในโลก Love2D ซึ่งชอบมากับ callback อย่าง love.load, love.update, love.draw และ API วาดภาพ',
      'This is Lua in the Love2D world, usually built around callbacks like love.load, love.update, love.draw, and drawing APIs.',
    ),
    metaphor: t('เหมือน Lua ที่มีโต๊ะวาดรูปและ game loop ติดตัวมา', 'It feels like Lua carrying a drawing desk and a game loop.'),
    quickSpot: t('love.load / love.update / love.draw', 'love.load / love.update / love.draw'),
    spottingRules: list([
      ['callback หลักมักขึ้นต้นด้วย love.', 'The main callbacks usually start with love..'],
      ['มักเห็น love.graphics, love.keyboard, love.audio', 'You often see love.graphics, love.keyboard, or love.audio.'],
      ['ใช้ dt ในการขยับวัตถุบ่อยมาก', 'dt is commonly used to move things over time.'],
    ]),
    falseFriends: ['roblox-lua', 'phaser-typescript', 'gamemaker-gml'],
    beginnerChecklist: list([
      ['ดูว่า event หลักขึ้นต้นด้วย love. หรือไม่', 'Check whether the main events begin with love..'],
      ['ถ้าโค้ดวนรอบการวาดและ update ชัดมาก ให้คิดถึง Love2D', 'If draw and update callbacks dominate, think of Love2D.'],
      ['อย่าสับสนกับ Lua ที่มี game: หรือ workspace', 'Do not confuse it with Lua that uses game: or workspace.'],
    ]),
    miniSnippetNotes: list([
      ['function love.draw() ... end', 'function love.draw() ... end'],
      ['love.graphics.print(score, 40, 32)', 'love.graphics.print(score, 40, 32)'],
    ]),
    signature: ['function love.load()', 'love.update(dt)', 'love.graphics', 'love.keyboard'],
    debugFocus: {
      th: ['เช็ก callback หลักของ Love2D', 'ดูว่าใช้ dt และระบบวาดภาพอย่างไร', 'ระวัง resource ที่ต้องโหลดใน love.load'],
      en: ['Inspect the main Love2D callbacks', 'Check how dt and drawing APIs are used', 'Watch resource loading inside love.load'],
    },
  },
  'godot-gdscript': {
    track: 'game-dev',
    label: t('Godot GDScript', 'Godot GDScript'),
    family: 'lifecycle',
    difficultyHint: t('ดู extends, _ready() และ path แบบ $Node', 'Look for extends, _ready(), and $Node paths'),
    plainSummary: t(
      'ภาษานี้ดูคล้าย Python แต่กลิ่น Godot แรงมากจาก extends Node, _ready(), signal, preload และการอ้าง node ใน scene tree',
      'This language can resemble Python, but the Godot smell is strong through extends Node, _ready(), signals, preload, and scene-tree paths.',
    ),
    metaphor: t('เหมือน Python ที่เข้าไปอยู่ในต้นไม้ scene ของ Godot', 'It feels like Python living inside Godot’s scene tree.'),
    quickSpot: t('extends Node + _ready() + $Path', 'extends Node + _ready() + $Path'),
    spottingRules: list([
      ['มักขึ้นต้นด้วย extends Node หรือ Node2D', 'It often begins with extends Node or Node2D.'],
      ['มี callback อย่าง _ready(), _process(delta), _physics_process(delta)', 'Callbacks like _ready(), _process(delta), or _physics_process(delta) are common.'],
      ['มักมี $Path, signal, preload, queue_free()', 'You often see $Path, signal, preload, or queue_free().'],
    ]),
    falseFriends: ['roblox-lua', 'unity-csharp', 'gamemaker-gml'],
    beginnerChecklist: list([
      ['ถามว่ามันดูเหมือน Python ที่มีคำเฉพาะของ engine หรือไม่', 'Ask whether it looks like Python with engine-specific words.'],
      ['ถ้าเห็น _ready หรือ extends Node ให้เริ่มจาก Godot', 'If you see _ready or extends Node, start with Godot.'],
      ['มองหา scene tree path แบบ $CanvasLayer/Label', 'Look for scene-tree paths like $CanvasLayer/Label.'],
    ]),
    miniSnippetNotes: list([
      ['extends CharacterBody2D', 'extends CharacterBody2D'],
      ['@onready var label = $CanvasLayer/Label', '@onready var label = $CanvasLayer/Label'],
    ]),
    signature: ['extends Node', '_ready()', '$Path', 'preload'],
    debugFocus: {
      th: ['เช็ก callback ของ scene lifecycle', 'ดู node path และ signal connection', 'ระวังความต่างระหว่าง _process กับ _physics_process'],
      en: ['Inspect scene lifecycle callbacks', 'Check node paths and signal connections', 'Watch the difference between _process and _physics_process'],
    },
  },
  'godot-shader': {
    track: 'game-dev',
    label: t('Godot Shader', 'Godot Shader'),
    family: 'shader',
    difficultyHint: t('มอง shader_type, COLOR, UV, TEXTURE', 'Look for shader_type, COLOR, UV, and TEXTURE'),
    plainSummary: t(
      'shader นี้เป็นของ Godot โดยเฉพาะ แม้จะคล้าย GLSL แต่จะมีคำอย่าง shader_type, COLOR, TEXTURE, ALBEDO และระบบของ Godot เอง',
      'This shader belongs specifically to Godot. It may resemble GLSL, but it uses words like shader_type, COLOR, TEXTURE, ALBEDO, and Godot-specific conventions.',
    ),
    metaphor: t('เหมือน GLSL ที่ใส่ป้าย Godot ติดไว้ชัด ๆ', 'It feels like GLSL wearing a clear Godot badge.'),
    quickSpot: t('shader_type + COLOR/TEXTURE/UV', 'shader_type + COLOR/TEXTURE/UV'),
    spottingRules: list([
      ['บรรทัดแรกมักเป็น shader_type canvas_item; หรือ shader_type spatial;', 'The first line is often shader_type canvas_item; or shader_type spatial;.'],
      ['ใช้ COLOR, UV, TEXTURE, TIME แบบตัวใหญ่', 'It uses uppercase built-ins like COLOR, UV, TEXTURE, or TIME.'],
      ['function ชื่อ fragment() หรือ vertex() แบบ Godot style', 'Functions like fragment() or vertex() follow Godot style.'],
    ]),
    falseFriends: ['glsl', 'unity-shaderlab', 'godot-gdscript'],
    beginnerChecklist: list([
      ['ถามว่าเป็น shader หรือ script ปกติ', 'First ask whether this is a shader or a regular script.'],
      ['ถ้าเห็น shader_type ให้คิดถึง Godot Shader ทันที', 'If shader_type appears, think of Godot Shader immediately.'],
      ['อย่าสับสนกับ GLSL ที่มี #version', 'Do not confuse it with GLSL that starts with #version.'],
    ]),
    miniSnippetNotes: list([
      ['shader_type canvas_item;', 'shader_type canvas_item;'],
      ['COLOR = texture(TEXTURE, UV);', 'COLOR = texture(TEXTURE, UV);'],
    ]),
    signature: ['shader_type', 'COLOR', 'TEXTURE', 'UV'],
    debugFocus: {
      th: ['เช็กว่าเป็น canvas_item หรือ spatial', 'ดู built-in อย่าง COLOR/ALBEDO/UV', 'ระวัง syntax ระหว่าง Godot shader กับ GLSL แท้'],
      en: ['Check whether it is canvas_item or spatial', 'Inspect built-ins like COLOR/ALBEDO/UV', 'Watch syntax differences between Godot shader and raw GLSL'],
    },
  },
  'unity-csharp': {
    track: 'game-dev',
    label: t('Unity C#', 'Unity C#'),
    family: 'lifecycle',
    difficultyHint: t('มอง MonoBehaviour, Start(), Update()', 'Look for MonoBehaviour, Start(), and Update()'),
    plainSummary: t(
      'นี่คือ C# ที่อยู่ในโลก Unity ซึ่งมีกลิ่นของ component, GameObject, transform, Input และ lifecycle ของ engine ชัดมาก',
      'This is C# inside the Unity world, with strong component, GameObject, transform, Input, and engine-lifecycle clues.',
    ),
    metaphor: t('เหมือน C# ที่ถูกสวมชุดของ Unity ทั้งตัว', 'It feels like C# fully dressed in Unity gear.'),
    quickSpot: t('MonoBehaviour + Start/Update + transform', 'MonoBehaviour + Start/Update + transform'),
    spottingRules: list([
      ['class มักสืบทอดจาก MonoBehaviour', 'Classes often inherit from MonoBehaviour.'],
      ['มี Start(), Update(), Awake() หรือ FixedUpdate()', 'Methods like Start(), Update(), Awake(), or FixedUpdate() are common.'],
      ['มักมี transform, GetComponent, SerializeField, Instantiate', 'You often see transform, GetComponent, SerializeField, or Instantiate.'],
    ]),
    falseFriends: ['unreal-cpp', 'phaser-typescript', 'godot-gdscript'],
    beginnerChecklist: list([
      ['ดูคำว่า MonoBehaviour ก่อน', 'Look for MonoBehaviour first.'],
      ['ถ้าเห็น transform หรือ GetComponent ให้คะแนน Unity สูง', 'If transform or GetComponent appears, heavily favor Unity.'],
      ['อย่าเดาแค่เพราะเป็น C# ต้องดู engine clue ด้วย', 'Do not guess just because it is C#; the engine clue matters.'],
    ]),
    miniSnippetNotes: list([
      ['public class PlayerMover : MonoBehaviour', 'public class PlayerMover : MonoBehaviour'],
      ['transform.Translate(Vector3.right * Time.deltaTime);', 'transform.Translate(Vector3.right * Time.deltaTime);'],
    ]),
    signature: ['MonoBehaviour', 'Start()', 'Update()', 'GetComponent'],
    debugFocus: {
      th: ['เช็ก lifecycle method ของ Unity', 'ดู component reference และ serialized field', 'ระวังความต่างระหว่าง Update กับ FixedUpdate'],
      en: ['Inspect Unity lifecycle methods', 'Check component references and serialized fields', 'Watch the difference between Update and FixedUpdate'],
    },
  },
  'unity-shaderlab': {
    track: 'game-dev',
    label: t('Unity ShaderLab / HLSL', 'Unity ShaderLab / HLSL'),
    family: 'shader',
    difficultyHint: t('ดู Shader "...", Properties, SubShader, Pass', 'Look for Shader "...", Properties, SubShader, and Pass'),
    plainSummary: t(
      'shader แบบนี้เป็นของ Unity โดยเฉพาะ เพราะไม่ได้มีแค่โค้ด shader แต่มีกรอบ ShaderLab ครอบอยู่ เช่น Properties, SubShader และ Pass',
      'This shader belongs specifically to Unity because it is not just shader code. It is wrapped in ShaderLab sections like Properties, SubShader, and Pass.',
    ),
    metaphor: t('เหมือน HLSL ที่ถูกใส่ลงในแบบฟอร์มของ Unity', 'It feels like HLSL placed inside a Unity form.'),
    quickSpot: t('Shader "..." + Properties + Pass', 'Shader "..." + Properties + Pass'),
    spottingRules: list([
      ['มักขึ้นต้นด้วย Shader "Name"', 'It often starts with Shader "Name".'],
      ['มี Properties, SubShader, Tags, Pass', 'It uses Properties, SubShader, Tags, and Pass.'],
      ['ด้านในอาจมี CGPROGRAM หรือ HLSLPROGRAM', 'Inside, you may see CGPROGRAM or HLSLPROGRAM.'],
    ]),
    falseFriends: ['glsl', 'godot-shader', 'unity-csharp'],
    beginnerChecklist: list([
      ['ถามว่าเป็น shader ที่มีกรอบ config ครอบอยู่ไหม', 'Ask whether the shader is wrapped in a configuration shell.'],
      ['ถ้าเห็น Shader "Custom/..." เกือบชัดแล้ว', 'If you see Shader "Custom/...", it is almost certain.'],
      ['อย่าสับสนกับ GLSL ที่มักเริ่มด้วย #version', 'Do not confuse it with GLSL, which often begins with #version.'],
    ]),
    miniSnippetNotes: list([
      ['Shader "Custom/Tint" { ... }', 'Shader "Custom/Tint" { ... }'],
      ['CGPROGRAM ... ENDCG', 'CGPROGRAM ... ENDCG'],
    ]),
    signature: ['Shader "..."', 'Properties', 'SubShader', 'CGPROGRAM'],
    debugFocus: {
      th: ['เช็กกรอบ ShaderLab ก่อนดู HLSL ข้างใน', 'ดู Tags/Pass/Blend/Stencils', 'ระวัง syntax ของ Unity helper macro'],
      en: ['Inspect the ShaderLab wrapper before the HLSL core', 'Check Tags/Pass/Blend/Stencils', 'Watch Unity helper macro syntax'],
    },
  },
  'unreal-cpp': {
    track: 'game-dev',
    label: t('Unreal C++', 'Unreal C++'),
    family: 'lifecycle',
    difficultyHint: t('ดู UCLASS, UPROPERTY, GENERATED_BODY', 'Look for UCLASS, UPROPERTY, and GENERATED_BODY'),
    plainSummary: t(
      'นี่คือ C++ ที่มีระบบ reflection และ macro ของ Unreal คลุมอยู่ ทำให้มีกลิ่น engine ชัดต่างจาก C++ ทั่วไป',
      'This is C++ wrapped in Unreal reflection and macros, which gives it a strong engine smell distinct from plain C++.',
    ),
    metaphor: t('เหมือน C++ ที่ถูกประทับตรา Unreal เต็มหน้าไฟล์', 'It feels like C++ with Unreal stamps all over the file.'),
    quickSpot: t('UCLASS / UPROPERTY / GENERATED_BODY', 'UCLASS / UPROPERTY / GENERATED_BODY'),
    spottingRules: list([
      ['macro ของ Unreal เด่นมาก เช่น UCLASS(), UPROPERTY(), UFUNCTION()', 'Unreal macros stand out strongly, such as UCLASS(), UPROPERTY(), and UFUNCTION().'],
      ['class gameplay มักขึ้นต้นด้วย A หรือ U เช่น AActor, UStaticMeshComponent', 'Gameplay classes often start with A or U, such as AActor or UStaticMeshComponent.'],
      ['มี BeginPlay(), Tick(float DeltaTime), UE_LOG, CreateDefaultSubobject', 'It often uses BeginPlay(), Tick(float DeltaTime), UE_LOG, or CreateDefaultSubobject.'],
    ]),
    falseFriends: ['unity-csharp', 'cpp', 'glsl'],
    beginnerChecklist: list([
      ['ดู macro ของ Unreal ก่อน', 'Look for Unreal macros first.'],
      ['ถ้าเห็น GENERATED_BODY ให้คิดถึง Unreal ทันที', 'If GENERATED_BODY appears, think of Unreal immediately.'],
      ['อย่าเดาเป็น C++ ทั่วไปถ้ามี UPROPERTY หรือ UE_LOG', 'Do not treat it as plain C++ if UPROPERTY or UE_LOG appears.'],
    ]),
    miniSnippetNotes: list([
      ['UCLASS() class AQuizDoor : public AActor', 'UCLASS() class AQuizDoor : public AActor'],
      ['UPROPERTY(EditAnywhere) float MoveSpeed = 250.f;', 'UPROPERTY(EditAnywhere) float MoveSpeed = 250.f;'],
    ]),
    signature: ['UCLASS', 'UPROPERTY', 'GENERATED_BODY', 'BeginPlay'],
    debugFocus: {
      th: ['เช็ก macro ของ reflection system', 'ดู component setup และ constructor', 'ระวัง lifecycle อย่าง BeginPlay กับ Tick'],
      en: ['Inspect reflection macros', 'Check component setup and constructors', 'Watch lifecycle methods like BeginPlay and Tick'],
    },
  },
  glsl: {
    track: 'game-dev',
    label: t('GLSL', 'GLSL'),
    family: 'shader',
    difficultyHint: t('มอง #version, vec, in/out, gl_Position', 'Look for #version, vec, in/out, and gl_Position'),
    plainSummary: t(
      'GLSL คือภาษาสำหรับ shader แบบค่อนข้างดิบ มักมี #version, vec2/vec3/vec4, in/out และ gl_Position หรือ FragColor',
      'GLSL is a more direct shader language, often using #version, vec2/vec3/vec4, in/out, and gl_Position or FragColor.',
    ),
    metaphor: t('เหมือนห้องเครื่องของการวาดภาพที่คุยกับการ์ดจอโดยตรง', 'It feels like the machine room that talks directly to the graphics card.'),
    quickSpot: t('#version + vec4 + gl_Position/FragColor', '#version + vec4 + gl_Position/FragColor'),
    spottingRules: list([
      ['มักเริ่มด้วย #version', 'It often begins with #version.'],
      ['ใช้ vec2, vec3, vec4, mat4, sampler2D', 'It uses vec2, vec3, vec4, mat4, or sampler2D.'],
      ['มี in/out, layout(location = ...), gl_Position หรือ FragColor', 'You may see in/out, layout(location = ...), gl_Position, or FragColor.'],
    ]),
    falseFriends: ['godot-shader', 'unity-shaderlab', 'unreal-cpp'],
    beginnerChecklist: list([
      ['ถามว่าเป็น shader ล้วนหรือไม่', 'Ask whether it is pure shader code.'],
      ['ถ้าเริ่มด้วย #version ให้คิดถึง GLSL ก่อน', 'If it starts with #version, think of GLSL first.'],
      ['อย่าสับสนกับ Unity ShaderLab ที่มีกรอบ Properties/SubShader', 'Do not confuse it with Unity ShaderLab, which has Properties/SubShader wrappers.'],
    ]),
    miniSnippetNotes: list([
      ['#version 330 core', '#version 330 core'],
      ['gl_Position = projection * view * model * vec4(position, 1.0);', 'gl_Position = projection * view * model * vec4(position, 1.0);'],
    ]),
    signature: ['#version', 'vec4', 'gl_Position', 'sampler2D'],
    debugFocus: {
      th: ['เช็กว่าเป็น vertex หรือ fragment shader', 'ดู in/out และ uniform', 'ระวัง syntax ระหว่าง GLSL กับ shader dialect อื่น'],
      en: ['Check whether it is a vertex or fragment shader', 'Inspect in/out variables and uniforms', 'Watch syntax differences from other shader dialects'],
    },
  },
  'phaser-typescript': {
    track: 'game-dev',
    label: t('Phaser TypeScript', 'Phaser TypeScript'),
    family: 'gameplay',
    difficultyHint: t('มอง this.add / this.physics / extends Phaser.Scene', 'Look for this.add / this.physics / extends Phaser.Scene'),
    plainSummary: t(
      'โค้ดนี้อยู่ในโลก Phaser บน TypeScript จึงมีกลิ่น scene, loader, physics และ this.add หรือ this.scene แบบ framework เกมเว็บ',
      'This code belongs to Phaser on TypeScript, so it carries scene, loader, physics, and this.add / this.scene clues from a web game framework.',
    ),
    metaphor: t('เหมือน TypeScript ที่หันมาทำเกม 2D บนเว็บเต็มตัว', 'It feels like TypeScript fully focused on making 2D web games.'),
    quickSpot: t('extends Phaser.Scene + this.add / this.physics', 'extends Phaser.Scene + this.add / this.physics'),
    spottingRules: list([
      ['class มัก extends Phaser.Scene', 'Classes often extend Phaser.Scene.'],
      ['มี preload(), create(), update() แบบ scene lifecycle', 'It commonly uses preload(), create(), and update() as scene lifecycle methods.'],
      ['มักมี this.load, this.add, this.physics, this.anims, this.scene', 'You often see this.load, this.add, this.physics, this.anims, or this.scene.'],
    ]),
    falseFriends: ['unity-csharp', 'love2d-lua', 'gamemaker-gml'],
    beginnerChecklist: list([
      ['ดูว่ามันเป็นโลกของ Scene บนเว็บหรือไม่', 'Check whether it feels like a scene-based web game world.'],
      ['ถ้าเห็น extends Phaser.Scene ให้เริ่มจาก Phaser', 'If you see extends Phaser.Scene, start with Phaser.'],
      ['ยังคงมี type annotation แบบ TS อยู่ด้วย', 'It still carries TypeScript-style annotations.'],
    ]),
    miniSnippetNotes: list([
      ['export class PlayScene extends Phaser.Scene', 'export class PlayScene extends Phaser.Scene'],
      ['this.physics.add.sprite(100, 120, "player")', 'this.physics.add.sprite(100, 120, "player")'],
    ]),
    signature: ['Phaser.Scene', 'preload/create/update', 'this.physics', 'this.add'],
    debugFocus: {
      th: ['เช็ก scene lifecycle ของ Phaser', 'ดู asset loading กับ physics object', 'ระวัง event/input ที่ผูกกับ scene'],
      en: ['Inspect Phaser scene lifecycle', 'Check asset loading and physics objects', 'Watch input/event wiring on the scene'],
    },
  },
  'rpg-maker-js': {
    track: 'game-dev',
    label: t('RPG Maker JS', 'RPG Maker JS'),
    family: 'lifecycle',
    difficultyHint: t('ดู $game*, Scene_, Window_ และ PluginManager', 'Look for $game*, Scene_, Window_, and PluginManager'),
    plainSummary: t(
      'โค้ดนี้คือ JavaScript ที่ถูกสวมระบบของ RPG Maker ไว้ เช่น $gameParty, $gameSwitches, Scene_Map, Window_* และ PluginManager',
      'This is JavaScript wrapped in RPG Maker engine systems like $gameParty, $gameSwitches, Scene_Map, Window_* classes, and PluginManager.',
    ),
    metaphor: t(
      'เหมือน JavaScript ที่เสียบเข้ากับระบบฉาก เมนู และ event ของเกม JRPG สำเร็จรูป',
      'It feels like JavaScript plugged into the scene, menu, and event system of a ready-made JRPG engine.',
    ),
    quickSpot: t('$gameParty + Scene_ + PluginManager', '$gameParty + Scene_ + PluginManager'),
    spottingRules: list([
      ['มักมีตัวแปร global แบบ $gameParty, $gameMap, $gameSwitches หรือ $gameMessage', 'It often uses globals such as $gameParty, $gameMap, $gameSwitches, or $gameMessage.'],
      ['ชื่อคลาสและ scene มักขึ้นต้นด้วย Scene_, Window_, Game_ หรือ Sprite_', 'Class and scene names often start with Scene_, Window_, Game_, or Sprite_.'],
      ['ปลั๊กอินมักแตะ PluginManager, SceneManager, AudioManager, DataManager หรือ ImageManager', 'Plugins often touch PluginManager, SceneManager, AudioManager, DataManager, or ImageManager.'],
    ]),
    falseFriends: ['phaser-typescript', 'gamemaker-gml', 'typescript'],
    beginnerChecklist: list([
      ['ก่อนอื่นดูว่ามันเป็น JavaScript ที่มีคำแปลกแบบ $gameSomething ไหม', 'First check whether it is JavaScript with strange globals like $gameSomething.'],
      ['ถ้าเห็น Scene_Map, Scene_Item หรือ Window_MenuCommand ให้คิดถึง RPG Maker ก่อน', 'If you see Scene_Map, Scene_Item, or Window_MenuCommand, think of RPG Maker first.'],
      ['ถ้ามี PluginManager หรือ DataManager คุม flow ของเกมอยู่ กลิ่นนี้ชัดมาก', 'If PluginManager or DataManager is controlling game flow, the engine smell is strong.'],
    ]),
    miniSnippetNotes: list([
      ['const params = PluginManager.parameters("QuestHud");', 'const params = PluginManager.parameters("QuestHud");'],
      ['$gameMessage.add("Welcome to town.");', '$gameMessage.add("Welcome to town.");'],
    ]),
    signature: ['$gameParty', 'Scene_Map', 'PluginManager.parameters', 'Window_MenuCommand'],
    debugFocus: {
      th: ['เช็กว่ากำลัง override prototype หรือ register command จุดไหน', 'ดูว่ากำลังแตะ scene/window ไหนของ engine', 'ระวัง state ที่เก็บอยู่ใน $game* และ DataManager'],
      en: ['Check which prototype override or registered command is being used', 'Inspect which engine scene/window is being touched', 'Watch state stored in $game* globals and DataManager'],
    },
  },
  'gamemaker-gml': {
    track: 'game-dev',
    label: t('GameMaker GML', 'GameMaker GML'),
    family: 'gameplay',
    difficultyHint: t('ดู x/y, instance_create_layer, room_speed, alarm[]', 'Look for x/y, instance_create_layer, room_speed, and alarm[]'),
    plainSummary: t(
      'GML ของ GameMaker ชอบ syntax ที่อ่านง่ายแต่มีคำเฉพาะของ engine เช่น instance_create_layer, room_speed, sprite_index, alarm และ object event',
      'GameMaker GML uses simple-looking syntax with strong engine-specific words such as instance_create_layer, room_speed, sprite_index, alarm, and object events.',
    ),
    metaphor: t('เหมือนภาษาทำเกมที่คุยกับ object ในห้องเกมโดยตรง', 'It feels like a game language talking directly to objects inside a room.'),
    quickSpot: t('x/y + instance_create_layer + room_speed', 'x/y + instance_create_layer + room_speed'),
    spottingRules: list([
      ['มักเห็นตัวแปร x, y, hspeed, vspeed, image_index', 'You often see variables like x, y, hspeed, vspeed, or image_index.'],
      ['มีคำอย่าง instance_create_layer, room_speed, sprite_index, show_debug_message', 'Words like instance_create_layer, room_speed, sprite_index, or show_debug_message are common.'],
      ['array style อย่าง alarm[0] ก็เจอบ่อย', 'Array-style engine values like alarm[0] appear often.'],
    ]),
    falseFriends: ['roblox-lua', 'love2d-lua', 'godot-gdscript'],
    beginnerChecklist: list([
      ['ดูว่าตัวแปรตำแหน่ง x/y ถูกใช้แบบ object game ตรง ๆ ไหม', 'Check whether x/y are used as direct game-object coordinates.'],
      ['ถ้าเห็น room_speed หรือ instance_create_layer ให้คิดถึง GameMaker', 'If room_speed or instance_create_layer appears, think of GameMaker.'],
      ['อย่าสับสนกับ Lua แม้ syntax จะดูง่ายคล้ายกัน', 'Do not confuse it with Lua even if the syntax looks similarly simple.'],
    ]),
    miniSnippetNotes: list([
      ['instance_create_layer(x, y, "Bullets", obj_bullet);', 'instance_create_layer(x, y, "Bullets", obj_bullet);'],
      ['alarm[0] = room_speed * 2;', 'alarm[0] = room_speed * 2;'],
    ]),
    signature: ['instance_create_layer', 'room_speed', 'sprite_index', 'alarm[0]'],
    debugFocus: {
      th: ['เช็ก object variable อย่าง x/y/hspeed', 'ดู event-driven flow ของ room และ object', 'ระวัง resource/object name ของ GameMaker'],
      en: ['Inspect object variables like x/y/hspeed', 'Check room/object event-driven flow', 'Watch GameMaker resource and object names'],
    },
  },
}

export const languageGuides: Record<LanguageId, LanguageGuide> = {
  ...coreLanguageGuides,
  ...coreLanguageGuideExtensions,
  ...gameLanguageGuides,
  ...gameLanguageGuideExtensions,
}

export const guideBookEntries = languageGuides

export const guideEntriesByTrack: Record<QuizTrackId, LanguageGuide[]> = {
  core: trackTopicIds.core.map((id) => languageGuides[id]),
  'game-dev': trackTopicIds['game-dev'].map((id) => languageGuides[id]),
}
