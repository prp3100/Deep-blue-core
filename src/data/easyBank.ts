import { createQuestionSet, type QuestionBankItem } from './quizModels'
import { coreEasyQuestionBankExtensions } from './coreEasyExtensions'

export const easyQuestionBank: QuestionBankItem[] = [
  ...createQuestionSet('easy', 'python', [
    {
      snippetText: `def greet(name):
    if name:
        print(f"Hi, {name}")
    else:
        print("Hi")`,
      distractors: ['java', 'typescript', 'bash'],
      hint: {
        th: 'ดูการย่อหน้าและคำสั่งพิมพ์ผลลัพธ์ที่ไม่ต้องมี semicolon',
        en: 'Look at indentation and the print statement without semicolons.',
      },
      signals: ['def', 'indentation', 'print()', 'f-string'],
    },
    {
      snippetText: `numbers = [1, 2, 3]
doubled = [n * 2 for n in numbers]
print(doubled)`,
      distractors: ['rust', 'dart', 'json'],
      hint: {
        th: 'มีรูปแบบสร้าง list ใหม่จาก list เดิมในบรรทัดเดียว',
        en: 'It builds a new list from an old one in a single line.',
      },
      signals: ['list comprehension', 'print()', 'dynamic list'],
    },
    {
      snippetText: `data = {"name": "Mira", "active": True}
for key, value in data.items():
    print(key, value)`,
      distractors: ['php', 'json', 'csharp'],
      hint: {
        th: 'ดูค่า boolean และ method ของ object map',
        en: 'Notice the boolean style and the map iteration method.',
      },
      signals: ['True', '.items()', 'for key, value in'],
    },
    {
      snippetText: `if __name__ == "__main__":
    total = sum(range(5))
    print(total)`,
      distractors: ['bash', 'php', 'java'],
      hint: {
        th: 'มี pattern ที่มักใช้เวลา run ไฟล์โดยตรง',
        en: 'It includes a pattern commonly used when a file runs directly.',
      },
      signals: ['__name__', 'sum(range())', 'indentation'],
    },
  ]),
  ...createQuestionSet('easy', 'java', [
    {
      snippetText: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`,
      distractors: ['csharp', 'cpp', 'typescript'],
      hint: {
        th: 'ดู method เริ่มต้นของโปรแกรมและคำสั่งพิมพ์ผลแบบมาตรฐาน',
        en: 'Look at the standard entry method and print statement.',
      },
      signals: ['public static void main', 'System.out.println', 'class'],
    },
    {
      snippetText: `List<String> names = new ArrayList<>();
names.add("Ari");
for (String name : names) {
    System.out.println(name);
}`,
      distractors: ['csharp', 'cpp', 'dart'],
      hint: {
        th: 'มี generic collection และ enhanced for loop',
        en: 'It uses a generic collection and an enhanced for loop.',
      },
      signals: ['List<String>', 'new ArrayList<>()', 'for (Type value : list)'],
    },
    {
      snippetText: `private final int port;

public Server(int port) {
    this.port = port;
}`,
      distractors: ['csharp', 'rust', 'php'],
      hint: {
        th: 'ดู field ที่ประกาศชนิดชัดและ constructor style',
        en: 'Look at the explicit field type and constructor style.',
      },
      signals: ['private final', 'int port', 'this.port = port'],
    },
    {
      snippetText: `@Override
public String toString() {
    return "Ready";
}`,
      distractors: ['csharp', 'typescript', 'rust'],
      hint: {
        th: 'annotation นี้เจอบ่อยมากในภาษาเชิง OOP ตัวนี้',
        en: 'This annotation is a strong clue for this OOP language.',
      },
      signals: ['@Override', 'public String', 'toString()'],
    },
  ]),
  ...createQuestionSet('easy', 'html', [
    {
      snippetText: `<section class="hero">
  <h1>Learn Faster</h1>
  <p>Practice one step at a time.</p>
</section>`,
      distractors: ['jsx', 'css', 'json'],
      hint: {
        th: 'ดู attribute ชื่อ `class` และแท็กเปิดปิดล้วน ๆ',
        en: 'Notice the `class` attribute and pure opening/closing tags.',
      },
      signals: ['class=', '<section>', '<h1>', 'markup only'],
    },
    {
      snippetText: `<form action="/signup" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" />
</form>`,
      distractors: ['jsx', 'php', 'json'],
      hint: {
        th: 'เป็นโครงสร้าง document พร้อม attribute ของ form',
        en: 'This is document markup with form-specific attributes.',
      },
      signals: ['<form>', 'action=', 'method=', '<input />'],
    },
    {
      snippetText: `<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>`,
      distractors: ['jsx', 'css', 'json'],
      hint: {
        th: 'ดูแท็ก anchor และ attribute สำหรับลิงก์',
        en: 'Look at the anchor tags and link attributes.',
      },
      signals: ['<a href=', '<nav>', 'tag pairs'],
    },
    {
      snippetText: `<ul>
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</ul>`,
      distractors: ['jsx', 'json', 'css'],
      hint: {
        th: 'เป็นรายการแบบ markup ไม่มี JS expression',
        en: 'It is a plain markup list without JS expressions.',
      },
      signals: ['<ul>', '<li>', 'plain tags'],
    },
  ]),
  ...createQuestionSet('easy', 'css', [
    {
      snippetText: `.card {
  display: grid;
  gap: 1rem;
  border-radius: 20px;
}`,
      distractors: ['html', 'jsx', 'json'],
      hint: {
        th: 'มี selector แล้วตามด้วย property-value หลายบรรทัด',
        en: 'There is a selector followed by multiple property-value lines.',
      },
      signals: ['selector', 'display: grid', 'border-radius'],
    },
    {
      snippetText: `@media (max-width: 768px) {
  .menu {
    display: none;
  }
}`,
      distractors: ['bash', 'html', 'typescript'],
      hint: {
        th: 'ดู media query สำหรับ responsive layout',
        en: 'Look at the media query for responsive layout.',
      },
      signals: ['@media', '.menu', 'display: none'],
    },
    {
      snippetText: `button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}`,
      distractors: ['jsx', 'html', 'csharp'],
      hint: {
        th: 'มี pseudo-class และคำสั่ง style ล้วน',
        en: 'It uses a pseudo-class and pure styling declarations.',
      },
      signals: [':hover', 'transform', 'box-shadow'],
    },
    {
      snippetText: `#banner::before {
  content: "";
  position: absolute;
  inset: 0;
}`,
      distractors: ['html', 'jsx', 'json'],
      hint: {
        th: 'สังเกต pseudo-element สองโคลอน',
        en: 'Notice the pseudo-element with double colons.',
      },
      signals: ['::before', 'content', 'position: absolute'],
    },
  ]),
  ...createQuestionSet('easy', 'json', [
    {
      snippetText: `{
  "name": "Nina",
  "age": 12,
  "skills": ["drawing", "music"]
}`,
      distractors: ['typescript', 'python', 'html'],
      hint: {
        th: 'เป็นข้อมูลล้วน ไม่มี function หรือ comment',
        en: 'This is pure data with no functions or comments.',
      },
      signals: ['quoted keys', 'object literal', 'array values'],
    },
    {
      snippetText: `{
  "theme": {
    "primary": "#1f8f78",
    "radius": 24
  }
}`,
      distractors: ['css', 'typescript', 'html'],
      hint: {
        th: 'ทุก key อยู่ใน double quote',
        en: 'Every key is wrapped in double quotes.',
      },
      signals: ['double-quoted keys', 'nested object', 'pure configuration data'],
    },
    {
      snippetText: `[
  { "id": 1, "done": false },
  { "id": 2, "done": true }
]`,
      distractors: ['python', 'sql', 'typescript'],
      hint: {
        th: 'เป็น array ของ object และใช้ `true/false` แบบ data format',
        en: 'It is an array of objects using data-format booleans.',
      },
      signals: ['array of objects', 'true/false', 'quoted keys'],
    },
    {
      snippetText: `{
  "server": "api.local",
  "port": 8080,
  "secure": true
}`,
      distractors: ['bash', 'csharp', 'typescript'],
      hint: {
        th: 'ไม่มีการประกาศตัวแปรหรือ type annotation',
        en: 'There are no variable declarations or type annotations.',
      },
      signals: ['config object', 'quoted keys', 'data only'],
    },
  ]),
  ...createQuestionSet('easy', 'csharp', [
    {
      snippetText: `using System;
class Program
{
    static void Main()
    {
        Console.WriteLine("Hello");
    }
}`,
      distractors: ['java', 'cpp', 'rust'],
      hint: {
        th: 'ดู namespace import และคำสั่งพิมพ์ผลของ .NET',
        en: 'Look at the namespace import and the .NET print call.',
      },
      signals: ['using System', 'Console.WriteLine', 'Main()'],
    },
    {
      snippetText: `public class User
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
}`,
      distractors: ['java', 'typescript', 'php'],
      hint: {
        th: 'property แบบ `{ get; set; }` ชี้ชัดมาก',
        en: 'Properties with `{ get; set; }` are a strong clue.',
      },
      signals: ['{ get; set; }', 'string', 'public class'],
    },
    {
      snippetText: `var items = new List<int> { 1, 2, 3 };
foreach (var item in items)
{
    Console.WriteLine(item);
}`,
      distractors: ['java', 'cpp', 'python'],
      hint: {
        th: 'มี `var`, `foreach`, และ collection style ของภาษาในฝั่ง .NET',
        en: 'Notice `var`, `foreach`, and the .NET collection style.',
      },
      signals: ['var', 'foreach', 'List<int>', 'Console.WriteLine'],
    },
    {
      snippetText: `public async Task<string> LoadAsync()
{
    return await client.GetStringAsync("/posts");
}`,
      distractors: ['typescript', 'java', 'rust'],
      hint: {
        th: 'ดูการคืนค่าเป็น `Task<string>`',
        en: 'Pay attention to the `Task<string>` return type.',
      },
      signals: ['async Task<string>', 'await', 'PascalCase method'],
    },
  ]),
  ...createQuestionSet('easy', 'cpp', [
    {
      snippetText: `#include <iostream>
int main() {
    std::cout << "Hello\\n";
    return 0;
}`,
      distractors: ['csharp', 'java', 'rust'],
      hint: {
        th: 'มี header import แบบ preprocessor และ `std::`',
        en: 'It includes a preprocessor header and `std::` usage.',
      },
      signals: ['#include', 'std::cout', 'return 0'],
    },
    {
      snippetText: `std::vector<int> values = {1, 2, 3};
for (int value : values) {
    std::cout << value << std::endl;
}`,
      distractors: ['java', 'csharp', 'rust'],
      hint: {
        th: 'ดู `std::vector` กับ namespace syntax',
        en: 'Look at `std::vector` and namespace syntax.',
      },
      signals: ['std::vector', 'std::cout', '::'],
    },
    {
      snippetText: `class Box {
public:
    Box(int size) : size(size) {}
private:
    int size;
};`,
      distractors: ['java', 'csharp', 'rust'],
      hint: {
        th: 'มี constructor initializer และ access label พร้อม colon',
        en: 'It uses a constructor initializer and access labels with colons.',
      },
      signals: ['public:', 'private:', 'initializer list', 'class ;'],
    },
    {
      snippetText: `auto total = std::accumulate(nums.begin(), nums.end(), 0);
if (total > 10) {
    std::cout << total;
}`,
      distractors: ['rust', 'csharp', 'java'],
      hint: {
        th: 'มี iterator และ algorithm จาก standard library',
        en: 'It uses iterators and a standard library algorithm.',
      },
      signals: ['auto', 'std::accumulate', 'begin()/end()'],
    },
  ]),
  ...createQuestionSet('easy', 'flutter', [
    {
      snippetText: `return Scaffold(
  appBar: AppBar(title: Text('Dashboard')),
  body: Center(child: Text('Ready')),
);`,
      distractors: ['dart', 'jsx', 'html'],
      hint: {
        th: 'เป็น widget tree สำหรับ UI mobile',
        en: 'This is a widget tree for mobile UI.',
      },
      signals: ['Scaffold', 'AppBar', 'Text(', 'widget tree'],
    },
    {
      snippetText: `Padding(
  padding: EdgeInsets.all(16),
  child: Column(
    children: [Text('Profile'), SizedBox(height: 12)],
  ),
)`,
      distractors: ['dart', 'css', 'jsx'],
      hint: {
        th: 'มี widget ซ้อนกันหลายชั้นและ property แบบ named',
        en: 'It nests widgets and uses named properties.',
      },
      signals: ['Padding(', 'EdgeInsets', 'Column', 'children:'],
    },
    {
      snippetText: `ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
)`,
      distractors: ['dart', 'jsx', 'java'],
      hint: {
        th: 'มี widget สำหรับ list แบบ builder',
        en: 'It contains a builder-based list widget.',
      },
      signals: ['ListView.builder', 'itemBuilder', 'ListTile'],
    },
  ]),
  ...createQuestionSet('easy', 'dart', [
    {
      snippetText: `void main() {
  final scores = <int>[1, 2, 3];
  print(scores.where((n) => n.isEven).toList());
}`,
      distractors: ['python', 'typescript', 'rust'],
      hint: {
        th: 'มี `final` และ generic list แบบภาษานี้',
        en: 'It uses `final` and the language’s generic list style.',
      },
      signals: ['final', '<int>[]', 'print()', 'toList()'],
    },
    {
      snippetText: `String formatName({required String first, String last = ''}) {
  return '$first $last'.trim();
}`,
      distractors: ['typescript', 'java', 'csharp'],
      hint: {
        th: 'ดู named parameter และ string interpolation',
        en: 'Notice named parameters and string interpolation.',
      },
      signals: ['required', 'String', '$first', 'named parameters'],
    },
    {
      snippetText: `class Box<T> {
  final T value;
  Box(this.value);
}`,
      distractors: ['typescript', 'java', 'rust'],
      hint: {
        th: 'มี constructor shorthand แบบนี้และใช้ `final`',
        en: 'It uses this constructor shorthand together with `final`.',
      },
      signals: ['final T value', 'Box(this.value)', 'class Box<T>'],
    },
  ]),
  ...createQuestionSet('easy', 'jsx', [
    {
      snippetText: `const card = (
  <section className="card">
    <h2>{title}</h2>
  </section>
);`,
      distractors: ['html', 'typescript', 'flutter'],
      hint: {
        th: 'คล้าย markup แต่มี `className` และ expression ใน `{}`',
        en: 'It looks like markup but uses `className` and expressions in `{}`.',
      },
      signals: ['className', '{title}', 'markup in JavaScript'],
    },
    {
      snippetText: `return (
  <ul>
    {items.map((item) => <li key={item.id}>{item.name}</li>)}
  </ul>
);`,
      distractors: ['html', 'flutter', 'typescript'],
      hint: {
        th: 'ดูการ map list แล้วคืนแท็กพร้อม `key`',
        en: 'Notice the mapped list returning tags with a `key`.',
      },
      signals: ['{items.map(...)', 'key=', '<li>{item.name}</li>'],
    },
    {
      snippetText: `{isOpen && <Panel title="Details" />}
