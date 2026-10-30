import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Layers, Users } from 'lucide-react';
import { postsApi } from '../api/posts';
import { FeedFilter, Post } from '../types/post';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(async (selectedFilter: FeedFilter, pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      let res;
      if (selectedFilter === 'all') {
        res = await postsApi.getAllPosts(pageNum, 10);
      } else {
        res = await postsApi.getFeed(selectedFilter, pageNum, 10);
      }

      const fetched = res.data?.posts || [];
      if (append) {
        setPosts((prev) => [...prev, ...fetched]);
      } else {
        setPosts(fetched);
      }
      setHasMore(fetched.length >= 10);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(filter, 1, false);
  }, [filter, fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
  };

  const handlePostUpdated = (updatedPost: Post) => {
    const targetId = updatedPost._id || updatedPost.id;
    setPosts((prev) =>
      prev.map((p) => ((p._id || p.id) === targetId ? updatedPost : p))
    );
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(filter, nextPage, true);
  };

  // Mock Stories Reel to fulfill user specification
  const stories = [
    { id: '1', name: 'You', isMe: true, user: user },
    { id: '2', name: 'Sara', initials: 'SA', color: 'from-blue-400 to-indigo-500' },
    { id: '3', name: 'Karim', initials: 'KR', color: 'from-sky-400 to-blue-600' },
    { id: '4', name: 'Nour', initials: 'NR', color: 'from-cyan-400 to-blue-500' },
    { id: '5', name: 'Omar', initials: 'OM', color: 'from-indigo-400 to-blue-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Stories Reel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#1877F2] via-sky-400 to-[#0D6EFD] shadow-[0_8px_20px_-6px_rgba(27,116,228,0.25)] group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-[14px] bg-white p-0.5 overflow-hidden flex items-center justify-center">
                {story.isMe ? (
                  <Avatar user={user} size="md" />
                ) : (
                  <div
                    className={`w-full h-full rounded-[12px] bg-gradient-to-tr ${story.color} flex items-center justify-center text-white font-bold text-xs`}
                  >
                    {story.initials}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[64px]">
              {story.name}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Capsule Category Filter Tabs */}
      <div className="floating-pill p-1.5 flex items-center justify-between gap-1 shadow-sm">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            filter === 'all'
              ? 'bg-[#1877F2] text-white shadow-[0_4px_16px_rgba(24,119,242,0.35)]'
              : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/60'
          }`}
        >
          <Sparkles size={14} />
          <span>For You</span>
        </button>

        <button
          onClick={() => setFilter('following')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            filter === 'following'
              ? 'bg-[#1877F2] text-white shadow-[0_4px_16px_rgba(24,119,242,0.35)]'
              : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/60'
          }`}
        >
          <Layers size={14} />
          <span>Following</span>
        </button>

        <button
          onClick={() => setFilter('me')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            filter === 'me'
              ? 'bg-[#1877F2] text-white shadow-[0_4px_16px_rgba(24,119,242,0.35)]'
              : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/60'
          }`}
        >
          <span>My Posts</span>
        </button>
      </div>

      {/* Weightless Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Posts Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="floating-card p-5 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-4/5" />
                </div>
                <div className="h-48 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="floating-card p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center mx-auto shadow-inner">
              {filter === 'following' ? <Users size={28} /> : <Sparkles size={28} />}
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-[#0F172A]">
                {filter === 'following'
                  ? 'No posts from people you follow'
                  : filter === 'me'
                  ? "You haven't posted anything yet"
                  : 'No posts in this feed yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {filter === 'following'
                  ? "You're not following anyone with recent posts, or they haven't shared anything yet. Discover creators in Suggested For You or browse the community!"
                  : filter === 'me'
                  ? 'Share your thoughts, projects, or questions with the Orbit community using the post composer above!'
                  : 'Be the first to share your thoughts, projects, or questions with the Orbit community!'}
              </p>
            </div>
            {filter === 'following' && (
              <button
                onClick={() => setFilter('all')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-md hover:bg-[#0D6EFD] transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Explore For You Feed</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}

            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={isRefreshing}
                  className="floating-pill px-6 py-2.5 text-xs font-bold text-[#1877F2] hover:bg-blue-50 flex items-center justify-center gap-2 mx-auto shadow-sm"
                >
                  <RefreshCw
                    size={14}
                    className={isRefreshing ? 'animate-spin' : ''}
                  />
                  <span>{isRefreshing ? 'Loading posts...' : 'Load more posts'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

