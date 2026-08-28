import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { moodboardService } from '../services/moodboardService';

export const CreativeDirectionPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentProject } = useProject();

  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null);

  const handleSynthesize = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await moodboardService.generateCreativeDirection({
        projectId: currentProject?._id || currentProject?.id || null,
        goal: goal.trim() || 'Establish a signature high-tech creative visual identity',
      });

      if (res.success && res.direction) {
        setDirection(res.direction);
        showToast('Creative Direction synthesized!', 'success');
      }
    } catch (err) {
      showToast(err.customMessage || 'Failed to synthesize direction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToProject = async () => {
    if (!currentProject) {
      showToast('Select an active project first', 'warning');
      return;
    }
    try {
      const res = await moodboardService.applyDirectionToProject({
        projectId: currentProject._id || currentProject.id,
      });
      if (res.success) {
        showToast('Direction applied to Project Visual Context!', 'success');
      }
    } catch {
      showToast('Failed to apply direction to project', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20 text-white text-xl">
            🎨
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">Creative Direction Studio</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              AI-formulated aesthetic systems, lighting guides, typography, and palette architecture.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/moodboard')}>
            ✨ Open Moodboard Workspace
          </Button>
          {direction && (
            <Button onClick={handleApplyToProject}>
              Apply to Active Project
            </Button>
          )}
        </div>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleSynthesize} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Visual Goal & Aesthetic Ambition
            </label>
            <input
              type="text"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="e.g., Ultra-premium dark glassmorphism with glowing neon purple accents and high-end 3D product renders"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Synthesizes: Color Harmonies • Typography • Photography • Lighting • 3D Accents
            </span>
            <Button type="submit" disabled={loading}>
              {loading ? 'Synthesizing Direction...' : 'Synthesize Direction ✨'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {direction && (
        <div className="space-y-6">
          {/* Color Palette */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>🌈</span>
              <span>Curated Color Harmony</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {direction.theme?.colorPalette?.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="h-16 rounded-lg shadow-inner" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-100">{c.hex}</p>
                    <p className="text-xs font-medium text-slate-300">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Typography & Lighting Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>🔤</span>
                <span>Typography & Graphic Style</span>
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong className="text-slate-100">Heading Typeface:</strong> {direction.theme?.typography?.heading}</p>
                <p><strong className="text-slate-100">Body Typeface:</strong> {direction.theme?.typography?.body}</p>
                <p><strong className="text-slate-100">Stylistic Vibe:</strong> {direction.theme?.typography?.vibes}</p>
                <p><strong className="text-slate-100">Graphic Style:</strong> {direction.theme?.graphicStyle}</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>💡</span>
                <span>Lighting & Photography Setup</span>
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong className="text-slate-100">Photography Style:</strong> {direction.theme?.photographyStyle}</p>
                <p><strong className="text-slate-100">Lighting Technique:</strong> {direction.theme?.lighting}</p>
                <p><strong className="text-slate-100">Composition Rule:</strong> {direction.theme?.composition}</p>
                <p><strong className="text-slate-100">3D Direction:</strong> {direction.theme?.threedDirection}</p>
              </div>
            </GlassCard>
          </div>

          {/* Visual Keywords */}
          <GlassCard className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
              FLUX High-Precision Aesthetic Descriptors
            </h3>
            <div className="flex flex-wrap gap-2">
              {direction.visualKeywords?.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-purple-950/60 text-purple-200 border border-purple-800/40 rounded-xl text-xs font-medium"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Sample Ready-to-run Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {direction.samplePrompts?.map((sp, idx) => (
              <GlassCard key={idx} className="p-5 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{sp.title}</h4>
                  <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-900 mt-2">
                    {sp.prompt}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/image?prompt=${encodeURIComponent(sp.prompt)}`)}
                >
                  Generate in FLUX Studio 🖼️
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
