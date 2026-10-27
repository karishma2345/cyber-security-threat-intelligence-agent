import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import CloudField from '../components/CloudField.jsx'
import SentinelMark from '../components/SentinelMark.jsx'
import BackHomeButton from '../components/BackHomeButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/app')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Signup failed. Try a different username/email.')
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
          <h1>Join Sentinel Dawn</h1>
          <p>Create your analyst account to start defending</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          <div>
            <label className="field-label">Full Name</label>
            <input className="input-field" value={form.full_name} onChange={update('full_name')}
              placeholder="Jane Analyst" />
          </div>
          <div>
            <label className="field-label">Username</label>
            <input className="input-field" value={form.username} onChange={update('username')}
              placeholder="jane_analyst" required autoFocus />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={update('email')}
              placeholder="jane@company.com" required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input-field" type="password" value={form.password} onChange={update('password')}
              placeholder="At least 6 characters" required minLength={6} />
          </div>
          <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 6 }}
            disabled={loading} type="submit">
            <UserPlus size={16} /> {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
