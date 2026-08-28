import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  Send,
  Target,
  Users,
  Shield,
  Zap,
  Globe,
  Plus,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { briefService } from '../services/briefService';

export const CreativeBriefPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { activeProject, refreshProjects } = useProject();

  const [rawInput, setRawInput] = useState('');
  const [projectName, setProjectName] = useState('');
  const [targetAudience, setTargetAudience] = useState('Creators & Founders');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [brandPersonality, setBrandPersonality] = useState('Visionary & Authoritative');

  const [loading, setLoading] = useState(false);
  const [briefResult, setBriefResult] = useState(null);

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name || '');
      if (activeProject.category) setIndustry(activeProject.category);
    }
  }, [activeProject]);

  const handleGenerateBrief = async (e) => {
    e?.preventDefault();
    if (!rawInput.trim()) {
      showToast('Please provide your initial thoughts or campaign goals.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await briefService.generateBrief({
        rawInput: rawInput.trim(),
        projectName: projectName.trim() || activeProject?.name || 'Campaign Blueprint',
        projectId: activeProject?._id || activeProject?.id,
        targetAudience,
        industry,
        brandPersonality,
      });

      if (res.success && res.data?.brief) {
        setBriefResult(res.data.brief);
        showToast('Creative Brief generated and synced to project!', 'success');
        refreshProjects();
      }
    } catch (err) {
      showToast('Failed to generate Creative Brief.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    if (!briefResult) return;
    // Dispatch to next pipeline stage: Research / Content
    navigate('/research', {
      state: {
        topic: briefResult.mainTopic || briefResult.projectName,
        targetAudience: briefResult.targetAudience,
        industry: briefResult.industry,
      },
    });
  };

  return (
    <ToolLayout
      title="Creative Brief Engine"
      subtitle="Transform unstructured thoughts into a high-signal strategic campaign brief with recommended deliverables."
      icon={FileText}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6">
              <form onSubmit={handleGenerateBrief} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit']">
                    Campaign / Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Q3 Growth Initiative, Fitness App Launch..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit']">
                    Raw Campaign Notes & Goals *
                  </label>
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Describe what you want to achieve, key features, target customer problems, and creative direction..."
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Industry / Niche
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Brand Personality
                  </label>
                  <select
                    value={brandPersonality}
                    onChange={(e) => setBrandPersonality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Visionary & Authoritative</option>
                    <option>Approachable & Conversational</option>
                    <option>Bold & Disruptive</option>
                    <option>Technical & Precise</option>
                    <option>Inspirational & Energetic</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || !rawInput.trim()}
                  className="w-full shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Synthesizing Strategic Brief...' : 'Generate Brief with AI'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Structured Creative Brief Output */}
          <div className="lg:col-span-7 space-y-5">
            {briefResult ? (
              <div className="space-y-5 animate-in fade-in">
                {/* Header Card */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                        ✦ AI Creative Brief Blueprint
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-2">
                        {briefResult.projectName}
                      </h3>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCreateCampaign}
                      className="shadow-md shadow-indigo-500/20"
                    >
                      <span>Proceed to Research</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                        Campaign Objective
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                        {briefResult.campaignObjective}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Audience</span>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{briefResult.targetAudience}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Primary Platform</span>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{briefResult.primaryPlatform}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Recommended Deliverables Checklist */}
                {briefResult.requiredDeliverables?.length > 0 && (
                  <GlassCard className="p-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Recommended Campaign Deliverables
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {briefResult.requiredDeliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Visual Direction & Strategic Guidance */}
                {briefResult.visualDirection && (
                  <GlassCard className="p-6 space-y-2 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-500" />
                      FLUX Visual Direction
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{briefResult.visualDirection}"
                    </p>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  Creative Brief Blueprint
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                  Enter your raw notes or project goals. CreateForge AI will structure them into a formal brief and recommend cross-channel deliverables.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-[11px] text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Objective Definition</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Deliverables Checklist</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">FLUX Visual Guide</span>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
