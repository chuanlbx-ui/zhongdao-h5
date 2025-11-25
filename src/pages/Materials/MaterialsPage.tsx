import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface MaterialItem { id: string; title: string; images: string[]; text: string }
interface PostItem { id: string; userId: string; level: string; images: string[]; text: string; createdAt: string }

const MaterialsPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [postText, setPostText] = useState('')
  const [postImages, setPostImages] = useState<string[]>([])
  const imgRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const preset: MaterialItem[] = [
      { id: 'm1', title: '新品首发', images: ['/placeholder-product.png', '/placeholder-product.png', '/placeholder-product.png'], text: '新品上架，限时优惠，快来选购！' },
      { id: 'm2', title: '热销爆款', images: ['/placeholder-product.png'], text: '全网热销爆款，品质保证，值得拥有！' },
      { id: 'm3', title: '会员专享', images: ['/placeholder-product.png', '/placeholder-product.png'], text: '会员专享福利，折扣多多，超值体验！' }
    ]
    setMaterials(preset)
    const saved: any[] = JSON.parse(localStorage.getItem('materials_posts') || '[]')
    const normalized: PostItem[] = (saved || []).map(p => ({
      id: p.id,
      userId: p.userId,
      level: p.level,
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      text: p.text,
      createdAt: p.createdAt
    }))
    setPosts(normalized.reverse())
  }, [])

  const copyText = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert('文案已复制')).catch(() => alert('复制失败'))
    } else {
      alert('文案：' + text)
    }
  }

  const downloadGroup = (images: string[], name: string) => {
    images.forEach((src, idx) => {
      const a = document.createElement('a')
      a.href = src
      a.download = `${name}-${idx + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  const chooseImage = () => imgRef.current?.click()
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const limit = 9
    const selected = files.slice(0, limit)
    const readers = selected.map(f => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.readAsDataURL(f)
    }))
    Promise.all(readers).then(imgs => setPostImages(imgs))
  }

  const canPost = ['star1','star2','star3','star4','star5','director'].includes((auth.user as any)?.level || 'normal')

  const publish = () => {
    if (!canPost) { alert('仅一星店长及以上可发布'); return }
    if (!postImages || postImages.length === 0) { alert('请上传海报图片'); return }
    if (!postText.trim()) { alert('请填写文案'); return }
    const newPost: PostItem = {
      id: 'post_' + Date.now(),
      userId: (auth.user as any)?.id || 'me',
      level: (auth.user as any)?.level || 'normal',
      images: postImages,
      text: postText.trim(),
      createdAt: new Date().toISOString()
    }
    const saved: PostItem[] = JSON.parse(localStorage.getItem('materials_posts') || '[]')
    localStorage.setItem('materials_posts', JSON.stringify([...(saved || []), newPost]))
    setPosts([newPost, ...posts])
    setPostText('')
    setPostImages([])
    alert('发布成功')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>素材中心</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>官方素材</h3>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr' }}>
            {materials.map(m => (
              <div key={m.id} style={{ border: '1px solid #F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'grid', gap: '6px', gridTemplateColumns: `${m.images.length===1?'1fr':m.images.length===2||m.images.length===4?'1fr 1fr':'1fr 1fr 1fr'}` }}>
                    {m.images.map((img, idx) => (
                      <div key={idx} style={{ background: '#F3F4F6', height: `${m.images.length===1?'200px':'110px'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden' }}>
                        <img src={img} alt={m.title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#111827', marginBottom: '6px' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>{m.text}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadGroup(m.images, m.title)} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>下载图片</button>
                    <button onClick={() => copyText(m.text)} style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>复制文案</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>店长贡献素材</h3>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{canPost ? '可发布' : '仅一星店长及以上可发布'}</div>
          </div>
          <div style={{ marginTop: '12px', display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'grid', gap: '6px', gridTemplateColumns: `${postImages.length<=1?'80px':postImages.length<=4?'80px 80px':'80px 80px 80px'}` }}>
                  {postImages.length===0 ? (
                    <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                  ) : (
                    postImages.map((img, idx) => (
                      <div key={idx} style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={img} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))
                  )}
                </div>
                <button onClick={chooseImage} style={{ padding: '8px 12px', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>选择图片</button>
                <input ref={imgRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
              </div>
              <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="填写朋友圈文案" style={{ width: '100%', minHeight: '80px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
              <div style={{ marginTop: '8px' }}>
                <button onClick={publish} style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>发布</button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {posts.map(p => (
                <div key={p.id} style={{ border: '1px solid #F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px' }}>
                    <div style={{ display: 'grid', gap: '6px', gridTemplateColumns: `${p.images.length===1?'1fr':p.images.length===2||p.images.length===4?'1fr 1fr':'1fr 1fr 1fr'}` }}>
                      {p.images.map((img, idx) => (
                        <div key={idx} style={{ background: '#F3F4F6', height: `${p.images.length===1?'240px':'140px'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden' }}>
                          <img src={img} alt="post" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>{new Date(p.createdAt).toLocaleString()} | 等级：{p.level}</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialsPage