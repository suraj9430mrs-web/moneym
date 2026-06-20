import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// DEMO_MODE is explicitly set to "true" in GitHub Pages deployment
// or detected from dummy API keys in local dev
const demoModeFlag = import.meta.env.VITE_DEMO_MODE === 'true'
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || ''
const hasDummyKey =
  !apiKey ||
  apiKey === '' ||
  apiKey.includes('Dummy') ||
  apiKey.includes('dummy') ||
  apiKey.includes('your_') ||
  apiKey === 'undefined' ||
  apiKey === 'demo-mode' ||
  apiKey.startsWith('demo') ||
  apiKey.length < 10

export const isDemo = demoModeFlag || hasDummyKey

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
  } catch (e) {
    console.warn('Firebase init failed, running in demo mode:', e.message)
    app = null
    auth = null
    db = null
    googleProvider = null
  }
} else {
  app = null
  auth = null
  db = null
  googleProvider = null
}

export { auth, db, googleProvider }
export default app
