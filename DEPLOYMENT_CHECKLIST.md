# 🚀 Quick Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

- [ ] Push code to GitHub repository
- [ ] Gather all API keys:
  - [ ] OpenWeather API key
  - [ ] Geoapify API key
  - [ ] Google Gemini API key
  - [ ] Amadeus API key & secret (optional)
  - [ ] Google OAuth credentials (optional)
- [ ] Generate JWT secret: `openssl rand -base64 32` (or use PowerShell command from guide)

## Step 1: Render Database Setup

- [ ] Sign up/login to Render: [render.com](https://render.com)
- [ ] Create PostgreSQL database:
  - [ ] Name: `univoyage-db`
  - [ ] Plan: Free
  - [ ] Save database credentials (host, port, name, username, password)

## Step 2: Render Backend Deployment

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Configure:
  - [ ] Root Directory: `backend`
  - [ ] Environment: Java
  - [ ] Build Command: `./mvnw clean package -DskipTests`
  - [ ] Start Command: `java -jar target/univoyage-0.0.1-SNAPSHOT.jar`
- [ ] Set environment variables:
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] `DB_HOST=<from-database>`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_NAME=univoyage_db`
  - [ ] `DB_USERNAME=<from-database>`
  - [ ] `DB_PASSWORD=<from-database>`
  - [ ] `JWT_SECRET=<your-generated-secret>`
  - [ ] `OPENWEATHER_API_KEY=<your-key>`
  - [ ] `GEOAPIFY_API_KEY=<your-key>`
  - [ ] `GEMINI_API_KEY=<your-key>`
  - [ ] `AMADEUS_API_KEY=<your-key>` (if using)
  - [ ] `AMADEUS_API_SECRET=<your-secret>` (if using)
  - [ ] `GOOGLE_CLIENT_ID=<your-id>` (if using)
  - [ ] `GOOGLE_CLIENT_SECRET=<your-secret>` (if using)
  - [ ] `GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/google/callback` (if using)
- [ ] Link PostgreSQL database to web service
- [ ] Deploy and wait for completion
- [ ] **Save backend URL**: `https://________________.onrender.com`

## Step 3: Vercel Frontend Deployment

- [ ] Sign up/login to Vercel: [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Configure:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Set environment variable:
  - [ ] `VITE_API_URL=https://your-backend-url.onrender.com/api` (use your actual backend URL)
- [ ] Deploy
- [ ] **Save frontend URL**: `https://________________.vercel.app`

## Step 4: Final Configuration

- [ ] Update Render backend environment variable:
  - [ ] `CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app` (use your actual frontend URL)
- [ ] Backend will auto-redeploy with new CORS settings

## Step 5: Testing

- [ ] Visit frontend URL and verify it loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API connectivity (check browser console for errors)

## Optional: Keep Backend Active

- [ ] Set up UptimeRobot (free) to ping backend every 5 minutes
  - [ ] Sign up: [uptimerobot.com](https://uptimerobot.com)
  - [ ] Add monitor for: `https://your-backend-url.onrender.com/api/health` (or any endpoint)
  - [ ] Set interval: 5 minutes

## 🎉 Done!

Your app should now be live and accessible!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.

