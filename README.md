# CampusNavigator

India's most comprehensive AI-powered college discovery platform. Built with React 19, Node.js, MongoDB Atlas, and Google Gemini AI.

---

## Quick Start (One Command)

```bash
# 1. Install all dependencies (frontend + backend — automatic)
npm install

# 2. Start the development server
npm run dev
```

That's it. Visit **http://localhost:5000** in your browser.

> **Default admin login:**
> - Email: `admin@campusnavigator.in`
> - Password: `Admin@1234`

The database is pre-configured and auto-seeds 111 colleges on first run.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Authentication & Access Control](#authentication--access-control)
- [AI Integration](#ai-integration)
- [API Endpoints](#api-endpoints)

---

## Overview

CampusNavigator is a full-stack web application that helps Indian students discover, research, and compare colleges across all disciplines — Engineering, Medical, Management, Law, Design, Science, and more.

The platform combines a MongoDB Atlas database of 111+ real Indian institutions with Google Gemini AI to deliver real-time enriched data, personalised recommendations, and an intelligent AI college advisor chatbot.

**Key highlights:**
- 111+ real Indian colleges (IITs, NITs, IIMs, AIIMS, NLUs, IIITs, and top private universities)
- AI-powered college matching via Gemini 2.0 Flash
- Side-by-side comparison of up to 4 colleges
- Personalised student dashboard
- Admin panel for content management
- Dark/light mode with professional glassmorphism design

---

## Features

### For Visitors (No Login Required)
- Browse the landing page with featured colleges, platform stats, testimonials, and FAQ

### For Registered Students
- **Smart Search** — Search colleges by name, city, or stream with real-time filters and voice search
- **College Detail Pages** — Full profiles with overview, courses, admissions, placements, reviews, gallery. Enhanced in real-time by Gemini AI
- **AI Recommendations** — 5-step questionnaire → AI-matched college recommendations with match scores
- **Side-by-Side Comparison** — Compare up to 4 colleges across 13+ criteria
- **Bookmarks** — Save colleges with one click
- **Application Tracker** — Track applications with statuses and deadlines
- **Personalised Dashboard** — Activity charts, interest breakdown, deadlines
- **AI Chatbot** — Floating AI assistant powered by Gemini for any college/career question
- **Settings** — Profile, notifications, theme, security

### For Admins
- **Admin Dashboard** — Platform-wide stats, growth charts, activity feed
- **College Management** — View, search, add, edit, delete colleges
- **Review Moderation** — Approve or reject user-submitted reviews

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool + dev server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations |
| Zustand | State management |
| React Router v7 | Client-side routing |
| Axios | HTTP client with token refresh |
| Chart.js | Dashboard analytics charts |
| Sonner | Toast notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ + Express | REST API server |
| TypeScript | Type safety |
| MongoDB Atlas + Mongoose | Database and ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Google Gemini AI | AI enrichment, recommendations, chatbot |
| Winston | Logging |
| Helmet + rate-limit | Security |

### Architecture
- **Unified server** — Express serves both the REST API (`/api/*`) and the React frontend on **one port (5000)**
- **Dev mode** — Vite runs as Express middleware with HMR — no separate dev server needed
- **Prod mode** — Express serves the pre-built `dist/` folder as static files
- **Auto-seed** — On first run with an empty database, 111+ real Indian colleges are seeded automatically
- **DNS resilience** — Automatically uses Google DNS (8.8.8.8) to ensure MongoDB Atlas SRV records resolve on any network/ISP

---

## Getting Started

### Prerequisites
- **Node.js 18+** — [Download](https://nodejs.org)
- Git (to clone the repo)

### Steps

```bash
# Clone the repository
git clone https://github.com/tiwarianuj0134-gif/CampusNavigator.git
cd CampusNavigator

# Install all dependencies (postinstall auto-installs backend deps too)
npm install

# Start the server
npm run dev
```

Visit **http://localhost:5000**

The server will:
1. Connect to MongoDB Atlas automatically
2. Auto-seed 111+ colleges if the database is empty
3. Serve the React frontend with hot-reload

### Build for Production

```bash
# Build the React frontend
npm run build

# Start the production server
npm run start
```

---

## Environment Variables

The `backend/.env` file is included in the repository with working credentials for easy setup.

If you need to use your own database, edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000

# MongoDB Atlas (required)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campusnavigator?retryWrites=true&w=majority

# JWT (keep secret in production)
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Gemini AI (optional — enables AI chatbot & recommendations)
# Get free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIza...
```

---

## Project Structure

```
campusnavigator/
├── src/                          # React frontend
│   ├── App.tsx                   # Root component with routing
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles + Tailwind theme
│   ├── components/
│   │   ├── animations/           # MeshGradient, FloatingCard, TypewriterText, etc.
│   │   ├── auth/                 # ProtectedRoute, AdminRoute, GuestRoute
│   │   ├── cards/                # CollegeCard
│   │   ├── common/               # Button, Input, Badge, AIChatbot, DataTable, etc.
│   │   ├── layout/               # Navbar, Footer, ScrollProgress, BackToTop
│   │   ├── loaders/              # Skeleton variants
│   │   └── modals/               # Modal
│   ├── context/                  # Zustand stores (auth, bookmarks, compare, theme)
│   ├── hooks/                    # useDebounce, useScrollProgress, useVoiceSearch
│   ├── pages/
│   │   ├── auth/                 # LoginPage, RegisterPage
│   │   ├── dashboard/            # DashboardLayout, Overview, Bookmarks, Applications, etc.
│   │   ├── admin/                # AdminLayout, Dashboard, Colleges, Reviews
│   │   └── public/               # LandingPage, SearchPage, CollegeDetailPage, etc.
│   ├── services/
│   │   ├── api/                  # axios client, authService, collegeService, etc.
│   │   └── geminiService.ts      # Frontend AI service (proxies to backend)
│   └── utils/cn.ts               # clsx + tailwind-merge helper
│
├── backend/
│   └── src/
│       ├── server.ts             # Unified Express + Vite server
│       ├── config/               # Env config, MongoDB connection + auto-seed
│       ├── controllers/          # Route controllers
│       ├── middlewares/          # JWT auth, error handler, validator
│       ├── models/               # College, User, Course, Review, etc.
│       ├── routes/               # All API routes
│       ├── services/             # AI, auth, college, ingestion services
│       └── utils/                # AppError, logger, normalizers
│
├── backend/.env                  # Environment variables (pre-configured)
├── index.html                    # Vite entry HTML
├── vite.config.ts                # Vite config
├── tsconfig.json                 # Frontend TypeScript config
└── package.json                  # Root scripts (postinstall auto-installs backend)
```

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page — hero, stats, featured colleges, FAQ |
| `/login` | Guest only | Sign-in form |
| `/register` | Guest only | Registration form |
| `/search` | Auth required | Search & filter colleges |
| `/college/:id` | Auth required | Full college profile with AI enrichment |
| `/compare` | Auth required | Side-by-side college comparison |
| `/questionnaire` | Auth required | 5-step AI recommendation questionnaire |
| `/dashboard` | Auth required | User dashboard overview |
| `/dashboard/bookmarks` | Auth required | Saved colleges |
| `/dashboard/applications` | Auth required | Application tracker |
| `/dashboard/recommendations` | Auth required | AI-matched colleges |
| `/dashboard/settings` | Auth required | Profile and settings |
| `/admin` | Admin role | Admin dashboard |
| `/admin/colleges` | Admin role | College management |
| `/admin/reviews` | Admin role | Review moderation |

---

## Authentication & Access Control

Uses **JWT** with access + refresh token pairs stored in localStorage.

### Default Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@campusnavigator.in | Admin@1234 |

### Mock Fallback
If the backend is unreachable, auth automatically falls back to a local mock session so the UI stays testable.

---

## AI Integration

All AI calls go through the **backend** — no API keys are exposed to the browser.

| Feature | Endpoint | Description |
|---|---|---|
| College enrichment | `POST /api/ai/enrich` | Real-time data from Gemini for a specific college |
| Chat assistant | `POST /api/ai/chat` | Conversational AI for college/career questions |
| Recommendations | `POST /api/ai/recommendations` | Student profile → matched colleges |
| Onboarding suggestion | `POST /api/ai/onboarding-suggestion` | Personalised insight after questionnaire |

To enable AI features, add your Gemini API key to `backend/.env`:
```
GEMINI_API_KEY=AIzaSy...
```
Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

---

## API Endpoints

### Auth (`/api/auth`)
```
POST   /register      Create account
POST   /login         Login → tokens
POST   /logout        Invalidate refresh token
POST   /refresh       Refresh access token
GET    /me            Get current user (protected)
PATCH  /profile       Update profile (protected)
```

### Colleges (`/api/colleges`)
```
GET    /              List colleges (search, stream, sort, page, limit)
GET    /featured      Top-rated colleges for landing page
GET    /:id           Single college by ID or slug
POST   /              Create (admin only)
PUT    /:id           Update (admin only)
DELETE /:id           Delete (admin only)
```

### AI (`/api/ai`)
```
POST   /chat                    Chat with AI assistant
POST   /enrich                  Gemini-enriched college details
POST   /recommendations         AI-matched colleges
POST   /onboarding-suggestion   Questionnaire result insight
```

### Dashboard (`/api/dashboard`) — Protected
```
GET    /stats         User stats
GET    /activity      Recent activity
GET    /analytics     Weekly engagement data
GET/POST /applications  Application list
GET    /bookmarks     Synced bookmarks
```

### Admin (`/api/admin`) — Admin role required
```
GET    /stats         Platform stats
GET    /colleges      All colleges (paginated)
GET    /reviews       Reviews by status
PATCH  /reviews/:id   Approve or reject review
DELETE /colleges/:id  Delete college
```

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## License

MIT © 2025 CampusNavigator
