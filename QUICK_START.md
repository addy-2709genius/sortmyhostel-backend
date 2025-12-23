# ⚡ Quick Start Guide

## 🎯 5-Minute Setup

### 1. Get MongoDB Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 FREE)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (Allow from anywhere)
5. Get connection string and replace `<password>` and add database name

**Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sortmyhostel?retryWrites=true&w=majority
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your DATABASE_URL
npm run prisma:generate
npm run dev
```

### 3. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Add environment variables:
   - `DATABASE_URL` (your MongoDB connection string)
   - `FRONTEND_URL` (your frontend URL)
   - `JWT_SECRET` (generate with: `openssl rand -base64 32`)
   - `NODE_ENV=production`
5. Deploy!

### 4. Update Frontend

In `src/services/api.js`, change:
```javascript
const API_BASE_URL = 'https://your-vercel-url.vercel.app/api';
```

---

## 📚 Full Documentation

- **Detailed Steps**: See `DEPLOYMENT_STEPS.md`
- **API Documentation**: See `README.md`
- **Troubleshooting**: See `DEPLOYMENT.md`

---

## ✅ Checklist

- [ ] MongoDB Atlas database created
- [ ] Connection string saved
- [ ] Backend dependencies installed
- [ ] .env file configured
- [ ] Prisma client generated
- [ ] Local server tested
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Frontend API URL updated
- [ ] Everything tested!

---

**Need help?** Check `DEPLOYMENT_STEPS.md` for detailed instructions.




