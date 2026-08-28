import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  FileText,
  Heading,
  Image as ImageIcon,
  Layers,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  LayoutGrid,
  List,
  Columns,
  Star,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { GlassCard } from '../components/common/GlassCard';
import { AssetReviewModal } from '../components/common/AssetReviewModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { historyService } from '../services/historyService';

export const HistoryPage = ({ initialTab = 'all' }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'masonry'
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reviewAsset, setReviewAsset] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchHistory();
    }, 250);

    return () => clearTimeout(handler);
  }, [search, activeTab, sortBy]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const isFav = activeTab === 'favorites';
      const res = await historyService.getHistory({
        tool: isFav ? undefined : activeTab === 'all' ? undefined : activeTab,
        favorites: isFav,
        search: search.trim(),
        limit: 100,
      });
      if (res.success && res.data) {
        let items = res.data.history || [];
        if (sortBy === 'oldest') {
          items = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
          items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setHistory(items);
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await historyService.deleteHistoryItem(itemToDelete);
      setHistory((prev) => prev.filter((h) => (h._id || h.id) !== itemToDelete));
      if (selectedItem && (selectedItem._id || selectedItem.id) === itemToDelete) {
        setSelectedItem(null);
      }
      setItemToDelete(null);
      showToast('Asset deleted from library', 'info');
    } catch {
      showToast('Failed to delete asset', 'error');
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const res = await historyService.toggleFavorite(id);
      if (res.success) {
        setHistory((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, isFavorite: !item.isFavorite } : item
          )
        );
        showToast(res.message || 'Favorite status updated', 'info');
      }
    } catch {
      showToast('Could not update favorite status', 'error');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Studio Assets', icon: Sparkles },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'title', label: 'Headlines & Titles', icon: Heading },
    { id: 'image', label: 'FLUX Visuals', icon: ImageIcon },
    { id: 'social', label: 'Social Content', icon: Sparkles },
    { id: 'background-removal', label: 'Background Isolations', icon: Layers },
    { id: 'favorites', label: 'Favorites', icon: Star },
  ];

  const getToolIcon = (tool) => {
    switch (tool) {
      case 'article': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'title': return <Heading className="w-4 h-4 text-purple-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-pink-500" />;
      case 'background-removal': return <Layers className="w-4 h-4 text-emerald-500" />;
      default: return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPromptText = (prompt) => {
    if (typeof prompt === 'string') return prompt;
    if (prompt?.topic) return prompt.topic;
    if (prompt?.prompt) return prompt.prompt;
    if (prompt?.filename) return prompt.filename;
    return JSON.stringify(prompt);
  };

  const getItemImage = (item) => {
    if (item.tool === 'image' && item.result?.imageUrl) {
      return item.result.imageUrl;
    }
    if (item.tool === 'background-removal' && item.result?.processedImageUrl) {
      return item.result.processedImageUrl;
    }
    return null;
  };

  const handleOpenInTool = (item) => {
    if (item.tool === 'article') {
      navigate('/article', {
        state: {
          topic: getPromptText(item.prompt),
          result: item.result,
        },
      });
    } else if (item.tool === 'title') {
      navigate('/titles', {
        state: {
          topic: getPromptText(item.prompt),
          result: item.result,
        },
      });
    } else if (item.tool === 'image') {
      navigate('/image', {
        state: {
          prompt: getPromptText(item.prompt),
          result: item.result,
        },
      });
    } else if (item.tool === 'background-removal') {
      navigate('/background-remover');
    }
  };

  const handleCopyResult = (content) => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Review Comments Modal */}
      {reviewAsset && (
        <AssetReviewModal
          isOpen={!!reviewAsset}
          onClose={() => setReviewAsset(null)}
          assetType={reviewAsset.tool}
          assetId={reviewAsset._id || reviewAsset.id}
          assetTitle={getPromptText(reviewAsset.prompt)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">📚</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Creative Library 2.0
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized intelligent repository for articles, FLUX visuals, campaigns, and review comments.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-1.5 rounded-lg ${viewMode === 'masonry' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Masonry View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => setShowClearModal(true)}
            >
              Clear Library
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, prompts, or topics..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 animate-pulse">
          Indexing and loading creative assets...
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No assets found"
          description="Synthesize your first campaign, article, or FLUX visual to build your library."
          actionLabel="Open Campaign Builder"
          onAction={() => navigate('/campaign-builder')}
        />
      ) : (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-3'
              : viewMode === 'masonry'
              ? 'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }
        >
          {history.map((item) => {
            const imagePreview = getItemImage(item);
            const promptText = getPromptText(item.prompt);
            const isFav = favorites[item._id || item.id];

            if (viewMode === 'list') {
              return (
                <GlassCard
                  key={item._id || item.id}
                  className="p-4 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center space-x-3.5 truncate">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getToolIcon(item.tool)}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        "{promptText}"
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.tool.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => toggleFavorite(item._id || item.id)}
                      className={`p-1.5 rounded-lg ${isFav ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReviewAsset(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400"
                      title="Review & Comments"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <Button size="xs" onClick={() => handleOpenInTool(item)}>
                      Open →
                    </Button>
                  </div>
                </GlassCard>
              );
            }

            return (
              <GlassCard
                key={item._id || item.id}
                className="p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all group break-inside-avoid"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getToolIcon(item.tool)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {item.tool.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item._id || item.id)}
                        className={`p-1 rounded transition-colors ${
                          isFav ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Star Asset"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReviewAsset(item)}
                        className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                        title="Review Comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item._id || item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {imagePreview ? (
                    <div
                      onClick={() => setSelectedItem(item)}
                      className="h-36 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={imagePreview}
                        alt={promptText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedItem(item)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 cursor-pointer h-24 overflow-hidden text-xs text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                    >
                      {typeof item.result === 'string'
                        ? item.result.slice(0, 150)
                        : item.result?.summary || item.result?.content?.slice(0, 150) || JSON.stringify(item.result).slice(0, 150)}
                      ...
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      "{promptText}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenInTool(item)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Launch Tool</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedItem.tool)}
                <h3 className="text-sm font-bold text-slate-100 capitalize">
                  {selectedItem.tool.replace('-', ' ')} Asset Inspector
                </h3>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 custom-scrollbar">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">
                  Parameters & Prompt:
                </label>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedItem.prompt, null, 2)}
                </pre>
              </div>

              {getItemImage(selectedItem) ? (
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">
                    Visual Asset:
                  </label>
                  <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                    <img
                      src={getItemImage(selectedItem)}
                      alt="visual output"
                      className="max-h-64 rounded-lg object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">
                    Generated Content:
                  </label>
                  <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 max-h-60 overflow-y-auto font-sans whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {typeof selectedItem.result === 'string'
                      ? selectedItem.result
                      : selectedItem.result?.content || JSON.stringify(selectedItem.result, null, 2)}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={() => handleCopyResult(selectedItem.result)}
                >
                  {copied ? 'Copied' : 'Copy Result'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    handleOpenInTool(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  Open in Tool
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-100">Delete Asset?</h3>
              <p className="text-xs text-slate-400">
                This creation record will be permanently deleted from your library.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
