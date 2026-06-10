import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brain, BookOpen, Activity, LayoutDashboard, History, LogOut, User, Gamepad2 } from 'lucide-react'

const links = [
  { to: '/',           label: 'Home',       icon: Activity },
  { to: '/knowledge',  label: 'Knowledge',  icon: BookOpen },
  { to: '/simulator',  label: 'Simulator',  icon: Brain },
  { to: '/braingames', label: 'Brain Games',icon: Gamepad2 },
  { to: '/history',    label: 'History',    icon: History },
  { to: '/admin',      label: 'Admin',      icon: LayoutDashboard },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('ht_user') || 'null')

  const logout = () => {
    localStorage.removeItem('ht_user')
    nav('/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '60px'
    }}>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        textDecoration: 'none', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
        }}>⚕</div>
        HealthTwin
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.15s',
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              border: active ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent'
            }}>
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={13} color='var(--accent)' />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
            </div>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid var(--border-bright)',
              borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '13px', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <LogOut size={13} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{
            background: 'var(--accent)', color: '#fff', borderRadius: '8px',
            padding: '6px 16px', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none'
          }}>Sign In</Link>
        )}
      </div>
    </nav>
  )
}
