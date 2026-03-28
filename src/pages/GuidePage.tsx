import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Play, WandSparkles } from 'lucide-react'
import type { Difficulty, GuideFamilyId, GuideLevel, LanguageId, QuizFormatId, QuizTrackId } from '../data/quizModels'
import { guideBookEntries, guideFamilyLabels, guidePrimerSections, fixErrorPrimerSections, debugPrimerSections, trackSettings, vocabPrimerSections } from '../data/guideData'
import { modeSettings, questionBanks } from '../data/questionBank'
import { fixErrorQuestionBanks, fixErrorSupportedLanguageIds, type FixErrorSupportedLanguageId } from '../data/fixErrorData'
import { debugQuestionBanks, debugSupportedLanguageIds, type DebugSupportedLanguageId } from '../data/debugData'
import { debugGuideData } from '../data/debugGuideData'
import { debugHardGuideData } from '../data/debugHardGuideData'
import { fixErrorGuideData } from '../data/fixErrorGuideData'
import { fixErrorHardGuideData } from '../data/fixErrorHardGuideData'
import { identifyHardGuideData } from '../data/identifyHardGuideData'
import { vocabGuideData } from '../data/vocabGuideData'
import { vocabQuestionBanks, vocabSupportedLanguageIds, type VocabSupportedLanguageId } from '../data/vocabData'
import { debugGuideInsights, fixErrorGuideInsights, identifyGuideInsights, vocabGuideInsights } from '../data/guideInsights'
import { quizFormatSettings } from '../data/quizFormats'
import type { Locale } from '../lib/i18n'
import { getLanguageLabel, uiText } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { SyntaxSnippet } from '../components/SyntaxSnippet'
import { panelClass } from '../components/layout/panelClasses'
import { screenMotion } from '../components/layout/screenMotion'
import { triggerRipple } from '../lib/ripple'

const fixErrorSupportedLanguageSet = new Set<LanguageId>(fixErrorSupportedLanguageIds)
const debugSupportedLanguageSet = new Set<LanguageId>(debugSupportedLanguageIds)

const isFixErrorSupportedLanguage = (topicId: LanguageId): topicId is FixErrorSupportedLanguageId =>
  fixErrorSupportedLanguageSet.has(topicId)
const isDebugSupportedLanguage = (topicId: LanguageId): topicId is DebugSupportedLanguageId =>
  debugSupportedLanguageSet.has(topicId)

const vocabSupportedLanguageSet = new Set<LanguageId>(vocabSupportedLanguageIds)
const isVocabSupportedLanguage = (topicId: LanguageId): topicId is VocabSupportedLanguageId =>
  vocabSupportedLanguageSet.has(topicId)
const identifyHardGuideTopicSet = new Set<LanguageId>(Object.keys(identifyHardGuideData) as LanguageId[])
const isIdentifyHardGuideTopic = (topicId: LanguageId): topicId is keyof typeof identifyHardGuideData =>
  identifyHardGuideTopicSet.has(topicId)
const fixErrorHardGuideTopicSet = new Set<LanguageId>(Object.keys(fixErrorHardGuideData) as LanguageId[])
const isFixErrorHardGuideTopic = (topicId: LanguageId): topicId is keyof typeof fixErrorHardGuideData =>
  fixErrorHardGuideTopicSet.has(topicId)
const debugHardGuideTopicSet = new Set<LanguageId>(Object.keys(debugHardGuideData) as LanguageId[])
const isDebugHardGuideTopic = (topicId: LanguageId): topicId is keyof typeof debugHardGuideData =>
  debugHardGuideTopicSet.has(topicId)

type ComparisonState = {
  source: LanguageId
  target: LanguageId
} | null

type ModeLensState =
  | { type: 'fix-error'; topicId: FixErrorSupportedLanguageId; index: number }
  | { type: 'debug'; topicId: DebugSupportedLanguageId; index: number }
  | { type: 'vocab'; topicId: VocabSupportedLanguageId; index: number }
  | null

type GuidePageProps = {
  locale: Locale
  theme: 'light' | 'dark'
  formatCopy: ExtraCopy
  quizFormat: QuizFormatId
  difficulty: Difficulty
  guideLevel: GuideLevel
  isFixErrorMode: boolean
  isDebugMode: boolean
  isVocabMode: boolean
  currentTrackId: QuizTrackId
  trackTopicList: LanguageId[]
  trackViewedCount: number
  questionTimeLimitSeconds: number
  familyFilter: GuideFamilyId | 'all'
  familyOptions: GuideFamilyId[]
  filteredGuideIds: LanguageId[]
  hardUnlockedTopicIds: LanguageId[]
  expandedGuideId: LanguageId | null
  comparison: ComparisonState
  viewedGuideIds: LanguageId[]
  onBackToMenu: () => void
  onStartQuiz: () => void
  onReadGuide: (topicId: LanguageId) => void
  onStartFixErrorTopicQuiz: (topicId: FixErrorSupportedLanguageId) => void
  onStartDebugTopicQuiz: (topicId: DebugSupportedLanguageId) => void
  onStartVocabTopicQuiz: (topicId: VocabSupportedLanguageId) => void
  onCompare: (topicId: LanguageId, targetId?: LanguageId) => void
  onFamilyFilterChange: (filter: GuideFamilyId | 'all') => void
  onGuideLevelChange: (level: GuideLevel) => void
  onFormatChange: (format: QuizFormatId) => void
  onHideComparison: () => void
}

