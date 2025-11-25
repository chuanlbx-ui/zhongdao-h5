import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const UserCertificationPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [name, setName] = useState(auth.certification?.name || auth.user?.nickname || '')
  const [phone, setPhone] = useState(auth.certification?.phone || auth.user?.phone || '')
  const [idNumber, setIdNumber] = useState(auth.certification?.idNumber || '')
  const [address, setAddress] = useState(auth.certification?.address || '')
  const [bankCardNumber, setBankCardNumber] = useState(auth.certification?.bankCardNumber || '')
  const [bankName, setBankName] = useState(auth.certification?.bankName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idError, setIdError] = useState<string | null>(null)

  useEffect(() => {
    setName(auth.certification?.name || auth.user?.nickname || '')
    setPhone(auth.certification?.phone || auth.user?.phone || '')
  }, [auth.certification, auth.user])

  const goBack = () => navigate(-1)

  const handleSave = async () => {
    if (!name.trim()) { setError('请输入姓名'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) { setError('请输入正确的手机号'); return }
    if (!idNumber.trim()) { setError('请输入身份证号'); return }
    if (!isValidChineseID(idNumber)) { setIdError('身份证号格式不正确'); return }
    setError(null)
    setLoading(true)
    try {
      useAuthStore.getState().setCertification({ name, phone: digits, idNumber, address, bankCardNumber, bankName })
      useAuthStore.getState().setVerified(true)
      const token = auth.token || ''
      if (auth.user) useAuthStore.getState().setUser({ ...auth.user, nickname: name, phone: digits }, token)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={goBack} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>用户认证</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>姓名</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>手机号</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="11位手机号" maxLength={11} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>身份证号</label>
            <input
              value={idNumber}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^0-9X]/g, '')
                setIdNumber(v)
                if (v.length === 18) setIdError(isValidChineseID(v) ? null : '身份证号格式不正确')
                else setIdError(null)
              }}
              onBlur={() => setIdError(idNumber && !isValidChineseID(idNumber) ? '身份证号格式不正确' : null)}
              placeholder="请输入身份证号"
              style={{ width: '100%', padding: '12px 16px', border: idError ? '1px solid #FCA5A5' : '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }}
            />
            {idError && <div style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626' }}>{idError}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>联系地址</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="请输入联系地址" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>本人银行卡号</label>
            <input value={bankCardNumber} onChange={(e) => setBankCardNumber(e.target.value.replace(/\s/g, ''))} placeholder="请输入银行卡号" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>开户行</label>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="请输入开户行" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          {error && <div style={{ fontSize: '14px', color: '#DC2626' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={goBack} style={{ flex: 1, padding: '12px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>取消</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#9CA3AF' : '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  )
}

export default UserCertificationPage
  const isValidChineseID = (id: string) => {
    const v = id.toUpperCase().replace(/\s/g, '')
    if (!/^\d{17}[\dX]$/.test(v)) return false
    const year = parseInt(v.slice(6, 10))
    const month = parseInt(v.slice(10, 12))
    const day = parseInt(v.slice(12, 14))
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return false
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const codes = ['1','0','X','9','8','7','6','5','4','3','2']
    let sum = 0
    for (let i = 0; i < 17; i++) sum += parseInt(v[i], 10) * weights[i]
    const last = codes[sum % 11]
    return v[17] === last
  }