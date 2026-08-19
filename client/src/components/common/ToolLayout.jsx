import React from 'react';
import { PixoraLoader } from './PixoraLoader';
import { Button } from './Button';
import { AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export const ToolLayout = ({
  title,
  subtitle,
  icon: Icon,
  leftPane,
  rightPane,
  isLoading,
  loadingTitle,
  loadingMessages,
  loaderType = 'article',
  error,
  onClearError,
  onRetry,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Minimal Unobtrusive Powered Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/60">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Intelligent Workspace</span>
        </div>
      </div>

      {/* Error Alert Box with Try Again */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-red-800 dark:text-red-200">
                We couldn't create that right now.
              </span>
              <span>{error}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
                className="text-xs"
              >
                Try Again
              </Button>
            )}
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline px-1"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workspace Split-Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Parameter/Prompt Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="app-card p-5 sm:p-6 space-y-4">
            {leftPane}
          </div>
        </div>

        {/* Right Output & Reading Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="app-card p-5 sm:p-6 min-h-[440px] flex flex-col justify-between">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <PixoraLoader
                  variant="ai"
                  type={loaderType}
                  title={loadingTitle || 'Creating your result'}
                  messages={loadingMessages}
                />
              </div>
            ) : (
              rightPane
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
