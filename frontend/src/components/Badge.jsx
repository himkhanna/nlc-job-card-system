const VARIANTS = {
  // Job status
  PLANNED:      { bg: '#E3F0FF', color: '#1565C0' },
  IN_PROGRESS:  { bg: '#E8F5E9', color: '#2E7D32' },
  COMPLETED:    { bg: '#E8F5E9', color: '#1B5E20' },
  REACTIVATED:  { bg: '#FFF8E1', color: '#F57F17' },
  // Priority
  NORMAL:       { bg: '#F4F6FA', color: '#6B7A94' },
  HIGH:         { bg: '#FFF3E0', color: '#E65100' },
  URGENT:       { bg: '#FFEBEE', color: '#C62828' },
  // Job type
  INBOUND:      { bg: '#E0F7FA', color: '#00838F' },
  OUTBOUND:     { bg: '#EDE7F6', color: '#4527A0' },
  // Phase status
  PENDING:      { bg: '#F4F6FA', color: '#6B7A94' },
  SKIPPED:      { bg: '#F5F5F5', color: '#9E9E9E' },
  // Worker type
  PERMANENT:    { bg: '#E8F5E9', color: '#2E7D32' },
  CONTRACT:     { bg: '#E3F0FF', color: '#1565C0' },
  AD_HOC:       { bg: '#FFF8E1', color: '#F57F17' },
  // Dispatch
  TALLIED:      { bg: '#E0F7FA', color: '#00695C' },
  LOADED:       { bg: '#E8EAF6', color: '#283593' },
  DISPATCHED:   { bg: '#E8F5E9', color: '#2E7D32' },
  // ERP sync
  SUCCESS:      { bg: '#E8F5E9', color: '#2E7D32' },
  FAILED:       { bg: '#FFEBEE', color: '#C62828' },
  // Generic
  default:      { bg: '#F4F6FA', color: '#6B7A94' },
}

export default function Badge({ label, variant, size = 'md' }) {
  const v = VARIANTS[variant] || VARIANTS[label?.toUpperCase()] || VARIANTS.default
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11
  const padding  = size === 'sm' ? '1px 6px' : size === 'lg' ? '4px 12px' : '2px 8px'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: v.bg,
      color: v.color,
      fontSize,
      fontWeight: 600,
      fontFamily: 'DM Sans, sans-serif',
      padding,
      borderRadius: 20,
      whiteSpace: 'nowrap',
      letterSpacing: '0.3px',
    }}>
      {label ?? variant}
    </span>
  )
}
