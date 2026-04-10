import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, RefreshCw, Clock, Package, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import WarehouseBadge from '../components/WarehouseBadge'

// ── Demo data ─────────────────────────────────────────────────────────────────
const TODAY = new Date('2026-03-28')

const DEMO_SLOTS = [
  { id: '1', warehouseId: '11111111-0000-0000-0000-000000000001', warehouseName: 'DXB-WH1', slotDate: '2026-03-28', slotTime: '08:00', jobType: 'INBOUND',  containerNumber: 'TCKU3450671', asnNumber: 'ASN-10482', customerName: 'Al Futtaim',  driverName: 'Mohammed Ali',   status: 'ARRIVED',     shipmentDescription: '40HC Container — General Cargo' },
  { id: '2', warehouseId: '11111111-0000-0000-0000-000000000001', warehouseName: 'DXB-WH1', slotDate: '2026-03-28', slotTime: '10:30', jobType: 'INBOUND',  containerNumber: 'MSCU7821033', asnNumber: 'ASN-10481', customerName: 'ENOC',        driverName: 'Ravi Kumar',     status: 'CONFIRMED',   shipmentDescription: '20FT Dry Container' },
  { id: '3', warehouseId: '11111111-0000-0000-0000-000000000002', warehouseName: 'DXB-WH2', slotDate: '2026-03-28', slotTime: '09:00', jobType: 'OUTBOUND', containerNumber: null,          asnNumber: null,         customerName: 'Carrefour',   driverName: 'Suresh Pillai',  status: 'JOB_CREATED', shipmentDescription: 'Dispatch — 2 DNs' },
  { id: '4', warehouseId: '11111111-0000-0000-0000-000000000001', warehouseName: 'DXB-WH1', slotDate: '2026-03-29', slotTime: '07:30', jobType: 'INBOUND',  containerNumber: 'CMAU6710034', asnNumber: 'ASN-10478', customerName: 'IKEA UAE',    driverName: 'Ahmed Hassan',   status: 'PLANNED',     shipmentDescription: '40HC — Furniture Parts' },
  { id: '5', warehouseId: '11111111-0000-0000-0000-000000000003', warehouseName: 'SHJ-WH1', slotDate: '2026-03-29', slotTime: '11:00', jobType: 'OUTBOUND', containerNumber: null,          asnNumber: null,         customerName: 'Spinneys',    driverName: 'Joji Thomas',    status: 'PLANNED',     shipmentDescription: 'Chilled Dispatch' },
  { id: '6', warehouseId: '11111111-0000-0000-0000-000000000005', warehouseName: 'DXB-WH3', slotDate: '2026-03-30', slotTime: '08:00', jobType: 'INBOUND',  containerNumber: 'CAIU8830021', asnNumber: 'ASN-10479', customerName: 'Lulu Group',  driverName: 'Santhosh Nair',  status: 'PLANNED',     shipmentDescription: 'General Cargo — Reactivated' },
  { id: '7', warehouseId: '11111111-0000-0000-0000-000000000004', warehouseName: 'ABU-WH1', slotDate: '2026-03-31', slotTime: '14:00', jobType: 'INBOUND',  containerNumber: 'TGHU9200110', asnNumber: 'ASN-10490', customerName: 'Amazon UAE',  driverName: 'Deepu Varghese', status: 'PLANNED',     shipmentDescription: '20FT — Electronics' },
]

const STATUS_COLORS = {
  PLANNED:     'bg-blue-50 border-l-4 border-blue-400',
  CONFIRMED:   'bg-yellow-50 border-l-4 border-yellow-400',
  ARRIVED:     'bg-orange-50 border-l-4 border-orange-400',
  JOB_CREATED: 'bg-green-50 border-l-4 border-green-400',
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function fmtDate(d) { return d.toISOString().slice(0, 10) }
function dayLabel(d) { return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) }

