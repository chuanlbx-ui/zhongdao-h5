import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// 创建简单的页面组件Mock
const LoginPage = () => <div data-testid="login-page">登录页面</div>
const PhoneInputPage = () => <div data-testid="phone-input-page">手机输入页面</div>
const LoginSuccessPage = () => <div data-testid="login-success-page">登录成功页面</div>
const MainApp = () => <div data-testid="main-app">主应用</div>
const ApiTest = () => <div data-testid="api-test">API测试</div>
const SmsTest = () => <div data-testid="sms-test">短信测试</div>
const CartPage = () => <div data-testid="cart-page">购物车页面</div>
const ProductDetail = () => <div data-testid="product-detail">商品详情</div>

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

// 简化的App组件
const SimpleApp = () => {
  return (
    <Routes>
      {/* 登录相关路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/phone-input" element={<PhoneInputPage />} />
      <Route path="/login-success" element={<LoginSuccessPage />} />

      {/* API测试路由 */}
      <Route path="/api-test" element={<ApiTest />} />
      <Route path="/sms-test" element={<SmsTest />} />

      {/* 商品详情路由 */}
      <Route path="/product/:productId" element={<ProductDetail />} />

      {/* 需要登录的页面 */}
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />

      {/* 主应用路由 */}
      <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />

      {/* 其他路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

describe('App组件简化路由测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <SimpleApp />
      </MemoryRouter>
    )
  }

  describe('公开路由测试', () => {
    it('应该渲染登录页面', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/login'])

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('应该渲染API测试页面', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/api-test'])

      expect(screen.getByTestId('api-test')).toBeInTheDocument()
    })

    it('应该渲染商品详情页面', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/product/123'])

      expect(screen.getByTestId('product-detail')).toBeInTheDocument()
    })
  })

  describe('认证路由保护测试', () => {
    it('未认证用户访问受保护路由应该重定向到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/cart'])

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('已认证用户应该可以访问受保护路由', async () => {
      const authData = {
        state: { isAuthenticated: true, user: { id: '1', name: '测试用户' } }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))
      renderWithRouter(['/cart'])

      expect(screen.getByTestId('cart-page')).toBeInTheDocument()
    })

    it('已认证用户访问首页应该显示主应用', async () => {
      const authData = {
        state: { isAuthenticated: true, user: { id: '1', name: '测试用户' } }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))
      renderWithRouter(['/'])

      expect(screen.getByTestId('main-app')).toBeInTheDocument()
    })
  })

  describe('路由重定向测试', () => {
    it('未匹配的路由应该重定向到首页（已认证用户）', async () => {
      const authData = {
        state: { isAuthenticated: true, user: { id: '1', name: '测试用户' } }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))
      renderWithRouter(['/unknown-route'])

      expect(screen.getByTestId('main-app')).toBeInTheDocument()
    })

    it('未匹配的路由应该重定向到登录页（未认证用户）', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      renderWithRouter(['/unknown-route'])

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })
})