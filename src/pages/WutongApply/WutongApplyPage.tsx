import React from 'react'
import { useNavigate } from 'react-router-dom'

const WutongApplyPage: React.FC = () => {
  const navigate = useNavigate()

  const goBack = () => navigate(-1)

  const handlePurchase = () => {
    const item = {
      id: 'wutong-1',
      productId: 'wutong-package',
      name: '五通店开通套餐',
      image: '/api/placeholder/80/80',
      spec: { id: 'default', name: '标准套餐', price: 27000 },
      quantity: 1,
      price: 27000
    }
    navigate('/checkout', { state: { items: [item] } })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={goBack} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>五通店申请</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'linear-gradient(to right, #F59E0B, #F97316)', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>五通店特权</h3>
          <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎁</span>
              <span style={{ fontSize: '14px' }}>100盒599元产品</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>♾️</span>
              <span style={{ fontSize: '14px' }}>终身享受买10赠1活动</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⭐</span>
              <span style={{ fontSize: '14px' }}>一次性直接升级到二星店长（享受二星店长权益）</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>套餐说明</h4>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>开通五通店后，即刻享受对应店长等级与活动权益。提交后我们将联系您完成后续流程。</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>原价</div>
              <div style={{ fontSize: '16px', color: '#6B7280', textDecoration: 'line-through' }}>¥59,900</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>现价</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#DC2626' }}>¥27,000</div>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button onClick={handlePurchase} style={{ width: '100%', padding: '12px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>立即购买</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WutongApplyPage