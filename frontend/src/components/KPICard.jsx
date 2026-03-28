export default function KPICard({ label, value, icon: Icon, color = '#1565C0', subtext, trend }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8ECF2',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      boxShadow: '0 1px 4px rgba(11,29,58,0.05)',
    }}>
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: color + '18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon && <Icon size={22} color={color} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1A2440', fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {subtext && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7A94', fontFamily: 'DM Sans, sans-serif' }}>
            {subtext}
          </p>
        )}
      </div>

      {/* Trend badge */}
      {trend !== undefined && (
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: trend >= 0 ? '#2E7D32' : '#C62828',
          background: trend >= 0 ? '#E8F5E9' : '#FFEBEE',
          padding: '2px 7px',
          borderRadius: 20,
          flexShrink: 0,
          alignSelf: 'flex-start',
          marginTop: 2,
        }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  )
}
