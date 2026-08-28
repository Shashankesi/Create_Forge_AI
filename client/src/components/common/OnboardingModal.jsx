import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Check, X, Shield, Palette, Folder } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProject } from '../../context/ProjectContext';
import { brandService } from '../../services/brandService';

export const OnboardingModal = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { createQuickProject } = useProject();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Onboarding Form States
  const [creationType, setCreationType] = useState('Comprehensive Articles & Social');
  const [targetAudience, setTargetAudience] = useState('Creators & Professionals');
  const [brandVoice, setBrandVoice] = useState('Visionary & Authoritative');
  const [projectName, setProjectName] = useState('My First Campaign');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Show only once for user if not previously completed
    const completed = localStorage.getItem(`cf_onboarding_done_${user?.email || 'guest'}`);
    if (!completed && user) {
      setIsOpen(true);
    }
  }, [user]);

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      // 1. Create Default Project
      if (projectName.trim()) {
        await createQuickProject(projectName.trim(), 'Marketing');
      }

      // 2. Save Initial Brand Kit
      await brandService.updateBrandKit({
        brandName: projectName.trim() || 'My Brand',
        toneOfVoice: brandVoice,
        targetAudience,
      });

      localStorage.setItem(`cf_onboarding_done_${user?.email || 'guest'}`, 'true');
      setIsOpen(false);
      showToast('Workspace & Brand Kit configured! Welcome to CreateForge AI Studio.', 'success');
    } catch (err) {
      console.warn('Onboarding setup notice:', err);
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`cf_onboarding_done_${user?.email || 'guest'}`, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs font-['Outfit']">
              {step}/3
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace Setup
            </span>
          </div>

          <button onClick={handleSkip} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            Skip Setup
          </button>
        </div>

        {/* Step 1: Creator Goals */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              What do you plan to create most?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                'Articles & Editorial Guides',
                'FLUX Visuals & Ad Creative',
                'Social Media Campaigns',
                'Multi-Channel Product Launches',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCreationType(type)}
                  className={`p-3.5 rounded-2xl text-left font-semibold border transition-all ${
                    creationType === type
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <Button onClick={() => setStep(2)} className="w-full mt-4">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Target Audience & Brand Voice */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Define your audience & brand voice
            </h3>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Primary Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Founders, Engineers, Marketers..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Brand Tone of Voice
              </label>
              <select
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option>Visionary & Authoritative</option>
                <option>Conversational & Friendly</option>
                <option>Technical & Precise</option>
                <option>Bold & Disruptive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: First Project Setup */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Create your initial Project Workspace
            </h3>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Q3 Growth Initiative"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              onClick={handleFinishOnboarding}
              loading={saving}
              className="w-full shadow-lg shadow-indigo-500/20 mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Launch Studio Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
