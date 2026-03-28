import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  ListMusic,
  Loader2,
  Music,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  StopCircle,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'
import { panelClass } from '../components/layout/panelClasses'
import { extractDominantColor } from '../lib/colorUtils'
import type { AIWorkerRequest, AIWorkerResponse } from '../lib/aiWorker'
import { createPrivacyPreservingRequestInit } from '../lib/signalMask'
import { getThemePreset, SYSTEM_BASE_THEME } from '../lib/musicTheme'
import {
  createPlaylistItem,
  detectSourceType,
  getFilenameTitle,
  getTrackDisplayName,
  normalizeMusicUrl,
  parseOEmbedTitle,
  type MusicDraft,
  type PlaybackMode,
  type PlaylistItem,
  type ThemeModePreference,
  type ThemeMotionMode,
  type ThemePresetId,
} from '../lib/musicTypes'
import musicSettingsArtwork from '../assets/cutscenes/quickstart/music.png'

let aiWorker: Worker | null = null
let aiWorkerPromise: Promise<Worker> | null = null
let latestAnalysisToken = 0
const analysisCache = new Map<string, { mood: string; hex: string }>()

const normalizeAnalysisText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

const getAnalysisCacheKey = (track: Pick<MusicDraft, 'url' | 'title' | 'artist'>) =>
  [normalizeAnalysisText(track.url), normalizeAnalysisText(track.title), normalizeAnalysisText(track.artist)].join('::')

const matchesCurrentDraftUrl = (requestedUrl: string, currentUrl: string) => normalizeMusicUrl(currentUrl) === requestedUrl

const getMusicAiWorker = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Music AI worker is unavailable')
  }

  if (aiWorker) {
    return aiWorker
  }

  if (!aiWorkerPromise) {
    aiWorkerPromise = Promise.resolve(new Worker(new URL('../lib/aiWorker.ts', import.meta.url), { type: 'module' })).then((worker) => {
      aiWorker = worker
      return worker
    })
  }

  return aiWorkerPromise
}

type SettingsPageProps = {
  locale: Locale
  draftTrack: MusicDraft
  activeTrack: PlaylistItem | null
  queue: PlaylistItem[]
  queueIndex: number
  playbackMode: PlaybackMode
  themeMode: ThemeModePreference
  themeMotion: ThemeMotionMode
  themePreset: ThemePresetId
  spectrumSpeed: number
  spectrumIntensity: number
  showDiagnostics: boolean
  musicVolume: number
  sfxVolume: number
  musicIsPlaying: boolean
  onDraftUrlChange: (value: string) => void
  onDraftChange: (patch: Partial<MusicDraft>) => void
  onApplyTrack: (track: PlaylistItem) => Promise<void>
  onAddTrack: (track: PlaylistItem) => void
  onPause: () => void
  onResume: () => Promise<void>
  onStop: () => void
  onPlayTrack: (trackId: string) => Promise<void>
  onNextTrack: () => Promise<void>
  onPreviousTrack: () => Promise<void>
  onRemoveTrack: (trackId: string) => Promise<void>
  onPlaybackModeChange: (mode: PlaybackMode) => void
  onThemeModeChange: (mode: ThemeModePreference) => void
  onThemePresetChange: (presetId: ThemePresetId) => void
  onSpectrumSpeedChange: (value: number) => void
  onSpectrumIntensityChange: (value: number) => void
  onDiagnosticsToggle: (value: boolean) => void
  onMusicVolumeChange: (value: number) => void
  onSfxVolumeChange: (value: number) => void
  onBack: () => void
  onClearSettings: () => void
}

type DiagnosticsState = {
  mood: string
  moodLatency: number
  hex: string
  hexLatency: number
}

const playbackModes: PlaybackMode[] = ['normal', 'loop-one', 'loop-all', 'shuffle']
const themeModes: ThemeModePreference[] = ['auto', 'spectrum']
const themePresets: ThemePresetId[] = ['aurora', 'sunset', 'mono', 'neon', 'mist', 'iris', 'ember']

