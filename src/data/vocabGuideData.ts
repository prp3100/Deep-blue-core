import { guideBookEntries } from './guideData'
import { vocabSupportedLanguageIds, type VocabSupportedLanguageId } from './vocabData'
import type { LocalizedText } from './quizModels'

const t = (th: string, en: string): LocalizedText => ({ th, en })

const languageGuides: Partial<Record<VocabSupportedLanguageId, LocalizedText[]>> = {
  python: [
    t('def, class, import เป็น keyword หลักที่ใช้บ่อยที่สุดใน Python', 'def, class, import are the most frequently used keywords in Python.'),
    t('list comprehension เป็น syntax พิเศษสำหรับสร้าง list แบบย่อใน 1 บรรทัด', 'list comprehension is a special syntax for creating lists in one line.'),
    t('decorator (@) ครอบฟังก์ชันเพื่อเพิ่มพฤติกรรมโดยไม่แก้โค้ดภายใน', 'Decorators (@) wrap functions to add behavior without modifying internals.'),
    t('yield เปลี่ยนฟังก์ชันธรรมดาให้เป็น generator ที่คืนค่าทีละตัว', 'yield turns a regular function into a generator that yields values one at a time.'),
  ],
  java: [
    t('public, private, protected เป็น access modifier ที่ควบคุมการเข้าถึง', 'public, private, protected are access modifiers that control visibility.'),
    t('static หมายถึงสมาชิกของ class ไม่ใช่ของ instance เรียกผ่านชื่อ class ได้เลย', 'static means a class member, not instance-bound, callable via class name.'),
    t('interface กำหนดสัญญาที่ class ต้องทำตาม ต่างจาก abstract class', 'interface defines a contract classes must follow, different from abstract class.'),
    t('extends สืบทอด class ส่วน implements ทำตาม interface', 'extends inherits a class while implements follows an interface.'),
  ],
  javascript: [
    t('const, let, var ต่างกันที่ scope และ mutability — ใช้ const เป็นหลัก', 'const, let, var differ in scope and mutability — prefer const.'),
    t('arrow function (=>) เป็น syntax สั้นและมี lexical this', 'Arrow functions (=>) are short syntax with lexical this binding.'),
    t('Promise, async/await จัดการ asynchronous operation ที่ใช้เวลา', 'Promise, async/await handle time-consuming asynchronous operations.'),
    t('destructuring แยกค่าจาก object/array ลงตัวแปรหลายตัวพร้อมกัน', 'Destructuring extracts values from objects/arrays into multiple variables.'),
  ],
  html: [
    t('HTML ใช้แท็กเชิงความหมายอย่าง section, article, nav เพื่อบอกโครงสร้างเนื้อหา', 'HTML uses semantic tags like section, article, and nav to describe content structure.'),
    t('attribute อย่าง href, src, alt, required เปลี่ยนพฤติกรรมของ element แต่ละตัว', 'Attributes such as href, src, alt, and required change how each element behaves.'),
    t('form, label, input ทำงานร่วมกันเพื่อรับข้อมูลจากผู้ใช้และส่งต่ออย่างเป็นระบบ', 'form, label, and input work together to collect and submit user data cleanly.'),
    t('meta และ heading ช่วยทั้ง browser, SEO และ accessibility ไม่ใช่แค่การตกแต่งหน้า', 'meta tags and headings help the browser, SEO, and accessibility rather than only decorating the page.'),
  ],
  css: [
    t('CSS แยกระหว่าง selector, property, value ให้ชัด แล้วจะอ่านสไตล์ได้เร็วขึ้น', 'CSS becomes easier to read once you separate selectors, properties, and values clearly.'),
    t('Flexbox และ Grid เป็นศัพท์แกนหลักของ layout สมัยใหม่ เช่น display: flex, gap, grid-template-columns', 'Flexbox and Grid are the core vocabulary of modern layout, such as display: flex, gap, and grid-template-columns.'),
    t('pseudo-class อย่าง :hover หรือ :focus คือ style ที่เปลี่ยนตามสถานะของผู้ใช้', 'Pseudo-classes like :hover and :focus describe styles that change with user state.'),
    t('var(--token), rem และ @media เป็นศัพท์สำคัญของ design system, responsive UI และการ scale ทั้งหน้า', 'var(--token), rem, and @media are key vocabulary for design systems, responsive UI, and scalable sizing.'),
  ],
  json: [
    t('JSON เป็นรูปแบบข้อมูล ไม่ใช่ภาษารันคำสั่ง จึงโฟกัสที่ object, array และ key-value', 'JSON is a data format, not an execution language, so it centers on objects, arrays, and key-value pairs.'),
    t('มาตรฐาน JSON ใช้ double quotes กับ key และ string เสมอ และไม่รองรับ comment', 'Standard JSON always uses double quotes for keys and strings and does not support comments.'),
    t('boolean, null, number, string คือชนิดข้อมูลพื้นฐานที่เจอบ่อยที่สุดใน payload', 'boolean, null, number, and string are the most common primitive data types in JSON payloads.'),
    t('nested object และ nested array ทำให้ schema ลึกขึ้น จึงต้องอ่านโครงสร้างซ้ายไปขวาให้แม่น', 'Nested objects and arrays deepen the schema, so you need to read the structure carefully from left to right.'),
  ],
  csharp: [
    t('var ให้ compiler อนุมาน type อัตโนมัติ ไม่ต้องระบุ type ชัดเจน', 'var lets the compiler infer types automatically without explicit declaration.'),
    t('LINQ ให้ query ข้อมูลใน collection ด้วย syntax คล้าย SQL', 'LINQ lets you query collection data with SQL-like syntax.'),
    t('delegate เป็น type-safe function pointer เก็บ reference ไปยัง method', 'delegate is a type-safe function pointer storing a reference to a method.'),
    t('property ใช้ get/set accessor จัดการ access ไปยัง field', 'Properties use get/set accessors to manage field access.'),
  ],
  cpp: [
    t('#include ดึง header file เข้ามาใช้ ต้อง include ตัวที่ถูกต้อง', '#include brings in header files — must include the correct one.'),
    t('pointer (*) เก็บ address ของตัวแปร ใช้ -> เข้าถึง member', 'Pointers (*) store variable addresses; use -> to access members.'),
    t('std::vector เป็น dynamic array ที่ขยายขนาดได้อัตโนมัติ', 'std::vector is a dynamic array that auto-resizes.'),
    t('template<T> ทำให้เขียน code แบบ generic ใช้ได้กับหลาย type', 'template<T> enables generic code for multiple types.'),
  ],
  flutter: [
    t('Flutter คิดทุกอย่างเป็น widget tree ดังนั้นศัพท์อย่าง Scaffold, Column, Expanded จะโผล่บ่อยมาก', 'Flutter treats everything as a widget tree, so terms like Scaffold, Column, and Expanded appear constantly.'),
    t('StatelessWidget กับ StatefulWidget ต่างกันที่การถือ state ภายในและการต้อง rebuild เมื่อข้อมูลเปลี่ยน', 'StatelessWidget and StatefulWidget differ in whether they hold mutable local state and rebuild when data changes.'),
    t('build() คือเมทอดหลักที่คืนหน้าตา UI ส่วน setState() ใช้บอกว่า state เปลี่ยนแล้ว', 'build() is the core method that returns UI, while setState() signals that state has changed.'),
    t('FutureBuilder และ widget async อื่น ๆ ช่วยแสดง loading, success, error โดยผูกกับ Future ตรง ๆ', 'FutureBuilder and other async widgets let you present loading, success, and error states directly from a Future.'),
  ],
  typescript: [
    t('type annotation (:) ระบุ type ของตัวแปร parameter และ return value', 'Type annotations (:) specify types for variables, parameters, and returns.'),
    t('interface กำหนดรูปร่างของ object ที่ต้องมี property อะไรบ้าง', 'interface defines the shape of an object and its required properties.'),
    t('generic <T> ทำให้ function/class ใช้ได้กับหลาย type อย่างปลอดภัย', 'Generics <T> let functions/classes work with multiple types safely.'),
    t('enum กำหนดชุดค่าที่ตั้งชื่อได้ ใช้แทน magic number/string', 'enum defines a named set of values, replacing magic numbers/strings.'),
  ],
  dart: [
    t('final ประกาศค่าที่กำหนดได้ครั้งเดียว ส่วน const ต้องรู้ค่าตอน compile', 'final declares a one-time value; const must be known at compile time.'),
    t('null safety (?) บังคับเช็ก null ก่อนใช้งาน ลด NullPointerException', 'Null safety (?) forces null checks before use, reducing NullPointerException.'),
    t('async/await ใช้กับ Future สำหรับ asynchronous operation', 'async/await works with Future for asynchronous operations.'),
    t('Widget เป็นหน่วยพื้นฐานของ UI ใน Flutter ทุกอย่างคือ Widget', 'Widget is the fundamental UI unit in Flutter — everything is a Widget.'),
  ],
  go: [
    t('func ประกาศฟังก์ชัน Go ไม่มี class แต่ใช้ struct + method แทน', 'func declares functions; Go has no classes but uses struct + methods.'),
    t('goroutine ใช้ go keyword เพื่อรัน function แบบ concurrent', 'goroutine uses the go keyword to run functions concurrently.'),
    t('channel ใช้ <- ส่งข้อมูลระหว่าง goroutine อย่างปลอดภัย', 'Channels use <- to safely send data between goroutines.'),
    t('defer ชะลอการเรียกฟังก์ชันไปรันตอนจบ function', 'defer postpones a function call until the surrounding function returns.'),
  ],
  kotlin: [
    t('val ประกาศค่าแบบ immutable ส่วน var เปลี่ยนค่าได้', 'val declares immutable values; var allows reassignment.'),
    t('data class สร้าง class ที่มี equals, hashCode, toString อัตโนมัติ', 'data class auto-generates equals, hashCode, and toString.'),
    t('null safety (?) บังคับจัดการ null อย่างชัดเจน ลดบั๊ก', 'Null safety (?) forces explicit null handling, reducing bugs.'),
    t('when เป็น enhanced switch ที่ return ค่าได้และไม่ต้อง break', 'when is an enhanced switch that returns values without needing break.'),
  ],
  swift: [
    t('let ประกาศค่าคงที่ ส่วน var ประกาศตัวแปรที่เปลี่ยนได้', 'let declares constants; var declares mutable variables.'),
    t('Optional (?) จัดการค่าที่อาจเป็น nil อย่างปลอดภัย', 'Optional (?) safely handles values that might be nil.'),
    t('guard else ใช้ early return เพื่อลด nesting ของ code', 'guard else uses early return to reduce code nesting.'),
    t('struct เป็น value type ส่วน class เป็น reference type', 'struct is a value type; class is a reference type.'),
  ],
  ruby: [
    t('end ปิด block ของ def, if, do แทน } ในภาษาอื่น', 'end closes def, if, do blocks instead of } in other languages.'),
    t('symbol (:name) เป็น immutable identifier ที่เบากว่า string', 'Symbols (:name) are immutable identifiers lighter than strings.'),
    t('block (do..end, {}) ส่ง code chunk เข้า method ได้', 'Blocks (do..end, {}) pass code chunks into methods.'),
    t('gems เป็น package manager ของ Ruby เหมือน pip ของ Python', 'Gems is Ruby\'s package manager, like Python\'s pip.'),
  ],
  jsx: [
    t('JSX ผสม HTML กับ JavaScript ใช้ {} แทรก expression', 'JSX mixes HTML with JavaScript; use {} to embed expressions.'),
    t('className ใช้แทน class เพราะ class เป็น reserved word ใน JS', 'className replaces class because class is a reserved word in JS.'),
    t('component เป็นฟังก์ชันที่ return JSX element', 'A component is a function that returns a JSX element.'),
    t('props ส่งข้อมูลจาก parent ไป child component', 'props pass data from parent to child components.'),
  ],
  bash: [
    t('$VAR อ้างถึงค่าของตัวแปร ต้องใช้ $ นำหน้าเมื่ออ่านค่า', '$VAR references a variable value; $ prefix is required when reading.'),
    t('if/fi, for/done ใช้คู่กันเปิด/ปิด block ใน Bash', 'if/fi, for/done are paired to open/close blocks in Bash.'),
    t('pipe (|) ส่ง output ของคำสั่งหนึ่งเป็น input ของคำสั่งถัดไป', 'Pipe (|) sends one command output as input to the next command.'),
    t('chmod เปลี่ยน permission ของไฟล์ เช่น chmod +x ให้รันได้', 'chmod changes file permissions, e.g., chmod +x makes it executable.'),
  ],
  'cloud-functions': [
    t('exports ส่งออก function handler สำหรับ deploy', 'exports exposes function handlers for deployment.'),
    t('req/res เป็น request/response object ใน HTTP trigger', 'req/res are request/response objects in HTTP triggers.'),
    t('async/await ใช้กับ Firestore, Storage API ที่เป็น async', 'async/await works with async Firestore and Storage APIs.'),
    t('environment variable เก็บค่า config เช่น API key', 'Environment variables store config values like API keys.'),
  ],
  sql: [
    t('SELECT เลือก column ที่ต้องการจาก table', 'SELECT picks columns you want from a table.'),
    t('WHERE กรองแถวตามเงื่อนไขที่กำหนด', 'WHERE filters rows based on specified conditions.'),
    t('JOIN เชื่อมข้อมูลจากหลาย table เข้าด้วยกัน', 'JOIN combines data from multiple tables.'),
    t('CREATE TABLE สร้าง table ใหม่พร้อมกำหนด column และ type', 'CREATE TABLE creates a new table with defined columns and types.'),
  ],
  php: [
    t('$ นำหน้าตัวแปรทุกตัวใน PHP เสมอ', '$ precedes every variable in PHP.'),
    t('echo พิมพ์ข้อความออกหน้าจอ เป็นคำสั่งพื้นฐานที่สุด', 'echo prints text to output — the most basic command.'),
    t('-> เรียก method/property ของ object แทน . ในภาษาอื่น', '-> calls object methods/properties instead of . in other languages.'),
    t('array() หรือ [] สร้าง array ใน PHP', 'array() or [] creates an array in PHP.'),
  ],
  rust: [
    t('let ประกาศตัวแปร immutable ส่วน let mut เปลี่ยนค่าได้', 'let declares immutable variables; let mut allows mutation.'),
    t('ownership ระบบจัดการ memory ที่ไม่ต้องใช้ garbage collector', 'Ownership is a memory management system without garbage collection.'),
    t('borrow (&) ยืมค่าโดยไม่ย้าย ownership', 'Borrow (&) lends a value without transferring ownership.'),
    t('match เป็น pattern matching ที่ครอบคลุมทุก case', 'match is pattern matching that covers every case.'),
  ],
  'roblox-lua': [
    t('local ประกาศตัวแปร scope แคบ ใช้ local เป็นหลักแทน global', 'local declares narrow-scoped variables; prefer local over global.'),
    t('game.Players เข้าถึง service ผู้เล่นทั้งหมด', 'game.Players accesses the player service.'),
    t(': เรียก method ของ object ส่วน . เข้าถึง property', ': calls object methods; . accesses properties.'),
    t('Instance.new() สร้าง object ใหม่ใน Roblox', 'Instance.new() creates new objects in Roblox.'),
  ],
  'love2d-lua': [
    t('love.load, love.update, love.draw เป็น lifecycle หลัก', 'love.load, love.update, love.draw are the main lifecycle callbacks.'),
    t('love.graphics.draw วาดรูปภาพบนหน้าจอ', 'love.graphics.draw renders images on screen.'),
    t('dt (delta time) ใน love.update ใช้ทำ frame-independent movement', 'dt (delta time) in love.update enables frame-independent movement.'),
    t('require โหลดไฟล์ Lua อื่นเข้ามาใช้งาน', 'require loads other Lua files for use.'),
  ],
  'godot-gdscript': [
    t('extends ระบุ base class ที่ script สืบทอด', 'extends specifies the base class the script inherits from.'),
    t('$NodeName เข้าถึง child node ด้วย shorthand', '$NodeName accesses child nodes via shorthand.'),
    t('_ready() เรียกเมื่อ node พร้อม ใช้เหมือน constructor', '_ready() is called when the node is ready, used like a constructor.'),
    t('signal ส่งเหตุการณ์ระหว่าง node แบบ decouple', 'Signals send events between nodes in a decoupled way.'),
  ],
  'godot-shader': [
    t('shader_type ต้องประกาศก่อนเสมอ เช่น spatial, canvas_item', 'shader_type must be declared first, e.g., spatial, canvas_item.'),
    t('uniform ส่งค่าจาก editor เข้า shader', 'uniform passes values from the editor into the shader.'),
    t('vec2, vec3, vec4 เป็น vector type พื้นฐาน', 'vec2, vec3, vec4 are fundamental vector types.'),
    t('COLOR, VERTEX เป็น built-in output variable', 'COLOR, VERTEX are built-in output variables.'),
  ],
  'unity-csharp': [
    t('MonoBehaviour เป็น base class หลักของ script ใน Unity', 'MonoBehaviour is the main base class for Unity scripts.'),
    t('Start, Update เป็น lifecycle method ที่เรียกอัตโนมัติ', 'Start, Update are lifecycle methods called automatically.'),
    t('GetComponent<T>() ค้นหา component บน GameObject', 'GetComponent<T>() finds a component on a GameObject.'),
    t('[SerializeField] เปิดให้ตั้งค่า private field จาก Inspector', '[SerializeField] exposes private fields to the Inspector.'),
  ],
  'unity-shaderlab': [
    t('SubShader, Pass เป็นโครงสร้างหลักของ ShaderLab', 'SubShader and Pass are the main ShaderLab structures.'),
    t('Properties {} ประกาศ parameter ที่แก้ได้จาก Inspector', 'Properties {} declares parameters editable from the Inspector.'),
    t('CGPROGRAM/ENDCG ครอบโค้ด shader จริง', 'CGPROGRAM/ENDCG wraps the actual shader code.'),
    t('_MainTex เป็น convention สำหรับ texture หลัก', '_MainTex is the convention for the main texture.'),
  ],
  'unreal-cpp': [
    t('UPROPERTY macro ทำให้ property แสดงใน Blueprint', 'UPROPERTY macro makes properties visible in Blueprint.'),
    t('UFUNCTION macro ทำให้ function เรียกจาก Blueprint ได้', 'UFUNCTION macro makes functions callable from Blueprint.'),
    t('AActor เป็น base class ของ object ที่วางใน level', 'AActor is the base class for objects placed in levels.'),
    t('Cast<T>() แปลง type อย่างปลอดภัย ต้องเช็ก nullptr หลัง Cast', 'Cast<T>() safely converts types; check nullptr after Cast.'),
  ],
  glsl: [
    t('precision mediump float กำหนดความละเอียดของ float', 'precision mediump float sets float precision.'),
    t('gl_FragColor เป็น output สีของ fragment shader', 'gl_FragColor is the fragment shader color output.'),
    t('uniform ส่งค่าจาก CPU เข้า GPU', 'uniform sends values from CPU to GPU.'),
    t('varying ส่งค่าจาก vertex shader ไป fragment shader', 'varying passes values from vertex to fragment shader.'),
  ],
  'phaser-typescript': [
    t('this.add สร้าง game object ใน scene', 'this.add creates game objects in the scene.'),
    t('preload, create, update เป็น lifecycle หลักของ scene', 'preload, create, update are the main scene lifecycle methods.'),
    t('this.physics เข้าถึงระบบ physics ของ Phaser', 'this.physics accesses Phaser physics system.'),
    t('this.load โหลด asset ได้เฉพาะใน preload', 'this.load loads assets only inside preload.'),
  ],
  'rpg-maker-js': [
    t('$gameVariables, $gameSwitches เก็บ state ของเกม', '$gameVariables, $gameSwitches store game state.'),
    t('Scene_Base เป็น base class ของทุก scene', 'Scene_Base is the base class for all scenes.'),
    t('Window_Base เป็น base class ของทุก UI window', 'Window_Base is the base class for all UI windows.'),
    t('PluginManager.registerCommand ลงทะเบียน plugin command', 'PluginManager.registerCommand registers plugin commands.'),
  ],
  'gamemaker-gml': [
    t('var ประกาศ local variable ใน GML', 'var declares local variables in GML.'),
    t('draw_text วาดข้อความบนหน้าจอ', 'draw_text draws text on screen.'),
    t('instance_create_layer สร้าง object instance', 'instance_create_layer creates object instances.'),
    t('Create, Step, Draw เป็น event หลักของ object', 'Create, Step, Draw are the main object events.'),
  ],
  'defold-lua': [
    t('msg.post ส่ง message ไปยัง game object อื่น', 'msg.post sends messages to other game objects.'),
    t('go.get อ่านค่า property ของ game object', 'go.get reads game object property values.'),
    t('init, update, on_message เป็น lifecycle หลัก', 'init, update, on_message are the main lifecycle functions.'),
    t('hash ใช้แปลง string เป็น hashed ID สำหรับ performance', 'hash converts strings to hashed IDs for performance.'),
  ],
  'cocos-typescript': [
    t('@ccclass decorator ลงทะเบียน class กับ Cocos editor', '@ccclass decorator registers a class with the Cocos editor.'),
    t('@property decorator เปิดให้ตั้งค่า property จาก editor', '@property decorator exposes properties to the editor.'),
    t('cc.Node เป็น base class ของทุก node ใน scene', 'cc.Node is the base class for all scene nodes.'),
    t('start, update เป็น lifecycle method หลัก', 'start, update are the main lifecycle methods.'),
  ],
  'bevy-rust': [
    t('Component derive macro ทำให้ struct เป็น ECS component', 'Component derive macro turns a struct into an ECS component.'),
    t('Query<T> ดึง entity ที่มี component ตรงตาม type', 'Query<T> fetches entities matching the specified component types.'),
    t('App::new().add_plugins() ตั้งค่าและรัน Bevy app', 'App::new().add_plugins() sets up and runs a Bevy app.'),
    t('Commands spawn/despawn entity ที่ runtime', 'Commands spawn/despawn entities at runtime.'),
  ],
  'renpy-python': [
    t('label กำหนดจุดเริ่มต้นของ dialogue block', 'label marks the starting point of a dialogue block.'),
    t('$ นำหน้า Python code ในบรรทัดปกติของ Ren\'Py', '$ prefixes Python code in normal Ren\'Py lines.'),
    t('jump ย้ายไปยัง label อื่นทันที', 'jump immediately moves to another label.'),
    t('define สร้าง character object สำหรับ dialogue', 'define creates character objects for dialogue.'),
  ],
}

