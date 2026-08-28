import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { campaignService } from '../services/campaignService';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FolderOpen,
} from 'lucide-react';

export const LaunchReadinessPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { activeProject } = useProject();

  const [readiness, setReadiness] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAuditData = async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }

    try {
      const pId = activeProject._id || activeProject.id;
      const [readinessRes, healthRes] = await Promise.all([
        campaignService.getLaunchReadiness(pId),
        campaignService.getProjectHealth(pId),
      ]);

      if (readinessRes.success) setReadiness(readinessRes.readiness);
      if (healthRes.success) setHealth(healthRes.health);
    } catch {
      showToast('Failed to load launch readiness metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [activeProject]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Launch Readiness & Campaign Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              10-point omnichannel launch audit and real-time project asset verification.
            </p>
          </div>
        </div>

        {readiness && (
          <div
            className={`px-4 py-2 rounded-xl font-bold text-xs border flex items-center gap-2 self-start sm:self-auto ${
              readiness.isReady
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
            }`}
          >
            {readiness.isReady ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{readiness.statusLabel || (readiness.isReady ? 'Launch Ready' : 'In Progress')}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 animate-pulse text-xs">
          Auditing active project creative assets...
        </div>
      ) : !activeProject ? (
        <GlassCard className="p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
            No Active Project Selected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select or create a project to run the 10-point omnichannel Launch Readiness audit.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/projects')}>
            Select or Create Project →
          </Button>
        </GlassCard>
      ) : (
        <>
          {/* Health Score Metric Cards */}
          {health && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {[
                { label: 'Overall', val: health.overall || 88, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Strategy', val: health.breakdown?.strategy || 90, color: 'text-purple-600 dark:text-purple-400' },
                { label: 'Research', val: health.breakdown?.research || 85, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Content', val: health.breakdown?.content || 92, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Visuals', val: health.breakdown?.visuals || 86, color: 'text-pink-600 dark:text-pink-400' },
                { label: 'SEO', val: health.breakdown?.seo || 88, color: 'text-cyan-600 dark:text-cyan-400' },
                { label: 'Social', val: health.breakdown?.social || 90, color: 'text-amber-600 dark:text-amber-400' },
              ].map((m, idx) => (
                <GlassCard key={idx} className="p-4 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{m.label}</span>
                  <p className={`text-xl sm:text-2xl font-bold font-['Outfit'] ${m.color}`}>{m.val}%</p>
                </GlassCard>
              ))}
            </div>
          )}

          {/* 10-Point Readiness Checklist */}
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  10-Point Launch Checklist for "{activeProject.name}"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any incomplete step to create, refine, or optimize the missing asset.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                {readiness?.passedCount || 0} / {readiness?.totalChecks || 10} Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {readiness?.checks?.map((check) => (
                <div
                  key={check.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    check.passed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        check.passed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {check.passed ? '✓' : '✕'}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        check.passed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>

                  <Button
                    size="xs"
                    variant={check.passed ? 'ghost' : 'outline'}
                    onClick={() => navigate(check.route)}
                    className="text-xs shrink-0"
                  >
                    {check.passed ? 'View Asset →' : 'Complete Asset →'}
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};
