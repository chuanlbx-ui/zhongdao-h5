import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const PointsPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [balance, setBalance] = useState<number>(0)
  const [transferPhone, setTransferPhone] = useState('')
  const [transferAmount, setTransferAmount] = useState<number>(0)
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    setBalance((auth.user as any)?.points || 0)
  }, [auth.user])

  const lookupRecipient = () => {
    const d = transferPhone.replace(/\D/g, '')
    if (d.length !== 11) { setMsg('请输入11位手机号'); return }
    const name = '用户' + d.slice(-4)
    setRecipientName(name)
    setConfirmed(true)
    setMsg(null)
  }

  const doTransfer = () => {
    setMsg(null)
    if (!confirmed || !recipientName) { setMsg('请先确认收款人'); return }
    const d = transferPhone.replace(/\D/g, '')
    if (d.length !== 11) { setMsg('请输入11位手机号'); return }
    if (transferAmount <= 0) { setMsg('请输入正确的数量'); return }
    const savedPwd = localStorage.getItem('payment_password') || ''
    if (!savedPwd) { setMsg('未设置平台支付密码，请前往个人设置'); return }
    if (password !== savedPwd) { setMsg('支付密码错误'); return }
    if (balance < transferAmount) { setMsg('积分余额不足'); return }
    const token = auth.token || ''
    const newBalance = balance - transferAmount
    setBalance(newBalance)
    useAuthStore.getState().setUser({ ...(auth.user as any), points: newBalance }, token)
    const transfers = JSON.parse(localStorage.getItem('points_transfers') || '[]')
    transfers.push({ id: 'pt_' + Date.now(), phone: d, name: recipientName, amount: transferAmount, at: new Date().toISOString() })
    localStorage.setItem('points_transfers', JSON.stringify(transfers))
    setMsg('已向 ' + recipientName + ' 转账 ' + transferAmount + ' 分')
    setTransferAmount(0)
    setPassword('')
  }

  const [rechargeAmount, setRechargeAmount] = useState<number>(0)
  const canRecharge = ['star5','director'].includes(((auth.user as any)?.level) || 'normal')
  const doRecharge = () => {
    setMsg(null)
    if (!canRecharge) { setMsg('仅五星店长和董事可直接充值，请联系推荐人购买积分'); return }
    if (rechargeAmount <= 0) { setMsg('请输入正确的充值数量'); return }
    const newBalance = balance + rechargeAmount
    const token = auth.token || ''
    setBalance(newBalance)
    useAuthStore.getState().setUser({ ...(auth.user as any), points: newBalance }, token)
    const recharges = JSON.parse(localStorage.getItem('points_recharges') || '[]')
    recharges.push({ id: 'pr_' + Date.now(), amount: rechargeAmount, at: new Date().toISOString() })
    localStorage.setItem('points_recharges', JSON.stringify(recharges))
    setMsg('充值成功，增加 ' + rechargeAmount + ' 分')
    setRechargeAmount(0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>积分</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '14px', color: '#374151' }}>当前积分余额</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#DC2626' }}>{balance} 分</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>积分转账</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>对方手机号</label>
              <input value={transferPhone} onChange={(e) => setTransferPhone(e.target.value.replace(/\D/g, ''))} placeholder="请输入11位手机号" maxLength={11} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <div style={{ marginTop: '8px' }}>
                <button onClick={lookupRecipient} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>查询用户</button>
                {recipientName && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#059669' }}>用户名：{recipientName}（请务必核对正确）</span>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>转账数量</label>
              <input type="number" value={transferAmount || ''} onChange={(e) => setTransferAmount(Number(e.target.value))} placeholder="请输入数量" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                {[100, 500, 1000, 5000].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTransferAmount(n)}
                    style={{ padding: '6px 10px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>平台支付密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入支付密码" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                未设置？请到
                <button onClick={() => navigate('/profile/settings')} style={{ color: '#DC2626', background: 'none', border: 'none', padding: 0, margin: '0 4px', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>个人设置</button>
                页添加
              </div>
            </div>
            <button onClick={doTransfer} style={{ padding: '10px 14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>确认转账</button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>积分充值</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{canRecharge ? '当前等级允许直接充值' : '仅五星店长和董事可直接充值，请联系推荐人购买积分'}</div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>充值数量</label>
              <input type="number" value={rechargeAmount || ''} onChange={(e) => setRechargeAmount(Number(e.target.value))} placeholder="请输入数量" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                {[500, 1000, 5000, 10000].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRechargeAmount(n)}
                    style={{ padding: '6px 10px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={doRecharge} style={{ padding: '10px 14px', background: canRecharge ? '#EF4444' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: canRecharge ? 'pointer' : 'not-allowed' }}>确认充值</button>
          </div>
        </div>

        {msg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: '8px', padding: '12px' }}>{msg}</div>
        )}
      </div>
    </div>
  )
}

export default PointsPage