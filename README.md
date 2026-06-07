# 🎬 iTube

> A full-stack YouTube-inspired video platform with real-time Watch Party, AI-powered summarization, and live chat — built with React, Node.js, MongoDB & Socket.io.

![iTube Banner](https://via.placeholder.com/1280x400/0f0f0f/ff0000?text=iTube+%E2%80%94+Stream.+Watch.+Together.)

<div align="center">

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude_API-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Key Learnings](#-key-learnings)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🧭 Overview

**iTube** is a production-grade, full-stack video-sharing platform built as a portfolio project to explore modern web development — from real-time communication with WebSockets to AI integration via the Anthropic Claude API.

It replicates core YouTube features and pushes further with two original capabilities:

- **Live Watch Party** — synchronized video playback across multiple users with a shared chat room
- **AI Video Summarizer** — Claude-powered summaries and Q&A on any uploaded video

This project was built to demonstrate full-stack architecture decisions, real-world API integrations, and the ability to ship a feature-complete product from scratch.

---

## ✨ Features

### 🎥 Core Platform
- **Video Upload & Streaming** — Upload videos via Cloudinary with adaptive streaming
- **Authentication** — JWT-based auth with access + refresh token rotation
- **User Profiles** — Avatars, channel pages, subscriber counts
- **Subscriptions** — Subscribe/unsubscribe to channels with a personalized feed
- **Likes & Dislikes** — Real-time like counts on videos
- **Comments** — Nested comments with like support

### ⚡ Real-time Watch Party
- Create a party room and invite friends via a shareable link
- Synchronized play, pause, and seek — powered by **Socket.io**
- Live group chat alongside the video player
- Room host controls (kick, mute, end party)

### 🤖 AI Video Summarizer
- Generates a concise summary of any video using the **Anthropic Claude API**
- Ask questions about the video content in a chat-style interface
- Summaries cached in MongoDB to avoid redundant API calls

### 🔍 Discovery
- Full-text search across video titles and descriptions
- Category-based filtering and trending feed
- Recommended videos based on watch history (tag similarity)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **State Management** | Zustand (auth), React Query (server state) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Real-time** | Socket.io |
| **Media Storage** | Cloudinary |
| **AI** | Anthropic Claude API (`claude-sonnet-4-6`) |
| **Auth** | JWT (access + refresh tokens), bcrypt |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client (Browser)                │
│     React 18 · Vite · Tailwind · React Query     │
└────────────┬──────────────────┬──────────────────┘
             │  REST API        │  WebSocket
             ▼                  ▼
┌────────────────┐   ┌──────────────────────┐
│  Express API   │   │   Socket.io Server   │
│  REST · JWT    │   │   Watch Party Rooms  │
│  Multer        │   │   Live Chat          │
└───────┬────────┘   └──────────────────────┘
        │
   ┌────┴────────────────────┐
   │                         │
   ▼                         ▼
┌──────────┐         ┌───────────────┐
│ MongoDB  │         │  Cloudinary   │
│ Mongoose │         │  Video / CDN  │
└──────────┘         └───────────────┘
        │
        ▼
┌───────────────────┐
│  Anthropic Claude │
│  Summarizer / Q&A │
└───────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/itube.git
cd itube
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set up environment variables

Create `.env` files in both `server/` and `client/` (see [Environment Variables](#-environment-variables) below).

### 4. Run the development servers

```bash
# From the root directory (runs both client and server concurrently)
npm run dev
```

Or run them separately:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173` and the API at `http://localhost:5000`.

---

## 🔐 Environment Variables

### `server/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/itube

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
itube/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── VideoCard/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   └── CommentSection/
│   │   ├── pages/              # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── Watch.jsx       # Video player + AI summarizer
│   │   │   ├── WatchParty.jsx  # Real-time watch party
│   │   │   ├── Channel.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Auth.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand auth store
│   │   ├── services/           # Axios API layer
│   │   └── socket/             # Socket.io client setup
│   └── vite.config.js
│
├── server/                     # Node.js + Express backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── user.controller.js
│   │   └── ai.controller.js    # Claude API integration
│   ├── models/
│   │   ├── User.js
│   │   ├── Video.js
│   │   ├── Comment.js
│   │   └── Summary.js          # Cached AI summaries
│   ├── routes/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── socket/
│   │   └── watchParty.js       # Socket.io room logic
│   ├── utils/
│   └── index.js
│
├── package.json                # Root (concurrently scripts)
└── README.md
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT pair |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | Get all videos (paginated) |
| GET | `/api/videos/:id` | Get single video |
| POST | `/api/videos` | Upload video (auth required) |
| PUT | `/api/videos/:id` | Update video metadata |
| DELETE | `/api/videos/:id` | Delete video |
| PUT | `/api/videos/:id/like` | Toggle like |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summarize/:videoId` | Generate/fetch AI summary |
| POST | `/api/ai/ask/:videoId` | Ask a question about the video |

### Watch Party (Socket.io Events)
| Event | Direction | Description |
|-------|-----------|-------------|
| `party:create` | Client → Server | Create a new party room |
| `party:join` | Client → Server | Join an existing room |
| `party:play` | Client → Server | Broadcast play event |
| `party:pause` | Client → Server | Broadcast pause event |
| `party:seek` | Client → Server | Sync seek position |
| `chat:message` | Client ↔ Server | Send/receive chat messages |

---

## 📚 Key Learnings

Building iTube involved solving several real-world engineering challenges:

- **WebSocket room synchronization** — Handling race conditions when multiple users seek/play simultaneously; implemented a host-authority model where only the room host's seek events propagate.
- **JWT refresh token rotation** — Secure token rotation with a sliding expiry window and server-side invalidation on logout.
- **Cloudinary streaming** — Using Cloudinary's adaptive bitrate streaming instead of raw uploads to handle varied network conditions.
- **Claude API prompt design** — Crafting structured prompts with video metadata (title, description, tags) as context to generate accurate summaries without hallucination.
- **React Query + Zustand** — Separating server state (React Query) from client/auth state (Zustand) for a clean, predictable data layer.

---

## 🗺 Roadmap

- [ ] Shorts-style vertical video feed
- [ ] Video chapters with timestamped AI summaries
- [ ] Push notifications for new uploads from subscribed channels
- [ ] Mobile app (React Native)
- [ ] Monetization dashboard (mock ad revenue analytics)

---

## 👨‍💻 Author

**Aryan** — Full Stack Developer | ML/GenAI Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/your-profile)

---

> Built with curiosity and a lot of `console.log` debugging. ☕
