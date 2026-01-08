# 🚀 Quick Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

- [ ] Push code to GitHub repository (your fork)
- [ ] Gather all API keys:
  - [ ] OpenWeather API key
  - [ ] Geoapify API key
  - [ ] Google Gemini API key
  - [ ] Amadeus API key & secret (optional)
  - [ ] Google OAuth credentials (optional)
- [ ] Generate JWT secret: `openssl rand -base64 32` (or use PowerShell command from guide)

## Step 1: Railway Database Setup

- [ ] Sign up/login to Railway: [railway.app](https://railway.app)
- [ ] Create new project: "Empty Project" named `UniVoyage`
- [ ] Add PostgreSQL database:
  - [ ] Click "+ New" → "Database" → "Add PostgreSQL"
  - [ ] Save database credentials from "Variables" tab:
    - [ ] `PGHOST`
    - [ ] `PGPORT`
    - [ ] `PGDATABASE`
    - [ ] `PGUSER`
    - [ ] `PGPASSWORD`
    - [ ] Or note `DATABASE_URL`

## Step 2: Railway Backend Deployment

- [ ] Add new service: "+ New" → "GitHub Repo"
- [ ] Select your `UniVoyage` repository
- [ ] Configure service:
  - [ ] Set Root Directory to: `backend` (in Settings)
  - [ ] Railway should auto-detect Java/Spring Boot
- [ ] Link database:
  - [ ] Go to backend service "Variables" tab
  - [ ] Click "Reference Variable"
  - [ ] Select PostgreSQL service
- [ ] Set environment variables:
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] `DB_HOST=${{Postgres.PGHOST}}` (or direct value)
  - [ ] `DB_PORT=${{Postgres.PGPORT}}` (or direct value)
  - [ ] `DB_NAME=${{Postgres.PGDATABASE}}` (or direct value)
  - [ ] `DB_USERNAME=${{Postgres.PGUSER}}` (or direct value)
  - [ ] `DB_PASSWORD=${{Postgres.PGPASSWORD}}` (or direct value)
  - [ ] `JWT_SECRET=<your-generated-secret>`
  - [ ] `OPENWEATHER_API_KEY=<your-key>`
  - [ ] `GEOAPIFY_API_KEY=<your-key>`
  - [ ] `GEMINI_API_KEY=<your-key>`
  - [ ] `AMADEUS_API_KEY=<your-key>` (if using)
  - [ ] `AMADEUS_API_SECRET=<your-secret>` (if using)
  - [ ] `GOOGLE_CLIENT_ID=<your-id>` (if using)
  - [ ] `GOOGLE_CLIENT_SECRET=<your-secret>` (if using)
  - [ ] `GOOGLE_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/google/callback` (if using)
- [ ] Generate public domain:
  - [ ] Go to "Settings" → "Networking"
  - [ ] Click "Generate Domain"
  - [ ] **Save backend URL**: `https://________________.railway.app`
- [ ] Deploy and wait for completion
- [ ] Check deployment logs for any errors

## Step 3: Vercel Frontend Deployment

- [ ] Sign up/login to Vercel: [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Configure:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Set environment variable:
  - [ ] `VITE_API_URL=https://your-backend-url.railway.app/api` (use your actual Railway backend URL)
- [ ] Deploy
- [ ] **Save frontend URL**: `https://________________.vercel.app`

## Step 4: Final Configuration

- [ ] Update Railway backend environment variable:
  - [ ] Go to backend service "Variables" tab
  - [ ] Add/Update: `CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app` (use your actual frontend URL)
- [ ] Railway will auto-redeploy with new CORS settings

## Step 5: Testing

- [ ] Visit frontend URL and verify it loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API connectivity (check browser console for errors)
- [ ] Verify database connection works

## Optional: Monitor Usage

- [ ] Check Railway dashboard for credit usage
- [ ] Set up usage alerts if needed
- [ ] Monitor deployment logs for any issues

## 🎉 Done!

Your app should now be live and accessible!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
