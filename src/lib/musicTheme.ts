import { generateHarmonicTheme, hslToRgb, rgbToHex, rgbToHsl, type HSL } from './colorUtils'
import type { ThemePresetId } from './musicTypes'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const SYSTEM_BASE_THEME = {
  background: '#020B18',
  panel: '#061525',
  text: '#D8F0FF',
  muted: '#4A7FA5',
  accent: '#00D4FF',
  accent2: '#00FF94',
  previewSwatches: ['#020B18', '#061525', '#4A7FA5', '#D8F0FF', '#00D4FF', '#00FF94'],
} as const

const hexToRgbString = (hex: string) => {
  let sanitized = hex.replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  const r = Number.parseInt(sanitized.substring(0, 2), 16)
  const g = Number.parseInt(sanitized.substring(2, 4), 16)
  const b = Number.parseInt(sanitized.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

const hsla = (h: number, s: number, l: number, alpha: number) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${alpha})`
const hsl = (h: number, s: number, l: number) => `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`

const rgbStringFromHsl = (value: HSL) => {
  const rgb = hslToRgb(value.h, value.s, value.l)
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`
}

const hexToHsl = (hex: string) => {
  const sanitized = hex.replace('#', '')
  const size = sanitized.length === 3 ? 1 : 2
  const expand = (start: number) => {
    const chunk = sanitized.slice(start, start + size)
    return Number.parseInt(size === 1 ? `${chunk}${chunk}` : chunk, 16)
  }

  return rgbToHsl(expand(0), expand(size), expand(size * 2))
}

const hslToHex = (value: HSL) => {
  const rgb = hslToRgb(value.h, value.s, value.l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

const normalizeHex = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (trimmed.startsWith('#')) {
    return trimmed
  }

  return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed) ? `#${trimmed}` : ''
}

const mixHue = (start: number, end: number, amount: number) => {
  const delta = ((((end - start) % 360) + 540) % 360) - 180
  return (start + delta * amount + 360) % 360
}

const interpolateHsl = (from: HSL, to: HSL, amount: number): HSL => ({
  h: mixHue(from.h, to.h, amount),
  s: from.s + (to.s - from.s) * amount,
  l: from.l + (to.l - from.l) * amount,
})

const blendStops = (primary: HSL[], secondary: HSL[], amount: number) => {
  if (secondary.length === 0 || amount <= 0) {
    return primary
  }

  const blendAmount = clamp(amount, 0, 1)
  return primary.map((stop, index) => interpolateHsl(stop, secondary[index % secondary.length] ?? secondary[0], blendAmount))
}

const easeInOutSine = (value: number) => -(Math.cos(Math.PI * value) - 1) / 2

const shiftHsl = (value: HSL, hueShift: number, saturationDelta: number, lightnessDelta: number): HSL => ({
  h: (value.h + hueShift + 360) % 360,
  s: clamp(value.s + saturationDelta, 22, 92),
  l: clamp(value.l + lightnessDelta, 18, 82),
})

