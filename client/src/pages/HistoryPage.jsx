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
  Eye,
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { historyService } from '../services/historyService';

export const HistoryPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  // Deletion confirm modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchHistory();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyService.getHistory({
        tool: activeTab,
        search: search.trim(),
        limit: 50,
      });
      if (res.success && res.data) {
        setHistory(res.data.history || []);
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
      showToast(t('toastHistoryDeleted'), 'info');
    } catch (err) {
      showToast(t('toastErrorGeneric'), 'error');
    }
  };

  const confirmClearAll = async () => {
    try {
      await historyService.clearHistory();
      setHistory([]);
      setSelectedItem(null);
      setShowClearModal(false);
      showToast(t('toastHistoryCleared'), 'info');
    } catch (err) {
      showToast(t('toastErrorGeneric'), 'error');
    }
  };

  const tabs = [
    { id: 'all', label: t('filterAll'), icon: Sparkles },
    { id: 'article', label: t('filterArticle'), icon: FileText },
    { id: 'title', label: t('filterTitle'), icon: Heading },
    { id: 'image', label: t('filterImage'), icon: ImageIcon },
    { id: 'background-removal', label: t('filterBackground'), icon: Layers },
  ];

  const getToolIcon = (tool) => {
    switch (tool) {
      case 'article': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'title': return <Heading className="w-4 h-4 text-purple-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-amber-500" />;
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
      navigate('/tools/article', {
        state: {
          topic: getPromptText(item.prompt),
          result: item.result,
        },
      });
    } else if (item.tool === 'title') {
      navigate('/tools/titles', {
        state: {
          topic: getPromptText(item.prompt),
          result: item.result,
        },
      });
    } else if (item.tool === 'image') {
      navigate('/tools/image', {
        state: {
          prompt: getPromptText(item.prompt),
          style: item.prompt?.style || 'Realistic',
          aspectRatio: item.prompt?.aspectRatio || '1:1',
          result: item.result,
        },
      });
    } else if (item.tool === 'background-removal') {
      navigate('/tools/background-remove');
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('historyTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('historySubtitle')}
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={() => setShowClearModal(true)}
          >
            {t('clearHistoryBtn')}
          </Button>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tool Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchHistoryPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="app-card p-12 text-center text-xs text-slate-400">
          Loading library assets...
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={t('noHistoryTitle')}
          description={t('noHistoryDesc')}
          actionLabel="Create an Article"
          onAction={() => navigate('/tools/article')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => {
            const imagePreview = getItemImage(item);
            const promptText = getPromptText(item.prompt);

            return (
              <div
                key={item._id || item.id}
                className="app-card rounded-xl overflow-hidden p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        {getToolIcon(item.tool)}
                      </div>
                      <span className="text-xs font-semibold capitalize text-slate-800 dark:text-slate-200">
                        {item.tool.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenInTool(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                        title="Open in Tool"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item._id || item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {imagePreview ? (
                    <div
                      onClick={() => setSelectedItem(item)}
                      className="h-32 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={imagePreview}
                        alt={promptText}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedItem(item)}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 cursor-pointer h-24 overflow-hidden text-xs text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                    >
                      {typeof item.result === 'string'
                        ? item.result.slice(0, 150)
                        : item.result?.summary || item.result?.content?.slice(0, 150) || JSON.stringify(item.result).slice(0, 150)}
                      ...
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
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
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="app-card w-full max-w-2xl max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedItem.tool)}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] capitalize">
                  {selectedItem.tool.replace('-', ' ')} Asset
                </h3>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Parameters & Prompt:
                </label>
                <pre className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedItem.prompt, null, 2)}
                </pre>
              </div>

              {getItemImage(selectedItem) ? (
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Visual Asset:
                  </label>
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={getItemImage(selectedItem)}
                      alt="visual output"
                      className="max-h-64 rounded object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Generated Content:
                  </label>
                  <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto font-sans whitespace-pre-wrap leading-relaxed">
                    {typeof selectedItem.result === 'string'
                      ? selectedItem.result
                      : selectedItem.result?.content || JSON.stringify(selectedItem.result, null, 2)}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
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
          <div className="app-card w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Delete History Item?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="app-card w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Clear All History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to clear your entire creation history? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full bg-red-600 text-white hover:bg-red-700"
                onClick={confirmClearAll}
              >
                Clear Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
