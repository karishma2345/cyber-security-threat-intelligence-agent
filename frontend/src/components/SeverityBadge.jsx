import { AlertTriangle, AlertOctagon, Info, ShieldCheck } from 'lucide-react'

const CONFIG = {
  Critical: { cls: 'badge-critical', Icon: AlertOctagon },
  High: { cls: 'badge-high', Icon: AlertTriangle },
  Medium: { cls: 'badge-medium', Icon: Info },
  Low: { cls: 'badge-low', Icon: ShieldCheck },
}

export default function SeverityBadge({ severity }) {
  const conf = CONFIG[severity] || { cls: 'badge-neutral', Icon: Info }
  const { cls, Icon } = conf
  return (
    <span className={`badge ${cls}`}>
      <Icon size={12} />
      {severity || 'Unknown'}
    </span>
  )
}
