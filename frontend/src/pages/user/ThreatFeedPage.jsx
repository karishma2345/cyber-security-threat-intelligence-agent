import { useEffect, useState } from 'react'
import { Search, Sparkles, ExternalLink, Inbox } from 'lucide-react'
import api from '../../api/client.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']

export default function ThreatFeedPage() {
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [severity, setSeverity] = useState('')
  const [threatType, setThreatType] = useState('')
  const [types, setTypes] = useState([])
  const [analyzingId, setAnalyzingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (q) params.q = q
      if (severity) params.severity = severity
      if (threatType) params.threat_type = threatType
      const { data } = await api.get('/threats', { params })
      setThreats(data)
      if (types.length === 0) {
        setTypes([...new Set(data.map((t) => t.threat_type))].sort())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const runAnalysis = async (id) => {
    setAnalyzingId(id)
    try {
      const { data } = await api.post(`/threats/${id}/analyze`)
      setThreats((prev) => prev.map((t) => (t.id === id ? data : t)))
    } finally {
      setAnalyzingId(null)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Threat Search</h1>
        <p>Search and filter the structured threat intelligence repository.</p>
      </div>

      <div className="glass-card panel">
        <form className="filter-row" onSubmit={(e) => { e.preventDefault(); load() }}>
          <input className="input-field" style={{ maxWidth: 320 }} placeholder="Search title or content..."
            value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input-field" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" value={threatType} onChange={(e) => setThreatType(e.target.value)}>
            <option value="">All Threat Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-primary" type="submit"><Search size={16} /> Search</button>
        </form>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : threats.length === 0 ? (
        <div className="glass-card empty-state">
          <Inbox size={40} />
          <p>No threats match your filters.</p>
        </div>
      ) : (
        threats.map((t) => (
          <div key={t.id} className="glass-card threat-card">
            <div className="threat-card-head">
              <div>
                <div className="threat-card-title">{t.article_title}</div>
                <div className="threat-card-meta">
                  <span>{t.source}</span>
                  <span>•</span>
                  <span>{t.published || 'Undated'}</span>
                  <span>•</span>
                  <span className="mono">MITRE {t.mitre}</span>
                </div>
              </div>
              <div className="threat-card-badges">
                <SeverityBadge severity={t.severity} />
                <span className="badge badge-neutral">{t.threat_type}</span>
              </div>
            </div>
            <div className="threat-card-content">{t.content.slice(0, 280)}{t.content.length > 280 ? '…' : ''}</div>
            <div className="chip-row" style={{ marginBottom: 10 }}>
              {t.ips.slice(0, 3).map((ip) => <span key={ip} className="ioc-chip">IP: {ip}</span>)}
              {t.domains.slice(0, 3).map((d) => <span key={d} className="ioc-chip">Domain: {d}</span>)}
              {t.cves.slice(0, 3).map((c) => <span key={c} className="ioc-chip">{c}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {t.url && (
                <a href={t.url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  <ExternalLink size={14} /> Source
                </a>
              )}
              <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                disabled={analyzingId === t.id} onClick={() => runAnalysis(t.id)}>
                {analyzingId === t.id ? <span className="spinner" /> : <Sparkles size={14} />}
                {t.ai_analyzed ? 'Re-run AI Analysis' : 'Run AI Analysis'}
              </button>
            </div>

            {t.ai_analysis && (
              <div className="ai-report">
                <h4>AI Executive Summary</h4>
                <p>{t.ai_analysis.executive_summary}</p>
                {t.ai_analysis.mitigation?.length > 0 && (
                  <>
                    <h4>Mitigation</h4>
                    <ul>{t.ai_analysis.mitigation.map((m, i) => <li key={i}>{m}</li>)}</ul>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
