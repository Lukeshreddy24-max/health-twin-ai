import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '⚕', title: 'Health Twin Simulator', desc: 'Enter your vitals and get AI-powered organ risk analysis with a 3D body map.', to: '/simulator', color: '#4f8ef7' },
  { icon: '🧠', title: 'Brain Games', desc: 'Test memory, reaction time, and pattern recognition. Get AI mental health scores.', to: '/braingames', color: '#c084fc' },
  { icon: '📚', title: 'Knowledge Base', desc: 'Browse health articles, tips, and medical knowledge organized by category.', to: '/knowledge', color: '#22c55e' },
  { icon: '📈', title: 'History', desc: 'Track your simulation history and monitor health trends over time.', to: '/history', color: '#f59e0b' },
]

export default function Home() {
  const user = JSON.parse(localStorage.getItem('ht_user') || 'null')

  return (
    <div style={{ minHeight: '100vh', background: '#050508', paddingTop: '60px' }}>

      {/* Hero */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)',
          borderRadius: '20px', padding: '6px 16px', fontSize: '12px',
          color: '#4f8ef7', fontWeight: 600, marginBottom: '32px', letterSpacing: '0.05em'
        }}>
          ⚡ AI-POWERED HEALTH ANALYSIS
        </div>

        <h1 style={{
          fontSize: '64px', fontWeight: 900, lineHeight: 1.05,
          fontFamily: 'Space Grotesk', letterSpacing: '-0.03em',
          marginBottom: '24px', color: '#f0f0f8'
        }}>
          Your Digital<br />
          <span style={{ color: '#4f8ef7' }}>Health Twin</span>
        </h1>

        <p style={{
          fontSize: '18px', color: '#8888aa', lineHeight: 1.7,
          maxWidth: '560px', margin: '0 auto 40px'
        }}>
          Simulate your body, map organ risks, predict your future health — all powered by AI. Know your risks before they become problems.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={user ? '/simulator' : '/register'} style={{
            background: '#4f8ef7', color: '#fff', borderRadius: '12px',
            padding: '14px 32px', fontSize: '15px', fontWeight: 700,
            textDecoration: 'none', fontFamily: 'Space Grotesk',
            transition: 'opacity 0.2s'
          }}>
            {user ? 'Open Simulator →' : 'Get Started Free →'}
          </Link>
          {!user && (
            <Link to="/login" style={{
              background: 'transparent', color: '#8888aa',
              border: '1px solid #1e1e2e', borderRadius: '12px',
              padding: '14px 32px', fontSize: '15px', fontWeight: 600,
              textDecoration: 'none', transition: 'color 0.2s'
            }}>
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[['20+', 'Health Inputs'], ['5', 'Organ Risk Maps'], ['3', 'AI Forecasts'], ['4', 'Brain Games']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#4f8ef7', fontFamily: 'Space Grotesk' }}>{num}</div>
              <div style={{ fontSize: '12px', color: '#44445a', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {FEATURES.map(({ icon, title, desc, to, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#111118', border: '1px solid #1e1e2e',
                borderRadius: '16px', padding: '28px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer', height: '100%'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: color + '15', border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '16px'
                }}>{icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f0f0f8', marginBottom: '8px', fontFamily: 'Space Grotesk' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#8888aa', lineHeight: 1.6 }}>{desc}</div>
                <div style={{ marginTop: '16px', fontSize: '12px', color, fontWeight: 600 }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
