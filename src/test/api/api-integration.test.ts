/**
 * API集成测试套件
 * 测试前端API与后端的对接
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { authApi, productApi, orderApi, pointsApi } from '../../api';
import { ApiResponse } from '../../types';

// API基础URL
const API_BASE = 'http://localhost:3000/api/v1';

// Mock数据
const mockUser = {
  id: 'test-user-001',
  phone: '13800138000',
  nickname: '测试用户',
  level: 'VIP',
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z'
};

const mockProduct = {
  id: 'test-product-001',
  name: '测试商品',
  description: '这是一个测试商品',
  price: 299.00,
  images: ['http://example.com/product.jpg'],
  status: 'active',
  stock: 100
};

const mockOrder = {
  id: 'test-order-001',
  userId: 'test-user-001',
  status: 'pending',
  totalAmount: 299.00,
  items: [{
    productId: 'test-product-001',
    quantity: 1,
    price: 299.00
  }]
};

// 设置MSW服务器
const server = setupServer(
  // 认证相关
  rest.post(`${API_BASE}/auth/wechat-login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 7200
        }
      })
    );
  }),

  rest.post(`${API_BASE}/auth/phone-login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 7200
        }
      })
    );
  }),

  // 用户信息
  rest.get(`${API_BASE}/users/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json<ApiResponse>({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: mockUser
      })
    );
  }),

  // 商品列表
  rest.get(`${API_BASE}/products`, (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const perPage = Number(req.url.searchParams.get('perPage')) || 10;

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          products: [mockProduct],
          pagination: {
            page,
            perPage,
            total: 1,
            totalPages: 1
          }
        }
      })
    );
  }),

  // 商品详情
  rest.get(`${API_BASE}/products/:id`, (req, res, ctx) => {
    const { id } = req.params;

    if (id !== mockProduct.id) {
      return res(
        ctx.status(404),
        ctx.json<ApiResponse>({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '商品不存在'
          }
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: mockProduct
      })
    );
  }),

  // 创建订单
  rest.post(`${API_BASE}/orders`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json<ApiResponse>({
        success: true,
        data: mockOrder
      })
    );
  }),

  // 积分余额
  rest.get(`${API_BASE}/points/balance`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          balance: 1000.00,
          frozenAmount: 0,
          totalIncome: 2000.00,
          totalExpense: 1000.00
        }
      })
    );
  }),

  // 积分转账
  rest.post(`${API_BASE}/points/transfer`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          transactionId: 'transfer-001',
          fromUserId: 'test-user-001',
          toUserId: 'test-user-002',
          amount: 100.00,
          fee: 1.00,
          status: 'success'
        }
      })
    );
  }),

  // 错误处理测试
  rest.get(`${API_BASE}/test/error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json<ApiResponse>({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        }
      })
    );
  })
);

describe('API集成测试', () => {
  beforeAll(() => {
    // 启动Mock服务器
    server.listen({
      onUnhandledRequest: 'warn'
    });
  });

  afterAll(() => {
    // 关闭Mock服务器
    server.close();
  });

  beforeEach(() => {
    // 清除localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // 重置所有handlers
    server.resetHandlers();
  });

  describe('认证API', () => {
    it('应该能够通过微信登录', async () => {
      const response = await authApi.wechatLogin({
        code: 'mock-wechat-code'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data.user.phone).toBe(mockUser.phone);
    });

    it('应该能够通过手机号登录', async () => {
      const response = await authApi.phoneLogin({
        phone: '13800138000',
        verificationCode: '123456'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
    });

    it('未登录时获取用户信息应该返回401', async () => {
      const response = await authApi.getProfile();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('UNAUTHORIZED');
    });
  });

  describe('商品API', () => {
    it('应该能够获取商品列表', async () => {
      const response = await productApi.getProducts({
        page: 1,
        perPage: 10
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('products');
      expect(response.data).toHaveProperty('pagination');
      expect(Array.isArray(response.data.products)).toBe(true);
      expect(response.data.products[0].name).toBe(mockProduct.name);
    });

    it('应该能够获取商品详情', async () => {
      const response = await productApi.getProduct(mockProduct.id);

      expect(response.success).toBe(true);
      expect(response.data.id).toBe(mockProduct.id);
      expect(response.data.name).toBe(mockProduct.name);
    });

    it('获取不存在的商品应该返回404', async () => {
      const response = await productApi.getProduct('invalid-id');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('订单API', () => {
    it('应该能够创建订单', async () => {
      const orderData = {
        items: [{
          productId: mockProduct.id,
          quantity: 1
        }],
        shippingAddress: {
          name: '张三',
          phone: '13800138000',
          address: '北京市朝阳区xxx街道xxx号'
        }
      };

      const response = await orderApi.createOrder(orderData);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data.status).toBe('pending');
      expect(response.data.totalAmount).toBe(299.00);
    });
  });

  describe('积分API', () => {
    it('应该能够获取积分余额', async () => {
      const response = await pointsApi.getBalance();

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('balance');
      expect(response.data.balance).toBe(1000.00);
    });

    it('应该能够进行积分转账', async () => {
      const transferData = {
        toUserId: 'test-user-002',
        amount: 100,
        remark: '测试转账'
      };

      const response = await pointsApi.transfer(transferData);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('transactionId');
      expect(response.data.amount).toBe(100.00);
      expect(response.data.fee).toBe(1.00);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理500错误', async () => {
      try {
        await fetch(`${API_BASE}/test/error`);
        // 如果没有抛出错误，测试失败
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response?.status).toBe(500);
      }
    });

    it('应该正确处理网络错误', async () => {
      // 使用无效的URL测试网络错误
      try {
        await fetch('http://invalid-url-test');
      } catch (error: any) {
        expect(error.code).toBe('ECONNREFUSED');
      }
    });
  });

  describe('响应时间测试', () => {
    it('API响应时间应该在合理范围内', async () => {
      const startTime = Date.now();
      await productApi.getProducts();
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // 1秒内响应
    });
  });

  describe('并发请求测试', () => {
    it('应该能够处理多个并发请求', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        productApi.getProduct(mockProduct.id)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(mockProduct.id);
      });
    });
  });
});