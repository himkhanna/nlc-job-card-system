import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageHeader from './PageHeader'
import DemoModeBanner from './DemoModeBanner'

const PAGE_TITLES = {
  '/':           { title: 'Dashboard',       subtitle: 'Operations overview' },
  '/jobs':       { title: 'Job Cards',        subtitle: 'All warehouse job cards' },
  '/planning':   { title: 'Planning',         subtitle: 'Shipment & slot planning' },
  '/workforce':  { title: 'Workforce',        subtitle: 'Workers & clock events' },
  '/reports':    { title: 'Reports',          subtitle: 'Analytics & exports' },
  '/supervisor': { title: 'Floor View',       subtitle: 'Supervisor mobile view' },
  '/settings':   { title: 'Settings',         subtitle: 'System configuration' },
}

export default function Layout() {
  const location = useLocation()

  // Match dynamic routes like /jobs/:id
  let meta = PAGE_TITLES[location.pathname]
  if (!meta && location.pathname.startsWith('/jobs/')) {
    meta = { title: 'Job Card Detail', subtitle: 'Phase tracking & workforce' }
  }
  meta = meta || { title: 'NLC Job Card System', subtitle: '' }

  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: '#F4F6FA' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <DemoModeBanner />
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
