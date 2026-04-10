import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Link, AlertCircle, ChevronUp, ChevronDown, Trash2, Save } from 'lucide-react'
import { useJobTypeConfigs } from '../hooks/useApi'
import { settings as settingsApi } from '../lib/api'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import UserManagement from './UserManagement'

// ── Demo data ─────────────────────────────────────────────────────────────────
const INIT_WAREHOUSES = [
  { id: 'wh1', name: 'DXB-WH1', location: 'Jebel Ali, Dubai',          isActive: true },
  { id: 'wh2', name: 'DXB-WH2', location: 'Al Quoz, Dubai',            isActive: true },
  { id: 'wh3', name: 'SHJ-WH1', location: 'Sharjah Industrial Area',   isActive: true },
  { id: 'wh4', name: 'ABU-WH1', location: 'Mussafah, Abu Dhabi',       isActive: true },
  { id: 'wh5', name: 'DXB-WH3', location: 'Dubai Investments Park',    isActive: true },
]

const INIT_CONFIGS = [
  { id: 'cfg1', name: 'INBOUND',  phases: ['Offloading','Tally','Putaway','VAS','Complete'], vasOptional: true,  grnTriggerPhase: 'Putaway', erpPushPhase: 'Putaway', isActive: true },
  { id: 'cfg2', name: 'OUTBOUND', phases: ['Order & Pick List','PDA Picking','Dispatch Tally','Loading','Complete'], vasOptional: false, grnTriggerPhase: null, erpPushPhase: 'Loading', isActive: true },
]


const INIT_ERP = { erpApiUrl: 'https://erp.nlc-demo.ae/api/v2', laborRateAed: 50, demoMode: true }

const TABS = ['User Management', 'Warehouse Setup', 'Job Type Config', 'System Config']

export default function Settings() {
  const [activeTab, setActiveTab] = useState('User Management')

  return (
    <div className="space-y-5">

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F2F8FA] rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-[#01323F] shadow-sm' : 'text-[#505D7B] hover:text-[#01323F]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'User Management'  && <UserManagement />}
      {activeTab === 'Warehouse Setup'  && <WarehouseSetup />}
      {activeTab === 'Job Type Config'  && <JobTypeConfigTab />}
      {activeTab === 'System Config'    && <SystemConfig />}
    </div>
  )
}

