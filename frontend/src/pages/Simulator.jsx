import { useState } from 'react'
import BodyViewer3D from '../components/BodyViewer3D'
import { simulatorAPI } from '../utils/api'
import { Activity, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react'

const REQUIRED = [
  { key: 'age', label: 'Age', unit: 'years', min: 10, max: 100, step: 1, default: 30 },
  { key: 'height', label: 'Height', unit: 'cm', min: 100, max: 250, step: 0.5, default: 170 },
  { key: 'weight', label: 'Weight', unit: 'kg', min: 30, max: 300, step: 0.5, default: 70 },
  { key: 'blood_pressure_systolic', label: 'Systolic BP', unit: 'mmHg', min: 70, max: 220, step: 1, default: 120, hint: '90–120' },
  { key: 'blood_pressure_diastolic', label: 'Diastolic BP', unit: 'mmHg', min: 40, max: 140, step: 1, default: 80, hint: '60–80' },
  { key: 'heart_rate', label: 'Heart Rate', unit: 'BPM', min: 30, max: 200, step: 1, default: 72, hint: '60–100' },
  { key: 'glucose', label: 'Fasting Glucose', unit: 'mg/dL', min: 50, max: 400, step: 0.5, default: 90, hint: '70–99' },
  { key: 'sleep_hours', label: 'Sleep', unit: 'hrs/night', min: 1, max: 12, step: 0.5, default: 7, hint: '7–9' },
  { key: 'exercise_days', label: 'Exercise', unit: 'days/week', min: 0, max: 7, step: 1, default: 3 },
  { key: 'alcohol_units', label: 'Alcohol', unit: 'units/week', min: 0, max: 50, step: 1, default: 0 },
]

const OPTIONAL = [
  { key: 'water_intake', label: 'Water Intake', unit: 'L/day', min: 0, max: 10, step: 0.5, default: 2 },
  { key: 'stress_level', label: 'Stress Level', unit: '/10', min: 1, max: 10, step: 1, default: 5 },
  { key: 'screen_time', label: 'Screen Time', unit: 'hrs/day', min: 0, max: 24, step: 0.5, default: 4 },
  { key: 'steps_per_day', label: 'Steps/Day', unit: 'steps', min: 0, max: 30000, step: 500, default: 5000 },
  { key: 'meditation_mins', label: 'Meditation', unit: 'mins/day', min: 0, max: 120, step: 5, default: 0 },
  { key: 'mood_score', label: 'Mood Score', unit: '/10', min: 1, max: 10, step: 1, default: 5 },
]

const OPTIONAL_TEXT = [
  { key: 'diet_type', label: 'Diet Type', placeholder: 'veg / non-veg / vegan / mixed', default: 'mixed' },
  { key: 'family_history', label: 'Family History', placeholder: 'e.g. diabetes, heart disease', default: 'none' },
  { key: 'supplements', label: 'Supplements', placeholder: 'e.g. vitamin D, omega 3', default: 'none' },
]

const initForm = () => ({
  ...Object.fromEntries(REQUIRED.map(f => [f.key, f.default])),
  ...Object.fromEntries(OPTIONAL.map(f => [f.key, f.default])),
  ...Object.fromEntries(OPTIONAL_TEXT.map(f => [f.key, f.default])),
  smoker: false,
})

const RISK_COLOR = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

const inputStyle = {
  width: '100%', background: '#0a0a12', border: '1px solid #1e1e2e',
  borderRadius: '8px', padding: '8px 10px', color: '#f0f0f8',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
}

export default function Simulator() {
  const [form, setForm] = useState(initForm())
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [whatif, setWhatif] = useState('')
  const [whatifResult, setWhatifResult] = useState(null)
  const [whatifLoading, setWhatifLoading] = useState(false)
  const [showOptional, setShowOptional] = useState(false)
  const [rightTab, setRightTab] = useState('body')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const simulate = async () => {
    setLoading(true); setError(''); setResult(null); setWhatifResult(null)
    try {
      const { data } = await simulatorAPI.simulate(form)
      setResult(data)
      setRightTab('body')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Simulation failed. Is backend running?')
    } finally { setLoading(false) }
  }

  const runWhatIf = async () => {
    if (!whatif.trim() || !result) return
    setWhatifLoading(true); setWhatifResult(null)
    try {
      const { data } = await simulatorAPI.whatif({ simulation_id: result.id, scenario: whatif })
      setWhatifResult(data)
    } catch { setWhatifResult({ error: true }) }
    finally { setWhatifLoading(false) }
  }

  let ai = null
  try { ai = result ? JSON.parse(result.ai_analysis) : null } catch {}
  let timeline = null
  try { timeline = result ? JSON.parse(result.future_timeline) : null } catch {}

  const rc = result ? (RISK_COLOR[result.risk_level] || '#4f8ef7') : '#4f8ef7'
  const circ = 2 * Math.PI * 38

  const tabBtn = (id, label) => (
    <button onClick={() => setRightTab(id)} style={{
      padding: '8px 20px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
      background: rightTab === id ? '#111118' : 'transparent',
      color: rightTab === id ? '#4f8ef7' : '#8888aa',
      borderBottom: rightTab === id ? '2px solid #4f8ef7' : '2px solid transparent',
      transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.06em'
    }}>{label}</button>
  )

  return (
    <div style={{
      display: 'flex', height: '100vh', paddingTop: '60px',
      background: '#050508', overflow: 'hidden', fontFamily: 'Inter, sans-serif'
    }}>

      {/* ── LEFT PANEL: Form ── */}
      <div style={{
        width: '340px', minWidth: '340px', borderRight: '1px solid #1e1e2e',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#0a0a12'
      }}>
        <div style={{ padding: '20px 16px 0', borderBottom: '1px solid #1e1e2e', paddingBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#f0f0f8' }}>Health Twin</div>
          <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '3px' }}>Enter vitals for AI analysis</div>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Required */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#44445a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Required Fields
          </div>

          {REQUIRED.map(f => (
            <div key={f.key}>
              <div style={{ fontSize: '10px', color: '#8888aa', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>
                <span style={{ color: '#44445a' }}>{f.unit}{f.hint ? ` · ${f.hint}` : ''}</span>
              </div>
              <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                onChange={e => set(f.key, parseFloat(e.target.value))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                onBlur={e => e.target.style.borderColor = '#1e1e2e'}
              />
            </div>
          ))}

          {/* Smoker */}
          <div>
            <div style={{ fontSize: '10px', color: '#8888aa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smoker</div>
            <div onClick={() => set('smoker', !form.smoker)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: form.smoker ? '#ef4444' : '#1e1e2e', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: form.smoker ? '18px' : '2px' }}/>
              </div>
              <span style={{ fontSize: '12px', color: form.smoker ? '#ef4444' : '#8888aa' }}>{form.smoker ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Optional toggle */}
          <button onClick={() => setShowOptional(s => !s)} style={{
            background: '#111118', border: '1px solid #1e1e2e', borderRadius: '8px',
            padding: '8px 12px', cursor: 'pointer', color: '#8888aa',
            fontSize: '11px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginTop: '4px'
          }}>
            <span>Optional — 10 More Fields</span>
            <span>{showOptional ? '▲' : '▼'}</span>
          </button>

          {showOptional && (
            <>
              {OPTIONAL.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '10px', color: '#8888aa', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>
                    <span style={{ color: '#44445a' }}>{f.unit}</span>
                  </div>
                  <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                    onChange={e => set(f.key, parseFloat(e.target.value))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                    onBlur={e => e.target.style.borderColor = '#1e1e2e'}
                  />
                </div>
              ))}
              {OPTIONAL_TEXT.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '10px', color: '#8888aa', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                  <input type="text" placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    style={{ ...inputStyle }}
                    onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                    onBlur={e => e.target.style.borderColor = '#1e1e2e'}
                  />
                </div>
              ))}
            </>
          )}

          <button onClick={simulate} disabled={loading} style={{
            marginTop: '8px', background: loading ? '#1a2d52' : '#4f8ef7',
            color: '#fff', border: 'none', borderRadius: '10px', padding: '13px',
            fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk', transition: 'background 0.2s'
          }}>
            {loading ? 'Analyzing...' : '⚕ Run Simulation'}
          </button>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#ef4444', fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050508' }}>

        {/* No result yet */}
        {!result && !loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#44445a' }}>
            <Activity size={56} style={{ marginBottom: '16px', opacity: 0.2 }}/>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#44445a' }}>Run a simulation to see results</div>
            <div style={{ fontSize: '13px', marginTop: '8px', color: '#2a2a3d' }}>AI will map organ risks and forecast your future health</div>
          </div>
        )}

        {result && ai && (
          <>
            {/* Risk bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '16px 24px', borderBottom: '1px solid #1e1e2e',
              background: '#0a0a12', flexShrink: 0
            }}>
              <svg width="70" height="70" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="#1e1e2e" strokeWidth="8"/>
                <circle cx="45" cy="45" r="38" fill="none" strokeWidth="8" stroke={rc}
                  strokeDasharray={`${(result.risk_score / 100) * circ} ${circ}`}
                  strokeLinecap="round" transform="rotate(-90 45 45)"/>
                <text x="45" y="49" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">{result.risk_score}</text>
                <text x="45" y="62" textAnchor="middle" fontSize="9" fill="#8888aa">/100</text>
              </svg>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: rc, fontFamily: 'Space Grotesk' }}>{result.risk_level} Risk</div>
                <div style={{ fontSize: '12px', color: '#8888aa', marginTop: '4px', lineHeight: 1.5, maxWidth: '500px' }}>{ai.summary}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {Object.entries(ai.organ_risks || {}).map(([organ, level]) => (
                  <span key={organ} style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
                    background: level === 'high' ? 'rgba(239,68,68,0.15)' : level === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                    color: level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#22c55e',
                    border: `1px solid ${level === 'high' ? 'rgba(239,68,68,0.3)' : level === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    fontWeight: 600, textTransform: 'capitalize'
                  }}>{organ}</span>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1e1e2e', background: '#0a0a12', flexShrink: 0 }}>
              {tabBtn('body', '3D Body')}
              {tabBtn('analysis', 'Analysis')}
              {tabBtn('timeline', 'Timeline')}
              {tabBtn('whatif', 'What-If')}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* BODY TAB — fills everything */}
              {rightTab === 'body' && (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <BodyViewer3D
                    organRisks={ai.organ_risks || {}}
                    organCauses={ai.organ_causes || {}}
                    overallRisk={result.risk_level?.toLowerCase()}
                    autoRotate={true}
                    fullHeight={true}
                  />
                </div>
              )}

              {/* ANALYSIS TAB */}
              {rightTab === 'analysis' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignContent: 'start' }}>
                  <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <AlertTriangle size={14} color="#ef4444"/>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Risks</span>
                    </div>
                    {(ai.top_risks || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#8888aa', marginBottom: '8px', lineHeight: 1.4 }}>
                        <span style={{ color: '#ef4444', flexShrink: 0 }}>•</span>{r}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <CheckCircle size={14} color="#22c55e"/>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recommendations</span>
                    </div>
                    {(ai.recommendations || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#8888aa', marginBottom: '8px', lineHeight: 1.4 }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{r}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '20px', gridColumn: '1/-1' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Organ Risk Detail</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {Object.entries(ai.organ_risks || {}).map(([organ, level]) => {
                        const color = level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#22c55e'
                        const cause = ai.organ_causes?.[organ]
                        return (
                          <div key={organ} style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '12px 16px', minWidth: '140px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color, textTransform: 'capitalize', marginBottom: '4px' }}>{organ}</div>
                            <div style={{ fontSize: '11px', color: '#8888aa' }}>{level} risk</div>
                            {cause && <div style={{ fontSize: '11px', color: '#44445a', marginTop: '4px' }}>{cause}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TIMELINE TAB */}
              {rightTab === 'timeline' && timeline && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Clock size={16} color="#4f8ef7"/>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4f8ef7' }}>Long-Term Forecast (if habits unchanged)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[['5_years', '+5 Years', '#f59e0b'], ['10_years', '+10 Years', '#ef4444'], ['20_years', '+20 Years', '#dc2626']].map(([k, label, color]) =>
                      timeline[k] && (
                        <div key={k} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '14px', padding: '20px', display: 'flex', gap: '16px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color, flexShrink: 0, minWidth: '80px' }}>{label}</div>
                          <p style={{ fontSize: '14px', color: '#8888aa', lineHeight: 1.6, margin: 0 }}>{timeline[k]}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* WHAT-IF TAB */}
              {rightTab === 'whatif' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Zap size={16} color="#f59e0b"/>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>What-If Simulator</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#44445a', marginBottom: '16px' }}>Ask AI how lifestyle changes would affect your risk score</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input value={whatif} onChange={e => setWhatif(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && runWhatIf()}
                      placeholder='e.g. "What if I quit smoking and exercise daily?"'
                      style={{ ...inputStyle, flex: 1, padding: '12px 14px' }}
                      onFocus={e => e.target.style.borderColor = '#f59e0b'}
                      onBlur={e => e.target.style.borderColor = '#1e1e2e'}
                    />
                    <button onClick={runWhatIf} disabled={whatifLoading} style={{
                      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                      color: '#f59e0b', borderRadius: '8px', padding: '12px 20px',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0
                    }}>{whatifLoading ? '...' : 'Ask AI'}</button>
                  </div>
                  {whatifResult && !whatifResult.error && (
                    <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b' }}>{whatifResult.new_risk_score}</span>
                        <span style={{ fontSize: '14px', color: '#8888aa' }}>/100 — <span style={{ color: '#f59e0b' }}>{whatifResult.change}</span></span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#8888aa', lineHeight: 1.6, marginBottom: '12px' }}>{whatifResult.impact}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(whatifResult.additional_benefits || []).map((b, i) => (
                          <span key={i} style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: '20px', padding: '3px 10px' }}>{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