const buildDarkPalette = (baseHsl: HSL, accentHex: string, accent2Hex: string, accent3Hex: string) => {
  const surfaceHue = baseHsl.h
  const surfaceSat = clamp(baseHsl.s * 0.76 + 10, 22, 52)
  const bg0Dark = { h: surfaceHue, s: surfaceSat, l: 4 }
  const bgDark = { h: surfaceHue, s: surfaceSat, l: 6 }
  const bg2Dark = { h: (surfaceHue + 12) % 360, s: clamp(surfaceSat + 6, 24, 58), l: 11 }
  const inkDark = { h: surfaceHue, s: clamp(surfaceSat + 12, 24, 58), l: 92 }
  const inkSoftDark = { h: (surfaceHue + 4) % 360, s: clamp(surfaceSat + 8, 20, 48), l: 82 }
  const mutedDark = { h: (surfaceHue + 8) % 360, s: clamp(surfaceSat + 3, 18, 36), l: 66 }

  return {
    bg0: hsl(bg0Dark.h, bg0Dark.s, bg0Dark.l),
    bg: hsl(bgDark.h, bgDark.s, bgDark.l),
    bg2: hsl(bg2Dark.h, bg2Dark.s, bg2Dark.l),
    bgRgb: rgbStringFromHsl(bgDark),
    surface: hsla(surfaceHue, surfaceSat, 9, 0.78),
    surfaceStrong: hsl(surfaceHue, clamp(surfaceSat + 2, 24, 56), 10),
    surfaceStrongRgb: rgbStringFromHsl({ h: surfaceHue, s: clamp(surfaceSat + 2, 24, 56), l: 10 }),
    surfaceSoft: hsla((surfaceHue + 4) % 360, surfaceSat, 13, 0.76),
    surfaceRaised: hsla((surfaceHue + 8) % 360, clamp(surfaceSat + 4, 26, 58), 16, 0.84),
    surfaceHover: hsla((surfaceHue + 10) % 360, clamp(surfaceSat + 5, 26, 60), 20, 0.92),
    ink: hsl(inkDark.h, inkDark.s, inkDark.l),
    inkRgb: rgbStringFromHsl(inkDark),
    inkSoft: hsl(inkSoftDark.h, inkSoftDark.s, inkSoftDark.l),
    muted: hsl(mutedDark.h, mutedDark.s, mutedDark.l),
    line: `rgba(${hexToRgbString(accentHex)}, 0.18)`,
    lineStrong: `rgba(${hexToRgbString(accentHex)}, 0.3)`,
    panelGradient: `linear-gradient(135deg, ${hsla(surfaceHue, surfaceSat, 12, 0.96)}, ${hsla(bg2Dark.h, bg2Dark.s, bg2Dark.l, 0.98)})`,
    codeBg: hsla(surfaceHue, clamp(surfaceSat + 6, 24, 58), 10, 1),
    codeHeader: hsla(surfaceHue, clamp(surfaceSat + 4, 24, 52), 13, 0.94),
    codePanel: hsla(surfaceHue, clamp(surfaceSat + 4, 24, 56), 16, 0.84),
    codeLine: `rgba(${hexToRgbString(accentHex)}, 0.18)`,
    codeInk: hsl(inkDark.h, inkDark.s, 95),
    codeMuted: hsl(mutedDark.h, mutedDark.s, 72),
    accentSoft: `rgba(${hexToRgbString(accentHex)}, 0.2)`,
    accentSoft2: `rgba(${hexToRgbString(accent2Hex)}, 0.18)`,
    accent3: accent3Hex,
  }
}

const THEME_VARIABLES = [
  '--accent',
  '--accent-2',
  '--accent-3',
  '--glow',
  '--accent-soft',
  '--accent-soft-2',
  '--ai-accent-rgb',
  '--ai-accent-2-rgb',
  '--ai-accent-3-rgb',
  '--ai-bg-0-dark',
  '--ai-bg-dark',
  '--ai-bg-2-dark',
  '--ai-bg-rgb-dark',
  '--ai-surface-dark',
  '--ai-surface-strong-dark',
  '--ai-surface-strong-rgb-dark',
  '--ai-surface-soft-dark',
  '--ai-surface-raised-dark',
  '--ai-surface-hover-dark',
  '--ai-ink-dark',
  '--ai-ink-rgb-dark',
  '--ai-ink-soft-dark',
  '--ai-muted-dark',
  '--ai-line-dark',
  '--ai-line-strong-dark',
  '--ai-panel-gradient-dark',
  '--ai-code-bg-dark',
  '--ai-code-header-dark',
  '--ai-code-panel-dark',
  '--ai-code-line-dark',
  '--ai-code-ink-dark',
  '--ai-code-muted-dark',
]

export const THEME_PRESETS: Array<{ id: ThemePresetId; baseHex: string; mood: string }> = [
  { id: 'aurora', baseHex: '#6B8FAD', mood: 'ambient' },
  { id: 'sunset', baseHex: '#F4726C', mood: 'dramatic' },
  { id: 'mono', baseHex: '#BCCCDC', mood: 'classical' },
  { id: 'neon', baseHex: '#00D4FF', mood: 'synthwave' },
  { id: 'mist', baseHex: '#AFC3DB', mood: 'ambient' },
  { id: 'iris', baseHex: '#B4A6EB', mood: 'dreamy' },
  { id: 'ember', baseHex: '#FF5A2B', mood: 'energetic' },
]

export const getThemePreset = (presetId: ThemePresetId) => THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0]

export const getThemePreviewSwatches = (baseHex: string, mood: string) => generateHarmonicTheme(baseHex, mood).previewSwatches

export const getBaseThemePreviewSwatches = () => [...SYSTEM_BASE_THEME.previewSwatches]

