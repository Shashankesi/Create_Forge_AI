import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Heading,
  Tag,
  Search,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  Share2,
  Globe,
  Upload,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCode,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { projectService } from '../services/projectService';

export const ProjectsPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { activeProject: globalActiveProject, setActiveProject: setGlobalActiveProject, refreshProjects: refreshGlobalProjects } = useProject();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Create/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#6366F1');
  const [modalLoading, setModalLoading] = useState(false);

  // Active Open Project Detail View
  const [activeProject, setActiveProject] = useState(null);

  // Delete Confirmation Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Add Source Modal
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('txt');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);

  const categories = ['All', 'Marketing', 'Esports', 'Technology', 'Personal', 'Client Work', 'General'];
  const colors = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({
        category: selectedCategory,
        search,
      });
      if (res.success && res.data?.projects) {
        setProjects(res.data.projects);
        if (activeProject) {
          const found = res.data.projects.find((p) => (p._id || p.id) === (activeProject._id || activeProject.id));
          if (found) setActiveProject(found);
        }
      }
    } catch (err) {
      showToast('Could not load projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide a project name.', 'warning');
      return;
    }
    setModalLoading(true);
    try {
      if (editId) {
        const res = await projectService.updateProject(editId, {
          name: name.trim(),
          description: description.trim(),
          category,
          color,
        });
        if (res.success) {
          showToast('Project updated successfully.', 'success');
        }
      } else {
        const res = await projectService.createProject({
          name: name.trim(),
          description: description.trim(),
          category,
          color,
        });
        if (res.success) {
          showToast('Project created successfully!', 'success');
        }
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
      refreshGlobalProjects();
    } catch (err) {
      showToast('Failed to save project.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('General');
    setColor('#6366F1');
    setEditId(null);
  };

  const handleOpenEdit = (p, e) => {
    e?.stopPropagation();
    setEditId(p._id || p.id);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category || 'General');
    setColor(p.color || '#6366F1');
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      const id = projectToDelete._id || projectToDelete.id;
      const res = await projectService.deleteProject(id);
      if (res.success) {
        showToast('Project and assets removed.', 'info');
        if ((activeProject?._id || activeProject?.id) === id) {
          setActiveProject(null);
        }
        fetchProjects();
        refreshGlobalProjects();
      }
    } catch {
      showToast('Failed to delete project.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    }
  };

  const handleSelectActiveProject = (p) => {
    setActiveProject(p);
    setGlobalActiveProject(p);
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!activeProject || !sourceName.trim()) return;
    setSourceLoading(true);
    try {
      const pId = activeProject._id || activeProject.id;
      const res = await projectService.addProjectSource(pId, {
        name: sourceName.trim(),
        fileType: sourceType,
        textContent: sourceContent.trim(),
      });
      if (res.success) {
        showToast('Source attached to project.', 'success');
        setShowSourceModal(false);
        setSourceName('');
        setSourceContent('');
        fetchProjects();
      }
    } catch {
      showToast('Could not attach source.', 'error');
    } finally {
      setSourceLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (!activeProject) return;
    const pId = activeProject._id || activeProject.id;
    try {
      await projectService.deleteProjectSource(pId, sourceId);
      showToast('Source removed.', 'info');
      fetchProjects();
    } catch {
      showToast('Could not remove source.', 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!activeProject) return;
    const pId = activeProject._id || activeProject.id;
    try {
      await projectService.deleteProjectItem(pId, itemId);
      showToast('Asset removed from project.', 'info');
      fetchProjects();
    } catch {
      showToast('Could not remove asset.', 'error');
    }
  };

  return (
    <ToolLayout
      title="Projects Workspace"
      description="Organize articles, hero visuals, titles, social packs, and sources into unified creative campaigns."
      badge="Workspace"
      breadcrumbs={[
        { label: 'Library', path: '/projects' },
        { label: 'Projects', path: '/projects' },
      ]}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Project
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Category Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Project Details View or Projects Grid */}
        {activeProject ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Project Overview Top Bar */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-800/40 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: activeProject.color || '#6366F1' }}
                  />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {activeProject.name}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeProject.description || 'Creative campaign workspace'} • {activeProject.category || 'General'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    {activeProject.completionPercentage || 0}% Complete
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setActiveProject(null)}
                    className="text-white hover:bg-white/10"
                  >
                    Back to All Projects
                  </Button>
                </div>
              </div>

              {/* Asset Status Checklist & Smart Next Action */}
              {(() => {
                const items = activeProject.items || [];
                const hasArticle = items.some((i) => i.assetType === 'article');
                const hasImage = items.some((i) => i.assetType === 'image');
                const hasTitles = items.some((i) => i.assetType === 'titles');
                const hasSocial = items.some((i) => i.assetType === 'social');
                const hasSeo = items.some((i) => i.assetType === 'seo');

                let nextAction = null;
                if (!hasArticle) nextAction = { label: 'Write Primary Article', path: '/article', icon: FileText };
                else if (!hasTitles) nextAction = { label: 'Generate Titles From Article', path: '/titles', icon: Heading };
                else if (!hasImage) nextAction = { label: 'Generate Hero Image', path: '/image', icon: ImageIcon };
                else if (!hasSocial) nextAction = { label: 'Generate Social Pack', path: '/social-pack', icon: Share2 };
                else if (!hasSeo) nextAction = { label: 'Optimize in SEO Studio', path: '/seo-studio', icon: Globe };

                return (
                  <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">Asset Checklist:</span>
                        {[
                          { label: 'Article', done: hasArticle },
                          { label: 'Titles', done: hasTitles },
                          { label: 'Image', done: hasImage },
                          { label: 'Social', done: hasSocial },
                          { label: 'SEO', done: hasSeo },
                        ].map((c) => (
                          <span
                            key={c.label}
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                              c.done
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 text-slate-400 border border-white/10'
                            }`}
                          >
                            <span>{c.done ? '✓' : '—'}</span>
                            <span>{c.label}</span>
                          </span>
                        ))}
                      </div>

                      {nextAction && (
                        <div className="flex items-center gap-1.5 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/40">
                          <Sparkles className="w-3 h-3 text-indigo-300" />
                          <span className="text-indigo-200 text-[11px] font-semibold">Suggested Next Step:</span>
                          <button
                            type="button"
                            onClick={() => navigate(nextAction.path, { state: { initialTopic: activeProject.name } })}
                            className="font-bold text-white hover:underline ml-1"
                          >
                            {nextAction.label} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Continue Creating Quick Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium mr-1">Studio Actions:</span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/article', { state: { topic: activeProject.name } })}
                  className="bg-white/10 text-white border-white/10 hover:bg-white/20"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Article Studio
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/image', { state: { initialPrompt: `Hero visual for ${activeProject.name}` } })}
                  className="bg-white/10 text-white border-white/10 hover:bg-white/20"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1" />
                  Image Studio
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/titles', { state: { initialTopic: activeProject.name } })}
                  className="bg-white/10 text-white border-white/10 hover:bg-white/20"
                >
                  <Heading className="w-3.5 h-3.5 mr-1" />
                  Titles Studio
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/social-pack', { state: { initialTopic: activeProject.name } })}
                  className="bg-white/10 text-white border-white/10 hover:bg-white/20"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Social Studio
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/seo-studio', { state: { initialText: activeProject.name } })}
                  className="bg-white/10 text-white border-white/10 hover:bg-white/20"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  SEO Studio
                </Button>
              </div>
            </div>

            {/* Creative Assets Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Creative Assets ({activeProject.items?.length || 0})
                </h3>
              </div>

              {activeProject.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProject.items.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {item.assetType}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item._id || item.id)}
                          className="text-slate-400 hover:text-red-500"
                          title="Remove asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.previewUrl && (
                        <img
                          src={item.previewUrl}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-xl bg-slate-950"
                        />
                      )}

                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-8 text-center space-y-2 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No creative assets saved yet.</p>
                  <p className="text-slate-400">Use the quick creation buttons above to generate and save articles, images, and social copy.</p>
                </GlassCard>
              )}
            </div>

            {/* Attached Project Sources */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Project Sources ({activeProject.sources?.length || 0})
                </h3>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setShowSourceModal(true)}
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  Attach Source Document
                </Button>
              </div>

              {activeProject.sources?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeProject.sources.map((s) => (
                    <div
                      key={s._id || s.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {s.fileType?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSource(s._id || s.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-6 text-center text-xs text-slate-400">
                  No source documents or media files attached yet. Click "Attach Source Document" to upload context.
                </GlassCard>
              )}
            </div>
          </div>
        ) : (
          /* Projects Grid Overview */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const isCurrent = (globalActiveProject?._id || globalActiveProject?.id) === (p._id || p.id);
              return (
                <div
                  key={p._id || p.id}
                  onClick={() => handleSelectActiveProject(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 hover:shadow-md ${
                    isCurrent
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-600'
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: p.color || '#6366F1' }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {p.category || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(p, e)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        title="Edit Project Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(p);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-500"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {p.description || 'Organized creative campaign workspace.'}
                    </p>
                  </div>

                  {/* Progress & Asset counts */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {p.items?.length || 0} Assets
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {p.completionPercentage || 0}% Complete
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <EmptyState
            icon={Folder}
            title="No projects found"
            description="Create a project to organize your creative articles, visuals, headlines, and social content."
            actionLabel="Create Project"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editId ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 SaaS Launch Campaign"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the goals and target audience..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={modalLoading}>
                  {editId ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Project?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will remove "{projectToDelete?.name}" and its associated creations. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Attach Source Material
              </h3>
              <button onClick={() => setShowSourceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Source Name *</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. Q3 Product Specs Doc"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">File Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="audio">Audio Transcript (.mp3 / .wav)</option>
                  <option value="url">Web Reference URL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Text Content / Notes</label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste text notes, summary, or extracted document content..."
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowSourceModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={sourceLoading}>
                  Attach Source
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
