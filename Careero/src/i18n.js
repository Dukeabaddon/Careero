import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ja from './locales/ja/translation.json'
import zhCN from './locales/zh-CN/translation.json'
import es from './locales/es/translation.json'
import tl from './locales/tl/translation.json'
import fr from './locales/fr/translation.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日本語' },
  { code: 'zh-CN', label: '简体中文', short: '中文' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'tl', label: 'Tagalog', short: 'TL' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

const savedLanguage = globalThis.localStorage?.getItem('global_language')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
    'zh-CN': { translation: zhCN },
    es: { translation: es },
    tl: { translation: tl },
    fr: { translation: fr },
  },
  lng: SUPPORTED_LANGUAGES.some(({ code }) => code === savedLanguage) ? savedLanguage : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (language) => {
  globalThis.localStorage?.setItem('global_language', language)
  document.documentElement.lang = language
})

document.documentElement.lang = i18n.language

export default i18n
