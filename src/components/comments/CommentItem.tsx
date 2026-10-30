import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comment, Reply } from '../../types/comment';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';
import { isCommentLikedByUser, getCommentLikesCount } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { commentsApi } from '../../api/comments';
import { ReplyItem } from './ReplyItem';
import { CommentComposer } from './CommentComposer';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onDeleted?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onDeleted,
}) => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const commentId = comment._id || comment.id || '';

  // Extract actual post ID from prop or from comment.post object/string
  const actualPostId =
    postId ||
    (typeof comment.post === 'string'
      ? comment.post
      : (comment.post as any)?._id || (comment.post as any)?.id) ||
    '';

  const isOwner = !!(
    currentUserId &&
    (currentUserId === comment.commentCreator?._id ||
      currentUserId === comment.commentCreator?.id ||
      currentUserId === (comment as any).user?._id ||
      currentUserId === (comment as any).user?.id)
  );

  const [isLiked, setIsLiked] = useState(() =>
    isCommentLikedByUser(comment, currentUserId)
  );
  const [likesCount, setLikesCount] = useState(() =>
    getCommentLikesCount(comment)
  );
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>(comment.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  useEffect(() => {
    setIsLiked(isCommentLikedByUser(comment, currentUserId));
    setLikesCount(getCommentLikesCount(comment));
  }, [comment, currentUserId]);

  const handleToggleLike = async () => {
    if (isLikeLoading || !commentId) return;
    setIsLikeLoading(true);

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = (await commentsApi.toggleCommentLike(
        actualPostId,
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
      console.error('Failed to toggle comment like:', err);
      // Revert if error
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.deleteComment(actualPostId, commentId);
      if (onDeleted) onDeleted(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleToggleReplies = async () => {
    const nextState = !showReplies;
    setShowReplies(nextState);
    if (nextState && replies.length === 0) {
      setIsLoadingReplies(true);
      try {
        const res = await commentsApi.getReplies(actualPostId, commentId);
        setReplies(res.data?.replies || []);
      } catch (err) {
        console.error('Failed to load replies:', err);
      } finally {
        setIsLoadingReplies(false);
      }
    }
  };

  const handleAddReply = async (content: string, imageFile?: File) => {
    const res = await commentsApi.createReply(
      actualPostId,
      commentId,
      content,
      imageFile
    );
    if (res.data?.reply) {
      setReplies((prev) => [res.data.reply, ...prev]);
      setShowReplies(true);
      setShowReplyBox(false);
    }
  };

  const handleReplyDeleted = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => (r._id || r.id) !== replyId));
  };

  return (
    <div className="flex items-start gap-2.5 text-xs group">
      <Avatar user={comment.commentCreator} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-100/70 hover:bg-slate-100/90 rounded-2xl p-3 border border-slate-200/50 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-800 text-xs truncate">
              {comment.commentCreator?.name}
            </span>
            <span className="text-[10px] text-slate-400 shrink-0">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <p className="text-slate-700 mt-1.5 leading-relaxed text-xs">
            {comment.content}
          </p>

          {comment.image && (
            <img
              src={comment.image}
              alt="Comment attachment"
              className="mt-2 rounded-xl max-h-48 object-cover border border-slate-100"
            />
          )}
        </div>

        {/* Comment Action Links */}
        <div className="flex items-center gap-4 mt-1.5 px-2 text-[11px] text-slate-500 font-medium">
          <button
            onClick={handleToggleLike}
            disabled={isLikeLoading}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
            }`}
          >
            <Heart size={12} className={isLiked ? 'fill-rose-500' : ''} />
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>

          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="flex items-center gap-1 hover:text-[#1877F2] transition-colors cursor-pointer"
          >
            <MessageSquare size={12} />
            <span>Reply</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Delete comment"
            >
              <Trash2 size={12} />
            </button>
          )}

          {comment.repliesCount || replies.length > 0 ? (
            <button
              onClick={handleToggleReplies}
              className="ml-auto text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-semibold cursor-pointer"
            >
              <span>
                {showReplies
                  ? 'Hide replies'
                  : `View replies (${comment.repliesCount || replies.length})`}
              </span>
              {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          ) : null}
        </div>

        {/* Reply Composer box */}
        {showReplyBox && (
          <div className="mt-3 ml-2 pl-3 border-l-2 border-blue-200">
            <CommentComposer
              onSubmit={handleAddReply}
              placeholder={`Replying to ${comment.commentCreator?.name?.split(' ')[0]}...`}
              autoFocus={true}
              size="sm"
            />
          </div>
        )}

        {/* Nested Replies Thread */}
        {showReplies && (
          <div className="mt-3 ml-2 pl-3 border-l-2 border-slate-200/60 space-y-2.5">
            {isLoadingReplies ? (
              <p className="text-[11px] text-slate-400 py-1">Loading replies...</p>
            ) : replies.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-1">No replies yet.</p>
            ) : (
              replies.map((reply) => (
                <ReplyItem
                  key={reply._id || reply.id}
                  reply={reply}
                  postId={actualPostId}
                  commentId={commentId}
                  onDeleted={handleReplyDeleted}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
