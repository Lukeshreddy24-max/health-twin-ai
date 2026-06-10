import { useState, useEffect } from 'react'
import { speksAPI } from '../utils/api'
import { Search } from 'lucide-react'

export default function Knowledge() {
  const [speks, setSpeks] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([speksAPI.getAll({}), speksAPI.getCategories()])
      .then(([s, c]) => {
        setSpeks(s.data)
        setCategories(['All', ...c.data])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = speks.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#050508', paddingTop: '60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#f0f0f8', marginBottom: '8px' }}>
            Knowledge Base
          </h1>
          <p style={{ fontSize: '14px', color: '#8888aa' }}>Health articles, tips, and medical knowledge</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#44445a' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            style={{
              width: '100%', background: '#111118', border: '1px solid #1e1e2e',
              borderRadius: '10px', padding: '12px 14px 12px 40px',
              color: '#f0f0f8', fontSize: '14px', outline: 'none', fontFamily: 'Inter'
            }}
            onFocus={e => e.target.style.borderColor = '#4f8ef7'}
            onBlur={e => e.target.style.borderColor = '#1e1e2e'}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeCategory === cat ? '#4f8ef7' : '#111118',
              color: activeCategory === cat ? '#fff' : '#8888aa',
              outline: activeCategory === cat ? 'none' : '1px solid #1e1e2e'
            }}>{cat}</button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#44445a' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#44445a' }}>No results found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {filtered.map(spek => (
              <div key={spek.id} style={{
                background: '#111118', border: '1px solid #1e1e2e',
                borderRadius: '14px', padding: '20px', transition: 'border-color 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a3d'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f8', fontFamily: 'Space Grotesk', lineHeight: 1.3 }}>{spek.title}</h3>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '20px', flexShrink: 0, marginLeft: '10px',
                    background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: '#4f8ef7', fontWeight: 600
                  }}>{spek.category}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#8888aa', lineHeight: 1.6, marginBottom: spek.tooltip_hint ? '12px' : '0' }}>
                  {spek.content.length > 180 ? spek.content.slice(0, 180) + '...' : spek.content}
                </p>
                {spek.tooltip_hint && (
                  <div style={{
                    marginTop: '12px', background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)',
                    borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#4f8ef7'
                  }}>
                    💡 {spek.tooltip_hint}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
