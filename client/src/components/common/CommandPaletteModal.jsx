import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';

export const CommandPaletteModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.globalSearch(query);
        if (res.success) {
          setResults(res.results);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Quick Action Commands list matching Phase 6 Core Studio
  const quickActions = [
    { title: 'Article Generator', icon: '✍️', route: '/article', category: 'Flagship' },
    { title: 'Blog Title Lab', icon: '💡', route: '/titles', category: 'Flagship' },
    { title: 'FLUX Image Generator', icon: '🖼️', route: '/image', category: 'Flagship' },
    { title: 'Social Content Pack', icon: '📱', route: '/social-pack', category: 'Flagship' },
    { title: 'SEO Studio & Audit', icon: '🌐', route: '/seo-studio', category: 'Optimize' },
    { title: 'Background Remover', icon: '✂️', route: '/background-remover', category: 'Optimize' },
    { title: 'Projects Workspace', icon: '📁', route: '/projects', category: 'Library' },
    { title: 'Creation History', icon: '🕒', route: '/history', category: 'Library' },
    { title: 'Favorites & Saved', icon: '❤️', route: '/favorites', category: 'Library' },
    { title: 'Brand Intelligence Kit', icon: '🎨', route: '/brand-kit', category: 'Brand' },
  ];

  const handleSelect = (route) => {
    onClose();
    navigate(route);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-2xl bg-slate-900/95 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <span className="text-xl text-indigo-400 mr-3">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-base font-medium"
            placeholder="Search projects, campaigns, articles, visuals, or run actions... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Search & Navigation Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Quick Actions (when no search query) */}
          {!query && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Quick Studio Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(action.route)}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left hover:bg-indigo-600/15 hover:border-indigo-500/30 border border-transparent transition-all group"
                  >
                    <span className="text-xl p-1.5 bg-slate-800/60 rounded-lg group-hover:scale-110 transition-transform">
                      {action.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-500">{action.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real Search Results */}
          {query && (
            <div className="space-y-4">
              {loading && (
                <div className="py-6 text-center text-slate-400 text-sm animate-pulse">
                  Searching CreateForge Intelligence...
                </div>
              )}

              {!loading && results && (
                <>
                  {/* Campaigns */}
                  {results.campaigns?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1">
                        Campaigns ({results.campaigns.length})
                      </p>
                      {results.campaigns.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => handleSelect(`/campaign-builder?id=${c._id}`)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span>🚀</span>
                            <span className="text-sm font-medium text-slate-200">{c.title}</span>
                          </div>
                          <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            Health: {c.healthScore?.overall || 88}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {results.projects?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1">
                        Projects ({results.projects.length})
                      </p>
                      {results.projects.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => handleSelect(`/projects`)}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left"
                        >
                          <span>📁</span>
                          <span className="text-sm font-medium text-slate-200">{p.name}</span>
                          <span className="text-xs text-slate-500">({p.category})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Articles */}
                  {results.articles?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1">
                        Articles & Generations ({results.articles.length})
                      </p>
                      {results.articles.map((a) => (
                        <button
                          key={a._id}
                          onClick={() => handleSelect(`/article`)}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left"
                        >
                          <span>✍️</span>
                          <span className="text-sm font-medium text-slate-200 truncate">{a.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {results.images?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1">
                        Visuals & Images ({results.images.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {results.images.map((img) => (
                          <button
                            key={img._id}
                            onClick={() => handleSelect(`/image`)}
                            className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-800/70 border border-slate-800 text-left"
                          >
                            <img
                              src={img.imageUrl || img.previewUrl}
                              alt="thumbnail"
                              className="w-10 h-10 object-cover rounded-md bg-slate-950"
                            />
                            <p className="text-xs text-slate-300 line-clamp-2">{img.prompt}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {results.campaigns?.length === 0 &&
                    results.projects?.length === 0 &&
                    results.articles?.length === 0 &&
                    results.images?.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        No matches found for "{query}". Try a different keyword or command.
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center space-x-1">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
