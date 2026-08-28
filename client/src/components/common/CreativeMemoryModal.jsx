import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';
import { memoryService } from '../../services/memoryService';

export const CreativeMemoryModal = ({ isOpen, onClose, projectId, projectName }) => {
  const { showToast } = useToast();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');

  const fetchMemory = async () => {
    if (!projectId) return;
    try {
      const res = await memoryService.getMemory(projectId);
      if (res.success && res.memory) {
        setMemory(res.memory);
      }
    } catch {
      showToast('Failed to load project memory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchMemory();
    }
  }, [isOpen, projectId]);

  const handleAddTerm = async (e) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDef.trim()) return;

    const terms = [...(memory?.importantTerminology || []), { term: newTerm.trim(), definition: newDef.trim() }];
    try {
      const res = await memoryService.updateMemory(projectId, { importantTerminology: terms });
      if (res.success) {
        setMemory(res.memory);
        setNewTerm('');
        setNewDef('');
        showToast('Terminology saved to project memory', 'success');
      }
    } catch {
      showToast('Failed to update terminology', 'error');
    }
  };

  const handleClearMemory = async () => {
    if (!window.confirm('Are you sure you want to clear all memory for this project?')) return;
    try {
      const res = await memoryService.clearMemory(projectId);
      if (res.success) {
        setMemory(res.memory);
        showToast('Project creative memory cleared', 'info');
      }
    } catch {
      showToast('Failed to clear memory', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🧠</span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Project Creative Memory</h3>
              <p className="text-xs text-slate-400">{projectName || 'Active Project'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm animate-pulse">Loading memory layer...</div>
          ) : (
            <>
              {/* Preferred vs Avoided Styles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-1">
                    <span>✓</span>
                    <span>Approved Styles ({memory?.preferredVisualDirections?.length || 0})</span>
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {memory?.preferredVisualDirections?.map((d, i) => (
                      <p key={i} className="text-xs text-slate-300 bg-slate-900/60 p-1.5 rounded">
                        {d.style}
                      </p>
                    ))}
                    {(!memory?.preferredVisualDirections || memory.preferredVisualDirections.length === 0) && (
                      <p className="text-xs text-slate-600 italic">No approved styles yet.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-rose-400 flex items-center space-x-1">
                    <span>✕</span>
                    <span>Avoided Styles ({memory?.avoidedVisualDirections?.length || 0})</span>
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {memory?.avoidedVisualDirections?.map((d, i) => (
                      <p key={i} className="text-xs text-slate-400 bg-slate-900/60 p-1.5 rounded">
                        {d.style}
                      </p>
                    ))}
                    {(!memory?.avoidedVisualDirections || memory.avoidedVisualDirections.length === 0) && (
                      <p className="text-xs text-slate-600 italic">No avoided styles yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminology Dictionary */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-200">Custom Terminology & Brand Rules</h4>
                <div className="space-y-2">
                  {memory?.importantTerminology?.map((t, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                      <div>
                        <span className="text-xs font-bold text-indigo-300">{t.term}: </span>
                        <span className="text-xs text-slate-300">{t.definition}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddTerm} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Term (e.g. Omnichannel)"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Rule / Definition (e.g. Always capitalize in headings)"
                    value={newDef}
                    onChange={(e) => setNewDef(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <Button type="submit" size="xs">
                    + Add
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <Button variant="danger" size="xs" onClick={handleClearMemory}>
            Clear Memory
          </Button>
          <Button variant="ghost" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
