import { motion } from 'framer-motion'
import type { Locale } from '../lib/i18n'
import { HeroSection } from '../sections/HeroSection'
import { MarqueeBand } from '../sections/MarqueeBand'
import { ServicesSection } from '../sections/ServicesSection'
import { CoursesSection } from '../sections/CoursesSection'
import { ArenaSection } from '../sections/ArenaSection'
import { screenMotion } from '../components/layout/screenMotion'
import type { GuideFamilyId, QuizFormatId, QuizTrackId } from '../data/quizModels'

type LandingPageProps = {
  locale: Locale
  familyOptions: GuideFamilyId[]
  familyFilter: GuideFamilyId | 'all'
  activeTrack: QuizTrackId
  activeFormat: QuizFormatId
  onFamilyChange: (value: GuideFamilyId | 'all') => void
  onTrackChange: (value: QuizTrackId) => void
  onFormatChange: (value: QuizFormatId) => void
  onOpenGuide: () => void
  onStartQuickQuiz: (format: QuizFormatId) => void
  onStartArena: () => void
}

export function LandingPage({
  locale,
  familyOptions,
  familyFilter,
  activeTrack,
  activeFormat,
  onFamilyChange,
  onTrackChange,
  onFormatChange,
  onOpenGuide,
  onStartQuickQuiz,
  onStartArena,
}: LandingPageProps) {
  return (
    <motion.div key="landing" {...screenMotion}>
      <HeroSection
        locale={locale}
        familyOptions={familyOptions}
        familyFilter={familyFilter}
        activeTrack={activeTrack}
        activeFormat={activeFormat}
        onFamilyChange={onFamilyChange}
        onTrackChange={onTrackChange}
        onFormatChange={onFormatChange}
        onOpenGuide={onOpenGuide}
      />
      <MarqueeBand locale={locale} />
      <ServicesSection locale={locale} />
      <CoursesSection locale={locale} onQuickStart={onStartQuickQuiz} />
      <ArenaSection locale={locale} onStartArena={onStartArena} />
    </motion.div>
  )
}
