# Deployment Guide - SortMyHostel Backend

Complete step-by-step guide to deploy the backend on Vercel with MongoDB Atlas.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)

---

## Step 1: Create MongoDB Atlas Database

### 1.1 Sign Up/Login to MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in (use GitHub for quick signup)

### 1.2 Create Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** (512MB storage)
3. Select **Cloud Provider** (AWS recommended)
4. Choose **Region** closest to you
5. Click **"Create"**
6. Wait 3-5 minutes for cluster to be created

### 1.3 Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - **Username**: `sortmyhostel_user` (or your choice)
   - **Password**: Create a strong password (save it!)
5. Set **Database User Privileges**: **"Atlas admin"**
6. Click **"Add User"**

### 1.4 Whitelist IP Address

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For Vercel deployment: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This allows access from any IP (safe for public APIs)
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string

It looks like:
```
mongodb+srv://sortmyhostel_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Replace** `<password>` with your database user password
7. **Add database name** at the end: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority` → `/sortmyhostel?retryWrites=true&w=majority`

**Final connection string:**
```
mongodb+srv://sortmyhostel_user:yourpassword@cluster0.xxxxx.mongodb.net/sortmyhostel?retryWrites=true&w=majority
```

**✅ Save this connection string - you'll need it!**

---

## Step 2: Prepare Backend for Vercel

### 2.1 Update package.json for Vercel

The package.json is already configured, but ensure you have:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 2.2 Create vercel.json

Create `vercel.json` in the backend folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### 2.3 Update Server for Vercel

Vercel uses serverless functions, so we need to adapt the server. However, since you want a full Express server, we'll use Vercel's Node.js runtime.

The current `server.js` should work, but let's create a Vercel-compatible version.

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git (if not already)

```bash
cd backend
git init
```

### 3.2 Create .gitignore

Already created, but ensure it includes:
- `.env`
- `node_modules/`
- `prisma/migrations/`

### 3.3 Commit and Push

```bash
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/yourusername/sortmyhostel-backend.git
git push -u origin main
```

**Note**: Create a new GitHub repository first if you haven't.

---

## Step 4: Deploy to Vercel

### 4.1 Sign Up/Login to Vercel

1. Go to https://vercel.com
2. Sign up or log in (use GitHub for quick signup)

### 4.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select the repository containing your backend

### 4.3 Configure Project

1. **Framework Preset**: Select **"Other"** or **"Node.js"**
2. **Root Directory**: Set to `backend` (if backend is in a subfolder)
3. **Build Command**: Leave empty or `npm run prisma:generate`
4. **Output Directory**: Leave empty
5. **Install Command**: `npm install`

### 4.4 Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your MongoDB connection string |
| `FRONTEND_URL` | Your frontend URL (e.g., `https://your-frontend.vercel.app`) |
| `JWT_SECRET` | A random secret string (generate with: `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Vercel will override this) |

### 4.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Your API will be available at: `https://your-project.vercel.app`

---

## Step 5: Update Frontend API URL

### 5.1 Update Frontend

In your frontend `src/services/api.js`, update:

```javascript
const API_BASE_URL = 'https://your-backend.vercel.app/api';
```

### 5.2 Test Connection

1. Visit: `https://your-backend.vercel.app/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 6: Run Prisma Migrations (Optional)

Since MongoDB doesn't use traditional migrations, Prisma will create collections automatically on first connection. However, you can verify:

1. Go to MongoDB Atlas → Collections
2. You should see collections created automatically when API is called

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
- Check MongoDB connection string is correct
- Ensure IP is whitelisted (0.0.0.0/0 for Vercel)
- Verify database user password is correct

### Issue: "Prisma Client not generated"

**Solution:**
- Add `"postinstall": "prisma generate"` to package.json
- Or run `npm run prisma:generate` locally and commit

### Issue: "CORS errors"

**Solution:**
- Update `FRONTEND_URL` in Vercel environment variables
- Check CORS settings in `server.js`

### Issue: "Function timeout"

**Solution:**
- Vercel free tier has 10s timeout
- Upgrade to Pro for 60s timeout
- Or optimize queries

---

## Alternative: Deploy on Render (Easier for Express)

If Vercel gives you issues, Render is simpler for Express apps:

### Render Deployment Steps:

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `sortmyhostel-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add environment variables (same as Vercel)
6. Deploy!

Render is better for:
- ✅ Full Express servers
- ✅ No cold starts
- ✅ Easier setup
- ✅ Free tier available

---

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-backend.vercel.app/health
```

### 2. Get All Days Menu
```bash
curl https://your-backend.vercel.app/api/menu/all-days
```

### 3. Test with Frontend
- Update frontend API URL
- Test all features

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Update frontend API URL
3. ✅ Test all endpoints
4. ✅ Deploy frontend
5. ✅ Monitor logs in Vercel dashboard

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Verify environment variables
4. Test endpoints with Postman/curl

Good luck! 🚀


