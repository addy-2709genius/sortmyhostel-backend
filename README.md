# SortMyHostel Backend API

Backend API for SortMyHostel application built with Node.js, Express, Prisma, and MongoDB.

## Features

- 🍽️ Menu management (day-wise, meal-wise)
- 👍👎 Food feedback system (likes/dislikes)
- 💬 Comments on food items
- 📊 Analytics and reporting
- 🗑️ Food wastage tracking
- 📤 Excel file upload for menu
- 🔐 Admin authentication

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MongoDB
- **Validation**: express-validator
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- MongoDB connection string

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sortmyhostel?retryWrites=true&w=majority"
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Seed Database (Optional)

```bash
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Menu
- `GET /api/menu/all-days` - Get menu for all days
- `GET /api/menu/day/:day` - Get menu for specific day
- `POST /api/menu/upload-excel` - Upload Excel file to update menu
- `POST /api/menu/add-item` - Add manual menu item

### Feedback
- `POST /api/feedback/submit` - Submit like/dislike
- `POST /api/feedback/comment` - Submit comment
- `DELETE /api/feedback/comment/:commentId` - Delete comment (admin)
- `GET /api/feedback/disliked-issues` - Get disliked food issues

### Analytics
- `GET /api/analytics` - Get analytics data

### Wastage
- `GET /api/wastage` - Get wastage data (last 7 days)
- `GET /api/wastage/yesterday` - Get yesterday's wastage
- `POST /api/wastage/submit` - Submit wastage data (admin)

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## License

ISC




