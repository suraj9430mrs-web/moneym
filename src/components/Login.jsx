import { useState } from 'react'
import { loginWithGoogle, loginAsMockUser, isDemoMode } from '../services/authService'
import { Shield, User, TrendingUp, Zap, Users, BarChart3, Award } from 'lucide-react'

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeButton, setActiveButton] = useState(null)
  const demoMode = isDemoMode()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError('Failed to sign in. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (email, name, buttonId) => {
    setLoading(true)
    setActiveButton(buttonId)
    setError('')
    try {
      await loginAsMockUser(email, name)
    } catch (err) {
      setError('Failed to sign in as demo user.')
      console.error('Demo Login error:', err)
    } finally {
      setLoading(false)
      setActiveButton(null)
    }
  }

  const features = [
    { icon: <BarChart3 size={16} />, text: 'Real-time analytics dashboard' },
    { icon: <Users size={16} />, text: 'Multi-user collaboration' },
    { icon: <Award size={16} />, text: 'Live leaderboard rankings' },
    { icon: <Zap size={16} />, text: 'PDF & Excel export' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15) 0%, rgba(0, 255, 65, 0.05) 100%)',
                border: '1px solid rgba(0, 255, 65, 0.3)',
                boxShadow: '0 0 40px rgba(0, 255, 65, 0.15)',
              }}
            >
              <TrendingUp size={40} className="text-neon-green" />
            </div>
          </div>

          <h1 className="text-5xl font-black mb-3">
            <span className="neon-text">30</span>{' '}
            <span className="text-white">Days</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-200 mb-2">Growth & Earning Tracker</h2>
          <p className="text-gray-500 text-sm">Real-time collaboration dashboard</p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8 animate-slide-in"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(15, 20, 40, 0.95) 100%)',
            border: '1px solid rgba(0, 255, 65, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 65, 0.05)',
          }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {demoMode ? 'Choose Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-400 text-sm">
                {demoMode
                  ? 'Select a demo account to explore'
                  : 'Sign in to access your dashboard'}
              </p>
            </div>
            {demoMode && (
              <span className="badge badge-amber animate-pulse">Demo</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171' }}
            >
              <span>⚠️</span>
              {error}
            </div>
          )}

          {demoMode ? (
            <div className="space-y-3 mb-6">
              {/* Admin button */}
              <button
                onClick={() => handleDemoLogin('admin@example.com', 'System Admin', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: activeButton === 'admin' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(26, 31, 58, 0.6)',
                  border: activeButton === 'admin' ? '1px solid rgba(0, 255, 65, 0.4)' : '1px solid rgba(45, 55, 72, 0.6)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0, 255, 65, 0.1)', color: '#00FF41' }}
                  >
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">Administrator</p>
                    <p className="text-gray-400 text-xs">Full system access & day management</p>
                  </div>
                </div>
                <span className="text-neon-green text-sm font-bold group-hover:translate-x-1 transition-transform">
                  {activeButton === 'admin' ? '...' : '→'}
                </span>
              </button>

              {/* Team Member button */}
              <button
                onClick={() => handleDemoLogin('team@example.com', 'Team Member', 'team')}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: activeButton === 'team' ? 'rgba(100, 200, 255, 0.08)' : 'rgba(26, 31, 58, 0.6)',
                  border: activeButton === 'team' ? '1px solid rgba(100, 200, 255, 0.3)' : '1px solid rgba(45, 55, 72, 0.6)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(100, 200, 255, 0.1)', color: '#64c8ff' }}
                  >
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">Team Member</p>
                    <p className="text-gray-400 text-xs">Track progress & mark daily tasks</p>
                  </div>
                </div>
                <span className="text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  {activeButton === 'team' ? '...' : '→'}
                </span>
              </button>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mt-2"
                style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}
              >
                <span className="text-amber-400 text-xs">ℹ️</span>
                <p className="text-amber-400/70 text-xs">Firebase not configured — using local browser storage</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full btn-neon flex items-center justify-center gap-3 mb-6 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          )}

          {/* Features */}
          <div className="border-t pt-5 mt-5" style={{ borderColor: 'rgba(45, 55, 72, 0.5)' }}>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Features</p>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-neon-green">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-xs space-y-1">
          <p>📱 Mobile responsive • 🌙 Dark theme • ⚡ Real-time sync</p>
          <p>Built with React • Vite • Firebase • Tailwind</p>
        </div>
      </div>
    </div>
  )
}

export default Login
