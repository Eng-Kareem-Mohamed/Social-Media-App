import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Bell,
  Bookmark,
  User as UserIcon,
  LogOut,
  Settings,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';

export const FloatingNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 max-w-7xl mx-auto mb-6">
      <nav className="floating-pill px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1877F2] to-[#0D6EFD] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(24,119,242,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#1877F2] to-[#0D6EFD] bg-clip-text text-transparent">
              RoutePosts
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search posts, mentors, students..."
              className="w-full pl-10 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/60 focus:border-blue-400/80 rounded-full outline-none transition-all duration-200 shadow-inner"
            />
          </div>
        </div>

        {/* Center / Right Navigation Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Feed */}
          <Link
            to="/"
            title="Feed"
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isActive('/')
                ? 'bg-blue-50 text-[#1877F2] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/70'
            }`}
          >
            <Home size={20} />
          </Link>

          {/* Bookmarks */}
          <Link
            to="/bookmarks"
            title="Saved Bookmarks"
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isActive('/bookmarks')
                ? 'bg-blue-50 text-[#1877F2] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/70'
            }`}
          >
            <Bookmark size={20} />
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            title="Notifications"
            className={`relative p-2.5 rounded-full transition-all duration-200 ${
              isActive('/notifications')
                ? 'bg-blue-50 text-[#1877F2] shadow-sm font-semibold'
                : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/70'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#1877F2] rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Capsule / Dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition-all duration-200"
            >
              <Avatar user={user} size="sm" showOrbitalRing={false} />
              <span className="hidden sm:inline-block text-xs font-semibold text-[#0F172A] max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || user?.username || 'Account'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_20px_45px_-10px_rgba(27,116,228,0.2)] py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    @{user?.username}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50/70 hover:text-[#1877F2] transition-colors"
                >
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50/70 hover:text-[#1877F2] transition-colors"
                >
                  <Settings size={16} />
                  <span>Change Password</span>
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

