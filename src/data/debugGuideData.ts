import { debugSupportedLanguageIds, type DebugSupportedLanguageId } from './debugData'
import { guideBookEntries } from './guideData'
import type { LocalizedText } from './quizModels'

const t = (th: string, en: string): LocalizedText => ({ th, en })

const languageGuides: Partial<Record<DebugSupportedLanguageId, LocalizedText[]>> = {
  python: [
    t('ดู Traceback จากล่างขึ้นบน — บรรทัดสุดท้ายคือจุดที่ crash จริง', 'Read Traceback bottom-up — the last line is where the crash actually happens.'),
    t('NameError มักเกิดจาก typo ในชื่อตัวแปร เทียบชื่อกับที่ประกาศจริง', 'NameError usually comes from variable name typos — compare with actual declarations.'),
    t('TypeError: NoneType มักแปลว่า function คืน None ทั้งที่คาดว่าจะมีค่า', 'TypeError: NoneType usually means a function returned None when a value was expected.'),
    t('ดู indentation — ถ้า logic อยู่ผิด block จะทำงานผิดลำดับโดยไม่ error', 'Check indentation — if logic is in the wrong block, it runs in the wrong order silently.'),
  ],
  java: [
    t('Exception stack trace อ่านจากบนลงล่าง — บรรทัดแรกคือจุดที่ error เกิด', 'Read exception stack trace top-down — the first line is where the error occurred.'),
    t('NullPointerException ดูว่าตัวแปรไหนเป็น null แล้วย้อนกลับหาจุดที่ไม่ได้ assign', 'For NullPointerException, find which variable is null and trace back to where it wasn\'t assigned.'),
    t('ClassCastException เกิดจาก cast ผิด type — ดู type จริงของ object', 'ClassCastException comes from wrong type casting — check the actual object type.'),
    t('ดู log ว่าข้อมูลที่ส่งเข้า method มีค่าตรงกับที่คาดหรือไม่', 'Check if the data sent to a method matches what was expected in the logs.'),
  ],
  javascript: [
    t('TypeError: Cannot read properties of undefined — ดูว่า object มีค่ายัง ก่อนเรียก property', 'TypeError: Cannot read properties of undefined — check if the object has a value before accessing properties.'),
    t('console.log ตรงจุดที่สงสัย แล้วดูว่าค่าจริงตรงกับที่คิดหรือไม่', 'Add console.log at suspicious spots, then check if actual values match expectations.'),
    t('async/await ดูว่า await อยู่ถูกที่ — ลืม await จะได้ Promise แทนค่าจริง', 'Check async/await placement — missing await returns a Promise instead of the actual value.'),
    t('ดูลำดับการทำงาน — JavaScript เป็น async ดังนั้น callback อาจทำงานทีหลัง', 'Check execution order — JavaScript is async, so callbacks may run later.'),
  ],
  csharp: [
    t('NullReferenceException ดูว่า object ไหนเป็น null — ย้อนกลับหาจุดที่ไม่ได้ assign', 'For NullReferenceException, find which object is null and trace back to the missing assignment.'),
    t('InvalidCastException เกิดจาก cast ผิด type — เช็ก type จริงของ object', 'InvalidCastException comes from wrong type casting — verify the actual object type.'),
    t('ดู stack trace ว่า method ไหนเรียกก่อน-หลัง เพื่อหา flow ที่ผิดปกติ', 'Read the stack trace to see method call order and find abnormal flow.'),
    t('ArgumentException มักเกิดจากส่ง parameter ผิด type หรือค่าไม่ถูกต้อง', 'ArgumentException usually comes from passing parameters with wrong type or invalid values.'),
  ],
  cpp: [
    t('Segfault ดูว่า pointer ไหนเป็น nullptr — ใช้ debugger ดู memory address', 'For segfault, check which pointer is nullptr — use a debugger to inspect memory addresses.'),
    t('ดู stack trace จาก core dump — หาจุดที่ crash จริง', 'Read the stack trace from core dump — find where the crash actually happened.'),
    t('Memory leak ดูว่า new/malloc จับคู่กับ delete/free ครบหรือไม่', 'For memory leaks, check if every new/malloc is paired with delete/free.'),
    t('undefined behavior มักเกิดจากเข้าถึง array นอกขอบเขตหรือใช้ dangling pointer', 'Undefined behavior often comes from out-of-bounds array access or dangling pointers.'),
  ],
  dart: [
    t('Null check operator used on a null value — ดูว่าตัวแปรไหนเป็น null ตอน force unwrap', 'Null check operator used on a null value — find which variable is null during force unwrap.'),
    t('ดู type ที่ Flutter widget คาดหวัง — ส่ง type ผิดจะ error ตอน build', 'Check the type Flutter widgets expect — wrong types cause errors at build time.'),
    t('setState ต้องอยู่ใน StatefulWidget — เรียกผิดที่จะ error', 'setState must be in StatefulWidget — calling it elsewhere causes errors.'),
    t('ดู async/await — Future ที่ไม่ได้ await จะคืน Future object แทนค่าจริง', 'Check async/await — unawaited Future returns Future object instead of actual value.'),
  ],
  go: [
    t('nil pointer dereference ดูว่า pointer ไหนเป็น nil — ย้อนหาจุดที่ return nil', 'For nil pointer dereference, find which pointer is nil — trace back to where nil was returned.'),
    t('error จาก function ต้องเช็กทุกครั้ง — ลืมเช็ก err จะพลาด bug', 'Errors from functions must be checked every time — missing err checks hide bugs.'),
    t('goroutine race condition ดูว่ามี shared state ที่ไม่ได้ lock', 'For goroutine race conditions, check if shared state is missing locks.'),
    t('ดู log.Printf ว่าค่าจริงตรงกับที่คาดหรือไม่', 'Check log.Printf to see if actual values match expectations.'),
  ],
  kotlin: [
    t('KotlinNullPointerException เกิดจาก !! บน null — ย้อนหาว่าทำไมค่าเป็น null', 'KotlinNullPointerException comes from !! on null — trace back to find why the value is null.'),
    t('ClassCastException ดู type จริง — smart cast อาจไม่ทำงานถ้า type เปลี่ยนระหว่าง thread', 'For ClassCastException, check actual types — smart cast may fail if types change across threads.'),
    t('ดู coroutine scope — launch/async ที่ไม่ได้ join อาจจบก่อนได้ค่า', 'Check coroutine scope — launch/async without join may complete before getting values.'),
    t('lateinit property ต้อง assign ก่อนใช้ — ลืมจะเจอ UninitializedPropertyAccessException', 'lateinit properties must be assigned before use — forgetting causes UninitializedPropertyAccessException.'),
  ],
  swift: [
    t('Fatal error: Unexpectedly found nil — ดูว่า Optional ไหนถูก force unwrap ด้วย !', 'Fatal error: Unexpectedly found nil — check which Optional was force unwrapped with !.'),
    t('ดู guard let / if let ว่าครอบทุกจุดที่อาจเป็น nil', 'Check guard let / if let covers all possible nil points.'),
    t('Index out of range ดูว่า array ที่เข้าถึงมีขนาดพอหรือไม่', 'For index out of range, verify the array is large enough.'),
    t('ดู closure capture — [weak self] อาจทำให้ self เป็น nil ใน closure', 'Check closure capture — [weak self] can make self nil inside closures.'),
  ],
  ruby: [
    t('NoMethodError for nil:NilClass — ดูว่าตัวแปรไหนเป็น nil ก่อนเรียก method', 'NoMethodError for nil:NilClass — find which variable is nil before the method call.'),
    t('ดู backtrace จากบนลงล่าง — หาจุดที่ error เกิดจริง', 'Read the backtrace top-down — find where the error actually occurred.'),
    t('ArgumentError ดูจำนวน argument ที่ส่งเข้า method ว่าตรงหรือไม่', 'For ArgumentError, check if the number of arguments sent to the method matches.'),
    t('ดู puts/p ตรงจุดที่สงสัย เพื่อเช็กค่าจริงในแต่ละขั้นตอน', 'Add puts/p at suspicious spots to check actual values at each step.'),
  ],
  jsx: [
    t('Cannot read properties of undefined — ดูว่า state/props มีค่ายังก่อน render', 'Cannot read properties of undefined — check if state/props have values before render.'),
    t('ดู useEffect dependency array — ลืมใส่ dependency ทำให้ไม่ re-run เมื่อค่าเปลี่ยน', 'Check useEffect dependency array — missing dependencies prevent re-runs on value changes.'),
    t('key prop ผิดหรือซ้ำใน list จะทำให้ re-render ไม่ถูกต้อง', 'Wrong or duplicate key props in lists cause incorrect re-renders.'),
    t('ดู console ใน browser DevTools — warning มักบอกปัญหาก่อนจะ error จริง', 'Check console in browser DevTools — warnings often reveal problems before actual errors.'),
  ],
  typescript: [
    t('Type error ดู expected vs actual type — TypeScript จะบอกว่าคาดหวัง type อะไรกับที่ได้จริง', 'For type errors, check expected vs actual type — TypeScript tells you what was expected vs received.'),
    t('ดู type narrowing — ตรงจุดที่ type อาจเป็นหลาย type ต้อง narrow ก่อนใช้', 'Check type narrowing — at points where types can be multiple, narrow before use.'),
    t('Object is possibly undefined — ต้องเช็ก null/undefined ก่อนเข้าถึง property', 'Object is possibly undefined — must check null/undefined before accessing properties.'),
    t('Generic type mismatch ดูว่า T ที่ส่งเข้าตรงกับที่ function คาดหวังหรือไม่', 'For generic type mismatch, check if the T passed matches what the function expects.'),
  ],
  bash: [
    t('ดู exit code ($?) หลังรันคำสั่ง — 0 = สำเร็จ, ค่าอื่น = error', 'Check exit code ($?) after commands — 0 = success, anything else = error.'),
    t('set -x จะแสดงทุกคำสั่งที่รันจริง — ช่วยหาจุดที่ logic ผิด', 'set -x shows every command actually run — helps find where logic goes wrong.'),
    t('unbound variable มักเกิดจากใช้ตัวแปรที่ยังไม่ได้ assign หรือพิมพ์ชื่อผิด', 'unbound variable usually comes from using unassigned variables or name typos.'),
    t('ดู quoting — ตัวแปรที่มี space ต้องครอบด้วย "" ไม่งั้นจะแตกเป็นหลาย argument', 'Check quoting — variables with spaces must be wrapped in "" or they split into multiple arguments.'),
  ],
  'cloud-functions': [
    t('ดู Cloud Functions log ว่า function ถูกเรียกจริงหรือไม่ — trigger อาจผิด', 'Check Cloud Functions logs to see if the function was actually called — the trigger may be wrong.'),
    t('timeout มักเกิดจาก async operation ที่ไม่ได้ await หรือไม่ได้ส่ง response', 'Timeout usually comes from async operations not awaited or missing response.'),
    t('Permission denied ดู IAM role ว่ามีสิทธิ์เข้าถึง resource ที่ต้องการหรือไม่', 'For permission denied, check IAM role has access to the required resource.'),
    t('Environment variable ที่ undefined ดูว่า config ตั้งค่าถูก environment หรือไม่', 'For undefined environment variables, check if config is set for the correct environment.'),
  ],
  sql: [
    t('ดู query plan / EXPLAIN — หา bottleneck ว่า query ช้าตรงไหน', 'Check query plan / EXPLAIN — find where the bottleneck slows the query.'),
    t('NULL comparison ต้องใช้ IS NULL ไม่ใช่ = NULL — ผลลัพธ์จะต่างกัน', 'NULL comparison must use IS NULL not = NULL — results will differ.'),
    t('JOIN ที่ได้ผลลัพธ์ผิด ดูว่า ON condition ตรงกับที่ต้องการหรือไม่', 'For wrong JOIN results, check if the ON condition matches what you need.'),
    t('GROUP BY column ต้องครบ — column ที่ไม่อยู่ใน aggregate จะ error หรือได้ค่าผิด', 'GROUP BY columns must be complete — columns not in aggregates cause errors or wrong values.'),
  ],
  php: [
    t('Undefined variable ดูว่าประกาศตัวแปรด้วย $ ถูกต้องหรือไม่', 'For undefined variable, check if the variable is correctly declared with $.'),
    t('error_log() ตรงจุดที่สงสัย แล้วดู log file เพื่อเช็กค่าจริง', 'Add error_log() at suspicious spots, then check the log file for actual values.'),
    t('Call to undefined method ดูชื่อ method และ class ว่าตรงกับที่ประกาศ', 'For call to undefined method, check method and class names match declarations.'),
    t('Headers already sent เกิดจากมี output ก่อน header() — ดูว่ามี echo/print ก่อนหรือไม่', 'Headers already sent occurs from output before header() — check for echo/print before it.'),
  ],
  rust: [
    t('borrow checker error ดูว่ามี mutable reference กับ immutable reference พร้อมกันหรือไม่', 'For borrow checker errors, check for simultaneous mutable and immutable references.'),
    t('ดู lifetime annotation — compiler จะบอกว่า reference มีอายุไม่พอ', 'Check lifetime annotations — the compiler tells you when a reference doesn\'t live long enough.'),
    t('unwrap() บน None/Err จะ panic — ใช้ match หรือ ? แทนเพื่อ handle error', 'unwrap() on None/Err causes panic — use match or ? instead to handle errors.'),
    t('type mismatch ดูว่า expected type กับ found type ต่างกันตรงไหน', 'For type mismatch, compare expected type vs found type to see the difference.'),
  ],
  'roblox-lua': [
    t('ดู Output window — Roblox แสดง error พร้อมชื่อ script และเลขบรรทัด', 'Check the Output window — Roblox shows errors with script name and line number.'),
    t('attempt to index nil มักเกิดจาก FindFirstChild ที่หาไม่เจอ — เช็กชื่อ object ให้ตรง', 'attempt to index nil usually comes from FindFirstChild not finding — check object names.'),
    t(': กับ . ต่างกัน — : ส่ง self อัตโนมัติ, . ไม่ส่ง', ': and . differ — : automatically passes self, . does not.'),
    t('WaitForChild ช่วยรอ object ที่ยังโหลดไม่เสร็จ — ไม่ใช้จะได้ nil', 'WaitForChild waits for objects that haven\'t loaded yet — not using it gives nil.'),
  ],
  'love2d-lua': [
    t('ดู terminal/console output — Love2D แสดง error message พร้อมเลขบรรทัด', 'Check terminal/console output — Love2D shows error messages with line numbers.'),
    t('nil error มักเกิดจากตัวแปรที่ยังไม่ได้สร้างใน love.load', 'nil errors often come from variables not yet created in love.load.'),
    t('draw function ต้องอยู่ใน love.draw เท่านั้น — เรียกที่อื่นจะไม่เห็นผล', 'Draw functions must be in love.draw only — calling elsewhere shows no result.'),
    t('ดูลำดับ parameter — love.graphics API มักเป็น (x, y, ...) ลำดับผิดจะวาดไม่ถูก', 'Check parameter order — love.graphics API is usually (x, y, ...) — wrong order draws incorrectly.'),
  ],
  'godot-gdscript': [
    t('ดู Debugger panel — Godot แสดง error พร้อม stack trace และค่าตัวแปร', 'Check Debugger panel — Godot shows errors with stack trace and variable values.'),
    t('Invalid get index มักเกิดจาก $NodePath ที่ชื่อไม่ตรง', 'Invalid get index usually comes from $NodePath with a wrong name.'),
    t('signal connected ถูกที่หรือไม่ — ถ้า connect ผิด method จะไม่ถูกเรียก', 'Is the signal connected correctly? — wrong connect means the method won\'t be called.'),
    t('onready ต้องอยู่ก่อน _ready() — ถ้าไม่ใช้ onready ใน _ready จะยังไม่มีค่า', 'onready must fire before _ready() — without onready, variables in _ready may not have values.'),
  ],
  'godot-shader': [
    t('ดู shader compiler error — Godot แสดงเลขบรรทัดที่ผิดใน shader editor', 'Check the shader compiler error — Godot shows the line number in the shader editor.'),
    t('type mismatch ตรง vec ที่ใช้ — dimension ต้องตรงกัน', 'Check type mismatch at vec usage — dimensions must match.'),
    t('uniform ที่ไม่มีผลอาจเป็นเพราะชื่อไม่ตรงกับที่ GDScript ส่งมา', 'Uniforms with no effect may be because the name doesn\'t match what GDScript sends.'),
    t('ดู hint ของ uniform — shader_type ต้องรองรับ hint ที่ใช้', 'Check uniform hints — shader_type must support the hint used.'),
  ],
  'unity-csharp': [
    t('ดู Console window — Unity แสดง error พร้อม stack trace แบบคลิกไปบรรทัดได้', 'Check Console window — Unity shows errors with clickable stack traces.'),
    t('MissingReferenceException มักเกิดจาก object ที่ถูก Destroy แล้วยังเรียกใช้', 'MissingReferenceException usually comes from using an object after it was Destroyed.'),
    t('ดู Inspector ว่า field ที่เป็น SerializeField ถูก assign ค่าแล้วหรือยัง', 'Check Inspector to see if SerializeField fields have been assigned values.'),
    t('Coroutine ดูว่า yield return อยู่ถูกที่ — null จาก coroutine มักเกิดจาก timing', 'Check if yield return is in the right place — null from coroutines often comes from timing.'),
  ],
  'unity-shaderlab': [
    t('ดู shader compiler error ใน Console — จะบอกเลขบรรทัดใน shader file', 'Check shader compiler errors in Console — they show line numbers in the shader file.'),
    t('Property ที่ไม่ส่งค่าเข้า CGPROGRAM ดูว่าประกาศชื่อตรงกันหรือไม่', 'For properties not passing to CGPROGRAM, check if names match between declarations.'),
    t('ดู render pipeline ว่าตรงกับ shader type — URP/HDRP ใช้ shader ต่างกัน', 'Check if render pipeline matches shader type — URP/HDRP use different shaders.'),
    t('semantic ผิดจะทำให้ vertex data ส่งไม่ถึง fragment shader', 'Wrong semantics cause vertex data to not reach the fragment shader.'),
  ],
  'unreal-cpp': [
    t('ดู Output Log — Unreal แสดง error พร้อมชื่อ class และเลขบรรทัด', 'Check Output Log — Unreal shows errors with class name and line number.'),
    t('Access violation มักเกิดจาก Cast ที่ล้มเหลวแล้วไม่เช็ก nullptr', 'Access violation usually comes from failed Cast without checking nullptr.'),
    t('Blueprint connection ที่หายไปอาจเกิดจากเปลี่ยนชื่อ UFUNCTION', 'Missing Blueprint connections may come from renamed UFUNCTION.'),
    t('ดู UE_LOG — เพิ่ม log ตรงจุดที่สงสัยแล้วดูใน Output Log', 'Check UE_LOG — add logs at suspicious spots and check Output Log.'),
  ],
  glsl: [
    t('ดู shader compilation error — จะบอก error type และเลขบรรทัด', 'Check shader compilation error — it shows error type and line number.'),
    t('type mismatch ตรง vec operation — vec3 กับ float ต้อง cast ให้ถูก', 'Check type mismatch in vec operations — vec3 with float needs correct casting.'),
    t('ดู varying/uniform ว่าชื่อตรงกันระหว่าง vertex กับ fragment shader', 'Check varying/uniform names match between vertex and fragment shaders.'),
    t('precision error ดูว่าประกาศ precision ถูกต้องสำหรับ platform ที่ใช้', 'For precision errors, check if precision is correctly declared for the target platform.'),
  ],
  'phaser-typescript': [
    t('ดู browser console — Phaser แสดง error พร้อม stack trace ใน DevTools', 'Check browser console — Phaser shows errors with stack traces in DevTools.'),
    t('this context ผิดใน callback — ใช้ arrow function หรือ .bind(this) แก้ได้', 'Wrong this context in callbacks — fix with arrow functions or .bind(this).'),
    t('Asset ที่โหลดไม่สำเร็จจะเป็น undefined — ดู preload ว่า key ตรงกับที่ใช้', 'Failed asset loads give undefined — check if preload key matches usage.'),
    t('Physics body ที่ไม่ทำงาน ดูว่า enable physics ก่อน access property', 'For non-working physics bodies, check if physics is enabled before accessing properties.'),
  ],
  'rpg-maker-js': [
    t('ดู F12 Console — RPG Maker แสดง JavaScript error ใน DevTools', 'Check F12 Console — RPG Maker shows JavaScript errors in DevTools.'),
    t('$gameXxx ที่เป็น null อาจเกิดจากเรียกก่อนที่ game object จะสร้างเสร็จ', 'null $gameXxx may come from calling before game objects are fully created.'),
    t('Plugin conflict ดูลำดับ plugin — ลำดับผิดอาจทำให้ override ไม่ทำงาน', 'For plugin conflicts, check plugin order — wrong order may break overrides.'),
    t('ดู this reference — ใน callback อาจไม่ชี้ไป Scene/Window ที่คาดหวัง', 'Check this reference — in callbacks it may not point to the expected Scene/Window.'),
  ],
  'gamemaker-gml': [
    t('ดู Output Window — GameMaker แสดง error พร้อมชื่อ object และเลขบรรทัด', 'Check Output Window — GameMaker shows errors with object name and line number.'),
    t('Variable not set before reading — ดูว่าสร้างตัวแปรใน Create event แล้วหรือยัง', 'Variable not set before reading — check if the variable was created in the Create event.'),
    t('instance_exists() ช่วยเช็กก่อนเข้าถึง instance — ไม่เช็กอาจ crash', 'instance_exists() helps check before accessing instances — not checking may crash.'),
    t('ดู Draw event ว่าวาดถูก layer หรือไม่ — วาดที่ Draw GUI กับ Draw ให้ผลต่างกัน', 'Check if Draw event draws on the right layer — Draw GUI and Draw give different results.'),
  ],
  'defold-lua': [
    t('ดู Console — Defold แสดง error พร้อมชื่อ script component และเลขบรรทัด', 'Check Console — Defold shows errors with script component name and line number.'),
    t('msg.post ที่ไม่ทำงานอาจเกิดจาก URL ที่ผิด — เช็กชื่อ component/object', 'Non-working msg.post may come from wrong URL — check component/object names.'),
    t('go.get/go.set ต้องใช้ property ที่มีอยู่จริง — ดู API reference', 'go.get/go.set must use existing properties — check the API reference.'),
    t('nil error ดูว่าตัวแปรอยู่ถูก scope — local ใน function จะหายเมื่อ function จบ', 'For nil errors, check variable scope — local in function disappears when function ends.'),
  ],
  'cocos-typescript': [
    t('ดู Console ใน Cocos Creator — แสดง error พร้อม stack trace', 'Check Console in Cocos Creator — shows errors with stack traces.'),
    t('@property ที่ไม่แสดงใน editor ดูว่า type annotation ถูกต้องหรือไม่', 'For @property not showing in editor, check if type annotation is correct.'),
    t('this.node ที่เป็น null อาจเกิดจาก script ไม่ได้ attach กับ node', 'null this.node may come from script not attached to any node.'),
    t('schedule/unschedule ดูว่า callback ตรงกัน — ไม่ตรงจะ unschedule ไม่สำเร็จ', 'Check schedule/unschedule callback matches — mismatches prevent successful unschedule.'),
  ],
  'bevy-rust': [
    t('ดู panic message — Bevy แสดง error ละเอียดพร้อม backtrace', 'Check panic message — Bevy shows detailed errors with backtrace.'),
    t('Query ที่ไม่ได้ entity ดูว่า component ที่ query ตรงกับที่ entity มี', 'For queries returning no entities, check if queried components match what entities have.'),
    t('System ordering ดูว่า system ทำงานถูกลำดับ — ใช้ .before()/.after() กำหนด', 'For system ordering, check execution order — use .before()/.after() to specify.'),
    t('Resource ที่ไม่มี จะ panic — ต้อง insert_resource ก่อน system ที่ใช้', 'Missing Resources cause panic — must insert_resource before systems that use it.'),
  ],
  'renpy-python': [
    t('ดู traceback window — Ren\'Py แสดง error พร้อมชื่อ script file และเลขบรรทัด', 'Check the traceback window — Ren\'Py shows errors with script file name and line number.'),
    t('NameError ดูว่า variable/label ที่อ้างมีอยู่จริงหรือไม่', 'For NameError, check if the referenced variable/label actually exists.'),
    t('Indentation error ดูว่าใช้ spaces ไม่ใช่ tabs — Ren\'Py เข้มงวดเรื่องนี้', 'For indentation errors, check that spaces are used not tabs — Ren\'Py is strict about this.'),
    t('$ block ที่ไม่ทำงาน ดูว่า indentation อยู่ใน label ที่ถูกต้อง', 'For non-working $ blocks, check if indentation is under the correct label.'),
  ],
}

