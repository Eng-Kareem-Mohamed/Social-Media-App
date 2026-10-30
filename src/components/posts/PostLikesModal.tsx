import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Heart } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/auth';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface PostLikesModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostLikesModal: React.FC<PostLikesModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const { user: currentUser, isFollowing, toggleFollow } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (isOpen && postId) {
      const fetchLikes = async () => {
        setIsLoading(true);
        try {
          const res = await postsApi.getPostLikes(postId);
          setUsers(res.data?.users || []);
        } catch (err) {
          console.error('Failed to load post likes:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLikes();
    }
  }, [isOpen, postId]);

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
    <Modal isOpen={isOpen} onClose={onClose} title="People Who Liked">
      <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Heart size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs">No likes yet. Be the first to like!</p>
          </div>
        ) : (
          users.map((user) => {
            const userId = user._id || user.id || '';
            const isMe = !!(currentUserId && userId && currentUserId === userId);
            const followed = isFollowing(user);
            const isFollowLoading = loadingMap[userId];

            return (
              <div
                key={userId}
                className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Link
                  to={`/users/${userId}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0"
                >
                  <Avatar user={user} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate hover:text-[#1877F2]">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                {isMe ? (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    You
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={followed ? 'secondary' : 'primary'}
                    isLoading={isFollowLoading}
                    onClick={() => handleToggleFollow(userId)}
                    className="!px-3 !py-1 !text-xs"
                  >
                    {followed ? (
                      <>
                        <UserCheck size={13} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

