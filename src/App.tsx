import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// 页面组件
import LoginPage from './pages/Login/LoginPage'
import PhoneInputPage from './pages/Login/PhoneInputPage'
import LoginSuccessPage from './pages/Login/LoginSuccessPage'
import PasswordLoginPage from './pages/Login/PasswordLoginPage'
import MainApp from './components/MainApp'
import ApiTest from './components/ApiTest'
import SmsTest from './components/SmsTest'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/Cart/CartPage'
import CheckoutPage from './pages/Checkout'
import OrderPage from './pages/Order'
import OrderDetailPage from './pages/OrderDetail'
import OrderReviewPage from './pages/OrderReview'
import ProfileSettingsPage from './pages/ProfileSettings'
import UserCertificationPage from './pages/UserCertification'
import CloudApplyPage from './pages/CloudApply'
import WutongApplyPage from './pages/WutongApply'
import WarehouseCloudPage from './pages/WarehouseCloud'
import SuperiorCloudPage from './pages/SuperiorCloud'
import ExchangeApplyPage from './pages/ExchangeApply'
import WarehouseLocalPage from './pages/WarehouseLocal'
import PickupRecordsPage from './pages/PickupRecords'
import ProcurementRecordsPage from './pages/ProcurementRecords'
import ShopSettingsPage from './pages/ShopSettings'
import TeamPage from './pages/Team'
import FavoritesPage from './pages/Favorites'
import MaterialsPage from './pages/Materials'
import PointsPage from './pages/Points'
import ProductsListPage from './pages/Products'
import AddressesPage from './pages/Addresses'
// import ProductManagementPage from './pages/ProductManagementPage' // 临时注释掉，有依赖问题

// 路由守卫组件 - 基于认证状态
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

const App: React.FC = () => {
  useEffect(() => {
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
    const currentPath = window.location.pathname
    if (isAuthenticated && ['/login', '/password-login', '/phone-input', '/login-success'].includes(currentPath)) {
      window.location.replace('/')
    }
  }, [])

  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        {/* 登录相关路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password-login" element={<PasswordLoginPage />} />
        <Route path="/phone-input" element={<PhoneInputPage />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />

        {/* API测试路由 - 开发环境专用 */}
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/sms-test" element={<SmsTest />} />

        {/* 商品详情路由 - 允许未登录访问 */}
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* 需要登录的页面 */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        } />

        <Route path="/order/:orderId" element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/order/:orderId/review" element={
          <ProtectedRoute>
            <OrderReviewPage />
          </ProtectedRoute>
        } />

        <Route path="/profile/settings" element={
          <ProtectedRoute>
            <ProfileSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/profile/certification" element={
          <ProtectedRoute>
            <UserCertificationPage />
          </ProtectedRoute>
        } />

        <Route path="/shop/cloud-apply" element={
          <ProtectedRoute>
            <CloudApplyPage />
          </ProtectedRoute>
        } />

        <Route path="/shop/wutong-apply" element={
          <ProtectedRoute>
            <WutongApplyPage />
          </ProtectedRoute>
        } />

        <Route path="/warehouse/cloud" element={
          <ProtectedRoute>
            <WarehouseCloudPage />
          </ProtectedRoute>
        } />

        <Route path="/warehouse/cloud/superior" element={
          <ProtectedRoute>
            <SuperiorCloudPage />
          </ProtectedRoute>
        } />

        <Route path="/exchange/apply" element={
          <ProtectedRoute>
            <ExchangeApplyPage />
          </ProtectedRoute>
        } />

        <Route path="/warehouse/local" element={
          <ProtectedRoute>
            <WarehouseLocalPage />
          </ProtectedRoute>
        } />

        <Route path="/pickup/records" element={
          <ProtectedRoute>
            <PickupRecordsPage />
          </ProtectedRoute>
        } />

        <Route path="/procurement/records" element={
          <ProtectedRoute>
            <ProcurementRecordsPage />
          </ProtectedRoute>
        } />

        <Route path="/shop/settings" element={
          <ProtectedRoute>
            <ShopSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/team" element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } />

        {/* 收藏页面 - 允许未登录浏览，但操作时需要登录 */}
        <Route path="/favorites" element={<FavoritesPage />} />

        <Route path="/materials" element={
          <ProtectedRoute>
            <MaterialsPage />
          </ProtectedRoute>
        } />

        <Route path="/points" element={
          <ProtectedRoute>
            <PointsPage />
          </ProtectedRoute>
        } />

        {/* 商品列表 - 允许未登录浏览 */}
        <Route path="/products" element={<ProductsListPage />} />

        <Route path="/addresses" element={
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        } />

                    {/* 商品管理页面路由 - 临时注释掉，有依赖问题 */}
        {/* <Route path="/admin/products" element={
          <ProtectedRoute>
            <ProductManagementPage />
          </ProtectedRoute>
        } /> */}

        {/* 主应用路由 - 允许未登录浏览 */}
        <Route path="/" element={<MainApp />} />

        {/* 其他路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App