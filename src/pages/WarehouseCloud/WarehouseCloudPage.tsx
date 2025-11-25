import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WarehouseCloudPage: React.FC = () => {
  const navigate = useNavigate()

  const items = [
    { id: 'p1', name: '有机苹果 5斤装', sku: 'APL-5', quantity: 120 },
    { id: 'p2', name: '天然蜂蜜 500g', sku: 'HNY-500', quantity: 60 },
    { id: 'p3', name: '精选茶叶礼盒', sku: 'TEA-GIFT', quantity: 35 }
  ]

  const [pickupMap, setPickupMap] = useState<Record<string, number>>({})
  const [showPickup, setShowPickup] = useState(false)
  const totalPickup = useMemo(() => Object.values(pickupMap).reduce((s, n) => s + n, 0), [pickupMap])
  const pickupDetails = useMemo(() => items.filter(it => (pickupMap[it.id] || 0) > 0).map(it => ({ ...it, qty: pickupMap[it.id] })), [items, pickupMap])
  const addToPickup = (id: string) => {
    setPickupMap(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }
  const confirmPickup = () => {
    if (totalPickup <= 0) {
      alert('请先加入提货单')
      return
    }
    const existing = JSON.parse(localStorage.getItem('local_warehouse') || '[]')
    const merged = [...existing]
    items.forEach(it => {
      const qty = pickupMap[it.id] || 0
      if (qty > 0) {
        const idx = merged.findIndex((m: any) => m.id === it.id)
        if (idx >= 0) merged[idx].quantity = (merged[idx].quantity || 0) + qty
        else merged.push({ id: it.id, name: it.name, sku: it.sku, quantity: qty })
      }
    })
    localStorage.setItem('local_warehouse', JSON.stringify(merged))
    const records = JSON.parse(localStorage.getItem('pickup_records') || '[]')
    const recordItems = items.filter(it => (pickupMap[it.id] || 0) > 0).map(it => ({ id: it.id, name: it.name, sku: it.sku, quantity: pickupMap[it.id] }))
    const newRecord = { id: 'pr_' + Date.now(), createdAt: new Date().toISOString(), items: recordItems }
    localStorage.setItem('pickup_records', JSON.stringify([...(records || []), newRecord]))
    setPickupMap({})
    alert('提货成功，已累计到本地仓库存')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>云仓管理</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>当前云仓库存</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>共 {items.reduce((s, i) => s + i.quantity, 0)} 件</span>
              <button onClick={() => navigate('/procurement/records')} style={{ padding: '6px 10px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>采购记录</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU: {item.sku}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>数量：{item.quantity}</div>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => addToPickup(item.id)} style={{ padding: '8px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>加入提货单</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/warehouse/cloud/superior')}
              style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
            >
              我要采购
            </button>
            <button
              onClick={() => navigate('/exchange/apply')}
              style={{ flex: 1, padding: '12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
            >
              我要换货
            </button>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #F3F4F6', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', color: '#111827' }}>合计：{totalPickup} 件</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowPickup(true)} style={{ padding: '10px 14px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>提货单({totalPickup})</button>
            <button onClick={confirmPickup} style={{ padding: '10px 14px', background: totalPickup>0 ? '#DC2626' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: totalPickup>0 ? 'pointer' : 'not-allowed' }}>确认提交</button>
          </div>
        </div>
      </div>

      {showPickup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '90%', maxWidth: '420px', background: 'white', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>提货单</h3>
              <button onClick={() => setShowPickup(false)} style={{ padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>关闭</button>
            </div>
            {pickupDetails.length === 0 ? (
              <div style={{ fontSize: '14px', color: '#6B7280' }}>暂无已加入的商品</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pickupDetails.map((it) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', background: '#F3F4F6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#111827' }}>{it.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU: {it.sku}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>数量：{it.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WarehouseCloudPage