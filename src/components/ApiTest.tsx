import React, { useState, useEffect } from 'react'
import { productApi, userApi } from '@/api'

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runApiTests = async () => {
    setIsTesting(true)
    setTestResults([])
    
    try {
      addResult('🚀 开始API集成测试...')
      
      // 测试1: 商品分类API (不需要认证)
      try {
        addResult('📦 测试商品分类API...')
        const categoriesResponse = await productApi.getCategories()
        addResult(`✅ 商品分类API成功: ${JSON.stringify(categoriesResponse).substring(0, 100)}...`)
      } catch (error: any) {
        addResult(`❌ 商品分类API失败: ${error.message}`)
        if (error.response) {
          addResult(`   状态码: ${error.response.status}, 数据: ${JSON.stringify(error.response.data)}`)
        }
      }

      // 测试2: 商品列表API (不需要认证)
      try {
        addResult('🛍️ 测试商品列表API...')
        const productsResponse = await productApi.getList({ page: 1, perPage: 3 })
        addResult(`✅ 商品列表API成功: 找到 ${productsResponse.total} 个商品`)
      } catch (error: any) {
        addResult(`❌ 商品列表API失败: ${error.message}`)
        if (error.response) {
          addResult(`   状态码: ${error.response.status}, 数据: ${JSON.stringify(error.response.data)}`)
        }
      }

      // 测试3: 用户等级进度API (需要认证 - 会失败但显示错误信息)
      try {
        addResult('👤 测试用户等级进度API...')
        const levelResponse = await userApi.getLevelProgress()
        addResult(`✅ 用户等级进度API成功: ${JSON.stringify(levelResponse)}`)
      } catch (error: any) {
        addResult(`⚠️ 用户等级进度API需要登录: ${error.message}`)
        if (error.response?.status === 401) {
          addResult('   ℹ️ 这是正常的 - 需要用户登录后才能访问')
        } else if (error.response) {
          addResult(`   状态码: ${error.response.status}, 数据: ${JSON.stringify(error.response.data)}`)
        }
      }

      addResult('🎉 API测试完成！')
      
    } catch (error: any) {
      addResult(`💥 测试过程中发生错误: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    // 组件加载时自动运行一次测试
    runApiTests()
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API集成测试</h3>
        <button
          onClick={runApiTests}
          disabled={isTesting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTesting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
          }`}
        >
          {isTesting ? '测试中...' : '重新测试'}
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
        {testResults.length === 0 ? (
          <div className="text-gray-500 text-center py-4">正在运行测试...</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result.startsWith('❌') && <span className="text-red-600">{result}</span>}
              {result.startsWith('✅') && <span className="text-green-600">{result}</span>}
              {result.startsWith('⚠️') && <span className="text-yellow-600">{result}</span>}
              {result.startsWith('ℹ️') && <span className="text-blue-600">{result}</span>}
              {!result.match(/^[❌✅⚠️ℹ️]/) && <span className="text-gray-700">{result}</span>}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">测试结果说明：</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>商品分类和列表API</strong>：应该成功，不需要用户登录</li>
          <li>⚠️ <strong>用户相关API</strong>：需要登录后才会成功，未登录时返回401是正常的</li>
          <li>❌ <strong>连接错误</strong>：表示后端服务未启动或网络问题</li>
        </ul>
      </div>
    </div>
  )
}

export default ApiTest