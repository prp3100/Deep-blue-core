import { useRef, type MouseEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import identifyArtwork from '../assets/cutscenes/quickstart/core languge.jpg'
import fixErrorArtwork from '../assets/cutscenes/quickstart/fix eror.jpg'
import debugArtwork from '../assets/cutscenes/quickstart/debug-card.jpg'
import vocabArtwork from '../assets/cutscenes/quickstart/vocab-card.jpg'
import { landingContent } from '../data/landingContent'
import type { LandingCourse } from '../data/landingContent'
import { quizFormatSettings, resolveHintProfile } from '../data/quizFormats'
import type { QuizFormatId } from '../data/quizModels'
import type { Locale } from '../lib/i18n'
import { uiText } from '../lib/i18n'

type CourseCardProps = {
  locale: Locale
  course: LandingCourse
  onQuickStart: (format: QuizFormatId) => void
}

const courseArtworkByFormat: Partial<Record<QuizFormatId, string>> = {
  'identify-language': identifyArtwork,
  'fix-error': fixErrorArtwork,
  debug: debugArtwork,
  vocab: vocabArtwork,
}

const formatQuestionCount = (locale: Locale, values: number[]) => {
  const label = values.join('/')
  return locale === 'th' ? `${label} ข้อ` : `${label} Qs`
}

const formatTimePerQuestion = (locale: Locale, seconds: number) =>
  locale === 'th' ? `${seconds}s/ข้อ` : `${seconds}s/Q`

const formatHintCount = (locale: Locale, values: number[]) => {
  const label = [...new Set(values)].sort((left, right) => left - right).join('/')
  return locale === 'th' ? `${label} คำใบ้` : `${label} hints`
}

const getCourseMeta = (locale: Locale, format: QuizFormatId) => {
  const config = quizFormatSettings[format]

  if (config.id === 'identify-language') {
    return [
      formatQuestionCount(locale, [config.lengths.short.questionsPerSession, config.lengths.standard.questionsPerSession]),
      formatTimePerQuestion(locale, config.questionTimeLimitSeconds),
      formatHintCount(locale, [
        resolveHintProfile(config.lengths.short.questionsPerSession, 'easy').hintLimit,
        resolveHintProfile(config.lengths.short.questionsPerSession, 'hard').hintLimit,
        resolveHintProfile(config.lengths.standard.questionsPerSession, 'easy').hintLimit,
        resolveHintProfile(config.lengths.standard.questionsPerSession, 'hard').hintLimit,
      ]),
    ]
  }

  if (config.id === 'vocab') {
    return [
      formatQuestionCount(locale, [config.lengths.short.questionsPerSession, config.lengths.standard.questionsPerSession]),
      formatTimePerQuestion(locale, config.questionTimeLimitSeconds),
      formatHintCount(locale, [
        resolveHintProfile(config.lengths.short.questionsPerSession, 'easy').hintLimit,
        resolveHintProfile(config.lengths.short.questionsPerSession, 'hard').hintLimit,
        resolveHintProfile(config.lengths.standard.questionsPerSession, 'easy').hintLimit,
        resolveHintProfile(config.lengths.standard.questionsPerSession, 'hard').hintLimit,
      ]),
    ]
  }

  if (config.id === 'fix-error' || config.id === 'debug') {
    return [
      formatQuestionCount(locale, [config.questionsPerSession]),
      formatTimePerQuestion(locale, config.questionTimeLimitSeconds),
      formatHintCount(locale, [
        resolveHintProfile(config.questionsPerSession, 'easy').hintLimit,
        resolveHintProfile(config.questionsPerSession, 'hard').hintLimit,
      ]),
    ]
  }

  return []
}

function CourseCard({ locale, course, onQuickStart }: CourseCardProps) {
  const reduceMotion = useReducedMotion()
  const courseMeta = getCourseMeta(locale, course.quickFormat)
  const courseArtwork = courseArtworkByFormat[course.quickFormat]

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) {
      return
    }

    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    card.style.setProperty('--tilt-x', `${(y * 8).toFixed(2)}deg`)
    card.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`)
  }

  const handleLeave = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  const handleQuickStart = () => {
    onQuickStart(course.quickFormat)
  }

  return (
    <div className="course-card" data-course-format={course.quickFormat} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="course-card__media">
        {courseArtwork ? (
          <img className="course-card__image" src={courseArtwork} alt="" loading="lazy" decoding="async" aria-hidden="true" />
        ) : null}
        <span className="course-card__tag">{course.modeBadge[locale]}</span>
      </div>
      <div className="course-card__body">
        <div className="course-card__header">
          <h3>{course.title[locale]}</h3>
        </div>
        <p className="course-card__summary">{course.summary[locale]}</p>
        <div className="course-card__meta">
          {courseMeta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="course-card__tags">
          {course.contentKinds.map((tag, i) => (
            <span key={i}>{tag[locale]}</span>
          ))}
        </div>
        <button type="button" className="course-card__cta" onClick={handleQuickStart}>
          {course.cta[locale]}
        </button>
      </div>
    </div>
  )
}

type CoursesSectionProps = {
  locale: Locale
  onQuickStart: (format: QuizFormatId) => void
}

export function CoursesSection({ locale, onQuickStart }: CoursesSectionProps) {
  const copy = uiText[locale]
  const courses = landingContent.courses
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const track = trackRef.current
    if (!track) return
    const cardWidth = track.querySelector('.course-card')?.getBoundingClientRect().width ?? 320
    const amount = cardWidth + 20 // card width + gap
    track.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section id="courses" className="section courses-section">
      <div className="section-header">
        <p className="section-eyebrow">{copy.sectionCoursesEyebrow}</p>
        <h2 className="section-title">{copy.sectionCoursesTitle}</h2>
        <p className="section-subtitle">{copy.sectionCoursesSubtitle}</p>
      </div>

      <div className="courses-carousel">
        <button type="button" className="courses-arrow courses-arrow--left" onClick={() => scroll('left')} aria-label="Scroll left">
          <ChevronLeft size={20} />
        </button>
        <div className="courses-track" ref={trackRef}>
          {courses.map((course) => (
            <CourseCard key={course.quickFormat} locale={locale} course={course} onQuickStart={onQuickStart} />
          ))}
        </div>
        <button type="button" className="courses-arrow courses-arrow--right" onClick={() => scroll('right')} aria-label="Scroll right">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}