const commonGuide: LocalizedText[] = [
  t('จำ keyword หลักของภาษาให้ได้ — มันคือพื้นฐานที่ใช้ทุกวัน', 'Memorize the core keywords — they are the daily fundamentals.'),
  t('แยกให้ออกระหว่าง keyword ที่ประกาศค่า กับ keyword ที่ควบคุม flow', 'Distinguish declaration keywords from control-flow keywords.'),
  t('จำ built-in function ที่ใช้บ่อย เช่น print, console.log, println', 'Remember common built-in functions like print, console.log, println.'),
  t('ดู syntax term เฉพาะภาษา เช่น decorator, comprehension, guard', 'Learn language-specific syntax terms like decorator, comprehension, guard.'),
]

export type VocabGuideDataEntry = {
  overview: LocalizedText
  termFamilyCues: LocalizedText[]
  lookalikeWarnings: LocalizedText[]
  snippetReadingTips: LocalizedText[]
}

const buildOverview = (languageId: VocabSupportedLanguageId): LocalizedText => {
  const guide = guideBookEntries[languageId]

  return t(
    `${guide.label.th} ในโหมด Vocab แบบ easy ควรอ่านคำศัพท์เป็น “หน้าที่ของคำ” มากกว่าท่องจำเดี่ยว ๆ ว่ามันแปลว่าอะไร เพราะ snippet จะคอยบอกว่าคำนี้กำลังใช้เพื่อประกาศ, ควบคุม flow หรือผูกกับ ecosystem ไหน`,
    `In easy ${guide.label.en} Vocab, read each term as a job in the snippet rather than memorizing it in isolation. The surrounding code tells you whether the term is declaring, controlling flow, or pointing at a specific ecosystem.`,
  )
}