<button onClick={saveItem}>Save</button>`,
      distractors: ['html', 'typescript', 'flutter'],
      hint: {
        th: 'มี conditional render และ event handler แบบ React',
        en: 'It includes conditional rendering and a React-style event handler.',
      },
      signals: ['&& render', 'onClick', 'component tag'],
    },
    {
      snippetText: `const view = <Avatar size={40} user={currentUser} />;
export default view;`,
      distractors: ['html', 'flutter', 'typescript'],
      hint: {
        th: 'มี component syntax แทรกใน JavaScript expression',
        en: 'Component syntax is embedded directly inside a JavaScript expression.',
      },
      signals: ['<Avatar />', 'props in braces', 'export default'],
    },
  ]),
  ...createQuestionSet('easy', 'typescript', [
    {
      snippetText: `interface User {
  id: number;
  name: string;
}`,
      distractors: ['csharp', 'json', 'java'],
      hint: {
        th: 'มี shape ของ object แบบ typing สำหรับโลก JavaScript',
        en: 'It defines an object shape with typing for the JavaScript ecosystem.',
      },
      signals: ['interface', 'id: number', 'name: string'],
    },
    {
      snippetText: `const total = (values: number[]): number => {
  return values.reduce((sum, value) => sum + value, 0);
};`,
      distractors: ['dart', 'csharp', 'java'],
      hint: {
        th: 'มี arrow function พร้อม type ของ parameter และ return',
        en: 'It uses an arrow function with typed parameters and return type.',
      },
      signals: ['number[]', ': number', '=>'],
    },
    {
      snippetText: `type Status = 'idle' | 'loading' | 'done';
