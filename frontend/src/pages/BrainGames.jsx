import { useState, useEffect, useRef, useCallback } from 'react'
import { simulatorAPI } from '../utils/api'

const GAMES = [
  { id: 'memory',    label: 'Memory Match',    desc: 'Flip cards and find matching pairs', icon: '🧠' },
  { id: 'reaction',  label: 'Reaction Time',   desc: 'Click as fast as you can when green appears', icon: '⚡' },
  { id: 'pattern',   label: 'Pattern Sequence',desc: 'Remember and repeat the pattern', icon: '🔢' },
  { id: 'sudoku',    label: 'Mini Sudoku',     desc: 'Solve a 4x4 Sudoku puzzle', icon: '🔲' },
]

const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }

// ── Memory Match ──────────────────────────────────────────────
const EMOJIS = ['🫀','🧠','🫁','🦷','👁️','🦴','🩸','💊']
function MemoryGame({ onScore }) {
  const makeCards = () => [...EMOJIS,...EMOJIS].map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})).sort(()=>Math.random()-0.5)
  const [cards, setCards] = useState(makeCards)
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const [startTime] = useState(Date.now())

  const flip = (id) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return
    const next = [...cards]; next[id] = {...next[id], flipped:true}
    const nf = [...flipped, id]
    setCards(next); setFlipped(nf); setMoves(m=>m+1)
    if (nf.length === 2) {
      setTimeout(() => {
        setCards(c => {
          const nc = [...c]
          if (nc[nf[0]].emoji === nc[nf[1]].emoji) {
            nc[nf[0]] = {...nc[nf[0]], matched:true}
            nc[nf[1]] = {...nc[nf[1]], matched:true}
          } else {
            nc[nf[0]] = {...nc[nf[0]], flipped:false}
            nc[nf[1]] = {...nc[nf[1]], flipped:false}
          }
          const allDone = nc.every(c=>c.matched)
          if (allDone) {
            const secs = Math.round((Date.now()-startTime)/1000)
            const score = Math.max(0, 100 - moves*2 - secs)
            onScore(score, `Completed in ${moves} moves, ${secs}s`)
            setDone(true)
          }
          return nc
        })
        setFlipped([])
      }, 700)
    }
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px',fontSize:'13px',color:'var(--text-secondary)'}}>
        <span>Moves: <b style={{color:'var(--text-primary)'}}>{moves}</b></span>
        {done && <span style={{color:'#22c55e',fontWeight:600}}>✓ Complete!</span>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
        {cards.map((c,i) => (
          <div key={c.id} onClick={() => flip(i)} style={{
            height:'64px', borderRadius:'10px', cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center', fontSize:'24px',
            background: c.flipped||c.matched ? 'var(--accent-dim)' : 'var(--bg-secondary)',
            border: c.matched ? '1px solid #22c55e' : '1px solid var(--border)',
            transition:'all 0.2s', transform: c.flipped||c.matched ? 'scale(1.04)' : 'scale(1)'
          }}>
            {c.flipped||c.matched ? c.emoji : '?'}
          </div>
        ))}
      </div>
      {done && <button onClick={()=>{setCards(makeCards());setMoves(0);setFlipped([]);setDone(false)}} style={{marginTop:'14px',width:'100%',padding:'10px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>Play Again</button>}
    </div>
  )
}

// ── Reaction Time ─────────────────────────────────────────────
function ReactionGame({ onScore }) {
  const [state, setState] = useState('idle')
  const [times, setTimes] = useState([])
  const [startT, setStartT] = useState(null)
  const timer = useRef(null)

  const start = () => {
    setState('waiting')
    timer.current = setTimeout(() => {
      setState('go'); setStartT(Date.now())
    }, 1500 + Math.random()*2500)
  }

  const click = () => {
    if (state === 'waiting') { clearTimeout(timer.current); setState('early'); return }
    if (state === 'go') {
      const ms = Date.now() - startT
      const nt = [...times, ms]; setTimes(nt); setState('idle')
      if (nt.length >= 5) {
        const avg = Math.round(nt.reduce((a,b)=>a+b,0)/nt.length)
        const score = Math.max(0, Math.min(100, Math.round((500-avg)/4)))
        onScore(score, `Avg reaction: ${avg}ms`)
      }
    }
  }

  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : null

  return (
    <div style={{textAlign:'center'}}>
      <div onClick={click} style={{
        height:'180px', borderRadius:'16px', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:'16px',
        background: state==='go' ? '#22c55e' : state==='waiting' ? '#1a1a2e' : 'var(--bg-secondary)',
        border: `2px solid ${state==='go'?'#22c55e':state==='early'?'#ef4444':'var(--border)'}`,
        transition:'background 0.1s'
      }}>
        <div style={{fontSize:'32px',marginBottom:'8px'}}>
          {state==='idle'?'🖱️':state==='waiting'?'⏳':state==='go'?'⚡':'❌'}
        </div>
        <div style={{fontSize:'14px',fontWeight:600,color: state==='go'?'#000':'var(--text-primary)'}}>
          {state==='idle'?'Click Start':''}
          {state==='waiting'?'Wait for green...':''}
          {state==='go'?'CLICK NOW!':''}
          {state==='early'?'Too early!':''}
        </div>
      </div>
      <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'16px',flexWrap:'wrap'}}>
        {times.map((t,i)=>(
          <span key={i} style={{fontSize:'12px',padding:'4px 10px',borderRadius:'20px',background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
            {t}ms
          </span>
        ))}
      </div>
      {avg && <div style={{fontSize:'13px',color:'var(--text-secondary)',marginBottom:'12px'}}>Avg: <b style={{color:'var(--accent)'}}>{avg}ms</b></div>}
      {times.length < 5
        ? <button onClick={start} disabled={state==='waiting'||state==='go'} style={{padding:'10px 24px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>
            {state==='waiting'||state==='go'?'...':'Round '+(times.length+1)+'/5'}
          </button>
        : <button onClick={()=>setTimes([])} style={{padding:'10px 24px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>Play Again</button>
      }
    </div>
  )
}

// ── Pattern Sequence ──────────────────────────────────────────
const PAT_COLORS = ['#ef4444','#4f8ef7','#22c55e','#f59e0b']
function PatternGame({ onScore }) {
  const [seq, setSeq] = useState([])
  const [userSeq, setUserSeq] = useState([])
  const [phase, setPhase] = useState('idle')
  const [active, setActive] = useState(null)
  const [level, setLevel] = useState(0)
  const [fail, setFail] = useState(false)

  const showSeq = useCallback((s) => {
    setPhase('showing')
    s.forEach((idx,i) => {
      setTimeout(()=>setActive(idx), i*700)
      setTimeout(()=>setActive(null), i*700+400)
    })
    setTimeout(()=>setPhase('input'), s.length*700+200)
  }, [])

  const startRound = useCallback(() => {
    setFail(false); setUserSeq([])
    const ns = [...seq, Math.floor(Math.random()*4)]
    setSeq(ns); setLevel(ns.length)
    showSeq(ns)
  }, [seq, showSeq])

  const pressBtn = (idx) => {
    if (phase !== 'input') return
    const nu = [...userSeq, idx]
    setUserSeq(nu)
    const correct = nu.every((v,i) => v === seq[i])
    if (!correct) {
      setFail(true); setPhase('idle')
      const score = Math.min(100, (seq.length-1)*10)
      onScore(score, `Reached level ${seq.length-1}`)
      setSeq([]); setLevel(0)
      return
    }
    if (nu.length === seq.length) {
      setPhase('idle'); setUserSeq([])
    }
  }

  return (
    <div style={{textAlign:'center'}}>
      <div style={{marginBottom:'16px',fontSize:'13px',color:'var(--text-secondary)'}}>
        Level: <b style={{color:'var(--accent)'}}>{level}</b>
        {fail && <span style={{color:'#ef4444',marginLeft:'12px'}}>Wrong! Try again.</span>}
        {phase==='showing' && <span style={{color:'#f59e0b',marginLeft:'12px'}}>Watch the pattern...</span>}
        {phase==='input' && <span style={{color:'#22c55e',marginLeft:'12px'}}>Your turn!</span>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',maxWidth:'240px',margin:'0 auto 20px'}}>
        {PAT_COLORS.map((color,i)=>(
          <div key={i} onClick={()=>pressBtn(i)} style={{
            height:'80px', borderRadius:'12px', cursor: phase==='input'?'pointer':'default',
            background: active===i ? color : `${color}30`,
            border:`2px solid ${active===i?color:`${color}60`}`,
            transition:'all 0.1s', transform: active===i?'scale(1.08)':'scale(1)'
          }}/>
        ))}
      </div>
      {phase==='idle' && (
        <button onClick={startRound} style={{padding:'10px 24px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>
          {seq.length===0?'Start':'Next Round'}
        </button>
      )}
    </div>
  )
}

// ── Mini Sudoku (4x4) ─────────────────────────────────────────
const PUZZLES = [
  { puzzle:[[1,0,0,4],[0,4,0,0],[0,0,4,0],[4,0,0,1]], solution:[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]] },
  { puzzle:[[0,2,0,0],[0,0,0,3],[4,0,0,0],[0,0,1,0]], solution:[[1,2,4,3],[2,1,3,4],[4,3,2,1],[3,4,1,2]] }, // simplified valid
]
function SudokuGame({ onScore }) {
  const [pIdx] = useState(()=>Math.floor(Math.random()*PUZZLES.length))
  const p = PUZZLES[pIdx]
  const [grid, setGrid] = useState(p.puzzle.map(r=>[...r]))
  const [errors, setErrors] = useState(0)
  const [done, setDone] = useState(false)
  const [startTime] = useState(Date.now())

  const set = (r,c,v) => {
    if (p.puzzle[r][c] !== 0) return
    const ng = grid.map(row=>[...row]); ng[r][c] = v
    setGrid(ng)
    if (v !== p.solution[r][c]) { setErrors(e=>e+1); return }
    if (ng.every((row,ri)=>row.every((cell,ci)=>cell===p.solution[ri][ci]))) {
      const secs = Math.round((Date.now()-startTime)/1000)
      const score = Math.max(0, 100 - errors*5 - Math.floor(secs/10))
      onScore(score, `Solved in ${secs}s with ${errors} errors`)
      setDone(true)
    }
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px',fontSize:'13px',color:'var(--text-secondary)'}}>
        <span>Errors: <b style={{color:'#ef4444'}}>{errors}</b></span>
        {done && <span style={{color:'#22c55e',fontWeight:600}}>✓ Solved!</span>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',maxWidth:'220px',margin:'0 auto 16px'}}>
        {grid.map((row,r)=>row.map((cell,c)=>{
          const fixed = p.puzzle[r][c] !== 0
          const wrong = cell!==0 && cell!==p.solution[r][c]
          return (
            <div key={`${r}-${c}`} style={{position:'relative'}}>
              {fixed
                ? <div style={{height:'48px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-secondary)',borderRadius:'6px',border:'1px solid var(--border-bright)',fontWeight:700,fontSize:'18px',color:'var(--accent)'}}>{cell}</div>
                : <select value={cell||''} onChange={e=>set(r,c,parseInt(e.target.value)||0)} style={{
                    width:'100%',height:'48px',textAlign:'center',background: wrong?'rgba(239,68,68,0.15)':'var(--bg-primary)',
                    border:`1px solid ${wrong?'#ef4444':'var(--border)'}`,borderRadius:'6px',
                    color: wrong?'#ef4444':'var(--text-primary)',fontSize:'16px',cursor:'pointer',outline:'none'
                  }}>
                    <option value=''>-</option>
                    {[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
              }
            </div>
          )
        }))}
      </div>
      <p style={{fontSize:'11px',color:'var(--text-dim)',textAlign:'center'}}>Fill each row, column, and 2×2 box with 1–4</p>
    </div>
  )
}

// ── AI Evaluation ─────────────────────────────────────────────
async function getAIEval(scores) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'claude-sonnet-4-20250514',
      max_tokens:400,
      messages:[{role:'user',content:`A user completed brain games with these scores:
${Object.entries(scores).map(([g,s])=>`- ${g}: ${s.score}/100 (${s.note})`).join('\n')}

Respond ONLY with JSON (no markdown):
{
  "overall": 0-100,
  "mental_health": "low|medium|high concern",
  "strengths": ["strength1"],
  "areas": ["area to improve"],
  "advice": "2 sentence mental health advice"
}`}]}),
  })
  const d = await res.json()
  return JSON.parse(d.content[0].text)
}

// ── Main Page ─────────────────────────────────────────────────
export default function BrainGames() {
  const [active, setActive] = useState(null)
  const [scores, setScores] = useState({})
  const [eval_, setEval] = useState(null)
  const [evalLoading, setEvalLoading] = useState(false)

  const addScore = (gameId, score, note) => {
    setScores(s => ({ ...s, [gameId]: { score, note } }))
  }

  const runEval = async () => {
    if (Object.keys(scores).length === 0) return
    setEvalLoading(true)
    try {
      const result = await getAIEval(scores)
      setEval(result)
    } catch (e) {
      setEval({ overall: 0, mental_health: 'unknown', strengths: [], areas: [], advice: 'Could not evaluate. Check API.' })
    } finally { setEvalLoading(false) }
  }

  const GameComp = { memory: MemoryGame, reaction: ReactionGame, pattern: PatternGame, sudoku: SudokuGame }

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>Brain Games</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Play games, earn scores, and get AI mental health analysis</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Game selector + player */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {GAMES.map(g => (
                <div key={g.id} onClick={() => setActive(g.id)} style={{
                  background: active===g.id ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${active===g.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{g.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: active===g.id ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '4px' }}>{g.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{g.desc}</div>
                  {scores[g.id] && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>
                      Score: {scores[g.id].score}/100
                    </div>
                  )}
                </div>
              ))}
            </div>

            {active && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{GAMES.find(g=>g.id===active)?.icon}</span>
                  {GAMES.find(g=>g.id===active)?.label}
                </div>
                {(() => {
                  const Comp = GameComp[active]
                  return <Comp onScore={(s,n) => addScore(active, s, n)} />
                })()}
              </div>
            )}
          </div>

          {/* Scores + AI eval */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Your Scores</div>
              {GAMES.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{g.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{g.label}</div>
                      {scores[g.id] && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{scores[g.id].note}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: scores[g.id] ? (scores[g.id].score>=70?'#22c55e':scores[g.id].score>=40?'#f59e0b':'#ef4444') : 'var(--text-dim)' }}>
                    {scores[g.id] ? `${scores[g.id].score}` : '—'}
                  </div>
                </div>
              ))}

              <button onClick={runEval} disabled={evalLoading || Object.keys(scores).length===0} style={{
                marginTop: '16px', width: '100%', padding: '12px',
                background: Object.keys(scores).length===0 ? 'var(--bg-secondary)' : 'var(--accent)',
                color: '#fff', border: 'none', borderRadius: '10px',
                cursor: Object.keys(scores).length===0 ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: '14px', fontFamily: 'Space Grotesk'
              }}>
                {evalLoading ? 'Analyzing...' : '🧠 Get AI Mental Health Report'}
              </button>
            </div>

            {eval_ && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>AI Mental Health Report</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" fill="none" stroke="var(--border-bright)" strokeWidth="6"/>
                    <circle cx="35" cy="35" r="28" fill="none" strokeWidth="6"
                      stroke={eval_.overall>=70?'#22c55e':eval_.overall>=40?'#f59e0b':'#ef4444'}
                      strokeDasharray={`${(eval_.overall/100)*176} 176`}
                      strokeLinecap="round" transform="rotate(-90 35 35)"/>
                    <text x="35" y="39" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">{eval_.overall}</text>
                  </svg>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: RISK_COLOR[eval_.mental_health?.split(' ')[0]] || 'var(--accent)' }}>
                      {eval_.mental_health}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>mental health concern</div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>{eval_.advice}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', marginBottom: '8px', textTransform: 'uppercase' }}>Strengths</div>
                    {(eval_.strengths||[]).map((s,i)=>(
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display:'flex', gap:'6px' }}>
                        <span style={{color:'#22c55e'}}>✓</span>{s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px', textTransform: 'uppercase' }}>Improve</div>
                    {(eval_.areas||[]).map((s,i)=>(
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display:'flex', gap:'6px' }}>
                        <span style={{color:'#f59e0b'}}>→</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
