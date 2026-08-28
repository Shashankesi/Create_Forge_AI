import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

export const CampaignPipelineFlow = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: 'idea',
      title: 'Idea',
      icon: '💡',
      badge: 'INPUT',
      desc: 'Type a raw prompt or concept: "Launch a developer-first AI coding engine".',
      output: 'Autonomous intent recognition & target audience profiling.',
    },
    {
      id: 'strategy',
      title: 'Strategy',
      icon: '🎯',
      badge: 'STAGE 1',
      desc: 'Formulates value proposition, competitive angle, and messaging pillars.',
      output: 'Positioning Statement & Funnel Architecture.',
    },
    {
      id: 'research',
      title: 'Research',
      icon: '🔬',
      badge: 'STAGE 2',
      desc: 'Extracts real intent search queries, user questions, and content gaps.',
      output: 'High-volume target queries & audience FAQs.',
    },
    {
      id: 'content',
      title: 'Content',
      icon: '✍️',
      badge: 'STAGE 3',
      desc: 'Synthesizes long-form articles, categorized high-CTR headlines, and CTAs.',
      output: 'Structured article drafts + 10 psychological hooks.',
    },
    {
      id: 'visuals',
      title: 'Visuals',
      icon: '🖼️',
      badge: 'STAGE 4',
      desc: 'Curates color palettes, typography, and prompts for pure FLUX generation.',
      output: '3D/Lighting Moodboard + Photorealistic FLUX Prompts.',
    },
    {
      id: 'social',
      title: 'Social',
      icon: '📱',
      badge: 'STAGE 5',
      desc: 'Generates multi-platform tailored copy for Twitter/X, LinkedIn, and Instagram.',
      output: 'Platform-optimized threads & viral hooks.',
    },
    {
      id: 'seo',
      title: 'SEO',
      icon: '📈',
      badge: 'STAGE 6',
      desc: 'Constructs SERP titles, meta tags, and structured semantic markup.',
      output: 'Meta title, description & search snippets.',
    },
    {
      id: 'launch',
      title: 'Launch',
      icon: '🚀',
      badge: 'AUDIT',
      desc: '10-point omnichannel verification and automated readiness score.',
      output: '100% Launch Readiness Score & Export Center.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      <div className="text-center space-y-1.5">
        <span className="text-xs uppercase font-bold text-indigo-500 tracking-wider">
          AUTONOMOUS CREATIVE PIPELINE
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          From Single Prompt to Synchronized Launch
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Explore how CreateForge AI orchestrates the entire multimodal creative lifecycle.
        </p>
      </div>

      {/* Interactive Stage Step Indicator */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 custom-scrollbar">
        {stages.map((st, idx) => (
          <button
            key={st.id}
            onClick={() => setActiveStage(idx)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeStage === idx
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
            }`}
          >
            <span>{st.icon}</span>
            <span>{st.title}</span>
          </button>
        ))}
      </div>

      {/* Selected Stage Detail Card */}
      <GlassCard className="p-6 sm:p-8 space-y-4 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 to-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              {stages[activeStage].icon}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {stages[activeStage].badge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {stages[activeStage].title} Stage
              </h3>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/campaign-builder')}
            className="text-xs"
          >
            Launch Builder 🚀
          </Button>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {stages[activeStage].desc}
        </p>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Orchestrated Output:</span>
          <span className="font-bold text-indigo-300">{stages[activeStage].output}</span>
        </div>
      </GlassCard>
    </div>
  );
};
