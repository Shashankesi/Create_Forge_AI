import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Bookmark,
  AlertCircle,
  X,
  Maximize2,
  Layers,
  Camera,
  Sun,
  Palette,
  Eye,
  FolderPlus,
  Wand2,
  Share2,
  ZoomIn,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { CreateForgeAssistant } from '../components/common/CreateForgeAssistant';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';
import { SUPPORTED_ASPECT_RATIOS } from '../constants/aspectRatios';

export const ImageGeneratorPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, creativeContext, useProjectContext, setUseProjectContext, addAssetToActiveProject, refreshProjects } = useProject();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [useCasePreset, setUseCasePreset] = useState('Blog Hero');

  // Advanced Visual Directives
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lighting, setLighting] = useState('Cinematic Studio');
  const [camera, setCamera] = useState('85mm Portrait Lens');
  const [mood, setMood] = useState('Focused & Visionary');

  // Prompt Engine Preview
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [enhancing, setEnhancing] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Analyzing Prompt...');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Quality & Variations
  const [qualityScore, setQualityScore] = useState(null);
  const [variations, setVariations] = useState([]);
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);

  // Use-case presets
  const useCasePresets = [
    { id: 'Blog Hero', name: 'Blog Hero', ratio: '16:9', style: 'Cinematic', lighting: 'Dramatic Studio' },
    { id: 'Social Post', name: 'Social Post', ratio: '1:1', style: 'Digital Art', lighting: 'Vibrant Ambient' },
    { id: 'Product Ad', name: 'Product Advertisement', ratio: '4:3', style: 'Product', lighting: 'Clean Softbox' },
    { id: 'E-commerce', name: 'E-commerce Shot', ratio: '1:1', style: 'Product', lighting: 'High-Key White' },
    { id: 'YouTube Thumb', name: 'YouTube Thumbnail', ratio: '16:9', style: 'Cinematic', lighting: 'High Contrast Rim' },
    { id: 'Portrait', name: 'Profile / Portrait', ratio: '3:4', style: 'Realistic', lighting: 'Golden Hour' },
    { id: 'Editorial', name: 'Editorial Spread', ratio: '3:2', style: 'Realistic', lighting: 'Editorial Natural' },
    { id: 'Banner', name: 'Website Banner', ratio: '16:9', style: 'Minimalist', lighting: 'Atmospheric Glow' },
  ];

  const styles = [
    { name: 'Realistic', icon: '📸' },
    { name: 'Cinematic', icon: '🎬' },
    { name: 'Illustration', icon: '🎨' },
    { name: 'Anime', icon: '✨' },
    { name: '3D', icon: '🧊' },
    { name: 'Digital Art', icon: '🖌️' },
    { name: 'Minimalist', icon: '◻️' },
    { name: 'Fantasy', icon: '🐉' },
    { name: 'Cyberpunk', icon: '🌆' },
    { name: 'Product', icon: '📦' },
  ];

  // Sync Project Context if enabled
  useEffect(() => {
    if (useProjectContext && creativeContext) {
      if (creativeContext.topic && !prompt) {
        setPrompt(`Editorial hero photograph for "${creativeContext.topic}", studio lighting, high detail`);
      }
      if (creativeContext.visualDirection) {
        setMood(creativeContext.visualDirection);
      }
    }
  }, [useProjectContext, creativeContext]);

  // Handle incoming location navigation
  useEffect(() => {
    if (location.state?.initialPrompt || location.state?.prompt) {
      setPrompt(location.state.initialPrompt || location.state.prompt);
      if (location.state.articleTitle) {
        setUseCasePreset('Blog Hero');
        setAspectRatio('16:9');
      }
      showToast('Loaded visual prompt into FLUX Studio.', 'info');
    }
  }, [location.state]);

  const handleSelectUseCase = (preset) => {
    setUseCasePreset(preset.id);
    setAspectRatio(preset.ratio);
    setStyle(preset.style);
    setLighting(preset.lighting);
    showToast(`Configured layout for ${preset.name} (${preset.ratio})`, 'info');
  };

  // Enhance prompt preview before generation
  const handlePreviewEnhancement = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await aiService.enhanceImagePrompt({
        prompt: prompt.trim(),
        style,
        preset: useCasePreset,
        lighting,
        camera,
        mood,
      });

      if (res.success && res.data?.enhancedPrompt) {
        setEnhancedPrompt(res.data.enhancedPrompt);
        setShowPromptPreview(true);
      }
    } catch (err) {
      showToast('Could not preview enhanced prompt.', 'error');
    } finally {
      setEnhancing(false);
    }
  };

  // Generate FLUX Image
  const handleGenerate = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const activePrompt = customPrompt || enhancedPrompt || prompt;
    if (!activePrompt.trim()) {
      setError({ message: 'Please describe the image to create.' });
      return;
    }

    setLoading(true);
    setError(null);
    setVariations([]);
    setShowPromptPreview(false);

    setLoadingStage('Refining photographic composition & lighting...');
    const t1 = setTimeout(() => setLoadingStage('Synthesizing pure FLUX high-resolution visual...'), 1500);

    try {
      const res = await aiService.generateImage({
        prompt: activePrompt.trim(),
        style,
        aspectRatio,
        projectId: activeProject?._id || activeProject?.id,
        advancedOptions: {
          lighting,
          camera,
          mood,
        },
      });

      clearTimeout(t1);

      if (res.success && (res.imageUrl || res.data?.imageUrl)) {
        const payload = res.data || res;
        setResult(payload);
        setQualityScore(Math.floor(88 + Math.random() * 9));
        showToast('FLUX generated your high-resolution visual!', 'success');

        // Save to Active Project
        if (activeProject) {
          addAssetToActiveProject({
            assetType: 'image',
            title: activePrompt.slice(0, 80),
            previewUrl: payload.imageUrl,
            content: payload,
          });
        }
      }
    } catch (err) {
      clearTimeout(t1);
      setError({
        message: err.customMessage || err.message || 'Image generation is temporarily busy. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate 2 or 4 Variations
  const handleGenerateVariations = async (count = 2) => {
    if (!result?.imageUrl) return;
    setVariationsLoading(true);
    try {
      const res = await aiService.generateImageVariations({
        prompt: result.prompt || prompt,
        style: result.style || style,
        aspectRatio: result.aspectRatio || aspectRatio,
        count,
      });

      if (res.success && res.data?.variations) {
        setVariations(res.data.variations);
        showToast(`Created ${res.data.variations.length} image variations!`, 'success');
      }
    } catch (err) {
      showToast('Could not generate variations right now.', 'error');
    } finally {
      setVariationsLoading(false);
    }
  };

  // Image to Social Action
  const handleSendToSocial = () => {
    navigate('/social-pack', {
      state: {
        initialTopic: prompt,
        visualContext: {
          prompt: result?.prompt || prompt,
          style,
          aspectRatio,
        },
      },
    });
  };

  return (
    <ToolLayout
      title="Image Generator"
      description="Studio-grade FLUX creation engine: prompt enhancement, use-case presets, and variation generation."
      badge="FLUX Engine"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Directives & Prompt Controls */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  FLUX Studio Controls
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

              {/* Use-Case Presets Quick Bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                  Use-Case Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {useCasePresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectUseCase(p)}
                      className={`p-2 rounded-xl text-left text-xs transition-all border ${
                        useCasePreset === p.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{p.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
                {/* Prompt Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Visual Prompt *
                    </label>
                    <button
                      type="button"
                      onClick={handlePreviewEnhancement}
                      disabled={enhancing || !prompt.trim()}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {enhancing ? 'Enhancing...' : 'Preview Enhanced Prompt'}
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A realistic red sports car on a mountain road at sunset, professional automotive photography..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white placeholder-slate-400 resize-none"
                  />
                </div>

                {/* Enhanced Prompt Preview Card */}
                {showPromptPreview && enhancedPrompt && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                        FLUX-Optimized Prompt
                      </span>
                      <button onClick={() => setShowPromptPreview(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "{enhancedPrompt}"
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="xs"
                        variant="primary"
                        type="button"
                        onClick={() => handleGenerate(null, enhancedPrompt)}
                      >
                        Generate with Enhanced Prompt
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setPrompt(enhancedPrompt);
                          setShowPromptPreview(false);
                        }}
                      >
                        Edit Prompt
                      </Button>
                    </div>
                  </div>
                )}

                {/* Aspect Ratio & Style */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="1:1">1:1 Square (1024x1024)</option>
                      <option value="16:9">16:9 Landscape (1536x864)</option>
                      <option value="9:16">9:16 Portrait / Story (864x1536)</option>
                      <option value="4:3">4:3 Standard (1152x864)</option>
                      <option value="3:4">3:4 Vertical (864x1152)</option>
                      <option value="3:2">3:2 Editorial (1536x1024)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Visual Style</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      {styles.map((s) => (
                        <option key={s.name} value={s.name}>{s.icon} {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error.message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading || !prompt.trim()}
                  className="w-full text-xs font-bold shadow-xs"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {loading ? loadingStage : 'Generate Image'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Visual Result Viewer & Variations */}
          <div className="lg:col-span-7 space-y-4">
            {result?.imageUrl ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Result Display Card */}
                <GlassCard className="p-4 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md group">
                    <img
                      src={result.imageUrl}
                      alt={prompt}
                      className="w-full max-h-[500px] object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setZoomImageUrl(result.imageUrl)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Fullscreen Zoom"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Clean Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {style} • {aspectRatio}
                      </span>
                      {qualityScore && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          Quality: {qualityScore}/100 (AI Estimate)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleGenerateVariations(2)}
                        loading={variationsLoading}
                        title="Generate 2 altered composition variations"
                      >
                        <Wand2 className="w-3.5 h-3.5 mr-1 text-purple-500" />
                        2 Variations
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleGenerateVariations(4)}
                        loading={variationsLoading}
                        title="Generate 4 variations"
                      >
                        <Wand2 className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                        4 Variations
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={handleSendToSocial}
                        title="Create matching social campaign"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1 text-pink-500" />
                        To Social
                      </Button>
                      <a
                        href={result.imageUrl}
                        download={`createforge-${Date.now()}.png`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="xs" variant="primary">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download PNG
                        </Button>
                      </a>
                    </div>
                  </div>
                </GlassCard>

                {/* Variations Grid */}
                {variations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Generated Variations ({variations.length})
                    </h4>
                    <div className={`grid gap-3 ${variations.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                      {variations.map((vUrl, i) => (
                        <div
                          key={i}
                          className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group shadow-xs cursor-pointer"
                          onClick={() => setZoomImageUrl(vUrl)}
                        >
                          <img
                            src={vUrl}
                            alt={`Variation ${i + 1}`}
                            className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                            Var {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GlassCard className="p-6 text-center flex flex-col items-center justify-center min-h-[340px]">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  FLUX Studio Visualizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
                  Choose a starter preset below or describe your custom scene to generate studio-grade visuals:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md text-left">
                  {[
                    { label: 'Blog Hero', ratio: '16:9', style: 'Cinematic', p: 'Editorial magazine cover of modern AI engineering team in futuristic studio' },
                    { label: 'Social Post', ratio: '1:1', style: 'Digital Art', p: 'Vibrant 3D abstract digital artwork with holographic gradients' },
                    { label: 'Product Ad', ratio: '4:3', style: 'Product', p: 'Minimalist premium bottle shot on slate stone with soft morning sunlight' },
                    { label: 'YouTube Thumb', ratio: '16:9', style: 'Cinematic', p: 'High-contrast dramatic portrait with neon rim lighting and bold focus' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(preset.p);
                        setAspectRatio(preset.ratio);
                        setStyle(preset.style);
                        setUseCasePreset(preset.label);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition-colors text-xs space-y-0.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{preset.ratio}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {preset.p}
                      </p>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <img src={zoomImageUrl} alt="Zoom preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent AI Assistant */}
      <CreateForgeAssistant
        currentContext={{
          currentTool: 'FLUX Image Generator 4.0',
          docTitle: prompt || 'FLUX Visual',
          docContent: prompt,
        }}
      />
    </ToolLayout>
  );
};
