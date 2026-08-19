import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateForgeLogo } from '../brand/CreateForgeLogo';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#090d14]/85 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs'
          : 'bg-white/60 dark:bg-[#090d14]/60 backdrop-blur-xs border-b border-slate-200/40 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <CreateForgeLogo markSize={28} />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/#tools"
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('navTools')}
          </a>
          <a
            href="/#how-it-works"
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('navHowItWorks')}
          </a>
        </nav>

        {/* Right Controls & Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Segmented Control Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs select-none">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
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
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* Auth Action */}
          {isAuthenticated ? (
            <Button
              size="sm"
              icon={LayoutDashboard}
              onClick={() => navigate('/dashboard')}
            >
              {t('navWorkspace')}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('navSignIn')}
              </Link>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
              >
                {t('navGetStarted')}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Language</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-xs ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded text-xs ${
                  language === 'hi'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <a
            href="/#tools"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
          >
            {t('navTools')}
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
          >
            {t('navHowItWorks')}
          </a>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <Button
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/dashboard');
                }}
              >
                {t('navWorkspace')}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}
                >
                  {t('navSignIn')}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/register');
                  }}
                >
                  {t('navGetStarted')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
