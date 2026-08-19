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
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/aiService';

const MIN_GENERATION_DISPLAY_TIME = 600;

export const TitleGeneratorPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Technology');
  const [targetAudience, setTargetAudience] = useState('General');
  const [tone, setTone] = useState('Engaging & Catchy');
  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titles, setTitles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedTitles, setSavedTitles] = useState([]);

  // Support incoming topic from History or Dashboard
  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      if (location.state.niche) setNiche(location.state.niche);
      if (location.state.result?.titles) setTitles(location.state.result.titles);
      showToast('Loaded title topic into workspace.', 'info');
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a topic or theme.');
      return;
    }

    setLoading(true);
    setError('');
    const startTime = Date.now();

    try {
      const res = await aiService.generateTitles({
        topic: topic.trim(),
        niche,
        targetAudience,
        tone,
        count: Number(count),
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_GENERATION_DISPLAY_TIME) {
        await new Promise((r) => setTimeout(r, MIN_GENERATION_DISPLAY_TIME - elapsed));
      }

      if (res.success && res.data) {
        setTitles(res.data.titles || []);
        showToast(t('toastTitlesSuccess'), 'success');
      }
    } catch (err) {
      setError(err?.customMessage || err?.message || t('toastErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast(t('toastCopied'), 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleToggleSave = (item) => {
    const exists = savedTitles.some((s) => s.title === item.title);
    if (exists) {
      setSavedTitles(savedTitles.filter((s) => s.title !== item.title));
      showToast('Removed from saved list.', 'info');
    } else {
      setSavedTitles([...savedTitles, item]);
      showToast('Saved title to favorites.', 'success');
    }
  };

  const handleUseAsArticleTopic = (titleText) => {
    navigate('/tools/article', { state: { topic: titleText } });
  };

  const leftPane = (
    <form onSubmit={handleGenerate} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {t('blogTopicLabel')} *
        </label>
        <textarea
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('blogTopicPlaceholder')}
          className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-xs"
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('nicheLabel')}
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Esports, Tech, Business"
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('countLabel')}
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={5}>5 Suggestions</option>
            <option value={10}>10 Suggestions</option>
            <option value={15}>15 Suggestions</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('audienceLabel')}
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Beginners"
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('titleStyleLabel')}
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Engaging & Catchy">Engaging & Catchy</option>
            <option value="Clear & Informative">Clear & Informative</option>
            <option value="Curiosity Driven">Curiosity Driven</option>
            <option value="How-To / Educational">How-To / Educational</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full shadow-sm"
        icon={Sparkles}
      >
        {loading ? '✦ Creating titles…' : t('generateTitlesBtn')}
      </Button>
    </form>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      {titles.length > 0 ? (
        <div className="space-y-3 flex-1 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {titles.length} Generated Suggestions
            </span>
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

          <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
            {titles.map((item, idx) => {
              const formattedNumber = String(idx + 1).padStart(2, '0');
              const isCopied = copiedIndex === idx;
              const isSaved = savedTitles.some((s) => s.title === item.title);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all shadow-xs group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                      {formattedNumber}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      {item.category && (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleUseAsArticleTopic(item.title)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center gap-1 transition-colors border border-indigo-200/60 dark:border-indigo-800/50"
                      title="Open in Article Generator"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t('useAsArticleTopic')}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(item.title, idx)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t('copyBtn')}
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleSave(item)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isSaved
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Save title"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Heading}
            title={t('titlesEmptyTitle')}
            description={t('titlesEmptyDesc')}
          />
        </div>
      )}
    </div>
  );

  return (
    <ToolLayout
      title={t('titleGenTitle')}
      subtitle={t('titleGenSubtitle')}
      icon={Heading}
      leftPane={leftPane}
      rightPane={rightPane}
      isLoading={loading}
      loaderType="titles"
      loadingTitle="✦ CreateForge is creating"
      loadingMessages={[
        'Understanding central topic theme',
        'Exploring headline hooks & angles',
        'Generating categorized suggestions',
        'Polishing phrasing for high CTR',
      ]}
      error={error}
      onClearError={() => setError('')}
      onRetry={() => handleGenerate()}
    />
  );
};
