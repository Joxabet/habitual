# Habitual

A personal habit tracker. Built with React + Tailwind + Supabase. Deployable to Vercel.

## Stack
- **React + Vite** — frontend
- **Tailwind CSS v3** — styling
- **Supabase** — database + magic link auth
- **Vercel** — hosting

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project, go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. In **Authentication → Providers**, make sure **Email** is enabled (magic links work by default)
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Set up env vars locally

```bash
cp .env.example .env.local
# then fill in your Supabase URL and anon key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

### Option A — GitHub + Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In the Vercel project settings, add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel will auto-deploy on every push to `main`

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
# follow the prompts, add env vars when asked
```

### Add your custom domain

In Vercel → Project → Settings → Domains → add your domain.

In Supabase → Authentication → URL Configuration, add your domain to **Redirect URLs** so magic links work on production:
```
https://yourdomain.com
https://yourdomain.com/**
```

---

## Project structure

```
src/
  App.jsx              # Root, auth gate, tab routing
  hooks/
    useAuth.js         # Supabase auth state
    useHabits.js       # CRUD + check-in logic
  lib/
    supabase.js        # Supabase client
    streaks.js         # Streak + week calculations
  screens/
    AuthScreen.jsx     # Magic link sign-in
    TodayScreen.jsx    # Daily view
    StatsScreen.jsx    # Progress + heatmap
  components/
    HabitCard.jsx      # Single habit row
    AddHabitSheet.jsx  # Bottom sheet to create habit
    BottomNav.jsx      # Tab navigation
```

---

## Adding habits

- **Daily** — must complete every day to maintain streak
- **Weekly** — set a target (e.g. gym 3×/week), pips show weekly progress
- **Specific days** — set which days of the week (Mon/Wed/Fri etc.)
