import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Trophy,
  XCircle,
} from 'lucide-react'
import { guideBookEntries, guideFamilyLabels, guidePrimerSections } from '../data/guideData'
import type { DebugChoice, FixErrorChoice, LanguageId, VocabChoice } from '../data/quizModels'
import type { DebugQuizQuestion, FixErrorQuizQuestion, IdentifyLanguageQuizQuestion, QuestionOutcome, QuizQuestion, VocabQuizQuestion } from '../lib/quiz'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { buildActiveQuizGuide, buildChoiceAssist, buildQuizDisplayHint } from '../lib/quizAssist'
import { SyntaxSnippet } from '../components/SyntaxSnippet'
import { panelClass } from '../components/layout/panelClasses'
import { screenMotion } from '../components/layout/screenMotion'
import { triggerRipple } from '../lib/ripple'

const choiceLetters = ['A', 'B', 'C', 'D'] as const

type ThemeMode = 'light' | 'dark'

type QuizPageProps = {
  locale: Locale
  theme: ThemeMode
  copy: (typeof uiText)[keyof typeof uiText]
  formatCopy: ExtraCopy
  currentTrackLabel: string
  currentFormatLabel: string
  currentModeLabel: string
  currentQuestion: QuizQuestion | null
  questions: QuizQuestion[]
  currentIndex: number
  timeLeft: number
  hintsRemaining: number
  quizPhase: 'active' | 'feedback'
  currentOutcome: QuestionOutcome | null
  timerProgress: string
  currentQuestionHintVisible: boolean
  isLastQuestion: boolean
  onChoice: (choiceId: string) => void
  onHint: () => void
  onNextQuestion: () => void
}

const outcomeToneMap = {
  correct: {
    surface: 'border-emerald-500/30 bg-emerald-500/10',
    text: 'text-emerald-200',
    icon: CheckCircle2,
  },
  wrong: {
    surface: 'border-rose-500/30 bg-rose-500/10',
    text: 'text-rose-200',
    icon: XCircle,
  },
  timeout: {
    surface: 'border-amber-500/30 bg-amber-500/10',
    text: 'text-amber-200',
    icon: Clock3,
  },
} as const

const formatTime = (value: number) => `00:${String(value).padStart(2, '0')}`

const formatSignals = (signals: string[]) => signals.map((signal) => `\`${signal}\``).join(', ')

const buildCorrectSummary = (locale: Locale, question: QuizQuestion) => {
  if (question.format !== 'identify-language') {
    return question.explanation.correct[locale]
  }

  const guide = guideBookEntries[question.answer]
  const signals = formatSignals(question.signals)

  return locale === 'th'
    ? `ข้อนี้คือ ${guide.label.th} เพราะ snippet นี้มี ${signals} ซึ่งตรงกับ marker หลักของหมวดนี้ ${guide.plainSummary.th} จำแบบไว ๆ ได้จากคำว่า “${guide.quickSpot.th}”`
    : `This is ${guide.label.en} because the snippet shows ${signals}, which matches the strongest markers for this topic. ${guide.plainSummary.en} A quick memory hook is: “${guide.quickSpot.en}”.`
}

const isIdentifyLanguageQuestion = (question: QuizQuestion | null): question is IdentifyLanguageQuizQuestion =>
  question?.format === 'identify-language'

const isFixErrorQuestion = (question: QuizQuestion | null): question is FixErrorQuizQuestion => question?.format === 'fix-error'

const isDebugQuestion = (question: QuizQuestion | null): question is DebugQuizQuestion => question?.format === 'debug'

const isVocabQuestion = (question: QuizQuestion | null): question is VocabQuizQuestion => question?.format === 'vocab'

