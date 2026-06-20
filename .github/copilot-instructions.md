# 30 Days Growth & Earning Tracker

Professional real-time collaboration web application for tracking growth and earnings over 30 days.

## Project Guidelines

- Tech Stack: React 18 + Vite 5, Tailwind CSS, Firebase (Auth + Firestore)
- Design: Premium dark theme with neon green accents
- Real-time Features: Firestore real-time sync, live activity feed, online viewers counter
- Export Options: PDF and Excel reports
- PWA: Full progressive web app support for mobile installation

## Development Standards

- Component Structure: Functional components with hooks
- State Management: React Context for global state, Firestore for data persistence
- Real-time Updates: Firestore listeners for instant sync across users
- Responsive Design: Mobile-first approach with Tailwind CSS
- Dark/Light Theme: CSS custom properties with theme toggle

## Setup Instructions

1. Copy `.env.example` to `.env.local` and add your Firebase credentials
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:3000 in your browser

## Features

- Multi-user real-time collaboration
- 30-day tracking (19 June - 18 July)
- Income calculations (Odd: ₹5,000, Even: ₹3,000)
- Dashboard with KPI cards
- Daily tracker table with completion status
- Multiple chart visualizations
- User authentication via Google
- Admin panel for management
- Activity feed with recent actions
- Online viewers counter
- Leaderboard system
- PDF/Excel export
- PWA support
