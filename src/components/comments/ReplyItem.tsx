import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import type { Reply } from '../../types/comment';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';
import { isCommentLikedByUser, getCommentLikesCount } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { commentsApi } from '../../api/comments';

interface ReplyItemProps {
  reply: Reply;
  postId: string;
  commentId: string;
  onDeleted?: (replyId: string) => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  postId,
  commentId,
  onDeleted,
}) => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const replyId = reply._id || reply.id || '';
  const isOwner = !!(
    currentUserId &&
    (currentUserId === reply.replyCreator?._id ||
      currentUserId === reply.replyCreator?.id ||
      currentUserId === (reply as any).user?._id ||
      currentUserId === (reply as any).user?.id)
  );

  const [isLiked, setIsLiked] = useState(() =>
    isCommentLikedByUser(reply, currentUserId)
  );
  const [likesCount, setLikesCount] = useState(() =>
    getCommentLikesCount(reply)
  );
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    setIsLiked(isCommentLikedByUser(reply, currentUserId));
    setLikesCount(getCommentLikesCount(reply));
  }, [reply, currentUserId]);

  const handleToggleLike = async () => {
    if (isLikeLoading || !commentId) return;
    setIsLikeLoading(true);

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = (await commentsApi.toggleCommentLike(
        postId,
        commentId
      )) as any;

      if (res?.message) {
        const msg = String(res.message).toLowerCase();
        if (msg.includes('unlike') || msg.includes('removed')) {
          setIsLiked(false);
        } else if (msg.includes('like') || msg.includes('added')) {
          setIsLiked(true);
        }
      }
      if (res?.data?.likesCount !== undefined) {
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle reply like:', err);
      // Revert if error
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await commentsApi.deleteComment(postId, commentId);
      if (onDeleted) onDeleted(replyId);
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  return (
    <div className="flex items-start gap-2 text-xs group">
      <Avatar user={reply.replyCreator} size="xs" />
      <div className="flex-1 bg-white/70 border border-slate-100 rounded-xl p-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-800 text-[11px]">
            {reply.replyCreator?.name}
          </span>
          <span className="text-[10px] text-slate-400">
            {formatRelativeTime(reply.createdAt)}
          </span>
        </div>

        <p className="text-slate-700 mt-1 leading-relaxed text-xs">
          {reply.content}
        </p>

        {reply.image && (
          <img
            src={reply.image}
            alt="Reply attachment"
            className="mt-2 rounded-lg max-h-32 object-cover border border-slate-100"
          />
        )}

        <div className="flex items-center gap-3 mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
          <button
            onClick={handleToggleLike}
            disabled={isLikeLoading}
            className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              isLiked ? 'text-rose-500' : 'hover:text-rose-500'
            }`}
          >
            <Heart size={11} className={isLiked ? 'fill-rose-500' : ''} />
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Delete Reply"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
