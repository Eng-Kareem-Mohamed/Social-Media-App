import { User } from './auth';
import { Post } from './post';

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'share';

export interface NotificationItem {
  _id: string;
  id?: string;
  recipient: string | User;
  sender: User;
  type: NotificationType;
  entityType?: 'post' | 'comment' | 'user';
  entityId?: string;
  post?: Post;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  text?: string;
}

export interface NotificationsResponse {
  success: boolean;
  message?: string;
  data: {
    notifications: NotificationItem[];
    total?: number;
    unreadCount?: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message?: string;
  data: {
    unreadCount: number;
  };
}

