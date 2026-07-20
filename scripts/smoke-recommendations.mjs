import { recommendationsHandler as handler } from '../api/v1/recommendations.js'

const payload = {
  profile: {
    normalizedScores: { R: 12, I: 30, A: 20, S: 16, E: 10, C: 22 },
    archetypeCode: 'IC',
  },
  location: { country: 'Philippines', city: '', region: 'Central Luzon' },
  language: 'en',
  topProfession: {
    id: 'data-scientists-15-2051-00',
    title: 'Data Scientists',
    matchPercent: 90,
  },
}

function createRequest() {
  return new Request('https://careero.test/api/v1/recommendations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.40' },
    body: JSON.stringify(payload),
  })
}

function usesHttpsOnly(recommendations) {
  const links = [
    ...(recommendations.schools || []).map((item) => item.website),
    ...(recommendations.scholarshipsAndPrograms || []).map((item) => item.website),
    ...(recommendations.sources || []).map((item) => item.uri),
  ]
  return links.length > 0 && links.every((link) => {
    try {
      return new URL(link).protocol === 'https:'
    } catch {
      return false
    }
  })
}

const response = await handler(createRequest())
const body = await response.json()
const repeatResponse = response.ok ? await handler(createRequest()) : null
const repeatBody = repeatResponse ? await repeatResponse.json() : null
const recommendations = body.recommendations || {}
const summary = {
  statusCode: response.status,
  repeatStatusCode: repeatResponse?.status,
  provider: body.meta?.providerUsed,
  schools: recommendations.schools?.length || 0,
  programs: recommendations.scholarshipsAndPrograms?.length || 0,
  sources: recommendations.sources?.length || 0,
  allLinksHttps: usesHttpsOnly(recommendations),
  cachedRepeat: repeatBody?.meta?.cached === true,
  cacheLayer: repeatBody?.meta?.cacheLayer,
  professionTitle: recommendations.professionSummary?.title,
  error: body.error,
}

console.log(JSON.stringify(summary, null, 2))

const validCounts =
  summary.schools <= 10 &&
  summary.programs <= 10 &&
  summary.schools + summary.programs > 0
const validProfession = summary.professionTitle === payload.topProfession.title

if (
  !response.ok ||
  !repeatResponse?.ok ||
  !validCounts ||
  !validProfession ||
  !summary.allLinksHttps ||
  !summary.cachedRepeat
) {
  process.exit(1)
}
