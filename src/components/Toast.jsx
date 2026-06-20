import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be within ToastProvider')
  return ctx
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Entrance
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-remove
    const t2 = setTimeout(() => {
      setLeaving(true)
      setTimeout(() => onRemove(toast.id), 350)
    }, toast.duration)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast, onRemove])

  const handleClose = () => {
    setLeaving(true)
    setTimeout(() => onRemove(toast.id), 350)
  }

  const configs = {
    success: {
      icon: <CheckCircle size={18} />,
      accent: '#00FF41',
      bg: 'rgba(0, 255, 65, 0.08)',
      border: 'rgba(0, 255, 65, 0.3)',
    },
    error: {
      icon: <AlertCircle size={18} />,
      accent: '#f87171',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    info: {
      icon: <Info size={18} />,
      accent: '#64c8ff',
      bg: 'rgba(100, 200, 255, 0.08)',
      border: 'rgba(100, 200, 255, 0.3)',
    },
    warning: {
      icon: <Zap size={18} />,
      accent: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.08)',
      border: 'rgba(251, 191, 36, 0.3)',
    },
  }

  const config = configs[toast.type] || configs.info

  return (
    <div
      className="pointer-events-auto w-full rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-2xl"
      style={{
        background: 'rgba(15, 20, 40, 0.95)',
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${config.border}`,
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.96)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ color: config.accent, marginTop: '1px', flexShrink: 0 }}>
        {config.icon}
      </div>
      <p className="text-sm font-medium text-gray-100 flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-300 transition-colors ml-1 flex-shrink-0 mt-0.5"
      >
        <X size={16} />
      </button>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
        style={{
          background: config.accent,
          opacity: 0.4,
          animation: `shrink ${toast.duration}ms linear forwards`,
        }}
      />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default ToastProvider
