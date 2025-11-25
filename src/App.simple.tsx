import React from 'react'

const SimpleApp: React.FC = () => {
  return (
    <div>
      <h1>简化版App测试</h1>
      <p>这是简化版的主应用组件，不包含任何CSS和复杂依赖</p>
      <div style={{ padding: '10px', background: '#e0e0e0', margin: '10px 0' }}>
        <h2>功能测试</h2>
        <p>React组件渲染正常</p>
      </div>
    </div>
  )
}

export default SimpleApp