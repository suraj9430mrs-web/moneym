# Setup & Configuration Guide

## Firebase Project Setup

Follow these steps to set up Firebase for the 30 Days Growth Tracker:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: `growth-tracker`
4. Accept the terms and click "Continue"
5. Choose your settings and click "Create project"
6. Wait for project creation to complete

### 2. Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your region (closest to your users)
5. Click **Enable**

### 3. Setup Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write
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

3. Click **Publish**

### 4. Enable Google Authentication

1. Go to **Build** → **Authentication**
2. Click **Get started**
3. In the **Sign-in method** tab, enable **Google**
4. Add your email as a test user (if in development)
5. Click **Save**

### 5. Get Firebase Configuration

1. Click the gear icon ⚙️ → **Project settings**
2. Scroll down to **Your apps** section
3. If no app exists, click **</> Web**
4. Copy the config object (you'll need these values)

### 6. Setup Environment Variables

1. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

2. Fill in the values from your Firebase project:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 7. Google OAuth Setup (Optional - for Production)

For production deployment, you'll need Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Copy the Client ID to `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## Local Development

### Start Development Server

```bash
cd /Users/surajkumar/money
npm run dev
```

The app will open at `http://localhost:3000`

### Project Structure After Installation

```
/Users/surajkumar/money/
├── src/
│   ├── components/          # React components
│   ├── context/             # Global state
│   ├── config/              # Firebase config
│   ├── services/            # Firestore service
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── dist/                    # Production build
├── node_modules/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.local               # Your environment variables (CREATE THIS)
├── .env.example
├── index.html
└── README.md
```

## First Time Setup Checklist

- [ ] Create `.env.local` with Firebase credentials
- [ ] Run `npm install` (already done)
- [ ] Run `npm run dev` to start development server
- [ ] Sign in with Google
- [ ] Dashboard initializes with 30 days
- [ ] Mark a day as completed
- [ ] Check if other users see the update in real-time
- [ ] Verify PDF/Excel export works
- [ ] Test on mobile device

## Firestore Data Structure

Once the app starts, it automatically creates:

```
Firestore Collections:
├── tracker/
│   └── main
│       ├── targetAmount: 120000
│       ├── days: [30 day objects]
│       ├── totalEarned: number
│       ├── completedDays: number
│       ├── totalDays: 30
│       ├── createdAt: timestamp
│       └── lastUpdated: timestamp
├── activities/ (auto-created)
│   └── {auto-generated docs with activity logs}
└── viewers/ (auto-created)
    └── {userId}: {lastSeen: timestamp}
```

## Common Issues

### Issue: "VITE_FIREBASE_API_KEY is undefined"
**Solution**: Make sure `.env.local` exists in the project root with all Firebase credentials

### Issue: "Permission denied" errors in console
**Solution**: Update Firestore security rules to allow read/write for authenticated users

### Issue: Charts not rendering
**Solution**: 
- Clear browser cache (Cmd+Shift+Delete)
- Restart development server (`npm run dev`)
- Check browser console for errors

### Issue: PWA not installing
**Solution**: 
- Make sure you're on HTTPS (required for PWA)
- Check manifest.json is valid
- Clear service worker cache

## Testing

### Test Multi-user Sync
1. Open app in two browser windows/tabs
2. In Window 1: Mark Day 1 as completed
3. In Window 2: Refresh or wait - you should see Day 1 as completed instantly

### Test Real-time Activity Feed
1. Open Activity Feed in one window
2. Mark a day as completed in another window
3. Activity appears instantly in the feed

### Test Leaderboard
1. Have multiple users complete different days
2. Each user will appear on the leaderboard sorted by earnings

## Performance Tips

1. **For Development**: Keep browser DevTools closed to improve performance
2. **For Production**: Use `npm run build` and serve from `dist/` folder
3. **Firestore Queries**: Already optimized with indices (auto-created on first query)
4. **Charts**: Use appropriate time ranges to avoid rendering too much data

## Next Steps

1. **Customize Dates**: Edit `src/services/firestoreService.js`
2. **Change Income Amounts**: Update `ODD_INCOME` and `EVEN_INCOME`
3. **Modify Target**: Change `TARGET_AMOUNT`
4. **Update Colors**: Edit `tailwind.config.js`
5. **Deploy**: Use Firebase Hosting, Vercel, or Netlify

## Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

### Vercel

```bash
npm install -g vercel
npm run build
vercel
```

### Netlify

```bash
npm run build
# Drag and drop 'dist' folder to netlify.com
```

## Support

For issues:
1. Check README.md
2. Look at console errors (F12 → Console)
3. Verify Firebase credentials in `.env.local`
4. Check Firestore security rules
5. Ensure Google OAuth is properly configured

## Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_FIREBASE_API_KEY | Firebase API Key | AIzaSyD... |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase Auth Domain | project.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | Firebase Project ID | my-project-12345 |
| VITE_FIREBASE_STORAGE_BUCKET | Storage Bucket | project.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Messaging Sender ID | 123456789 |
| VITE_FIREBASE_APP_ID | Firebase App ID | 1:123456789:web:abc... |
| VITE_FIREBASE_MEASUREMENT_ID | GA Measurement ID | G-XXXXXXXXXX |
| VITE_GOOGLE_CLIENT_ID | Google OAuth Client ID | ...apps.googleusercontent.com |

All values can be found in Firebase Console → Project Settings → General
