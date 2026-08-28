import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, Folder, ChevronDown, Plus, Check, Sparkles } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useProject } from '../../context/ProjectContext';

export const DashboardHeader = ({ onMenuClick, onOpenPalette }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { projects, activeProject, setActiveProject, createQuickProject } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = (pathname) => {
    if (pathname.includes('/brief')) return 'Creative Brief';
    if (pathname.includes('/research')) return 'Research Studio';
    if (pathname.includes('/article') || pathname.includes('/tools/article')) return t('toolArticle');
    if (pathname.includes('/titles') || pathname.includes('/tools/titles')) return t('toolTitles');
    if (pathname.includes('/image') || pathname.includes('/tools/image')) return t('toolImage');
    if (pathname.includes('/background')) return t('toolBackground');
    if (pathname.includes('/projects')) return 'Projects & Collections';
    if (pathname.includes('/canvas')) return 'Creative Canvas';
    if (pathname.includes('/brand-kit')) return 'Brand Kit';
    if (pathname.includes('/seo-studio')) return 'SEO Studio';
    if (pathname.includes('/social-pack')) return 'Social Content Pack';
    if (pathname.includes('/quality-center')) return 'Quality Center';
    if (pathname.includes('/templates')) return 'Templates';
    if (pathname.includes('/export')) return 'Export Center';
    if (pathname.includes('/history')) return t('toolHistory');
    if (pathname.includes('/profile')) return t('toolProfile');
    if (pathname.includes('/settings')) return t('toolSettings');
    return t('navDashboard');
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    await createQuickProject(newProjectName.trim());
    setNewProjectName('');
    setCreatingProject(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white/85 dark:bg-[#090d14]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] hidden sm:block">
          {getTitle(location.pathname)}
        </h1>

        {/* Global Project Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-xs"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: activeProject?.color || '#6366F1' }}
            />
            <span className="truncate max-w-[130px] sm:max-w-[190px]">
              {activeProject?.name || 'Select Project'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Active Project</span>
                <Link
                  to="/projects"
                  onClick={() => setDropdownOpen(false)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline capitalize"
                >
                  Manage →
                </Link>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                {projects.map((p) => {
                  const isSelected = (activeProject?._id || activeProject?.id) === (p._id || p.id);
                  return (
                    <button
                      key={p._id || p.id}
                      onClick={() => {
                        setActiveProject(p);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color || '#6366F1' }}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick Create Project Input */}
              <form onSubmit={handleQuickCreate} className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="+ New Project Name..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={creatingProject || !newProjectName.trim()}
                    className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Search & Command Palette Button */}
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 transition-all shadow-xs"
          title="Search or Run Command (Ctrl+K)"
        >
          <span>🔍</span>
          <span className="hidden md:inline font-medium">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono border border-slate-300 dark:border-slate-600">
            Ctrl+K
          </kbd>
        </button>

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
