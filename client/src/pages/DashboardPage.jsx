import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Heading,
  Image as ImageIcon,
  Share2,
  Globe,
  Sparkles,
  Folder,
  ArrowRight,
  Clock,
  Heart,
  Layers,
  Plus,
  Compass,
  FileText,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProject } from '../context/ProjectContext';
import { historyService } from '../services/historyService';
import { projectService } from '../services/projectService';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { activeProject, setActiveProject } = useProject();
  const navigate = useNavigate();

  const [promptInput, setPromptInput] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('article');
  const [uploadedSourceName, setUploadedSourceName] = useState('');
  const [attachedText, setAttachedText] = useState('');
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalCreations: 0,
    articles: 0,
    images: 0,
    titles: 0,
    social: 0,
    projects: 0,
    saved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [historyRes, statsRes, projectsRes] = await Promise.all([
          historyService.getHistory({ limit: 6 }).catch(() => ({ data: { history: [] } })),
          historyService.getUserStats().catch(() => ({ data: {} })),
          projectService.getProjects().catch(() => ({ data: { projects: [] } })),
        ]);

        if (historyRes?.success && historyRes.data) {
          setHistory(historyRes.data.history || []);
        }
        if (statsRes?.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (projectsRes?.success && projectsRes.data) {
          setProjects(projectsRes.data.projects || []);
        }
      } catch (err) {
        console.warn('Dashboard data load notice:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeProject]);

  // Intelligent intent analyzer for "Create from anything"
  useEffect(() => {
    const text = promptInput.toLowerCase();
    if (!text.trim()) {
      setSelectedWorkflow('article');
      return;
    }
    if (text.includes('image') || text.includes('photo') || text.includes('picture') || text.includes('visual') || text.includes('banner') || text.includes('cover')) {
      setSelectedWorkflow('image');
    } else if (text.includes('title') || text.includes('headline') || text.includes('hook') || text.includes('names')) {
      setSelectedWorkflow('titles');
    } else if (text.includes('social') || text.includes('linkedin') || text.includes('tweet') || text.includes('twitter') || text.includes('instagram') || text.includes('thread')) {
      setSelectedWorkflow('social');
    } else if (text.includes('seo') || text.includes('keyword') || text.includes('meta')) {
      setSelectedWorkflow('seo');
    } else {
      setSelectedWorkflow('article');
    }
  }, [promptInput]);

  const handleCreateFromAnything = (e) => {
    e?.preventDefault();
    const prompt = promptInput.trim();
    if (!prompt && !attachedText) return;

    const navPayload = {
      initialTopic: prompt || uploadedSourceName || 'Creative Asset',
      attachedText: attachedText || '',
      sourceName: uploadedSourceName || '',
    };

    if (selectedWorkflow === 'article') {
      navigate('/article', { state: { ...navPayload, initialContent: attachedText } });
    } else if (selectedWorkflow === 'titles') {
      navigate('/titles', { state: { ...navPayload, articleText: attachedText } });
    } else if (selectedWorkflow === 'image') {
      navigate('/image', { state: { initialPrompt: prompt } });
    } else if (selectedWorkflow === 'social') {
      navigate('/social-pack', { state: { ...navPayload, articleText: attachedText } });
    } else if (selectedWorkflow === 'seo') {
      navigate('/seo-studio', { state: { initialText: attachedText || prompt } });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickCreateTools = [
    {
      id: 'article',
      name: 'Article Generator',
      desc: 'Structured blog posts, tutorials, guides & thought leadership.',
      icon: BookOpen,
      path: '/article',
      badge: 'Flagship',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'titles',
      name: 'Blog Title Lab',
      desc: 'High-converting headline ideas, CTR scores & A/B testing.',
      icon: Heading,
      path: '/titles',
      badge: 'A/B Lab',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'image',
      name: 'Image Generator',
      desc: 'Pollinations FLUX studio visuals, editorial hero shots & styles.',
      icon: ImageIcon,
      path: '/image',
      badge: 'FLUX Engine',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'social',
      name: 'Social Content Pack',
      desc: 'Platform-native LinkedIn, X threads, IG carousels & YouTube scripts.',
      icon: Share2,
      path: '/social-pack',
      badge: 'Multi-Channel',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const workflowOptions = [
    { id: 'article', label: 'ARTICLE', icon: BookOpen },
    { id: 'titles', label: 'BLOG TITLES', icon: Heading },
    { id: 'image', label: 'HERO IMAGE', icon: ImageIcon },
    { id: 'social', label: 'SOCIAL POSTS', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Globe },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name || 'Creator'} 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Turn ideas into articles, visuals, titles, social content and SEO-ready campaigns.
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
            <Folder className="w-3.5 h-3.5" />
            <span>Active: <strong>{activeProject.name}</strong></span>
          </div>
        )}
      </div>

      {/* 2. CREATE ANYTHING — Universal Creation Engine 2.0 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>UNIVERSAL CREATION ENGINE 2.0</span>
            </div>
            {uploadedSourceName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                <span>📎 Attached: {uploadedSourceName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedSourceName('');
                    setAttachedText('');
                  }}
                  className="ml-1 hover:text-white font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              What are you creating today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Describe your idea or attach a document, image, or audio recording to generate articles, titles, visuals, social campaigns, and SEO.
            </p>
          </div>

          <form onSubmit={handleCreateFromAnything} className="space-y-4">
            <div className="relative flex flex-col items-stretch bg-white/10 dark:bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-inner">
              <textarea
                rows={2}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Turn this product launch document into an in-depth article, create hero visual, and generate social posts for developers..."
                className="w-full px-3 py-2 bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm sm:text-base resize-none custom-scrollbar"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 mt-1">
                {/* Multimodal Attach Source Controls */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors border border-white/10">
                    <span>📄 Document / PDF</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedSourceName(file.name);
                          const text = await file.text().catch(() => '');
                          setAttachedText(text.slice(0, 5000));
                          if (!promptInput) {
                            setPromptInput(`Turn "${file.name}" into a comprehensive article and social campaign`);
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors border border-white/10">
                    <span>🖼️ Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedSourceName(file.name);
                          setSelectedWorkflow('image');
                          if (!promptInput) {
                            setPromptInput(`Generate a cinematic hero image inspired by "${file.name}"`);
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors border border-white/10">
                    <span>🎙️ Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedSourceName(file.name);
                          if (!promptInput) {
                            setPromptInput(`Extract key ideas from audio "${file.name}" and create an article`);
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 shadow-md"
                >
                  <span>Create</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* AI UNDERSTOOD Live Preview Card */}
            {promptInput.trim() && (
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-700/50 backdrop-blur-md space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI UNDERSTOOD INTENT
                  </span>
                  <span className="text-slate-300">Ready to seed Studio</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Detected Topic</span>
                    <span className="font-semibold text-white truncate block">
                      {promptInput.replace(/turn|create|write|generate|article|about|for|image|social/gi, '').trim() || promptInput}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Audience</span>
                    <span className="font-semibold text-indigo-200 truncate block">
                      {promptInput.toLowerCase().includes('developer') ? 'Developers' : promptInput.toLowerCase().includes('founder') ? 'Founders / Executives' : 'General Creators'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Intent</span>
                    <span className="font-semibold text-purple-200 truncate block">
                      {selectedWorkflow === 'image' ? 'Visual Creation' : selectedWorkflow === 'titles' ? 'Headline Ideation' : selectedWorkflow === 'social' ? 'Multi-Channel Campaign' : 'In-Depth Publication'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-medium">Recommended Output</span>
                    <span className="font-semibold text-emerald-300 uppercase truncate block">
                      {selectedWorkflow}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Recommendation Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-slate-300 mr-1">Recommended Output:</span>
              {workflowOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedWorkflow === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedWorkflow(opt.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow-xs scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </form>
        </div>
      </div>

      {/* 3. QUICK CREATE GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Quick Create
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCreateTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${tool.color} text-white shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {tool.desc}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT PROJECTS & RECENT CREATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Projects
            </h3>
            <Link to="/projects" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {projects.length > 0 ? (
              projects.slice(0, 4).map((p) => {
                const isCurrent = (activeProject?._id || activeProject?.id) === (p._id || p.id);
                return (
                  <div
                    key={p._id || p.id}
                    onClick={() => setActiveProject(p)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <Folder className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.items?.length || 0} assets • {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Folder className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No projects yet</p>
                <Link to="/projects">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    New Project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Creations (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Creations
            </h3>
            <Link to="/history" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Full Library
            </Link>
          </div>

          <div className="space-y-2.5">
            {history.length > 0 ? (
              history.map((item) => {
                const toolName = item.tool === 'article' ? 'Article' : item.tool === 'image' ? 'Image' : item.tool === 'title' ? 'Blog Title' : item.tool === 'social' ? 'Social Pack' : item.tool;
                const promptSnippet = typeof item.prompt === 'string' ? item.prompt : item.prompt?.topic || item.prompt?.prompt || 'Creative Asset';
                return (
                  <div
                    key={item._id || item.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                        {item.tool === 'article' && <BookOpen className="w-4 h-4" />}
                        {item.tool === 'image' && <ImageIcon className="w-4 h-4 text-purple-500" />}
                        {item.tool === 'title' && <Heading className="w-4 h-4 text-pink-500" />}
                        {item.tool === 'social' && <Share2 className="w-4 h-4 text-indigo-500" />}
                        {!['article', 'image', 'title', 'social'].includes(item.tool) && <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {toolName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                          {promptSnippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={item.tool === 'article' ? '/article' : item.tool === 'image' ? '/image' : item.tool === 'title' ? '/titles' : '/social-pack'}
                        state={item.tool === 'article' ? { initialTopic: promptSnippet } : item.tool === 'image' ? { initialPrompt: promptSnippet } : { initialTopic: promptSnippet }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Compass className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">No creations yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Create your first article, image or social post from the creation studio above.
                  </p>
                </div>
                <Link to="/article">
                  <Button variant="primary" size="sm" className="mt-2">
                    Start Creating
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. CREATIVE ACTIVITY STATISTICS (MongoDB Persistent) */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Creative Activity
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Articles Created</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.articles || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Images Generated</span>
            <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {stats.images || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Titles Generated</span>
            <p className="text-xl font-extrabold text-pink-600 dark:text-pink-400 mt-1">
              {stats.titles || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Social Packs</span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.social || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Projects</span>
            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {stats.projects || projects.length || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved / Favorites</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.saved || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
