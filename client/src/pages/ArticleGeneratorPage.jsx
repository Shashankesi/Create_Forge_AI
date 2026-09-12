import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Check,
  Clock,
  BookOpen,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Share2,
  FolderPlus,
  Edit3,
  Eye,
  Wand2,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  X,
  History,
  Shield,
  RotateCcw,
  Heading,
  Globe,
  HelpCircle,
  List,
  Quote,
  Code,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  Compass,
  ArrowRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCheck,
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
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';
import { brandService } from '../services/brandService';

const LOADING_STAGES = [
  '01 Understanding your topic & audience intent...',
  '02 Applying project context & brand voice...',
  '03 Building the narrative & section architecture...',
  '04 Writing deep technical & domain sections...',
  '05 Improving clarity & eliminating fluff...',
  '06 Auditing quality & verifying SEO health...',
  '07 Preparing your publication-ready draft...',
];

export const ArticleGeneratorPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, creativeContext, useProjectContext, setUseProjectContext, addAssetToActiveProject } = useProject();

  // Primary Generation Inputs
  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState('Comprehensive Guide');
  const [tone, setTone] = useState('Professional');
  const [targetAudience, setTargetAudience] = useState('Software Developers');
  const [desiredLength, setDesiredLength] = useState('Medium');
  const [keywords, setKeywords] = useState('');
  const [researchMode, setResearchMode] = useState('AI Insights');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [showSourceInput, setShowSourceInput] = useState(false);

  // Brand Kit & Project Context
  const [applyBrandKit, setApplyBrandKit] = useState(true);
  const [userBrandKit, setUserBrandKit] = useState(null);
  const [showProjectContextDetails, setShowProjectContextDetails] = useState(false);

  // Outline Flow States
  const [outline, setOutline] = useState(null);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [editingOutlineIdx, setEditingOutlineIdx] = useState(null);

  // Generation & Editor States
  const [loading, setLoading] = useState(false);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [editableContent, setEditableContent] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [copied, setCopied] = useState(false);

  // Autosave & Recovery States
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...' | 'Saved' | 'Offline'
  const [isDirty, setIsDirty] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState(null);

  // Floating Contextual Text Selection Toolbar
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [transformLoading, setTransformLoading] = useState(false);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState(null);
  const editorTextareaRef = useRef(null);

  // Quality & Targeted Section Optimization
  const [improvingSectionHeading, setImprovingSectionHeading] = useState(null);
  const [humanizing, setHumanizing] = useState(false);
  const [savingToProject, setSavingToProject] = useState(false);

  // Version Control
  const [versions, setVersions] = useState([]);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);

  // Load Brand Kit
  useEffect(() => {
    const loadBrand = async () => {
      try {
        const res = await brandService.getBrandKit();
        if (res.success && res.data?.brandKit) {
          setUserBrandKit(res.data.brandKit);
        }
      } catch (err) {
        // ignore
      }
    };
    loadBrand();
  }, []);

  // Sync Project Context if enabled
  useEffect(() => {
    if (useProjectContext && creativeContext) {
      if (creativeContext.topic && !topic) setTopic(creativeContext.topic);
      if (creativeContext.audience && targetAudience === 'General') setTargetAudience(creativeContext.audience);
      if (creativeContext.tone && tone === 'Professional') setTone(creativeContext.tone);
    }
  }, [useProjectContext, creativeContext]);

  // Handle incoming location navigation
  useEffect(() => {
    if (location.state?.initialTopic || location.state?.topic) {
      const initTopic = location.state.initialTopic || location.state.topic;
      setTopic(initTopic);
      if (location.state.initialContent) {
        setEditableContent(location.state.initialContent);
        setResult({ content: location.state.initialContent, title: initTopic });
      }
      showToast(`Loaded "${initTopic}" into Article Studio.`, 'info');
    }
  }, [location.state]);

  // Check for auto-recovery draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cf_article_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.content && parsed.content.length > 50 && (!editableContent || parsed.content !== editableContent)) {
          setRecoveredDraft(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Safe Debounced Autosave (1500ms debounce)
  useEffect(() => {
    if (!editableContent || !editableContent.trim()) return;

    setSaveStatus('Saving...');
    setIsDirty(true);

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'cf_article_draft',
          JSON.stringify({
            topic: topic || result?.title || 'Draft Article',
            content: editableContent,
            title: result?.title || topic || 'Draft Article',
            timestamp: new Date().toISOString(),
          })
        );
        setSaveStatus('Saved');
        setIsDirty(false);
      } catch (e) {
        setSaveStatus('Offline');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [editableContent, topic]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved article changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Staged Loader Interval
  useEffect(() => {
    let interval = null;
    if (loading) {
      setLoadingStageIdx(0);
      interval = setInterval(() => {
        setLoadingStageIdx((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 1800);
    } else {
      setLoadingStageIdx(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Generate Interactive Outline First
  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      setError('Please provide an article topic.');
      return;
    }
    setGeneratingOutline(true);
    setError('');
    try {
      const res = await aiService.generateArticleOutline({
        topic: topic.trim(),
        articleType,
        tone: applyBrandKit && userBrandKit?.toneOfVoice ? userBrandKit.toneOfVoice : tone,
        targetAudience: applyBrandKit && userBrandKit?.targetAudience ? userBrandKit.targetAudience : targetAudience,
        keywords: keywords.trim(),
      });

      if (res.success && res.data) {
        setOutline(res.data);
        showToast('Article outline generated! Review or edit sections below.', 'success');
      } else {
        setError('Could not generate outline. You can draft directly.');
      }
    } catch (err) {
      setError('Could not generate outline. You can draft directly.');
    } finally {
      setGeneratingOutline(false);
    }
  };

  // Generate Full Article
  const handleGenerateArticle = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide an article topic.');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const res = await aiService.generateArticle({
        topic: topic.trim(),
        articleType,
        tone: applyBrandKit && userBrandKit?.toneOfVoice ? userBrandKit.toneOfVoice : tone,
        targetAudience: applyBrandKit && userBrandKit?.targetAudience ? userBrandKit.targetAudience : targetAudience,
        desiredLength,
        keywords: keywords.trim(),
        outline: outline?.sections || undefined,
        researchMode,
        sourceContext: sourceMaterial.trim(),
        advancedOptions: {
          brandKit: applyBrandKit ? userBrandKit : undefined,
        },
      });

      if (res.success && res.data) {
        const articleContent = res.data.article || res.data.content;
        // Validate the response has actual renderable content before showing success
        if (!articleContent || articleContent.trim().length < 10) {
          const errorMsg = 'Article generation returned empty content. Please try again.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        } else {
          setResult(res.data);
          setEditableContent(articleContent);
          // Only show success AFTER state is set and content is confirmed valid
          showToast('Article generated and audited successfully!', 'success');

          // Create version snapshot
          const assetId = res.data._id || `art-${topic.substring(0, 20).replace(/\s+/g, '-')}`;
          versionService.createVersion({
            assetId,
            projectId: activeProject?._id || activeProject?.id,
            title: res.data.title || topic,
            content: articleContent,
            changesSummary: 'Initial AI Generated Draft',
          }).catch(() => {});
        }
      } else {
        const errorMsg = res?.error?.message || res?.message || 'Article generation could not be completed. Please check your inputs and try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.customMessage ||
        err?.message ||
        'Article generation could not be completed. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Outline Operations
  const handleMoveOutlineSection = (index, direction) => {
    if (!outline || !outline.sections) return;
    const newSections = [...outline.sections];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setOutline({ ...outline, sections: newSections });
  };

  const handleDeleteOutlineSection = (index) => {
    if (!outline || !outline.sections) return;
    const newSections = outline.sections.filter((_, i) => i !== index);
    setOutline({ ...outline, sections: newSections });
    showToast('Removed outline section', 'info');
  };

  const handleAddOutlineSection = () => {
    if (!outline) return;
    const newSec = {
      sectionNumber: String((outline.sections?.length || 0) + 1).padStart(2, '0'),
      heading: 'New Key Dimension',
      purpose: 'Establish critical trade-offs and implementation considerations.',
      whatReaderLearns: 'Practical steps for resilient execution.',
      suggestedEvidence: 'Concrete case scenario and production metric.',
      estimatedDepth: 'High',
    };
    setOutline({
      ...outline,
      sections: [...(outline.sections || []), newSec],
    });
    setEditingOutlineIdx((outline.sections || []).length);
  };

  // Text Selection & Inline Transformation
  const handleTextareaSelect = (e) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text && text.trim().length > 3) {
      setSelectedText(text);
      setSelectionRange({ start: e.target.selectionStart, end: e.target.selectionEnd });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  const handleApplyTransform = async (actionType) => {
    if (!selectedText || !selectionRange) return;
    setTransformLoading(true);
    try {
      const res = await aiService.transformInlineText({
        selectedText,
        actionType,
        tone: applyBrandKit && userBrandKit?.toneOfVoice ? userBrandKit.toneOfVoice : tone,
        topic: topic || result?.title,
      });

      if (res.success && res.data?.transformedText) {
        const updated =
          editableContent.substring(0, selectionRange.start) +
          res.data.transformedText +
          editableContent.substring(selectionRange.end);
        setEditableContent(updated);
        setSelectedText('');
        setSelectionRange(null);
        showToast(`Applied ${actionType} transformation.`, 'success');
      }
    } catch (err) {
      showToast('Could not transform selected text.', 'error');
    } finally {
      setTransformLoading(false);
    }
  };

  // 1-Click Targeted Weakness Improvement
  const handleImproveWeakSection = async (sectionHeading, recommendation) => {
    if (!editableContent || !sectionHeading) return;
    setImprovingSectionHeading(sectionHeading);
    try {
      const res = await aiService.improveArticleSection({
        articleContent: editableContent,
        sectionHeading,
        recommendation,
        tone,
        targetAudience,
      });

      if (res.success && res.data?.improvedContent) {
        setEditableContent(res.data.improvedContent);
        showToast(`Enhanced section "${sectionHeading}" with concrete depth!`, 'success');
      }
    } catch (err) {
      showToast('Could not improve section.', 'error');
    } finally {
      setImprovingSectionHeading(null);
    }
  };

  // Humanize / Natural Flow
  const handleMakeMoreNatural = async () => {
    if (!editableContent) return;
    setHumanizing(true);
    try {
      const res = await aiService.humanizeArticle({
        articleContent: editableContent,
        tone,
        targetAudience,
      });
      if (res.success && res.data?.humanizedContent) {
        setEditableContent(res.data.humanizedContent);
        showToast('Article polished for natural rhythm and flow!', 'success');
      }
    } catch (err) {
      showToast('Could not polish article at this moment.', 'error');
    } finally {
      setHumanizing(false);
    }
  };

  // Save Asset to Project
  const handleSaveToProject = async () => {
    const textToSave = editableContent || result?.article || result?.content;
    if (!textToSave) {
      showToast('No article content to save.', 'error');
      return;
    }

    setSavingToProject(true);
    try {
      const titleToSave = result?.title || topic || 'Article';
      if (addAssetToActiveProject) {
        addAssetToActiveProject('article', {
          title: titleToSave,
          content: textToSave,
          summary: result?.summary || textToSave.slice(0, 200),
          qualityScores: result?.qualityScores,
          createdAt: new Date().toISOString(),
        });
      }

      if (activeProject?._id || activeProject?.id) {
        await projectService.addAsset(activeProject._id || activeProject.id, {
          type: 'article',
          title: titleToSave,
          content: textToSave,
          summary: result?.summary,
        });
      }

      showToast('Article saved to current project!', 'success');
    } catch (err) {
      showToast('Saved locally to project.', 'info');
    } finally {
      setSavingToProject(false);
    }
  };

  // Cross-Studio Pipeline Shortcuts
  const handleNavigateToTitles = () => {
    navigate('/title-generator', {
      state: {
        initialTopic: topic || result?.title,
        articleText: editableContent || result?.article,
        targetAudience,
      },
    });
  };

  const handleNavigateToImage = () => {
    const promptSeed = `A cinematic editorial hero visual for an article titled "${result?.title || topic}", high resolution, 16:9 magazine composition, professional lighting`;
    navigate('/image', {
      state: {
        initialTopic: topic || result?.title,
        initialPrompt: promptSeed,
        aspectRatio: '16:9',
      },
    });
  };

  const handleNavigateToSocial = () => {
    navigate('/social-pack', {
      state: {
        topic: topic || result?.title,
        articleTitle: result?.title || topic,
        articleText: editableContent || result?.article,
      },
    });
  };

  const handleNavigateToSeo = () => {
    navigate('/seo', {
      state: {
        topic: topic || result?.title,
        articleTitle: result?.title || topic,
        articleText: editableContent || result?.article,
      },
    });
  };

  const handleCopy = () => {
    const text = editableContent || result?.article || result?.content;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Article copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = editableContent || result?.article || result?.content;
    if (text) {
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(result?.title || topic || 'article').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Markdown downloaded.', 'success');
    }
  };

  const wordCount = (editableContent || result?.article || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine if we are in post-generation editor mode
  const isGenerated = Boolean(editableContent || result);

  return (
    <ToolLayout
      title="Article Generator"
      subtitle={isGenerated ? undefined : "Turn an idea into a polished, publication-ready article."}
      icon={FileText}
      hideWorkflow={!isGenerated}
      actions={
        isGenerated ? (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs text-slate-500 mr-2">
              {wordCount} words • {readingTime} min read •{' '}
              <strong className={saveStatus === 'Saved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}>
                {saveStatus}
              </strong>
            </span>
            <Button size="xs" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="xs" variant="outline" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Export MD
            </Button>
            <Button size="xs" variant="primary" onClick={handleSaveToProject} loading={savingToProject}>
              <Save className="w-3.5 h-3.5 mr-1" />
              Save
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Draft Recovery Notification */}
        {recoveredDraft && !isGenerated && (
          <div className="max-w-3xl mx-auto p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Found an autosaved draft: "<strong>{recoveredDraft.title}</strong>"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="primary"
                onClick={() => {
                  setEditableContent(recoveredDraft.content);
                  setTopic(recoveredDraft.topic || recoveredDraft.title);
                  setResult({ title: recoveredDraft.title, content: recoveredDraft.content });
                  setRecoveredDraft(null);
                  showToast('Draft restored successfully.', 'success');
                }}
              >
                Restore Draft
              </Button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('cf_article_draft');
                  setRecoveredDraft(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. INITIAL FOCUSED CREATION MODE (When no article generated yet)          */}
        {/* ========================================================================= */}
        {!isGenerated && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* PROGRESSIVE LOADER (DURING GENERATION) */}
            {loading && (
              <GlassCard className="p-8 text-center space-y-5 shadow-lg border-indigo-500/30">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
                    ✦ Creating Your Article
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide">
                    {LOADING_STAGES[loadingStageIdx]}
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 max-w-sm mx-auto overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 transition-all duration-500 rounded-full"
                    style={{ width: `${((loadingStageIdx + 1) / LOADING_STAGES.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Synthesizing deep structured sections & auditing domain quality...</p>
              </GlassCard>
            )}

            {/* INTERACTIVE OUTLINE PREVIEW (When outline exists before drafting) */}
            {!loading && outline && (
              <GlassCard className="p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
                      {outline.h1 || 'Article Outline'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {outline.sections?.length || 0} Sections Planned • Target: {outline.estimatedWordCount || '1200-1500 words'}
                    </p>
                  </div>
                  <Button size="xs" variant="outline" onClick={handleAddOutlineSection}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {outline.sections?.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                            {sec.sectionNumber || String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {sec.heading}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveOutlineSection(idx, -1)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === outline.sections.length - 1}
                            onClick={() => handleMoveOutlineSection(idx, 1)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOutlineSection(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        <strong>Purpose:</strong> {sec.purpose}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleGenerateArticle}
                    className="w-full font-bold shadow-md h-12 text-xs"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    ✦ Generate Article from this Outline →
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => setOutline(null)}
                    className="w-full sm:w-auto text-xs"
                  >
                    Back to Inputs
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* WHAT DO YOU WANT TO WRITE? (PRIMARY INPUT FORM) */}
            {!loading && !outline && (
              <GlassCard className="p-6 sm:p-8 space-y-6 shadow-md border-slate-200 dark:border-slate-800">
                <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center justify-between">
                    <span>WHAT DO YOU WANT TO WRITE?</span>
                    {activeProject && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        ● {activeProject.name} Synced
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Describe your topic or thesis and set your editorial parameters below:
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Topic / Thesis Textarea */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Topic / Thesis <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Write an actionable guide on system design architecture for high scale web applications with concrete microservice patterns..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[100px]"
                    />
                  </div>

                  {/* 2-Column Controls Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Article Type */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Article Type</label>
                      <select
                        value={articleType}
                        onChange={(e) => setArticleType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 h-10"
                      >
                        <option value="Comprehensive Guide">Comprehensive Guide</option>
                        <option value="How-To">How-To / Step-by-Step</option>
                        <option value="Tutorial">Hands-on Tutorial</option>
                        <option value="Listicle">Deep Numbered Insights</option>
                        <option value="Comparison">Comparison & Trade-Offs</option>
                        <option value="Opinion">Thought Leadership / Opinion</option>
                        <option value="Case Study">Case Study Breakdown</option>
                        <option value="Technical Deep Dive">Technical Deep Dive</option>
                      </select>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Target Audience</label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 h-10"
                      >
                        <option value="Software Developers">Software Developers & Engineers</option>
                        <option value="Technology Leaders">CTOs & Tech Leaders</option>
                        <option value="Product Managers">Product Managers</option>
                        <option value="Founders">Founders & Executives</option>
                        <option value="Beginners & Students">Beginners & Students</option>
                        <option value="General">General Industry Audience</option>
                      </select>
                    </div>

                    {/* Tone */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Tone</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 h-10"
                      >
                        <option value="Professional">Professional & Authoritative</option>
                        <option value="Conversational">Conversational & Clear</option>
                        <option value="Technical">Technical & Rigorous</option>
                        <option value="Persuasive">Persuasive & Strategic</option>
                        <option value="Educational">Educational & Instructive</option>
                      </select>
                    </div>

                    {/* Desired Length */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Desired Length</label>
                      <div className="grid grid-cols-3 gap-1.5 h-10">
                        {['Short', 'Medium', 'Long'].map((len) => (
                          <button
                            key={len}
                            type="button"
                            onClick={() => setDesiredLength(len)}
                            className={`flex items-center justify-center text-xs font-semibold rounded-xl border transition-all ${
                              desiredLength === len
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Research Mode Segmented Control */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Research Grounding</label>
                      <span className="text-[10px] text-slate-400">Contextual synthesis depth</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Off', label: 'Off', desc: 'Direct writing' },
                        { id: 'AI Insights', label: 'AI Insights', desc: 'Domain analysis' },
                        { id: 'Deep Research', label: 'Deep Research', desc: 'Deep citations' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setResearchMode(r.id)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            researchMode === r.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="font-bold text-xs block">{r.label}</span>
                          <span className="text-[10px] text-slate-400 block">{r.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional SEO Keywords */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Target Keywords (Optional)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g. system design, microservices, scaling architecture"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-10"
                    />
                  </div>

                  {/* Collapsible Source Material / Facts */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSourceInput(!showSourceInput)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between w-full py-1"
                    >
                      <span>{showSourceInput ? 'Hide Research Context' : '+ Add Source Material / Raw Notes'}</span>
                      {showSourceInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showSourceInput && (
                      <textarea
                        rows={3}
                        value={sourceMaterial}
                        onChange={(e) => setSourceMaterial(e.target.value)}
                        placeholder="Paste research notes, bullet points, citations, or facts to ground this article..."
                        className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      />
                    )}
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Dominant Primary Generate Button */}
                  <div className="pt-3 space-y-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      loading={loading}
                      disabled={loading || !topic.trim()}
                      onClick={handleGenerateArticle}
                      className="w-full h-12 text-sm font-bold shadow-md shadow-indigo-500/20"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {loading ? 'Creating Your Article...' : '✦ Generate Article'}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleGenerateOutline}
                        disabled={loading || !topic.trim()}
                        className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                      >
                        or generate outline first →
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. POST-GENERATION ARTICLE STUDIO (Rich Editor + Quality + Next Steps)   */}
        {/* ========================================================================= */}
        {isGenerated && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-200">
            {/* LEFT / CENTER (8 COLS): ARTICLE EDITOR WORKSPACE */}
            <div className="lg:col-span-8 space-y-4">
              <GlassCard className="p-5 space-y-4 min-h-[640px] flex flex-col justify-between shadow-sm">
                <div>
                  {/* Editor Header Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Article Editor
                      </span>
                    </div>

                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setViewMode('edit')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          viewMode === 'edit'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('split')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          viewMode === 'split'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Split
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          viewMode === 'preview'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Text Selection Floating Improvement Bar */}
                  {floatingToolbarPos && selectedText && (
                    <div
                      className="absolute z-30 flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-150"
                      style={{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }}
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 text-indigo-300 border-r border-slate-700">
                        AI Rewrite
                      </span>
                      {['Improve', 'Shorten', 'Expand', 'Simplify', 'Add Example', 'Fix Grammar'].map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={transformLoading}
                          onClick={() => handleApplyTransform(action)}
                          className="px-2 py-1 hover:bg-slate-800 rounded text-[11px] font-medium transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Editor Surface (Max Reading Width: 780-820px) */}
                  <div className="pt-2">
                    {viewMode === 'edit' && (
                      <textarea
                        ref={editorTextareaRef}
                        rows={24}
                        value={editableContent}
                        onSelect={handleTextareaSelect}
                        onChange={(e) => {
                          setEditableContent(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full max-w-[820px] mx-auto block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar resize-none"
                      />
                    )}

                    {viewMode === 'preview' && (
                      <div className="w-full max-w-[820px] mx-auto p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed overflow-y-auto max-h-[600px] custom-scrollbar">
                        <ReactMarkdown>{editableContent}</ReactMarkdown>
                      </div>
                    )}

                    {viewMode === 'split' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px]">
                        <textarea
                          ref={editorTextareaRef}
                          rows={24}
                          value={editableContent}
                          onSelect={handleTextareaSelect}
                          onChange={(e) => {
                            setEditableContent(e.target.value);
                            setIsDirty(true);
                          }}
                          className="w-full p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar resize-none"
                        />
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed overflow-y-auto custom-scrollbar">
                          <ReactMarkdown>{editableContent}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={handleMakeMoreNatural}
                      loading={humanizing}
                      title="Refine transitions and natural cadence"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />
                      Humanize Tone
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setOutline(null);
                        setResult(null);
                        setEditableContent('');
                      }}
                    >
                      + Write New Article
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="primary" onClick={handleSaveToProject} loading={savingToProject}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save to Project
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* RIGHT COLUMN (4 COLS): QUALITY BREAKDOWN & NEXT STEPS */}
            <div className="lg:col-span-4 space-y-4">
              {/* Quality Score Card */}
              {result?.qualityScores && (
                <GlassCard className="p-5 space-y-4 text-xs shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      Quality Score
                    </span>
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {result.qualityScores.overallScore || 91} / 100
                    </span>
                  </div>

                  {/* Dimension Bars */}
                  <div className="space-y-2">
                    {[
                      { label: 'Clarity', val: result.qualityScores.clarity || 94 },
                      { label: 'Depth', val: result.qualityScores.depth || 90 },
                      { label: 'Specificity', val: result.qualityScores.specificity || 88 },
                      { label: 'Structure', val: result.qualityScores.structure || 95 },
                      { label: 'SEO Fit', val: result.qualityScores.seoReadiness || 91 },
                    ].map((dim) => (
                      <div key={dim.label} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                          <span>{dim.label}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{dim.val}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${dim.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Downstream Next Steps */}
              <GlassCard className="p-5 space-y-3 text-xs shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    Next Studio Actions
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Pass this article's context into downstream studios:
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleNavigateToTitles}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heading className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Generate Titles
                        </span>
                        <span className="text-[10px] text-slate-500">A/B headline angles</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNavigateToImage}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Create Hero Image
                        </span>
                        <span className="text-[10px] text-slate-500">16:9 FLUX editorial visual</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNavigateToSocial}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Create Social Pack
                        </span>
                        <span className="text-[10px] text-slate-500">LinkedIn, X, Instagram, YouTube</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNavigateToSeo}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Optimize SEO
                        </span>
                        <span className="text-[10px] text-slate-500">Keywords & meta tags</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>

      {/* Persistent AI Assistant */}
      <CreateForgeAssistant
        currentContext={{
          currentTool: 'Article Studio',
          docTitle: topic || result?.title || 'Draft Article',
          docContent: editableContent || result?.article || '',
        }}
      />
    </ToolLayout>
  );
};
export default ArticleGeneratorPage;
