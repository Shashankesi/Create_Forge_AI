import React, { useState } from 'react';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User as UserIcon, Calendar, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user, changePassword, logout } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(newPassword);

  const getStrengthLabel = (s) => {
    if (s <= 25) return { label: 'Weak', color: 'bg-red-500 text-red-500' };
    if (s <= 50) return { label: 'Fair', color: 'bg-amber-500 text-amber-500' };
    if (s <= 75) return { label: 'Good', color: 'bg-indigo-500 text-indigo-500' };
    return { label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (newPassword.length < 6) {
      setPwdError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast(t('toastPasswordUpdated'), 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdError(err.customMessage || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
          {t('profileTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('profileSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="app-card p-6 text-center space-y-4 shadow-xs">
          <Avatar name={user?.name || 'User'} size="xl" className="mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              {user?.name || 'User'}
            </h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              {t('navLogout')}
            </Button>
          </div>
        </div>

        {/* Details & Password Update */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="app-card p-6 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] border-b border-slate-100 dark:border-slate-800 pb-2">
              {t('accountInfo')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">
                  {t('fullName')}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">
                  {t('emailAddress')}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {user?.email || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">
                  Member Since
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">
                  Account Status
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Active
                </span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="app-card p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                {t('changePasswordTitle')}
              </h4>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Encrypted
              </span>
            </div>

            {pwdError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('currentPassword')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('newPassword')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNew ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  required
                />
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthLabel(strength).color.split(' ')[0]}`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Strength: {getStrengthLabel(strength).label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('confirmNewPassword')}
                </label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  loading={loading}
                >
                  {t('updatePasswordBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
