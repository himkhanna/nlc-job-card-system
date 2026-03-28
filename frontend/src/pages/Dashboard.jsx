import { ClipboardList, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import KPICard from '../components/KPICard'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import WarehouseBadge from '../components/WarehouseBadge'
import { useNavigate } from 'react-router-dom'

// Demo data — will come from GET /api/jobs & /api/workers once backend is live
const KPI_DATA = [
  { label: 'Active Jobs',        value: 4, icon: ClipboardList, color: '#1565C0', subtext: '3 in progress, 1 planned'      },
  { label: 'Workers Clocked In', value: 5, icon: Users,         color: '#2E7D32', subtext: 'Across 2 warehouses'           },
  { label: 'Completed Today',    value: 1, icon: CheckCircle,   color: '#2E7D32', subtext: 'JC-2025-0838 · Spinneys'       },
  { label: 'Pending GRNs',       value: 2, icon: AlertCircle,   color: '#FF6B00', subtext: 'Awaiting Putaway completion'   },
]

const STATUS_CHART = [
  { name: 'Planned',     value: 1, color: '#1565C0' },
  { name: 'In Progress', value: 3, color: '#2E7D32' },
  { name: 'Completed',   value: 1, color: '#1B5E20' },
  { name: 'Reactivated', value: 1, color: '#F57F17' },
]

const PHASE_CHART = [
  { phase: 'Offloading',  jobs: 2 },
  { phase: 'Tally',       jobs: 1 },
  { phase: 'Putaway',     jobs: 1 },
  { phase: 'PDA Picking', jobs: 1 },
  { phase: 'Loading',     jobs: 0 },
]

const RECENT_JOBS = [
  { id: 'jc841', jobNumber: 'JC-2025-0841', customer: 'Al Futtaim', warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'IN_PROGRESS', phase: 'Tally',       progress: 62,  priority: 'HIGH'   },
  { id: 'jc840', jobNumber: 'JC-2025-0840', customer: 'ENOC',       warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'PLANNED',     phase: 'Offloading',  progress: 0,   priority: 'NORMAL' },
  { id: 'jc839', jobNumber: 'JC-2025-0839', customer: 'Carrefour',  warehouse: 'DXB-WH2', type: 'OUTBOUND', status: 'IN_PROGRESS', phase: 'PDA Picking', progress: 45,  priority: 'HIGH'   },
  { id: 'jc838', jobNumber: 'JC-2025-0838', customer: 'Spinneys',   warehouse: 'DXB-WH2', type: 'OUTBOUND', status: 'COMPLETED',   phase: 'Complete',    progress: 100, priority: 'NORMAL' },
  { id: 'jc837', jobNumber: 'JC-2025-0837', customer: 'Lulu Group', warehouse: 'DXB-WH3', type: 'INBOUND',  status: 'REACTIVATED', phase: 'Putaway',     progress: 78,  priority: 'URGENT' },
  { id: 'jc836', jobNumber: 'JC-2025-0836', customer: 'IKEA UAE',   warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'IN_PROGRESS', phase: 'Offloading',  progress: 15,  priority: 'NORMAL' },
]

const STATUS_LABELS = {
  IN_PROGRESS: 'In Progress', PLANNED: 'Planned',
  COMPLETED: 'Completed',     REACTIVATED: 'Reactivated',
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'DM Sans, sans-serif' }}>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {KPI_DATA.map(k => (
          <KPICard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color} subtext={k.subtext} />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Status pie */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: '20px 24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Job Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={STATUS_CHART} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                {STATUS_CHART.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
            <BarChart data={PHASE_CHART} barSize={28}>
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
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A94' }}>All warehouses · Today</p>
          </div>
          <button onClick={() => navigate('/jobs')}
            style={{ fontSize: 13, color: '#1565C0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            View all →
          </button>
        </div>

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
              {RECENT_JOBS.map(job => (
                <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{ borderTop: '1px solid #F4F6FA', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8F9FC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#1565C0', fontWeight: 600 }}>{job.jobNumber}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#1A2440' }}>{job.customer}</td>
                  <td style={{ padding: '11px 16px' }}><WarehouseBadge name={job.warehouse} /></td>
                  <td style={{ padding: '11px 16px' }}><Badge variant={job.type} label={job.type} size="sm" /></td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7A94' }}>{job.phase}</td>
                  <td style={{ padding: '11px 16px', minWidth: 120 }}><ProgressBar percent={job.progress} showLabel /></td>
                  <td style={{ padding: '11px 16px' }}><Badge variant={job.status} label={STATUS_LABELS[job.status]} size="sm" /></td>
                  <td style={{ padding: '11px 16px' }}><Badge variant={job.priority} label={job.priority} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
