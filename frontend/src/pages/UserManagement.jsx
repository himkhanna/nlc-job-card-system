import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, KeyRound, Eye, EyeOff, ShieldCheck, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { useUsers } from '../hooks/useApi'
import { settings as settingsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const ALL_WH = ['DXB-WH1', 'DXB-WH2', 'DXB-WH3', 'SHJ-WH1', 'ABU-WH1']

const ROLE_LABELS = {
  admin:      'Admin',
  supervisor: 'Supervisor',
  tally_user: 'Tally User',
  viewer:     'Viewer',
}

const ROLE_DESC = {
  admin:      'Full access including Settings and all warehouses',
  supervisor: 'Job creation, worker clock-in/out, phase completion — scoped to assigned warehouses',
  tally_user: 'Specialist — can only action the Tally phase on assigned jobs',
  viewer:     'Read-only access to dashboard and job status',
}

// Demo fallback when API is unavailable
const DEMO_USERS = [
  { id: 'u1', email: 'admin@nlc.demo',      name: 'Admin User',      role: 'admin',      assignedWarehouseIds: [],          isActive: true  },
  { id: 'u2', email: 'supervisor@nlc.demo', name: 'Supervisor User', role: 'supervisor', assignedWarehouseIds: ['wh1','wh2'], isActive: true  },
]

function WarehousPills({ whIds, role }) {
  if (role === 'admin') return <span className="text-xs text-[#2E7D32] font-medium">All warehouses</span>
  if (!whIds?.length)   return <span className="text-xs text-[#6B7A94]">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {whIds.map(id => (
        <span key={id} className="px-1.5 py-0.5 text-xs rounded bg-[#E3F0FF] text-[#1565C0] font-medium font-mono">{id}</span>
      ))}
    </div>
  )
}

