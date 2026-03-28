import { debugGuideData } from './debugGuideData'
import { debugQuestionBanks, debugSupportedLanguageIds, type DebugSupportedLanguageId } from './debugData'
import { fixErrorGuideData } from './fixErrorGuideData'
import { fixErrorFamilyLabels, fixErrorQuestionBanks, fixErrorSupportedLanguageIds, type FixErrorSupportedLanguageId } from './fixErrorData'
import { guideBookEntries, trackTopicIds } from './guideData'
import { questionBanks } from './questionBank'
import type { Difficulty, LanguageId, LocalizedText } from './quizModels'
import { vocabGuideData } from './vocabGuideData'
import { vocabQuestionBanks, vocabSupportedLanguageIds, type VocabSupportedLanguageId } from './vocabData'

type IdentifyGuideInsight = {
  signals: string[]
  snippets: string[]
}

type FixErrorGuideInsight = {
  errorPatterns: LocalizedText[]
  culpritFragments: string[]
  falseStartFragments: string[]
  workedExampleIndexes: number[]
}

type DebugGuideInsight = {
  causeLabels: LocalizedText[]
  sampleLogs: LocalizedText[]
  misleadingCauseLabels: LocalizedText[]
  workedExampleIndexes: number[]
}

type VocabGuideInsight = {
  terms: LocalizedText[]
  snippets: string[]
  meanings: LocalizedText[]
}

const allLanguageIds = [...trackTopicIds.core, ...trackTopicIds['game-dev']] as LanguageId[]

const normalizeLine = (value: string) => value.replace(/\s+/g, ' ').trim()