let current: Status = 'idle';`,
      distractors: ['rust', 'csharp', 'sql'],
      hint: {
        th: 'มี union type string literal',
        en: 'It defines a union of string literal types.',
      },
      signals: ['type alias', 'union type', ': Status'],
    },
    {
      snippetText: `function wrap<T>(value: T): { value: T } {
  return { value };
}`,
      distractors: ['java', 'dart', 'csharp'],
      hint: {
        th: 'ดู generic function แบบภาษาตระกูล JS นี้',
        en: 'Look at the generic function style from the JS family.',
      },
      signals: ['function wrap<T>', ': { value: T }', 'generic'],
    },
  ]),
  ...createQuestionSet('easy', 'bash', [
    {
      snippetText: `#!/usr/bin/env bash
for file in *.txt; do
  echo "$file"
done`,
      distractors: ['python', 'sql', 'php'],
      hint: {
        th: 'มี shebang และ loop ที่ปิดด้วย `done`',
        en: 'It includes a shebang and a loop closed by `done`.',
      },
      signals: ['shebang', 'for ...; do', 'echo', 'done'],
    },
    {
      snippetText: `if [ -f "$CONFIG" ]; then
  echo "found"
else
  echo "missing"
fi`,
      distractors: ['python', 'php', 'rust'],
      hint: {
        th: 'เงื่อนไข block ปิดด้วย `fi`',
        en: 'The conditional block closes with `fi`.',
      },
      signals: ['[ -f ]', 'then', 'else', 'fi'],
    },
    {
      snippetText: `NAME="Ari"
