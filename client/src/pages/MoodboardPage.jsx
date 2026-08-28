import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { moodboardService } from '../services/moodboardService';

export const MoodboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentProject } = useProject();

  const [moodboard, setMoodboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newCardType, setNewCardType] = useState('note');
  const [newCardContent, setNewCardContent] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMoodboard = async () => {
    try {
      const pId = currentProject?._id || currentProject?.id || 'default_project';
      const res = await moodboardService.getMoodboard(pId);
      if (res.success && res.moodboard) {
        setMoodboard(res.moodboard);
      }
    } catch {
      showToast('Failed to load moodboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodboard();
  }, [currentProject]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardContent.trim()) {
      showToast('Please enter content for the card', 'warning');
      return;
    }

    const card = {
      id: 'card_' + Date.now(),
      type: newCardType,
      content: newCardContent.trim(),
      title: newCardTitle.trim() || newCardType.toUpperCase(),
      position: { x: 0, y: 0, w: 260, h: 180 },
      isPreferred: false,
    };

    const updatedCards = [...(moodboard?.cards || []), card];
    try {
      const res = await moodboardService.updateMoodboard(moodboard._id, { cards: updatedCards });
      if (res.success) {
        setMoodboard(res.moodboard);
        setShowAddModal(false);
        setNewCardContent('');
        setNewCardTitle('');
        showToast('Card added to moodboard', 'success');
      }
    } catch {
      showToast('Failed to save card', 'error');
    }
  };

  const handleDeleteCard = async (cardId) => {
    const updatedCards = moodboard.cards.filter((c) => c.id !== cardId);
    try {
      const res = await moodboardService.updateMoodboard(moodboard._id, { cards: updatedCards });
      if (res.success) {
        setMoodboard(res.moodboard);
        showToast('Card deleted', 'info');
      }
    } catch {
      showToast('Failed to delete card', 'error');
    }
  };

  const handleTogglePreferred = async (cardId) => {
    const updatedCards = moodboard.cards.map((c) => {
      if (c.id === cardId) {
        return { ...c, isPreferred: !c.isPreferred };
      }
      return c;
    });

    try {
      const res = await moodboardService.updateMoodboard(moodboard._id, { cards: updatedCards });
      if (res.success) {
        setMoodboard(res.moodboard);
      }
    } catch {
      showToast('Failed to update preference', 'error');
    }
  };

  const handleGenerateMatchingVisual = async () => {
    if (!moodboard) return;
    setGenerating(true);
    try {
      const res = await moodboardService.generateVisualMatchingMoodboard(moodboard._id, 'Campaign hero image matching moodboard aesthetic');
      if (res.success && res.prompt) {
        showToast('Synthesized prompt from Moodboard! Opening FLUX...', 'success');
        navigate(`/image?prompt=${encodeURIComponent(res.prompt)}`);
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to generate visual from moodboard', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-2xl shadow-lg shadow-pink-500/20 text-white text-xl">
            ✨
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">AI Moodboard Workspace</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Collect references, palettes, lighting guides, and generate visuals synchronized to your board.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            + Add Card
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateMatchingVisual}
            disabled={generating}
          >
            {generating ? 'Synthesizing...' : '⚡ Generate Matching Visual'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 animate-pulse">Loading visual moodboard...</div>
      ) : (
        <>
          {/* Theme Header Card */}
          {moodboard?.theme && (
            <GlassCard className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-semibold text-pink-400">Active Mood</p>
                <h3 className="text-lg font-bold text-slate-100">{moodboard.theme?.mood}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {moodboard.theme?.colorPalette?.map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg shadow-md border border-slate-700"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </div>
            </GlassCard>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moodboard?.cards?.map((card) => (
              <GlassCard
                key={card.id}
                className={`p-4 flex flex-col justify-between space-y-3 transition-all ${
                  card.isPreferred ? 'border-pink-500/50 shadow-lg shadow-pink-500/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {card.type}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePreferred(card.id)}
                        className={`p-1 rounded text-xs ${
                          card.isPreferred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={card.isPreferred ? 'Preferred Reference' : 'Mark Preferred'}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 rounded text-xs text-slate-500 hover:text-rose-400"
                        title="Delete Card"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {card.title && <h4 className="text-sm font-bold text-slate-100 mb-1">{card.title}</h4>}

                  {card.type === 'color' && (
                    <div className="space-y-2">
                      <div
                        className="h-20 rounded-lg shadow-inner border border-slate-800"
                        style={{ backgroundColor: card.content }}
                      />
                      <p className="text-xs font-mono font-bold text-slate-200 text-center">{card.content}</p>
                    </div>
                  )}

                  {card.type === 'image' && (
                    <img
                      src={card.content}
                      alt={card.title || 'Moodboard Reference'}
                      className="w-full h-32 object-cover rounded-lg bg-slate-950 border border-slate-800"
                    />
                  )}

                  {card.type === 'note' && (
                    <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      {card.content}
                    </p>
                  )}

                  {card.type === 'keyword' && (
                    <span className="inline-block px-3 py-1.5 bg-pink-950/40 text-pink-300 border border-pink-800/30 rounded-xl text-xs font-semibold">
                      #{card.content}
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}

            {/* Empty placeholder to add new */}
            <button
              onClick={() => setShowAddModal(true)}
              className="p-8 border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-pink-400 transition-all group min-h-[180px]"
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">+</span>
              <span className="text-xs font-semibold">Add Card to Moodboard</span>
            </button>
          </div>
        </>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Add Moodboard Card</h3>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Card Type</label>
                <select
                  value={newCardType}
                  onChange={(e) => setNewCardType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="note">Creative Note / Direction</option>
                  <option value="color">Color Hex Code</option>
                  <option value="keyword">Visual Keyword</option>
                  <option value="image">Image URL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Neon Accent"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {newCardType === 'color' && 'Hex Code (e.g. #6366F1)'}
                  {newCardType === 'keyword' && 'Keyword (e.g. cinematic lighting)'}
                  {newCardType === 'image' && 'Image URL (https://...)'}
                  {newCardType === 'note' && 'Note Content'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    newCardType === 'color'
                      ? '#6366F1'
                      : newCardType === 'keyword'
                      ? 'volumetric atmospheric glow'
                      : 'Describe visual aesthetic or paste reference'
                  }
                  value={newCardContent}
                  onChange={(e) => setNewCardContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add to Board
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
