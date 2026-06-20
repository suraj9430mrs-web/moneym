import { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { TARGET_AMOUNT, TOTAL_DAYS } from '../services/firestoreService'
import KPICard from './KPICard'
import ChartCard from './ChartCard'
import { TrendingUp, Target, Calendar, CheckCircle, Clock, Award } from 'lucide-react'

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0
    const duration = 800
    const steps = 40
    const increment = target / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(target, Math.round(increment * step))
      setDisplayed(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  if (typeof value === 'string' && value.includes('%')) {
    return <span>{prefix}{displayed.toFixed(1)}{suffix}</span>
  }
  return <span>{prefix}{displayed.toLocaleString()}{suffix}</span>
}

function Dashboard() {
  const { trackerData } = useAppContext()
  const [remaining, setRemaining] = useState(TARGET_AMOUNT)
  const [progressPercent, setProgressPercent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (trackerData) {
      const newRemaining = Math.max(0, TARGET_AMOUNT - trackerData.totalEarned)
      setRemaining(newRemaining)
      setProgressPercent((trackerData.totalEarned / TARGET_AMOUNT) * 100)
    }
  }, [trackerData])

  if (!trackerData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-36 shimmer" />
          ))}
        </div>
      </div>
    )
  }

  const pendingDays = TOTAL_DAYS - trackerData.completedDays
  const avgDailyEarnings = trackerData.completedDays > 0
    ? Math.round(trackerData.totalEarned / trackerData.completedDays)
    : 0

  // Find today's day number based on start date
  const startDate = new Date(2026, 5, 19)
  const today = new Date()
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1
  const currentDay = Math.min(Math.max(diffDays, 1), TOTAL_DAYS)

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">
            Overview <span className="neon-text-subtle">📈</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time tracking of your 30-day earning journey
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-effect border border-neon-green/20">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-ping-slow" />
          <span className="text-neon-green text-sm font-semibold">Day {currentDay} of {TOTAL_DAYS}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        <div className="animate-slide-in">
          <KPICard
            icon={<Target size={22} />}
            label="Total Target"
            value={`₹${TARGET_AMOUNT.toLocaleString()}`}
            description="30-day earning goal"
            accentColor="#00FF41"
          />
        </div>
        <div className="animate-slide-in">
          <KPICard
            icon={<TrendingUp size={22} />}
            label="Earned Till Now"
            value={`₹${trackerData.totalEarned.toLocaleString()}`}
            description={`${((trackerData.totalEarned / TARGET_AMOUNT) * 100).toFixed(1)}% of target`}
            accentColor="#00CC34"
            trend={trackerData.completedDays > 0 ? (trackerData.totalEarned / TARGET_AMOUNT) * 100 : 0}
          />
        </div>
        <div className="animate-slide-in">
          <KPICard
            icon={<Target size={22} />}
            label="Remaining Amount"
            value={`₹${remaining.toLocaleString()}`}
            description={`${((remaining / TARGET_AMOUNT) * 100).toFixed(1)}% pending`}
            accentColor="#f97316"
          />
        </div>
        <div className="animate-slide-in">
          <KPICard
            icon={<CheckCircle size={22} />}
            label="Completed Days"
            value={trackerData.completedDays}
            description={`${((trackerData.completedDays / TOTAL_DAYS) * 100).toFixed(1)}% days done`}
            accentColor="#3b82f6"
          />
        </div>
        <div className="animate-slide-in">
          <KPICard
            icon={<Calendar size={22} />}
            label="Pending Days"
            value={pendingDays}
            description={`${pendingDays} days remaining`}
            accentColor="#ef4444"
          />
        </div>
        <div className="animate-slide-in">
          <KPICard
            icon={<Award size={22} />}
            label="Avg Daily Earnings"
            value={`₹${avgDailyEarnings.toLocaleString()}`}
            description={`Per completed day`}
            accentColor="#a855f7"
          />
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-card rounded-2xl p-8 border border-neon-green/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Overall Progress</h3>
            <p className="text-gray-500 text-sm">₹{trackerData.totalEarned.toLocaleString()} earned of ₹{TARGET_AMOUNT.toLocaleString()} target</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black neon-text">{progressPercent.toFixed(1)}</span>
            <span className="text-neon-green font-bold text-lg">%</span>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="progress-bar-track h-5 mb-6">
          <div
            className="progress-bar-fill h-full flex items-center justify-end pr-2"
            style={{ width: `${Math.max(progressPercent, 1)}%` }}
          >
            {progressPercent > 8 && (
              <span className="text-xs font-black text-black">{progressPercent.toFixed(0)}%</span>
            )}
          </div>
        </div>

        {/* Milestone markers */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[25, 50, 75, 100].map((milestone) => (
            <div key={milestone} className="text-center">
              <div
                className={`w-full h-1.5 rounded-full mb-2 transition-all duration-1000 ${
                  progressPercent >= milestone
                    ? 'bg-neon-green shadow-neon'
                    : 'bg-dark-border'
                }`}
              />
              <span className={`text-xs font-bold ${progressPercent >= milestone ? 'text-neon-green' : 'text-gray-600'}`}>
                {milestone}%
              </span>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-border/50">
          {[
            { label: 'Start Date', value: 'Jun 19, 2026' },
            { label: 'End Date', value: 'Jul 18, 2026' },
            { label: 'Days Elapsed', value: `${Math.min(currentDay, trackerData.completedDays + trackerData.totalDays - trackerData.completedDays)} / ${TOTAL_DAYS}` },
            { label: 'On Track', value: progressPercent >= (currentDay / TOTAL_DAYS) * 100 ? '✅ Yes' : '⚠️ Behind' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className="font-semibold text-sm text-gray-200">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard type="earnings" data={trackerData} />
        <ChartCard type="completion" data={trackerData} />
      </div>

      <ChartCard type="timeline" data={trackerData} />
    </div>
  )
}

export default Dashboard
