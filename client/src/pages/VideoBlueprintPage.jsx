import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { multimodalService } from '../services/multimodalService';

export const VideoBlueprintPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('Short-Form (60s)');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide an article title and content to convert.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await multimodalService.articleToVideoBlueprint({
        articleTitle: title.trim(),
        articleContent: content.trim(),
        videoFormat: format,
      });

      if (res.success && res.blueprint) {
        setBlueprint(res.blueprint);
        showToast('Production-Ready Storyboard Blueprint Created!', 'success');
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to generate video blueprint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl shadow-lg shadow-rose-500/20 text-white text-xl">
            🎬
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              Article-to-Video Blueprint
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Transform long-form articles into scene-by-scene production storyboards with voiceover & thumbnail prompts.
            </p>
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Article Title</label>
              <input
                type="text"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                placeholder="e.g. 5 Autonomous AI Workflow Automations for 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                disabled={loading}
              >
                <option value="Short-Form (60s)">Short-Form / Reels / TikTok (60s)</option>
                <option value="YouTube Explainer (3-5 mins)">YouTube Explainer (3-5 mins)</option>
                <option value="Product Launch Teaser (30s)">Product Launch Teaser (30s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Article Content / Summary</label>
            <textarea
              rows={4}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              placeholder="Paste article paragraphs here to convert into a storyboard..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Generates: 3s Hook • Timed Scenes • Voiceover Audio • B-Roll Ideas • Thumbnail Prompt
            </span>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? 'Synthesizing Storyboard...' : '🎬 Convert to Video Blueprint'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {blueprint && (
        <div className="space-y-6">
          {/* Hook Card */}
          <GlassCard className="p-6 border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-rose-400">
                ⚡ 3-Second Viral Hook ({blueprint.hook?.duration})
              </span>
              <span className="text-xs px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800/40 rounded-full font-bold">
                HIGH RETENTION
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              "{blueprint.hook?.voiceover}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-900">
              <p><strong className="text-slate-300">Visual Direction:</strong> {blueprint.hook?.visualDirection}</p>
              <p><strong className="text-slate-300">On-Screen Text:</strong> {blueprint.hook?.onScreenText}</p>
            </div>
          </GlassCard>

          {/* Scene Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>🎞️</span>
              <span>Scene-by-Scene Production Storyboard</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {blueprint.scenes?.map((scene) => (
                <GlassCard key={scene.sceneNumber} className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-indigo-400">Scene {scene.sceneNumber}</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        {scene.timecode}
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-400">Voiceover Script</p>
                      <p className="text-xs text-slate-200 mt-1 font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                        "{scene.voiceover}"
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-400">Visual & Camera Action</p>
                      <p className="text-xs text-slate-300 mt-0.5">{scene.visualDirection}</p>
                    </div>

                    {scene.onScreenText && (
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-400">Overlay Text</p>
                        <span className="inline-block text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {scene.onScreenText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                    <strong>B-Roll:</strong> {scene.bRollSuggestions}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Thumbnail & YouTube Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400">
                YouTube / Social Title & Description
              </h3>
              <p className="text-base font-bold text-slate-100">{blueprint.title}</p>
              <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-950 p-3 rounded-xl border border-slate-900">
                {blueprint.description}
              </p>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400">
                  Thumbnail Generation Prompt (FLUX)
                </h3>
                <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-900 mt-2">
                  {blueprint.thumbnailPrompt}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/image?prompt=${encodeURIComponent(blueprint.thumbnailPrompt)}`)}
              >
                Generate Thumbnail in FLUX Studio 🖼️
              </Button>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
