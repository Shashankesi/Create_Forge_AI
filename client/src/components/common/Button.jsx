import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs focus:ring-indigo-500 border border-transparent',
    secondary:
      'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs focus:ring-indigo-500',
    outline:
      'border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-indigo-500',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-indigo-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500 border border-transparent',
  };

  const sizes = {
    xs: 'text-[11px] h-7 px-2.5 gap-1',
    sm: 'text-xs h-8 px-3 gap-1.5',
    md: 'text-xs sm:text-sm h-10 px-4 gap-2',
    lg: 'text-sm sm:text-base h-11 px-5 gap-2.5',
    icon: 'w-9 h-9 p-0 flex items-center justify-center',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};
