import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, UserPlus, Check } from 'lucide-react';
import type { NotificationItem } from '../../types/notification';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';
import { isNotificationUnread } from '../../utils/helpers';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationPodProps {
  notification: NotificationItem;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationPod: React.FC<NotificationPodProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  const notifId = notification._id || notification.id || '';
  const isUnread = isNotificationUnread(notification);

  const senderId = notification.sender?._id || notification.sender?.id;
  const targetPostId =
    (typeof notification.post === 'string'
      ? notification.post
      : notification.post?._id || notification.post?.id) ||
    (notification.entityType === 'post' ? notification.entityId : null);

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart size={13} className="text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle size={13} className="text-[#1877F2]" />;
      case 'share':
        return <Share2 size={13} className="text-emerald-500" />;
      case 'follow':
        return <UserPlus size={13} className="text-amber-500" />;
      default:
        return <MessageCircle size={13} className="text-blue-500" />;
    }
  };

  const getActionText = () => {
    if (notification.text) return notification.text;
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment';
      case 'share':
        return 'shared your post';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your profile';
    }
  };

  const handlePodClick = (e: React.MouseEvent) => {
    // If user clicked directly on a link or button, don't intercept
    if ((e.target as HTMLElement).closest('a, button')) return;

    if (isUnread && notifId) {
      markAsRead(notifId);
      if (onMarkAsRead) onMarkAsRead(notifId);
    }

    if (targetPostId) {
      navigate(`/posts/${targetPostId}`);
    } else if (senderId && notification.type === 'follow') {
      navigate(`/users/${senderId}`);
    }
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notifId) return;
    markAsRead(notifId);
    if (onMarkAsRead) onMarkAsRead(notifId);
  };

  return (
    <div
      onClick={handlePodClick}
      className={`floating-pod p-3.5 sm:p-4 flex items-start gap-3.5 relative transition-all cursor-pointer ${
        isUnread
          ? 'bg-white/95 border-blue-200/90 shadow-[0_14px_38px_-8px_rgba(24,119,242,0.20)] ring-1 ring-blue-400/20'
          : 'bg-white/80 hover:bg-white/95'
      }`}
    >
      {/* Glowing Unread Beacon Dot */}
      {isUnread && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shadow-[0_0_10px_#1877F2] shrink-0 mt-2 animate-pulse" />
      )}

      {/* Avatar with Type Badge */}
      <div className="relative shrink-0">
        <Avatar user={notification.sender} size="md" />
        <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs border border-slate-100 flex items-center justify-center">
          {getIcon()}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-800 leading-snug">
            <Link
              to={senderId ? `/users/${senderId}` : '#'}
              className="font-bold text-[#0F172A] hover:text-[#1877F2] transition-colors mr-1"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.sender?.name || 'Someone'}
            </Link>
            <span className="text-slate-600 font-normal">{getActionText()}</span>
          </p>

          <span className="text-[11px] text-slate-400 shrink-0">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        {/* Post snippet preview if available */}
        {notification.post?.body && (
          <p className="mt-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 line-clamp-1 italic hover:text-[#1877F2] transition-colors">
            "{notification.post.body}"
          </p>
        )}
      </div>

      {/* Mark As Read Button */}
      {isUnread && (
        <button
          onClick={handleCheckClick}
          title="Mark as read"
          className="p-1.5 text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <Check size={16} />
        </button>
      )}
    </div>
  );
};
