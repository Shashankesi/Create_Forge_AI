import React, { useState, useEffect } from 'react';
import { CreateForgeMark } from '../brand/CreateForgeMark';

/**
 * Reusable CreateForgeLoader
 * Variants: 'ai' | 'inline' | 'button' | 'page' | 'skeleton'
 */
export const CreateForgeLoader = ({
  variant = 'ai',
  title = 'CreateForge is creating',
  messages = [
    'Preparing your prompt',
    'Creating visual composition',
    'Refining fine details',
    'Finishing output',
  ],
  className = '',
  size = 'md',
  type = 'article', // 'article' | 'titles' | 'image' | 'background'
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages]);

  if (variant === 'button') {
    return (
      <div className="flex items-center gap-2" role="status" aria-busy="true">
        <CreateForgeMark size={16} animate={true} />
        <span className="text-xs font-medium">{title}…</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-slate-500" role="status" aria-busy="true">
        <CreateForgeMark size={14} animate={true} />
        <span>{messages[msgIndex] || title}</span>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center"
        role="status"
        aria-busy="true"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center shadow-md">
          <CreateForgeMark size={30} animate={true} variant="glow" />
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
      </div>
    );
  }

  // Full AI Generation Transition Loader
  return (
    <div
      className={`w-full flex-1 flex flex-col items-center justify-center p-6 sm:p-8 space-y-6 text-center animate-in fade-in duration-300 ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 animate-ping opacity-60 pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center shadow-md">
          <CreateForgeMark size={34} animate={true} variant="glow" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center justify-center gap-1.5">
          <span>✦</span> {title}
        </h4>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium min-h-[18px] transition-all duration-300">
          {messages[msgIndex]}…
        </p>
      </div>

      <div className="w-full max-w-md space-y-2.5 pt-2 opacity-60">
        {type === 'article' && (
          <div className="space-y-2 text-left">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-full animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-4/5 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-4 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-full animate-pulse" />
          </div>
        )}

        {type === 'titles' && (
          <div className="space-y-2">
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" />
          </div>
        )}

        {type === 'image' && (
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center justify-center">
            <span className="text-[11px] text-slate-400">✦ Synthesizing visual composition…</span>
          </div>
        )}

        {type === 'background' && (
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center justify-center">
            <span className="text-[11px] text-slate-400">✦ Isolating alpha foreground channel…</span>
          </div>
        )}
      </div>
    </div>
  );
};
