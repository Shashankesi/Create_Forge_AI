import React from 'react';

/**
 * CreateForgeMark — Official Brand Emblem 2.0
 * Concept: Modern forged geometric 'C' surrounding and embedding a radiant 4-point AI creation spark.
 * Visual Direction: Deep navy, electric cyan, radiant indigo, violet, and crisp diamond white.
 *
 * Crisp at: 16px, 24px, 32px, 48px, 64px, 128px, 512px.
 * Works seamlessly in both Light and Dark mode.
 *
 * @param {number} size - Square dimension in pixels (default 24)
 * @param {string} variant - 'default' | 'glow' | 'monochrome' | 'inverted' | 'accent'
 * @param {string} className - Additional CSS classes
 * @param {boolean} animate - Pulse / breathing animation
 */
export const CreateForgeMark = ({
  size = 24,
  variant = 'default',
  className = '',
  animate = false,
}) => {
  const isGlow = variant === 'glow';
  const isMonochrome = variant === 'monochrome';
  const isInverted = variant === 'inverted';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        isGlow ? 'drop-shadow-[0_0_12px_rgba(99,102,241,0.55)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      aria-label="CreateForge AI"
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
          <linearGradient id="cfShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="cfShieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="cfForgeC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>

          <linearGradient id="cfSpark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>

          <filter id="cfSparkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Base Forged Shield Container */}
        {!isMonochrome && !isInverted ? (
          <>
            <rect x="2" y="2" width="32" height="32" rx="9" fill="url(#cfShieldBg)" />
            <rect
              x="2.5"
              y="2.5"
              width="31"
              height="31"
              rx="8.5"
              stroke="url(#cfShieldBorder)"
              strokeWidth="1"
            />
          </>
        ) : isMonochrome ? (
          <rect
            x="2"
            y="2"
            width="32"
            height="32"
            rx="9"
            className="fill-slate-900 dark:fill-white"
          />
        ) : (
          <rect x="2" y="2" width="32" height="32" rx="9" fill="#FFFFFF" />
        )}

        {/* 2. The Distinctive Forged 'C' Structure */}
        <path
          d="M 26 9.5
             C 22 6.5, 14 6.5, 9.5 11
             C 5.5 15, 5.5 21, 9.5 25
             C 14 29.5, 22 29.5, 26 26.5
             L 23.8 22.8
             C 20.8 24.8, 15.5 24.6, 12.8 21.8
             C 10.5 19.5, 10.5 16.5, 12.8 14.2
             C 15.5 11.4, 20.8 11.2, 23.8 13.2
             Z"
          fill={isMonochrome ? (variant === 'monochrome' ? 'currentColor' : '#1E293B') : isInverted ? '#4F46E5' : 'url(#cfForgeC)'}
        />

        {/* 3. The Embedded 4-Point AI Creation Sparkle */}
        <path
          d="M 20 8.5
             C 20 13.5, 16.5 18, 12 18
             C 16.5 18, 20 22.5, 20 27.5
             C 20 22.5, 23.5 18, 29.5 18
             C 23.5 18, 20 13.5, 20 8.5 Z"
          fill={isMonochrome ? '#FFFFFF' : isInverted ? '#6366F1' : 'url(#cfSpark)'}
          filter={!isMonochrome && !isInverted ? 'url(#cfSparkGlow)' : undefined}
        />

        {/* 4. Core Diamond Facet & Radiant Center */}
        {!isMonochrome && (
          <>
            <polygon
              points="20,15.6 22,18 20,20.4 18,18"
              fill="#4F46E5"
              opacity="0.85"
            />
            <circle cx="20" cy="18" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* 5. Satellite Creation Spark Accent (Top-Right Forge Spark) */}
        {!isMonochrome && (
          <path
            d="M 28 6.5 C 28 7.6, 27.2 8.5, 26 8.5 C 27.2 8.5, 28 9.4, 28 10.5 C 28 9.4, 28.8 8.5, 30 8.5 C 28.8 8.5, 28 7.6, 28 6.5 Z"
            fill="#38BDF8"
          />
        )}
      </svg>
    </div>
  );
};

export default CreateForgeMark;
