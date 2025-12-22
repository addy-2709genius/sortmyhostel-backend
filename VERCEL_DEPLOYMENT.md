# Vercel Deployment Guide - Quick Reference

## 🚀 Step-by-Step Deployment

### 1. Import Repository
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select: `addy-2709genius/sortmyhostel-backend`
5. Click **"Import"**

### 2. Configure Project Settings

**Project Name:** `sortmyhostel-api` (or any unique name you prefer)

**Framework Preset:** `Other`

**Root Directory:** `./` (leave as default)

**Build Command:** 
```
npm run prisma:generate
```

**Output Directory:** (leave empty)

**Install Command:**
```
npm install
```

### 3. Add Environment Variables

Click **"Environment Variables"** and add these **EXACT** values:

| Variable Name | Value |
|---------------|-------|
| `DATABASE_URL` | `mongodb+srv://sortmyhostel_user:zcFs3clpMc4He0EU@cluster0.ajqejnh.mongodb.net/sortmyhostel?retryWrites=true&w=majority` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `JWT_SECRET` | `bZBdkilZBRIbSqVl2NmMtxUTUabbVOw/1giAVZrc2Ko=` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

**Important:** 
- Select **Production**, **Preview**, and **Development** for all variables
- Click **"Save"** after adding each variable

### 4. Deploy

1. Click **"Deploy"** button
2. ⏳ Wait 2-3 minutes for deployment
3. Your API will be live at: `https://sortmyhostel-api.vercel.app` (or your chosen name)

### 5. Test Deployment

Visit: `https://sortmyhostel-api.vercel.app/health`

Should return:
```json
{"status":"ok","timestamp":"..."}
```

✅ **Backend is deployed!**

---

## 📝 After Deployment

### Update Frontend API URL

In `src/services/api.js`, update:
```javascript
const API_BASE_URL = 'https://sortmyhostel-api.vercel.app/api';
```

Replace `sortmyhostel-api` with your actual Vercel project name.

---

## 🔧 Troubleshooting

### If deployment fails:
1. Check **Deployments** tab for error logs
2. Verify all environment variables are set correctly
3. Make sure `DATABASE_URL` doesn't have extra quotes
4. Check that MongoDB IP whitelist includes Vercel IPs (0.0.0.0/0 for all)

### If health check fails:
1. Check environment variables are saved
2. Verify MongoDB connection string is correct
3. Check Vercel function logs in the dashboard

---

## ✅ Deployment Checklist

- [ ] Repository imported
- [ ] Project name set (unique)
- [ ] Build command: `npm run prisma:generate`
- [ ] All 5 environment variables added
- [ ] Deployment started
- [ ] Health check passed
- [ ] Frontend API URL updated

