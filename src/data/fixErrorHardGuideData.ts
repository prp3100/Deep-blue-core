import { fixErrorSupportedLanguageIds, type FixErrorSupportedLanguageId } from './fixErrorData'
import { fixErrorGuideData } from './fixErrorGuideData'
import { guideBookEntries } from './guideData'
import type { LanguageId, LocalizedText } from './quizModels'

export type FixErrorHardFalseFriendSplit = {
  target: LanguageId
  points: LocalizedText[]
}

export type FixErrorHardGuideEntry = {
  snapshot: LocalizedText
  checklist: LocalizedText[]
  falseFriendSplits: FixErrorHardFalseFriendSplit[]
}

const t = (th: string, en: string): LocalizedText => ({ th, en })

const buildFalseFriendSplit = (source: FixErrorSupportedLanguageId, target: LanguageId): FixErrorHardFalseFriendSplit => {
  const sourceGuide = guideBookEntries[source]
  const targetGuide = guideBookEntries[target]

  return {
    target,
    points: [
      t(
        `ถ้าโจทย์ยังมีกลิ่น ${sourceGuide.quickSpot.th} ชัด ให้ล็อก syntax ของ ${sourceGuide.label.th} ก่อน แล้วค่อยไล่ว่าบรรทัดไหนเป็นต้นเหตุจริง`,
        `If the question still smells strongly like ${sourceGuide.quickSpot.en}, lock onto ${sourceGuide.label.en} syntax first, then trace the true culprit line.`,
      ),
      t(
        `${targetGuide.label.th} อาจหลอกตาด้วยโครงสร้างคล้ายกัน แต่โจทย์ hard ของหมวดนี้จะซ่อน symptom ไว้รอบ ๆ ต้นเหตุในสำเนียงของ ${sourceGuide.label.th}`,
        `${targetGuide.label.en} may look structurally similar, but hard questions here hide symptom lines around the culprit in the accent of ${sourceGuide.label.en}.`,
      ),
    ],
  }
}

export const fixErrorHardGuideData = Object.fromEntries(
  fixErrorSupportedLanguageIds.map((languageId) => {
    const guide = guideBookEntries[languageId]
    const easyGuide = fixErrorGuideData[languageId]
    const focusPoints = guide.debugFocus

    const entry: FixErrorHardGuideEntry = {
      snapshot: t(
        `${guide.label.th} แบบ hard จะไม่โยน error ตรง ๆ อย่างเดียว แต่จะมีบรรทัด symptom กับบริบทหลอกเพิ่มเข้ามา ทำให้ต้องหา "บรรทัดแรกที่ทำให้พังจริง" ไม่ใช่แค่บรรทัดที่อาการระเบิดออกมา`,
        `Hard ${guide.label.en} fix-error prompts do not stop at a direct error. They add symptom lines and misleading context, so you must find the first truly breaking line, not just where the failure becomes visible.`,
      ),
      checklist: [
        t(
          `เริ่มจากแยกก่อนว่า error ชี้ "ต้นเหตุ" หรือแค่ "อาการปลายทาง" แล้วอย่าตอบจาก log อย่างเดียว`,
          'Start by separating whether the error points to the root break or only the downstream symptom, and do not answer from the log alone.',
        ),
        t(
          focusPoints.th[0] ?? 'เช็ก syntax และ object ที่ถูกเรียกก่อนเสมอ',
          focusPoints.en[0] ?? 'Always inspect the syntax and object being called first.',
        ),
        t(
          focusPoints.th[1] ?? 'เทียบบรรทัดก่อนหน้าและบรรทัดหลังจากจุดพัง เพื่อดูว่าอะไรเป็นแค่บริบทหรือผลตามมา',
          focusPoints.en[1] ?? 'Compare the line before and after the failure to decide what is setup, root cause, or downstream fallout.',
        ),
        t(
          easyGuide.firstPassChecklist[0]?.th ?? 'อ่านชื่อ method/field ให้ครบทุกตัวอักษร',
          easyGuide.firstPassChecklist[0]?.en ?? 'Read every character in the method or field name.',
        ),
      ],
      falseFriendSplits: guide.falseFriends.slice(0, 2).map((target) => buildFalseFriendSplit(languageId, target)),
    }

    return [languageId, entry]
  }),
) as Record<FixErrorSupportedLanguageId, FixErrorHardGuideEntry>
