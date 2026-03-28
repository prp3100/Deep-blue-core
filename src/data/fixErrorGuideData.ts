import { fixErrorSupportedLanguageIds, type FixErrorSupportedLanguageId } from './fixErrorData'
import { guideBookEntries } from './guideData'
import type { LocalizedText } from './quizModels'

const t = (th: string, en: string): LocalizedText => ({ th, en })

const languageGuides: Partial<Record<FixErrorSupportedLanguageId, LocalizedText[]>> = {
  python: [
    t('Python ใช้ indentation เป็นตัวกำหนด block — ถ้าย่อหน้าผิดแม้ 1 เว้นวรรค จะเจอ IndentationError ทันที', 'Python uses indentation to define blocks — even one wrong space triggers an IndentationError.'),
    t('ดูชื่อตัวแปรและ method ให้ดี เช่น appned แทน append หรือ totla แทน total เป็น typo ที่พบบ่อยมาก', 'Watch for variable and method typos: appned instead of append, totla instead of total — very common mistakes.'),
    t('ลืมใส่ : หลัง if, for, def จะเจอ SyntaxError ทันที ให้มองท้ายบรรทัดที่มี keyword เหล่านี้เสมอ', 'Forgetting : after if, for, or def triggers SyntaxError immediately — always check the end of keyword lines.'),
    t('เช็ก IndexError เมื่อเข้าถึง list ด้วย index ที่เกินขนาด เช่น items[5] ตอนมีแค่ 3 ตัว', 'Check for IndexError when accessing a list with an out-of-range index, e.g., items[5] when only 3 exist.'),
  ],
  java: [
    t('Java เข้มงวดเรื่อง type — ถ้าเรียก method ที่ไม่มีใน class นั้นจะ compile ไม่ผ่าน', 'Java is strict about types — calling a method not defined in the class won\'t compile.'),
    t('ลืมใส่ ; ท้ายบรรทัดเป็น error ที่พบบ่อยมาก ดูท้ายทุกบรรทัดคำสั่ง', 'Missing ; at the end of a statement is extremely common — check every statement line.'),
    t('NullPointerException มักเกิดจากการเรียก method บน object ที่เป็น null — ดูว่าตัวแปรมีค่าหรือยัง', 'NullPointerException happens when calling a method on a null object — check if the variable is initialized.'),
    t('ArrayIndexOutOfBoundsException เกิดจากการเข้าถึง array ที่ index เกินขนาด', 'ArrayIndexOutOfBoundsException occurs when accessing an array at an index beyond its length.'),
  ],
  javascript: [
    t('JavaScript ไม่ error ตอน compile เลย ต้องรันแล้วพังเอง — ดู TypeError เมื่อเรียก method บน undefined', 'JavaScript has no compile errors — watch for TypeError when calling methods on undefined values.'),
    t('ลืมปิด { } หรือ ( ) ทำให้ SyntaxError — นับวงเล็บเปิดปิดให้ตรงกัน', 'Missing closing { } or ( ) causes SyntaxError — count matching opening and closing brackets.'),
    t('ชื่อตัวแปรผิดจะไม่ error จนกว่าจะใช้งาน — ดู ReferenceError เมื่อเรียกตัวแปรที่ไม่มี', 'Typo in variable names won\'t error until used — watch for ReferenceError on undefined variables.'),
    t('=== กับ == ต่างกัน JavaScript ตรวจ type ด้วย === แต่ == จะแปลง type ให้เอง', '=== vs == matters: === checks type strictly while == coerces types automatically.'),
  ],
  csharp: [
    t('C# เข้มงวดเรื่อง type เหมือน Java — NullReferenceException เป็น error ที่พบบ่อยที่สุด', 'C# is strict about types like Java — NullReferenceException is the most common error.'),
    t('ลืม ; ท้ายบรรทัด หรือลืมปิด { } ทำให้ compile ไม่ผ่าน', 'Missing ; at line end or unclosed { } will cause compilation failure.'),
    t('ดู method signature ให้ดี — จำนวนและ type ของ argument ต้องตรงกับที่ประกาศ', 'Check method signatures — argument count and types must match the declaration.'),
    t('IndexOutOfRangeException เกิดจากการเข้าถึง array/list ที่ index เกินขนาด', 'IndexOutOfRangeException occurs when accessing an array/list at an out-of-range index.'),
  ],
  cpp: [
    t('C++ ต้อง include header ที่ถูกต้อง — ลืม #include ทำให้ compiler หา function ไม่เจอ', 'C++ requires correct headers — missing #include means the compiler can\'t find the function.'),
    t('Segmentation fault มักเกิดจากการเข้าถึง memory ที่ไม่ได้จอง เช่น pointer ที่เป็น nullptr', 'Segmentation fault usually comes from accessing unallocated memory, like a nullptr pointer.'),
    t('ลืมใส่ ; หลังปิด } ของ class/struct definition เป็น error ที่หาสาเหตุยาก', 'Forgetting ; after the closing } of a class/struct definition is a hard-to-find error.'),
    t('ดู type mismatch — C++ ไม่แปลง type ให้อัตโนมัติเท่า JavaScript', 'Watch for type mismatches — C++ does not auto-convert types like JavaScript does.'),
  ],
  dart: [
    t('Dart ใช้ null safety — ถ้าตัวแปรอาจเป็น null ต้องใส่ ? และเช็กก่อนใช้', 'Dart uses null safety — if a variable can be null, mark it with ? and check before use.'),
    t('TypeError มักเกิดจากการส่ง type ผิดเข้า function — ดู argument type ให้ตรง', 'TypeError usually comes from passing wrong types to functions — check argument types.'),
    t('ลืมใส่ ; หรือลืมปิด { } ทำให้ compile ไม่ผ่าน', 'Missing ; or unclosed { } causes compilation failure.'),
    t('RangeError เกิดจากการเข้าถึง list ที่ index เกินขนาด', 'RangeError occurs when accessing a list at an out-of-range index.'),
  ],
  go: [
    t('Go ไม่อนุญาตตัวแปรที่ประกาศแล้วไม่ใช้ — ถ้ามีตัวแปรเกินจะ compile ไม่ผ่าน', 'Go does not allow unused variables — extra declarations cause compile failure.'),
    t('nil pointer dereference เกิดจากการเรียก method บน pointer ที่เป็น nil', 'nil pointer dereference occurs when calling a method on a nil pointer.'),
    t('ลืม import package ที่ใช้ หรือ import package ที่ไม่ได้ใช้ ทั้งสองอย่างคือ error', 'Missing used imports or importing unused packages are both errors.'),
    t('index out of range เกิดจากการเข้าถึง slice/array ที่ index เกินขนาด', 'index out of range occurs when accessing a slice/array at an out-of-range index.'),
  ],
  kotlin: [
    t('Kotlin ใช้ null safety คล้าย Dart — ต้องใส่ ? สำหรับตัวแปรที่อาจเป็น null', 'Kotlin uses null safety like Dart — mark nullable variables with ?.'),
    t('NullPointerException ยังเกิดได้ถ้าใช้ !! บน null value', 'NullPointerException can still occur if you use !! on a null value.'),
    t('ดูชื่อ function และ property ให้ดี — typo ทำให้ compiler หาไม่เจอ', 'Check function and property names — typos cause unresolved reference errors.'),
    t('IndexOutOfBoundsException เกิดจากการเข้าถึง list ที่ index เกินขนาด', 'IndexOutOfBoundsException occurs when accessing a list at an out-of-range index.'),
  ],
  swift: [
    t('Swift ใช้ Optional (?) สำหรับค่าที่อาจเป็น nil — force unwrap ด้วย ! บน nil จะ crash ทันที', 'Swift uses Optional (?) for nullable values — force unwrapping nil with ! crashes immediately.'),
    t('ชื่อ method ต้องตรงกับ protocol/class ที่ประกาศ — typo จะ compile ไม่ผ่าน', 'Method names must match declared protocol/class — typos cause compilation failure.'),
    t('ดู type ของตัวแปร — Swift ไม่แปลง type ให้อัตโนมัติ ต้อง cast เอง', 'Watch variable types — Swift does not auto-convert types, you must cast explicitly.'),
    t('Array index out of range เกิดจากการเข้าถึง array ที่ index เกินขนาด', 'Array index out of range occurs when accessing an array at an out-of-range index.'),
  ],
  ruby: [
    t('Ruby ใช้ end ปิด block แทน } — ลืม end ทำให้ SyntaxError', 'Ruby uses end to close blocks instead of } — missing end causes SyntaxError.'),
    t('NoMethodError เกิดจากการเรียก method ที่ไม่มี — ดูชื่อ method ให้ดี', 'NoMethodError occurs when calling a non-existent method — double-check method names.'),
    t('nil ใน Ruby ไม่ใช่ 0 หรือ false — การเรียก method บน nil จะเจอ NoMethodError', 'nil in Ruby is not 0 or false — calling methods on nil causes NoMethodError.'),
    t('ดู typo ในชื่อตัวแปรและ symbol — Ruby ไม่บังคับประกาศตัวแปรก่อนใช้', 'Watch for typos in variable names and symbols — Ruby does not require variable declarations.'),
  ],
  jsx: [
    t('JSX ต้อง return element เดียว — ลืมครอบด้วย <> ... </> หรือ <div> จะ error', 'JSX must return a single element — forgetting to wrap with <> ... </> or <div> causes errors.'),
    t('ใช้ className แทน class — เขียน class ใน JSX จะถูกตีความผิด', 'Use className instead of class — writing class in JSX is interpreted incorrectly.'),
    t('ดู {} ให้ดี — expression ใน JSX ต้องอยู่ใน {} ทั้งหมด', 'Check {} carefully — JSX expressions must be wrapped in {} .'),
    t('Event handler ต้องเป็น camelCase เช่น onClick ไม่ใช่ onclick', 'Event handlers must be camelCase, e.g., onClick not onclick.'),
  ],
  typescript: [
    t('TypeScript เพิ่ม type system บน JavaScript — type mismatch จะ compile ไม่ผ่าน', 'TypeScript adds a type system on JavaScript — type mismatches cause compilation failure.'),
    t('ดู type annotation ว่าตรงกับค่าที่ใส่จริง — เช่น number กับ string ปนกัน', 'Check type annotations match actual values — e.g., mixing number and string.'),
    t('Property ที่ไม่มีใน type definition จะ error — ดูว่า interface/type มีครบหรือไม่', 'Properties not in the type definition cause errors — check if interface/type is complete.'),
    t('Strict null checks ทำให้ต้องเช็ก null/undefined ก่อนใช้ value', 'Strict null checks require checking null/undefined before using values.'),
  ],
  bash: [
    t('Bash ต้องไม่มีช่องว่างรอบ = ตอน assign ตัวแปร เช่น x=5 ไม่ใช่ x = 5', 'Bash must have no spaces around = for variable assignment: x=5 not x = 5.'),
    t('ลืม fi ปิด if หรือลืม done ปิด for/while จะเจอ syntax error', 'Missing fi to close if or done to close for/while causes syntax errors.'),
    t('ตัวแปรต้องใช้ $ นำหน้าเมื่ออ่านค่า เช่น $var ไม่ใช่ var', 'Variables must use $ prefix when reading: $var not var.'),
    t('command not found เกิดจากพิมพ์ชื่อคำสั่งผิดหรือไม่มีใน PATH', 'command not found occurs from misspelled commands or missing PATH entries.'),
  ],
  'cloud-functions': [
    t('Cloud Functions ต้อง export function handler ที่ถูกต้อง — ลืม export จะ deploy ไม่ได้', 'Cloud Functions must export the correct handler — missing export prevents deployment.'),
    t('ดู async/await ว่าใช้ถูกที่ — ลืม await ทำให้ได้ Promise แทนค่าจริง', 'Check async/await usage — missing await returns a Promise instead of the actual value.'),
    t('Environment variable ต้องตั้งค่าก่อน deploy — ดู config ให้ตรง', 'Environment variables must be set before deployment — verify config matches.'),
    t('response ต้อง send กลับทุกครั้ง — ลืม res.send() ทำให้ function timeout', 'Response must always be sent back — missing res.send() causes function timeout.'),
  ],
  sql: [
    t('SQL ต้องมี comma คั่นระหว่าง column — ลืม comma จะเจอ syntax error', 'SQL requires commas between columns — missing commas cause syntax errors.'),
    t('ดูชื่อ table/column ให้ตรง — typo ทำให้เจอ "table not found" หรือ "column not found"', 'Check table/column names — typos cause "table not found" or "column not found" errors.'),
    t('WHERE clause ต้องใช้ = ไม่ใช่ == สำหรับเปรียบเทียบ', 'WHERE clause uses = not == for comparison.'),
    t('GROUP BY ต้องมีทุก column ที่ไม่ได้อยู่ใน aggregate function', 'GROUP BY must include every column not inside an aggregate function.'),
  ],
  php: [
    t('PHP ต้องใช้ $ นำหน้าตัวแปรเสมอ — ลืม $ จะเจอ undefined constant', 'PHP must always use $ before variables — missing $ gives undefined constant error.'),
    t('ลืม ; ท้ายบรรทัดเป็น error ที่พบบ่อยมาก', 'Missing ; at the end of a line is a very common error.'),
    t('-> ใช้เรียก method ของ object ไม่ใช่ . เหมือนภาษาอื่น', '-> is used to call object methods, not . like other languages.'),
    t('Undefined variable เกิดจากพิมพ์ชื่อตัวแปรผิด — ดู $ และชื่อให้ตรง', 'Undefined variable comes from variable name typos — check $ and the name.'),
  ],
  rust: [
    t('Rust เข้มงวดเรื่อง ownership — ใช้ตัวแปรหลัง move จะ compile ไม่ผ่าน', 'Rust is strict about ownership — using a variable after move won\'t compile.'),
    t('ลืม ; ท้ายบรรทัด หรือใส่ ; ตอนต้อง return ค่า ทั้งสองอย่างเป็น error', 'Missing ; at line end, or adding ; when a value should be returned — both are errors.'),
    t('type mismatch เป็น error ที่พบบ่อย — Rust ไม่แปลง type ให้เอง', 'type mismatch is common — Rust does not auto-convert types.'),
    t('borrow checker เข้มงวด — ใช้ mutable reference พร้อม immutable จะ error', 'The borrow checker is strict — using mutable and immutable references together causes errors.'),
  ],
  'roblox-lua': [
    t('Roblox Lua ใช้ : เรียก method ไม่ใช่ . — ใช้ผิดจะได้ nil หรือ error', 'Roblox Lua uses : to call methods, not . — wrong usage gives nil or errors.'),
    t('game.Players, workspace เป็นคำเฉพาะ — พิมพ์ผิดจะหา service ไม่เจอ', 'game.Players, workspace are specific terms — typos cause service not found.'),
    t('ลืม end ปิด function/if/for เป็น error ที่พบบ่อยที่สุด', 'Missing end to close function/if/for is the most common error.'),
    t('nil ใน Lua ไม่ใช่ 0 — การเรียก method บน nil จะ error ทันที', 'nil in Lua is not 0 — calling methods on nil causes immediate errors.'),
  ],
  'love2d-lua': [
    t('Love2D ใช้ love.graphics, love.load — พิมพ์ชื่อ callback ผิดจะไม่ถูกเรียก', 'Love2D uses love.graphics, love.load — misspelling callbacks means they never run.'),
    t('ลืม end ปิด function เป็น error ที่พบบ่อย — นับ function กับ end ให้ตรงกัน', 'Missing end to close functions is common — count function and end to match.'),
    t('ดู parameter ของ love.graphics.draw — ลำดับ x, y, rotation ต้องถูกต้อง', 'Check love.graphics.draw parameters — x, y, rotation order must be correct.'),
    t('nil error มักเกิดจากตัวแปรที่ยังไม่ได้โหลดใน love.load', 'nil errors often come from variables not yet loaded in love.load.'),
  ],
  'godot-gdscript': [
    t('GDScript ใช้ indentation เหมือน Python — ย่อหน้าผิดจะเจอ error ทันที', 'GDScript uses indentation like Python — wrong indentation causes immediate errors.'),
    t('func ต้องมี : ท้าย — ลืมใส่จะเจอ SyntaxError', 'func must end with : — missing it causes SyntaxError.'),
    t('ดูชื่อ node path ให้ตรง — $NodeName พิมพ์ผิดจะได้ null', 'Check node path names — misspelled $NodeName returns null.'),
    t('signal ต้อง connect ก่อนใช้ — ลืม connect จะไม่มีอะไรเกิดขึ้น', 'Signals must be connected before use — missing connect means nothing happens.'),
  ],
  'godot-shader': [
    t('Godot Shader ต้องประกาศ shader_type ก่อน — ลืมจะ compile ไม่ผ่าน', 'Godot Shader must declare shader_type first — missing it causes compilation failure.'),
    t('uniform ต้องประกาศ type ที่ถูกต้อง — type mismatch จะ error', 'Uniforms must have correct type declarations — type mismatch causes errors.'),
    t('ดู vec2, vec3, vec4 ให้ตรง — ส่ง dimension ไม่ตรงจะ error', 'Check vec2, vec3, vec4 — mismatched dimensions cause errors.'),
    t('COLOR, VERTEX เป็นตัวแปร built-in — พิมพ์ผิดจะหาไม่เจอ', 'COLOR, VERTEX are built-in variables — typos cause not found errors.'),
  ],
  'unity-csharp': [
    t('Unity C# ใช้ MonoBehaviour — ชื่อ lifecycle method เช่น Start, Update ต้องตรงตัว', 'Unity C# uses MonoBehaviour — lifecycle methods like Start, Update must match exactly.'),
    t('NullReferenceException มักเกิดจาก GetComponent ที่หา component ไม่เจอ', 'NullReferenceException often comes from GetComponent not finding the component.'),
    t('ดู SerializeField/public ว่าตั้งค่าใน Inspector แล้ว — null จาก Inspector เป็นเรื่องปกติ', 'Check SerializeField/public are set in Inspector — null from Inspector is common.'),
    t('ลืม using namespace ที่จำเป็นทำให้ compiler หา class ไม่เจอ', 'Missing required using namespace causes the compiler to not find the class.'),
  ],
  'unity-shaderlab': [
    t('ShaderLab ต้องมี SubShader, Pass ครบ — ลืมจะ compile ไม่ผ่าน', 'ShaderLab requires SubShader and Pass — missing them causes compilation failure.'),
    t('Property ต้องประกาศทั้งใน Properties{} และใน CGPROGRAM — ไม่ตรงกันจะ error', 'Properties must be declared in both Properties{} and CGPROGRAM — mismatches cause errors.'),
    t('ดูชื่อ semantics เช่น POSITION, COLOR ให้ถูกต้อง', 'Check semantic names like POSITION, COLOR for correctness.'),
    t('ลืมปิด ENDCG หลังจาก CGPROGRAM จะ compile ไม่ผ่าน', 'Missing ENDCG after CGPROGRAM causes compilation failure.'),
  ],
  'unreal-cpp': [
    t('Unreal C++ ใช้ UPROPERTY, UFUNCTION — ลืม macro จะไม่แสดงใน Blueprint', 'Unreal C++ uses UPROPERTY, UFUNCTION — missing macros hide them from Blueprint.'),
    t('ดู include ให้ครบ — Unreal มี header เฉพาะที่ต้อง include', 'Check includes are complete — Unreal has specific required headers.'),
    t('nullptr crash มักเกิดจาก Cast ที่ล้มเหลว — เช็ก null หลัง Cast เสมอ', 'nullptr crash often comes from failed Cast — always check null after Cast.'),
    t('ชื่อ class ต้องขึ้นต้นด้วย A (Actor) หรือ U (Object) ตาม convention', 'Class names must start with A (Actor) or U (Object) per convention.'),
  ],
  glsl: [
    t('GLSL ต้องประกาศ precision สำหรับ float ใน fragment shader', 'GLSL must declare precision for float in fragment shaders.'),
    t('ดู type ของ uniform/varying ให้ตรงกันระหว่าง vertex และ fragment shader', 'Check uniform/varying types match between vertex and fragment shaders.'),
    t('gl_FragColor, gl_Position เป็นตัวแปร built-in — พิมพ์ผิดจะ error', 'gl_FragColor, gl_Position are built-in — typos cause errors.'),
    t('vec dimension ต้องตรง — เช่น vec3 * vec2 จะ error', 'vec dimensions must match — e.g., vec3 * vec2 causes errors.'),
  ],
  'phaser-typescript': [
    t('Phaser TS ใช้ this.add, this.physics — พิมพ์ชื่อ method ผิดจะได้ undefined', 'Phaser TS uses this.add, this.physics — method typos give undefined.'),
    t('ดู scene lifecycle: preload, create, update — ชื่อต้องตรงตัว', 'Check scene lifecycle: preload, create, update — names must match exactly.'),
    t('this.load ต้องอยู่ใน preload เท่านั้น — ใช้ที่อื่นจะไม่โหลด asset', 'this.load must be in preload only — using elsewhere won\'t load assets.'),
    t('Type error มักเกิดจาก TypeScript strict mode — ดู type annotation ให้ครบ', 'Type errors often come from TypeScript strict mode — check type annotations.'),
  ],
  'rpg-maker-js': [
    t('RPG Maker JS ใช้ $gameVariables, $gameSwitches — พิมพ์ผิดจะได้ undefined', 'RPG Maker JS uses $gameVariables, $gameSwitches — typos give undefined.'),
    t('ดูชื่อ plugin parameter ให้ตรงกับที่ประกาศ — ผิดตัวเดียวจะไม่ทำงาน', 'Check plugin parameter names match declarations — one wrong character means it won\'t work.'),
    t('this._xxx เป็น private convention — เรียกจากนอก class จะไม่เจอ', 'this._xxx is a private convention — calling from outside the class won\'t find it.'),
    t('Scene_xxx, Window_xxx ต้อง extends class ที่ถูกต้อง', 'Scene_xxx, Window_xxx must extend the correct class.'),
  ],
  'gamemaker-gml': [
    t('GML ใช้ var สำหรับ local variable — ลืม var จะกลายเป็น instance variable', 'GML uses var for local variables — forgetting var makes it an instance variable.'),
    t('ดูชื่อ built-in function เช่น draw_text, instance_create_layer ให้ถูกต้อง', 'Check built-in function names like draw_text, instance_create_layer for correctness.'),
    t('ลืม { } ครอบ multi-line if/for จะทำงานแค่บรรทัดแรก', 'Missing { } around multi-line if/for runs only the first line.'),
    t('undefined มักเกิดจากตัวแปรที่ยังไม่ได้สร้างใน Create event', 'undefined often comes from variables not created in the Create event.'),
  ],
  'defold-lua': [
    t('Defold Lua ใช้ msg.post, go.get — พิมพ์ชื่อ API ผิดจะไม่ทำงาน', 'Defold Lua uses msg.post, go.get — misspelling API names means they won\'t work.'),
    t('ลืม end ปิด function/if เป็น error ที่พบบ่อย', 'Missing end to close function/if is a common error.'),
    t('ดูชื่อ component/game object ใน URL ให้ตรง — พิมพ์ผิดจะส่ง message ไม่ถึง', 'Check component/game object names in URLs — typos mean messages won\'t arrive.'),
    t('nil error มักเกิดจากตัวแปรที่ประกาศไม่ถูก scope', 'nil errors often come from variables declared in the wrong scope.'),
  ],
  'cocos-typescript': [
    t('Cocos TS ใช้ @ccclass, @property — ลืม decorator จะไม่แสดงใน editor', 'Cocos TS uses @ccclass, @property — missing decorators hide them from the editor.'),
    t('ดู cc.Node, cc.Sprite method ให้ถูกต้อง — version ต่างกันอาจชื่อต่างกัน', 'Check cc.Node, cc.Sprite methods — different versions may have different names.'),
    t('this.node ต้องมีอยู่จริงใน scene — ถ้าไม่มีจะได้ null', 'this.node must exist in the scene — if missing, it returns null.'),
    t('Type error จาก TypeScript strict mode — ดู type ของ property ให้ครบ', 'Type errors from TypeScript strict mode — check property types are complete.'),
  ],
  'bevy-rust': [
    t('Bevy ใช้ ECS pattern — Component, System, Resource ต้องประกาศ derive macro ให้ครบ', 'Bevy uses ECS pattern — Component, System, Resource need complete derive macros.'),
    t('query type ต้องตรงกับ component ที่มี — ถ้าไม่ตรงจะไม่ได้ entity', 'Query types must match existing components — mismatches return no entities.'),
    t('ดู borrow checker — &mut กับ & พร้อมกันใน query เดียวจะ error', 'Watch the borrow checker — &mut and & together in one query cause errors.'),
    t('Plugin ต้อง add_plugins ก่อน — ลืมจะไม่มี system ทำงาน', 'Plugins must be added via add_plugins first — missing means no systems run.'),
  ],
  'renpy-python': [
    t('Ren\'Py ใช้ indentation เหมือน Python — ย่อหน้าผิดจะเจอ error', 'Ren\'Py uses indentation like Python — wrong indentation causes errors.'),
    t('label, jump, call ต้องชื่อตรง — พิมพ์ผิดจะหา label ไม่เจอ', 'label, jump, call names must match — typos cause label not found.'),
    t('$ นำหน้า Python code ใน Ren\'Py — ลืม $ จะตีความเป็น dialogue', '$ prefixes Python code in Ren\'Py — forgetting $ interprets it as dialogue.'),
    t('ดู character definition ให้ตรง — ชื่อตัวแปร character พิมพ์ผิดจะ error', 'Check character definitions — misspelled character variable names cause errors.'),
  ],
}

