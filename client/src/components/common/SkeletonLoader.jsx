import React from 'react';

/**
 * SkeletonLoader for content blocks
 */
export const SkeletonLoader = ({ lines = 4, className = '' }) => {
  return (
    <div className={`space-y-2.5 w-full ${className}`} role="status" aria-busy="true">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 bg-slate-100 dark:bg-slate-850 rounded animate-pulse ${
            i % 2 === 0 ? 'w-full' : 'w-5/6'
          }`}
        />
      ))}
    </div>
  );
};
