import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Gamepad2,
  Play,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import type { Difficulty, IdentifySessionLengthId, LanguageId, QuizFormatId, QuizTrackId, VocabSessionLengthId } from '../data/quizModels'
import { guidePrimerSections, fixErrorPrimerSections, debugPrimerSections, vocabPrimerSections, trackSettings, trackTopicIds } from '../data/questionBank'
import {
  FIX_ERROR_ALL_CORE_SCOPE,
  FIX_ERROR_ALL_GAME_SCOPE,
  fixErrorSupportedCoreLanguageIds,
  fixErrorSupportedGameLanguageIds,
  type FixErrorScopeId,
} from '../data/fixErrorData'
import {
  DEBUG_ALL_CORE_SCOPE,
  DEBUG_ALL_GAME_SCOPE,
  debugSupportedCoreLanguageIds,
  debugSupportedGameLanguageIds,
  type DebugScopeId,
} from '../data/debugData'
import {
  VOCAB_ALL_CORE_SCOPE,
  VOCAB_ALL_GAME_SCOPE,
  vocabSupportedCoreLanguageIds,
  vocabSupportedGameLanguageIds,
  type VocabScopeId,
} from '../data/vocabData'
import { quizFormatSettings, resolveDifficultyModeSetting } from '../data/quizFormats'
import type { Locale } from '../lib/i18n'
import { getLanguageLabel, uiText } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { panelClass, softSurfaceClass, hoverSurfaceClass } from '../components/layout/panelClasses'
import { screenMotion } from '../components/layout/screenMotion'
import { triggerRipple } from '../lib/ripple'

const trackIcons = {
  core: BookOpen,
  'game-dev': Gamepad2,
} satisfies Record<QuizTrackId, typeof BookOpen>

type MenuPageProps = {
  locale: Locale
  formatCopy: ExtraCopy
  quizFormat: QuizFormatId
  identifyDifficulty: Difficulty
  fixErrorDifficulty: Difficulty
  debugDifficulty: Difficulty
  identifyLength: IdentifySessionLengthId
  vocabDifficulty: Difficulty
  vocabLength: VocabSessionLengthId
  activeTrack: QuizTrackId
  isFixErrorMode: boolean
  isDebugMode: boolean
  isVocabMode: boolean
  fixErrorScope: FixErrorScopeId
  debugScope: DebugScopeId
  vocabScope: VocabScopeId
  currentScopeLabel: string
  currentModeBadge: string
  activeIntroRules: readonly string[]
  trackViewedCount: number
  trackTopicList: LanguageId[]
  viewedGuideIds: LanguageId[]
  onFormatChange: (format: QuizFormatId) => void
  onTrackChange: (track: QuizTrackId) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onIdentifyLengthChange: (length: IdentifySessionLengthId) => void
  onVocabDifficultyChange: (difficulty: Difficulty) => void
  onVocabLengthChange: (length: VocabSessionLengthId) => void
  onFixErrorScopeChange: (scope: FixErrorScopeId) => void
  onDebugScopeChange: (scope: DebugScopeId) => void
  onVocabScopeChange: (scope: VocabScopeId) => void
  onOpenGuide: () => void
  onStartQuiz: () => void
}

