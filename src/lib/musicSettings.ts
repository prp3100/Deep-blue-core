import {
  coercePlaybackMode,
  coerceThemeModePreference,
  coerceThemeMotionMode,
  coerceThemePresetId,
  createEmptyMusicDraft,
  type MusicDraft,
  type PlaybackMode,
  type PlaylistItem,
  type ThemeModePreference,
  type ThemeMotionMode,
  type ThemePresetId,
} from './musicTypes'

export type MusicSettingsStorage = {
  version: 2
  draftTrack: MusicDraft
  activeTrack: PlaylistItem | null
  queue: PlaylistItem[]
  queueIndex: number
  playbackMode: PlaybackMode
  volume: number
  sfxVolume: number
  themeMode: ThemeModePreference
  themeMotion: ThemeMotionMode
  themePreset: ThemePresetId
  spectrumSpeed: number
  spectrumIntensity: number
  showDiagnostics: boolean
}

type LegacyMusicSettingsStorage = {
  url?: string
  sourceType?: PlaylistItem['sourceType']
  title?: string
  artist?: string
  volume?: number
  sfxVolume?: number
  aiMood?: string
  aiBaseHex?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const createDefaultMusicSettings = (): MusicSettingsStorage => ({
  version: 2,
  draftTrack: createEmptyMusicDraft(),
  activeTrack: null,
  queue: [],
  queueIndex: -1,
  playbackMode: 'normal',
  volume: 0.6,
  sfxVolume: 0.65,
  themeMode: 'auto',
  themeMotion: 'static',
  themePreset: 'aurora',
  spectrumSpeed: 105,
  spectrumIntensity: 0.55,
  showDiagnostics: false,
})

const toPlaylistItem = (value: unknown): PlaylistItem | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const item = value as Partial<PlaylistItem>
  if (typeof item.url !== 'string' || typeof item.sourceType !== 'string') {
    return null
  }

  return {
    id: typeof item.id === 'string' ? item.id : `track-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    url: item.url,
    sourceType: item.sourceType,
    title: typeof item.title === 'string' ? item.title : '',
    artist: typeof item.artist === 'string' ? item.artist : '',
    aiMood: typeof item.aiMood === 'string' ? item.aiMood : '',
    aiBaseHex: typeof item.aiBaseHex === 'string' ? item.aiBaseHex : '',
    addedAt: typeof item.addedAt === 'number' ? item.addedAt : Date.now(),
  }
}

const toQueue = (value: unknown) => (Array.isArray(value) ? value.map(toPlaylistItem).filter((item): item is PlaylistItem => Boolean(item)) : [])

const withQueueConsistency = (settings: MusicSettingsStorage): MusicSettingsStorage => {
  const queue = settings.queue
  let queueIndex = queue.length === 0 ? -1 : clamp(settings.queueIndex, 0, queue.length - 1)
  let activeTrack = queueIndex >= 0 ? queue[queueIndex] : null

  if (settings.activeTrack) {
    const explicitIndex = queue.findIndex((item) => item.id === settings.activeTrack?.id)
    if (explicitIndex >= 0) {
      queueIndex = explicitIndex
      activeTrack = queue[explicitIndex]
    }
  }

  return {
    ...settings,
    activeTrack,
    queueIndex,
    queue,
  }
}

const migrateLegacySettings = (legacy: LegacyMusicSettingsStorage): MusicSettingsStorage => {
  const defaults = createDefaultMusicSettings()
  const url = typeof legacy.url === 'string' ? legacy.url : ''
  const sourceType = legacy.sourceType ?? 'unknown'
  const title = typeof legacy.title === 'string' ? legacy.title : ''
  const artist = typeof legacy.artist === 'string' ? legacy.artist : ''
  const aiMood = typeof legacy.aiMood === 'string' ? legacy.aiMood : ''
  const aiBaseHex = typeof legacy.aiBaseHex === 'string' ? legacy.aiBaseHex : ''
  const volume = typeof legacy.volume === 'number' ? legacy.volume : defaults.volume
  const sfxVolume = typeof legacy.sfxVolume === 'number' ? legacy.sfxVolume : defaults.sfxVolume

  const activeTrack =
    url && sourceType !== 'unknown'
      ? {
          id: `track-${Date.now()}`,
          url,
          sourceType,
          title,
          artist,
          aiMood,
          aiBaseHex,
          addedAt: Date.now(),
        }
      : null

  return withQueueConsistency({
    ...defaults,
    draftTrack: {
      url,
      sourceType,
      title,
      artist,
      aiMood,
      aiBaseHex,
    },
    activeTrack,
    queue: activeTrack ? [activeTrack] : [],
    queueIndex: activeTrack ? 0 : -1,
    volume,
    sfxVolume,
  })
}

export const parseStoredMusicSettings = (storedValue: string | null): MusicSettingsStorage => {
  const defaults = createDefaultMusicSettings()
  if (!storedValue) {
    return defaults
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<MusicSettingsStorage> & LegacyMusicSettingsStorage
    if (parsed.version !== 2) {
      return migrateLegacySettings(parsed)
    }

    return withQueueConsistency({
      ...defaults,
      version: 2,
      draftTrack: {
        ...defaults.draftTrack,
        ...(parsed.draftTrack ?? {}),
      },
      activeTrack: toPlaylistItem(parsed.activeTrack),
      queue: toQueue(parsed.queue),
      queueIndex: typeof parsed.queueIndex === 'number' ? parsed.queueIndex : -1,
      playbackMode: coercePlaybackMode(parsed.playbackMode),
      volume: typeof parsed.volume === 'number' ? clamp(parsed.volume, 0, 1) : defaults.volume,
      sfxVolume: typeof parsed.sfxVolume === 'number' ? clamp(parsed.sfxVolume, 0, 1) : defaults.sfxVolume,
      themeMode: coerceThemeModePreference(parsed.themeMode),
      themeMotion: coerceThemeMotionMode(parsed.themeMotion),
      themePreset: coerceThemePresetId(parsed.themePreset),
      spectrumSpeed: typeof parsed.spectrumSpeed === 'number' ? clamp(parsed.spectrumSpeed, 75, 150) : defaults.spectrumSpeed,
      spectrumIntensity:
        typeof parsed.spectrumIntensity === 'number' ? clamp(parsed.spectrumIntensity, 0.2, 1) : defaults.spectrumIntensity,
      showDiagnostics: Boolean(parsed.showDiagnostics),
    })
  } catch {
    return defaults
  }
}

export const syncQueueState = (queue: PlaylistItem[], queueIndex: number) => ({
  queue,
  queueIndex: queue.length === 0 ? -1 : clamp(queueIndex, 0, queue.length - 1),
  activeTrack: queue.length === 0 ? null : queue[clamp(queueIndex, 0, queue.length - 1)],
})

export const replaceCurrentTrack = (queue: PlaylistItem[], queueIndex: number, item: PlaylistItem) => {
  if (queue.length === 0) {
    return syncQueueState([item], 0)
  }

  const nextQueue = [...queue]
  const safeIndex = clamp(queueIndex, 0, nextQueue.length - 1)
  nextQueue[safeIndex] = item
  return syncQueueState(nextQueue, safeIndex)
}

export const appendTrackToQueue = (queue: PlaylistItem[], queueIndex: number, item: PlaylistItem) =>
  syncQueueState([...queue, item], queueIndex >= 0 ? queueIndex : 0)

export const removeTrackFromQueue = (queue: PlaylistItem[], queueIndex: number, trackId: string) => {
  const removeIndex = queue.findIndex((item) => item.id === trackId)
  if (removeIndex < 0) {
    return syncQueueState(queue, queueIndex)
  }

  const nextQueue = queue.filter((item) => item.id !== trackId)
  let nextIndex = queueIndex
  if (removeIndex < queueIndex) {
    nextIndex -= 1
  } else if (removeIndex === queueIndex) {
    nextIndex = Math.min(queueIndex, nextQueue.length - 1)
  }

  return syncQueueState(nextQueue, nextIndex)
}

export const resolveNextQueueIndex = (queue: PlaylistItem[], queueIndex: number, playbackMode: PlaybackMode) => {
  if (queue.length === 0) {
    return -1
  }

  if (playbackMode === 'loop-one') {
    return clamp(queueIndex, 0, queue.length - 1)
  }

  if (playbackMode === 'shuffle') {
    if (queue.length === 1) {
      return 0
    }

    let nextIndex = queueIndex
    while (nextIndex === queueIndex) {
      nextIndex = Math.floor(Math.random() * queue.length)
    }
    return nextIndex
  }

  if (queueIndex < queue.length - 1) {
    return queueIndex + 1
  }

  return playbackMode === 'loop-all' ? 0 : -1
}

export const resolvePreviousQueueIndex = (queue: PlaylistItem[], queueIndex: number, playbackMode: PlaybackMode) => {
  if (queue.length === 0) {
    return -1
  }

  if (queueIndex > 0) {
    return queueIndex - 1
  }

  return playbackMode === 'loop-all' ? queue.length - 1 : 0
}
