import React from 'react';
import { Link } from 'react-router-dom';
import { CreateForgeLogo } from '../brand/CreateForgeLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Footer = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d14] text-slate-500 text-xs py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <CreateForgeLogo markSize={26} textSize="text-base" showTagline={true} />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t('brandDescription')}
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              {t('footerProduct')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('navTools')}
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('navHowItWorks')}
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              {t('footerAccount')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('navSignIn')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('navGetStarted')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Preferences */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Language & Theme
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-xs border ${
                  language === 'en'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded text-xs border ${
                  language === 'hi'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                हिंदी
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} CreateForge AI. {t('footerRights')}</p>
          <p>{t('footerTagline')}</p>
        </div>
      </div>
    </footer>
  );
};
