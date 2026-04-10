import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'

export default function DataTable({
  columns = [],   // [{ key, label, render, sortable, width }]
  rows = [],
  loading = false,
  pageSize = 20,
  onRowClick,
  emptyMessage = 'No records found',
}) {
  const [sortKey, setSortKey]   = useState(null)
  const [sortDir, setSortDir]   = useState('asc')
  const [page, setPage]         = useState(1)

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : rows

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #DDE8EC', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#F8F9FC', borderBottom: '1px solid #DDE8EC' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#505D7B',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        : <ChevronsUpDown size={13} color="#C0C8D8" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2F8FA' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '12px 16px' }}>
                      <LoadingSkeleton width="80%" height={14} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 40 }}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: i < paginated.length - 1 ? '1px solid #F2F8FA' : 'none',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = '#F8F9FC' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '12px 16px', fontSize: 13, color: '#01323F', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, fontSize: 13, color: '#505D7B' }}>
          <span>{sorted.length} records · Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  width: 30, height: 30, borderRadius: 7,
                  border: '1px solid ' + (page === i + 1 ? '#07847F' : '#DDE8EC'),
                  background: page === i + 1 ? '#07847F' : '#fff',
                  color: page === i + 1 ? '#fff' : '#01323F',
                  cursor: 'pointer', fontSize: 13, fontWeight: page === i + 1 ? 700 : 400,
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
