import React from 'react';
import { Sun, Moon, Laptop, Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: t('themeLight'), icon: Sun },
    { id: 'dark', label: t('themeDark'), icon: Moon },
    { id: 'system', label: t('themeSystem'), icon: Laptop },
  ];

  const languages = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
          {t('settingsTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Appearance Section */}
      <div className="app-card p-6 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('appearanceSection')}
          </h3>
          <p className="text-xs text-slate-500">
            Choose your preferred interface theme.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`p-3.5 rounded-xl border text-center space-y-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mx-auto ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Section */}
      <div className="app-card p-6 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('languageSection')}
          </h3>
          <p className="text-xs text-slate-500">
            Select the language used across all workspaces and tools.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {lang.native}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lang.label}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
