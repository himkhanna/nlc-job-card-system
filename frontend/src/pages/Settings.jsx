import { useState } from 'react'
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Link, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import DemoModeBanner from '../components/DemoModeBanner'
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
      <DemoModeBanner />

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F4F6FA] rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-[#1A2440] shadow-sm' : 'text-[#6B7A94] hover:text-[#1A2440]'}`}>
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
        <p className="text-sm text-[#6B7A94]">{warehouses.length} warehouses configured</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 transition-colors">
          <Plus size={14} /> Add Warehouse
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E8ECF2] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F6FA] text-xs font-semibold text-[#6B7A94] uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8ECF2]">
            {warehouses.map(wh => (
              <tr key={wh.id} className="hover:bg-[#F4F6FA]/50 transition-colors">
                <td className="px-5 py-3">
                  {editing?.id === wh.id
                    ? <input value={editing.name} onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                        className="px-2 py-1 border border-[#1565C0] rounded text-sm w-24 focus:outline-none" />
                    : <span className="font-mono font-semibold text-[#1A2440]">{wh.name}</span>}
                </td>
                <td className="px-5 py-3">
                  {editing?.id === wh.id
                    ? <input value={editing.location} onChange={e => setEditing(ed => ({ ...ed, location: e.target.value }))}
                        className="px-2 py-1 border border-[#1565C0] rounded text-sm w-52 focus:outline-none" />
                    : <span className="text-[#6B7A94]">{wh.location}</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${wh.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F4F6FA] text-[#6B7A94]'}`}>
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
                        <button onClick={() => startEdit(wh)} className="text-[#1565C0] hover:text-blue-800"><Edit2 size={14} /></button>
                        <button onClick={() => toggleActive(wh.id)} className="text-xs text-[#6B7A94] hover:underline">
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
            <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Warehouse Code *</label>
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1565C0]"
              placeholder="e.g. DXB-WH4" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Location *</label>
            <input value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]"
              placeholder="e.g. Deira, Dubai" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm font-medium text-[#6B7A94] border border-[#E8ECF2] rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 transition-colors">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Job Type Config ────────────────────────────────────────────────────────────
function JobTypeConfigTab() {
  const [configs, setConfigs] = useState(INIT_CONFIGS)

  function toggleActive(id) {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#FFF8E1] border border-[#FFF176] rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#F57F17] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#795548]">
          Job type phase sequences are applied when creating new job cards. Changing phases here does <strong>not</strong> affect in-progress jobs (they use a snapshot).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {configs.map(cfg => (
          <div key={cfg.id} className="bg-white rounded-xl border border-[#E8ECF2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1A2440]">{cfg.name}</div>
                <div className="text-xs text-[#6B7A94]">{cfg.phases.length} phases</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F4F6FA] text-[#6B7A94]'}`}>
                  {cfg.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => toggleActive(cfg.id)} className="text-[#6B7A94] hover:text-[#1A2440]">
                  {cfg.isActive ? <ToggleRight size={20} className="text-[#2E7D32]" /> : <ToggleLeft size={20} />}
                </button>
              </div>
            </div>

            {/* Phase sequence */}
            <div className="space-y-1">
              {cfg.phases.map((phase, i) => (
                <div key={phase} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#F4F6FA] flex items-center justify-center text-xs font-bold text-[#6B7A94]">{i + 1}</div>
                  <span className={`flex-1 ${phase === cfg.grnTriggerPhase ? 'text-[#2E7D32] font-semibold' : phase === 'VAS' && cfg.vasOptional ? 'text-[#F57F17]' : 'text-[#1A2440]'}`}>
                    {phase}
                  </span>
                  {phase === cfg.grnTriggerPhase && <span className="text-xs text-[#2E7D32] font-medium">GRN trigger</span>}
                  {phase === 'VAS' && cfg.vasOptional && <span className="text-xs text-[#F57F17] font-medium">Optional</span>}
                  {phase === cfg.erpPushPhase && <span className="text-xs text-[#1565C0] font-medium">ERP push</span>}
                </div>
              ))}
            </div>

            <div className="text-xs text-[#6B7A94] space-y-0.5">
              <div>GRN trigger: <span className="font-mono text-[#1A2440]">{cfg.grnTriggerPhase ?? '—'}</span></div>
              <div>ERP push: <span className="font-mono text-[#1A2440]">{cfg.erpPushPhase ?? '—'}</span></div>
              <div>VAS optional: <span className="font-mono text-[#1A2440]">{cfg.vasOptional ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        ))}
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
      <div className="bg-white rounded-xl border border-[#E8ECF2] p-5 space-y-4">
        <h3 className="font-semibold text-[#1A2440]">ERP Integration</h3>
        <div>
          <label className="block text-xs font-semibold text-[#6B7A94] mb-1">ERP API Base URL</label>
          <div className="flex gap-2">
            <input value={config.erpApiUrl} onChange={e => setConfig(c => ({ ...c, erpApiUrl: e.target.value }))}
              className="flex-1 px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1565C0]"
              placeholder="https://erp.example.ae/api/v2" />
            <button type="button" onClick={testConnection} disabled={testing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1565C0] border border-[#1565C0] rounded-lg hover:bg-blue-50 disabled:opacity-60">
              <Link size={14} />
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Labour Rate (AED / hr)</label>
          <input type="number" value={config.laborRateAed} onChange={e => setConfig(c => ({ ...c, laborRateAed: +e.target.value }))}
            min={1} max={500}
            className="w-32 px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1565C0]" />
          <p className="text-xs text-[#6B7A94] mt-1">Used for labour cost calculations across all reports (default: AED 50/hr)</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-sm font-medium text-[#1A2440]">Demo Mode</div>
            <div className="text-xs text-[#6B7A94]">ERP calls are stubbed with mock responses</div>
          </div>
          <button type="button" onClick={() => setConfig(c => ({ ...c, demoMode: !c.demoMode }))}
            className="flex items-center">
            {config.demoMode
              ? <ToggleRight size={28} className="text-[#FF6B00]" />
              : <ToggleLeft  size={28} className="text-[#6B7A94]" />}
          </button>
        </div>
      </div>

      <button type="submit"
        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${saved ? 'bg-[#2E7D32]' : 'bg-[#FF6B00] hover:bg-orange-600'}`}>
        {saved ? <><Check size={14} /> Saved!</> : 'Save Configuration'}
      </button>
    </form>
  )
}
