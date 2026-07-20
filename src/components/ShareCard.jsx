import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ShareCard({ archetype, profile, topProfession }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const location = [profile.location.city || profile.location.region, profile.location.country].filter(Boolean).join(', ')
  const shareText = t('results.shareText', {
    archetype: archetype.title,
    code: profile.archetypeCode,
    profession: topProfession.title,
    percent: topProfession.matchPercent,
  })

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: t('results.shareTitle'), text: shareText, url: window.location.href })
        setStatus('shared')
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
        setStatus('copied')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('failed')
    }
  }

  return (
    <section className="share-section" aria-labelledby="share-card-title">
      <div className="share-card">
        <img src={archetype.image} alt="" />
        <div className="share-card-copy">
          <p className="eyebrow">Careero · {profile.archetypeCode}</p>
          <h2 id="share-card-title">{archetype.title}</h2>
          <p>{t('results.shareProfession', { profession: topProfession.title, percent: topProfession.matchPercent })}</p>
          <span>{location}</span>
        </div>
        <strong aria-hidden="true">{profile.archetypeCode}</strong>
      </div>
      <div className="share-actions">
        <div>
          <h2>{t('results.shareHeading')}</h2>
          <p>{t('results.shareDescription')}</p>
        </div>
        <button className="primary-button" type="button" onClick={share}>
          {status === 'copied' || status === 'shared' ? <Check size={18} /> : navigator.share ? <Share2 size={18} /> : <Copy size={18} />}
          {t(status === 'copied' ? 'results.copied' : status === 'shared' ? 'results.shared' : 'results.share')}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{status === 'failed' ? t('results.shareFailed') : status ? t(`results.${status}`) : ''}</p>
    </section>
  )
}
