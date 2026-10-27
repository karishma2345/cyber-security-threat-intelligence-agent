const CLOUDS = [
  { top: '8%', size: 180, dur: 46, delay: -4 },
  { top: '22%', size: 120, dur: 60, delay: -20 },
  { top: '5%', size: 90, dur: 38, delay: -10 },
  { top: '35%', size: 220, dur: 70, delay: -30 },
  { top: '15%', size: 140, dur: 52, delay: -15 },
  { top: '42%', size: 100, dur: 44, delay: -25 },
]

export default function CloudField() {
  return (
    <div className="cloud-field" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.55,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
