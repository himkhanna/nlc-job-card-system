import { NavLink, useLocation } from 'react-router-dom'
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

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/jobs',       label: 'Job Cards',     icon: ClipboardList   },
  { to: '/planning',   label: 'Planning',      icon: CalendarDays    },
  { to: '/workforce',  label: 'Workforce',     icon: Users           },
  { to: '/reports',    label: 'Reports',       icon: BarChart3       },
  { to: '/supervisor', label: 'Floor View',    icon: HardHat         },
]

const BOTTOM_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100svh',
        background: '#0B1D3A',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 14px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        gap: 10,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: '#FF6B00',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0,
        }}>N</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              NLC Logistics
            </div>
            <div style={{ color: '#6B7A94', fontSize: 11, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              Job Card System
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 20px' : '10px 20px',
                margin: '0 8px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(21,101,192,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #FF6B00' : '3px solid transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                margin: '0 8px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(21,101,192,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #FF6B00' : '3px solid transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )
        })}

        {/* Collapse toggle */}
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
            fontFamily: 'DM Sans, sans-serif',
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
