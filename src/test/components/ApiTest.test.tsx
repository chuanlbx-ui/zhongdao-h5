import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiTest from '../../components/ApiTest'
import { productApi, userApi } from '@/api'

// Mock the API modules
vi.mock('@/api', () => ({
  productApi: {
    getCategories: vi.fn(),
    getList: vi.fn(),
  },
  userApi: {
    getLevelProgress: vi.fn(),
  },
}))

const mockProductApi = productApi as any
const mockUserApi = userApi as any

describe('ApiTest组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to reduce noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该正确渲染组件标题和测试结果说明', async () => {
    // Mock the useEffect to prevent auto-running during render
    vi.spyOn(React, 'useEffect').mockImplementation(() => {})

    await act(async () => {
      render(<ApiTest />)
    })

    expect(screen.getByText('API集成测试')).toBeInTheDocument()
    expect(screen.getByText('测试结果说明：')).toBeInTheDocument()
    expect(screen.getByText(/商品分类和列表API：应该成功，不需要用户登录/)).toBeInTheDocument()
    expect(screen.getByText(/用户相关API：需要登录后才会成功，未登录时返回401是正常的/)).toBeInTheDocument()
    expect(screen.getByText(/连接错误：表示后端服务未启动或网络问题/)).toBeInTheDocument()
  })

  it('应该在组件加载时自动运行测试', async () => {
    mockProductApi.getCategories.mockResolvedValue({ success: true, data: [] })
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue(new Error('Unauthorized'))

    render(<ApiTest />)

    await waitFor(() => {
      expect(mockProductApi.getCategories).toHaveBeenCalledTimes(1)
      expect(mockProductApi.getList).toHaveBeenCalledTimes(1)
      expect(mockUserApi.getLevelProgress).toHaveBeenCalledTimes(1)
    })
  })

  it('应该正确处理成功的API响应', async () => {
    const mockCategories = { success: true, data: [{ id: 1, name: '测试分类' }] }
    const mockProducts = { success: true, data: { total: 5 } }

    mockProductApi.getCategories.mockResolvedValue(mockCategories)
    mockProductApi.getList.mockResolvedValue(mockProducts)
    mockUserApi.getLevelProgress.mockRejectedValue({ response: { status: 401 } })

    render(<ApiTest />)

    await waitFor(() => {
      expect(screen.getByText(/✅ 商品分类API成功/)).toBeInTheDocument()
      expect(screen.getByText(/✅ 商品列表API成功: 找到 5 个商品/)).toBeInTheDocument()
      expect(screen.getByText(/⚠️ 用户等级进度API需要登录/)).toBeInTheDocument()
    })
  })

  it('应该正确处理API错误', async () => {
    const categoryError = new Error('Network Error')
    const productError = { response: { status: 500, data: { message: 'Server Error' } } }

    mockProductApi.getCategories.mockRejectedValue(categoryError)
    mockProductApi.getList.mockRejectedValue(productError)
    mockUserApi.getLevelProgress.mockRejectedValue(new Error('Unauthorized'))

    render(<ApiTest />)

    await waitFor(() => {
      expect(screen.getByText(/❌ 商品分类API失败: Network Error/)).toBeInTheDocument()
      expect(screen.getByText(/❌ 商品列表API失败:/)).toBeInTheDocument()
      expect(screen.getByText(/状态码: 500/)).toBeInTheDocument()
    })
  })

  it('应该正确处理401认证错误', async () => {
    mockProductApi.getCategories.mockResolvedValue({ success: true, data: [] })
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue({
      response: { status: 401 },
      message: 'Unauthorized'
    })

    render(<ApiTest />)

    await waitFor(() => {
      expect(screen.getByText(/⚠️ 用户等级进度API需要登录: Unauthorized/)).toBeInTheDocument()
      expect(screen.getByText(/ℹ️ 这是正常的 - 需要用户登录后才能访问/)).toBeInTheDocument()
    })
  })

  it('应该支持手动重新运行测试', async () => {
    mockProductApi.getCategories.mockResolvedValue({ success: true, data: [] })
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue(new Error('Unauthorized'))

    render(<ApiTest />)

    // 等待初始测试完成
    await waitFor(() => {
      expect(mockProductApi.getCategories).toHaveBeenCalledTimes(1)
    })

    // 清除调用记录
    vi.clearAllMocks()

    // 点击重新测试按钮
    const rerunButton = screen.getByRole('button', { name: '重新测试' })
    await userEvent.click(rerunButton)

    // 验证API被重新调用
    await waitFor(() => {
      expect(mockProductApi.getCategories).toHaveBeenCalledTimes(1)
      expect(mockProductApi.getList).toHaveBeenCalledTimes(1)
      expect(mockUserApi.getLevelProgress).toHaveBeenCalledTimes(1)
    })
  })

  it('应该在测试过程中显示正确的按钮状态', async () => {
    // 模拟慢速API调用
    mockProductApi.getCategories.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue(new Error('Unauthorized'))

    render(<ApiTest />)

    // 检查按钮在测试中的状态
    expect(screen.getByRole('button', { name: '测试中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '测试中...' })).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')

    // 等待测试完成
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '重新测试' })).not.toBeDisabled()
    }, { timeout: 200 })
  })

  it('应该正确显示时间戳', async () => {
    mockProductApi.getCategories.mockResolvedValue({ success: true, data: [] })
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue(new Error('Unauthorized'))

    render(<ApiTest />)

    await waitFor(() => {
      // 检查是否包含时间戳格式 (HH:MM:SS: message)
      const results = screen.getAllByText(/^\d{2}:\d{2}:\d{2}: .*/)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  it('应该正确处理测试过程中的异常', async () => {
    // 模拟一个意外的错误
    mockProductApi.getCategories.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    render(<ApiTest />)

    await waitFor(() => {
      expect(screen.getByText(/💥 测试过程中发生错误: Unexpected error/)).toBeInTheDocument()
    })
  })

  it('应该正确显示不同类型的测试结果消息', async () => {
    mockProductApi.getCategories.mockResolvedValue({ success: true, data: [] })
    mockProductApi.getList.mockResolvedValue({ success: true, data: { total: 0 } })
    mockUserApi.getLevelProgress.mockRejectedValue({ response: { status: 401 } })

    render(<ApiTest />)

    await waitFor(() => {
      // 检查成功消息（绿色）
      const successMessages = screen.getAllByText(/✅/)
      expect(successMessages.length).toBeGreaterThan(0)

      // 检查警告消息（黄色）
      const warningMessages = screen.getAllByText(/⚠️/)
      expect(warningMessages.length).toBeGreaterThan(0)

      // 检查信息消息（蓝色）
      const infoMessages = screen.getAllByText(/ℹ️/)
      expect(infoMessages.length).toBeGreaterThan(0)
    })
  })

  it('应该在没有测试结果时显示加载状态', async () => {
    mockProductApi.getCategories.mockImplementation(() => new Promise(() => {})) // 永不解决
    mockProductApi.getList.mockImplementation(() => new Promise(() => {}))
    mockUserApi.getLevelProgress.mockImplementation(() => new Promise(() => {}))

    await act(async () => {
      render(<ApiTest />)
    })

    expect(screen.getByText('正在运行测试...')).toBeInTheDocument()
  })
})