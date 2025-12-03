import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // 确保CSS在React组件之前加载
import App from './App'
import { appConfig, validateConfig } from './config'

// 验证并初始化配置
validateConfig()

// 将配置挂载到全局对象，方便调试和访问
;(window as any).__APP_CONFIG__ = appConfig

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
