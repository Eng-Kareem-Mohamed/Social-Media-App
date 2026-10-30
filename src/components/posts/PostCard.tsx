import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit2,
  Trash2,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import type { Post } from '../../types/post';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../api/posts';
import { FloatingCard } from '../common/FloatingCard';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';
import { isPostLikedByUser, getPostLikesCount, isPostBookmarkedByUser } from '../../utils/helpers';
import { PostLikesModal } from './PostLikesModal';
import { SharePostModal } from './SharePostModal';
import { EditPostModal } from './EditPostModal';
import { CommentSection } from '../comments/CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onPostUpdated,
}) => {
  const { user, refreshProfile, isFollowing, toggleFollow } = useAuth();
  const postId = post._id || post.id || '';
  const postAuthorId = post.user?._id || post.user?.id;
  const currentUserId = user?._id || user?.id;
  const isAuthor = !!(currentUserId && postAuthorId && currentUserId === postAuthorId);

  const [isAuthorFollowLoading, setIsAuthorFollowLoading] = useState(false);
  const isAuthorFollowed = postAuthorId ? isFollowing(post.user || postAuthorId) : false;

  // Sync state with post props
  const [isLiked, setIsLiked] = useState(() => isPostLikedByUser(post, currentUserId));
  const [likesCount, setLikesCount] = useState(() => getPostLikesCount(post));
  const [isBookmarked, setIsBookmarked] = useState(() =>
    isPostBookmarkedByUser(post, user?.bookmarks)
  );
  const [commentsCount, setCommentsCount] = useState(
    post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0)
  );
  const [showComments, setShowComments] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Sync state whenever post or user changes
  useEffect(() => {
    setIsLiked(isPostLikedByUser(post, currentUserId));
    setLikesCount(getPostLikesCount(post));
    setIsBookmarked(isPostBookmarkedByUser(post, user?.bookmarks));
    setCommentsCount(
      post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0)
    );
  }, [post, currentUserId, user?.bookmarks]);

  // Modals
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Author Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthorFollow = async () => {
    if (!postAuthorId || isAuthor || isAuthorFollowLoading) return;
    setIsAuthorFollowLoading(true);
    try {
      await toggleFollow(postAuthorId);
    } catch (err) {
      console.error('Failed to toggle follow from post:', err);
    } finally {
      setIsAuthorFollowLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLikeLoading) return;
    setIsLikeLoading(true);

    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = (await postsApi.toggleLike(postId)) as any;

      // Handle message or returned payload from server
      if (res?.message) {
        const msg = String(res.message).toLowerCase();
        if (msg.includes('unlike') || msg.includes('removed')) {
          setIsLiked(false);
        } else if (msg.includes('like') || msg.includes('added')) {
          setIsLiked(true);
        }
      }

      if (res?.data?.post) {
        const updated = res.data.post;
        setIsLiked(isPostLikedByUser(updated, currentUserId));
        setLikesCount(getPostLikesCount(updated));
        if (onPostUpdated) onPostUpdated(updated);
      } else if (res?.data?.likesCount !== undefined) {
        setLikesCount(res.data.likesCount);
      }
    } catch {
      // Revert if API fails
      setIsLiked(!nextIsLiked);
      setLikesCount((prev) => (!nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (isBookmarkLoading || !postId) return;
    setIsBookmarkLoading(true);

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      const res = (await postsApi.toggleBookmark(postId)) as any;
      if (res?.message) {
        const msg = String(res.message).toLowerCase();
        if (msg.includes('unbookmark') || msg.includes('removed')) {
          setIsBookmarked(false);
        } else if (msg.includes('bookmark') || msg.includes('saved') || msg.includes('added')) {
          setIsBookmarked(true);
        }
      }
      refreshProfile();
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setIsBookmarked(!nextState);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(postId);
      if (onPostDeleted) onPostDeleted(postId);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const renderFormattedBody = (text?: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-[#1877F2] font-semibold hover:underline">
            {word}
          </span>
        );
      }
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-[#0D6EFD] font-bold hover:underline">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <>
      <FloatingCard className="p-4 sm:p-5 mb-5 transition-all">
        {/* Post Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <Link
            to={postAuthorId ? `/users/${postAuthorId}` : '#'}
            className="flex items-center gap-3 min-w-0 group"
          >
            <Avatar user={post.user} size="md" showOrbitalRing={false} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#1877F2] transition-colors truncate">
                {post.user?.name || 'User'}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="truncate">@{post.user?.username || 'user'}</span>
                <span>•</span>
                <span className="shrink-0">{formatRelativeTime(post.createdAt)}</span>
                {!isAuthor && postAuthorId && (
                  <>
                    <span>•</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAuthorFollow();
                      }}
                      disabled={isAuthorFollowLoading}
                      className={`font-semibold hover:underline cursor-pointer transition-colors ${
                        isAuthorFollowed
                          ? 'text-slate-400 hover:text-slate-600'
                          : 'text-[#1877F2] hover:text-[#0D6EFD]'
                      }`}
                    >
                      {isAuthorFollowed ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* Action Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95">
                {isAuthor ? (
                  <>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowEditModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleDeletePost();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    {postAuthorId && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleAuthorFollow();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {isAuthorFollowed ? (
                          <>
                            <UserCheck size={14} className="text-[#1877F2]" />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} className="text-[#1877F2]" />
                            <span>Follow User</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowShareModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Share2 size={14} />
                      <span>Share Post</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleToggleBookmark();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Bookmark size={14} />
                      <span>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Text Body */}
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-3 whitespace-pre-line">
          {renderFormattedBody(post.body)}
        </p>

        {/* Post Attached Media */}
        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-3 border border-white/80 shadow-xs max-h-[460px] bg-slate-50">
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full h-auto max-h-[460px] object-cover hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        )}

        {/* Shared Post Embedding */}
        {post.sharedPost && (
          <div className="p-3.5 mb-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <Avatar user={post.sharedPost.user} size="xs" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {post.sharedPost.user?.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  @{post.sharedPost.user?.username} •{' '}
                  {formatRelativeTime(post.sharedPost.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {post.sharedPost.body}
            </p>
            {post.sharedPost.image && (
              <img
                src={post.sharedPost.image}
                alt="Shared attachment"
                className="w-full max-h-52 object-cover rounded-xl mt-2"
              />
            )}
          </div>
        )}

        {/* Post Stats Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 py-2 border-t border-slate-100/90 px-1">
          <button
            onClick={() => setShowLikesModal(true)}
            className="hover:text-[#1877F2] hover:underline transition-colors cursor-pointer font-medium"
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              {commentsCount} comments
            </button>
          </div>
        </div>

        {/* Elevated Interactive Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100/90 gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            disabled={isLikeLoading}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
              isLiked
                ? 'text-rose-500 bg-rose-50/70'
                : 'text-slate-600 hover:text-rose-500 hover:bg-slate-50'
            }`}
          >
            <Heart
              size={17}
              className={`transition-transform duration-200 ${
                isLiked ? 'fill-rose-500 scale-110' : ''
              }`}
            />
            <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
              showComments
                ? 'text-[#1877F2] bg-blue-50/60'
                : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-50'
            }`}
          >
            <MessageCircle size={17} />
            <span className="hidden sm:inline">Comment</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0D6EFD] hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <Share2 size={17} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Post'}
            className={`p-2 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer ${
              isBookmarked
                ? 'text-[#1877F2] bg-blue-50/80'
                : 'text-slate-400 hover:text-[#1877F2] hover:bg-slate-50'
            }`}
          >
            <Bookmark
              size={17}
              className={isBookmarked ? 'fill-[#1877F2]' : ''}
            />
          </button>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <CommentSection
            postId={postId}
            onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
          />
        )}
      </FloatingCard>

      {/* Modals */}
      <PostLikesModal
        postId={postId}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />

      <SharePostModal
        post={post}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShared={(shared) => {
          if (onPostUpdated) onPostUpdated(shared);
        }}
      />

      <EditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={(updated) => {
          if (onPostUpdated) onPostUpdated(updated);
        }}
      />
    </>
  );
};
