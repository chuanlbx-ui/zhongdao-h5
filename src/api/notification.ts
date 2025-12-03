/**
 * 通知API
 */

import { apiClient } from './client';
import { ApiResponse, Notification, NotificationSettings, PaginationParams } from '../types';

export const notificationApi = {
  /**
   * 获取通知列表
   */
  getNotifications: (params?: PaginationParams & {
    type?: string;
    readStatus?: 'read' | 'unread' | 'all';
  }): Promise<ApiResponse<{
    notifications: Notification[];
    unreadCount: number;
    pagination: any;
  }>> => {
    return apiClient.get('/notifications', { params });
  },

  /**
   * 标记通知为已读
   */
  markAsRead: (id: string): Promise<ApiResponse> => {
    return apiClient.post(`/notifications/${id}/read`);
  },

  /**
   * 批量标记已读
   */
  markAllAsRead: (): Promise<ApiResponse> => {
    return apiClient.post('/notifications/read-all');
  },

  /**
   * 删除通知
   */
  deleteNotification: (id: string): Promise<ApiResponse> => {
    return apiClient.delete(`/notifications/${id}`);
  },

  /**
   * 获取通知设置
   */
  getNotificationSettings: (): Promise<ApiResponse<NotificationSettings>> => {
    return apiClient.get('/notifications/settings');
  },

  /**
   * 更新通知设置
   */
  updateNotificationSettings: (settings: Partial<NotificationSettings>): Promise<ApiResponse> => {
    return apiClient.put('/notifications/settings', settings);
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount: (): Promise<ApiResponse<{
    total: number;
    system: number;
    order: number;
    promotion: number;
    security: number;
  }>> => {
    return apiClient.get('/notifications/unread-count');
  }
};