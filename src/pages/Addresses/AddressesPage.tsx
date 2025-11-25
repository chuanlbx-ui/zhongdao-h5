import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Address {
  id: string
  name: string
  phone: string
  region: string
  detail: string
  isDefault?: boolean
}

const AddressesPage: React.FC = () => {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [detail, setDetail] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [regionData, setRegionData] = useState<Array<{ name: string; cities: Array<{ name: string; districts: string[] }> }>>([])

  useEffect(() => {
    const data: Address[] = JSON.parse(localStorage.getItem('addresses') || '[]')
    setAddresses(data)

    const initRegionData = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('region_data') || 'null')
        if (stored && Array.isArray(stored)) {
          setRegionData(stored)
          return
        }

        const urls = [
          'https://unpkg.com/province-city-china@latest/dist/level.json',
          'https://raw.githack.com/uiwjs/province-city-china/gh-pages/level.json',
          'https://cdn.statically.io/gh/uiwjs/province-city-china/gh-pages/level.json'
        ]
        let json: any = null
        for (const url of urls) {
          try {
            const res = await fetch(url, { cache: 'force-cache' })
            if (res.ok) { json = await res.json(); break }
          } catch {}
        }

        if (json && Array.isArray(json)) {
          const mapped: Array<{ name: string; cities: Array<{ name: string; districts: string[] }> }> = json.map((p: any) => ({
            name: p.name,
            cities: (p.children || []).map((c: any) => ({
              name: c.name,
              districts: (c.children || []).map((a: any) => a.name)
            }))
          }))
          setRegionData(mapped)
          try { localStorage.setItem('region_data', JSON.stringify(mapped)) } catch {}
          return
        }

        setRegionData([
          { name: '北京市', cities: [ { name: '北京市', districts: ['东城区','西城区','朝阳区','海淀区','丰台区','石景山区'] } ] },
          { name: '上海市', cities: [ { name: '上海市', districts: ['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区'] } ] },
          { name: '广东省', cities: [ { name: '广州市', districts: ['天河区','越秀区','海珠区','白云区'] }, { name: '深圳市', districts: ['南山区','福田区','罗湖区','宝安区','龙岗区'] } ] },
          { name: '浙江省', cities: [ { name: '杭州市', districts: ['上城区','拱墅区','西湖区','滨江区'] } ] },
          { name: '江苏省', cities: [ { name: '南京市', districts: ['玄武区','秦淮区','建邺区','鼓楼区'] } ] },
          { name: '四川省', cities: [ { name: '成都市', districts: ['锦江区','青羊区','金牛区','武侯区','成华区'] } ] },
          { name: '湖北省', cities: [ { name: '武汉市', districts: ['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区'] } ] },
          { name: '山东省', cities: [ { name: '青岛市', districts: ['市南区','市北区','李沧区','崂山区'] } ] },
          { name: '河南省', cities: [ { name: '郑州市', districts: ['中原区','二七区','管城回族区','金水区'] } ] },
          { name: '福建省', cities: [ { name: '福州市', districts: ['鼓楼区','台江区','仓山区','晋安区'] } ] }
        ])
      } catch {
        setRegionData([
          { name: '广东省', cities: [ { name: '深圳市', districts: ['南山区','福田区','罗湖区','宝安区'] }, { name: '广州市', districts: ['天河区','越秀区','海珠区'] } ] },
          { name: '北京市', cities: [ { name: '北京市', districts: ['朝阳区','海淀区','东城区','西城区'] } ] }
        ])
      }
    }

    initRegionData()
  }, [])

  const resetForm = () => {
    setName('')
    setPhone('')
    setProvince('')
    setCity('')
    setDistrict('')
    setDetail('')
    setEditingId(null)
  }

  const saveToStorage = (list: Address[]) => {
    localStorage.setItem('addresses', JSON.stringify(list))
    setAddresses(list)
  }

  const onSubmit = () => {
    setMsg(null)
    const p = phone.replace(/\D/g, '')
    if (!name.trim()) { setMsg('请输入收货人姓名'); return }
    if (p.length !== 11) { setMsg('请输入11位手机号'); return }
    const region = [province, city, district].filter(Boolean).join(' ')
    if (!region || !detail.trim()) { setMsg('请填写完整地址'); return }
    if (editingId) {
      const updated = addresses.map(a => a.id === editingId ? { ...a, name, phone: p, region, detail } : a)
      saveToStorage(updated)
      resetForm()
      setMsg('地址已更新')
    } else {
      const addr: Address = { id: 'addr_' + Date.now(), name, phone: p, region, detail, isDefault: addresses.length === 0 }
      saveToStorage([addr, ...addresses])
      resetForm()
      setMsg('地址已新增')
    }
  }

  const editAddress = (addr: Address) => {
    setEditingId(addr.id)
    setName(addr.name)
    setPhone(addr.phone)
    const parts = (addr.region || '').split(' ')
    setProvince(parts[0] || '')
    setCity(parts[1] || '')
    setDistrict(parts[2] || '')
    setDetail(addr.detail)
  }

  const deleteAddress = (id: string) => {
    const list = addresses.filter(a => a.id !== id)
    if (list.length > 0 && !list.some(a => a.isDefault)) list[0].isDefault = true
    saveToStorage(list)
  }

  const setDefault = (id: string) => {
    saveToStorage(addresses.map(a => ({ ...a, isDefault: a.id === id })))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>收货地址管理</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>收货人</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入收货人姓名" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>手机号</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="请输入11位手机号" maxLength={11} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>所在地区</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(''); setDistrict('') }} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <option value="">选择省</option>
                  {regionData.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <select value={city} onChange={(e) => { setCity(e.target.value); setDistrict('') }} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <option value="">选择市</option>
                  {(regionData.find(p => p.name === province)?.cities || []).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <option value="">选择区</option>
                  {(regionData.find(p => p.name === province)?.cities.find(c => c.name === city)?.districts || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>详细地址</label>
              <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="楼栋/门牌号" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onSubmit} style={{ padding: '10px 14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>{editingId ? '保存修改' : '新增地址'}</button>
              {editingId && <button onClick={resetForm} style={{ padding: '10px 14px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>取消编辑</button>}
            </div>
            {msg && <div style={{ fontSize: '12px', color: '#059669' }}>{msg}</div>}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>我的地址</h3>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>共 {addresses.length} 条</div>
          </div>
          <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
            {addresses.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>{a.name} {a.isDefault && <span style={{ fontSize: '12px', color: '#DC2626', marginLeft: '6px' }}>默认</span>}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{a.phone}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{a.region} {a.detail}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setDefault(a.id)} style={{ padding: '6px 10px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>设为默认</button>
                  <button onClick={() => editAddress(a)} style={{ padding: '6px 10px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => deleteAddress(a.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressesPage