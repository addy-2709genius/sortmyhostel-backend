# 🚀 Step-by-Step Deployment Guide

## Quick Start Checklist

- [ ] Create MongoDB Atlas database
- [ ] Get connection string
- [ ] Install backend dependencies
- [ ] Configure environment variables
- [ ] Generate Prisma client
- [ ] Test locally
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Update frontend API URL

---

## 📋 Detailed Steps

### STEP 1: Create MongoDB Atlas Database (5 minutes)

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up or log in (use GitHub for quick signup)

2. **Create Free Cluster**
   - Click **"Build a Database"**
   - Choose **"M0 FREE"** (512MB - perfect for development)
   - Select **AWS** as cloud provider
   - Choose region closest to you
   - Click **"Create"**
   - ⏳ Wait 3-5 minutes for cluster creation

3. **Create Database User**
   - Go to **"Database Access"** (left sidebar)
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Enter:
     - Username: `sortmyhostel_user`
     - Password: Create a strong password (SAVE IT!)
   - Set privileges: **"Atlas admin"**
   - Click **"Add User"**

4. **Whitelist IP Address**
   - Go to **"Network Access"** (left sidebar)
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

5. **Get Connection String**
   - Go to **"Database"** (left sidebar)
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Select: Driver: **Node.js**, Version: **5.5 or later**
   - Copy the connection string
   - **Replace `<password>`** with your database user password
   - **Add database name**: Change `?retryWrites=true&w=majority` to `/sortmyhostel?retryWrites=true&w=majority`

   **Final format:**
   ```
   mongodb+srv://sortmyhostel_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sortmyhostel?retryWrites=true&w=majority
   ```

   ✅ **SAVE THIS CONNECTION STRING!**

---

### STEP 2: Setup Backend Locally (5 minutes)

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file**
   - Open `.env` in a text editor
   - Paste your MongoDB connection string:
     ```
     DATABASE_URL="mongodb+srv://sortmyhostel_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sortmyhostel?retryWrites=true&w=majority"
     ```
   - Set other variables:
     ```
     FRONTEND_URL="http://localhost:5173"
     JWT_SECRET="your-random-secret-key-here"
     PORT=3000
     NODE_ENV=development
     ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Test the server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 Server running on port 3000
   📊 Environment: development
   🔗 Frontend URL: http://localhost:5173
   ```

7. **Test API endpoint**
   - Open browser: http://localhost:3000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

   ✅ **Backend is working!**

---

### STEP 3: Push to GitHub (5 minutes)

1. **Initialize Git (if not already)**
   ```bash
   git init
   ```

2. **Create .gitignore** (already created, but verify it includes):
   - `.env`
   - `node_modules/`
   - `prisma/migrations/`

3. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `sortmyhostel-backend`
   - Make it **Public** or **Private**
   - Click **"Create repository"**

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Initial backend setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sortmyhostel-backend.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

---

### STEP 4: Deploy to Vercel (10 minutes)

1. **Sign Up/Login to Vercel**
   - Go to https://vercel.com
   - Sign up or log in (use GitHub for quick signup)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select your `sortmyhostel-backend` repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Select **"Other"**
   - **Root Directory**: Leave as `./` (or set to `backend` if backend is in subfolder)
   - **Build Command**: `npm run prisma:generate`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:

   | Variable Name | Value |
   |--------------|-------|
   | `DATABASE_URL` | Your MongoDB connection string |
   | `FRONTEND_URL` | `http://localhost:5173` (or your frontend URL) |
   | `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |

   **To generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste as `JWT_SECRET` value.

5. **Deploy**
   - Click **"Deploy"**
   - ⏳ Wait 2-3 minutes
   - Your API will be live at: `https://your-project-name.vercel.app`

6. **Test Deployment**
   - Visit: `https://your-project-name.vercel.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

   ✅ **Backend is deployed!**

---

### STEP 5: Update Frontend (2 minutes)

1. **Update API URL**
   - Open `src/services/api.js`
   - Change:
     ```javascript
     const API_BASE_URL = 'https://your-project-name.vercel.app/api';
     ```
   - Replace `your-project-name` with your actual Vercel project name

2. **Test Frontend Connection**
   - Start frontend: `npm run dev`
   - Test all features
   - Check browser console for any errors

---

## 🎉 You're Done!

Your backend is now:
- ✅ Running on Vercel
- ✅ Connected to MongoDB Atlas
- ✅ Accessible from your frontend
- ✅ Ready for production use

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
- ✅ Check MongoDB connection string is correct
- ✅ Verify password doesn't have special characters (URL encode if needed)
- ✅ Ensure IP is whitelisted (0.0.0.0/0)
- ✅ Check database user has correct privileges

### Issue: "Prisma Client not found"
- ✅ Add `"postinstall": "prisma generate"` to package.json (already added)
- ✅ Run `npm run prisma:generate` locally
- ✅ Check Vercel build logs

### Issue: "CORS errors"
- ✅ Update `FRONTEND_URL` in Vercel environment variables
- ✅ Check frontend URL matches exactly

### Issue: "Function timeout"
- ✅ Vercel free tier: 10s timeout
- ✅ Optimize database queries
- ✅ Consider upgrading to Pro (60s timeout)

---

## 📞 Need Help?

1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Verify all environment variables
4. Test endpoints with Postman

Good luck! 🚀


