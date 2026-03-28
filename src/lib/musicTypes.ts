import { isHostnameMatch, sanitizeNetworkUrl } from './signalMask'

export type MusicSourceType = 'youtube' | 'soundcloud' | 'spotify' | 'unknown'

export type PlaybackMode = 'normal' | 'loop-one' | 'loop-all' | 'shuffle'

export type ThemeMotionMode = 'static' | 'spectrum'

export type ThemeModePreference = 'auto' | 'spectrum'

export type ThemePresetId = 'aurora' | 'sunset' | 'mono' | 'neon' | 'mist' | 'iris' | 'ember'

export type MusicDraft = {
  url: string
  sourceType: MusicSourceType
  title: string
  artist: string
  aiMood: string
  aiBaseHex: string
}

export type PlaylistItem = {
  id: string
  url: string
  sourceType: MusicSourceType
  title: string
  artist: string
  aiMood: string
  aiBaseHex: string
  addedAt: number
}

const YOUTUBE_HOSTNAMES = ['youtube.com', 'youtu.be', 'youtube-nocookie.com']
const SOUNDCLOUD_HOSTNAMES = ['soundcloud.com', 'sndcdn.com']
const SPOTIFY_HOSTNAMES = ['open.spotify.com', 'spotify.com']
const SPOTIFY_ENTITY_TYPES = new Set(['track', 'album', 'playlist', 'artist', 'episode', 'show'])

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `track-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

export const createEmptyMusicDraft = (): MusicDraft => ({
  url: '',
  sourceType: 'unknown',
  title: '',
  artist: '',
  aiMood: '',
  aiBaseHex: '',
})

export const normalizeMusicUrl = (url: string) => sanitizeNetworkUrl(url, { allowHttpLoopback: true })

const getParsedMusicUrl = (url: string) => {
  const normalized = normalizeMusicUrl(url)
  if (!normalized) {
    return null
  }

  try {
    return new URL(normalized)
  } catch {
    return null
  }
}

export const detectSourceType = (url: string): MusicSourceType => {
  const parsed = getParsedMusicUrl(url)
  if (!parsed) return 'unknown'
  if (isHostnameMatch(parsed.hostname, YOUTUBE_HOSTNAMES)) return 'youtube'
  if (isHostnameMatch(parsed.hostname, SOUNDCLOUD_HOSTNAMES)) return 'soundcloud'
  if (getSpotifyUri(url)) return 'spotify'
  return 'unknown'
}

export const getYouTubeId = (url: string) => {
  const parsed = getParsedMusicUrl(url)
  if (!parsed || !isHostnameMatch(parsed.hostname, YOUTUBE_HOSTNAMES)) {
    return null
  }

  try {
    if (isHostnameMatch(parsed.hostname, ['youtu.be'])) return parsed.pathname.replace('/', '')
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v')
    const paths = parsed.pathname.split('/')
    const embedIndex = paths.findIndex((segment) => segment === 'embed' || segment === 'shorts')
    if (embedIndex >= 0 && paths[embedIndex + 1]) return paths[embedIndex + 1]
  } catch {
    return null
  }

  return null
}

export const getFilenameTitle = (url: string) => {
  const parsed = getParsedMusicUrl(url)
  if (!parsed) {
    return ''
  }

  const lastSegment = parsed.pathname.split('/').pop() ?? ''
  return lastSegment ? decodeURIComponent(lastSegment) : ''
}

export const getSpotifyUri = (url: string) => {
  const parsed = getParsedMusicUrl(url)
  if (!parsed || !isHostnameMatch(parsed.hostname, SPOTIFY_HOSTNAMES)) {
    return null
  }

  const segments = parsed.pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)

  const normalizedSegments = segments[0]?.toLowerCase().startsWith('intl-') ? segments.slice(1) : segments
  const entitySegments = normalizedSegments[0]?.toLowerCase() === 'embed' ? normalizedSegments.slice(1) : normalizedSegments
  const entityType = entitySegments[0]?.toLowerCase()
  const entityId = entitySegments[1]
  if (!entityType || !entityId || !SPOTIFY_ENTITY_TYPES.has(entityType)) {
    return null
  }

  return `spotify:${entityType}:${entityId}`
}

export const parseOEmbedTitle = (title: string) => {
  const parts = title.split(' - ')
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), song: parts.slice(1).join(' - ').trim() }
  }

  return { artist: '', song: title }
}

export const createPlaylistItem = (draft: MusicDraft): PlaylistItem => ({
  id: createId(),
  url: normalizeMusicUrl(draft.url),
  sourceType: detectSourceType(draft.url),
  title: draft.title,
  artist: draft.artist,
  aiMood: draft.aiMood,
  aiBaseHex: draft.aiBaseHex,
  addedAt: Date.now(),
})

export const getTrackDisplayName = (track: Pick<PlaylistItem, 'title' | 'artist'>) => {
  if (track.title && track.artist) {
    return `${track.title} · ${track.artist}`
  }

  return track.title || track.artist || ''
}

export const coercePlaybackMode = (value: unknown): PlaybackMode =>
  value === 'loop-one' || value === 'loop-all' || value === 'shuffle' ? value : 'normal'

export const coerceThemeMotionMode = (value: unknown): ThemeMotionMode => (value === 'spectrum' ? 'spectrum' : 'static')

export const coerceThemeModePreference = (value: unknown): ThemeModePreference => (value === 'spectrum' ? 'spectrum' : 'auto')

export const coerceThemePresetId = (value: unknown): ThemePresetId =>
  value === 'sunset' || value === 'mono' || value === 'neon' || value === 'mist' || value === 'iris' || value === 'ember'
    ? value
    : 'aurora'
