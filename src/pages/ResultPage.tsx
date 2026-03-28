import { Suspense, lazy, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  Crosshair,
  Crown,
  Download,
  RotateCcw,
  Scale,
  Share2,
  Shield,
  Skull,
  Sparkles,
  Target,
  Trophy,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { LanguageId } from '../data/quizModels'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { guideBookEntries } from '../data/guideData'
import { panelClass } from '../components/layout/panelClasses'
import { screenMotion } from '../components/layout/screenMotion'
import type { QuestionOutcome, RankBand } from '../lib/quiz'
import { triggerRipple } from '../lib/ripple'
import {
  buildResultShareHtml,
  buildResultShareText,
  type ResultCoachCompareContent,
  type ResultCoachReadNextItem,
  type ResultCoachSnapshot,
} from '../lib/resultCoach'
import type { StoredQuizTopicMetric } from '../lib/runArchive'

const QuizStatsCharts = lazy(async () => {
  const module = await import('../components/QuizStatsCharts')
  return { default: module.QuizStatsCharts }
})

const chartFallback = <div className="h-[260px] rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)]" />

type ResultPageProps = {
  locale: Locale
  formatCopy: ExtraCopy
  isFixErrorMode: boolean
  isDebugMode: boolean
  isVocabMode: boolean
  score: number
  totalQuestions: number
  outcomes: QuestionOutcome[]
  breakdown: { correct: number; wrong: number; timeout: number }
  rank: RankBand
  currentTrackLabel: string
  currentFormatLabel: string
  currentModeLabel: string
  resultSnapshot: ResultCoachSnapshot
  mostMissedTopics: StoredQuizTopicMetric[]
  mostStableTopics: StoredQuizTopicMetric[]
  hasPreviousRun: boolean
  antiCheatCount: number
  showCoach: boolean
  coachReadNext: [ResultCoachReadNextItem, ResultCoachReadNextItem] | null
  coachCompare: ResultCoachCompareContent | null
  coachSummary: string
  coachStatus: 'idle' | 'loading' | 'ready' | 'error'
  coachSource: 'local' | 'ai'
  coachError: string | null
  onRefreshCoach: () => void
  onStartNewQuiz: () => void
  onBackToGuide: () => void
  onBackToMenu: () => void
  onOpenWeakTopic: (topicId: LanguageId) => void
}

type ShareNotice = {
  tone: 'success' | 'error' | 'info'
  message: string
}

export function ResultPage({
  locale,
  formatCopy,
  isFixErrorMode,
  isDebugMode,
  isVocabMode,
  score,
  totalQuestions,
  outcomes,
  breakdown,
  rank,
  currentTrackLabel,
  currentFormatLabel,
  currentModeLabel,
  resultSnapshot,
  mostMissedTopics,
  mostStableTopics,
  hasPreviousRun,
  antiCheatCount,
  showCoach,
  coachReadNext,
  coachCompare,
  coachSummary,
  coachStatus,
  coachSource,
  coachError,
  onRefreshCoach,
  onStartNewQuiz,
  onBackToGuide,
  onBackToMenu,
  onOpenWeakTopic,
}: ResultPageProps) {
  const copy = uiText[locale]
  const rankIcons = {
    skull: Skull,
    triangle: AlertTriangle,
    wrench: Wrench,
    scale: Scale,
    target: Target,
    shield: Shield,
    crosshair: Crosshair,
    crown: Crown,
  } as const
  const RankIcon = rankIcons[rank.iconKey]
  const formatDelta = (value: number, formatter?: (value: number) => string) => {
    if (formatter) {
      return formatter(value)
    }

    return value > 0 ? `+${value}` : `${value}`
  }
  const [shareNotice, setShareNotice] = useState<ShareNotice | null>(null)

  useEffect(() => {
    if (!shareNotice) {
      return
    }

    const timeoutId = window.setTimeout(() => setShareNotice(null), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [shareNotice])

  const showShareNotice = (tone: ShareNotice['tone'], message: string) => {
    setShareNotice({ tone, message })
  }

  const fallbackManualCopy = (recap: string) => {
    try {
      window.prompt(copy.resultManualCopyPrompt, recap)
      showShareNotice('info', copy.resultManualCopyNotice)
      return true
    } catch {
      showShareNotice('error', copy.resultCopyFailed)
      return false
    }
  }

  const handleCopyRecap = async () => {
    const recap = buildResultShareText(resultSnapshot, coachSummary, {
      coachReadNext,
      coachCompare,
    })
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(recap)
        showShareNotice('success', copy.resultCopied)
        return true
      }

      return fallbackManualCopy(recap)
    } catch {
      return fallbackManualCopy(recap)
    }
  }

  const handleShare = async () => {
    const recap = buildResultShareText(resultSnapshot, coachSummary, {
      coachReadNext,
      coachCompare,
    })
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: copy.resultTitle,
          text: recap,
        })
        showShareNotice('success', copy.resultShared)
        return
      }

      const copied = await handleCopyRecap()
      if (!copied) {
        showShareNotice('error', copy.resultShareFailed)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      const copied = await handleCopyRecap()
      if (!copied) {
        showShareNotice('error', copy.resultShareFailed)
      }
    }
  }

  const handleExportHtml = () => {
    try {
      const html = buildResultShareHtml(resultSnapshot, coachSummary, {
        coachReadNext,
        coachCompare,
      })
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `core-language-result-${score}-${totalQuestions}.html`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      showShareNotice('success', copy.resultExported)
    } catch {
      showShareNotice('error', copy.resultExportFailed)
    }
  }

  const handlePrintReport = () => {
    try {
      const html = buildResultShareHtml(resultSnapshot, coachSummary, {
        coachReadNext,
        coachCompare,
      })
      const printWindow = window.open('', '_blank', 'noopener,noreferrer')
      if (!printWindow) {
        showShareNotice('error', copy.resultPrintFailed)
        return
      }

      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      window.setTimeout(() => {
        printWindow.print()
      }, 180)
      showShareNotice('success', copy.resultPrintReady)
    } catch {
      showShareNotice('error', copy.resultPrintFailed)
    }
  }

  const resultStats = [
    {
      label: copy.correctCount,
      value: breakdown.correct,
      Icon: CheckCircle2,
      tone: 'text-emerald-200 bg-emerald-500/12',
    },
    {
      label: copy.wrongCount,
      value: breakdown.wrong,
      Icon: XCircle,
      tone: 'text-rose-200 bg-rose-500/12',
    },
    {
      label: copy.timeoutCount,
      value: breakdown.timeout,
      Icon: Clock3,
      tone: 'text-amber-200 bg-amber-500/12',
    },
    {
      label: copy.rank,
      value: rank.label[locale],
      Icon: Trophy,
      tone: 'text-[var(--accent)] bg-[var(--accent-soft)]',
    },
  ]
  const compareMetrics = coachCompare
    ? [
        { label: copy.resultCompareMetricScore, value: formatDelta(coachCompare.metrics.scoreDelta) },
        { label: copy.resultCompareMetricWrong, value: formatDelta(coachCompare.metrics.wrongDelta) },
        { label: copy.resultCompareMetricTimeout, value: formatDelta(coachCompare.metrics.timeoutDelta) },
        { label: copy.resultCompareMetricHint, value: formatDelta(coachCompare.metrics.hintDelta) },
        {
          label: copy.resultCompareMetricAvgTime,
          value: formatDelta(coachCompare.metrics.avgTimeMsDelta, (value) => {
            const seconds = (value / 1000).toFixed(Math.abs(value) >= 10000 ? 1 : 2)
            return value > 0 ? `+${seconds}s` : `${seconds}s`
          }),
        },
        { label: copy.resultCompareMetricStreak, value: formatDelta(coachCompare.metrics.maxCorrectStreakDelta) },
      ]
    : []

  return (
    <motion.section key="result" {...screenMotion} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <article className="rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
            <Trophy size={16} className="text-[var(--accent)]" />
            {copy.resultBadge}
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2
                className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] md:text-5xl"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {copy.resultTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.resultDescription}</p>
            </div>

            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.score}</p>
              <p className="mt-2 text-4xl font-semibold text-[var(--ink)]">{score}/{totalQuestions}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[image:var(--panel-gradient)] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                <RankIcon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.rank}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--ink)]">{rank.label[locale]}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{rank.note[locale]}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {resultStats.map(({ label, value, Icon, tone }) => (
              <div key={label} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <div className={clsx('rounded-2xl p-2.5', tone)}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={(event) => {
                triggerRipple(event)
                onStartNewQuiz()
              }}
              className="cta-ripple inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--surface-strong)] transition hover:-translate-y-0.5"
            >
              <RotateCcw size={16} />
              {copy.playAgain}
            </button>
            <button
              type="button"
              onClick={onBackToGuide}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              <BookOpen size={16} />
              {copy.backToGuide}
            </button>
            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              <ArrowLeft size={16} />
              {copy.backToMenu}
            </button>
          </div>
        </article>

        <div className="space-y-6">
          <article className={panelClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.readyLabel}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.trackLabel}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{currentTrackLabel}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.formatLabel}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{currentFormatLabel}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.profileLabel}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{currentModeLabel}</p>
              </div>
            </div>
          </article>

          <article className={panelClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.analyticsNote}</p>
            {isFixErrorMode && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{formatCopy.fixErrorResultNote}</p>}
            {isDebugMode && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{formatCopy.debugResultNote}</p>}
            {isVocabMode && <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{formatCopy.vocabResultNote}</p>}
            {antiCheatCount > 0 && (
              <div className="mt-4 rounded-[22px] border border-rose-400/20 bg-rose-500/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">{copy.resultFocusPenaltyTitle}</p>
                <p className="mt-2 text-sm leading-7 text-rose-100/90">
                  {copy.resultFocusPenaltyNote.replace('{count}', String(antiCheatCount))}
                </p>
              </div>
            )}
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.resultMostMissedTitle}</p>
                {mostMissedTopics.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {mostMissedTopics.map((metric) => (
                      <button
                        key={`missed-${metric.topicId}`}
                        type="button"
                        onClick={() => onOpenWeakTopic(metric.topicId)}
                        className="flex w-full items-center justify-between rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-left transition hover:bg-[var(--surface-hover)]"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--ink)]">{guideBookEntries[metric.topicId].label[locale]}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{guideBookEntries[metric.topicId].quickSpot[locale]}</p>
                        </div>
                        <span className="rounded-full bg-rose-500/12 px-3 py-1 text-xs font-semibold text-rose-200">
                          {metric.wrong + metric.timeout}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy.instantReviewValue}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.resultMostStableTitle}</p>
                {mostStableTopics.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mostStableTopics.map((metric) => (
                      <button
                        key={`stable-${metric.topicId}`}
                        type="button"
                        onClick={() => onOpenWeakTopic(metric.topicId)}
                        className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/16"
                      >
                        {guideBookEntries[metric.topicId].label[locale]} · {Math.round(metric.accuracy * 100)}%
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy.resultMostStableEmpty}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.resultComparedTopicsTitle}</p>
                {coachCompare ? (
                  <div className="mt-3 space-y-3">
                    {coachCompare.metrics.improvedTopics.length > 0 && (
                      <div className="rounded-[20px] border border-emerald-400/16 bg-emerald-500/8 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">{copy.resultComparedImproved}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {coachCompare.metrics.improvedTopics.map((topic) => (
                            <button
                              key={`improved-${topic.topicId}`}
                              type="button"
                              onClick={() => onOpenWeakTopic(topic.topicId)}
                              className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/16"
                            >
                              {guideBookEntries[topic.topicId].label[locale]} · {formatDelta(Math.round(topic.accuracyDelta * 100))}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {coachCompare.metrics.regressedTopics.length > 0 && (
                      <div className="rounded-[20px] border border-rose-400/16 bg-rose-500/8 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100">{copy.resultComparedRegressed}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {coachCompare.metrics.regressedTopics.map((topic) => (
                            <button
                              key={`regressed-${topic.topicId}`}
                              type="button"
                              onClick={() => onOpenWeakTopic(topic.topicId)}
                              className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/16"
                            >
                              {guideBookEntries[topic.topicId].label[locale]} · {formatDelta(Math.round(topic.accuracyDelta * 100))}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {coachCompare.metrics.improvedTopics.length === 0 && coachCompare.metrics.regressedTopics.length === 0 && (
                      <p className="text-sm leading-7 text-[var(--muted)]">{copy.resultComparedTopicsEmpty}</p>
                    )}
                  </div>
                ) : hasPreviousRun ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy.resultComparedTopicsAwaiting}</p>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy.resultComparedTopicsNoPrevious}</p>
                )}
              </div>
            </div>
          </article>

          <article className={panelClass}>
            {showCoach && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.resultCoachTitle}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {coachStatus === 'loading'
                        ? copy.resultCoachLoading
                        : coachSource === 'ai'
                          ? copy.resultCoachReady
                          : copy.resultCoachFallback}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onRefreshCoach}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
                  >
                    <Sparkles size={15} />
                    {copy.resultCoachRefresh}
                  </button>
                </div>

                <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/80 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{coachSummary}</p>
                </div>

                {coachReadNext && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.resultCoachReadNextTitle}</p>
                    <div className="mt-3 grid gap-3">
                      {coachReadNext.map((item) => (
                        <button
                          key={`read-next-${item.topicId}`}
                          type="button"
                          onClick={() => onOpenWeakTopic(item.topicId)}
                          className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-left transition hover:bg-[var(--surface-hover)]"
                        >
                          <p className="text-sm font-semibold text-[var(--ink)]">{guideBookEntries[item.topicId].label[locale]}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.reason}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {coachCompare && (
                  <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.resultCompareTitle}</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{coachCompare.headline}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{coachCompare.summary}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {compareMetrics.map((metric) => (
                        <div key={metric.label} className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
                          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    {coachCompare.metrics.repeatedWeakTopics.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {coachCompare.metrics.repeatedWeakTopics.map((topicId) => (
                          <button
                            key={`repeat-weak-${topicId}`}
                            type="button"
                            onClick={() => onOpenWeakTopic(topicId)}
                            className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/16"
                          >
                            {guideBookEntries[topicId].label[locale]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {coachError && <p className={clsx(showCoach ? 'mt-3' : '', 'text-xs text-amber-200')}>{coachError}</p>}
            {shareNotice && (
              <p
                className={clsx(
                  showCoach ? 'mt-3' : '',
                  'text-xs',
                  shareNotice.tone === 'error'
                    ? 'text-rose-200'
                    : shareNotice.tone === 'info'
                      ? 'text-sky-200'
                      : 'text-[var(--accent)]',
                )}
              >
                {shareNotice.message}
              </p>
            )}

            <div className={clsx('flex flex-wrap gap-2', showCoach ? 'mt-4' : '')}>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              >
                <Share2 size={15} />
                {copy.resultShare}
              </button>
              <button
                type="button"
                onClick={handleCopyRecap}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              >
                <Copy size={15} />
                {copy.resultCopyRecap}
              </button>
              <button
                type="button"
                onClick={handleExportHtml}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              >
                <Download size={15} />
                {copy.resultExportHtml}
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              >
                <Download size={15} />
                {copy.resultPrintPdf}
              </button>
            </div>
          </article>
        </div>
      </div>

      <article className={panelClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.graphTitle}</p>
        <div className="mt-5">
          <Suspense fallback={chartFallback}>
            <QuizStatsCharts locale={locale} outcomes={outcomes} score={score} total={totalQuestions} />
          </Suspense>
        </div>
      </article>
    </motion.section>
  )
}
