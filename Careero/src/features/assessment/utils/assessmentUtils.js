import questionsData from '@/features/assessment/data/questions.json'

export const defaultQuestions = questionsData.questions || questionsData

const questionAssets = import.meta.glob('@/assets/riasec/questions/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function resolveQuestionsList(questions) {
  if (Array.isArray(questions)) return questions
  if (Array.isArray(questions?.questions)) return questions.questions
  return defaultQuestions
}

export function optionImage(questionId, option) {
  const filename = `q${String(questionId).padStart(2, '0')}_${option.toLowerCase()}.webp`
  return Object.entries(questionAssets).find(([path]) => path.endsWith(filename))?.[1]
}

export function upsertResponse(responses, response) {
  const existingIndex = responses.findIndex(({ questionId }) => questionId === response.questionId)
  if (existingIndex === -1) return [...responses, response]
  return responses.map((item, index) => (index === existingIndex ? response : item))
}

export const REACTION_KEYS = [
  { value: 1, labelKey: 'quiz.reactionJustOkay', gif: '/reactions/just-okay.gif' },
  { value: 2, labelKey: 'quiz.reactionGreat', gif: '/reactions/wow.gif' },
  { value: 3, labelKey: 'quiz.reactionLoveIt', gif: '/reactions/love-it.gif' },
]
