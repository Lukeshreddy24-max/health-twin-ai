import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true); setError('')
    try {
      const res = await authAPI.register({ name:form.name, email:form.email, password:form.password })
      localStorage.setItem('ht_user', JSON.stringify(res.data))
      nav('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', background:'linear-gradient(135deg, #050508 0%, #0a0a18 100%)' }}>
        <div style={{ maxWidth:'480px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'48px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>⚕</div>
            <span style={{ fontFamily:'Space Grotesk', fontSize:'20px', fontWeight:'700' }}>HealthTwin</span>
          </div>
          <h1 style={{ fontSize:'48px', fontWeight:'800', lineHeight:1.1, marginBottom:'16px' }}>
            Start your<br />health journey.
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'16px', lineHeight:1.6 }}>
            Create your digital twin and get personalized AI health insights in minutes.
          </p>
        </div>
      </div>
      <div style={{ width:'480px', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', borderLeft:'1px solid var(--border)', background:'var(--bg-secondary)' }}>
        <h2 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'8px' }}>Create account</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'40px' }}>Free forever. No credit card needed.</p>
        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', color:'var(--red)', fontSize:'14px' }}>{error}</div>
        )}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div>
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password:e.target.value }))} required />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm:e.target.value }))} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'24px', color:'var(--text-secondary)', fontSize:'14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:'500' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
