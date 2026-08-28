import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { workflowService } from '../services/workflowService';

export const WorkflowAutomationPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentProject } = useProject();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [executingStep, setExecutingStep] = useState(null);

  const fetchWorkflows = async () => {
    try {
      const res = await workflowService.getWorkflows();
      if (res.success) {
        setWorkflows(res.workflows || []);
        if (res.workflows?.length > 0 && !activeWorkflow) {
          setActiveWorkflow(res.workflows[0]);
        }
      }
    } catch {
      showToast('Failed to load workflows', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateTemplate = async (templateType) => {
    try {
      const names = {
        blog_campaign: 'Full Blog Campaign Pipeline',
        product_launch: 'Omnichannel Product Launch Blast',
        social_blast: 'Multi-Channel Viral Social Sprint',
        seo_revamp: 'High-Impact SEO Revamp Pipeline',
      };

      const res = await workflowService.createWorkflow({
        name: names[templateType] || 'Custom Creative Pipeline',
        templateType,
        projectId: currentProject?._id || currentProject?.id || null,
      });

      if (res.success && res.workflow) {
        setWorkflows([res.workflow, ...workflows]);
        setActiveWorkflow(res.workflow);
        showToast('Workflow pipeline created!', 'success');
      }
    } catch {
      showToast('Failed to create workflow', 'error');
    }
  };

  const handleExecuteStep = async (stepIndex) => {
    if (!activeWorkflow) return;
    setExecutingStep(stepIndex);
    try {
      const res = await workflowService.executeStep(activeWorkflow._id, stepIndex);
      if (res.success && res.workflow) {
        setActiveWorkflow(res.workflow);
        setWorkflows(workflows.map((w) => (w._id === res.workflow._id ? res.workflow : w)));
        showToast(`Step ${stepIndex + 1} completed!`, 'success');
      }
    } catch {
      showToast('Step execution failed', 'error');
    } finally {
      setExecutingStep(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white text-xl">
            ⚡
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              Creative Workflow Automation
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Execute reusable, multi-step AI creative pipelines with safe confirmation guards.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={() => handleCreateTemplate('blog_campaign')}>
            + New Blog Pipeline
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleCreateTemplate('product_launch')}>
            + Product Launch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Workflows List */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider px-1">
            Active Pipelines ({workflows.length})
          </h3>
          {workflows.map((w) => (
            <GlassCard
              key={w._id}
              onClick={() => setActiveWorkflow(w)}
              className={`p-4 cursor-pointer transition-all hover:border-emerald-500/40 ${
                activeWorkflow?._id === w._id ? 'border-emerald-500/60 bg-emerald-950/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100">{w.name}</h4>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    w.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400'
                      : w.status === 'running'
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {w.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{w.steps?.length || 0} sequential steps</p>
            </GlassCard>
          ))}

          {workflows.length === 0 && !loading && (
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No pipelines created yet. Click "+ New Blog Pipeline" above.
            </div>
          )}
        </div>

        {/* Right: Active Workflow Steps Runner */}
        <div className="md:col-span-2 space-y-4">
          {activeWorkflow ? (
            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{activeWorkflow.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeWorkflow.description}</p>
                </div>
                <div className="text-xs text-slate-500">
                  Template: <span className="font-semibold text-slate-300">{activeWorkflow.templateType}</span>
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-4">
                {activeWorkflow.steps?.map((step, idx) => (
                  <div
                    key={step.stepIndex}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      step.status === 'completed'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : step.status === 'running'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : step.status === 'running'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {step.status === 'completed' ? '✓' : idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{step.stepName}</h4>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Tool: {step.tool}</span>
                        {step.outputSummary && (
                          <p className="text-xs text-emerald-400 mt-1">{step.outputSummary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="xs"
                        variant={step.status === 'completed' ? 'outline' : 'primary'}
                        onClick={() => handleExecuteStep(step.stepIndex)}
                        disabled={executingStep === step.stepIndex}
                      >
                        {executingStep === step.stepIndex
                          ? 'Executing...'
                          : step.status === 'completed'
                          ? 'Re-Run'
                          : 'Execute Step ⚡'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-slate-500 text-sm">
              Select or create a workflow pipeline to begin.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