const commonGuide: LocalizedText[] = [
  t('เริ่มจากอ่าน log ให้รู้ว่า error เกิดจากข้อมูลว่างหรือข้อมูลไม่ครบหรือไม่', 'Start by checking whether the log points to null or missing data.'),
  t('เช็กว่ารูปแบบข้อมูลที่ UI ใช้ตรงกับ response จริงหรือไม่', 'Verify that the UI expects the same response shape you return.'),
  t('ตรวจชื่อ config/env และ path ที่ถูกโหลดว่าตรงกับที่ประกาศไว้', 'Confirm config/env keys and loaded paths match what is declared.'),
  t('ดูลำดับการทำงาน — async operation อาจทำให้ค่ายังไม่พร้อมตอนใช้', 'Check execution order — async operations may leave values unready when used.'),
]

export type DebugGuideDataEntry = {
  overview: LocalizedText
  triageChecklist: LocalizedText[]
  symptomVsRootCauseWarnings: LocalizedText[]
  workedExampleLens: LocalizedText[]
}

const buildOverview = (languageId: DebugSupportedLanguageId): LocalizedText => {
  const guide = guideBookEntries[languageId]

  return t(
    `${guide.label.th} ในโหมด Debug แบบ easy จะบอกทั้ง scenario และ log ค่อนข้างตรง แต่สิ่งที่ต้องระวังคืออย่าเผลอเลือกอาการปลายทางแทน root cause แรกของ flow`,
    `Easy ${guide.label.en} Debug gives you a fairly direct scenario and log, but the trap is still choosing the downstream symptom instead of the first root cause in the flow.`,
  )
}

