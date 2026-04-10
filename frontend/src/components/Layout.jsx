import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageHeader from './PageHeader'
import BottomNav from './BottomNav'

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

  let meta = PAGE_TITLES[location.pathname]
  if (!meta && location.pathname.startsWith('/jobs/')) {
    meta = { title: 'Job Card Detail', subtitle: 'Phase tracking & workforce' }
  }
  meta = meta || { title: 'NLC Job Card System', subtitle: '' }

  return (
    <div className="flex min-h-svh bg-[#F2F8FA]">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        {/* pb-16 on mobile to clear the bottom nav bar */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — shown on mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
