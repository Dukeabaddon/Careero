import { createProfileHash, readResultsCache, writeResultsCache } from '../utils/storage.js'

export async function getRecommendations(profile, topProfession, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const storage = options.storage ?? globalThis.localStorage
  const forceRefresh = options.forceRefresh ?? false
  const profileHash = await createProfileHash(profile)

  if (!forceRefresh) {
    const cached = await readResultsCache(profileHash, storage)
    if (cached?.payload) {
      return { ...cached.payload, meta: { ...cached.payload.meta, cached: true }, profileHash }
    }
  }

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

  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Unable to generate AI recommendations.')
  await writeResultsCache(profileHash, payload, storage)
  return { ...payload, profileHash }
}
