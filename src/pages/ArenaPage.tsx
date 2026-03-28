import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { BookOpen, ExternalLink, Gamepad2, KeyRound, Loader2, RefreshCcw, Swords, Timer, WandSparkles, type LucideIcon } from 'lucide-react'
import arenaHeroArtwork from '../assets/cutscenes/quickstart/arena-hero.jpg'
import type { ArenaModeId, IdentifySessionLengthId, LanguageId, QuizFormatId, QuizTrackId, VocabSessionLengthId } from '../data/quizModels'
import { quizFormatSettings, resolveArenaModeSetting } from '../data/quizFormats'
import { trackSettings } from '../data/questionBank'
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
import {
  canDiscoverArenaModels,
  discoverArenaModels,
  getArenaModelTag,
  type ArenaAiProviderDefinition,
  type ArenaAiProviderId,
  type ArenaDiscoveredModel,
  type ArenaModelTag,
} from '../lib/aiProviders'
import type { Locale } from '../lib/i18n'
import { getLanguageLabel, uiText } from '../lib/i18n'
import type { ExtraCopy } from '../lib/extraCopy'
import { panelClass, softSurfaceClass, hoverSurfaceClass } from '../components/layout/panelClasses'

const MODEL_DISCOVERY_TIMEOUT_MS = 6500

type ArenaPageProps = {
  locale: Locale
  formatCopy: ExtraCopy
  baseFormat: QuizFormatId
  track: QuizTrackId
  identifyMode: ArenaModeId
  fixErrorMode: ArenaModeId
  debugMode: ArenaModeId
  identifyLength: IdentifySessionLengthId
  vocabMode: ArenaModeId
  vocabLength: VocabSessionLengthId
  fixErrorScope: FixErrorScopeId
  debugScope: DebugScopeId
  vocabScope: VocabScopeId
  provider: ArenaAiProviderDefinition
  providerOptions: ArenaAiProviderDefinition[]
  apiKey: string
  apiBaseUrl: string
  extraFieldValue: string
  modelId: string
  resolvedBaseUrl: string
  resolvedModelId: string
  formError: string | null
  onBaseFormatChange: (format: QuizFormatId) => void
  onTrackChange: (track: QuizTrackId) => void
  onIdentifyModeChange: (mode: ArenaModeId) => void
  onFixErrorModeChange: (mode: ArenaModeId) => void
  onDebugModeChange: (mode: ArenaModeId) => void
  onIdentifyLengthChange: (value: IdentifySessionLengthId) => void
  onVocabModeChange: (value: ArenaModeId) => void
  onVocabLengthChange: (value: VocabSessionLengthId) => void
  onFixErrorScopeChange: (scope: FixErrorScopeId) => void
  onDebugScopeChange: (scope: DebugScopeId) => void
  onVocabScopeChange: (scope: VocabScopeId) => void
  onProviderChange: (providerId: ArenaAiProviderId) => void
  onApiBaseUrlChange: (value: string) => void
  onExtraFieldChange: (value: string) => void
  onApiKeyChange: (value: string) => void
  onClearKey: () => void
  onModelChange: (value: string) => void
  onStartMatch: () => void
  onBack: () => void
}

const trackIcons = {
  core: BookOpen,
  'game-dev': Gamepad2,
} satisfies Record<QuizTrackId, typeof BookOpen>

type SelectionCardProps = {
  title: string
  description: string
  badge: string
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
}

function SelectionCard({ title, description, badge, icon: Icon, isActive, onClick }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex min-h-[168px] h-full flex-col justify-between rounded-[24px] border p-4 text-left transition-all duration-300',
        isActive
          ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_16px_var(--accent-soft),0_20px_36px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
          : `${softSurfaceClass} hover:-translate-y-0.5 ${hoverSurfaceClass}`,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-[var(--surface-strong)] p-2.5 text-[var(--ink)]">
          <Icon size={16} />
        </div>
        <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          {badge}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-base font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
    </button>
  )
}

type SelectableArenaModel = ArenaDiscoveredModel & {
  source: 'discovered' | 'preset'
}

