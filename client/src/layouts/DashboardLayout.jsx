import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { CommandPaletteModal } from '../components/common/CommandPaletteModal';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    let title = 'CreateForge AI';
    if (p.includes('/article')) title = 'Article Generator — CreateForge AI';
    else if (p.includes('/titles')) title = 'Blog Titles — CreateForge AI';
    else if (p.includes('/image')) title = 'Image Generator — CreateForge AI';
    else if (p.includes('/social-pack') || p.includes('/social')) title = 'Social Content — CreateForge AI';
    else if (p.includes('/seo')) title = 'SEO Studio — CreateForge AI';
    else if (p.includes('/background')) title = 'Background Remover — CreateForge AI';
    else if (p.includes('/projects')) title = 'Projects — CreateForge AI';
    else if (p.includes('/history')) title = 'History — CreateForge AI';
    else if (p.includes('/favorites')) title = 'Favorites — CreateForge AI';
    else if (p.includes('/brand-kit')) title = 'Brand Kit — CreateForge AI';
    else if (p.includes('/quality')) title = 'Quality Center — CreateForge AI';
    else if (p.includes('/profile')) title = 'Profile — CreateForge AI';
    else if (p.includes('/settings')) title = 'Settings — CreateForge AI';
    else if (p.includes('/campaign')) title = 'Campaign Builder — CreateForge AI';
    else if (p.includes('/launch-readiness')) title = 'Launch Readiness — CreateForge AI';
    else if (p.includes('/dashboard') || p.includes('/workspace')) title = 'Dashboard — CreateForge AI';
    document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#090d14] text-slate-900 dark:text-slate-100 transition-colors">
      <CommandPaletteModal isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
