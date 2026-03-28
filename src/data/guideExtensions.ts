import type { GuideFamilyId, LanguageId, LocalizedText, QuizTrackId } from './quizModels'

type LanguageGuide = {
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

type AddedCoreLanguageId = 'javascript' | 'go' | 'kotlin' | 'swift' | 'ruby'
type AddedGameLanguageId = 'defold-lua' | 'cocos-typescript' | 'bevy-rust' | 'renpy-python'

const t = (th: string, en: string): LocalizedText => ({ th, en })
const list = (items: Array<[string, string]>) => items.map(([th, en]) => t(th, en))
const coreGuide = (guide: Omit<LanguageGuide, 'track'>): LanguageGuide => ({ track: 'core', ...guide })
const gameGuide = (guide: Omit<LanguageGuide, 'track'>): LanguageGuide => ({ track: 'game-dev', ...guide })

export const coreLanguageGuideExtensions: Record<AddedCoreLanguageId, LanguageGuide> = {
  javascript: coreGuide({
    label: t('JavaScript', 'JavaScript'),
    family: 'web',
    difficultyHint: t('มอง const/let, => และ console.log ให้ไว', 'Look for const/let, =>, and console.log'),
    plainSummary: t(
      'ภาษานี้อยู่กลางโลกเว็บอย่างชัดเจน มักมี const, let, arrow function, object literal และ API ฝั่ง browser หรือ runtime ที่ดูไม่เป็นทางการเท่า Java',
      'This language sits squarely in the web world, often using const, let, arrow functions, object literals, and browser or runtime APIs with a looser feel than Java.',
    ),
    metaphor: t('เหมือนภาษาที่คุยเร็ว ปรับตัวไว และชอบทำงานกับหน้าเว็บโดยตรง', 'It feels like a fast-talking language that lives close to the browser.'),
    quickSpot: t('const + => + console.log', 'const + => + console.log'),
    spottingRules: list([
      ['มักมี const หรือ let แทนการประกาศ type แบบจริงจัง', 'It often uses const or let instead of heavy type declarations.'],
      ['arrow function แบบ => โผล่บ่อยมาก', 'Arrow functions with => show up constantly.'],
      ['ถ้ามี console.log, fetch, document หรือ setTimeout ให้คิดถึงโลกนี้ก่อน', 'If you see console.log, fetch, document, or setTimeout, think of this world first.'],
    ]),
    falseFriends: ['typescript', 'jsx', 'json'],
    beginnerChecklist: list([
      ['ดูว่ามี type annotation ชัด ๆ หรือไม่ ถ้าไม่มีอาจเป็น JavaScript', 'Check whether explicit type annotations are missing; if so, it may be JavaScript.'],
      ['มองหา object literal และ array method อย่าง map/filter', 'Look for object literals and array methods like map/filter.'],
      ['ถ้า syntax คล้าย TypeScript แต่ไม่มี : type หรือ interface ให้เริ่มจาก JavaScript', 'If it looks like TypeScript without : type or interface, start with JavaScript.'],
    ]),
    miniSnippetNotes: list([
      ['const total = items.reduce((sum, item) => sum + item.price, 0)', 'const total = items.reduce((sum, item) => sum + item.price, 0)'],
      ['setTimeout(() => console.log("ready"), 300)', 'setTimeout(() => console.log("ready"), 300)'],
    ]),
    signature: ['const', '=>', 'console.log', 'object literal'],
    debugFocus: {
      th: ['เช็ก scope ของ const/let', 'ดู async flow ของ promise หรือ callback', 'ระวัง undefined จาก property access'],
      en: ['Check const/let scoping', 'Inspect async flow around promises or callbacks', 'Watch for undefined from property access'],
    },
  }),
  go: coreGuide({
    label: t('Go', 'Go'),
    family: 'backend',
    difficultyHint: t('มอง package, func, := และ err != nil', 'Look for package, func, :=, and err != nil'),
    plainSummary: t(
      'Go ชอบความตรงไปตรงมา มี package, func, การประกาศตัวแปรแบบ := และ pattern จัดการ error ที่เห็นซ้ำบ่อยมาก',
      'Go favors direct structure with package, func, short variable declarations using :=, and a very repeated error-handling pattern.',
    ),
    metaphor: t('เหมือนภาษางานระบบที่พูดสั้น ชัด และเดินเป็นเส้นตรง', 'It feels like a practical systems language that speaks in short, straight lines.'),
    quickSpot: t('package main + func + :=', 'package main + func + :='),
    spottingRules: list([
      ['ไฟล์มักเริ่มด้วย package และตามด้วย import', 'Files often start with package and then import.'],
      ['function ใช้คำว่า func ไม่ใช่ def หรือ function', 'Functions use func, not def or function.'],
      ['pattern if err != nil เป็น marker ที่แรงมาก', 'The if err != nil pattern is a very strong clue.'],
    ]),
    falseFriends: ['java', 'rust', 'cpp'],
    beginnerChecklist: list([
      ['มองหา := ก่อนเลย', 'Look for := first.'],
      ['ถ้ามี defer, make, chan หรือ go keyword ยิ่งชัด', 'defer, make, chan, or the go keyword make it even clearer.'],
      ['ถ้าโค้ดดูเรียบมากแต่ยังมี type ชัด ให้คิดถึง Go', 'If the code looks plain but still typed, consider Go.'],
    ]),
    miniSnippetNotes: list([
      ['func main() { fmt.Println("hello") }', 'func main() { fmt.Println("hello") }'],
      ['if err != nil { return err }', 'if err != nil { return err }'],
    ]),
    signature: ['package', 'func', ':=', 'err != nil'],
    debugFocus: {
      th: ['เช็กการคืนค่า error', 'ดู pointer กับ receiver ว่าเป็นค่าไหน', 'ระวัง goroutine หรือ channel ที่ไม่ sync กัน'],
      en: ['Check returned errors', 'Inspect pointer vs value receivers', 'Watch goroutines or channels that do not synchronize correctly'],
    },
  }),
  kotlin: coreGuide({
    label: t('Kotlin', 'Kotlin'),
    family: 'app',
    difficultyHint: t('มอง fun, val/var, when และ null-safe syntax', 'Look for fun, val/var, when, and null-safe syntax'),
    plainSummary: t(
      'Kotlin คล้าย Java ที่อ่านลื่นขึ้น มี fun, val, data class, Elvis operator และ null-safety ที่เห็นชัดใน syntax',
      'Kotlin resembles a smoother Java with fun, val, data classes, the Elvis operator, and visible null-safety syntax.',
    ),
    metaphor: t('เหมือน Java ที่จัดโต๊ะใหม่ให้อ่านคลีนขึ้นและลดความรก', 'It feels like Java reorganized into a cleaner, calmer desk.'),
    quickSpot: t('fun + val + when + ?: ', 'fun + val + when + ?:'),
    spottingRules: list([
      ['function ใช้ fun', 'Functions use fun.'],
      ['มักใช้ val/var แทนการประกาศตัวแปรแบบ Java เดิม', 'It often uses val/var instead of old-style Java declarations.'],
      ['?:, ?. และ data class เป็น marker ที่ดีมาก', '?:, ?., and data class are very useful markers.'],
    ]),
    falseFriends: ['java', 'swift', 'dart'],
    beginnerChecklist: list([
      ['ถ้า syntax ดูคล้าย Java แต่สั้นกว่า ให้เริ่มจาก Kotlin', 'If it looks like Java but shorter, start with Kotlin.'],
      ['ดู when, companion object, หรือ extension function', 'Look for when, companion object, or extension functions.'],
      ['มอง null-safe operator อย่าง ?. และ ?: ให้ไว', 'Spot null-safe operators like ?. and ?: quickly.'],
    ]),
    miniSnippetNotes: list([
      ['data class User(val id: Int, val name: String)', 'data class User(val id: Int, val name: String)'],
      ['val label = name ?: "guest"', 'val label = name ?: "guest"'],
    ]),
    signature: ['fun', 'val', 'when', '?:'],
    debugFocus: {
      th: ['เช็ก nullable flow', 'ดู extension หรือ scope function ที่ซ้อนกัน', 'ระวัง coroutine กับ suspend boundary'],
      en: ['Check nullable control flow', 'Inspect nested extensions or scope functions', 'Watch coroutine and suspend boundaries'],
    },
  }),
  swift: coreGuide({
    label: t('Swift', 'Swift'),
    family: 'app',
    difficultyHint: t('มอง let/var, guard let, struct และ enum', 'Look for let/var, guard let, struct, and enum'),
    plainSummary: t(
      'Swift เป็นภาษาฝั่ง Apple ที่ชอบ let/var, optional, guard let, enum แบบมีพลัง และ syntax ที่ดูค่อนข้างนุ่มกว่า C-style เดิม',
      'Swift is an Apple-side language that leans on let/var, optionals, guard let, powerful enums, and a softer syntax than older C-style code.',
    ),
    metaphor: t('เหมือนภาษาที่ออกแบบมาให้ปลอดภัยแต่ยังดูหรูและลื่น', 'It feels like a language designed to be safe while still looking polished and fluid.'),
    quickSpot: t('let + guard let + print()', 'let + guard let + print()'),
    spottingRules: list([
      ['ชอบใช้ let และ var มากกว่าการประกาศ type แบบยาวทุกบรรทัด', 'It often uses let and var instead of long explicit declarations on every line.'],
      ['guard let และ optional chaining เป็น marker สำคัญ', 'guard let and optional chaining are important markers.'],
      ['struct, enum, protocol, extension โผล่บ่อยในสไตล์ของ Swift', 'struct, enum, protocol, and extension appear often in Swift-style code.'],
    ]),
    falseFriends: ['kotlin', 'dart', 'go'],
    beginnerChecklist: list([
      ['ถ้ามี guard let หรือ case let ให้คิดถึง Swift ก่อน', 'If guard let or case let appears, think of Swift first.'],
      ['มองหา import Foundation หรือ URLSession', 'Look for import Foundation or URLSession.'],
      ['optional แบบ ? และ ! มักอยู่ในสไตล์ที่ต่างจาก Kotlin', 'Optionals with ? and ! usually look different from Kotlin.'],
    ]),
    miniSnippetNotes: list([
      ['guard let url = URL(string: text) else { return }', 'guard let url = URL(string: text) else { return }'],
      ['enum LoadState { case idle, loading, failed(Error) }', 'enum LoadState { case idle, loading, failed(Error) }'],
    ]),
    signature: ['let', 'guard let', 'struct', 'enum'],
    debugFocus: {
      th: ['เช็ก optional unwrap', 'ดู async/await กับ main thread', 'ระวัง value semantics ของ struct'],
      en: ['Check optional unwrapping', 'Inspect async/await on the main thread', 'Watch struct value semantics'],
    },
  }),
  ruby: coreGuide({
    label: t('Ruby', 'Ruby'),
    family: 'backend',
    difficultyHint: t('มอง def, puts, do ... end และ symbol', 'Look for def, puts, do ... end, and symbols'),
    plainSummary: t(
      'Ruby อ่านคล้ายภาษามนุษย์ มี def, end, block แบบ do ... end, symbol และสไตล์ที่นุ่มกว่า Python หรือ PHP',
      'Ruby reads like a human-friendly script with def, end, do ... end blocks, symbols, and a softer feel than Python or PHP.',
    ),
    metaphor: t('เหมือนภาษาที่ชอบเขียนประโยคให้ลื่นมากกว่าทางการ', 'It feels like a language that prefers fluency over ceremony.'),
    quickSpot: t('def + puts + do |item|', 'def + puts + do |item|'),
    spottingRules: list([
      ['method จบด้วย end และมักมี puts สำหรับพิมพ์ข้อความ', 'Methods end with end and often use puts for output.'],
      ['block แบบ do |item| ... end เป็นภาพจำที่ดีมาก', 'Blocks like do |item| ... end are a very strong pattern.'],
      ['hash มักมี symbol key เช่น name: "Mira"', 'Hashes often use symbol keys such as name: "Mira".'],
    ]),
    falseFriends: ['python', 'php', 'bash'],
    beginnerChecklist: list([
      ['ถ้ามี end ปิด method/class บ่อย ๆ ให้คิดถึง Ruby', 'If end keeps closing methods or classes, consider Ruby.'],
      ['มองหา puts, attr_reader, initialize', 'Look for puts, attr_reader, and initialize.'],
      ['ถ้า syntax ดูอ่านเป็นภาษาคนและมี block ชัด ให้เริ่มจาก Ruby', 'If the syntax reads almost like prose with clear blocks, start with Ruby.'],
    ]),
    miniSnippetNotes: list([
      ['users.each do |user| puts user.name end', 'users.each do |user| puts user.name end'],
      ['def initialize(name:) @name = name end', 'def initialize(name:) @name = name end'],
    ]),
    signature: ['def', 'puts', 'do |item|', 'end'],
    debugFocus: {
      th: ['เช็ก nil ที่หลุดเข้ามา', 'ดู block scope กับ Enumerable chain', 'ระวัง method_missing หรือ DSL ที่ซ่อน flow'],
      en: ['Check unexpected nil values', 'Inspect block scope and Enumerable chains', 'Watch method_missing or DSL-style hidden flow'],
    },
  }),
}

export const gameLanguageGuideExtensions: Record<AddedGameLanguageId, LanguageGuide> = {
  'defold-lua': gameGuide({
    label: t('Defold Lua', 'Defold Lua'),
    family: 'lifecycle',
    difficultyHint: t('มอง go.property, msg.post, factory.create และ update(self, dt)', 'Look for go.property, msg.post, factory.create, and update(self, dt)'),
    plainSummary: t(
      'Defold ใช้ Lua แต่กลิ่น engine ชัดจาก go.*, msg.*, script lifecycle และ object/component ของ engine เอง',
      'Defold uses Lua, but the engine smell is strong through go.*, msg.*, script lifecycle hooks, and its own object/component vocabulary.',
    ),
    metaphor: t('เหมือน Lua ที่ติดกล่องข้อความและ game object ของ Defold มาด้วย', 'It feels like Lua carrying Defold messages and game objects around with it.'),
    quickSpot: t('go.property + msg.post + factory.create', 'go.property + msg.post + factory.create'),
    spottingRules: list([
      ['มักมี function init(self), update(self, dt), on_message(...)', 'It often uses function init(self), update(self, dt), and on_message(...).'],
      ['คำอย่าง go.property, go.set_position, msg.post เป็น marker ที่ดีมาก', 'go.property, go.set_position, and msg.post are excellent markers.'],
      ['factory.create และ vmath.vector3 ช่วยบอกโลกของ Defold ได้เร็ว', 'factory.create and vmath.vector3 quickly reveal the Defold world.'],
    ]),
    falseFriends: ['love2d-lua', 'roblox-lua', 'godot-gdscript'],
    beginnerChecklist: list([
      ['มองหา prefix go. และ msg. ก่อน', 'Look for the go. and msg. prefixes first.'],
      ['ถ้าเป็น Lua ที่มี self และ lifecycle ของ script ให้คิดถึง Defold', 'If it is Lua with self and script lifecycle hooks, think of Defold.'],
      ['อย่าสับสนกับ Lua ที่ใช้ game:GetService หรือ love.graphics', 'Do not confuse it with Lua using game:GetService or love.graphics.'],
    ]),
    miniSnippetNotes: list([
      ['go.property("speed", 240)', 'go.property("speed", 240)'],
      ['msg.post(".", "acquire_input_focus")', 'msg.post(".", "acquire_input_focus")'],
    ]),
    signature: ['go.property', 'msg.post', 'factory.create', 'update(self, dt)'],
    debugFocus: {
      th: ['เช็ก message id และ receiver', 'ดู self state ใน lifecycle function', 'ระวัง object position/scale ผ่าน go.* API'],
      en: ['Check message ids and receivers', 'Inspect self state inside lifecycle functions', 'Watch object position/scale through go.* APIs'],
    },
  }),
  'cocos-typescript': gameGuide({
    label: t('Cocos Creator TypeScript', 'Cocos Creator TypeScript'),
    family: 'lifecycle',
    difficultyHint: t('มอง _decorator, Component, Node, tween และ director', 'Look for _decorator, Component, Node, tween, and director'),
    plainSummary: t(
      'ภาษาฐานเป็น TypeScript แต่กลิ่น Cocos Creator ชัดจาก decorator, Component, node tree, tween และ director API',
      'The base language is TypeScript, but the Cocos Creator smell is strong through decorators, Components, node trees, tweens, and director APIs.',
    ),
    metaphor: t('เหมือน TypeScript ที่อยู่ในโลก scene node ของ Cocos', 'It feels like TypeScript living inside Cocos scene nodes.'),
    quickSpot: t('@ccclass + Component + this.node', '@ccclass + Component + this.node'),
    spottingRules: list([
      ['มัก import จาก cc และใช้ _decorator หรือ @ccclass', 'It often imports from cc and uses _decorator or @ccclass.'],
      ['class มัก extends Component', 'Classes often extend Component.'],
      ['API อย่าง tween, director, instantiate, resources.load เป็นกลิ่นของ Cocos', 'APIs like tween, director, instantiate, and resources.load smell like Cocos.'],
    ]),
    falseFriends: ['phaser-typescript', 'typescript', 'unity-csharp'],
    beginnerChecklist: list([
      ['ดูว่ามี Component กับ this.node หรือไม่', 'Check whether Component and this.node appear.'],
      ['ถ้ามี decorator ก่อน class ให้คิดถึง Cocos ก่อน Phaser', 'If decorators appear before a class, consider Cocos before Phaser.'],
      ['อย่าสับสนกับ TypeScript ทั่วไปที่ไม่มี engine API', 'Do not confuse it with plain TypeScript without engine APIs.'],
    ]),
    miniSnippetNotes: list([
      ['@ccclass("PlayerController")', '@ccclass("PlayerController")'],
      ['tween(this.node).to(0.2, { scale: new Vec3(1.1, 1.1, 1) }).start()', 'tween(this.node).to(0.2, { scale: new Vec3(1.1, 1.1, 1) }).start()'],
    ]),
    signature: ['@ccclass', 'Component', 'this.node', 'director.loadScene'],
    debugFocus: {
      th: ['เช็ก lifecycle ของ Component', 'ดู node reference และ resource loading', 'ระวัง tween/schedule ที่ยังไม่หยุด'],
      en: ['Check Component lifecycle', 'Inspect node references and resource loading', 'Watch tweens or schedules that are still running'],
    },
  }),
  'bevy-rust': gameGuide({
    label: t('Bevy Rust', 'Bevy Rust'),
    family: 'lifecycle',
    difficultyHint: t('มอง App::new, Commands, Query, Res และระบบ ECS', 'Look for App::new, Commands, Query, Res, and ECS systems'),
    plainSummary: t(
      'นี่คือ Rust ที่เข้าโลก ECS ของ Bevy ผ่าน App builder, systems, Commands, Query และ component data มากกว่าคลาสหรือ object แบบ engine อื่น',
      'This is Rust inside Bevy’s ECS world, centered on App builders, systems, Commands, Query, and component data rather than classic engine objects.',
    ),
    metaphor: t('เหมือน Rust ที่จัดเกมเป็นชุดระบบกับ component แทนการคุม object ทีละตัว', 'It feels like Rust organizing a game as systems and components instead of hand-driving objects.'),
    quickSpot: t('App::new + Commands + Query', 'App::new + Commands + Query'),
    spottingRules: list([
      ['มักเริ่มจาก App::new() และ .add_systems(...)', 'It often starts from App::new() and .add_systems(...).'],
      ['system parameter อย่าง Commands, Res<T>, Query<...> เป็น marker หลัก', 'System parameters such as Commands, Res<T>, and Query<...> are main markers.'],
      ['component มักเป็น struct ที่ derive(Component)', 'Components are often structs deriving Component.'],
    ]),
    falseFriends: ['rust', 'unreal-cpp', 'godot-gdscript'],
    beginnerChecklist: list([
      ['ถ้าเห็น Rust syntax แต่มี Commands และ Query ให้คิดถึง Bevy', 'If you see Rust syntax with Commands and Query, think of Bevy.'],
      ['มองหา Startup, Update, EventReader หรือ NextState', 'Look for Startup, Update, EventReader, or NextState.'],
      ['อย่าสับสนกับ Rust ทั่วไปที่ไม่มี App builder ของเกม', 'Do not confuse it with general Rust that lacks a game App builder.'],
    ]),
    miniSnippetNotes: list([
      ['App::new().add_systems(Startup, setup)', 'App::new().add_systems(Startup, setup)'],
      ['fn move_player(mut query: Query<&mut Transform, With<Player>>)', 'fn move_player(mut query: Query<&mut Transform, With<Player>>)'],
    ]),
    signature: ['App::new', 'Commands', 'Query', 'Res'],
    debugFocus: {
      th: ['เช็ก system order', 'ดู query filter และ borrow ใน ECS', 'ระวัง resource/state ที่ยังไม่ insert'],
      en: ['Check system ordering', 'Inspect ECS query filters and borrows', 'Watch resources or state that have not been inserted yet'],
    },
  }),
  'renpy-python': gameGuide({
    label: t('Ren\'Py Python', 'Ren\'Py Python'),
    family: 'gameplay',
    difficultyHint: t('มอง label, scene, show, menu: และ screen language', 'Look for label, scene, show, menu:, and screen language'),
    plainSummary: t(
      'ฐาน syntax คล้าย Python แต่กลิ่น visual novel ของ Ren\'Py ชัดจาก label, scene, show, menu, jump และ screen UI แบบเฉพาะทาง',
      'The base syntax resembles Python, but Ren\'Py’s visual-novel smell is strong through label, scene, show, menu, jump, and its screen UI language.',
    ),
    metaphor: t('เหมือน Python ที่กำลังกำกับฉาก บทพูด และตัวเลือกในนิยายภาพ', 'It feels like Python directing scenes, dialogue, and branching choices in a visual novel.'),
    quickSpot: t('label start: + scene + menu:', 'label start: + scene + menu:'),
    spottingRules: list([
      ['มักมี label start: หรือ label ชื่อฉาก', 'It often uses label start: or other scene labels.'],
      ['คำอย่าง scene, show, hide, menu, jump, call เป็นกลิ่นเด่นมาก', 'Words like scene, show, hide, menu, jump, and call are very strong clues.'],
      ['screen language มี textbutton, vbox, frame และ action แบบเฉพาะ', 'The screen language uses textbutton, vbox, frame, and engine-specific actions.'],
    ]),
    falseFriends: ['python', 'rpg-maker-js', 'godot-gdscript'],
    beginnerChecklist: list([
      ['ถ้าเป็น Python-like code ที่พูดเรื่องฉากและบทสนทนา ให้คิดถึง Ren\'Py', 'If Python-like code talks about scenes and dialogue, think of Ren\'Py.'],
      ['มองหา menu: และ string บทพูด', 'Look for menu: blocks and dialogue strings.'],
      ['อย่าสับสนกับ Python ปกติที่ไม่มี command อย่าง show หรือ jump', 'Do not confuse it with plain Python without commands like show or jump.'],
    ]),
    miniSnippetNotes: list([
      ['label start:\n    scene bg room', 'label start:\n    scene bg room'],
      ['screen inventory():\n    textbutton "Close" action Hide("inventory")', 'screen inventory():\n    textbutton "Close" action Hide("inventory")'],
    ]),
    signature: ['label start:', 'scene', 'menu:', 'textbutton'],
    debugFocus: {
      th: ['เช็ก label และ flow ของ jump/call', 'ดู screen id กับ action ที่ผูกไว้', 'ระวังตัวแปร state ที่ประกาศด้วย default หรือ store'],
      en: ['Check labels and jump/call flow', 'Inspect screen ids and bound actions', 'Watch state declared through default or store'],
    },
  }),
}