const buildWarnings = (languageId: DebugSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  const lookalikes = guide.falseFriends.slice(0, 2)

  return [
    t(
      `ถ้า log ดูเหมือนฟ้องปลายทาง ให้ย้อนถามก่อนว่าอะไรทำให้ค่าของ ${guide.label.th} เพี้ยนมาตั้งแต่ต้น ไม่ใช่ดูแค่บรรทัดที่ crash`,
      `If the log looks like a downstream complaint, ask what corrupted the ${guide.label.en} flow earlier rather than staring only at the crash line.`,
    ),
    t(
      `ถ้าหน้าตา snippet ชวนให้นึกถึง ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.th : 'ตัวข้างเคียง'} หรือ ${lookalikes[1] ? guideBookEntries[lookalikes[1]].label.th : 'อีกตัวหนึ่ง'} ให้ใช้ log กับ scenario ชี้ว่าโจทย์กำลังฟ้อง data, selector, config, null หรือ typo กันแน่`,
      `If the snippet surface starts resembling ${lookalikes[0] ? guideBookEntries[lookalikes[0]].label.en : 'a nearby lookalike'} or ${lookalikes[1] ? guideBookEntries[lookalikes[1]].label.en : 'another neighbor'}, use the log and scenario to decide whether the prompt is really about data, selector, config, null, or typo.`,
    ),
    t(
      `อย่าปล่อยให้ข้อความ error ที่คุ้นตาหลอกคุณ ใน ${guide.label.th} root cause มักซ่อนอยู่ก่อน log บรรทัดสุดท้ายหนึ่งช่วงเสมอ`,
      `Do not let a familiar error string fool you. In ${guide.label.en}, the root cause often sits one step before the last dramatic log line.`,
    ),
  ]
}

const buildWorkedLens = (languageId: DebugSupportedLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  return guide.debugFocus.th.map((th, index) => t(th, guide.debugFocus.en[index] ?? guide.debugFocus.en[0] ?? th))
}

export const debugGuideData = Object.fromEntries(
  debugSupportedLanguageIds.map((languageId) => [
    languageId,
    {
      overview: buildOverview(languageId),
      triageChecklist: languageGuides[languageId] ?? commonGuide,
      symptomVsRootCauseWarnings: buildWarnings(languageId),
      workedExampleLens: buildWorkedLens(languageId),
    },
  ]),
) as Record<DebugSupportedLanguageId, DebugGuideDataEntry>
