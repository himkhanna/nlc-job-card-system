import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'

export default function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div style={{
      background: '#FFF8E1',
      borderBottom: '1px solid #FFE082',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'Roboto, sans-serif',
      fontSize: 13,
      color: '#5D4037',
      flexShrink: 0,
    }}>
      <FlaskConical size={15} color="#F57F17" style={{ flexShrink: 0 }} />
      <span>
        <strong>DEMO MODE</strong> — All data is simulated. ERP calls are stubs.
        Credentials: <code style={{ fontFamily: 'DM Mono, monospace', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>admin@nlc.demo</code> / <code style={{ fontFamily: 'DM Mono, monospace', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>NLC@demo2025</code>
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
      >
        <X size={15} color="#9E6B00" />
      </button>
    </div>
  )
}
