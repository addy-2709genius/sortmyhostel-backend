# 🚀 Deploy Backend to Render

## Step 1: Push Backend to GitHub (if not already)

Your backend is already on GitHub at: `addy-2709genius/sortmyhostel-backend`

If you need to update it:
```bash
cd /Users/aadityarajsoni/Desktop/SORTMENU/backend
git add .
git commit -m "Add Render configuration"
git push
```

---

## Step 2: Deploy to Render

1. **Sign Up/Login to Render**
   - Go to: https://render.com
   - Sign up or log in
   - Use GitHub to sign in (recommended)

2. **Create New Web Service**
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

3. **Connect Repository**
   - Click **"Connect account"** if not connected
   - Select: `addy-2709genius/sortmyhostel-backend`
   - Click **"Connect"**

4. **Configure Service**
   - **Name**: `sortmyhostel-backend` (or any name)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (or upgrade if needed)

5. **Add Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"** and add:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `DATABASE_URL` | `mongodb+srv://sortmyhostel_user:zcFs3clpMc4He0EU@cluster0.ajqejnh.mongodb.net/sortmyhostel?retryWrites=true&w=majority` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` (update after frontend is deployed) |
   | `JWT_SECRET` | `bZBdkilZBRIbSqVl2NmMtxUTUabbVOw/1giAVZrc2Ko=` |

   **Important:**
   - NO quotes around values
   - NO spaces before/after
   - Copy DATABASE_URL exactly as shown

6. **Create Service**
   - Click **"Create Web Service"**
   - ⏳ Wait 5-10 minutes for first deployment

---

## Step 3: Get Your Backend URL

After deployment, Render will give you a URL like:
- `https://sortmyhostel-backend.onrender.com`
- Or your custom domain

**Note:** Free tier services spin down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

---

## Step 4: Test Backend

1. **Health Check**
   ```
   https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **API Root**
   ```
   https://your-backend.onrender.com/
   ```
   Should return API information

---

## Step 5: Update Frontend API URL

1. **Get Render Backend URL**
   - Copy your Render backend URL (e.g., `https://sortmyhostel-backend.onrender.com`)

2. **Update Frontend**
   - In `src/services/api.js`, update:
   ```javascript
   const API_BASE_URL = 'https://sortmyhostel-backend.onrender.com/api';
   ```

3. **Update FRONTEND_URL in Render**
   - Go to Render dashboard → Your service → Environment
   - Update `FRONTEND_URL` to your Vercel frontend URL
   - Save changes (will auto-redeploy)

---

## ✅ Success!

Your backend is now:
- ✅ Deployed on Render
- ✅ Connected to MongoDB Atlas
- ✅ Accessible from frontend
- ✅ Ready for production

---

## 🔗 URLs

- **Backend**: `https://sortmyhostel-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app` (after frontend deployment)

---

## 🔧 Troubleshooting

### Service won't start
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check that `DATABASE_URL` is correct (no quotes)

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check `DATABASE_URL` has correct credentials
- Verify database user exists in MongoDB Atlas

### Slow first request
- Free tier services spin down after inactivity
- First request after spin-down takes ~30 seconds
- This is normal for free tier

### CORS errors
- Update `FRONTEND_URL` in Render environment variables
- Make sure it matches your Vercel frontend URL exactly

---

## 📝 Render Free Tier Notes

- **Spins down** after 15 minutes of inactivity
- **First request** after spin-down takes ~30 seconds
- **512 MB RAM** limit
- **750 hours/month** free (enough for 24/7)
- **Auto-deploys** on git push

---

## 🎯 Next Steps

1. ✅ Backend deployed on Render
2. ⏳ Deploy frontend to Vercel (see `FRONTEND_VERCEL_DEPLOY.md`)
3. ⏳ Update frontend API URL
4. ⏳ Update `FRONTEND_URL` in Render
5. ✅ Test everything!

