import { createProfileHash, readResultsCache, writeResultsCache } from '../utils/storage.js'

const inFlightRecommendations = new Map()

async function parseApiResponse(response) {
  if (typeof response.text !== 'function') return response.json()
  const body = await response.text()
  if (!body.trim()) {
    throw new Error(
      `Recommendation API returned an empty response (HTTP ${response.status}). Start Careero with npm run dev.`,
    )
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error('Recommendation API returned invalid JSON. Start Careero with npm run dev.')
  }
}

export async function getRecommendations(profile, topProfession, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const storage = options.storage ?? globalThis.localStorage
  const forceRefresh = options.forceRefresh ?? false
  const professionId = topProfession?.id || ''
  const profileHash = await createProfileHash(profile, professionId)

  if (!forceRefresh) {
    const cached = await readResultsCache(profileHash, storage)
    if (cached?.payload) {
      return { ...cached.payload, meta: { ...cached.payload.meta, cached: true }, profileHash }
    }
  }

  if (inFlightRecommendations.has(profileHash)) return inFlightRecommendations.get(profileHash)

  const generation = (async () => {
    const response = await fetchImpl('/api/v1/recommendations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        profile: {
          normalizedScores: profile.normalizedScores,
          archetypeCode: profile.archetypeCode,
        },
        location: profile.location,
        language: profile.language,
        topProfession: {
          id: topProfession.id,
          title: topProfession.title,
          matchPercent: topProfession.matchPercent,
        },
      }),
    })

    const payload = await parseApiResponse(response)
    if (!response.ok) throw new Error(payload.error || 'Unable to generate AI recommendations.')
    await writeResultsCache(profileHash, payload, storage)
    return { ...payload, profileHash }
  })()
  inFlightRecommendations.set(profileHash, generation)

  try {
    return await generation
  } finally {
    inFlightRecommendations.delete(profileHash)
  }
}
