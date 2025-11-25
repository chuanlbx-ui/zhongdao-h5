import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/shop', icon: '🏪', label: '店铺' },
    { path: '/profile', icon: '👤', label: '我的' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-red-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Layout