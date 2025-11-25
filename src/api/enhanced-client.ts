/**
 * H5前端增强API客户端
 * 集成错误处理、重试机制和降级方案
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { errorHandler, withRetry, withFallback, withRetryAndFallback, handleApiError } from '../../../shared/utils/errorHandler'

// API基础配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// 降级数据生成器
const getFallbackData = (type: string, params?: any) => {
  switch (type) {
    case 'products/list':
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            perPage: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        },
        message: '商品列表加载失败，显示空列表'
      }

    case 'user/profile':
      return {
        success: true,
        data: {
          id: 'unknown',
          nickname: '游客用户',
          phone: '',
          level: 'NORMAL',
          pointsBalance: 0,
          referralCode: ''
        },
        message: '用户信息获取失败'
      }

    case 'orders/list':
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            perPage: 10,
            total: 0,
            totalPages: 0
          }
        },
        message: '订单列表加载失败'
      }

    case 'points/balance':
      return {
        success: true,
        data: {
          balance: 0,
          frozen: 0
        },
        message: '余额查询失败'
      }

    case 'team/statistics':
      return {
        success: true,
        data: {
          directCount: 0,
          teamCount: 0,
          totalSales: 0
        },
        message: '团队统计获取失败'
      }

    default:
      return {
        success: false,
        error: {
          code: 'FALLBACK_ERROR',
          message: '请求失败，使用降级数据'
        }
      }
  }
}

// 创建axios实例
class EnhancedApiClient {
  private client: AxiosInstance
  private retryConfig = {
    maxRetries: 2,
    retryDelay: 1000,
    backoffMultiplier: 1.5
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加CSRF token
        const csrfToken = this.getCSRFToken()
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }

        // 请求日志（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 保存CSRF token
        this.saveCSRFToken(response)

        // 响应日志（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }

        return response
      },
      (error) => {
        // 错误处理
        this.handleRequestError(error)

        // 保存CSRF token（即使出错也要尝试保存）
        if (error.response) {
          this.saveCSRFToken(error.response)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private getCSRFToken(): string | null {
    return localStorage.getItem('csrf_token')
  }

  private saveCSRFToken(response: AxiosResponse): void {
    const cookies = response.headers['set-cookie']
    if (cookies) {
      const csrfCookie = cookies.find(cookie => cookie.includes('csrf-token='))
      if (csrfCookie) {
        const tokenMatch = csrfCookie.match(/csrf-token=([^;]+)/)
        if (tokenMatch) {
          localStorage.setItem('csrf_token', tokenMatch[1])
        }
      }
    }
  }

  private handleRequestError(error: any): void {
    const originalConfig = error.config

    // 如果配置了不显示错误消息，则跳过
    if (originalConfig?.skipErrorNotification) {
      return
    }

    const errorConfig = errorHandler.getErrorConfig(error)

    // 显示用户友好的错误提示
    if (errorConfig.type !== 'UNKNOWN' || process.env.NODE_ENV === 'development') {
      message.error(errorConfig.userMessage, {
        duration: errorConfig.canRetry ? 4 : 6,
        style: {
          marginTop: '20vh'
        }
      })
    }
  }

  private formatError(error: any): any {
    // 统一错误格式
    const formattedError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '请求失败',
      status: error.response?.status,
      config: error.config,
      response: error.response
    }

    // 添加特定错误类型标识
    if (error.code === 'ECONNABORTED') {
      formattedError.code = 'TIMEOUT'
    } else if (error.code === 'ECONNREFUSED') {
      formattedError.code = 'NETWORK_ERROR'
    }

    return formattedError
  }

  /**
   * 基础HTTP方法
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config)
  }

  /**
   * 带重试的HTTP方法
   */
  async getWithRetry<T = any>(url: string, config?: AxiosRequestConfig & { maxRetries?: number }): Promise<T> {
    return withRetry(() => this.get<T>(url, config), {
      maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
      retryDelay: this.retryConfig.retryDelay,
      backoffMultiplier: this.retryConfig.backoffMultiplier
    })
  }

  async postWithRetry<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { maxRetries?: number }): Promise<T> {
    return withRetry(() => this.post<T>(url, data, config), {
      maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
      retryDelay: this.retryConfig.retryDelay,
      backoffMultiplier: this.retryConfig.backoffMultiplier
    })
  }

  /**
   * 带降级的HTTP方法
   */
  async getWithFallback<T = any>(
    url: string,
    fallbackType: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<T> {
    return withFallback(
      () => this.get<T>(url, config),
      () => getFallbackData(fallbackType),
      {
        silent: config?.silent,
        customMessage: config?.silent ? undefined : undefined
      }
    )
  }

  async postWithFallback<T = any>(
    url: string,
    data?: any,
    fallbackType: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<T> {
    return withFallback(
      () => this.post<T>(url, data, config),
      () => getFallbackData(fallbackType),
      {
        silent: config?.silent,
        customMessage: config?.silent ? undefined : undefined
      }
    )
  }

  /**
   * 带重试和降级的HTTP方法
   */
  async getWithRetryAndFallback<T = any>(
    url: string,
    fallbackType: string,
    config?: AxiosRequestConfig & {
      maxRetries?: number;
      silent?: boolean;
      customMessage?: string
    }
  ): Promise<T> {
    return withRetryAndFallback(
      () => this.get<T>(url, config),
      () => getFallbackData(fallbackType),
      {
        maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
        retryDelay: this.retryConfig.retryDelay,
        backoffMultiplier: this.retryConfig.backoffMultiplier
      },
      {
        silent: config?.silent,
        customMessage: config?.customMessage
      }
    )
  }

  async postWithRetryAndFallback<T = any>(
    url: string,
    data?: any,
    fallbackType: string,
    config?: AxiosRequestConfig & {
      maxRetries?: number;
      silent?: boolean;
      customMessage?: string
    }
  ): Promise<T> {
    return withRetryAndFallback(
      () => this.post<T>(url, data, config),
      () => getFallbackData(fallbackType),
      {
        maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
        retryDelay: this.retryConfig.retryDelay,
        backoffMultiplier: this.retryConfig.backoffMultiplier
      },
      {
        silent: config?.silent,
        customMessage: config?.customMessage
      }
    )
  }

  /**
   * 批量请求处理
   */
  async batchRequests<T = any>(
    requests: Array<() => Promise<T>>,
    options?: { continueOnError?: boolean; returnPartial?: boolean }
  ): Promise<{ results: T[]; errors: any[] }> {
    return errorHandler.handleBatchErrors(requests, options)
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('csrf_token')
  }

  /**
   * 设置认证信息
   */
  setAuth(token: string, refreshToken?: string): void {
    localStorage.setItem('auth_token', token)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  /**
   * 获取认证token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

// 创建并导出实例
export const enhancedApiClient = new EnhancedApiClient()

// 导出便捷方法
export const {
  get,
  post,
  put,
  delete,
  getWithRetry,
  postWithRetry,
  getWithFallback,
  postWithFallback,
  getWithRetryAndFallback,
  postWithRetryAndFallback,
  batchRequests,
  clearAuth,
  setAuth,
  getAuthToken,
  isAuthenticated
} = enhancedApiClient

export default enhancedApiClient