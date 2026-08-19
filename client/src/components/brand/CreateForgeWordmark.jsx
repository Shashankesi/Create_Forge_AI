import React from 'react';

export const CreateForgeWordmark = ({ className = '', size = 'text-xl' }) => {
  return (
    <span
      className={`font-black tracking-tight text-slate-900 dark:text-white font-['Outfit'] ${size} ${className}`}
    >
      CreateForge<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
    </span>
  );
};
