import React, { useEffect, useState, useRef } from 'react';
import { Camera, Calendar, Mail, Bookmark, Grid, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import type { Post } from '../types/post';
import { PostCard } from '../components/posts/PostCard';
import { Avatar } from '../components/common/Avatar';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';
import { extractPostsFromBookmarks } from '../utils/helpers';

export const ProfilePage: React.FC = () => {
  const { user, uploadPhoto, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userId = user?._id || user?.id;
        if (userId) {
          const [postsRes, bookmarksRes] = await Promise.all([
            authApi.getUserPosts(userId).catch(() => ({ success: true, data: { posts: [] } })),
            authApi.getBookmarks().catch(() => ({ success: true, data: { posts: [] } })),
          ]);
          setPosts(postsRes.data?.posts || []);
          setBookmarks(extractPostsFromBookmarks(bookmarksRes));
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const newUrl = await uploadPhoto(file);
      if (newUrl) {
        const uid = user?._id || user?.id;
        setPosts((prev) =>
          prev.map((p) =>
            p.user?._id === uid || p.user?.id === uid
              ? { ...p, user: { ...p.user, photo: newUrl } }
              : p
          )
        );
      }
      await refreshProfile();
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
    setBookmarks((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  const handlePostUpdated = (updated: Post) => {
    const id = updated._id || updated.id;
    setPosts((prev) => prev.map((p) => ((p._id || p.id) === id ? updated : p)));
    setBookmarks((prev) => prev.map((p) => ((p._id || p.id) === id ? updated : p)));
  };

  return (
    <div className="space-y-6">
      {/* Detached Panoramic Cover Photo with Floating Rounded Corners */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(27,116,228,0.18)] border border-white/80 h-48 sm:h-64 bg-gradient-to-r from-blue-600 via-[#1877F2] to-sky-400">
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 via-transparent to-white/10" />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck size={14} />
          <span>Route Verified Student</span>
        </div>
      </div>

      {/* Floating Island Profile Header */}
      <FloatingCard className="p-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-left">
          {/* Avatar with Orbital Levitation Ring and Status Pill */}
          <div className="relative -mt-12 sm:-mt-16">
            <Avatar
              user={user}
              size="xl"
              showOrbitalRing={true}
              showOrbitingBadge={true}
            />

            {/* Change Avatar Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              title="Change Profile Photo"
              className="absolute bottom-1 right-1 p-2 bg-[#1877F2] hover:bg-[#0D6EFD] text-white rounded-full shadow-lg border-2 border-white transition-all duration-200 cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Profile Quick Stats / Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <div className="px-3.5 py-1.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-center min-w-[58px]">
              <span className="block font-black text-xs sm:text-sm text-[#1877F2]">
                {posts.length}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Posts
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center min-w-[58px]">
              <span className="block font-black text-xs sm:text-sm text-slate-800">
                {typeof user?.followersCount === 'number'
                  ? user.followersCount
                  : Array.isArray(user?.followers)
                  ? user.followers.length
                  : 0}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Followers
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center min-w-[58px]">
              <span className="block font-black text-xs sm:text-sm text-slate-800">
                {typeof user?.followingCount === 'number'
                  ? user.followingCount
                  : Array.isArray(user?.following)
                  ? user.following.length
                  : 0}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Following
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center min-w-[58px]">
              <span className="block font-black text-xs sm:text-sm text-slate-800">
                {bookmarks.length}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                Saved
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploadingPhoto}
              className="!rounded-2xl"
            >
              <Camera size={14} />
              <span>Update Photo</span>
            </Button>
          </div>
        </div>

        {/* User Details */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {user?.name}
            </h1>
            <UserCheck size={18} className="text-[#1877F2]" />
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            @{user?.username}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Frontend Web Development Student at Route Academy. Building modern React 19 social applications.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-[#1877F2]" />
              {user?.email}
            </span>
            {user?.dateOfBirth && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Born {new Date(user.dateOfBirth).toLocaleDateString()}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[11px] uppercase">
              {user?.gender || 'Student'}
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* Floating Capsule Category Navigation Tabs */}
      <div className="floating-pill p-1.5 flex items-center justify-center max-w-sm mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'posts'
              ? 'bg-[#1877F2] text-white shadow-md'
              : 'text-slate-600 hover:text-[#1877F2]'
          }`}
        >
          <Grid size={15} />
          <span>My Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'bg-[#1877F2] text-white shadow-md'
              : 'text-slate-600 hover:text-[#1877F2]'
          }`}
        >
          <Bookmark size={15} />
          <span>Bookmarks ({bookmarks.length})</span>
        </button>
      </div>

      {/* Content Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="floating-card p-8 text-center text-slate-400 text-xs animate-pulse">
            Loading posts...
          </div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="floating-card p-10 text-center text-slate-400 text-xs">
              You haven't posted anything yet. Share your first post from the Home feed!
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
          )
        ) : bookmarks.length === 0 ? (
          <div className="floating-card p-10 text-center text-slate-400 text-xs">
            No saved bookmarks yet. Tap the bookmark icon on any post to save it here!
          </div>
        ) : (
          bookmarks.map((post) => (
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

