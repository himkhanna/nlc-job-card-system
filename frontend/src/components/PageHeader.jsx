import { Search, Bell, ChevronDown, Building2, LogOut, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWarehouse } from '../context/WarehouseContext'

export default function PageHeader({ title, subtitle }) {
  const { user, logout }                                         = useAuth()
  const { warehouses, selectedWarehouseId, selectWarehouse }    = useWarehouse()
  const navigate                                                 = useNavigate()
  const [showWh, setShowWh]      = useState(false)
  const [showUser, setShowUser]  = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch]      = useState('')

  const selectedWh = warehouses.find(w => w.id === selectedWarehouseId)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header style={{
      height: 56,
      background: '#fff',
      borderBottom: '1px solid #DDE8EC',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 20,
      flexShrink: 0,
    }}>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#01323F', fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="hidden md:block" style={{ margin: 0, fontSize: 11, color: '#505D7B', fontFamily: 'Roboto, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Desktop: Search bar */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8, background: '#F2F8FA', border: '1px solid #DDE8EC', borderRadius: 8, padding: '0 12px', height: 36, width: 220 }}>
        <Search size={14} color="#505D7B" style={{ flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs, workers..."
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#01323F', fontFamily: 'Roboto, sans-serif', width: '100%' }} />
      </div>

      {/* Mobile: Search icon */}
      <button className="md:hidden" onClick={() => setShowSearch(s => !s)}
        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #DDE8EC', background: '#F2F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <Search size={16} color="#505D7B" />
      </button>

      {/* Desktop: Warehouse filter */}
      <div className="hidden md:block" style={{ position: 'relative' }}>
        <button onClick={() => { setShowWh(d => !d); setShowUser(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F2F8FA', border: '1px solid #DDE8EC', borderRadius: 8, padding: '0 12px', height: 36, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#01323F', whiteSpace: 'nowrap' }}>
          <Building2 size={14} color="#505D7B" />
          <span>{selectedWh ? selectedWh.name : 'All Warehouses'}</span>
          <ChevronDown size={13} color="#505D7B" />
        </button>
        {showWh && <WhDropdown warehouses={warehouses} selectedId={selectedWarehouseId} onSelect={id => { selectWarehouse(id); setShowWh(false) }} />}
      </div>

      {/* Mobile: Warehouse pill (compact) */}
      <div className="md:hidden" style={{ position: 'relative' }}>
        <button onClick={() => { setShowWh(d => !d); setShowUser(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E0F7FA', border: '1px solid #B2EBF2', borderRadius: 20, padding: '0 10px', height: 30, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#07847F', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <Building2 size={12} />
          <span>{selectedWh ? selectedWh.name : 'All'}</span>
        </button>
        {showWh && <WhDropdown warehouses={warehouses} selectedId={selectedWarehouseId} onSelect={id => { selectWarehouse(id); setShowWh(false) }} />}
      </div>

      {/* Notification bell — desktop only */}
      <button className="hidden md:flex" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #DDE8EC', background: '#F2F8FA', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        <Bell size={16} color="#505D7B" />
        <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#FF7D44', borderRadius: '50%', border: '1.5px solid #F2F8FA' }} />
      </button>

      {/* User avatar (both) */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => { setShowUser(d => !d); setShowWh(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F2F8FA', border: '1px solid #DDE8EC', borderRadius: 8, padding: '0 10px', height: 36, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#01323F' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1C3F39', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={13} color="#fff" />
          </div>
          <span className="hidden md:inline" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? user?.email?.split('@')[0] ?? 'User'}
          </span>
          <ChevronDown size={13} color="#505D7B" className="hidden md:inline" />
        </button>
        {showUser && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowUser(false)} />
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #DDE8EC', borderRadius: 10, boxShadow: '0 4px 16px rgba(11,29,58,0.10)', zIndex: 40, minWidth: 200, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #DDE8EC' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#01323F' }}>{user?.name}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#505D7B' }}>{user?.email}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, background: '#E3F0FF', color: '#07847F', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{user?.role}</span>
                </div>
              </div>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C62828' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile: search expand bar */}
      {showSearch && (
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, background: '#fff', padding: '8px 16px', borderBottom: '1px solid #DDE8EC', zIndex: 25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F2F8FA', border: '1px solid #DDE8EC', borderRadius: 8, padding: '0 12px', height: 38 }}>
            <Search size={14} color="#505D7B" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, workers..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#01323F', fontFamily: 'Roboto, sans-serif', width: '100%' }} />
          </div>
        </div>
      )}
    </header>
  )
}

function WhDropdown({ warehouses, selectedId, onSelect }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => onSelect(selectedId)} />
      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #DDE8EC', borderRadius: 10, boxShadow: '0 4px 16px rgba(11,29,58,0.10)', zIndex: 40, minWidth: 220, overflow: 'hidden' }}>
        <button onClick={() => onSelect(null)}
          style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: !selectedId ? '#F2F8FA' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: !selectedId ? '#07847F' : '#01323F', fontWeight: !selectedId ? 600 : 400 }}>
          All Warehouses
        </button>
        {warehouses.map(w => (
          <button key={w.id} onClick={() => onSelect(w.id)}
            style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: selectedId === w.id ? '#F2F8FA' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: selectedId === w.id ? '#07847F' : '#01323F', fontWeight: selectedId === w.id ? 600 : 400 }}>
            {w.name}
          </button>
        ))}
      </div>
    </>
  )
}
