# TRKR - Personal Fitness Tracker

A lightweight, privacy-focused fitness tracking PWA. Track workouts, nutrition, and weight with offline support and cloud sync.

## Features

- 🏃 **Workout Tracking** - Log swim, bike, run, strength, and other activities
- 🍽️ **Food Logging** - Track calories and macros with Open Food Facts search
- ⚖️ **Weight Tracking** - Monitor your weight over time
- 💧 **Water Intake** - Simple daily water tracking
- 📊 **Trends & Stats** - Visualize your progress
- 📱 **PWA** - Install on your phone like a native app
- 🔄 **Offline Support** - Works without internet, syncs when online
- ☁️ **Cloud Sync** - Optional Supabase backend for cross-device sync

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: CSS Modules
- **State**: Zustand (with persistence)
- **Backend**: Supabase (optional)
- **Food API**: Open Food Facts (free, no API key)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase (Optional)

If you want cloud sync:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor
3. Copy `.env.example` to `.env` and add your credentials

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Local-Only Mode

The app works perfectly without Supabase! Data is stored in localStorage.

## License

MIT
