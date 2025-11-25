import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const CloudApplyPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [storeFullName, setStoreFullName] = useState('')
  const [storeShortName, setStoreShortName] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [address, setAddress] = useState('')
  const [legalName, setLegalName] = useState('')
  const [legalPhone, setLegalPhone] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [licenseImage, setLicenseImage] = useState<string>('')
  const [idFrontImage, setIdFrontImage] = useState<string>('')
  const [idBackImage, setIdBackImage] = useState<string>('')
  const [supplyAgreementImage, setSupplyAgreementImage] = useState<string>('')
  const licenseRef = useRef<HTMLInputElement | null>(null)
  const idFrontRef = useRef<HTMLInputElement | null>(null)
  const idBackRef = useRef<HTMLInputElement | null>(null)
  const supplyRef = useRef<HTMLInputElement | null>(null)

  const pickFile = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click()
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result)
    }
    reader.readAsDataURL(f)
  }

  const isPhone = (v: string) => v.replace(/\D/g, '').length === 11
  const isValidLicense = (v: string) => {
    const code = v.toUpperCase().replace(/\s/g, '')
    if (/^\d{15}$/.test(code)) return true
    const CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY'
    if (!/^[0-9A-Z]{18}$/.test(code)) return false
    for (let i = 0; i < 18; i++) if (!CHARS.includes(code[i])) return false
    const WEIGHTS = [1,3,9,27,19,26,16,17,20,29,25,13,8,24,10,30,28]
    let sum = 0
    for (let i = 0; i < 17; i++) sum += CHARS.indexOf(code[i]) * WEIGHTS[i]
    const check = CHARS[(31 - (sum % 31)) % 31]
    return code[17] === check
  }

  const submit = async () => {
    setError(null)
    setSuccess(null)
    if (!auth.isVerified) { setError('请先完成实名认证'); return }
    if (!storeFullName || !storeShortName) { setError('请填写店铺全称与简称'); return }
    if (!licenseNo) { setError('请填写营业执照编号'); return }
    if (!isValidLicense(licenseNo)) { setError('营业执照编号格式不正确'); return }
    if (!address) { setError('请填写经营地址'); return }
    if (!legalName || !isPhone(legalPhone)) { setError('请填写法人姓名与11位手机'); return }
    if (!adminName || !isPhone(adminPhone)) { setError('请填写管理员姓名与11位手机'); return }
    if (!licenseImage || !idFrontImage || !idBackImage) { setError('请上传营业执照与法人身份证正反面'); return }
    if (!supplyAgreementImage) { setError('请上传《平台供货协议》图片'); return }
    if (!agree) { setError('请勾选已阅读且同意平台开店协议'); return }
    await new Promise(r => setTimeout(r, 800))
    setSuccess('提交成功，我们将尽快审核')
  }

  const topBanner = (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>{auth.isVerified ? '✅' : '🛡️'}</span>
        <div style={{ fontSize: '14px', color: auth.isVerified ? '#059669' : '#374151' }}>
          {auth.isVerified ? '已实名认证，可提交开店申请' : '未实名认证，请先完成实名认证'}
        </div>
      </div>
      {!auth.isVerified && (
        <button
          onClick={() => navigate('/profile/certification')}
          style={{ padding: '8px 12px', background: '#DC2626', color: 'white', borderRadius: '6px', border: 'none', fontSize: '12px', cursor: 'pointer' }}
        >
          去实名认证
        </button>
      )}
    </div>
  )

  const UploadBox: React.FC<{ label: string; value: string; onPick: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; inputRef: React.RefObject<HTMLInputElement> }>
    = ({ label, value, onPick, onChange, inputRef }) => (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: '#374151', display: 'block' }}>{label}</span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={onPick} style={{ padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>选择图片</button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      <div style={{ height: '120px', background: '#F3F4F6', border: '1px dashed #E5E7EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value ? <img src={value} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '12px', color: '#9CA3AF' }}>未选择图片</span>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>云店申请</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ margin: '12px 16px', background: auth.isVerified ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${auth.isVerified ? '#A7F3D0' : '#FECACA'}`, borderRadius: '8px' }}>
        {topBanner}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', display: 'grid', gap: '16px' }}>
          <UploadBox label="营业执照" value={licenseImage} onPick={() => pickFile(licenseRef)} onChange={(e) => handleFile(e, setLicenseImage)} inputRef={licenseRef} />
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <UploadBox label="法人身份证(正面)" value={idFrontImage} onPick={() => pickFile(idFrontRef)} onChange={(e) => handleFile(e, setIdFrontImage)} inputRef={idFrontRef} />
            <UploadBox label="法人身份证(反面)" value={idBackImage} onPick={() => pickFile(idBackRef)} onChange={(e) => handleFile(e, setIdBackImage)} inputRef={idBackRef} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺全称</label>
            <input value={storeFullName} onChange={(e) => setStoreFullName(e.target.value)} placeholder="请输入店铺全称" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>店铺简称</label>
            <input value={storeShortName} onChange={(e) => setStoreShortName(e.target.value)} placeholder="请输入店铺简称" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>营业执照编号</label>
            <input
              value={licenseNo}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '')
                setLicenseNo(val)
                setLicenseError(val ? (isValidLicense(val) ? null : '编号格式不正确') : null)
              }}
              placeholder="请输入营业执照编号"
              style={{ width: '100%', padding: '12px 16px', border: licenseError ? '1px solid #FCA5A5' : '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }}
            />
            {licenseError && <div style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626' }}>{licenseError}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>经营地址</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="请输入经营地址" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>法人姓名</label>
              <input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="请输入法人姓名" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>法人手机</label>
              <input value={legalPhone} onChange={(e) => setLegalPhone(e.target.value.replace(/\D/g, ''))} placeholder="请输入11位手机号" maxLength={11} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>管理员姓名</label>
              <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="请输入管理员姓名" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>管理员手机</label>
              <input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))} placeholder="请输入11位手机号" maxLength={11} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
            </div>
          </div>
          <UploadBox label="平台供货协议图片" value={supplyAgreementImage} onPick={() => pickFile(supplyRef)} onChange={(e) => handleFile(e, setSupplyAgreementImage)} inputRef={supplyRef} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span style={{ fontSize: '12px', color: '#374151' }}>已阅读且同意平台开店协议</span>
          </div>
          {error && <div style={{ fontSize: '14px', color: '#DC2626' }}>{error}</div>}
          {success && <div style={{ fontSize: '14px', color: '#059669' }}>{success}</div>}
          <button onClick={submit} disabled={!auth.isVerified} style={{ padding: '12px 16px', background: auth.isVerified ? '#DC2626' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: auth.isVerified ? 'pointer' : 'not-allowed' }}>提交申请</button>
        </div>
      </div>
    </div>
  )
}

export default CloudApplyPage