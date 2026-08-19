import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, BookOpen, Clock, Copy, Download, CheckCircle2 } from 'lucide-react';
import { PixoraMark } from '../brand/PixoraMark';

export const HeroProductPreview = () => {
  const [stage, setStage] = useState('idle'); // 'idle' | 'generating' | 'complete'
  const [subStep, setSubStep] = useState(0);

  const subSteps = [
    'Researching topic & context',
    'Structuring outline & headings',
    'Writing article sections',
    'Polishing final output',
  ];

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      setStage('complete');
      return;
    }

    let timeout;
    if (stage === 'idle') {
      timeout = setTimeout(() => {
        setStage('generating');
        setSubStep(0);
      }, 3000);
    } else if (stage === 'generating') {
      if (subStep < subSteps.length - 1) {
        timeout = setTimeout(() => {
          setSubStep((prev) => prev + 1);
        }, 900);
      } else {
        timeout = setTimeout(() => {
          setStage('complete');
        }, 1100);
      }
    } else if (stage === 'complete') {
      timeout = setTimeout(() => {
        setStage('idle');
      }, 6000);
    }

    return () => clearTimeout(timeout);
  }, [stage, subStep]);

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      <div className="app-card rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0c111c] transition-all">
        {/* Workspace Window Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0f1626]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <PixoraMark size={16} />
              <span>Article Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'generating' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Generating…
              </span>
            ) : stage === 'complete' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                Article Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Workspace Body Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[360px]">
          {/* Left Parameter Panel */}
          <div className="md:col-span-5 p-5 space-y-4 bg-slate-50/40 dark:bg-[#0a0f1a]/40 text-left">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Topic or Question
              </label>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-xs">
                How esports became a global industry
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Tone
                </label>
                <div className="px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                  Professional
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Length
                </label>
                <div className="px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                  Medium (~1000w)
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                className={`w-full py-2 px-3 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  stage === 'generating'
                    ? 'bg-indigo-700 opacity-90 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{stage === 'generating' ? 'Creating Article…' : 'Generate Article'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Subject Resolution</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Esports</span>
            </div>
          </div>

          {/* Right Live Result Preview Panel */}
          <div className="md:col-span-7 p-5 sm:p-6 space-y-4 text-left bg-white dark:bg-[#0c111c] flex flex-col justify-between">
            {stage === 'generating' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-8 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 animate-pulse">
                  <PixoraMark size={24} animate={true} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    ✦ Pixora is creating
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {subSteps[subStep]}…
                  </p>
                </div>
                {/* Micro staged step indicators */}
                <div className="flex items-center gap-1.5 pt-2">
                  {subSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === subStep
                          ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                          : idx < subStep
                          ? 'w-2 bg-indigo-400 dark:bg-indigo-600'
                          : 'w-2 bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : stage === 'complete' ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Header Info */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      1,048 words
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      5 min read
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Markdown
                    </div>
                  </div>
                </div>

                {/* Formatted Article Sample */}
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Esports Explained: How Competitive Gaming Became a Global Industry
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-normal">
                    Esports has evolved from grassroots LAN gatherings into a billion-dollar entertainment sector. Professional teams train for hours daily, employ dedicated coaches and data analysts, and compete before millions of online viewers.
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                      Key Industry Pillars
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <li>Competitive ecosystems across FPS, MOBA, and Battle Royale genres</li>
                      <li>Global broadcasting networks and dedicated streaming infrastructure</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">Production-Ready Output</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-medium">
                      Copy
                    </span>
                    <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-medium">
                      Export
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle Initial Preview State */
              <div className="flex-1 flex flex-col justify-between space-y-4 py-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Live Editor Preview</span>
                    <span className="text-[11px] text-slate-400">Click Generate to start</span>
                  </div>
                  <div className="space-y-2 opacity-50">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-full" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-5/6" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-4/5" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300">
                  ✦ Ready to generate structured articles, headlines, visuals, and transparent cutouts.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
