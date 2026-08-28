import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Search,
  BookOpen,
  Image as ImageIcon,
  Globe,
  Share2,
  Send,
  Check,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const DEFAULT_WORKFLOW_STAGES = [
  { id: 'brief', label: 'Brief', path: '/brief', icon: FileText },
  { id: 'research', label: 'Research', path: '/research', icon: Search },
  { id: 'content', label: 'Content', path: '/article', icon: BookOpen },
  { id: 'visuals', label: 'Visuals', path: '/image', icon: ImageIcon },
  { id: 'seo', label: 'SEO', path: '/seo-studio', icon: Globe },
  { id: 'social', label: 'Social', path: '/social-pack', icon: Share2 },
  { id: 'publish', label: 'Publish', path: '/export', icon: Send },
];

export const WorkflowNavigator = ({
  stages = DEFAULT_WORKFLOW_STAGES,
  activeStageId,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject, creativeContext } = useProject();

  const currentPath = location.pathname;

  // Resolve current active stage index
  const activeIdx = activeStageId
    ? stages.findIndex((s) => s.id === activeStageId)
    : stages.findIndex((s) => {
        if (s.path === currentPath) return true;
        if (s.id === 'content' && (currentPath.includes('article') || currentPath.includes('titles'))) return true;
        if (s.id === 'visuals' && (currentPath.includes('image') || currentPath.includes('background'))) return true;
        if (s.id === 'seo' && currentPath.includes('seo')) return true;
        if (s.id === 'social' && currentPath.includes('social')) return true;
        if (s.id === 'publish' && (currentPath.includes('export') || currentPath.includes('quality'))) return true;
        return false;
      });

  const handleStageClick = (stage) => {
    // Pass active project and context if available
    const navState = {
      initialTopic: creativeContext?.topic || activeProject?.name || '',
      targetAudience: creativeContext?.audience || 'General',
      tone: creativeContext?.tone || 'Professional',
    };
    navigate(stage.path, { state: navState });
  };

  return (
    <div
      className={`w-full h-12 sm:h-13 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 sm:px-4 flex items-center justify-between shadow-xs overflow-x-auto no-scrollbar ${className}`}
    >
      <div className="flex items-center min-w-max gap-1.5 sm:gap-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = activeIdx === idx;
          const isCompleted = activeIdx > idx || (activeProject?.items && activeProject.items.some((i) => i.assetType === stage.id));
          const isUpcoming = activeIdx < idx && !isCompleted;

          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                onClick={() => handleStageClick(stage)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500/50 scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* State Indicator */}
                {isCompleted && !isCurrent ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}

                <span>{stage.label}</span>
              </button>

              {idx < stages.length - 1 && (
                <span className="text-slate-300 dark:text-slate-700 text-xs select-none px-0.5">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {activeProject && (
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Context:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] max-w-[140px] truncate">
            {activeProject.name}
          </span>
        </div>
      )}
    </div>
  );
};

// Re-export as CreativePipelineNav for backward compatibility
export const CreativePipelineNav = WorkflowNavigator;
