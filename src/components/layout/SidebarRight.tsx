import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Users } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/auth';
import { FloatingCard } from '../common/FloatingCard';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const SidebarRight: React.FC = () => {
  const { user: currentUser, isFollowing, toggleFollow } = useAuth();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await authApi.getSuggestions(1, 6);
        const users = res.data?.users || [];
        // Filter out current user from suggestions if present
        const currentUserId = currentUser?._id || currentUser?.id;
        const filtered = users.filter(
          (u) => (u._id || u.id) !== currentUserId
        );
        setSuggestions(filtered);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [currentUser]);

  const handleToggleFollow = async (userId: string) => {
    setLoadingMap((prev) => ({ ...prev, [userId]: true }));
    try {
      await toggleFollow(userId);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <aside className="w-full space-y-5">
      {/* Suggestions Pod */}
      <FloatingCard className="p-4">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#1877F2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Suggested For You
            </h3>
          </div>
          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
            Live
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No suggestions right now
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestedUser) => {
              const userId = suggestedUser._id || suggestedUser.id || '';
              const followed = isFollowing(suggestedUser);
              const isFollowLoading = loadingMap[userId];

              return (
                <div
                  key={userId}
                  className="flex items-center justify-between gap-2.5 p-1 rounded-xl hover:bg-slate-50/70 transition-colors"
                >
                  <Link
                    to={`/users/${userId}`}
                    className="flex items-center gap-2.5 min-w-0"
                  >
                    <Avatar user={suggestedUser} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate hover:text-[#1877F2]">
                        {suggestedUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        @{suggestedUser.username}
                      </p>
                    </div>
                  </Link>

                  <Button
                    size="sm"
                    variant={followed ? 'secondary' : 'primary'}
                    isLoading={isFollowLoading}
                    onClick={() => handleToggleFollow(userId)}
                    className="!px-2.5 !py-1 !text-[11px]"
                  >
                    {followed ? (
                      <>
                        <UserCheck size={12} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </FloatingCard>
    </aside>
  );
};
