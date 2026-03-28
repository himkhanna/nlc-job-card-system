import { useState } from 'react'
import { Clock, UserCheck, UserX, CheckCircle, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import DemoModeBanner from '../components/DemoModeBanner'

// ── Demo data ─────────────────────────────────────────────────────────────────
const ACTIVE_JOBS = [
  {
    id: 'jc841',
    jobNumber: 'JC-2025-0841',
    customerName: 'Al Futtaim',
    jobType: 'INBOUND',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    currentPhase: 'Tally',
    progressPercent: 62,
    warehouse: 'DXB-WH1',
    clockedIn: [
      { id: 'e1', name: 'Rajan Pillai',  employeeId: 'EMP-001', phase: 'Tally', since: '07:30' },
      { id: 'e2', name: 'Sabu Thomas',   employeeId: 'EMP-002', phase: 'Tally', since: '07:35' },
      { id: 'e3', name: 'Ramesh Kumar',  employeeId: 'EMP-003', phase: 'Tally', since: '07:30' },
    ],
  },
  {
    id: 'jc839',
    jobNumber: 'JC-2025-0839',
    customerName: 'Carrefour',
    jobType: 'OUTBOUND',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    currentPhase: 'PDA Picking',
    progressPercent: 45,
    warehouse: 'DXB-WH2',
    clockedIn: [
      { id: 'e5', name: 'Arjun Nair', employeeId: 'EMP-005', phase: 'PDA Picking', since: '08:15' },
    ],
  },
  {
    id: 'jc836',
    jobNumber: 'JC-2025-0836',
    customerName: 'IKEA UAE',
    jobType: 'INBOUND',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    currentPhase: 'Offloading',
    progressPercent: 15,
    warehouse: 'DXB-WH1',
    clockedIn: [],
  },
]

const AVAILABLE_WORKERS = [
  { id: 'emp4', name: 'Jose Fernandez', employeeId: 'EMP-004', skills: ['Supervision'], warehouse: 'DXB-WH1' },
  { id: 'emp6', name: 'Priya Menon',    employeeId: 'EMP-006', skills: ['Tally'],       warehouse: 'DXB-WH2' },
  { id: 'wrk1', name: 'Worker-1',       employeeId: 'WRK-001', skills: ['Loading'],     warehouse: 'DXB-WH1' },
]

function timeSince(sinceStr) {
  const [h, m] = sinceStr.split(':').map(Number)
  const now = new Date('2026-03-28T11:00:00')
  const then = new Date('2026-03-28')
  then.setHours(h, m, 0)
  const mins = Math.round((now - then) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function SupervisorFloor() {
  const [jobs, setJobs]           = useState(ACTIVE_JOBS)
  const [refreshing, setRefresh]  = useState(false)
  const [clockOutId, setClockOutId] = useState(null) // worker id being clocked out

  async function handleRefresh() {
    setRefresh(true)
    await new Promise(r => setTimeout(r, 800))
    setRefresh(false)
    toast.success('Data refreshed')
  }

  function handleClockOut(jobId, workerId) {
    setJobs(prev => prev.map(j => j.id === jobId
      ? { ...j, clockedIn: j.clockedIn.filter(w => w.id !== workerId) }
      : j))
    toast.success('Worker clocked out')
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <DemoModeBanner />

      {/* Header strip */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1A2440]">Floor View</h2>
          <p className="text-sm text-[#6B7A94]">Live active jobs — DXB-WH1, DXB-WH2</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0B1D3A] rounded-lg disabled:opacity-60">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Active jobs */}
      <div className="space-y-3">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} onClockOut={handleClockOut} />
        ))}
      </div>

      {/* Available workers strip */}
      <div className="bg-white rounded-xl border border-[#E8ECF2] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E8ECF2] flex items-center justify-between">
          <h3 className="font-semibold text-[#1A2440] text-sm">Available Workers</h3>
          <span className="text-xs text-[#6B7A94]">{AVAILABLE_WORKERS.length} idle</span>
        </div>
        <div className="divide-y divide-[#E8ECF2]">
          {AVAILABLE_WORKERS.map(w => (
            <div key={w.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-[#1A2440]">{w.name}</div>
                <div className="font-mono text-xs text-[#6B7A94]">{w.employeeId} · {w.warehouse}</div>
              </div>
              <div className="flex items-center gap-1.5">
                {w.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-[#E3F0FF] text-[#1565C0] font-medium">{s}</span>
                ))}
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] ml-2" title="Available" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, onClockOut }) {
  const [expanded, setExpanded] = useState(true)

  const priorityColor = {
    URGENT: '#C62828',
    HIGH:   '#FF6B00',
    NORMAL: '#6B7A94',
  }[job.priority] ?? '#6B7A94'

  return (
    <div className="bg-white rounded-xl border border-[#E8ECF2] overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: priorityColor }}>
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F4F6FA]/50 transition-colors">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-mono font-bold text-sm text-[#1A2440]">{job.jobNumber}</div>
            <div className="text-xs text-[#6B7A94]">{job.customerName} · {job.warehouse}</div>
          </div>
          <Badge variant={job.jobType} size="sm" />
          <Badge variant={job.priority} size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#1A2440]">{job.currentPhase}</div>
            <div className="text-xs text-[#6B7A94]">{job.progressPercent}%</div>
          </div>
          <ChevronRight size={16} className={`text-[#6B7A94] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-1">
        <ProgressBar percent={job.progressPercent} height={4} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Clocked-in workers */}
          {job.clockedIn.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#6B7A94] uppercase tracking-wide mt-3">
                Clocked In ({job.clockedIn.length})
              </div>
              {job.clockedIn.map(worker => (
                <div key={worker.id} className="flex items-center justify-between bg-[#E8F5E9] rounded-lg px-3 py-2">
                  <div>
                    <div className="font-medium text-sm text-[#1A2440]">{worker.name}</div>
                    <div className="font-mono text-xs text-[#2E7D32] flex items-center gap-1">
                      <Clock size={10} />
                      Since {worker.since} · {timeSince(worker.since)} elapsed
                    </div>
                  </div>
                  <button onClick={() => onClockOut(job.id, worker.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C62828] border border-[#C62828] rounded-lg hover:bg-red-50 transition-colors">
                    <UserX size={12} />
                    Clock Out
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#6B7A94] mt-3 bg-[#F4F6FA] rounded-lg px-3 py-2">
              <AlertCircle size={14} className="text-[#F57F17]" />
              No workers currently clocked in for this job
            </div>
          )}

          {/* Phase action */}
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#2E7D32] rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => toast('Phase completion requires desktop view — open the full job card.', { icon: '💻' })}>
              <CheckCircle size={14} />
              Mark {job.currentPhase} Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
