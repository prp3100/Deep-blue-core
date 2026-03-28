import { useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import heroArtwork from '../assets/cutscenes/quickstart/hero-panel.jpg'
import { guideFamilyLabels, trackSettings } from '../data/guideData'
import type { GuideFamilyId, QuizFormatId, QuizTrackId } from '../data/quizModels'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'
import { triggerRipple } from '../lib/ripple'

type HeroSectionProps = {
  locale: Locale
  familyOptions: GuideFamilyId[]
  familyFilter: GuideFamilyId | 'all'
  activeTrack: QuizTrackId
  activeFormat: QuizFormatId
  onFamilyChange: (value: GuideFamilyId | 'all') => void
  onTrackChange: (value: QuizTrackId) => void
  onFormatChange: (value: QuizFormatId) => void
  onOpenGuide: () => void
}

const buildBubbles = () =>
  Array.from({ length: 30 }, (_, index) => {
    const size = 6 + ((index * 7) % 16)
    const left = (index * 7) % 100
    const delay = (index % 10) * 0.6
    const duration = 8 + (index % 6) * 2
    return { id: `bubble-${index}`, size, left, delay, duration }
  })

export function HeroSection({
  locale,
  familyOptions,
  familyFilter,
  activeTrack,
  activeFormat,
  onFamilyChange,
  onTrackChange,
  onFormatChange,
  onOpenGuide,
}: HeroSectionProps) {
  const copy = uiText[locale]
  const reduceMotion = useReducedMotion()
  const bubbles = useMemo(() => buildBubbles(), [])

  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    if (reduceMotion) {
      const timeoutId = window.setTimeout(() => setTypedText(copy.heroSubtitle), 0)
      return () => window.clearTimeout(timeoutId)
    }

    let index = 0
    const text = copy.heroSubtitle
    const interval = window.setInterval(() => {
      index += 1
      setTypedText(text.slice(0, index))
      if (index >= text.length) {
        window.clearInterval(interval)
      }
    }, 28)

    return () => window.clearInterval(interval)
  }, [copy.heroSubtitle, reduceMotion])

  const words = copy.heroTitle.split(' ')

  return (
    <section id="hero" className="hero-section">
      <div className="hero-backdrop" aria-hidden="true">
        <img className="hero-backdrop__image" src={heroArtwork} alt="" loading="eager" decoding="async" />
      </div>

      <div className="hero-ambient" aria-hidden="true">
        <div className="hero-rays" />
        <div className="hero-bubbles">
          {bubbles.map((bubble) => (
            <span
              key={bubble.id}
              className="hero-bubble"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                animationDelay: `${bubble.delay}s`,
                animationDuration: `${bubble.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <span className="hero-badge">{copy.heroBadge}</span>
          <h1 className="hero-title">
            {words.map((word, index) => {
              const isAccent = word.replace(/[^a-zA-Z\u0E00-\u0E7F]/g, '') === copy.heroTitleAccent
              return (
                <span
                  key={`${word}-${index}`}
                  className={isAccent ? 'hero-word hero-word--glitch' : 'hero-word'}
                  style={{ animationDelay: `${index * 0.12}s` }}
                  data-text={word}
                >
                  {word}
                </span>
              )
            })}
          </h1>

          <p className="hero-subtitle">
            <span className="hero-typewriter">{typedText}</span>
            <span className="hero-cursor" aria-hidden="true" />
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="hero-cta-glow cta-ripple"
              onClick={(event) => {
                triggerRipple(event)
                onOpenGuide()
              }}
            >
              {copy.openGuideBook}
            </button>
            <div className="hero-filter">
              <span className="hero-filter__label">{copy.heroFormatLabel}</span>
              <select
                className="hero-filter__select"
                value={activeFormat}
                onChange={(event) => onFormatChange(event.target.value as QuizFormatId)}
              >
                <option value="identify-language">{copy.formatIdentify}</option>
                <option value="fix-error">{copy.formatFixError}</option>
                <option value="debug">{copy.formatDebug}</option>
                <option value="vocab">{copy.formatVocab}</option>
              </select>
            </div>
            <div className="hero-filter">
              <span className="hero-filter__label">{copy.trackLabel}</span>
              <select
                className="hero-filter__select"
                value={activeTrack}
                onChange={(event) => onTrackChange(event.target.value as QuizTrackId)}
              >
                {(['core', 'game-dev'] as const).map((trackId) => (
                  <option key={trackId} value={trackId}>
                    {trackSettings[trackId].label[locale]}
                  </option>
                ))}
              </select>
            </div>
            <div className="hero-filter">
              <span className="hero-filter__label">{copy.heroFamilyLabel}</span>
              <select
                className="hero-filter__select"
                value={familyFilter}
                onChange={(event) => onFamilyChange(event.target.value as GuideFamilyId | 'all')}
              >
                <option value="all">{copy.allFamilies}</option>
                {familyOptions.map((family) => (
                  <option key={family} value={family}>
                    {guideFamilyLabels[family][locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span>{copy.heroScroll}</span>
        <div className="hero-scroll__icon" />
      </div>
    </section>
  )
}
