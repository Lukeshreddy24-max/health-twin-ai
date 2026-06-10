import { useState, useEffect } from 'react'
import { simulatorAPI } from '../utils/api'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'

const RISK_COLOR = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('ht_user') || 'null')

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    simulatorAPI.history(user.id)
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050508', paddingTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#f0f0f8', marginBottom: '8px' }}>
            Simulation History
          </h1>
          <p style={{ fontSize: '14px', color: '#8888aa' }}>Your past health twin simulations</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#44445a' }}>Loading...</div>
        )}

        {!loading && !user && (
          <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#44445a' }}>
            Sign in to view your history
          </div>
        )}

        {!loading && user && history.length === 0 && (
          <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#44445a' }}>
            No simulations yet. Run your first one!
          </div>
        )}

        {!loading && history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((sim, i) => {
              const rc = RISK_COLOR[sim.risk_level] || '#4f8ef7'
              const prev = history[i + 1]
              const improved = prev && sim.risk_score < prev.risk_score
              const worsened = prev && sim.risk_score > prev.risk_score
              let ai = null
              try { ai = JSON.parse(sim.ai_analysis) } catch {}

              return (
                <div key={sim.id} style={{
                  background: '#111118', border: '1px solid #1e1e2e',
                  borderRadius: '14px', padding: '20px',
                  transition: 'border-color 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a3d'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: rc + '15', border: `2px solid ${rc}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: 900, color: rc, fontFamily: 'Space Grotesk'
                      }}>{sim.risk_score}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: rc }}>{sim.risk_level} Risk</div>
                        <div style={{ fontSize: '11px', color: '#44445a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> {new Date(sim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
                      {improved && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '3px 10px' }}><TrendingDown size={10} /> Improved</span>}
                      {worsened && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '3px 10px' }}><TrendingUp size={10} /> Worsened</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: ai?.summary ? '12px' : '0' }}>
                    {[
                      ['Age', sim.age + ' yrs'],
                      ['BMI', (sim.weight / ((sim.height / 100) ** 2)).toFixed(1)],
                      ['BP', `${sim.blood_pressure_systolic}/${sim.blood_pressure_diastolic}`],
                      ['HR', sim.heart_rate + ' BPM'],
                      ['Glucose', sim.glucose + ' mg/dL'],
                      ['Sleep', sim.sleep_hours + ' hrs'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '10px', color: '#44445a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f8', marginTop: '2px' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {ai?.summary && (
                    <div style={{ fontSize: '12px', color: '#8888aa', lineHeight: 1.5, borderTop: '1px solid #1e1e2e', paddingTop: '12px' }}>
                      {ai.summary}
                    </div>
                  )}

                  {ai?.organ_risks && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {Object.entries(ai.organ_risks).map(([organ, level]) => {
                        const c = RISK_COLOR[level.charAt(0).toUpperCase() + level.slice(1)] || '#4f8ef7'
                        return (
                          <span key={organ} style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                            background: c + '15', border: `1px solid ${c}30`, color: c,
                            textTransform: 'capitalize', fontWeight: 600
                          }}>{organ}</span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