export function SettingsPage({
  locale,
  draftTrack,
  activeTrack,
  queue,
  queueIndex,
  playbackMode,
  themeMode,
  themePreset,
  spectrumSpeed,
  spectrumIntensity,
  showDiagnostics,
  musicVolume,
  sfxVolume,
  musicIsPlaying,
  onDraftUrlChange,
  onDraftChange,
  onApplyTrack,
  onAddTrack,
  onPause,
  onResume,
  onStop,
  onPlayTrack,
  onNextTrack,
  onPreviousTrack,
  onRemoveTrack,
  onPlaybackModeChange,
  onThemeModeChange,
  onThemePresetChange,
  onSpectrumSpeedChange,
  onSpectrumIntensityChange,
  onDiagnosticsToggle,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onBack,
  onClearSettings,
}: SettingsPageProps) {
  const copy = uiText[locale]
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [metadataMessage, setMetadataMessage] = useState<string | null>(null)
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiEngineStatus, setAiEngineStatus] = useState('')
  const [aiDebugStats, setAiDebugStats] = useState<DiagnosticsState | null>(null)
  const currentDraftUrlRef = useRef(draftTrack.url)
  const isMountedRef = useRef(true)

  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    [],
  )

  useEffect(() => {
    currentDraftUrlRef.current = draftTrack.url
    latestAnalysisToken += 1
    setErrorMessage(null)
    setMetadataMessage(null)
    setIsAiProcessing(false)
    setAiEngineStatus('')
    setAiDebugStats(null)
  }, [draftTrack.url])

  const updateIfMounted = (callback: () => void) => {
    if (isMountedRef.current) {
      callback()
    }
  }

  const currentSourceLabel =
    draftTrack.sourceType === 'youtube'
      ? copy.settingsSourceYouTube
      : draftTrack.sourceType === 'soundcloud'
        ? copy.settingsSourceSoundCloud
        : draftTrack.sourceType === 'direct'
          ? copy.settingsSourceDirect
          : copy.settingsSourceUnknown
  const sourceLabels = {
    direct: copy.settingsSourceDirect,
    youtube: copy.settingsSourceYouTube,
    soundcloud: copy.settingsSourceSoundCloud,
    unknown: copy.settingsSourceUnknown,
  }
  const playbackLabels = {
    normal: copy.settingsPlaybackNormal,
    'loop-one': copy.settingsPlaybackLoopOne,
    'loop-all': copy.settingsPlaybackLoopAll,
    shuffle: copy.settingsPlaybackShuffle,
  }
  const themeModeLabels = {
    auto: copy.settingsThemeModeAuto,
    spectrum: copy.settingsThemeModeSpectrum,
  }
  const themePresetLabels = {
    aurora: copy.settingsThemePresetAurora,
    sunset: copy.settingsThemePresetSunset,
    mono: copy.settingsThemePresetMono,
    neon: copy.settingsThemePresetNeon,
    mist: copy.settingsThemePresetMist,
    iris: copy.settingsThemePresetIris,
    ember: copy.settingsThemePresetEmber,
  }

  const presetTheme = getThemePreset(themePreset)
  const autoThemeBase = draftTrack.aiBaseHex || activeTrack?.aiBaseHex || ''
  const hasTrackPalette = Boolean(autoThemeBase && (draftTrack.aiMood || activeTrack?.aiMood || ''))

  const handleFetchMetadata = async (): Promise<{ title: string; artist: string; thumbnailUrl: string } | null> => {
    const normalizedUrl = normalizeMusicUrl(draftTrack.url)
    const sourceType = detectSourceType(normalizedUrl)
    if ((sourceType !== 'youtube' && sourceType !== 'soundcloud') || !normalizedUrl) return null

    updateIfMounted(() => {
      setIsLoadingMeta(true)
      setMetadataMessage(null)
    })

    try {
      const endpoint =
        sourceType === 'youtube'
          ? `https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`
          : `https://soundcloud.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`
      const response = await fetch(endpoint, createPrivacyPreservingRequestInit())
      if (!response.ok) throw new Error(copy.settingsMetadataError)

      const data = (await response.json()) as { title?: string; author_name?: string; thumbnail_url?: string }
      return {
        title: data.title ?? '',
        artist: data.author_name ?? '',
        thumbnailUrl: data.thumbnail_url ?? '',
      }
    } catch (error) {
      updateIfMounted(() => {
        setMetadataMessage(error instanceof Error ? error.message : copy.settingsMetadataError)
      })
      return null
    } finally {
      updateIfMounted(() => {
        setIsLoadingMeta(false)
      })
    }
  }

  const runAiAnalysis = async (
    titleToAnalyze: string,
    artistToAnalyze: string,
    thumbnailUrl: string,
    analysisToken: number,
    requestedUrl: string,
  ): Promise<{ mood: string; hex: string }> => {
    const cacheKey = getAnalysisCacheKey({
      url: requestedUrl,
      title: titleToAnalyze,
      artist: artistToAnalyze,
    })
    const cachedResult = analysisCache.get(cacheKey)

    if (cachedResult) {
      updateIfMounted(() => {
        setAiDebugStats({ mood: cachedResult.mood, moodLatency: 0, hex: cachedResult.hex, hexLatency: 0 })
        setAiEngineStatus('')
        setIsAiProcessing(false)
      })
      return cachedResult
    }

    updateIfMounted(() => {
      setIsAiProcessing(true)
    })

    let detectedMood = draftTrack.aiMood || 'ambient'
    let detectedHex = draftTrack.aiBaseHex || '#6B8FAD'
    let moodLatency = 0
    let hexLatency = 0
    let hexDone = false
    let moodDone = false

    return new Promise((resolve) => {
      const finalize = () => {
        if (!hexDone || !moodDone) {
          return
        }

        analysisCache.set(cacheKey, { mood: detectedMood, hex: detectedHex })
        const isStale = analysisToken !== latestAnalysisToken || !matchesCurrentDraftUrl(requestedUrl, currentDraftUrlRef.current)
        if (isStale) {
          resolve({ mood: detectedMood, hex: detectedHex })
          return
        }

        updateIfMounted(() => {
          setIsAiProcessing(false)
          setAiEngineStatus('')
          setAiDebugStats({ mood: detectedMood, moodLatency, hex: detectedHex, hexLatency })
        })
        resolve({ mood: detectedMood, hex: detectedHex })
      }

      updateIfMounted(() => {
        setAiEngineStatus(copy.settingsPaletteStatus)
      })

      const colorStart = performance.now()
      const colorPromise = thumbnailUrl ? extractDominantColor(thumbnailUrl) : Promise.resolve(detectedHex)
      colorPromise
        .then((hex) => {
          detectedHex = hex || detectedHex
          hexLatency = Math.round(performance.now() - colorStart)
          hexDone = true
          finalize()
        })
        .catch(() => {
          hexLatency = Math.round(performance.now() - colorStart)
          hexDone = true
          finalize()
        })

      const queryText = `${titleToAnalyze} ${artistToAnalyze} music`.trim()
      if (!queryText) {
        moodDone = true
        finalize()
        return
      }

      getMusicAiWorker()
        .then((worker) => {
          updateIfMounted(() => {
            setAiEngineStatus(copy.settingsModelStatus)
          })

          const listener = (event: MessageEvent<AIWorkerResponse>) => {
            const response = event.data
            if (response.requestId !== analysisToken) {
              return
            }

            if (response.status === 'loading') {
              updateIfMounted(() => {
                setAiEngineStatus(copy.settingsModelLoading)
              })
              return
            }

            if (response.status === 'ready') {
              updateIfMounted(() => {
                setAiEngineStatus(copy.settingsAnalyzingStatus)
              })
              return
            }

            if (response.status === 'complete') {
              detectedMood = response.result || detectedMood
              moodLatency = response.latencyMs || 0
            }

            worker.removeEventListener('message', listener)
            moodDone = true
            finalize()
          }

          worker.addEventListener('message', listener)
          const payload: AIWorkerRequest = { requestId: analysisToken, text: queryText }
          worker.postMessage(payload)
        })
        .catch(() => {
          moodDone = true
          finalize()
        })
    })
  }

  const prepareTrackFromDraft = async () => {
    setErrorMessage(null)
    setMetadataMessage(null)

    const normalizedUrl = normalizeMusicUrl(draftTrack.url)
    const normalizedSourceType = detectSourceType(normalizedUrl)

    if (!normalizedUrl || normalizedSourceType === 'unknown') {
      throw new Error(copy.settingsInvalidUrl)
    }

    const requestedUrl = normalizedUrl
    const analysisToken = ++latestAnalysisToken
    let resolvedTitle = draftTrack.title
    let resolvedArtist = draftTrack.artist
    let thumbnailUrl = ''

    if (normalizedSourceType === 'youtube' || normalizedSourceType === 'soundcloud') {
      const metadata = await handleFetchMetadata()
      if (analysisToken !== latestAnalysisToken || !matchesCurrentDraftUrl(requestedUrl, currentDraftUrlRef.current)) {
        throw new Error(copy.settingsTrackChanged)
      }

      if (metadata) {
        thumbnailUrl = metadata.thumbnailUrl
        const parsed = parseOEmbedTitle(metadata.title)
        if (!resolvedTitle) resolvedTitle = parsed.song || metadata.title
        if (!resolvedArtist) resolvedArtist = metadata.artist || parsed.artist
      }
    } else if (!resolvedTitle) {
      const fallbackTitle = getFilenameTitle(requestedUrl)
      if (fallbackTitle) resolvedTitle = fallbackTitle
    }

    const analysis = await runAiAnalysis(resolvedTitle, resolvedArtist, thumbnailUrl, analysisToken, requestedUrl)
    if (analysisToken !== latestAnalysisToken || !matchesCurrentDraftUrl(requestedUrl, currentDraftUrlRef.current)) {
      throw new Error(copy.settingsTrackChanged)
    }

    const nextDraft: MusicDraft = {
      url: requestedUrl,
      sourceType: normalizedSourceType,
      title: resolvedTitle,
      artist: resolvedArtist,
      aiMood: analysis.mood,
      aiBaseHex: analysis.hex,
    }

    onDraftChange(nextDraft)
    return createPlaylistItem(nextDraft)
  }

  const handleDraftUrlInput = (value: string) => {
    onDraftUrlChange(value)
  }

  const handleApplyPlay = async () => {
    try {
      const track = await prepareTrackFromDraft()
      await onApplyTrack(track)
    } catch (error) {
      if (error instanceof Error && error.message === copy.settingsTrackChanged) {
        return
      }
      setErrorMessage(error instanceof Error ? error.message : copy.settingsPlayError)
    } finally {
      updateIfMounted(() => {
        setIsAiProcessing(false)
      })
    }
  }

  const handleAddQueue = async () => {
    try {
      const track = await prepareTrackFromDraft()
      onAddTrack(track)
    } catch (error) {
      if (error instanceof Error && error.message === copy.settingsTrackChanged) {
        return
      }
      setErrorMessage(error instanceof Error ? error.message : copy.settingsPlayError)
    } finally {
      updateIfMounted(() => {
        setIsAiProcessing(false)
      })
    }
  }

  const queueCountLabel = `${queue.length} ${copy.settingsQueueCount}`
  const activeThemeLabel = themeMode === 'spectrum' ? copy.settingsThemeModeSpectrum : copy.settingsThemeModeAuto
  const activeThemeDot = themeMode === 'spectrum' ? presetTheme.baseHex : hasTrackPalette ? autoThemeBase : SYSTEM_BASE_THEME.accent

  return (
    <>
      <section className="space-y-6">
      <article className="relative overflow-hidden rounded-[34px] border border-[var(--line-strong)] bg-[var(--surface-strong)]/96 p-6 shadow-[0_28px_54px_rgba(2,14,28,0.22)] backdrop-blur-xl md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          <img
            className="h-full w-full object-cover opacity-[0.32] saturate-[0.92] contrast-[1.04] brightness-[0.88] scale-[1.02]"
            src={musicSettingsArtwork}
            alt=""
            loading="eager"
            decoding="async"
            style={{ objectPosition: '68% 42%' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(4,12,22,0.84)_0%,rgba(4,12,22,0.54)_34%,rgba(4,12,22,0.34)_62%,rgba(4,12,22,0.66)_100%),linear-gradient(180deg,rgba(4,12,22,0.08),rgba(4,12,22,0.3))]" />
        </div>

        <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
              <Music size={16} className="text-[var(--accent)]" />
              {copy.settingsTitle}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] md:text-5xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              {copy.settingsTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.settingsSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            {copy.settingsBackToLanding}
          </button>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.settingsDraftTitle}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.settingsDraftHint}</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {currentSourceLabel}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsUrlLabel}</label>
              <input
                type="url"
                value={draftTrack.url}
                onChange={(event) => handleDraftUrlInput(event.target.value)}
                placeholder={copy.settingsUrlPlaceholder}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                {copy.settingsSourceLabel}: {currentSourceLabel}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsTitleLabel}</label>
                <input
                  type="text"
                  value={draftTrack.title}
                  onChange={(event) => onDraftChange({ title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsArtistLabel}</label>
                <input
                  type="text"
                  value={draftTrack.artist}
                  onChange={(event) => onDraftChange({ artist: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink)]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--accent-soft-2)]/30 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <Sparkles size={16} />
                {copy.settingsThemeModeLabel}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">{copy.settingsThemeHint}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {themeModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onThemeModeChange(mode)}
                    className={clsx(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      themeMode === mode
                        ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                        : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    {themeModeLabels[mode]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsVolumeLabel}</label>
                  <span className="text-xs text-[var(--muted)]">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={musicVolume}
                  onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
                  className="settings-volume-slider mt-3 w-full"
                />
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsSfxVolumeLabel}</p>
                    <span className="text-xs text-[var(--muted)]">{Math.round(sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={sfxVolume}
                    onChange={(event) => onSfxVolumeChange(Number(event.target.value))}
                    className="settings-volume-slider mt-3 w-full"
                    aria-label={copy.settingsSfxVolumeLabel}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsPlaybackModeLabel}</label>
                  <span className="text-xs text-[var(--muted)]">{playbackLabels[playbackMode]}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {playbackModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onPlaybackModeChange(mode)}
                      className={clsx(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                        playbackMode === mode
                          ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                          : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                      )}
                    >
                      {playbackLabels[mode]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsThemePresetLabel}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {themePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onThemePresetChange(preset)}
                      className={clsx(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                        themePreset === preset
                          ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]'
                          : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--surface-hover)]',
                      )}
                    >
                      {themePresetLabels[preset]}
                    </button>
                  ))}
                </div>
              </div>

              {themeMode === 'spectrum' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsSpectrumSpeedLabel}</label>
                      <span className="text-xs text-[var(--muted)]">{spectrumSpeed}s</span>
                    </div>
                    <input
                      type="range"
                      min={75}
                      max={150}
                      step={5}
                      value={spectrumSpeed}
                      onChange={(event) => onSpectrumSpeedChange(Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{copy.settingsSpectrumIntensityLabel}</label>
                      <span className="text-xs text-[var(--muted)]">{Math.round(spectrumIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={1}
                      step={0.05}
                      value={spectrumIntensity}
                      onChange={(event) => onSpectrumIntensityChange(Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {isLoadingMeta && <p className="mt-4 text-xs text-[var(--muted)]">{copy.settingsLoadingMeta}</p>}
          {metadataMessage && <p className="mt-4 text-xs text-rose-300">{metadataMessage}</p>}
          {errorMessage && <p className="mt-4 text-xs text-rose-300">{errorMessage}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApplyPlay}
              disabled={isAiProcessing}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_var(--accent-soft)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:-translate-y-0"
            >
              {isAiProcessing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {copy.settingsApplyPlay}
            </button>
            <button
              type="button"
              onClick={handleAddQueue}
              disabled={isAiProcessing}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              <ListMusic size={16} />
              {copy.settingsAddQueue}
            </button>
            <button
              type="button"
              onClick={musicIsPlaying ? onPause : () => void onResume().catch(() => undefined)}
              disabled={!activeTrack}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              {musicIsPlaying ? <Pause size={16} /> : <Play size={16} />}
              {musicIsPlaying ? copy.settingsPause : copy.settingsResume}
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={!activeTrack}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              <StopCircle size={16} />
              {copy.settingsStop}
            </button>
            <button
              type="button"
              onClick={onClearSettings}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
            >
              <RotateCcw size={16} />
              {copy.settingsClear}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onPreviousTrack().catch(() => undefined)}
              disabled={queue.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              <SkipBack size={14} />
              {copy.settingsPrevious}
            </button>
            <button
              type="button"
              onClick={() => void onNextTrack().catch(() => undefined)}
              disabled={queue.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              <SkipForward size={14} />
              {copy.settingsNext}
            </button>
            <button
              type="button"
              onClick={() => onDiagnosticsToggle(!showDiagnostics)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
            >
              <WandSparkles size={14} />
              {showDiagnostics ? copy.settingsDiagnosticsHide : copy.settingsDiagnosticsShow}
            </button>
          </div>

          {isAiProcessing && (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--accent)]">
              <Sparkles size={14} className="animate-pulse" />
              {aiEngineStatus}
            </div>
          )}
        </article>

        <article className={panelClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.settingsStatusTitle}</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.settingsNowPlaying}</p>
              <p className="mt-2 text-sm text-[var(--ink)]">
                {activeTrack ? getTrackDisplayName(activeTrack) || copy.settingsUnknownTitle : copy.settingsNoActiveTrack}
              </p>
              {activeTrack && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {copy.settingsSourceLabel}: {sourceLabels[activeTrack.sourceType]}
                </p>
              )}
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.settingsThemeStatus}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeThemeDot }} />
                {activeThemeLabel}
              </div>
              <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                {themeMode === 'spectrum' ? copy.settingsThemeSpectrumHint : copy.settingsThemeAutoHint}
              </p>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.settingsQueueTitle}</p>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {queueCountLabel}
                </span>
              </div>
              {queue.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">{copy.settingsQueueEmpty}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {queue.map((track, index) => {
                    const isCurrent = index === queueIndex
                    return (
                      <div
                        key={track.id}
                        className={clsx(
                          'rounded-[18px] border p-3 transition',
                          isCurrent ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)]/30' : 'border-[var(--line)] bg-[var(--surface-soft)]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => void onPlayTrack(track.id).catch(() => undefined)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-sm font-semibold text-[var(--ink)]">{getTrackDisplayName(track) || copy.settingsUnknownTitle}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {track.aiMood ? `${track.aiMood} · ${track.aiBaseHex}` : copy.settingsThemeNone}
                            </p>
                          </button>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                                {musicIsPlaying ? copy.settingsPlayingBadge : copy.settingsSelectedBadge}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => void onRemoveTrack(track.id).catch(() => undefined)}
                              className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                              aria-label={copy.settingsRemove}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {showDiagnostics && aiDebugStats && (
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)]/78 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{copy.settingsDiagnosticsLabel}</p>
                <div className="mt-4 space-y-2 text-xs font-mono text-[var(--muted)]">
                  <div className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]/50 px-2 py-1.5">
                    <span>{copy.settingsDiagnosticsMoodLatency}</span>
                    <span className="font-semibold text-[var(--ink)]">{aiDebugStats.moodLatency} ms</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]/50 px-2 py-1.5">
                    <span>{copy.settingsDiagnosticsColorLatency}</span>
                    <span className="font-semibold text-[var(--ink)]">{aiDebugStats.hexLatency} ms</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]/50 px-2 py-1.5">
                    <span>{copy.settingsDiagnosticsMood}</span>
                    <span className="font-semibold capitalize text-[var(--accent)]">{aiDebugStats.mood}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]/50 px-2 py-1.5">
                    <span>{copy.settingsDiagnosticsColor}</span>
                    <span className="font-semibold uppercase tracking-wider text-[var(--ink)]">{aiDebugStats.hex}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
      </section>
    </>
  )
}