mkdir -p "./backup"
cp "$NAME.txt" "./backup/"`,
      distractors: ['python', 'sql', 'cloud-functions'],
      hint: {
        th: 'เป็นการเรียก command shell ตรง ๆ',
        en: 'It directly calls shell commands.',
      },
      signals: ['mkdir', 'cp', '$NAME', 'shell commands'],
    },
    {
      snippetText: `grep -n "error" app.log | sort | uniq
echo "done"`,
      distractors: ['sql', 'python', 'cloud-functions'],
      hint: {
        th: 'มี pipeline ต่อคำสั่งหลายตัว',
        en: 'It chains commands together with a pipeline.',
      },
      signals: ['grep', '| sort | uniq', 'echo'],
    },
  ]),
  ...createQuestionSet('easy', 'cloud-functions', [
    {
      snippetText: `exports.sendWelcome = onRequest((req, res) => {
  res.status(200).send("hello");
});`,
      distractors: ['typescript', 'bash', 'jsx'],
      hint: {
        th: 'มี handler สำหรับ request ที่ถูก export ออกไป',
        en: 'It exports a handler for an HTTP request.',
      },
      signals: ['exports.', 'onRequest', 'req, res', 'handler'],
    },
    {
      snippetText: `exports.dailyDigest = onSchedule("every day 07:00", async () => {
  await mailer.send();
});`,
      distractors: ['typescript', 'bash', 'dart'],
      hint: {
        th: 'มี trigger ตามเวลา ไม่ใช่แค่โค้ด JS/TS ทั่วไป',
        en: 'It uses a scheduled trigger, not just plain JS/TS.',
      },
      signals: ['exports.', 'onSchedule', 'trigger string', 'async handler'],
    },
    {
      snippetText: `exports.watchOrders = onDocumentWritten("orders/{id}", (event) => {
  logger.info(event.params.id);
});`,
      distractors: ['typescript', 'sql', 'jsx'],
      hint: {
        th: 'มี event trigger ผูกกับเอกสารในฐานข้อมูล',
        en: 'It is an event trigger tied to a document path.',
      },
      signals: ['onDocumentWritten', 'orders/{id}', 'event.params'],
    },
  ]),
  ...createQuestionSet('easy', 'sql', [
    {
      snippetText: `SELECT name, age
