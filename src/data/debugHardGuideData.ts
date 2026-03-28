import { debugSupportedLanguageIds, type DebugSupportedLanguageId } from './debugData'
import { debugGuideData } from './debugGuideData'
import { guideBookEntries } from './guideData'
import type { LanguageId, LocalizedText } from './quizModels'

export type DebugHardFalseFriendSplit = {
  target: LanguageId
  points: LocalizedText[]
}

export type DebugHardGuideEntry = {
  snapshot: LocalizedText
  checklist: LocalizedText[]
  falseFriendSplits: DebugHardFalseFriendSplit[]
}

const t = (th: string, en: string): LocalizedText => ({ th, en })

const buildFalseFriendSplit = (source: DebugSupportedLanguageId, target: LanguageId): DebugHardFalseFriendSplit => {
  const sourceGuide = guideBookEntries[source]
  const targetGuide = guideBookEntries[target]

  return {
    target,
    points: [
      t(
        `ถ้า log ยังวิ่งในโลกของ ${sourceGuide.label.th} ให้แยกก่อนว่า root cause อยู่ที่ data, selector, config หรือ null ในสำเนียงของมัน ไม่ใช่รีบเดาจากหน้าตาคล้าย ${targetGuide.label.th}`,
        `If the log still lives in the world of ${sourceGuide.label.en}, first separate whether the root cause is data, selector, config, or null in that language’s accent instead of jumping to ${targetGuide.label.en} because the surface looks similar.`,
      ),
      t(
        `${targetGuide.label.th} อาจแชร์ marker บางตัว แต่ hard debug ของหัวข้อนี้ตั้งใจให้ symptom กับ root cause อยู่คนละตำแหน่ง จึงต้องเทียบ log กับ snippet ทั้ง flow`,
        `${targetGuide.label.en} may share some markers, but hard debug prompts here intentionally separate the symptom from the root cause, so you have to compare the log and snippet across the whole flow.`,
      ),
    ],
  }
}

export const debugHardGuideData = Object.fromEntries(
  debugSupportedLanguageIds.map((languageId) => {
    const guide = guideBookEntries[languageId]
    const easyGuide = debugGuideData[languageId]
    const focusPoints = guide.debugFocus

    const entry: DebugHardGuideEntry = {
      snapshot: t(
        `${guide.label.th} แบบ hard จะทำให้ log ชี้ไปที่อาการปลายทางก่อน แล้วค่อยซ่อน root cause จริงไว้ใน flow หรือ data shape ของ snippet`,
        `Hard ${guide.label.en} debug prompts often send the log toward the downstream symptom first, then hide the real root cause in the snippet’s flow or data shape.`,
      ),
      checklist: [
        t(
          'อ่าน log เพื่อจับ symptom ก่อน แต่ยังอย่าเฉลยจนกว่าจะย้อนกลับไปหาบรรทัดแรกที่ทำให้ state เพี้ยน',
          'Use the log to capture the symptom first, but do not answer until you trace back to the first line that corrupts the state.',
        ),
        t(
          focusPoints.th[0] ?? 'เช็กค่าที่อาจเป็น null หรือ field ที่หายไปก่อน',
          focusPoints.en[0] ?? 'Check possible null values or missing fields first.',
        ),
        t(
          focusPoints.th[1] ?? 'เทียบชื่อ method, selector หรือ config กับของจริงทุกตัว',
          focusPoints.en[1] ?? 'Compare every method, selector, or config name against the real source of truth.',
        ),
        t(
          easyGuide.triageChecklist[0]?.th ?? 'ดูข้อความใน log จากจุดที่ crash จริงก่อน',
          easyGuide.triageChecklist[0]?.en ?? 'Read the log starting from where the crash actually occurs.',
        ),
      ],
      falseFriendSplits: guide.falseFriends.slice(0, 2).map((target) => buildFalseFriendSplit(languageId, target)),
    }

    return [languageId, entry]
  }),
) as Record<DebugSupportedLanguageId, DebugHardGuideEntry>
