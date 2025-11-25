import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// CSRF令牌管理
let csrfToken: string | null = null
let csrfInitialized = false

// 从cookie中读取CSRF令牌
const getCSRFTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf_token') {
      return decodeURIComponent(value)
    }
  }
  return null
}

// 初始化CSRF令牌
const initCSRFToken = async (): Promise<void> => {
  if (csrfInitialized) return
  
  // 从cookie中读取CSRF令牌
  csrfToken = getCSRFTokenFromCookie()
  csrfInitialized = true
  
  if (csrfToken) {
    console.log('CSRF令牌已初始化:', csrfToken.substring(0, 8) + '...')
  } else {
    console.log('未找到CSRF令牌，将在首次GET请求后获取')
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 允许携带cookie
    })

    // 请求拦截器 - 添加 token 和 CSRF
    this.client.interceptors.request.use(
      async (config) => {
        // 添加认证token
        let token = localStorage.getItem('auth_token')
        if (!token) {
          const authStorage = localStorage.getItem('auth-storage')
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage)
              token = parsed?.state?.token || null
            } catch (_) {
              token = null
            }
          }
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加CSRF令牌（对于非GET请求）
        if (config.method && config.method.toLowerCase() !== 'get') {
          if (!csrfToken) {
            csrfToken = getCSRFTokenFromCookie()
          }
          
          if (csrfToken) {
            // 添加到请求头
            config.headers['x-csrf-token'] = csrfToken
            
            // 如果是POST请求，也添加到请求体
            if (config.method.toLowerCase() === 'post' && config.data) {
              if (typeof config.data === 'object') {
                config.data._csrf = csrfToken
              } else if (typeof config.data === 'string') {
                try {
                  const dataObj = JSON.parse(config.data)
                  dataObj._csrf = csrfToken
                  config.data = JSON.stringify(dataObj)
                } catch (e) {
                  // 如果不是JSON，保持原样
                }
              }
            }
          } else {
            console.warn('未找到CSRF令牌，但继续请求')
          }
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        // 详细错误日志
        console.error('API请求错误详情:', {
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          },
          response: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
          }
        })

        // 处理CORS错误
        if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked')) {
          console.error('CORS错误检测 - 请检查后端CORS配置')
        }

        // 处理CSRF错误
        if (error.response?.status === 403 && error.response?.data?.error?.code === 'FORBIDDEN') {
          console.warn('CSRF令牌错误，尝试重新获取...')
          csrfToken = getCSRFTokenFromCookie()
          
          // 如果是CSRF相关错误，提示用户重试
          if (error.response?.data?.error?.message?.includes('CSRF')) {
            console.error('CSRF令牌错误:', error.response.data.error.message)
          }
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
        }
        return Promise.reject(error.response?.data || error)
      }
    )
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T, T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T, T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T, T>(url, data, config)
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T, T>(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T, T>(url, config)
  }
}

export const apiClient = new ApiClient()
