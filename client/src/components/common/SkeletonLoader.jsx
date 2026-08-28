import React from 'react';

/**
 * SkeletonLoader for content blocks
 */
export const SkeletonLoader = ({ lines = 4, className = '' }) => {
  return (
    <div className={`space-y-2.5 w-full ${className}`} role="status" aria-busy="true">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse ${
            i % 2 === 0 ? 'w-full' : 'w-5/6'
          }`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse ${className}`}>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-full" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-5/6" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3" />
      </div>
    </div>
  );
};

export const PageSkeleton = ({ title = 'Loading Workspace...' }) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-xl w-48 animate-pulse" />
          <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-72 animate-pulse" />
        </div>
        <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-28 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <CardSkeleton />
        </div>
        <div className="lg:col-span-7 space-y-4">
          <CardSkeleton className="min-h-[440px]" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-64 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-24 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
