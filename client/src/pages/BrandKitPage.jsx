import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  Save,
  Check,
  Tag,
  Ban,
  Volume2,
  Users,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { useToast } from '../context/ToastContext';
import { brandService } from '../services/brandService';

export const BrandKitPage = () => {
  const { showToast } = useToast();

  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('Creators & Founders');
  const [toneOfVoice, setToneOfVoice] = useState('Visionary');
  const [keywordInput, setKeywordInput] = useState('');
  const [preferredKeywords, setPreferredKeywords] = useState([]);
  const [avoidInput, setAvoidInput] = useState('');
  const [wordsToAvoid, setWordsToAvoid] = useState([]);
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#A855F7');
  const [accentColor, setAccentColor] = useState('#EC4899');
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toneOptions = [
    'Visionary',
    'Professional',
    'Conversational',
    'Bold & Disruptive',
    'Empathetic',
    'Technical',
  ];

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await brandService.getBrandKit();
        if (res.success && res.data?.brandKit) {
          const kit = res.data.brandKit;
          setBrandName(kit.brandName || '');
          setTagline(kit.tagline || '');
          setDescription(kit.description || '');
          setTargetAudience(kit.targetAudience || 'Creators & Founders');
          setToneOfVoice(kit.toneOfVoice || 'Visionary');
          setPreferredKeywords(kit.preferredKeywords || []);
          setWordsToAvoid(kit.wordsToAvoid || []);
          if (kit.colors) {
            setPrimaryColor(kit.colors.primary || '#6366F1');
            setSecondaryColor(kit.colors.secondary || '#A855F7');
            setAccentColor(kit.colors.accent || '#EC4899');
          }
          setLogoUrl(kit.logoUrl || '');
        }
      } catch (err) {
        showToast('Could not load Brand Kit.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!brandName.trim()) {
      showToast('Please provide a brand name.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await brandService.updateBrandKit({
        brandName: brandName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        targetAudience,
        toneOfVoice,
        preferredKeywords,
        wordsToAvoid,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        },
        logoUrl: logoUrl.trim(),
      });

      if (res.success) {
        showToast('Brand Kit saved! AI generators will now respect your brand voice.', 'success');
      }
    } catch (err) {
      showToast('Failed to save Brand Kit.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!preferredKeywords.includes(keywordInput.trim())) {
        setPreferredKeywords([...preferredKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => {
    setPreferredKeywords(preferredKeywords.filter((k) => k !== kw));
  };

  const addAvoidWord = (e) => {
    if (e.key === 'Enter' && avoidInput.trim()) {
      e.preventDefault();
      if (!wordsToAvoid.includes(avoidInput.trim())) {
        setWordsToAvoid([...wordsToAvoid, avoidInput.trim()]);
      }
      setAvoidInput('');
    }
  };

  const removeAvoidWord = (w) => {
    setWordsToAvoid(wordsToAvoid.filter((item) => item !== w));
  };

  return (
    <ToolLayout
      title="Brand Kit"
      subtitle="Save your brand identity, tone of voice, preferred vocabulary, and color palette to guide all AI generation."
      icon={Palette}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Brand Configuration */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Core Brand Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Brand / Product Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. CreateForge, Acme Corp, Horizon..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Create. Refine. Transform."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Brand Mission & Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your company or project do? Who do you serve and what value do you deliver?"
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </GlassCard>

          {/* Voice & Vocabulary */}
          <GlassCard className="p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-500" />
              Brand Voice & Vocabulary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Primary Tone of Voice</label>
                <select
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {toneOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Target Audience Definition</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Modern developers, B2B executives..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Preferred Keywords */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Preferred Vocabulary / Keywords (Press Enter to add)
              </label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                placeholder="e.g. seamless, high-velocity, precision, next-gen..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferredKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[11px]"
                  >
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="text-slate-400 hover:text-red-500">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Words to Avoid */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-red-500" /> Words / Jargon to Avoid (Press Enter to add)
              </label>
              <input
                type="text"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={addAvoidWord}
                placeholder="e.g. synergy, cheap, impossible, revolutionized..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {wordsToAvoid.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/20 text-[11px]"
                  >
                    {w}
                    <button type="button" onClick={() => removeAvoidWord(w)} className="text-slate-400 hover:text-red-500">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Visual Palette & Save Action */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Outfit'] flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" />
              Brand Color Palette
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Primary Brand Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Secondary Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{secondaryColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Accent Highlight</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{accentColor}</span>
                </div>
              </div>
            </div>

            {/* Visual Palette Preview */}
            <div className="h-10 rounded-xl overflow-hidden flex shadow-inner">
              <div className="flex-1" style={{ backgroundColor: primaryColor }} />
              <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
              <div className="flex-1" style={{ backgroundColor: accentColor }} />
            </div>
          </GlassCard>

          {/* Save Button Card */}
          <GlassCard className="p-6 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              className="w-full shadow-lg shadow-indigo-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Brand Kit
            </Button>
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              When saved, your active Brand Kit will automatically be injected into all future article, title, and image generations.
            </p>
          </GlassCard>
        </div>
      </form>
    </ToolLayout>
  );
};
