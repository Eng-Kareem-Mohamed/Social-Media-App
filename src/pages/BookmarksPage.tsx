import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { authApi } from '../api/auth';
import type { Post } from '../types/post';
import { PostCard } from '../components/posts/PostCard';
import { FloatingCard } from '../components/common/FloatingCard';
import { extractPostsFromBookmarks } from '../utils/helpers';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      try {
        const res = await authApi.getBookmarks();
        setBookmarks(extractPostsFromBookmarks(res));
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handlePostDeleted = (postId: string) => {
    setBookmarks((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  const handlePostUpdated = (updated: Post) => {
    const id = updated._id || updated.id;
    setBookmarks((prev) => prev.map((p) => ((p._id || p.id) === id ? updated : p)));
  };

  return (
    <div className="space-y-6">
      {/* Header Pod */}
      <FloatingCard className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center shadow-inner">
            <Bookmark size={20} className="fill-[#1877F2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Saved Bookmarks
            </h1>
            <p className="text-xs text-slate-400">
              Posts you have saved for later reading
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#1877F2] bg-blue-50 px-3 py-1 rounded-full">
          {bookmarks.length} {bookmarks.length === 1 ? 'post' : 'posts'}
        </span>
      </FloatingCard>

      {/* Bookmarks Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="floating-card p-5 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="floating-card p-12 text-center text-slate-400 space-y-2">
            <Bookmark size={32} className="mx-auto text-slate-300 mb-1" />
            <h3 className="text-sm font-bold text-slate-700">No bookmarks saved yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Whenever you see an interesting post in your feed, tap the bookmark icon to save it here for quick access.
            </p>
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

