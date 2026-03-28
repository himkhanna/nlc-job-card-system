import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, X } from 'lucide-react'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import WarehouseBadge from '../components/WarehouseBadge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

// Demo data — replace with useQuery(() => GET /api/jobs) once backend is live
const ALL_JOBS = [
  { id: 'jc841', jobNumber: 'JC-2025-0841', customer: 'Al Futtaim', warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'IN_PROGRESS', phase: 'Tally',        progress: 62,  priority: 'HIGH',   container: 'TCKU3450671', asn: 'ASN-10482', createdAt: '2025-01-15' },
  { id: 'jc840', jobNumber: 'JC-2025-0840', customer: 'ENOC',       warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'PLANNED',     phase: 'Offloading',   progress: 0,   priority: 'NORMAL', container: 'MSCU7821033', asn: 'ASN-10481', createdAt: '2025-01-15' },
  { id: 'jc839', jobNumber: 'JC-2025-0839', customer: 'Carrefour',  warehouse: 'DXB-WH2', type: 'OUTBOUND', status: 'IN_PROGRESS', phase: 'PDA Picking',  progress: 45,  priority: 'HIGH',   order: 'ORD-58821', createdAt: '2025-01-14' },
  { id: 'jc838', jobNumber: 'JC-2025-0838', customer: 'Spinneys',   warehouse: 'DXB-WH2', type: 'OUTBOUND', status: 'COMPLETED',   phase: 'Complete',     progress: 100, priority: 'NORMAL', container: 'HLXU4412009', order: 'ORD-58810', createdAt: '2025-01-13' },
  { id: 'jc837', jobNumber: 'JC-2025-0837', customer: 'Lulu Group', warehouse: 'DXB-WH3', type: 'INBOUND',  status: 'REACTIVATED', phase: 'Putaway',      progress: 78,  priority: 'URGENT', container: 'CAIU8830021', asn: 'ASN-10479', createdAt: '2025-01-12' },
  { id: 'jc836', jobNumber: 'JC-2025-0836', customer: 'IKEA UAE',   warehouse: 'DXB-WH1', type: 'INBOUND',  status: 'IN_PROGRESS', phase: 'Offloading',   progress: 15,  priority: 'NORMAL', container: 'CMAU6710034', asn: 'ASN-10478', createdAt: '2025-01-15' },
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
  const [search,    setSearch]    = useState('')
  const [warehouse, setWarehouse] = useState('All')
  const [status,    setStatus]    = useState('All')
  const [type,      setType]      = useState('All')
  const [priority,  setPriority]  = useState('All')
  const [showNew,   setShowNew]   = useState(false)

  const filtered = ALL_JOBS.filter(j => {
    if (warehouse !== 'All' && j.warehouse !== warehouse) return false
    if (status    !== 'All' && j.status    !== status)    return false
    if (type      !== 'All' && j.type      !== type)      return false
    if (priority  !== 'All' && j.priority  !== priority)  return false
    if (search) {
      const q = search.toLowerCase()
      return (
        j.jobNumber.toLowerCase().includes(q) ||
        j.customer.toLowerCase().includes(q) ||
        (j.container?.toLowerCase().includes(q)) ||
        (j.asn?.toLowerCase().includes(q)) ||
        (j.order?.toLowerCase().includes(q))
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
        {filtered.length} job{filtered.length !== 1 ? 's' : ''} {hasFilters ? 'matching filters' : 'total'}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
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
                      {job.customer}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <WarehouseBadge name={job.warehouse} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.type} label={job.type} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Mono, monospace' }}>
                      {job.container || job.asn || job.order || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94' }}>
                      {job.phase}
                    </td>
                    <td style={{ padding: '12px 14px', minWidth: 110 }}>
                      <ProgressBar percent={job.progress} showLabel />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.status} label={STATUS_LABELS[job.status]} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={job.priority} label={job.priority} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                      {job.createdAt}
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
            <button style={{ height: 36, padding: '0 16px', background: '#FF6B00', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
              Create Job Card
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Customer Name', placeholder: 'e.g. Al Futtaim' },
            { label: 'Container Number', placeholder: 'e.g. TCKU3450671' },
            { label: 'ASN / Order Number', placeholder: 'e.g. ASN-10482' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>{f.label}</label>
              <input placeholder={f.placeholder} style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1565C0'}
                onBlur={e => e.target.style.borderColor = '#E8ECF2'} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Warehouse</label>
              <select style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
                {WAREHOUSES.filter(w => w !== 'All').map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Job Type</label>
              <select style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
                <option>INBOUND</option>
                <option>OUTBOUND</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Priority</label>
            <select style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
              <option>NORMAL</option><option>HIGH</option><option>URGENT</option>
            </select>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7A94', background: '#F4F6FA', border: '1px solid #E8ECF2', borderRadius: 8, padding: '8px 12px' }}>
            Job number will be auto-generated as <strong style={{ fontFamily: 'DM Mono, monospace' }}>JC-2025-XXXX</strong>. Phase sequence will be set from the selected job type config.
          </p>
        </div>
      </Modal>

    </div>
  )
}
