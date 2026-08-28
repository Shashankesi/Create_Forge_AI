import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

export const QualityScoreCard = ({ scores, className = '' }) => {
  if (!scores) return null;

  const {
    overallScore = 90,
    clarity = 92,
    structure = 94,
    depth = 88,
    readability = 91,
    seo = 89,
    specificity = 87,
    strengths = [],
    weaknesses = [],
  } = scores;

  const metrics = [
    { label: 'Clarity', value: clarity, color: 'bg-emerald-500' },
    { label: 'Structure', value: structure, color: 'bg-indigo-500' },
    { label: 'Depth', value: depth, color: 'bg-purple-500' },
    { label: 'Readability', value: readability, color: 'bg-blue-500' },
    { label: 'SEO Coverage', value: seo, color: 'bg-amber-500' },
    { label: 'Specificity', value: specificity, color: 'bg-pink-500' },
  ];

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 80) return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className={`p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 ${className}`}>
      {/* Header & Overall Score */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-['Outfit']">
              Content Quality Score
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Editorial & Algorithm Analysis</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold text-sm font-['Outfit'] ${getScoreBadgeColor(overallScore)}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{overallScore}/100</span>
        </div>
      </div>

      {/* Metric Progress Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">{m.label}</span>
              <span className="font-bold text-slate-900 dark:text-white text-[11px]">{m.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Actionable Notes */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {strengths.length > 0 && (
            <div className="space-y-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Key Strengths
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                {strengths.map((s, idx) => (
                  <li key={idx} className="truncate">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="space-y-1">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3 h-3" /> Optimization Advice
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                {weaknesses.map((w, idx) => (
                  <li key={idx} className="truncate">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
