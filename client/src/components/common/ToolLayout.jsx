import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { CreateForgeLoader } from './CreateForgeLoader';
import { CreativePipelineNav } from './CreativePipelineNav';
import { useProject } from '../../context/ProjectContext';
import {
  AlertCircle,
  RefreshCw,
  Folder,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const ToolLayout = ({
  title,
  subtitle,
  description,
  badge,
  breadcrumbs,
  icon: Icon,
  actions,
  hideWorkflow = true,
  leftPane,
  rightPane,
  children,
  isLoading,
  loadingTitle,
  loadingMessages,
  loaderType = 'article',
  error,
  onClearError,
  onRetry,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject, useProjectContext, setUseProjectContext, projects, setActiveProject } = useProject();

  const displayDescription = description || subtitle;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 sm:space-y-4 animate-in fade-in duration-150">
      {/* 1. Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] truncate">
                {title}
              </h1>
              {badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {displayDescription && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {/* Right Header: Project Selector & Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {activeProject ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] max-w-[140px] truncate">
                {activeProject.name}
              </span>
            </div>
          ) : projects?.length > 0 ? (
            <select
              value=""
              onChange={(e) => {
                const found = projects.find((p) => (p._id || p.id) === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="" disabled>Select Project ▼</option>
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
              ))}
            </select>
          ) : null}

          {actions}
        </div>
      </div>

      {/* 2. Single Unified Workflow Navigation Layer */}
      {!hideWorkflow && <CreativePipelineNav />}

      {/* 3. Global Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start justify-between gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5 text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRetry && (
              <Button
                size="xs"
                variant="outline"
                onClick={onRetry}
                className="text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 text-xs px-1"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Content Workspace */}
      {children ? (
        children
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">{leftPane}</div>
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[380px] flex flex-col justify-between">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <CreateForgeLoader
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
      )}
    </div>
  );
};
