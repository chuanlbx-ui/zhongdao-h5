/**
 * H5前端增强API接口
 * 集成错误处理、重试和降级方案
 */

import { enhancedApiClient } from './enhanced-client'

// ==================== 认证相关 ====================

export interface LoginParams {
  code: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: {
      id: string
      nickname: string
      avatarUrl: string
      phone: string
      level: string
      referralCode: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
      tokenType: string
    }
  }
  message: string
}

export const authApi = {
  /**
   * 微信登录（带重试和降级）
   */
  login: (params: LoginParams) =>
    enhancedApiClient.postWithRetryAndFallback<LoginResponse>(
      '/auth/wechat-login',
      params,
      'user/profile',
      {
        maxRetries: 3,
        silent: false,
        customMessage: '登录失败，请重试'
      }
    ),

  /**
   * 登出（静默失败）
   */
  logout: () =>
    enhancedApiClient.postWithFallback(
      '/auth/logout',
      {},
      'empty/list',
      { silent: true }
    ),

  /**
   * 刷新Token（带重试）
   */
  refreshToken: (refreshToken: string) =>
    enhancedApiClient.postWithRetry(
      '/auth/refresh',
      { refreshToken },
      { maxRetries: 2 }
    ),

  /**
   * 检查登录状态
   */
  checkAuthStatus: () =>
    enhancedApiClient.getWithFallback(
      '/auth/status',
      'empty/list',
      { silent: true }
    )
}

// ==================== 用户相关 ====================

export interface UserProfile {
  id: string
  nickname: string | null
  phone: string | null
  avatarUrl: string | null
  level: string
  pointsBalance: number
  referralCode: string | null
  directCount: number
  teamCount: number
}

export const userApi = {
  /**
   * 获取用户信息（带重试和降级）
   */
  getProfile: () =>
    enhancedApiClient.getWithRetryAndFallback(
      '/users/me',
      'user/profile',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '获取用户信息失败'
      }
    ),

  /**
   * 更新用户信息（带重试）
   */
  updateProfile: (data: Partial<UserProfile>) =>
    enhancedApiClient.putWithRetry(
      '/users/me',
      data,
      { maxRetries: 1 }
    ),

  /**
   * 绑定手机号（带重试）
   */
  bindPhone: (phone: string, verificationCode: string) =>
    enhancedApiClient.postWithRetry(
      '/users/bind-phone',
      { phone, verificationCode },
      { maxRetries: 2 }
    )
}

// ==================== 商品相关 ====================

export interface Product {
  id: string
  name: string
  description: string
  images: string[]
  price: number
  originalPrice: number
  stock: number
  specs: any
  category: any
  status: string
}

export interface ProductListParams {
  page?: number
  perPage?: number
  categoryId?: string
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductListResponse {
  success: boolean
  data: {
    items: Product[]
    pagination: {
      page: number
      perPage: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  message: string
}

export const productApi = {
  /**
   * 获取商品列表（带重试和降级）
   */
  getList: (params?: ProductListParams) =>
    enhancedApiClient.getWithRetryAndFallback<ProductListResponse>(
      '/products/items',
      'products/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '商品列表加载失败'
      },
      { params }
    ),

  /**
   * 获取商品详情（带重试）
   */
  getDetail: (id: string) =>
    enhancedApiClient.getWithFallback(
      `/products/items/${id}`,
      'empty/list',
      {
        silent: false,
        customMessage: '商品详情加载失败'
      }
    ),

  /**
   * 搜索商品（带重试）
   */
  search: (keyword: string, params?: Omit<ProductListParams, 'keyword'>) =>
    enhancedApiClient.getWithRetry(
      '/products/search',
      { ...params, keyword },
      { maxRetries: 1 }
    ),

  /**
   * 获取商品分类（带重试和降级）
   */
  getCategories: () =>
    enhancedApiClient.getWithRetryAndFallback(
      '/products/categories',
      'empty/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '商品分类加载失败'
      }
    )
}

// ==================== 订单相关 ====================

export interface Order {
  id: string
  orderNo: string
  type: string
  status: string
  totalAmount: number
  finalAmount: number
  items: any[]
  createdAt: string
  deliveryAddress: any
}

export interface OrderParams {
  type: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  deliveryAddress: any
  paymentMethod: string
}

export const orderApi = {
  /**
   * 创建订单（带重试）
   */
  create: (data: OrderParams) =>
    enhancedApiClient.postWithRetry(
      '/orders',
      data,
      { maxRetries: 2 }
    ),

  /**
   * 获取订单列表（带重试和降级）
   */
  getList: (params?: { page?: number; perPage?: number; status?: string }) =>
    enhancedApiClient.getWithRetryAndFallback(
      '/orders',
      'orders/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '订单列表加载失败'
      },
      { params }
    ),

