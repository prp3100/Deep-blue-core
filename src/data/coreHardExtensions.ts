import { createQuestionSet, type QuestionBankItem } from './quizModels'

export const coreHardQuestionBankExtensions: QuestionBankItem[] = [
  ...createQuestionSet('hard', 'javascript', [
    {
      snippetText: `async function loadUsers() {
  const response = await fetch('/api/users')
  const users = await response.json()
  return users.filter(({ active }) => active)
}`,
      distractors: ['typescript', 'jsx', 'python'],
      hint: {
        th: 'มี async/await ฝั่งเว็บ แต่ไม่มี type annotation',
        en: 'It uses web-style async/await without type annotations.',
      },
      signals: ['async function', 'await fetch', 'response.json()', 'destructuring'],
    },
    {
      snippetText: `class Timer {
  #ticks = 0

  start() {
    this.intervalId = setInterval(() => {
      this.#ticks += 1
    }, 1000)
  }
}`,
      distractors: ['typescript', 'java', 'csharp'],
      hint: {
        th: 'มี #private field กับ setInterval',
        en: 'It uses a #private field with setInterval.',
      },
      signals: ['class', '#ticks', 'setInterval', '=>'],
    },
    {
      snippetText: `const groups = new Map(
  entries.map(({ kind, value }) => [kind ?? 'unknown', value]),
)

console.log(groups.size)`,
      distractors: ['typescript', 'kotlin', 'ruby'],
      hint: {
        th: 'มี new Map, destructuring และ ??',
        en: 'It uses new Map, destructuring, and ??.',
      },
      signals: ['new Map', '({ kind, value })', '??', 'console.log'],
    },
    {
      snippetText: `export const summarize = ({ total = 0, passed = 0 } = {}) => ({
  total,
  passed,
  ratio: total === 0 ? 0 : passed / total,
})`,
      distractors: ['typescript', 'json', 'php'],
      hint: {
        th: 'มี export, object destructuring และค่า default',
        en: 'It uses export, object destructuring, and default values.',
      },
      signals: ['export const', '{ total = 0, passed = 0 } = {}', '=> ({ ... })'],
    },
  ]),
  ...createQuestionSet('hard', 'go', [
    {
      snippetText: `type ScoreSummary struct {
    Name  string \`json:"name"\`
    Total int    \`json:"total"\`
}`,
      distractors: ['rust', 'java', 'cpp'],
      hint: {
        th: 'มี struct field tag แบบ `json:"name"`',
        en: 'It uses struct tags like `json:"name"`.',
      },
      signals: ['type ... struct', 'json tag', 'string', 'int'],
    },
    {
      snippetText: `func worker(jobs <-chan int, results chan<- int) {
    for job := range jobs {
        results <- job * 2
    }
}`,
      distractors: ['rust', 'javascript', 'bash'],
      hint: {
        th: 'มี channel ส่งเข้า/ส่งออกและ range jobs',
        en: 'It uses directional channels and range jobs.',
      },
      signals: ['<-chan', 'chan<-', 'range jobs', 'results <-'],
    },
    {
      snippetText: `func loadConfig(ctx context.Context) error {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
    if err != nil {
        return err
    }

    _, err = http.DefaultClient.Do(req)
    return err
}`,
      distractors: ['java', 'rust', 'typescript'],
      hint: {
        th: 'มี context.WithTimeout, defer และ error return แบบ Go',
        en: 'It uses context.WithTimeout, defer, and Go-style error returns.',
      },
      signals: ['context.WithTimeout', 'defer cancel()', 'err != nil', 'return err'],
    },
    {
      snippetText: `type Logger interface {
    Printf(format string, args ...any)
}

func write(logger Logger, values []int) {
    sort.Slice(values, func(i, j int) bool {
        return values[i] < values[j]
    })
    logger.Printf("sorted %d values", len(values))
}`,
      distractors: ['java', 'cpp', 'rust'],
      hint: {
        th: 'มี interface, args ...any และ sort.Slice',
        en: 'It uses an interface, args ...any, and sort.Slice.',
      },
      signals: ['interface', 'args ...any', 'sort.Slice', 'func(i, j int) bool'],
    },
  ]),
  ...createQuestionSet('hard', 'kotlin', [
    {
      snippetText: `sealed interface UiState {
    data object Loading : UiState
    data class Ready(val count: Int) : UiState
}

fun label(state: UiState) = when (state) {
    UiState.Loading -> "Loading"
    is UiState.Ready -> "Ready: \${state.count}"
}`,
      distractors: ['java', 'swift', 'dart'],
      hint: {
        th: 'มี sealed interface, data object และ when',
        en: 'It uses a sealed interface, data object, and when.',
      },
      signals: ['sealed interface', 'data object', 'when', 'is UiState.Ready'],
    },
    {
      snippetText: `suspend fun loadUser(api: UserApi, id: String): Result<User> =
    runCatching {
        api.fetch(id).also { require(it.name.isNotBlank()) }
    }`,
      distractors: ['swift', 'typescript', 'java'],
      hint: {
        th: 'มี suspend fun กับ runCatching',
        en: 'It uses suspend fun with runCatching.',
      },
      signals: ['suspend fun', 'Result<User>', 'runCatching', 'also'],
    },
    {
      snippetText: `class Cache(private val source: DataSource) {
    private val memo = mutableMapOf<String, String>()

    operator fun get(key: String): String =
        memo.getOrPut(key) { source.read(key) }
}`,
      distractors: ['java', 'swift', 'dart'],
      hint: {
        th: 'มี private val, operator fun และ mutableMapOf',
        en: 'It uses private val, operator fun, and mutableMapOf.',
      },
      signals: ['private val', 'operator fun get', 'mutableMapOf', 'getOrPut'],
    },
    {
      snippetText: `val totals = orders
    .groupBy { it.status }
    .mapValues { (_, items) -> items.sumOf { it.total } }`,
      distractors: ['ruby', 'javascript', 'swift'],
      hint: {
        th: 'เป็น chain แบบ collection ของ Kotlin พร้อม it และ sumOf',
        en: 'It is a Kotlin collection chain using it and sumOf.',
      },
      signals: ['groupBy', 'mapValues', 'sumOf', 'it.status'],
    },
  ]),
  ...createQuestionSet('hard', 'swift', [
    {
      snippetText: `struct APIClient {
    func fetchUsers() async throws -> [User] {
        let (data, _) = try await URLSession.shared.data(from: endpoint)
        return try JSONDecoder().decode([User].self, from: data)
    }
}`,
      distractors: ['kotlin', 'go', 'typescript'],
      hint: {
        th: 'มี async throws และ URLSession.shared.data',
        en: 'It uses async throws and URLSession.shared.data.',
      },
      signals: ['async throws', 'URLSession.shared.data', 'JSONDecoder().decode', '[User].self'],
    },
    {
      snippetText: `enum Route {
    case home
    case detail(id: Int)
}

extension Route {
    var title: String {
        switch self {
        case .home:
            return "Home"
        case let .detail(id):
            return "Detail \\(id)"
        }
    }
}`,
      distractors: ['kotlin', 'dart', 'java'],
      hint: {
        th: 'มี case .detail(id:) และ extension',
        en: 'It uses case .detail(id:) with an extension.',
      },
      signals: ['enum', 'case detail(id: Int)', 'extension', 'case let .detail(id)'],
    },
    {
      snippetText: `protocol Persisting {
    func save(_ text: String) throws
}

extension Array where Element == Int {
    var average: Double {
        guard !isEmpty else { return 0 }
        return Double(reduce(0, +)) / Double(count)
    }
}`,
      distractors: ['kotlin', 'go', 'typescript'],
      hint: {
        th: 'มี protocol กับ extension Array where Element == Int',
        en: 'It uses a protocol with extension Array where Element == Int.',
      },
      signals: ['protocol', 'extension Array where', 'guard !isEmpty', 'reduce(0, +)'],
    },
    {
      snippetText: `actor DownloadStore {
    private var cache: [URL: Data] = [:]

    func value(for url: URL) -> Data? {
        cache[url]
    }

    func insert(_ data: Data, for url: URL) {
        cache[url] = data
    }
}`,
      distractors: ['kotlin', 'go', 'rust'],
      hint: {
        th: 'มี actor กับ dictionary type แบบ [URL: Data]',
        en: 'It uses actor with a dictionary type like [URL: Data].',
      },
      signals: ['actor', '[URL: Data]', 'func value(for url: URL)', 'Data?'],
    },
  ]),
  ...createQuestionSet('hard', 'ruby', [
    {
      snippetText: `class Leaderboard
  attr_reader :scores

  def initialize(scores = [])
    @scores = scores
  end

  def top(limit = 3)
    scores.sort.reverse.take(limit)
  end
end`,
      distractors: ['php', 'python', 'javascript'],
      hint: {
        th: 'มี attr_reader, initialize และ @scores',
        en: 'It uses attr_reader, initialize, and @scores.',
      },
      signals: ['class', 'attr_reader', 'initialize', '@scores'],
    },
    {
      snippetText: `result = File.readlines("scores.txt", chomp: true)
  .filter_map { |line| Integer(line, exception: false) }`,
      distractors: ['python', 'bash', 'javascript'],
      hint: {
        th: 'มี File.readlines กับ block แบบ filter_map',
        en: 'It uses File.readlines with a filter_map block.',
      },
      signals: ['File.readlines', 'chomp: true', 'filter_map', 'Integer(..., exception: false)'],
    },
    {
      snippetText: `begin
  JSON.parse(payload)
rescue JSON::ParserError => error
  puts error.message
ensure
  logger&.close
end`,
      distractors: ['python', 'php', 'bash'],
      hint: {
        th: 'มี begin/rescue/ensure และ JSON::ParserError',
        en: 'It uses begin/rescue/ensure with JSON::ParserError.',
      },
      signals: ['begin', 'rescue ... => error', 'ensure', 'logger&.close'],
    },
    {
      snippetText: `totals = orders
  .group_by { |order| order[:status] }
  .transform_values { |items| items.sum { |item| item[:total] } }`,
      distractors: ['python', 'javascript', 'php'],
      hint: {
        th: 'มี group_by, transform_values และ symbol key',
        en: 'It uses group_by, transform_values, and symbol keys.',
      },
      signals: ['group_by', 'transform_values', 'order[:status]', 'item[:total]'],
    },
  ]),
]
