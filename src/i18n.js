import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ja from './locales/ja/translation.json'
import zhCN from './locales/zh-CN/translation.json'
import es from './locales/es/translation.json'
import tl from './locales/tl/translation.json'
import fr from './locales/fr/translation.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', short: 'JA', flag: '🇯🇵' },
  { code: 'zh-CN', name: '简体中文', short: 'ZH', flag: '🇨🇳' },
  { code: 'es', name: 'Español', short: 'ES', flag: '🇪🇸' },
  { code: 'tl', name: 'Tagalog', short: 'TL', flag: '🇵🇭' },
  { code: 'fr', name: 'Français', short: 'FR', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', short: 'IT', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', short: 'PT', flag: '🇵🇹' },
  { code: 'ko', name: '한국어', short: 'KO', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', short: 'HI', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', short: 'AR', flag: '🇸🇦' },
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
    de: { translation: en },
    it: { translation: en },
    pt: { translation: en },
    ko: { translation: en },
    hi: { translation: en },
    ar: { translation: en },
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
