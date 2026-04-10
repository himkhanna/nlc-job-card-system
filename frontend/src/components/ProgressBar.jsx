export default function ProgressBar({ percent = 0, color = '#07847F', height = 6, showLabel = false }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const barColor = clamped === 100 ? '#2E7D32' : clamped > 60 ? color : clamped > 30 ? '#FF7D44' : color

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height,
        background: '#DDE8EC',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${clamped}%`,
          background: barColor,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 600, color: '#505D7B', fontFamily: 'DM Mono, monospace', minWidth: 32, textAlign: 'right' }}>
          {clamped}%
        </span>
      )}
    </div>
  )
}
