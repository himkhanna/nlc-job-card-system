import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, HardHat, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()
  const role = user?.role

  const items = [
    { to: '/',           label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs',       label: 'Jobs',       icon: ClipboardList   },
    { to: '/workforce',  label: 'Workforce',  icon: Users,           roles: ['admin','supervisor'] },
    { to: '/supervisor', label: 'Floor',      icon: HardHat,         roles: ['supervisor'] },
    { to: '/reports',    label: 'Reports',    icon: BarChart3       },
  ].filter(item => !item.roles || item.roles.includes(role))

  function isActive(to) {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: '#1C3F39',
      display: 'flex',
      alignItems: 'stretch',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(({ to, label, icon: Icon }) => {
        const active = isActive(to)
        return (
          <NavLink key={to} to={to} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            textDecoration: 'none',
            color: active ? '#FF7D44' : 'rgba(255,255,255,0.45)',
            fontSize: 10,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: active ? 700 : 400,
            borderTop: active ? '2px solid #FF7D44' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
