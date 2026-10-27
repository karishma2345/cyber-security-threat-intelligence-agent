import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Database, Users, FileWarning, ShieldAlert, RefreshCw } from 'lucide-react'
import api from '../../api/client.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'

const SEVERITY_COLORS = { Critical: '#e8491d', High: '#ff7a3d', Medium: '#ffd166', Low: '#3ddc97' }

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)
  const [ingestMsg, setIngestMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/dashboard/stats')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const runIngest = async () => {
    setIngesting(true)
    setIngestMsg('')
    try {
      const { data } = await api.post('/admin/ingest')
      setIngestMsg(`Collected ${data.collected} articles from live RSS feeds, added ${data.inserted} new threats.`)
      await load()
    } catch (err) {
      setIngestMsg(err?.response?.data?.detail || 'Ingestion failed — check network access to RSS feeds.')
    } finally {
      setIngesting(false)
    }
  }

  const severityData = stats
    ? Object.entries(stats.severity_breakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Admin Overview</h1>
          <p>Platform-wide threat intelligence &amp; usage snapshot.</p>
        </div>
        <button className="btn btn-primary" onClick={runIngest} disabled={ingesting}>
          {ingesting ? <span className="spinner" /> : <RefreshCw size={16} />}
          {ingesting ? 'Collecting...' : 'Run RSS Ingestion'}
        </button>
      </div>
      {ingestMsg && <div className="glass-card panel" style={{ padding: '14px 20px', marginBottom: 20 }}>{ingestMsg}</div>}

      <div className="stat-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Database size={18} /></div>
          <div className="stat-value">{loading ? '—' : stats.total_threats}</div>
          <div className="stat-label">Total Threats</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={18} /></div>
          <div className="stat-value">{loading ? '—' : stats.total_users}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><FileWarning size={18} /></div>
          <div className="stat-value">{loading ? '—' : stats.total_uploads}</div>
          <div className="stat-label">User File Uploads</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><ShieldAlert size={18} /></div>
          <div className="stat-value">{loading ? '—' : (stats.severity_breakdown.Critical || 0)}</div>
          <div className="stat-label">Critical Threats</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }} className="chart-grid">
        <div className="glass-card panel">
          <div className="panel-head"><h2>Severity Distribution</h2></div>
          {!loading && severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.name] || '#8fa3c8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1b2340', border: '1px solid rgba(255,197,138,0.2)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 220 }} />}
        </div>

        <div className="glass-card panel">
          <div className="panel-head"><h2>Recent Threats</h2></div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Severity</th><th>Source</th></tr></thead>
              <tbody>
                {stats.recent_threats.slice(0, 6).map((t) => (
                  <tr key={t.id}>
                    <td style={{ maxWidth: 260 }}>{t.article_title}</td>
                    <td><SeverityBadge severity={t.severity} /></td>
                    <td>{t.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .chart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
