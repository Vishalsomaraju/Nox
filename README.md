# NOX Social Media Platform

NOX is a highly refined, premium social media application built with a modern tech stack. Designed with a clean, minimalist aesthetic featuring a deep slate dark mode and a sleek Indigo accent, NOX prioritizes performance, real-time interactions, and a buttery-smooth user experience.

## ✨ Key Features
- **Modern Minimalist UI/UX:** A stunning, simple design leveraging Glassmorphism, highly readable typography (Inter), and subtle, sophisticated animations (Framer Motion & GSAP).
- **Responsive Layout:** A dynamic layout system that seamlessly scales from a desktop sidebar to a mobile bottom navigation bar with a glass-frosted overflow drawer.
- **Robust Authentication:** Secure JWT-based authentication featuring HTTP-only refresh cookies, automatic background token rotation, and in-memory access tokens.
- **Interactive Feed:** Full support for exploring content, hashtag navigation, and rich media posts.
- **Real-Time Features:** WebSocket integration (Socket.io) for live, instant notifications.
- **Optimized Media:** Blurhash integration for skeleton placeholders and fast, optimized image delivery via Cloudinary.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom Design System)
- **Animations:** Framer Motion + GSAP
- **State Management:** Zustand + React Query
- **Routing:** React Router v6
- **Real-time:** Socket.io-client

### Backend (Server)
- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL (hosted on Neon Serverless)
- **ORM:** Prisma
- **Security:** Helmet, HPP, Express Rate Limit, bcryptjs
- **Media Processing:** Multer + Sharp + Cloudinary
- **Auth:** jsonwebtoken (JWT)

---

## 🚀 Getting Started

Follow these steps to run NOX locally on your machine.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd social-media-platform
```

### 2. Install Dependencies
You need to install dependencies for both the frontend and the backend.
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Variables
You will need to set up two `.env` files. 

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory:
```env
# Server
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# JWT Secrets (Generate secure random strings for these)
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"

# Cloudinary (For image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Frontend (`client/.env`)**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL="http://localhost:4000"
VITE_SOCKET_URL="http://localhost:4000"
```

### 4. Database Setup
Ensure your PostgreSQL database is running, then push the Prisma schema and optionally seed the database with dummy data:
```bash
cd server
npm run db:push
npm run db:generate

# (Optional) Seed database with users and posts
node prisma/seed.js
```

### 5. Run the Application
Start the backend and frontend development servers concurrently in two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Your application will be available at `http://localhost:5173`.

## 📦 Deployment (Vercel)

If you are deploying the frontend to **Vercel**, the `client/vercel.json` file is already configured to rewrite all routes to `index.html`. This ensures that your Single Page Application (SPA) routes do not return 404 errors upon refreshing the page.

Make sure to update your production `VITE_API_URL` and `VITE_SOCKET_URL` variables in the Vercel dashboard to point to your live backend server!
