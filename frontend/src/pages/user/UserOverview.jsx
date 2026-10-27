import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ShieldAlert, Database, FileWarning, Activity } from 'lucide-react'
import api from '../../api/client.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'

const SEVERITY_COLORS = { Critical: '#e8491d', High: '#ff7a3d', Medium: '#ffd166', Low: '#3ddc97' }

export default function UserOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const severityData = stats
    ? Object.entries(stats.severity_breakdown).map(([name, value]) => ({ name, value }))
    : []
  const typeData = stats
    ? Object.entries(stats.threat_type_breakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back 👋</h1>
        <p>Here's the current state of the threat intelligence repository.</p>
      </div>

      <div className="stat-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Database size={18} /></div>
          <div className="stat-value">{loading ? '—' : stats.total_threats}</div>
          <div className="stat-label">Total Threats Tracked</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><ShieldAlert size={18} /></div>
          <div className="stat-value">{loading ? '—' : (stats.severity_breakdown.Critical || 0)}</div>
          <div className="stat-label">Critical Severity</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><FileWarning size={18} /></div>
          <div className="stat-value">{loading ? '—' : stats.total_uploads}</div>
          <div className="stat-label">Files Analyzed</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Activity size={18} /></div>
          <div className="stat-value">
            {loading ? '—' : Object.values(stats.total_iocs).reduce((a, b) => a + b, 0)}
          </div>
          <div className="stat-label">Total IOCs Extracted</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 24 }}
           className="chart-grid">
        <div className="glass-card panel">
          <div className="panel-head"><h2>Severity Breakdown</h2></div>
          {!loading && severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.name] || '#8fa3c8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1b2340', border: '1px solid rgba(255,197,138,0.2)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 240 }} />}
          <div className="chip-row" style={{ justifyContent: 'center', marginTop: 8 }}>
            {severityData.map((d) => (
              <span key={d.name} className="ioc-chip">{d.name}: {d.value}</span>
            ))}
          </div>
        </div>

        <div className="glass-card panel">
          <div className="panel-head"><h2>Threat Type Distribution</h2></div>
          {!loading && typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#8d94b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#8d94b8" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: '#1b2340', border: '1px solid rgba(255,197,138,0.2)', borderRadius: 10 }} />
                <Bar dataKey="value" fill="#ff7a3d" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 240 }} />}
        </div>
      </div>

      <div className="glass-card panel">
        <div className="panel-head">
          <h2>Recent Threat Intelligence</h2>
          <p>Latest items ingested into the repository</p>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 160 }} />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Severity</th><th>MITRE</th><th>Source</th></tr>
            </thead>
            <tbody>
              {stats.recent_threats.map((t) => (
                <tr key={t.id}>
                  <td style={{ maxWidth: 340 }}>{t.article_title}</td>
                  <td>{t.threat_type}</td>
                  <td><SeverityBadge severity={t.severity} /></td>
                  <td className="mono">{t.mitre}</td>
                  <td>{t.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .chart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
