/**
 * H5前端错误处理使用示例
 * 演示如何在组件中使用增强的API错误处理功能
 */

import React, { useState, useEffect } from 'react'
import { Button, List, Card, Spin, Alert, Toast } from 'antd-mobile'
import { authApi, userApi, productApi, pointsApi } from '../api/enhanced-api'
import { useApiError } from '../hooks/useApiError'

// ==================== 示例1: 基础API调用 ====================
export const BasicApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const { executeApi, loading: apiLoading, error } = useApiError()

  const loadUserInfo = async () => {
    setLoading(true)
    try {
      const result = await executeApi(() => userApi.getProfile())
      if (result) {
        setUserInfo(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="基础API调用示例">
      <Button
        onClick={loadUserInfo}
        loading={loading || apiLoading}
        block
      >
        获取用户信息
      </Button>

      {error && (
        <Alert
          color='danger'
          content={`API调用失败: ${error.message}`}
          style={{ marginTop: 16 }}
        />
      )}

      {userInfo && (
        <div style={{ marginTop: 16 }}>
          <p>用户昵称: {userInfo.nickname}</p>
          <p>用户等级: {userInfo.level}</p>
          <p>通券余额: {userInfo.pointsBalance}</p>
        </div>
      )}
    </Card>
  )
}

// ==================== 示例2: 带重试的API调用 ====================
export const RetryApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const { executeWithRetry, loading: apiLoading } = useApiError({
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1500,
    showErrorNotification: true
  })

  const loadProductsWithRetry = async () => {
    setLoading(true)
    try {
      const result = await executeWithRetry(() => productApi.getList())
      if (result) {
        setProducts(result.data.items)
        Toast.show({ content: '商品列表加载成功', icon: 'success' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="带重试机制的API调用">
      <Button
        onClick={loadProductsWithRetry}
        loading={loading || apiLoading}
        color='primary'
        block
      >
        重试加载商品列表
      </Button>

      {products.length > 0 && (
        <List style={{ marginTop: 16 }}>
          {products.slice(0, 3).map((product: any) => (
            <List.Item key={product.id}>
              {product.name} - ¥{product.price}
            </List.Item>
          ))}
        </List>
      )}
    </Card>
  )
}

// ==================== 示例3: 带降级的API调用 ====================
export const FallbackApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [pointsBalance, setPointsBalance] = useState<any>(null)
  const { executeWithFallback, loading: apiLoading } = useApiError({
    enableFallback: true,
    showErrorNotification: false
  })

  const loadBalanceWithFallback = async () => {
    setLoading(true)
    try {
      // 即使API失败，也会返回降级数据
      const result = await executeWithFallback(
        () => pointsApi.getBalance(),
        // 降级数据函数
        () => ({
          data: {
            balance: 0,
            frozen: 0,
            availableBalance: 0
          },
          message: '使用离线数据'
        })
      )

      setPointsBalance(result.data)
      Toast.show({
        content: result.message || '余额查询完成',
        icon: result.success ? 'success' : 'fail'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="带降级数据的API调用">
      <Button
        onClick={loadBalanceWithFallback}
        loading={loading || apiLoading}
        color='warning'
        block
      >
        智能降级查询余额
      </Button>

      {pointsBalance && (
        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <p>当前余额: {pointsBalance.balance}</p>
          <p>冻结余额: {pointsBalance.frozen}</p>
          <p>可用余额: {pointsBalance.availableBalance}</p>
        </div>
      )}
    </Card>
  )
}

// ==================== 示例4: 批量API调用 ====================
export const BatchApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const { executeBatch, loading: apiLoading } = useApiError()

  const loadMultipleData = async () => {
    setLoading(true)
    try {
      const batchResult = await executeBatch([
        () => userApi.getProfile(),
        () => pointsApi.getBalance(),
        () => productApi.getList({ perPage: 5 })
      ], { continueOnError: true })

      setResults([
        { name: '用户信息', data: batchResult.results[0], error: batchResult.errors[0] },
        { name: '通券余额', data: batchResult.results[1], error: batchResult.errors[1] },
        { name: '商品列表', data: batchResult.results[2], error: batchResult.errors[2] }
      ])

      const successCount = batchResult.results.length
      const errorCount = batchResult.errors.length

      Toast.show({
        content: `批量加载完成: ${successCount}成功, ${errorCount}失败`,
        icon: errorCount === 0 ? 'success' : 'warning'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="批量API调用示例">
      <Button
        onClick={loadMultipleData}
        loading={loading || apiLoading}
        color='primary'
        block
      >
        批量加载核心数据
      </Button>

      {results.map((result, index) => (
        <div key={index} style={{ marginTop: 8, padding: 8, background: '#fafafa', borderRadius: 4 }}>
          <strong>{result.name}:</strong>
          {result.error ? (
            <span style={{ color: 'red' }}> 加载失败</span>
          ) : (
            <span style={{ color: 'green' }}> 加载成功</span>
          )}
        </div>
      ))}
    </Card>
  )
}

// ==================== 示例5: 自定义错误处理 ====================
export const CustomErrorExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { executeApi, handleError } = useApiError({
    customErrorHandler: (error) => {
      // 自定义错误处理逻辑
      if (error.status === 401) {
        Toast.show({ content: '登录已过期，请重新登录', icon: 'fail' })
        // 跳转到登录页
        // window.location.href = '/login'
      } else if (error.status >= 500) {
        Toast.show({ content: '服务器维护中，请稍后重试', icon: 'fail' })
      } else if (error.code === 'NETWORK_ERROR') {
        Toast.show({ content: '网络连接失败，请检查网络设置', icon: 'fail' })
      } else {
        Toast.show({ content: error.message || '操作失败', icon: 'fail' })
      }
    },
    showErrorNotification: false // 关闭默认通知，使用自定义处理
  })

  const handleApiCall = async () => {
    setLoading(true)
    try {
      const result = await executeApi(
        () => authApi.login({ code: 'invalid_code' }),
        {
          customMessage: '微信登录失败',
          fallbackData: () => ({
            success: false,
            message: '登录服务暂时不可用，请稍后重试'
          })
        }
      )

      if (result) {
        Toast.show({ content: '登录成功', icon: 'success' })
      }
    } finally {
      setLoading(false)
    }
  }

  const simulateError = async (errorType: string) => {
    const mockError = new Error(`模拟${errorType}错误`)

    switch (errorType) {
      case '网络':
        mockError.name = 'NETWORK_ERROR'
        break
      case '认证':
        mockError.name = 'AUTH_ERROR'
        break
      case '服务器':
        mockError.name = 'SERVER_ERROR'
        break
      default:
        mockError.name = 'UNKNOWN_ERROR'
    }

    handleError(mockError, `这是模拟的${errorType}错误`)
  }

  return (
    <Card title="自定义错误处理示例">
      <Button
        onClick={handleApiCall}
        loading={loading}
        color='primary'
        block
        style={{ marginBottom: 8 }}
      >
        测试登录API（会失败）
      </Button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Button size='small' onClick={() => simulateError('网络')}>
          模拟网络错误
        </Button>
        <Button size='small' onClick={() => simulateError('认证')}>
          模拟认证错误
        </Button>
        <Button size='small' onClick={() => simulateError('服务器')}>
          模拟服务器错误
        </Button>
      </div>

      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        此示例展示了如何自定义错误处理逻辑，包括不同类型错误的专门处理
      </div>
    </Card>
  )
}

// ==================== 主示例组件 ====================
export const ErrorHandlingExamples: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h2>错误处理机制使用示例</h2>

      <BasicApiExample />
      <div style={{ height: 16 }} />

      <RetryApiExample />
      <div style={{ height: 16 }} />

      <FallbackApiExample />
      <div style={{ height: 16 }} />

      <BatchApiExample />
      <div style={{ height: 16 }} />

      <CustomErrorExample />
    </div>
  )
}

export default ErrorHandlingExamples