import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Layout from '../../components/Layout'

describe('Layout组件', () => {
  const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    )
  }

  it('应该正确渲染主要内容区域', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="main-content">测试内容</div>
      </Layout>
    )

    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  it('应该渲染所有导航项', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>)

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('店铺')).toBeInTheDocument()
    expect(screen.getByText('我的')).toBeInTheDocument()
  })

  it('应该在首页时高亮显示首页导航', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>, ['/'])

    const homeLink = screen.getByText('首页').closest('a')
    expect(homeLink).toHaveClass('text-red-500')
  })

  it('应该在店铺页面时高亮显示店铺导航', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>, ['/shop'])

    const shopLink = screen.getByText('店铺').closest('a')
    expect(shopLink).toHaveClass('text-red-500')
  })

  it('应该在个人页面时高亮显示我的导航', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>, ['/profile'])

    const profileLink = screen.getByText('我的').closest('a')
    expect(profileLink).toHaveClass('text-red-500')
  })

  it('非活动页面导航项应该显示为灰色', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>, ['/'])

    const shopLink = screen.getByText('店铺').closest('a')
    const profileLink = screen.getByText('我的').closest('a')

    expect(shopLink).toHaveClass('text-gray-600')
    expect(profileLink).toHaveClass('text-gray-600')
  })

  it('应该正确渲染导航图标', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>)

    expect(screen.getByText('🏠')).toBeInTheDocument() // 首页图标
    expect(screen.getByText('🏪')).toBeInTheDocument() // 店铺图标
    expect(screen.getByText('👤')).toBeInTheDocument() // 我的图标
  })

  it('导航链接应该指向正确的路径', () => {
    renderWithRouter(<Layout><div>内容</div></Layout>)

    const homeLink = screen.getByText('首页').closest('a')
    const shopLink = screen.getByText('店铺').closest('a')
    const profileLink = screen.getByText('我的').closest('a')

    expect(homeLink).toHaveAttribute('href', '/')
    expect(shopLink).toHaveAttribute('href', '/shop')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('应该具有正确的CSS类和结构', () => {
    const { container } = renderWithRouter(<Layout><div>内容</div></Layout>)

    // 检查主容器
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'flex-col')

    // 检查主要内容区域
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('flex-1', 'pb-16')

    // 检查底部导航
    const navElement = container.querySelector('nav')
    expect(navElement).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'bg-white', 'border-t', 'border-gray-200')
  })

  it('应该支持动态路由变化', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })

    const { rerender } = render(
      <Router location={history.location} navigator={history}>
        <Layout>
          <div>内容</div>
        </Layout>
      </Router>
    )

    // 初始状态：首页应该高亮
    expect(screen.getByText('首页').closest('a')).toHaveClass('text-red-500')

    // 模拟路由变化
    history.push('/shop')
    rerender(
      <Router location={history.location} navigator={history}>
        <Layout>
          <div>内容</div>
        </Layout>
      </Router>
    )

    // 路由变化后：店铺应该高亮
    expect(screen.getByText('店铺').closest('a')).toHaveClass('text-red-500')
  })
})