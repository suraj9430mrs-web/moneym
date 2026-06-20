import { useState, useEffect, useRef } from 'react'

function KPICard({ icon, label, value, description, color = 'border-neon-green', trend = null, accentColor = '#00FF41' }) {
  const [animatedValue, setAnimatedValue] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(true), 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-2xl p-6 border-2 ${color} relative overflow-hidden group cursor-default`}
      style={{ borderColor: `${accentColor}22` }}
    >
      {/* Background shimmer effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at top left, ${accentColor}08 0%, transparent 60%)`,
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="p-3 rounded-xl"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
            boxShadow: `0 0 12px ${accentColor}20`,
          }}
        >
          {icon}
        </div>
        {trend !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
              trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2 relative z-10">{label}</p>

      {/* Value */}
      <div
        className={`text-3xl font-black mb-2 relative z-10 transition-all duration-500 ${
          animatedValue ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ color: accentColor === '#00FF41' ? '#ffffff' : accentColor }}
      >
        {value}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs relative z-10">{description}</p>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
      />
    </div>
  )
}

export default KPICard
