import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ShopSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [shortName, setShortName] = useState('')
  const [address, setAddress] = useState('')
  const [logo, setLogo] = useState('')
  const [banner, setBanner] = useState('')
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement | null>(null)
  const bannerRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('shop_settings') || '{}')
    setShortName(data.shortName || '')
    setAddress(data.address || '')
    setLogo(data.logo || '')
    setBanner(data.banner || '')
    setPhone(data.phone || '')
  }, [])

  const chooseLogo = () => logoRef.current?.click()
  const chooseBanner = () => bannerRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result)
    }
    reader.readAsDataURL(f)
  }

  const save = async () => {
    if (!shortName.trim()) return alert('请输入店铺简称')
    if (!address.trim()) return alert('请输入店铺详细地址')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) { setPhoneError('请输入11位手机号'); return }
    setSaving(true)
    const payload = { shortName, address, logo, banner, phone: digits }
    localStorage.setItem('shop_settings', JSON.stringify(payload))
    setSaving(false)
    alert('保存成功')
    navigate(-1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>店铺设置</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺简称</label>
            <input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="请输入店铺简称" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺详细地址</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="请输入店铺详细地址" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>客户电话</label>
            <input
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setPhone(v)
                setPhoneError(v.length === 0 ? null : (v.length === 11 ? null : '请输入11位手机号'))
              }}
              placeholder="请输入11位手机号"
              maxLength={11}
              style={{ width: '100%', padding: '12px 16px', border: phoneError ? '1px solid #FCA5A5' : '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }}
            />
            {phoneError && <div style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626' }}>{phoneError}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {logo ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🖼️</span>}
              </div>
              <button onClick={chooseLogo} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>选择图片</button>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e, setLogo)} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺Banner</label>
            <div style={{ height: '120px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {banner ? <img src={banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🖼️</span>}
            </div>
            <div style={{ marginTop: '8px' }}>
              <button onClick={chooseBanner} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>选择图片</button>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e, setBanner)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '12px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>取消</button>
            <button onClick={save} disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#9CA3AF' : '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopSettingsPage