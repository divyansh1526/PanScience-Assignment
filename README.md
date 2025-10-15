# PanScience Full Stack

**Stack**
- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend: React + Vite + Tailwind
- Auth: JWT (access + refresh)
- File uploads: multer (local or S3 recommended in production)

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- MongoDB (local or remote)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env to set MONGO_URI, JWT_SECRET, REFRESH_TOKEN_SECRET, PORT
npm install
npm run dev
