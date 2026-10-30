import React, { useEffect, useState } from 'react';
import { commentsApi } from '../../api/comments';
import { Comment } from '../../types/comment';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';

interface CommentSectionProps {
  postId: string;
  initialCount?: number;
  onCommentAdded?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const res = await commentsApi.getComments(postId, 1, 10);
        const fetched = res.data?.comments || [];
        setComments(fetched);
        setHasMore(fetched.length >= 10);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const res = await commentsApi.getComments(postId, nextPage, 10);
      const fetched = res.data?.comments || [];
      setComments((prev) => [...prev, ...fetched]);
      setPage(nextPage);
      setHasMore(fetched.length >= 10);
    } catch (err) {
      console.error('Failed to load more comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async (content: string, imageFile?: File) => {
    const res = await commentsApi.createComment(postId, content, imageFile);
    if (res.data?.comment) {
      setComments((prev) => [res.data.comment, ...prev]);
      if (onCommentAdded) onCommentAdded();
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
  };

  return (
    <div className="pt-4 border-t border-slate-100/90 space-y-4">
      {/* Comment Input Composer */}
      <CommentComposer onSubmit={handleCreateComment} />

      {/* Comments List */}
      <div className="space-y-3.5 pt-1">
        {isLoading && comments.length === 0 ? (
          <div className="space-y-2 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="flex-1 h-12 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-3">
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id || comment.id}
              comment={comment}
              postId={postId}
              onDeleted={handleCommentDeleted}
            />
          ))
        )}

        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-1.5 text-xs font-semibold text-[#1877F2] hover:bg-blue-50/70 rounded-xl transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load older comments'}
          </button>
        )}
      </div>
    </div>
  );
};

