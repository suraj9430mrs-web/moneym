import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { TARGET_AMOUNT } from '../services/firestoreService'

const NEON_GREEN = '#00FF41'
const GRID_COLOR = 'rgba(45, 55, 72, 0.25)'
const TICK_COLOR = '#718096'

function ChartCard({ type, data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!canvasRef.current || !data) return

    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const ctx = canvasRef.current.getContext('2d')
    let chartConfig = {}

    const commonScales = {
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR, drawBorder: false },
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        border: { display: false },
      },
      x: {
        grid: { color: GRID_COLOR, drawBorder: false },
        ticks: { color: TICK_COLOR, font: { size: 10 }, maxRotation: 45 },
        border: { display: false },
      },
    }

    const commonPlugins = {
      legend: {
        labels: {
          color: '#a0aec0',
          font: { size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 20, 40, 0.95)',
        borderColor: 'rgba(0, 255, 65, 0.25)',
        borderWidth: 1,
        titleColor: '#00FF41',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
      },
    }

    if (type === 'earnings') {
      setTitle('Cumulative Earnings Over Time')

      const cumulativeEarnings = []
      let sum = 0
      data.days.forEach((day) => {
        if (day.completed) sum += day.income
        cumulativeEarnings.push(sum)
      })

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 350)
      gradient.addColorStop(0, 'rgba(0, 255, 65, 0.25)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 65, 0.08)')
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0.01)')

      chartConfig = {
        type: 'line',
        data: {
          labels: data.days.map((_, i) => `D${i + 1}`),
          datasets: [
            {
              label: 'Cumulative Earnings',
              data: cumulativeEarnings,
              borderColor: NEON_GREEN,
              backgroundColor: gradient,
              borderWidth: 2.5,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: NEON_GREEN,
              pointBorderColor: '#0a0e27',
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: NEON_GREEN,
            },
            {
              label: 'Target (₹1,20,000)',
              data: Array(data.days.length).fill(TARGET_AMOUNT),
              borderColor: 'rgba(239, 68, 68, 0.5)',
              borderDash: [6, 4],
              borderWidth: 1.5,
              fill: false,
              pointRadius: 0,
              tension: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            ...commonPlugins,
            title: { display: false },
            tooltip: {
              ...commonPlugins.tooltip,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString()}`,
              },
            },
          },
          scales: commonScales,
        },
      }
    } else if (type === 'completion') {
      setTitle('Daily Completion Status')

      const completionByDay = data.days.map((day) => (day.completed ? day.income : 0))

      chartConfig = {
        type: 'bar',
        data: {
          labels: data.days.map((_, i) => `D${i + 1}`),
          datasets: [
            {
              label: 'Earned (₹)',
              data: completionByDay,
              backgroundColor: data.days.map((day) =>
                day.completed ? 'rgba(0, 255, 65, 0.7)' : 'rgba(45, 55, 72, 0.3)'
              ),
              borderColor: data.days.map((day) =>
                day.completed ? NEON_GREEN : 'rgba(45, 55, 72, 0.5)'
              ),
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            ...commonPlugins,
            tooltip: {
              ...commonPlugins.tooltip,
              callbacks: {
                label: (ctx) => {
                  const dayNum = ctx.dataIndex + 1
                  const day = data.days[ctx.dataIndex]
                  if (day.completed) return ` Day ${dayNum}: ₹${ctx.parsed.y.toLocaleString()} ✓`
                  return ` Day ${dayNum}: Pending`
                },
              },
            },
          },
          scales: commonScales,
        },
      }
    } else if (type === 'timeline') {
      setTitle('Daily Income Schedule')

      const dailyIncomes = data.days.map((day) => day.income)

      chartConfig = {
        type: 'bar',
        data: {
          labels: data.days.map((_, i) => `D${i + 1}`),
          datasets: [
            {
              label: 'Daily Income',
              data: dailyIncomes,
              backgroundColor: data.days.map((day) =>
                day.isOdd
                  ? day.completed ? 'rgba(100, 200, 255, 0.85)' : 'rgba(100, 200, 255, 0.35)'
                  : day.completed ? 'rgba(236, 72, 153, 0.85)' : 'rgba(236, 72, 153, 0.35)'
              ),
              borderColor: data.days.map((day) =>
                day.isOdd ? 'rgba(100, 200, 255, 1)' : 'rgba(236, 72, 153, 1)'
              ),
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            ...commonPlugins,
            tooltip: {
              ...commonPlugins.tooltip,
              callbacks: {
                label: (ctx) => {
                  const day = data.days[ctx.dataIndex]
                  const status = day.completed ? '✓ Done' : '⏳ Pending'
                  return ` ₹${ctx.parsed.y.toLocaleString()} (${day.isOdd ? 'Odd' : 'Even'}) — ${status}`
                },
              },
            },
          },
          scales: {
            ...commonScales,
            y: {
              ...commonScales.y,
              title: {
                display: true,
                text: 'Income (₹)',
                color: TICK_COLOR,
                font: { size: 11 },
              },
            },
          },
        },
      }
    }

    chartRef.current = new Chart(ctx, chartConfig)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [data, type])

  const completedCount = data?.days?.filter(d => d.completed).length || 0
  const totalEarned = data?.totalEarned || 0

  const subtitles = {
    earnings: `₹${totalEarned.toLocaleString()} earned so far`,
    completion: `${completedCount} of ${data?.days?.length || 0} days completed`,
    timeline: 'Blue = Odd (₹5K) • Pink = Even (₹3K)',
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-neon-green/10">
      <div className="mb-4">
        <h3 className="font-bold text-white text-base">{title}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{subtitles[type]}</p>
      </div>
      <canvas
        ref={canvasRef}
        height={type === 'timeline' ? '380' : '280'}
        style={{ maxHeight: type === 'timeline' ? '380px' : '280px' }}
      />
    </div>
  )
}

export default ChartCard
