import { Check, Circle, Clock, SkipForward } from 'lucide-react'

const STATUS_CONFIG = {
  COMPLETED:   { icon: Check,        color: '#2E7D32', bg: '#E8F5E9', border: '#2E7D32' },
  IN_PROGRESS: { icon: Clock,        color: '#FF6B00', bg: '#FFF3E0', border: '#FF6B00' },
  SKIPPED:     { icon: SkipForward,  color: '#9E9E9E', bg: '#F5F5F5', border: '#E0E0E0' },
  PENDING:     { icon: Circle,       color: '#B0BEC5', bg: '#F4F6FA', border: '#E8ECF2' },
}

export default function PhaseTracker({ phases = [], currentPhase, phaseLogs = [] }) {
  function getPhaseStatus(phaseName) {
    const log = phaseLogs.find(l => l.phase_name === phaseName)
    if (log) return log.phase_status
    if (phaseName === currentPhase) return 'IN_PROGRESS'
    const currentIdx = phases.indexOf(currentPhase)
    const thisIdx    = phases.indexOf(phaseName)
    if (currentIdx > -1 && thisIdx < currentIdx) return 'COMPLETED'
    return 'PENDING'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {phases.map((phase, idx) => {
        const status = getPhaseStatus(phase)
        const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
        const Icon   = cfg.icon
        const isLast = idx === phases.length - 1

        return (
          <div key={phase} style={{ display: 'flex', gap: 14 }}>
            {/* Timeline column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, zIndex: 1,
              }}>
                <Icon size={15} color={cfg.color} />
              </div>
              {!isLast && (
                <div style={{
                  width: 2,
                  flex: 1,
                  minHeight: 24,
                  background: status === 'COMPLETED' ? '#2E7D32' : '#E8ECF2',
                  margin: '2px 0',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1, paddingTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: status === 'IN_PROGRESS' ? 700 : 500,
                  color: status === 'PENDING' || status === 'SKIPPED' ? '#9E9E9E' : '#1A2440',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {phase}
                </span>
                {status === 'IN_PROGRESS' && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#FF6B00',
                    background: '#FFF3E0', padding: '1px 7px', borderRadius: 20,
                  }}>ACTIVE</span>
                )}
                {status === 'SKIPPED' && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#9E9E9E',
                    background: '#F5F5F5', padding: '1px 7px', borderRadius: 20,
                  }}>SKIPPED</span>
                )}
              </div>
              {phaseLogs.find(l => l.phase_name === phase)?.completed_at && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7A94', fontFamily: 'DM Mono, monospace' }}>
                  Completed {new Date(phaseLogs.find(l => l.phase_name === phase).completed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
