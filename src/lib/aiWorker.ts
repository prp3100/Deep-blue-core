import { env, pipeline } from '@huggingface/transformers'

env.allowLocalModels = false

type ClassifierFn = (
  input: string,
  labels: string[],
  options?: Record<string, unknown>,
) => Promise<{ labels: string[]; scores: number[] }>

let classifier: ClassifierFn | null = null
let classifierPromise: Promise<ClassifierFn> | null = null

export type AIWorkerRequest = {
  requestId: number
  text: string
}

export type AIWorkerResponse =
  | { requestId: number; status: 'loading' }
  | { requestId: number; status: 'ready' }
  | { requestId: number; status: 'complete'; result: string; latencyMs: number }
  | { requestId: number; status: 'error'; error: string }

type MusicProfile = {
  id: string
  candidateLabel: string
  keywords: string[]
}

const MUSIC_PROFILES: MusicProfile[] = [
  { id: 'ambient', candidateLabel: 'ambient atmospheric soundscape', keywords: ['ambient', 'atmospheric', 'soundscape', 'drone', 'meditation'] },
  { id: 'lofi', candidateLabel: 'lofi chill beat', keywords: ['lofi', 'lo-fi', 'chillhop', 'study beat', 'relax beat'] },
  { id: 'acoustic', candidateLabel: 'acoustic singer songwriter song', keywords: ['acoustic', 'unplugged', 'guitar', 'singer-songwriter', 'stripped'] },
  { id: 'jazz', candidateLabel: 'jazz improvisation track', keywords: ['jazz', 'swing', 'bebop', 'improv', 'fusion'] },
  { id: 'funk', candidateLabel: 'funk groove jam', keywords: ['funk', 'groove', 'bassline', 'boogie', 'disco', 'soul train'] },
  { id: 'rock', candidateLabel: 'rock anthem', keywords: ['rock', 'anthem', 'band', 'guitar riff', 'alt rock', 'punk'] },
  { id: 'metal', candidateLabel: 'metal heavy track', keywords: ['metal', 'heavy', 'hardcore', 'deathcore', 'thrash', 'black metal'] },
  { id: 'pop', candidateLabel: 'pop hit song', keywords: ['pop', 'radio edit', 'hit single', 'chart', 'mainstream'] },
  { id: 'hip-hop', candidateLabel: 'hip hop rap track', keywords: ['hip hop', 'hip-hop', 'rap', 'boom bap', 'lyric video'] },
  { id: 'rnb', candidateLabel: 'rnb soul groove track', keywords: ['rnb', 'r&b', 'neo soul', 'slow jam', 'love song'] },
  { id: 'trap', candidateLabel: 'trap drill rap track', keywords: ['trap', 'drill', '808', 'rage beat', 'street anthem'] },
  { id: 'phonk', candidateLabel: 'phonk drift edit track', keywords: ['phonk', 'drift phonk', 'cowbell', 'memphis', 'drift edit'] },
  { id: 'latin', candidateLabel: 'latin reggaeton dance hit', keywords: ['latin', 'reggaeton', 'bachata', 'salsa', 'latin pop'] },
  { id: 'kpop', candidateLabel: 'kpop idol comeback song', keywords: ['kpop', 'k-pop', 'idol', 'comeback', 'girl group', 'boy group'] },
  { id: 'edm', candidateLabel: 'edm festival banger', keywords: ['edm', 'festival', 'drop', 'dance', 'big room'] },
  { id: 'house', candidateLabel: 'house club groove', keywords: ['house', 'club mix', 'deep house', 'tech house', 'garage'] },
  { id: 'techno', candidateLabel: 'techno warehouse track', keywords: ['techno', 'warehouse', 'minimal techno', 'hard techno'] },
  { id: 'synthwave', candidateLabel: 'synthwave cyberpunk soundtrack', keywords: ['synthwave', 'retrowave', 'outrun', 'cyberpunk', 'neon noir'] },
  { id: 'dramatic', candidateLabel: 'dramatic cinematic score', keywords: ['dramatic', 'drama', 'cinematic', 'soundtrack', 'ost', 'trailer'] },
  { id: 'epic', candidateLabel: 'epic orchestral trailer music', keywords: ['epic', 'heroic', 'orchestral', 'trailer music', 'boss theme'] },
  { id: 'anime', candidateLabel: 'anime opening soundtrack', keywords: ['anime', 'opening', 'ending theme', 'anisong', 'j-rock'] },
  { id: 'classical', candidateLabel: 'classical orchestral performance', keywords: ['classical', 'symphony', 'concerto', 'orchestra'] },
  { id: 'piano', candidateLabel: 'piano solo instrumental', keywords: ['piano', 'solo piano', 'instrumental piano', 'keys'] },
  { id: 'indie', candidateLabel: 'indie folk song', keywords: ['indie', 'folk', 'dream pop', 'shoegaze', 'bedroom pop'] },
]

