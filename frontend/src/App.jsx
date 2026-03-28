import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Pages (stubs — filled in as we build)
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import JobCards from './pages/JobCards'
import JobCardDetail from './pages/JobCardDetail'
import PlanningCalendar from './pages/PlanningCalendar'
import Workforce from './pages/Workforce'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SupervisorFloor from './pages/SupervisorFloor'

// Layout
import Layout from './components/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobCards />} />
            <Route path="/jobs/:id" element={<JobCardDetail />} />
            <Route path="/planning" element={<PlanningCalendar />} />
            <Route path="/workforce" element={<Workforce />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/supervisor" element={<SupervisorFloor />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
