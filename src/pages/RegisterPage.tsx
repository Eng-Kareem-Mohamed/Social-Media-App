import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Calendar, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/helpers';
import { RegisterPayload } from '../types/auth';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPayload>({
    name: '',
    username: '',
    email: '',
    dateOfBirth: '2001-01-01',
    gender: 'male',
    password: '',
    rePassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.rePassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-atmospheric min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      <div className="fixed top-12 left-1/3 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-12 right-1/3 w-[500px] h-[500px] bg-sky-300/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-[#0D6EFD] flex items-center justify-center text-white mx-auto shadow-[0_8px_25px_rgba(24,119,242,0.45)]">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Join RoutePosts
          </h1>
          <p className="text-xs text-slate-500">
            Create your account to start sharing and interacting with fellow developers
          </p>
        </div>

        <FloatingCard className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe2026"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Re-enter Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="rePassword"
                    value={formData.rePassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-[#0F172A]"
                  />
                </div>
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
              <UserPlus size={16} />
              <span>Create Account</span>
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1877F2] hover:underline inline-flex items-center gap-1"
              >
                <span>Sign In</span>
                <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
};

