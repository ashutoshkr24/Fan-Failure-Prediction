interface Props {
  activePage: string
  onNavigate: (page: string) => void
  alertCount: number
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'sensors',   label: 'Live sensors', icon: '〜' },
  { id: 'alerts',    label: 'Alerts', icon: '🔔', badge: true },
  { id: 'trends',    label: 'Trends', icon: '↗' },
  { id: 'models',    label: 'ML models', icon: '⬡' },
  { id: 'reports',   label: 'Reports', icon: '📄' },
]

export function Sidebar({ activePage, onNavigate, alertCount }: Props) {
  return (
    <div style={{
      width: 220,
      background: '#fff',
      borderRight: '0.5px solid rgba(0,0,0,0.08)',
      padding: '1.25rem 0',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#222' }}>⟳ FanGuard AI</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Predictive Maintenance</div>
      </div>

      {NAV.map(item => {
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 18px',
              margin: '1px 8px',
              borderRadius: 7,
              cursor: 'pointer',
              fontSize: 13,
              border: 'none',
              background: active ? '#E6F1FB' : 'transparent',
              color: active ? '#185FA5' : '#666',
              fontWeight: active ? 500 : 400,
              textAlign: 'left',
              width: 'calc(100% - 16px)',
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && alertCount > 0 && (
              <span style={{ background: '#E24B4A', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 500 }}>
                {alertCount}
              </span>
            )}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0.875rem 1.25rem', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 11, color: '#aaa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#639922', display: 'inline-block', animation: 'none' }} />
          Live · Unit 3 — Main Hall
        </div>
      </div>
    </div>
  )
}
