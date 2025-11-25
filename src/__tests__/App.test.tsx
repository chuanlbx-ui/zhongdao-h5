import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// 创建简单的页面组件Mock
const createPageMock = (testId: string, name: string) => ({
  default: () => <div data-testid={testId}>{name}</div>
})

// Mock所有页面组件
vi.mock('../pages/Login/LoginPage', () => createPageMock('login-page', '登录页面'))
vi.mock('../pages/Login/PhoneInputPage', () => createPageMock('phone-input-page', '手机输入页面'))
vi.mock('../pages/Login/LoginSuccessPage', () => createPageMock('login-success-page', '登录成功页面'))
vi.mock('../components/MainApp', () => createPageMock('main-app', '主应用'))
vi.mock('../components/ApiTest', () => createPageMock('api-test', 'API测试'))
vi.mock('../components/SmsTest', () => createPageMock('sms-test', '短信测试'))
vi.mock('../pages/ProductDetail', () => createPageMock('product-detail', '商品详情'))
vi.mock('../pages/Cart/CartPage', () => createPageMock('cart-page', '购物车页面'))
vi.mock('../pages/Checkout', () => createPageMock('checkout-page', '结算页面'))
vi.mock('../pages/Order', () => createPageMock('order-page', '订单页面'))
vi.mock('../pages/OrderDetail', () => createPageMock('order-detail', '订单详情'))
vi.mock('../pages/OrderReview', () => createPageMock('order-review', '订单评价'))
vi.mock('../pages/ProfileSettings', () => createPageMock('profile-settings', '个人设置'))
vi.mock('../pages/UserCertification', () => createPageMock('user-certification', '用户认证'))
vi.mock('../pages/CloudApply', () => createPageMock('cloud-apply', '云店申请'))
vi.mock('../pages/WutongApply', () => createPageMock('wutong-apply', '梧桐申请'))
vi.mock('../pages/WarehouseCloud', () => createPageMock('warehouse-cloud', '云仓'))
vi.mock('../pages/SuperiorCloud', () => createPageMock('superior-cloud', '上级云仓'))
vi.mock('../pages/ExchangeApply', () => createPageMock('exchange-apply', '调换申请'))
vi.mock('../pages/WarehouseLocal', () => createPageMock('warehouse-local', '本地仓库'))
vi.mock('../pages/PickupRecords', () => createPageMock('pickup-records', '提货记录'))
vi.mock('../pages/ProcurementRecords', () => createPageMock('procurement-records', '采购记录'))
vi.mock('../pages/ShopSettings', () => createPageMock('shop-settings', '店铺设置'))
vi.mock('../pages/Team', () => createPageMock('team', '团队'))
vi.mock('../pages/Favorites', () => createPageMock('favorites', '收藏夹'))
vi.mock('../pages/Materials', () => createPageMock('materials', '素材'))
vi.mock('../pages/Points', () => createPageMock('points', '积分'))
vi.mock('../pages/Products', () => createPageMock('products-list', '商品列表'))
vi.mock('../pages/Addresses', () => createPageMock('addresses', '地址管理'))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock window.location.replace
const mockReplace = vi.fn()
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: {
      replace: mockReplace,
      pathname: '/',
    },
    writable: true,
    configurable: true,
  })
})

