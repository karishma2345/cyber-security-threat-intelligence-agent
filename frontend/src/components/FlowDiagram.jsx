import { Rss, Filter, ScanSearch, BrainCircuit, Database, Search, LayoutDashboard, MessageSquareText, FileText } from 'lucide-react'

const STAGES = [
  { icon: Rss, title: 'Trusted Threat Sources', sub: 'RSS Feeds & Security Blogs' },
  { icon: Filter, title: 'Threat Collection', sub: 'Part 2 — Feed ingestion & parsing' },
  { icon: ScanSearch, title: 'IOC Extraction & Classification', sub: 'Part 3 — IPs, domains, CVEs, hashes, severity' },
  { icon: BrainCircuit, title: 'Gemini AI Analysis', sub: 'Part 4 — Executive summaries, MITRE mapping, mitigation' },
  { icon: Database, title: 'Threat Intelligence Repository', sub: 'Structured, searchable, always-on' },
]

const OUTPUTS = [
  { icon: Search, title: 'Threat Search', sub: 'Part 5' },
  { icon: LayoutDashboard, title: 'Threat Dashboard', sub: 'Part 6' },
  { icon: MessageSquareText, title: 'AI Chatbot', sub: 'Part 7' },
]

export default function FlowDiagram() {
  return (
    <div className="flow-diagram">
      <div className="flow-column">
        {STAGES.map((s, i) => (
          <div key={s.title} className="flow-node-wrap">
            <div className="flow-node glass-card">
              <div className="flow-node-icon"><s.icon size={22} /></div>
              <div>
                <div className="flow-node-title">{s.title}</div>
                <div className="flow-node-sub">{s.sub}</div>
              </div>
            </div>
            {i < STAGES.length - 1 && <div className="flow-connector" />}
          </div>
        ))}
      </div>

      <div className="flow-branch-connector" />

      <div className="flow-outputs">
        {OUTPUTS.map((o) => (
          <div key={o.title} className="flow-node glass-card flow-output-node">
            <div className="flow-node-icon flow-output-icon"><o.icon size={20} /></div>
            <div>
              <div className="flow-node-title">{o.title}</div>
              <div className="flow-node-sub">{o.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flow-branch-connector-down" />

      <div className="flow-node glass-card flow-final-node fade-in">
        <div className="flow-node-icon flow-output-icon"><FileText size={22} /></div>
        <div>
          <div className="flow-node-title">Cyber Threat Intelligence Reports &amp; Insights</div>
          <div className="flow-node-sub">Actionable defense, delivered in real time</div>
        </div>
      </div>

      <style>{`
        .flow-diagram {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 20px 0 10px;
        }
        .flow-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .flow-node-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .flow-node {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          min-width: 300px;
          max-width: 420px;
        }
        .flow-node-icon {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--sun-core), var(--amber));
          color: var(--dusk-900);
        }
        .flow-output-icon {
          background: linear-gradient(135deg, var(--amber), var(--sun-bright));
        }
        .flow-node-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .flow-node-sub {
          font-size: 0.78rem;
          color: var(--text-dim);
          margin-top: 2px;
        }
        .flow-connector {
          width: 2px;
          height: 34px;
          background: linear-gradient(var(--sun-core), transparent);
        }
        .flow-branch-connector {
          width: 2px;
          height: 34px;
          background: linear-gradient(var(--sun-core), var(--amber));
        }
        .flow-branch-connector-down {
          width: 2px;
          height: 34px;
          background: linear-gradient(var(--amber), var(--sun-core));
        }
        .flow-outputs {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
        }
        .flow-output-node { min-width: 200px; }
        .flow-final-node {
          margin-top: 6px;
          border: 1px solid var(--sun-core);
          box-shadow: var(--shadow-glow);
        }
        @media (max-width: 640px) {
          .flow-node { min-width: 260px; padding: 14px 18px; }
        }
      `}</style>
    </div>
  )
}
