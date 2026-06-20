import { useState, useEffect } from 'react'
import { listenToActivities } from '../services/firestoreService'
import { Activity, Clock, CheckCircle, RotateCcw, Zap } from 'lucide-react'

function ActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const unsubscribe = listenToActivities((newActivities) => {
      setActivities(newActivities)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now'
    const now = Date.now()
    const time = timestamp.toMillis ? timestamp.toMillis() : timestamp
    const seconds = Math.floor((now - time) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getActivityConfig = (type) => {
    switch (type) {
      case 'completion':
        return {
          icon: <CheckCircle size={18} />,
          color: '#00FF41',
          bg: 'rgba(0, 255, 65, 0.08)',
          border: 'rgba(0, 255, 65, 0.2)',
          label: 'Completed',
        }
      case 'undo':
        return {
          icon: <RotateCcw size={18} />,
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.08)',
          border: 'rgba(249, 115, 22, 0.2)',
          label: 'Undone',
        }
      default:
        return {
          icon: <Zap size={18} />,
          color: '#64c8ff',
          bg: 'rgba(100, 200, 255, 0.08)',
          border: 'rgba(100, 200, 255, 0.2)',
          label: 'Activity',
        }
    }
  }

  const filteredActivities = activities.filter((a) => {
    if (filter === 'all') return true
    return a.type === filter
  })

  const totalEarned = activities.reduce((sum, a) => sum + (a.amount || 0), 0)
  const completions = activities.filter((a) => a.type === 'completion').length
  const undos = activities.filter((a) => a.type === 'undo').length

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">Activity Feed</h2>
          <p className="text-gray-400 text-sm">Real-time updates from all participants</p>
        </div>
        {activities.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-effect border border-neon-green/20">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-ping-slow" />
            <span className="text-neon-green text-xs font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-neon-green/10">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Activities</p>
          <p className="text-3xl font-black neon-text">{activities.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-green-500/10">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Completions</p>
          <p className="text-3xl font-black text-green-400">{completions}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-neon-green/10">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Earnings Logged</p>
          <p className="text-3xl font-black text-neon-green">₹{totalEarned.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: `All (${activities.length})` },
          { id: 'completion', label: `✅ Completions (${completions})` },
          { id: 'undo', label: `↩️ Undos (${undos})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === tab.id
                ? 'bg-neon-green text-black'
                : 'glass-effect text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="glass-card rounded-2xl border border-neon-green/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl glass-effect border border-dark-border flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No activities yet</p>
            <p className="text-gray-600 text-sm mt-1">Mark some days as complete to see activity here</p>
          </div>
        ) : (
          <div>
            {filteredActivities.map((activity, idx) => {
              const config = getActivityConfig(activity.type)
              return (
                <div
                  key={activity.id}
                  className="px-6 py-5 flex items-start gap-4 border-b border-dark-border/40 hover:bg-white/[0.02] transition-all"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm mb-1 leading-relaxed">{activity.message}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {activity.amount > 0 && (
                        <span
                          className="badge"
                          style={{ background: 'rgba(0, 255, 65, 0.1)', color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.2)' }}
                        >
                          +₹{activity.amount.toLocaleString()}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">{activity.userEmail}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs whitespace-nowrap flex-shrink-0">
                    <Clock size={13} />
                    <span>{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed
