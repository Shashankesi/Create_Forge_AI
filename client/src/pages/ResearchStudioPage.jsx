import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileText,
  BookOpen,
  Globe,
  Heading,
  CheckCircle2,
  TrendingUp,
  Layers,
  Compass,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { researchService } from '../services/researchService';
import { multimodalService } from '../services/multimodalService';

export const ResearchStudioPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject, refreshProjects } = useProject();

  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('General');
  const [industry, setIndustry] = useState('Technology');
  const [depth, setDepth] = useState('Standard'); // 'Quick' | 'Standard' | 'Deep'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [researchData, setResearchData] = useState(null);

  // Content Gap State
  const [gapText, setGapText] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);

  const handleAnalyzeGaps = async () => {
    if (!topic.trim() || !gapText.trim()) return;
    setGapLoading(true);
    try {
      const res = await multimodalService.analyzeContentGaps({
        topic: topic.trim(),
        currentContent: gapText.trim(),
        targetAudience,
      });
      if (res.success && res.analysis) {
        setGapResult(res.analysis);
        showToast('Content Gap analysis complete!', 'success');
      }
    } catch {
      showToast('Failed to analyze content gaps', 'error');
    } finally {
      setGapLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      if (location.state.targetAudience) setTargetAudience(location.state.targetAudience);
      if (location.state.industry) setIndustry(location.state.industry);
    } else if (activeProject) {
      setTopic(activeProject.name || '');
    }
  }, [location.state, activeProject]);

  const handleConductResearch = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      showToast('Please provide a research topic or question.', 'warning');
      setError('Please enter a research topic or question.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await researchService.conductResearch({
        topic: topic.trim(),
        targetAudience,
        industry,
        depth,
        projectId: activeProject?._id || activeProject?.id,
      });

      if (res.success && res.data?.research) {
        setResearchData(res.data.research);
        showToast('Research dossier assembled!', 'success');
        refreshProjects();
      } else {
        setError('Received incomplete research data from server.');
      }
    } catch (err) {
      setError(err?.customMessage || 'Could not conduct research right now. Please try again.');
      showToast('Could not conduct research.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToArticle = () => {
    if (!researchData) return;
    navigate('/article', {
      state: {
        topic: researchData.topic,
        targetAudience: researchData.targetAudience,
        researchContext: researchData,
      },
    });
  };

  const handleSendToSeo = () => {
    if (!researchData) return;
    navigate('/seo-studio', {
      state: {
        topic: researchData.topic,
      },
    });
  };

  const handleSendToBrief = () => {
    if (!researchData) return;
    navigate('/brief', {
      state: {
        topic: researchData.topic,
        targetAudience: researchData.targetAudience,
      },
    });
  };

  const handleSendToTitles = () => {
    if (!researchData) return;
    navigate('/titles', {
      state: {
        topic: researchData.topic,
        niche: researchData.industry || industry,
        targetAudience: researchData.targetAudience,
      },
    });
  };

  return (
    <ToolLayout
      title="Research Studio"
      subtitle="Gather audience pain points, search intent, user questions, and content gaps to inform high-authority creations."
      icon={Search}
      error={error}
      onClearError={() => setError('')}
      onRetry={handleConductResearch}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Research Query Form */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6">
              <form onSubmit={handleConductResearch} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit']">
                    Research Topic or Question *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Next-gen Cloud Architecture, Esports Marketing..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                      Industry Domain
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Research Depth Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Research Depth
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Quick', 'Standard', 'Deep'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDepth(d)}
                        className={`py-1.5 rounded-xl font-bold border transition-all ${
                          depth === d
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || !topic.trim()}
                  className="w-full shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Mining Insights & Search Intent...' : 'Generate Research'}
                </Button>
              </form>
            </GlassCard>

            {/* Content Gap Analysis Card */}
            <GlassCard className="p-6 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-indigo-400">
                🔍 Content Gap Analyzer
              </h4>
              <p className="text-slate-400">
                Paste draft text or competitor article to uncover missing subtopics and get coverage score.
              </p>
              <textarea
                rows={3}
                placeholder="Paste content here to analyze gaps against topic..."
                value={gapText}
                onChange={(e) => setGapText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAnalyzeGaps}
                disabled={gapLoading || !topic.trim() || !gapText.trim()}
                className="w-full"
              >
                {gapLoading ? 'Analyzing Gaps...' : 'Analyze Content Gaps'}
              </Button>

              {gapResult && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Coverage Score</span>
                    <span className="font-bold text-emerald-400">{gapResult.estimatedCoverageScore}%</span>
                  </div>
                  {gapResult.missingSubtopics?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-rose-400">Missing Subtopics</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-0.5">
                        {gapResult.missingSubtopics.slice(0, 3).map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Research Intelligence Dossier */}
          <div className="lg:col-span-7 space-y-5">
            {researchData ? (
              <div className="space-y-5 animate-in fade-in">
                {/* Action Bar */}
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Search Intent: <strong className="text-indigo-600 dark:text-indigo-400">{researchData.searchIntent}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={handleSendToArticle}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Generate Article
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleSendToSeo}
                    >
                      <Globe className="w-3.5 h-3.5 mr-1 text-purple-500" />
                      Send to SEO
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleSendToBrief}
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      Create Brief
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleSendToTitles}
                    >
                      <Heading className="w-3.5 h-3.5 mr-1 text-pink-500" />
                      Create Headlines
                    </Button>
                  </div>
                </div>

                {/* Key Points Grid */}
                {researchData.keyPoints?.length > 0 && (
                  <GlassCard className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Core Findings & Key Insights
                    </h4>
                    <div className="space-y-2 text-xs">
                      {researchData.keyPoints.map((pt, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-start gap-2">
                          <span className="font-bold text-indigo-600 mt-0.5">{idx + 1}.</span>
                          <span className="leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Questions People Ask */}
                {researchData.questionsPeopleAsk?.length > 0 && (
                  <GlassCard className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      Questions People Ask (Search Signals)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {researchData.questionsPeopleAsk.map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Audience Pain Points & Content Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {researchData.audiencePainPoints?.length > 0 && (
                    <GlassCard className="p-4 space-y-2">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                        Audience Pain Points
                      </h5>
                      <div className="space-y-1.5">
                        {researchData.audiencePainPoints.map((p, i) => (
                          <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            • {p}
                          </p>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {researchData.contentGaps?.length > 0 && (
                    <GlassCard className="p-4 space-y-2">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                        Content Gaps to Exploit
                      </h5>
                      <div className="space-y-1.5">
                        {researchData.contentGaps.map((g, i) => (
                          <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            • {g}
                          </p>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </div>

                {/* Competitive Angle & Recommended Content Strategy */}
                {researchData.competitorAngle && (
                  <GlassCard className="p-5 space-y-2 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-indigo-400">
                      🎯 Competitive Differentiation & Angle
                    </h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                      {researchData.competitorAngle}
                    </p>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  Research Studio Ready
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                  Enter a topic or niche. CreateForge will explore user intent, high-signal questions, audience pain points, and underexplored angles.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-[11px] text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Search Intent</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Pain Points</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Content Gaps</span>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
