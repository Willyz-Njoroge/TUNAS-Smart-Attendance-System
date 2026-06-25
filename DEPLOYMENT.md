# TUNAS Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Ensure your `.env` (local dev) and `.env.production` (production) have:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_VERCEL_URL=https://tunas.vercel.app  # (optional, set by Vercel)
```

### 2. Supabase Database
- [ ] Run migration `001_create_attendees_table.sql`
- [ ] Run migration `002_migrate_attendees_from_json.sql` (if you have old data)
- [ ] Enable RLS on `lecturers`, `classes`, `attendees` tables (production)
- [ ] Test auth flow (register/login) in local dev

### 3. Build & Test Locally
```bash
npm run build
npm run preview
```
Then test the production build at http://localhost:4173

### 4. GitHub Setup (if using Vercel GitHub integration)
- [ ] Push code to GitHub repo
- [ ] Ensure `.env` and `.env.production` are in `.gitignore` (never commit secrets)

---

## Deploy to Vercel

### Option A: Vercel CLI (fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```
Then set environment variables in the Vercel prompt or dashboard.

### Option B: Vercel Dashboard (GitHub integration)
1. Go to https://vercel.com
2. Click "New Project" → Import GitHub repo
3. Add environment variables in "Settings" → "Environment Variables"
4. Deploy

---

## Post-deployment

### 1. Test the Deployment
- Open https://your-domain.vercel.app
- Test login/register flow
- Test QR generation and attendance marking

### 2. Set Up Custom Domain (optional)
- In Vercel → Project Settings → Domains
- Add your custom domain (e.g., tunas.tharaka.university)

### 3. Monitor & Logs
- View build logs in Vercel dashboard
- Check Supabase logs for errors

### 4. CORS & Security
- If frontend deployed at different domain than Supabase, ensure CORS is enabled:
  - Supabase Settings → Auth → CORS Allowed Origins → add your Vercel URL
- Enable Row-Level Security (RLS) on all tables for production

---

## Environment Variables Reference

| Variable                    | Example                                 | Required | Notes                                          |
|-----------------------------|-----------------------------------------|----------|------------------------------------------------|
| VITE_SUPABASE_URL           | https://abc123.supabase.co             | ✓        | From Supabase project settings                |
| VITE_SUPABASE_ANON_KEY      | eyJhbGc... (long string)               | ✓        | From Supabase project settings (public)       |
| VITE_VERCEL_URL             | https://tunas.vercel.app                |          | Auto-set by Vercel; optional, used for QR URL |
| VITE_LOG_LEVEL              | info, debug, warn, error                |          | Optional; default is 'info'                    |

---

## Troubleshooting

### "NetworkError when attempting to fetch resource"
- Check `.env` has correct Supabase URL and Anon Key
- Verify CORS is enabled in Supabase Auth settings
- Check browser Console for exact error message

### Build fails with "Module not found"
- Ensure all imports use correct paths (especially `/public/` assets)
- Run `npm install` to install any missing deps

### QR code not generating
- Verify `VITE_VERCEL_URL` is set correctly (used in QR link generation in `ClassSchedule.jsx`)
- Or manually edit `ClassSchedule.jsx` to hardcode your domain

### Login/Registration fails
- Ensure Supabase `lecturers` table exists
- Check browser Console for auth errors
- Verify Supabase auth is enabled and email/password provider is turned on

---

## Rollback
If deployment breaks:
```bash
vercel rollback
```
Or redeploy the previous commit.
