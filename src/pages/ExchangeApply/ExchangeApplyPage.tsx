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

const ExchangeApplyPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const discount = levelDiscount[(auth.user as any)?.level || 'normal'] || 1.0

  const userItems = [
    { id: 'u1', name: '有机苹果 5斤装', sku: 'APL-5', stock: 20, pointsPrice: 599 },
    { id: 'u2', name: '天然蜂蜜 500g', sku: 'HNY-500', stock: 12, pointsPrice: 599 },
    { id: 'u3', name: '精选茶叶礼盒', sku: 'TEA-GIFT', stock: 5, pointsPrice: 1299 }
  ]

  const superiorItems = [
    { id: 's1', name: '有机苹果 5斤装', sku: 'APL-5', stock: 200, pointsPrice: 599 },
    { id: 's2', name: '天然蜂蜜 500g', sku: 'HNY-500', stock: 120, pointsPrice: 599 },
    { id: 's3', name: '精选茶叶礼盒', sku: 'TEA-GIFT', stock: 80, pointsPrice: 1299 }
  ]

  const [currentId, setCurrentId] = useState(userItems[0].id)
  const [currentQty, setCurrentQty] = useState(0)
  const [targetId, setTargetId] = useState(superiorItems[0].id)
  const [targetQty, setTargetQty] = useState(0)
  const [agreeForfeit, setAgreeForfeit] = useState(false)

  const currentItem = userItems.find(i => i.id === currentId)!
  const targetItem = superiorItems.find(i => i.id === targetId)!

  const currentValue = useMemo(() => Math.ceil((currentItem.pointsPrice * discount) * currentQty), [currentItem, currentQty, discount])
  const targetValue = useMemo(() => Math.ceil((targetItem.pointsPrice * discount) * targetQty), [targetItem, targetQty, discount])

  const diff = targetValue - currentValue
  const needPay = diff > 0 ? diff : 0
  const needForfeit = diff < 0 ? Math.abs(diff) : 0

  const submit = () => {
    if (currentQty <= 0 || targetQty <= 0) {
      alert('请选择换货数量')
      return
    }
    if (currentQty > currentItem.stock) {
      alert('交换数量不能大于您持有的库存')
      return
    }
    if (targetQty > targetItem.stock) {
      alert('换成数量不能大于上级云仓库存')
      return
    }
    const user = (auth.user as any) || { points: 0 }
    const points = user.points || 0
    if (needPay > 0 && points < needPay) {
      alert(`通券积分不足，需要补差价：${needPay} 分，当前可用：${points} 分`)
      return
    }
    if (needForfeit > 0 && !agreeForfeit) {
      alert('请勾选自愿放弃超出差值')
      return
    }
    const token = auth.token || ''
    const newPoints = points - needPay
    const updatedUser = { ...user, points: newPoints }
    useAuthStore.getState().setUser(updatedUser, token)
    alert(`换货成功，${needPay > 0 ? `已扣通券：${needPay} 分并转至上级账户` : `已同意放弃差值：${needForfeit} 分`}`)
    navigate('/warehouse/cloud')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>我要换货</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', display: 'grid', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>当前会员等级折扣系数：{discount.toFixed(2)}</div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>当前商品</label>
            <select value={currentId} onChange={(e) => { setCurrentId(e.target.value); setCurrentQty(0) }} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              {userItems.map((i) => (
                <option key={i.id} value={i.id}>{i.name}（库存：{i.stock}，通券单价：{Math.ceil(i.pointsPrice * discount)}分）</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>交换数量</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setCurrentQty(q => Math.max(0, q - 1))} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>−</button>
              <div style={{ width: '60px', textAlign: 'center' }}>{currentQty}</div>
              <button onClick={() => setCurrentQty(q => Math.min(currentItem.stock, q + 1))} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>换成商品</label>
            <select value={targetId} onChange={(e) => { setTargetId(e.target.value); setTargetQty(0) }} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              {superiorItems.map((i) => (
                <option key={i.id} value={i.id}>{i.name}（上级库存：{i.stock}，通券单价：{Math.ceil(i.pointsPrice * discount)}分）</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>换成数量</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setTargetQty(q => Math.max(0, q - 1))} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>−</button>
              <div style={{ width: '60px', textAlign: 'center' }}>{targetQty}</div>
              <button onClick={() => setTargetQty(q => Math.min(targetItem.stock, q + 1))} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          <div style={{ padding: '12px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
            {needPay > 0 && (
              <div style={{ fontSize: '14px', color: '#111827' }}>需补差价：<span style={{ color: '#DC2626', fontWeight: 700 }}>{needPay}</span> 分（通券）</div>
            )}
            {needForfeit > 0 && (
              <div style={{ fontSize: '14px', color: '#111827' }}>
                超出差值：<span style={{ color: '#DC2626', fontWeight: 700 }}>{needForfeit}</span> 分
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={agreeForfeit} onChange={(e) => setAgreeForfeit(e.target.checked)} />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>自愿放弃超出差值</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>当前通券积分</div>
              <div style={{ fontSize: '16px', color: '#111827' }}>{(auth.user as any)?.points ?? 0} 分</div>
            </div>
            <button onClick={submit} style={{ padding: '12px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>确定换货</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangeApplyPage