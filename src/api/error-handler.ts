/**
 * API错误处理增强版
 * 统一处理各种API错误，提供友好的错误信息
 */

import { AxiosError } from 'axios';
import { notification } from 'antd';
import { ApiResponse } from '../types';

// 错误码映射表
const ERROR_CODE_MAP: Record<string, string> = {
  // 认证相关
  'UNAUTHORIZED': '请先登录',
  'TOKEN_EXPIRED': '登录已过期，请重新登录',
  'TOKEN_INVALID': '登录信息无效，请重新登录',
  'INSUFFICIENT_PERMISSIONS': '权限不足，无法执行此操作',

  // 业务相关
  'USER_NOT_FOUND': '用户不存在',
  'PRODUCT_NOT_FOUND': '商品不存在或已下架',
  'INSUFFICIENT_STOCK': '库存不足',
  'INSUFFICIENT_BALANCE': '余额不足',
  'ORDER_NOT_FOUND': '订单不存在',
  'ORDER_STATUS_ERROR': '订单状态错误，无法执行此操作',

  // 验证相关
  'VALIDATION_ERROR': '输入信息有误，请检查',
  'INVALID_PHONE': '手机号格式不正确',
  'INVALID_VERIFICATION_CODE': '验证码错误',
  'VERIFICATION_CODE_EXPIRED': '验证码已过期',

  // 系统相关
  'INTERNAL_ERROR': '服务器繁忙，请稍后再试',
  'DATABASE_ERROR': '数据访问失败，请稍后再试',
  'NETWORK_ERROR': '网络连接失败，请检查网络',
  'RATE_LIMIT_EXCEEDED': '操作过于频繁，请稍后再试',
  'MAINTENANCE_MODE': '系统维护中，请稍后再试',

  // 支付相关
  'PAYMENT_FAILED': '支付失败，请重试',
  'PAYMENT_TIMEOUT': '支付超时，请重试',
  'PAYMENT_CANCELLED': '支付已取消',
  'INSUFFICIENT_POINTS': '积分不足',
  'TRANSFER_LIMIT_EXCEEDED': '超出转账限额',
  'TRANSFER_FROZEN': '账户已被冻结，无法转账'
};

// HTTP状态码映射
const HTTP_STATUS_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '请先登录',
  403: '权限不足',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  409: '数据冲突',
  422: '输入数据验证失败',
  429: '操作过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
};

// 需要特殊处理的错误码
const SPECIAL_HANDLING_CODES = [
  'TOKEN_EXPIRED',
  'TOKEN_INVALID',
  'MAINTENANCE_MODE'
];

export interface ApiError extends AxiosError {
  code?: string;
  details?: any;
}

/**
 * 处理API错误
 */
export function handleApiError(error: any): ApiResponse {
  console.error('API Error:', error);

  // Axios错误
  if (error.isAxiosError) {
    return handleAxiosError(error as AxiosError);
  }

  // 网络错误
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络设置',
        details: error
      }
    };
  }

  // 未知错误
  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: '未知错误，请稍后再试',
      details: error
    }
  };
}

/**
 * 处理Axios错误
 */
function handleAxiosError(error: AxiosError): ApiResponse {
  const response = error.response;
  const config = error.config;

  // 有响应体的情况
  if (response) {
    const status = response.status;
    const data = response.data as ApiResponse;

    // 如果后端返回了标准格式错误
    if (data && data.error) {
      // 特殊处理某些错误码
      if (SPECIAL_HANDLING_CODES.includes(data.error.code)) {
        handleSpecialError(data.error.code);
      }

      return {
        success: false,
        error: {
          code: data.error.code,
          message: getErrorMessage(data.error.code, data.error.message),
          details: data.error.details
        }
      };
    }

    // 根据HTTP状态码返回通用错误
    return {
      success: false,
      error: {
        code: `HTTP_${status}`,
        message: HTTP_STATUS_MAP[status] || `HTTP错误: ${status}`,
        details: response.data
      }
    };
  }

  // 请求超时
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return {
      success: false,
      error: {
        code: 'REQUEST_TIMEOUT',
        message: '请求超时，请稍后再试',
        details: error
      }
    };
  }

  // 请求被取消
  if (error.code === 'ERR_CANCELED') {
    return {
      success: false,
      error: {
        code: 'REQUEST_CANCELLED',
        message: '请求已取消',
        details: error
      }
    };
  }

  // 其他网络错误
  return {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络',
      details: error
    }
  };
}

/**
 * 获取错误信息
 */
function getErrorMessage(code: string, originalMessage?: string): string {
  // 优先使用映射表中的错误信息
  if (ERROR_CODE_MAP[code]) {
    return ERROR_CODE_MAP[code];
  }

  // 使用原始错误信息
  if (originalMessage) {
    return originalMessage;
  }

  // 默认错误信息
  return `操作失败: ${code}`;
}

/**
 * 处理特殊错误
 */
function handleSpecialError(code: string): void {
  switch (code) {
    case 'TOKEN_EXPIRED':
    case 'TOKEN_INVALID':
      // 清除本地存储的认证信息
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');

      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      // 显示提示
      notification.warning({
        message: '登录已过期',
        description: '请重新登录',
        duration: 3
      });
      break;

    case 'MAINTENANCE_MODE':
      // 显示维护模式提示
      notification.error({
        message: '系统维护中',
        description: '系统正在进行维护，请稍后再试',
        duration: 0 // 不自动关闭
      });
      break;
  }
}

/**
 * 显示错误通知
 */
export function showErrorNotification(error: ApiResponse): void {
  if (!error.error) return;

  const { code, message } = error.error;

  // 根据错误类型选择不同的通知类型
  if (code?.startsWith('HTTP_4')) {
    // 客户端错误 - 警告
    notification.warning({
      message: '操作提示',
      description: message,
      duration: 3
    });
  } else if (code?.startsWith('HTTP_5')) {
    // 服务器错误 - 错误
    notification.error({
      message: '系统错误',
      description: message,
      duration: 5
    });
  } else {
    // 其他错误 - 信息
    notification.info({
      message: '提示',
      description: message,
      duration: 3
    });
  }
}

/**
 * 错误重试装饰器
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxRetries = 3,
  delay = 1000
): T {
  return (async (...args: Parameters<T>) => {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (error: any) {
        lastError = error;

        // 某些错误不应该重试
        const noRetryCodes = [
          'UNAUTHORIZED',
          'TOKEN_EXPIRED',
          'TOKEN_INVALID',
          'INSUFFICIENT_PERMISSIONS',
          'VALIDATION_ERROR'
        ];

        if (error.error?.code && noRetryCodes.includes(error.error.code)) {
          throw error;
        }

        // 最后一次重试，不再等待
        if (i === maxRetries) {
          throw error;
        }

        // 指数退避延迟
        await new Promise(resolve =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }

    throw lastError;
  }) as T;
}

/**
 * 创建带重试的API调用
 */
export function createRetryableApi<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  options?: {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: any) => boolean;
  }
): T {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = (error) => {
      // 默认重试条件：网络错误或5xx错误
      if (error.code === 'NETWORK_ERROR' || error.code === 'REQUEST_TIMEOUT') {
        return true;
      }
      if (error.error?.code?.startsWith('HTTP_5')) {
        return true;
      }
      return false;
    }
  } = options || {};

  return withRetry(apiCall, maxRetries, delay);
}

// 导出默认错误处理函数
export default {
  handleApiError,
  showErrorNotification,
  withRetry,
  createRetryableApi,
  ERROR_CODE_MAP,
  HTTP_STATUS_MAP
};