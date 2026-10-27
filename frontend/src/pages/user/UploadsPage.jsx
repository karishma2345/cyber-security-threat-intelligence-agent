import { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileText, Trash2, Sparkles } from 'lucide-react'
import api from '../../api/client.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'

export default function UploadsPage() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/uploads')
      setUploads(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const doUpload = async (file) => {
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post('/uploads?run_ai=true', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await load()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) doUpload(file)
  }

  const remove = async (id) => {
    await api.delete(`/uploads/${id}`)
    setUploads((u) => u.filter((x) => x.id !== id))
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>My Uploads</h1>
        <p>Upload logs, reports, or emails (.txt, .log, .csv, .json, .md, .eml — max 5MB) for automatic IOC extraction and severity scoring.</p>
      </div>

      <div
        className={`glass-card dropzone ${dragActive ? 'drag-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <UploadCloud size={34} />
        <p style={{ margin: '6px 0 2px', fontWeight: 600 }}>
          {uploading ? 'Analyzing file...' : 'Click to browse or drag & drop a file here'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>.txt, .log, .csv, .json, .md, .eml</p>
        <input ref={inputRef} type="file" hidden accept=".txt,.log,.csv,.json,.md,.eml"
          onChange={(e) => e.target.files?.[0] && doUpload(e.target.files[0])} />
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : uploads.length === 0 ? (
        <div className="glass-card empty-state">
          <FileText size={40} />
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        uploads.map((u) => (
          <div key={u.id} className="glass-card threat-card">
            <div className="threat-card-head">
              <div>
                <div className="threat-card-title"><FileText size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{u.filename}</div>
                <div className="threat-card-meta">
                  <span>{(u.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{new Date(u.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="mono">MITRE {u.mitre}</span>
                </div>
              </div>
              <div className="threat-card-badges">
                <SeverityBadge severity={u.severity} />
                <span className="badge badge-neutral">{u.threat_type}</span>
                <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => remove(u.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="chip-row">
              {Object.entries(u.iocs).flatMap(([type, values]) =>
                (values || []).slice(0, 5).map((v) => <span key={type + v} className="ioc-chip">{type}: {v}</span>)
              )}
            </div>
            {u.ai_analysis && (
              <div className="ai-report">
                <h4><Sparkles size={13} style={{ verticalAlign: -2, marginRight: 6 }} />AI Summary</h4>
                <p>{u.ai_analysis.executive_summary}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
