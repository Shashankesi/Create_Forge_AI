import React, { useState, useEffect } from 'react';
import { PixoraMark } from '../brand/PixoraMark';

export const AILoader = ({
  messages = [
    'Understanding your request...',
    'Analyzing context and structure...',
    'Generating optimal output...',
    'Refining final details...',
  ],
  title = 'Creating your result...',
  className = '',
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-300 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
          <PixoraMark size={32} animate={true} />
        </div>
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[18px] transition-all duration-300">
          {messages[msgIndex]}
        </p>
      </div>
    </div>
  );
};
