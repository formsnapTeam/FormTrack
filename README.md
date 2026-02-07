# FormTrack - Placement Form Progress Tracker

A web application to help students track placement-related Google Form submissions with a one-click bookmarklet save feature.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Auth**: JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas)

### 1. Setup Backend

```bash
cd server
npm install
npm run dev
```

The server runs on `http://localhost:5000`

### 2. Setup Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`

### 3. Environment Variables

Copy `server/.env.example` to `server/.env` and configure:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

## Features

- ⚡ One-click bookmarklet to save Google Forms
- 📊 Dashboard with search and filter
- 📈 Status tracking (Applied → Test → Interview → Offer)
- 🏷️ Tags and labels (Dream, Backup, Off-campus)
- 📝 Notes for each application
- 📉 Analytics dashboard
- 🌙 Dark mode support

## Project Structure

```
FormTrack/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
└── server/          # Express backend
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```
