import { useState } from 'react'
import { ScanSearch, Sparkles } from 'lucide-react'
import api from '../../api/client.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'

const SAMPLE = `Security researchers discovered a new ransomware campaign exploiting CVE-2026-30122. ` +
  `The malware communicates with command-and-control infrastructure at 185.220.101.47 and ` +
  `the domain paylock-restore.top, exfiltrating data to https://paylock-restore.top/upload.`

export default function ThreatDetectionPage() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [runAi, setRunAi] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/threats/detect', { text, title: title || 'Manual Submission', run_ai: runAi })
      setResult(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Detection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Threat &amp; Severity Detection</h1>
        <p>Paste a report, log, or suspicious text — Sentinel Dawn extracts IOCs, classifies the threat, scores severity, and maps MITRE ATT&CK.</p>
      </div>

      <div className="glass-card panel">
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Title (optional)</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Suspicious log from endpoint-42" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Text to Analyze</label>
            <textarea className="input-field" rows={8} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Paste threat report, log excerpt, or email content here..." required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div className="toggle-row">
              <input type="checkbox" checked={runAi} onChange={(e) => setRunAi(e.target.checked)} id="runai" />
              <label htmlFor="runai">Include AI-generated analysis (Gemini)</label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setText(SAMPLE)}>Try Sample</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <ScanSearch size={16} />}
                {loading ? 'Analyzing...' : 'Run Detection'}
              </button>
            </div>
          </div>
          {error && <div className="auth-error" style={{ marginTop: 14 }}>{error}</div>}
        </form>
      </div>

      {result && (
        <div className="glass-card panel fade-in">
          <div className="panel-head">
            <h2>Detection Results</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <SeverityBadge severity={result.severity} />
              <span className="badge badge-neutral">{result.threat_type}</span>
              <span className="badge badge-neutral mono">MITRE {result.mitre}</span>
            </div>
          </div>

          <div className="result-grid">
            <div className="result-tile"><div className="val">{result.counts.ip_count}</div><div className="lbl">IP Addresses</div></div>
            <div className="result-tile"><div className="val">{result.counts.domain_count}</div><div className="lbl">Domains</div></div>
            <div className="result-tile"><div className="val">{result.counts.url_count}</div><div className="lbl">URLs</div></div>
            <div className="result-tile"><div className="val">{result.counts.cve_count}</div><div className="lbl">CVEs</div></div>
            <div className="result-tile"><div className="val">{result.counts.sha256_count + result.counts.md5_count}</div><div className="lbl">Hashes</div></div>
            <div className="result-tile"><div className="val">{result.counts.email_count}</div><div className="lbl">Emails</div></div>
          </div>

          {Object.entries(result.iocs).some(([, v]) => v.length > 0) && (
            <div style={{ marginBottom: 6 }}>
              <label className="field-label">Extracted Indicators</label>
              <div className="chip-row">
                {Object.entries(result.iocs).flatMap(([type, values]) =>
                  values.map((v) => <span key={type + v} className="ioc-chip">{type}: {v}</span>)
                )}
              </div>
            </div>
          )}

          {result.ai_analysis && (
            <div className="ai-report">
              <h4><Sparkles size={14} style={{ verticalAlign: -2, marginRight: 6 }} />AI Threat Analysis
                {result.ai_analysis.engine && (
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 10 }}>
                    engine: {result.ai_analysis.engine}
                  </span>
                )}
              </h4>
              <p>{result.ai_analysis.executive_summary}</p>
              {result.ai_analysis.attack_vector && <p><strong>Attack Vector:</strong> {result.ai_analysis.attack_vector}</p>}
              {result.ai_analysis.mitigation?.length > 0 && (
                <>
                  <h4>Mitigation Steps</h4>
                  <ul>{result.ai_analysis.mitigation.map((m, i) => <li key={i}>{m}</li>)}</ul>
                </>
              )}
              {result.ai_analysis.incident_response?.length > 0 && (
                <>
                  <h4>Incident Response</h4>
                  <ul>{result.ai_analysis.incident_response.map((m, i) => <li key={i}>{m}</li>)}</ul>
                </>
              )}
              {result.ai_analysis.conclusion && <p><em>{result.ai_analysis.conclusion}</em></p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
