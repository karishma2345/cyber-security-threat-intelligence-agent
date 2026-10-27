import { NavLink, useNavigate } from 'react-router-dom'
import { Home, LogOut } from 'lucide-react'
import SentinelMark from './SentinelMark.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardLayout({ navItems, roleLabel, children }) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand" onClick={() => navigate('/')}>
          <SentinelMark size={34} />
          <div>
            <div className="dash-brand-title">Sentinel Dawn</div>
            <div className="dash-brand-role">{roleLabel}</div>
          </div>
        </div>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user-chip">
            <div className="dash-user-avatar">{(username || '?')[0].toUpperCase()}</div>
            <div className="dash-user-name">{username}</div>
          </div>
          <button className="dash-footer-btn" onClick={() => navigate('/')}>
            <Home size={16} /> Home
          </button>
          <button className="dash-footer-btn dash-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="dash-main">
        {children}
      </main>

      <style>{`
        .dash-shell {
          min-height: 100vh;
          display: flex;
        }
        .dash-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(18, 23, 43, 0.7);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          padding: 22px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .dash-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px 22px; cursor: pointer;
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 18px;
        }
        .dash-brand-title { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
        .dash-brand-role {
          font-size: 0.68rem; color: var(--sun-bright); font-family: var(--font-mono);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .dash-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .dash-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          color: var(--text-muted); font-size: 0.9rem; font-weight: 500;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .dash-nav-item:hover { background: var(--surface-glass); color: var(--text-primary); }
        .dash-nav-item.active {
          background: linear-gradient(135deg, rgba(255,122,61,0.22), rgba(255,179,71,0.12));
          color: var(--amber-light);
          border: 1px solid rgba(255,122,61,0.3);
        }
        .dash-sidebar-footer { display: flex; flex-direction: column; gap: 8px; padding-top: 14px; border-top: 1px solid var(--border-glass); }
        .dash-user-chip { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 4px; }
        .dash-user-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--sun-core), var(--amber));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.85rem; color: var(--dusk-900);
        }
        .dash-user-name { font-size: 0.85rem; font-weight: 600; }
        .dash-footer-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; border-radius: 10px; border: none;
          background: transparent; color: var(--text-muted); cursor: pointer;
          font-size: 0.87rem; text-align: left; width: 100%;
        }
        .dash-footer-btn:hover { background: var(--surface-glass); color: var(--text-primary); }
        .dash-logout:hover { color: #ffb199; background: rgba(232,73,29,0.12); }

        .dash-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 60px;
        }

        @media (max-width: 880px) {
          .dash-shell { flex-direction: column; }
          .dash-sidebar { width: 100%; height: auto; position: relative; flex-direction: row; flex-wrap: wrap; align-items: center; }
          .dash-brand { border-bottom: none; margin-bottom: 0; padding: 4px; }
          .dash-nav { flex-direction: row; flex-wrap: wrap; }
          .dash-sidebar-footer { flex-direction: row; margin-left: auto; border-top: none; padding-top: 0; }
          .dash-main { padding: 24px 18px 50px; }
        }
      `}</style>
    </div>
  )
}
