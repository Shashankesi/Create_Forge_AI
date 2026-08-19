import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PixoraMark } from '../brand/PixoraMark';

export const SuccessState = ({
  title = 'Created successfully',
  message = 'Your result is ready.',
  className = '',
}) => {
  return (
    <div
      className={`p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200 ${className}`}
      role="status"
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
};
