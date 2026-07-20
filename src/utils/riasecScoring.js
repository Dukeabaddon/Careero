export const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C']

export const OPPORTUNITY_COUNTS = Object.freeze({
  R: 10,
  I: 11,
  A: 9,
  S: 10,
  E: 9,
  C: 11,
})

export function calculateRiasecScores(responses = []) {
  return responses.reduce(
    (scores, response) => {
      if (RIASEC_CODES.includes(response?.selectedCode) && [1, 2, 3].includes(response?.rating)) {
        scores[response.selectedCode] += response.rating
      }
      return scores
    },
    Object.fromEntries(RIASEC_CODES.map((code) => [code, 0])),
  )
}

export function normalizeRiasecScores(rawScores, opportunityCounts = OPPORTUNITY_COUNTS) {
  return Object.fromEntries(
    RIASEC_CODES.map((code) => {
      const opportunities = opportunityCounts[code]
      if (!Number.isFinite(opportunities) || opportunities <= 0) {
        throw new RangeError(`Opportunity count for ${code} must be positive`)
      }
      const raw = Number(rawScores?.[code] ?? 0)
      return [code, Number(((raw * 11) / opportunities).toFixed(2))]
    }),
  )
}

export function getTopDimensions(scores, count = 2) {
  return RIASEC_CODES.map((code, index) => ({ code, score: Number(scores?.[code] ?? 0), index }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, count)
    .map(({ code, score }) => ({ code, score }))
}

export function pearsonCorrelation(candidate, career) {
  const user = RIASEC_CODES.map((code) => Number(candidate?.[code] ?? 0))
  const reference = RIASEC_CODES.map((code) => Number(career?.[code] ?? 0))
  const userMean = user.reduce((sum, value) => sum + value, 0) / user.length
  const referenceMean = reference.reduce((sum, value) => sum + value, 0) / reference.length
  let numerator = 0
  let userVariance = 0
  let referenceVariance = 0

  for (let index = 0; index < RIASEC_CODES.length; index += 1) {
    const userDelta = user[index] - userMean
    const referenceDelta = reference[index] - referenceMean
    numerator += userDelta * referenceDelta
    userVariance += userDelta ** 2
    referenceVariance += referenceDelta ** 2
  }

  const denominator = Math.sqrt(userVariance * referenceVariance)
  if (denominator === 0) return 0
  return Math.max(-1, Math.min(1, numerator / denominator))
}

export function correlationToMatchPercent(correlation) {
  return Math.round(((Math.max(-1, Math.min(1, correlation)) + 1) / 2) * 100)
}

export function rankCareerMatches(scores, careers) {
  return careers
    .map((career) => {
      const correlation = pearsonCorrelation(scores, career.vector)
      return { ...career, correlation, matchPercent: correlationToMatchPercent(correlation) }
    })
    .sort((left, right) => right.correlation - left.correlation)
}
