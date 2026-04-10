import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * On desktop: centered dialog with max-width.
 * On mobile (< 768px): full-width bottom sheet that slides up.
 */
export default function Modal({ open, onClose, title, children, width = 520, footer, size }) {
  const maxW = size === 'lg' ? 640 : size === 'sm' ? 400 : width

  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(11,29,58,0.5)',
        display: 'flex',
        fontFamily: 'Roboto, sans-serif',
        // Desktop: center; Mobile: bottom
        alignItems: window.innerWidth < 768 ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: window.innerWidth < 768 ? 0 : 16,
      }}
    >
      <div style={{
        background: '#fff',
        boxShadow: '0 8px 32px rgba(11,29,58,0.18)',
        width: '100%',
        maxWidth: maxW,
        // Mobile: full width, rounded top corners, max 92vh
        // Desktop: rounded all corners, max 90vh
        borderRadius: window.innerWidth < 768 ? '16px 16px 0 0' : 14,
        maxHeight: window.innerWidth < 768 ? '92svh' : '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drag handle — mobile only */}
        {window.innerWidth < 768 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDE8EC' }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #DDE8EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#01323F' }}>{title}</h3>
          <button onClick={onClose}
            style={{
              background: '#F2F8FA', border: '1px solid #DDE8EC',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
            <X size={15} color="#505D7B" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #DDE8EC',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
