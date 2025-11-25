import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, getUserLevelDisplay } from '@/stores/authStore'

interface TeamNode {
  id: string
  name: string
  phone: string
  inviteCode?: string
  level?: string
  children?: TeamNode[]
}

const maskPhone = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  if (d.length < 7) return phone
  return `${d.slice(0,3)}****${d.slice(-4)}`
}

const getTeamSize = (node: TeamNode): number => {
  let total = 1
  if (node.children && node.children.length > 0) {
    for (const c of node.children) {
      total += getTeamSize(c)
    }
  }
  return total
}

const Row: React.FC<{ node: TeamNode; depth: number; collapsed: Set<string>; toggle: (id: string) => void }> = ({ node, depth, collapsed, toggle }) => {
  const hasChildren = !!(node.children && node.children.length > 0)
  const levelDiff = hasChildren ? node.children!.some(c => c.level !== node.level) : false
  const isCollapsed = collapsed.has(node.id)
  return (
    <div style={{ marginLeft: 0, position: 'relative', paddingLeft: 0 }}>
      <div style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasChildren && levelDiff && (
              <button onClick={() => toggle(node.id)} style={{ width: 20, height: 20, border: '1px solid #D1D5DB', borderRadius: 4, background: 'white', cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }}>{isCollapsed ? '+' : '一'}</button>
            )}
            <div>
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>{node.name}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{maskPhone(node.phone)}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>邀请码：{node.inviteCode || '—'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>团队人数：{getTeamSize(node)}</div>
            {node.level && (
              <div style={{ fontSize: '12px', color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>{getUserLevelDisplay(node.level)}</div>
            )}
          </div>
        </div>
      </div>
      {hasChildren && !isCollapsed && (
        <div style={{ marginTop: 8 }}>
          {node.children!.map(child => (
            <div key={child.id} style={{ marginTop: 8 }}>
              <Row node={child} depth={depth + 1} collapsed={collapsed} toggle={toggle} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TeamPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [teamRoot, setTeamRoot] = useState<TeamNode | null>(null)
  const [inviterInfo, setInviterInfo] = useState<TeamNode | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const me = auth.user || { id: 'me', nickname: '我', phone: '13800000000' }
    const inviter = { id: 'inviter', name: '我的推荐人', phone: '13911112222', inviteCode: 'INV12345', level: 'star2' }
    const local = localStorage.getItem('team_members')
    let children: TeamNode[] = []
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed)) {
          children = parsed.map((m: any) => ({ id: m.id || Math.random().toString(36).slice(2), name: m.name || '成员', phone: m.phone || '13700000000', inviteCode: m.inviteCode || '—', level: m.level || 'normal', children: m.children || [] }))
        }
      } catch {}
    }
    if (children.length === 0) {
      children = [
        { id: 'c1', name: '张三', phone: '13612345678', inviteCode: 'ZD10001', level: 'vip' },
        { id: 'c2', name: '李四', phone: '13587654321', inviteCode: 'ZD10002', level: 'star1', children: [{ id: 'c21', name: '王五', phone: '13411223344', inviteCode: 'ZD10003', level: 'normal' }] }
      ]
    }
    const meNode: TeamNode = { id: (me as any).id || 'me', name: (me as any).nickname || '我', phone: (me as any).phone || '13800000000', inviteCode: (me as any).inviteCode || '—', level: (me as any).level || 'normal', children }
    setInviterInfo({ ...inviter, children: [meNode] })
    setTeamRoot(meNode)

    const initial = new Set<string>()
    const markDiff = (n: TeamNode) => {
      if (n.children && n.children.length > 0) {
        const diff = n.children.some(c => c.level !== n.level)
        if (diff) initial.add(n.id)
        n.children.forEach(markDiff)
      }
    }
    markDiff(meNode)
    setCollapsed(initial)
  }, [auth.user])

  const content = useMemo(() => {
    if (!teamRoot) return null
    return <Row node={teamRoot} depth={0} collapsed={collapsed} toggle={toggle} />
  }, [teamRoot, collapsed])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>团队展示</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {inviterInfo && (
          <div style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>{inviterInfo.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{maskPhone(inviterInfo.phone)}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>邀请码：{inviterInfo.inviteCode || '—'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>团队人数：{getTeamSize(inviterInfo)}</div>
                {inviterInfo.level && (
                  <div style={{ fontSize: '12px', color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>{getUserLevelDisplay(inviterInfo.level)}</div>
                )}
              </div>
            </div>
          </div>
        )}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          {content}
        </div>
      </div>
    </div>
  )
}

export default TeamPage