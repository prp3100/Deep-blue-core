const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

const normalizeHostname = (value: string) => value.trim().toLowerCase().replace(/^\[|\]$/g, '')

export const isLoopbackHostname = (value: string) => {
  const normalized = normalizeHostname(value)
  return LOOPBACK_HOSTNAMES.has(normalized)
}

export const isHostnameMatch = (hostname: string, allowedHostnames: string[]) => {
  const normalizedHostname = normalizeHostname(hostname)

  return allowedHostnames.some((candidate) => {
    const normalizedCandidate = normalizeHostname(candidate)
    return normalizedHostname === normalizedCandidate || normalizedHostname.endsWith(`.${normalizedCandidate}`)
  })
}

export const sanitizeNetworkUrl = (
  rawValue: string,
  options?: {
    allowHttpLoopback?: boolean
    stripSearch?: boolean
    stripHash?: boolean
  },
) => {
  const trimmed = rawValue.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    const allowHttpLoopback = options?.allowHttpLoopback ?? false

    if (protocol !== 'https:' && !(allowHttpLoopback && protocol === 'http:' && isLoopbackHostname(parsed.hostname))) {
      return ''
    }

    if (parsed.username || parsed.password) {
      return ''
    }

    if (options?.stripSearch) {
      parsed.search = ''
    }

    if (options?.stripHash) {
      parsed.hash = ''
    }

    return parsed.toString()
  } catch {
    return ''
  }
}

export const createPrivacyPreservingRequestInit = (init: RequestInit = {}): RequestInit => ({
  credentials: 'omit',
  referrerPolicy: 'no-referrer',
  ...init,
})
