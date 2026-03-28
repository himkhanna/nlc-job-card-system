import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, RotateCcw, Clock, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import WarehouseBadge from '../components/WarehouseBadge'
import PhaseTracker from '../components/PhaseTracker'
import Modal from '../components/Modal'

// ── Demo data keyed by job ID ─────────────────────────────────────────────────
const DEMO_JOBS = {
  jc841: {
    id: 'jc841', jobNumber: 'JC-2025-0841', warehouse: 'DXB-WH1', type: 'INBOUND',
    status: 'IN_PROGRESS', customer: 'Al Futtaim', container: 'TCKU3450671',
    asn: 'ASN-10482', currentPhase: 'Tally', progress: 62, priority: 'HIGH',
    createdAt: '2025-01-15 08:00', notes: 'Priority handling — customer SLA',
    phases: ['Offloading', 'Tally', 'Putaway', 'VAS', 'Complete'],
    phaseLogs: [
      { phase_name: 'Offloading', phase_status: 'COMPLETED', completed_at: '2025-01-15T09:30:00Z' },
      { phase_name: 'Tally',      phase_status: 'IN_PROGRESS' },
      { phase_name: 'Putaway',    phase_status: 'PENDING' },
      { phase_name: 'VAS',        phase_status: 'PENDING', is_optional: true },
      { phase_name: 'Complete',   phase_status: 'PENDING' },
    ],
    workers: [
      { id: 'e1', name: 'Rajan Pillai',  phase: 'Tally', clockIn: '2025-01-15T08:15:00Z', clockOut: '2025-01-15T10:00:00Z', duration: 105 },
      { id: 'e2', name: 'Sabu Thomas',   phase: 'Tally', clockIn: '2025-01-15T08:30:00Z', clockOut: null, duration: null },
      { id: 'e3', name: 'Ramesh Kumar',  phase: 'Tally', clockIn: '2025-01-15T08:30:00Z', clockOut: null, duration: null },
    ],
    skuTallies: [
      { sku: 'SKU-48821', desc: 'Carton Box 40x30',  expected: 120, scanned: 120, time: 18, status: 'COMPLETE'  },
      { sku: 'SKU-48822', desc: 'Pallet Wrap Roll',  expected: 50,  scanned: 50,  time: 12, status: 'COMPLETE'  },
      { sku: 'SKU-48823', desc: 'HDPE Drum 200L',    expected: 30,  scanned: 22,  time: 25, status: 'PARTIAL'   },
      { sku: 'SKU-48824', desc: 'Steel Bracket 2m',  expected: 200, scanned: 0,   time: 0,  status: 'PENDING'   },
    ],
    dispatchNotes: [],
    erpLogs: [],
  },
  jc837: {
    id: 'jc837', jobNumber: 'JC-2025-0837', warehouse: 'DXB-WH3', type: 'INBOUND',
    status: 'REACTIVATED', customer: 'Lulu Group', container: 'CAIU8830021',
    asn: 'ASN-10479', currentPhase: 'Putaway', progress: 78, priority: 'URGENT',
    createdAt: '2025-01-12 08:00', reactivationReason: 'Customer reported missing items after GRN',
    reactivatedBy: 'supervisor@nlc.demo', reactivatedAt: '2025-01-14T10:00:00Z',
    phases: ['Offloading', 'Tally', 'Putaway', 'VAS', 'Complete'],
    phaseLogs: [
      { phase_name: 'Offloading', phase_status: 'COMPLETED', completed_at: '2025-01-12T11:00:00Z' },
      { phase_name: 'Tally',      phase_status: 'COMPLETED', completed_at: '2025-01-12T14:00:00Z' },
      { phase_name: 'Putaway',    phase_status: 'IN_PROGRESS' },
      { phase_name: 'VAS',        phase_status: 'PENDING', is_optional: true },
      { phase_name: 'Complete',   phase_status: 'PENDING' },
    ],
    workers: [], skuTallies: [], dispatchNotes: [], erpLogs: [],
  },
}

