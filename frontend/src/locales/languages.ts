export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  group: 'Indian' | 'International';
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Indian Languages
  { code: 'en', name: 'English', nativeName: 'English', group: 'Indian', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', group: 'Indian', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', group: 'Indian', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', group: 'Indian', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', group: 'Indian', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', group: 'Indian', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', group: 'Indian', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', group: 'Indian', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', group: 'Indian', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', group: 'Indian', dir: 'ltr' },

  // International Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español', group: 'International', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', group: 'International', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', group: 'International', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', group: 'International', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', group: 'International', dir: 'rtl' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', group: 'International', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', group: 'International', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', group: 'International', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE = 'en';

export const getLanguageByCode = (code?: string): LanguageOption => {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const found = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found || SUPPORTED_LANGUAGES[0];
};
