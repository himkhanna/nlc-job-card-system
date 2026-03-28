import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import { WarehouseProvider } from './context/WarehouseContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import JobCards from './pages/JobCards'
import JobCardDetail from './pages/JobCardDetail'
import PlanningCalendar from './pages/PlanningCalendar'
import Workforce from './pages/Workforce'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SupervisorFloor from './pages/SupervisorFloor'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WarehouseProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Auth guard — renders Outlet (which Layout uses) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jobs" element={<JobCards />} />
                  <Route path="/jobs/:id" element={<JobCardDetail />} />
                  <Route path="/planning" element={<PlanningCalendar />} />
                  <Route path="/reports" element={<Reports />} />

                  {/* Role-guarded routes */}
                  <Route element={<ProtectedRoute roles={['admin', 'supervisor']} />}>
                    <Route path="/workforce" element={<Workforce />} />
                    <Route path="/supervisor" element={<SupervisorFloor />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WarehouseProvider>
        </AuthProvider>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  )
}
