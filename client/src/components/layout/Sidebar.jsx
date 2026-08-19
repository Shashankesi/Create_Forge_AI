import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CreateForgeLogo } from '../brand/CreateForgeLogo';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  Heading,
  Image as ImageIcon,
  Layers,
  History,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: t('menuWorkspace'),
      items: [
        { name: t('navDashboard'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('toolArticle'), path: '/tools/article', icon: FileText },
        { name: t('toolTitles'), path: '/tools/titles', icon: Heading },
        { name: t('toolImage'), path: '/tools/image', icon: ImageIcon },
        { name: t('toolBackground'), path: '/tools/background-remove', icon: Layers },
      ],
    },
    {
      title: t('menuLibrary'),
      items: [
        { name: t('toolHistory'), path: '/history', icon: History },
      ],
    },
    {
      title: t('menuAccount'),
      items: [
        { name: t('toolProfile'), path: '/profile', icon: User },
        { name: t('toolSettings'), path: '/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c111c] border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center">
          <CreateForgeLogo markSize={26} />
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between p-2 rounded-lg">
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </div>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            title={t('navLogout')}
            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-60 h-screen sticky top-0 shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex select-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
