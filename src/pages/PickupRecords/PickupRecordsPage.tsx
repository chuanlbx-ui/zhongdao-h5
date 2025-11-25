import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface RecordItem { id: string; name: string; sku: string; quantity: number }
interface PickupRecord { id: string; createdAt: string; items: RecordItem[] }

const PickupRecordsPage: React.FC = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PickupRecord[]>([])
  const [slip, setSlip] = useState<PickupRecord | null>(null)

  useEffect(() => {
    const data: PickupRecord[] = JSON.parse(localStorage.getItem('pickup_records') || '[]')
    setRecords((data || []).reverse())
  }, [])

  const openSlip = (rec: PickupRecord) => setSlip(rec)
  const closeSlip = () => setSlip(null)

  const totalQty = (rec: PickupRecord) => rec.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>提货记录</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {records.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#6B7280' }}>暂无提货记录</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {records.map((rec) => (
              <div key={rec.id} style={{ background: 'white', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>提货单号：{rec.id}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>时间：{new Date(rec.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>合计：{totalQty(rec)} 件</div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => openSlip(rec)} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>生成提货单</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {slip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '92%', maxWidth: '480px', background: 'white', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>提货单</h3>
              <button onClick={closeSlip} style={{ padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>关闭</button>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>提货单号：{slip.id}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>时间：{new Date(slip.createdAt).toLocaleString()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {slip.items.map((it) => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#F3F4F6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{it.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU：{it.sku}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>数量：{it.quantity}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <div style={{ fontSize: '14px', color: '#111827' }}>合计：{totalQty(slip)} 件</div>
              <button onClick={() => window.print()} style={{ padding: '8px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>打印提货单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PickupRecordsPage