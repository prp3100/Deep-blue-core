import { motion } from 'framer-motion'
import { Activity, Bug, Sparkles, WandSparkles } from 'lucide-react'
import { landingContent } from '../data/landingContent'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

const icons = [Sparkles, WandSparkles, Bug, Activity]

export function ServicesSection({ locale }: { locale: Locale }) {
  const copy = uiText[locale]

  return (
    <section id="services" className="section services-section">
      <div className="section-header">
        <p className="section-eyebrow">{copy.sectionServicesEyebrow}</p>
        <h2 className="section-title">{copy.sectionServicesTitle}</h2>
        <p className="section-subtitle">{copy.sectionServicesSubtitle}</p>
      </div>

      <motion.div
        className="services-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-15% 0px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {landingContent.services.map((service, index) => {
          const Icon = icons[index % icons.length]

          return (
            <motion.article
              key={service.title.en}
              className="service-card"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
            >
              <div className="service-card__icon">
                <Icon size={20} />
              </div>
              <h3 className="service-card__title">{service.title[locale]}</h3>
              <p className="service-card__description">{service.description[locale]}</p>
              <span className="service-card__highlight">{service.highlight[locale]}</span>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}
