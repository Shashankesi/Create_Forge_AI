import React, { useRef, useEffect, useState } from 'react';
import { CreateForgeMark } from '../brand/CreateForgeMark';
import { FileText, Heading, Image as ImageIcon, Layers } from 'lucide-react';

/**
 * CreateForge Core — 3D Geometric Floating Engine & Tool Pipeline Orbit
 * Represents: Write, Ideate, Create, Transform
 */
export const CreateForgeCore = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = 460;
    const height = 340;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const particles = Array.from({ length: 18 }, (_, i) => ({
      orbitRadius: 90 + (i % 3) * 35,
      speed: 0.008 + (i % 4) * 0.003,
      angle: (i * Math.PI * 2) / 18,
      size: 1.5 + (i % 2) * 1.5,
      opacity: 0.3 + (i % 3) * 0.25,
      yOffset: Math.sin(i) * 20,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const targetAngle = isReducedMotion ? 0.5 : angle;

      // Orbital rings
      [90, 125, 160].forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r, r * 0.42, targetAngle * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Floating particles
      particles.forEach((p) => {
        const currentAngle = p.angle + (isReducedMotion ? 0 : targetAngle * p.speed * 80);
        const px = centerX + Math.cos(currentAngle) * p.orbitRadius;
        const py = centerY + Math.sin(currentAngle) * (p.orbitRadius * 0.42) + p.yOffset;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${p.opacity})`;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Soft ambient core glow
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 75);
      coreGlow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      coreGlow.addColorStop(0.5, 'rgba(79, 70, 229, 0.12)');
      coreGlow.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 75, 0, Math.PI * 2);
      ctx.fill();

      if (!isReducedMotion) {
        angle += 0.012;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 15, y: y * 15 });
  };

  const orbitNodes = [
    { title: 'Write Articles', icon: FileText, color: 'text-indigo-500', pos: 'top-2 left-1/2 -translate-x-1/2' },
    { title: 'Ideate Titles', icon: Heading, color: 'text-purple-500', pos: 'top-1/2 left-4 -translate-y-1/2' },
    { title: 'Create Visuals', icon: ImageIcon, color: 'text-amber-500', pos: 'top-1/2 right-4 -translate-y-1/2' },
    { title: 'Transform Cutouts', icon: Layers, color: 'text-emerald-500', pos: 'bottom-2 left-1/2 -translate-x-1/2' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative w-full max-w-[460px] h-[340px] mx-auto flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        style={{ width: 460, height: 340 }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Central 3D Geometric CreateForge Core */}
      <div
        style={{
          transform: `perspective(800px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg) scale(${
            isHovered ? 1.05 : 1
          })`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="relative z-20 flex flex-col items-center justify-center"
      >
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 rounded-2xl bg-indigo-500/20 dark:bg-indigo-500/30 blur-md group-hover:bg-indigo-500/40 transition-all" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 p-0.5 shadow-xl flex items-center justify-center border border-white/20">
            <CreateForgeMark size={38} variant="inverted" />
          </div>
        </div>

        <span className="text-[11px] font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase mt-2.5 bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs shadow-xs">
          CreateForge Core
        </span>
      </div>

      {/* Orbiting Tool Pipeline Nodes */}
      {orbitNodes.map((node, idx) => {
        const Icon = node.icon;
        return (
          <div
            key={idx}
            className={`absolute ${node.pos} z-30 transition-transform duration-300`}
            style={{
              transform: `translate(${mousePos.x * (idx % 2 === 0 ? 0.5 : -0.5)}px, ${
                mousePos.y * (idx < 2 ? 0.5 : -0.5)
              }px)`,
            }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-md hover:border-indigo-400 transition-colors">
              <Icon className={`w-3.5 h-3.5 ${node.color}`} />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {node.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
