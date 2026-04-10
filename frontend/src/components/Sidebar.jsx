import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  HardHat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const role = user?.role   // 'admin' | 'supervisor' | 'tally_user' | 'viewer'

  const NAV_ITEMS = [
    { to: '/',           label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/jobs',       label: 'Job Cards',  icon: ClipboardList   },
    { to: '/planning',   label: 'Planning',   icon: CalendarDays    },
    { to: '/workforce',  label: 'Workforce',  icon: Users,           roles: ['admin','supervisor'] },
    { to: '/reports',    label: 'Reports',    icon: BarChart3       },
    { to: '/supervisor', label: 'Floor View', icon: HardHat,         roles: ['supervisor'] },
  ].filter(item => !item.roles || item.roles.includes(role))

  function isActive(to) {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const linkStyle = (to) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    margin: '0 8px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.55)',
    background: isActive(to) ? 'rgba(69,201,195,0.18)' : 'transparent',
    borderLeft: isActive(to) ? '3px solid #FF7D44' : '3px solid transparent',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    fontWeight: isActive(to) ? 600 : 400,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  })

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      height: '100svh',
      position: 'sticky',
      top: 0,
      background: '#1C3F39',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.2s ease',
      zIndex: 10,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 14px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        gap: 10,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: '#FF7D44',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          fontFamily: 'Roboto, sans-serif',
          flexShrink: 0,
        }}>N</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap' }}>
              NLC Logistics
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap' }}>
              Job Card System
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={linkStyle(to)}
            onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — Settings + collapse */}
      <div style={{ padding: '8px 0 12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {role === 'admin' && (
          <NavLink
            to="/settings"
            style={linkStyle('/settings')}
            onMouseEnter={e => { if (!isActive('/settings')) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if (!isActive('/settings')) e.currentTarget.style.background = 'transparent' }}
          >
            <Settings size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            margin: '4px 8px 0',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            width: 'calc(100% - 16px)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
