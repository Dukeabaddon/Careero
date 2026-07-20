import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Share2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  blobToShareFile,
  buildShareText,
  exportElementAsBlob,
  exportElementAsPng,
  getShareSiteUrl,
} from '../utils/shareExport.js'
import ShareCard from './ShareCard.jsx'

function ButtonSpinner() {
  return <span className="share-btn-spinner" aria-hidden="true" />
}

export default function ShareResultModal({
  open,
  onClose,
  archetype,
  profile,
  topProfession,
  theme,
}) {
  const { t } = useTranslation()
  const titleId = useId()
  const cardRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !sharing && !downloading) {
        setStatusMessage('')
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, sharing, downloading])

  const showStatus = (message) => {
    setStatusMessage(message)
    window.setTimeout(() => setStatusMessage(''), 3000)
  }

  const filename = `careero-${(profile?.archetypeCode || 'result').toLowerCase()}.png`

  const closeModal = () => {
    if (sharing || downloading) return
    setStatusMessage('')
    setSharing(false)
    setDownloading(false)
    onClose()
  }

  const handleShare = async () => {
    setSharing(true)
    setStatusMessage('')

    try {
      const exportResult = await exportElementAsBlob(cardRef.current)
      if (!exportResult.ok) {
        showStatus(t('results.shareFailed'))
        return
      }

      const text = buildShareText({
        archetypeTitle: archetype.title,
        code: profile.archetypeCode,
        profession: topProfession.title,
        percent: topProfession.matchPercent,
      })
      const file = blobToShareFile(exportResult.blob, filename)
      const sharePayload = {
        title: t('results.shareTitle'),
        text: `${text}\n\n${getShareSiteUrl()}`,
        files: [file],
      }

      if (navigator.canShare?.(sharePayload)) {
        await navigator.share(sharePayload)
        showStatus(t('results.shared'))
        return
      }

      if (navigator.share) {
        await navigator.share({
          title: sharePayload.title,
          text: sharePayload.text,
        })
        showStatus(t('results.shared'))
        return
      }

      await exportElementAsPng(cardRef.current, filename)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        showStatus(t('results.shareSavedCopied'))
      } else {
        showStatus(t('results.shareDownloaded'))
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showStatus(t('results.shareFailed'))
      }
    } finally {
      setSharing(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setStatusMessage('')

    try {
      const result = await exportElementAsPng(cardRef.current, filename)
      showStatus(result.ok ? t('results.shareDownloaded') : t('results.shareFailed'))
    } catch {
      showStatus(t('results.shareFailed'))
    } finally {
      setDownloading(false)
    }
  }

  if (!open || typeof document === 'undefined') return null

  const busy = sharing || downloading

  return createPortal(
    <div className="share-result-modal-root">
      <button
        type="button"
        className="share-result-modal-backdrop"
        aria-label={t('results.shareClose')}
        onClick={busy ? undefined : closeModal}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="share-result-modal"
        style={{ ['--share-accent']: theme?.accent || '#2563eb' }}
      >
        <div className="share-result-modal__header">
          <div>
            <h2 id={titleId} className="share-result-modal__title">
              {t('results.shareModalTitle')}
            </h2>
            <p className="share-result-modal__subtitle">
              {t('results.shareModalSubtitle')}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="share-result-modal__close"
            onClick={closeModal}
            disabled={busy}
            aria-label={t('results.shareClose')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="share-result-modal__preview">
          <div className="share-card-preview-shadow">
            <div ref={cardRef} className="share-card-capture">
              <ShareCard
                archetype={archetype}
                profile={profile}
                topProfession={topProfession}
                theme={theme}
                className="share-card-export--preview"
              />
            </div>
          </div>
        </div>

        {statusMessage ? (
          <p className="share-result-modal__status" role="status">
            {statusMessage}
          </p>
        ) : null}

        <div className="share-result-modal__actions">
          <button
            type="button"
            className="primary-button share-result-modal__share"
            onClick={handleShare}
            disabled={busy}
          >
            {sharing ? <ButtonSpinner /> : <Share2 size={18} aria-hidden="true" />}
            {sharing ? t('results.sharing') : t('results.shareToSocial')}
          </button>
          <button
            type="button"
            className="secondary-button share-result-modal__download"
            onClick={handleDownload}
            disabled={busy}
          >
            {downloading ? <ButtonSpinner /> : <Download size={18} aria-hidden="true" />}
            {downloading ? t('results.savingCard') : t('results.downloadCard')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
