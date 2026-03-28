import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MusicSourceType } from './musicTypes'

export type { MusicSourceType } from './musicTypes'

export type MusicPlayerApi = {
  isPlaying: boolean
  source: MusicSourceType
  playYouTube: (videoId: string) => Promise<void>
  playSoundCloud: (url: string) => Promise<void>
  playSpotify: (uri: string) => Promise<void>
  pause: () => void
  resume: () => Promise<void>
  stop: () => void
  setVolume: (value: number) => void
}

type YTPlayerInstance = {
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  setVolume?: (volume: number) => void
}

type YTPlayerEvent = {
  data: number
}

type YTPlayerConstructorOptions = {
  height: string
  width: string
  videoId: string
  playerVars: Record<string, unknown>
  events: {
    onReady?: () => void
    onStateChange?: (event: YTPlayerEvent) => void
  }
}

type SoundCloudWidgetInstance = {
  bind: (eventName: string, handler: () => void) => void
  load: (url: string, options?: { auto_play?: boolean }) => void
  play: () => void
  pause: () => void
  seekTo: (ms: number) => void
  setVolume: (volume: number) => void
}

type SpotifyPlaybackUpdateEvent = {
  data?: {
    isPaused?: boolean
    isBuffering?: boolean
    playingURI?: string
  }
}

type SpotifyEmbedController = {
  loadUri: (spotifyUri: string) => void
  play: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  destroy: () => void
  addListener: (eventName: string, handler: (event: SpotifyPlaybackUpdateEvent) => void) => void
}

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void
}

type YouTubeWindow = Window & {
  YT?: {
    Player?: new (elementId: string | HTMLElement, options: YTPlayerConstructorOptions) => YTPlayerInstance
    PlayerState?: Record<string, number>
  }
  onYouTubeIframeAPIReady?: () => void
  SC?: {
    Widget: (element: HTMLIFrameElement) => SoundCloudWidgetInstance
  }
  SpotifyIframeApi?: SpotifyIframeApi
  onSpotifyIframeApiReady?: (iframeApi: SpotifyIframeApi) => void
}

const loadScript = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document unavailable'))
      return
    }

    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.crossOrigin = 'anonymous'
    script.referrerPolicy = 'no-referrer'
    script.dataset.loaded = 'false'
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })

let ytApiPromise: Promise<void> | null = null
let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null

const loadYouTubeApi = () => {
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window unavailable'))
      return
    }

    const win = window as YouTubeWindow
    if (win.YT?.Player) {
      resolve()
      return
    }

    const originalOnReady = win.onYouTubeIframeAPIReady

    win.onYouTubeIframeAPIReady = () => {
      resolve()
      if (originalOnReady) originalOnReady()
    }

    loadScript('https://www.youtube.com/iframe_api', 'youtube-iframe-api').catch(reject)
  })

  return ytApiPromise
}

const loadSoundCloudApi = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window unavailable'))
      return
    }

    const win = window as YouTubeWindow
    if (win.SC?.Widget) {
      resolve()
      return
    }

    loadScript('https://w.soundcloud.com/player/api.js', 'soundcloud-widget-api')
      .then(() => resolve())
      .catch(reject)
  })

const loadSpotifyApi = () => {
  if (spotifyApiPromise) return spotifyApiPromise

  spotifyApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window unavailable'))
      return
    }

    const win = window as YouTubeWindow
    if (win.SpotifyIframeApi) {
      resolve(win.SpotifyIframeApi)
      return
    }

    const originalOnReady = win.onSpotifyIframeApiReady

    win.onSpotifyIframeApiReady = (iframeApi) => {
      win.SpotifyIframeApi = iframeApi
      resolve(iframeApi)
      originalOnReady?.(iframeApi)
    }

    loadScript('https://open.spotify.com/embed/iframe-api/v1', 'spotify-iframe-api').catch(reject)
  })

  return spotifyApiPromise
}