const buildLookalikeWarnings = (languageId: VocabSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  const lookalikes = guide.falseFriends.slice(0, 2)

  return [
    t(
      `ถ้าคำดูเหมือนศัพท์ที่ ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.th : 'ภาษาใกล้เคียง'} ก็อย่าเพิ่งเดาจากหน้าตา ให้ดูด้วยว่ามันอยู่ข้างคำแบบไหนและถูกใช้ใน block แบบไหน`,
      `If the term looks like something from ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.en : 'a nearby language'}, do not guess from the surface alone. Check what it sits next to and what kind of block it appears in.`,
    ),
    t(
      `บางคำใน ${guide.label.th} คล้ายกับ ${lookalikes[1] ? guideBookEntries[lookalikes[1]].label.th : 'อีกตัวหนึ่ง'} แต่หน้าที่คนละแบบ ให้ดูว่า snippet นี้กำลังประกาศข้อมูล, เรียก API, หรือกำกับ engine lifecycle`,
      `Some ${guide.label.en} terms resemble ${lookalikes[1] ? guideBookEntries[lookalikes[1]].label.en : 'another lookalike'}, but the job is different. Look at whether the snippet is declaring data, calling an API, or steering an engine lifecycle.`,
    ),
    t(
      `เวลา choice ใกล้กัน ให้ตัดตัวเลือกที่อธิบายกว้างเกินบริบทออกก่อน แล้วเหลือคำตอบที่ตรงกับ “หน้าที่จริง” ของคำใน snippet นี้`,
      `When the choices feel close, eliminate the ones that are too broad for the context first, then keep the meaning that matches the term’s actual job in this snippet.`,
    ),
  ]
}

