import React, { useState, useEffect } from 'react';

/**
 * CreateForgeOrb
 * Lightweight, GPU-accelerated 3D glowing core with smooth mouse parallax and rotating orbital rings.
 */
export const CreateForgeOrb = ({ size = 'md', className = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-72 h-72',
    xl: 'w-96 h-96',
  };

  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/20 blur-3xl animate-pulse" />

      {/* Orbital Ring 1 */}
      <div
        className="absolute inset-2 rounded-full border border-indigo-500/20 border-dashed animate-spin"
        style={{ animationDuration: '24s' }}
      />

      {/* Orbital Ring 2 (Counter-rotating) */}
      <div
        className="absolute inset-6 rounded-full border border-purple-500/30 border-t-transparent border-b-transparent animate-spin"
        style={{ animationDuration: '16s', animationDirection: 'reverse' }}
      />

      {/* Inner Glowing Core Sphere */}
      <div className="relative w-2/3 h-2/3 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/50 flex items-center justify-center backdrop-blur-md overflow-hidden">
        {/* Specular Highlight */}
        <div className="absolute top-1 left-2 w-1/2 h-1/3 bg-white/40 rounded-full blur-xs transform -rotate-45" />

        {/* Center Spark Icon */}
        <svg
          className="w-1/2 h-1/2 text-white/90 drop-shadow-md animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
      </div>
    </div>
  );
};