export function MenuPage({
  locale,
  formatCopy,
  quizFormat,
  identifyDifficulty,
  fixErrorDifficulty,
  debugDifficulty,
  identifyLength,
  vocabDifficulty,
  vocabLength,
  activeTrack,
  isFixErrorMode,
  isDebugMode,
  isVocabMode,
  fixErrorScope,
  debugScope,
  vocabScope,
  currentScopeLabel,
  currentModeBadge,
  activeIntroRules,
  trackViewedCount,
  trackTopicList,
  viewedGuideIds,
  onFormatChange,
  onTrackChange,
  onDifficultyChange,
  onIdentifyLengthChange,
  onVocabDifficultyChange,
  onVocabLengthChange,
  onFixErrorScopeChange,
  onDebugScopeChange,
  onVocabScopeChange,
  onOpenGuide,
  onStartQuiz,
}: MenuPageProps) {
  const copy = uiText[locale]
  const formatConfig = quizFormatSettings[quizFormat]
  const currentTrack = trackSettings[activeTrack]
  const currentFormatLabel = formatConfig.label[locale]
  const isScopeMode = isFixErrorMode || isDebugMode || isVocabMode
  const isIdentifyMode = quizFormat === 'identify-language'
  const isCoreTrack = activeTrack === 'core'
  const supportsLengthSelection = isIdentifyMode || isVocabMode
  const currentModeDifficulty = isIdentifyMode
    ? identifyDifficulty
    : isFixErrorMode
      ? fixErrorDifficulty
      : isDebugMode
        ? debugDifficulty
        : vocabDifficulty
  const identifyQuestionCount = quizFormatSettings['identify-language'].lengths[identifyLength].questionsPerSession
  const vocabQuestionCount = quizFormatSettings.vocab.lengths[vocabLength].questionsPerSession
  const getDifficultyConfig = (value: Difficulty) =>
    isIdentifyMode
      ? resolveDifficultyModeSetting('identify-language', value, identifyQuestionCount)
      : isFixErrorMode
        ? resolveDifficultyModeSetting('fix-error', value, quizFormatSettings['fix-error'].questionsPerSession)
        : isDebugMode
          ? resolveDifficultyModeSetting('debug', value, quizFormatSettings.debug.questionsPerSession)
          : resolveDifficultyModeSetting('vocab', value, vocabQuestionCount)
  const rulesTitle = isScopeMode ? currentFormatLabel : copy.quizTitle
  const currentScope = currentScopeLabel
  const scopeLanguageIds = (isFixErrorMode
    ? isCoreTrack
      ? fixErrorSupportedCoreLanguageIds
      : fixErrorSupportedGameLanguageIds
    : isVocabMode
      ? isCoreTrack
        ? vocabSupportedCoreLanguageIds
        : vocabSupportedGameLanguageIds
      : isCoreTrack
        ? debugSupportedCoreLanguageIds
        : debugSupportedGameLanguageIds) as readonly LanguageId[]
  const scopeAllId = (isFixErrorMode
    ? isCoreTrack
      ? FIX_ERROR_ALL_CORE_SCOPE
      : FIX_ERROR_ALL_GAME_SCOPE
    : isVocabMode
      ? isCoreTrack
        ? VOCAB_ALL_CORE_SCOPE
        : VOCAB_ALL_GAME_SCOPE
      : isCoreTrack
        ? DEBUG_ALL_CORE_SCOPE
        : DEBUG_ALL_GAME_SCOPE) as FixErrorScopeId | DebugScopeId | VocabScopeId
  const scopeAllLabel = isCoreTrack ? formatCopy.allCoreLabel : formatCopy.allGameLabel
  const scopeAllDescription = isCoreTrack ? formatCopy.allCoreDescription : formatCopy.allGameDescription
  const getTrackTopicIds = (topicTrack: QuizTrackId): readonly LanguageId[] =>
    isFixErrorMode
      ? topicTrack === 'core'
        ? fixErrorSupportedCoreLanguageIds
        : fixErrorSupportedGameLanguageIds
      : isVocabMode
        ? topicTrack === 'core'
          ? vocabSupportedCoreLanguageIds
          : vocabSupportedGameLanguageIds
        : isDebugMode
          ? topicTrack === 'core'
            ? debugSupportedCoreLanguageIds
            : debugSupportedGameLanguageIds
          : trackTopicIds[topicTrack]

  const menuStats = [
    {
      label: copy.trackLabel,
      value: currentTrack.label[locale],
      Icon: trackIcons[activeTrack],
    },
    {
      label: formatCopy.formatLabel,
      value: currentFormatLabel,
      Icon: WandSparkles,
    },
    {
      label: isScopeMode ? formatCopy.scopeLabel : formatCopy.profileLabel,
      value: currentScope,
      Icon: Sparkles,
    },
    {
      label: copy.guideProgress,
      value: `${trackViewedCount}/${trackTopicList.length}`,
      Icon: BookOpen,
    },
  ]
  const activeLoreTitle = isIdentifyMode
    ? copy.guidePrimerTitle
    : isVocabMode
      ? formatCopy.vocabGuideTitle
      : isFixErrorMode
        ? copy.fixErrorPrimerTitle
        : copy.debugPrimerTitle
  const activeLoreDescription = isIdentifyMode
    ? copy.guidePrimerDescription
    : isVocabMode
      ? formatCopy.vocabCoreNote
      : isFixErrorMode
        ? copy.fixErrorPrimerDescription
        : copy.debugPrimerDescription
  const activeLoreSections = isIdentifyMode
    ? guidePrimerSections
    : isVocabMode
      ? vocabPrimerSections
      : isFixErrorMode
        ? fixErrorPrimerSections
        : debugPrimerSections

  return (
    <motion.section key="menu" {...screenMotion} className="grid gap-6 xl:gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
      <article className="relative overflow-hidden rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
        <div className="relative z-[1]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
          <Sparkles size={16} className="text-[var(--accent)]" />
          {copy.menuBadge}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {activeIntroRules.map((rule) => (
            <span key={rule} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">
              {rule}
            </span>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">{copy.readyLabel}</p>
        <h1
          className="mt-3 max-w-4xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--ink)] md:text-6xl"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {copy.menuTitle}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg">{copy.menuDescription}</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{copy.readyDescription}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {menuStats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-[0_16px_28px_rgba(2,12,24,0.12)]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--surface-strong)] p-2.5 text-[var(--ink)]">
                  <Icon size={16} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.formatLabel}</p>
          <div className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(['identify-language', 'fix-error', 'debug', 'vocab'] as const).map((value) => {
                const config = quizFormatSettings[value]
                const isActive = quizFormat === value
                const badge =
                  value === 'identify-language'
                    ? formatCopy.identifyFormatSummary
                    : value === 'fix-error'
                      ? formatCopy.standardSummary
                      : value === 'vocab'
                        ? formatCopy.vocabSummary
                        : formatCopy.debugSummary

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onFormatChange(value)}
                    className={clsx(
                      'rounded-[28px] border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_20px_var(--accent-soft),0_24px_44px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                        : `${softSurfaceClass} hover:-translate-y-1 ${hoverSurfaceClass}`,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-[var(--ink)]">{config.label[locale]}</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {badge}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{config.description[locale]}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.trackLabel}</p>
          <div className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(['core', 'game-dev'] as const).map((topicTrack) => {
                const config = trackSettings[topicTrack]
                const Icon = trackIcons[topicTrack]
                const isActive = topicTrack === activeTrack
                const availableTopicIds = getTrackTopicIds(topicTrack)
                const viewed = availableTopicIds.filter((topicId) => viewedGuideIds.includes(topicId)).length

                return (
                  <button
                    key={topicTrack}
                    type="button"
                    onClick={() => onTrackChange(topicTrack)}
                    className={clsx(
                      'group rounded-[28px] border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_20px_var(--accent-soft),0_24px_44px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                        : `${softSurfaceClass} hover:-translate-y-1 ${hoverSurfaceClass}`,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl bg-[var(--surface-strong)] p-3 text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <Icon size={18} />
                      </div>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {config.badge[locale]}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-[var(--ink)]">{config.label[locale]}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{config.description[locale]}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      <span>
                        {copy.viewedGuides}: {viewed}/{availableTopicIds.length}
                      </span>
                      <span className="transition group-hover:translate-x-0.5">{currentModeBadge}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.profileLabel}</p>
          <div className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(['easy', 'hard'] as const).map((value) => {
                const config = getDifficultyConfig(value)
                const isActive = currentModeDifficulty === value

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => ((isIdentifyMode || isFixErrorMode || isDebugMode) ? onDifficultyChange(value) : onVocabDifficultyChange(value))}
                    className={clsx(
                      'rounded-[28px] border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_20px_var(--accent-soft),0_24px_44px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                        : `${softSurfaceClass} hover:-translate-y-1 ${hoverSurfaceClass}`,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-[var(--ink)]">{config.label[locale]}</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {config.badge[locale]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{config.description[locale]}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {supportsLengthSelection && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.lengthLabel}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(['short', 'standard'] as const).map((value) => {
                const config = isIdentifyMode ? quizFormatSettings['identify-language'].lengths[value] : quizFormatSettings.vocab.lengths[value]
                const isActive = isIdentifyMode ? identifyLength === value : vocabLength === value

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => (isIdentifyMode ? onIdentifyLengthChange(value) : onVocabLengthChange(value))}
                    className={clsx(
                      'rounded-[28px] border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_20px_var(--accent-soft),0_24px_44px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                        : `${softSurfaceClass} hover:-translate-y-1 ${hoverSurfaceClass}`,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-[var(--ink)]">{config.label[locale]}</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {config.badge[locale]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{config.description[locale]}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isScopeMode && (
          <div className="mt-8">
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    isFixErrorMode
                      ? onFixErrorScopeChange(scopeAllId as FixErrorScopeId)
                      : isVocabMode
                        ? onVocabScopeChange(scopeAllId as VocabScopeId)
                        : onDebugScopeChange(scopeAllId as DebugScopeId)
                  }
                  className={clsx(
                    'rounded-[24px] border p-4 text-left transition-all duration-300',
                    (isFixErrorMode ? fixErrorScope === scopeAllId : isVocabMode ? vocabScope === scopeAllId : debugScope === scopeAllId)
                      ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_16px_var(--accent-soft),0_18px_36px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                      : `${softSurfaceClass} hover:-translate-y-0.5 ${hoverSurfaceClass}`,
                  )}
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{scopeAllLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{scopeAllDescription}</p>
                </button>

                {scopeLanguageIds.map((languageId) => (
                  <button
                    key={languageId}
                    type="button"
                    onClick={() =>
                      isFixErrorMode
                        ? onFixErrorScopeChange(languageId as FixErrorScopeId)
                        : isVocabMode
                          ? onVocabScopeChange(languageId as VocabScopeId)
                          : onDebugScopeChange(languageId as DebugScopeId)
                    }
                    className={clsx(
                      'rounded-[24px] border p-4 text-left transition-all duration-300',
                      (isFixErrorMode ? fixErrorScope === languageId : isVocabMode ? vocabScope === languageId : debugScope === languageId)
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_16px_var(--accent-soft),0_18px_36px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                        : `${softSurfaceClass} hover:-translate-y-0.5 ${hoverSurfaceClass}`,
                    )}
                  >
                    <p className="text-sm font-semibold text-[var(--ink)] break-words">{getLanguageLabel(locale, languageId)}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)] break-words">{formatCopy.singleCoreDescription}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={(event) => {
              triggerRipple(event)
              onStartQuiz()
            }}
            className="cta-ripple inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_var(--accent-soft),0_22px_38px_rgba(2,14,28,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_32px_var(--accent-soft),0_26px_44px_rgba(2,14,28,0.26)] animate-[pulse-glow_2.5s_ease-in-out_infinite]"
          >
            <Play size={16} />
            {copy.skipToQuiz}
          </button>
          <button
            type="button"
            onClick={(event) => {
              triggerRipple(event)
              onOpenGuide()
            }}
            className="cta-ripple inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            <BookOpen size={16} />
            {copy.openGuideBook}
          </button>
        </div>
        </div>
      </article>

      <div className="grid gap-6 self-start content-start">
        <article className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.readyLabel}</p>
              <p className="mt-1 text-sm text-[var(--ink)]">{copy.readyDescription}</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/85 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {currentModeBadge}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-2">
            {[
              { label: copy.trackLabel, value: currentTrack.label[locale], Icon: BookOpen },
              { label: copy.timeLeft, value: `${formatConfig.questionTimeLimitSeconds}s`, Icon: Clock3 },
              { label: copy.guideProgress, value: `${trackViewedCount}/${trackTopicList.length}`, Icon: Sparkles },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--accent-soft-2)] p-2.5 text-[var(--accent-2)]">
                    <Icon size={16} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[26px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.1),rgba(var(--accent-2-rgb),0.08))] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{rulesTitle}</p>
            <div className="mt-4 space-y-3">
              {activeIntroRules.slice(0, 3).map((rule) => (
                <div key={rule} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-strong)]/72 px-4 py-3">
                  <ArrowRight size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <p className="text-sm leading-7 text-[var(--ink)]">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className={panelClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--accent)]">
              <WandSparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{activeLoreTitle}</p>
              <p className="mt-1 text-sm text-[var(--ink)]">{activeLoreDescription}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {activeLoreSections.map((section) => (
              <div key={section.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{section.marker}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{section.title[locale]}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{section.description[locale]}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </motion.section>
  )
}
