import { z } from 'zod'

export const QUIZ_STATE_KEY = 'global_quiz_state_v1'
export const RESULTS_CACHE_PREFIX = 'global_results_cache_'

const responseSchema = z.object({
  questionId: z.number().int().min(1).max(30),
  selectedCode: z.enum(['R', 'I', 'A', 'S', 'E', 'C']),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.null()]),
  timestamp: z.number(),
})

const assessmentStateSchema = z.object({
  version: z.literal(1),
  // `location` is nullable until the user selects a country.
  // `Assessment` gates the next step on `Boolean(location?.country)`.
  location: z
    .object({ country: z.string(), city: z.string().optional().default(''), region: z.string().optional() })
    .nullable(),
  language: z.string(),
  currentQuestionIndex: z.number().int().min(0).max(29),
  responses: z.array(responseSchema).max(30),
  isCompleted: z.boolean(),
})

export function loadQuizState(storage = globalThis.localStorage) {
  if (!storage) return null
  try {
    const raw = storage.getItem(QUIZ_STATE_KEY)
    if (!raw) return null
    return assessmentStateSchema.parse(JSON.parse(raw))
  } catch {
    storage.removeItem(QUIZ_STATE_KEY)
    return null
  }
}

export function saveQuizState(state, storage = globalThis.localStorage) {
  if (!storage) return
  const validated = assessmentStateSchema.parse(state)
  storage.setItem(QUIZ_STATE_KEY, JSON.stringify(validated))
}

export function clearQuizState(storage = globalThis.localStorage) {
  storage?.removeItem(QUIZ_STATE_KEY)
}

async function digestPayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function readResultsCache(profileHash, storage = globalThis.localStorage) {
  if (!storage) return null
  try {
    const raw = storage.getItem(`${RESULTS_CACHE_PREFIX}${profileHash}`)
    if (!raw) return null
    const entry = JSON.parse(raw)
    if (!entry.payload || entry.payloadDigest !== await digestPayload(entry.payload)) {
      storage.removeItem(`${RESULTS_CACHE_PREFIX}${profileHash}`)
      return null
    }
    return entry
  } catch {
    storage.removeItem(`${RESULTS_CACHE_PREFIX}${profileHash}`)
    return null
  }
}

export async function writeResultsCache(profileHash, payload, storage = globalThis.localStorage) {
  if (!storage) return
  const payloadDigest = await digestPayload(payload)
  storage.setItem(`${RESULTS_CACHE_PREFIX}${profileHash}`, JSON.stringify({
    payload,
    payloadDigest,
    cachedAt: new Date().toISOString(),
    profileHash,
  }))
}

export function clearCareerData(storage = globalThis.localStorage) {
  if (!storage) return
  const removable = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key === QUIZ_STATE_KEY || key?.startsWith(RESULTS_CACHE_PREFIX)) removable.push(key)
  }
  removable.forEach((key) => storage.removeItem(key))
}

export async function createProfileHash(profile, professionId = '') {
  const stablePayload = JSON.stringify({
    normalizedScores: Object.fromEntries(
      Object.entries(profile.normalizedScores).sort(([left], [right]) => left.localeCompare(right)),
    ),
    country: profile.location.country,
    city: profile.location.city,
    region: profile.location.region || '',
    language: profile.language,
    professionId: professionId || '',
  })
  return digestPayload(stablePayload)
}
