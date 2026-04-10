import { useState, useEffect } from 'react'
import { Search, Plus, UserCheck, UserX, Clock, Star, Camera, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import WarehouseBadge from '../components/WarehouseBadge'
import FaceEnrollmentModal from '../components/FaceEnrollmentModal'
import { workers as workersApi } from '../lib/api'

const SKILL_COLORS = {
  Tally:        { bg: '#E3F0FF', color: '#07847F' },
  Forklift:     { bg: '#FFF3E0', color: '#E65100' },
  Loading:      { bg: '#E8F5E9', color: '#2E7D32' },
  VAS:          { bg: '#EDE7F6', color: '#4527A0' },
  Supervision:  { bg: '#FCE4EC', color: '#C62828' },
  'PDA Picking':{ bg: '#E0F7FA', color: '#00695C' },
}

const EMPTY_WORKER_FORM = {
  name: '', employeeId: '', workerType: 'PERMANENT', skills: [], role: '', warehouses: [],
}

const ALL_SKILLS     = ['Tally', 'Forklift', 'Loading', 'VAS', 'Supervision', 'PDA Picking']
const ALL_WAREHOUSES = ['DXB-WH1', 'DXB-WH2', 'DXB-WH3', 'SHJ-WH1', 'ABU-WH1']

export default function Workforce() {
  const [workerList, setWorkerList]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterWh, setFilterWh]       = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(EMPTY_WORKER_FORM)
  const [saving, setSaving]           = useState(false)
  const [faceWorker, setFaceWorker]   = useState(null)

  function loadWorkers() {
    setLoading(true)
    workersApi.list()
      .then(data => setWorkerList(Array.isArray(data) ? data : data?.content ?? []))
      .catch(() => toast.error('Failed to load workers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWorkers() }, [])

  const filtered = workerList.filter(w => {
    const q = search.toLowerCase()
    if (q && !w.name?.toLowerCase().includes(q) && !(w.employeeId ?? '').toLowerCase().includes(q)) return false
    if (filterStatus === 'clocked_in' && !w.isClockedIn)  return false
    if (filterStatus === 'available'  && w.isClockedIn)   return false
    if (filterStatus === 'inactive'   && w.isActive)      return false
    return true
  })

  const clockedInCount = workerList.filter(w => w.isClockedIn).length
  const availableCount = workerList.filter(w => !w.isClockedIn && w.isActive).length

  function toggleSkill(skill) {
    setForm(f => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill] }))
  }
  function toggleWh(wh) {
    setForm(f => ({ ...f, warehouses: f.warehouses.includes(wh) ? f.warehouses.filter(w => w !== wh) : [...f.warehouses, wh] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await workersApi.create({
        name: form.name,
        employeeId: form.employeeId,
        workerType: form.workerType,
        skills: form.skills,
        role: form.role || null,
        assignedWarehouseIds: form.warehouses,
      })
      toast.success(`Worker ${form.name} added`)
      setShowModal(false)
      setForm(EMPTY_WORKER_FORM)
      loadWorkers()
    } catch (err) {
      toast.error(err.message ?? 'Failed to add worker')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: workerList.filter(w => w.isActive).length, color: '#07847F', bg: '#E3F0FF' },
          { label: 'Clocked In',    value: clockedInCount,  color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'Available',     value: availableCount,  color: '#FF7D44', bg: '#FFF3E0' },
          { label: 'Ad-Hoc',        value: workerList.filter(w => w.workerType === 'AD_HOC').length, color: '#505D7B', bg: '#F2F8FA' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#DDE8EC] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: kpi.bg, color: kpi.color }}>{kpi.value}</div>
            <span className="text-sm font-medium text-[#505D7B]">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#505D7B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workers..."
            className="w-full pl-9 pr-3 py-2 border border-[#DDE8EC] rounded-lg text-sm bg-white focus:outline-none focus:border-[#07847F]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm bg-white focus:outline-none focus:border-[#07847F]">
          <option value="">All Status</option>
          <option value="clocked_in">Clocked In</option>
          <option value="available">Available</option>
        </select>
        <select value={filterWh} onChange={e => setFilterWh(e.target.value)}
          className="px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm bg-white focus:outline-none focus:border-[#07847F]">
          <option value="">All Warehouses</option>
          {ALL_WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <button onClick={loadWorkers}
          className="p-2 border border-[#DDE8EC] rounded-lg text-[#505D7B] hover:border-[#07847F] hover:text-[#07847F] transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors ml-auto">
          <Plus size={14} /> Add Worker
        </button>
      </div>

      {/* Workers grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#DDE8EC] p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="flex gap-2"><div className="h-5 bg-gray-100 rounded-full w-16" /><div className="h-5 bg-gray-100 rounded-full w-16" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(worker => (
            <WorkerCard key={worker.id} worker={worker} onManageFace={() => setFaceWorker(worker)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-[#505D7B]">
              <UserX size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No workers found</p>
            </div>
          )}
        </div>
      )}

      {/* Face Enrollment Modal */}
      <FaceEnrollmentModal
        open={!!faceWorker}
        onClose={() => setFaceWorker(null)}
        worker={faceWorker}
        onUpdated={loadWorkers}
      />

      {/* Add Worker Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Worker" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
                placeholder="e.g. Rajan Pillai" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Employee ID *</label>
              <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]"
                placeholder="EMP-009" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Worker Type *</label>
              <select value={form.workerType} onChange={e => setForm(f => ({ ...f, workerType: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]">
                <option value="PERMANENT">Permanent</option>
                <option value="CONTRACT">Contract</option>
                <option value="AD_HOC">Ad-Hoc</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Role (optional)</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
                placeholder="e.g. Tally User" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#505D7B] mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.skills.includes(skill) ? 'bg-[#07847F] text-white border-[#07847F]' : 'text-[#505D7B] border-[#DDE8EC] hover:border-[#07847F]'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#505D7B] mb-2">Assigned Warehouses</label>
            <div className="flex flex-wrap gap-2">
              {ALL_WAREHOUSES.map(wh => (
                <button key={wh} type="button" onClick={() => toggleWh(wh)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.warehouses.includes(wh) ? 'bg-[#1C3F39] text-white border-[#1C3F39]' : 'text-[#505D7B] border-[#DDE8EC] hover:border-[#1C3F39]'}`}>
                  {wh}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#505D7B] border border-[#DDE8EC] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
              {saving ? 'Adding…' : 'Add Worker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function WorkerCard({ worker, onManageFace }) {
  const warehouses = worker.assignedWarehouseIds ?? worker.warehouses ?? []
  const skills     = worker.skills ?? []
  const isClockedIn = worker.isClockedIn ?? false

  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 transition-shadow hover:shadow-md ${isClockedIn ? 'border-[#2E7D32]' : 'border-[#DDE8EC]'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[#01323F] text-sm">{worker.name}</div>
          <div className="font-mono text-xs text-[#505D7B]">{worker.employeeId}</div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          isClockedIn ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F2F8FA] text-[#505D7B]'}`}>
          {isClockedIn ? <UserCheck size={10} /> : <UserX size={10} />}
          {isClockedIn ? 'Clocked In' : 'Available'}
        </div>
      </div>

      {/* Type + warehouses */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={worker.workerType} size="sm" />
        {warehouses.map(wh => <WarehouseBadge key={wh} name={wh} size="xs" />)}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.map(skill => {
            const c = SKILL_COLORS[skill] ?? { bg: '#F2F8FA', color: '#505D7B' }
            return (
              <span key={skill} className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
                style={{ background: c.bg, color: c.color }}>
                <Star size={8} />{skill}
              </span>
            )
          })}
        </div>
      )}

      {/* Clock-in info */}
      {isClockedIn && (worker.clockedInJobNumber || worker.clockedInPhase) && (
        <div className="bg-[#E8F5E9] rounded-lg px-3 py-2 text-xs text-[#2E7D32]">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock size={11} />
            {worker.clockedInJobNumber} {worker.clockedInPhase ? `— ${worker.clockedInPhase}` : ''}
          </div>
        </div>
      )}

      {/* Face setup button */}
      <button onClick={onManageFace}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-[#DDE8EC] rounded-lg text-xs font-medium text-[#505D7B] hover:border-[#07847F] hover:text-[#07847F] transition-colors">
        <Camera size={12} /> Manage Face &amp; PIN
      </button>
    </div>
  )
}