const shorten = (value: string, maxLength = 92) => {
  const normalized = normalizeLine(value)
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

const shortenText = (value: LocalizedText, maxLength = 92): LocalizedText => ({
  th: shorten(value.th, maxLength),
  en: shorten(value.en, maxLength),
})

const uniqueStrings = (items: string[]) => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items) {
    const normalized = normalizeLine(item)
    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

const uniqueLocalized = (items: LocalizedText[]) => {
  const seen = new Set<string>()
  const result: LocalizedText[] = []

  for (const item of items) {
    const key = `${item.th}|||${item.en}`
    if (!item.th.trim() || !item.en.trim() || seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(item)
  }

  return result
}

const summarizeErrorText = (value: string) => {
  const normalized = normalizeLine(value)
  const [head] = normalized.split(':')
  return shorten(head || normalized, 64)
}

void summarizeErrorText

const identifyQuestionsByDifficulty: Record<Difficulty, typeof questionBanks.core.easy> = {
  easy: [...questionBanks.core.easy, ...questionBanks['game-dev'].easy],
  hard: [...questionBanks.core.hard, ...questionBanks['game-dev'].hard],
}

const collectIdentifyGuideInsights = (difficulty: Difficulty) =>
  Object.fromEntries(
    allLanguageIds.map((languageId) => {
      const guide = guideBookEntries[languageId]
      if (guide.spottingRules.length < 3 || guide.beginnerChecklist.length < 3) {
        throw new Error(`Guide coverage is too thin for identify-language -> ${languageId}.`)
      }

      const bankItems = identifyQuestionsByDifficulty[difficulty].filter((item) => item.answer === languageId)
      const signals = uniqueStrings(bankItems.flatMap((item) => item.signals)).slice(0, difficulty === 'hard' ? 12 : 10)
      const snippets = uniqueStrings(bankItems.map((item) => item.snippetText)).slice(0, difficulty === 'hard' ? 3 : 2)

      if (signals.length === 0 || snippets.length === 0) {
        throw new Error(`Missing identify-language ${difficulty} guide insight coverage for ${languageId}.`)
      }

      return [languageId, { signals, snippets }]
    }),
  ) as Record<LanguageId, IdentifyGuideInsight>

export const identifyGuideInsights: Record<Difficulty, Record<LanguageId, IdentifyGuideInsight>> = {
  easy: collectIdentifyGuideInsights('easy'),
  hard: collectIdentifyGuideInsights('hard'),
}

const pickFixErrorWorkedExampleIndexes = (
  bankItems: (typeof fixErrorQuestionBanks)[FixErrorSupportedLanguageId][Difficulty],
  targetCount: number,
) => {
  const indexes: number[] = []
  const seenFamilies = new Set<string>()
  const seenPatternGroups = new Set<string>()

  bankItems.forEach((item, index) => {
    if (indexes.length >= targetCount || seenFamilies.has(item.familyId) || seenPatternGroups.has(item.patternGroupId)) {
      return
    }

    seenFamilies.add(item.familyId)
    seenPatternGroups.add(item.patternGroupId)
    indexes.push(index)
  })

  if (indexes.length < Math.min(2, targetCount)) {
    throw new Error('Worked example coverage collapsed to too few fix-error families.')
  }

  return indexes
}

const pickDebugWorkedExampleIndexes = (
  bankItems: (typeof debugQuestionBanks)[DebugSupportedLanguageId][Difficulty],
  targetCount: number,
) => {
  const indexes: number[] = []
  const seenPatternGroups = new Set<string>()
  const seenAnswers = new Set<string>()

  bankItems.forEach((item, index) => {
    if (indexes.length >= targetCount || seenPatternGroups.has(item.patternGroupId) || seenAnswers.has(item.answer)) {
      return
    }

    seenPatternGroups.add(item.patternGroupId)
    seenAnswers.add(item.answer)
    indexes.push(index)
  })

  for (const [index, item] of bankItems.entries()) {
    if (indexes.length >= targetCount || seenPatternGroups.has(item.patternGroupId)) {
      continue
    }

    seenPatternGroups.add(item.patternGroupId)
    indexes.push(index)
  }

  if (indexes.length < Math.min(2, targetCount)) {
    throw new Error('Worked example coverage collapsed to too few debug pattern groups.')
  }

  return indexes
}

const collectFixErrorGuideInsights = (difficulty: Difficulty) =>
  Object.fromEntries(
    fixErrorSupportedLanguageIds.map((languageId) => {
      const guide = fixErrorGuideData[languageId]
      if (guide.firstPassChecklist.length < 4 || guide.commonFalseStarts.length < 3 || guide.workedExampleLens.length < 3) {
        throw new Error(`Fix Error guide coverage is too thin for ${languageId}.`)
      }

      const bankItems = fixErrorQuestionBanks[languageId][difficulty]
      const workedExampleIndexes = pickFixErrorWorkedExampleIndexes(bankItems, difficulty === 'hard' ? 4 : 4)
      const errorPatterns = uniqueLocalized(
        workedExampleIndexes.map((index) => fixErrorFamilyLabels[bankItems[index]?.familyId ?? bankItems[0].familyId]),
      ).slice(0, difficulty === 'hard' ? 7 : 6)
      const culpritFragments = uniqueStrings([
        ...workedExampleIndexes.map((index) => bankItems[index]?.choices.find((choice) => choice.id === bankItems[index]?.answer)?.fragment ?? ''),
        ...uniqueStrings(bankItems.map((item) => item.choices.find((choice) => choice.id === item.answer)?.fragment ?? '')).slice(0, 2),
      ]).slice(0, difficulty === 'hard' ? 5 : 4)
      const falseStartFragments = uniqueStrings(
        [
          ...workedExampleIndexes.flatMap((index) =>
            (bankItems[index]?.choices ?? [])
              .filter((choice) => choice.id !== bankItems[index]?.answer)
              .map((choice) => choice.fragment),
          ),
          ...uniqueStrings(
            bankItems.flatMap((item) => item.choices.filter((choice) => choice.id !== item.answer).map((choice) => choice.fragment)),
          ).slice(0, 2),
        ],
      ).slice(0, 4)

      if (errorPatterns.length === 0 || culpritFragments.length === 0 || falseStartFragments.length === 0 || workedExampleIndexes.length < 2) {
        throw new Error(`Missing Fix Error ${difficulty} guide insight coverage for ${languageId}.`)
      }

      return [languageId, { errorPatterns, culpritFragments, falseStartFragments, workedExampleIndexes }]
    }),
  ) as Record<FixErrorSupportedLanguageId, FixErrorGuideInsight>

export const fixErrorGuideInsights: Record<Difficulty, Record<FixErrorSupportedLanguageId, FixErrorGuideInsight>> = {
  easy: collectFixErrorGuideInsights('easy'),
  hard: collectFixErrorGuideInsights('hard'),
}

const collectDebugGuideInsights = (difficulty: Difficulty) =>
  Object.fromEntries(
    debugSupportedLanguageIds.map((languageId) => {
      const guide = debugGuideData[languageId]
      if (guide.triageChecklist.length < 4 || guide.symptomVsRootCauseWarnings.length < 3 || guide.workedExampleLens.length < 3) {
        throw new Error(`Debug guide coverage is too thin for ${languageId}.`)
      }

      const bankItems = debugQuestionBanks[languageId][difficulty]
      const workedExampleIndexes = pickDebugWorkedExampleIndexes(bankItems, difficulty === 'hard' ? 4 : 4)
      const causeLabels = uniqueLocalized(
        workedExampleIndexes
          .map((index) => bankItems[index])
          .map((item) => item.choices.find((choice) => choice.id === item.answer)?.label)
          .filter((value): value is LocalizedText => Boolean(value)),
      ).slice(0, difficulty === 'hard' ? 6 : 5)
      const sampleLogs = uniqueLocalized(
        workedExampleIndexes.map((index) => shortenText(bankItems[index]?.logText ?? bankItems[0].logText, difficulty === 'hard' ? 92 : 86)),
      ).slice(0, 4)
      const misleadingCauseLabels = uniqueLocalized(
        workedExampleIndexes.flatMap((index) =>
          (bankItems[index]?.choices ?? []).filter((choice) => choice.id !== bankItems[index]?.answer).map((choice) => choice.label),
        ),
      ).slice(0, 4)

      if (causeLabels.length === 0 || sampleLogs.length === 0 || misleadingCauseLabels.length === 0 || workedExampleIndexes.length < 2) {
        throw new Error(`Missing Debug ${difficulty} guide insight coverage for ${languageId}.`)
      }

      return [languageId, { causeLabels, sampleLogs, misleadingCauseLabels, workedExampleIndexes }]
    }),
  ) as Record<DebugSupportedLanguageId, DebugGuideInsight>

export const debugGuideInsights: Record<Difficulty, Record<DebugSupportedLanguageId, DebugGuideInsight>> = {
  easy: collectDebugGuideInsights('easy'),
  hard: collectDebugGuideInsights('hard'),
}

export const vocabGuideInsights = Object.fromEntries(
  vocabSupportedLanguageIds.map((languageId) => {
    const guide = vocabGuideData[languageId]
    if (guide.termFamilyCues.length < 4 || guide.lookalikeWarnings.length < 3 || guide.snippetReadingTips.length < 3) {
      throw new Error(`Vocab guide coverage is too thin for ${languageId}.`)
    }

    const bankItems = [...vocabQuestionBanks[languageId].easy, ...vocabQuestionBanks[languageId].hard]
    const terms = uniqueLocalized(bankItems.map((item) => item.termText)).slice(0, 12)
    const snippets = uniqueStrings(bankItems.map((item) => item.snippetText)).slice(0, 3)
    const meanings = uniqueLocalized(
      bankItems
        .map((item) => item.choices.find((choice) => choice.id === item.answer)?.label)
        .filter((value): value is LocalizedText => Boolean(value)),
    ).slice(0, 8)

    if (terms.length === 0 || snippets.length === 0 || meanings.length === 0) {
      throw new Error(`Missing Vocab guide insight coverage for ${languageId}.`)
    }

    return [languageId, { terms, snippets, meanings }]
  }),
) as Record<VocabSupportedLanguageId, VocabGuideInsight>
