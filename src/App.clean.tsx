import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// 页面组件
import LoginPage from './pages/Login/LoginPage'
import PhoneInputPage from './pages/Login/PhoneInputPage'
import LoginSuccessPage from './pages/Login/LoginSuccessPage'
import SimpleMainApp from './components/MainApp.simple'

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 临时绕过认证检查，直接显示子组件
  // TODO: 修复认证状态管理
  return <>{children}</>
}

const CleanApp: React.FC = () => {
  // 临时重定向逻辑
  useEffect(() => {
    // 检查是否有存储的认证信息
    const storedAuth = localStorage.getItem('auth-storage')
    const isAuthenticated = storedAuth && JSON.parse(storedAuth).state?.isAuthenticated

    // 如果有认证信息但当前在登录页，重定向到首页
    if (isAuthenticated && window.location.pathname === '/login') {
      window.location.href = '/'
    }

    // 如果没有认证信息且不在登录相关页面，重定向到登录页
    if (!isAuthenticated &&
        !['/login', '/phone-input', '/login-success'].includes(window.location.pathname)) {
      window.location.href = '/login'
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* 登录相关路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/phone-input" element={<PhoneInputPage />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />

        {/* 主应用路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SimpleMainApp />
            </ProtectedRoute>
          }
        />

        {/* 其他路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default CleanApp