import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { postsApi } from '../api/posts';
import { Post } from '../types/post';
import { PostCard } from '../components/posts/PostCard';

export const PostDetailsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await postsApi.getPost(postId);
        setPost(res.data?.post || null);
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1877F2] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="floating-card p-12 text-center text-slate-400 text-xs animate-pulse">
          Loading post details...
        </div>
      ) : !post ? (
        <div className="floating-card p-12 text-center text-slate-500 text-xs">
          Post not found or has been removed.
        </div>
      ) : (
        <PostCard
          post={post}
          onPostDeleted={() => {
            window.location.href = '/';
          }}
          onPostUpdated={(updated) => setPost(updated)}
        />
      )}
    </div>
  );
};

