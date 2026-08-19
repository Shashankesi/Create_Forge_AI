import React from 'react';
import { PixoraMark } from '../brand/PixoraMark';

export const PageLoader = ({ message = 'Preparing Pixora...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
        <PixoraMark size={28} animate={true} />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};
