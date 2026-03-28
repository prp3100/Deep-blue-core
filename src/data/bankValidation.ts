import type { LocalizedText } from './quizModels'

export const normalizeSurface = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase()

export const localizedKey = (value: LocalizedText) => `${normalizeSurface(value.th)}|||${normalizeSurface(value.en)}`

export const isBlankLocalized = (value: LocalizedText) => !value.th.trim() || !value.en.trim()

export const assertLocalizedTextPresent = (value: LocalizedText, label: string) => {
  if (isBlankLocalized(value)) {
    throw new Error(`${label} is missing localized copy.`)
  }
}

export const assertStringPresent = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`${label} is blank.`)
  }
}

export const assertUniqueStringValues = (items: string[], label: string) => {
  const normalized = items.map((item) => normalizeSurface(item))
  if (new Set(normalized).size !== items.length) {
    throw new Error(`Duplicate values detected in ${label}.`)
  }
}

export const assertUniqueLocalizedValues = (items: LocalizedText[], label: string) => {
  const keys = items.map((item) => localizedKey(item))
  if (new Set(keys).size !== items.length) {
    throw new Error(`Duplicate localized values detected in ${label}.`)
  }
}

export const assertNoDuplicateSurface = <T>(items: T[], label: string, getKey: (item: T) => string) => {
  const seen = new Set<string>()

  for (const item of items) {
    const key = normalizeSurface(getKey(item))
    if (!key) {
      throw new Error(`Surface key is blank in ${label}.`)
    }

    if (seen.has(key)) {
      throw new Error(`Duplicate surface detected in ${label}: ${key}`)
    }

    seen.add(key)
  }
}

export const extractLogHead = (value: string) => {
  const normalized = normalizeSurface(value)
  if (!normalized) {
    return ''
  }

  return normalized.split(':')[0] ?? normalized
}
