import React from 'react';
import { Button } from './Button';
import { CreateForgeMark } from '../brand/CreateForgeMark';

export const EmptyState = ({
  icon: Icon,
  title = 'Your workspace is ready',
  description = 'Create your first article, title, or visual to start building your library.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 text-center space-y-4 max-w-sm mx-auto flex flex-col items-center justify-center animate-in fade-in select-none ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
        {Icon ? <Icon className="w-7 h-7" /> : <CreateForgeMark size={28} />}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
