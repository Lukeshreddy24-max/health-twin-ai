import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { speksAPI } from '../utils/api'

const CATEGORIES = ['Getting Started', 'AI Predictions', 'Vitals Tracking', 'Privacy & Data', 'Simulator Features', 'Body Map', 'Troubleshooting']
const blank = { title: '', content: '', category: 'Getting Started', tooltip_hint: '' }

export default function Admin() {
  const [speks, setSpeks] = useState([])
  const [form, setForm] = useState(blank)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => speksAPI.getAll().then(r => setSpeks(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setLoading(true)
    try {
      if (editId) { await speksAPI.update(editId, form); flash('Spek updated!') }
      else         { await speksAPI.create(form);         flash('Spek created!') }
      setForm(blank); setEditId(null); setShowForm(false); load()
    } catch { flash('Error saving spek') }
    finally { setLoading(false) }
  }

  const handleEdit = (spek) => {
    setForm({ title: spek.title, content: spek.content, category: spek.category, tooltip_hint: spek.tooltip_hint || '' })
    setEditId(spek.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this spek?')) return
    await speksAPI.delete(id); flash('Deleted'); load()
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
            <p className="text-gray-400">Manage Spekit knowledge cards</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(blank) }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all">
            <Plus size={16}/> New Spek
          </button>
        </div>

        {msg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>}

        {/* Form Modal */}
        {showForm && (
          <div className="glass p-6 mb-6 border-green-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">{editId ? 'Edit Spek' : 'New Spek'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null) }}><X size={18} className="text-gray-400"/></button>
            </div>
            <div className="grid gap-3">
              <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                placeholder="Title *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}/>
              <textarea rows={4} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50 resize-none"
                placeholder="Content *" value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}/>
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50 bg-gray-900"
                  value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  placeholder="Tooltip hint (optional)" value={form.tooltip_hint} onChange={e => setForm(f => ({...f, tooltip_hint: e.target.value}))}/>
              </div>
              <button onClick={handleSave} disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-xl transition-all">
                <Check size={16}/> {loading ? 'Saving...' : 'Save Spek'}
              </button>
            </div>
          </div>
        )}

        {/* Speks table */}
        <div className="glass overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-xs text-gray-500 border-b border-white/10 px-5 py-3">
            <span>Title / Content</span><span>Category</span><span className="px-4">Tooltip</span><span>Actions</span>
          </div>
          {speks.map(spek => (
            <div key={spek.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center border-b border-white/5 px-5 py-3 hover:bg-white/2 transition-all">
              <div>
                <div className="text-sm font-medium text-white">{spek.title}</div>
                <div className="text-xs text-gray-500 truncate max-w-sm mt-0.5">{spek.content}</div>
              </div>
              <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-gray-400 mx-3">{spek.category}</span>
              <span className="text-xs text-gray-600 px-4 max-w-32 truncate">{spek.tooltip_hint || '—'}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(spek)} className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"><Pencil size={14}/></button>
                <button onClick={() => handleDelete(spek.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {speks.length === 0 && <p className="text-center py-10 text-gray-600">No speks yet. Create one!</p>}
        </div>
        <p className="text-gray-600 text-sm mt-3">{speks.length} speks total</p>
      </div>
    </div>
  )
}
