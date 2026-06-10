// Interactive 2D SVG Human Body Map
// Organs light up based on risk level from AI analysis

const RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', default: '#374151' }

export default function BodyMap({ organRisks = {} }) {
  const c = (organ) => RISK_COLORS[organRisks[organ]] || RISK_COLORS.default

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 340" className="w-48 h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <ellipse cx="80" cy="28" rx="22" ry="26" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
        {/* Neck */}
        <rect x="71" y="52" width="18" height="14" rx="4" fill="#4b5563"/>
        {/* Torso */}
        <rect x="46" y="65" width="68" height="90" rx="10" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
        {/* Brain */}
        <ellipse cx="80" cy="22" rx="16" ry="14" fill={c('brain')} opacity="0.85"/>
        <text x="80" y="26" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">Brain</text>
        {/* Heart */}
        <ellipse cx="68" cy="90" rx="13" ry="14" fill={c('heart')} opacity="0.9"/>
        <text x="68" y="94" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="bold">Heart</text>
        {/* Lungs */}
        <ellipse cx="57" cy="95" rx="9" ry="16" fill={c('lungs')} opacity="0.75"/>
        <ellipse cx="103" cy="95" rx="9" ry="16" fill={c('lungs')} opacity="0.75"/>
        <text x="57" y="99" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">L</text>
        <text x="103" y="99" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">R</text>
        <text x="80" y="112" textAnchor="middle" fontSize="6" fill="#9ca3af">Lungs</text>
        {/* Liver */}
        <ellipse cx="91" cy="128" rx="16" ry="11" fill={c('liver')} opacity="0.85"/>
        <text x="91" y="132" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="bold">Liver</text>
        {/* Stomach / Gut area */}
        <ellipse cx="70" cy="130" rx="10" ry="9" fill="#4b5563" opacity="0.7"/>
        {/* Kidneys */}
        <ellipse cx="57" cy="145" rx="9" ry="10" fill={c('kidneys')} opacity="0.85"/>
        <ellipse cx="103" cy="145" rx="9" ry="10" fill={c('kidneys')} opacity="0.85"/>
        <text x="57" y="149" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">K</text>
        <text x="103" y="149" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">K</text>
        <text x="80" y="163" textAnchor="middle" fontSize="6" fill="#9ca3af">Kidneys</text>
        {/* Arms */}
        <rect x="18" y="68" width="26" height="75" rx="10" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
        <rect x="116" y="68" width="26" height="75" rx="10" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
        {/* Legs */}
        <rect x="48" y="158" width="28" height="110" rx="10" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
        <rect x="84" y="158" width="28" height="110" rx="10" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
      </svg>

      {/* Legend */}
      <div className="flex gap-3 mt-3 text-xs">
        {Object.entries(RISK_COLORS).filter(([k]) => k !== 'default').map(([level, color]) => (
          <span key={level} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }}/>
            <span className="text-gray-400 capitalize">{level}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