const commonGuide: LocalizedText[] = [
  t('อ่าน error message ก่อนเสมอ — จะบอกว่าอะไร "expected" กับอะไร "got"', 'Always read the error message first — it tells you what was expected vs. what was got.'),
  t('หาเลขบรรทัดที่ error ชี้ แล้วดูบรรทัดนั้นกับบริบทรอบ ๆ', 'Find the line number the error points to, then check that line and surrounding context.'),
  t('เทียบชื่อตัวแปร/method กับที่ประกาศจริง — typo เป็นสาเหตุที่พบบ่อยมาก', 'Compare variable/method names with their actual declarations — typos are extremely common.'),
  t('ดู type ของค่าว่าตรงกับที่ฟังก์ชันคาดหวังหรือไม่', 'Check if the value type matches what the function expects.'),
]

export type FixErrorGuideDataEntry = {
  overview: LocalizedText
  firstPassChecklist: LocalizedText[]
  commonFalseStarts: LocalizedText[]
  workedExampleLens: LocalizedText[]
}

const buildOverview = (languageId: FixErrorSupportedLanguageId): LocalizedText => {
  const guide = guideBookEntries[languageId]

  return t(
    `${guide.label.th} ในโหมด Fix Error แบบ easy มักให้ error ชัดพอจะเริ่มจากข้อความด้านล่างได้ แต่ยังต้องย้อนดูว่าบรรทัดไหนเป็นต้นเหตุแรกจริง ไม่ใช่บรรทัดที่อาการระเบิดออกมา`,
    `Easy ${guide.label.en} Fix Error prompts usually give you an error clear enough to start from the bottom message, but you still have to trace back to the first breaking line instead of the line where the symptom explodes.`,
  )
}

