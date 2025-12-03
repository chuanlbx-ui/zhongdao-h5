/**
 * 简单的API测试示例
 */

import { describe, it, expect } from 'vitest';
import { ApiResponse } from '../../types';

// Mock API函数
const mockApiCall = async (endpoint: string): Promise<ApiResponse> => {
  // 模拟API调用
  return {
    success: true,
    data: { message: `Mock response from ${endpoint}` }
  };
};

describe('简单API测试', () => {
  it('应该返回成功响应', async () => {
    const response = await mockApiCall('/test');

    expect(response.success).toBe(true);
    expect(response.data?.message).toBe('Mock response from /test');
  });

  it('应该处理错误响应', async () => {
    // 模拟错误
    const errorApiCall = async (): Promise<ApiResponse> => {
      throw new Error('Network error');
    };

    try {
      await errorApiCall();
      expect.fail('应该抛出错误');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});