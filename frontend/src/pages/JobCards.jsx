import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import WarehouseBadge from '../components/WarehouseBadge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useJobs } from '../hooks/useApi'
import { useWarehouse } from '../context/WarehouseContext'
import { jobs as jobsApi } from '../lib/api'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

const DEMO_JOBS = [
  { id: 'jc841', jobNumber: 'JC-2025-0841', customerName: 'Al Futtaim', warehouseName: 'DXB-WH1', jobType: 'INBOUND',  status: 'IN_PROGRESS', currentPhase: 'Tally',        progressPercent: 62,  priority: 'HIGH',   containerNumber: 'TCKU3450671', asnNumber: 'ASN-10482', createdAt: '2025-01-15' },
  { id: 'jc840', jobNumber: 'JC-2025-0840', customerName: 'ENOC',       warehouseName: 'DXB-WH1', jobType: 'INBOUND',  status: 'PLANNED',     currentPhase: 'Offloading',   progressPercent: 0,   priority: 'NORMAL', containerNumber: 'MSCU7821033', asnNumber: 'ASN-10481', createdAt: '2025-01-15' },
  { id: 'jc839', jobNumber: 'JC-2025-0839', customerName: 'Carrefour',  warehouseName: 'DXB-WH2', jobType: 'OUTBOUND', status: 'IN_PROGRESS', currentPhase: 'PDA Picking',  progressPercent: 45,  priority: 'HIGH',   orderNumber: 'ORD-58821', createdAt: '2025-01-14' },
  { id: 'jc838', jobNumber: 'JC-2025-0838', customerName: 'Spinneys',   warehouseName: 'DXB-WH2', jobType: 'OUTBOUND', status: 'COMPLETED',   currentPhase: 'Complete',     progressPercent: 100, priority: 'NORMAL', containerNumber: 'HLXU4412009', orderNumber: 'ORD-58810', createdAt: '2025-01-13' },
  { id: 'jc837', jobNumber: 'JC-2025-0837', customerName: 'Lulu Group', warehouseName: 'DXB-WH3', jobType: 'INBOUND',  status: 'REACTIVATED', currentPhase: 'Putaway',      progressPercent: 78,  priority: 'URGENT', containerNumber: 'CAIU8830021', asnNumber: 'ASN-10479', createdAt: '2025-01-12' },
  { id: 'jc836', jobNumber: 'JC-2025-0836', customerName: 'IKEA UAE',   warehouseName: 'DXB-WH1', jobType: 'INBOUND',  status: 'IN_PROGRESS', currentPhase: 'Offloading',   progressPercent: 15,  priority: 'NORMAL', containerNumber: 'CMAU6710034', asnNumber: 'ASN-10478', createdAt: '2025-01-15' },
]

const WAREHOUSES  = ['All', 'DXB-WH1', 'DXB-WH2', 'DXB-WH3', 'SHJ-WH1', 'ABU-WH1']
const STATUSES    = ['All', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REACTIVATED']
const TYPES       = ['All', 'INBOUND', 'OUTBOUND']
const PRIORITIES  = ['All', 'NORMAL', 'HIGH', 'URGENT']

const STATUS_LABELS = { IN_PROGRESS: 'In Progress', PLANNED: 'Planned', COMPLETED: 'Completed', REACTIVATED: 'Reactivated' }

function FilterPill({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        height: 34, border: '1px solid #E8ECF2', borderRadius: 8,
        padding: '0 10px', fontSize: 13, color: value === 'All' ? '#6B7A94' : '#1A2440',
        fontFamily: 'DM Sans, sans-serif', background: '#fff', cursor: 'pointer',
        fontWeight: value === 'All' ? 400 : 600, outline: 'none',
      }}
    >
      <option value="All">{label}: All</option>
      {options.filter(o => o !== 'All').map(o => (
        <option key={o} value={o}>{label}: {o}</option>
      ))}
    </select>
  )
}

