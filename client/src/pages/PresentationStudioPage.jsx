import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { multimodalService } from '../services/multimodalService';

export const PresentationStudioPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [slidesCount, setSlidesCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState(null);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      showToast('Please provide a presentation topic.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await multimodalService.generatePresentation({
        topic: topic.trim(),
        context: context.trim(),
        targetSlides: slidesCount,
      });

      if (res.success && res.presentation) {
        setDeck(res.presentation);
        showToast('Presentation Slide Deck Generated!', 'success');
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to generate presentation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyDeckAsMarkdown = () => {
    if (!deck) return;
    let md = `# ${deck.deckTitle}\n*${deck.subtitle || ''}*\n\n---\n\n`;
    deck.slides?.forEach((s) => {
      md += `## Slide ${s.slideNumber}: ${s.title}\n\n`;
      s.bullets?.forEach((b) => (md += `- ${b}\n`));
      md += `\n**Speaker Notes:** ${s.speakerNotes}\n\n**Visual Direction:** ${s.visualSuggestion}\n\n---\n\n`;
    });
    navigator.clipboard.writeText(md);
    showToast('Slide deck copied to clipboard as Markdown!', 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-yellow-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white text-xl">
            📊
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              AI Presentation Studio
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Transform briefs and articles into executive slide decks with speaker notes and visual prompts.
            </p>
          </div>
        </div>

        {deck && (
          <Button variant="outline" size="sm" onClick={copyDeckAsMarkdown}>
            📋 Copy Slide Deck Markdown
          </Button>
        )}
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Presentation Topic / Pitch</label>
              <input
                type="text"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Next-Gen Autonomous AI Creative Pipelines for Enterprise Brands"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slide Count</label>
              <select
                value={slidesCount}
                onChange={(e) => setSlidesCount(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                disabled={loading}
              >
                <option value={5}>5 Slides (Quick Pitch)</option>
                <option value={8}>8 Slides (Standard Deck)</option>
                <option value={12}>12 Slides (Deep Dive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Source Content / Key Points (Optional)</label>
            <textarea
              rows={3}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              placeholder="Paste article, brief, or product specs to synthesize slides from..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Generates: Slide Titles • Bullet Points • Speaker Notes • Visual Layout Suggestions • FLUX Visual Prompts
            </span>
            <Button type="submit" disabled={loading || !topic.trim()}>
              {loading ? 'Synthesizing Deck...' : '📊 Generate Slide Deck'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {deck && (
        <div className="space-y-6">
          <GlassCard className="p-6 text-center space-y-2 border-amber-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Presentation Deck</span>
            <h2 className="text-2xl font-black text-slate-100">{deck.deckTitle}</h2>
            <p className="text-sm text-slate-400">{deck.subtitle}</p>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deck.slides?.map((slide) => (
              <GlassCard key={slide.slideNumber} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400">Slide {slide.slideNumber}</span>
                    <span className="text-xs text-slate-400">{slide.visualSuggestion}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{slide.title}</h3>

                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-200">
                    {slide.bullets?.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                    <p className="text-[11px] uppercase font-bold text-indigo-400">🎙️ Speaker Notes</p>
                    <p className="text-xs text-slate-300 italic">{slide.speakerNotes}</p>
                  </div>
                </div>

                {slide.imagePrompt && (
                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">Prompt: {slide.imagePrompt}</span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => navigate(`/image?prompt=${encodeURIComponent(slide.imagePrompt)}`)}
                    >
                      Generate Slide Visual →
                    </Button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {deck.concludingCta && (
            <GlassCard className="p-6 text-center bg-gradient-to-r from-amber-950/30 to-indigo-950/30 border-amber-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Concluding Call To Action</span>
              <p className="text-lg font-bold text-slate-100 mt-1">{deck.concludingCta}</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
