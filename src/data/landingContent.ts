import type { LocalizedText, QuizFormatId } from './quizModels'

type LandingService = {
  title: LocalizedText
  description: LocalizedText
  highlight: LocalizedText
}

type LandingCourse = {
  title: LocalizedText
  modeBadge: LocalizedText
  summary: LocalizedText
  contentKinds: LocalizedText[]
  quickFormat: QuizFormatId
  cta: LocalizedText
}

type LandingTestimonial = {
  name: string
  role: LocalizedText
  quote: LocalizedText
}

type LandingArenaHighlight = {
  title: LocalizedText
  description: LocalizedText
}

type LandingArenaStep = {
  title: LocalizedText
  description: LocalizedText
}

type LandingArenaContent = {
  intro: LocalizedText
  highlights: LandingArenaHighlight[]
  stepsTitle: LocalizedText
  steps: LandingArenaStep[]
}

type LandingContent = {
  marquee: LocalizedText[]
  services: LandingService[]
  courses: LandingCourse[]
  arena: LandingArenaContent
  testimonials: LandingTestimonial[]
  campusHighlights: LocalizedText[]
}

const t = (th: string, en: string): LocalizedText => ({ th, en })

export const landingContent: LandingContent = {
  marquee: [
    t('เรียนจากรูปแบบจริงของโค้ด', 'Learn from real code patterns'),
    t('คู่มือ + แบบทดสอบ + แก้ Error', 'Guide + Quiz + Fix Error'),
    t('สองภาษา ไทย/อังกฤษ', 'Bilingual Thai/English'),
    t('สรุปผลทันทีทุกข้อ', 'Instant feedback every question'),
    t('Core + Game Dev แทร็ก', 'Core + Game Dev tracks'),
    t('โฟกัสสิ่งที่สับสนบ่อย', 'Focus on common confusions'),
  ],
  services: [
    {
      title: t('Wave Primer', 'Wave Primer'),
      description: t(
        'ไล่สัญญาณหลักให้เห็นก่อนลงรายละเอียด เห็นคำเด่นแล้วเดาโลกของโค้ดได้เร็วขึ้น',
        'Spot the strongest signals first so you can guess the code world fast.',
      ),
      highlight: t('อ่านแบบคนทั่วไปก็เข้าใจ', 'Built for non-coders'),
    },
    {
      title: t('Quiz Atlas', 'Quiz Atlas'),
      description: t(
        'สุ่มโจทย์ใหม่ทุกครั้ง มีเฉลยทันที พร้อมเหตุผลว่าอะไรใช่/ไม่ใช่',
        'Every run reshuffles, reveals the answer instantly, and explains why.',
      ),
      highlight: t('ฝึกจำรูปแบบแบบมีระบบ', 'Structured pattern training'),
    },
    {
      title: t('Fix Error Lab', 'Fix Error Lab'),
      description: t(
        'อ่าน error แล้วชี้บรรทัดที่พังจริง ฝึกสายตา debug แบบเร็ว',
        'Read the error and pinpoint the failing line to build fast debug instincts.',
      ),
      highlight: t('เฉพาะ Core Track', 'Core track only'),
    },
    {
      title: t('Signal Radar', 'Signal Radar'),
      description: t(
        'ระบบวิเคราะห์จุดที่พลาดบ่อย เพื่อย้อนฝึกหัวข้อที่ควรเสริม',
        'Highlights weak spots so you can drill exactly what needs work.',
      ),
      highlight: t('สรุปผลหลังจบรอบ', 'Round summary included'),
    },
  ],
  courses: [
    {
      title: t('ทายภาษา', 'Identify Language'),
      modeBadge: t('โหมด Identify', 'Identify mode'),
      summary: t(
        'ดู snippet แล้วเดาว่าเป็นภาษาอะไรจาก marker, keyword และรูปทรงของโค้ด',
        'Inspect a snippet and identify the language from its markers, keywords, and overall code shape.',
      ),
      contentKinds: [t('Snippet', 'Snippet'), t('Marker', 'Marker'), t('Language choice', 'Language choice')],
      quickFormat: 'identify-language',
      cta: t('เข้าโหมด Identify', 'Enter Identify'),
    },
    {
      title: t('Fix Error', 'Fix Error'),
      modeBadge: t('โหมด Fix Error', 'Fix Error mode'),
      summary: t(
        'ดู snippet กับ error แล้วชี้บรรทัดที่ทำให้โค้ดพังจริงให้ถูกจุด',
        'Read the snippet and error together, then pinpoint the line that actually breaks the run.',
      ),
      contentKinds: [t('Snippet', 'Snippet'), t('Error', 'Error'), t('Culprit line', 'Culprit line')],
      quickFormat: 'fix-error',
      cta: t('เข้าโหมด Fix Error', 'Enter Fix Error'),
    },
    {
      title: t('Debug', 'Debug'),
      modeBadge: t('โหมด Debug', 'Debug mode'),
      summary: t(
        'อ่าน scenario + log + code แล้วหาสาเหตุหลักที่ทำให้ระบบพังจริง',
        'Read the scenario, log, and code together to identify the root cause behind the failure.',
      ),
      contentKinds: [t('Scenario', 'Scenario'), t('Runtime log', 'Runtime log'), t('Root cause', 'Root cause')],
      quickFormat: 'debug',
      cta: t('เข้าโหมด Debug', 'Enter Debug'),
    },
    {
      title: t('Vocab', 'Vocab'),
      modeBadge: t('โหมด Vocab', 'Vocab mode'),
      summary: t(
        'อ่าน term หรือ keyword ใน snippet แล้วเลือกความหมายที่ถูกต้องตามภาษานั้น',
        'Read a term or keyword inside a snippet and choose the meaning that best fits that language.',
      ),
      contentKinds: [t('Term', 'Term'), t('Meaning', 'Meaning'), t('Snippet context', 'Snippet context')],
      quickFormat: 'vocab',
      cta: t('เข้าโหมด Vocab', 'Enter Vocab'),
    },
  ],
  arena: {
    intro: t(
      'Arena คือสนามที่เปลี่ยนคลังโจทย์เดิมของเราให้กลายเป็นแมตช์ Human vs AI แบบจับเวลาจริง คุณเลือก track, format, provider, และ model เองได้ ก่อนลงแข่งบนโจทย์ชุดเดียวกับที่ใช้ฝึกในระบบปกติ แล้วดูผลแบบหลายมิติแทนการนับคะแนนอย่างเดียว',
      'Arena turns the same question pools into a timed Human vs AI duel. You choose the track, format, provider, and model, then battle on the same real quiz data you use for practice and review the result across multiple metrics instead of only a total score.',
    ),
    highlights: [
      {
        title: t('Real Quiz Pools', 'Real Quiz Pools'),
        description: t(
          'ใช้โจทย์จริงชุดเดียวกับ Identify, Fix Error, Debug และ Vocab เพื่อให้การแข่งสะท้อนของที่คุณฝึกจริง',
          'Battle on the same real pools used by Identify, Fix Error, Debug, and Vocab so the duel reflects your actual practice path.',
        ),
      },
      {
        title: t('Direct Provider BYOK', 'Direct Provider BYOK'),
        description: t(
          'ต่อ API key ของ provider โดยตรง เลือก model ที่อยากชนเอง ไม่ล็อกไว้แค่ตัวเดียว',
          'Bring your own provider API key and pick the exact model you want to challenge instead of being locked to one default bot.',
        ),
      },
      {
        title: t('Timed Duel', 'Timed Duel'),
        description: t(
          'แข่งกันต่อข้อภายใต้เวลาจริง ใครตอบไวและคมกว่าจะเห็นชัดตั้งแต่กลางแมตช์',
          'Race question by question under a live timer so speed and clarity show up before the match even ends.',
        ),
      },
      {
        title: t('Multi-Metric Scoreboard', 'Multi-Metric Scoreboard'),
        description: t(
          'ไม่ได้ดูแค่คะแนนรวม แต่เทียบทั้งความแม่น ความเร็วเฉลี่ย และสตรีคสูงสุดในแมตช์เดียว',
          'Compare more than total score with accuracy, average speed, and max streak all surfaced in one summary.',
        ),
      },
      {
        title: t('Track & Mode Control', 'Track & Mode Control'),
        description: t(
          'สลับ Core / Game Dev พร้อมเลือก format ที่อยากใช้แข่ง เพื่อให้แมตช์ตรงกับสิ่งที่คุณกำลังฝึก',
          'Switch between Core and Game Dev, then choose the exact format you want so the duel matches what you are training right now.',
        ),
      },
    ],
    stepsTitle: t('Flow การเข้าแข่ง', 'How A Match Starts'),
    steps: [
      {
        title: t('เลือกโหมดและแทร็ก', 'Choose a format and track'),
        description: t(
          'ล็อกก่อนว่าจะดวลกันด้วย Identify, Fix Error, Debug หรือ Vocab และใช้ Core หรือ Game Dev',
          'Start by choosing Identify, Fix Error, Debug, or Vocab, then lock in Core or Game Dev for the match.',
        ),
      },
      {
        title: t('ใส่ provider key + model', 'Connect a provider and model'),
        description: t(
          'วาง key ของ provider ที่ใช้จริง เลือก model ที่อยากชน แล้วตั้งค่า Base URL เพิ่มได้ถ้าจำเป็น',
          'Paste the real provider key, pick the model you want to face, and adjust the base URL when the provider needs a custom endpoint.',
        ),
      },
      {
        title: t('เริ่มแข่งและดูผลหลายมิติ', 'Start the duel and review the breakdown'),
        description: t(
          'เล่นจนจบแมตช์แล้วดูว่าใครชนะด้าน accuracy, speed, และ streak พร้อมรู้จุดที่ยังเสียจังหวะ',
          'Finish the match and review who won on accuracy, speed, and streak while spotting where your pace or precision slipped.',
        ),
      },
    ],
  },
  testimonials: [
    {
      name: 'Nina K.',
      role: t('นักออกแบบ UX', 'UX Designer'),
      quote: t(
        'ไม่เคยเขียนโค้ดมาก่อน แต่เข้าใจการแยกภาษาได้เร็วมากเพราะเห็นรูปแบบจริง',
        'I never coded before, but I can now separate languages just by their patterns.',
      ),
    },
    {
      name: 'Ton M.',
      role: t('นักศึกษาวิศวะ', 'Engineering Student'),
      quote: t(
        'โหมด Fix Error ทำให้กล้ามอง error log มากขึ้น รู้ว่าควรเริ่มดูตรงไหน',
        'Fix Error mode made error logs less scary and more structured.',
      ),
    },
    {
      name: 'Aiko R.',
      role: t('Game Artist', 'Game Artist'),
      quote: t(
        'แยก Unity กับ Unreal ได้ไวขึ้นมาก เพราะรู้คำที่เป็นเอกลักษณ์ของแต่ละ engine',
        'I can spot Unity vs Unreal faster because the engine signatures are clear.',
      ),
    },
    {
      name: 'Mark D.',
      role: t('Product Analyst', 'Product Analyst'),
      quote: t(
        'เหมือนมีแผนที่ให้ฝึก ไม่หลงทางกับภาษาเยอะ ๆ อีกต่อไป',
        'It feels like a map for learning, not a random list of languages.',
      ),
    },
  ],
  campusHighlights: [
    t('ห้องให้คำปรึกษาออนไลน์', 'Networked mentoring rooms'),
    t('แล็บฝึกรายวัน + แบบฝึกหัดย้อนหลัง', 'Daily live labs + async drills'),
    t('ระบบภารกิจวัดความก้าวหน้า', 'Mission-based progress system'),
    t('รีวิวร่วมกันสองภาษา', 'Bilingual peer review'),
  ],
}

export type { LandingArenaContent, LandingArenaHighlight, LandingArenaStep, LandingContent, LandingCourse, LandingService, LandingTestimonial }
