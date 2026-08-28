import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Heading,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FolderLock,
  History,
  Zap,
  Sliders,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { CreateForgeCore } from '../components/home/CreateForgeCore';
import { HeroProductPreview } from '../components/home/HeroProductPreview';
import { CampaignPipelineFlow } from '../components/home/CampaignPipelineFlow';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const benefits = [
    {
      title: t('benefit1Title'),
      desc: t('benefit1Desc'),
      icon: FolderLock,
    },
    {
      title: t('benefit2Title'),
      desc: t('benefit2Desc'),
      icon: Sliders,
    },
    {
      title: t('benefit3Title'),
      desc: t('benefit3Desc'),
      icon: History,
    },
    {
      title: t('benefit4Title'),
      desc: t('benefit4Desc'),
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20 overflow-hidden hero-glow-bg">
      {/* 1. Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 text-center space-y-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t('heroEyebrow')}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] leading-[1.1] max-w-4xl mx-auto">
          Turn ideas into{' '}
          <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 decoration-wavy decoration-from-font underline-offset-8">
            finished work.
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" icon={ArrowRight}>
                {t('navWorkspace')}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-sm">
                  {t('heroPrimaryBtn')}
                </Button>
              </Link>
              <a href="#tools" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('heroSecondaryBtn')}
                </Button>
              </a>
            </>
          )}
        </div>

        {/* 2. 3D Creation Core & Tool Orbit */}
        <div className="pt-4 pb-2">
          <CreateForgeCore />
        </div>

        {/* 3. Staged Interactive Product Preview */}
        <div className="pt-2">
          <HeroProductPreview />
        </div>

        {/* 3.5 Autonomous Campaign Flow Pipeline */}
        <div className="pt-10">
          <CampaignPipelineFlow />
        </div>
      </section>

      {/* 4. Tools Showcase Section */}
      <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('toolsHeading')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('toolsSubtitle')}
          </p>
        </div>

        {/* Asymmetrical Tool Cards Grid: 4 Flagship Experiences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {/* Tool Card: Article Generator */}
          <div className="app-card app-card-interactive p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Article Generator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Structured blog posts, how-to guides, thought leadership, live quality scores & inline AI editing.
                </p>
              </div>
            </div>
            <div className="pt-5">
              <Link
                to="/article"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Open Article Studio →</span>
              </Link>
            </div>
          </div>

          {/* Tool Card: Blog Titles */}
          <div className="app-card app-card-interactive p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/40">
                <Heading className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Blog Title Lab
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-converting headline angles, AI CTR estimates, and side-by-side A/B comparison.
                </p>
              </div>
            </div>
            <div className="pt-5">
              <Link
                to="/titles"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Open Title Lab →</span>
              </Link>
            </div>
          </div>

          {/* Tool Card: Image Generator */}
          <div className="app-card app-card-interactive p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Image Generator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pollinations FLUX image generation, cinematic styles, custom aspect ratios, and auto-refinement.
                </p>
              </div>
            </div>
            <div className="pt-5">
              <Link
                to="/image"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Create Visuals →</span>
              </Link>
            </div>
          </div>

          {/* Tool Card: Social Content */}
          <div className="app-card app-card-interactive p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-200/60 dark:border-pink-800/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Social Content Pack
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Platform-tailored LinkedIn posts, X threads, Instagram carousels, and YouTube video scripts.
                </p>
              </div>
            </div>
            <div className="pt-5">
              <Link
                to="/social-pack"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Generate Social →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section: IDEA -> CREATE -> IMPROVE -> PUBLISH */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            How It Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A seamless four-step creative pipeline from initial concept to published asset.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="app-card p-6 space-y-2.5 relative overflow-hidden">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              01 IDEA
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Input Concept
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Start with a prompt, rough idea, or active project context in the universal creation box.
            </p>
          </div>

          <div className="app-card p-6 space-y-2.5 relative overflow-hidden">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
              02 CREATE
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Generate Assets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Synthesize structured articles, FLUX visuals, high-CTR titles, and social packs instantly.
            </p>
          </div>

          <div className="app-card p-6 space-y-2.5 relative overflow-hidden">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
              03 IMPROVE
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Score & Refine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Audit quality, SEO, and brand consistency. Use inline AI editing to polish weakest areas.
            </p>
          </div>

          <div className="app-card p-6 space-y-2.5 relative overflow-hidden">
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-mono">
              04 PUBLISH
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Export & Organize
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Save to project, export in Markdown / TXT / HTML, or copy directly for instant publishing.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Product Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('benefitsHeading')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('benefitsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="app-card p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Alternating Feature Showcase Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Feature 1: Writing & Ideation */}
        <div className="app-card p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-[#0e1422] dark:to-[#090e18]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t('feature1Eyebrow')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                {t('feature1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('feature1Desc')}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{t('feature1Bullet1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{t('feature1Bullet2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{t('feature1Bullet3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{t('feature1Bullet4')}</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 text-left text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Article Reader Preview</span>
                <span className="text-[10px] text-slate-400">Markdown Active</span>
              </div>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-full" />
                <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-5/6" />
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  // Structured code patterns and formatting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Visual Creation */}
        <div className="app-card p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-[#0e1422] dark:to-[#090e18]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-center">
              <div className="h-32 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Contextual Style Synthesis
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">Realistic</div>
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">Cinematic</div>
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">Anime</div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {t('feature2Eyebrow')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                {t('feature2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('feature2Desc')}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{t('feature2Bullet1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{t('feature2Bullet2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{t('feature2Bullet3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{t('feature2Bullet4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Focused CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="app-card p-8 sm:p-12 rounded-2xl space-y-5 bg-gradient-to-b from-white to-slate-50 dark:from-[#0e1422] dark:to-[#080c14] border border-slate-200 dark:border-slate-800 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {t('ctaHeading')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t('ctaSubtitle')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="md" icon={ArrowRight}>
                {isAuthenticated ? t('navWorkspace') : t('ctaPrimaryBtn')}
              </Button>
            </Link>
            <a href="#tools">
              <Button variant="outline" size="md">
                {t('ctaSecondaryBtn')}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
