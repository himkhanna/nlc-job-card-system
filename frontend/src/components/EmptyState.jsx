import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'No data found', icon: Icon = Inbox, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', gap: 12,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: '#F4F6FA', border: '1px solid #E8ECF2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} color="#B0BEC5" />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: '#6B7A94', textAlign: 'center', maxWidth: 260 }}>
        {message}
      </p>
      {action}
    </div>
  )
}
