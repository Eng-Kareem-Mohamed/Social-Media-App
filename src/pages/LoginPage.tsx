import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/helpers';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email/username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('ahmedbahnasy@gmail.com');
    setPassword('Bahnasy@123');
    setError(null);
  };

  return (
    <div className="bg-atmospheric min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      {/* Background Aura Glow Elements */}
      <div className="fixed top-12 left-1/3 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-12 right-1/3 w-[500px] h-[500px] bg-sky-300/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-[#0D6EFD] flex items-center justify-center text-white mx-auto shadow-[0_8px_25px_rgba(24,119,242,0.45)]">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Welcome to RoutePosts
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to explore the community feed and connect with peers
          </p>
        </div>

        {/* Floating Card Login Box */}
        <FloatingCard className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com or username"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-medium p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full !rounded-xl !py-2.5 font-bold shadow-md"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </Button>

            {/* Quick Demo Fill button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="w-full py-2 px-3 text-[11px] font-semibold text-[#1877F2] bg-blue-50/70 hover:bg-blue-100/70 rounded-xl transition-colors border border-blue-100 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Quick Fill Route Demo Account</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-[#1877F2] hover:underline inline-flex items-center gap-1"
              >
                <span>Create Account</span>
                <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
};

