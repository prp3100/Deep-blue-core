import { createQuestionSet, type QuestionBankItem } from './quizModels'
import { coreHardQuestionBankExtensions } from './coreHardExtensions'

export const hardQuestionBank: QuestionBankItem[] = [
  ...createQuestionSet('hard', 'python', [
    {
      snippetText: `from dataclasses import dataclass

@dataclass
class Report:
    title: str
    pages: int = 0

    def summary(self) -> str:
        return f"{self.title} ({self.pages})"`,
      distractors: ['typescript', 'java', 'rust'],
      hint: {
        th: 'มี decorator, type hint และ class ที่ยังคงใช้การย่อหน้าแทนปีกกา',
        en: 'It uses decorators and type hints while still relying on indentation instead of braces.',
      },
      signals: ['@dataclass', 'def summary', 'indentation', 'f-string'],
    },
    {
      snippetText: `async def fetch_all(client, ids):
    tasks = [client.get(f"/posts/{item_id}") for item_id in ids]
    results = await asyncio.gather(*tasks)
    return [item.json() for item in results if item.ok]`,
      distractors: ['typescript', 'cloud-functions', 'dart'],
      hint: {
        th: 'เป็น async syntax แต่ไม่มีปีกกาและใช้ comprehension',
        en: 'It is async syntax without braces and still uses a comprehension.',
      },
      signals: ['async def', 'await', 'asyncio.gather', 'list comprehension'],
    },
    {
      snippetText: `counts = defaultdict(int)
for line in rows:
    key = line.strip().lower()
    if key:
        counts[key] += 1

top = sorted(counts.items(), key=lambda item: item[1], reverse=True)[:3]`,
      distractors: ['bash', 'rust', 'typescript'],
      hint: {
        th: 'มี lambda และการจัดการ dict แบบ dynamic',
        en: 'It uses a lambda and dynamic dictionary-style updates.',
      },
      signals: ['defaultdict', 'lambda', 'sorted(..., key=...)', 'dict mutation'],
    },
    {
      snippetText: `class Cache:
    def __init__(self):
        self.items = {}

    def get_or_set(self, key, factory):
        if key not in self.items:
            self.items[key] = factory()
        return self.items[key]`,
      distractors: ['java', 'php', 'csharp'],
      hint: {
        th: 'ดู constructor และ instance field ที่ไม่ต้องประกาศ type ชัด',
        en: 'Notice the constructor and instance fields without explicit type declarations.',
      },
      signals: ['__init__', 'self', 'if key not in', 'factory()'],
    },
  ]),
  ...createQuestionSet('hard', 'java', [
    {
      snippetText: `public record UserSummary(String name, long completed) {}

var result = tasks.stream()
    .filter(Task::done)
    .collect(Collectors.groupingBy(Task::owner, Collectors.counting()))
    .entrySet()
    .stream()
    .map(entry -> new UserSummary(entry.getKey(), entry.getValue()))
    .toList();`,
      distractors: ['typescript', 'csharp', 'rust'],
      hint: {
        th: 'มี stream pipeline และ record พร้อม method reference',
        en: 'It uses a stream pipeline, a record, and method references.',
      },
      signals: ['record', '.stream()', 'Collectors.groupingBy', 'Task::done'],
    },
    {
      snippetText: `public <T extends Comparable<T>> T maxOf(List<T> items) {
    return items.stream()
        .max(Comparator.naturalOrder())
        .orElseThrow(() -> new IllegalStateException("empty"));
}`,
      distractors: ['typescript', 'csharp', 'dart'],
      hint: {
        th: 'generic bound และ `orElseThrow` เป็นกลิ่นของภาษานี้มาก',
        en: 'The generic bound and `orElseThrow` are strong clues.',
      },
      signals: ['<T extends Comparable<T>>', 'stream().max', 'orElseThrow'],
    },
    {
      snippetText: `try (var reader = Files.newBufferedReader(path)) {
    return reader.lines()
        .map(String::trim)
        .filter(line -> !line.isBlank())
        .toList();
}`,
      distractors: ['csharp', 'cpp', 'typescript'],
      hint: {
        th: 'มี try-with-resources และ method reference แบบ `Type::method`',
        en: 'It uses try-with-resources and a `Type::method` reference.',
      },
      signals: ['try (...)', 'Files.newBufferedReader', 'String::trim', '.isBlank()'],
    },
    {
      snippetText: `sealed interface Result permits Success, Failure {}
final class Success implements Result {}
final class Failure implements Result {}

switch (result) {
    case Success success -> System.out.println("ok");
    case Failure failure -> System.out.println("fail");
}`,
      distractors: ['typescript', 'rust', 'csharp'],
      hint: {
        th: 'มี sealed interface และ switch pattern แบบสมัยใหม่',
        en: 'It uses a sealed interface and modern switch pattern syntax.',
      },
      signals: ['sealed interface', 'permits', 'case Success ->', 'System.out.println'],
    },
  ]),
  ...createQuestionSet('hard', 'html', [
    {
      snippetText: `<article class="lesson-card" data-level="advanced">
  <header>
    <h2>Signals and Syntax</h2>
    <p aria-live="polite">Updated 2 minutes ago</p>
  </header>
  <footer>
    <button type="button">Review</button>
  </footer>
</article>`,
      distractors: ['jsx', 'css', 'json'],
      hint: {
        th: 'ดู semantic tag, data attribute, และ ARIA attribute',
        en: 'Look at semantic tags, data attributes, and ARIA attributes.',
      },
      signals: ['<article>', 'data-level=', 'aria-live=', 'semantic markup'],
    },
    {
      snippetText: `<template id="result-row">
  <tr>
    <td class="label"></td>
    <td class="value"></td>
  </tr>
</template>
<table>
  <tbody></tbody>
</table>`,
      distractors: ['jsx', 'json', 'css'],
      hint: {
        th: 'ยังเป็น document structure ไม่ใช่ JavaScript expression',
        en: 'This is still document structure, not JavaScript expressions.',
      },
      signals: ['<template>', '<table>', 'class=', 'markup tree'],
    },
    {
      snippetText: `<dialog open>
  <form method="dialog">
    <h3>Leave Quiz?</h3>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>`,
      distractors: ['jsx', 'php', 'json'],
      hint: {
        th: 'มีแท็กของ document และ form method ที่เป็น attribute',
        en: 'It uses document tags and a form method declared as an attribute.',
      },
      signals: ['<dialog>', 'method="dialog"', 'button value=', 'HTML attributes'],
    },
    {
      snippetText: `<picture>
  <source media="(min-width: 900px)" srcset="/hero-large.webp" />
  <img src="/hero-small.webp" alt="Quiz dashboard preview" loading="lazy" />
</picture>`,
      distractors: ['jsx', 'css', 'json'],
      hint: {
        th: 'เป็น responsive media markup ไม่ใช่ style rule',
        en: 'This is responsive media markup, not a styling rule.',
      },
      signals: ['<picture>', '<source media=', 'srcset', '<img ... />'],
    },
  ]),
  ...createQuestionSet('hard', 'css', [
    {
      snippetText: `.dashboard {
  display: grid;
  grid-template-columns: 2fr minmax(18rem, 24rem);
  grid-template-areas:
    "hero stats"
    "quiz stats";
}`,
      distractors: ['html', 'typescript', 'json'],
      hint: {
        th: 'เป็น layout rule ที่ใช้ grid area หลายบรรทัด',
        en: 'It is a layout rule using grid areas across multiple lines.',
      },
      signals: ['grid-template-columns', 'grid-template-areas', 'selector'],
    },
    {
      snippetText: `:root {
  --accent: #1f8078;
  --panel-radius: clamp(18px, 2vw, 28px);
}

.panel {
  border-radius: var(--panel-radius);
  background: color-mix(in oklab, var(--accent), white 84%);
}`,
      distractors: ['json', 'html', 'typescript'],
      hint: {
        th: 'มี custom property, `var()`, และ function ด้าน style',
        en: 'It uses custom properties, `var()`, and styling functions.',
      },
      signals: [':root', '--accent', 'clamp()', 'var(--panel-radius)'],
    },
    {
      snippetText: `.choices :is(button, a):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}`,
      distractors: ['jsx', 'html', 'typescript'],
      hint: {
        th: 'มี pseudo-class และ selector helper แบบสมัยใหม่',
        en: 'It uses a modern selector helper and a pseudo-class.',
      },
      signals: [':is()', ':focus-visible', 'outline-offset'],
    },
    {
      snippetText: `@container sidebar (min-width: 28rem) {
  .stats {
    position: sticky;
    top: 1.5rem;
  }
}`,
      distractors: ['bash', 'html', 'json'],
      hint: {
        th: 'เป็น rule สำหรับ responsive container ไม่ใช่ media query ทั่วไป',
        en: 'It is a container-responsive rule rather than a typical media query.',
      },
      signals: ['@container', 'position: sticky', 'top: 1.5rem'],
    },
  ]),
  ...createQuestionSet('hard', 'json', [
    {
      snippetText: `{
  "quiz": {
    "difficulty": "hard",
    "hints": { "easy": 5, "hard": 7 },
    "languages": ["python", "java", "rust"]
  },
  "theme": {
    "surface": "#fffaf3",
    "accent": "#d96235"
  }
}`,
      distractors: ['typescript', 'css', 'html'],
      hint: {
        th: 'เป็น nested data structure ไม่มีตัวแปรหรือ function',
        en: 'It is nested data with no variables or functions.',
      },
      signals: ['quoted keys', 'nested objects', 'array data'],
    },
    {
      snippetText: `{
  "items": [
    { "id": "q1", "status": "correct", "elapsed": 12 },
    { "id": "q2", "status": "timeout", "elapsed": 25 }
  ],
  "summary": {
    "score": 18,
    "accuracy": 0.6
  }
}`,
      distractors: ['typescript', 'sql', 'python'],
      hint: {
        th: 'เป็น payload ข้อมูล ไม่ใช่ object พร้อม type annotation',
        en: 'It is a data payload, not an object with type annotations.',
      },
      signals: ['quoted keys', 'numeric and string values', 'data payload'],
    },
    {
      snippetText: `[
  {
    "name": "frontend",
    "stats": { "correct": 9, "wrong": 3 }
  },
  {
    "name": "backend",
    "stats": { "correct": 8, "wrong": 4 }
  }
]`,
      distractors: ['sql', 'typescript', 'python'],
      hint: {
        th: 'ทุก field ยังเป็นข้อมูลนิ่ง ไม่มี expression',
        en: 'Every field is still static data with no expressions.',
      },
      signals: ['array', 'object entries', 'quoted keys', 'static data'],
    },
    {
      snippetText: `{
  "request": {
    "path": "/quiz/submit",
    "method": "POST",
    "headers": {
      "content-type": "application/json"
    }
  }
}`,
      distractors: ['bash', 'typescript', 'php'],
      hint: {
        th: 'โครงสร้างดูเหมือน config/request body มากกว่า code ทำงาน',
        en: 'It looks like configuration or a request body rather than executable code.',
      },
      signals: ['request object', 'quoted keys', 'no executable syntax'],
    },
  ]),
  ...createQuestionSet('hard', 'csharp', [
    {
      snippetText: `public record QuizResult(string UserId, int Score, DateTime FinishedAt);

var topUsers = results
    .Where(result => result.Score >= 20)
    .OrderByDescending(result => result.Score)
    .Select(result => result.UserId)
    .ToList();`,
      distractors: ['java', 'typescript', 'rust'],
      hint: {
        th: 'มี record และ LINQ chain พร้อม .NET naming style',
        en: 'It uses a record and a LINQ chain with .NET naming style.',
      },
      signals: ['record', '.Where()', '.OrderByDescending()', '.ToList()'],
    },
    {
      snippetText: `public async Task<IReadOnlyList<string>> LoadNamesAsync(CancellationToken token)
{
    await using var stream = File.OpenRead("users.json");
    var users = await JsonSerializer.DeserializeAsync<List<User>>(stream, cancellationToken: token);
    return users?.Select(user => user.Name).ToList() ?? [];
}`,
      distractors: ['typescript', 'java', 'rust'],
      hint: {
        th: 'มี `Task`, `await using`, `JsonSerializer` และชนิดข้อมูลแบบ .NET',
        en: 'It combines `Task`, `await using`, `JsonSerializer`, and .NET type names.',
      },
      signals: ['Task<IReadOnlyList<string>>', 'await using', 'JsonSerializer', '?? []'],
    },
    {
      snippetText: `return request switch
{
    { Score: >= 25 } => "expert",
    { Score: >= 15 } => "learner",
    _ => "newbie",
};`,
      distractors: ['rust', 'java', 'typescript'],
      hint: {
        th: 'เป็น pattern matching สไตล์ภาษานี้ ไม่ใช่ `match` แบบ Rust',
        en: 'This is this language’s switch expression style, not Rust’s `match`.',
      },
      signals: ['switch expression', '{ Score: >= 25 }', '_ =>', 'C# pattern matching'],
    },
    {
      snippetText: `public sealed class QuizService(HttpClient client)
{
    public async Task<Result> SubmitAsync(QuizPayload payload)
    {
        var response = await client.PostAsJsonAsync("/quiz", payload);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<Result>())!;
    }
}`,
      distractors: ['java', 'typescript', 'rust'],
      hint: {
        th: 'มี primary constructor style และ HTTP helper ของ .NET',
        en: 'It uses primary-constructor style with .NET HTTP helpers.',
      },
      signals: ['sealed class', 'HttpClient', 'PostAsJsonAsync', 'ReadFromJsonAsync'],
    },
  ]),
  ...createQuestionSet('hard', 'cpp', [
    {
      snippetText: `template <typename T>
auto average(const std::vector<T>& values) {
    auto total = std::accumulate(values.begin(), values.end(), T{});
    return values.empty() ? T{} : total / static_cast<T>(values.size());
}`,
      distractors: ['rust', 'java', 'typescript'],
      hint: {
        th: 'มี template, `std::vector`, reference และ `static_cast`',
        en: 'It uses templates, `std::vector`, references, and `static_cast`.',
      },
      signals: ['template <typename T>', 'const std::vector<T>&', 'static_cast'],
    },
    {
      snippetText: `auto file = std::make_unique<std::ifstream>("scores.txt");
if (!file->is_open()) {
    throw std::runtime_error("cannot open file");
}

std::string line;
while (std::getline(*file, line)) {
    std::cout << line << std::endl;
}`,
      distractors: ['csharp', 'rust', 'java'],
      hint: {
        th: 'ดู `std::make_unique`, pointer access `->`, และ stream ของ C++',
        en: 'Notice `std::make_unique`, pointer access with `->`, and C++ streams.',
      },
      signals: ['std::make_unique', '->', 'std::getline', 'std::endl'],
    },
    {
      snippetText: `std::ranges::sort(users, {}, &User::score);
auto top = std::ranges::find_if(users, [](const User& user) {
    return user.score > 90;
});

if (top != users.end()) {
    std::cout << top->name;
}`,
      distractors: ['rust', 'java', 'csharp'],
      hint: {
        th: 'มี ranges, lambda, และ member pointer แบบ C++',
        en: 'It uses ranges, lambdas, and member pointers in classic C++ style.',
      },
      signals: ['std::ranges::sort', '[](const User& user)', '&User::score', 'top->name'],
    },
    {
      snippetText: `class QuizEngine final {
public:
    explicit QuizEngine(std::string name) : name_(std::move(name)) {}

    auto name() const -> const std::string& { return name_; }

private:
    std::string name_;
};`,
      distractors: ['java', 'rust', 'csharp'],
      hint: {
        th: 'มี trailing return style, `std::move`, และ underscore field name',
        en: 'It uses trailing return style, `std::move`, and underscored field naming.',
      },
      signals: ['final', 'explicit', 'std::move', 'auto name() const ->'],
    },
  ]),
  ...createQuestionSet('hard', 'flutter', [
    {
      snippetText: `return CustomScrollView(
  slivers: [
    SliverAppBar(
      pinned: true,
      expandedHeight: 180,
      flexibleSpace: FlexibleSpaceBar(title: Text('Quiz')),
    ),
    SliverList.builder(
      itemCount: items.length,
      itemBuilder: (context, index) => ListTile(title: Text(items[index].title)),
    ),
  ],
);`,
      distractors: ['dart', 'jsx', 'html'],
      hint: {
        th: 'เป็น widget tree เชิง layout ขั้นสูงของ Flutter',
        en: 'This is an advanced Flutter widget tree for scroll layout.',
      },
      signals: ['CustomScrollView', 'SliverAppBar', 'SliverList.builder', 'FlexibleSpaceBar'],
    },
    {
      snippetText: `return FutureBuilder<Result>(
  future: repository.loadResult(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const CircularProgressIndicator();
    return AnimatedSwitcher(
      duration: Duration(milliseconds: 300),
      child: Text(snapshot.data!.title),
    );
  },
);`,
      distractors: ['dart', 'jsx', 'typescript'],
      hint: {
        th: 'มี FutureBuilder, widget state snapshot และ non-null assertion ของสาย Flutter',
        en: 'It uses FutureBuilder, widget snapshots, and Flutter-style non-null access.',
      },
      signals: ['FutureBuilder', 'builder: (context, snapshot)', 'AnimatedSwitcher', 'snapshot.data!'],
    },
    {
      snippetText: `return TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: score / total),
  duration: Duration(milliseconds: 600),
  builder: (context, value, child) {
    return Transform.scale(
      scale: 0.95 + (value * 0.05),
      child: CircularProgressIndicator(value: value),
    );
  },
);`,
      distractors: ['dart', 'jsx', 'css'],
      hint: {
        th: 'เป็น animation widget chain แบบ Flutter ชัดมาก',
        en: 'This is clearly a Flutter animation-widget chain.',
      },
      signals: ['TweenAnimationBuilder', 'Transform.scale', 'CircularProgressIndicator', 'builder: (context, value, child)'],
    },
  ]),
  ...createQuestionSet('hard', 'dart', [
    {
      snippetText: `extension ScoreFormatting on int {
  String toBadge() {
    return switch (this) {
      >= 25 => 'Expert',
      >= 15 => 'Learner',
      _ => 'Newbie',
    };
  }
}`,
      distractors: ['typescript', 'rust', 'java'],
      hint: {
        th: 'เป็นภาษาหลักของ Flutter แต่ไม่ใช่ widget tree ในข้อนี้',
        en: 'This is Flutter’s base language, but not a widget tree in this case.',
      },
      signals: ['extension', 'String toBadge()', 'switch (this)', "=>'"],
    },
    {
      snippetText: `Future<Map<String, dynamic>> loadProfile(HttpClient client) async {
  final response = await client.getUrl(Uri.parse('https://example.com/profile'));
  final text = await response.close().transform(utf8.decoder).join();
  return jsonDecode(text) as Map<String, dynamic>;
}`,
      distractors: ['typescript', 'python', 'cloud-functions'],
      hint: {
        th: 'มี `Future`, `Uri.parse`, `jsonDecode` และ type แบบภาษานี้',
        en: 'It uses `Future`, `Uri.parse`, `jsonDecode`, and this language’s type style.',
      },
      signals: ['Future<...>', 'Uri.parse', 'jsonDecode', 'Map<String, dynamic>'],
    },
    {
      snippetText: `sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T value;
  const Success(this.value);
}`,
      distractors: ['java', 'typescript', 'rust'],
      hint: {
        th: 'มี `sealed class`, generic และ `const` constructor',
        en: 'It uses `sealed class`, generics, and a `const` constructor.',
      },
      signals: ['sealed class', 'const', 'extends Result<T>', 'final T value'],
    },
  ]),
  ...createQuestionSet('hard', 'jsx', [
    {
      snippetText: `return (
  <>
    <Header title={title} />
    {groups.map((group) => (
      <Section key={group.id} heading={group.name}>
        {group.items.map((item) => <Chip key={item.id} label={item.label} />)}
      </Section>
    ))}
  </>
);`,
      distractors: ['html', 'flutter', 'typescript'],
      hint: {
        th: 'มี fragment, component tree และ expression ซ้อนใน `{}`',
        en: 'It uses fragments, component trees, and nested expressions inside `{}`.',
      },
      signals: ['<>...</>', '{groups.map(...)', 'component tags', 'key='],
    },
    {
      snippetText: `const toolbar = (
  <aside className="toolbar">
    <button onClick={() => onFilterChange('all')}>All</button>
    <button onClick={() => onFilterChange('wrong')}>Wrong</button>
  </aside>
);`,
      distractors: ['html', 'typescript', 'flutter'],
      hint: {
        th: 'คล้าย HTML แต่ event handler เป็น expression ของ React',
        en: 'It looks like HTML, but the event handlers are React expressions.',
      },
      signals: ['className', 'onClick={() => ...}', '<aside>', 'JS expression props'],
    },
    {
      snippetText: `{results.length === 0 ? (
  <EmptyState title="No answers yet" />
) : (
  <ResultList items={results} />
)}`,
      distractors: ['html', 'typescript', 'flutter'],
      hint: {
        th: 'conditional render อยู่ใน `{}` ไม่ใช่แท็กล้วน',
        en: 'Conditional rendering happens inside `{}`, not pure tags.',
      },
      signals: ['ternary inside JSX', '{} expressions', 'component tags'],
    },
    {
      snippetText: `const row = (
  <ProgressBar
    value={Math.round((correct / total) * 100)}
    label={\`\${correct}/\${total}\`}
  />
);`,
      distractors: ['typescript', 'html', 'flutter'],
      hint: {
        th: 'มี component แบบ self-closing พร้อม prop expression',
        en: 'It has a self-closing component with expression-based props.',
      },
      signals: ['<ProgressBar />', 'value={...}', 'template literal inside prop'],
    },
  ]),
  ...createQuestionSet('hard', 'typescript', [
    {
      snippetText: `type QuestionResult<TChoice extends string> = {
  choice: TChoice;
  correct: boolean;
  reason?: string;
};

const toMap = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((item) => [item.id, item]));`,
      distractors: ['csharp', 'dart', 'rust'],
      hint: {
        th: 'generic constraint และ utility type โลก JS ชี้ไปชัดมาก',
        en: 'The generic constraint and utility typing are strong JS-world clues.',
      },
      signals: ['TChoice extends string', 'Record<string, T>', 'Object.fromEntries'],
    },
    {
      snippetText: `interface Success {
  type: 'success';
  value: number;
}

interface Failure {
  type: 'failure';
  message: string;
}

type Result = Success | Failure;`,
      distractors: ['rust', 'csharp', 'java'],
      hint: {
        th: 'เป็น discriminated union ผ่าน string literal และ interface',
        en: 'It models a discriminated union with interfaces and string literals.',
      },
      signals: ['interface', "type: 'success'", 'union type', 'type Result ='],
    },
    {
      snippetText: `async function loadQuiz(): Promise<QuizQuestion[]> {
  const response = await fetch('/api/quiz');
  if (!response.ok) throw new Error('Request failed');
  return (await response.json()) as QuizQuestion[];
}`,
      distractors: ['csharp', 'cloud-functions', 'dart'],
      hint: {
        th: 'async function ของโลกเว็บพร้อม `Promise<...>` และ cast',
        en: 'This is web-style async code with `Promise<...>` and casting.',
      },
      signals: ['Promise<QuizQuestion[]>', 'fetch', 'response.json()', 'as QuizQuestion[]'],
    },
    {
      snippetText: `type ModeConfig = {
  [K in 'easy' | 'hard']: {
    hintLimit: number;
    label: string;
  };
};`,
      distractors: ['rust', 'csharp', 'json'],
      hint: {
        th: 'มี mapped type และ type-level key transform',
        en: 'It uses a mapped type over string keys.',
      },
      signals: ['[K in ...]', 'hintLimit: number', 'type alias'],
    },
  ]),
  ...createQuestionSet('hard', 'bash', [
    {
      snippetText: `#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  rm -f "$TMP_FILE"
}

trap cleanup EXIT`,
      distractors: ['python', 'cloud-functions', 'php'],
      hint: {
        th: 'มี `trap`, shell function และ strict mode',
        en: 'It uses `trap`, shell functions, and strict mode.',
      },
      signals: ['#!/usr/bin/env bash', 'set -euo pipefail', 'trap', 'shell function'],
    },
    {
      snippetText: `while IFS=',' read -r name score; do
  printf '%s => %s\n' "$name" "$score"
done < scores.csv`,
      distractors: ['python', 'sql', 'php'],
      hint: {
        th: 'เป็น loop อ่านไฟล์แบบ shell พร้อม redirection',
        en: 'It is a shell loop reading a file with redirection.',
      },
      signals: ['IFS=', 'read -r', 'printf', 'done < file'],
    },
    {
      snippetText: `case "$MODE" in
  easy)
    echo "5 hints"
    ;;
  hard)
    echo "7 hints"
    ;;
  *)
    echo "unknown mode"
    ;;
esac`,
      distractors: ['sql', 'python', 'php'],
      hint: {
        th: 'มี `case ... esac` ซึ่งเป็น pattern ของ shell',
        en: 'It uses `case ... esac`, a classic shell pattern.',
      },
      signals: ['case', ';;', 'esac', '$MODE'],
    },
    {
      snippetText: `mapfile -t files < <(find . -name '*.json')
for file in "\${files[@]}"; do
  jq '.summary.score' "$file"
done`,
      distractors: ['python', 'cloud-functions', 'sql'],
      hint: {
        th: 'มี process substitution และ array expansion แบบ shell',
        en: 'It uses process substitution and shell array expansion.',
      },
      signals: ['mapfile', '< <(...)', '"${files[@]}"', 'jq'],
    },
  ]),
  ...createQuestionSet('hard', 'cloud-functions', [
    {
      snippetText: `exports.rebuildScoreboard = onCall(async (request) => {
  const snapshot = await db.collection('results').where('done', '==', true).get();
  const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().score, 0);
  return { total, count: snapshot.size };
});`,
      distractors: ['typescript', 'sql', 'jsx'],
      hint: {
        th: 'มี callable trigger และ query ใน handler ที่ export ออกไป',
        en: 'It exports a callable trigger and runs a query inside the handler.',
      },
      signals: ['exports.', 'onCall', 'db.collection(...).get()', 'handler return'],
    },
    {
      snippetText: `exports.cleanOldSessions = onSchedule('every day 03:00', async () => {
  const snapshot = await db.collection('sessions').where('expired', '==', true).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
});`,
      distractors: ['typescript', 'bash', 'sql'],
      hint: {
        th: 'เป็น scheduled function ที่ทำงานบน event platform ไม่ใช่ script shell',
        en: 'This is a scheduled platform function, not a shell script.',
      },
      signals: ['onSchedule', 'db.batch()', 'batch.commit()', 'exports.'],
    },
    {
      snippetText: `exports.syncLeaderboard = onDocumentCreated('results/{resultId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await db.collection('leaderboard').doc(data.userId).set(
    { score: data.score, updatedAt: Date.now() },
    { merge: true },
  );
});`,
      distractors: ['typescript', 'jsx', 'dart'],
      hint: {
        th: 'มี document trigger และ event object จากแพลตฟอร์ม serverless',
        en: 'It uses a document trigger and an event object from a serverless platform.',
      },
      signals: ['onDocumentCreated', 'event.data?.data()', 'exports.', '.set(..., { merge: true })'],
    },
  ]),
  ...createQuestionSet('hard', 'sql', [
    {
      snippetText: `WITH ranked_results AS (
  SELECT
    user_id,
    score,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY finished_at DESC) AS rn
  FROM quiz_results
)
SELECT user_id, score
FROM ranked_results
WHERE rn = 1;`,
      distractors: ['typescript', 'json', 'bash'],
      hint: {
        th: 'มี CTE และ window function',
        en: 'It uses a CTE and a window function.',
      },
      signals: ['WITH', 'ROW_NUMBER() OVER', 'PARTITION BY', 'SELECT'],
    },
    {
      snippetText: `SELECT
  mode,
  AVG(score) AS average_score,
  SUM(CASE WHEN score >= 20 THEN 1 ELSE 0 END) AS passed
FROM quiz_results
GROUP BY mode
HAVING COUNT(*) >= 5;`,
      distractors: ['csharp', 'json', 'bash'],
      hint: {
        th: 'aggregate กับ CASE อยู่ใน query เดียว',
        en: 'It combines aggregates and CASE expressions in a single query.',
      },
      signals: ['AVG()', 'SUM(CASE WHEN', 'GROUP BY', 'HAVING'],
    },
    {
      snippetText: `SELECT user_id, score
FROM quiz_results q
WHERE score = (
  SELECT MAX(score)
  FROM quiz_results
  WHERE mode = q.mode
);`,
      distractors: ['java', 'json', 'bash'],
      hint: {
        th: 'มี correlated subquery ในเงื่อนไข',
        en: 'It uses a correlated subquery inside the filter.',
      },
      signals: ['subquery', 'MAX(score)', 'WHERE mode = q.mode'],
    },
    {
      snippetText: `SELECT
  DATE(finished_at) AS day,
  COUNT(*) FILTER (WHERE correct = true) AS correct_answers,
  COUNT(*) FILTER (WHERE correct = false) AS wrong_answers
FROM answer_events
GROUP BY DATE(finished_at)
ORDER BY day DESC;`,
      distractors: ['bash', 'typescript', 'json'],
      hint: {
        th: 'มี aggregate filter syntax และ date grouping',
        en: 'It uses filtered aggregates and date-based grouping.',
      },
      signals: ['COUNT(*) FILTER', 'DATE(...)', 'GROUP BY', 'ORDER BY'],
    },
  ]),
  ...createQuestionSet('hard', 'php', [
    {
      snippetText: `final class QuizResult
{
    public function __construct(
        public readonly string $userId,
        public readonly int $score,
    ) {}
}`,
      distractors: ['csharp', 'java', 'typescript'],
      hint: {
        th: 'มี `$` variable และ constructor property promotion',
        en: 'It uses `$` variables and constructor property promotion.',
      },
      signals: ['public readonly', '$userId', '__construct', 'PHP property promotion'],
    },
    {
      snippetText: `$scores = array_map(
    fn (array $row): int => $row['score'],
    $results,
);

$average = array_sum($scores) / max(count($scores), 1);`,
      distractors: ['typescript', 'python', 'csharp'],
      hint: {
        th: 'มี arrow function ของ PHP และตัวแปรขึ้นต้นด้วย `$`',
        en: 'It uses a PHP arrow function and `$`-prefixed variables.',
      },
      signals: ['array_map', 'fn (...) =>', '$row', 'array_sum'],
    },
    {
      snippetText: `$mode = $_GET['mode'] ?? 'easy';
$label = match ($mode) {
    'easy' => 'Starter',
    'hard' => 'Deep Dive',
    default => 'Unknown',
};`,
      distractors: ['typescript', 'bash', 'rust'],
      hint: {
        th: 'มี superglobal และ null coalescing ของภาษา server-side นี้',
        en: 'It uses a superglobal and null-coalescing from this server-side language.',
      },
      signals: ['$_GET', '??', 'match ($mode)', '$label'],
    },
    {
      snippetText: `$pdo->beginTransaction();

$statement = $pdo->prepare('UPDATE users SET score = :score WHERE id = :id');
$statement->execute([
    ':score' => $score,
    ':id' => $userId,
]);

$pdo->commit();`,
      distractors: ['sql', 'typescript', 'python'],
      hint: {
        th: 'มี object access `->` และ placeholder array แบบนี้',
        en: 'It uses object access with `->` and this placeholder array style.',
      },
      signals: ['$pdo->', 'prepare()', 'execute([', "':score' =>"],
    },
  ]),
  ...createQuestionSet('hard', 'rust', [
    {
      snippetText: `fn load_score(path: &str) -> Result<u32, Box<dyn std::error::Error>> {
    let text = std::fs::read_to_string(path)?;
    let score = text.trim().parse::<u32>()?;
    Ok(score)
}`,
      distractors: ['cpp', 'python', 'typescript'],
      hint: {
        th: 'มี `Result`, `?`, `Ok(...)` และ generic parse syntax',
        en: 'It uses `Result`, `?`, `Ok(...)`, and generic parse syntax.',
      },
      signals: ['Result<...>', '? operator', 'parse::<u32>()', 'Ok(score)'],
    },
    {
      snippetText: `fn top_scores(items: &[u32]) -> Vec<u32> {
    items
        .iter()
        .copied()
        .filter(|score| *score >= 20)
        .take(3)
        .collect()
}`,
      distractors: ['cpp', 'python', 'typescript'],
      hint: {
        th: 'มี iterator chain และ closure แบบ Rust',
        en: 'It uses an iterator chain and Rust-style closures.',
      },
      signals: ['&[u32]', '.iter().copied()', '.filter(|score|', '.collect()'],
    },
    {
      snippetText: `trait Renderable {
    fn render(&self) -> String;
}

impl Renderable for QuizCard {
    fn render(&self) -> String {
        format!("{} - {}", self.title, self.score)
    }
}`,
      distractors: ['java', 'typescript', 'csharp'],
      hint: {
        th: 'มี `trait`, `impl`, reference แบบ `&self` และ macro `format!`',
        en: 'It uses `trait`, `impl`, `&self`, and the `format!` macro.',
      },
      signals: ['trait', 'impl ... for', '&self', 'format!'],
    },
  ]),
  ...coreHardQuestionBankExtensions,
]
