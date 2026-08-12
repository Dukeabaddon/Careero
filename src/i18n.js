import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import es from './locales/es/translation.json'
import fr from './locales/fr/translation.json'
import ja from './locales/ja/translation.json'
import tl from './locales/tl/translation.json'
import zhCN from './locales/zh-CN/translation.json'
import { getLanguage, LANGUAGE_CODES, LANGUAGES } from './i18n/languages.js'

export const SUPPORTED_LANGUAGES = LANGUAGES

const localeModules = import.meta.glob('./locales/*/translation.json')

const HUMAN_BUNDLES = {
  en,
  es,
  fr,
  ja,
  tl,
  'zh-CN': zhCN,
}

function syncDocument(language) {
  const record = getLanguage(language) ?? getLanguage('en')
  document.documentElement.lang = language
  document.documentElement.dir = record?.dir ?? 'ltr'
}

async function loadLocaleBundle(language) {
  if (HUMAN_BUNDLES[language]) return HUMAN_BUNDLES[language]
  const loader = localeModules[`./locales/${language}/translation.json`]
  if (!loader) throw new Error(`Missing locale bundle: ${language}`)
  const module = await loader()
  return module.default ?? module
}

export async function ensureLocale(language) {
  if (i18n.hasResourceBundle(language, 'translation')) return
  const bundle = await loadLocaleBundle(language)
  i18n.addResourceBundle(language, 'translation', bundle, true, true)
}

export async function setAppLanguage(code) {
  const language = LANGUAGE_CODES.includes(code) ? code : 'en'
  await ensureLocale(language)
  if (i18n.language !== language) {
    await i18n.changeLanguage(language)
  } else {
    syncDocument(language)
    i18n.emit('languageChanged', language)
  }
}

const savedLanguage = globalThis.localStorage?.getItem('global_language')
const initialLanguage = LANGUAGE_CODES.includes(savedLanguage) ? savedLanguage : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    ja: { translation: ja },
    tl: { translation: tl },
    'zh-CN': { translation: zhCN },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: LANGUAGE_CODES,
  nonExplicitSupportedLngs: false,
  interpolation: { escapeValue: false },
  react: {
    bindI18n: 'languageChanged loaded',
    useSuspense: false,
  },
})

i18n.on('languageChanged', (language) => {
  globalThis.localStorage?.setItem('global_language', language)
  syncDocument(language)
})

syncDocument(i18n.language)

if (!HUMAN_BUNDLES[initialLanguage]) {
  setAppLanguage(initialLanguage).catch(() => {
    setAppLanguage('en')
  })
}

export default i18n