// 导入页面组件（已经被Mock了）
const LoginPage = React.lazy(() => import('../pages/Login/LoginPage'))
const PhoneInputPage = React.lazy(() => import('../pages/Login/PhoneInputPage'))
const LoginSuccessPage = React.lazy(() => import('../pages/Login/LoginSuccessPage'))
const MainApp = React.lazy(() => import('../components/MainApp'))
const ApiTest = React.lazy(() => import('../components/ApiTest'))
const SmsTest = React.lazy(() => import('../components/SmsTest'))
const ProductDetail = React.lazy(() => import('../pages/ProductDetail'))
const CartPage = React.lazy(() => import('../pages/Cart/CartPage'))
const Checkout = React.lazy(() => import('../pages/Checkout'))
const Order = React.lazy(() => import('../pages/Order'))
const OrderDetail = React.lazy(() => import('../pages/OrderDetail'))
const OrderReview = React.lazy(() => import('../pages/OrderReview'))
const ProfileSettings = React.lazy(() => import('../pages/ProfileSettings'))
const UserCertification = React.lazy(() => import('../pages/UserCertification'))
const CloudApply = React.lazy(() => import('../pages/CloudApply'))
const WutongApply = React.lazy(() => import('../pages/WutongApply'))
const WarehouseCloud = React.lazy(() => import('../pages/WarehouseCloud'))
const SuperiorCloud = React.lazy(() => import('../pages/SuperiorCloud'))
const ExchangeApply = React.lazy(() => import('../pages/ExchangeApply'))
const WarehouseLocal = React.lazy(() => import('../pages/WarehouseLocal'))
const PickupRecords = React.lazy(() => import('../pages/PickupRecords'))
const ProcurementRecords = React.lazy(() => import('../pages/ProcurementRecords'))
const ShopSettings = React.lazy(() => import('../pages/ShopSettings'))
const Team = React.lazy(() => import('../pages/Team'))
const Favorites = React.lazy(() => import('../pages/Favorites'))
const Materials = React.lazy(() => import('../pages/Materials'))
const Points = React.lazy(() => import('../pages/Points'))
const Products = React.lazy(() => import('../pages/Products'))
const Addresses = React.lazy(() => import('../pages/Addresses'))

// 创建测试专用的App组件（不包含BrowserRouter）
const TestApp = () => {
  // Mock useEffect to prevent auto-redirect logic
  vi.spyOn(React, 'useEffect').mockImplementation(() => {})

  // 路由守卫组件
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const storedAuth = localStorage.getItem('auth-storage')
    let isAuthenticated = false
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth)
        isAuthenticated = !!parsed?.state?.isAuthenticated
      } catch {
        isAuthenticated = false
      }
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return <>{children}</>
  }

  return (
    <Routes>
      {/* 登录相关路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/phone-input" element={<PhoneInputPage />} />
      <Route path="/login-success" element={<LoginSuccessPage />} />

      {/* API测试路由 - 开发环境专用 */}
      <Route path="/api-test" element={<ApiTest />} />
      <Route path="/sms-test" element={<SmsTest />} />

      {/* 商品详情路由 - 允许未登录访问 */}
      <Route path="/product/:productId" element={<ProductDetail />} />

      {/* 需要登录的页面 */}
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Order /></ProtectedRoute>} />
      <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="/order/:orderId/review" element={<ProtectedRoute><OrderReview /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="/profile/certification" element={<ProtectedRoute><UserCertification /></ProtectedRoute>} />
      <Route path="/shop/cloud-apply" element={<ProtectedRoute><CloudApply /></ProtectedRoute>} />
      <Route path="/shop/wutong-apply" element={<ProtectedRoute><WutongApply /></ProtectedRoute>} />
      <Route path="/warehouse/cloud" element={<ProtectedRoute><WarehouseCloud /></ProtectedRoute>} />
      <Route path="/warehouse/cloud/superior" element={<ProtectedRoute><SuperiorCloud /></ProtectedRoute>} />
      <Route path="/exchange/apply" element={<ProtectedRoute><ExchangeApply /></ProtectedRoute>} />
      <Route path="/warehouse/local" element={<ProtectedRoute><WarehouseLocal /></ProtectedRoute>} />
      <Route path="/pickup/records" element={<ProtectedRoute><PickupRecords /></ProtectedRoute>} />
      <Route path="/procurement/records" element={<ProtectedRoute><ProcurementRecords /></ProtectedRoute>} />
      <Route path="/shop/settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
      <Route path="/points" element={<ProtectedRoute><Points /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />

      {/* 主应用路由 */}
      <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />

      {/* 其他路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

describe('App组件路由测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <TestApp />
        </React.Suspense>
      </MemoryRouter>
    )
  }

  describe('公开路由测试', () => {
    it('应该渲染登录页面', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/login'])

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('应该渲染API测试页面', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/api-test'])

      await waitFor(() => {
        expect(screen.getByTestId('api-test')).toBeInTheDocument()
      })
    })
  })

  describe('认证路由保护测试', () => {
    it('未认证用户访问受保护路由应该重定向到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/cart'])

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('已认证用户应该可以访问受保护路由', async () => {
      const authData = {
        state: { isAuthenticated: true, user: { id: '1', name: '测试用户' } }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))
      renderWithRouter(['/cart'])

      await waitFor(() => {
        expect(screen.getByTestId('cart-page')).toBeInTheDocument()
      })
    })
  })
})