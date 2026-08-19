import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Check,
  Clock,
  BookOpen,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/aiService';

const MIN_GENERATION_DISPLAY_TIME = 800;

export const ArticleGeneratorPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState('Comprehensive Guide');
  const [tone, setTone] = useState('Professional');
  const [targetAudience, setTargetAudience] = useState('General');
  const [desiredLength, setDesiredLength] = useState('Medium');
  const [keywords, setKeywords] = useState('');

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeKeyTakeaways, setIncludeKeyTakeaways] = useState(true);
  const [includeFaq, setIncludeFaq] = useState(false);
  const [seoFocus, setSeoFocus] = useState('Balanced');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Cover visual generation
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);

  // Handle incoming topic from Title Generator or History
  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      if (location.state.articleType) setArticleType(location.state.articleType);
      if (location.state.tone) setTone(location.state.tone);
      if (location.state.result) setResult(location.state.result);
      showToast('Loaded article topic into workspace.', 'info');
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide an article topic or question.');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    const startTime = Date.now();

    try {
      const res = await aiService.generateArticle({
        topic: topic.trim(),
        articleType,
        tone,
        targetAudience,
        desiredLength,
        keywords: keywords.trim(),
        advancedOptions: {
          includeKeyTakeaways,
          includeFaq,
          seoFocus,
        },
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_GENERATION_DISPLAY_TIME) {
        await new Promise((r) => setTimeout(r, MIN_GENERATION_DISPLAY_TIME - elapsed));
      }

      if (res.success && res.data) {
        setResult(res.data);
        showToast(t('toastArticleSuccess'), 'success');
      }
    } catch (err) {
      setError(err?.customMessage || err?.message || t('toastErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoverImage = async () => {
    if (!result) return;
    setCoverLoading(true);
    try {
      const res = await aiService.generateArticleCoverImage({
        title: result.title,
        topic: result.normalizedTopic || topic,
        summary: result.summary,
        style: 'Cinematic',
      });
      if (res.success && res.data) {
        setCoverImage(res.data.imageUrl);
        showToast('Editorial cover visual generated.', 'success');
      }
    } catch (err) {
      showToast('Unable to generate cover visual right now.', 'error');
    } finally {
      setCoverLoading(false);
    }
  };

  const handleOpenInImageGenerator = () => {
    if (!result) return;
    const coverPrompt = `Editorial hero visual for "${result.title || result.normalizedTopic || topic}". Cinematic lighting, 8k resolution, award-winning composition`;
    navigate('/tools/image', {
      state: {
        prompt: coverPrompt,
        style: 'Cinematic',
        aspectRatio: '16:9',
      },
    });
  };

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    showToast(t('toastCopied'), 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.content) return;
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (result.title || 'createforge-article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.download = `createforge-${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded markdown article.', 'success');
  };

  const leftPane = (
    <form onSubmit={handleGenerate} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {t('topicLabel')} *
        </label>
        <textarea
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('topicPlaceholder')}
          className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-xs"
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('articleTypeLabel')}
          </label>
          <select
            value={articleType}
            onChange={(e) => setArticleType(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Comprehensive Guide">Comprehensive Guide</option>
            <option value="Beginner Guide">Beginner Guide</option>
            <option value="How-To">How-To</option>
            <option value="Tutorial">Step-by-Step Tutorial</option>
            <option value="Comparison">Comparison</option>
            <option value="Listicle">Listicle</option>
            <option value="Case Study">Case Study</option>
            <option value="Thought Leadership">Thought Leadership</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('toneLabel')}
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Professional">Professional</option>
            <option value="Engaging">Engaging</option>
            <option value="Educational">Educational</option>
            <option value="Persuasive">Persuasive</option>
            <option value="Casual">Casual</option>
            <option value="Technical">Technical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('targetAudienceLabel')}
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Industry Specialists"
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('lengthLabel')}
          </label>
          <select
            value={desiredLength}
            onChange={(e) => setDesiredLength(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Short">Short (~600 words)</option>
            <option value="Medium">Medium (~1000 words)</option>
            <option value="Long">Long (~1800 words)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t('keywordsLabel')}
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={t('keywordsPlaceholder')}
          disabled={loading}
          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Advanced Options */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          <span>{t('advancedOptionsLabel')}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="pt-2 space-y-2.5 animate-in fade-in">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeKeyTakeaways}
                onChange={(e) => setIncludeKeyTakeaways(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Generate structured takeaway summary</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFaq}
                onChange={(e) => setIncludeFaq(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include FAQ section</span>
            </label>

            <div className="pt-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                SEO Density Strategy
              </label>
              <select
                value={seoFocus}
                onChange={(e) => setSeoFocus(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-slate-900 dark:text-slate-100"
              >
                <option value="Balanced">Balanced Topical Depth</option>
                <option value="HighIntent">High Commercial Intent</option>
                <option value="Informational">Pure Informational</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full shadow-sm"
        icon={Sparkles}
      >
        {loading ? '✦ Creating article…' : t('generateArticleBtn')}
      </Button>
    </form>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      {result ? (
        <div className="space-y-4 flex-1 flex flex-col animate-in fade-in duration-300">
          {/* Metadata & Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <Check className="w-3 h-3" />
                Article Ready
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                {result.metadata?.wordCount || 0} {t('words')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {result.metadata?.readingTimeMinutes || 1} {t('minRead')}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                icon={ImageIcon}
                loading={coverLoading}
                onClick={handleCreateCoverImage}
                title="Generate matching cover visual"
              >
                Create Cover Visual
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={ArrowRight}
                onClick={handleOpenInImageGenerator}
                title="Open Cover Prompt in Image Generator"
              >
                Open in Image Gen
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
              >
                {copied ? t('copiedBtn') : t('copyBtn')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleDownload}
              >
                {t('exportBtn')}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                disabled={loading}
                onClick={() => handleGenerate()}
              >
                {t('regenerateBtn')}
              </Button>
            </div>
          </div>

          {/* Generated Cover Visual Preview */}
          {coverImage && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative group">
              <img
                src={coverImage}
                alt={result.title}
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = coverImage;
                    a.download = `cover-${(result.normalizedTopic || 'article').toLowerCase()}.png`;
                    a.click();
                    showToast('Cover visual downloaded.', 'success');
                  }}
                  className="text-white text-xs px-2 py-1 flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  Save Visual
                </button>
              </div>
            </div>
          )}

          {/* Formatted Markdown Reader Area */}
          <div className="flex-1 bg-slate-50/50 dark:bg-[#0c111c]/50 p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[520px] prose-createforge select-text text-sm shadow-inner">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={FileText}
            title={t('articleEmptyTitle')}
            description={t('articleEmptyDesc')}
          />
        </div>
      )}
    </div>
  );

  return (
    <ToolLayout
      title={t('articleTitle')}
      subtitle={t('articleSubtitle')}
      icon={FileText}
      leftPane={leftPane}
      rightPane={rightPane}
      isLoading={loading}
      loaderType="article"
      loadingTitle="✦ CreateForge is creating"
      loadingMessages={[
        'Understanding topic & semantic intent',
        'Crafting dynamic structural chapters',
        'Drafting in-depth editorial content',
        'Polishing final markdown output',
      ]}
      error={error}
      onClearError={() => setError('')}
      onRetry={() => handleGenerate()}
    />
  );
};
