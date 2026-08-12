import { Assessment } from '@/features/assessment'

export default function AssessmentPage({
  assessmentState,
  onUpdateState,
  onComplete,
  onReset,
}) {
  return (
    <Assessment
      assessmentState={assessmentState}
      onUpdateState={onUpdateState}
      onComplete={onComplete}
      onReset={onReset}
    />
  )
}
