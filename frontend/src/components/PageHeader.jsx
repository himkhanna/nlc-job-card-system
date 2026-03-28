import { Search, Bell, ChevronDown, Building2, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWarehouse } from '../context/WarehouseContext'

export default function PageHeader({ title, subtitle }) {
  const { user, logout }                             = useAuth()
  const { warehouses, selectedWarehouseId, selectWarehouse } = useWarehouse()
  const navigate                                     = useNavigate()
  const [showWh, setShowWh]      = useState(false)
  const [showUser, setShowUser]  = useState(false)
  const [search, setSearch]      = useState('')

  const selectedWh = warehouses.find(w => w.id === selectedWarehouseId)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

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
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A2440', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F6FA', border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 12px', height: 36, width: 240 }}>
        <Search size={15} color="#6B7A94" style={{ flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs, workers..."
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1A2440', fontFamily: 'DM Sans, sans-serif', width: '100%' }} />
      </div>

      {/* Warehouse filter */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => { setShowWh(d => !d); setShowUser(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F4F6FA', border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 12px', height: 36, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#1A2440', whiteSpace: 'nowrap' }}>
          <Building2 size={15} color="#6B7A94" />
          <span>{selectedWh ? selectedWh.name : 'All Warehouses'}</span>
          <ChevronDown size={14} color="#6B7A94" />
        </button>
        {showWh && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowWh(false)} />
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #E8ECF2', borderRadius: 10, boxShadow: '0 4px 16px rgba(11,29,58,0.10)', zIndex: 40, minWidth: 220, overflow: 'hidden' }}>
              <button onClick={() => { selectWarehouse(null); setShowWh(false) }}
                style={{ display: 'block', width: '100%', padding: '9px 14px', border: 'none', background: !selectedWarehouseId ? '#F4F6FA' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: !selectedWarehouseId ? '#1565C0' : '#1A2440', fontWeight: !selectedWarehouseId ? 600 : 400 }}>
                All Warehouses
              </button>
              {warehouses.map(w => (
                <button key={w.id} onClick={() => { selectWarehouse(w.id); setShowWh(false) }}
                  style={{ display: 'block', width: '100%', padding: '9px 14px', border: 'none', background: selectedWarehouseId === w.id ? '#F4F6FA' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: selectedWarehouseId === w.id ? '#1565C0' : '#1A2440', fontWeight: selectedWarehouseId === w.id ? 600 : 400 }}>
                  {w.name} — {w.location}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notification bell */}
      <button style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E8ECF2', background: '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        <Bell size={16} color="#6B7A94" />
        <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#FF6B00', borderRadius: '50%', border: '1.5px solid #F4F6FA' }} />
      </button>

      {/* User menu */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => { setShowUser(d => !d); setShowWh(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F6FA', border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 12px', height: 36, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#1A2440' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={12} color="#fff" />
          </div>
          <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? user?.email?.split('@')[0] ?? 'User'}
          </span>
          <ChevronDown size={13} color="#6B7A94" />
        </button>
        {showUser && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowUser(false)} />
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #E8ECF2', borderRadius: 10, boxShadow: '0 4px 16px rgba(11,29,58,0.10)', zIndex: 40, minWidth: 200, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #E8ECF2' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A2440' }}>{user?.name}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#6B7A94' }}>{user?.email}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, background: '#E3F0FF', color: '#1565C0', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{user?.role}</span>
                </div>
              </div>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#C62828' }}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
