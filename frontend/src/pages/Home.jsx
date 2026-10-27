import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Rss, ScanSearch, MessageSquareText, LayoutDashboard, Users, KeyRound, ArrowRight } from 'lucide-react'
import CloudField from '../components/CloudField.jsx'
import SentinelMark from '../components/SentinelMark.jsx'
import FlowDiagram from '../components/FlowDiagram.jsx'

const FEATURES = [
  { icon: Rss, title: 'Live Threat Collection', desc: 'Continuously ingests trusted RSS feeds and security blogs into one structured repository.' },
  { icon: ScanSearch, title: 'IOC Extraction & Severity', desc: 'Automatically pulls IPs, domains, URLs, CVEs and hashes, then scores severity and maps MITRE ATT&CK.' },
  { icon: ShieldCheck, title: 'AI-Powered Analysis', desc: 'Gemini-driven executive summaries, mitigation steps, and incident response guidance per threat.' },
  { icon: MessageSquareText, title: 'Threat Intelligence Chatbot', desc: 'Ask natural-language questions and get answers grounded in your live threat repository.' },
  { icon: LayoutDashboard, title: 'Real-Time Dashboard', desc: 'Severity breakdowns, threat-type distribution, and IOC counts visualized at a glance.' },
  { icon: Users, title: 'Admin Control Center', desc: 'Manage users, configure API integrations, and audit full platform history.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-shell">
      {/* ---------- NAV ---------- */}
      <nav className="home-nav">
        <div className="container home-nav-inner">
          <div className="brand">
            <SentinelMark size={38} />
            <div>
              <div className="brand-title">Sentinel Dawn</div>
              <div className="brand-sub">Cyber Threat Intelligence Agent</div>
            </div>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/admin/login')}>
              <KeyRound size={16} /> Admin
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <header className="hero">
        <CloudField />
        <div className="container hero-inner">
          <div className="hero-badge fade-in">
            <span className="pulse-dot" /> LIVE THREAT MONITORING ENGINE
          </div>
          <h1 className="hero-title fade-in">
            Defending the horizon,<br />
            <span className="hero-title-accent">one threat at a time.</span>
          </h1>
          <p className="hero-desc fade-in">
            Sentinel Dawn collects real-world cyber threat intelligence, extracts indicators
            of compromise, classifies severity, maps MITRE ATT&CK techniques, and turns it
            all into an AI-ready repository — searchable, visualized, and conversational.
          </p>
          <div className="hero-ctas fade-in">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Launch as Analyst <ArrowRight size={18} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
              I already have an account
            </button>
          </div>
          <div className="hero-stats fade-in">
            <div><strong>6</strong><span>Trusted Feeds</span></div>
            <div><strong>7</strong><span>IOC Types Tracked</span></div>
            <div><strong>12</strong><span>Threat Categories</span></div>
            <div><strong>24/7</strong><span>AI-Assisted Watch</span></div>
          </div>
        </div>
      </header>

      {/* ---------- FLOW DIAGRAM ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">System Architecture</span>
            <h2>From Raw Feeds to Actionable Defense</h2>
            <p className="section-sub">
              Every article that enters Sentinel Dawn passes through the same pipeline that
              powers this platform's intelligence engine.
            </p>
          </div>
          <div className="glass-card diagram-shell">
            <FlowDiagram />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Platform Modules</span>
            <h2>Everything an analyst needs, in the light of day</h2>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card feature-card">
                <div className="feature-icon"><f.icon size={22} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ROLE CARDS ---------- */}
      <section className="section">
        <div className="container role-grid">
          <div className="glass-card role-card">
            <div className="role-card-icon"><Users size={26} /></div>
            <h3>Security Analysts</h3>
            <p>Sign up, run threat &amp; severity detection on any text or log, chat with the
              AI assistant, and upload files for automatic IOC extraction.</p>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Create Account <ArrowRight size={16} />
            </button>
          </div>
          <div className="glass-card role-card">
            <div className="role-card-icon role-card-icon-admin"><KeyRound size={26} /></div>
            <h3>Platform Administrators</h3>
            <p>Configure the Gemini API integration, manage RSS sources, oversee user
              accounts, and audit the complete activity history.</p>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/login')}>
              Admin Console <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand">
            <SentinelMark size={28} />
            <span className="brand-title" style={{ fontSize: '1rem' }}>Sentinel Dawn</span>
          </div>
          <span className="footer-note">Cyber Threat Intelligence Agent — Built for the defenders who watch at first light.</span>
        </div>
      </footer>

      <style>{`
        .home-nav {
          position: sticky; top: 0; z-index: 40;
          background: rgba(18, 23, 43, 0.55);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-glass);
        }
        .home-nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-title { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; }
        .brand-sub { font-size: 0.72rem; color: var(--text-dim); letter-spacing: 0.03em; }
        .nav-actions { display: flex; gap: 10px; align-items: center; }

        .hero {
          position: relative;
          padding: 90px 0 70px;
          overflow: hidden;
          background: radial-gradient(ellipse 90% 70% at 50% 0%, rgba(255,122,61,0.22), transparent 60%);
        }
        .hero-inner { position: relative; z-index: 2; max-width: 780px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-radius: 999px;
          background: rgba(255,122,61,0.12); border: 1px solid rgba(255,122,61,0.35);
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
          color: var(--sun-bright); margin-bottom: 26px; font-family: var(--font-mono);
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--sun-core);
          animation: pulseGlow 1.6s ease-in-out infinite;
        }
        .hero-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 700; line-height: 1.08; margin-bottom: 22px;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, var(--sun-core), var(--amber-light));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .hero-desc { font-size: 1.08rem; color: var(--text-muted); line-height: 1.6; max-width: 620px; margin-bottom: 34px; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 46px; }
        .btn-lg { padding: 15px 28px; font-size: 1rem; }
        .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
        .hero-stats div { display: flex; flex-direction: column; }
        .hero-stats strong { font-size: 1.7rem; font-family: var(--font-display); color: var(--amber-light); }
        .hero-stats span { font-size: 0.78rem; color: var(--text-dim); }

        .section { padding: 60px 0; }
        .section-head { max-width: 640px; margin: 0 auto 40px; text-align: center; }
        .eyebrow {
          font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
          color: var(--sun-bright); letter-spacing: 0.1em; text-transform: uppercase;
        }
        .section-head h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 10px 0 12px; }
        .section-sub { color: var(--text-dim); font-size: 0.98rem; line-height: 1.6; }

        .diagram-shell { padding: 40px 24px; overflow-x: auto; }

        .feature-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .feature-card { padding: 26px; transition: transform 0.2s ease, border-color 0.2s ease; }
        .feature-card:hover { transform: translateY(-4px); border-color: var(--sun-core); }
        .feature-icon {
          width: 46px; height: 46px; border-radius: 12px; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(255,122,61,0.25), rgba(255,179,71,0.15));
          color: var(--amber-light);
        }
        .feature-card h3 { font-size: 1.05rem; margin-bottom: 8px; }
        .feature-card p { font-size: 0.9rem; color: var(--text-dim); line-height: 1.55; margin: 0; }

        .role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .role-card { padding: 34px; text-align: left; }
        .role-card-icon {
          width: 54px; height: 54px; border-radius: 14px; margin-bottom: 18px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--sun-core), var(--amber));
          color: var(--dusk-900);
        }
        .role-card-icon-admin { background: linear-gradient(135deg, var(--dusk-600), var(--dusk-700)); color: var(--amber-light); }
        .role-card h3 { font-size: 1.3rem; margin-bottom: 10px; }
        .role-card p { color: var(--text-dim); line-height: 1.6; margin-bottom: 22px; font-size: 0.95rem; }

        .footer { border-top: 1px solid var(--border-glass); padding: 26px 0; margin-top: 20px; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-note { color: var(--text-dim); font-size: 0.82rem; }
      `}</style>
    </div>
  )
}
