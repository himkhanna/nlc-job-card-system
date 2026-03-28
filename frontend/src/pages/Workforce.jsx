import { useState } from 'react'
import { Search, Plus, UserCheck, UserX, Clock, Star, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import WarehouseBadge from '../components/WarehouseBadge'
import DemoModeBanner from '../components/DemoModeBanner'

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_WORKERS = [
  { id: 'emp1', name: 'Rajan Pillai',       employeeId: 'EMP-001', workerType: 'PERMANENT', skills: ['Forklift'],                role: null,          warehouses: ['DXB-WH1'],           isActive: true,  isClockedIn: true,  clockedInJob: 'JC-2025-0841', clockedInPhase: 'Tally' },
  { id: 'emp2', name: 'Sabu Thomas',        employeeId: 'EMP-002', workerType: 'PERMANENT', skills: ['Loading','VAS'],           role: null,          warehouses: ['DXB-WH1'],           isActive: true,  isClockedIn: true,  clockedInJob: 'JC-2025-0841', clockedInPhase: 'Tally' },
  { id: 'emp3', name: 'Ramesh Kumar',       employeeId: 'EMP-003', workerType: 'PERMANENT', skills: ['Tally'],                   role: 'Tally User',  warehouses: ['DXB-WH1'],           isActive: true,  isClockedIn: true,  clockedInJob: 'JC-2025-0841', clockedInPhase: 'Tally' },
  { id: 'emp4', name: 'Jose Fernandez',     employeeId: 'EMP-004', workerType: 'PERMANENT', skills: ['Supervision'],             role: 'Supervisor',  warehouses: ['DXB-WH1','DXB-WH2'], isActive: true,  isClockedIn: false, clockedInJob: null,           clockedInPhase: null },
  { id: 'emp5', name: 'Arjun Nair',         employeeId: 'EMP-005', workerType: 'CONTRACT',  skills: ['Loading','PDA Picking'],   role: null,          warehouses: ['DXB-WH2'],           isActive: true,  isClockedIn: true,  clockedInJob: 'JC-2025-0839', clockedInPhase: 'PDA Picking' },
  { id: 'emp6', name: 'Priya Menon',        employeeId: 'EMP-006', workerType: 'PERMANENT', skills: ['Tally'],                   role: 'Tally User',  warehouses: ['DXB-WH2','DXB-WH3'], isActive: true,  isClockedIn: false, clockedInJob: null,           clockedInPhase: null },
  { id: 'emp7', name: 'Mohammed Al Rashid', employeeId: 'EMP-007', workerType: 'PERMANENT', skills: ['Supervision'],             role: 'Supervisor',  warehouses: ['DXB-WH3'],           isActive: true,  isClockedIn: false, clockedInJob: null,           clockedInPhase: null },
  { id: 'wrk1', name: 'Worker-1',           employeeId: 'WRK-001', workerType: 'AD_HOC',    skills: ['Loading'],                 role: null,          warehouses: ['DXB-WH1'],           isActive: true,  isClockedIn: false, clockedInJob: null,           clockedInPhase: null },
]

const SKILL_COLORS = {
  Tally:        { bg: '#E3F0FF', color: '#1565C0' },
  Forklift:     { bg: '#FFF3E0', color: '#E65100' },
  Loading:      { bg: '#E8F5E9', color: '#2E7D32' },
  VAS:          { bg: '#EDE7F6', color: '#4527A0' },
  Supervision:  { bg: '#FCE4EC', color: '#C62828' },
  'PDA Picking':{ bg: '#E0F7FA', color: '#00695C' },
}

const EMPTY_WORKER_FORM = {
  name: '',
  employeeId: '',
  workerType: 'PERMANENT',
  skills: [],
  role: '',
  warehouses: [],
}

const ALL_SKILLS    = ['Tally', 'Forklift', 'Loading', 'VAS', 'Supervision', 'PDA Picking']
const ALL_WAREHOUSES = ['DXB-WH1','DXB-WH2','DXB-WH3','SHJ-WH1','ABU-WH1']

export default function Workforce() {
  const [workers, setWorkers]     = useState(DEMO_WORKERS)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterWh, setFilterWh]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_WORKER_FORM)

  const filtered = workers.filter(w => {
    const q = search.toLowerCase()
    if (q && !w.name.toLowerCase().includes(q) && !w.employeeId.toLowerCase().includes(q)) return false
    if (filterStatus === 'clocked_in'  && !w.isClockedIn) return false
    if (filterStatus === 'available'   && w.isClockedIn)  return false
    if (filterStatus === 'inactive'    && w.isActive)     return false
    if (filterWh && !w.warehouses.includes(filterWh))     return false
    return true
  })

  const clockedInCount  = workers.filter(w => w.isClockedIn).length
  const availableCount  = workers.filter(w => !w.isClockedIn && w.isActive).length

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }))
  }
  function toggleWh(wh) {
    setForm(f => ({
      ...f,
      warehouses: f.warehouses.includes(wh) ? f.warehouses.filter(w => w !== wh) : [...f.warehouses, wh],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const w = {
      id: Date.now().toString(),
      name: form.name,
      employeeId: form.employeeId,
      workerType: form.workerType,
      skills: form.skills,
      role: form.role || null,
      warehouses: form.warehouses,
      isActive: true,
      isClockedIn: false,
      clockedInJob: null,
      clockedInPhase: null,
    }
    setWorkers(prev => [...prev, w])
    setShowModal(false)
    setForm(EMPTY_WORKER_FORM)
    toast.success(`Worker ${form.name} added`)
  }

  return (
    <div className="space-y-5">
      <DemoModeBanner />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: workers.filter(w => w.isActive).length, color: '#1565C0', bg: '#E3F0FF' },
          { label: 'Clocked In',    value: clockedInCount,  color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'Available',     value: availableCount,  color: '#FF6B00', bg: '#FFF3E0' },
          { label: 'Ad-Hoc',        value: workers.filter(w => w.workerType === 'AD_HOC').length, color: '#6B7A94', bg: '#F4F6FA' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E8ECF2] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: kpi.bg, color: kpi.color }}>
              {kpi.value}
            </div>
            <span className="text-sm font-medium text-[#6B7A94]">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7A94]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search workers..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8ECF2] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1565C0]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1565C0]">
          <option value="">All Status</option>
          <option value="clocked_in">Clocked In</option>
          <option value="available">Available</option>
        </select>
        <select value={filterWh} onChange={e => setFilterWh(e.target.value)}
          className="px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1565C0]">
          <option value="">All Warehouses</option>
          {ALL_WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 transition-colors ml-auto">
          <Plus size={14} /> Add Worker
        </button>
      </div>

      {/* Workers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(worker => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-[#6B7A94]">
            <UserX size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No workers match the current filters</p>
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Worker" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]"
                placeholder="e.g. Rajan Pillai" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Employee ID *</label>
              <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1565C0]"
                placeholder="EMP-009" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Worker Type *</label>
              <select value={form.workerType} onChange={e => setForm(f => ({ ...f, workerType: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]">
                <option value="PERMANENT">Permanent</option>
                <option value="CONTRACT">Contract</option>
                <option value="AD_HOC">Ad-Hoc</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Role (optional)</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]"
                placeholder="e.g. Tally User" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.skills.includes(skill)
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : 'text-[#6B7A94] border-[#E8ECF2] hover:border-[#1565C0]'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-2">Assigned Warehouses</label>
            <div className="flex flex-wrap gap-2">
              {ALL_WAREHOUSES.map(wh => (
                <button key={wh} type="button" onClick={() => toggleWh(wh)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.warehouses.includes(wh)
                      ? 'bg-[#0B1D3A] text-white border-[#0B1D3A]'
                      : 'text-[#6B7A94] border-[#E8ECF2] hover:border-[#0B1D3A]'}`}>
                  {wh}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#6B7A94] border border-[#E8ECF2] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 transition-colors">
              Add Worker
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function WorkerCard({ worker }) {
  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 transition-shadow hover:shadow-md ${worker.isClockedIn ? 'border-[#2E7D32]' : 'border-[#E8ECF2]'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[#1A2440] text-sm">{worker.name}</div>
          <div className="font-mono text-xs text-[#6B7A94]">{worker.employeeId}</div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          worker.isClockedIn ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F4F6FA] text-[#6B7A94]'}`}>
          {worker.isClockedIn ? <UserCheck size={10} /> : <UserX size={10} />}
          {worker.isClockedIn ? 'Clocked In' : 'Available'}
        </div>
      </div>

      {/* Type + warehouses */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={worker.workerType} size="sm" />
        {worker.warehouses.map(wh => <WarehouseBadge key={wh} name={wh} size="xs" />)}
      </div>

      {/* Skills */}
      {worker.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {worker.skills.map(skill => {
            const c = SKILL_COLORS[skill] ?? { bg: '#F4F6FA', color: '#6B7A94' }
            return (
              <span key={skill} className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
                style={{ background: c.bg, color: c.color }}>
                <Star size={8} />
                {skill}
              </span>
            )
          })}
        </div>
      )}

      {/* Clock-in info */}
      {worker.isClockedIn && (
        <div className="bg-[#E8F5E9] rounded-lg px-3 py-2 text-xs text-[#2E7D32]">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock size={11} />
            {worker.clockedInJob} — {worker.clockedInPhase}
          </div>
        </div>
      )}
    </div>
  )
}
