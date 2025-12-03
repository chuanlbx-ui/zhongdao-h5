/**
 * 团队管理API
 */

import { apiClient } from './client';
import { ApiResponse, TeamStats, TeamMember, PaginationParams } from '../types';

export const teamApi = {
  /**
   * 获取团队统计信息
   */
  getTeamStats: (): Promise<ApiResponse<TeamStats>> => {
    return apiClient.get('/team/stats');
  },

  /**
   * 获取团队成员列表
   */
  getTeamMembers: (params?: PaginationParams & {
    level?: string;
    keyword?: string;
  }): Promise<ApiResponse<{
    members: TeamMember[];
    pagination: any;
  }>> => {
    return apiClient.get('/team/members', { params });
  },

  /**
   * 获取直推成员
   */
  getDirectMembers: (params?: PaginationParams): Promise<ApiResponse<{
    members: TeamMember[];
    pagination: any;
  }>> => {
    return apiClient.get('/team/direct-members', { params });
  },

  /**
   * 获取团队树形结构
   */
  getTeamTree: (): Promise<ApiResponse<{
    tree: any[];
    totalLevels: number;
  }>> => {
    return apiClient.get('/team/tree');
  },

  /**
   * 获取团队业绩报表
   */
  getTeamReport: (params: {
    startDate: string;
    endDate: string;
    type: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<{
    report: any[];
    summary: any;
  }>> => {
    return apiClient.get('/team/report', { params });
  },

  /**
   * 邀请成员
   */
  inviteMember: (data: {
    phone: string;
    message?: string;
  }): Promise<ApiResponse<{
    inviteId: string;
    expiredAt: string;
  }>> => {
    return apiClient.post('/team/invite', data);
  },

  /**
   * 查看邀请记录
   */
  getInviteHistory: (params?: PaginationParams): Promise<ApiResponse<{
    invites: any[];
    pagination: any;
  }>> => {
    return apiClient.get('/team/invites', { params });
  },

  /**
   * 获取团队升级条件
   */
  getUpgradeRequirements: (): Promise<ApiResponse<{
    currentLevel: string;
    nextLevel?: string;
    requirements: {
      minTeamSize: number;
      minDirectMembers: number;
      minPerformance: number;
      progress: {
        teamSize: number;
        directMembers: number;
        performance: number;
      };
    };
  }>> => {
    return apiClient.get('/team/upgrade-requirements');
  }
};