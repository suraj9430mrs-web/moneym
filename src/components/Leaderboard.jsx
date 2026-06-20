import { useState, useEffect } from 'react'
import { getLeaderboard, TOTAL_DAYS, listenToTrackerUpdates } from '../services/firestoreService'
import { Trophy, Crown, Medal } from 'lucide-react'

const MEDAL_CONFIGS = [
  { icon: <Crown size={20} />, color: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)', border: 'rgba(255, 215, 0, 0.25)', label: '1st' },
  { icon: <Trophy size={20} />, color: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.08)', border: 'rgba(192, 192, 192, 0.2)', label: '2nd' },
  { icon: <Medal size={20} />, color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.08)', border: 'rgba(205, 127, 50, 0.2)', label: '3rd' },
]

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard()
      setLeaderboard(data)
      setLoading(false)
    }
    loadLeaderboard()

    const unsubscribe = listenToTrackerUpdates(async () => {
      const data = await getLeaderboard()
      setLeaderboard(data)
    })
    return unsubscribe
  }, [])

  const totalTeamEarnings = leaderboard.reduce((sum, u) => sum + u.earnings, 0)

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">Leaderboard</h2>
          <p className="text-gray-400 text-sm">Top contributors ranked by earnings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-effect border border-yellow-500/20">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">RANKINGS</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl shimmer" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-yellow-500/10">
          <div className="w-20 h-20 rounded-2xl glass-effect border border-dark-border flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-gray-600" />
          </div>
          <p className="text-gray-300 font-bold text-lg mb-2">No Rankings Yet</p>
          <p className="text-gray-500 text-sm">Complete some days to appear on the leaderboard</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (if enough users) */}
          {leaderboard.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, Math.min(3, leaderboard.length)).map((user, idx) => {
                const medalConfig = MEDAL_CONFIGS[idx]
                return (
                  <div
                    key={user.email}
                    className="glass-card rounded-2xl p-5 text-center relative overflow-hidden"
                    style={{ border: `1px solid ${medalConfig.border}` }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `radial-gradient(ellipse at top center, ${medalConfig.color}15 0%, transparent 60%)`,
                      }}
                    />
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 relative z-10"
                      style={{ background: medalConfig.bg, color: medalConfig.color, border: `1px solid ${medalConfig.border}` }}
                    >
                      {medalConfig.icon}
                    </div>
                    <p className="font-black text-white mb-1 relative z-10 text-sm">{user.name}</p>
                    <p className="text-gray-500 text-xs mb-3 relative z-10 truncate">{user.email}</p>
                    <p className="font-black text-xl relative z-10" style={{ color: medalConfig.color }}>
                      ₹{user.earnings.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 relative z-10">{user.completions} days</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="glass-card rounded-2xl border border-yellow-500/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.06) 0%, rgba(255, 215, 0, 0.02) 100%)', borderBottom: '1px solid rgba(255, 215, 0, 0.12)' }}>
                    <th style={{ color: 'rgba(255, 215, 0, 0.8)' }}>Rank</th>
                    <th style={{ color: 'rgba(255, 215, 0, 0.8)' }}>Contributor</th>
                    <th style={{ color: 'rgba(255, 215, 0, 0.8)' }}>Days Done</th>
                    <th style={{ color: 'rgba(255, 215, 0, 0.8)' }}>Total Earned</th>
                    <th style={{ color: 'rgba(255, 215, 0, 0.8)' }}>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => {
                    const completionPercent = ((user.completions / TOTAL_DAYS) * 100).toFixed(1)
                    const medalConfig = MEDAL_CONFIGS[idx]
                    const isTop3 = idx < 3

                    return (
                      <tr key={user.email}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-gray-400 w-6 text-center">{idx + 1}</span>
                            {isTop3 && (
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: medalConfig?.bg, color: medalConfig?.color }}
                              >
                                {medalConfig?.icon}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                              style={{
                                background: isTop3
                                  ? `${medalConfig.color}20`
                                  : 'rgba(0, 255, 65, 0.08)',
                                color: isTop3 ? medalConfig.color : '#00FF41',
                              }}
                            >
                              {user.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{user.name}</p>
                              <p className="text-gray-500 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">{user.completions}/{TOTAL_DAYS}</span>
                        </td>
                        <td>
                          <span
                            className="font-black text-lg"
                            style={{ color: isTop3 ? medalConfig?.color : '#00FF41' }}
                          >
                            ₹{user.earnings.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-24 progress-bar-track h-2">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${completionPercent}%`,
                                  background: isTop3
                                    ? medalConfig?.color
                                    : 'linear-gradient(90deg, #00FF41, #00CC34)',
                                }}
                              />
                            </div>
                            <span className="font-bold text-sm min-w-max" style={{ color: isTop3 ? medalConfig?.color : '#00FF41' }}>
                              {completionPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-yellow-500/10">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Contributors</p>
              <p className="text-3xl font-black text-yellow-400">{leaderboard.length}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-yellow-500/10">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Top Earner</p>
              <p className="text-xl font-black text-white truncate">{leaderboard[0]?.name}</p>
              <p className="text-yellow-400 font-bold text-sm mt-1">₹{leaderboard[0]?.earnings.toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-yellow-500/10">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Team Total</p>
              <p className="text-3xl font-black text-green-400">₹{totalTeamEarnings.toLocaleString()}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Leaderboard
