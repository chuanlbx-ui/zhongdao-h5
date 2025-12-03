/**
 * 报表API
 */

import { apiClient } from './client';
import { ApiResponse } from '../types';

export const reportApi = {
  /**
   * 获取销售报表
   */
  getSalesReport: (params: {
    startDate: string;
    endDate: string;
    type: 'daily' | 'weekly' | 'monthly';
    groupBy?: 'product' | 'category' | 'user';
  }): Promise<ApiResponse<{
    data: any[];
    summary: {
      totalOrders: number;
      totalAmount: number;
      totalUsers: number;
      averageOrderValue: number;
    };
  }>> => {
    return apiClient.get('/reports/sales', { params });
  },

  /**
   * 获取佣金报表
   */
  getCommissionReport: (params: {
    startDate: string;
    endDate: string;
    type?: 'summary' | 'detail';
  }): Promise<ApiResponse<{
    data: any[];
    summary: {
      totalCommission: number;
      directCommission: number;
      indirectCommission: number;
      teamBonus: number;
      levelBonus: number;
    };
  }>> => {
    return apiClient.get('/reports/commission', { params });
  },

  /**
   * 获取团队报表
   */
  getTeamReport: (params: {
    startDate: string;
    endDate: string;
    level?: 'all' | 'direct' | 'indirect';
  }): Promise<ApiResponse<{
    data: any[];
    summary: {
      totalMembers: number;
      activeMembers: number;
      newMembers: number;
      totalPerformance: number;
    };
  }>> => {
    return apiClient.get('/reports/team', { params });
  },

  /**
   * 获取商品销售排行
   */
  getProductRanking: (params: {
    startDate: string;
    endDate: string;
    limit?: number;
    orderBy?: 'sales' | 'amount' | 'quantity';
  }): Promise<ApiResponse<{
    products: Array<{
      id: string;
      name: string;
      image: string;
      sales: number;
      amount: number;
      quantity: number;
      growth: number;
    }>;
  }>> => {
    return apiClient.get('/reports/product-ranking', { params });
  },

  /**
   * 获取用户排行
   */
  getUserRanking: (params: {
    startDate: string;
    endDate: string;
    type: 'sales' | 'team' | 'commission';
    limit?: number;
  }): Promise<ApiResponse<{
    users: Array<{
      id: string;
      nickname: string;
      avatar?: string;
      level: string;
      value: number;
      rank: number;
    }>;
  }>> => {
    return apiClient.get('/reports/user-ranking', { params });
  },

  /**
   * 导出报表
   */
  exportReport: (params: {
    type: 'sales' | 'commission' | 'team';
    format: 'excel' | 'csv' | 'pdf';
    startDate: string;
    endDate: string;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
  }>> => {
    return apiClient.post('/reports/export', params);
  },

  /**
   * 获取仪表板数据
   */
  getDashboardData: (): Promise<ApiResponse<{
    overview: {
      todayOrders: number;
      todayAmount: number;
      monthOrders: number;
      monthAmount: number;
      totalOrders: number;
      totalAmount: number;
      totalUsers: number;
    };
    charts: {
      salesTrend: any[];
      categoryDistribution: any[];
      levelDistribution: any[];
    };
    rankings: {
      topProducts: any[];
      topUsers: any[];
    };
  }>> => {
    return apiClient.get('/reports/dashboard');
  }
};