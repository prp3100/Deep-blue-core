import { motion } from 'framer-motion'
import { landingContent } from '../data/landingContent'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

export function CampusSection({ locale }: { locale: Locale }) {
  const copy = uiText[locale]

  return (
    <section id="campus" className="section campus-section">
      <div className="campus-grid">
        <motion.div
          className="campus-visual"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <svg className="campus-network" viewBox="0 0 520 360" role="img" aria-label="Network map">
            <defs>
              <linearGradient id="campusGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
            <g className="campus-lines">
              <path d="M70 80 L230 60 L340 120 L460 80" />
              <path d="M110 240 L220 200 L330 250 L430 210" />
              <path d="M230 60 L220 200" />
              <path d="M340 120 L330 250" />
            </g>
            <g className="campus-nodes">
              <circle cx="70" cy="80" r="10" />
              <circle cx="230" cy="60" r="14" />
              <circle cx="340" cy="120" r="12" />
              <circle cx="460" cy="80" r="10" />
              <circle cx="110" cy="240" r="12" />
              <circle cx="220" cy="200" r="14" />
              <circle cx="330" cy="250" r="10" />
              <circle cx="430" cy="210" r="12" />
            </g>
            <circle className="campus-radar" cx="230" cy="60" r="46" />
            <circle className="campus-radar" cx="220" cy="200" r="56" />
            <circle className="campus-packet" r="5" />
          </svg>
        </motion.div>

        <motion.div
          className="campus-copy"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="section-eyebrow">{copy.sectionCampusEyebrow}</p>
          <h2 className="section-title">{copy.sectionCampusTitle}</h2>
          <p className="section-subtitle">{copy.sectionCampusSubtitle}</p>

          <ul className="campus-list">
            {landingContent.campusHighlights.map((item) => (
              <li key={item.en}>{item[locale]}</li>
            ))}
          </ul>

          <div className="campus-cta">
            <span>{copy.sectionCampusCta}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
