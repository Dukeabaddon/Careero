import { useTranslation } from 'react-i18next'
import { optionImage, REACTION_KEYS } from '@/features/assessment/utils/assessmentUtils.js'
import ReactionCard from '@/features/assessment/components/ReactionCard.jsx'

export default function ChoiceCard({
  optionKey,
  optionIndex,
  question,
  option,
  isSelected,
  responseRating,
  onSelectOption,
  onOptionDoubleClick,
  onReactionDoubleClick,
}) {
  const { t } = useTranslation()
  const imageOption = optionIndex === 0 ? 'a' : 'b'

  return (
    <div className="choice-card-wrap border-2 rounded-3xl p-6 bg-white transition-all flex flex-col justify-between border-slate-200">
      <button
        type="button"
        className="choice-card-select cursor-pointer w-full text-left border-0 bg-transparent p-0"
        onClick={(event) => onSelectOption(optionKey, null, event.timeStamp)}
        onDoubleClick={(event) => onOptionDoubleClick(optionKey, event.timeStamp)}
      >
        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#fcfcfc] flex items-center justify-center">
          <img
            src={optionImage(question?.id || 1, imageOption)}
            alt={option.text || ''}
            className="w-full h-full object-contain p-2"
          />
        </div>
        <h3 className="font-bold text-slate-800 text-base mb-3">{option.text}</h3>
      </button>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
        {REACTION_KEYS.map((cfg) => (
          <ReactionCard
            key={cfg.value}
            config={cfg}
            label={t(cfg.labelKey)}
            isSelected={isSelected && responseRating === cfg.value}
            onClick={(event) => onSelectOption(optionKey, cfg.value, event.timeStamp)}
            onDoubleClick={(event) => onReactionDoubleClick(optionKey, cfg.value, event.timeStamp)}
          />
        ))}
      </div>
    </div>
  )
}
