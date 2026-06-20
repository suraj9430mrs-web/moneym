import React, { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToAuth } from '../services/authService'
import { listenToTrackerUpdates } from '../services/firestoreService'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trackerData, setTrackerData] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [viewers, setViewers] = useState(0)

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  // Listen to tracker data
  useEffect(() => {
    const unsubscribe = listenToTrackerUpdates((data) => {
      if (data) {
        setTrackerData(data)
      }
    })
    return unsubscribe
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const value = {
    user,
    loading,
    trackerData,
    theme,
    toggleTheme,
    viewers,
    setViewers,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
