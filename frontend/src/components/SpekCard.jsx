import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

const categoryColors = {
  'Getting Started': 'bg-blue-500/20 text-blue-300',
  'AI Predictions':  'bg-purple-500/20 text-purple-300',
  'Vitals Tracking': 'bg-green-500/20 text-green-300',
  'Privacy & Data':  'bg-yellow-500/20 text-yellow-300',
  'Simulator Features': 'bg-pink-500/20 text-pink-300',
  'Body Map':        'bg-orange-500/20 text-orange-300',
  'Troubleshooting': 'bg-red-500/20 text-red-300',
}

export default function SpekCard({ spek }) {
  const [open, setOpen] = useState(false)
  const colorClass = categoryColors[spek.category] || 'bg-gray-500/20 text-gray-300'

  return (
    <div className="glass p-4 cursor-pointer hover:border-green-500/30 transition-all"
      onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {spek.category}
            </span>
            {spek.tooltip_hint && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Info size={11} /> {spek.tooltip_hint}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{spek.title}</h3>
        </div>
        <button className="text-gray-400 shrink-0 mt-1">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {open && (
        <p className="mt-3 text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-3">
          {spek.content}
        </p>
      )}
    </div>
  )
}
