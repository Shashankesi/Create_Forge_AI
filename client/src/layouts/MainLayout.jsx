import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    if (p === '/login') document.title = 'Sign In — CreateForge AI';
    else if (p === '/register') document.title = 'Create Account — CreateForge AI';
    else if (p === '/404') document.title = 'Page Not Found — CreateForge AI';
    else document.title = 'CreateForge AI — AI Creative Studio';
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#090d14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
