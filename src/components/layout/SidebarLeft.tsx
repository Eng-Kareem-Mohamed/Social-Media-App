import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Bookmark,
  Bell,
  User,
  KeyRound,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FloatingCard } from '../common/FloatingCard';
import { Avatar } from '../common/Avatar';

export const SidebarLeft: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems = [
    { label: 'Home Feed', path: '/', icon: Home },
    { label: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Security & Password', path: '/settings', icon: KeyRound },
  ];

  return (
    <aside className="w-full space-y-5">
      {/* User Floating Island Card */}
      <FloatingCard className="p-5 text-center relative overflow-hidden group">
        {/* Subtle aura background behind card */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-sky-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center">
          <Avatar
            user={user}
            size="lg"
            showOrbitalRing={true}
            showOrbitingBadge={true}
          />

          <h2 className="mt-3 font-bold text-sm sm:text-base text-[#0F172A] hover:text-[#1877F2] transition-colors truncate max-w-[200px]">
            <Link to="/profile">{user?.name || 'Student'}</Link>
          </h2>
          <p className="text-xs text-slate-400 truncate max-w-[180px]">
            @{user?.username || 'user'}
          </p>

          <div className="w-full mt-4 pt-3 border-t border-slate-100/90 space-y-2 select-none">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100/80">
                <span className="block font-extrabold text-xs sm:text-sm text-[#0F172A]">
                  {typeof user?.followersCount === 'number'
                    ? user.followersCount
                    : Array.isArray(user?.followers)
                    ? user.followers.length
                    : 0}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Followers
                </span>
              </div>

              <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100/60">
                <span className="block font-extrabold text-xs sm:text-sm text-[#1877F2]">
                  {typeof user?.followingCount === 'number'
                    ? user.followingCount
                    : Array.isArray(user?.following)
                    ? user.following.length
                    : 0}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Following
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50/50 border border-slate-100/60 text-[11px] text-slate-500">
              <span className="capitalize">{user?.gender || 'Student'}</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* Floating Navigation Pod */}
      <FloatingCard className="p-2.5">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/40 text-[#1877F2] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={active ? 'text-[#1877F2]' : 'text-slate-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#1877F2] rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </FloatingCard>

      {/* Floating Community Info */}
      <div className="px-3 text-[11px] text-slate-400 space-y-1">
        <p className="flex items-center gap-1.5">
          <Compass size={13} className="text-[#1877F2]" />
          <span>Orbit Social Network</span>
        </p>
        <p>© 2026 Orbit. All rights reserved.</p>
      </div>
    </aside>
  );
};

