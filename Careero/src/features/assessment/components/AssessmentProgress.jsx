import { useTranslation } from 'react-i18next'

export default function AssessmentProgress({ currentIndex, totalQuestions, progress }) {
  const { t } = useTranslation()

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
        <span>{t('quiz.questionOf', { current: currentIndex + 1, total: totalQuestions })}</span>
        <span>{t('quiz.percentComplete', { percent: Math.round(progress) })}</span>
      </div>

      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-blue-600 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{t('quiz.title')}</h1>
      <p className="text-sm text-slate-500">{t('quiz.subtitle')}</p>
    </div>
  )
}