const applyThemePalette = (baseHex: string, mood: string) => {
  const theme = generateHarmonicTheme(baseHex, mood)
  const root = document.documentElement
  const darkPalette = buildDarkPalette(theme.baseHsl, theme.accent, theme.accent2, theme.accent3)

  root.setAttribute('data-ai-theme-base', baseHex)
  root.setAttribute('data-ai-theme-mood', mood)

  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-2', theme.accent2)
  root.style.setProperty('--accent-3', theme.accent3)
  root.style.setProperty('--ai-accent-rgb', hexToRgbString(theme.accent))
  root.style.setProperty('--ai-accent-2-rgb', hexToRgbString(theme.accent2))
  root.style.setProperty('--ai-accent-3-rgb', hexToRgbString(theme.accent3))
  root.style.setProperty('--glow', `rgba(${hexToRgbString(theme.accentGlow)}, ${clamp(theme.glowAlpha, 0.18, 0.9)})`)
  root.style.setProperty('--accent-soft', darkPalette.accentSoft)
  root.style.setProperty('--accent-soft-2', darkPalette.accentSoft2)
  root.style.setProperty('--ai-bg-0-dark', darkPalette.bg0)
  root.style.setProperty('--ai-bg-dark', darkPalette.bg)
  root.style.setProperty('--ai-bg-2-dark', darkPalette.bg2)
  root.style.setProperty('--ai-bg-rgb-dark', darkPalette.bgRgb)
  root.style.setProperty('--ai-surface-dark', darkPalette.surface)
  root.style.setProperty('--ai-surface-strong-dark', darkPalette.surfaceStrong)
  root.style.setProperty('--ai-surface-strong-rgb-dark', darkPalette.surfaceStrongRgb)
  root.style.setProperty('--ai-surface-soft-dark', darkPalette.surfaceSoft)
  root.style.setProperty('--ai-surface-raised-dark', darkPalette.surfaceRaised)
  root.style.setProperty('--ai-surface-hover-dark', darkPalette.surfaceHover)
  root.style.setProperty('--ai-ink-dark', darkPalette.ink)
  root.style.setProperty('--ai-ink-rgb-dark', darkPalette.inkRgb)
  root.style.setProperty('--ai-ink-soft-dark', darkPalette.inkSoft)
  root.style.setProperty('--ai-muted-dark', darkPalette.muted)
  root.style.setProperty('--ai-line-dark', darkPalette.line)
  root.style.setProperty('--ai-line-strong-dark', darkPalette.lineStrong)
  root.style.setProperty('--ai-panel-gradient-dark', darkPalette.panelGradient)
  root.style.setProperty('--ai-code-bg-dark', darkPalette.codeBg)
  root.style.setProperty('--ai-code-header-dark', darkPalette.codeHeader)
  root.style.setProperty('--ai-code-panel-dark', darkPalette.codePanel)
  root.style.setProperty('--ai-code-line-dark', darkPalette.codeLine)
  root.style.setProperty('--ai-code-ink-dark', darkPalette.codeInk)
  root.style.setProperty('--ai-code-muted-dark', darkPalette.codeMuted)
}

const buildSpectrumStops = (options: {
  baseHex: string
  mood: string
  intensity: number
  mixBaseHex?: string
  mixMood?: string
  mixWeight?: number
}) => {
  const { baseHex, mood, intensity, mixBaseHex, mixMood, mixWeight = 0.3 } = options
  const normalizedIntensity = clamp(intensity, 0.15, 1)
  const primaryStops = getThemePreviewSwatches(baseHex, mood).map((hex) => hexToHsl(hex))
  const secondaryStops = mixBaseHex && mixMood ? getThemePreviewSwatches(mixBaseHex, mixMood).map((hex) => hexToHsl(hex)) : []
  const previewColors = blendStops(primaryStops, secondaryStops, mixWeight)

  return previewColors.map((stop, index) =>
    shiftHsl(
      stop,
      index % 2 === 0 ? normalizedIntensity * 8 : -normalizedIntensity * 10,
      normalizedIntensity * 10 - index * 1.5,
      index === previewColors.length - 1 ? -2 : 2 - index,
    ),
  )
}

const getSpectrumThemeHexAtTime = (stops: HSL[], durationSeconds: number, timestampMs: number) => {
  const progress = ((timestampMs / 1000) % durationSeconds) / durationSeconds
  const scaled = progress * stops.length
  const fromIndex = Math.floor(scaled) % stops.length
  const toIndex = (fromIndex + 1) % stops.length
  const amount = easeInOutSine(scaled - Math.floor(scaled))
  const mixed = interpolateHsl(stops[fromIndex], stops[toIndex], amount)

  return hslToHex(mixed)
}

