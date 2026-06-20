import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { markDayCompleted, markDayIncomplete } from '../services/firestoreService'
import { useToast } from './Toast'
import { Check, X, Download, FileText, Table, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

function DailyTracker() {
  const { user, trackerData } = useAppContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingDay, setLoadingDay] = useState(null)
  const [filter, setFilter] = useState('all') // all | completed | pending
  const toast = useToast()
  const itemsPerPage = 10

  if (!trackerData) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    )
  }

  const handleMarkCompleted = async (dayNumber) => {
    setLoadingDay(dayNumber)
    try {
      await markDayCompleted(dayNumber, user)
      toast.success(`✅ Day ${dayNumber} marked as completed!`)
    } catch (err) {
      toast.error(`Failed to mark Day ${dayNumber}`)
    } finally {
      setLoadingDay(null)
    }
  }

  const handleMarkIncomplete = async (dayNumber) => {
    setLoadingDay(dayNumber)
    try {
      await markDayIncomplete(dayNumber)
      toast.info(`↩️ Day ${dayNumber} completion undone`)
    } catch (err) {
      toast.error(`Failed to undo Day ${dayNumber}`)
    } finally {
      setLoadingDay(null)
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFillColor(10, 14, 39)
      doc.rect(0, 0, 210, 297, 'F')
      doc.setTextColor(0, 255, 65)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('30 Days Growth & Earning Tracker', 20, 25)
      doc.setFontSize(10)
      doc.setTextColor(160, 174, 192)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35)
      doc.text(`Total Earned: ₹${trackerData.totalEarned} / ₹${trackerData.targetAmount} (${((trackerData.totalEarned/trackerData.targetAmount)*100).toFixed(1)}%)`, 20, 43)

      const tableData = trackerData.days.map((day) => [
        `Day ${day.dayNumber}`,
        new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        day.isOdd ? 'Odd' : 'Even',
        `₹${day.income.toLocaleString()}`,
        day.completed ? 'Yes' : 'No',
        day.completedBy || '-',
      ])

      doc.autoTable({
        head: [['Day', 'Date', 'Type', 'Income', 'Status', 'Completed By']],
        body: tableData,
        startY: 52,
        styles: { textColor: [255, 255, 255], fillColor: [10, 14, 39], fontSize: 9 },
        headStyles: { fillColor: [0, 80, 20], textColor: [0, 255, 65], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [26, 31, 58] },
        columnStyles: {
          0: { fontStyle: 'bold' },
          4: { fontStyle: 'bold' },
        },
      })

      doc.save('Growth-Tracker-Report.pdf')
      toast.success('PDF exported successfully!')
    } catch (err) {
      toast.error('Failed to export PDF')
    }
  }

  const exportToExcel = () => {
    try {
      const worksheetData = [
        ['30 Days Growth & Earning Tracker Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Day', 'Date', 'Type', 'Daily Income', 'Cumulative Income', 'Completed', 'Completed By', 'Completed At'],
      ]

      let cumulativeIncome = 0
      trackerData.days.forEach((day) => {
        cumulativeIncome += day.completed ? day.income : 0
        worksheetData.push([
          `Day ${day.dayNumber}`,
          new Date(day.date).toLocaleDateString('en-IN'),
          day.isOdd ? 'Odd' : 'Even',
          day.income,
          cumulativeIncome,
          day.completed ? 'Yes' : 'No',
          day.completedBy || '-',
          day.completedAt ? new Date(day.completedAt).toLocaleString() : '-',
        ])
      })

      worksheetData.push([])
      worksheetData.push(['--- Summary ---'])
      worksheetData.push(['Total Target', `₹${trackerData.targetAmount}`])
      worksheetData.push(['Total Earned', `₹${trackerData.totalEarned}`])
      worksheetData.push(['Remaining', `₹${trackerData.targetAmount - trackerData.totalEarned}`])
      worksheetData.push(['Progress', `${((trackerData.totalEarned / trackerData.targetAmount) * 100).toFixed(2)}%`])
      worksheetData.push(['Completed Days', `${trackerData.completedDays} / ${trackerData.totalDays}`])

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      worksheet['!cols'] = [
        { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 },
        { wch: 18 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracker')
      XLSX.writeFile(workbook, 'Growth-Tracker-Report.xlsx')
      toast.success('Excel exported successfully!')
    } catch (err) {
      toast.error('Failed to export Excel')
    }
  }

  // Filter days
  const filteredDays = trackerData.days.filter((day) => {
    if (filter === 'completed') return day.completed
    if (filter === 'pending') return !day.completed
    return true
  })

  const totalPages = Math.ceil(filteredDays.length / itemsPerPage)
  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const startIndex = (safePage - 1) * itemsPerPage
  const paginatedDays = filteredDays.slice(startIndex, startIndex + itemsPerPage)

  const completedCount = trackerData.days.filter(d => d.completed).length
  const pendingCount = trackerData.days.length - completedCount

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">Daily Tracker</h2>
          <p className="text-gray-400 text-sm">Mark your daily completions to track progress</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportToPDF}
            className="btn-neon-outline flex items-center gap-2"
          >
            <FileText size={16} />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="btn-neon flex items-center gap-2"
          >
            <Table size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Days', value: trackerData.days.length, color: 'text-gray-200' },
          { label: 'Completed', value: completedCount, color: 'text-neon-green' },
          { label: 'Pending', value: pendingCount, color: 'text-orange-400' },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: `All (${trackerData.days.length})` },
          { id: 'completed', label: `✅ Completed (${completedCount})` },
          { id: 'pending', label: `⏳ Pending (${pendingCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setFilter(tab.id); setCurrentPage(1) }}
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

      {/* Table */}
      <div className="glass-card rounded-2xl border border-neon-green/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Day</th>
                <th>Date</th>
                <th>Type</th>
                <th>Daily Income</th>
                <th>Cumulative</th>
                <th>Completed By</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDays.map((day, idx) => {
                const absoluteIdx = trackerData.days.indexOf(day)
                const cumulativeIncome = trackerData.days
                  .slice(0, absoluteIdx + 1)
                  .filter((d) => d.completed)
                  .reduce((sum, d) => sum + d.income, 0)

                const isLoading = loadingDay === day.dayNumber

                return (
                  <tr key={day.dayNumber} className={day.completed ? 'opacity-90' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-all ${
                            day.completed
                              ? 'bg-neon-green shadow-[0_0_6px_rgba(0,255,65,0.6)]'
                              : 'bg-gray-600'
                          }`}
                        />
                        <span className={`text-xs font-bold ${day.completed ? 'text-neon-green' : 'text-gray-500'}`}>
                          {day.completed ? 'Done' : 'Open'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-white">Day {day.dayNumber}</span>
                    </td>
                    <td className="text-gray-300">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
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
                      <span className="font-semibold text-gray-200">₹{cumulativeIncome.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="text-gray-300 text-sm">{day.completedBy || '—'}</span>
                    </td>
                    <td className="text-center">
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-neon-green mx-auto" />
                      ) : day.completed ? (
                        <button
                          onClick={() => handleMarkIncomplete(day.dayNumber)}
                          title="Undo completion"
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <X size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkCompleted(day.dayNumber)}
                          title="Mark as completed"
                          className="p-2 rounded-lg text-neon-green hover:text-green-300 hover:bg-neon-green/10 transition-all"
                        >
                          <Check size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {paginatedDays.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No days match the current filter.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="btn-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    safePage === page
                      ? 'bg-neon-green text-black'
                      : 'glass-effect text-gray-400 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="btn-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default DailyTracker