// ── Warehouse Setup ───────────────────────────────────────────────────────────
function WarehouseSetup() {
  const [warehouses, setWarehouses] = useState(INIT_WAREHOUSES)
  const [editing, setEditing]       = useState(null) // { id, name, location }
  const [showAdd, setShowAdd]       = useState(false)
  const [addForm, setAddForm]       = useState({ name: '', location: '' })

  function startEdit(wh) { setEditing({ id: wh.id, name: wh.name, location: wh.location }) }
  function saveEdit() {
    setWarehouses(prev => prev.map(w => w.id === editing.id ? { ...w, ...editing } : w))
    setEditing(null)
    toast.success('Warehouse updated')
  }
  function toggleActive(id) {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w))
  }
  function handleAdd(e) {
    e.preventDefault()
    setWarehouses(prev => [...prev, { id: Date.now().toString(), name: addForm.name, location: addForm.location, isActive: true }])
    setAddForm({ name: '', location: '' })
    setShowAdd(false)
    toast.success('Warehouse added')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#505D7B]">{warehouses.length} warehouses configured</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors">
          <Plus size={14} /> Add Warehouse
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DDE8EC] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F2F8FA] text-xs font-semibold text-[#505D7B] uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE8EC]">
            {warehouses.map(wh => (
              <tr key={wh.id} className="hover:bg-[#F2F8FA]/50 transition-colors">
                <td className="px-5 py-3">
                  {editing?.id === wh.id
                    ? <input value={editing.name} onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                        className="px-2 py-1 border border-[#07847F] rounded text-sm w-24 focus:outline-none" />
                    : <span className="font-mono font-semibold text-[#01323F]">{wh.name}</span>}
                </td>
                <td className="px-5 py-3">
                  {editing?.id === wh.id
                    ? <input value={editing.location} onChange={e => setEditing(ed => ({ ...ed, location: e.target.value }))}
                        className="px-2 py-1 border border-[#07847F] rounded text-sm w-52 focus:outline-none" />
                    : <span className="text-[#505D7B]">{wh.location}</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${wh.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F2F8FA] text-[#505D7B]'}`}>
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {editing?.id === wh.id ? (
                      <>
                        <button onClick={saveEdit} className="text-[#2E7D32] hover:text-green-800"><Check size={14} /></button>
                        <button onClick={() => setEditing(null)} className="text-[#C62828] hover:text-red-800"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(wh)} className="text-[#07847F] hover:text-blue-800"><Edit2 size={14} /></button>
                        <button onClick={() => toggleActive(wh.id)} className="text-xs text-[#505D7B] hover:underline">
                          {wh.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Warehouse" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#505D7B] mb-1">Warehouse Code *</label>
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]"
              placeholder="e.g. DXB-WH4" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#505D7B] mb-1">Location *</label>
            <input value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
              placeholder="e.g. Deira, Dubai" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm font-medium text-[#505D7B] border border-[#DDE8EC] rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Job Type Config ────────────────────────────────────────────────────────────
function JobTypeConfigTab() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useJobTypeConfigs()
  const configs = isError || !data ? INIT_CONFIGS : (data ?? INIT_CONFIGS)

  // editing state: { [id]: draftConfig }
  const [drafts, setDrafts]   = useState({})
  const [saving, setSaving]   = useState({})
  const [newPhase, setNewPhase] = useState({}) // { [id]: inputValue }

  function startEdit(cfg) {
    setDrafts(d => ({ ...d, [cfg.id]: {
      phases:          [...cfg.phases],
      vasOptional:     cfg.vasOptional,
      grnTriggerPhase: cfg.grnTriggerPhase ?? '',
      erpPushPhase:    cfg.erpPushPhase ?? '',
      isActive:        cfg.isActive,
    }}))
  }

  function cancelEdit(id) {
    setDrafts(d => { const n = { ...d }; delete n[id]; return n })
    setNewPhase(p => { const n = { ...p }; delete n[id]; return n })
  }

  function updateDraft(id, field, value) {
    setDrafts(d => ({ ...d, [id]: { ...d[id], [field]: value } }))
  }

  function movePhase(id, idx, dir) {
    const phases = [...drafts[id].phases]
    const swap   = idx + dir
    if (swap < 0 || swap >= phases.length) return
    ;[phases[idx], phases[swap]] = [phases[swap], phases[idx]]
    // fix grnTriggerPhase/erpPushPhase refs if they moved
    updateDraft(id, 'phases', phases)
  }

  function removePhase(id, idx) {
    const phases = drafts[id].phases.filter((_, i) => i !== idx)
    const draft  = drafts[id]
    setDrafts(d => ({ ...d, [id]: {
      ...draft,
      phases,
      grnTriggerPhase: phases.includes(draft.grnTriggerPhase) ? draft.grnTriggerPhase : '',
      erpPushPhase:    phases.includes(draft.erpPushPhase)    ? draft.erpPushPhase    : '',
    }}))
  }

  function addPhase(id) {
    const name = (newPhase[id] ?? '').trim()
    if (!name) return
    if (drafts[id].phases.includes(name)) { toast.error('Phase already exists'); return }
    updateDraft(id, 'phases', [...drafts[id].phases, name])
    setNewPhase(p => ({ ...p, [id]: '' }))
  }

  async function saveConfig(cfg) {
    const draft = drafts[cfg.id]
    if (!draft) return
    setSaving(s => ({ ...s, [cfg.id]: true }))
    try {
      await settingsApi.jobTypeConfigs.update(cfg.id, {
        phases:          draft.phases,
        vasOptional:     draft.vasOptional,
        grnTriggerPhase: draft.grnTriggerPhase || null,
        erpPushPhase:    draft.erpPushPhase    || null,
        isActive:        draft.isActive,
      })
      toast.success(`${cfg.name} config saved`)
      qc.invalidateQueries({ queryKey: ['settings', 'job-type-configs'] })
      cancelEdit(cfg.id)
    } catch (err) {
      toast.error(err.message ?? 'Failed to save')
    } finally {
      setSaving(s => ({ ...s, [cfg.id]: false }))
    }
  }

  if (isLoading) return <div className="text-sm text-[#505D7B] py-8 text-center">Loading configs…</div>

  return (
    <div className="space-y-5">
      <div className="bg-[#FFF8E1] border border-[#FFF176] rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#F57F17] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#795548]">
          Phase sequences apply to <strong>new</strong> job cards only. In-progress jobs keep their original snapshot.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {configs.map(cfg => {
          const draft    = drafts[cfg.id]
          const editing  = !!draft
          const isSaving = !!saving[cfg.id]
          const display  = editing ? draft : cfg

          return (
            <div key={cfg.id} className="bg-white rounded-xl border border-[#DDE8EC] p-5 space-y-4">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#01323F] text-base">{cfg.name}</div>
                  <div className="text-xs text-[#505D7B]">{display.phases.length} phases</div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Active toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${display.isActive ? 'text-[#2E7D32]' : 'text-[#505D7B]'}`}>
                      {display.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => editing
                        ? updateDraft(cfg.id, 'isActive', !draft.isActive)
                        : saveConfig({ ...cfg, id: cfg.id }) && startEdit({ ...cfg, isActive: !cfg.isActive })
                      }
                      className="text-[#505D7B] hover:text-[#01323F]"
                    >
                      {display.isActive
                        ? <ToggleRight size={22} className="text-[#2E7D32]" />
                        : <ToggleLeft  size={22} />}
                    </button>
                  </div>
                  {/* Edit / Save / Cancel */}
                  {!editing ? (
                    <button onClick={() => startEdit(cfg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#07847F] border border-[#07847F] rounded-lg hover:bg-teal-50 transition-colors">
                      <Edit2 size={12} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => cancelEdit(cfg.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#505D7B] border border-[#DDE8EC] rounded-lg hover:bg-gray-50">
                        <X size={12} /> Cancel
                      </button>
                      <button onClick={() => saveConfig(cfg)} disabled={isSaving}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#07847F] rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors">
                        <Save size={12} /> {isSaving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Phase list */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[#505D7B] uppercase tracking-wide mb-2">Phase Sequence</div>
                {display.phases.map((phase, i) => (
                  <div key={`${phase}-${i}`} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F2F8FA] flex items-center justify-center text-xs font-bold text-[#505D7B] flex-shrink-0">{i + 1}</div>
                    <span className={`flex-1 text-sm font-medium ${
                      phase === display.grnTriggerPhase ? 'text-[#2E7D32]' :
                      phase === display.erpPushPhase    ? 'text-[#07847F]' :
                      phase === 'VAS' && display.vasOptional ? 'text-[#F57F17]' :
                      'text-[#01323F]'
                    }`}>{phase}</span>
                    {/* Badges */}
                    {phase === display.grnTriggerPhase && <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] font-semibold px-1.5 py-0.5 rounded">GRN</span>}
                    {phase === display.erpPushPhase    && <span className="text-[10px] bg-[#E3F0FF] text-[#07847F] font-semibold px-1.5 py-0.5 rounded">ERP</span>}
                    {phase === 'VAS' && display.vasOptional && <span className="text-[10px] bg-[#FFF8E1] text-[#F57F17] font-semibold px-1.5 py-0.5 rounded">Optional</span>}
                    {/* Edit controls */}
                    {editing && (
                      <div className="flex items-center gap-1 ml-1">
                        <button onClick={() => movePhase(cfg.id, i, -1)} disabled={i === 0}
                          className="p-0.5 rounded hover:bg-[#F2F8FA] text-[#505D7B] disabled:opacity-30"><ChevronUp size={13} /></button>
                        <button onClick={() => movePhase(cfg.id, i, 1)} disabled={i === display.phases.length - 1}
                          className="p-0.5 rounded hover:bg-[#F2F8FA] text-[#505D7B] disabled:opacity-30"><ChevronDown size={13} /></button>
                        <button onClick={() => removePhase(cfg.id, i)}
                          className="p-0.5 rounded hover:bg-red-50 text-[#C62828]"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add phase input */}
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newPhase[cfg.id] ?? ''}
                      onChange={e => setNewPhase(p => ({ ...p, [cfg.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addPhase(cfg.id)}
                      placeholder="New phase name…"
                      className="flex-1 px-3 py-1.5 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
                    />
                    <button onClick={() => addPhase(cfg.id)}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-[#1C3F39] rounded-lg hover:bg-teal-900 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Settings row */}
              <div className={`border-t border-[#DDE8EC] pt-3 space-y-3 ${!editing ? 'opacity-80' : ''}`}>

                {/* GRN Trigger Phase */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#01323F]">GRN Trigger Phase</div>
                    <div className="text-xs text-[#505D7B]">Generates GRN + pushes to ERP on completion</div>
                  </div>
                  {editing ? (
                    <select value={draft.grnTriggerPhase}
                      onChange={e => updateDraft(cfg.id, 'grnTriggerPhase', e.target.value)}
                      className="px-2 py-1.5 border border-[#DDE8EC] rounded-lg text-xs focus:outline-none focus:border-[#07847F] bg-white min-w-[130px]">
                      <option value="">— None —</option>
                      {draft.phases.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className="font-mono text-xs text-[#01323F] bg-[#F2F8FA] px-2 py-1 rounded">{cfg.grnTriggerPhase ?? '—'}</span>
                  )}
                </div>

                {/* ERP Push Phase */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#01323F]">ERP Push Phase</div>
                    <div className="text-xs text-[#505D7B]">Sends phase completion data to ERP</div>
                  </div>
                  {editing ? (
                    <select value={draft.erpPushPhase}
                      onChange={e => updateDraft(cfg.id, 'erpPushPhase', e.target.value)}
                      className="px-2 py-1.5 border border-[#DDE8EC] rounded-lg text-xs focus:outline-none focus:border-[#07847F] bg-white min-w-[130px]">
                      <option value="">— None —</option>
                      {draft.phases.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className="font-mono text-xs text-[#01323F] bg-[#F2F8FA] px-2 py-1 rounded">{cfg.erpPushPhase ?? '—'}</span>
                  )}
                </div>

                {/* VAS Optional (only relevant for INBOUND) */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#01323F]">VAS Optional</div>
                    <div className="text-xs text-[#505D7B]">Allow jobs to complete without VAS phase</div>
                  </div>
                  <button
                    onClick={() => editing && updateDraft(cfg.id, 'vasOptional', !draft.vasOptional)}
                    disabled={!editing}
                    className="disabled:opacity-50"
                  >
                    {display.vasOptional
                      ? <ToggleRight size={22} className="text-[#FF7D44]" />
                      : <ToggleLeft  size={22} className="text-[#505D7B]" />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── System Config ─────────────────────────────────────────────────────────────
function SystemConfig() {
  const [config, setConfig]   = useState(INIT_ERP)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved]     = useState(false)

  async function testConnection() {
    setTesting(true)
    toast.loading('Testing ERP connection...', { id: 'erp-test' })
    await new Promise(r => setTimeout(r, 1500))
    setTesting(false)
    toast.success('ERP connection successful (demo)', { id: 'erp-test' })
  }

  async function handleSave(e) {
    e.preventDefault()
    await new Promise(r => setTimeout(r, 400))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast.success('System config saved')
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-xl">
      <div className="bg-white rounded-xl border border-[#DDE8EC] p-5 space-y-4">
        <h3 className="font-semibold text-[#01323F]">ERP Integration</h3>
        <div>
          <label className="block text-xs font-semibold text-[#505D7B] mb-1">ERP API Base URL</label>
          <div className="flex gap-2">
            <input value={config.erpApiUrl} onChange={e => setConfig(c => ({ ...c, erpApiUrl: e.target.value }))}
              className="flex-1 px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]"
              placeholder="https://erp.example.ae/api/v2" />
            <button type="button" onClick={testConnection} disabled={testing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#07847F] border border-[#07847F] rounded-lg hover:bg-blue-50 disabled:opacity-60">
              <Link size={14} />
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#505D7B] mb-1">Labour Rate (AED / hr)</label>
          <input type="number" value={config.laborRateAed} onChange={e => setConfig(c => ({ ...c, laborRateAed: +e.target.value }))}
            min={1} max={500}
            className="w-32 px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]" />
          <p className="text-xs text-[#505D7B] mt-1">Used for labour cost calculations across all reports (default: AED 50/hr)</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-sm font-medium text-[#01323F]">Demo Mode</div>
            <div className="text-xs text-[#505D7B]">ERP calls are stubbed with mock responses</div>
          </div>
          <button type="button" onClick={() => setConfig(c => ({ ...c, demoMode: !c.demoMode }))}
            className="flex items-center">
            {config.demoMode
              ? <ToggleRight size={28} className="text-[#FF7D44]" />
              : <ToggleLeft  size={28} className="text-[#505D7B]" />}
          </button>
        </div>
      </div>

      <button type="submit"
        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${saved ? 'bg-[#2E7D32]' : 'bg-[#FF7D44] hover:bg-orange-600'}`}>
        {saved ? <><Check size={14} /> Saved!</> : 'Save Configuration'}
      </button>
    </form>
  )
}