export default function JobCards() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const { selectedWarehouse } = useWarehouse()
  const [search,    setSearch]    = useState('')
  const [warehouse, setWarehouse] = useState('All')
  const [status,    setStatus]    = useState('All')
  const [type,      setType]      = useState('All')
  const [priority,  setPriority]  = useState('All')
  const [showNew,   setShowNew]   = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [newForm,   setNewForm]   = useState({ customerName: '', containerNumber: '', asnNumber: '', orderNumber: '', warehouseId: '', jobType: 'INBOUND', priority: 'NORMAL' })

  const { data: apiData, isLoading, isError } = useJobs(
    selectedWarehouse ? { warehouseId: selectedWarehouse } : {}
  )
  const allJobs = isError || !apiData ? DEMO_JOBS : (apiData.items ?? apiData ?? [])

  const filtered = allJobs.filter(j => {
    const wh = j.warehouseName ?? j.warehouse ?? ''
    if (warehouse !== 'All' && wh !== warehouse)          return false
    if (status    !== 'All' && j.status    !== status)    return false
    if (type      !== 'All' && (j.jobType ?? j.type) !== type) return false
    if (priority  !== 'All' && j.priority  !== priority)  return false
    if (search) {
      const q = search.toLowerCase()
      return (
        j.jobNumber.toLowerCase().includes(q) ||
        (j.customerName ?? j.customer ?? '').toLowerCase().includes(q) ||
        (j.containerNumber?.toLowerCase().includes(q)) ||
        (j.asnNumber?.toLowerCase().includes(q)) ||
        (j.orderNumber?.toLowerCase().includes(q))
      )
    }
    return true
  })

  const hasFilters = warehouse !== 'All' || status !== 'All' || type !== 'All' || priority !== 'All' || search

  function clearFilters() {
    setWarehouse('All'); setStatus('All')
    setType('All');      setPriority('All')
    setSearch('')
  }

  async function handleCreate() {
    if (!newForm.customerName.trim()) return toast.error('Customer name is required')
    setCreating(true)
    try {
      const created = await jobsApi.create(newForm)
      toast.success(`Job ${created.jobNumber} created`)
      qc.invalidateQueries({ queryKey: ['jobs'] })
      setShowNew(false)
      setNewForm({ customerName: '', containerNumber: '', asnNumber: '', orderNumber: '', warehouseId: '', jobType: 'INBOUND', priority: 'NORMAL' })
      navigate(`/jobs/${created.id}`)
    } catch (e) {
      toast.error(e.message ?? 'Failed to create job card')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #E8ECF2', borderRadius: 8,
          padding: '0 12px', height: 34, flex: '1 1 220px', maxWidth: 320,
        }}>
          <Search size={14} color="#6B7A94" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Job #, customer, container, ASN..."
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#1A2440', width: '100%', background: 'transparent' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} color="#6B7A94" /></button>}
        </div>

        <FilterPill label="Warehouse" value={warehouse} options={WAREHOUSES} onChange={setWarehouse} />
        <FilterPill label="Status"    value={status}    options={STATUSES}    onChange={setStatus}    />
        <FilterPill label="Type"      value={type}      options={TYPES}       onChange={setType}      />
        <FilterPill label="Priority"  value={priority}  options={PRIORITIES}  onChange={setPriority}  />

        {hasFilters && (
          <button onClick={clearFilters} style={{ height: 34, padding: '0 12px', border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6B7A94', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
            <X size={13} /> Clear
          </button>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setShowNew(true)}
          style={{ height: 36, padding: '0 16px', background: '#FF6B00', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> New Job Card
        </button>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: '#6B7A94' }}>
        {isLoading ? 'Loading...' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} ${hasFilters ? 'matching filters' : 'total'}`}
        {isError && <span style={{ color: '#F57F17', marginLeft: 8 }}>· Demo data (API unavailable)</span>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 24 }}><LoadingSkeleton height={300} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No job cards match the current filters." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr style={{ background: '#F8F9FC' }}>
                  {['Job #', 'Customer', 'Warehouse', 'Type', 'Container / ASN / Order', 'Phase', 'Progress', 'Status', 'Priority', 'Created'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A94', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', borderBottom: '1px solid #E8ECF2' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    style={{ borderTop: i > 0 ? '1px solid #F4F6FA' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F9FC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#1565C0', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {job.jobNumber}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1A2440', fontWeight: 500 }}>
                      {job.customerName ?? job.customer}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <WarehouseBadge name={job.warehouseName ?? job.warehouse} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.jobType ?? job.type} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Mono, monospace' }}>
                      {job.containerNumber || job.asnNumber || job.orderNumber || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94' }}>
                      {job.currentPhase ?? job.phase}
                    </td>
                    <td style={{ padding: '12px 14px', minWidth: 110 }}>
                      <ProgressBar percent={job.progressPercent ?? job.progress} showLabel />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.status} label={STATUS_LABELS[job.status]} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.priority} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Job Card modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Create New Job Card"
        footer={
          <>
            <button onClick={() => setShowNew(false)} style={{ height: 36, padding: '0 16px', border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#6B7A94' }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={creating} style={{ height: 36, padding: '0 16px', background: '#FF6B00', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creating…' : 'Create Job Card'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Customer Name *', field: 'customerName', placeholder: 'e.g. Al Futtaim' },
            { label: 'Container Number', field: 'containerNumber', placeholder: 'e.g. TCKU3450671' },
            { label: 'ASN Number', field: 'asnNumber', placeholder: 'e.g. ASN-10482' },
            { label: 'Order Number', field: 'orderNumber', placeholder: 'e.g. ORD-58821' },
          ].map(f => (
            <div key={f.field}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>{f.label}</label>
              <input
                value={newForm[f.field]}
                onChange={e => setNewForm(p => ({ ...p, [f.field]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1565C0'}
                onBlur={e => e.target.style.borderColor = '#E8ECF2'} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Job Type</label>
              <select value={newForm.jobType} onChange={e => setNewForm(p => ({ ...p, jobType: e.target.value }))}
                style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
                <option value="INBOUND">INBOUND</option>
                <option value="OUTBOUND">OUTBOUND</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Priority</label>
              <select value={newForm.priority} onChange={e => setNewForm(p => ({ ...p, priority: e.target.value }))}
                style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
                <option value="NORMAL">NORMAL</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7A94', background: '#F4F6FA', border: '1px solid #E8ECF2', borderRadius: 8, padding: '8px 12px' }}>
            Job number will be auto-generated as <strong style={{ fontFamily: 'DM Mono, monospace' }}>JC-2025-XXXX</strong>. Phase sequence will be set from the selected job type config.
          </p>
        </div>
      </Modal>

    </div>
  )
}