  /**
   * 获取订单详情（带重试）
   */
  getDetail: (orderNo: string) =>
    enhancedApiClient.getWithFallback(
      `/orders/${orderNo}`,
      'empty/list',
      {
        silent: false,
        customMessage: '订单详情加载失败'
      }
    ),

  /**
   * 取消订单（带重试）
   */
  cancel: (orderNo: string) =>
    enhancedApiClient.putWithRetry(
      `/orders/${orderNo}/cancel`,
      {},
      { maxRetries: 1 }
    ),

  /**
   * 确认收货（带重试）
   */
  confirmDelivery: (orderNo: string) =>
    enhancedApiClient.putWithRetry(
      `/orders/${orderNo}/confirm`,
      {},
      { maxRetries: 1 }
    )
}

// ==================== 通券相关 ====================

export interface PointsBalance {
  balance: number
  frozen: number
  availableBalance: number
}

export interface TransferParams {
  toUserId: string
  amount: number
  description?: string
}

export const pointsApi = {
  /**
   * 获取通券余额（带重试和降级）
   */
  getBalance: () =>
    enhancedApiClient.getWithRetryAndFallback(
      '/points/balance',
      'points/balance',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '余额查询失败'
      }
    ),

  /**
   * 通券转账（带重试）
   */
  transfer: (data: TransferParams) =>
    enhancedApiClient.postWithRetry(
      '/points/transfer',
      data,
      { maxRetries: 2 }
    ),

  /**
   * 获取通券流水（带重试和降级）
   */
  getTransactions: (params?: { page?: number; perPage?: number; type?: string }) =>
    enhancedApiClient.getWithRetryAndFallback(
      '/points/transactions',
      'empty/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '通券流水加载失败'
      },
      { params }
    ),

  /**
   * 获取通券统计（带重试和降级）
   */
  getStatistics: () =>
    enhancedApiClient.getWithRetryAndFallback(
      '/points/statistics',
      'empty/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '通券统计加载失败'
      }
    )
}

// ==================== 团队相关 ====================

export interface TeamMember {
  id: string
  nickname: string
  level: string
  joinTime: string
  performance: {
    totalSales: number
    orderCount: number
  }
}

export interface TeamStats {
  directCount: number
  teamCount: number
  totalSales: number
  level: string
}

export const teamApi = {
  /**
   * 获取团队成员列表（带重试和降级）
   */
  getMembers: (params?: { page?: number; perPage?: number; level?: string }) =>
    enhancedApiClient.getWithRetryAndFallback(
      '/teams/members',
      'empty/list',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '团队成员加载失败'
      },
      { params }
    ),

  /**
   * 获取团队统计（带重试和降级）
   */
  getStatistics: () =>
    enhancedApiClient.getWithRetryAndFallback(
      '/teams/statistics',
      'team/statistics',
      {
        maxRetries: 2,
        silent: false,
        customMessage: '团队统计加载失败'
      }
    ),

  /**
   * 获取推荐信息（带重试）
   */
  getReferralInfo: () =>
    enhancedApiClient.getWithRetry(
      '/users/referral-info',
      { maxRetries: 2 }
    ),

  /**
   * 验证推荐码（带重试）
   */
  validateReferralCode: (referralCode: string) =>
    enhancedApiClient.postWithRetry(
      '/users/validate-referral',
      { referralCode },
      { maxRetries: 2 }
    )
}

// ==================== 通用工具 ====================

export const utils = {
  /**
   * 批量API调用
   */
  batchRequest: (requests: Array<() => Promise<any>>, options?: { continueOnError?: boolean }) =>
    enhancedApiClient.batchRequests(requests, options),

  /**
   * 检查网络状态
   */
  checkNetworkStatus: async () => {
    try {
      await enhancedApiClient.get('/health', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 获取系统配置
   */
  getSystemConfig: () =>
    enhancedApiClient.getWithFallback(
      '/config/system',
      'empty/list',
      { silent: true }
    )
}

export default {
  auth: authApi,
  user: userApi,
  product: productApi,
  order: orderApi,
  points: pointsApi,
  team: teamApi,
  utils
}