import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const DashboardHeader = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getTitle = (pathname) => {
    if (pathname.includes('/tools/article')) return t('toolArticle');
    if (pathname.includes('/tools/titles')) return t('toolTitles');
    if (pathname.includes('/tools/image')) return t('toolImage');
    if (pathname.includes('/tools/background')) return t('toolBackground');
    if (pathname.includes('/history')) return t('toolHistory');
    if (pathname.includes('/profile')) return t('toolProfile');
    if (pathname.includes('/settings')) return t('toolSettings');
    return t('navDashboard');
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white/80 dark:bg-[#090d14]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
          {getTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              language === 'hi'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-1 text-slate-700 dark:text-slate-300"
        >
          <Avatar name={user?.name || 'User'} size="sm" />
        </Link>
      </div>
    </header>
  );
};
