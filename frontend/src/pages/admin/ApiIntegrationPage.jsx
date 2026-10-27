import { useEffect, useState } from 'react'
import { KeyRound, Save, Plus, Trash2, CheckCircle2, XCircle, Rss } from 'lucide-react'
import api from '../../api/client.js'

export default function ApiIntegrationPage() {
  const [config, setConfig] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [newFeedName, setNewFeedName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')

  const load = async () => {
    const { data } = await api.get('/admin/api-config')
    setConfig(data)
    setModel(data.gemini_model)
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    try {
      const payload = { gemini_model: model }
      if (apiKey) payload.gemini_api_key = apiKey
      const { data } = await api.put('/admin/api-config', payload)
      setConfig(data)
      setApiKey('')
      setSavedMsg('Configuration saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  const addFeed = async (e) => {
    e.preventDefault()
    if (!newFeedName || !newFeedUrl) return
    const { data } = await api.post('/admin/api-config/rss-feed', { name: newFeedName, url: newFeedUrl })
    setConfig((c) => ({ ...c, rss_feeds: data }))
    setNewFeedName(''); setNewFeedUrl('')
  }

  const removeFeed = async (name) => {
    const { data } = await api.delete(`/admin/api-config/rss-feed/${encodeURIComponent(name)}`)
    setConfig((c) => ({ ...c, rss_feeds: data }))
  }

  if (!config) return <div className="skeleton" style={{ height: 300 }} />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>API Integration</h1>
        <p>Connect the Gemini AI model and manage trusted RSS threat sources.</p>
      </div>

      <div className="glass-card panel">
        <div className="panel-head">
          <h2><KeyRound size={16} style={{ verticalAlign: -2, marginRight: 8 }} />Gemini AI Configuration</h2>
          <p>
            Status:{' '}
            {config.gemini_api_key_set ? (
              <span style={{ color: 'var(--ok-green)' }}><CheckCircle2 size={13} style={{ verticalAlign: -2 }} /> Connected</span>
            ) : (
              <span style={{ color: 'var(--text-dim)' }}><XCircle size={13} style={{ verticalAlign: -2 }} /> Not configured — using local heuristic fallback analyzer</span>
            )}
          </p>
        </div>
        <form onSubmit={save}>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Gemini API Key</label>
            <input className="input-field" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder={config.gemini_api_key_set ? '•••••••••••••••••• (leave blank to keep current key)' : 'Enter your Gemini API key'} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="field-label">Model Name</label>
            <input className="input-field" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gemini-3.5-flash" />
          </div>
          {savedMsg && <div className="ai-report" style={{ marginBottom: 14, padding: '10px 16px' }}>{savedMsg}</div>}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : <Save size={16} />} {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      <div className="glass-card panel">
        <div className="panel-head">
          <h2><Rss size={16} style={{ verticalAlign: -2, marginRight: 8 }} />RSS Threat Sources</h2>
          <p>Feeds polled during ingestion (Threat Collection).</p>
        </div>

        <table className="data-table" style={{ marginBottom: 20 }}>
          <thead><tr><th>Source Name</th><th>Feed URL</th><th></th></tr></thead>
          <tbody>
            {Object.entries(config.rss_feeds).map(([name, url]) => (
              <tr key={name}>
                <td>{name}</td>
                <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>{url}</td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => removeFeed(name)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form className="filter-row" onSubmit={addFeed} style={{ marginBottom: 0 }}>
          <input className="input-field" placeholder="Source name" value={newFeedName} onChange={(e) => setNewFeedName(e.target.value)} />
          <input className="input-field" style={{ maxWidth: 340 }} placeholder="https://example.com/feed" value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} />
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Add Feed</button>
        </form>
      </div>
    </div>
  )
}