const WAREHOUSES = [
  { id: '11111111-0000-0000-0000-000000000001', name: 'DXB-WH1' },
  { id: '11111111-0000-0000-0000-000000000002', name: 'DXB-WH2' },
  { id: '11111111-0000-0000-0000-000000000003', name: 'SHJ-WH1' },
  { id: '11111111-0000-0000-0000-000000000004', name: 'ABU-WH1' },
  { id: '11111111-0000-0000-0000-000000000005', name: 'DXB-WH3' },
]

const EMPTY_FORM = {
  warehouseId: '11111111-0000-0000-0000-000000000001',
  slotDate: fmtDate(TODAY),
  slotTime: '09:00',
  jobType: 'INBOUND',
  containerNumber: '',
  asnNumber: '',
  orderNumber: '',
  customerName: '',
  driverName: '',
  shipmentDescription: '',
}

export default function PlanningCalendar() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Monday
    return d
  })
  const [slots, setSlots]        = useState(DEMO_SLOTS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]          = useState(EMPTY_FORM)
  const [syncing, setSyncing]    = useState(false)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, 7)) }
  function goToday() {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    setWeekStart(d)
  }

  function slotsForDay(d) {
    return slots.filter(s => s.slotDate === fmtDate(d)).sort((a, b) => a.slotTime.localeCompare(b.slotTime))
  }

  async function handleErpSync() {
    setSyncing(true)
    toast.loading('Syncing with ERP...', { id: 'erp-sync' })
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    toast.success('ERP sync complete — 2 new slots imported', { id: 'erp-sync' })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const wh = WAREHOUSES.find(w => w.id === form.warehouseId)
    setSlots(prev => [...prev, {
      id: Date.now().toString(),
      warehouseId: form.warehouseId,
      warehouseName: wh?.name ?? '',
      slotDate: form.slotDate,
      slotTime: form.slotTime,
      jobType: form.jobType,
      containerNumber: form.containerNumber || null,
      asnNumber: form.asnNumber || null,
      orderNumber: form.orderNumber || null,
      customerName: form.customerName,
      driverName: form.driverName || null,
      shipmentDescription: form.shipmentDescription || null,
      status: 'PLANNED',
    }])
    setShowModal(false)
    setForm(EMPTY_FORM)
    toast.success('Planning slot created')
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-lg border border-[#DDE8EC] bg-white hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-[#01323F] min-w-[220px] text-center">
            {dayLabel(days[0])} — {dayLabel(days[6])}
          </span>
          <button onClick={nextWeek} className="p-2 rounded-lg border border-[#DDE8EC] bg-white hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium text-[#505D7B] border border-[#DDE8EC] bg-white rounded-lg hover:bg-gray-50">
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleErpSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#07847F] border border-[#07847F] bg-white rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            Sync ERP
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors">
            <Plus size={14} /> New Slot
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-[#505D7B]">
        {[['#3B82F6','Planned'],['#F59E0B','Confirmed'],['#FF7D44','Arrived'],['#2E7D32','Job Created']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr   = fmtDate(day)
          const isToday   = dateStr === fmtDate(TODAY)
          const daySlots  = slotsForDay(day)
          return (
            <div key={dateStr} className={`min-h-[180px] rounded-xl border p-2 ${isToday ? 'border-[#FF7D44] bg-orange-50/30' : 'border-[#DDE8EC] bg-white'}`}>
              <div className={`text-xs font-semibold mb-2 ${isToday ? 'text-[#FF7D44]' : 'text-[#505D7B]'}`}>
                {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                <div className={`text-lg leading-tight ${isToday ? 'text-[#FF7D44]' : 'text-[#01323F]'}`}>{day.getDate()}</div>
              </div>
              <div className="space-y-1.5">
                {daySlots.map(slot => (
                  <div key={slot.id} className={`rounded-md p-1.5 text-xs cursor-pointer hover:opacity-80 ${STATUS_COLORS[slot.status] ?? 'bg-gray-50 border-l-4 border-gray-300'}`}>
                    <div className="font-mono font-bold text-[#01323F]">{slot.slotTime}</div>
                    <div className="font-medium text-[#01323F] truncate">{slot.customerName}</div>
                    <div className="text-[#505D7B] truncate text-[10px]">{slot.shipmentDescription}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {slot.jobType === 'INBOUND'
                        ? <Package size={10} className="text-[#45C9C3]" />
                        : <Truck    size={10} className="text-[#07847F]" />}
                      <span className="text-[10px] text-[#505D7B]">{slot.warehouseName}</span>
                    </div>
                  </div>
                ))}
                {daySlots.length === 0 && (
                  <div className="text-[10px] text-[#505D7B] text-center py-6 opacity-40">—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Week list table */}
      <div className="bg-white rounded-xl border border-[#DDE8EC] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#DDE8EC]">
          <h3 className="font-semibold text-[#01323F]">This Week — All Slots</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F2F8FA] text-xs font-semibold text-[#505D7B] uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Date / Time</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Warehouse</th>
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Driver</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8EC]">
              {slots
                .filter(s => s.slotDate >= fmtDate(days[0]) && s.slotDate <= fmtDate(days[6]))
                .sort((a, b) => `${a.slotDate}${a.slotTime}`.localeCompare(`${b.slotDate}${b.slotTime}`))
                .map(slot => (
                  <tr key={slot.id} className="hover:bg-[#F2F8FA]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs text-[#01323F]">{slot.slotDate}</div>
                      <div className="font-mono text-xs text-[#505D7B] flex items-center gap-1">
                        <Clock size={10} />{slot.slotTime}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-[#01323F]">{slot.customerName}</td>
                    <td className="px-5 py-3"><Badge variant={slot.jobType} /></td>
                    <td className="px-5 py-3"><WarehouseBadge name={slot.warehouseName} /></td>
                    <td className="px-5 py-3 font-mono text-xs text-[#505D7B]">
                      {slot.containerNumber || slot.asnNumber || '—'}
                    </td>
                    <td className="px-5 py-3 text-[#505D7B] text-sm">{slot.driverName || '—'}</td>
                    <td className="px-5 py-3"><Badge variant={slot.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Slot Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Planning Slot" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Warehouse *</label>
              <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]">
                {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Job Type *</label>
              <select value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]">
                <option value="INBOUND">INBOUND</option>
                <option value="OUTBOUND">OUTBOUND</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Date *</label>
              <input type="date" value={form.slotDate} onChange={e => setForm(f => ({ ...f, slotDate: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Time *</label>
              <input type="time" value={form.slotTime} onChange={e => setForm(f => ({ ...f, slotTime: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Customer Name *</label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
                placeholder="e.g. Al Futtaim" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Driver Name</label>
              <input value={form.driverName} onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
                placeholder="Optional" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">
                {form.jobType === 'INBOUND' ? 'Container Number' : 'Order Number'}
              </label>
              <input
                value={form.jobType === 'INBOUND' ? form.containerNumber : form.orderNumber}
                onChange={e => setForm(f => form.jobType === 'INBOUND'
                  ? { ...f, containerNumber: e.target.value }
                  : { ...f, orderNumber: e.target.value })}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]"
                placeholder="Optional" />
            </div>
            {form.jobType === 'INBOUND' && (
              <div>
                <label className="block text-xs font-semibold text-[#505D7B] mb-1">ASN Number</label>
                <input value={form.asnNumber} onChange={e => setForm(f => ({ ...f, asnNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm font-mono focus:outline-none focus:border-[#07847F]"
                  placeholder="Optional" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#505D7B] mb-1">Shipment Description</label>
            <input value={form.shipmentDescription} onChange={e => setForm(f => ({ ...f, shipmentDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]"
              placeholder="e.g. 40HC Container — General Cargo" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#505D7B] border border-[#DDE8EC] rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF7D44] rounded-lg hover:bg-orange-600 transition-colors">
              Create Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
