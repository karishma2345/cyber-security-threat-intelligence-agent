import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, KeyRound } from 'lucide-react'
import CloudField from '../components/CloudField.jsx'
import BackHomeButton from '../components/BackHomeButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid admin credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <CloudField />
      <BackHomeButton />
      <div className="glass-card auth-card fade-in">
        <div className="auth-head">
          <div style={{
            width: 60, height: 60, margin: '0 auto', borderRadius: 16,
            background: 'linear-gradient(135deg, #333f68, #1b2340)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-glass)'
          }}>
            <ShieldAlert size={30} color="var(--amber-light)" />
          </div>
          <h1>Administrator Console</h1>
          <p>Restricted access — platform operations only</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          <div>
            <label className="field-label">Admin Username</label>
            <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin" required autoFocus />
          </div>
          <div>
            <label className="field-label">Admin Password</label>
            <input className="input-field" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 6 }}
            disabled={loading} type="submit">
            <KeyRound size={16} /> {loading ? 'Verifying...' : 'Enter Console'}
          </button>
        </form>
        <div className="auth-hint">Default credentials → Admin / admin123</div>
      </div>
    </div>
  )
}
