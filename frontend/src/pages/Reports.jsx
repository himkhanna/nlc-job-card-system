import { useState } from 'react'
import { Download, FileText, BarChart2, Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import Badge from '../components/Badge'

// ── Demo data ─────────────────────────────────────────────────────────────────
const JOBS_BY_WAREHOUSE = [
  { warehouse: 'DXB-WH1', inbound: 12, outbound: 5,  total: 17 },
  { warehouse: 'DXB-WH2', inbound: 8,  outbound: 11, total: 19 },
  { warehouse: 'DXB-WH3', inbound: 4,  outbound: 3,  total: 7  },
  { warehouse: 'SHJ-WH1', inbound: 6,  outbound: 7,  total: 13 },
  { warehouse: 'ABU-WH1', inbound: 3,  outbound: 2,  total: 5  },
]

const JOBS_BY_STATUS = [
  { name: 'Completed',   value: 38, color: '#2E7D32' },
  { name: 'In Progress', value: 15, color: '#FF7D44' },
  { name: 'Planned',     value: 6,  color: '#07847F' },
  { name: 'Reactivated', value: 2,  color: '#F57F17' },
]

const WEEKLY_THROUGHPUT = [
  { week: 'W10', jobs: 8,  workers: 24, hours: 185 },
  { week: 'W11', jobs: 11, workers: 28, hours: 240 },
  { week: 'W12', jobs: 9,  workers: 22, hours: 198 },
  { week: 'W13', jobs: 13, workers: 31, hours: 286 },
]

const RECENT_JOB_REPORT = [
  { jobNumber: 'JC-2025-0841', customer: 'Al Futtaim',  type: 'INBOUND',  status: 'IN_PROGRESS', warehouse: 'DXB-WH1', workerHours: 18, laborCost: 'AED 900',  completedAt: '—' },
  { jobNumber: 'JC-2025-0840', customer: 'ENOC',         type: 'INBOUND',  status: 'PLANNED',     warehouse: 'DXB-WH1', workerHours: 0,  laborCost: 'AED 0',    completedAt: '—' },
  { jobNumber: 'JC-2025-0839', customer: 'Carrefour',    type: 'OUTBOUND', status: 'IN_PROGRESS', warehouse: 'DXB-WH2', workerHours: 12, laborCost: 'AED 600',  completedAt: '—' },
  { jobNumber: 'JC-2025-0838', customer: 'Spinneys',     type: 'OUTBOUND', status: 'COMPLETED',   warehouse: 'DXB-WH2', workerHours: 32, laborCost: 'AED 1,600', completedAt: '2026-03-21' },
  { jobNumber: 'JC-2025-0837', customer: 'Lulu Group',   type: 'INBOUND',  status: 'REACTIVATED', warehouse: 'DXB-WH3', workerHours: 25, laborCost: 'AED 1,250', completedAt: '—' },
  { jobNumber: 'JC-2025-0836', customer: 'IKEA UAE',     type: 'INBOUND',  status: 'IN_PROGRESS', warehouse: 'DXB-WH1', workerHours: 7,  laborCost: 'AED 350',  completedAt: '—' },
]

const TABS = ['Overview', 'Job Report', 'Labour Report']

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [dateFrom, setDateFrom]   = useState('2026-03-01')
  const [dateTo, setDateTo]       = useState('2026-03-28')
  const [exporting, setExporting] = useState(false)

  async function handleExportCsv() {
    setExporting(true)
    await new Promise(r => setTimeout(r, 800))
    setExporting(false)
    toast.success('CSV exported (demo — file not created)')
  }
  async function handleExportPdf() {
    setExporting(true)
    await new Promise(r => setTimeout(r, 1000))
    setExporting(false)
    toast.success('PDF exported (demo — file not created)')
  }

  return (
    <div className="space-y-5">

      {/* Date range + export */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white rounded-xl border border-[#DDE8EC] p-4">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-[#505D7B]" />
          <span className="text-sm font-medium text-[#505D7B]">Date Range:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]" />
          <span className="text-[#505D7B]">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCsv} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#07847F] border border-[#07847F] rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleExportPdf} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1C3F39] rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60">
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F2F8FA] rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-white text-[#01323F] shadow-sm' : 'text-[#505D7B] hover:text-[#01323F]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'Overview' && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Jobs (MTD)', value: '61',     color: '#07847F', icon: BarChart2 },
              { label: 'Completed',        value: '38',     color: '#2E7D32', icon: TrendingUp },
              { label: 'GRNs Generated',   value: '29',     color: '#FF7D44', icon: FileText },
              { label: 'Total Labour Hrs', value: '1,842',  color: '#1C3F39', icon: Calendar },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-[#DDE8EC] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#505D7B] uppercase tracking-wide">{kpi.label}</span>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Jobs by warehouse */}
            <div className="bg-white rounded-xl border border-[#DDE8EC] p-5">
              <h3 className="font-semibold text-[#01323F] mb-4">Jobs by Warehouse</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={JOBS_BY_WAREHOUSE} barSize={18} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDE8EC" />
                  <XAxis dataKey="warehouse" tick={{ fontSize: 11, fill: '#505D7B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#505D7B' }} />
                  <Tooltip contentStyle={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }} />
                  <Bar dataKey="inbound"  name="Inbound"  fill="#45C9C3" radius={[3,3,0,0]} />
                  <Bar dataKey="outbound" name="Outbound" fill="#07847F" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-xl border border-[#DDE8EC] p-5">
              <h3 className="font-semibold text-[#01323F] mb-4">Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={JOBS_BY_STATUS} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {JOBS_BY_STATUS.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly throughput */}
          <div className="bg-white rounded-xl border border-[#DDE8EC] p-5">
            <h3 className="font-semibold text-[#01323F] mb-4">Weekly Throughput</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={WEEKLY_THROUGHPUT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDE8EC" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#505D7B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#505D7B' }} />
                <Tooltip contentStyle={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }} />
                <Line type="monotone" dataKey="jobs"    name="Jobs"          stroke="#FF7D44" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="workers" name="Workers Deployed" stroke="#07847F" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Job Report tab */}
      {activeTab === 'Job Report' && (
        <div className="bg-white rounded-xl border border-[#DDE8EC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F2F8FA] text-xs font-semibold text-[#505D7B] uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Job #</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Warehouse</th>
                  <th className="px-5 py-3 text-right">Worker Hrs</th>
                  <th className="px-5 py-3 text-right">Labour Cost</th>
                  <th className="px-5 py-3 text-left">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8EC]">
                {RECENT_JOB_REPORT.map(r => (
                  <tr key={r.jobNumber} className="hover:bg-[#F2F8FA]/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-[#01323F]">{r.jobNumber}</td>
                    <td className="px-5 py-3 font-medium text-[#01323F]">{r.customer}</td>
                    <td className="px-5 py-3"><Badge variant={r.type} /></td>
                    <td className="px-5 py-3"><Badge variant={r.status} /></td>
                    <td className="px-5 py-3 text-[#505D7B]">{r.warehouse}</td>
                    <td className="px-5 py-3 text-right font-mono text-[#01323F]">{r.workerHours}h</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-[#01323F]">{r.laborCost}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#505D7B]">{r.completedAt}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F2F8FA] font-semibold">
                  <td colSpan={5} className="px-5 py-3 text-[#01323F]">Totals</td>
                  <td className="px-5 py-3 text-right font-mono text-[#01323F]">94h</td>
                  <td className="px-5 py-3 text-right font-mono text-[#FF7D44]">AED 4,700</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Labour Report tab */}
      {activeTab === 'Labour Report' && (
        <div className="bg-white rounded-xl border border-[#DDE8EC] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DDE8EC]">
            <p className="text-sm text-[#505D7B]">Labour rate: <span className="font-mono font-semibold text-[#01323F]">AED 50 / hr</span> (configure in Settings)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F2F8FA] text-xs font-semibold text-[#505D7B] uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Worker</th>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-right">Jobs Worked</th>
                  <th className="px-5 py-3 text-right">Total Hours</th>
                  <th className="px-5 py-3 text-right">Labour Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8EC]">
                {[
                  { name: 'Rajan Pillai',       id: 'EMP-001', type: 'PERMANENT', jobs: 4, hours: 28, cost: 'AED 1,400' },
                  { name: 'Sabu Thomas',        id: 'EMP-002', type: 'PERMANENT', jobs: 4, hours: 32, cost: 'AED 1,600' },
                  { name: 'Ramesh Kumar',       id: 'EMP-003', type: 'PERMANENT', jobs: 3, hours: 18, cost: 'AED 900'   },
                  { name: 'Arjun Nair',         id: 'EMP-005', type: 'CONTRACT',  jobs: 2, hours: 12, cost: 'AED 600'   },
                  { name: 'Priya Menon',        id: 'EMP-006', type: 'PERMANENT', jobs: 1, hours: 4,  cost: 'AED 200'   },
                ].map(r => (
                  <tr key={r.id} className="hover:bg-[#F2F8FA]/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#01323F]">{r.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#505D7B]">{r.id}</td>
                    <td className="px-5 py-3"><Badge variant={r.type} /></td>
                    <td className="px-5 py-3 text-right font-mono text-[#01323F]">{r.jobs}</td>
                    <td className="px-5 py-3 text-right font-mono text-[#01323F]">{r.hours}h</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-[#01323F]">{r.cost}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F2F8FA] font-semibold">
                  <td colSpan={3} className="px-5 py-3 text-[#01323F]">Total</td>
                  <td className="px-5 py-3 text-right font-mono text-[#01323F]">—</td>
                  <td className="px-5 py-3 text-right font-mono text-[#01323F]">94h</td>
                  <td className="px-5 py-3 text-right font-mono text-[#FF7D44]">AED 4,700</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
