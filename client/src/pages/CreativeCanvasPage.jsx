import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Save,
  Trash2,
  Move,
  FileText,
  Image as ImageIcon,
  Heading,
  StickyNote,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { useToast } from '../context/ToastContext';
import { canvasService } from '../services/canvasService';

export const CreativeCanvasPage = () => {
  const { showToast } = useToast();

  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Add Node Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState('note');
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const res = await canvasService.getCanvas();
        if (res.success && res.data?.canvas?.nodes) {
          setNodes(res.data.canvas.nodes);
        }
      } catch (err) {
        showToast('Could not load canvas board.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCanvas();
  }, []);

  const handleSaveCanvas = async () => {
    setSaving(true);
    try {
      const res = await canvasService.saveCanvas({
        title: 'Main Creative Canvas',
        nodes,
      });
      if (res.success) {
        showToast('Canvas workspace saved to database!', 'success');
      }
    } catch (err) {
      showToast('Failed to save canvas.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMouseDown = (e, nodeId) => {
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            position: {
              x: Math.max(10, e.clientX - dragOffset.x),
              y: Math.max(10, e.clientY - dragOffset.y),
            },
          };
        }
        return n;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleAddNode = (e) => {
    e?.preventDefault();
    if (!newNodeTitle.trim()) {
      showToast('Please provide a card title.', 'warning');
      return;
    }

    const newNode = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      position: { x: 100 + nodes.length * 30, y: 120 + nodes.length * 30 },
      data: {
        title: newNodeTitle.trim(),
        text: newNodeContent.trim(),
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setShowAddModal(false);
    setNewNodeTitle('');
    setNewNodeContent('');
    showToast('Card added to canvas!', 'success');
  };

  const handleDeleteNode = (id, e) => {
    e?.stopPropagation();
    setNodes((prev) => prev.filter((n) => n.id !== id));
    showToast('Card removed.', 'info');
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'article':
        return 'border-indigo-500/50 bg-indigo-500/5';
      case 'image':
        return 'border-pink-500/50 bg-pink-500/5';
      case 'title':
        return 'border-purple-500/50 bg-purple-500/5';
      default:
        return 'border-amber-500/50 bg-amber-500/5';
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-500" />;
      case 'title':
        return <Heading className="w-4 h-4 text-purple-500" />;
      default:
        return <StickyNote className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <ToolLayout
      title="Creative Canvas"
      subtitle="Visual draggable board to connect articles, visual generations, headlines, and strategic campaign notes."
      icon={Layers}
    >
      <div className="space-y-4">
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-indigo-500" /> Draggable Canvas ({nodes.length} Elements)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Card
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveCanvas} loading={saving}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Canvas
            </Button>
          </div>
        </div>

        {/* Canvas Infinite/Bound Playground Area */}
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative min-h-[580px] w-full rounded-3xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-inner select-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                position: 'absolute',
                zIndex: draggingNodeId === node.id ? 40 : 10,
              }}
              className={`w-64 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border shadow-xl cursor-move transition-shadow ${getNodeColor(
                node.type
              )} ${draggingNodeId === node.id ? 'shadow-2xl scale-[1.02] ring-2 ring-indigo-500' : 'hover:shadow-indigo-500/10'}`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-2">
                <div className="flex items-center gap-2">
                  {getNodeIcon(node.type)}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {node.type}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteNode(node.id, e)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                {node.data?.title || 'Untitled Card'}
              </h4>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed">
                {node.data?.text || node.data?.content || ''}
              </p>
            </div>
          ))}

          {nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Layers className="w-10 h-10 mb-2 text-indigo-500/50" />
              <p className="text-xs font-semibold">Your Canvas is empty.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Click "Add Card" above to place ideas, notes, or campaign deliverables.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Add Canvas Element
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Element Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'note', label: 'Note' },
                    { id: 'article', label: 'Article' },
                    { id: 'image', label: 'Visual' },
                    { id: 'title', label: 'Headline' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewNodeType(t.id)}
                      className={`p-2 rounded-xl text-center font-semibold transition-colors ${
                        newNodeType === t.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Title *</label>
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder="e.g. Key Marketing Takeaway, Article Concept..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Content / Notes</label>
                <textarea
                  value={newNodeContent}
                  onChange={(e) => setNewNodeContent(e.target.value)}
                  placeholder="Write your note or paste an excerpt..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Place Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
