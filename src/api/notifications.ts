import apiClient from './client';
import type { NotificationsResponse, UnreadCountResponse } from '../types/notification';

export const notificationsApi = {
  // Get notifications
  getNotifications: async (
    unreadOnly = false,
    page = 1,
    limit = 30
  ): Promise<NotificationsResponse> => {
    const query = unreadOnly ? `unread=true&page=${page}&limit=${limit}` : `unread=false&page=${page}&limit=${limit}`;
    const response = await apiClient.get<NotificationsResponse>(`/notifications?${query}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read with empty body
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`, {});
    return response.data;
  },

  // Mark all notifications as read with empty body
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all', {});
    return response.data;
  },
};