export function ArenaPage({
  locale,
  formatCopy,
  baseFormat,
  track,
  identifyMode,
  fixErrorMode,
  debugMode,
  identifyLength,
  vocabMode,
  vocabLength,
  fixErrorScope,
  debugScope,
  vocabScope,
  provider,
  providerOptions,
  apiKey,
  apiBaseUrl,
  extraFieldValue,
  modelId,
  resolvedBaseUrl,
  resolvedModelId,
  formError,
  onBaseFormatChange,
  onTrackChange,
  onIdentifyModeChange,
  onFixErrorModeChange,
  onDebugModeChange,
  onIdentifyLengthChange,
  onVocabModeChange,
  onVocabLengthChange,
  onFixErrorScopeChange,
  onDebugScopeChange,
  onVocabScopeChange,
  onProviderChange,
  onApiBaseUrlChange,
  onExtraFieldChange,
  onApiKeyChange,
  onClearKey,
  onModelChange,
  onStartMatch,
  onBack,
}: ArenaPageProps) {
  const copy = uiText[locale]
  const discoveryCacheRef = useRef(new Map<string, ArenaDiscoveredModel[]>())
  const [discoveredModels, setDiscoveredModels] = useState<ArenaDiscoveredModel[]>([])
  const [discoveredModelKey, setDiscoveredModelKey] = useState('')
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelLoadError, setModelLoadError] = useState<string | null>(null)
  const [modelLoadErrorKey, setModelLoadErrorKey] = useState('')
  const [modelRefreshNonce, setModelRefreshNonce] = useState(0)
  const isIdentifyMode = baseFormat === 'identify-language'
  const isFixErrorMode = baseFormat === 'fix-error'
  const isDebugMode = baseFormat === 'debug'
  const isVocabMode = baseFormat === 'vocab'
  const formatConfig = quizFormatSettings[baseFormat]
  const isCoreTrack = track === 'core'
  const currentArenaMode = isIdentifyMode
    ? identifyMode
    : isFixErrorMode
      ? fixErrorMode
      : isDebugMode
        ? debugMode
        : vocabMode
  const identifyQuestionCount = quizFormatSettings['identify-language'].lengths[identifyLength].questionsPerSession
  const vocabQuestionCount = quizFormatSettings.vocab.lengths[vocabLength].questionsPerSession
  const getArenaModeConfig = (value: ArenaModeId) =>
    isIdentifyMode
      ? resolveArenaModeSetting('identify-language', value, identifyQuestionCount)
      : isFixErrorMode
        ? resolveArenaModeSetting('fix-error', value, quizFormatSettings['fix-error'].questionsPerSession)
        : isDebugMode
          ? resolveArenaModeSetting('debug', value, quizFormatSettings.debug.questionsPerSession)
          : resolveArenaModeSetting('vocab', value, vocabQuestionCount)
  const scopeLanguageIds = (isFixErrorMode
    ? isCoreTrack
      ? fixErrorSupportedCoreLanguageIds
      : fixErrorSupportedGameLanguageIds
    : isDebugMode
      ? isCoreTrack
        ? debugSupportedCoreLanguageIds
        : debugSupportedGameLanguageIds
      : isCoreTrack
        ? vocabSupportedCoreLanguageIds
        : vocabSupportedGameLanguageIds) as readonly LanguageId[]
  const scopeAllId = (isFixErrorMode
    ? isCoreTrack
      ? FIX_ERROR_ALL_CORE_SCOPE
      : FIX_ERROR_ALL_GAME_SCOPE
    : isDebugMode
      ? isCoreTrack
        ? DEBUG_ALL_CORE_SCOPE
        : DEBUG_ALL_GAME_SCOPE
      : isCoreTrack
        ? VOCAB_ALL_CORE_SCOPE
        : VOCAB_ALL_GAME_SCOPE) as FixErrorScopeId | DebugScopeId | VocabScopeId
  const scopeAllLabel = isCoreTrack ? formatCopy.allCoreLabel : formatCopy.allGameLabel
  const scopeAllDescription = isCoreTrack ? formatCopy.allCoreDescription : formatCopy.allGameDescription
  const providerTierLabel = provider.tier === 'verified' ? copy.arenaProviderTierVerified : copy.arenaProviderTierBeta
  const providerBrowserLabel = provider.browserSupport === 'good' ? copy.arenaProviderBrowserGood : copy.arenaProviderBrowserMixed
  const providerRuntimeHint = provider.tier === 'verified' ? copy.arenaProviderVerifiedHint : copy.arenaProviderBetaHint
  const canAutoDiscoverModels =
    provider.supportsModelDiscovery &&
    canDiscoverArenaModels({
      providerId: provider.id,
      apiBaseUrl,
      extraFieldValue,
      apiKey,
    })
  const discoveryKey = `${provider.id}::${apiBaseUrl.trim()}::${extraFieldValue.trim()}::${apiKey.trim()}`
  const effectiveDiscoveredModels = useMemo(
    () => (canAutoDiscoverModels && discoveredModelKey === discoveryKey ? discoveredModels : []),
    [canAutoDiscoverModels, discoveredModelKey, discoveredModels, discoveryKey],
  )
  const effectiveModelLoadError = canAutoDiscoverModels && modelLoadErrorKey === discoveryKey ? modelLoadError : null
  const effectiveIsLoadingModels = canAutoDiscoverModels ? isLoadingModels : false
  const modelOptions = useMemo<SelectableArenaModel[]>(() => {
    const base: SelectableArenaModel[] = (
      effectiveDiscoveredModels.length > 0
        ? effectiveDiscoveredModels.map((model) => ({ ...model, source: 'discovered' as const }))
        : provider.recommendedModels.map((candidate) => ({
            ...candidate,
            tag: getArenaModelTag(candidate.id, candidate.label),
            source: 'preset' as const,
          }))
    ).slice()

    if (modelId.trim() && !base.some((candidate) => candidate.id === modelId)) {
      base.unshift({
        id: modelId,
        label: modelId,
        description: {
          th: 'โมเดลที่เก็บไว้จากค่าก่อนหน้า',
          en: 'Model preserved from previous settings',
        },
        tag: getArenaModelTag(modelId, modelId),
        source: 'preset',
      })
    }

    return base
  }, [effectiveDiscoveredModels, modelId, provider.recommendedModels])
  const selectedModel = modelOptions.find((candidate) => candidate.id === modelId) ?? null
  const modelTagLabel = (tag: ArenaModelTag) => {
    if (tag === 'reasoning') return copy.arenaModelTagReasoning
    if (tag === 'coding') return copy.arenaModelTagCoding
    if (tag === 'preview') return copy.arenaModelTagPreview
    return copy.arenaModelTagGeneral
  }
  const canStart =
    provider.supportsArena &&
    Boolean(apiKey.trim()) &&
    Boolean(resolvedModelId.trim()) &&
    Boolean(resolvedBaseUrl.trim()) &&
    (!provider.requiresExtraField || Boolean(extraFieldValue.trim()))

  useEffect(() => {
    if (!provider.supportsModelDiscovery) {
      return
    }

    if (!canAutoDiscoverModels) {
      return
    }

    const useCachedResult = modelRefreshNonce === 0 && discoveryCacheRef.current.has(discoveryKey)
    if (useCachedResult) {
      Promise.resolve().then(() => {
        setDiscoveredModels(discoveryCacheRef.current.get(discoveryKey) ?? [])
        setDiscoveredModelKey(discoveryKey)
        setModelLoadError(null)
        setModelLoadErrorKey('')
        setIsLoadingModels(false)
      })
      return
    }

    const controller = new AbortController()
    let timedOut = false
    const deferredStartId = window.setTimeout(() => {
      setIsLoadingModels(true)
      setModelLoadError(null)
      const requestTimeoutId = window.setTimeout(() => {
        timedOut = true
        controller.abort()
      }, MODEL_DISCOVERY_TIMEOUT_MS)

      void discoverArenaModels({
        config: {
          providerId: provider.id,
          apiBaseUrl,
          extraFieldValue,
          apiKey,
        },
        signal: controller.signal,
      })
        .then((models) => {
          discoveryCacheRef.current.set(discoveryKey, models)
          setDiscoveredModels(models)
          setDiscoveredModelKey(discoveryKey)
          setModelLoadError(null)
          setModelLoadErrorKey('')
        })
        .catch((error) => {
          if (controller.signal.aborted && !timedOut) {
            return
          }
          setDiscoveredModelKey('')
          setModelLoadError(
            timedOut ? copy.arenaModelLoadTimeout : error instanceof Error ? error.message : copy.arenaModelLoadError,
          )
          setModelLoadErrorKey(discoveryKey)
        })
        .finally(() => {
          window.clearTimeout(requestTimeoutId)
          if (!controller.signal.aborted || timedOut) {
            setIsLoadingModels(false)
          }
        })
    }, 360)

    return () => {
      controller.abort()
      window.clearTimeout(deferredStartId)
    }
  }, [
    apiBaseUrl,
    apiKey,
    canAutoDiscoverModels,
    copy.arenaModelLoadError,
    copy.arenaModelLoadTimeout,
    discoveryKey,
    extraFieldValue,
    modelRefreshNonce,
    provider.id,
    provider.supportsModelDiscovery,
  ])

  return (
    <section className="space-y-6">
      <article className="relative overflow-hidden rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          <img
            className="h-full w-full object-cover opacity-[0.4] saturate-[0.94] contrast-[1.05] brightness-[0.92] scale-[1.02]"
            src={arenaHeroArtwork}
            alt=""
            loading="eager"
            decoding="async"
            style={{ objectPosition: '50% 38%' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,12,22,0.74)_0%,rgba(4,12,22,0.5)_36%,rgba(4,12,22,0.32)_64%,rgba(4,12,22,0.6)_100%),linear-gradient(180deg,rgba(4,12,22,0.08),rgba(4,12,22,0.24))]" />
        </div>

        <div className="relative z-[1]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
            <Swords size={16} className="text-[var(--accent)]" />
            {copy.arenaTitle}
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] md:text-5xl"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {copy.arenaTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.arenaSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              {copy.arenaBackToPrevious}
            </button>
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[34px] border border-[var(--line)] bg-[var(--surface)]/92 p-6 shadow-[0_24px_46px_rgba(2,14,28,0.18)] backdrop-blur-xl md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.formatLabel}</p>
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {(['identify-language', 'fix-error', 'debug', 'vocab'] as const).map((value) => {
              const config = quizFormatSettings[value]
              const isActive = baseFormat === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onBaseFormatChange(value)}
                  className={clsx(
                    'rounded-[24px] border p-4 text-left transition-all duration-300',
                    isActive
                      ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_16px_var(--accent-soft),0_20px_36px_rgba(2,12,24,0.22)] ring-1 ring-[var(--accent)]/20 scale-[1.02]'
                      : `${softSurfaceClass} hover:-translate-y-0.5 ${hoverSurfaceClass}`,
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-[var(--ink)]">{config.label[locale]}</p>
                    <WandSparkles size={16} className="text-[var(--accent)]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{config.description[locale]}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.trackLabel}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(['core', 'game-dev'] as const).map((value) => {
                const config = trackSettings[value]
                const Icon = trackIcons[value]
                const isActive = track === value
                return (
                  <SelectionCard
                    key={value}
                    title={config.label[locale]}
                    description={config.description[locale]}
                    badge={config.badge[locale]}
                    icon={Icon}
                    isActive={isActive}
                    onClick={() => onTrackChange(value)}
                  />
                )
              })}
            </div>
          </div>

          {(isIdentifyMode || isFixErrorMode || isDebugMode || isVocabMode) && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.modeLabel}</p>
                <div className="mt-3 grid gap-3">
                  {(['easy', 'hard', 'fair-for-human'] as const).map((value) => {
                    const config = getArenaModeConfig(value)
                    const isActive = currentArenaMode === value
                    return (
                      <SelectionCard
                        key={value}
                        title={config.label[locale]}
                        description={config.description[locale]}
                        badge={config.badge[locale]}
                        icon={WandSparkles}
                        isActive={isActive}
                        onClick={() => {
                          if (isIdentifyMode) {
                            onIdentifyModeChange(value)
                            return
                          }

                          if (isFixErrorMode) {
                            onFixErrorModeChange(value)
                            return
                          }

                          if (isDebugMode) {
                            onDebugModeChange(value)
                            return
                          }

                          onVocabModeChange(value)
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {(isIdentifyMode || isVocabMode) && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.lengthLabel}</p>
                <div className="mt-3 grid gap-3">
                  {(['short', 'standard'] as const).map((value) => {
                    const config = isIdentifyMode ? quizFormatSettings['identify-language'].lengths[value] : quizFormatSettings.vocab.lengths[value]
                    const isActive = isIdentifyMode ? identifyLength === value : vocabLength === value
                    return (
                      <SelectionCard
                        key={value}
                        title={config.label[locale]}
                        description={config.description[locale]}
                        badge={config.badge[locale]}
                        icon={Timer}
                        isActive={isActive}
                        onClick={() => (isIdentifyMode ? onIdentifyLengthChange(value) : onVocabLengthChange(value))}
                      />
                    )
                  })}
                </div>
                </div>
              )}
            </div>
          )}

          {(isFixErrorMode || isDebugMode || isVocabMode) && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{formatCopy.scopeLabel}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    isFixErrorMode
                      ? onFixErrorScopeChange(scopeAllId as FixErrorScopeId)
                      : isDebugMode
                        ? onDebugScopeChange(scopeAllId as DebugScopeId)
                        : onVocabScopeChange(scopeAllId as VocabScopeId)
                  }
                  className={clsx(
                    'rounded-[20px] border p-4 text-left transition-all',
                    (isFixErrorMode ? fixErrorScope === scopeAllId : isDebugMode ? debugScope === scopeAllId : vocabScope === scopeAllId)
                      ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_12px_var(--accent-soft)]'
                      : `${softSurfaceClass} ${hoverSurfaceClass}`,
                  )}
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{scopeAllLabel}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--muted)]">{scopeAllDescription}</p>
                </button>

                {scopeLanguageIds.map((languageId) => (
                  <button
                    key={languageId}
                    type="button"
                    onClick={() =>
                      isFixErrorMode
                        ? onFixErrorScopeChange(languageId as FixErrorScopeId)
                        : isDebugMode
                          ? onDebugScopeChange(languageId as DebugScopeId)
                          : onVocabScopeChange(languageId as VocabScopeId)
                    }
                    className={clsx(
                      'rounded-[20px] border p-4 text-left transition-all',
                      (isFixErrorMode ? fixErrorScope === languageId : isDebugMode ? debugScope === languageId : vocabScope === languageId)
                        ? 'border-[var(--accent)]/40 bg-[var(--surface-strong)] shadow-[0_0_12px_var(--accent-soft)]'
                        : `${softSurfaceClass} ${hoverSurfaceClass}`,
                    )}
                  >
                    <p className="text-sm font-semibold text-[var(--ink)] break-words">{getLanguageLabel(locale, languageId)}</p>
                    <p className="mt-1 text-xs leading-6 text-[var(--muted)]">{formatCopy.singleCoreDescription}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>

        <div className="space-y-6">
          <article className={panelClass}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-2.5 text-[var(--accent)]">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.arenaSetupTitle}</p>
                <p className="mt-1 text-sm text-[var(--ink)]">{copy.arenaSetupSubtitle}</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {copy.arenaProviderLabel}
                </label>
                <select
                  value={provider.id}
                  onChange={(event) => onProviderChange(event.target.value as ArenaAiProviderId)}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)]"
                >
                  {providerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} · {option.tier === 'verified' ? copy.arenaProviderTierVerified : copy.arenaProviderTierBeta}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)]"
                  >
                    <ExternalLink size={13} />
                    {copy.arenaProviderDocs}
                  </a>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {provider.label}
                  </span>
                  <span
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-semibold',
                      provider.tier === 'verified'
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-amber-400/30 bg-amber-500/10 text-amber-200',
                    )}
                  >
                    {providerTierLabel}
                  </span>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {providerBrowserLabel}
                  </span>
                  {provider.supportsArena && (
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {copy.arenaProviderArenaReady}
                    </span>
                  )}
                  {provider.supportsCoach && (
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {copy.arenaProviderCoachReady}
                    </span>
                  )}
                  {provider.requiresExtraField && (
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {copy.arenaProviderExtraFieldRequired}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{provider.note[locale]}</p>
                <div
                  className={clsx(
                    'mt-3 rounded-[20px] border p-3 text-xs leading-6',
                    provider.browserSupport === 'good'
                      ? 'border-emerald-400/20 bg-emerald-500/8 text-emerald-100'
                      : 'border-amber-400/20 bg-amber-500/8 text-amber-100',
                  )}
                >
                  <p>{copy.arenaProviderFrontendHint}</p>
                  <p className="mt-2">{providerRuntimeHint}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {provider.baseUrlLabel[locale]}
                </label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={(event) => onApiBaseUrlChange(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                />
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{copy.arenaBaseUrlHint}</p>
              </div>

              {provider.extraField && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {provider.extraField.label[locale]}
                  </label>
                  <input
                    type="text"
                    value={extraFieldValue}
                    onChange={(event) => onExtraFieldChange(event.target.value)}
                    placeholder={provider.extraField.placeholder[locale]}
                    className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {provider.keyLabel[locale]}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => onApiKeyChange(event.target.value)}
                  placeholder={provider.keyPlaceholder[locale]}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                />
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{copy.arenaKeyWarning}</p>
                <button
                  type="button"
                  onClick={onClearKey}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
                >
                  {copy.arenaClearKey}
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.arenaModelLabel}</p>
                {provider.supportsModelDiscovery && (
                  <button
                    type="button"
                    onClick={() => setModelRefreshNonce((current) => current + 1)}
                    disabled={!canAutoDiscoverModels || effectiveIsLoadingModels}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50"
                  >
                    {effectiveIsLoadingModels ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                    {copy.arenaRefreshModels}
                  </button>
                )}
              </div>
              <select
                value={modelId}
                onChange={(event) => onModelChange(event.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)]"
              >
                {modelOptions.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap items-center gap-2">
                {selectedModel && (
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
                    {modelTagLabel(selectedModel.tag)}
                  </span>
                )}
                {selectedModel && (
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
                    {selectedModel.source === 'discovered' ? copy.arenaLiveModelsReady : copy.arenaPresetModelsFallback}
                  </span>
                )}
              </div>

              <p className="text-xs leading-6 text-[var(--muted)]">{selectedModel?.description[locale] ?? copy.arenaSelectModel}</p>

              {provider.supportsModelDiscovery && (
                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.arenaLoadModels}</p>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                    {canAutoDiscoverModels ? copy.arenaLiveModelsHint : copy.arenaLiveModelsPending}
                  </p>
                  {effectiveIsLoadingModels && <p className="mt-2 text-xs font-semibold text-[var(--accent)]">{copy.arenaLoadingModels}</p>}
                  {effectiveModelLoadError && <p className="mt-2 text-xs text-amber-200">{effectiveModelLoadError}</p>}
                </div>
              )}
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.arenaResolvedConfigLabel}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{resolvedModelId || copy.arenaSelectModel}</p>
                <p className="mt-2 break-all text-xs leading-6 text-[var(--muted)]">{resolvedBaseUrl || copy.arenaMissingBaseUrlError}</p>
              </div>
            </div>

            {formError && <p className="mt-4 text-xs text-rose-300">{formError}</p>}

            <button
              type="button"
              onClick={onStartMatch}
              disabled={!canStart}
              className={clsx(
                'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition',
                canStart
                  ? 'bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[0_0_20px_var(--accent-soft)] hover:-translate-y-0.5'
                  : 'border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]',
              )}
            >
              {copy.arenaStartMatch}
            </button>
          </article>

          <article className={panelClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.readyLabel}</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{formatCopy.formatLabel}</p>
                <p className="mt-2 text-base font-semibold text-[var(--ink)]">{formatConfig.label[locale]}</p>
              </div>
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.trackLabel}</p>
                <p className="mt-2 text-base font-semibold text-[var(--ink)]">{trackSettings[track].label[locale]}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
