import handler from '../api/v1/recommendations.js'

const request = new Request('https://careero.test/api/v1/recommendations', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.40' },
  body: JSON.stringify({
    profile: {
      normalizedScores: { R: 12, I: 30, A: 20, S: 16, E: 10, C: 22 },
      archetypeCode: 'IC',
    },
    location: { country: 'Philippines', city: '', region: 'Central Luzon' },
    language: 'en',
    topProfession: { id: 'data-scientist', title: 'Data Scientist', matchPercent: 94 },
  }),
})

const response = await handler(request)
const body = await response.json()
const summary = {
  statusCode: response.status,
  provider: body.meta?.providerUsed,
  schools: body.recommendations?.schools?.length || 0,
  programs: body.recommendations?.scholarshipsAndPrograms?.length || 0,
  sources: body.recommendations?.sources?.length || 0,
  error: body.error,
}

console.log(JSON.stringify(summary, null, 2))
if (!response.ok || summary.schools < 5 || summary.schools > 10 || summary.programs < 5 || summary.programs > 10) process.exit(1)
