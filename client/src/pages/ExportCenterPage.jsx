import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  Check,
  Copy,
  Folder,
  Layers,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { CreativePipelineNav } from '../components/common/CreativePipelineNav';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { exportService } from '../services/exportService';

export const ExportCenterPage = () => {
  const { showToast } = useToast();
  const { activeProject } = useProject();

  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('markdown');
  const [copied, setCopied] = useState(false);

  const fetchExport = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const projectId = activeProject._id || activeProject.id;
      const [expRes, timeRes] = await Promise.all([
        exportService.exportCampaign(projectId),
        exportService.getProjectTimeline(projectId),
      ]);

      if (expRes.success && expRes.data) {
        setExportData(expRes.data);
      }
      if (timeRes.success && timeRes.data?.activities) {
        setTimeline(timeRes.data.activities);
      }
    } catch (err) {
      console.warn('Export fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExport();
  }, [activeProject]);

  const handleDownload = (format = 'md') => {
    if (!exportData) return;
    let content = '';
    let mimeType = 'text/plain';
    let ext = format;

    if (format === 'md') {
      content = exportData.masterMarkdown || '';
      mimeType = 'text/markdown';
    } else if (format === 'json') {
      content = JSON.stringify(exportData.jsonBundle || {}, null, 2);
      mimeType = 'application/json';
    } else {
      content = exportData.masterMarkdown || '';
      ext = 'txt';
    }

    const filename = `${exportData.filename || 'createforge-export'}.${ext}`;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`, 'success');
  };

  const handleCopy = () => {
    const text = activeTab === 'json'
      ? JSON.stringify(exportData?.jsonBundle || {}, null, 2)
      : exportData?.masterMarkdown || '';
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied export payload to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Export Center"
      subtitle="Download structured campaign production bundles, sanitized JSON payloads, or inspect the project timeline."
      icon={Download}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Summary & Download Actions */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {activeProject?.name || 'Active Campaign'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {exportData?.summary?.totalAssets || 0} Packaged Deliverables
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleDownload('md')}
                  disabled={!exportData}
                  className="w-full justify-center shadow-md shadow-indigo-500/20"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Master Markdown (.md)
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleDownload('json')}
                  disabled={!exportData}
                  className="w-full justify-center"
                >
                  <FileCode className="w-4 h-4 mr-2 text-purple-500" />
                  Download Campaign JSON (.json)
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleDownload('txt')}
                  disabled={!exportData}
                  className="w-full justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Plain Text (.txt)
                </Button>
              </div>
            </GlassCard>

            {/* Project Activity Timeline */}
            <GlassCard className="p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                Project Activity Timeline
              </h4>

              {timeline.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {timeline.map((act) => (
                    <div key={act.id || act._id} className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {act.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No project activity logged yet.</p>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Live Export Preview */}
          <div className="lg:col-span-7 space-y-4">
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'markdown'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Markdown Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'json'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Structured JSON
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  Copy
                </Button>
              </div>

              {exportData ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-wrap">
                  {activeTab === 'json'
                    ? JSON.stringify(exportData.jsonBundle || {}, null, 2)
                    : exportData.masterMarkdown}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500">
                  Select or create a project with deliverables to preview the export package.
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