export default function UserManagement() {
  const { user: me }  = useAuth()
  const qc            = useQueryClient()
  const { data, isLoading, isError } = useUsers()

  const users = isError || !data ? DEMO_USERS : (data ?? [])

  const [showAdd,   setShowAdd]   = useState(false)
  const [editUser,  setEditUser]  = useState(null)  // user being edited
  const [resetUser, setResetUser] = useState(null)  // user for pw reset
  const [saving,    setSaving]    = useState(false)

  // ── Add user form ─────────────────────────────────────────────────────────
  const blankAdd = { email: '', name: '', password: '', role: 'supervisor', assignedWarehouseIds: [] }
  const [addForm, setAddForm]   = useState(blankAdd)
  const [showPw,  setShowPw]    = useState(false)

  // ── Edit user form ────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState(null)

  // ── Reset pw form ─────────────────────────────────────────────────────────
  const [newPw,    setNewPw]    = useState('')
  const [showNewPw, setShowNewPw] = useState(false)

  function openEdit(u) {
    setEditForm({ role: u.role, name: u.name, assignedWarehouseIds: [...(u.assignedWarehouseIds ?? [])] })
    setEditUser(u)
  }

  function toggleWh(form, setForm, wh) {
    setForm(f => ({
      ...f,
      assignedWarehouseIds: f.assignedWarehouseIds.includes(wh)
        ? f.assignedWarehouseIds.filter(w => w !== wh)
        : [...f.assignedWarehouseIds, wh],
    }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!addForm.email || !addForm.name || !addForm.password) return
    setSaving(true)
    try {
      await settingsApi.users.create(addForm)
      toast.success(`User ${addForm.name} created`)
      qc.invalidateQueries({ queryKey: ['settings', 'users'] })
      setShowAdd(false)
      setAddForm(blankAdd)
    } catch (err) {
      toast.error(err.message ?? 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsApi.users.update(editUser.id, editForm)
      toast.success('User updated')
      qc.invalidateQueries({ queryKey: ['settings', 'users'] })
      setEditUser(null)
    } catch (err) {
      toast.error(err.message ?? 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(u) {
    if (u.id === me?.id) { toast.error('You cannot deactivate your own account'); return }
    try {
      await settingsApi.users.update(u.id, { isActive: !u.isActive })
      toast.success(u.isActive ? `${u.name} deactivated` : `${u.name} activated`)
      qc.invalidateQueries({ queryKey: ['settings', 'users'] })
    } catch (err) {
      toast.error(err.message ?? 'Failed to update user')
    }
  }

  async function handleResetPw(e) {
    e.preventDefault()
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await settingsApi.users.update(resetUser.id, { password: newPw })
      toast.success(`Password reset for ${resetUser.name}`)
      setResetUser(null)
      setNewPw('')
    } catch (err) {
      toast.error(err.message ?? 'Failed to reset password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A2440]">Users &amp; Roles</h2>
          <p className="text-sm text-[#6B7A94] mt-0.5">
            Manage system access. Supervisors and Tally Users are scoped to assigned warehouses.
            {isError && <span className="text-[#F57F17] ml-2">· Demo data (API unavailable)</span>}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Role reference cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-xl border border-[#E8ECF2] p-4">
            <div className="mb-2"><Badge variant={key} /></div>
            <p className="text-xs text-[#6B7A94] leading-relaxed">{ROLE_DESC[key]}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-[#E8ECF2] overflow-hidden">
        {isLoading ? (
          <div className="p-6"><LoadingSkeleton height={200} /></div>
        ) : users.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F6FA] text-xs font-semibold text-[#6B7A94] uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Warehouses</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF2]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#F4F6FA]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1A2440]">
                      {u.name}
                      {u.id === me?.id && <span className="ml-1.5 text-xs text-[#6B7A94] font-normal">(You)</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-[#6B7A94]">{u.email}</td>
                  <td className="px-5 py-3"><Badge variant={u.role} /></td>
                  <td className="px-5 py-3">
                    <WarehousPills whIds={u.assignedWarehouseIds} role={u.role} />
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F4F6FA] text-[#6B7A94]'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)}
                        className="flex items-center gap-1 text-xs font-medium text-[#1565C0] hover:underline">
                        <Edit2 size={12} /> Edit
                      </button>
                      <span className="text-[#E8ECF2]">|</span>
                      <button onClick={() => { setResetUser(u); setNewPw('') }}
                        className="flex items-center gap-1 text-xs font-medium text-[#6B7A94] hover:text-[#1A2440] hover:underline">
                        <KeyRound size={12} /> Reset PW
                      </button>
                      <span className="text-[#E8ECF2]">|</span>
                      <button onClick={() => handleToggleActive(u)}
                        disabled={u.id === me?.id}
                        className={`flex items-center gap-1 text-xs font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isActive ? 'text-[#C62828]' : 'text-[#2E7D32]'}`}>
                        {u.isActive ? <><ShieldOff size={12} /> Deactivate</> : <><ShieldCheck size={12} /> Activate</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add User Modal ──────────────────────────────────────────────────── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User" size="md"
        footer={
          <>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm font-medium text-[#6B7A94] border border-[#E8ECF2] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button form="add-user-form" type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF6B00] rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors">
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </>
        }>
        <form id="add-user-form" onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Full Name *</label>
              <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                required placeholder="e.g. Rajan Pillai"
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Email *</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="user@nlc.ae"
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Temporary Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={addForm.password}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                required minLength={8} placeholder="Min 8 characters"
                className="w-full px-3 py-2 pr-10 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A94]">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Role *</label>
            <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value, assignedWarehouseIds: [] }))}
              className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0] bg-white">
              <option value="admin">Admin — Full access</option>
              <option value="supervisor">Supervisor — Warehouse scoped</option>
              <option value="tally_user">Tally User — Tally phase only</option>
              <option value="viewer">Viewer — Read only</option>
            </select>
          </div>
          {addForm.role !== 'admin' && (
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-2">
                Assigned Warehouses
                {(addForm.role === 'supervisor' || addForm.role === 'tally_user') && ' *'}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_WH.map(wh => (
                  <button key={wh} type="button"
                    onClick={() => toggleWh(addForm, setAddForm, wh)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors font-mono ${
                      addForm.assignedWarehouseIds.includes(wh)
                        ? 'bg-[#0B1D3A] text-white border-[#0B1D3A]'
                        : 'text-[#6B7A94] border-[#E8ECF2] hover:border-[#0B1D3A] hover:text-[#0B1D3A]'}`}>
                    {wh}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Edit User Modal ─────────────────────────────────────────────────── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit User — ${editUser?.name}`} size="md"
        footer={
          <>
            <button type="button" onClick={() => setEditUser(null)}
              className="px-4 py-2 text-sm font-medium text-[#6B7A94] border border-[#E8ECF2] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button form="edit-user-form" type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#1565C0] rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }>
        {editForm && (
          <form id="edit-user-form" onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Full Name</label>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7A94] mb-1">Role</label>
              <select value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value, assignedWarehouseIds: [] }))}
                disabled={editUser?.id === me?.id}
                className="w-full px-3 py-2 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#1565C0] bg-white disabled:bg-[#F4F6FA] disabled:text-[#6B7A94]">
                <option value="admin">Admin — Full access</option>
                <option value="supervisor">Supervisor — Warehouse scoped</option>
                <option value="tally_user">Tally User — Tally phase only</option>
                <option value="viewer">Viewer — Read only</option>
              </select>
              {editUser?.id === me?.id && (
                <p className="text-xs text-[#F57F17] mt-1">You cannot change your own role.</p>
              )}
            </div>
            {editForm.role !== 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-[#6B7A94] mb-2">Assigned Warehouses</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_WH.map(wh => (
                    <button key={wh} type="button"
                      onClick={() => toggleWh(editForm, setEditForm, wh)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors font-mono ${
                        editForm.assignedWarehouseIds.includes(wh)
                          ? 'bg-[#0B1D3A] text-white border-[#0B1D3A]'
                          : 'text-[#6B7A94] border-[#E8ECF2] hover:border-[#0B1D3A] hover:text-[#0B1D3A]'}`}>
                      {wh}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>

      {/* ── Reset Password Modal ────────────────────────────────────────────── */}
      <Modal open={!!resetUser} onClose={() => setResetUser(null)} title={`Reset Password — ${resetUser?.name}`} size="sm"
        footer={
          <>
            <button type="button" onClick={() => setResetUser(null)}
              className="px-4 py-2 text-sm font-medium text-[#6B7A94] border border-[#E8ECF2] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button form="reset-pw-form" type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#C62828] rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
              {saving ? 'Resetting…' : 'Reset Password'}
            </button>
          </>
        }>
        <form id="reset-pw-form" onSubmit={handleResetPw} className="space-y-4">
          <p className="text-sm text-[#6B7A94]">
            Set a new temporary password for <strong className="text-[#1A2440]">{resetUser?.email}</strong>. The user should change it on next login.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#6B7A94] mb-1">New Password *</label>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required minLength={8} placeholder="Min 8 characters"
                className="w-full px-3 py-2 pr-10 border border-[#E8ECF2] rounded-lg text-sm focus:outline-none focus:border-[#C62828]" />
              <button type="button" onClick={() => setShowNewPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A94]">
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
