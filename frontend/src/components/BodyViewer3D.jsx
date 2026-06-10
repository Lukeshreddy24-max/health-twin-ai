import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, Bounds, useBounds } from '@react-three/drei'
import { Bone, Brain, Heart, Wind } from 'lucide-react'

const MODELS = [
  { id: 'skeleton',  label: 'Skeleton',  file: '/models/skeleton.glb',  icon: Bone,  color: '#e2e8f0' },
  { id: 'muscles',   label: 'Muscles',   file: '/models/muscles.glb',   icon: Heart, color: '#f87171' },
  { id: 'digestive', label: 'Digestive', file: '/models/digestive.glb', icon: Wind,  color: '#fb923c' },
  { id: 'brain',     label: 'Brain',     file: '/models/brain.glb',     icon: Brain, color: '#c084fc' },
]

const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const RISK_HEX   = { low: 0x22c55e,  medium: 0xf59e0b,  high: 0xef4444 }

function AutoFitInner() {
  const bounds = useBounds()
  useFrame(() => { try { bounds.refresh().fit() } catch {} }, 1)
  return null
}

function Model({ url, organRisks, overallRisk }) {
  const { scene } = useGLTF(url)
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.25 })

  scene.traverse((child) => {
    if (!child.isMesh) return
    const name = child.name?.toLowerCase() || ''
    let risk = null
    if (name.includes('heart'))  risk = organRisks?.heart
    if (name.includes('brain'))  risk = organRisks?.brain
    if (name.includes('lung'))   risk = organRisks?.lungs
    if (name.includes('liver'))  risk = organRisks?.liver
    if (name.includes('kidney')) risk = organRisks?.kidneys
    if (child.material) {
      child.material = child.material.clone()
      const hex = risk ? RISK_HEX[risk] : (RISK_HEX[overallRisk] || null)
      if (hex) { child.material.emissive?.setHex(hex); child.material.emissiveIntensity = risk ? 0.5 : 0.12 }
    }
  })

  return <primitive ref={ref} object={scene} scale={[1.8, 1.8, 1.8]} position={[0, -1, 0]} />
}

function LoadingFallback() {
  return <Html center><div style={{ color:'#8888aa', fontSize:'13px' }}>Loading model...</div></Html>
}