const TABS = ['Overview', 'Workforce', 'SKU Tally', 'Dispatch Notes', 'ERP Sync']

const STATUS_LABELS = { IN_PROGRESS: 'In Progress', PLANNED: 'Planned', COMPLETED: 'Completed', REACTIVATED: 'Reactivated' }

// ── Sub-components ────────────────────────────────────────────────────────────

function OverviewTab({ job }) {
  const [showReactivate, setShowReactivate] = useState(false)
  const [reason, setReason] = useState('')

  function handleCompletePhase(phase) {
    toast.success(`Phase "${phase}" marked complete.`)
  }
  function handleSkipVAS() {
    toast('VAS phase skipped.', { icon: '⏭' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      {/* Left: job info + phase tracker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Job details card */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Job Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {[
              ['Customer',  job.customer],
              ['Job Type',  job.type],
              ['Container', job.container || '—'],
              ['ASN / Order', job.asn || job.order || '—'],
              ['Warehouse', job.warehouse],
              ['Created',   job.createdAt],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 11, color: '#6B7A94', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#1A2440', fontFamily: ['Container','ASN / Order'].includes(label) ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}>{val}</p>
              </div>
            ))}
          </div>
          {job.notes && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#F4F6FA', borderRadius: 8, fontSize: 13, color: '#6B7A94' }}>
              <strong>Notes:</strong> {job.notes}
            </div>
          )}
        </div>

        {/* Reactivation banner */}
        {job.status === 'REACTIVATED' && (
          <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <AlertTriangle size={18} color="#F57F17" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#7B5800' }}>Job Reactivated</p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9E6B00' }}>{job.reactivationReason}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9E6B00', fontFamily: 'DM Mono, monospace' }}>
                By {job.reactivatedBy} · {new Date(job.reactivatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A2440' }}>Overall Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1565C0', fontFamily: 'DM Mono, monospace' }}>{job.progress}%</span>
          </div>
          <ProgressBar percent={job.progress} height={8} />
        </div>

        {/* Phase actions */}
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Phase Actions</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => handleCompletePhase(job.currentPhase)}
              style={{ height: 36, padding: '0 16px', background: '#2E7D32', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={15} /> Complete "{job.currentPhase}"
            </button>
            {job.phases?.includes('VAS') && job.currentPhase === 'VAS' && (
              <button onClick={handleSkipVAS}
                style={{ height: 36, padding: '0 16px', background: '#fff', border: '1px solid #E8ECF2', borderRadius: 8, color: '#6B7A94', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
                Skip VAS
              </button>
            )}
            {job.status === 'COMPLETED' && (
              <button onClick={() => setShowReactivate(true)}
                style={{ height: 36, padding: '0 16px', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, color: '#F57F17', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={15} /> Reactivate Job
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: phase tracker */}
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1A2440' }}>Phase Tracker</h3>
        <PhaseTracker phases={job.phases} currentPhase={job.currentPhase} phaseLogs={job.phaseLogs} />
      </div>

      {/* Reactivate modal */}
      <Modal open={showReactivate} onClose={() => setShowReactivate(false)} title="Reactivate Job Card"
        footer={<>
          <button onClick={() => setShowReactivate(false)} style={{ height: 36, padding: '0 16px', border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#6B7A94' }}>Cancel</button>
          <button onClick={() => { toast.success('Job reactivated.'); setShowReactivate(false) }} style={{ height: 36, padding: '0 16px', background: '#F57F17', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Reactivate</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7A94' }}>Provide a reason for reactivating this completed job.</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Customer reported missing items after GRN"
            style={{ width: '100%', minHeight: 80, border: '1px solid #E8ECF2', borderRadius: 8, padding: 10, fontSize: 13, fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </Modal>
    </div>
  )
}

function WorkforceTab({ job }) {
  const [showClockIn, setShowClockIn] = useState(false)

  const clocked = job.workers.filter(w => !w.clockOut)
  const finished = job.workers.filter(w => w.clockOut)

  function handleClockOut(worker) {
    toast.success(`${worker.name} clocked out.`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7A94' }}>{clocked.length} worker{clocked.length !== 1 ? 's' : ''} currently clocked in</p>
        <button onClick={() => setShowClockIn(true)}
          style={{ height: 36, padding: '0 16px', background: '#FF6B00', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={15} /> Clock In Worker
        </button>
      </div>

      {/* Clocked in */}
      {clocked.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF2', background: '#F0FFF4' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>CURRENTLY CLOCKED IN</span>
          </div>
          {clocked.map(w => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F4F6FA', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2E7D32', flexShrink: 0 }}>
                {w.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A2440' }}>{w.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A94' }}>
                  Phase: <strong>{w.phase}</strong> · In since {new Date(w.clockIn).toLocaleTimeString()}
                </p>
              </div>
              <button onClick={() => handleClockOut(w)}
                style={{ height: 32, padding: '0 14px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 7, color: '#C62828', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
                Clock Out
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {finished.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF2' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7A94' }}>CLOCK HISTORY</span>
          </div>
          {finished.map(w => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid #F4F6FA', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#6B7A94', flexShrink: 0 }}>
                {w.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A2440' }}>{w.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A94' }}>
                  {w.phase} · {new Date(w.clockIn).toLocaleTimeString()} → {new Date(w.clockOut).toLocaleTimeString()}
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2440', fontFamily: 'DM Mono, monospace' }}>
                {w.duration} min
              </span>
            </div>
          ))}
        </div>
      )}

      {job.workers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7A94', fontSize: 13 }}>No clock events yet for this job.</div>
      )}

      <Modal open={showClockIn} onClose={() => setShowClockIn(false)} title="Clock In Worker"
        footer={<>
          <button onClick={() => setShowClockIn(false)} style={{ height: 36, padding: '0 16px', border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#6B7A94' }}>Cancel</button>
          <button onClick={() => { toast.success('Worker clocked in.'); setShowClockIn(false) }} style={{ height: 36, padding: '0 16px', background: '#FF6B00', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Clock In</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Select Worker</label>
            <select style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
              <option>Rajan Pillai (EMP-001)</option>
              <option>Ramesh Kumar (EMP-003) — Tally specialist</option>
              <option>Priya Menon (EMP-006) — Tally specialist</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A2440', marginBottom: 5 }}>Phase</label>
            <select style={{ width: '100%', height: 38, border: '1px solid #E8ECF2', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff' }}>
              {job.phases?.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function SkuTallyTab({ job }) {
  const [simulating, setSimulating] = useState(false)

  async function simulateErpSignal() {
    setSimulating(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('ERP VR-GRN signal received — Tally phase auto-completed!')
    setSimulating(false)
  }

  const tallyStatusColor = { COMPLETE: '#2E7D32', PARTIAL: '#F57F17', PENDING: '#6B7A94' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Read-only banner */}
      <div style={{ background: '#E3F0FF', border: '1px solid #BBDEFB', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Info size={16} color="#1565C0" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#1565C0' }}>Data pulled from ERP/PDA system — read only. Scanned quantities come from Honeywell/Newland PDA devices.</span>
      </div>

      {/* Demo: Simulate ERP signal */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={simulateErpSignal} disabled={simulating}
          style={{ height: 36, padding: '0 16px', background: simulating ? '#E3F0FF' : '#1565C0', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: simulating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {simulating ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Simulating...</> : <><Zap size={14} /> Simulate ERP VR-GRN Signal</>}
        </button>
      </div>

      {/* SKU table */}
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FC' }}>
              {['SKU Code', 'Description', 'Expected', 'Scanned', 'Variance', 'Time (min)', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A94', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #E8ECF2' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {job.skuTallies.map((sku, i) => {
              const variance = sku.expected - sku.scanned
              return (
                <tr key={sku.sku} style={{ borderTop: i > 0 ? '1px solid #F4F6FA' : 'none' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#1565C0', fontWeight: 600 }}>{sku.sku}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#1A2440' }}>{sku.desc}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', textAlign: 'right' }}>{sku.expected}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', textAlign: 'right', fontWeight: 600 }}>{sku.scanned}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', textAlign: 'right', color: variance !== 0 ? '#C62828' : '#2E7D32', fontWeight: 600 }}>
                    {variance !== 0 ? `-${variance}` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', textAlign: 'right' }}>{sku.time || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tallyStatusColor[sku.status] || '#6B7A94', background: sku.status === 'COMPLETE' ? '#E8F5E9' : sku.status === 'PARTIAL' ? '#FFF8E1' : '#F4F6FA', padding: '2px 8px', borderRadius: 20 }}>
                      {sku.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function DispatchNotesTab({ job }) {
  if (job.type !== 'OUTBOUND') {
    return <div style={{ textAlign: 'center', padding: 40, color: '#6B7A94', fontSize: 13 }}>Dispatch notes are only applicable to OUTBOUND jobs.</div>
  }
  if (job.dispatchNotes.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#6B7A94', fontSize: 13 }}>No dispatch notes for this job.</div>
  }
  return <div style={{ color: '#6B7A94', fontSize: 13 }}>Dispatch notes — coming soon</div>
}

function ErpSyncTab({ job }) {
  const [pushing, setPushing] = useState(false)
  const [pulling, setPulling] = useState(false)

  async function simulate(type, setter) {
    setter(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success(`ERP ${type} completed successfully.`)
    setter(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => simulate('push', setPushing)} disabled={pushing}
          style={{ height: 36, padding: '0 16px', background: pushing ? '#E8F5E9' : '#2E7D32', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: pushing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {pushing ? 'Pushing...' : '↑ Push to ERP'}
        </button>
        <button onClick={() => simulate('pull', setPulling)} disabled={pulling}
          style={{ height: 36, padding: '0 16px', background: '#fff', border: '1px solid #E8ECF2', borderRadius: 8, color: '#1A2440', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: pulling ? 'not-allowed' : 'pointer' }}>
          {pulling ? 'Pulling...' : '↓ Pull from ERP'}
        </button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 12, padding: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7A94' }}>ERP sync log will appear here once backend is connected.</p>
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#F4F6FA', borderRadius: 8, fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#6B7A94' }}>
          GRN Generated: {job.grnGenerated ? '✓ Yes' : 'No'} &nbsp;|&nbsp; ERP Synced: {job.erpSynced ? '✓ Yes' : 'No'}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JobCardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')

  const job = DEMO_JOBS[id] || DEMO_JOBS['jc841']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button onClick={() => navigate('/jobs')}
          style={{ width: 34, height: 34, border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={16} color="#6B7A94" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1A2440', fontFamily: 'DM Mono, monospace' }}>{job.jobNumber}</h2>
            <Badge variant={job.status} label={STATUS_LABELS[job.status]} />
            <Badge variant={job.priority} label={job.priority} size="sm" />
            <Badge variant={job.type} label={job.type} size="sm" />
            <WarehouseBadge name={job.warehouse} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7A94' }}>
            {job.customer} · Current phase: <strong style={{ color: '#1A2440' }}>{job.currentPhase}</strong>
          </p>
        </div>
        <button style={{ height: 34, width: 34, border: '1px solid #E8ECF2', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={15} color="#6B7A94" />
        </button>
      </div>

      {/* Progress bar */}
      <ProgressBar percent={job.progress} height={6} showLabel />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E8ECF2', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 400, fontFamily: 'DM Sans, sans-serif',
              color: activeTab === tab ? '#1565C0' : '#6B7A94',
              borderBottom: activeTab === tab ? '2px solid #1565C0' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'Overview'        && <OverviewTab       job={job} />}
        {activeTab === 'Workforce'       && <WorkforceTab      job={job} />}
        {activeTab === 'SKU Tally'       && <SkuTallyTab       job={job} />}
        {activeTab === 'Dispatch Notes'  && <DispatchNotesTab  job={job} />}
        {activeTab === 'ERP Sync'        && <ErpSyncTab        job={job} />}
      </div>

    </div>
  )
}