const buildFalseStarts = (languageId: FixErrorSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  const lookalikes = guide.falseFriends.slice(0, 2)

  return [
    t(
      `อย่ารีบชี้บรรทัดที่มีอาการแรงสุด ถ้ายังไม่ได้เทียบกับบรรทัดก่อนหน้า เพราะ ${guide.label.th} ชอบทำให้ symptom โผล่ช้ากว่าต้นเหตุ`,
      `Do not rush to the loudest-looking line before checking the line right before it. ${guide.label.en} often lets the symptom show up later than the real culprit.`,
    ),
    t(
      `ถ้าบรรทัดดูคล้าย ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.th : 'ตัวอื่นในตระกูลเดียวกัน'} ให้กลับไปอ่าน error message อีกรอบ แล้วดูว่าโจทย์กำลังฟ้องชื่อผิด, null, range หรือ syntax กันแน่`,
      `If the line surface starts looking like ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.en : 'a nearby language lookalike'}, read the error message again and decide whether the prompt is really pointing at a typo, null, range, or syntax failure.`,
    ),
    t(
      `อย่าปล่อยให้ชื่อแปรหรือ method ที่คุ้นตาหลอกคุณ บรรทัด setup ที่ดูธรรมดาใน ${guide.label.th} บางทีคือจุดที่ state เพี้ยนมาตั้งแต่แรก`,
      `Do not let familiar variable or method names lull you. In ${guide.label.en}, a harmless-looking setup line is sometimes where the state first goes wrong.`,
    ),
  ]
}

const buildWorkedLens = (languageId: FixErrorSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  return guide.debugFocus.th.map((th, index) => t(th, guide.debugFocus.en[index] ?? guide.debugFocus.en[0] ?? th))
}

export const fixErrorGuideData = Object.fromEntries(
  fixErrorSupportedLanguageIds.map((languageId) => [
    languageId,
    {
      overview: buildOverview(languageId),
      firstPassChecklist: languageGuides[languageId] ?? commonGuide,
      commonFalseStarts: buildFalseStarts(languageId),
      workedExampleLens: buildWorkedLens(languageId),
    },
  ]),
) as Record<FixErrorSupportedLanguageId, FixErrorGuideDataEntry>