const buildSnippetReadingTips = (languageId: VocabSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  const signature = guide.signature.slice(0, 3).join(', ')

  return [
    t(
      `เริ่มจากมองคำเด่นของ ${guide.label.th} อย่าง ${signature || guide.quickSpot.th} ก่อน แล้วค่อยอ่านว่าคำศัพท์หลักทำงานร่วมกับมันยังไง`,
      `Start with the standout ${guide.label.en} markers like ${signature || guide.quickSpot.en}, then read how the main term interacts with them.`,
    ),
    t(
      `ถ้า snippet สั้นมาก ให้ดูตำแหน่งของคำศัพท์ก่อนว่าอยู่ตอนประกาศ, ตอนเรียกใช้ หรืออยู่ในบล็อกเงื่อนไข`,
      `If the snippet is short, first decide whether the term appears at declaration time, call time, or inside a control-flow block.`,
    ),
    t(
      `ถ้า snippet ยาวขึ้น ให้มองคำก่อนหน้าและคำถัดจากคำศัพท์นั้น เพราะ clue ที่แยกความหมายมักซ่อนอยู่ในบริบทรอบข้าง`,
      `If the snippet grows longer, inspect the tokens right before and after the term. The clue that separates the meaning usually hides in the surrounding context.`,
    ),
  ]
}

export const vocabGuideData = Object.fromEntries(
  vocabSupportedLanguageIds.map((languageId) => [
    languageId,
    {
      overview: buildOverview(languageId),
      termFamilyCues: languageGuides[languageId] ?? commonGuide,
      lookalikeWarnings: buildLookalikeWarnings(languageId),
      snippetReadingTips: buildSnippetReadingTips(languageId),
    },
  ]),
) as Record<VocabSupportedLanguageId, VocabGuideDataEntry>
