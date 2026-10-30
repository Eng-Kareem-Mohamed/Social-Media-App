import type { User } from '../types/auth';
import type { Post } from '../types/post';
import type { Comment, Reply } from '../types/comment';

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarUrl(user?: User | null): string | undefined {
  if (!user || !user.photo) return undefined;
  if (user.photo.startsWith('http')) return user.photo;
  return `https://route-posts.routemisr.com${user.photo.startsWith('/') ? '' : '/'}${user.photo}`;
}

export function isPostLikedByUser(post?: Post | null, currentUserId?: string | null): boolean {
  if (!post || !currentUserId) return false;

  if (typeof post.isLiked === 'boolean') {
    return post.isLiked;
  }

  if (Array.isArray(post.likes)) {
    return post.likes.some((item: any) => {
      if (!item) return false;
      if (typeof item === 'string') return item === currentUserId;
      if (typeof item === 'object') {
        const id = item._id || item.id;
        return id === currentUserId;
      }
      return false;
    });
  }

  return false;
}

export function getPostLikesCount(post?: Post | null): number {
  if (!post) return 0;
  if (typeof post.likesCount === 'number') return Math.max(0, post.likesCount);
  if (Array.isArray(post.likes)) return post.likes.length;
  return 0;
}

export function isPostBookmarkedByUser(
  post?: Post | null,
  userBookmarks?: string[] | Post[] | null
): boolean {
  if (!post) return false;
  if (typeof post.bookmarked === 'boolean') return post.bookmarked;
  if (typeof (post as any).isBookmarked === 'boolean') return (post as any).isBookmarked;

  const postId = post._id || post.id;
  if (!postId || !userBookmarks || !Array.isArray(userBookmarks)) return false;

  return userBookmarks.some((b: any) => {
    if (!b) return false;
    if (typeof b === 'string') return b === postId;
    if (typeof b === 'object') return (b._id || b.id || (b.post && (b.post._id || b.post.id))) === postId;
    return false;
  });
}

export function extractPostsFromBookmarks(res: any): Post[] {
  if (!res) return [];
  const rawList =
    res?.data?.posts ||
    res?.data?.bookmarks ||
    res?.bookmarks ||
    res?.posts ||
    res?.data ||
    [];

  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item: any) => {
      if (!item) return null;
      if (item.post && typeof item.post === 'object') {
        return item.post as Post;
      }
      return item as Post;
    })
    .filter(Boolean) as Post[];
}

export function isCommentLikedByUser(
  comment?: Comment | Reply | null,
  currentUserId?: string | null
): boolean {
  if (!comment || !currentUserId) return false;

  if (typeof comment.isLiked === 'boolean') {
    return comment.isLiked;
  }

  if (Array.isArray(comment.likes)) {
    return comment.likes.some((item: any) => {
      if (!item) return false;
      if (typeof item === 'string') return item === currentUserId;
      if (typeof item === 'object') {
        const id = item._id || item.id;
        return id === currentUserId;
      }
      return false;
    });
  }

  return false;
}

export function getCommentLikesCount(comment?: Comment | Reply | null): number {
  if (!comment) return 0;
  if (typeof comment.likesCount === 'number') return Math.max(0, comment.likesCount);
  if (Array.isArray(comment.likes)) return comment.likes.length;
  return 0;
}

export function isNotificationUnread(item?: any): boolean {
  if (!item) return false;
  if (typeof item.unread === 'boolean') return item.unread;
  if (typeof item.read === 'boolean') return !item.read;
  if (typeof item.isRead === 'boolean') return !item.isRead;
  if (typeof item.status === 'string') return item.status.toLowerCase() === 'unread';
  return false;
}

export function isUserFollowedByCurrentUser(
  targetUserOrId?: User | string | null,
  currentUser?: User | null
): boolean {
  if (!targetUserOrId || !currentUser) return false;

  const targetId =
    typeof targetUserOrId === 'string'
      ? targetUserOrId
      : targetUserOrId._id || targetUserOrId.id;
  const currentUserId = currentUser._id || currentUser.id;

  if (!targetId || !currentUserId || targetId === currentUserId) return false;

  // 1. Check if currentUser's following array contains targetId
  if (Array.isArray(currentUser.following)) {
    const isContained = currentUser.following.some((item: any) => {
      if (!item) return false;
      if (typeof item === 'string') return item === targetId;
      if (typeof item === 'object') return (item._id || item.id) === targetId;
      return false;
    });
    if (isContained) return true;
  }

  // 2. If target is an object, check target.isFollowing
  if (typeof targetUserOrId === 'object') {
    if (typeof targetUserOrId.isFollowing === 'boolean') {
      return targetUserOrId.isFollowing;
    }
    // Check target's followers array for current user
    if (Array.isArray(targetUserOrId.followers)) {
      const isFollower = targetUserOrId.followers.some((item: any) => {
        if (!item) return false;
        if (typeof item === 'string') return item === currentUserId;
        if (typeof item === 'object') return (item._id || item.id) === currentUserId;
        return false;
      });
      if (isFollower) return true;
    }
  }

  return false;
}

export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    if (Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join(', ');
    }
    return String(error.response.data.errors);
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
