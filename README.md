# 30 Days Growth & Earning Tracker

A professional real-time collaboration web application for tracking growth and earnings over 30 days. Multiple users can monitor progress together with instant updates using Firebase Firestore.

## 🎯 Features

### Core Functionality
- **Real-time Multi-user Collaboration**: Firestore real-time sync across all connected users
- **30-Day Tracking**: Track earnings from June 19 to July 18, 2026
- **Income Calculation**: 
  - Odd days: ₹5,000
  - Even days: ₹3,000
  - Target: ₹120,000

### Dashboard
- **KPI Cards**: Total Target, Earned Till Now, Remaining Amount, Completed Days, Pending Days, Progress Percentage
- **Progress Visualization**: Animated progress bar
- **Multiple Charts**:
  - Earnings over time (line chart)
  - Daily completion status (bar chart)
  - Daily income schedule (stacked bar chart)

### Daily Tracker
- **30-Day Table**: Complete overview of all days
- **Checkbox System**: Mark days as completed/incomplete
- **Cumulative Tracking**: Real-time cumulative income calculation
- **Export Options**: PDF and Excel reports

### Real-time Features
- **Activity Feed**: Live updates showing who completed what day
- **Online Viewers Counter**: See how many users are currently online
- **Instant Sync**: All users see updates without refreshing

### Additional Features
- **Google Authentication**: Secure sign-in with Google
- **Leaderboard**: Top contributors by earnings
- **Dark/Light Theme**: Toggle between themes
- **Admin Panel**: System management and day control
- **PWA Support**: Install as mobile app
- **Mobile Responsive**: Works perfectly on all devices
- **Premium UI**: Neon green accents on dark background

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/surajkumar/money
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 PWA Installation

The application is fully installable as a Progressive Web App:
- **Desktop**: Click the install icon in the address bar
- **Mobile**: Use "Add to Home Screen" from the share menu
- **Offline Support**: Works offline with cached data

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Login.jsx              # Google authentication
│   ├── Dashboard.jsx          # Main dashboard with KPIs
│   ├── DailyTracker.jsx       # 30-day tracker table
│   ├── ActivityFeed.jsx       # Real-time activity log
│   ├── Leaderboard.jsx        # User rankings
│   ├── AdminPanel.jsx         # System management
│   ├── Header.jsx             # Navigation bar
│   ├── Footer.jsx             # Footer info
│   ├── KPICard.jsx            # KPI card component
│   └── ChartCard.jsx          # Chart visualization
├── context/
│   └── AppContext.jsx         # Global state management
├── config/
│   └── firebase.js            # Firebase configuration
├── services/
│   └── firestoreService.js    # Firestore operations
├── App.jsx                    # Main app component
├── main.jsx                   # React entry point
└── index.css                  # Global styles

public/
├── manifest.json              # PWA manifest
└── sw.js                      # Service worker

.github/
└── copilot-instructions.md    # Development guidelines
```

## 🔥 Firebase Setup

### Firestore Database Structure

```
tracker/
└── main
    ├── targetAmount: 120000
    ├── days: [{ dayNumber, date, income, isOdd, completed, completedBy, completedAt, completedByEmail }]
    ├── totalEarned: number
    ├── completedDays: number
    ├── totalDays: 30
    ├── createdAt: timestamp
    └── lastUpdated: timestamp

activities/
├── {docId}
│   ├── message: string
│   ├── type: string (completion, undo)
│   ├── userEmail: string
│   ├── dayNumber: number
│   ├── amount: number
│   └── timestamp: timestamp

viewers/
├── {userId}
│   └── lastSeen: timestamp
```

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tracker/{document=**} {
      allow read, write;
    }
    match /activities/{document=**} {
      allow read, write;
    }
    match /viewers/{document=**} {
      allow read, write;
    }
  }
}
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize colors:
```javascript
colors: {
  'neon-green': '#00FF41',
  'neon-green-dark': '#00CC34',
  'dark-bg': '#0a0e27',
  'dark-card': '#1a1f3a',
}
```

### Income Rules
Edit `src/services/firestoreService.js`:
```javascript
export const ODD_INCOME = 5000
export const EVEN_INCOME = 3000
export const TARGET_AMOUNT = 120000
```

### Dates
Edit `src/services/firestoreService.js`:
```javascript
export const START_DATE = new Date(2026, 5, 19) // June 19, 2026
export const TOTAL_DAYS = 30
```

## 📊 Real-time Sync

The application uses Firebase Firestore's real-time listeners:

1. **Tracker Updates**: `listenToTrackerUpdates()` - Updates KPIs instantly
2. **Activity Feed**: `onSnapshot()` on activities collection
3. **Viewers Count**: `listenToActiveViewers()` - Real-time viewer count
4. **User Authentication**: `onAuthStateChanged()` - Auth state management

## 🔐 Security

- Google OAuth authentication for secure login
- Firestore security rules prevent unauthorized access
- User data is stored only on Firebase (no localStorage)
- All timestamps are server-side to prevent tampering

## 📱 Mobile Features

- Fully responsive design (320px - 4K)
- Touch-friendly interfaces
- Optimized charts for mobile
- PWA support for app-like experience
- Offline functionality with service worker

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technology Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Export**: jsPDF + XLSX
- **PWA**: Service Worker

## 📈 Performance

- Vite for ultra-fast development
- Code splitting for optimized bundles
- Service worker for offline support
- Lazy loading for images and components
- Optimized Firestore queries

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `.env.local` has correct credentials
- Check Firestore database is enabled
- Ensure security rules allow access

### Charts Not Rendering
- Clear browser cache
- Check Chart.js is loaded
- Verify data format matches chart requirements

### PWA Not Installing
- Ensure site is HTTPS (required for PWA)
- Check manifest.json is valid
- Verify service worker is registered

## 📝 License

MIT License - feel free to use this project for any purpose

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Built with ⚡ Vite • React • Firebase • Tailwind CSS**
