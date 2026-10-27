import { useEffect, useState } from 'react'
import { Users, Power, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import api from '../../api/client.js'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`)
    setUsers((u) => u.map((x) => (x.id === id ? data : x)))
  }

  const removeUser = async (id) => {
    if (!confirm('Delete this user permanently? This cannot be undone.')) return
    await api.delete(`/admin/users/${id}`)
    setUsers((u) => u.filter((x) => x.id !== id))
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Review and manage every analyst account registered on the platform.</p>
      </div>

      <div className="glass-card panel">
        <div className="panel-head">
          <h2><Users size={16} style={{ verticalAlign: -2, marginRight: 8 }} />Registered Users ({users.length})</h2>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 240 }} />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Username</th><th>Email</th><th>Full Name</th><th>Status</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.full_name || '—'}</td>
                  <td>
                    {u.is_active ? (
                      <span className="badge badge-low"><CheckCircle2 size={12} /> Active</span>
                    ) : (
                      <span className="badge badge-critical"><XCircle size={12} /> Disabled</span>
                    )}
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => toggleActive(u.id)} title="Toggle active">
                      <Power size={14} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => removeUser(u.id)} title="Delete user">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