export function GuidePage({
  locale,
  theme,
  formatCopy,
  quizFormat,
  difficulty,
  guideLevel,
  isFixErrorMode,
  isDebugMode,
  isVocabMode,
  currentTrackId,
  trackTopicList,
  trackViewedCount,
  questionTimeLimitSeconds,
  familyFilter,
  familyOptions,
  filteredGuideIds,
  hardUnlockedTopicIds,
  expandedGuideId,
  comparison,
  viewedGuideIds,
  onBackToMenu,
  onStartQuiz,
  onReadGuide,
  onStartFixErrorTopicQuiz,
  onStartDebugTopicQuiz,
  onStartVocabTopicQuiz,
  onCompare,
  onFamilyFilterChange,
  onGuideLevelChange,
  onFormatChange,
  onHideComparison,
}: GuidePageProps) {
  const copy = uiText[locale]
  const currentTrack = trackSettings[currentTrackId]
  const compareTrackOrder: QuizTrackId[] = currentTrackId === 'core' ? ['core', 'game-dev'] : ['game-dev', 'core']
  const comparisonRef = useRef<HTMLDivElement | null>(null)
  const lastScrollYRef = useRef<number | null>(null)
  const [pendingCompareScroll, setPendingCompareScroll] = useState(false)
  const [hasLastScroll, setHasLastScroll] = useState(false)
  const [modeLens, setModeLens] = useState<ModeLensState>(null)
  const isIdentifyMode = !isFixErrorMode && !isDebugMode && !isVocabMode
  const hardUnlockedTopicSet = new Set<LanguageId>(hardUnlockedTopicIds)
  const supportsHardGuideFilter = isIdentifyMode || isFixErrorMode || isDebugMode
  const showHardGuideFilter = supportsHardGuideFilter && hardUnlockedTopicIds.length > 0
  const effectiveGuideLevel: GuideLevel = showHardGuideFilter ? guideLevel : 'easy'
  const isHardGuideView = effectiveGuideLevel === 'hard'
  const visibleGuideIds = isHardGuideView ? filteredGuideIds.filter((topicId) => hardUnlockedTopicSet.has(topicId)) : filteredGuideIds
  const visibleComparison = comparison
  const activeDifficultyLabel = isIdentifyMode
    ? modeSettings[difficulty].label[locale]
    : isFixErrorMode
      ? quizFormatSettings['fix-error'].difficulties[difficulty].label[locale]
      : isDebugMode
        ? quizFormatSettings.debug.difficulties[difficulty].label[locale]
        : quizFormatSettings.vocab.difficulties[difficulty].label[locale]

  const getCompareSnippet = (languageId: LanguageId) => {
    const difficultyOrder = isHardGuideView ? (['hard', 'easy'] as const) : (['easy', 'hard'] as const)

    for (const trackId of compareTrackOrder) {
      for (const difficultyLevel of difficultyOrder) {
        const match = questionBanks[trackId][difficultyLevel].find((item) => item.answer === languageId)
        if (match) {
          return match.snippetText
        }
      }
    }

    const fallback = guideBookEntries[languageId]?.miniSnippetNotes?.[0]?.[locale]
    return fallback ?? copy.compareExampleEmpty
  }

  const getCompareSignals = (languageId: LanguageId) =>
    isIdentifyMode ? identifyGuideInsights[effectiveGuideLevel][languageId].signals.slice(0, 6) : guideBookEntries[languageId].signature

  const handleOpenComparison = (source: LanguageId, targetId?: LanguageId) => {
    if (typeof window !== 'undefined') {
      lastScrollYRef.current = window.scrollY
      setHasLastScroll(true)
    }
    setPendingCompareScroll(true)
    onCompare(source, targetId)
  }

  useEffect(() => {
    if (!visibleComparison || !pendingCompareScroll) {
      return
    }

    requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setPendingCompareScroll(false)
    })
  }, [visibleComparison, pendingCompareScroll])

  const activePrimer = isFixErrorMode
    ? fixErrorPrimerSections
    : isDebugMode
      ? debugPrimerSections
      : isVocabMode
        ? vocabPrimerSections
      : guidePrimerSections

  const activePrimerTitle = isFixErrorMode
    ? copy.fixErrorPrimerTitle
    : isDebugMode
      ? copy.debugPrimerTitle
      : isVocabMode
        ? formatCopy.vocabGuideTitle
        : copy.guidePrimerTitle
  const activePrimerDescription = isFixErrorMode
    ? copy.fixErrorPrimerDescription
    : isDebugMode
      ? copy.debugPrimerDescription
      : isVocabMode
        ? formatCopy.vocabCoreNote
        : copy.guidePrimerDescription
  const detailCardClass = 'rounded-[22px] border border-[var(--line)] bg-[var(--surface-strong)] p-4'
  const getFixErrorExample = (topicId: FixErrorSupportedLanguageId, index: number, exampleIndexes?: number[]) => {
    const bank = fixErrorQuestionBanks[topicId][effectiveGuideLevel]
    const resolvedIndex = exampleIndexes && exampleIndexes.length > 0 ? exampleIndexes[index % exampleIndexes.length] : index % bank.length
    return bank[resolvedIndex % bank.length]
  }
  const getDebugExample = (topicId: DebugSupportedLanguageId, index: number) => {
    const bank = debugQuestionBanks[topicId][effectiveGuideLevel]
    return bank[index % bank.length]
  }
  const getVocabExample = (topicId: VocabSupportedLanguageId, index: number) => {
    const bank = [...vocabQuestionBanks[topicId].easy, ...vocabQuestionBanks[topicId].hard]
    return bank[index % bank.length]
  }

  return (
    <motion.section key="guide" {...screenMotion} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft size={14} />
            {copy.backToMenu}
          </button>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent)]">{copy.guideTitle}</p>
          <h2
            className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] md:text-5xl"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {currentTrack.label[locale]}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink)] opacity-70 md:text-base">{copy.guideDescription}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            {copy.guideProgress}: {trackViewedCount}/{trackTopicList.length}
          </div>
          <button
            type="button"
            onClick={(event) => {
              triggerRipple(event)
              onStartQuiz()
            }}
            className="cta-ripple inline-flex items-center justify-center gap-2 rounded-[22px] bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--surface-strong)] transition hover:-translate-y-0.5"
          >
            <Play size={16} />
            {isFixErrorMode ? formatCopy.tryFixError : isDebugMode ? formatCopy.tryDebug : isVocabMode ? formatCopy.tryVocab : copy.startTrackQuiz}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <article className={panelClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{activePrimerTitle}</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ink)]">{activePrimerDescription}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activePrimer.map((section) => (
              <div key={section.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{section.marker}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{section.title[locale]}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{section.description[locale]}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.quickSpot}</p>
              <p className="mt-1 text-sm text-[var(--ink)]">{currentTrack.description[locale]}</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {currentTrack.badge[locale]}
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.trackLabel}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{currentTrack.label[locale]}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{currentTrack.description[locale]}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.totalCount}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{trackTopicList.length}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.timeLeft}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{questionTimeLimitSeconds}s</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      {visibleComparison && (
        <article ref={comparisonRef} className={panelClass}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.compareTitle}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.compareNote}</p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.compareTargetLabel}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {guideBookEntries[visibleComparison.source].falseFriends.map((falseFriend) => {
                    const isActive = falseFriend === visibleComparison.target
                    return (
                      <button
                        key={`compare-${visibleComparison.source}-${falseFriend}`}
                        type="button"
                        onClick={() => onCompare(visibleComparison.source, falseFriend)}
                        className={clsx(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                          isActive
                            ? 'border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--ink)]'
                            : 'border-[var(--line)] bg-[var(--surface-raised)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                        )}
                      >
                        {getLanguageLabel(locale, falseFriend)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCompare(visibleComparison.target, visibleComparison.source)}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)]"
                >
                  {copy.compareSwap}
                </button>
                <button
                  type="button"
                  onClick={onHideComparison}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                >
                  {copy.hideGuide}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[visibleComparison.source, visibleComparison.target].map((topicId) => {
              const guide = guideBookEntries[topicId]
              const snippetText = getCompareSnippet(topicId)
              const compareSignals = getCompareSignals(topicId)
              const hardGuide = isHardGuideView && isIdentifyHardGuideTopic(topicId) ? identifyHardGuideData[topicId] : null
              const spottingRules = guide.spottingRules.slice(0, 3)

              return (
                <div key={topicId} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--ink)]">{guide.label[locale]}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{guideFamilyLabels[guide.family][locale]}</p>
                    </div>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {guide.quickSpot[locale]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.whatIsThis}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{hardGuide?.snapshot[locale] ?? guide.plainSummary[locale]}</p>
                    </div>
                    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.looksLike}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{guide.metaphor[locale]}</p>
                    </div>
                    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.spottingRulesTitle}</p>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-[var(--ink)]">
                        {spottingRules.map((rule, index) => (
                          <li key={`${topicId}-compare-rule-${index}`}>• {rule[locale]}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.compareSignalsLabel}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {compareSignals.map((signal) => (
                          <span
                            key={`${topicId}-${signal}`}
                            className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.compareExampleLabel}</p>
                      <div className="mt-3">
                        <SyntaxSnippet
                          code={snippetText}
                          languageId={topicId}
                          theme={theme}
                          label={copy.compareExampleLabel}
                          copyLabel={copy.copyCode}
                          copiedLabel={copy.copiedCode}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      )}

      {visibleComparison && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
          {hasLastScroll && (
            <button
              type="button"
              onClick={() => {
                const target = lastScrollYRef.current
                if (typeof target === 'number' && typeof window !== 'undefined') {
                  window.scrollTo({ top: target, behavior: 'smooth' })
                }
              }}
              className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--muted)] shadow-[0_18px_32px_rgba(2,12,24,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              {copy.compareBackToPrevious}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--ink)] shadow-[0_18px_32px_rgba(2,12,24,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            {copy.compareJumpToCompare}
          </button>
        </div>
      )}

      <article className={panelClass}>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.guideFormatFilter}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {([
                { id: 'identify-language' as QuizFormatId, label: copy.formatIdentify },
                { id: 'fix-error' as QuizFormatId, label: copy.formatFixError },
                { id: 'debug' as QuizFormatId, label: copy.formatDebug },
                { id: 'vocab' as QuizFormatId, label: formatCopy.tryVocab },
              ]).map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => onFormatChange(format.id)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition',
                    quizFormat === format.id
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface-strong)]'
                      : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                  )}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {supportsHardGuideFilter && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.guideLevelFilter}</p>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {activeDifficultyLabel}
                </span>
              </div>

              {showHardGuideFilter ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      { id: 'easy' as GuideLevel, label: copy.guideLevelEasy },
                      { id: 'hard' as GuideLevel, label: copy.guideLevelHard },
                    ]).map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => onGuideLevelChange(level.id)}
                        className={clsx(
                          'rounded-full border px-4 py-2 text-sm font-semibold transition',
                          effectiveGuideLevel === level.id
                            ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface-strong)]'
                            : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy.hardGuideReadyNote}</p>
                </>
              ) : (
                <div className="mt-3 rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted)]">
                  {copy.hardGuideUnlockNote}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.familyFilter}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onFamilyFilterChange('all')}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  familyFilter === 'all'
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface-strong)]'
                    : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                )}
              >
                {copy.allFamilies}
              </button>
              {familyOptions.map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => onFamilyFilterChange(family)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition',
                    familyFilter === family
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface-strong)]'
                      : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                  )}
                >
                  {guideFamilyLabels[family][locale]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleGuideIds.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted)]">
            {isHardGuideView ? copy.noHardGuideMatches : copy.noFamilyMatches}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {visibleGuideIds.map((topicId) => {
              const guide = guideBookEntries[topicId]
              const identifyHardGuide = isIdentifyHardGuideTopic(topicId) ? identifyHardGuideData[topicId] : null
              const fixErrorHardGuide = isFixErrorHardGuideTopic(topicId) ? fixErrorHardGuideData[topicId] : null
              const debugHardGuide = isDebugHardGuideTopic(topicId) ? debugHardGuideData[topicId] : null
              const hardGuide = isIdentifyMode ? identifyHardGuide : isFixErrorMode ? fixErrorHardGuide : isDebugMode ? debugHardGuide : null
              const isExpanded = expandedGuideId === topicId
              const isViewed = viewedGuideIds.includes(topicId)
              const isHardUnlocked = supportsHardGuideFilter && hardUnlockedTopicSet.has(topicId)
              const compareTarget = guide.falseFriends[0]
              const identifyInsight = identifyGuideInsights[effectiveGuideLevel][topicId]
              const fixErrorInsight = isFixErrorSupportedLanguage(topicId) ? fixErrorGuideInsights[effectiveGuideLevel][topicId] : null
              const debugInsight = isDebugSupportedLanguage(topicId) ? debugGuideInsights[effectiveGuideLevel][topicId] : null
              const vocabInsight = isVocabSupportedLanguage(topicId) ? vocabGuideInsights[topicId] : null
              const activeFixErrorExample =
                isFixErrorSupportedLanguage(topicId) && fixErrorInsight
                  ? getFixErrorExample(
                      topicId,
                      modeLens?.type === 'fix-error' && modeLens.topicId === topicId ? modeLens.index : 0,
                      fixErrorInsight.workedExampleIndexes,
                    )
                  : null
              const activeDebugExample =
                isDebugSupportedLanguage(topicId) && debugInsight
                  ? getDebugExample(topicId, modeLens?.type === 'debug' && modeLens.topicId === topicId ? modeLens.index : 0)
                  : null
              const activeVocabExample =
                isVocabSupportedLanguage(topicId) && vocabInsight
                  ? getVocabExample(topicId, modeLens?.type === 'vocab' && modeLens.topicId === topicId ? modeLens.index : 0)
                  : null

              return (
                <article key={topicId} className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-[0_18px_28px_rgba(1,12,22,0.16)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-semibold text-[var(--ink)]">{guide.label[locale]}</p>
                        {isHardUnlocked ? (
                          <span className="rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold text-amber-200">
                            {copy.hardUnlockedBadge}
                          </span>
                        ) : isViewed ? (
                          <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                            {copy.viewedGuides}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">{guideFamilyLabels[guide.family][locale]}</p>
                    </div>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {guide.quickSpot[locale]}
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-[linear-gradient(140deg,rgba(var(--accent-rgb),0.08),rgba(var(--accent-2-rgb),0.06))] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{copy.guideLoreTitle}</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                        {guide.quickSpot[locale]}
                      </span>
                    </div>

                    <div className="mt-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/84 p-5">
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{copy.whatIsThis}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{isHardGuideView && hardGuide ? hardGuide.snapshot[locale] : guide.plainSummary[locale]}</p>
                        </div>

                        <div className="h-px bg-[var(--line)]" />

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{copy.looksLike}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{guide.metaphor[locale]}</p>
                        </div>

                        <div className="h-px bg-[var(--line)]" />

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{copy.firstLookTitle}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{guide.difficultyHint[locale]}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onReadGuide(topicId)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)]"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      {isExpanded ? copy.hideGuide : copy.readGuide}
                    </button>
                    {(isIdentifyMode || isFixErrorMode) && isFixErrorSupportedLanguage(topicId) && (
                      <button
                        type="button"
                        onClick={() => onStartFixErrorTopicQuiz(topicId)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
                      >
                        <WandSparkles size={15} />
                        {formatCopy.tryFixError}
                      </button>
                    )}
                    {(isIdentifyMode || isDebugMode) && isDebugSupportedLanguage(topicId) && (
                      <button
                        type="button"
                        onClick={() => onStartDebugTopicQuiz(topicId)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
                      >
                        <WandSparkles size={15} />
                        {formatCopy.tryDebug}
                      </button>
                    )}
                    {(isIdentifyMode || isVocabMode) && isVocabSupportedLanguage(topicId) && (
                      <button
                        type="button"
                        onClick={() => onStartVocabTopicQuiz(topicId)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
                      >
                        <WandSparkles size={15} />
                        {formatCopy.tryVocab}
                      </button>
                    )}
                    {isIdentifyMode && compareTarget && (
                      <button
                        type="button"
                        onClick={() => handleOpenComparison(topicId)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                      >
                        <ArrowRight size={15} />
                        {copy.compareButton}
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-[var(--muted)]">{copy.focusDrillNote}</p>

                  {isExpanded && (
                    <div className="mt-5 space-y-4">
                      {isIdentifyMode && (
                        <div className={detailCardClass}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.beginnerChecklistTitle}</p>
                          <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                            {guide.beginnerChecklist.map((item, index) => (
                              <li key={`${topicId}-shared-check-${index}`}>• {item[locale]}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isFixErrorMode && isFixErrorSupportedLanguage(topicId) && fixErrorInsight && (
                        isHardGuideView && fixErrorHardGuide && activeFixErrorExample ? (
                          <>
                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.hardSnapshotTitle}</p>
                              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{fixErrorHardGuide.snapshot[locale]}</p>
                              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {fixErrorHardGuide.checklist.map((item, index) => (
                                  <li key={`${topicId}-fixerror-hard-check-${index}`}>• {item[locale]}</li>
                                ))}
                              </ul>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.deepMarkersTitle}</p>
                              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.deepMarkersNote}</p>
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {fixErrorInsight.errorPatterns.map((pattern, index) => (
                                  <li key={`${topicId}-fixerror-hard-pattern-${index}`}>• {pattern[locale]}</li>
                                ))}
                              </ul>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {fixErrorInsight.culpritFragments.slice(0, 4).map((fragment) => (
                                  <span
                                    key={`${topicId}-fixerror-hard-fragment-${fragment}`}
                                    className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                  >
                                    {fragment}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.falseFriendSplitTitle}</p>
                              <div className="mt-3 grid gap-3">
                                {fixErrorHardGuide.falseFriendSplits.map((entry) => (
                                  <div
                                    key={`${topicId}-fixerror-hard-split-${entry.target}`}
                                    className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <p className="text-sm font-semibold text-[var(--ink)]">{getLanguageLabel(locale, entry.target)}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenComparison(topicId, entry.target)}
                                        className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                                      >
                                        {copy.compareButton}
                                      </button>
                                    </div>
                                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                      {entry.points.map((point, index) => (
                                        <li key={`${topicId}-fixerror-hard-split-${entry.target}-${index}`}>• {point[locale]}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.workedHardSnippetTitle}</p>
                              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.workedHardSnippetNote}</p>
                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.errorTextLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeFixErrorExample.errorText[locale]}</p>
                                  <div className="mt-4">
                                    <SyntaxSnippet
                                      code={activeFixErrorExample.snippetText}
                                      languageId={topicId}
                                      theme={theme}
                                      label={copy.workedHardSnippetTitle}
                                      copyLabel={copy.copyCode}
                                      copiedLabel={copy.copiedCode}
                                      compact
                                    />
                                  </div>
                                </div>

                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.correctLineLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                    {activeFixErrorExample.choices.find((choice) => choice.id === activeFixErrorExample.answer)?.fragment}
                                  </p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.explanationTitle}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeFixErrorExample.explanation.correct[locale]}</p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                    {fixErrorHardGuide.checklist.slice(0, 3).map((item, index) => (
                                      <li key={`${topicId}-fixerror-hard-worked-${index}`}>• {item[locale]}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                  {formatCopy.fixErrorGuideTitle}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{fixErrorGuideData[topicId].overview[locale]}</p>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.fixErrorFirstPassTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {fixErrorGuideData[topicId].firstPassChecklist.map((item, index) => (
                                    <li key={`${topicId}-fixerror-${index}`}>• {item[locale]}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                  {copy.fixErrorFalseStartsTitle}
                                </p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {fixErrorGuideData[topicId].commonFalseStarts.map((item, index) => (
                                    <li key={`${topicId}-fixerror-falsestart-${index}`}>• {item[locale]}</li>
                                  ))}
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {fixErrorInsight.falseStartFragments.map((fragment) => (
                                    <span
                                      key={`${topicId}-fixerror-falsestart-fragment-${fragment}`}
                                      className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                    >
                                      {fragment}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.fixErrorCoverageTitle}</p>
                                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.fixErrorCoverageNote}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {fixErrorInsight.errorPatterns.map((pattern, index) => (
                                    <li key={`${topicId}-fixerror-pattern-${index}`}>• {pattern[locale]}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.culpritPatternsTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {fixErrorInsight.culpritFragments.map((fragment, index) => (
                                    <li key={`${topicId}-fixerror-fragment-${index}`}>• {fragment}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {activeFixErrorExample && (
                              <div className={detailCardClass}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.fixErrorWorkedExampleTitle}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.fixErrorWorkedLensTitle}</p>
                                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                      {fixErrorGuideData[topicId].workedExampleLens.slice(0, 3).map((item, index) => (
                                        <li key={`${topicId}-fixerror-lens-copy-${index}`}>• {item[locale]}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {fixErrorInsight.errorPatterns.slice(0, 4).map((pattern, index) => {
                                      const isActive = modeLens?.type === 'fix-error' && modeLens.topicId === topicId && modeLens.index === index
                                      return (
                                        <button
                                          key={`${topicId}-fixerror-lens-${index}`}
                                          type="button"
                                          onClick={() => setModeLens({ type: 'fix-error', topicId, index })}
                                          className={clsx(
                                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                            isActive
                                              ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                                              : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                                          )}
                                        >
                                          {pattern[locale]}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.errorTextLabel}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeFixErrorExample.errorText[locale]}</p>
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.correctLineLabel}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                      {activeFixErrorExample.choices.find((choice) => choice.id === activeFixErrorExample.answer)?.fragment}
                                    </p>
                                  </div>

                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.explanationTitle}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeFixErrorExample.explanation.correct[locale]}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {fixErrorInsight.culpritFragments.slice(0, 3).map((fragment) => (
                                        <span
                                          key={`${topicId}-fixerror-fragment-chip-${fragment}`}
                                          className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--muted)]"
                                        >
                                          {fragment}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      )}
                      {isDebugMode && isDebugSupportedLanguage(topicId) && debugInsight && (
                        isHardGuideView && debugHardGuide && activeDebugExample ? (
                          <>
                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.hardSnapshotTitle}</p>
                              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{debugHardGuide.snapshot[locale]}</p>
                              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {debugHardGuide.checklist.map((item, index) => (
                                  <li key={`${topicId}-debug-hard-check-${index}`}>• {item[locale]}</li>
                                ))}
                              </ul>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.deepMarkersTitle}</p>
                              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.deepMarkersNote}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {debugInsight.causeLabels.map((label, index) => (
                                  <span
                                    key={`${topicId}-debug-hard-cause-${index}`}
                                    className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                  >
                                    {label[locale]}
                                  </span>
                                ))}
                              </div>
                              <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {debugInsight.sampleLogs.map((log, index) => (
                                  <li key={`${topicId}-debug-hard-log-${index}`}>• {log[locale]}</li>
                                ))}
                              </ul>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.falseFriendSplitTitle}</p>
                              <div className="mt-3 grid gap-3">
                                {debugHardGuide.falseFriendSplits.map((entry) => (
                                  <div
                                    key={`${topicId}-debug-hard-split-${entry.target}`}
                                    className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <p className="text-sm font-semibold text-[var(--ink)]">{getLanguageLabel(locale, entry.target)}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenComparison(topicId, entry.target)}
                                        className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                                      >
                                        {copy.compareButton}
                                      </button>
                                    </div>
                                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                      {entry.points.map((point, index) => (
                                        <li key={`${topicId}-debug-hard-split-${entry.target}-${index}`}>• {point[locale]}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.workedHardSnippetTitle}</p>
                              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.workedHardSnippetNote}</p>
                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugScenarioLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.scenario[locale]}</p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugLogLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.logText[locale]}</p>
                                  <div className="mt-4">
                                    <SyntaxSnippet
                                      code={activeDebugExample.snippetText}
                                      languageId={topicId}
                                      theme={theme}
                                      label={copy.workedHardSnippetTitle}
                                      copyLabel={copy.copyCode}
                                      copiedLabel={copy.copiedCode}
                                      compact
                                    />
                                  </div>
                                </div>

                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugCorrectCauseLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                    {activeDebugExample.choices.find((choice) => choice.id === activeDebugExample.answer)?.label[locale]}
                                  </p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.explanationTitle}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.explanation.correct[locale]}</p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                    {debugHardGuide.checklist.slice(0, 3).map((item, index) => (
                                      <li key={`${topicId}-debug-hard-worked-${index}`}>• {item[locale]}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                  {formatCopy.debugGuideTitle}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{debugGuideData[topicId].overview[locale]}</p>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.debugTriageTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {debugGuideData[topicId].triageChecklist.map((item, index) => (
                                    <li key={`${topicId}-debug-${index}`}>• {item[locale]}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.debugSymptomSplitTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {debugGuideData[topicId].symptomVsRootCauseWarnings.map((item, index) => (
                                    <li key={`${topicId}-debugcheck-${index}`}>• {item[locale]}</li>
                                  ))}
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {debugInsight.misleadingCauseLabels.map((label, index) => (
                                    <span
                                      key={`${topicId}-debug-mislead-${index}`}
                                      className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                    >
                                      {label[locale]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.debugCoverageTitle}</p>
                                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.debugCoverageNote}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {debugInsight.causeLabels.map((label, index) => (
                                    <span
                                      key={`${topicId}-debug-cause-${index}`}
                                      className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                    >
                                      {label[locale]}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.debugLogPatternsTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {debugInsight.sampleLogs.map((log, index) => (
                                    <li key={`${topicId}-debug-log-${index}`}>• {log[locale]}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {activeDebugExample && (
                              <div className={detailCardClass}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.debugWorkedExampleTitle}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.debugWorkedLensTitle}</p>
                                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                      {debugGuideData[topicId].workedExampleLens.slice(0, 3).map((item, index) => (
                                        <li key={`${topicId}-debug-lens-copy-${index}`}>• {item[locale]}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {debugInsight.causeLabels.slice(0, 4).map((label, index) => {
                                      const isActive = modeLens?.type === 'debug' && modeLens.topicId === topicId && modeLens.index === index
                                      return (
                                        <button
                                          key={`${topicId}-debug-lens-${index}`}
                                          type="button"
                                          onClick={() => setModeLens({ type: 'debug', topicId, index })}
                                          className={clsx(
                                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                            isActive
                                              ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                                              : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                                          )}
                                        >
                                          {label[locale]}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugScenarioLabel}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.scenario[locale]}</p>
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugLogLabel}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.logText[locale]}</p>
                                  </div>

                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.debugCorrectCauseLabel}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                      {activeDebugExample.choices.find((choice) => choice.id === activeDebugExample.answer)?.label[locale]}
                                    </p>
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.explanationTitle}</p>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeDebugExample.explanation.correct[locale]}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      )}
                      {isVocabMode && isVocabSupportedLanguage(topicId) && vocabInsight && (
                        <>
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                {formatCopy.vocabGuideTitle}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{vocabGuideData[topicId].overview[locale]}</p>
                              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.vocabTermFamiliesTitle}</p>
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {vocabGuideData[topicId].termFamilyCues.map((item, index) => (
                                  <li key={`${topicId}-vocab-${index}`}>• {item[locale]}</li>
                                ))}
                              </ul>
                            </div>

                            <div className={detailCardClass}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.vocabLookalikeTitle}</p>
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                {vocabGuideData[topicId].lookalikeWarnings.map((item, index) => (
                                  <li key={`${topicId}-vocab-lookalike-${index}`}>• {item[locale]}</li>
                                ))}
                              </ul>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {vocabInsight.meanings.map((term, index) => (
                                  <span
                                    key={`${topicId}-vocab-term-${index}`}
                                    className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                  >
                                    {term[locale]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className={detailCardClass}>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.vocabReadingTipsTitle}</p>
                            <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                              {vocabGuideData[topicId].snippetReadingTips.map((item, index) => (
                                <li key={`${topicId}-vocab-reading-${index}`}>• {item[locale]}</li>
                              ))}
                            </ul>
                            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.vocabSnippetPatternsTitle}</p>
                            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                              {vocabInsight.snippets.map((snippet, index) => (
                                <SyntaxSnippet
                                  key={`${topicId}-vocab-snippet-${index}`}
                                  code={snippet}
                                  languageId={topicId}
                                  theme={theme}
                                  label={copy.vocabSnippetPatternsTitle}
                                  copyLabel={copy.copyCode}
                                  copiedLabel={copy.copiedCode}
                                  compact
                                />
                              ))}
                            </div>
                          </div>

                          {activeVocabExample && (
                            <div className={detailCardClass}>
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.vocabWorkedExampleTitle}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.vocabCoverageNote}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {vocabInsight.terms.slice(0, 5).map((term, index) => {
                                    const isActive = modeLens?.type === 'vocab' && modeLens.topicId === topicId && modeLens.index === index
                                    return (
                                      <button
                                        key={`${topicId}-vocab-lens-${index}`}
                                        type="button"
                                        onClick={() => setModeLens({ type: 'vocab', topicId, index })}
                                        className={clsx(
                                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                          isActive
                                            ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                                            : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                                        )}
                                      >
                                        {term[locale]}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.vocabTermLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeVocabExample.termText[locale]}</p>
                                  <div className="mt-4">
                                    <SyntaxSnippet
                                      code={activeVocabExample.snippetText}
                                      languageId={topicId}
                                      theme={theme}
                                      label={copy.vocabSnippetPatternsTitle}
                                      copyLabel={copy.copyCode}
                                      copiedLabel={copy.copiedCode}
                                      compact
                                    />
                                  </div>
                                </div>

                                <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{formatCopy.vocabCorrectMeaningLabel}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                    {activeVocabExample.choices.find((choice) => choice.id === activeVocabExample.answer)?.label[locale]}
                                  </p>
                                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.explanationTitle}</p>
                                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeVocabExample.explanation.correct[locale]}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {!isFixErrorMode && !isDebugMode && !isVocabMode && (
                        <>
                          {isHardGuideView && hardGuide ? (
                            <>
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.hardSnapshotTitle}</p>
                                <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{hardGuide.snapshot[locale]}</p>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {hardGuide.checklist.map((item, index) => (
                                    <li key={`${topicId}-hard-check-${index}`}>• {item[locale]}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.deepMarkersTitle}</p>
                                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.deepMarkersNote}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {identifyInsight.signals.map((signal) => (
                                    <span
                                      key={`${topicId}-hard-signal-${signal}`}
                                      className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                    >
                                      {signal}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.falseFriendSplitTitle}</p>
                                <div className="mt-3 grid gap-3">
                                  {hardGuide.falseFriendSplits.map((entry) => (
                                    <div
                                      key={`${topicId}-hard-split-${entry.target}`}
                                      className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-[var(--ink)]">{getLanguageLabel(locale, entry.target)}</p>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenComparison(topicId, entry.target)}
                                          className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                                        >
                                          {copy.compareButton}
                                        </button>
                                      </div>
                                      <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                        {entry.points.map((point, index) => (
                                          <li key={`${topicId}-hard-split-${entry.target}-${index}`}>• {point[locale]}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.workedHardSnippetTitle}</p>
                                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.workedHardSnippetNote}</p>
                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <SyntaxSnippet
                                      code={identifyInsight.snippets[0] ?? copy.compareExampleEmpty}
                                      languageId={topicId}
                                      theme={theme}
                                      label={copy.workedHardSnippetTitle}
                                      copyLabel={copy.copyCode}
                                      copiedLabel={copy.copiedCode}
                                      compact
                                    />
                                  </div>

                                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.deepMarkersTitle}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {identifyInsight.signals.slice(0, 6).map((signal) => (
                                        <span
                                          key={`${topicId}-hard-worked-signal-${signal}`}
                                          className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--muted)]"
                                        >
                                          {signal}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.hardChecklistTitle}</p>
                                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                      {hardGuide.checklist.slice(0, 3).map((item, index) => (
                                        <li key={`${topicId}-hard-worked-check-${index}`}>• {item[locale]}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.spottingRulesTitle}</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink)]">
                                  {guide.spottingRules.map((rule, index) => (
                                    <li key={`${topicId}-rule-${index}`}>• {rule[locale]}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.questionCoverageTitle}</p>
                                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                                  {isHardGuideView ? copy.identifyCoverageHardNote : copy.identifyCoverageEasyNote}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {identifyInsight.signals.map((signal) => (
                                    <span
                                      key={`${topicId}-identify-signal-${signal}`}
                                      className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]"
                                    >
                                      {signal}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className={detailCardClass}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.identifySnippetPatternsTitle}</p>
                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                  {identifyInsight.snippets.map((snippet, index) => (
                                    <SyntaxSnippet
                                      key={`${topicId}-identify-snippet-${index}`}
                                      code={snippet}
                                      languageId={topicId}
                                      theme={theme}
                                      label={copy.identifySnippetPatternsTitle}
                                      copyLabel={copy.copyCode}
                                      copiedLabel={copy.copiedCode}
                                      compact
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-4 lg:grid-cols-2">
                                <div className={detailCardClass}>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.falseFriendsTitle}</p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {guide.falseFriends.map((falseFriend) => (
                                      <button
                                        key={`${topicId}-${falseFriend}`}
                                        type="button"
                                        onClick={() => handleOpenComparison(topicId, falseFriend)}
                                        className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                                      >
                                        {getLanguageLabel(locale, falseFriend)}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className={detailCardClass}>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.miniNotesTitle}</p>
                                  <div className="mt-3 space-y-2 text-sm text-[var(--ink)]">
                                    {guide.miniSnippetNotes.map((note, index) => (
                                      <SyntaxSnippet
                                        key={`${topicId}-note-${index}`}
                                        code={note[locale]}
                                        languageId={topicId}
                                        theme={theme}
                                        label={copy.miniNotesTitle}
                                        copyLabel={copy.copyCode}
                                        copiedLabel={copy.copiedCode}
                                        compact
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </article>
    </motion.section>
  )
}
