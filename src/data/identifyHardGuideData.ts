import { guideBookEntries, trackTopicIds } from './guideData'
import type { CoreLanguageId, GameLanguageId, LanguageId, LocalizedText } from './quizModels'

export type IdentifyHardFalseFriendSplit = {
  target: LanguageId
  points: LocalizedText[]
}

export type IdentifyHardGuideEntry = {
  snapshot: LocalizedText
  checklist: LocalizedText[]
  falseFriendSplits: IdentifyHardFalseFriendSplit[]
}

const t = (th: string, en: string): LocalizedText => ({ th, en })

const list = (items: Array<[string, string]>) => items.map(([th, en]) => t(th, en))

const split = (target: LanguageId, items: Array<[string, string]>): IdentifyHardFalseFriendSplit => ({
  target,
  points: list(items),
})

const formatSignatureMarker = (languageId: LanguageId, index: number) => {
  const guide = guideBookEntries[languageId]
  return guide.signature[index] ?? guide.quickSpot.en
}

const buildGameIdentifyHardSnapshot = (languageId: GameLanguageId): LocalizedText => {
  const guide = guideBookEntries[languageId]
  const primaryMarker = formatSignatureMarker(languageId, 0)
  const secondaryMarker = formatSignatureMarker(languageId, 1)

  return t(
    `${guide.label.th} แบบ hard มักไม่ปล่อย marker ตัวเดียว แต่จะผสม ${primaryMarker} กับ ${secondaryMarker} และบริบทของ engine จนต้องอ่านทั้ง syntax กับ ecosystem ไปพร้อมกัน`,
    `Hard ${guide.label.en} rarely hands you a single marker. It tends to blend ${primaryMarker} with ${secondaryMarker} and engine context, so you have to read both the syntax and the ecosystem together.`,
  )
}

const buildGameIdentifyHardChecklist = (languageId: GameLanguageId): LocalizedText[] => {
  const guide = guideBookEntries[languageId]
  const primaryMarker = formatSignatureMarker(languageId, 0)
  const secondaryMarker = formatSignatureMarker(languageId, 1)
  const tertiaryMarker = formatSignatureMarker(languageId, 2)

  return list([
    [
      `เริ่มจากล็อกกลิ่น ${guide.quickSpot.th} หรือ marker อย่าง ${primaryMarker} กับ ${secondaryMarker} ก่อน แล้วค่อยแยกว่าอันไหนคือของ engine จริง`,
      `Start by locking onto the ${guide.quickSpot.en} smell or markers like ${primaryMarker} and ${secondaryMarker}, then separate which clues truly belong to the engine.`,
    ],
    [
      `ถ้า snippet ดูคล้ายภาษาญาติ ให้ย้อนมอง signature ชั้นลึกอย่าง ${tertiaryMarker} ว่ายังพูดสำเนียงของ ${guide.label.th} อยู่หรือไม่`,
      `If the snippet starts resembling a nearby relative, go back to deeper signatures like ${tertiaryMarker} and confirm they still speak in the accent of ${guide.label.en}.`,
    ],
    [
      `โจทย์ hard ของ ${guide.label.th} มักเอา marker ด้าน lifecycle, API หรือ shader มาซ้อนกัน จึงต้องอ่านทั้งบรรทัด ไม่ใช่เดาจาก keyword ตัวเดียว`,
      `Hard ${guide.label.en} prompts often stack lifecycle, API, or shader markers together, so read the whole snippet instead of guessing from one keyword alone.`,
    ],
  ])
}

const buildGameIdentifyHardFalseFriendSplit = (
  source: GameLanguageId,
  target: LanguageId,
): IdentifyHardFalseFriendSplit => {
  const sourceGuide = guideBookEntries[source]
  const targetGuide = guideBookEntries[target]
  const sourceMarker = formatSignatureMarker(source, 0)
  const targetMarker = formatSignatureMarker(target, 0)

  return split(target, [
    [
      `ถ้า snippet ยังยืนบน ${sourceGuide.quickSpot.th} หรือ marker อย่าง ${sourceMarker} ให้ล็อก ${sourceGuide.label.th} ไว้ก่อน แล้วค่อยหาตัวแยกชั้นลึก`,
      `If the snippet still stands on ${sourceGuide.quickSpot.en} or markers like ${sourceMarker}, keep ${sourceGuide.label.en} in front first and then look for the deeper separator.`,
    ],
    [
      `${targetGuide.label.th} อาจแชร์ผิว syntax บางส่วน แต่ marker อย่าง ${targetMarker} จะออกมาอีกสำเนียงหนึ่ง ไม่ใช่สำเนียงของ ${sourceGuide.label.th}`,
      `${targetGuide.label.en} may share some surface syntax, but markers like ${targetMarker} speak in a different accent from ${sourceGuide.label.en}.`,
    ],
  ])
}

