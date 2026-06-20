import { Users, Calendar, Zap } from 'lucide-react'
import { START_DATE, TOTAL_DAYS } from '../services/firestoreService'
import { isDemoMode } from '../services/authService'

function Footer({ viewers }) {
  const endDate = new Date(START_DATE)
  endDate.setDate(endDate.getDate() + TOTAL_DAYS - 1)
  const demoMode = isDemoMode()

  return (
    <footer className="mt-16 border-t border-neon-green/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-neon-green/15 border border-neon-green/30 flex items-center justify-center">
                <Zap size={12} className="text-neon-green" />
              </div>
              <h3 className="font-black text-white text-sm">30 Days Tracker</h3>
              {demoMode && <span className="badge badge-amber text-xs">Demo</span>}
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Real-time collaboration dashboard for tracking earnings and growth over 30 days.
            </p>
          </div>

          {/* Duration */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-neon-green" />
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Duration</p>
            </div>
            <p className="font-bold text-white text-sm">
              {START_DATE.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' — '}
              {endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{TOTAL_DAYS} days total</p>
          </div>

          {/* Viewers */}
          <div className="flex flex-col items-start sm:items-end justify-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-ping-slow" />
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Viewers</p>
            </div>
            <p className="font-black text-neon-green text-3xl">{viewers || 1}</p>
            <p className="text-gray-500 text-xs">online right now</p>
          </div>
        </div>

        <div className="border-t border-dark-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-600 text-xs">
          <p>© 2026 Growth & Earning Tracker. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with
            <span className="text-neon-green font-bold">React</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">Vite</span>
            <span>•</span>
            <span className="text-orange-400 font-bold">Firebase</span>
            <span>•</span>
            <span className="text-sky-400 font-bold">Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
