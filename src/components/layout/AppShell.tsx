import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Locale } from '../../lib/i18n'
import { Bubbles } from './Bubbles'
import { ScrollProgress } from './ScrollProgress'
import { TopNav } from './TopNav'

type AppShellProps = {
  children: ReactNode
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onNavigateSection: (sectionId: string) => void
  onOpenGuide: () => void
  onOpenSettings: () => void
  onGoToQuiz: () => void
  isLanding: boolean
  navLocked?: boolean
  reduceAmbientEffects?: boolean
  transitionKey: string
}

const RAY_BEAMS = [
  { left: '8%',  width: 90,  angle: -22, alpha: 0.05, blur: 20, duration: 7,  delay: 0   },
  { left: '22%', width: 140, angle: -18, alpha: 0.07, blur: 24, duration: 9,  delay: 1.5 },
  { left: '38%', width: 100, angle: -28, alpha: 0.04, blur: 16, duration: 6,  delay: 3   },
  { left: '52%', width: 160, angle: -15, alpha: 0.06, blur: 28, duration: 10, delay: 2   },
  { left: '66%', width: 110, angle: -24, alpha: 0.05, blur: 20, duration: 8,  delay: 4   },
  { left: '80%', width: 130, angle: -20, alpha: 0.06, blur: 22, duration: 7,  delay: 0.8 },
  { left: '92%', width: 80,  angle: -30, alpha: 0.04, blur: 14, duration: 6,  delay: 2.5 },
]

export function AppShell({
  children,
  locale,
  onLocaleChange,
  onNavigateSection,
  onOpenGuide,
  onOpenSettings,
  onGoToQuiz,
  isLanding,
  navLocked = false,
  reduceAmbientEffects = false,
  transitionKey,
}: AppShellProps) {
  const reduceMotion = useReducedMotion()
  const ambientMotionDisabled = reduceMotion || reduceAmbientEffects

  return (
    <div className="app-shell">
      {!reduceAmbientEffects && <ScrollProgress />}

      <div className="app-ambient" aria-hidden="true">
        <div className="ambient-rays" />
        {!reduceAmbientEffects &&
          RAY_BEAMS.map((ray, i) => (
            <div
              key={`ray-beam-${i}`}
              className="ambient-ray-beam"
              style={{
                '--ray-left': ray.left,
                '--ray-width': `${ray.width}px`,
                '--ray-angle': `${ray.angle}deg`,
                '--ray-alpha': ray.alpha,
                '--ray-blur': `${ray.blur}px`,
                '--ray-duration': `${ray.duration}s`,
                '--ray-delay': `${ray.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        {!reduceAmbientEffects && <Bubbles />}
        {!reduceAmbientEffects && (
          <>
            <motion.div
              className="ambient-orb ambient-orb--left"
              animate={ambientMotionDisabled ? undefined : { x: [0, 40, -18, 0], y: [0, 24, -12, 0], scale: [1, 1.08, 0.96, 1] }}
              transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              className="ambient-orb ambient-orb--right"
              animate={ambientMotionDisabled ? undefined : { x: [0, -36, 20, 0], y: [0, 18, -26, 0], scale: [1, 1.06, 0.98, 1] }}
              transition={{ duration: 26, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              className="ambient-orb ambient-orb--bottom"
              animate={ambientMotionDisabled ? undefined : { x: [0, 20, -16, 0], y: [0, -18, 14, 0], scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
            />
          </>
        )}
        <div className="ambient-grid" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />

      <TopNav
        locale={locale}
        onLocaleChange={onLocaleChange}
        onNavigateSection={onNavigateSection}
        onOpenGuide={onOpenGuide}
        onOpenSettings={onOpenSettings}
        onGoToQuiz={onGoToQuiz}
        isLanding={isLanding}
        navLocked={navLocked}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={transitionKey}
          className="page-sweep"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: reduceMotion ? 0 : [0, 1, 0] }}
          transition={{ duration: 0.9, ease: 'easeInOut', times: [0, 0.5, 1] }}
        />
      </AnimatePresence>

      <main className="app-main">{children}</main>
    </div>
  )
}
