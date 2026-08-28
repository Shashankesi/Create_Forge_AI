import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { multimodalService } from '../services/multimodalService';

export const AbLabPage = () => {
  const { showToast } = useToast();

  const [assetType, setAssetType] = useState('Headline');
  const [audience, setAudience] = useState('Tech Founders & Creators');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const handleCompare = async (e) => {
    e?.preventDefault();
    if (!variantA.trim() || !variantB.trim()) {
      showToast('Please provide both Variant A and Variant B.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await multimodalService.runAbComparison({
        variantA: variantA.trim(),
        variantB: variantB.trim(),
        assetType,
        targetAudience: audience.trim(),
      });

      if (res.success && res.comparison) {
        setComparison(res.comparison);
        showToast('A/B Heuristic Evaluation Complete!', 'success');
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to compare variants', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/20 text-white text-xl">
            ⚖️
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">Creative A/B Lab</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Heuristic psychological evaluation of headlines, CTAs, ad copy, and messaging variants.
            </p>
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Category</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                disabled={loading}
              >
                <option value="Headline">Campaign Headline</option>
                <option value="CTA">Call To Action Button</option>
                <option value="Hero Copy">Hero Section Value Proposition</option>
                <option value="Social Hook">Social Media Hook / Intro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
              <input
                type="text"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                placeholder="e.g. Enterprise CMOs & Growth Leaders"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyan-400 mb-1">Variant A</label>
              <textarea
                rows={3}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                placeholder='e.g. "Automate Your Marketing Campaigns with AI"'
                value={variantA}
                onChange={(e) => setVariantA(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-400 mb-1">Variant B</label>
              <textarea
                rows={3}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder='e.g. "From Idea to Omnichannel Launch in 60 Seconds"'
                value={variantB}
                onChange={(e) => setVariantB(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Evaluates: Clarity • Psychological Hook • Emotional Resonance • Conversion Actionability
            </span>
            <Button type="submit" disabled={loading || !variantA.trim() || !variantB.trim()}>
              {loading ? 'Evaluating Variants...' : '⚖️ Compare Variants'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {comparison && (
        <div className="space-y-6">
          {/* Winner Recommendation Banner */}
          <GlassCard className="p-6 bg-gradient-to-r from-indigo-950/40 to-cyan-950/40 border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-cyan-400">Heuristic Winner Recommendation</span>
              <span className="text-xs font-bold px-3 py-1 bg-cyan-950 text-cyan-300 rounded-full border border-cyan-800/40">
                RECOMMENDED: {comparison.recommendation}
              </span>
            </div>
            <p className="text-base font-bold text-slate-100">{comparison.rationale}</p>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variant A Card */}
            <GlassCard className="p-6 space-y-4 border-cyan-500/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-cyan-400">Variant A Evaluation</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Clarity: {comparison.variantA?.estimatedClarity}%</span>
                  <span className="text-emerald-400">Impact: {comparison.variantA?.estimatedImpact}%</span>
                </div>
              </div>

              <p className="text-base font-bold text-slate-100 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                "{variantA}"
              </p>

              <div>
                <p className="text-xs font-semibold uppercase text-emerald-400 mb-1">Strengths</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {comparison.variantA?.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-rose-400 mb-1">Weaknesses</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  {comparison.variantA?.weaknesses?.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </GlassCard>

            {/* Variant B Card */}
            <GlassCard className="p-6 space-y-4 border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-indigo-400">Variant B Evaluation</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Clarity: {comparison.variantB?.estimatedClarity}%</span>
                  <span className="text-emerald-400">Impact: {comparison.variantB?.estimatedImpact}%</span>
                </div>
              </div>

              <p className="text-base font-bold text-slate-100 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                "{variantB}"
              </p>

              <div>
                <p className="text-xs font-semibold uppercase text-emerald-400 mb-1">Strengths</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {comparison.variantB?.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-rose-400 mb-1">Weaknesses</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  {comparison.variantB?.weaknesses?.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
