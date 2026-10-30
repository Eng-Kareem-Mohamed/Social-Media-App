import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, TrendingUp, Sparkles, Inbox, BellDot } from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import type { NotificationItem } from '../types/notification';
import { NotificationPod } from '../components/notifications/NotificationPod';
import { FloatingCard } from '../components/common/FloatingCard';
import { Button } from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';
import { isNotificationUnread } from '../utils/helpers';

export const NotificationsPage: React.FC = () => {
  const { markAllAsRead, unreadCount, fetchUnreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getNotifications(false, 1, 50);
      const list = res.data?.notifications || (res as any).notifications || [];
      setNotifications(list);
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkOneAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id || n.id === id
          ? { ...n, read: true, isRead: true, unread: false, status: 'read' }
          : n
      )
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true, unread: false, status: 'read' }))
    );
  };

  // Real API-driven stats calculations
  const totalCount = notifications.length;
  const currentUnread = notifications.filter(isNotificationUnread).length;
  const effectiveUnread = Math.max(unreadCount, currentUnread);
  const readCount = Math.max(0, totalCount - effectiveUnread);
  const completionRate =
    totalCount > 0 ? Math.min(100, Math.round((readCount / totalCount) * 100)) : 100;

  // Filtered list
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter(isNotificationUnread)
      : notifications;

  return (
    <div className="space-y-6">
      {/* Real Live Notification Stats */}
      <FloatingCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#1877F2]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Live Notification Analytics
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#1877F2] bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} />
            <span>{effectiveUnread === 0 ? 'All Caught Up' : `${effectiveUnread} Unread`}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Metric 1: Total Alerts */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Alerts</span>
              <Inbox size={15} className="text-[#1877F2]" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A]">
                {totalCount}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Interactions received</p>
            </div>
          </div>

          {/* Metric 2: Unread Pending */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Unread Alerts</span>
              <BellDot size={15} className={effectiveUnread > 0 ? 'text-amber-500' : 'text-slate-400'} />
            </div>
            <div className="mt-2">
              <span className={`text-xl sm:text-2xl font-black ${effectiveUnread > 0 ? 'text-[#1877F2]' : 'text-slate-700'}`}>
                {effectiveUnread}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {effectiveUnread > 0 ? 'Awaiting your review' : 'No pending alerts'}
              </p>
            </div>
          </div>

          {/* Metric 3: Read Completion Rate */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Read Rate</span>
              <span className="text-xs font-bold text-emerald-600">{completionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden my-1">
              <div
                className="h-full bg-gradient-to-r from-[#1877F2] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {readCount} of {totalCount} reviewed
            </p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating Capsule Filter Pills & Mark All Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="floating-pill p-1.5 flex items-center gap-1 w-full sm:w-auto shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#1877F2] text-white shadow-md'
                : 'text-slate-600 hover:text-[#1877F2]'
            }`}
          >
            All Activity ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#1877F2] text-white shadow-md'
                : 'text-slate-600 hover:text-[#1877F2]'
            }`}
          >
            <span>Unread Only</span>
            {effectiveUnread > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full leading-none">
                {effectiveUnread}
              </span>
            )}
          </button>
        </div>

        {effectiveUnread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs text-[#1877F2] font-semibold cursor-pointer"
          >
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Zero-Gravity Floating Pods List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="floating-pod p-4 animate-pulse flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="floating-card p-12 text-center text-slate-400 space-y-2">
            <Bell size={28} className="mx-auto text-slate-300 mb-1" />
            <p className="text-sm font-bold text-slate-700">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-xs">
              {filter === 'unread'
                ? 'You have reviewed all your incoming alerts.'
                : 'When someone likes your posts or comments, you will see it here in real-time.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationPod
              key={notification._id || notification.id}
              notification={notification}
              onMarkAsRead={handleMarkOneAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};