const labelToId = new Map(MUSIC_PROFILES.map((profile) => [profile.candidateLabel, profile.id]))

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s&-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const scoreHeuristics = (query: string) => {
  const scores = new Map<string, number>()
  const padded = ` ${normalizeText(query)} `

  for (const profile of MUSIC_PROFILES) {
    let score = 0

    for (const keyword of profile.keywords) {
      const normalizedKeyword = normalizeText(keyword)
      if (!normalizedKeyword) {
        continue
      }

      if (padded.includes(` ${normalizedKeyword} `)) {
        score += normalizedKeyword.includes(' ') ? 0.34 : 0.18
      }
    }

    if (score > 0) {
      scores.set(profile.id, Math.min(0.68, score))
    }
  }

  return scores
}

const mergeScores = (modelLabels: string[], modelScores: number[], heuristicScores: Map<string, number>) => {
  let bestId = 'ambient'
  let bestScore = -1

  for (const profile of MUSIC_PROFILES) {
    const modelIndex = modelLabels.findIndex((label) => labelToId.get(label) === profile.id)
    const modelScore = modelIndex >= 0 ? modelScores[modelIndex] ?? 0 : 0
    const heuristicScore = heuristicScores.get(profile.id) ?? 0
    const combinedScore = modelScore * 0.82 + heuristicScore

    if (combinedScore > bestScore) {
      bestScore = combinedScore
      bestId = profile.id
    }
  }

  return bestId
}

self.addEventListener('message', async (event: MessageEvent<AIWorkerRequest>) => {
  const { requestId } = event.data
  const text = normalizeText(event.data.text)

  const getClassifier = async () => {
    if (classifier) {
      return classifier
    }

    self.postMessage({ requestId, status: 'loading' })

    if (!classifierPromise) {
      classifierPromise = pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli')
        .then((instance) => {
          const resolved = instance as ClassifierFn
          classifier = resolved
          return resolved
        })
        .catch((error) => {
          classifierPromise = null
          throw error
        })
    }

    const activeClassifier = await classifierPromise
    self.postMessage({ requestId, status: 'ready' })
    return activeClassifier
  }

  try {
    const activeClassifier = await getClassifier()

    if (!text) {
      self.postMessage({ requestId, status: 'complete', result: 'ambient', latencyMs: 0 })
      return
    }

    const startedAt = performance.now()
    const output = await activeClassifier(
      text,
      MUSIC_PROFILES.map((profile) => profile.candidateLabel),
      {
        multi_label: true,
        hypothesis_template: 'This track is best described as {}.',
      },
    )
    const finishedAt = performance.now()

    const heuristicScores = scoreHeuristics(text)
    const mood = mergeScores(output.labels, output.scores, heuristicScores)

    self.postMessage({ requestId, status: 'complete', result: mood, latencyMs: Math.round(finishedAt - startedAt) })
  } catch (error: unknown) {
    console.error('AI Worker error:', error)
    self.postMessage({
      requestId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error inside AI worker',
    })
  }
})
