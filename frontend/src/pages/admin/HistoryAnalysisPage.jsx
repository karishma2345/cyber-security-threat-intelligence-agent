import { useEffect, useState } from 'react'
import { History, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../../api/client.js'

const ROLE_STYLES = {
  admin: { background: 'rgba(255,179,71,0.14)', color: 'var(--amber-light)' },
  user: { background: 'rgba(185,198,232,0.12)', color: 'var(--sky-mist)' },
}

export default function HistoryAnalysisPage() {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/history'), api.get('/admin/history/summary')])
      .then(([l, s]) => { setLogs(l.data); setSummary(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const chartData = Object.entries(summary).map(([name, value]) => ({ name, value }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>History Analysis</h1>
        <p>Full audit trail of platform activity — logins, detections, uploads, and configuration changes.</p>
      </div>

      <div className="glass-card panel">
        <div className="panel-head"><h2><Activity size={16} style={{ verticalAlign: -2, marginRight: 8 }} />Activity by Action Type</h2></div>
        {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#8d94b8" fontSize={10} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#8d94b8" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1b2340', border: '1px solid rgba(255,197,138,0.2)', borderRadius: 10 }} />
              <Bar dataKey="value" fill="#ff7a3d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card panel">
        <div className="panel-head"><h2><History size={16} style={{ verticalAlign: -2, marginRight: 8 }} />Recent Activity Log</h2></div>
        {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <table className="data-table">
            <thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.actor}</td>
                  <td>
                    <span className="badge" style={{ ...ROLE_STYLES[l.role], border: 'none' }}>{l.role}</span>
                  </td>
                  <td className="mono" style={{ fontSize: '0.78rem' }}>{l.action}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
