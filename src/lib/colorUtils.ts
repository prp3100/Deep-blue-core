export type HSL = { h: number; s: number; l: number }
export type RGB = { r: number; g: number; b: number }

type ThemeRecipe = {
  aliases: string[]
  accent: HslShift
  accent2: HslShift
  accent3: HslShift
  glow: HslShift
  anchor: HslShift
  glowAlpha: number
}

type HslShift = {
  hueShift?: number
  saturation?: number
  saturationBoost?: number
  saturationMin?: number
  saturationMax?: number
  lightness?: number
  lightnessBoost?: number
  lightnessMin?: number
  lightnessMax?: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const wrapHue = (value: number) => ((value % 360) + 360) % 360

const tuneHsl = (base: HSL, shift: HslShift): HSL => {
  const saturationCandidate =
    shift.saturation ?? clamp(base.s + (shift.saturationBoost ?? 0), shift.saturationMin ?? 18, shift.saturationMax ?? 98)
  const lightnessCandidate =
    shift.lightness ?? clamp(base.l + (shift.lightnessBoost ?? 0), shift.lightnessMin ?? 14, shift.lightnessMax ?? 88)

  return {
    h: wrapHue(base.h + (shift.hueShift ?? 0)),
    s: saturationCandidate,
    l: lightnessCandidate,
  }
}

const THEME_RECIPES: ThemeRecipe[] = [
  {
    aliases: ['energetic', 'edm', 'house', 'techno', 'trance', 'drum-and-bass', 'dnb'],
    accent: { hueShift: 8, saturationBoost: 30, saturationMin: 78, lightnessMin: 54, lightnessMax: 66 },
    accent2: { hueShift: 154, saturation: 92, lightness: 60 },
    accent3: { hueShift: 238, saturation: 74, lightness: 24 },
    glow: { hueShift: 88, saturation: 94, lightness: 54 },
    anchor: { hueShift: 290, saturation: 42, lightness: 18 },
    glowAlpha: 0.84,
  },
  {
    aliases: ['cyberpunk', 'synthwave'],
    accent: { hueShift: 18, saturationBoost: 36, saturationMin: 82, lightnessMin: 56, lightnessMax: 68 },
    accent2: { hueShift: 150, saturation: 96, lightness: 62 },
    accent3: { hueShift: 252, saturation: 78, lightness: 20 },
    glow: { hueShift: 116, saturation: 98, lightness: 56 },
    anchor: { hueShift: 276, saturation: 48, lightness: 16 },
    glowAlpha: 0.86,
  },
  {
    aliases: ['pop', 'hip-hop', 'hiphop', 'rap', 'rnb', 'latin', 'kpop'],
    accent: { hueShift: 0, saturationBoost: 24, saturationMin: 76, lightnessMin: 58, lightnessMax: 74 },
    accent2: { hueShift: 44, saturation: 92, lightness: 66 },
    accent3: { hueShift: 268, saturation: 68, lightness: 26 },
    glow: { hueShift: 328, saturation: 96, lightness: 56 },
    anchor: { hueShift: 208, saturation: 44, lightness: 18 },
    glowAlpha: 0.62,
  },
  {
    aliases: ['rock', 'metal', 'industrial', 'trap', 'phonk'],
    accent: { hueShift: 6, saturationBoost: 18, saturationMin: 72, lightnessMin: 34, lightnessMax: 48 },
    accent2: { hueShift: 214, saturation: 88, lightness: 54 },
    accent3: { hueShift: 356, saturation: 78, lightness: 28 },
    glow: { hueShift: 16, saturation: 94, lightness: 48 },
    anchor: { hueShift: 302, saturation: 22, lightness: 12 },
    glowAlpha: 0.7,
  },
  {
    aliases: ['epic', 'dramatic', 'cinematic', 'orchestral', 'soundtrack', 'anime'],
    accent: { hueShift: 10, saturationBoost: 12, saturationMin: 64, lightnessMin: 42, lightnessMax: 56 },
    accent2: { hueShift: 188, saturation: 82, lightness: 58 },
    accent3: { hueShift: 262, saturation: 56, lightness: 24 },
    glow: { hueShift: 54, saturation: 88, lightness: 62 },
    anchor: { hueShift: 310, saturation: 36, lightness: 16 },
    glowAlpha: 0.72,
  },
  {
    aliases: ['jazz', 'blues', 'soul', 'funk', 'disco'],
    accent: { hueShift: 18, saturationBoost: 14, saturationMin: 62, lightnessMin: 44, lightnessMax: 58 },
    accent2: { hueShift: 232, saturation: 72, lightness: 48 },
    accent3: { hueShift: 332, saturation: 46, lightness: 24 },
    glow: { hueShift: 54, saturation: 82, lightness: 56 },
    anchor: { hueShift: 290, saturation: 28, lightness: 18 },
    glowAlpha: 0.48,
  },
  {
    aliases: ['ambient', 'lofi', 'chill', 'chillhop', 'dreamy', 'indie', 'piano'],
    accent: { hueShift: -8, saturationBoost: 2, saturationMin: 38, saturationMax: 62, lightnessMin: 62, lightnessMax: 78 },
    accent2: { hueShift: 32, saturation: 46, lightness: 72 },
    accent3: { hueShift: 204, saturation: 28, lightness: 28 },
    glow: { hueShift: 92, saturation: 56, lightness: 68 },
    anchor: { hueShift: 238, saturation: 24, lightness: 18 },
    glowAlpha: 0.28,
  },
  {
    aliases: ['acoustic', 'classical', 'folk'],
    accent: { hueShift: -4, saturationBoost: -4, saturationMin: 34, saturationMax: 56, lightnessMin: 54, lightnessMax: 68 },
    accent2: { hueShift: 168, saturation: 38, lightness: 60 },
    accent3: { hueShift: 228, saturation: 24, lightness: 24 },
    glow: { hueShift: 24, saturation: 44, lightness: 70 },
    anchor: { hueShift: 194, saturation: 22, lightness: 18 },
    glowAlpha: 0.32,
  },
]

const findThemeRecipe = (mood: string) => {
  const normalizedMood = mood.trim().toLowerCase()
  return THEME_RECIPES.find((recipe) => recipe.aliases.includes(normalizedMood)) ?? THEME_RECIPES[THEME_RECIPES.length - 1]
}

const toHexFromHsl = (value: HSL) => {
  const rgb = hslToRgb(value.h, value.s, value.l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  s /= 100
  l /= 100
  h /= 360

  let r
  let g
  let b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`

const hexToRgb = (hex: string) => {
  let sanitized = hex.replace('#', '')
  if (sanitized.length === 3 || sanitized.length === 4) {
    sanitized = sanitized
      .slice(0, 3)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  } else {
    sanitized = sanitized.slice(0, 6)
  }

  const value = Number.parseInt(sanitized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export const extractDominantColor = async (imageUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Canvas not available'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const MAX_WIDTH = 64
      const MAX_HEIGHT = 64
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height
        height = MAX_HEIGHT
      }

      canvas.width = Math.floor(width)
      canvas.height = Math.floor(height)

      if (!ctx) {
        reject(new Error('No 2d context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      try {
        const data = ctx.getImageData(0, 0, width, height).data
        let r = 0
        let g = 0
        let b = 0
        let count = 0

        for (let index = 0; index < data.length; index += 16) {
          if (data[index + 3] > 128) {
            const pixelR = data[index]
            const pixelG = data[index + 1]
            const pixelB = data[index + 2]
            const brightness = (pixelR + pixelG + pixelB) / 3

            if (brightness > 20 && brightness < 235) {
              r += pixelR
              g += pixelG
              b += pixelB
              count += 1
            }
          }
        }

        resolve(count > 0 ? rgbToHex(r / count, g / count, b / count) : '#6B8FAD')
      } catch (error) {
        console.warn('Canvas processing error, CORS?', error)
        resolve('#6B8FAD')
      }
    }
    img.onerror = () => {
      console.warn('Image failed to load for color extraction:', imageUrl)
      resolve('#6B8FAD')
    }
    img.src =
      imageUrl.includes('ytimg.com') ||
      imageUrl.includes('youtube.com') ||
      imageUrl.includes('soundcloud') ||
      imageUrl.includes('scdn.co') ||
      imageUrl.includes('spotify')
        ? `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
        : imageUrl
  })

export const generateHarmonicTheme = (baseHex: string, mood: string) => {
  const rgb = hexToRgb(baseHex)
  const baseHsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const recipe = findThemeRecipe(mood)

  const accentHsl = tuneHsl(baseHsl, recipe.accent)
  const accent2Hsl = tuneHsl(baseHsl, recipe.accent2)
  const accent3Hsl = tuneHsl(baseHsl, recipe.accent3)
  const glowHsl = tuneHsl(baseHsl, recipe.glow)
  const anchorHsl = tuneHsl(baseHsl, recipe.anchor)

  const accent = toHexFromHsl(accentHsl)
  const accent2 = toHexFromHsl(accent2Hsl)
  const accent3 = toHexFromHsl(accent3Hsl)
  const accentGlow = toHexFromHsl(glowHsl)
  const anchor = toHexFromHsl(anchorHsl)

  return {
    accent,
    accent2,
    accent3,
    accentGlow,
    anchor,
    previewSwatches: [accent, accent2, accent3, accentGlow, anchor],
    glowAlpha: recipe.glowAlpha,
    baseHsl,
  }
}
