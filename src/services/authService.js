import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isMock = !apiKey || apiKey.includes('Dummy') || apiKey.includes('your_') || apiKey === '';

// Active listeners for mock auth
let mockAuthListeners = [];
let currentMockUser = null;

// Load mock user from localStorage if it exists
if (isMock) {
  try {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      currentMockUser = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error('Error loading mock user:', error);
  }
}

export const isDemoMode = () => isMock;

export const loginWithGoogle = async () => {
  if (isMock) {
    return loginAsMockUser('team@example.com', 'Team Member');
  }
  return signInWithPopup(auth, googleProvider);
};

export const loginAsMockUser = async (email, displayName) => {
  if (!isMock) return null;
  const user = {
    uid: 'mock-uid-' + email.replace(/[^a-zA-Z0-9]/g, ''),
    email,
    displayName,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
  };
  currentMockUser = user;
  localStorage.setItem('mock_user', JSON.stringify(user));
  // Notify listeners
  mockAuthListeners.forEach((cb) => cb(user));
  return user;
};

export const logout = async () => {
  if (isMock) {
    currentMockUser = null;
    localStorage.removeItem('mock_user');
    mockAuthListeners.forEach((cb) => cb(null));
    return;
  }
  return firebaseSignOut(auth);
};

export const subscribeToAuth = (callback) => {
  if (isMock) {
    mockAuthListeners.push(callback);
    // Call immediately with current mock user
    callback(currentMockUser);
    return () => {
      mockAuthListeners = mockAuthListeners.filter((cb) => cb !== callback);
    };
  }
  return onAuthStateChanged(auth, callback);
};
