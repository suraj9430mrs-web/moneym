# Configuration Reference

## Easy Configuration

All customizable values are in two files:

### 1. Income & Date Configuration
**File**: `src/services/firestoreService.js`

```javascript
// Change these values to customize your tracker:

// Daily income for odd-numbered days (e.g., Day 1, 3, 5)
export const ODD_INCOME = 5000

// Daily income for even-numbered days (e.g., Day 2, 4, 6)
export const EVEN_INCOME = 3000

// Total target amount for 30 days
export const TARGET_AMOUNT = 120000

// Start date (June 19, 2026)
// Format: new Date(YEAR, MONTH-1, DAY)
export const START_DATE = new Date(2026, 5, 19)

// Total number of days to track
export const TOTAL_DAYS = 30
```

### 2. Theme & Colors
**File**: `tailwind.config.js`

```javascript
colors: {
  'neon-green': '#00FF41',           // Primary accent color
  'neon-green-dark': '#00CC34',      // Darker green for hover
  'dark-bg': '#0a0e27',              // Main background
  'dark-card': '#1a1f3a',            // Card background
  'dark-border': '#2d3748',          // Border color
}
```

### 3. Project Metadata
**File**: `public/manifest.json`

```json
{
  "name": "30 Days Growth & Earning Tracker",
  "short_name": "Growth Tracker",
  "description": "Real-time collaboration dashboard for tracking earnings",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#00FF41",
  "background_color": "#0a0e27"
}
```

## Examples

### Change Income Structure

For a 60-day tracker earning ₹2000/day:

```javascript
// src/services/firestoreService.js
export const ODD_INCOME = 2000
export const EVEN_INCOME = 2000
export const TARGET_AMOUNT = 120000  // 60 days × ₹2000
export const TOTAL_DAYS = 60
export const START_DATE = new Date(2026, 5, 19)  // June 19, 2026
```

### Change Start Date

For a tracker starting July 1, 2026:

```javascript
// Month is 0-indexed: 0=Jan, 1=Feb... 6=July
export const START_DATE = new Date(2026, 6, 1)
```

### Change Target Amount

For a ₹250,000 target:

```javascript
export const TARGET_AMOUNT = 250000
```

### Change Theme Color

For a bright blue theme:

```javascript
// tailwind.config.js
colors: {
  'neon-green': '#00BFFF',
  'neon-green-dark': '#0099CC',
  // ... rest remains the same
}
```

## Environment Variables

**File**: `.env.local`

```env
# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyD1234567890ABCDEF...
VITE_FIREBASE_AUTH_DOMAIN=growth-tracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=growth-tracker-12345
VITE_FIREBASE_STORAGE_BUCKET=growth-tracker-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456...
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Optional: Google OAuth Client ID for production
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

## Component Configuration

### Dashboard
**File**: `src/components/Dashboard.jsx`

- KPI cards are auto-generated from `trackerData`
- Charts automatically update with real-time data
- No manual configuration needed

### Daily Tracker
**File**: `src/components/DailyTracker.jsx`

- Pagination: 10 items per page (can be changed)
- Export formats: PDF and Excel
- Real-time updates from Firestore

### Leaderboard
**File**: `src/components/Leaderboard.jsx`

- Sorted by earnings (descending)
- Shows medal icons for top 3
- Real-time updates

### Activity Feed
**File**: `src/components/ActivityFeed.jsx`

- Shows 50 most recent activities
- Real-time listener on `activities` collection
- Time formatting (ago, ago, etc.)

## Firestore Security Rules

**Location**: Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tracker data - read/write for authenticated users
    match /tracker/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Activity log - read/write for authenticated users
    match /activities/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Viewer tracking - read/write for authenticated users
    match /viewers/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Build Configuration

**File**: `vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,              // Development server port
    open: true               // Auto-open in browser
  },
  build: {
    outDir: 'dist',          // Output directory
    sourcemap: true          // Source maps for debugging
  }
})
```

**File**: `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",   // Scan these files for Tailwind classes
  ],
  darkMode: 'class',         // Dark mode support
  theme: {
    extend: {
      // Custom colors, fonts, animations...
    },
  },
  plugins: [],
}
```

## Production Optimization

### To reduce bundle size:

1. **Enable code splitting** in `vite.config.js`:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'chart': ['chart.js', 'react-chartjs-2'],
        'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
      }
    }
  }
}
```

2. **Use dynamic imports** for pages:
```javascript
const Dashboard = lazy(() => import('./components/Dashboard'))
```

3. **Optimize images** (if added):
```bash
npm install -D vite-plugin-imagemin
```

## API Integration Points

### Real-time Listeners
```javascript
// src/services/firestoreService.js
listenToTrackerUpdates(callback)  // Real-time tracker updates
listenToActiveViewers(callback)   // Active viewers count
```

### Data Operations
```javascript
markDayCompleted(dayNumber, user)      // Mark day as done
markDayIncomplete(dayNumber)           // Undo day completion
addActivity(message, type, email, ...) // Log activity
getLeaderboard()                       // Get top users
getUserStatistics(email)               // Get user stats
```

## Deployment Configuration

### Firebase Hosting
**File**: `firebase.json` (auto-generated)
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Vercel
**File**: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Environment for Production
```env
# In .env.production
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=production.firebaseapp.com
# ... rest of credentials
```

## Customization Examples

### 1-Month vs 3-Month Tracker

```javascript
// 1 Month (current)
export const TOTAL_DAYS = 30
export const START_DATE = new Date(2026, 5, 19)

// 3 Months
export const TOTAL_DAYS = 90
export const START_DATE = new Date(2026, 5, 1)  // June 1, 2026
```

### Daily vs Weekly Targets

```javascript
// Daily tracking (current)
export const ODD_INCOME = 5000
export const EVEN_INCOME = 3000

// Weekly tracking
export const ODD_INCOME = 35000   // ₹5K × 7 days
export const EVEN_INCOME = 21000  // ₹3K × 7 days
export const TOTAL_DAYS = 52
```

### Theme Presets

**Dark Purple**:
```javascript
'neon-green': '#B000FF',  // Purple
'dark-bg': '#0a0a15',
```

**Dark Gold**:
```javascript
'neon-green': '#FFD700',  // Gold
'dark-bg': '#1a1410',
```

**Dark Cyan**:
```javascript
'neon-green': '#00D9FF',  // Cyan
'dark-bg': '#0a1515',
```

---

All changes take effect after:
1. Updating the configuration file
2. Restarting the dev server (`npm run dev`)
3. Clearing browser cache if needed

For production, run `npm run build` after changes.
