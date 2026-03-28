import { Search, Bell, ChevronDown, Building2 } from 'lucide-react'
import { useState } from 'react'

const DEMO_WAREHOUSES = [
  { id: 'all',      name: 'All Warehouses' },
  { id: 'dxb-wh1', name: 'DXB-WH1 — Jebel Ali' },
  { id: 'dxb-wh2', name: 'DXB-WH2 — Al Quoz' },
  { id: 'shj-wh1', name: 'SHJ-WH1 — Sharjah' },
  { id: 'abu-wh1', name: 'ABU-WH1 — Abu Dhabi' },
  { id: 'dxb-wh3', name: 'DXB-WH3 — DIP' },
]

export default function PageHeader({ title, subtitle }) {
  const [warehouse, setWarehouse] = useState('all')
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')

  const selectedWarehouse = DEMO_WAREHOUSES.find(w => w.id === warehouse)

  return (
    <header style={{
      height: 60,
      background: '#fff',
      borderBottom: '1px solid #E8ECF2',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 20,
      flexShrink: 0,
    }}>
      {/* Title */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: '#1A2440',
          fontFamily: 'DM Sans, sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 12, color: '#6B7A94', fontFamily: 'DM Sans, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#F4F6FA',
        border: '1px solid #E8ECF2',
        borderRadius: 8,
        padding: '0 12px',
        height: 36,
        width: 240,
      }}>
        <Search size={15} color="#6B7A94" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs, workers..."
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            color: '#1A2440',
            fontFamily: 'DM Sans, sans-serif',
            width: '100%',
          }}
        />
      </div>

      {/* Warehouse filter */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(d => !d)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#F4F6FA',
            border: '1px solid #E8ECF2',
            borderRadius: 8,
            padding: '0 12px',
            height: 36,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: '#1A2440',
            whiteSpace: 'nowrap',
          }}
        >
          <Building2 size={15} color="#6B7A94" />
          <span>{selectedWarehouse?.name}</span>
          <ChevronDown size={14} color="#6B7A94" />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 30 }}
              onClick={() => setShowDropdown(false)}
            />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#fff',
              border: '1px solid #E8ECF2',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(11,29,58,0.10)',
              zIndex: 40,
              minWidth: 220,
              overflow: 'hidden',
            }}>
              {DEMO_WAREHOUSES.map(w => (
                <button
                  key={w.id}
                  onClick={() => { setWarehouse(w.id); setShowDropdown(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '9px 14px',
                    border: 'none',
                    background: warehouse === w.id ? '#F4F6FA' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13,
                    color: warehouse === w.id ? '#1565C0' : '#1A2440',
                    fontWeight: warehouse === w.id ? 600 : 400,
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notification bell */}
      <button style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: '1px solid #E8ECF2',
        background: '#F4F6FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
      }}>
        <Bell size={16} color="#6B7A94" />
        {/* Unread dot */}
        <span style={{
          position: 'absolute',
          top: 7,
          right: 7,
          width: 7,
          height: 7,
          background: '#FF6B00',
          borderRadius: '50%',
          border: '1.5px solid #F4F6FA',
        }} />
      </button>
    </header>
  )
}