FROM students
WHERE age >= 10
ORDER BY name;`,
      distractors: ['json', 'bash', 'csharp'],
      hint: {
        th: 'เป็นภาษาสำหรับ query ข้อมูล',
        en: 'This is a language for querying data.',
      },
      signals: ['SELECT', 'FROM', 'WHERE', 'ORDER BY'],
    },
    {
      snippetText: `INSERT INTO tasks (title, done)
VALUES ('Read chapter', false);`,
      distractors: ['json', 'php', 'bash'],
      hint: {
        th: 'เป็นคำสั่งเพิ่มข้อมูลลงตาราง',
        en: 'It inserts data into a table.',
      },
      signals: ['INSERT INTO', 'VALUES', 'table/column syntax'],
    },
    {
      snippetText: `UPDATE products
SET price = price * 1.1
WHERE category = 'books';`,
      distractors: ['bash', 'python', 'php'],
      hint: {
        th: 'เป็นคำสั่งแก้ค่าหลายแถวตามเงื่อนไข',
        en: 'It updates rows based on a condition.',
      },
      signals: ['UPDATE', 'SET', 'WHERE'],
    },
    {
      snippetText: `SELECT c.name, COUNT(o.id)
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`,
      distractors: ['java', 'json', 'bash'],
      hint: {
        th: 'มี join กับ aggregate พร้อม group',
        en: 'It combines joins with aggregation and grouping.',
      },
      signals: ['LEFT JOIN', 'COUNT()', 'GROUP BY'],
    },
  ]),
  ...createQuestionSet('easy', 'php', [
    {
      snippetText: `$name = "Mina";
