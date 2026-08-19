import React, { useState, useRef } from 'react';
import {
  Layers,
  Upload,
  Download,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ToolLayout } from '../components/common/ToolLayout';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/aiService';

const MIN_GENERATION_DISPLAY_TIME = 600;

export const BackgroundRemoverPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const loadSample = () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <rect width="500" height="500" fill="#3b82f6"/>
      <circle cx="250" cy="220" r="110" fill="#f59e0b"/>
      <rect x="180" y="330" width="140" height="170" rx="30" fill="#10b981"/>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
    setPreviewUrl(dataUrl);
    setSelectedFile({ name: 'sample_portrait.png', size: 34000, type: 'image/png' });
    setResult(null);
    setError('');
  };

  const handleProcess = async (e) => {
    if (e) e.preventDefault();
    if (!previewUrl) {
      setError('Please upload an image first.');
      return;
    }

    setLoading(true);
    setError('');
    const startTime = Date.now();

    try {
      let payload;
      if (selectedFile instanceof File) {
        payload = new FormData();
        payload.append('image', selectedFile);
      } else {
        payload = {
          image: previewUrl,
          mimeType: 'image/png',
        };
      }

      const res = await aiService.removeBackground(payload);

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_GENERATION_DISPLAY_TIME) {
        await new Promise((r) => setTimeout(r, MIN_GENERATION_DISPLAY_TIME - elapsed));
      }

      if (res.success && res.data) {
        setResult(res.data);
        showToast(t('toastCutoutSuccess'), 'success');
      }
    } catch (err) {
      setError(err?.customMessage || err?.message || t('toastErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.processedImageUrl) return;
    const a = document.createElement('a');
    a.href = result.processedImageUrl;
    a.download = `createforge-cutout-${Date.now()}.png`;
    a.click();
    showToast('Cutout PNG downloaded.', 'info');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const leftPane = (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={loading}
        />

        {previewUrl ? (
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {selectedFile?.name || 'Selected Image'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-1.5"
                >
                  Replace
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="text-slate-400 hover:text-red-500 p-1"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-36 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src={previewUrl}
                alt="Source preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50 dark:bg-slate-900/30"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t('uploadPrompt')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('uploadFormatHint')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Need a test image?</span>
        <button
          type="button"
          onClick={loadSample}
          disabled={loading}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Load Demo Sample
        </button>
      </div>

      <Button
        onClick={handleProcess}
        disabled={loading || !previewUrl}
        loading={loading}
        className="w-full shadow-sm"
        icon={Sparkles}
      >
        {loading ? '✦ Removing background…' : t('removeBgBtn')}
      </Button>
    </div>
  );

  const rightPane = (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      {result || previewUrl ? (
        <div className="space-y-4 flex-1 flex flex-col animate-in fade-in duration-300">
          {/* Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs select-none">
              <button
                type="button"
                onClick={() => setShowOriginal(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  !showOriginal
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500'
                }`}
              >
                Transparent Cutout
              </button>
              <button
                type="button"
                onClick={() => setShowOriginal(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  showOriginal
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500'
                }`}
              >
                Original Photo
              </button>
            </div>

            <div className="flex items-center gap-2">
              {result && (
                <Button
                  size="sm"
                  icon={Download}
                  onClick={handleDownload}
                >
                  {t('downloadCutoutBtn')}
                </Button>
              )}
            </div>
          </div>

          {/* Transparent Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 rounded-xl bg-checkered border border-slate-200 dark:border-slate-800 min-h-[380px] overflow-hidden shadow-inner">
            <img
              src={
                showOriginal
                  ? previewUrl
                  : result
                  ? result.processedImageUrl
                  : previewUrl
              }
              alt="Cutout result"
              className="max-h-[380px] w-auto max-w-full object-contain drop-shadow-md transition-all duration-300"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Layers}
            title={t('bgEmptyTitle')}
            description={t('bgEmptyDesc')}
          />
        </div>
      )}
    </div>
  );

  return (
    <ToolLayout
      title={t('bgRemoverTitle')}
      subtitle={t('bgRemoverSubtitle')}
      icon={Layers}
      leftPane={leftPane}
      rightPane={rightPane}
      isLoading={loading}
      loaderType="background"
      loadingTitle="✦ CreateForge is creating"
      loadingMessages={[
        'Reading source image structure',
        'Detecting primary subject contours',
        'Generating alpha transparency mask',
        'Exporting clean PNG cutout',
      ]}
      error={error}
      onClearError={() => setError('')}
      onRetry={() => handleProcess()}
    />
  );
};
