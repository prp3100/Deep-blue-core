import clsx from 'clsx'
import { AlertTriangle, Bot, Crosshair, Crown, Scale, Shield, Skull, Target, Trophy, User, Wrench } from 'lucide-react'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'
import type { ArenaMetrics } from '../lib/arena'
import type { RankBand } from '../lib/quiz'
import { panelClass } from '../components/layout/panelClasses'

type ArenaResultPageProps = {
  locale: Locale
  totalQuestions: number
  humanMetrics: ArenaMetrics
  aiMetrics: ArenaMetrics
  humanRank: RankBand | null
  aiRank: RankBand | null
  focusPenaltyCount: number
  opponentLabel: string
  modelLabel: string
  commentary: string
  commentarySource: 'local' | 'ai'
  commentaryStatus: 'idle' | 'loading' | 'ready' | 'error'
  onRematch: () => void
  onBackToArena: () => void
  onBackToLanding: () => void
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`
const formatSeconds = (valueMs: number) => `${(valueMs / 1000).toFixed(1)}s`

export function ArenaResultPage({
  locale,
  totalQuestions,
  humanMetrics,
  aiMetrics,
  humanRank,
  aiRank,
  focusPenaltyCount,
  opponentLabel,
  modelLabel,
  commentary,
  commentarySource,
  commentaryStatus,
  onRematch,
  onBackToArena,
  onBackToLanding,
}: ArenaResultPageProps) {
  const copy = uiText[locale]
  const headline = opponentLabel === copy.arenaAiLabel ? copy.arenaResultHeadline : `${copy.arenaHumanLabel} vs ${opponentLabel}`
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

  const metrics = [
    {
      label: copy.arenaScoreAccuracy,
      human: formatPercent(humanMetrics.accuracy),
      ai: formatPercent(aiMetrics.accuracy),
      winner: humanMetrics.accuracy === aiMetrics.accuracy ? 'tie' : humanMetrics.accuracy > aiMetrics.accuracy ? 'human' : 'ai',
    },
    {
      label: copy.arenaScoreSpeed,
      human: formatSeconds(humanMetrics.avgTimeMs),
      ai: formatSeconds(aiMetrics.avgTimeMs),
      winner: humanMetrics.avgTimeMs === aiMetrics.avgTimeMs ? 'tie' : humanMetrics.avgTimeMs < aiMetrics.avgTimeMs ? 'human' : 'ai',
    },
    {
      label: copy.arenaScoreStreak,
      human: String(humanMetrics.maxStreak),
      ai: String(aiMetrics.maxStreak),
      winner: humanMetrics.maxStreak === aiMetrics.maxStreak ? 'tie' : humanMetrics.maxStreak > aiMetrics.maxStreak ? 'human' : 'ai',
    },
  ] as const

  return (
    <section className="space-y-6">
      <article className="rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
          <Trophy size={16} className="text-[var(--accent)]" />
          {copy.arenaResultTitle}
        </div>
        <h2
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] md:text-5xl"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {headline}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.arenaResultSubtitle}</p>
      </article>

      <article className={panelClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-2.5 text-[var(--accent)]">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.arenaHumanLabel}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {humanMetrics.correctCount}/{totalQuestions}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {copy.correctCount}: {humanMetrics.correctCount} · {copy.timeoutCount}: {humanMetrics.timeoutCount}
            </p>
            {humanRank && (
              <div className="mt-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  {(() => {
                    const HumanRankIcon = rankIcons[humanRank.iconKey]
                    return <HumanRankIcon size={14} className="text-[var(--accent)]" />
                  })()}
                  <span>{copy.rank}: {humanRank.label[locale]}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{humanRank.note[locale]}</p>
              </div>
            )}
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-2.5 text-[var(--accent-2)]">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{opponentLabel}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {aiMetrics.correctCount}/{totalQuestions}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{modelLabel}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {copy.correctCount}: {aiMetrics.correctCount} · {copy.timeoutCount}: {aiMetrics.timeoutCount}
            </p>
            {aiRank && (
              <div className="mt-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  {(() => {
                    const AiRankIcon = rankIcons[aiRank.iconKey]
                    return <AiRankIcon size={14} className="text-[var(--accent-2)]" />
                  })()}
                  <span>{copy.rank}: {aiRank.label[locale]}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{aiRank.note[locale]}</p>
              </div>
            )}
          </div>
        </div>
      </article>

      <article className={panelClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.arenaMetricsTitle}</p>
        {focusPenaltyCount > 0 && (
          <div className="mt-4 rounded-[22px] border border-rose-400/20 bg-rose-500/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">{copy.resultFocusPenaltyTitle}</p>
            <p className="mt-2 text-sm leading-7 text-rose-100/90">
              {copy.resultFocusPenaltyNote.replace('{count}', String(focusPenaltyCount))}
            </p>
          </div>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div
                  className={clsx(
                    'flex items-center justify-between rounded-2xl border px-3 py-2',
                    metric.winner === 'human'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-[var(--line)] text-[var(--ink)]',
                  )}
                >
                  <span>{copy.arenaHumanLabel}</span>
                  <span className="font-semibold">{metric.human}</span>
                </div>
                <div
                  className={clsx(
                    'flex items-center justify-between rounded-2xl border px-3 py-2',
                    metric.winner === 'ai'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-[var(--line)] text-[var(--ink)]',
                  )}
                >
                  <span>{opponentLabel}</span>
                  <span className="font-semibold">{metric.ai}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className={panelClass}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{opponentLabel}</p>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {commentaryStatus === 'loading' ? copy.arenaThinking : commentarySource === 'ai' ? copy.arenaAiLabel : opponentLabel}
          </span>
        </div>
        <div className="mt-4 min-h-[7.5rem] rounded-[24px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
            {commentary || (commentaryStatus === 'loading' ? copy.arenaThinking : copy.arenaAiError)}
          </p>
        </div>
      </article>

      <article className={panelClass}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRematch}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_var(--accent-soft)] transition hover:-translate-y-0.5"
          >
            {copy.arenaRematch}
          </button>
          <button
            type="button"
            onClick={onBackToArena}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            {copy.arenaBackToArena}
          </button>
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            {copy.arenaBackToLanding}
          </button>
        </div>
      </article>
    </section>
  )
}