const coreIdentifyHardGuideData: Record<CoreLanguageId, IdentifyHardGuideEntry> = {
  python: {
    snapshot: t(
      'Python ระดับ hard มักโผล่มาในรูป decorator, async flow, dataclass, lambda และ collection logic ที่ยังคงอ่านด้วยการย่อหน้าแทนปีกกา',
      'Hard Python often appears through decorators, async flow, dataclasses, lambdas, and collection-heavy logic that still relies on indentation instead of braces.',
    ),
    checklist: list([
      ['ถ้าไม่มีปีกกาแต่เริ่มมี @decorator, async def, comprehension หรือ dataclass ให้น้ำหนักไปทาง Python', 'If there are no braces but you see decorators, async def, comprehensions, or dataclasses, lean toward Python.'],
      ['ดู self, __init__, defaultdict, lambda และ object mutation ที่ยังดูยืดหยุ่น ไม่ rigid แบบภาษา static', 'Look for self, __init__, defaultdict, lambdas, and flexible object mutation rather than rigid static structure.'],
      ['ต่อให้มี type hint โผล่บ้าง โครงหลักก็ยังเป็น colon + indentation + อ่านคล้ายภาษามนุษย์', 'Even when type hints appear, the backbone is still colon + indentation + human-readable flow.'],
    ]),
    falseFriendSplits: [
      split('typescript', [
        ['TypeScript ต้องมีปีกกาและชั้น type ที่เห็นชัด เช่น interface, type, : string หรือ generic function', 'TypeScript still needs braces and an explicit type layer such as interface, type, : string, or generics.'],
        ['Python hard อาจมี type hint ได้ แต่ไม่เปลี่ยน fact ว่า block ถูกคุมด้วยการย่อหน้าและใช้ def/async def', 'Hard Python may use type hints, but blocks are still controlled by indentation with def/async def.'],
      ]),
      split('rust', [
        ['Rust จะมี fn, let, ::, Result/Option และกลิ่น ownership/reference ที่หนักกว่า', 'Rust brings fn, let, ::, Result/Option, and stronger ownership/reference signals.'],
        ['Python ยังดู dynamic กว่า ไม่มีระบบ type/borrow checker โผล่ในหน้าตา snippet', 'Python still looks more dynamic and does not expose a borrow-checker style type surface in the snippet.'],
      ]),
    ],
  },
  java: {
    snapshot: t(
      'Java ระดับ hard มักอยู่ในโลก stream pipeline, record, sealed interface, generic bound และ method reference ที่ยังคงมีโครง class/type ชัดมาก',
      'Hard Java often lives in stream pipelines, records, sealed interfaces, generic bounds, and method references while keeping a very explicit class/type structure.',
    ),
    checklist: list([
      ['เริ่มจากหาชื่อ type, class, interface หรือ record ที่ประกาศแบบเต็ม', 'Start by finding explicit type, class, interface, or record declarations.'],
      ['ถ้าเห็น .stream(), Collectors, Type::method หรือ try-with-resources ให้คิดถึง Java hard ทันที', 'If you see .stream(), Collectors, Type::method, or try-with-resources, think hard Java quickly.'],
      ['ถึงจะสมัยใหม่ขึ้น แต่ยังไม่ทิ้ง semicolon, braces และระบบ type แบบเข้ม', 'Even in modern syntax, it still keeps semicolons, braces, and a strict type system.'],
    ]),
    falseFriendSplits: [
      split('csharp', [
        ['C# จะชอบ using, property syntax, LINQ อย่าง .Where()/.Select() และ Task แบบโลก .NET', 'C# leans toward using directives, property syntax, LINQ chains, and Task patterns from the .NET world.'],
        ['Java hard จะดันคำอย่าง record, Collectors, System.out.println, permits และ method reference ออกมาชัดกว่า', 'Hard Java pushes record, Collectors, System.out.println, permits, and method references more clearly.'],
      ]),
      split('typescript', [
        ['TypeScript ดูเป็นโลก JavaScript ก่อน แล้วค่อยมี type เสริม ไม่ใช่โลก class/type แบบ Java ตั้งแต่บรรทัดแรก', 'TypeScript still reads like JavaScript first, then adds types, rather than starting in a Java-style class/type world.'],
        ['Java จะไม่ใช้ =>, const, interface แบบ JS-family หรือ object literal เป็นฐานหลักของ snippet', 'Java will not anchor the snippet around =>, const, JS-style interfaces, or object literals.'],
      ]),
    ],
  },
  html: {
    snapshot: t(
      'HTML ระดับ hard จะเพิ่ม semantic structure, accessibility attribute, template, picture หรือ dialog แต่ยังเป็น markup ล้วน ไม่ได้กลายเป็น logic language',
      'Hard HTML adds semantic structure, accessibility attributes, templates, pictures, or dialogs, but it is still pure markup rather than a logic language.',
    ),
    checklist: list([
      ['ดูว่าทุกอย่างยังเป็นแท็กและ attribute ล้วน ไม่มี expression หรือคำสั่งควบคุม flow', 'Check that everything is still tags and attributes with no expressions or flow-control syntax.'],
      ['marker ขั้นสูงอย่าง aria-*, data-*, picture, dialog, template ช่วยยืนยันว่าเป็น HTML ที่ลึกขึ้น', 'Advanced markers like aria-*, data-*, picture, dialog, and template help confirm deeper HTML.'],
      ['ถ้าเจอ class แทน className และ attribute ยังเป็นรูป HTML ปกติ ให้รักษาสมมติฐาน HTML ไว้ก่อน', 'If you see class instead of className and normal HTML-style attributes, keep HTML as the leading guess.'],
    ]),
    falseFriendSplits: [
      split('jsx', [
        ['JSX จะเปิดช่องให้ JavaScript แทรกด้วย { } และ event handler แบบ onClick={...}', 'JSX opens slots for JavaScript with { } expressions and handlers like onClick={...}.'],
        ['HTML hard แม้จะซับซ้อนขึ้น ก็ยังไม่ใช้ className หรือ component tag ตัวใหญ่', 'Even when harder, HTML still does not use className or capitalized component tags.'],
      ]),
      split('json', [
        ['JSON ไม่มีแท็กเปิดปิด ไม่มี tree ของ element และไม่มี attribute แบบ HTML', 'JSON has no opening/closing tags, no element tree, and no HTML-style attributes.'],
        ['HTML hard ยังเล่าหน้าเอกสารหรือ UI structure ผ่านแท็ก ไม่ใช่ data object ที่ key ถูก quote หมด', 'Hard HTML still describes document/UI structure through tags rather than quoted data objects.'],
      ]),
    ],
  },
  css: {
    snapshot: t(
      'CSS ระดับ hard จะขยับไปหา token, function, container query, selector helper และ layout rule ที่ซับซ้อนขึ้น แต่แกนกลางยังเป็น selector ตามด้วย declaration',
      'Hard CSS moves into design tokens, functions, container queries, selector helpers, and richer layout rules, but the core is still selector plus declarations.',
    ),
    checklist: list([
      ['หา selector ก่อนเสมอ แล้วดูว่าข้างในยังเป็น property: value ต่อกันหลายบรรทัดหรือไม่', 'Find the selector first, then confirm the inside still looks like property: value declarations.'],
      ['@container, :is(), var(), clamp(), color-mix() หรือ custom property ไม่ได้ทำให้มันหลุดจากโลก CSS', 'Markers such as @container, :is(), var(), clamp(), color-mix(), and custom properties still belong firmly to CSS.'],
      ['ถ้าข้อความดูเหมือน layout/styling rule มากกว่าข้อมูลหรือ markup ให้คิดถึง CSS hard', 'If the text feels like layout/styling rules rather than data or markup, think hard CSS.'],
    ]),
    falseFriendSplits: [
      split('json', [
        ['JSON จะเป็น key-value data ที่ key ถูก quote ได้ทั้งก้อน ไม่ใช่ selector ครอบด้วยปีกกาแบบ style rule', 'JSON is quoted key-value data, not selectors wrapped in braces as styling rules.'],
        ['CSS มี property name แบบ display, gap, outline, background และค่าสำหรับ visual behavior', 'CSS carries property names like display, gap, outline, and background with visual behavior values.'],
      ]),
      split('html', [
        ['HTML มีแท็กและ attribute เป็นโครงหน้าเอกสาร ส่วน CSS จะอธิบายว่า element เหล่านั้นควรถูกจัดวางหรือแสดงผลยังไง', 'HTML is tag-and-attribute document structure, while CSS describes how those elements should be laid out or rendered.'],
        ['แม้ CSS hard จะมีคำอย่าง @container หรือ :focus-visible แต่ก็ยังไม่มี tree ของ tag ให้เห็น', 'Even hard CSS with @container or :focus-visible still does not expose a tree of tags.'],
      ]),
    ],
  },
  json: {
    snapshot: t(
      'JSON ระดับ hard มักซ่อนอยู่ใน nested config ที่ลึกขึ้น แต่ยังเป็น data ล้วน ไม่มีตัวแปร ไม่มี function และไม่มี syntax ที่ควบคุมการทำงาน',
      'Hard JSON often hides in deeper nested config, but it is still pure data with no variables, no functions, and no executable flow syntax.',
    ),
    checklist: list([
      ['เช็กก่อนว่าทุก key ยังอยู่ใน double quote และไม่มีการประกาศตัวแปรหรือ type', 'First confirm that every key is still double-quoted and there are no variable or type declarations.'],
      ['ถึง object จะซ้อนลึกหรือ array จะยาวขึ้น ถ้าไม่มี behavior syntax ก็ยังเป็น JSON', 'Even when objects nest deeply or arrays grow long, it stays JSON if there is no behavior syntax.'],
      ['ค่าใน JSON อาจดูเหมือน config จริงจัง แต่ทั้งหมดต้องยังเป็น string/number/boolean/object/array เท่านั้น', 'Values can look serious or complex, but they still have to remain strings, numbers, booleans, objects, or arrays only.'],
    ]),
    falseFriendSplits: [
      split('typescript', [
        ['TypeScript object literal อาจหน้าตาคล้ายกัน แต่จะมี interface, type, const หรือ key ที่ไม่ต้องใส่ quote ครบทุกตัว', 'A TypeScript object literal may look similar, but it will bring interface, type, const, or keys that are not always quoted.'],
        ['JSON ไม่มี generic, annotation, function หรือ comment ที่วิ่งร่วมกับ object data', 'JSON has no generics, annotations, functions, or comments traveling with the object data.'],
      ]),
      split('python', [
        ['Python dict ใช้ single quote หรือ key ที่ไม่ rigid เท่า JSON ได้ และมักเดินคู่กับโค้ดรันจริง', 'Python dicts can use looser key/value styles and usually appear alongside executable code.'],
        ['JSON จะนิ่งกว่าและไม่ใช้ True/False/None แบบ Python', 'JSON stays stricter and does not use Python-style True/False/None values.'],
      ]),
    ],
  },
  csharp: {
    snapshot: t(
      'C# ระดับ hard มักมาในรูป record, async/await, LINQ chain, expression-bodied member และ API กลิ่น .NET ที่ยังเห็น type ชัดเจน',
      'Hard C# often shows up as records, async/await, LINQ chains, expression-bodied members, and .NET-flavored APIs while keeping types explicit.',
    ),
    checklist: list([
      ['หา using, record, property, Task<T> หรือ API ฝั่ง .NET ก่อน', 'Look for using directives, records, properties, Task<T>, or .NET-flavored APIs first.'],
      ['LINQ อย่าง .Where(), .Select(), .OrderByDescending() เป็น marker ที่ช่วยแยกจาก Java ได้ดี', 'LINQ chains such as .Where(), .Select(), and .OrderByDescending() help separate it from Java.'],
      ['แม้ syntax จะกระชับขึ้น แต่ยังอยู่ในโลก braces + semicolon + explicit type ที่ชัดกว่า JavaScript family', 'Even when the syntax becomes terse, it still lives in a braces + semicolon + explicit-type world rather than the JavaScript family.'],
    ]),
    falseFriendSplits: [
      split('java', [
        ['Java จะมี Collectors, stream(), System.out.println หรือ record/permits แบบอีกสำเนียงหนึ่ง', 'Java brings Collectors, stream(), System.out.println, or record/permits in a different accent.'],
        ['C# จะทิ้งกลิ่น .NET ชัดกว่า เช่น using, property syntax, LINQ และ await using', 'C# leaves a stronger .NET smell through using directives, property syntax, LINQ, and await using.'],
      ]),
      split('typescript', [
        ['TypeScript อาจมี type annotation แต่จะยังยืนอยู่บน syntax โลก JS เช่น const, =>, object literal และ Promise', 'TypeScript may carry types, but it still stands on JS-family syntax such as const, =>, object literals, and Promise.'],
        ['C# hard จะมี class/record/member declaration ที่เป็นภาษาคอมไพล์เชิง OOP มากกว่า', 'Hard C# exposes compiled OOP-style class/record/member declarations more directly.'],
      ]),
    ],
  },
  cpp: {
    snapshot: t(
      'C++ ระดับ hard จะเน้น template, reference, smart pointer, STL algorithm และ pointer-ish surface ที่ทำให้โค้ดดูแน่นและเทคนิคมากขึ้น',
      'Hard C++ emphasizes templates, references, smart pointers, STL algorithms, and pointer-heavy surfaces that make the code feel dense and technical.',
    ),
    checklist: list([
      ['เริ่มจาก #include, std:: และ operator อย่าง &, *, -> หรือ ::', 'Start from #include, std::, and operators like &, *, ->, or ::.'],
      ['template, const reference, std::vector หรือ std::make_unique เป็น marker ของ C++ hard ที่ชัดมาก', 'Templates, const references, std::vector, and std::make_unique are strong hard C++ markers.'],
      ['ถ้า syntax ดู low-level กว่า C#/Java และชอบคิดเรื่อง memory/reference ให้ดันไป C++', 'If the syntax feels lower-level than C#/Java and keeps hinting at memory/reference concerns, push toward C++.'],
    ]),
    falseFriendSplits: [
      split('csharp', [
        ['C# จะซ่อนรายละเอียด low-level มากกว่า และไม่มี #include หรือ std:: namespace pattern แบบนี้', 'C# hides low-level detail much more and does not use #include or std:: namespace patterns like this.'],
        ['C++ hard ชอบ template, reference และ smart pointer ที่พาไปทาง native/system มากกว่า', 'Hard C++ leans into templates, references, and smart pointers that feel much more native/system-level.'],
      ]),
      split('rust', [
        ['Rust แม้จะ system-ish เหมือนกัน แต่จะใช้ fn/let/Result/match และ ownership surface คนละสำเนียง', 'Rust can feel system-level too, but it speaks through fn/let/Result/match and a different ownership surface.'],
        ['C++ จะยังคงมี #include, std:: และ syntax แบบ reference/pointer ดั้งเดิมกว่า', 'C++ keeps #include, std::, and more traditional reference/pointer syntax.'],
      ]),
    ],
  },
  flutter: {
    snapshot: t(
      'Flutter ระดับ hard มักมาเป็น widget tree ใหญ่ขึ้น มี Sliver, FutureBuilder, state-aware composition และ named parameter เต็มรูปแบบ',
      'Hard Flutter usually appears as a larger widget tree with slivers, FutureBuilder, state-aware composition, and heavy named-parameter usage.',
    ),
    checklist: list([
      ['มองเป็นต้นไม้ของ widget ก่อน ไม่ใช่แค่ Dart syntax เดี่ยว ๆ', 'Read it as a widget tree first rather than as plain Dart syntax.'],
      ['CustomScrollView, SliverAppBar, FutureBuilder, children: [] และ BuildContext เป็น marker ชั้นสูงที่ดี', 'CustomScrollView, SliverAppBar, FutureBuilder, children: [], and BuildContext are good higher-level markers.'],
      ['ถึงจะซับซ้อนขึ้น แต่ชื่อ constructor, named parameter และโครง UI composition ยังชัดมาก', 'Even when it gets more complex, constructor names, named parameters, and UI composition remain very visible.'],
    ]),
    falseFriendSplits: [
      split('dart', [
        ['Dart ล้วนจะเน้นภาษาและ type system เองมากกว่า ไม่จำเป็นต้องมี widget tree เต็มหน้า', 'Plain Dart leans more on the language and type system itself rather than filling the screen with widget trees.'],
        ['Flutter hard จะพาคำอย่าง Widget, BuildContext, FutureBuilder หรือ Sliver มากองรวมกัน', 'Hard Flutter piles up words like Widget, BuildContext, FutureBuilder, or Sliver.'],
      ]),
      split('jsx', [
        ['JSX เป็น markup-like UI ที่ฝัง JavaScript expression ผ่านแท็กและ { }', 'JSX is markup-like UI that embeds JavaScript expressions through tags and { } slots.'],
        ['Flutter ใช้ constructor call และ named parameter แทนแท็ก HTML-style', 'Flutter uses constructor calls and named parameters instead of HTML-style tags.'],
      ]),
    ],
  },
  dart: {
    snapshot: t(
      'Dart ระดับ hard จะโชว์ extension, async/Future, enum, switch expression และ API ที่ยังคงอ่านสะอาดกว่าภาษาแอปหลายตัว',
      'Hard Dart shows extensions, async/Future flow, enums, switch expressions, and APIs that still read cleaner than many app languages.',
    ),
    checklist: list([
      ['ดู final/var, named parameter, Future และ syntax ที่เป็นมิตรกับ null safety', 'Look for final/var, named parameters, Future, and null-safe friendly syntax.'],
      ['extension, enum, switch expression และ factory-like constructor ช่วยยืนยัน Dart hard ได้ดี', 'Extensions, enums, switch expressions, and constructor-style APIs help confirm hard Dart well.'],
      ['ถ้าไม่มี widget tree เต็มตัวแบบ Flutter แต่สำเนียงภาษาใกล้กันมาก ให้คิดถึง Dart', 'If the syntax feels close to Flutter’s world without a full widget tree, think Dart.'],
    ]),
    falseFriendSplits: [
      split('flutter', [
        ['Flutter จะดัน widget/composition language ออกมาชัด เช่น children, const Widget, BuildContext', 'Flutter pushes widget/composition language much harder with children, const widgets, and BuildContext.'],
        ['Dart hard อาจใช้ syntax เดียวกัน แต่ snippet จะไม่ถูกครอบด้วยต้นไม้ UI ทั้งก้อน', 'Hard Dart may share the language, but the snippet is not wrapped in a full UI tree.'],
      ]),
      split('kotlin', [
        ['Kotlin จะมี fun, val/var, when, nullable type แบบ JVM/mobile อีกสำเนียงหนึ่ง', 'Kotlin uses fun, val/var, when, and nullable types in a different JVM/mobile accent.'],
        ['Dart จะคง named parameter, Future, extension และ style ของภาษาใน ecosystem Flutter มากกว่า', 'Dart keeps named parameters, Future, extensions, and a style tied more closely to the Flutter ecosystem.'],
      ]),
    ],
  },
  jsx: {
    snapshot: t(
      'JSX ระดับ hard มักเป็น UI composition ที่ผสม fragment, map/render logic, component หลายชั้น และ event handler แบบ inline',
      'Hard JSX is usually UI composition that mixes fragments, map/render logic, multi-layer components, and inline event handlers.',
    ),
    checklist: list([
      ['ถ้าหน้าตาเหมือน HTML แต่มี { } แทรก expression ตลอด ให้ตั้งต้นว่าเป็น JSX', 'If it looks like HTML with expressions constantly embedded in { }, start from JSX.'],
      ['component tag ตัวใหญ่, className, onClick และ fragment <>...</> เป็น marker ขั้นสูงที่ช่วยมาก', 'Capitalized component tags, className, onClick, and fragments <>...</> are strong higher-level markers.'],
      ['โค้ด hard มักมี map(), ternary หรือ helper function ซ้อนอยู่ใน tree เดียวกัน', 'Hard snippets often keep map(), ternaries, or helper logic inside the same rendered tree.'],
    ]),
    falseFriendSplits: [
      split('html', [
        ['HTML จะเป็น markup ล้วน ไม่มี JavaScript expression, component tag หรือ handler ที่รับ function', 'HTML stays pure markup without JavaScript expressions, component tags, or function-valued handlers.'],
        ['JSX hard ถึงจะดูเหมือนหน้าเอกสาร แต่ยังคุยกับ state/props ของ JavaScript อยู่ตลอด', 'Hard JSX may resemble a document, but it constantly talks to JavaScript state and props.'],
      ]),
      split('typescript', [
        ['TypeScript อาจมี JSX ได้ แต่ถ้า snippet แกนหลักคือ type/interface/generic มากกว่า tree ของแท็ก ให้ระวัง TS', 'TypeScript can contain JSX, but if the core surface is types/interfaces/generics rather than a tag tree, be careful about TS.'],
        ['JSX hard จะให้ UI tree เด่นกว่า type layer แม้มี callback หรือ prop expression อยู่', 'Hard JSX makes the UI tree more prominent than the type layer even when callbacks or prop expressions appear.'],
      ]),
    ],
  },
  typescript: {
    snapshot: t(
      'TypeScript ระดับ hard ยังคงยืนอยู่บนโลก JavaScript แต่จะเปิดชั้น type ที่ลึกขึ้นผ่าน generic, union, Record, Promise และ object shape ที่ชัดเจน',
      'Hard TypeScript still stands on top of JavaScript, but it reveals a deeper type layer through generics, unions, Record, Promise, and explicit object shapes.',
    ),
    checklist: list([
      ['ถามก่อนว่า snippet นี้ยังเป็น JS-family หรือไม่ แล้วค่อยหาว่าชั้น type เพิ่มตรงไหน', 'Ask whether the snippet still belongs to the JS family first, then locate where the type layer was added.'],
      ['interface, type, generic function, return annotation และ discriminated union เป็น marker hard ที่สำคัญ', 'Interfaces, type aliases, generic functions, return annotations, and discriminated unions are important hard markers.'],
      ['ถ้ามี type ชัดแต่ยังไม่มี class-heavy หรือ framework-specific OOP smell แบบ Java/C# ให้คิดถึง TypeScript', 'If types are explicit but the snippet still lacks a class-heavy Java/C# style OOP smell, think TypeScript.'],
    ]),
    falseFriendSplits: [
      split('jsx', [
        ['JSX จะให้น้ำหนักกับ tree ของแท็ก, component render และ className/onClick มากกว่า', 'JSX emphasizes tag trees, component rendering, and className/onClick more strongly.'],
        ['TypeScript hard อาจแตะ JSX ได้ แต่หัวใจของ snippet จะอยู่ที่ type layer ไม่ใช่หน้าตา UI tree', 'Hard TypeScript may touch JSX, but the heart of the snippet is the type layer rather than the UI tree.'],
      ]),
      split('java', [
        ['Java เริ่มจาก class/record/interface โลกคอมไพล์เชิง OOP ที่หนักกว่า JavaScript family', 'Java starts from class/record/interface declarations in a heavier compiled OOP world.'],
        ['TypeScript ยังใช้สำเนียง JS เช่น const, object literal, Promise และ arrow function เป็นฐานสำคัญ', 'TypeScript still relies on JS-family accents such as const, object literals, Promise, and arrow functions.'],
      ]),
    ],
  },
  bash: {
    snapshot: t(
      'Bash ระดับ hard มักอยู่ใน shebang, pipeline, trap, function, parameter expansion และงานจัดการไฟล์/สตรีมของ shell โดยตรง',
      'Hard Bash often lives in shebangs, pipelines, traps, functions, parameter expansion, and direct shell file/stream manipulation.',
    ),
    checklist: list([
      ['ถ้ามี #!/usr/bin/env bash หรือคำสั่ง shell ต่อกันด้วย pipe/redirection ให้คิดถึง Bash ก่อน', 'If you see a bash shebang or shell commands chained with pipes/redirections, think Bash first.'],
      ['read -r, IFS, set -euo pipefail, trap และ ${VAR:-default} เป็น marker ชั้นลึกที่ดีมาก', 'read -r, IFS, set -euo pipefail, trap, and ${VAR:-default} are very strong deeper markers.'],
      ['โค้ด hard ของ Bash สนใจ process และ stream มากกว่าระบบ type หรือ object structure', 'Hard Bash cares more about processes and streams than type systems or object structure.'],
    ]),
    falseFriendSplits: [
      split('python', [
        ['Python แม้จะอ่านง่ายคล้ายภาษามนุษย์ แต่จะมี def, if:, for: และ data structure logic มากกว่า command chain', 'Python may also read clearly, but it leans on def, if:, for:, and data-structure logic more than command chains.'],
        ['Bash จะชัดที่ตัวแปร $VAR, คำสั่งระบบ, pipe และ shell built-in', 'Bash is clearer through $VAR variables, system commands, pipes, and shell built-ins.'],
      ]),
      split('php', [
        ['PHP ใช้ $ เหมือนกัน แต่จะอยู่ในบริบทเว็บ/backend ที่มี class, function, array helper หรือ <?php', 'PHP also uses $, but it appears in web/backend contexts with classes, functions, array helpers, or <?php.'],
        ['Bash ไม่มี object/class surface และจะให้กลิ่น command line หนักกว่า', 'Bash has no object/class surface and smells much more like the command line.'],
      ]),
    ],
  },
  'cloud-functions': {
    snapshot: t(
      'Cloud Functions ระดับ hard ยังเป็น handler ฝั่ง serverless ที่หุ้ม trigger, request context, database call และ async flow ของ ecosystem JavaScript/TypeScript',
      'Hard Cloud Functions still looks like serverless handlers wrapped around triggers, request context, database calls, and async flow from the JavaScript/TypeScript ecosystem.',
    ),
    checklist: list([
      ['หา trigger อย่าง onCall, onRequest หรือ onDocumentCreated ก่อน เพราะมันเป็น marker ระดับแพลตฟอร์ม', 'Look for triggers such as onCall, onRequest, or onDocumentCreated first because they are platform-level markers.'],
      ['แม้โค้ดจะลึกขึ้น ก็ยังผูกกับ handler export, context และ SDK call มากกว่าภาษา backend แบบคลาสหนัก ๆ', 'Even when deeper, the code is still centered on exported handlers, context, and SDK calls rather than class-heavy backend syntax.'],
      ['ถ้า logic ดูเหมือน JavaScript/TypeScript แต่มีกรอบของ serverless runtime ครอบอยู่ ให้คิดถึงหมวดนี้', 'If the logic looks like JavaScript/TypeScript inside a serverless runtime wrapper, think of this category.'],
    ]),
    falseFriendSplits: [
      split('javascript', [
        ['JavaScript ทั่วไปอาจมี async/await เหมือนกัน แต่จะไม่มี trigger surface ของ platform ติดมาด้วยเสมอ', 'Plain JavaScript may also use async/await, but it will not consistently carry a platform trigger surface.'],
        ['Cloud Functions จะมีรูปแบบ handler/export และคำของ runtime/backend service ชัดกว่า', 'Cloud Functions makes handler/export shapes and runtime/backend service vocabulary much more explicit.'],
      ]),
      split('typescript', [
        ['TypeScript อาจเป็นภาษาฐานของ function ได้ แต่ถ้าตัวเด่นคือชนิดข้อมูล/generic มากกว่าตัว trigger ให้ระวังว่าอาจเป็น TS ธรรมดา', 'TypeScript can be the base language here, but if types/generics dominate more than the trigger, it may be plain TS instead.'],
        ['Cloud Functions hard ต้องยังมีกลิ่น trigger, context และ backend SDK ให้จับได้', 'Hard Cloud Functions still needs an obvious trigger, context, and backend SDK smell.'],
      ]),
    ],
  },
  sql: {
    snapshot: t(
      'SQL ระดับ hard มักซ่อนใน CTE, window function, CASE, HAVING และการ aggregate หลายชั้น แต่แกนอ่านยังเริ่มจาก SELECT / FROM / WHERE เหมือนเดิม',
      'Hard SQL often hides in CTEs, window functions, CASE clauses, HAVING, and multi-layer aggregation, but reading still starts from SELECT / FROM / WHERE.',
    ),
    checklist: list([
      ['ไม่ว่าจะยากแค่ไหน ให้หา SELECT, FROM, WHERE, JOIN หรือ WITH เป็น anchor ก่อน', 'No matter how hard it gets, find SELECT, FROM, WHERE, JOIN, or WITH as the anchor first.'],
      ['ROW_NUMBER() OVER, PARTITION BY, SUM(CASE WHEN ...), HAVING และ alias chain เป็น marker ชั้นสูงของ SQL', 'ROW_NUMBER() OVER, PARTITION BY, SUM(CASE WHEN ...), HAVING, and alias chains are higher-level SQL markers.'],
      ['แม้จะมีวงเล็บและ function เยอะ แต่ถ้าโค้ดยังอธิบายการ query ข้อมูลอยู่ ก็ยังเป็น SQL', 'Even with many parentheses and functions, if the snippet is still describing data querying, it is still SQL.'],
    ]),
    falseFriendSplits: [
      split('json', [
        ['JSON เป็น data payload ที่นิ่ง ไม่มีคำกริยาอย่าง SELECT, JOIN หรือ OVER', 'JSON is static data payload, not a language with verbs like SELECT, JOIN, or OVER.'],
        ['SQL hard อาจดูคล้ายข้อมูลเพราะมีชื่อคอลัมน์เต็มไปหมด แต่ flow ยังเป็นการดึง/จัดรูปข้อมูลจากตาราง', 'Hard SQL can look data-heavy, but the flow is still about selecting and reshaping table data.'],
      ]),
      split('bash', [
        ['Bash ใช้คำสั่งระบบกับ pipe เป็นหลัก ส่วน SQL ใช้ clause ของภาษา query เอง', 'Bash is driven by system commands and pipes, while SQL uses its own query clauses.'],
        ['ถ้ามี SELECT/FROM/WHERE เป็นแกน อย่าหลงไปกับความที่มันเป็น text command คล้าย shell', 'If SELECT/FROM/WHERE anchor the snippet, do not get distracted by the fact that it also looks like text commands.'],
      ]),
    ],
  },
  php: {
    snapshot: t(
      'PHP ระดับ hard มักไปอยู่ใน class, constructor promotion, array helper, arrow function และ null-coalescing แต่ยังคงมีกลิ่น $variable ชัดมาก',
      'Hard PHP often shows up in classes, constructor promotion, array helpers, arrow functions, and null-coalescing while keeping a strong $variable smell.',
    ),
    checklist: list([
      ['เริ่มจากมอง $variable ก่อน เพราะเป็น anchor ที่ยังอยู่แม้โค้ดจะยากขึ้น', 'Start from $variables because they remain a strong anchor even when the code gets harder.'],
      ['ดู __construct, public readonly, array_map, fn (...) => และ operator อย่าง ??', 'Look for __construct, public readonly, array_map, fn (...) =>, and operators like ??.'],
      ['ถ้าโค้ดดูเป็นเว็บ/backend เชิง object แต่ยังเต็มไปด้วย $variable ให้คิดถึง PHP', 'If the code feels like object-oriented web/backend code while staying full of $variables, think PHP.'],
    ]),
    falseFriendSplits: [
      split('python', [
        ['Python ไม่มี $variable และ block ถูกคุมด้วย indentation ไม่ใช่ semicolon/braces world แบบ PHP class', 'Python has no $variables, and its blocks are indentation-driven rather than semicolon/braces-heavy PHP classes.'],
        ['PHP hard แม้จะดูทันสมัยขึ้น ก็ยังไม่ทิ้งภาษาถิ่นของ $this, $userId และ array helper', 'Hard PHP may modernize, but it still keeps $this, $userId, and array-helper idioms.'],
      ]),
      split('javascript', [
        ['JavaScript อาจมี arrow function เหมือนกัน แต่จะไม่มี $variable และ constructor/property style แบบ PHP', 'JavaScript may also use arrow functions, but it will not bring $variables or PHP-style constructor/property conventions.'],
        ['PHP ยังคงอยู่ในโลก backend/web template มากกว่ารันไทม์ JS ฝั่งเว็บ', 'PHP remains more rooted in backend/web-template territory than the JS runtime world.'],
      ]),
    ],
  },
  rust: {
    snapshot: t(
      'Rust ระดับ hard จะผลัก Result/Option, iterator chain, generic type, reference และ pattern matching ออกมาชัดเจนมากขึ้น',
      'Hard Rust pushes Result/Option, iterator chains, generic types, references, and pattern matching much more clearly to the surface.',
    ),
    checklist: list([
      ['หา fn, let, ::, Result/Option, Ok/Err หรือ Some/None เป็น anchor ก่อน', 'Look for fn, let, ::, Result/Option, Ok/Err, or Some/None as the first anchors.'],
      ['operator อย่าง ?, reference &, generic type และ chain แบบ iter/map/filter ช่วยยืนยัน Rust hard ได้ดี', 'Operators like ?, references &, generic types, and iter/map/filter chains help confirm hard Rust well.'],
      ['ถึงจะดู functional และ compact แต่ยังมีระบบ type/ownership ที่ชัดกว่า Python หรือ JavaScript มาก', 'Even when compact and functional-looking, it exposes a type/ownership surface much more clearly than Python or JavaScript.'],
    ]),
    falseFriendSplits: [
      split('cpp', [
        ['C++ จะพา #include, std:: และ pointer/reference สำเนียงเก่ากว่าเข้ามา', 'C++ brings #include, std::, and a more traditional pointer/reference accent.'],
        ['Rust ใช้ Result/Option, match, fn/let และ error propagation แบบ ? ซึ่งเป็นเอกลักษณ์กว่า', 'Rust leans into Result/Option, match, fn/let, and ?-based error propagation much more distinctly.'],
      ]),
      split('go', [
        ['Go จะอ่านตรงกว่าและชอบ err != nil, struct tag, package, func มากกว่าระบบ enum/Result แบบ Rust', 'Go reads more directly and prefers err != nil, struct tags, package, and func over Rust-style enums and Result types.'],
        ['Rust hard มักแน่นด้วย type wrapper และ iterator/ownership clues มากกว่า Go', 'Hard Rust tends to be denser with type wrappers and iterator/ownership clues than Go.'],
      ]),
    ],
  },
  javascript: {
    snapshot: t(
      'JavaScript ระดับ hard มักมาเป็น async app logic, fetch flow, destructuring, class, private field และ object operation ที่ยังไม่มี type layer ชัดแบบ TypeScript',
      'Hard JavaScript often appears as async app logic, fetch flow, destructuring, classes, private fields, and object operations without the explicit type layer of TypeScript.',
    ),
    checklist: list([
      ['ตั้งต้นจาก const/let/function/class/async ก่อน แล้วดูว่ามี type annotation หรือไม่', 'Start from const/let/function/class/async, then check whether an explicit type layer exists.'],
      ['destructuring, fetch, response.json(), private field (#name) และ runtime-first API ช่วยยืนยัน JS hard', 'Destructuring, fetch, response.json(), private fields (#name), and runtime-first APIs help confirm hard JS.'],
      ['ถ้าโค้ดยังดูเป็น JS ล้วนแม้จะยาวและซับซ้อนขึ้น แต่ไม่มี interface/type/generic ชัด ๆ ให้เลือก JavaScript', 'If the code still feels like pure JS even when longer and more complex, without clear interfaces/types/generics, choose JavaScript.'],
    ]),
    falseFriendSplits: [
      split('typescript', [
        ['TypeScript จะเริ่มเปิดชั้น type เช่น interface, type alias, generic หรือ annotation หลัง parameter/return', 'TypeScript starts exposing a type layer with interfaces, type aliases, generics, or parameter/return annotations.'],
        ['JavaScript hard อาจลึกขึ้นทาง runtime แต่จะไม่ยืนบน type surface แบบนั้นเป็นแกน', 'Hard JavaScript may deepen at runtime, but it does not anchor the snippet on that type surface.'],
      ]),
      split('jsx', [
        ['JSX จะให้โครง UI เป็น tree ของแท็กเด่นชัด ส่วน JavaScript hard จะเด่นที่ logic และ object operation', 'JSX makes a UI tag tree prominent, while hard JavaScript emphasizes logic and object operations.'],
        ['ถ้ามี class/async/fetch แต่ไม่มี tree ของ component tag ให้คง JavaScript ไว้ก่อน', 'If you see classes/async/fetch without a component tag tree, keep JavaScript as the lead guess.'],
      ]),
    ],
  },
  go: {
    snapshot: t(
      'Go ระดับ hard จะออกลายผ่าน struct tag, channel, goroutine, interface เล็ก ๆ และ pattern จัดการ error ที่ยังตรงไปตรงมา',
      'Hard Go reveals itself through struct tags, channels, goroutines, small interfaces, and error-handling patterns that remain straightforward.',
    ),
    checklist: list([
      ['package, func, := และ err != nil ยังเป็น anchor ที่สำคัญเสมอ', 'package, func, :=, and err != nil remain essential anchors.'],
      ['channel `<-`, goroutine, struct tag แบบ `json:"name"` และ interface ที่ไม่ใหญ่เกินไปช่วยชี้ Go hard', 'Channels, goroutines, struct tags like `json:"name"`, and smaller interfaces help point to hard Go.'],
      ['ถ้าโค้ดดู practical, กระชับ และไม่ชอบ class hierarchy ให้คิดถึง Go มากขึ้น', 'If the code feels practical, compact, and not class-hierarchy driven, think of Go more strongly.'],
    ]),
    falseFriendSplits: [
      split('rust', [
        ['Rust จะพา Result/Option, ::, match และ ownership surface ที่ชัดกว่าเข้ามา', 'Rust brings Result/Option, ::, match, and a more visible ownership surface.'],
        ['Go hard ยังตรงกว่าและชอบเดินด้วย error return, struct และ channel มากกว่า', 'Hard Go remains straighter and prefers error returns, structs, and channels instead.'],
      ]),
      split('java', [
        ['Java จะมี class/type declaration เชิง OOP หนักกว่า และนิยม chain API คนละสำเนียง', 'Java uses heavier OOP class/type declarations and different API chaining idioms.'],
        ['Go จะไม่จัดพิธีรีตองเรื่อง class มาก และ syntax หลักอย่าง package/func/:= เด่นกว่า', 'Go avoids heavy class ceremony, and package/func/:= stand out more strongly.'],
      ]),
    ],
  },
  kotlin: {
    snapshot: t(
      'Kotlin ระดับ hard มักอยู่ใน sealed/data model, coroutine, extension function และ null-safe API ที่ยังอ่านลื่นกว่า Java',
      'Hard Kotlin often lives in sealed/data models, coroutines, extension functions, and null-safe APIs that still read more smoothly than Java.',
    ),
    checklist: list([
      ['มองหา fun, val/var, when, nullable type และ data/sealed keyword ก่อน', 'Look for fun, val/var, when, nullable types, and data/sealed keywords first.'],
      ['suspend, runCatching, Result<T>, extension function และ smart null handling เป็น marker hard ที่ดี', 'suspend, runCatching, Result<T>, extension functions, and smart null handling are good hard markers.'],
      ['ถ้าโค้ดดู modern mobile/JVM มากแต่ ceremony น้อยกว่า Java ให้ดันไป Kotlin', 'If the code feels modern mobile/JVM-like but with less ceremony than Java, push toward Kotlin.'],
    ]),
    falseFriendSplits: [
      split('java', [
        ['Java จะเป็นทางการกว่าและไม่ใช้ val/when/null-safe syntax สำเนียงเดียวกัน', 'Java is more ceremonial and does not use val/when/null-safe syntax in the same way.'],
        ['Kotlin hard จะให้ภาพของ data/sealed/suspend และ expression-friendly syntax ชัดกว่า', 'Hard Kotlin more clearly shows data/sealed/suspend features and expression-friendly syntax.'],
      ]),
      split('swift', [
        ['Swift มีสำเนียง Apple/iOS ชัด เช่น guard, enum case, URLSession, .self และ collection notation แบบอีกโลก', 'Swift speaks with a strong Apple/iOS accent through guard, enum cases, URLSession, .self, and a different collection style.'],
        ['Kotlin จะยืนบน fun/val/var/when และ ecosystem JVM/Android มากกว่า', 'Kotlin stands on fun/val/var/when and a stronger JVM/Android ecosystem identity.'],
      ]),
    ],
  },
  swift: {
    snapshot: t(
      'Swift ระดับ hard มักมาในรูป async throws, enum-driven flow, optionals, value type และ API กลิ่น Apple ที่ยังอ่านสะอาดมาก',
      'Hard Swift often appears as async throws flow, enum-driven control, optionals, value types, and Apple-flavored APIs that still read very cleanly.',
    ),
    checklist: list([
      ['หา let/var, guard, enum, optional syntax และชื่อ API โลก Apple ก่อน', 'Look for let/var, guard, enums, optional syntax, and Apple-world APIs first.'],
      ['async throws, URLSession, JSONDecoder, case ... หรือ .self เป็น marker hard ที่แม่นมาก', 'async throws, URLSession, JSONDecoder, case ..., and .self are very precise hard markers.'],
      ['ถ้าโค้ดดู strongly typed แต่ลื่นและ value-oriented กว่า Java/Kotlin ให้ระวัง Swift', 'If the code looks strongly typed but more fluid and value-oriented than Java/Kotlin, watch for Swift.'],
    ]),
    falseFriendSplits: [
      split('kotlin', [
        ['Kotlin จะมี fun, val/var, when และกลิ่น JVM/Android มากกว่า Apple framework', 'Kotlin uses fun, val/var, when, and a stronger JVM/Android smell rather than Apple frameworks.'],
        ['Swift hard จะพา enum case, guard, throws และ API อย่าง URLSession เข้ามาชัดกว่า', 'Hard Swift more clearly brings enum cases, guard, throws, and APIs like URLSession.'],
      ]),
      split('dart', [
        ['Dart ใช้ named parameter กับ Future แบบ ecosystem Flutter/app language อีกสำเนียงหนึ่ง', 'Dart uses named parameters and Future in a different Flutter/app-language accent.'],
        ['Swift จะมี optionals, .self, guard let และชื่อ type ตามโลก Apple มากกว่า', 'Swift brings optionals, .self, guard let, and Apple-world type names much more strongly.'],
      ]),
    ],
  },
  ruby: {
    snapshot: t(
      'Ruby ระดับ hard มักอาศัย block, symbol, enumerable chain, attr_reader และ file/helper method ที่ยังคงอ่านกึ่งภาษาคนมากกว่า type language',
      'Hard Ruby often relies on blocks, symbols, enumerable chains, attr_reader, and file/helper methods while still reading more like spoken language than a type-heavy language.',
    ),
    checklist: list([
      ['หา def, end, symbol แบบ :name, block style และ instance variable @value ก่อน', 'Look for def, end, symbols like :name, block style, and instance variables such as @value first.'],
      ['attr_reader, File.readlines, map/select chain และ keyword argument เป็น marker ที่ดีของ Ruby hard', 'attr_reader, File.readlines, map/select chains, and keyword arguments are good hard Ruby markers.'],
      ['ถ้าโค้ดยังคง expressive มากและไม่บังคับ type ชัดแม้จะ object-oriented ให้คิดถึง Ruby', 'If the code stays highly expressive and avoids explicit typing even while being object-oriented, think Ruby.'],
    ]),
    falseFriendSplits: [
      split('python', [
        ['Python จะใช้ indentation แทน end และไม่ใช้ symbol หรือ instance variable แบบ @name', 'Python uses indentation instead of end and does not use symbols or @name instance variables that way.'],
        ['Ruby hard จะพา def ... end, block และสำเนียง DSL-like ออกมาชัดกว่า', 'Hard Ruby more clearly exposes def ... end, blocks, and a DSL-like accent.'],
      ]),
      split('bash', [
        ['Bash อาจมี line-based flow คล้ายกัน แต่จะเน้น command/pipe มากกว่า object/helper method', 'Bash can also be line-based, but it emphasizes commands/pipes more than object/helper methods.'],
        ['Ruby ยังเป็นภาษาโปรแกรมเต็มตัวที่มี class, method chain และ data structure helper มากกว่า shell script', 'Ruby remains a full programming language with classes, method chains, and data-structure helpers beyond shell scripting.'],
      ]),
    ],
  },
}

const gameIdentifyHardGuideData = Object.fromEntries(
  trackTopicIds['game-dev'].map((languageId) => [
    languageId,
    {
      snapshot: buildGameIdentifyHardSnapshot(languageId as GameLanguageId),
      checklist: buildGameIdentifyHardChecklist(languageId as GameLanguageId),
      falseFriendSplits: guideBookEntries[languageId].falseFriends
        .slice(0, 2)
        .map((target) => buildGameIdentifyHardFalseFriendSplit(languageId as GameLanguageId, target)),
    },
  ]),
) as Record<GameLanguageId, IdentifyHardGuideEntry>

export const identifyHardGuideData: Record<LanguageId, IdentifyHardGuideEntry> = {
  ...coreIdentifyHardGuideData,
  ...gameIdentifyHardGuideData,
}
