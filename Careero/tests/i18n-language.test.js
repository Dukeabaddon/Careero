import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

function loadLocale(code) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/locales', code, 'translation.json'), 'utf8'),
  )
}

async function createAppI18n() {
  const en = loadLocale('en')
  const ja = loadLocale('ja')
  const fr = loadLocale('fr')
  const i18n = i18next.createInstance()

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      fr: { translation: fr },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  async function setAppLanguage(code) {
    if (!i18n.hasResourceBundle(code, 'translation')) {
      i18n.addResourceBundle(code, 'translation', loadLocale(code), true, true)
    }
    if (i18n.language !== code) await i18n.changeLanguage(code)
  }

  return { i18n, setAppLanguage }
}

describe('landing language switch', () => {
  it('changes hero.title when switching to a human locale', async () => {
    const { i18n, setAppLanguage } = await createAppI18n()
    const english = i18n.t('hero.title')

    await setAppLanguage('ja')
    expect(i18n.language).toBe('ja')
    expect(i18n.hasResourceBundle('ja', 'translation')).toBe(true)
    expect(i18n.t('hero.title')).not.toBe(english)
    expect(i18n.t('hero.title')).toBe('自分らしい仕事を、')

    await setAppLanguage('fr')
    expect(i18n.t('hero.title')).toContain('métier')

    await setAppLanguage('en')
    expect(i18n.t('hero.title')).toBe(english)
  })

  it('keeps English copy for draft locales scaffolded from en', async () => {
    const { i18n, setAppLanguage } = await createAppI18n()
    const english = i18n.t('hero.title')
    await setAppLanguage('de')
    expect(i18n.t('hero.title')).toBe(english)
  })
})
