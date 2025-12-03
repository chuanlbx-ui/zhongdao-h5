/**
 * 增强版API客户端
 * 集成错误处理、重试机制、缓存等功能
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError, createRetryableApi } from './error-handler';
import { ApiResponse } from '../types';

// API客户端配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000 // 5分钟
};

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number; expires: number }>();

/**
 * 生成缓存键
 */
function getCacheKey(config: AxiosRequestConfig): string {
  return `${config.method?.toUpperCase() || 'GET'}_${config.url}_${JSON.stringify(config.params)}`;
}

/**
 * 检查缓存
 */
function getCachedData(key: string): any | null {
  if (!API_CONFIG.enableCache) return null;

  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * 设置缓存
 */
function setCachedData(key: string, data: any): void {
  if (!API_CONFIG.enableCache) return;

  cache.set(key, {
    data,
    timestamp: Date.now(),
    expires: Date.now() + API_CONFIG.cacheTimeout
  });
}

/**
 * 增强版API客户端
 */
export class EnhancedApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: true
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证Token
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加CSRF Token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          config.headers['x-csrf-token'] = csrfToken;
        }

        // 添加请求ID
        config.headers['x-request-id'] = this.generateRequestId();

        // 添加设备信息
        config.headers['x-device-info'] = JSON.stringify({
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          language: navigator.language
        });

        // 日志记录
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 记录响应日志
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data
        });

        // 缓存GET请求
        if (response.config.method?.toLowerCase() === 'get') {
          const cacheKey = getCacheKey(response.config);
          setCachedData(cacheKey, response.data);
        }

        return response;
      },
      async (error) => {
        // 记录错误日志
        console.error('[API Response Error]', error.response?.status, error.config?.url, error);

        // 处理401错误（未授权）
        if (error.response?.status === 401) {
          // 清除本地认证信息
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');

          // 跳转到登录页
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }

        // 处理403错误（权限不足）
        if (error.response?.status === 403) {
          // 显示权限不足提示
          console.warn('权限不足，无法执行此操作');
        }

        // 处理404错误（资源不存在）
        if (error.response?.status === 404) {
          console.warn('请求的资源不存在');
        }

        // 处理网络错误
        if (!error.response) {
          console.error('网络错误，请检查网络连接');
        }

        // 使用错误处理器处理错误
        const errorResponse = handleApiError(error);
        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const cacheKey = getCacheKey({ method: 'GET', url, ...config });
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`[API Cache Hit] ${url}`);
      return cachedData;
    }

    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * 上传文件
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 上传超时时间更长
    });
    return response.data;
  }

  /**
   * 下载文件
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob'
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * 批量请求
   */
  async batch<T = any>(
    requests: Array<() => Promise<ApiResponse<T>>>
  ): Promise<ApiResponse<T>[]> {
    try {
      const results = await Promise.all(requests.map(req => req()));
      return results;
    } catch (error) {
      console.error('[API Batch Error]', error);
      throw error;
    }
  }

  /**
   * 创建带重试的API调用
   */
  createRetryable<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: {
      maxRetries?: number;
      delay?: number;
    }
  ): T {
    return createRetryableApi(fn, options) as T;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    cache.clear();
  }

  /**
   * 获取请求实例（用于特殊场景）
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建并导出增强版API客户端
export const apiClient = new EnhancedApiClient();

// 导出默认配置
export default apiClient;