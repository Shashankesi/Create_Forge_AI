import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { campaignService } from '../services/campaignService';
import {
  Rocket,
  Sparkles,
  Target,
  Search,
  FileText,
  Palette,
  Globe,
  Share2,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Flame,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const CampaignBuilderPage = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { activeProject } = useProject();

  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy');
  const [copiedKey, setCopiedKey] = useState(null);

  const presets = [
    {
      label: '🚀 SaaS AI App Launch',
      idea: 'Launch our new autonomous AI productivity suite for high-growth founders and developers to accelerate creative velocity.',
      objective: 'Acquire 5,000 active beta users and drive organic product buzz in 30 days',
      audience: 'SaaS Founders, Product Managers, Indie Hackers, Software Engineers',
    },
    {
      label: '📈 B2B Thought Leadership',
      idea: 'Position our brand as the definitive authority on next-generation enterprise workflow automation.',
      objective: 'Generate 200 qualified enterprise demo requests and build high-reputation domain authority',
      audience: 'Chief Technology Officers, VP of Engineering, Operations Leaders',
    },
    {
      label: '🛍️ E-Commerce Blitz',
      idea: 'Omnichannel creative blitz for our sustainable luxury apparel product line launch.',
      objective: 'Drive $100K in pre-order volume and scale social engagement by 300%',
      audience: 'Eco-conscious urban professionals aged 24-42',
    },
    {
      label: '🎙️ Creator Growth',
      idea: 'Scale a high-impact newsletter and YouTube video content strategy for tech builders.',
      objective: 'Gain 10,000 email subscribers and establish a loyal monetization funnel',
      audience: 'Tech creators, developers, designers, and remote freelancers',
    },
  ];

  // Load existing campaign if query param present
  useEffect(() => {
    if (campaignId) {
      const fetchCampaign = async () => {
        try {
          const res = await campaignService.getCampaignById(campaignId);
          if (res.success && res.campaign) {
            setCampaign(res.campaign);
            setIdeaPrompt(res.campaign.idea || '');
          }
        } catch {
          showToast('Failed to load campaign plan', 'error');
        }
      };
      fetchCampaign();
    }
  }, [campaignId]);

  const handleApplyPreset = (preset) => {
    setIdeaPrompt(preset.idea);
    setObjective(preset.objective);
    setAudience(preset.audience);
    showToast(`Loaded "${preset.label}" template`, 'info');
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!ideaPrompt.trim()) {
      showToast('Please provide a campaign idea or prompt.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await campaignService.generateCampaign({
        idea: ideaPrompt.trim(),
        objective: objective.trim(),
        audience: audience.trim(),
        projectId: activeProject?._id || activeProject?.id || null,
      });

      if (res.success && res.campaign) {
        setCampaign(res.campaign);
        showToast('Autonomous Campaign Plan Synthesized!', 'success');
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to synthesize campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Autonomous Campaign Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Transform a single creative idea into a synchronized 8-stage omnichannel launch blueprint.
            </p>
          </div>
        </div>

        {campaign && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <span>Health Score:</span>
              <span className="text-sm">{campaign.healthScore?.overall || 88}%</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              onClick={() => navigate('/launch-readiness')}
              className="text-xs"
            >
              Launch Readiness
            </Button>
          </div>
        )}
      </div>

      {/* Input Prompt Card */}
      <GlassCard className="p-6 space-y-5">
        {/* Quick Presets Bar */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-['Outfit']">
            Quick Inspiration Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/80 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-['Outfit']">
              What do you want to launch? *
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder='e.g., "Launch my new AI productivity app for high-growth tech founders, creators, and engineers with FLUX visuals, pillar guides, and viral X threads"'
              value={ideaPrompt}
              onChange={(e) => setIdeaPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Goal / Objective (Optional)
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 5,000 product signups in 30 days"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Solopreneurs, engineers, and digital marketing leaders"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ⚡ Orchestrates 8 Stages: Strategy • Brief • Research • Content • Visuals • SEO • Social • CTAs
            </span>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || !ideaPrompt.trim()}
              className="shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? 'Synthesizing 8-Stage Plan...' : 'Generate Campaign Plan'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Generated Campaign Plan Display */}
      {campaign && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stage Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'strategy', label: '1. Strategy', icon: Target },
              { id: 'research', label: '2. Research', icon: Search },
              { id: 'content', label: '3. Content Plan', icon: FileText },
              { id: 'visuals', label: '4. Visual Direction', icon: Palette },
              { id: 'seo', label: '5. SEO Plan', icon: Globe },
              { id: 'social', label: '6. Social Pack', icon: Share2 },
              { id: 'email', label: '7. Email & CTAs', icon: Mail },
              { id: 'deliverables', label: '8. Deliverables & Review', icon: Layers },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Core Positioning & Messaging</span>
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                    Strategic Overview
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {campaign.strategy?.overview || 'Comprehensive strategic launch alignment.'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                    Key Core Message
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{campaign.strategy?.keyMessage || 'Empowering the next wave of creative thinkers.'}"
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                    Market Positioning
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {campaign.strategy?.positioning || 'The premier autonomous multimodal workspace.'}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Funnel Architecture</span>
                </h3>
                <div className="space-y-3">
                  {campaign.strategy?.funnelStages?.map((stage, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{stage.stage}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Goal: {stage.goal}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stage.tactics?.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 2: RESEARCH */}
          {activeTab === 'research' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                    <Search className="w-4 h-4 text-indigo-500" />
                    <span>Target Search Queries & Intent</span>
                  </h3>
                  <Button size="xs" variant="outline" onClick={() => navigate('/research')}>
                    Open Research →
                  </Button>
                </div>
                <div className="space-y-2">
                  {campaign.researchPlan?.searchQueries?.map((sq, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">"{sq.query}"</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {sq.intent}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Market Insights & User Questions</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Questions People Ask
                  </p>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {campaign.researchPlan?.keyQuestions?.map((q, idx) => (
                      <li key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        "{q}"
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 3: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaign.contentStrategy?.articleIdeas?.map((art, idx) => (
                  <GlassCard key={idx} className="p-5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        Pillar Article {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {art.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {art.angle}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span>Target: ~{art.targetWordCount || 1200} words</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => navigate('/article', { state: { topic: art.title } })}
                      className="w-full text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Draft in Article Studio →
                    </Button>
                  </GlassCard>
                ))}
              </div>

              <GlassCard className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>High-Converting Headlines</span>
                </h4>
                <div className="space-y-2">
                  {campaign.contentStrategy?.headlines?.map((h, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-500 mr-2">{h.category}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">"{h.headline}"</span>
                      </div>
                      <span className="font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {h.score || 90}% Score
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 4: VISUALS */}
          {activeTab === 'visuals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Palette className="w-4 h-4 text-pink-500" />
                  <span>Color Palette & Aesthetic</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Mood: <strong className="text-slate-900 dark:text-white">{campaign.visualStrategy?.mood}</strong>
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {campaign.visualStrategy?.colorPalette?.map((hex, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopyText(hex, `hex_${idx}`)}
                      className="group cursor-pointer text-center space-y-1"
                    >
                      <div
                        className="h-14 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {copiedKey === `hex_${idx}` ? 'Copied!' : hex}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>FLUX Image Prompts</span>
                  </h3>
                  <Button size="xs" variant="outline" onClick={() => navigate('/image')}>
                    Open Image Studio →
                  </Button>
                </div>
                <div className="space-y-3">
                  {campaign.visualStrategy?.imagePrompts?.map((ip, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">"{ip.prompt}"</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Ratio: {ip.aspectRatio || '16:9'}</span>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => navigate('/image', { state: { prompt: ip.prompt } })}
                        >
                          Generate Visual
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 5: SEO */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>SERP Preview & Metadata</span>
                </h3>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] text-emerald-600 font-mono">https://yoursite.com/{campaign.seoStrategy?.slug || 'campaign'}</span>
                  <p className="text-sm font-bold text-indigo-600 hover:underline cursor-pointer">
                    {campaign.seoStrategy?.metaTitle}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    {campaign.seoStrategy?.metaDescription}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Keyword Matrix</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-500">Primary Keyword</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {campaign.seoStrategy?.primaryKeyword}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-500">Secondary Target Keywords</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {campaign.seoStrategy?.secondaryKeywords?.map((kw, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 6: SOCIAL */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {campaign.socialStrategy?.posts?.map((sp, idx) => (
                <GlassCard key={idx} className="p-5 flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      {sp.platform}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {sp.caption}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{sp.hashtags?.join(' ')}</span>
                    <button
                      onClick={() => handleCopyText(sp.caption, `soc_${idx}`)}
                      className="text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-1"
                    >
                      {copiedKey === `soc_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* TAB 7: EMAIL & CTA */}
          {activeTab === 'email' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Email Campaign Sequence</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase text-indigo-500">Subject Line</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{campaign.socialStrategy?.emailOutline?.subject || 'Exclusive Early Access'}"
                  </p>
                  <p className="text-[10px] font-bold uppercase text-indigo-500 pt-2">Key Takeaways</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {campaign.socialStrategy?.emailOutline?.bodyPoints?.join(' • ')}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>High-Converting CTA Variations</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/40">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Primary CTA</span>
                    <p className="font-bold text-indigo-950 dark:text-indigo-200 text-sm mt-0.5">
                      {campaign.ctaStrategy?.primary}
                    </p>
                  </div>
                  {campaign.ctaStrategy?.urgencyVariations?.map((u, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      "{u}"
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 8: DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Omnichannel Launch Deliverables Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    One-click launch pad to execute and finalize all synthesized creative assets.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/launch-readiness')}>
                  Launch Checklist →
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Pillar Article', route: '/article', icon: FileText, desc: 'Long-form thought leadership' },
                  { name: 'FLUX Visuals', route: '/image', icon: Palette, desc: 'High-res hero & social imagery' },
                  { name: 'SEO Optimization', route: '/seo-studio', icon: Globe, desc: 'SERP & keyword density' },
                  { name: 'Social Pack', route: '/social-pack', icon: Share2, desc: 'LinkedIn, X & Instagram copy' },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(item.route)}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