export const getCurrentSpectrumThemeHex = (options: {
  baseHex: string
  mood: string
  speedSeconds: number
  intensity: number
  mixBaseHex?: string
  mixMood?: string
  mixWeight?: number
}) => {
  const stops = buildSpectrumStops(options)
  const duration = clamp(options.speedSeconds * 1.15, 45, 220)
  return getSpectrumThemeHexAtTime(stops, duration, Date.now())
}

export const applyAITheme = (baseHex: string, mood: string) => {
  if (typeof document === 'undefined') {
    return
  }

  applyThemePalette(baseHex, mood)
}

export const applyThemePreset = (presetId: ThemePresetId) => {
  const preset = getThemePreset(presetId)
  applyAITheme(preset.baseHex, preset.mood)
}

export const startSmoothThemeTransition = (options: {
  targetBaseHex: string
  targetMood: string
  durationMs?: number
  fallbackBaseHex?: string
  fallbackMood?: string
}) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => undefined
  }

  const { targetBaseHex, targetMood, durationMs = 850, fallbackBaseHex = targetBaseHex, fallbackMood = targetMood } = options
  const root = document.documentElement
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const appliedBaseHex = normalizeHex(root.getAttribute('data-ai-theme-base') ?? '')
  const appliedMood = root.getAttribute('data-ai-theme-mood')?.trim() || fallbackMood
  const fromBaseHex = appliedBaseHex || fallbackBaseHex
  const fromMood = appliedMood || fallbackMood

  if (prefersReducedMotion || durationMs <= 0 || fromBaseHex === targetBaseHex) {
    applyThemePalette(targetBaseHex, targetMood)
    return () => undefined
  }

  const start = hexToHsl(fromBaseHex)
  const end = hexToHsl(targetBaseHex)
  const startedAt = performance.now()
  const transitionDuration = clamp(durationMs, 240, 2200)
  let frameId = 0
  let stopped = false

  const paint = (timestamp: number) => {
    if (stopped) {
      return
    }

    const elapsed = timestamp - startedAt
    const progress = clamp(elapsed / transitionDuration, 0, 1)
    const eased = easeInOutSine(progress)
    const mixed = interpolateHsl(start, end, eased)
    const mood = progress < 0.38 ? fromMood : targetMood

    applyThemePalette(hslToHex(mixed), mood)

    if (progress >= 1) {
      applyThemePalette(targetBaseHex, targetMood)
      return
    }

    frameId = window.requestAnimationFrame(paint)
  }

  frameId = window.requestAnimationFrame(paint)

  return () => {
    stopped = true
    window.cancelAnimationFrame(frameId)
  }
}

export const startDynamicSpectrumTheme = (options: {
  baseHex: string
  mood: string
  speedSeconds: number
  intensity: number
  mixBaseHex?: string
  mixMood?: string
  mixWeight?: number
}) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => undefined
  }

  const { baseHex, mood, speedSeconds, intensity, mixBaseHex, mixMood, mixWeight = 0.3 } = options
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stops = buildSpectrumStops({
    baseHex,
    mood,
    intensity,
    mixBaseHex,
    mixMood,
    mixWeight,
  })
  const duration = clamp(speedSeconds * 1.15, 45, 220)
  const initialThemeHex = getSpectrumThemeHexAtTime(stops, duration, Date.now())

  if (prefersReducedMotion) {
    applyThemePalette(initialThemeHex, mood)
    return () => undefined
  }

  let frameId = 0
  let lastPaint = 0
  let stopped = false

  const paint = (timestamp: number) => {
    if (stopped) {
      return
    }

    frameId = window.requestAnimationFrame(paint)
    const absoluteTimestamp = performance.timeOrigin + timestamp

    if (document.visibilityState === 'hidden') {
      return
    }

    if (absoluteTimestamp - lastPaint < 120) {
      return
    }

    lastPaint = absoluteTimestamp
    applyThemePalette(getSpectrumThemeHexAtTime(stops, duration, absoluteTimestamp), mood)
  }

  applyThemePalette(initialThemeHex, mood)
  frameId = window.requestAnimationFrame(paint)

  return () => {
    stopped = true
    window.cancelAnimationFrame(frameId)
  }
}

export const resetAITheme = () => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.removeAttribute('data-ai-theme-base')
  root.removeAttribute('data-ai-theme-mood')
  for (const variableName of THEME_VARIABLES) {
    root.style.removeProperty(variableName)
  }
}
