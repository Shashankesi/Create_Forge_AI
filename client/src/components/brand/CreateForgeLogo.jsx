import React from 'react';
import { CreateForgeMark } from './CreateForgeMark';

export const CreateForgeLogo = ({
  markSize = 28,
  textSize = 'text-lg',
  className = '',
  showTagline = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <CreateForgeMark size={markSize} variant="glow" className="shrink-0" />
      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] ${textSize} leading-tight`}
        >
          CreateForge<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            Creative Workspace
          </span>
        )}
      </div>
    </div>
  );
};
