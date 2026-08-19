import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreateForgeMark } from '../components/brand/CreateForgeMark';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      showToast('Signed in successfully.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.customMessage || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full app-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-[#0e1422]">
        {/* Left Brand Identity Column */}
        <div className="md:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <CreateForgeMark size={30} variant="inverted" />
              <span className="font-extrabold tracking-tight text-white font-['Outfit'] text-lg">
                CreateForge<span className="text-indigo-200"> AI</span>
              </span>
            </Link>

            <div className="pt-4 space-y-2">
              <h3 className="text-xl font-bold font-['Outfit'] leading-snug">
                Welcome to your creative workspace.
              </h3>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Continue drafting articles, synthesizing titles, generating visuals, and isolating cutouts.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-6 border-t border-indigo-500/40 relative z-10 text-xs text-indigo-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
              <span>Article & Title Generator</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
              <span>AI Image Synthesis & Cutouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
              <span>Private history library</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {t('signInTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('signInSubtitle')}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('emailLabel')}
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('passwordLabel')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full shadow-sm"
              icon={ArrowRight}
            >
              {loading ? 'Signing in...' : t('signInBtn')}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {t('noAccountPrompt')}{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {t('signUpBtn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
