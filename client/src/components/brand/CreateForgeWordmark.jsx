import React from 'react';

export const CreateForgeWordmark = ({ className = '', size = 'text-xl' }) => {
  return (
    <span
      className={`font-black tracking-tight text-slate-900 dark:text-white font-['Outfit'] ${size} ${className} inline-flex items-center gap-1`}
    >
      <span>CreateForge</span>
      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-black">
        AI
      </span>
    </span>
  );
};

export default CreateForgeWordmark;
