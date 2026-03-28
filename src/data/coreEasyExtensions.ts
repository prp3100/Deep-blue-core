import { createQuestionSet, type QuestionBankItem } from './quizModels'

export const coreEasyQuestionBankExtensions: QuestionBankItem[] = [
  ...createQuestionSet('easy', 'javascript', [
    {
      snippetText: `const user = { name: 'Mira', score: 24 }
console.log(\`\${user.name}: \${user.score}\`)`,
      distractors: ['typescript', 'json', 'java'],
      hint: {
        th: 'มี const, console.log และ template literal แบบโลกเว็บ',
        en: 'It uses const, console.log, and a template literal from the JS web world.',
      },
      signals: ['const', 'console.log', 'template literal'],
    },
    {
      snippetText: `const button = document.querySelector('#play')
button?.addEventListener('click', () => {
  console.log('start')
})`,
      distractors: ['jsx', 'typescript', 'php'],
      hint: {
        th: 'มี document.querySelector และ addEventListener',
        en: 'Look at document.querySelector and addEventListener.',
      },
      signals: ['document.querySelector', 'addEventListener', 'arrow function'],
    },
    {
      snippetText: `const numbers = [4, 12, 19]
const doubled = numbers.filter((n) => n > 10).map((n) => n * 2)
console.log(doubled)`,
      distractors: ['typescript', 'ruby', 'python'],
      hint: {
        th: 'มี array method chain และ arrow function',
        en: 'It chains array methods with arrow functions.',
      },
      signals: ['filter', 'map', '=>', 'console.log'],
    },
    {
      snippetText: `const email = profile?.email ?? 'unknown'
setTimeout(() => {
  console.log(email)
}, 300)`,
      distractors: ['typescript', 'swift', 'dart'],
      hint: {
        th: 'มี optional chaining กับ nullish coalescing',
        en: 'It uses optional chaining with nullish coalescing.',
      },
      signals: ['?.', '??', 'setTimeout', 'console.log'],
    },
  ]),
  ...createQuestionSet('easy', 'go', [
    {
      snippetText: `package main

import "fmt"

func main() {
    fmt.Println("hello")
}`,
      distractors: ['java', 'cpp', 'rust'],
      hint: {
        th: 'เริ่มด้วย package และ func main',
        en: 'It starts with package and func main.',
      },
      signals: ['package main', 'func main()', 'fmt.Println'],
    },
    {
      snippetText: `data, err := os.ReadFile("scores.txt")
if err != nil {
    return err
}
fmt.Println(string(data))`,
      distractors: ['rust', 'java', 'bash'],
      hint: {
        th: 'pattern err != nil เป็นตัวช่วยเดามาก',
        en: 'The err != nil pattern is a big clue.',
      },
      signals: [':=', 'err != nil', 'fmt.Println'],
    },
    {
      snippetText: `items := []string{"go", "rust", "swift"}
for _, item := range items {
    fmt.Println(item)
}`,
      distractors: ['java', 'kotlin', 'swift'],
      hint: {
        th: 'มี :=, range และไม่ใช้ for-each แบบ Java',
        en: 'It uses := and range instead of a Java-style for-each.',
      },
      signals: [':=', 'range', '[]string', 'fmt.Println'],
    },
    {
      snippetText: `messages := make(chan string)
go func() {
    messages <- "ready"
}()
fmt.Println(<-messages)`,
      distractors: ['rust', 'javascript', 'bash'],
      hint: {
        th: 'มี make(chan ...) และ go func',
        en: 'It uses make(chan ...) and go func.',
      },
      signals: ['make(chan', 'go func()', '<-messages'],
    },
  ]),
  ...createQuestionSet('easy', 'kotlin', [
    {
      snippetText: `fun main() {
    val language = "Kotlin"
    println(language)
}`,
      distractors: ['java', 'swift', 'dart'],
      hint: {
        th: 'ดู fun กับ val และ println',
        en: 'Look at fun with val and println.',
      },
      signals: ['fun main()', 'val', 'println'],
    },
    {
      snippetText: `data class User(val id: Int, val name: String)

val user = User(7, "Mira")
println(user.name)`,
      distractors: ['java', 'typescript', 'swift'],
      hint: {
        th: 'มี data class และ constructor style ที่สั้น',
        en: 'It uses a compact data class constructor style.',
      },
      signals: ['data class', 'val', 'println'],
    },
    {
      snippetText: `val label = profile?.name ?: "guest"
println(label)`,
      distractors: ['swift', 'dart', 'javascript'],
      hint: {
        th: 'มี ?. กับ ?: ในสไตล์ของ Kotlin',
        en: 'It uses ?. and ?: in a Kotlin style.',
      },
      signals: ['?.', '?:', 'val'],
    },
    {
      snippetText: `val grade = when (score) {
    in 90..100 -> "A"
    in 80..89 -> "B"
    else -> "C"
}`,
      distractors: ['java', 'swift', 'ruby'],
      hint: {
        th: 'มี when และช่วงแบบ 90..100',
        en: 'It uses when with ranges like 90..100.',
      },
      signals: ['when', 'in 90..100', '->'],
    },
  ]),
  ...createQuestionSet('easy', 'swift', [
    {
      snippetText: `import Foundation

let name = "Mira"
print("Hello, \\(name)")`,
      distractors: ['kotlin', 'dart', 'go'],
      hint: {
        th: 'มี let กับ string interpolation แบบ \\(...)',
        en: 'It uses let and string interpolation with \\(...).',
      },
      signals: ['import Foundation', 'let', 'print("Hello, \\(name)")'],
    },
    {
      snippetText: `guard let url = URL(string: input) else {
    return
}

print(url)`,
      distractors: ['kotlin', 'go', 'python'],
      hint: {
        th: 'guard let เป็น marker ที่ชัดมาก',
        en: 'guard let is a very strong marker.',
      },
      signals: ['guard let', 'URL(string:)', 'print'],
    },
    {
      snippetText: `struct Player {
    let name: String
    var score: Int
}`,
      distractors: ['kotlin', 'go', 'typescript'],
      hint: {
        th: 'มี struct กับ let/var แบบของ Swift',
        en: 'It uses struct with Swift-style let/var fields.',
      },
      signals: ['struct', 'let name: String', 'var score: Int'],
    },
    {
      snippetText: `let scores = [4, 6, 8]
let doubled = scores.map { $0 * 2 }
print(doubled)`,
      distractors: ['ruby', 'kotlin', 'javascript'],
      hint: {
        th: 'closure ใช้ $0 ในการอ้างอิงสมาชิก',
        en: 'The closure uses $0 for the current item.',
      },
      signals: ['let', 'map { $0 * 2 }', 'print'],
    },
  ]),
  ...createQuestionSet('easy', 'ruby', [
    {
      snippetText: `def greet(name)
  puts "Hi, #{name}"
end`,
      distractors: ['python', 'php', 'bash'],
      hint: {
        th: 'มี def, puts และจบ block ด้วย end',
        en: 'It uses def, puts, and ends the block with end.',
      },
      signals: ['def', 'puts', 'end', '#{name}'],
    },
    {
      snippetText: `numbers = [1, 2, 3]
doubled = numbers.map { |n| n * 2 }
puts doubled.inspect`,
      distractors: ['python', 'javascript', 'php'],
      hint: {
        th: 'มี block แบบ { |n| ... }',
        en: 'It uses a block in the { |n| ... } style.',
      },
      signals: ['map { |n|', 'puts', 'inspect'],
    },
    {
      snippetText: `user = { name: "Mira", active: true }
puts user[:name]`,
      distractors: ['json', 'php', 'python'],
      hint: {
        th: 'hash key กับ symbol access แบบ [:name] ช่วยได้มาก',
        en: 'Hash keys with symbol access like [:name] are a big clue.',
      },
      signals: ['{ name: "Mira" }', 'user[:name]', 'puts'],
    },
    {
      snippetText: `users.each do |user|
  puts user.upcase
end`,
      distractors: ['bash', 'python', 'javascript'],
      hint: {
        th: 'มี do |user| ... end ชัดมาก',
        en: 'The do |user| ... end block is very distinctive.',
      },
      signals: ['each do |user|', 'puts', 'end'],
    },
  ]),
]
