import { logout } from '../services/authService'
import { useAppContext } from '../context/AppContext'
import { isDemoMode } from '../services/authService'
import { Menu, X, LogOut, Moon, Sun, Share2, Users, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useToast } from './Toast'

function Header({ currentView, setCurrentView }) {
  const { user, theme, toggleTheme, viewers } = useAppContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const toast = useToast()
  const demoMode = isDemoMode()

  const handleLogout = async () => {
    await logout()
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: '30 Days Growth & Earning Tracker',
          text: 'Track our 30-day earning journey in real-time!',
          url,
        })
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('🔗 Link copied to clipboard!')
    }).catch(() => {
      toast.info('Share: ' + text)
    })
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tracker', label: 'Tracker', icon: '✅' },
    { id: 'activity', label: 'Activity', icon: '📡' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ]

  if (user?.email === 'admin@example.com') {
    navItems.push({ id: 'admin', label: 'Admin', icon: '⚙️' })
  }

  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <header className="sticky top-0 z-50 glass-effect-strong border-b border-neon-green/15">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-neon-green/15 border border-neon-green/30 flex items-center justify-center group-hover:bg-neon-green/25 transition-all">
              <TrendingUp size={16} className="text-neon-green" />
            </div>
            <span className="text-lg font-black neon-text-subtle hidden sm:block">30 Days</span>
            {demoMode && (
              <span className="badge badge-amber text-xs hidden md:inline-flex animate-pulse">
                Demo
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-neon-green text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Viewers */}
            {viewers > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-effect border border-neon-green/15 text-xs text-gray-400">
                <Users size={12} className="text-neon-green" />
                <span>{viewers} online</span>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-xl glass-effect border border-dark-border hover:border-neon-green/40 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              title="Share this dashboard"
              className="w-9 h-9 rounded-xl glass-effect border border-dark-border hover:border-neon-green/40 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <Share2 size={16} />
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-dark-border/60 ml-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: 'rgba(0, 255, 65, 0.15)', color: '#00FF41' }}
              >
                {userInitial.toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-tight">{user?.displayName || 'User'}</p>
                <p className="text-gray-500 text-xs leading-tight truncate max-w-28">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="w-9 h-9 rounded-xl glass-effect border border-dark-border hover:border-red-500/40 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all ml-1"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl glass-effect border border-dark-border flex items-center justify-center text-gray-400"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl glass-effect border border-dark-border flex items-center justify-center text-gray-400"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-dark-border/40 pt-3 animate-slide-in">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-3 mb-3 glass-effect rounded-xl border border-dark-border">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm bg-neon-green/15 text-neon-green">
                {userInitial.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.displayName || 'User'}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl mb-1.5 transition-all font-semibold text-sm ${
                  currentView === item.id
                    ? 'bg-neon-green text-black'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleShare}
                className="flex-1 btn-dark flex items-center justify-center gap-2 text-sm"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm border border-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