export const useMusicPlayer = (options: {
  youtubeContainerRef: React.RefObject<HTMLDivElement | null>
  soundcloudContainerRef: React.RefObject<HTMLDivElement | null>
  spotifyContainerRef: React.RefObject<HTMLDivElement | null>
  onEnded?: () => void
}): MusicPlayerApi => {
  const { youtubeContainerRef, soundcloudContainerRef, spotifyContainerRef, onEnded } = options
  const [isPlaying, setIsPlaying] = useState(false)
  const [source, setSource] = useState<MusicSourceType>('unknown')
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null)
  const scWidgetRef = useRef<SoundCloudWidgetInstance | null>(null)
  const spotifyControllerRef = useRef<SpotifyEmbedController | null>(null)
  const volumeRef = useRef(0.6)
  const onEndedRef = useRef(onEnded)

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  const emitEnded = useCallback(() => {
    setIsPlaying(false)
    onEndedRef.current?.()
  }, [])

  const stopAll = useCallback(() => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.stopVideo()
    }
    if (scWidgetRef.current) {
      scWidgetRef.current.pause()
      scWidgetRef.current.seekTo(0)
    }
    if (spotifyControllerRef.current) {
      spotifyControllerRef.current.pause()
      spotifyControllerRef.current.restart()
    }
    setIsPlaying(false)
  }, [])

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value))
    volumeRef.current = next
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(Math.round(next * 100))
    }
    if (scWidgetRef.current) {
      scWidgetRef.current.setVolume(Math.round(next * 100))
    }
  }, [])

  const playYouTube = useCallback(
    async (videoId: string) => {
      stopAll()
      setSource('youtube')
      await loadYouTubeApi()

      const container = youtubeContainerRef.current
      if (!container) {
        throw new Error('YouTube container missing')
      }

      const ytApi = (window as YouTubeWindow).YT
      if (!ytApi?.Player) {
        throw new Error('YouTube API not ready')
      }

      if (!ytPlayerRef.current) {
        const playerState = ytApi.PlayerState ?? {}
        const player = new ytApi.Player(container, {
          height: '0',
          width: '0',
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
          },
          events: {
            onReady: () => {
              ytPlayerRef.current = player
              player.setVolume?.(Math.round(volumeRef.current * 100))
              player.playVideo()
              setIsPlaying(true)
            },
            onStateChange: (event) => {
              const playingState = playerState.PLAYING ?? 1
              const pausedState = playerState.PAUSED ?? 2
              const endedState = playerState.ENDED ?? 0

              if (event.data === playingState) {
                setIsPlaying(true)
              } else if (event.data === pausedState) {
                setIsPlaying(false)
              } else if (event.data === endedState) {
                emitEnded()
              }
            },
          },
        })
      } else {
        ytPlayerRef.current.loadVideoById(videoId)
        ytPlayerRef.current.setVolume?.(Math.round(volumeRef.current * 100))
        ytPlayerRef.current.playVideo()
        setIsPlaying(true)
      }
    },
    [emitEnded, stopAll, youtubeContainerRef],
  )

  const playSoundCloud = useCallback(
    async (url: string) => {
      stopAll()
      setSource('soundcloud')
      await loadSoundCloudApi()

      const container = soundcloudContainerRef.current
      if (!container) {
        throw new Error('SoundCloud container missing')
      }

      let iframe = container.querySelector('iframe')
      if (!iframe) {
        iframe = document.createElement('iframe')
        iframe.width = '0'
        iframe.height = '0'
        iframe.allow = 'autoplay'
        iframe.style.border = '0'
        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true`
        container.appendChild(iframe)
      }

      if (!scWidgetRef.current) {
        scWidgetRef.current = (window as YouTubeWindow).SC!.Widget(iframe)
        scWidgetRef.current.bind('PLAY', () => setIsPlaying(true))
        scWidgetRef.current.bind('PAUSE', () => setIsPlaying(false))
        scWidgetRef.current.bind('FINISH', () => emitEnded())
      }

      scWidgetRef.current.load(url, { auto_play: true })
      scWidgetRef.current.setVolume(Math.round(volumeRef.current * 100))
      scWidgetRef.current.play()
      setIsPlaying(true)
    },
    [emitEnded, stopAll, soundcloudContainerRef],
  )

  const playSpotify = useCallback(
    async (uri: string) => {
      stopAll()
      setSource('spotify')
      const iframeApi = await loadSpotifyApi()

      const container = spotifyContainerRef.current
      if (!container) {
        throw new Error('Spotify container missing')
      }

      if (!spotifyControllerRef.current) {
        container.replaceChildren()
        const mount = document.createElement('div')
        mount.dataset.spotifyEmbedHost = 'true'
        container.appendChild(mount)

        await new Promise<void>((resolve, reject) => {
          const timeoutId = window.setTimeout(() => reject(new Error('Spotify API not ready')), 5000)
          iframeApi.createController(
            mount,
            {
              uri,
              width: '100%',
              height: 152,
            },
            (controller) => {
              window.clearTimeout(timeoutId)
              spotifyControllerRef.current = controller
              controller.addListener('playback_started', () => setIsPlaying(true))
              controller.addListener('playback_update', (event) => {
                const isPaused = Boolean(event.data?.isPaused)
                const isBuffering = Boolean(event.data?.isBuffering)
                setIsPlaying(!isPaused && !isBuffering)
              })
              controller.loadUri(uri)
              controller.play()
              setIsPlaying(true)
              resolve()
            },
          )
        })
        return
      }

      spotifyControllerRef.current.loadUri(uri)
      spotifyControllerRef.current.play()
      setIsPlaying(true)
    },
    [spotifyContainerRef, stopAll],
  )

  const pause = useCallback(() => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.pauseVideo()
    }
    if (scWidgetRef.current) {
      scWidgetRef.current.pause()
    }
    if (spotifyControllerRef.current) {
      spotifyControllerRef.current.pause()
    }
    setIsPlaying(false)
  }, [])

  const resume = useCallback(async () => {
    if (source === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.playVideo()
      setIsPlaying(true)
      return
    }

    if (source === 'soundcloud' && scWidgetRef.current) {
      scWidgetRef.current.play()
      setIsPlaying(true)
      return
    }

    if (source === 'spotify' && spotifyControllerRef.current) {
      spotifyControllerRef.current.resume()
      setIsPlaying(true)
    }
  }, [source])

  const stop = useCallback(() => {
    stopAll()
  }, [stopAll])

  useEffect(
    () => () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.stopVideo()
      }
      if (scWidgetRef.current) {
        scWidgetRef.current.pause()
      }
      if (spotifyControllerRef.current) {
        spotifyControllerRef.current.destroy()
        spotifyControllerRef.current = null
      }
    },
    [],
  )

  return useMemo(
    () => ({
      isPlaying,
      source,
      playYouTube,
      playSoundCloud,
      playSpotify,
      pause,
      resume,
      stop,
      setVolume,
    }),
    [isPlaying, source, playYouTube, playSoundCloud, playSpotify, pause, resume, stop, setVolume],
  )
}
