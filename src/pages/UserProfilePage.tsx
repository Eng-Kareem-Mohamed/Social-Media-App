import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus, UserCheck, ArrowLeft, Calendar, Mail, Shield, User as UserIcon } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/auth';
import { Post } from '../types/post';
import { PostCard } from '../components/posts/PostCard';
import { Avatar } from '../components/common/Avatar';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isFollowing: checkIsFollowing, toggleFollow } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const currentUserId = currentUser?._id || currentUser?.id;
  const isMe = !!(currentUserId && userId && currentUserId === userId);
  const isFollowing = profileUser ? checkIsFollowing(profileUser) : false;

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const [userRes, postsRes] = await Promise.all([
          authApi.getUserProfile(userId),
          authApi.getUserPosts(userId).catch(() => ({ success: true, data: { posts: [] } })),
        ]);
        const u = userRes.data?.user;
        setProfileUser(u);
        const fCount =
          typeof u?.followersCount === 'number'
            ? u.followersCount
            : Array.isArray(u?.followers)
            ? u.followers.length
            : 0;
        const flwCount =
          typeof u?.followingCount === 'number'
            ? u.followingCount
            : Array.isArray(u?.following)
            ? u.following.length
            : 0;
        setFollowersCount(fCount);
        setFollowingCount(flwCount);
        setPosts(postsRes.data?.posts || []);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!userId || isMe || isFollowLoading) return;
    setIsFollowLoading(true);
    const wasFollowing = isFollowing;
    // Optimistic followers count change
    setFollowersCount((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

    try {
      await toggleFollow(userId);
    } catch {
      // Revert count if failed
      setFollowersCount((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  const handlePostUpdated = (updated: Post) => {
    const id = updated._id || updated.id;
    setPosts((prev) => prev.map((p) => ((p._id || p.id) === id ? updated : p)));
  };

  if (isLoading) {
    return (
      <div className="floating-card p-12 text-center text-slate-400 text-xs animate-pulse">
        Loading user profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="floating-card p-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">User not found</p>
        <Link to="/" className="inline-block text-xs text-[#1877F2] font-semibold">
          Return to Home Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1877F2] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Detached Panoramic Cover Photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(27,116,228,0.18)] border border-white/80 h-44 sm:h-56 bg-gradient-to-r from-blue-700 via-[#1877F2] to-sky-400">
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 via-transparent to-white/10" />
      </div>

      {/* Profile Info Card */}
      <FloatingCard className="p-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-left">
          <div className="relative -mt-12 sm:-mt-16">
            <Avatar
              user={profileUser}
              size="xl"
              showOrbitalRing={true}
              showOrbitingBadge={true}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            {/* Live Stats */}
            <div className="px-3.5 py-1.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-center min-w-[62px]">
              <span className="block font-black text-xs sm:text-sm text-[#1877F2]">
                {posts.length}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Posts
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center min-w-[62px]">
              <span className="block font-black text-xs sm:text-sm text-slate-800">
                {followersCount}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Followers
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center min-w-[62px]">
              <span className="block font-black text-xs sm:text-sm text-slate-800">
                {followingCount}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Following
              </span>
            </div>

            {/* Follow / Edit Button */}
            {isMe ? (
              <Link to="/profile">
                <Button variant="outline" size="md" className="!rounded-2xl !px-4">
                  <UserIcon size={15} />
                  <span>Your Profile</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                size="md"
                isLoading={isFollowLoading}
                onClick={handleToggleFollow}
                className="!rounded-2xl !px-5"
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Follow User</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">
              {profileUser.name}
            </h1>
            <Shield size={18} className="text-[#1877F2]" />
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            @{profileUser.username}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-[#1877F2]" />
              {profileUser.email}
            </span>
            {profileUser.dateOfBirth && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Joined Route Academy
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[11px] uppercase">
              {profileUser.gender || 'Student'}
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* User's Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 px-1">
          Posts by {profileUser.name.split(' ')[0]} ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="floating-card p-10 text-center text-slate-400 text-xs">
            This user hasn't posted anything yet.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};

