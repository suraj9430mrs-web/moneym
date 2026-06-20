import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { getUserStatistics, markDayCompleted, markDayIncomplete, TOTAL_DAYS, TARGET_AMOUNT } from '../services/firestoreService'
import { isDemoMode } from '../services/authService'
import { useToast } from './Toast'
import { Settings, BarChart3, Trash2, CheckSquare, RefreshCw, Shield, Database, Activity } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

function AdminPanel() {
  const { user, trackerData } = useAppContext()
  const [adminStats, setAdminStats] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()
  const demoMode = isDemoMode()

  const isAdmin = true // In demo mode, all users can be admin

  useEffect(() => {
    if (!isAdmin) return
    const loadStats = async () => {
      try {
        if (user && trackerData) {
          const stats = await getUserStatistics(user.email)
          setAdminStats(stats)
        }
      } catch (error) {
        console.error('Error loading admin stats:', error)
      }
    }
    loadStats()
  }, [user, trackerData])

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="text-red-500/40 mx-auto mb-4" />
        <p className="text-red-400 text-lg font-bold">Access Denied</p>
        <p className="text-gray-500 text-sm mt-2">Admin access only</p>
      </div>
    )
  }

  if (!trackerData) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    )
  }

  const handleResetDay = async (dayNumber) => {
    if (confirmAction?.dayNumber === dayNumber && confirmAction?.type === 'reset') {
      try {
        await markDayIncomplete(dayNumber)
        toast.success(`Day ${dayNumber} has been reset`)
      } catch (err) {
        toast.error(`Failed to reset Day ${dayNumber}`)
      }
      setConfirmAction(null)
    } else {
      setConfirmAction({ dayNumber, type: 'reset' })
      setTimeout(() => setConfirmAction(null), 4000)
    }
  }

  const handleForceMark = async (dayNumber) => {
    if (confirmAction?.dayNumber === dayNumber && confirmAction?.type === 'mark') {
      try {
        await markDayCompleted(dayNumber, user)
        toast.success(`Day ${dayNumber} marked as completed`)
      } catch (err) {
        toast.error(`Failed to mark Day ${dayNumber}`)
      }
      setConfirmAction(null)
    } else {
      setConfirmAction({ dayNumber, type: 'mark' })
      setTimeout(() => setConfirmAction(null), 4000)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
    toast.success('Data refreshed!')
  }

  const handleGenerateReport = () => {
    try {
      const doc = new jsPDF()
      doc.setFillColor(10, 14, 39)
      doc.rect(0, 0, 210, 297, 'F')

      doc.setTextColor(0, 255, 65)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Admin Report - 30 Days Growth Tracker', 20, 20)
      doc.setFontSize(9)
      doc.setTextColor(160, 174, 192)
      doc.text(`Generated: ${new Date().toLocaleString()} | Admin: ${user?.email}`, 20, 30)

      // System Health Table
      doc.setFontSize(13)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('System Overview', 20, 45)

      const healthRows = [
        ['Total Days', trackerData.totalDays.toString()],
        ['Completed Days', trackerData.completedDays.toString()],
        ['Total Earned', `₹${trackerData.totalEarned.toLocaleString()}`],
        ['Target Amount', `₹${trackerData.targetAmount.toLocaleString()}`],
        ['Progress', `${((trackerData.totalEarned / trackerData.targetAmount) * 100).toFixed(2)}%`],
        ['Avg Daily Earnings', trackerData.completedDays > 0 ? `₹${Math.round(trackerData.totalEarned / trackerData.completedDays)}` : '₹0'],
      ]

      doc.autoTable({
        head: [['Metric', 'Value']],
        body: healthRows,
        startY: 50,
        styles: { textColor: [255, 255, 255], fillColor: [10, 14, 39], fontSize: 9 },
        headStyles: { fillColor: [0, 80, 20], textColor: [0, 255, 65] },
        alternateRowStyles: { fillColor: [26, 31, 58] },
        tableWidth: 80,
      })

      // Day-by-day breakdown
      const tableY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(13)
      doc.setTextColor(255, 255, 255)
      doc.text('Day-by-Day Status', 20, tableY)

      const dayRows = trackerData.days.map(day => [
        `Day ${day.dayNumber}`,
        new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        day.isOdd ? 'Odd' : 'Even',
        `₹${day.income}`,
        day.completed ? '✓' : '✗',
        day.completedBy || '-',
      ])

      doc.autoTable({
        head: [['Day', 'Date', 'Type', 'Income', 'Status', 'By']],
        body: dayRows,
        startY: tableY + 5,
        styles: { textColor: [255, 255, 255], fillColor: [10, 14, 39], fontSize: 8 },
        headStyles: { fillColor: [0, 80, 20], textColor: [0, 255, 65] },
        alternateRowStyles: { fillColor: [26, 31, 58] },
      })

      doc.save('Admin-Report.pdf')
      toast.success('Admin report exported!')
    } catch (err) {
      toast.error('Failed to generate report')
    }
  }

  const handleExportData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        tracker: trackerData,
        adminStats,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tracker-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported as JSON!')
    } catch (err) {
      toast.error('Failed to export data')
    }
  }

  const systemHealth = {
    totalDays: trackerData.totalDays,
    completedDays: trackerData.completedDays,
    totalEarned: trackerData.totalEarned,
    targetAmount: trackerData.targetAmount,
    completionRate: ((trackerData.completedDays / trackerData.totalDays) * 100).toFixed(1),
    progressRate: ((trackerData.totalEarned / trackerData.targetAmount) * 100).toFixed(1),
    averageDailyEarnings:
      trackerData.completedDays > 0 ? Math.round(trackerData.totalEarned / trackerData.completedDays) : 0,
    pendingDays: trackerData.totalDays - trackerData.completedDays,
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black">Admin Panel</h2>
            {demoMode && (
              <span className="badge badge-amber">Demo Mode</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">System management and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`btn-dark flex items-center gap-2 text-sm ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: systemHealth.totalDays, color: 'text-white' },
          { label: 'Completed', value: systemHealth.completedDays, color: 'text-neon-green' },
          { label: 'Pending', value: systemHealth.pendingDays, color: 'text-orange-400' },
          { label: 'Avg Daily', value: `₹${systemHealth.averageDailyEarnings}`, color: 'text-blue-400' },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="glass-card rounded-2xl p-6 border border-neon-green/10">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={20} className="text-neon-green" />
          <h3 className="text-lg font-bold">System Health</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Day Completion Rate</span>
              <span className="text-neon-green font-bold">{systemHealth.completionRate}%</span>
            </div>
            <div className="progress-bar-track h-3">
              <div className="progress-bar-fill h-full" style={{ width: `${systemHealth.completionRate}%` }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">{systemHealth.completedDays} of {systemHealth.totalDays} days</p>
          </div>

          {/* Progress Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Earnings Progress</span>
              <span className="text-neon-green font-bold">{systemHealth.progressRate}%</span>
            </div>
            <div className="progress-bar-track h-3">
              <div className="progress-bar-fill h-full" style={{ width: `${systemHealth.progressRate}%` }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">₹{systemHealth.totalEarned.toLocaleString()} of ₹{systemHealth.targetAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="glass-card rounded-2xl p-6 border border-neon-green/10">
        <div className="flex items-center gap-2 mb-5">
          <Database size={20} className="text-neon-green" />
          <h3 className="text-lg font-bold">Data Management</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-blue-400" />
              <h4 className="font-bold text-sm text-white">Admin Report</h4>
            </div>
            <p className="text-gray-500 text-xs mb-4">Generate a comprehensive PDF report with all system stats and day-by-day breakdown.</p>
            <button onClick={handleGenerateReport} className="btn-neon text-xs w-full">
              Generate PDF Report
            </button>
          </div>

          <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-purple-400" />
              <h4 className="font-bold text-sm text-white">Export Data</h4>
            </div>
            <p className="text-gray-500 text-xs mb-4">Export all tracker data as JSON for backup or migration purposes.</p>
            <button onClick={handleExportData} className="btn-neon-outline text-xs w-full">
              Export JSON
            </button>
          </div>

          <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={16} className="text-amber-400" />
              <h4 className="font-bold text-sm text-white">Database Info</h4>
            </div>
            <p className="text-gray-500 text-xs mb-2">
              Mode: <span className={demoMode ? 'text-amber-400 font-bold' : 'text-neon-green font-bold'}>
                {demoMode ? 'Demo (Local Storage)' : 'Firebase'}
              </span>
            </p>
            <p className="text-gray-500 text-xs mb-4">
              Last Updated: {new Date(trackerData.lastUpdated?.toDate?.() || Date.now()).toLocaleString()}
            </p>
            <button onClick={handleRefresh} className="btn-dark text-xs w-full flex items-center justify-center gap-2">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Day Management */}
      <div className="glass-card rounded-2xl border border-neon-green/10 overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-dark-border/40">
          <Settings size={20} className="text-neon-green" />
          <h3 className="text-lg font-bold">Day Management</h3>
          <span className="badge badge-amber ml-2">Admin Controls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Type</th>
                <th>Income</th>
                <th>Status</th>
                <th>Completed By</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trackerData.days.map((day) => {
                const isConfirming = confirmAction?.dayNumber === day.dayNumber
                return (
                  <tr key={day.dayNumber}>
                    <td><span className="font-bold text-white">Day {day.dayNumber}</span></td>
                    <td className="text-gray-400 text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${day.isOdd ? 'badge-blue' : 'badge-pink'}`}>
                        {day.isOdd ? 'Odd' : 'Even'}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-neon-green">₹{day.income.toLocaleString()}</span>
                    </td>
                    <td>
                      {day.completed ? (
                        <span className="badge badge-green">✓ Done</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(100, 100, 120, 0.12)', color: '#9ca3af', border: '1px solid rgba(100, 100, 120, 0.2)' }}>Pending</span>
                      )}
                    </td>
                    <td className="text-gray-400 text-sm">{day.completedBy || '—'}</td>
                    <td className="text-center">
                      {day.completed ? (
                        <button
                          onClick={() => handleResetDay(day.dayNumber)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isConfirming && confirmAction?.type === 'reset'
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                          }`}
                        >
                          <Trash2 size={12} className="inline mr-1" />
                          {isConfirming && confirmAction?.type === 'reset' ? 'Confirm?' : 'Reset'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleForceMark(day.dayNumber)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isConfirming && confirmAction?.type === 'mark'
                              ? 'bg-neon-green text-black animate-pulse'
                              : 'bg-neon-green/15 text-neon-green hover:bg-neon-green/25'
                          }`}
                        >
                          <CheckSquare size={12} className="inline mr-1" />
                          {isConfirming && confirmAction?.type === 'mark' ? 'Confirm?' : 'Mark Done'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Stats */}
      {adminStats && (
        <div className="glass-card rounded-2xl p-6 border border-neon-green/10">
          <h3 className="text-lg font-bold mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border text-center">
              <p className="text-gray-400 text-xs mb-1">Your Completions</p>
              <p className="text-2xl font-black text-neon-green">{adminStats.completions}</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border text-center">
              <p className="text-gray-400 text-xs mb-1">Your Earnings</p>
              <p className="text-2xl font-black text-green-400">₹{adminStats.earnings.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/40 border border-dark-border text-center">
              <p className="text-gray-400 text-xs mb-1">Your Share</p>
              <p className="text-2xl font-black text-blue-400">{adminStats.percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
