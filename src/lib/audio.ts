import { useEffect, useRef } from 'react'
import answerCorrectUrl from '../assets/cutscenes/effect/answer-correct.mp3'
import answerWrongUrl from '../assets/cutscenes/effect/answer-wrong.mp3'
import highRankUrl from '../assets/cutscenes/effect/high rank.mp3'
import lowRankUrl from '../assets/cutscenes/effect/low rank.mp3'
import maxScoreUrl from '../assets/cutscenes/effect/max-score.mp3'
import medRankUrl from '../assets/cutscenes/effect/med rank.mp3'
import noobRankUrl from '../assets/cutscenes/effect/noob rank.mp3'

type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

type ToneConfig = {
  frequency: number
  duration: number
  gain?: number
  type?: OscillatorType
  slideTo?: number
  delay?: number
}

type RankCue = 'noob' | 'low' | 'med' | 'high' | 'max'

const rankCueUrls: Record<RankCue, string> = {
  noob: noobRankUrl,
  low: lowRankUrl,
  med: medRankUrl,
  high: highRankUrl,
  max: maxScoreUrl,
}

const createTone = (context: AudioContext, master: GainNode, config: ToneConfig) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const startAt = context.currentTime + (config.delay ?? 0)
  const gainValue = config.gain ?? 0.035

  oscillator.type = config.type ?? 'sine'
  oscillator.frequency.setValueAtTime(config.frequency, startAt)

  if (config.slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(config.slideTo, startAt + config.duration)
  }

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + config.duration)

  oscillator.connect(gain)
  gain.connect(master)
  oscillator.start(startAt)
  oscillator.stop(startAt + config.duration + 0.02)
}

export const useQuizAudio = (volume = 0.65) => {
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const activeFileAudioRef = useRef<HTMLAudioElement[]>([])

  const ensureContext = () => {
    if (typeof window === 'undefined') {
      return null
    }

    if (!contextRef.current) {
      const AudioCtor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext

      if (!AudioCtor) {
        return null
      }

      const context = new AudioCtor()
      const master = context.createGain()
      master.gain.value = volume
      master.connect(context.destination)

      contextRef.current = context
      masterRef.current = master
    }

    if (contextRef.current.state === 'suspended') {
      void contextRef.current.resume()
    }

    return {
      context: contextRef.current,
      master: masterRef.current,
    }
  }

  const playSequence = (tones: ToneConfig[], overrideVolume?: number) => {
    const nodes = ensureContext()

    if (!nodes?.master) {
      return
    }

    nodes.master.gain.value = overrideVolume ?? volume

    for (const tone of tones) {
      createTone(nodes.context, nodes.master, tone)
    }
  }

  const playFile = (src: string, overrideVolume?: number) => {
    if (typeof window === 'undefined') {
      return
    }

    const audio = new window.Audio(src)
    audio.volume = Math.max(0, Math.min(1, overrideVolume ?? volume))
    audio.preload = 'auto'

    const cleanup = () => {
      activeFileAudioRef.current = activeFileAudioRef.current.filter((item) => item !== audio)
    }

    audio.addEventListener('ended', cleanup, { once: true })
    audio.addEventListener('error', cleanup, { once: true })
    activeFileAudioRef.current.push(audio)
    void audio.play().catch(cleanup)
  }

  useEffect(
    () => () => {
      for (const audio of activeFileAudioRef.current) {
        audio.pause()
        audio.src = ''
      }
      activeFileAudioRef.current = []

      if (contextRef.current) {
        void contextRef.current.close()
      }
    },
    [],
  )

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.value = volume
    }
  }, [volume])

  return {
    playTap: (overrideVolume?: number) =>
      playSequence([{ frequency: 520, duration: 0.06, gain: 0.022, type: 'triangle', slideTo: 460 }], overrideVolume),
    playSuccess: (overrideVolume?: number) =>
      playSequence(
        [
          { frequency: 540, duration: 0.08, gain: 0.024, type: 'triangle', slideTo: 620 },
          { frequency: 780, duration: 0.12, gain: 0.026, type: 'sine', delay: 0.07, slideTo: 880 },
        ],
        overrideVolume,
      ),
    playError: (overrideVolume?: number) =>
      playSequence([{ frequency: 400, duration: 0.09, gain: 0.024, type: 'sawtooth', slideTo: 280 }], overrideVolume),
    playHint: (overrideVolume?: number) =>
      playSequence(
        [
          { frequency: 680, duration: 0.08, gain: 0.022, type: 'sine', slideTo: 760 },
          { frequency: 920, duration: 0.1, gain: 0.02, type: 'triangle', delay: 0.06, slideTo: 980 },
        ],
        overrideVolume,
      ),
    playNext: (overrideVolume?: number) =>
      playSequence([{ frequency: 460, duration: 0.05, gain: 0.018, type: 'triangle', slideTo: 520 }], overrideVolume),
    playAnswerCorrect: (overrideVolume?: number) => playFile(answerCorrectUrl, overrideVolume),
    playAnswerWrong: (overrideVolume?: number) => playFile(answerWrongUrl, overrideVolume),
    playRankCue: (cue: RankCue, overrideVolume?: number) => playFile(rankCueUrls[cue], overrideVolume),
  }
}
