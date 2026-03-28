import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const WarehouseContext = createContext(null)

export const ALL_WAREHOUSES = [
  { id: '11111111-0000-0000-0000-000000000001', name: 'DXB-WH1', location: 'Jebel Ali, Dubai' },
  { id: '11111111-0000-0000-0000-000000000002', name: 'DXB-WH2', location: 'Al Quoz, Dubai' },
  { id: '11111111-0000-0000-0000-000000000003', name: 'SHJ-WH1', location: 'Sharjah Industrial Area' },
  { id: '11111111-0000-0000-0000-000000000004', name: 'ABU-WH1', location: 'Mussafah, Abu Dhabi' },
  { id: '11111111-0000-0000-0000-000000000005', name: 'DXB-WH3', location: 'Dubai Investments Park' },
]

export function WarehouseProvider({ children }) {
  const { user, isAdmin } = useAuth()
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null)

  // Warehouses this user can see
  const accessibleWarehouses = isAdmin
    ? ALL_WAREHOUSES
    : ALL_WAREHOUSES.filter(w => user?.warehouses?.includes(w.id))

  const selectWarehouse = useCallback((id) => {
    setSelectedWarehouseId(id)
  }, [])

  // The active filter value to pass to API calls
  // null = "all accessible warehouses"
  const activeWarehouseId = selectedWarehouseId

  const selectedWarehouse = activeWarehouseId
    ? ALL_WAREHOUSES.find(w => w.id === activeWarehouseId) ?? null
    : null

  return (
    <WarehouseContext.Provider value={{
      warehouses: accessibleWarehouses,
      allWarehouses: ALL_WAREHOUSES,
      selectedWarehouseId: activeWarehouseId,
      selectedWarehouse,
      selectWarehouse,
    }}>
      {children}
    </WarehouseContext.Provider>
  )
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext)
  if (!ctx) throw new Error('useWarehouse must be used within WarehouseProvider')
  return ctx
}
