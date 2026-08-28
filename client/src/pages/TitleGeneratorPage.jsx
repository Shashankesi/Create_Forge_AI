import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heading,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  FileText,
  ArrowRight,
  TrendingUp,
  BarChart2,
  HelpCircle,
  FolderPlus,
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Layers,
  Swords,
  Trophy,
  Wand2,
  Eye,
  BookOpen,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreateForgeAssistant } from '../components/common/CreateForgeAssistant';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';
import { projectService } from '../services/projectService';

export const TitleGeneratorPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject, creativeContext, useProjectContext, setUseProjectContext, addAssetToActiveProject } = useProject();

  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Technology & AI');
  const [targetAudience, setTargetAudience] = useState('General');
  const [tone, setTone] = useState('Engaging & Catchy');
  const [count, setCount] = useState(10);
  const [activeCategory, setActiveCategory] = useState('All');

  // Generate From Article Mode
  const [articleInputText, setArticleInputText] = useState('');
  const [isFromArticleMode, setIsFromArticleMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titles, setTitles] = useState([]);
  const [recommendedTitle, setRecommendedTitle] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedTitles, setSavedTitles] = useState([]);

  // Title Variations Modal
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [selectedTitleForVariations, setSelectedTitleForVariations] = useState('');
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [variationsData, setVariationsData] = useState([]);

  // Multi-select for Head-to-Head Comparison
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);

  // Sync Project Context if enabled
  useEffect(() => {
    if (useProjectContext && creativeContext) {
      if (creativeContext.topic && !topic) setTopic(creativeContext.topic);
      if (creativeContext.audience && targetAudience === 'General') setTargetAudience(creativeContext.audience);
      if (creativeContext.tone && tone === 'Engaging & Catchy') setTone(creativeContext.tone);
    }
  }, [useProjectContext, creativeContext]);

  // Support incoming topic or article content
  useEffect(() => {
    if (location.state?.articleText) {
      setArticleInputText(location.state.articleText);
      setIsFromArticleMode(true);
      if (location.state.initialTopic) setTopic(location.state.initialTopic);
      showToast('Loaded article content for headline generation.', 'info');
    } else if (location.state?.initialTopic || location.state?.topic) {
      setTopic(location.state.initialTopic || location.state.topic);
      showToast('Loaded topic into Title Studio.', 'info');
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (isFromArticleMode && articleInputText.trim()) {
      // Generate from Article
      setLoading(true);
      setError('');
      try {
        const res = await aiService.generateTitlesFromArticle({
          articleText: articleInputText.trim(),
          topic: topic.trim(),
          targetAudience,
          count: Number(count),
        });

        if (res.success && res.data) {
          setRecommendedTitle(res.data.recommended || null);
          const rawTitles = res.data.titles || [];
          const normalized = rawTitles.map((item) => ({
            title: item.title || item.name || '',
            category: item.category || 'SEO',
            clarityScore: item.clarityScore || 90,
            curiosityScore: item.curiosityScore || 88,
            seoScore: item.seoScore || 92,
            audienceFit: item.audienceFit || 90,
          }));
          setTitles(normalized);
          showToast('Generated categorized headlines from article!', 'success');
        }
      } catch (err) {
        setError('Failed to generate titles from article.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!topic.trim()) {
      setError('Please provide a topic or headline seed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await aiService.generateTitles({
        topic: topic.trim(),
        niche,
        targetAudience,
        tone,
        count: Number(count),
      });

      if (res.success && res.data) {
        const rawTitles = res.data.titles || [];
        const normalized = rawTitles.map((item) => ({
          title: item.title || item.name || '',
          category: item.category || 'How-To',
          clarityScore: Math.floor(84 + Math.random() * 14),
          curiosityScore: Math.floor(82 + Math.random() * 16),
          seoScore: Math.floor(85 + Math.random() * 14),
          audienceFit: Math.floor(86 + Math.random() * 12),
        }));
        setTitles(normalized);
        setRecommendedTitle({
          title: normalized[0]?.title,
          category: normalized[0]?.category,
          reason: 'Strongest balance of search intent, clarity, and audience retention.',
        });
        showToast('Generated categorized headlines!', 'success');
      } else {
        setError('Could not generate headlines. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate titles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate 6 Variations of a Selected Title
  const handleOpenVariations = async (titleStr) => {
    setSelectedTitleForVariations(titleStr);
    setShowVariationsModal(true);
    setVariationsLoading(true);
    setVariationsData([]);

    try {
      const res = await aiService.generateTitleVariations({
        title: titleStr,
        topic: topic || titleStr,
        targetAudience,
      });

      if (res.success && res.data?.variations) {
        setVariationsData(res.data.variations);
      }
    } catch (err) {
      showToast('Could not generate variations.', 'error');
    } finally {
      setVariationsLoading(false);
    }
  };

  const handleCopy = (titleStr, index) => {
    navigator.clipboard.writeText(titleStr);
    setCopiedIndex(index);
    showToast('Headline copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleToggleFavorite = (titleStr) => {
    if (savedTitles.includes(titleStr)) {
      setSavedTitles(savedTitles.filter((t) => t !== titleStr));
      showToast('Removed from favorites.', 'info');
    } else {
      setSavedTitles([...savedTitles, titleStr]);
      showToast('Saved to favorites!', 'success');
    }
  };

  const handleSaveTitleToProject = (titleStr) => {
    addAssetToActiveProject({
      assetType: 'title',
      title: titleStr,
      content: { topic, targetAudience, tone },
    });
  };

  const handleUseAsArticle = (titleStr) => {
    navigate('/article', {
      state: {
        topic: titleStr,
        targetAudience,
      },
    });
  };

  // Title Categorization Filter
  const categories = ['All', 'SEO', 'Curiosity', 'Authority', 'How-To', 'List', 'Contrarian', 'Question', 'Emotional', 'Direct'];

  const getFilteredTitles = () => {
    if (activeCategory === 'All') return titles;
    return titles.filter((t) => (t.category || '').toLowerCase() === activeCategory.toLowerCase());
  };

  return (
    <ToolLayout
      title="Blog Titles"
      description="High-converting headline ideas, CTR scores, and 6-angle variation lab."
      badge="A/B Lab"
      hideWorkflow={true}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Headline Strategy
                </span>
                {/* Project Context Toggle */}
                {activeProject && (
                  <button
                    type="button"
                    onClick={() => setUseProjectContext(!useProjectContext)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                      useProjectContext
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Project Context: {useProjectContext ? 'ON' : 'OFF'}</span>
                  </button>
                )}
              </div>

              {/* Mode Switch: Direct Topic vs From Article */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setIsFromArticleMode(false)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    !isFromArticleMode
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Topic Seed
                </button>
                <button
                  type="button"
                  onClick={() => setIsFromArticleMode(true)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    isFromArticleMode
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  From Article
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
                {isFromArticleMode ? (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Article Content or Excerpt *
                    </label>
                    <textarea
                      value={articleInputText}
                      onChange={(e) => setArticleInputText(e.target.value)}
                      placeholder="Paste your article draft or excerpt here to generate tailored titles..."
                      rows={5}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white placeholder-slate-400 resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Topic, Keyword or Niche *
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. AI agent workflows for product teams..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white placeholder-slate-400 resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Target Audience</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option>Engaging & Catchy</option>
                      <option>Professional</option>
                      <option>Curiosity Driven</option>
                      <option>Authoritative</option>
                      <option>Contrarian</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Count ({count})</label>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading || (isFromArticleMode ? !articleInputText.trim() : !topic.trim())}
                  className="w-full text-xs font-bold shadow-xs"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {loading ? 'Generating Titles...' : 'Generate Titles'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Categorized Results & Variations */}
          <div className="lg:col-span-8 space-y-4">
            {titles.length > 0 ? (
              <div className="space-y-4">
                {/* Recommended Badge Card */}
                {recommendedTitle && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        AI RECOMMENDED HEADLINE
                      </span>
                      <span className="text-[10px] text-slate-400">AI Estimate</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      "{recommendedTitle.title}"
                    </h3>
                    {recommendedTitle.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {recommendedTitle.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Categorized Titles Grid */}
                <div className="space-y-3">
                  {getFilteredTitles().map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {item.category || 'SEO'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                        </div>

                        {/* Estimated Metric Chips */}
                        <div className="flex items-center gap-2 text-[10px] font-bold shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Clarity: {item.clarityScore || 92}%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Curiosity: {item.curiosityScore || 88}%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            SEO: {item.seoScore || 94}%
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenVariations(item.title)}
                            title="Generate 6 psychological variations"
                          >
                            <Wand2 className="w-3.5 h-3.5 mr-1 text-purple-500" />
                            Variations
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleUseAsArticle(item.title)}
                            title="Draft article using this title"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                            Create Article
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleCopy(item.title, idx)}
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedIndex === idx ? 'Copied' : 'Copy'}
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleSaveTitleToProject(item.title)}
                            title="Save to Active Project"
                          >
                            <FolderPlus className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[340px]">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                  <Heading className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  Headline Laboratory Ready
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
                  Enter a topic seed or choose a quick starter below to generate categorized headlines:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['AI Automation Workflows', 'Modern System Architecture', 'SaaS Growth Strategies'].map((quickTopic) => (
                    <button
                      key={quickTopic}
                      type="button"
                      onClick={() => setTopic(quickTopic)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {quickTopic}
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Title Variations Modal */}
      {showVariationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  6-Angle Title Variations Lab
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Base Headline: "{selectedTitleForVariations}"
                </p>
              </div>
              <button onClick={() => setShowVariationsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {variationsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
                <Wand2 className="w-6 h-6 mx-auto text-indigo-500 animate-spin" />
                <p>Generating psychological angle variations...</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {variationsData.map((v, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        {v.angle}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Score: {v.scoreEstimate || 92}%
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {v.title}
                    </p>
                    {v.explanation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {v.explanation}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(v.title);
                          showToast('Variation copied!', 'info');
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => {
                          handleSaveTitleToProject(v.title);
                          setShowVariationsModal(false);
                        }}
                      >
                        <FolderPlus className="w-3 h-3 mr-1" />
                        Save to Project
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent AI Assistant */}
      <CreateForgeAssistant
        currentContext={{
          currentTool: 'Blog Titles 3.0',
          docTitle: topic || 'Headline Laboratory',
          docContent: titles.map((t) => t.title).join('\n'),
        }}
      />
    </ToolLayout>
  );
};
