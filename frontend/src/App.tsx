import { useState } from 'react'
import { Dashboard } from './pages/Dashboard'
import { Sidebar } from './components/Sidebar'
import { useFans } from './hooks/useFans'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const { alerts } = useFans(30000)
  const openAlerts = alerts.filter(a => !a.acknowledged).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f5', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar activePage={page} onNavigate={setPage} alertCount={openAlerts} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff',
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'capitalize' }}>{page}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#888', background: '#f0f0f0', padding: '4px 10px', borderRadius: 7 }}>
              🏭 Unit 3 — Main Hall
            </span>
            <span style={{ fontSize: 12, color: '#888' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#639922', marginRight: 5, verticalAlign: 'middle' }} />
              Live
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {page === 'dashboard' && <Dashboard />}
          {page !== 'dashboard' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
              {page.charAt(0).toUpperCase() + page.slice(1)} page — coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
