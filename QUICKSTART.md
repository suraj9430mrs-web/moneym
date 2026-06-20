# 🚀 Quick Start Guide

Get your Growth Tracker running in 5 minutes!

## Step 1: Configure Firebase (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "growth-tracker"
3. Enable Firestore Database
4. Enable Google Authentication
5. Go to Project Settings and copy your config

## Step 2: Add Environment Variables (1 minute)

```bash
cd /Users/surajkumar/money

# Create .env.local from template
cp .env.example .env.local

# Edit .env.local and paste your Firebase credentials
# You can use any text editor
```

**Minimum required in .env.local:**
```env
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
```

## Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

The app opens automatically at http://localhost:3000

## Step 4: Test Real-time Sync (1 minute)

1. Sign in with Google
2. Mark Day 1 as completed ✓
3. Open app in another window → See instant update!
4. Export as PDF/Excel to test reports

## You're Done! 🎉

### What You Can Do Now:

✅ Track 30-day earnings in real-time  
✅ Multi-user collaboration  
✅ View activity feed  
✅ Check leaderboard  
✅ Export reports  
✅ Use on mobile  

### Next Steps:

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Check [README.md](./README.md) for full documentation
- Customize dates, income amounts, and colors
- Deploy to Firebase Hosting or Vercel

### Useful Commands:

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check code quality
```

### Firestore Setup Tips:

⚠️ **Important**: After first app run, update Firestore Security Rules:

1. Go to Firebase Console → Firestore → Rules tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tracker/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /activities/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /viewers/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Features Overview:

**Dashboard**
- 6 KPI cards with real-time updates
- 3 different chart visualizations
- Progress bar with percentage

**Daily Tracker**
- 30-day table with completion status
- Mark days as done/undone
- Export to PDF and Excel
- Cumulative income calculation

**Real-time Features**
- Activity feed (instant updates)
- Online viewers counter
- Live multi-user sync
- No page refresh needed!

**Additional**
- Leaderboard (sorted by earnings)
- Admin panel (manage days)
- Dark/Light theme toggle
- Mobile responsive (PWA installable)

### Troubleshooting:

**"Firebase connection failed?"**
→ Check .env.local has correct values

**"Login not working?"**
→ Verify Google Auth is enabled in Firebase

**"Charts not showing?"**
→ Clear browser cache (Cmd+Shift+Delete)

**"Real-time not syncing?"**
→ Update Firestore security rules

### Need Help?

1. Check [SETUP.md](./SETUP.md) for detailed setup
2. Read [README.md](./README.md) for full docs
3. Check browser console (F12) for errors
4. Verify Firebase security rules are correct

---

**Happy tracking! 📈**
