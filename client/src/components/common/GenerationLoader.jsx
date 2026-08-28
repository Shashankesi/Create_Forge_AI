import React from 'react';
import { CreateForgeMark } from '../brand/CreateForgeMark';

/**
 * GenerationLoader
 * Standardized AI generation state across all creative tools
 */
export const GenerationLoader = ({
  title = '✦ CreateForge is creating',
  message = 'Processing your request…',
  steps = [],
  currentStepIndex = 0,
  type = 'article', // 'article' | 'titles' | 'image' | 'background'
}) => {
  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-center p-6 sm:p-10 space-y-6 text-center animate-in fade-in duration-200 select-none"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Animated Brand Mark Core Container */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-3xl bg-indigo-500/15 dark:bg-indigo-500/25 animate-ping opacity-50 pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center shadow-lg">
          <CreateForgeMark size={32} animate={true} />
        </div>
      </div>

      {/* Main Status Header */}
      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-['Outfit']">
          {title}
        </h4>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium min-h-[20px] transition-all">
          {message}
        </p>
      </div>

      {/* Step Indicators if provided */}
      {steps && steps.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-indigo-400 dark:bg-indigo-600'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contextual Skeleton Placeholders */}
      <div className="w-full max-w-md space-y-2.5 pt-2 opacity-50">
        {type === 'article' && (
          <div className="space-y-2 text-left">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-full animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-4/5 animate-pulse" />
          </div>
        )}

        {type === 'titles' && (
          <div className="space-y-2">
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" />
          </div>
        )}

        {type === 'image' && (
          <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center justify-center">
            <span className="text-[11px] text-slate-400">Rendering visual composition…</span>
          </div>
        )}

        {type === 'background' && (
          <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center justify-center">
            <span className="text-[11px] text-slate-400">Isolating foreground subject…</span>
          </div>
        )}
      </div>
    </div>
  );
};
