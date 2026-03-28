import clsx from 'clsx'
import type { Locale } from '../lib/i18n'
import type { QuestionOutcome } from '../lib/quiz'

type QuizStatsChartsProps = {
  locale: Locale
  outcomes: QuestionOutcome[]
  score: number
  total: number
}

const labels = {
  th: {
    accuracy: 'ความแม่นยำ',
    timeline: 'Timeline',
    correct: 'ถูก',
    wrong: 'ผิด',
    timeout: 'หมดเวลา',
  },
  en: {
    accuracy: 'Accuracy',
    timeline: 'Timeline',
    correct: 'Correct',
    wrong: 'Wrong',
    timeout: 'Timeout',
  },
} as const

const toneMap = {
  correct: 'quiz-tone quiz-tone--success',
  wrong: 'quiz-tone quiz-tone--danger',
  timeout: 'quiz-tone quiz-tone--warning',
} as const

export function QuizStatsCharts({ locale, outcomes, score, total }: QuizStatsChartsProps) {
  const copy = labels[locale]
  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - circumference * (accuracy / 100)

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_12px_26px_rgba(23,18,13,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.accuracy}</p>
        <div className="mt-4 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="h-40 w-40">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--line-strong)" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#quizGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
            />
            <defs>
              <linearGradient id="quizGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-2)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            <text x="70" y="66" textAnchor="middle" className="fill-[var(--muted)] text-[10px] uppercase tracking-[0.22em]">
              {copy.accuracy}
            </text>
            <text x="70" y="84" textAnchor="middle" className="fill-[var(--ink)] text-[26px] font-semibold">
              {accuracy}%
            </text>
          </svg>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_12px_26px_rgba(23,18,13,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.timeline}</p>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
            {(['correct', 'wrong', 'timeout'] as const).map((key) => (
              <div key={key} className="inline-flex items-center gap-2">
                <span className={clsx('h-2.5 w-2.5 rounded-full', toneMap[key])} />
                {copy[key]}
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-timeline-bg mt-6 flex items-end gap-2 overflow-hidden rounded-[20px] px-3 py-4">
          {Array.from({ length: total }).map((_, index) => {
            const outcome = outcomes[index]
            const result = outcome?.result ?? 'wrong'

            return (
              <div key={`${index}-${outcome?.questionId ?? 'pending'}`} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={clsx('w-full rounded-full', toneMap[result])}
                  style={{ height: `${outcome ? 32 + ((index % 5) + 1) * 8 : 18}px` }}
                />
                <span className="text-[10px] font-medium text-[var(--muted)]">{index + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
