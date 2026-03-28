import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { landingContent } from '../data/landingContent'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

export function TestimonialsSection({ locale }: { locale: Locale }) {
  const copy = uiText[locale]
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonials = landingContent.testimonials
  const carouselItems = useMemo(() => [...testimonials, ...testimonials], [testimonials])

  useEffect(() => {
    if (reduceMotion) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [reduceMotion, testimonials.length])

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="section-header">
        <p className="section-eyebrow">{copy.sectionTestimonialsEyebrow}</p>
        <h2 className="section-title">{copy.sectionTestimonialsTitle}</h2>
        <p className="section-subtitle">{copy.sectionTestimonialsSubtitle}</p>
      </div>

      <div className="testimonial-spotlight">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={testimonials[activeIndex].name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            “{testimonials[activeIndex].quote[locale]}”
            <footer>
              <span>{testimonials[activeIndex].name}</span>
              <span>{testimonials[activeIndex].role[locale]}</span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="testimonial-carousel">
        <div className="testimonial-track">
          {carouselItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className="testimonial-card">
              <div className="testimonial-avatar" aria-hidden="true">
                <span>{item.name.slice(0, 1)}</span>
                <div className="testimonial-ripple" />
              </div>
              <p>{item.quote[locale]}</p>
              <div className="testimonial-meta">
                <span>{item.name}</span>
                <span>{item.role[locale]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
