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
  Columns,
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

const cleanArticleContent = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();
  // Strip accidental outer code fence wrapping the entire article
  if (/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i.test(cleaned)) {
    cleaned = cleaned.replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i, '$1').trim();
  }
  return cleaned;
};

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
  const [targetAudience, setTargetAudience] = useState('General Readers');
  const [desiredLength, setDesiredLength] = useState('Medium');
  const [keywords, setKeywords] = useState('');
  const [researchMode, setResearchMode] = useState('AI Insights');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [showSourceInput, setShowSourceInput] = useState(false);

  // Brand Kit & Project Context
  const [applyBrandKit, setApplyBrandKit] = useState(false);
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
  const [viewMode, setViewMode] = useState('preview'); // 'preview' (Document View) | 'edit' (Markdown Editor) | 'split' (Split View)
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
        const cleaned = cleanArticleContent(location.state.initialContent);
        setEditableContent(cleaned);
        setResult({ content: cleaned, title: initTopic });
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
        setOutline({ ...res.data, outlineTopic: topic.trim() });
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
      const activeOutlineSections =
        outline && outline.outlineTopic && outline.outlineTopic.toLowerCase() === topic.trim().toLowerCase()
          ? outline.sections
          : undefined;

      const res = await aiService.generateArticle({
        topic: topic.trim(),
        articleType,
        tone: applyBrandKit && userBrandKit?.toneOfVoice ? userBrandKit.toneOfVoice : tone,
        targetAudience: applyBrandKit && userBrandKit?.targetAudience ? userBrandKit.targetAudience : targetAudience,
        desiredLength,
        keywords: keywords.trim(),
        outline: activeOutlineSections,
        researchMode,
        sourceContext: sourceMaterial.trim(),
        advancedOptions: {
          brandKit: applyBrandKit ? userBrandKit : undefined,
        },
      });

      if (res.success && res.data) {
        const rawContent = res.data.article || res.data.content;
        const articleContent = cleanArticleContent(rawContent);
        // Validate the response has actual renderable content before showing success
        if (!articleContent || articleContent.trim().length < 10) {
          const errorMsg = 'Article generation returned empty content. Please try again.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        } else {
          setResult({ ...res.data, article: articleContent, content: articleContent });
          setEditableContent(articleContent);
          setViewMode('preview');
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
        setEditableContent(cleanArticleContent(res.data.humanizedContent));
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
    navigate('/titles', {
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
                      onChange={(e) => {
                        const newTopic = e.target.value;
                        setTopic(newTopic);
                        if (outline && outline.outlineTopic && outline.outlineTopic.toLowerCase() !== newTopic.trim().toLowerCase()) {
                          setOutline(null);
                        }
                      }}
                      placeholder="e.g. 10 Healthy breakfast ideas for busy mornings, or React hooks for beginners..."
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
                        <option value="General Readers">General Readers</option>
                        <option value="Beginners & Students">Beginners & Students</option>
                        <option value="Professionals & Practitioners">Professionals & Practitioners</option>
                        <option value="Software Developers & Engineers">Software Developers & Engineers</option>
                        <option value="Technology Leaders & CTOs">Technology Leaders & CTOs</option>
                        <option value="Product Managers & Designers">Product Managers & Designers</option>
                        <option value="Founders & Entrepreneurs">Founders & Entrepreneurs</option>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            {/* LEFT / CENTER (8 COLS): ARTICLE EDITOR WORKSPACE */}
            <div className="lg:col-span-8 space-y-4 min-w-0">
              {/* Main Document Workspace Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Editor Header Toolbar */}
                <div className="p-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                  {/* View Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Document View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'edit'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Markdown Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('split')}
                      className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'split'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Split View</span>
                    </button>
                  </div>

                  {/* Metadata Chips & Quick Shortcuts */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ~{readingTime} min read
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                      {wordCount.toLocaleString()} words
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Copy article markdown"
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      title="Download Markdown file"
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline AI Selection Toolbar (Active when user highlights text in Editor) */}
                {selectedText && (
                  <div className="mx-4 mt-4 p-2.5 sm:px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-lg border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-xs font-bold text-indigo-200">
                        Selected: <span className="text-slate-300 font-normal italic truncate max-w-[160px] inline-block align-bottom">"{selectedText}"</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['Improve', 'Shorten', 'Expand', 'Simplify', 'Add Example', 'Fix Grammar'].map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={transformLoading}
                          onClick={() => handleApplyTransform(action)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
                        >
                          {action}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedText('');
                          setSelectionRange(null);
                        }}
                        className="text-xs text-slate-400 hover:text-white px-1.5 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Workspace Content Canvas */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* VIEW 1: DOCUMENT VIEW (Formatted Reading / Review Canvas) */}
                  {viewMode === 'preview' && (
                    <div className="w-full max-w-4xl mx-auto space-y-6">
                      {/* Document Meta Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                            {articleType}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            Tone: {tone}
                          </span>
                          {targetAudience && (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hidden sm:inline-block">
                              Audience: {targetAudience}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewMode('edit')}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Article
                        </button>
                      </div>

                      {/* Prominent Title if not already starting with H1 */}
                      {!editableContent.trim().startsWith('# ') && (
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-['Outfit'] pb-3 border-b border-slate-100 dark:border-slate-800">
                          {result?.title || topic || 'Generated Article'}
                        </h1>
                      )}

                      {/* Rendered Markdown Body with Full Responsive Styling */}
                      <div className="prose prose-slate dark:prose-invert prose-base sm:prose-lg max-w-none break-words leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mt-1 mb-6 font-['Outfit'] pb-4 border-b border-slate-200/80 dark:border-slate-800"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-8 mb-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 font-['Outfit']"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base my-3.5" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base my-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal pl-6 space-y-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base my-4" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 py-3 px-5 rounded-r-xl my-5 text-slate-700 dark:text-slate-300 italic not-italic-children shadow-xs"
                                {...props}
                              />
                            ),
                            pre: ({ node, ...props }) => (
                              <div className="relative group my-5">
                                <pre
                                  className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 overflow-x-auto text-xs sm:text-sm text-slate-100 font-mono shadow-inner custom-scrollbar"
                                  {...props}
                                />
                              </div>
                            ),
                            code: ({ node, inline, className, children, ...props }) => {
                              if (inline) {
                                return (
                                  <code
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 font-mono text-xs sm:text-[13px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <code className={`${className || ''} font-mono`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
                              </div>
                            ),
                            th: ({ node, ...props }) => (
                              <th className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 font-bold text-slate-900 dark:text-white" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="border-b border-slate-100 dark:border-slate-800/50 p-3 text-slate-700 dark:text-slate-300" {...props} />
                            ),
                          }}
                        >
                          {editableContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: MARKDOWN EDITOR (Clean Document-First Writing Surface) */}
                  {viewMode === 'edit' && (
                    <div className="w-full max-w-4xl mx-auto space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                        <span>Markdown Document Canvas (Select text to trigger AI Rewrite)</span>
                        <button
                          type="button"
                          onClick={() => setViewMode('preview')}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Rendered Article
                        </button>
                      </div>
                      <textarea
                        ref={editorTextareaRef}
                        rows={28}
                        value={editableContent}
                        onSelect={handleTextareaSelect}
                        onChange={(e) => {
                          setEditableContent(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Write or edit article markdown here..."
                        className="w-full p-5 sm:p-7 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 font-sans text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 custom-scrollbar resize-y min-h-[580px]"
                      />
                    </div>
                  )}

                  {/* VIEW 3: SPLIT VIEW (Editor + Live Formatted Preview Side-by-Side) */}
                  {viewMode === 'split' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[620px]">
                      {/* Left: Editor Pane */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                          <span>Markdown Editor</span>
                        </div>
                        <textarea
                          ref={editorTextareaRef}
                          value={editableContent}
                          onSelect={handleTextareaSelect}
                          onChange={(e) => {
                            setEditableContent(e.target.value);
                            setIsDirty(true);
                          }}
                          className="w-full h-[640px] p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 font-sans text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 custom-scrollbar resize-none overflow-y-auto"
                        />
                      </div>

                      {/* Right: Rendered Preview Pane */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                          <span>Live Formatted Preview</span>
                        </div>
                        <div className="w-full h-[640px] p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed overflow-y-auto custom-scrollbar break-words">
                          <ReactMarkdown>{editableContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dedicated Non-Overlapping Footer Action Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMakeMoreNatural}
                    loading={humanizing}
                    title="Refine transitions and natural conversational cadence"
                    className="border-purple-200 dark:border-purple-900/50 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5 text-purple-500" />
                    Humanize Tone
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOutline(null);
                      setResult(null);
                      setEditableContent('');
                    }}
                    title="Start fresh with a new article topic"
                  >
                    <Plus className="w-4 h-4 mr-1.5 text-slate-500" />
                    Write New Article
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopy} title="Copy article to clipboard">
                    {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5 text-slate-500" />}
                    {copied ? 'Copied' : 'Copy Article'}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${saveStatus === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span>{saveStatus}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveToProject}
                    loading={savingToProject}
                    className="shadow-sm shadow-indigo-500/20"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save to Project
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS): QUALITY BREAKDOWN & NEXT STEPS */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
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
