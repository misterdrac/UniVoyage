# 🚀 Free Hosting Deployment Guide for UniVoyage

This guide will walk you through deploying your UniVoyage application using:
- **Backend + Database**: Railway (free tier - $5 credit/month)
- **Frontend**: Vercel (free tier)

## 📋 Prerequisites

1. A GitHub account (free)
2. A Railway account (free) - Sign up at [railway.app](https://railway.app) (uses GitHub login)
3. A Vercel account (free) - Sign up at [vercel.com](https://vercel.com)
4. Your API keys ready:
   - OpenWeather API key
   - Geoapify API key
   - Google Gemini API key
   - Amadeus API key and secret (optional)
   - Google OAuth credentials (optional)

## 🗄️ Step 1: Set Up PostgreSQL Database on Railway

1. **Go to Railway Dashboard**: [railway.app](https://railway.app)
2. **Create a New Project**:
   - Click "New Project"
   - Select "Empty Project"
   - Name it: `UniVoyage`

3. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL database
   - **Save the database credentials** (you'll see them in the database service):
     - Click on the PostgreSQL service
     - Go to "Variables" tab
     - Note down: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
     - Or use the `DATABASE_URL` connection string

## 🔧 Step 2: Prepare Your Code for Deployment

### 2.1 Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for deployment"

# Add your fork as origin (if you forked)
git remote add origin https://github.com/YOUR_USERNAME/UniVoyage.git
git branch -M main
git push -u origin main
```

## 🖥️ Step 3: Deploy Backend to Railway

1. **Go to Railway Dashboard** → Your `UniVoyage` project

2. **Add Backend Service**:
   - Click "+ New" → "GitHub Repo"
   - Select your `UniVoyage` repository
   - Railway will detect it's a Spring Boot project automatically

3. **Configure the Service**:
   - Railway will auto-detect Java/Spring Boot
   - **Root Directory**: Set to `backend` (in service settings)
   - Railway will automatically:
     - Detect Maven build
     - Run `./mvnw clean package` (or similar)
     - Start with `java -jar target/univoyage-0.0.1-SNAPSHOT.jar`

4. **Set Root Directory** (if needed):
   - Click on your service
   - Go to "Settings" tab
   - Under "Source", set "Root Directory" to: `backend`

5. **Link the Database**:
   - In your backend service, go to "Variables" tab
   - Click "Reference Variable"
   - Select your PostgreSQL service
   - Railway will automatically add database connection variables

6. **Set Environment Variables**:
   Go to "Variables" tab and add:

   ```
   SPRING_PROFILES_ACTIVE=production
   ```

   **Database Variables** (Railway should auto-add these from the database reference, but verify):
   ```
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

   Or you can use the direct values from your PostgreSQL service variables.

   **JWT Secret** (generate a secure random string):
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```
   ```
   JWT_SECRET=<your-generated-secret>
   ```

   **API Keys**:
   ```
   OPENWEATHER_API_KEY=<your-openweather-key>
   GEOAPIFY_API_KEY=<your-geoapify-key>
   GEMINI_API_KEY=<your-gemini-key>
   AMADEUS_API_KEY=<your-amadeus-key>
   AMADEUS_API_SECRET=<your-amadeus-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/google/callback
   ```

   **CORS** (we'll update this after frontend is deployed):
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

7. **Generate Public URL**:
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"
   - Railway will create a public URL (e.g., `univoyage-backend-production.up.railway.app`)
   - **Save this URL** - you'll need it for the frontend

8. **Deploy**:
   - Railway will automatically deploy when you push to your GitHub repo
   - Or click "Deploy" to trigger a manual deployment
   - Wait for deployment to complete (3-5 minutes)
   - Check "Deployments" tab to see build logs

## 🎨 Step 4: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Your Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `UniVoyage` repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   Click "Environment Variables" and add:

   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

   Replace `your-backend-url.railway.app` with your actual Railway backend URL (from Step 3.7).

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - **Save your frontend URL** (e.g., `https://univoyage.vercel.app`)

## 🔄 Step 5: Update CORS Configuration

1. **Go back to Railway Dashboard** → Your backend service

2. **Update Environment Variable**:
   - Go to "Variables" tab
   - Find or add `CORS_ALLOWED_ORIGINS`
   - Update it to: `https://your-frontend-url.vercel.app`
   - Replace with your actual Vercel frontend URL

3. **Redeploy**:
   - Railway will automatically redeploy when environment variables change
   - Or manually trigger a redeploy from the "Deployments" tab

## ✅ Step 6: Verify Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend-url.railway.app/api/health` (if you have a health endpoint)
3. **Test Database Connection**: Try logging in or registering a user

## 🎯 Important Notes

### Free Tier Limitations:

**Railway Free Tier**:
- ✅ $5 credit/month (usually enough for small projects)
- ✅ No spin-down (service stays active)
- ✅ Free PostgreSQL database included
- ⚠️ Credit usage: ~$0.01/hour for web services, ~$0.013/hour for databases
- ⚠️ If you exceed $5, you'll need to add payment method (but $5 is generous for small apps)

**Vercel Free Tier**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free SSL certificates
- ✅ Global CDN

### Tips:

1. **Monitor Usage**: Check Railway dashboard regularly to monitor credit usage
2. **Database Backups**: Railway provides automatic backups for databases
3. **Custom Domains**: Both Railway and Vercel support custom domains (free SSL)

## 🐛 Troubleshooting

### Backend won't start:
- Check Railway logs (Deployments tab → View logs)
- Verify all environment variables are set correctly
- Ensure database is linked and accessible
- Check that root directory is set to `backend`

### CORS errors:
- Verify `CORS_ALLOWED_ORIGINS` includes your exact Vercel URL (with https://)
- Check that frontend is using the correct `VITE_API_URL`
- Ensure no trailing slashes in URLs

### Database connection errors:
- Verify database credentials in environment variables
- Check that database service is running in Railway
- Ensure database variables are properly referenced

### Frontend can't connect to backend:
- Verify `VITE_API_URL` in Vercel environment variables
- Check that backend URL matches your Railway service URL
- Ensure backend is running (check Railway dashboard)
- Verify backend public domain is generated

### Build fails on Railway:
- Check build logs in Railway deployments
- Ensure `backend` directory contains `pom.xml` and `mvnw`
- Verify Java version compatibility (Railway uses Java 17+ by default)

## 📞 Need Help?

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Check application logs in both Railway and Vercel dashboards
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

---

**Congratulations! Your app should now be live! 🎉**
