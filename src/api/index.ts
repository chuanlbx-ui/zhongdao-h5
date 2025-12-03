import { apiClient } from './client'

// ==================== 认证相关 ====================
export interface LoginParams {
  code: string  // 微信授权码
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    nickname: string
    avatarUrl: string
    phone: string
    level: string
  }
}

export const authApi = {
  login: (params: LoginParams) => 
    apiClient.post<LoginResponse>('/auth/login', params),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  getProfile: () => 
    apiClient.get('/auth/profile'),
}

// ==================== 商品相关 ====================
export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  specs: ProductSpec[]
}

export interface ProductSpec {
  id: string
  name: string
  price: number
  stock: number
}

export interface ProductListParams {
  page?: number
  perPage?: number
  categoryId?: string
}

export const productApi = {
  getList: (params: ProductListParams = {}) => 
    apiClient.get<{ items: Product[]; total: number }>('/products', { params }),
  
  getDetail: (id: string) => 
    apiClient.get<Product>(`/products/${id}`),
  
  getCategories: () => 
    apiClient.get('/products/categories'),
}

// ==================== 订单相关 ====================
export interface OrderItem {
  productId: string
  specId: string
  quantity: number
  price: number
}

export interface CreateOrderParams {
  items: OrderItem[]
  paymentMethod: 'WECHAT' | 'ALIPAY' | 'POINTS'
  shippingAddress?: {
    name: string
    phone: string
    address: string
  }
}

export interface Order {
  id: string
  orderNo: string
  items: OrderItem[]
  totalAmount: number
  status: string
  createdAt: string
}

export const orderApi = {
  create: (params: CreateOrderParams) => 
    apiClient.post<Order>('/orders', params),
  
  getList: (params: { page?: number; perPage?: number } = {}) => 
    apiClient.get<{ items: Order[]; total: number }>('/orders', { params }),
  
  getDetail: (id: string) => 
    apiClient.get<Order>(`/orders/${id}`),
  
  cancel: (id: string) => 
    apiClient.post(`/orders/${id}/cancel`),
}

// ==================== 支付相关 ====================
export interface PaymentParams {
  orderId: string
  amount: number
  method: string
}

export interface PaymentResult {
  success: boolean
  message: string
  data?: any
}

export const paymentApi = {
  initiate: (params: PaymentParams) => 
    apiClient.post<PaymentResult>('/payments/initiate', params),
  
  verify: (transactionId: string) => 
    apiClient.post(`/payments/verify/${transactionId}`),
}

// ==================== 购物车相关 ====================
export interface CartItem {
  productId: string
  specId: string
  quantity: number
}

export const cartApi = {
  getCart: () => 
    apiClient.get('/cart'),
  
  addItem: (item: CartItem) => 
    apiClient.post('/cart/items', item),
  
  updateItem: (productId: string, specId: string, quantity: number) => 
    apiClient.put(`/cart/items/${productId}/${specId}`, { quantity }),
  
  removeItem: (productId: string, specId: string) => 
    apiClient.delete(`/cart/items/${productId}/${specId}`),
  
  clear: () => 
    apiClient.post('/cart/clear'),
}

// ==================== 用户相关 ====================
export interface UserProfile {
  id: string
  nickname: string
  avatarUrl: string
  phone: string
  level: string
  teamPath: string
  parentId: string
  pointsBalance: number
  totalSales: number
  directCount: number
  teamCount: number
}

export const userApi = {
  getProfile: () => 
    apiClient.get<UserProfile>('/users/profile'),
  
  updateProfile: (data: Partial<UserProfile>) => 
    apiClient.put('/users/profile', data),
  
  getTeam: (params: { page?: number; perPage?: number } = {}) => 
    apiClient.get('/users/team', { params }),
  
  getStatistics: () => 
    apiClient.get('/users/statistics'),
  
  getLevelProgress: () =>
    apiClient.get<{
      currentLevel: string
      nextLevel: string
      requirement: { type: 'amount'; value: number }
      progress: { type: 'amount'; value: number }
    }>('/users/level/progress'),
}

// ==================== 积分相关 ====================
export const pointsApi = {
  getBalance: () => 
    apiClient.get('/points/balance'),
  
  getTransactions: (params: { page?: number; perPage?: number } = {}) => 
    apiClient.get('/points/transactions', { params }),
  
  transfer: (toUserId: string, amount: number) => 
    apiClient.post('/points/transfer', { toUserId, amount }),
}

// ==================== 佣金相关 ====================
export const commissionApi = {
  getList: (params: { page?: number; perPage?: number } = {}) => 
    apiClient.get('/commission', { params }),
  
  getStatistics: () => 
    apiClient.get('/commission/statistics'),
}

// ==================== Banner相关 ====================
export interface Banner {
  id: string
  image_url: string
  title: string
  description: string
  link_url: string
}

// API响应包装类型
export interface ApiResponse<T> {
  success: boolean
  data: T
}

export const bannerApi = {
  getList: () => 
    apiClient.get<ApiResponse<Banner[]>>('/banners'),
}
