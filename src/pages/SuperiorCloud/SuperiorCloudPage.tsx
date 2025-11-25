import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const levelDiscount: Record<string, number> = {
  normal: 1.0,
  vip: 0.95,
  star1: 0.9,
  star2: 0.85,
  star3: 0.8,
  star4: 0.75,
  star5: 0.7,
  director: 0.65
}

const SuperiorCloudPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()

  // 模拟上级云店商品
  const superiorItems = [
    { id: 'sp1', name: '有机苹果 5斤装', sku: 'APL-5', stock: 200, pointsPrice: 599 },
    { id: 'sp2', name: '天然蜂蜜 500g', sku: 'HNY-500', stock: 120, pointsPrice: 599 },
    { id: 'sp3', name: '精选茶叶礼盒', sku: 'TEA-GIFT', stock: 80, pointsPrice: 1299 }
  ]

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const superiorShop = {
    shortName: '上级云店',
    managerName: '王店长',
    managerPhone: '13888888888'
  }
  const discount = levelDiscount[(auth.user as any)?.level || 'normal'] || 1.0

  const totalPoints = useMemo(() => {
    return superiorItems.reduce((sum, item) => {
      const q = quantities[item.id] || 0
      return sum + q * item.pointsPrice * discount
    }, 0)
  }, [quantities, discount])

  const changeQty = (id: string, delta: number, max: number) => {
    setQuantities(prev => {
      const next = { ...prev, [id]: Math.max(0, Math.min((prev[id] || 0) + delta, max)) }
      return next
    })
  }

  const submitOrder = () => {
    if (totalPoints <= 0) {
      alert('请先选择订货数量')
      return
    }
    const user = (auth.user as any) || null
    const currentPoints = user?.points || 0
    if (currentPoints < totalPoints) {
      alert(`积分不足，所需通券积分：${Math.ceil(totalPoints)}，当前可用：${currentPoints}`)
      return
    }
    const token = auth.token || ''
    const updatedUser = { ...user, points: currentPoints - Math.ceil(totalPoints) }
    useAuthStore.getState().setUser(updatedUser, token)
    const records = JSON.parse(localStorage.getItem('procurement_records') || '[]')
    const recordItems = superiorItems.map(it => ({ id: it.id, name: it.name, sku: it.sku, pointsPrice: it.pointsPrice, quantity: quantities[it.id] || 0 })).filter(r => r.quantity > 0)
    const procurementRecord = { id: 'pm_' + Date.now(), createdAt: new Date().toISOString(), discount, totalPoints: Math.ceil(totalPoints), items: recordItems }
    localStorage.setItem('procurement_records', JSON.stringify([...(records || []), procurementRecord]))
    alert(`订货单提交成功，已扣除通券积分：${Math.ceil(totalPoints)}，并已转至上级店账户`)
    navigate('/warehouse/cloud')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>上级云店订货</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: 700, marginBottom: '4px' }}>{superiorShop.shortName}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>店长：{superiorShop.managerName} | 联系电话：{superiorShop.managerPhone}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
            当前会员等级折扣系数：{discount.toFixed(2)}（通券积分按折扣计）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {superiorItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU: {item.sku} | 库存：{item.stock}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>通券单价：{Math.ceil(item.pointsPrice * discount)} 分</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => changeQty(item.id, -1, item.stock)} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>−</button>
                  <div style={{ width: '40px', textAlign: 'center' }}>{quantities[item.id] || 0}</div>
                  <button onClick={() => changeQty(item.id, 1, item.stock)} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>所需通券积分</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>{Math.ceil(totalPoints)} 分</div>
            </div>
            <button onClick={submitOrder} style={{ padding: '12px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>提交订货单</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperiorCloudPage