import React from 'react';
import { CreateForgeMark } from './CreateForgeMark';

/**
 * CreateForgeLogo — Official Reusable Logo & Wordmark Component
 *
 * Requirements fulfilled:
 * 1. Full logo: icon + CreateForge AI wordmark
 * 2. Compact logo: icon only (when compact = true)
 * 3. Light-theme and Dark-theme adaptive
 * 4. Crisp and proportionate at all standard UI sizes
 *
 * @param {number} markSize - Size of the brand mark in pixels (default 28)
 * @param {string} textSize - Tailwind text size for wordmark (default 'text-lg')
 * @param {string} className - Additional CSS wrapper classes
 * @param {boolean} showTagline - Display subtle subtitle 'AI Creative Studio'
 * @param {boolean} compact - Display only the mark without wordmark
 * @param {string} variant - 'glow' | 'default' | 'monochrome' | 'inverted'
 */
export const CreateForgeLogo = ({
  markSize = 28,
  textSize = 'text-lg',
  className = '',
  showTagline = false,
  compact = false,
  variant = 'glow',
}) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
        <CreateForgeMark size={markSize} variant={variant} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <CreateForgeMark size={markSize} variant={variant} className="shrink-0" />
      <div className="flex flex-col justify-center">
        <span
          className={`font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] ${textSize} leading-none flex items-center gap-1`}
        >
          <span>CreateForge</span>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-black">
            AI
          </span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
            AI Creative Studio
          </span>
        )}
      </div>
    </div>
  );
};

export default CreateForgeLogo;
