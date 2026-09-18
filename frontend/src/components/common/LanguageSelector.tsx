import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../locales/languages';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value?: string;
  onChange?: (langCode: string) => void;
  className?: string;
  variant?: 'select' | 'dropdown' | 'compact';
  label?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  className = '',
  variant = 'select',
  label,
}) => {
  const { i18n } = useTranslation();
  const currentLang = value || i18n.language || 'en';

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    if (onChange) {
      onChange(code);
    }
  };

  const indianLanguages = SUPPORTED_LANGUAGES.filter((l) => l.group === 'Indian');
  const internationalLanguages = SUPPORTED_LANGUAGES.filter((l) => l.group === 'International');

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer">
          <Globe size={14} className="text-brand-600 shrink-0" />
          <select
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-zinc-800 focus:ring-0 focus:outline-none cursor-pointer pr-1"
            aria-label="Select Language"
          >
            <optgroup label="Indian Languages">
              {indianLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </optgroup>
            <optgroup label="International Languages">
              {internationalLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative rounded-xl border border-zinc-300 bg-white shadow-2xs hover:border-brand-500 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Globe size={16} className="text-brand-600" />
        </div>
        <select
          value={currentLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 bg-transparent rounded-xl focus:outline-none appearance-none cursor-pointer"
        >
          <optgroup label="── Indian Languages ──">
            {indianLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} — {l.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="── International Languages ──">
            {internationalLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} — {l.name}
              </option>
            ))}
          </optgroup>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
          <span className="text-xs">▼</span>
        </div>
      </div>
    </div>
  );
};
