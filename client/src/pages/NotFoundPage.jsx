import React from 'react';
import { Link } from 'react-router-dom';
import { CreateForgeMark } from '../components/brand/CreateForgeMark';
import { Button } from '../components/common/Button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="app-card max-w-sm w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
          <CreateForgeMark size={26} variant="glow" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            404
          </h1>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The workspace or resource you requested could not be located.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link to="/dashboard">
            <Button size="sm" icon={LayoutDashboard} className="w-full">
              {t('navDashboard')}
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
