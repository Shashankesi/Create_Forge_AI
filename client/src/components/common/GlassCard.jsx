import React from 'react';

/**
 * GlassCard
 * Premium translucent card with border gradients, hover elevation, and dark/light mode balance.
 */
export const GlassCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all duration-300 ${
        hover
          ? 'hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-0.5'
          : ''
      } ${
        glow
          ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/10 before:via-purple-500/5 before:to-transparent before:pointer-events-none'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
