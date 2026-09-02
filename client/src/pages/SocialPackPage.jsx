import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  FolderPlus,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Layers,
  ArrowRight,
  TrendingUp,
  Wand2,
  BookOpen,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { CreateForgeAssistant } from '../components/common/CreateForgeAssistant';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';

export const SocialPackPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject, creativeContext, useProjectContext, setUseProjectContext, addAssetToActiveProject, refreshProjects } = useProject();

  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('Creators & Founders');
  const [tone, setTone] = useState('Engaging & Authoritative');
  const [activeTab, setActiveTab] = useState('linkedin');

  // Generate From Article state
  const [articleText, setArticleText] = useState('');
  const [isFromArticleMode, setIsFromArticleMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [selectedHookStyle, setSelectedHookStyle] = useState('Contrarian');
  const [packResult, setPackResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Sync Project Context if enabled
  useEffect(() => {
    if (useProjectContext && creativeContext) {
      if (creativeContext.topic && !topic) setTopic(creativeContext.topic);
      if (creativeContext.audience && targetAudience === 'Creators & Founders') setTargetAudience(creativeContext.audience);
      if (creativeContext.tone && tone === 'Engaging & Authoritative') setTone(creativeContext.tone);
    }
  }, [useProjectContext, creativeContext]);

  // Handle incoming location navigation
  useEffect(() => {
    if (location.state?.articleText) {
      setArticleText(location.state.articleText);
      setIsFromArticleMode(true);
      if (location.state.initialTopic) setTopic(location.state.initialTopic);
      showToast('Loaded article content for multi-platform social pack.', 'info');
    } else if (location.state?.initialTopic || location.state?.topic) {
      setTopic(location.state.initialTopic || location.state.topic);
      showToast('Loaded topic into Social Studio.', 'info');
    }
  }, [location.state]);

  const handleGeneratePack = async (e) => {
    e?.preventDefault();
    if (!topic.trim() && !articleText.trim()) {
      showToast('Please provide a topic or article content.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.generateSocialPack({
        topic: topic.trim() || 'Core Content',
        articleText: isFromArticleMode ? articleText.trim() : undefined,
        targetAudience,
        tone,
        projectId: activeProject?._id || activeProject?.id,
      });

      if (res.success && res.data) {
        setPackResult(res.data);
        showToast('Complete Social Content Pack generated!', 'success');
        refreshProjects();
      }
    } catch (err) {
      showToast('Could not generate social pack.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSinglePlatform = async (platform) => {
    if (!topic.trim() && !articleText.trim()) return;

    setSingleLoading(true);
    try {
      const res = await aiService.generateSinglePlatformSocial({
        platform,
        hookStyle: selectedHookStyle,
        topic: topic.trim() || 'Core Content',
        articleContent: isFromArticleMode ? articleText.trim() : undefined,
        targetAudience,
        tone,
      });

      if (res.success && res.data) {
        setPackResult((prev) => {
          const current = prev ? { ...prev } : {};
          if (platform === 'linkedin') {
            current.linkedin = res.data.content || res.data;
          } else if (platform === 'twitter') {
            current.twitter = res.data.content || res.data;
          } else if (platform === 'instagram') {
            current.instagram = res.data.content || res.data;
          } else if (platform === 'youtube') {
            current.youtube = res.data.content || res.data;
          }
          return current;
        });
        showToast(`Regenerated ${platform.toUpperCase()} with ${selectedHookStyle} angle!`, 'success');
      }
    } catch (err) {
      showToast('Could not regenerate platform copy.', 'error');
    } finally {
      setSingleLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToProject = async () => {
    if (!packResult || !activeProject) return;
    await addAssetToActiveProject({
      assetType: 'social',
      title: `Social Pack: ${topic}`,
      content: packResult,
    });
  };

  const getLinkedinContent = (result) => {
    if (!result) return '';
    const li = result.linkedin;
    if (typeof li === 'string') return li;
    if (li && typeof li === 'object') {
      if (typeof li.fullPost === 'string' && li.fullPost.trim()) return li.fullPost;
      if (typeof li.post === 'string' && li.post.trim()) return li.post;
      if (typeof li.content === 'string' && li.content.trim()) return li.content;
      if (Array.isArray(li.hooks) && li.hooks.length > 0) {
        return `${li.hooks.join('\n\n')}\n\n${li.fullPost || ''}`.trim();
      }
    }
    return 'LinkedIn thought leadership content.';
  };

  const getTwitterContent = (result) => {
    if (!result) return '';
    const tw = result.twitter;
    if (typeof tw === 'string') return tw;
    if (tw && typeof tw === 'object') {
      if (Array.isArray(tw.thread) && tw.thread.length > 0) {
        return tw.thread.map((t) => (typeof t === 'string' ? t : t?.text || JSON.stringify(t))).join('\n\n---\n\n');
      }
      if (Array.isArray(tw.standalonePosts) && tw.standalonePosts.length > 0) {
        return tw.standalonePosts.map((p) => (typeof p === 'string' ? p : p?.text || JSON.stringify(p))).join('\n\n');
      }
      if (typeof tw.post === 'string') return tw.post;
      if (typeof tw.content === 'string') return tw.content;
    }
    return 'X post copy.';
  };

  const getInstagramContent = (result) => {
    if (!result) return '';
    const ig = result.instagram;
    if (typeof ig === 'string') return ig;
    if (ig && typeof ig === 'object') {
      if (typeof ig.caption === 'string' && ig.caption.trim()) return ig.caption;
      if (typeof ig.post === 'string' && ig.post.trim()) return ig.post;
      if (typeof ig.content === 'string' && ig.content.trim()) return ig.content;
      if (Array.isArray(ig.carouselSlides) && ig.carouselSlides.length > 0) {
        return ig.carouselSlides.map((s, i) => `Slide ${i + 1}: ${s.heading || ''}\n${s.body || ''}`).join('\n\n');
      }
    }
    return 'Instagram carousel caption and hashtags.';
  };

  const getYoutubeContent = (result) => {
    if (!result) return '';
    const yt = result.youtube;
    if (typeof yt === 'string') return yt;
    if (yt && typeof yt === 'object') {
      if (typeof yt.description === 'string' && yt.description.trim()) {
        const titles = Array.isArray(yt.titleOptions) ? `Title Options:\n${yt.titleOptions.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}\n\n` : '';
        return `${titles}${yt.description}`.trim();
      }
      if (typeof yt.script === 'string') return yt.script;
      if (typeof yt.content === 'string') return yt.content;
    }
    return 'YouTube title, description and chapter breakdown.';
  };

  return (
    <ToolLayout
      title="Social Content"
      description="Platform-native social campaigns: structured LinkedIn hooks, viral X threads, Instagram carousels, and YouTube video scripts."
      badge="Multi-Channel"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Directive Controls */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Campaign Controls
                </span>
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

              {/* Mode Switcher */}
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

              <form onSubmit={handleGeneratePack} className="space-y-3.5 text-xs">
                {isFromArticleMode ? (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Article Content *
                    </label>
                    <textarea
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder="Paste full article or key paragraphs..."
                      rows={5}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white placeholder-slate-400 resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Campaign Subject or Pillar Idea *
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. How our SaaS scaled from 0 to 10k users without paid ads..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white placeholder-slate-400 resize-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Target Persona</label>
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
                    <option>Engaging & Authoritative</option>
                    <option>Direct & Tactical</option>
                    <option>Storytelling & Vulnerable</option>
                    <option>Humorous & Relatable</option>
                    <option>Educational & Breakdown</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading || (isFromArticleMode ? !articleText.trim() : !topic.trim())}
                  className="w-full text-xs font-bold shadow-xs"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {loading ? 'Synthesizing Platform Copies...' : 'Generate Social Pack'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Platform Tabs & Output */}
          <div className="lg:col-span-8 space-y-4">
            {packResult ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Platform Selection Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
                  {[
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
                    { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveTab(p.id)}
                        className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                          activeTab === p.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs scale-102'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Hook Angle Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Hook Angle:</span>
                    {['Contrarian', 'Question', 'Story', 'Breakdown', 'Challenge'].map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => setSelectedHookStyle(angle)}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                          selectedHookStyle === angle
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {angle}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="xs"
                    variant="outline"
                    loading={singleLoading}
                    onClick={() => handleRegenerateSinglePlatform(activeTab)}
                    className="text-[10px] font-bold"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Regenerate {activeTab.toUpperCase()}
                  </Button>
                </div>

                {/* Platform Content Display */}
                <GlassCard className="p-5 space-y-4">
                  {/* LinkedIn Tab */}
                  {activeTab === 'linkedin' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                          LinkedIn Professional Post
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCopy(getLinkedinContent(packResult), 'li')}
                        >
                          {copiedKey === 'li' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copy Post
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {getLinkedinContent(packResult)}
                      </div>
                    </div>
                  )}

                  {/* X (Twitter) Tab */}
                  {activeTab === 'twitter' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Twitter className="w-3.5 h-3.5 text-sky-500" />
                          X Thread & Viral Hooks
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCopy(getTwitterContent(packResult), 'tw')}
                        >
                          {copiedKey === 'tw' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copy Thread
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {Array.isArray(packResult.twitter?.thread) && packResult.twitter.thread.length > 0 ? (
                          packResult.twitter.thread.map((tweet, i) => {
                            const tweetText = typeof tweet === 'string' ? tweet : tweet?.text || tweet?.tweet || JSON.stringify(tweet);
                            return (
                              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                                <span className="font-mono text-[10px] text-slate-400 block mb-1">
                                  Tweet {i + 1}/{packResult.twitter.thread.length}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{tweetText}</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs whitespace-pre-wrap">
                            {getTwitterContent(packResult)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instagram Tab */}
                  {activeTab === 'instagram' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-500" />
                          Instagram Caption & Carousel Outline
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCopy(getInstagramContent(packResult), 'ig')}
                        >
                          {copiedKey === 'ig' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copy Caption
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {getInstagramContent(packResult)}
                      </div>
                    </div>
                  )}

                  {/* YouTube Tab */}
                  {activeTab === 'youtube' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-red-500" />
                          YouTube Video Blueprint
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCopy(getYoutubeContent(packResult), 'yt')}
                        >
                          {copiedKey === 'yt' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copy Notes
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {getYoutubeContent(packResult)}
                      </div>
                    </div>
                  )}

                  {/* Save to Project Footer */}
                  <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveToProject}
                    >
                      <FolderPlus className="w-3.5 h-3.5 mr-1" />
                      Save Complete Pack to Project
                    </Button>
                  </div>
                </GlassCard>
              </div>
            ) : (
              <GlassCard className="p-6 text-center flex flex-col items-center justify-center min-h-[340px]">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  Social Campaign Studio Ready
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
                  Generate tailored copy across all 4 major platforms in a single pass:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg text-left">
                  {[
                    { name: 'LinkedIn', desc: 'Thought leadership & frameworks', icon: Linkedin, color: 'text-blue-600' },
                    { name: 'X / Twitter', desc: 'Punchy hooks & threads', icon: Twitter, color: 'text-sky-500' },
                    { name: 'Instagram', desc: 'Carousel slide concepts', icon: Instagram, color: 'text-pink-500' },
                    { name: 'YouTube', desc: 'Title, hooks & chapters', icon: Youtube, color: 'text-red-500' },
                  ].map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{p.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Persistent AI Assistant */}
      <CreateForgeAssistant
        currentContext={{
          currentTool: 'Social Content 3.0',
          docTitle: topic || 'Social Campaign',
          docContent: JSON.stringify(packResult || {}),
        }}
      />
    </ToolLayout>
  );
};
