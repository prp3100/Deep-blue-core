import { Github, Instagram, Linkedin, Youtube } from 'lucide-react'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

export function FooterSection({ locale }: { locale: Locale }) {
  const copy = uiText[locale]

  return (
    <footer className="footer-section">
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 60 C 240 120, 480 0, 720 60 C 960 120, 1200 0, 1440 60 V120 H0 Z" />
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-brand">
          <p className="footer-title">{copy.appTitle}</p>
          <p className="footer-subtitle">{copy.footerSubtitle}</p>
        </div>

        <div className="footer-newsletter">
          <p className="footer-label">{copy.footerNewsletterTitle}</p>
          <div className="footer-input">
            <input type="email" placeholder={copy.footerNewsletterPlaceholder} />
            <button type="button">{copy.footerNewsletterCta}</button>
          </div>
          <p className="footer-note">{copy.footerNewsletterNote}</p>
        </div>

        <div className="footer-links">
          <p className="footer-label">{copy.footerLinksTitle}</p>
          <div className="footer-link-grid">
            <span>{copy.footerLinkGuide}</span>
            <span>{copy.footerLinkQuiz}</span>
            <span>{copy.footerLinkTracks}</span>
            <span>{copy.footerLinkSupport}</span>
          </div>
        </div>

        <div className="footer-social">
          <p className="footer-label">{copy.footerSocialTitle}</p>
          <div className="footer-social-icons">
            <button type="button" aria-label="Youtube">
              <Youtube size={16} />
            </button>
            <button type="button" aria-label="LinkedIn">
              <Linkedin size={16} />
            </button>
            <button type="button" aria-label="Instagram">
              <Instagram size={16} />
            </button>
            <button type="button" aria-label="Github">
              <Github size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{copy.footerCopyright}</span>
        <span>{copy.footerTagline}</span>
      </div>
    </footer>
  )
}
