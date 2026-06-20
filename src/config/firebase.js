import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Explicit demo mode flag — set to "true" by GitHub Actions when no secrets configured
const explicitDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// API key presence check — secondary guard
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || ''
const hasDummyKey =
  !apiKey ||
  apiKey.trim() === '' ||
  apiKey.includes('Dummy') ||
  apiKey.includes('dummy') ||
  apiKey.includes('your_') ||
  apiKey === 'undefined' ||
  apiKey === 'demo-mode' ||
  apiKey.startsWith('demo') ||
  apiKey.length < 20

export const isDemo = explicitDemoMode || hasDummyKey

let auth, db, googleProvider, app

if (!isDemo) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()
    console.log('✅ Firebase initialized — real-time mode active')
  } catch (e) {
    console.warn('⚠️ Firebase init failed, falling back to demo mode:', e.message)
    app = null
    auth = null
    db = null
    googleProvider = null
  }
} else {
  console.log('ℹ️ Running in demo mode — data stored locally')
  app = null
  auth = null
  db = null
  googleProvider = null
}

export { auth, db, googleProvider }
export default app
