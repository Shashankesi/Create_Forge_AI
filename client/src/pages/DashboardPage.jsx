import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Heading,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { CreateForgeMark } from '../components/brand/CreateForgeMark';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { historyService } from '../services/historyService';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await historyService.getHistory({ limit: 6 });
        if (res.success && res.data) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.warn('Dashboard history load:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const quickActions = [
    {
      title: t('toolArticle'),
      desc: t('cardArticleDesc'),
      icon: FileText,
      path: '/tools/article',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
    },
    {
      title: t('toolTitles'),
      desc: t('cardTitlesDesc'),
      icon: Heading,
      path: '/tools/titles',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
    },
    {
      title: t('toolImage'),
      desc: t('cardImageDesc'),
      icon: ImageIcon,
      path: '/tools/image',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
    },
    {
      title: t('toolBackground'),
      desc: t('cardBackgroundDesc'),
      icon: Layers,
      path: '/tools/background-remove',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  const getToolName = (tool) => {
    switch (tool) {
      case 'article': return t('toolArticle');
      case 'title': return t('toolTitles');
      case 'image': return t('toolImage');
      case 'background-removal': return t('toolBackground');
      default: return tool;
    }
  };

  const getPromptPreview = (prompt) => {
    if (typeof prompt === 'string') return prompt;
    if (prompt?.topic) return prompt.topic;
    if (prompt?.prompt) return prompt.prompt;
    if (prompt?.filename) return prompt.filename;
    return JSON.stringify(prompt);
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Creator';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner with CreateForge Spark */}
      <div className="app-card p-6 sm:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-white via-white to-indigo-50/40 dark:from-[#0e1422] dark:via-[#0e1422] dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('dashSubtitle')}
            </p>
          </div>

          {/* CreateForge Spark Indicator */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
            <CreateForgeMark size={28} variant="glow" animate={true} />
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block">
                CreateForge Workspace
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ● All AI engines active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions 4-Card Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Creative Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className="app-card p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between group transition-all"
              >
                <div className="space-y-2.5">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>{t('launchTool')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('dashRecentTitle')}
          </h3>
          {history.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all library items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="app-card p-8 text-center text-xs text-slate-400">
            Loading recent activity...
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={t('dashNoRecent')}
            description="Start writing an article or generating visuals to build your creative library."
            actionLabel="Start Writing"
            onAction={() => navigate('/tools/article')}
          />
        ) : (
          <div className="app-card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
            {history.map((item) => (
              <div
                key={item._id || item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                    {item.tool === 'article' && <FileText className="w-4 h-4 text-indigo-500" />}
                    {item.tool === 'title' && <Heading className="w-4 h-4 text-purple-500" />}
                    {item.tool === 'image' && <ImageIcon className="w-4 h-4 text-amber-500" />}
                    {item.tool === 'background-removal' && <Layers className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {getToolName(item.tool)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      "{getPromptPreview(item.prompt)}"
                    </p>
                  </div>
                </div>

                <Link
                  to="/history"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
                  title="View in library"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
