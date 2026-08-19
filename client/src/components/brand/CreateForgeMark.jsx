import React from 'react';

/**
 * CreateForgeMark
 * Refined geometric emblem combining an anvil/forged angular prism with a radiant creation spark.
 * Symbolizes: Creation, Transformation, Intelligence, Precision.
 *
 * Sizes: 16, 20, 24, 28, 32, 36, 48, 64 (or custom number)
 * Variants: 'default' | 'glow' | 'monochrome' | 'inverted' | 'accent'
 */
export const CreateForgeMark = ({
  size = 24,
  variant = 'default',
  className = '',
  animate = false,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'monochrome':
        return {
          bg: 'fill-slate-900 dark:fill-white',
          spark: 'fill-white dark:fill-slate-900',
          accent: 'fill-slate-400 dark:fill-slate-500',
          dot: 'fill-slate-900 dark:fill-white',
        };
      case 'inverted':
        return {
          bg: 'fill-white',
          spark: 'fill-indigo-600',
          accent: 'fill-violet-400',
          dot: 'fill-indigo-950',
        };
      case 'accent':
        return {
          bg: 'fill-gradient-to-br from-indigo-500 to-violet-600',
          spark: 'fill-white',
          accent: 'fill-amber-400',
          dot: 'fill-indigo-950',
        };
      case 'glow':
      case 'default':
      default:
        return {
          bg: 'fill-indigo-600 dark:fill-indigo-500',
          spark: 'fill-white',
          accent: 'fill-indigo-300 dark:fill-indigo-200',
          dot: 'fill-indigo-950 dark:fill-indigo-900',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        variant === 'glow' ? 'drop-shadow-[0_0_14px_rgba(99,102,241,0.55)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'animate-pulse' : ''}
      >
        <defs>
          <linearGradient id="forgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="facetGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* Forged Outer Geometric Shield Container */}
        <rect
          x="2.5"
          y="2.5"
          width="31"
          height="31"
          rx="9"
          fill={variant === 'default' || variant === 'glow' ? 'url(#forgeGrad)' : undefined}
          className={variant !== 'default' && variant !== 'glow' ? styles.bg : ''}
        />

        {/* Precision 4-Point Creation Spark */}
        <path
          d="M18 6.5C18 12.85 12.85 18 6.5 18C12.85 18 18 23.15 18 29.5C18 23.15 23.15 18 29.5 18C23.15 18 18 12.85 18 6.5Z"
          fill="url(#facetGrad)"
          className={variant === 'inverted' ? styles.spark : ''}
        />

        {/* Diagonal Micro-Facets for Forged Steel Depth */}
        <path
          d="M18 11.5L24.5 18L18 24.5L11.5 18L18 11.5Z"
          fill="rgba(255, 255, 255, 0.25)"
        />

        {/* Central Intelligence Point */}
        <circle cx="18" cy="18" r="2.8" className={styles.dot} />
      </svg>
    </div>
  );
};
