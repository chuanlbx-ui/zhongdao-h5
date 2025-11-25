import React, { useState } from 'react'
import { smsService } from '@/api/sms'

const SmsTest: React.FC = () => {
  const [phone, setPhone] = useState('13800138000')
  const [code, setCode] = useState('')
  const [requestId, setRequestId] = useState('')
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testSendSms = async () => {
    setIsLoading(true)
    setResult('')
    
    try {
      console.log('🚀 开始测试发送短信...')
      const response = await smsService.sendSmsCode({ phone, type: 'login' })
      console.log('📤 发送结果:', response)
      
      if (response.success) {
        setResult(`✅ 发送成功: ${response.message}`)
        setRequestId(response.data?.requestId || '')
        console.log('🔢 开发环境验证码: 123456')
      } else {
        setResult(`❌ 发送失败: ${response.message}`)
      }
    } catch (error: any) {
      console.error('💥 测试失败:', error)
      setResult(`💥 错误: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testVerifySms = async () => {
    if (!code) {
      setResult('请输入验证码')
      return
    }

    setIsLoading(true)
    setResult('')
    
    try {
      console.log('🔍 开始验证短信验证码...')
      const response = await smsService.verifySmsCode({ 
        phone, 
        code, 
        requestId: requestId || `mock_${Date.now()}`
      })
      console.log('📤 验证结果:', response)
      
      if (response.success) {
        setResult(`✅ 验证成功: ${response.message}`)
        if (response.data?.token) {
          console.log('🔑 获取到token:', response.data.token)
        }
      } else {
        setResult(`❌ 验证失败: ${response.message}`)
      }
    } catch (error: any) {
      console.error('💥 验证失败:', error)
      setResult(`💥 错误: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">短信功能测试</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            手机号
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入手机号"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={11}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            验证码（开发环境固定为123456）
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入验证码"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={testSendSms}
            disabled={isLoading || !phone || phone.length !== 11}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '发送中...' : '发送验证码'}
          </button>
          
          <button
            onClick={testVerifySms}
            disabled={isLoading || !code || code.length !== 6}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '验证中...' : '验证验证码'}
          </button>
        </div>

        {result && (
          <div className={`p-3 rounded-md text-sm ${
            result.startsWith('✅') ? 'bg-green-50 text-green-800' :
            result.startsWith('❌') ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}>
            {result}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">开发环境说明：</p>
          <ul className="space-y-1">
            <li>• 验证码固定为：<strong>123456</strong></li>
            <li>• 任何手机号都可以使用</li>
            <li>• 控制台会显示详细日志</li>
            <li>• 失败时会自动使用模拟数据</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SmsTest