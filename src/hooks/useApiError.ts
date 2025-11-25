/**
 * API错误处理React Hook
 * 提供统一的错误处理、重试和降级功能
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { message } from 'antd'

interface ApiError {
  code: string
  message: string
  status?: number
  config?: any
}

interface UseApiErrorOptions {
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  enableFallback?: boolean
  customErrorHandler?: (error: ApiError) => void
  showErrorNotification?: boolean
}

interface ApiState {
  loading: boolean
  error: ApiError | null
  retryCount: number
  data: any
}

export const useApiError = (options: UseApiErrorOptions = {}) => {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableFallback = true,
    customErrorHandler,
    showErrorNotification = true
  } = options

  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
    retryCount: 0,
    data: null
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 清理函数
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState(prev => ({ ...prev, loading: false, retryCount: 0 }))
  }, [])

  // 错误处理
  const handleError = useCallback((error: any, customMessage?: string) => {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '请求失败',
      status: error.status,
      config: error.config
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: apiError,
      retryCount: 0
    }))

    // 调用自定义错误处理器
    if (customErrorHandler) {
      customErrorHandler(apiError)
    }

    // 显示错误通知
    if (showErrorNotification && !options.silent) {
      const errorMessage = customMessage || apiError.message || '操作失败'
      message.error(errorMessage, {
        duration: apiError.status === 401 ? 4 : 6,
        style: {
          marginTop: '20vh'
        }
      })
    }

    // 对于认证错误，清除token
    if (apiError.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      // 可以在这里添加跳转到登录页的逻辑
    }

    return apiError
  }, [customErrorHandler, showErrorNotification, options.silent])

  // 重试机制
  const retry = useCallback(async (apiCall: () => Promise<any>, retryDelayTime?: number) => {
    if (!enableRetry || state.retryCount >= maxRetries) {
      return false
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      loading: true,
      error: null
    }))

    // 延迟重试
    const delay = retryDelayTime || retryDelay
    await new Promise(resolve => {
      retryTimeoutRef.current = setTimeout(resolve, delay)
    })

    try {
      const result = await apiCall()
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        retryCount: 0,
        data: result
      }))
      return result
    } catch (error) {
      return false
    }
  }, [enableRetry, maxRetries, retryDelay, state.retryCount])

  // 通用API调用方法
  const executeApi = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: {
      fallbackData?: T | (() => T)
      customMessage?: string
      customErrorHandler?: (error: ApiError) => void
      silent?: boolean
    }
  ): Promise<T | null> => {
    try {
      // 清理之前的请求
      cleanup()

      // 创建新的AbortController
      abortControllerRef.current = new AbortController()

      setState(prev => ({ ...prev, loading: true, error: null }))

      const result = await apiCall()

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        retryCount: 0,
        data: result
      }))

      return result
    } catch (error) {
      const apiError = handleError(error, options?.customMessage)

      // 尝试重试
      if (enableRetry && state.retryCount < maxRetries) {
        const retryResult = await retry(apiCall, options?.customMessage ? 0 : undefined)
        if (retryResult !== false) {
          return retryResult
        }
      }

      // 使用降级数据
      if (enableFallback && options?.fallbackData) {
        const fallbackData = typeof options.fallbackData === 'function'
          ? (options.fallbackData as () => T)()
          : options.fallbackData

        setState(prev => ({
          ...prev,
          loading: false,
          data: fallbackData
        }))

        return fallbackData
      }

      return null
    }
  }, [cleanup, handleError, retry, enableRetry, maxRetries, enableFallback, state.retryCount])

  // 带重试的API调用
  const executeWithRetry = useCallback(async <T>(
    apiCall: () => Promise<T>,
    customMessage?: string
  ): Promise<T | null> => {
    return executeApi(apiCall, { customMessage })
  }, [executeApi])

  // 带降级的API调用
  const executeWithFallback = useCallback(async <T>(
    apiCall: () => Promise<T>,
    fallbackData: T | (() => T),
    customMessage?: string
  ): Promise<T> => {
    return executeApi(apiCall, { fallbackData, customMessage })
  }, [executeApi])

  // 带重试和降级的API调用
  const executeWithRetryAndFallback = useCallback(async <T>(
    apiCall: () => Promise<T>,
    fallbackData: T | (() => T),
    customMessage?: string
  ): Promise<T> => {
    return executeApi(apiCall, { fallbackData, customMessage })
  }, [executeApi])

  // 批量API调用
  const executeBatch = useCallback(async <T>(
    apiCalls: Array<() => Promise<T>>,
    options?: {
      continueOnError?: boolean
      customMessage?: string
    }
  ): Promise<{ results: T[]; errors: any[] }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const promises = apiCalls.map(apiCall =>
        apiCall().catch(error => ({ error, success: false }))
      )

      const results = await Promise.all(promises)

      const successResults: T[] = []
      const errors: any[] = []

      results.forEach((result, index) => {
        if ((result as any).success === false) {
          errors.push({
            index,
            error: (result as any).error,
            apiCall: apiCalls[index]
          })
        } else {
          successResults.push(result as T)
        }
      })

      setState(prev => ({
        ...prev,
        loading: false,
        error: errors.length > 0 ? errors[0].error : null,
        data: successResults.length > 0 ? successResults : null
      }))

      if (errors.length > 0 && !options?.continueOnError && !options?.silent) {
        handleError(errors[0].error, options?.customMessage)
      }

      return { results: successResults, errors }
    } catch (error) {
      const apiError = handleError(error, options?.customMessage)
      return { results: [], errors: [{ error: apiError, index: 0, apiCall: null }] }
    }
  }, [executeApi, handleError])

  // 重置状态
  const reset = useCallback(() => {
    cleanup()
    setState({
      loading: false,
      error: null,
      retryCount: 0,
      data: null
    })
  }, [cleanup])

  // 手动设置错误
  const setError = useCallback((error: ApiError) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
      retryCount: 0
    }))
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    ...state,
    executeApi,
    executeWithRetry,
    executeWithFallback,
    executeWithRetryAndFallback,
    executeBatch,
    retry,
    reset,
    setError,
    handleError
  }
}

export default useApiError