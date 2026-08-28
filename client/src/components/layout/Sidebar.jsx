import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CreateForgeLogo } from '../brand/CreateForgeLogo';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  Heading,
  Image as ImageIcon,
  Share2,
  Globe,
  Layers,
  Folder,
  History,
  Heart,
  Palette,
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
      title: 'WORKSPACE',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CREATE',
      items: [
        { name: 'Article Generator', path: '/article', icon: BookOpen },
        { name: 'Blog Titles', path: '/titles', icon: Heading },
        { name: 'Image Generator', path: '/image', icon: ImageIcon },
        { name: 'Social Content', path: '/social-pack', icon: Share2 },
      ],
    },
    {
      title: 'OPTIMIZE',
      items: [
        { name: 'SEO Studio', path: '/seo-studio', icon: Globe },
        { name: 'Background Remover', path: '/background-remover', icon: Layers },
      ],
    },
    {
      title: 'LIBRARY',
      items: [
        { name: 'Projects', path: '/projects', icon: Folder },
        { name: 'History', path: '/history', icon: History },
        { name: 'Favorites', path: '/favorites', icon: Heart },
      ],
    },
    {
      title: 'BRAND',
      items: [
        { name: 'Brand Kit', path: '/brand-kit', icon: Palette },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
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
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
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
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5 truncate">
            <Avatar name={user?.name || 'Creator'} size="sm" />
            <div className="truncate">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Creator'}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
