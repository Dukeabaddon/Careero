import { useEffect } from 'react'

export function useAssessmentKeyboard({
  enabled,
  onUpdateState,
  onComplete,
  selectOptionAndRatingRef,
  moveNextRef,
  questionRef,
  latestResponseRef,
}) {
  useEffect(() => {
    if (!enabled) return undefined

    const handleKeyboard = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (
        event.target instanceof HTMLInputElement
        || event.target instanceof HTMLSelectElement
        || event.target instanceof HTMLTextAreaElement
      ) return

      const key = event.key
      if (key === 'ArrowLeft' || key.toLowerCase() === 'a') {
        selectOptionAndRatingRef.current('optionA', null, event.timeStamp)
        return
      }
      if (key === 'ArrowRight' || key.toLowerCase() === 'b') {
        selectOptionAndRatingRef.current('optionB', null, event.timeStamp)
        return
      }
      if (['1', '2', '3'].includes(key) && latestResponseRef.current?.selectedCode) {
        const activeQuestion = questionRef.current
        const activeOptKey = latestResponseRef.current.selectedCode === activeQuestion?.optionA?.code ? 'optionA' : 'optionB'
        selectOptionAndRatingRef.current(activeOptKey, Number(key), event.timeStamp)
        return
      }
      if ((key === 'Enter' || key === 'NumpadEnter') && latestResponseRef.current?.rating) {
        event.preventDefault()
        moveNextRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyboard, true)
    return () => document.removeEventListener('keydown', handleKeyboard, true)
  }, [enabled, onComplete, onUpdateState, selectOptionAndRatingRef, moveNextRef, questionRef, latestResponseRef])
}
