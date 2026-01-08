# 🚀 Free Hosting Deployment Guide for UniVoyage

This guide will walk you through deploying your UniVoyage application completely free using:
- **Backend + Database**: Render (free tier)
- **Frontend**: Vercel (free tier)

## 📋 Prerequisites

1. A GitHub account (free)
2. A Render account (free) - Sign up at [render.com](https://render.com)
3. A Vercel account (free) - Sign up at [vercel.com](https://vercel.com)
4. Your API keys ready:
   - OpenWeather API key
   - Geoapify API key
   - Google Gemini API key
   - Amadeus API key and secret (optional)
   - Google OAuth credentials (optional)

## 🗄️ Step 1: Set Up PostgreSQL Database on Render

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Create a New PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `univoyage-db`
   - Database: `univoyage_db`
   - User: `univoyage_user`
   - Region: Choose closest to you
   - Plan: **Free**
   - Click "Create Database"

3. **Save Database Credentials**:
   - Once created, note down:
     - **Internal Database URL** (you'll need this)
     - **Host**
     - **Port** (usually 5432)
     - **Database Name**
     - **Username**
     - **Password**

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

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/UniVoyage.git
git branch -M main
git push -u origin main
```

### 2.2 Update Frontend API Configuration

After deploying the backend, you'll need to update `frontend/vercel.json` with your actual backend URL.

## 🖥️ Step 3: Deploy Backend to Render

1. **Go to Render Dashboard** → Click "New +" → "Web Service"

2. **Connect Your Repository**:
   - Connect your GitHub account if not already connected
   - Select your `UniVoyage` repository
   - Choose the branch (usually `main`)

3. **Configure the Service**:
   - **Name**: `univoyage-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/univoyage-0.0.1-SNAPSHOT.jar`

4. **Set Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:

   ```
   SPRING_PROFILES_ACTIVE=production
   ```

   **Database Variables** (from your PostgreSQL database):
   ```
   DB_HOST=<your-db-host>
   DB_PORT=5432
   DB_NAME=univoyage_db
   DB_USERNAME=<your-db-username>
   DB_PASSWORD=<your-db-password>
   ```

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
   GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/google/callback
   ```

   **CORS** (we'll update this after frontend is deployed):
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

5. **Link the Database**:
   - In the "Services" section, find your PostgreSQL database
   - Click on it → "Connections" tab
   - Add your web service to the connections

6. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete (5-10 minutes)
   - **Save your backend URL** (e.g., `https://univoyage-backend.onrender.com`)

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
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

   Replace `your-backend-url.onrender.com` with your actual Render backend URL.

5. **Update vercel.json**:
   - Edit `frontend/vercel.json`
   - Replace `https://your-backend-url.onrender.com` with your actual backend URL
   - Commit and push the change

6. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - **Save your frontend URL** (e.g., `https://univoyage.vercel.app`)

## 🔄 Step 5: Update CORS Configuration

1. **Go back to Render Dashboard** → Your backend service

2. **Update Environment Variable**:
   - Find `CORS_ALLOWED_ORIGINS`
   - Update it to: `https://your-frontend-url.vercel.app`
   - Replace with your actual Vercel frontend URL

3. **Redeploy** (Render will auto-redeploy when env vars change)

## ✅ Step 6: Verify Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend-url.onrender.com/api/health` (if you have a health endpoint)
3. **Test Database Connection**: Try logging in or registering a user

## 🎯 Important Notes

### Free Tier Limitations:

**Render Free Tier**:
- ✅ 750 hours/month (enough for 24/7 if you're the only user)
- ⚠️ Spins down after 15 minutes of inactivity (first request after spin-down takes ~30 seconds)
- ✅ Free PostgreSQL database (90 days retention, then $7/month or data deletion)

**Vercel Free Tier**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free SSL certificates
- ✅ Global CDN

### Tips:

1. **Keep Render Service Active**: Use a service like [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 5 minutes to prevent spin-down
2. **Monitor Usage**: Check Render dashboard regularly to ensure you're within free tier limits
3. **Database Backups**: Consider exporting your database periodically (free tier doesn't include automatic backups)

## 🐛 Troubleshooting

### Backend won't start:
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure database is linked and accessible

### CORS errors:
- Verify `CORS_ALLOWED_ORIGINS` includes your exact Vercel URL (with https://)
- Check that frontend is using the correct `VITE_API_URL`

### Database connection errors:
- Verify database credentials in environment variables
- Check that database is in the same region as your backend
- Ensure database is not paused (free tier can pause after inactivity)

### Frontend can't connect to backend:
- Verify `VITE_API_URL` in Vercel environment variables
- Check that backend URL in `vercel.json` matches your Render URL
- Ensure backend is running (check Render dashboard)

## 📞 Need Help?

- Render Docs: [render.com/docs](https://render.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Check application logs in both Render and Vercel dashboards

---

**Congratulations! Your app should now be live! 🎉**

