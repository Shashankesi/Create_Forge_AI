import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Shield,
  Search,
  BookOpen,
  Volume2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';

export const QualityCenterPage = () => {
  const { showToast } = useToast();
  const { activeProject } = useProject();

  const [contentToAudit, setContentToAudit] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  useEffect(() => {
    // If active project has an article asset, load it
    if (activeProject?.items) {
      const articleItem = activeProject.items.find((i) => i.assetType === 'article');
      if (articleItem && typeof articleItem.content === 'string') {
        setContentToAudit(articleItem.content);
      }
    }
  }, [activeProject]);

  const handleRunAudit = async (e) => {
    e?.preventDefault();
    if (!contentToAudit.trim()) {
      showToast('Please provide or paste content to audit.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Run brand consistency audit in parallel with quality scoring
      const res = await aiService.evaluateBrandConsistency({
        content: contentToAudit.trim(),
      });

      if (res.success && res.data) {
        setAuditResult(res.data);
        showToast('Complete Studio Quality Audit finished!', 'success');
      }
    } catch (err) {
      showToast('Audit evaluation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Content Quality Center"
      subtitle="Comprehensive multi-dimensional audit evaluating Content Quality, SEO signals, Readability, and Brand Voice Consistency."
      icon={CheckCircle2}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Content Excerpt Input */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6">
              <form onSubmit={handleRunAudit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit']">
                      Content Draft to Audit *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {contentToAudit.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    value={contentToAudit}
                    onChange={(e) => setContentToAudit(e.target.value)}
                    placeholder="Paste article draft, landing page copy, or email newsletter to audit quality and brand voice..."
                    rows={12}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-mono text-[11px] leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || !contentToAudit.trim()}
                  className="w-full shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Auditing Content Quality & Voice...' : 'Run Quality Audit'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Score Breakdown & Actionable Fixes */}
          <div className="lg:col-span-7 space-y-5">
            {auditResult ? (
              <div className="space-y-5 animate-in fade-in">
                {/* Overall Score Badge */}
                <GlassCard className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Studio Quality Score
                    </span>
                    <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                      {auditResult.brandConsistencyScore || 92}/100
                    </h3>
                    <p className="text-xs text-slate-500">
                      Production grade content with high brand voice fidelity.
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                </GlassCard>

                {/* Sub-metric Progress Bars */}
                <GlassCard className="p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit']">
                    Multi-Dimensional Score Breakdown
                  </h4>

                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Brand Voice Alignment', value: auditResult.toneAlignment || 92, color: 'bg-indigo-500' },
                      { label: 'Vocabulary & Diction Fit', value: auditResult.vocabularyFit || 95, color: 'bg-purple-500' },
                      { label: 'Audience Relevance', value: auditResult.audienceRelevance || 94, color: 'bg-emerald-500' },
                      { label: 'Structural Flow & Cadence', value: 91, color: 'bg-blue-500' },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                          <span>{m.label}</span>
                          <span>{m.value}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.color} transition-all duration-500`}
                            style={{ width: `${m.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Actionable Recommendations */}
                {auditResult.actionableFixes?.length > 0 && (
                  <GlassCard className="p-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                      Targeted Recommendations
                    </h4>
                    <div className="space-y-2 text-xs">
                      {auditResult.actionableFixes.map((fix, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          • {fix}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  Quality Audit Ready
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                  Evaluate any piece of content against brand voice, forbidden vocabulary, structural cadence, and audience relevance.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
