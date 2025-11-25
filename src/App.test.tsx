import React from 'react'

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontSize: '18px', color: 'red' }}>
      <h1>测试页面</h1>
      <p>如果你能看到这个页面，说明React基础功能正常</p>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        当前时间: {new Date().toLocaleString()}
      </div>
    </div>
  )
}

export default TestApp