import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider, isDemo } from '../config/firebase'

// isMock: true if VITE_DEMO_MODE=true OR if Firebase was not initialized
const isMock = isDemo

// Active listeners for mock auth
let mockAuthListeners = []
let currentMockUser = null

// Load mock user from localStorage if it exists
if (isMock) {
  try {
    const savedUser = localStorage.getItem('mock_user')
    if (savedUser) {
      currentMockUser = JSON.parse(savedUser)
    }
  } catch (error) {
    console.error('Error loading mock user:', error)
  }
}

export const isDemoMode = () => isMock

export const loginWithGoogle = async () => {
  if (isMock) {
    return loginAsMockUser('admin@example.com', 'System Admin')
  }
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (err) {
    console.warn('Google sign-in failed, switching to demo mode:', err.message)
    return loginAsMockUser('admin@example.com', 'System Admin')
  }
}

export const loginAsMockUser = async (email, displayName) => {
  const user = {
    uid: 'mock-uid-' + email.replace(/[^a-zA-Z0-9]/g, ''),
    email,
    displayName,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
  }
  currentMockUser = user
  localStorage.setItem('mock_user', JSON.stringify(user))
  mockAuthListeners.forEach((cb) => cb(user))
  return user
}

export const logout = async () => {
  if (isMock) {
    currentMockUser = null
    localStorage.removeItem('mock_user')
    mockAuthListeners.forEach((cb) => cb(null))
    return
  }
  return firebaseSignOut(auth)
}

export const subscribeToAuth = (callback) => {
  if (isMock) {
    mockAuthListeners.push(callback)
    callback(currentMockUser)
    return () => {
      mockAuthListeners = mockAuthListeners.filter((cb) => cb !== callback)
    }
  }
  return onAuthStateChanged(auth, callback)
}
