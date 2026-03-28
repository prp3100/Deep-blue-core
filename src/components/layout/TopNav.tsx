import clsx from 'clsx'
import { BookOpen, Languages, Play, Settings } from 'lucide-react'
import type { Locale } from '../../lib/i18n'
import { uiText } from '../../lib/i18n'
import { triggerRipple } from '../../lib/ripple'

type TopNavProps = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onNavigateSection: (sectionId: string) => void
  onOpenGuide: () => void
  onOpenSettings: () => void
  onGoToQuiz: () => void
  isLanding: boolean
  navLocked?: boolean
}

const sectionIds = ['hero', 'services', 'courses', 'arena'] as const

export function TopNav({
  locale,
  onLocaleChange,
  onNavigateSection,
  onOpenGuide,
  onOpenSettings,
  onGoToQuiz,
  isLanding,
  navLocked = false,
}: TopNavProps) {
  const copy = uiText[locale]
  const brandIconUrl = `${import.meta.env.BASE_URL}site-icon.png`
  const navItems = [
    { id: sectionIds[0], label: copy.navHome },
    { id: sectionIds[1], label: copy.navPrograms },
    { id: sectionIds[2], label: copy.navCourses },
    { id: sectionIds[3], label: copy.navArena },
  ]

  return (
    <header className={clsx('top-nav', isLanding ? 'top-nav--landing' : 'top-nav--compact')}>
      <div className="top-nav__brand">
        <span className="top-nav__logo" aria-hidden="true">
          <img src={brandIconUrl} alt="" className="top-nav__logo-image" />
        </span>
        <div>
          <p className="top-nav__title">{copy.appTitle}</p>
          <p className="top-nav__subtitle">{copy.appSubtitle}</p>
        </div>
      </div>

      <nav className="top-nav__links" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (!navLocked) {
                onNavigateSection(item.id)
              }
            }}
            className={clsx('top-nav__link', navLocked && 'is-disabled')}
            disabled={navLocked}
            tabIndex={navLocked ? -1 : 0}
          >
            <span>{item.label}</span>
            <span className="top-nav__underline" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="top-nav__actions">
        <button
          type="button"
          onClick={() => {
            if (!navLocked) {
              onOpenGuide()
            }
          }}
          className={clsx('top-nav__ghost', navLocked && 'is-disabled')}
          disabled={navLocked}
          tabIndex={navLocked ? -1 : 0}
        >
          <BookOpen size={16} />
          {copy.navGuide}
        </button>

        <button type="button" onClick={onOpenSettings} className="top-nav__ghost">
          <Settings size={16} />
          {copy.navSettings}
        </button>

        <button
          type="button"
          onClick={(event) => {
            if (navLocked) {
              return
            }

            triggerRipple(event)
            onGoToQuiz()
          }}
          className={clsx('top-nav__cta cta-ripple', navLocked && 'is-disabled')}
          disabled={navLocked}
          tabIndex={navLocked ? -1 : 0}
        >
          <Play size={16} />
          {copy.navCourses}
        </button>

        <div className="top-nav__divider" aria-hidden="true" />

        <div className="top-nav__lang">
          <span className="top-nav__lang-label">{copy.languageSwitch}</span>
          {(['th', 'en'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onLocaleChange(value)}
              className={clsx('top-nav__lang-button', locale === value && 'is-active')}
            >
              <Languages size={13} className="inline-block" />
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
