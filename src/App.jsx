import { useState, useEffect } from 'react'
import { AppProvider, useAppContext } from './context/AppContext'
import { ToastProvider } from './components/Toast'
import { initializeTracker, listenToActiveViewers, addViewer } from './services/firestoreService'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import DailyTracker from './components/DailyTracker'
import ActivityFeed from './components/ActivityFeed'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import Header from './components/Header'
import Footer from './components/Footer'
import { TrendingUp } from 'lucide-react'

function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 255, 65, 0.05))',
              border: '1px solid rgba(0, 255, 65, 0.3)',
            }}
          >
            <TrendingUp size={36} className="text-neon-green" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-neon-green border-t-transparent animate-spin" />
        </div>
        <p className="text-neon-green font-bold">{message}</p>
        <p className="text-gray-600 text-sm mt-1">30 Days Growth Tracker</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, loading, theme, viewers, setViewers } = useAppContext()
  const [currentView, setCurrentView] = useState('dashboard')
  const [initialized, setInitialized] = useState(false)

  // Initialize tracker on first load
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTracker()
        setInitialized(true)
      } catch (error) {
        console.error('Error initializing tracker:', error)
        setInitialized(true) // Don't block the app
      }
    }
    initialize()
  }, [])

  // Setup viewer tracking
  useEffect(() => {
    if (user) {
      addViewer(user.uid)
      const interval = setInterval(() => addViewer(user.uid), 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Listen to active viewers
  useEffect(() => {
    const unsubscribe = listenToActiveViewers((count) => setViewers(count))
    return unsubscribe
  }, [setViewers])

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (loading) return <LoadingScreen message="Loading..." />
  if (!user) return <Login />
  if (!initialized) return <LoadingScreen message="Initializing tracker..." />

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'tracker' && <DailyTracker />}
        {currentView === 'activity' && <ActivityFeed />}
        {currentView === 'leaderboard' && <Leaderboard />}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      <Footer viewers={viewers} />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  )
}

export default App
