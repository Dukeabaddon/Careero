/** @typedef {'ltr' | 'rtl'} TextDirection */
/** @typedef {'human' | 'draft'} LocaleQuality */

/**
 * @typedef {object} LanguageRecord
 * @property {string} code
 * @property {string} name
 * @property {string} short
 * @property {string} flag
 * @property {TextDirection} dir
 * @property {LocaleQuality} quality
 */

/** @type {LanguageRecord[]} */
export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', flag: '🇺🇸', dir: 'ltr', quality: 'human' },
  { code: 'ja', name: '日本語', short: 'JA', flag: '🇯🇵', dir: 'ltr', quality: 'human' },
  { code: 'zh-CN', name: '简体中文', short: 'ZH', flag: '🇨🇳', dir: 'ltr', quality: 'human' },
  { code: 'es', name: 'Español', short: 'ES', flag: '🇪🇸', dir: 'ltr', quality: 'human' },
  { code: 'tl', name: 'Tagalog', short: 'TL', flag: '🇵🇭', dir: 'ltr', quality: 'human' },
  { code: 'fr', name: 'Français', short: 'FR', flag: '🇫🇷', dir: 'ltr', quality: 'human' },
  { code: 'de', name: 'Deutsch', short: 'DE', flag: '🇩🇪', dir: 'ltr', quality: 'machine' },
  { code: 'it', name: 'Italiano', short: 'IT', flag: '🇮🇹', dir: 'ltr', quality: 'draft' },
  { code: 'pt', name: 'Português', short: 'PT', flag: '🇵🇹', dir: 'ltr', quality: 'draft' },
  { code: 'pt-BR', name: 'Português (Brasil)', short: 'BR', flag: '🇧🇷', dir: 'ltr', quality: 'draft' },
  { code: 'ko', name: '한국어', short: 'KO', flag: '🇰🇷', dir: 'ltr', quality: 'machine' },
  { code: 'hi', name: 'हिन्दी', short: 'HI', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'ar', name: 'العربية', short: 'AR', flag: '🇸🇦', dir: 'rtl', quality: 'machine' },
  { code: 'zh-TW', name: '繁體中文', short: 'TW', flag: '🇹🇼', dir: 'ltr', quality: 'draft' },
  { code: 'ru', name: 'Русский', short: 'RU', flag: '🇷🇺', dir: 'ltr', quality: 'draft' },
  { code: 'uk', name: 'Українська', short: 'UK', flag: '🇺🇦', dir: 'ltr', quality: 'draft' },
  { code: 'pl', name: 'Polski', short: 'PL', flag: '🇵🇱', dir: 'ltr', quality: 'draft' },
  { code: 'nl', name: 'Nederlands', short: 'NL', flag: '🇳🇱', dir: 'ltr', quality: 'draft' },
  { code: 'tr', name: 'Türkçe', short: 'TR', flag: '🇹🇷', dir: 'ltr', quality: 'draft' },
  { code: 'vi', name: 'Tiếng Việt', short: 'VI', flag: '🇻🇳', dir: 'ltr', quality: 'draft' },
  { code: 'th', name: 'ไทย', short: 'TH', flag: '🇹🇭', dir: 'ltr', quality: 'draft' },
  { code: 'id', name: 'Bahasa Indonesia', short: 'ID', flag: '🇮🇩', dir: 'ltr', quality: 'draft' },
  { code: 'ms', name: 'Bahasa Melayu', short: 'MS', flag: '🇲🇾', dir: 'ltr', quality: 'draft' },
  { code: 'sv', name: 'Svenska', short: 'SV', flag: '🇸🇪', dir: 'ltr', quality: 'draft' },
  { code: 'da', name: 'Dansk', short: 'DA', flag: '🇩🇰', dir: 'ltr', quality: 'draft' },
  { code: 'fi', name: 'Suomi', short: 'FI', flag: '🇫🇮', dir: 'ltr', quality: 'draft' },
  { code: 'no', name: 'Norsk', short: 'NO', flag: '🇳🇴', dir: 'ltr', quality: 'draft' },
  { code: 'cs', name: 'Čeština', short: 'CS', flag: '🇨🇿', dir: 'ltr', quality: 'draft' },
  { code: 'ro', name: 'Română', short: 'RO', flag: '🇷🇴', dir: 'ltr', quality: 'draft' },
  { code: 'hu', name: 'Magyar', short: 'HU', flag: '🇭🇺', dir: 'ltr', quality: 'draft' },
  { code: 'el', name: 'Ελληνικά', short: 'EL', flag: '🇬🇷', dir: 'ltr', quality: 'draft' },
  { code: 'he', name: 'עברית', short: 'HE', flag: '🇮🇱', dir: 'rtl', quality: 'draft' },
  { code: 'fa', name: 'فارسی', short: 'FA', flag: '🇮🇷', dir: 'rtl', quality: 'draft' },
  { code: 'ur', name: 'اردو', short: 'UR', flag: '🇵🇰', dir: 'rtl', quality: 'draft' },
  { code: 'bn', name: 'বাংলা', short: 'BN', flag: '🇧🇩', dir: 'ltr', quality: 'draft' },
  { code: 'ta', name: 'தமிழ்', short: 'TA', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'te', name: 'తెలుగు', short: 'TE', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'mr', name: 'मराठी', short: 'MR', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'gu', name: 'ગુજરાતી', short: 'GU', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'kn', name: 'ಕನ್ನಡ', short: 'KN', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'ml', name: 'മലയാളം', short: 'ML', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', short: 'PA', flag: '🇮🇳', dir: 'ltr', quality: 'draft' },
  { code: 'sw', name: 'Kiswahili', short: 'SW', flag: '🇰🇪', dir: 'ltr', quality: 'draft' },
  { code: 'af', name: 'Afrikaans', short: 'AF', flag: '🇿🇦', dir: 'ltr', quality: 'draft' },
  { code: 'ca', name: 'Català', short: 'CA', flag: '🇪🇸', dir: 'ltr', quality: 'draft' },
  { code: 'hr', name: 'Hrvatski', short: 'HR', flag: '🇭🇷', dir: 'ltr', quality: 'draft' },
  { code: 'sk', name: 'Slovenčina', short: 'SK', flag: '🇸🇰', dir: 'ltr', quality: 'draft' },
  { code: 'bg', name: 'Български', short: 'BG', flag: '🇧🇬', dir: 'ltr', quality: 'draft' },
  { code: 'sr', name: 'Српски', short: 'SR', flag: '🇷🇸', dir: 'ltr', quality: 'draft' },
  { code: 'lt', name: 'Lietuvių', short: 'LT', flag: '🇱🇹', dir: 'ltr', quality: 'draft' },
  { code: 'lv', name: 'Latviešu', short: 'LV', flag: '🇱🇻', dir: 'ltr', quality: 'draft' },
  { code: 'et', name: 'Eesti', short: 'ET', flag: '🇪🇪', dir: 'ltr', quality: 'draft' },
  { code: 'sl', name: 'Slovenščina', short: 'SL', flag: '🇸🇮', dir: 'ltr', quality: 'draft' },
  { code: 'az', name: 'Azərbaycan', short: 'AZ', flag: '🇦🇿', dir: 'ltr', quality: 'draft' },
  { code: 'ka', name: 'ქართული', short: 'KA', flag: '🇬🇪', dir: 'ltr', quality: 'draft' },
  { code: 'hy', name: 'Հայերեն', short: 'HY', flag: '🇦🇲', dir: 'ltr', quality: 'draft' },
  { code: 'ne', name: 'नेपाली', short: 'NE', flag: '🇳🇵', dir: 'ltr', quality: 'draft' },
  { code: 'si', name: 'සිංහල', short: 'SI', flag: '🇱🇰', dir: 'ltr', quality: 'draft' },
  { code: 'my', name: 'မြန်မာ', short: 'MY', flag: '🇲🇲', dir: 'ltr', quality: 'draft' },
  { code: 'km', name: 'ខ្មែរ', short: 'KM', flag: '🇰🇭', dir: 'ltr', quality: 'draft' },
]

const byCode = new Map(LANGUAGES.map((language) => [language.code, language]))

/** @param {string} code */
export function getLanguage(code) {
  return byCode.get(code) ?? null
}

/** @param {string} code */
export function isRtl(code) {
  return getLanguage(code)?.dir === 'rtl'
}

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code)
