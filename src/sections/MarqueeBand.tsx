import type { Locale } from '../lib/i18n'
import { landingContent } from '../data/landingContent'

export function MarqueeBand({ locale }: { locale: Locale }) {
  const items = landingContent.marquee.map((item) => item[locale])
  const trackItems = [...items, ...items, ...items]

  return (
    <section className="marquee-band" aria-label="Marquee">
      <div className="marquee-track">
        {trackItems.map((item, index) => (
          <span key={`${item}-${index}`} className="marquee-item">
            {item}
            <span className="marquee-dot" aria-hidden="true" />
          </span>
        ))}
      </div>
    </section>
  )
}
