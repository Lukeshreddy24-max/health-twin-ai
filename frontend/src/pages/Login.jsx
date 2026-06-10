import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'

export default function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(form)
      localStorage.setItem('ht_user', JSON.stringify(res.data))
      nav('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)' }}>
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px', background:'linear-gradient(135deg, #050508 0%, #0a0a18 100%)'
      }}>
        <div style={{ maxWidth:'480px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'48px' }}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'10px',
              background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'18px'
            }}>⚕</div>
            <span style={{ fontFamily:'Space Grotesk', fontSize:'20px', fontWeight:'700' }}>HealthTwin</span>
          </div>
          <h1 style={{ fontSize:'48px', fontWeight:'800', lineHeight:1.1, marginBottom:'16px' }}>
            Your digital<br />health mirror.
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'16px', lineHeight:1.6, marginBottom:'40px' }}>
            AI-powered simulation of your body. Predict risks, map organ health, and see your future.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {['AI Risk Analysis', 'Organ Risk Mapping', 'Future Timeline', 'Brain Games'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)' }} />
                <span style={{ color:'var(--text-secondary)', fontSize:'14px' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        width:'480px', display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px', borderLeft:'1px solid var(--border)', background:'var(--bg-secondary)'
      }}>
        <h2 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'8px' }}>Welcome back</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'40px' }}>
          Sign in to your Health Twin account
        </p>

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:'10px', padding:'12px 16px', marginBottom:'20px',
            color:'var(--red)', fontSize:'14px'
          }}>{error}</div>
        )}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'24px', color:'var(--text-secondary)', fontSize:'14px' }}>
          No account?{' '}
          <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:'500' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
