export default function SentinelMark({ size = 40, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={animated ? 'glow-anim' : ''}
      style={animated ? { animation: 'pulseGlow 3s ease-in-out infinite', borderRadius: '50%' } : undefined}
    >
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD18A" />
          <stop offset="55%" stopColor="#FF9351" />
          <stop offset="100%" stopColor="#E8491D" />
        </linearGradient>
      </defs>
      <path
        d="M50 4 L88 18 V48 C88 72 72 88 50 96 C28 88 12 72 12 48 V18 Z"
        fill="url(#sunGrad)"
        stroke="#12172b"
        strokeWidth="2"
      />
      <circle cx="50" cy="42" r="16" fill="#12172b" opacity="0.85" />
      <circle cx="50" cy="42" r="16" fill="none" stroke="#FFE4CC" strokeWidth="1.5" opacity="0.6" />
      {/* sun rays */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180
        const x1 = 50 + Math.cos(angle) * 6
        const y1 = 42 + Math.sin(angle) * 6
        const x2 = 50 + Math.cos(angle) * 11
        const y2 = 42 + Math.sin(angle) * 11
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD18A" strokeWidth="2" strokeLinecap="round" />
        )
      })}
      <path d="M40 66 L47 74 L62 58" stroke="#FFF9F2" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
