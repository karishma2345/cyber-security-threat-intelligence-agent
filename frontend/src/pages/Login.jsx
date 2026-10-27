import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import CloudField from '../components/CloudField.jsx'
import SentinelMark from '../components/SentinelMark.jsx'
import BackHomeButton from '../components/BackHomeButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function Login() {
  const { login } = useAuth()
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
      await login(username, password)
      navigate('/app')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
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
          <SentinelMark size={54} />
          <h1>Welcome back, Analyst</h1>
          <p>Sign in to access threat detection &amp; the chatbot</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          <div>
            <label className="field-label">Username</label>
            <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username" required autoFocus />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input-field" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 6 }}
            disabled={loading} type="submit">
            <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
        <div className="auth-hint">demo account → username: demo · password: demo1234</div>
      </div>
    </div>
  )
}
