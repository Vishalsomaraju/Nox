# NOX Social Media Platform

A premium, dark-first social media platform built with React, Express.js, Prisma, and PostgreSQL on Neon.

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + GSAP  
**Backend:** Express.js + Prisma + PostgreSQL (Neon)  
**Auth:** JWT (access token in memory, refresh token in HttpOnly cookie + DB)  
**Images:** Cloudinary  
**Real-time:** socket.io (notifications)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `server/.env` and `client/.env` and fill in your values.

### 3. Database Setup

```bash
npm run db:push
```

### 4. Start Development

```bash
npm run dev
```

This starts both the client (port 5173) and server (port 4000) simultaneously.

## Project Structure

```
nox/
├── client/          ← React + Vite frontend
├── server/          ← Express.js backend
├── package.json     ← Workspace root
└── README.md
```

## Environment Variables Required

### `server/.env`
```
DATABASE_URL=          # Neon PostgreSQL connection string
JWT_ACCESS_SECRET=     # Random 64-char string
JWT_REFRESH_SECRET=    # Different random 64-char string
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### `client/.env`
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```
