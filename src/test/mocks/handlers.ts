/**
 * MSW API Mock处理器
 */

import { rest } from 'msw';
import {
  User,
  Product,
  Order,
  PointsTransaction,
  ApiResponse
} from '../../types';

// API基础URL
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Mock数据
const mockUsers: User[] = [
  {
    id: 'user_001',
    phone: '13800138000',
    nickname: '测试用户',
    level: 'VIP',
    status: 'active',
    inviteCode: 'TEST123',
    totalOrders: 10,
    totalAmount: 5000,
    monthAmount: 1000,
    directMembers: 5,
    teamMembers: 20,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: '测试商品',
    description: '这是一个测试商品',
    images: ['https://example.com/product1.jpg'],
    categoryId: 'cat_001',
    price: 299.00,
    originalPrice: 399.00,
    stock: 100,
    sales: 50,
    status: 'active',
    tags: ['新品', '热销'],
    createdBy: 'user_001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// API处理器
export const handlers = [
  // 认证相关
  rest.post(`${API_BASE}/auth/wechat-login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          user: mockUsers[0],
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
          user: mockUsers[0],
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 7200
        }
      })
    );
  }),

  rest.post(`${API_BASE}/auth/send-verification-code`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: { message: '验证码已发送' }
      })
    );
  }),

  rest.post(`${API_BASE}/auth/refresh-token`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          token: 'new-mock-jwt-token',
          refreshToken: 'new-mock-refresh-token',
          expiresIn: 7200
        }
      })
    );
  }),

  // 用户相关
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
        data: mockUsers[0]
      })
    );
  }),

  rest.put(`${API_BASE}/users/profile`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: { ...mockUsers[0], ...req.body }
      })
    );
  }),

  // 商品相关
  rest.get(`${API_BASE}/products`, (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const perPage = Number(req.url.searchParams.get('perPage')) || 10;

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          products: mockProducts,
          pagination: {
            page,
            perPage,
            total: mockProducts.length,
            totalPages: Math.ceil(mockProducts.length / perPage)
          }
        }
      })
    );
  }),

  rest.get(`${API_BASE}/products/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
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
        data: product
      })
    );
  }),

  // 订单相关
  rest.get(`${API_BASE}/orders`, (req, res, ctx) => {
    const mockOrders: Order[] = [
      {
        id: 'order_001',
        userId: 'user_001',
        orderNo: 'ZD20241201001',
        items: [
          {
            productId: 'prod_001',
            quantity: 1,
            price: 299.00
          }
        ],
        totalAmount: 299.00,
        shippingFee: 10.00,
        discountAmount: 0,
        status: 'pending',
        paymentMethod: 'wechat',
        shippingAddress: {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '某某街道123号'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          orders: mockOrders,
          pagination: {
            page: 1,
            perPage: 10,
            total: mockOrders.length,
            totalPages: 1
          }
        }
      })
    );
  }),

  rest.post(`${API_BASE}/orders`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          id: 'order_002',
          orderNo: 'ZD20241201002',
          ...req.body
        }
      })
    );
  }),

  // 积分相关
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

  rest.get(`${API_BASE}/points/transactions`, (req, res, ctx) => {
    const mockTransactions: PointsTransaction[] = [
      {
        id: 'txn_001',
        userId: 'user_001',
        type: 'RECHARGE',
        amount: 100.00,
        balance: 1100.00,
        description: '充值',
        status: 'success',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          transactions: mockTransactions,
          pagination: {
            page: 1,
            perPage: 10,
            total: mockTransactions.length,
            totalPages: 1
          }
        }
      })
    );
  }),

  rest.post(`${API_BASE}/points/transfer`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          transactionId: 'txn_002',
          amount: 100.00,
          fee: 1.00,
          status: 'success'
        }
      })
    );
  }),

  // 错误测试
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
  }),

  // 文件上传
  rest.post(`${API_BASE}/upload`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<ApiResponse>({
        success: true,
        data: {
          url: 'https://example.com/uploaded.jpg',
          filename: 'image.jpg',
          size: 12345,
          mimeType: 'image/jpeg'
        }
      })
    );
  })
];