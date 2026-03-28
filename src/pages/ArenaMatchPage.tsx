import clsx from 'clsx'
import { ArrowRight, Bot, Clock3, Swords, User } from 'lucide-react'
import type { Locale } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { uiText } from '../lib/i18n'
import type { QuizQuestion } from '../lib/quiz'
import type { ArenaOutcome } from '../lib/arena'
import { formatArenaChoiceLabel } from '../lib/arena'
import { SyntaxSnippet } from '../components/SyntaxSnippet'
import { panelClass } from '../components/layout/panelClasses'

const choiceLetters = ['A', 'B', 'C', 'D'] as const

type ThemeMode = 'light' | 'dark'

type ArenaMatchPageProps = {
  locale: Locale
  theme: ThemeMode
  formatCopy: ExtraCopy
  currentQuestion: QuizQuestion
  currentIndex: number
  totalQuestions: number
  timeLeft: number
  timerProgress: string
  phase: 'active' | 'feedback'
  matchKind: 'live-ai' | 'ghost-run'
  opponentLabel: string
  humanOutcome: ArenaOutcome | null
  aiOutcome: ArenaOutcome | null
  aiStatus: 'idle' | 'loading' | 'done' | 'timeout' | 'request-failed' | 'invalid-response'
  aiActiveLatencyMs: number | null
  aiLastLatencyMs: number | null
  aiRequestBudgetMs: number | null
  aiFailureReason: string | null
  humanCorrect: number
  aiCorrect: number
  onChoice: (choiceId: string) => void
  onNextQuestion: () => void
  canProceed: boolean
  onBackToArena: () => void
}