export function QuizPage({
  locale,
  theme,
  copy,
  formatCopy,
  currentTrackLabel,
  currentFormatLabel,
  currentModeLabel,
  currentQuestion,
  questions,
  currentIndex,
  timeLeft,
  hintsRemaining,
  quizPhase,
  currentOutcome,
  timerProgress,
  currentQuestionHintVisible,
  isLastQuestion,
  onChoice,
  onHint,
  onNextQuestion,
}: QuizPageProps) {
  if (!currentQuestion) {
    return null
  }

  const isLocked = quizPhase === 'feedback'
  const answerGuide =
    currentQuestion.format === 'identify-language'
      ? guideBookEntries[currentQuestion.answer]
      : guideBookEntries[currentQuestion.language]
  const activeQuizGuide = buildActiveQuizGuide(currentQuestion, locale)
  const displayHint = buildQuizDisplayHint(currentQuestion, locale)
  const shouldHideIdentifyMeta = isIdentifyLanguageQuestion(currentQuestion) && !isLocked
  const selectedChoiceLabel = (() => {
    if (currentQuestion.format === 'identify-language') {
      return currentOutcome?.selectedChoice
        ? guideBookEntries[currentOutcome.selectedChoice as LanguageId].label[locale]
        : copy.noChoice
    }

    if (currentOutcome?.selectedChoice) {
      const selectedChoice = currentQuestion.choices.find((choice) => choice.id === currentOutcome.selectedChoice)
      if (!selectedChoice) {
        return copy.noChoice
      }

      if ('fragment' in selectedChoice) {
        return `${selectedChoice.label[locale]}: ${selectedChoice.fragment}`
      }

      if ('detail' in selectedChoice) {
        return `${selectedChoice.label[locale]}: ${(selectedChoice as DebugChoice).detail[locale]}`
      }

      return selectedChoice.label[locale]
    }

    return copy.noChoice
  })()
  const correctFixErrorChoice =
    currentQuestion.format === 'fix-error'
      ? currentQuestion.choices.find((choice) => choice.id === currentQuestion.answer) ?? currentQuestion.choices[0]
      : null
  const correctDebugChoice =
    currentQuestion.format === 'debug'
      ? currentQuestion.choices.find((choice) => choice.id === currentQuestion.answer) ?? currentQuestion.choices[0]
      : null
  const correctVocabChoice =
    currentQuestion.format === 'vocab'
      ? currentQuestion.choices.find((choice) => choice.id === currentQuestion.answer) ?? currentQuestion.choices[0]
      : null

  const currentQuestionLabel =
    currentQuestion && isFixErrorQuestion(currentQuestion)
      ? formatCopy.fixErrorQuestionLabel
      : currentQuestion && isDebugQuestion(currentQuestion)
        ? formatCopy.debugQuestionLabel
        : currentQuestion && isVocabQuestion(currentQuestion)
          ? formatCopy.vocabQuestionLabel
          : copy.snippetLabel
  const currentQuestionHint =
    currentQuestion && isFixErrorQuestion(currentQuestion)
      ? formatCopy.fixErrorQuestionHint
      : currentQuestion && isDebugQuestion(currentQuestion)
        ? formatCopy.debugQuestionHint
        : currentQuestion && isVocabQuestion(currentQuestion)
          ? formatCopy.vocabQuestionHint
          : copy.snippetHint

  const renderChoiceCard = (choice: LanguageId | FixErrorChoice | DebugChoice | VocabChoice, index: number) => {
    const choiceId = typeof choice === 'string' ? choice : choice.id
    const isCorrect = currentQuestion.answer === choiceId
    const isSelected = currentOutcome?.selectedChoice === choiceId
    const choiceAssist = buildChoiceAssist(currentQuestion, choice, locale, quizPhase)

    return (
      <button
        key={choiceId}
        type="button"
        disabled={isLocked}
        onClick={() => onChoice(choiceId)}
        className={clsx(
          'group rounded-[28px] border p-4 text-left transition duration-300',
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
            {typeof choice === 'string' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">{guideBookEntries[choice].label[locale]}</p>
                  {isLocked && (
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {guideFamilyLabels[guideBookEntries[choice].family][locale]}
                    </span>
                  )}
                </div>
                {choiceAssist?.body && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{choiceAssist.body}</p>}
              </>
            ) : 'fragment' in choice ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">{choice.label[locale]}</p>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {formatCopy.culpritLabel}
                  </span>
                </div>
                <p className="mt-2 font-mono text-sm leading-7 text-[var(--muted)]">{choice.fragment}</p>
              </>
            ) : 'detail' in choice ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">{choice.label[locale]}</p>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {formatCopy.debugRootCauseLabel}
                  </span>
                </div>
                {choiceAssist?.body && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{choiceAssist.body}</p>}
              </>
            ) : (
              <>
                <div className="flex flex-col justify-center min-h-[56px] py-1">
                  <p className="text-sm font-semibold text-[var(--ink)]">{choice.label[locale]}</p>
                </div>
                {choiceAssist?.body && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{choiceAssist.body}</p>}
              </>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <motion.section key="quiz" {...screenMotion} className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
      <div className="space-y-6">
        <article className={panelClass}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.quizTitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {currentTrackLabel}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {currentFormatLabel}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {currentModeLabel}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {copy.question} {currentIndex + 1} {copy.of} {questions.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.timeLeft}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--ink)]">{formatTime(timeLeft)}</p>
              </div>
              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hintsLeft}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--ink)]">{hintsRemaining}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>
                {copy.progress} {(Math.round(((currentIndex + 1) / questions.length) * 100)).toString()}%
              </span>
              <span>{copy.reviewImmediate}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(var(--surface-strong-rgb),0.32)]">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-2),var(--accent))]"
                animate={{ width: timerProgress }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)]/94 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{currentQuestionLabel}</p>
              {!shouldHideIdentifyMeta && (
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {guideFamilyLabels[answerGuide.family][locale]}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{currentQuestionHint}</p>
            
            {isVocabQuestion(currentQuestion) && (
              <div className="mt-6 rounded-[22px] border border-[var(--accent)]/30 bg-[var(--surface-raised)] p-5 text-center shadow-[0_4px_24px_var(--accent-soft)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {formatCopy.vocabTermLabel}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
                  {currentQuestion.termText[locale]}
                </h2>
              </div>
            )}
            
            <div className="mt-4">
              <SyntaxSnippet
                code={currentQuestion.snippetText}
                languageId={currentQuestion.format === 'identify-language' ? currentQuestion.answer : currentQuestion.language}
                theme={theme}
                label={currentQuestionLabel}
                copyLabel={copy.copyCode}
                copiedLabel={copy.copiedCode}
                mode="neutral"
                showLanguageLabel={false}
              />
            </div>
          </div>

          {isFixErrorQuestion(currentQuestion) && (
            <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.errorTextLabel}</p>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {answerGuide.label[locale]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{currentQuestion.errorText[locale]}</p>
            </div>
          )}

          {isDebugQuestion(currentQuestion) && (
            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.debugScenarioLabel}</p>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {answerGuide.label[locale]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{currentQuestion.scenario[locale]}</p>
              </div>

              <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.debugLogLabel}</p>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {formatCopy.debugRootCauseLabel}
                  </span>
                </div>
                <p className="mt-3 font-mono text-sm leading-7 text-[var(--ink)]">{currentQuestion.logText[locale]}</p>
              </div>
            </div>
          )}
        </article>

        <article className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {isFixErrorQuestion(currentQuestion)
                ? formatCopy.culpritLabel
                : isDebugQuestion(currentQuestion)
                  ? formatCopy.debugRootCauseLabel
                  : isVocabQuestion(currentQuestion)
                    ? formatCopy.vocabMeaningLabel
                    : copy.choicesLabel}
            </p>
            {quizPhase === 'feedback' && <span className="text-xs text-[var(--muted)]">{copy.answerLocked}</span>}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{currentQuestion.choices.map((choice, index) => renderChoiceCard(choice, index))}</div>
        </article>
      </div>

      <div className="space-y-6">
        <article className={panelClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--accent)]">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.hintTitle}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {currentQuestionHintVisible ? copy.hintUsed : `${copy.hintsLeft}: ${hintsRemaining}`}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
            {currentQuestionHintVisible ? (
              <p className="text-sm leading-7 text-[var(--ink)]">{displayHint}</p>
            ) : (
              <button
                type="button"
                onClick={onHint}
                disabled={quizPhase !== 'active' || hintsRemaining <= 0}
                className={clsx(
                  'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  quizPhase === 'active' && hintsRemaining > 0
                    ? 'bg-[var(--ink)] text-[var(--surface-strong)] hover:-translate-y-0.5'
                    : 'cursor-not-allowed bg-[rgba(var(--surface-strong-rgb),0.24)] text-[var(--muted)]',
                )}
              >
                <Lightbulb size={16} />
                {copy.hintButton}
              </button>
            )}
          </div>

          {quizPhase === 'active' && (
            <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
              {isIdentifyLanguageQuestion(currentQuestion) && activeQuizGuide ? (
                <>
                  <p className="text-sm font-semibold text-[var(--ink)]">{activeQuizGuide.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{activeQuizGuide.body}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--ink)]">{answerGuide.label[locale]}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {isFixErrorQuestion(currentQuestion) ? answerGuide.debugFocus[locale][0] : answerGuide.difficultyHint[locale]}
                  </p>
                </>
              )}
            </div>
          )}
        </article>

        {currentOutcome ? (
          <article className={panelClass}>
            <div className={clsx('rounded-[24px] border p-4', outcomeToneMap[currentOutcome.result].surface)}>
              <div className="flex items-start gap-3">
                <div className={clsx('rounded-2xl p-2.5', outcomeToneMap[currentOutcome.result].text)}>
                  {(() => {
                    const OutcomeIcon = outcomeToneMap[currentOutcome.result].icon
                    return <OutcomeIcon size={20} />
                  })()}
                </div>
                <div>
                  <p className={clsx('text-sm font-semibold', outcomeToneMap[currentOutcome.result].text)}>
                    {currentOutcome.result === 'correct'
                      ? copy.feedbackCorrect
                      : currentOutcome.result === 'wrong'
                        ? copy.feedbackWrong
                        : copy.feedbackTimeout}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {currentOutcome.result === 'timeout' ? copy.timeoutNote : buildCorrectSummary(locale, currentQuestion)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.correctAnswer}</p>
                  {isIdentifyLanguageQuestion(currentQuestion) ? (
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{answerGuide.label[locale]}</p>
                  ) : isVocabQuestion(currentQuestion) ? (
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {formatCopy.vocabCorrectMeaningLabel}: {correctVocabChoice?.label[locale]}
                    </p>
                  ) : isDebugQuestion(currentQuestion) ? (
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {formatCopy.debugCorrectCauseLabel}: {correctDebugChoice?.label[locale]}
                    </p>
                  ) : (
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {formatCopy.correctLineLabel}: {correctFixErrorChoice?.label[locale]}
                    </p>
                  )}
                </div>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {isIdentifyLanguageQuestion(currentQuestion)
                    ? answerGuide.quickSpot[locale]
                    : isVocabQuestion(currentQuestion)
                      ? currentQuestion.termText[locale]
                      : isDebugQuestion(currentQuestion)
                        ? correctDebugChoice?.detail[locale]
                        : correctFixErrorChoice?.fragment}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {copy.selectedChoice}: {selectedChoiceLabel}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.whyThisWorks}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{buildCorrectSummary(locale, currentQuestion)}</p>
              </div>

              {isFixErrorQuestion(currentQuestion) && (
                <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.choiceWhyLabel}</p>
                  <div className="mt-3 space-y-3">
                    {currentQuestion.choices.map((choice) => {
                      const explanation =
                        choice.id === currentQuestion.answer
                          ? currentQuestion.explanation.correct[locale]
                          : currentQuestion.explanation.wrongChoices[choice.id]?.[locale]

                      return (
                        <div key={`${currentQuestion.id}-${choice.id}`} className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {choice.label[locale]}: <span className="font-mono">{choice.fragment}</span>
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{explanation}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.debugFocus}</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                  {answerGuide.debugFocus[locale].map((item, index) => (
                    <li key={`${currentQuestion.id}-debug-${index}`}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                triggerRipple(event)
                onNextQuestion()
              }}
              className="cta-ripple mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--surface-strong)] transition hover:-translate-y-0.5"
            >
              {isLastQuestion ? <Trophy size={16} /> : <ArrowRight size={16} />}
              {isLastQuestion ? copy.finishQuiz : copy.nextQuestion}
            </button>
          </article>
        ) : (
          <article className={panelClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.debugFocus}</p>
            <div className="mt-4 space-y-3">
              {guidePrimerSections.slice(0, 3).map((section) => (
                <div key={section.id} className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ink)]">{section.title[locale]}</p>
                    <span className="rounded-full bg-[var(--accent-soft-2)] px-3 py-1 text-xs font-semibold text-[var(--accent-2)]">
                      {section.marker}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{section.description[locale]}</p>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>
    </motion.section>
  )
}
