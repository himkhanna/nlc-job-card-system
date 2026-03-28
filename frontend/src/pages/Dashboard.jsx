import { ClipboardList, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import KPICard from '../components/KPICard'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import WarehouseBadge from '../components/WarehouseBadge'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useJobs } from '../hooks/useApi'
import { useWarehouse } from '../context/WarehouseContext'

// Demo fallback data (shown when API is unavailable)
const DEMO_JOBS = [
  { id: 'jc841', jobNumber: 'JC-2025-0841', customerName: 'Al Futtaim', warehouse: 'DXB-WH1', jobType: 'INBOUND',  status: 'IN_PROGRESS', currentPhase: 'Tally',       progressPercent: 62,  priority: 'HIGH'   },
  { id: 'jc840', jobNumber: 'JC-2025-0840', customerName: 'ENOC',       warehouse: 'DXB-WH1', jobType: 'INBOUND',  status: 'PLANNED',     currentPhase: 'Offloading',  progressPercent: 0,   priority: 'NORMAL' },
  { id: 'jc839', jobNumber: 'JC-2025-0839', customerName: 'Carrefour',  warehouse: 'DXB-WH2', jobType: 'OUTBOUND', status: 'IN_PROGRESS', currentPhase: 'PDA Picking', progressPercent: 45,  priority: 'HIGH'   },
  { id: 'jc838', jobNumber: 'JC-2025-0838', customerName: 'Spinneys',   warehouse: 'DXB-WH2', jobType: 'OUTBOUND', status: 'COMPLETED',   currentPhase: 'Complete',    progressPercent: 100, priority: 'NORMAL' },
  { id: 'jc837', jobNumber: 'JC-2025-0837', customerName: 'Lulu Group', warehouse: 'DXB-WH3', jobType: 'INBOUND',  status: 'REACTIVATED', currentPhase: 'Putaway',     progressPercent: 78,  priority: 'URGENT' },
  { id: 'jc836', jobNumber: 'JC-2025-0836', customerName: 'IKEA UAE',   warehouse: 'DXB-WH1', jobType: 'INBOUND',  status: 'IN_PROGRESS', currentPhase: 'Offloading',  progressPercent: 15,  priority: 'NORMAL' },
]

const STATUS_LABELS = {
  IN_PROGRESS: 'In Progress', PLANNED: 'Planned',
  COMPLETED: 'Completed',     REACTIVATED: 'Reactivated',
}
const STATUS_COLORS = {
  PLANNED:     '#1565C0',
  IN_PROGRESS: '#2E7D32',
  COMPLETED:   '#1B5E20',
  REACTIVATED: '#F57F17',
}

function buildKpiFromJobs(jobList) {
  const active    = jobList.filter(j => ['IN_PROGRESS', 'PLANNED', 'REACTIVATED'].includes(j.status))
  const completed = jobList.filter(j => j.status === 'COMPLETED')
  const inProgress = jobList.filter(j => j.status === 'IN_PROGRESS')
  return [
    { label: 'Active Jobs',        value: active.length,    icon: ClipboardList, color: '#1565C0', subtext: `${inProgress.length} in progress` },
    { label: 'Workers Clocked In', value: 5,                icon: Users,         color: '#2E7D32', subtext: 'Across active warehouses' },
    { label: 'Completed Today',    value: completed.length, icon: CheckCircle,   color: '#2E7D32', subtext: completed[0]?.customerName ?? '—' },
    { label: 'Pending GRNs',       value: inProgress.filter(j => j.jobType === 'INBOUND').length, icon: AlertCircle, color: '#FF6B00', subtext: 'Awaiting Putaway' },
  ]
}

function buildStatusChart(jobList) {
  const counts = {}
  jobList.forEach(j => { counts[j.status] = (counts[j.status] ?? 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({
    name: STATUS_LABELS[name] ?? name,
    value,
    color: STATUS_COLORS[name] ?? '#6B7A94',
  }))
}

function buildPhaseChart(jobList) {
  const active = jobList.filter(j => j.status === 'IN_PROGRESS' || j.status === 'REACTIVATED')
  const counts = {}
  active.forEach(j => { counts[j.currentPhase] = (counts[j.currentPhase] ?? 0) + 1 })
  return Object.entries(counts).map(([phase, jobs]) => ({ phase, jobs }))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { selectedWarehouse } = useWarehouse()

  const { data: apiJobs, isLoading, isError } = useJobs(
    selectedWarehouse ? { warehouseId: selectedWarehouse } : {}
  )

  // Use API data when available, otherwise fall back to demo data
  const jobList  = isError || !apiJobs ? DEMO_JOBS : (apiJobs.items ?? apiJobs ?? [])
  const kpiData  = buildKpiFromJobs(jobList)
  const statusChart = buildStatusChart(jobList)
  const phaseChart  = buildPhaseChart(jobList)
  const recentJobs  = [...jobList].slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'DM Sans, sans-serif' }}>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} height={100} />)
          : kpiData.map(k => (
              <KPICard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color} subtext={k.subtext} />
            ))
        }
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Status pie */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: '20px 24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Job Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                {statusChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v + ' jobs', n]} />
              <Legend iconType="circle" iconSize={9}
                formatter={v => <span style={{ fontSize: 12, color: '#1A2440' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Phase bar */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: '20px 24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Jobs by Current Phase</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={phaseChart} barSize={28}>
              <XAxis dataKey="phase" tick={{ fontSize: 11, fill: '#6B7A94' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7A94' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#F4F6FA' }} formatter={v => [v + ' jobs', 'Active']} />
              <Bar dataKey="jobs" fill="#1565C0" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Jobs */}
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8ECF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Recent Job Cards</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A94' }}>
              {isError ? 'Demo data — API unavailable' : 'Live data from backend'}
            </p>
          </div>
          <button onClick={() => navigate('/jobs')}
            style={{ fontSize: 13, color: '#1565C0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            View all →
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: 20 }}><LoadingSkeleton height={200} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#F8F9FC' }}>
                  {['Job #', 'Customer', 'Warehouse', 'Type', 'Phase', 'Progress', 'Status', 'Priority'].map(h => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A94', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => (
                  <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                    style={{ borderTop: '1px solid #F4F6FA', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F9FC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#1565C0', fontWeight: 600 }}>{job.jobNumber}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#1A2440' }}>{job.customerName}</td>
                    <td style={{ padding: '11px 16px' }}><WarehouseBadge name={job.warehouse ?? job.warehouseName} /></td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={job.jobType} size="sm" /></td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7A94' }}>{job.currentPhase}</td>
                    <td style={{ padding: '11px 16px', minWidth: 120 }}><ProgressBar percent={job.progressPercent} showLabel /></td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={job.status} label={STATUS_LABELS[job.status]} size="sm" /></td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={job.priority} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
