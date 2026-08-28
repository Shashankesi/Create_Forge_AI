import React from 'react';
import { CreateForgeMark } from '../brand/CreateForgeMark';

export const PageLoader = ({ message = 'Preparing CreateForge AI...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
        <CreateForgeMark size={28} animate={true} />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