echo "Hello " . $name;
$role = "member";`,
      distractors: ['html', 'python', 'csharp'],
      hint: {
        th: 'ตัวแปรขึ้นต้นด้วย `$`',
        en: 'Variables begin with `$`.',
      },
      signals: ['$name', 'echo', '. string concat'],
    },
    {
      snippetText: `function total(array $items): int {
    return array_sum($items);
}`,
      distractors: ['typescript', 'java', 'python'],
      hint: {
        th: 'ดู parameter ที่มี `$` และ function แบบ server-side scripting',
        en: 'Notice `$` parameters and scripting-style function syntax.',
      },
      signals: ['array $items', ': int', 'array_sum'],
    },
    {
      snippetText: `if ($user['active']) {
    echo $user['email'];
}`,
      distractors: ['python', 'bash', 'json'],
      hint: {
        th: 'array access กับ variable แบบ `$user`',
        en: 'It accesses an array through a `$user` variable.',
      },
      signals: ['$user', "['active']", 'echo'],
    },
    {
      snippetText: `class Report {
    public function title(): string {
        return "Monthly";
    }
}`,
      distractors: ['java', 'csharp', 'typescript'],
      hint: {
        th: 'มี `public function` และชนิดคืนค่าแบบนี้',
        en: 'It uses `public function` with this return type style.',
      },
      signals: ['public function', ': string', '$-style ecosystem'],
    },
  ]),
  ...createQuestionSet('easy', 'rust', [
    {
      snippetText: `fn main() {
    let numbers = vec![1, 2, 3];
    for n in numbers.iter() {
        println!("{}", n);
    }
}`,
      distractors: ['cpp', 'python', 'java'],
      hint: {
        th: 'ดู `fn`, `let`, macro พิมพ์ผล และ vector macro',
        en: 'Notice `fn`, `let`, the print macro, and the vector macro.',
      },
      signals: ['fn', 'let', 'vec!', 'println!'],
    },
    {
      snippetText: `struct User {
    name: String,
    age: u8,
}

impl User {
    fn new(name: String, age: u8) -> Self {
        Self { name, age }
    }
}`,
      distractors: ['csharp', 'java', 'typescript'],
      hint: {
        th: 'มี `struct`, `impl`, และชนิดข้อมูลแบบ `u8`',
        en: 'It uses `struct`, `impl`, and a type like `u8`.',
      },
      signals: ['struct', 'impl', 'u8', 'Self'],
    },
    {
      snippetText: `match status {
    Some(value) => println!("{}", value),
    None => println!("empty"),
}`,
      distractors: ['python', 'csharp', 'sql'],
      hint: {
        th: 'ดู pattern matching กับ `Some/None`',
        en: 'Look at the pattern matching with `Some/None`.',
      },
      signals: ['match', 'Some/None', '=>', 'println!'],
    },
  ]),
  ...coreEasyQuestionBankExtensions,
]