export function ArenaMatchPage({
  locale,
  theme,
  formatCopy,
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  timerProgress,
  phase,
  matchKind,
  opponentLabel,
  humanOutcome,
  aiOutcome,
  aiStatus,
  aiActiveLatencyMs,
  aiLastLatencyMs,
  aiRequestBudgetMs,
  aiFailureReason,
  humanCorrect,
  aiCorrect,
  onChoice,
  onNextQuestion,
  canProceed,
  onBackToArena,
}: ArenaMatchPageProps) {
  const copy = uiText[locale]
  const isLocked = phase === 'feedback'
  const isGhostMatch = matchKind === 'ghost-run'
  const correctChoiceId = currentQuestion.format === 'identify-language' ? currentQuestion.answer : currentQuestion.answer
  const selectedChoiceLabel =
    humanOutcome?.selectedChoice && formatArenaChoiceLabel(locale, currentQuestion, humanOutcome.selectedChoice)
  const aiLatencyLabel =
    aiStatus === 'loading'
      ? aiActiveLatencyMs !== null
        ? `${aiActiveLatencyMs} ms`
        : '...'
      : aiLastLatencyMs !== null
        ? `${aiLastLatencyMs} ms`
        : '--'
  const aiStatusLine =
    aiOutcome?.selectedChoice
      ? `${copy.arenaAiAnswered} · ${aiOutcome.isCorrect ? copy.feedbackCorrect : copy.feedbackWrong}`
      : aiStatus === 'loading'
        ? isGhostMatch
          ? copy.arenaGhostThinking
          : copy.arenaThinking
        : aiStatus === 'timeout'
          ? copy.arenaAiTimedOut
        : aiStatus === 'request-failed'
          ? copy.arenaAiRequestFailed
        : aiStatus === 'invalid-response'
          ? copy.arenaAiInvalidResponse
          : copy.arenaAwaitingAnswer

  return (
    <section className="space-y-6">
      <article className={panelClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]">
              <Swords size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.progress}</p>
              <p className="mt-1 text-sm text-[var(--ink)]">
                {copy.question} {currentIndex + 1} {copy.of} {totalQuestions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToArena}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              {copy.arenaBackToArena}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-2.5 text-[var(--accent)]">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.arenaHumanLabel}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{humanCorrect}/{totalQuestions}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-2.5 text-[var(--accent-2)]">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{opponentLabel}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{aiCorrect}/{totalQuestions}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft-2)] p-2.5 text-[var(--accent-2)]">
                <Clock3 size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.timeLeft}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">00:{String(timeLeft).padStart(2, '0')}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(var(--surface-strong-rgb),0.32)]">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-2),var(--accent))]" style={{ width: timerProgress }} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.arenaHumanLabel}</p>
            <p className="mt-2 text-sm text-[var(--ink)]">
              {humanOutcome?.selectedChoice
                ? `${copy.choicesLabel}: ${selectedChoiceLabel ?? humanOutcome.selectedChoice}`
                : isLocked
                  ? copy.feedbackTimeout
                  : copy.arenaAwaitingAnswer}
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{opponentLabel}</p>
            <p className="mt-2 text-sm text-[var(--ink)]">{aiStatusLine}</p>
            <div className="mt-3 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
              <p>
                {copy.arenaAiLatencyLabel}: <span className="text-[var(--ink)]">{aiLatencyLabel}</span>
              </p>
              <p>
                {copy.arenaAiBudgetLabel}: <span className="text-[var(--ink)]">{aiRequestBudgetMs !== null ? `${aiRequestBudgetMs} ms` : '--'}</span>
              </p>
            </div>
            {aiStatus !== 'done' && aiFailureReason && (
              <p className="mt-2 break-words text-xs leading-6 text-amber-200">
                {copy.arenaAiFailureReasonLabel}: {aiFailureReason}
              </p>
            )}
          </div>
        </div>
      </article>

      <article className="rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {currentQuestion.format === 'fix-error'
              ? formatCopy.fixErrorQuestionLabel
              : currentQuestion.format === 'debug'
                ? formatCopy.debugQuestionLabel
                : currentQuestion.format === 'vocab'
                  ? formatCopy.vocabQuestionLabel
                  : copy.snippetLabel}
          </p>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {currentQuestion.format === 'identify-language'
              ? copy.formatIdentify
              : currentQuestion.format === 'fix-error'
                ? copy.formatFixError
                : currentQuestion.format === 'vocab'
                  ? formatCopy.vocabGuideTitle
                  : copy.formatDebug}
          </span>
        </div>

        {currentQuestion.format === 'vocab' && (
          <div className="mt-5 rounded-[22px] border border-[var(--accent)]/30 bg-[var(--surface-raised)] p-5 text-center shadow-[0_4px_24px_var(--accent-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.vocabTermLabel}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">{currentQuestion.termText[locale]}</h2>
          </div>
        )}

        <div className="mt-4">
          <SyntaxSnippet
            code={currentQuestion.snippetText}
            languageId={currentQuestion.format === 'identify-language' ? currentQuestion.answer : currentQuestion.language}
            theme={theme}
            label={copy.snippetLabel}
            copyLabel={copy.copyCode}
            copiedLabel={copy.copiedCode}
            mode="neutral"
            showLanguageLabel={false}
          />
        </div>

        {currentQuestion.format === 'fix-error' && (
          <div className="mt-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.errorTextLabel}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{currentQuestion.errorText[locale]}</p>
          </div>
        )}

        {currentQuestion.format === 'debug' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.debugScenarioLabel}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{currentQuestion.scenario[locale]}</p>
            </div>
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.debugLogLabel}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{currentQuestion.logText[locale]}</p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {currentQuestion.choices.map((choice, index) => {
            const choiceId = typeof choice === 'string' ? choice : choice.id
            const isSelected = humanOutcome?.selectedChoice === choiceId
            const isCorrect = correctChoiceId === choiceId
            return (
              <button
                key={choiceId}
                type="button"
                disabled={isLocked}
                onClick={() => onChoice(choiceId)}
                className={clsx(
                  'group rounded-[24px] border p-4 text-left transition duration-300',
                  isLocked ? 'cursor-default' : 'hover:-translate-y-1 hover:bg-[var(--surface-hover)]',
                  isLocked && isCorrect && 'border-emerald-500/35 bg-emerald-500/8',
                  isLocked && isSelected && !isCorrect && 'border-rose-500/35 bg-rose-500/8',
                  !isLocked && 'border-[var(--line)] bg-[var(--surface-raised)]',
                  isLocked && !isCorrect && !isSelected && 'border-[var(--line)] bg-[var(--surface-soft)]',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold',
                      isLocked && isCorrect
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : isLocked && isSelected && !isCorrect
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                          : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)]',
                    )}
                  >
                    {choiceLetters[index]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--ink)]">{formatArenaChoiceLabel(locale, currentQuestion, choiceId)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {phase === 'feedback' && (
          <div className="mt-6 rounded-[26px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <div className="flex items-start gap-3">
              <ArrowRight size={16} className="mt-0.5 text-[var(--accent)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.correctAnswer}</p>
                <p className="mt-2 text-sm text-[var(--ink)]">{formatArenaChoiceLabel(locale, currentQuestion, correctChoiceId)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onNextQuestion}
            disabled={!canProceed}
            className={clsx(
              'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition',
              canProceed
                ? 'bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[0_0_20px_var(--accent-soft)] hover:-translate-y-0.5'
                : 'border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]',
            )}
          >
            {currentIndex + 1 === totalQuestions ? copy.finishQuiz : copy.nextQuestion}
          </button>
        </div>
      </article>
    </section>
  )
}
