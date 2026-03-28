const WH_COLORS = {
  'DXB-WH1': { bg: '#E3F0FF', color: '#1565C0' },
  'DXB-WH2': { bg: '#EDE7F6', color: '#4527A0' },
  'DXB-WH3': { bg: '#E0F7FA', color: '#00695C' },
  'SHJ-WH1': { bg: '#FFF3E0', color: '#E65100' },
  'ABU-WH1': { bg: '#E8F5E9', color: '#2E7D32' },
}

export default function WarehouseBadge({ name }) {
  const c = WH_COLORS[name] || { bg: '#F4F6FA', color: '#6B7A94' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      fontFamily: 'DM Mono, monospace',
      letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  )
}