function SVGBody({ organRisks, organCauses }) {
  const ORGANS = [
    { id: 'brain',   cx: 100, cy: 52,  rx: 18, ry: 14, label: 'Brain' },
    { id: 'heart',   cx: 88,  cy: 115, rx: 12, ry: 12, label: 'Heart' },
    { id: 'lungs',   cx: 112, cy: 112, rx: 14, ry: 16, label: 'Lungs' },
    { id: 'liver',   cx: 108, cy: 140, rx: 14, ry: 10, label: 'Liver' },
    { id: 'kidneys', cx: 90,  cy: 158, rx: 10, ry: 12, label: 'Kidneys' },
  ]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px', position: 'relative' }}>
      <svg viewBox="0 0 200 340" style={{ height: '100%', maxHeight: '460px', width: 'auto' }}>
        <ellipse cx="100" cy="40" rx="26" ry="30" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <rect x="91" y="68" width="18" height="18" rx="4" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <path d="M65 86 Q58 90 55 110 L52 200 Q52 210 62 212 L138 212 Q148 210 148 200 L145 110 Q142 90 135 86 Z" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <path d="M65 88 Q50 95 45 120 L42 175 Q41 182 47 183 L58 183 Q64 182 65 175 L68 130 Q70 105 72 95 Z" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <path d="M135 88 Q150 95 155 120 L158 175 Q159 182 153 183 L142 183 Q136 182 135 175 L132 130 Q130 105 128 95 Z" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <path d="M80 212 L75 290 Q74 300 79 305 L93 305 Q98 300 98 290 L96 212 Z" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        <path d="M120 212 L125 290 Q126 300 121 305 L107 305 Q102 300 102 290 L104 212 Z" fill="#1a1a2e" stroke="#2a2a3d" strokeWidth="1.5"/>
        {ORGANS.map(({ id, cx, cy, rx, ry, label }) => {
          const risk = organRisks?.[id]
          const color = RISK_COLOR[risk] || '#2a2a3d'
          const hasRisk = !!risk
          return (
            <g key={id}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} fillOpacity={hasRisk ? 0.2 : 0.08} stroke={color} strokeWidth={hasRisk ? 1.5 : 1} strokeOpacity={hasRisk ? 0.8 : 0.3}/>
              {hasRisk && (
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth="1">
                  <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="rx" values={`${rx};${rx+4};${rx}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="ry" values={`${ry};${ry+4};${ry}`} dur="2s" repeatCount="indefinite"/>
                </ellipse>
              )}
              <text x={cx} y={cy+4} textAnchor="middle" fontSize="7" fill={hasRisk ? color : '#44445a'} fontWeight={hasRisk ? '700' : '400'}>{label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function BodyViewer3D({ organRisks = {}, organCauses = {}, overallRisk = 'low', autoRotate = true }) {
  const [activeModel, setActiveModel] = useState('skeleton')
  const [view, setView] = useState('3d')
  const current = MODELS.find(m => m.id === activeModel)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e2e', background: '#0a0a12', flexShrink: 0 }}>
        {['3d', '2d'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 20px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
            background: view === v ? '#111118' : 'transparent',
            color: view === v ? '#4f8ef7' : '#8888aa',
            borderBottom: view === v ? '2px solid #4f8ef7' : '2px solid transparent',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>{v === '3d' ? '3D Model' : '2D Map'}</button>
        ))}
      </div>

      {view === '3d' && (
        <>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e1e2e', flexShrink: 0 }}>
            {MODELS.map(({ id, label, icon: Icon, color }) => (
              <button key={id} onClick={() => setActiveModel(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                padding: '8px 4px', fontSize: '11px', fontWeight: 500, border: 'none', cursor: 'pointer',
                background: activeModel === id ? '#111118' : 'transparent',
                color: activeModel === id ? color : '#8888aa',
                borderBottom: activeModel === id ? `2px solid ${color}` : '2px solid transparent'
              }}>
                <Icon size={11}/> {label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative', background: '#080810', minHeight: '400px' }}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }} gl={{ antialias: true }} style={{ width: '100%', height: '100%' }}>
              <ambientLight intensity={0.6}/>
              <directionalLight position={[5, 5, 5]} intensity={1.2}/>
              <pointLight position={[0, 3, 0]} intensity={0.8} color={RISK_COLOR[overallRisk] || '#4f8ef7'}/>
              <Suspense fallback={<LoadingFallback/>}>
                
                  <Model key={activeModel} url={current.file} organRisks={organRisks} overallRisk={overallRisk}/>
                  
                
                <Environment preset="studio"/>
              </Suspense>
              <OrbitControls enablePan={false} minDistance={1} maxDistance={20} autoRotate={autoRotate} autoRotateSpeed={1.2}/>
            </Canvas>
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: '#44445a', pointerEvents: 'none' }}>
              drag to rotate · scroll to zoom
            </div>
          </div>
        </>
      )}

      {view === '2d' && (
        <div style={{ flex: 1, background: '#080810', minHeight: '400px' }}>
          <SVGBody organRisks={organRisks} organCauses={organCauses}/>
        </div>
      )}

      {Object.keys(organRisks).length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0, background: '#0a0a12' }}>
          {Object.entries(organRisks).map(([organ, level]) => {
            const c = RISK_COLOR[level] || '#4f8ef7'
            return (
              <span key={organ} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: c+'15', border: `1px solid ${c}30`, color: c, textTransform: 'capitalize', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c, display: 'inline-block'}}/>
                {organ} · {level}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
