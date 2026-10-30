import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { authApi } from '../api/auth';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword) {
      setError('Please fill in both current and new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await authApi.changePassword({ password, newPassword });
      setSuccessMessage('Password changed successfully! Next sign in will use your new password.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header Pod */}
      <FloatingCard className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center shadow-inner">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
            Security & Password
          </h1>
          <p className="text-xs text-slate-400">
            Rotate your password and manage account protection
          </p>
        </div>
      </FloatingCard>

      {/* Password Change Form */}
      <FloatingCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium p-2.5 rounded-xl bg-rose-50 border border-rose-100">
              {error}
            </p>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full !rounded-xl !py-2.5 font-bold"
            >
              <KeyRound size={16} />
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </FloatingCard>

      {/* Account Info Box */}
      <FloatingCard className="p-5 space-y-3 bg-gradient-to-br from-white/95 to-blue-50/50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Shield size={16} className="text-[#1877F2]" />
          <span>Account Protection</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Logged in as <strong className="text-slate-800">{user?.email}</strong>. Connected to Route Academy Posts infrastructure.
        </p>
      </FloatingCard>
    </div>
  );
};

