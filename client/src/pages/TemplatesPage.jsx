import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  FileText,
  Share2,
  Globe,
  Briefcase,
  Layers,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';

export const TemplatesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Marketing', 'Blogging', 'SEO', 'Social Media', 'Business'];

  const templates = [
    {
      id: 'product-launch',
      title: 'Product Launch Campaign Brief',
      category: 'Marketing',
      description: 'End-to-end launch blueprint with target audience pain points, messaging hierarchy, and multi-channel asset checklist.',
      targetTool: '/brief',
      presetPayload: {
        rawInput: 'Launch our new AI creative workspace product. Emphasize unified workflow, FLUX image engine, and 10x faster campaign turnaround.',
        targetAudience: 'Product Founders & Content Creators',
        industry: 'Technology & SaaS',
        brandPersonality: 'Visionary & Authoritative',
      },
    },
    {
      id: 'tech-pillar',
      title: 'Comprehensive Technical Pillar Guide',
      category: 'Blogging',
      description: 'Deep-dive 1,500+ word authority article with architectural frameworks, real-world examples, and code explanations.',
      targetTool: '/article',
      presetPayload: {
        topic: 'Building Scalable Next-Gen Microservices in 2026',
        articleType: 'Comprehensive Guide',
        tone: 'Technical & Precise',
        targetAudience: 'Software Developers & Engineers',
        desiredLength: 'Long',
      },
    },
    {
      id: 'seo-cluster',
      title: 'High-Intent SEO Topic Cluster',
      category: 'SEO',
      description: 'Keyword-optimized article targeting informational search queries with SERP snippet preview and FAQ schema.',
      targetTool: '/seo-studio',
      presetPayload: {
        topic: 'Cloud Latency Optimization Strategies',
      },
    },
    {
      id: 'linkedin-thought-leadership',
      title: 'LinkedIn Authority Blitz',
      category: 'Social Media',
      description: 'High-converting contrarian hooks, story-driven post structure, and engagement prompts for B2B founders.',
      targetTool: '/social-pack',
      presetPayload: {
        topic: 'Why Traditional Content Creation Is Dead',
        targetAudience: 'Founders & CMOs',
        tone: 'Bold & Disruptive',
      },
    },
    {
      id: 'case-study',
      title: 'Executive Case Study Blueprint',
      category: 'Business',
      description: 'Structured customer success story outlining problem, methodology, quantifiable metrics, and business outcome.',
      targetTool: '/article',
      presetPayload: {
        topic: 'How Acme Scaled Campaign Velocity by 340% with AI Studios',
        articleType: 'Deep-Dive Case Study',
        tone: 'Professional',
        targetAudience: 'Founders & Executives',
      },
    },
    {
      id: 'x-thread',
      title: 'Viral 5-Tweet Masterclass Thread',
      category: 'Social Media',
      description: 'Scannable educational Twitter/X thread designed for maximum retweets and bookmark conversions.',
      targetTool: '/social-pack',
      presetPayload: {
        topic: '5 Unspoken Rules of Modern Web Design',
        targetAudience: 'Designers & Developers',
        tone: 'Engaging & Catchy',
      },
    },
  ];

  const filtered = selectedCategory === 'All' ? templates : templates.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (tmpl) => {
    navigate(tmpl.targetTool, { state: tmpl.presetPayload });
  };

  return (
    <ToolLayout
      title="Production Templates"
      subtitle="Pre-configured creative recipes and strategic blueprints to jumpstart articles, briefs, and social campaigns."
      icon={LayoutTemplate}
    >
      <div className="space-y-6">
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap text-xs ${
                selectedCategory === c
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tmpl) => (
            <GlassCard
              key={tmpl.id}
              className="p-5 flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    {tmpl.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-indigo-600 transition-colors">
                  {tmpl.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUseTemplate(tmpl)}
                className="w-full text-xs shadow-xs"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};
