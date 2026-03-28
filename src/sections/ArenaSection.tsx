import { motion } from 'framer-motion'
import { Cpu, SlidersHorizontal, Swords, Timer, Trophy } from 'lucide-react'
import arenaFlowArtwork from '../assets/cutscenes/quickstart/arena-panel.jpg'
import { landingContent } from '../data/landingContent'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

type ArenaSectionProps = {
  locale: Locale
  onStartArena: () => void
}

export function ArenaSection({ locale, onStartArena }: ArenaSectionProps) {
  const copy = uiText[locale]
  const arena = landingContent.arena
  const highlightIcons = [Swords, Cpu, Timer, Trophy, SlidersHorizontal] as const

  return (
    <section id="arena" className="section arena-section">
      <div className="section-header">
        <p className="section-eyebrow">{copy.sectionArenaEyebrow}</p>
        <h2 className="section-title">{copy.sectionArenaTitle}</h2>
        <p className="section-subtitle">{copy.sectionArenaSubtitle}</p>
      </div>
      <p className="arena-section__intro">{arena.intro[locale]}</p>

      <div className="arena-section__layout">
        <motion.div
          className="arena-highlight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {arena.highlights.map((item, index) => {
            const Icon = highlightIcons[index % highlightIcons.length]
            return (
              <motion.article
                key={item.title.en}
                className="arena-highlight__card"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
                }}
              >
                <div className="arena-highlight__icon">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="arena-highlight__title">{item.title[locale]}</p>
                  <p className="arena-highlight__text">{item.description[locale]}</p>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        <motion.aside
          className="arena-flow"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div aria-hidden="true" className="arena-flow__artwork">
            <img src={arenaFlowArtwork} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="arena-flow__content">
            <p className="arena-flow__eyebrow">{arena.stepsTitle[locale]}</p>
            <div className="arena-flow__steps">
              {arena.steps.map((step, index) => (
                <div key={step.title.en} className="arena-flow__step">
                  <div className="arena-flow__index">{index + 1}</div>
                  <div>
                    <p className="arena-flow__title">{step.title[locale]}</p>
                    <p className="arena-flow__text">{step.description[locale]}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={onStartArena} className="arena-cta">
              {copy.arenaCTA}
            </button>
          </div>
        </motion.aside>
      </div>
    </section>
  )
}
