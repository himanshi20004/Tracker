# 🌊 StudyWave (Academic Tracker)

**Live Demo:** [https://tracker-ksb7.vercel.app/](https://tracker-ksb7.vercel.app/)

**StudyWave** is a production-hardened, full-stack gamified learning platform built on the MERN stack with real-time Socket.IO chat and Gemini AI doubt resolution.

---

## 📸 Screenshots

| Landing Page | Sign In Portal |
| :---: | :---: |
| ![Landing Page](assets/Screenshot%202026-06-30%20170915.png) | ![Sign In Portal](assets/Screenshot%202026-06-30%20170926.png) |

| Student Dashboard & Tasks | Quizzes |
| :---: | :---: |
| ![Student Dashboard](assets/Screenshot%202026-06-30%20171008.png) | ![Quizzes](assets/Screenshot%202026-06-30%20171026.png) |

| Personal Timetable | AI Mentor (Doubt Solver) |
| :---: | :---: |
| ![Timetable](assets/Screenshot%202026-06-30%20171049.png) | ![AI Mentor](assets/Screenshot%202026-06-30%20171101.png) |

| Real-Time Peer Chat |
| :---: |
| ![Real-Time Chat](assets/Screenshot%202026-06-30%20171206.png) |

---

## ✨ Key Features

- **Role-Based Authentication & Security:** JWT + HTTP-only cookie authentication separating Student (`user`) and Administrator (`admin`) portals. Public registration is strictly restricted to student accounts; admin promotion is restricted to existing admins.
- **Gamified Task Management:** Admins create, edit, and delete deadline-driven tasks. Students complete tasks with server-side, atomic point awarding and concurrency protection.
- **Interactive Timed Quizzes:** Admins build multi-question quizzes. Correct answers are never leaked to students prior to submission, scoring is computed server-side with deduplicated answers, and concurrent submissions are prevented atomically.
- **Leaderboard:** Paginated, indexed student rankings sorted by verified server-calculated points.
- **AI Doubt Mentor (Gemini API):** Authenticated, input-validated, and rate-limited AI study assistant keeping the Gemini API key strictly on the server.
- **Personal Timetable:** Owner-verified daily calendar planner with add, edit, and delete operations.
- **Real-Time Peer Chat:** Authenticated Socket.IO messaging with signed message receipts, online presence tracking, and instant message delivery without page reloads.
- **Study Resources:** Admin-only PDF uploads (MIME, extension, and 10MB size validated) and searchable student downloads.
- **Account & Password Management:** Profile editing, authenticated password updates, and hashed, single-use, expiring password reset tokens via email.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v6, Axios, Socket.IO Client, FullCalendar / React Calendar, React Toastify |
| **Backend API** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer, Nodemailer, Helmet, Express Rate Limit, Express Mongo Sanitize |
| **Socket Server** | Node.js, Express 4, Socket.IO 4.8, JWT |
| **Database** | MongoDB Atlas |
| **AI Assistant** | Google Generative AI (`@google/generative-ai`) |
| **Testing** | Jest, Supertest, MongoDB Memory Server, Socket.IO Client, Vitest, React Testing Library |
| **Deployment** | Vercel (Frontend), Render (Backend API & Socket Server) |

---

## 🏗️ System Architecture

```text
┌─────────────────────────┐       HTTPS / REST        ┌────────────────────────────────┐
│   Frontend (Vercel)     │ ────────────────────────► │   Backend API (Render)         │
│   React + Vite + TW     │ ◄──────────────────────── │   Express + Mongoose + Helmet  │
└───────────┬─────────────┘    JSON + HTTP-only JWT   └──────────────┬─────────────────┘
            │                                                        │
            │ WSS (JWT Auth + Signed Receipts)                       │ Mongoose + Atlas
            ▼                                                        ▼
┌─────────────────────────┐       /internal/emit      ┌────────────────────────────────┐
│  Socket Server (Render) │ ◄──────────────────────── │   MongoDB Atlas                │
│  Socket.IO + JWT Auth   │                           │   Indexed Collections          │
└─────────────────────────┘                           └────────────────────────────────┘
```

### Key Architectural & Security Decisions
1. **Server-Side Gamification & Atomicity:** All point awards (`POST /api/v1/complete-task` and `POST /api/v1/quizzes/:quizId/submit`) execute atomically in MongoDB using conditional updates (`$ne` + `$addToSet` + `$inc`) and unique compound indexes (`{ user, task }`, `{ user, quiz }`) to eliminate race conditions and client-side tampering.
2. **Authenticated Cross-Service Socket Delivery:** Because the API and Socket.IO run as separate Render services, the backend signs a short-lived `socketReceipt` JWT upon persisting a chat message and relays it via `/internal/emit` (when `SOCKET_URL` is configured) as well as returning it to the authenticated client socket for zero-trust verification.
3. **Zero Credential Exposure:** Environment files (`.env`, `config.env`) are excluded from version control, database URIs are never logged, and `UserSchema` hides `password`, `resetPasswordToken`, `resetPasswordExpire`, and `passwordChangedAt` via both `select: false` and `toJSON` transforms.

---

## 📁 Folder Structure

```text
Tracker/
├── backend/
│   ├── config/          # DB connection & config.env.example
│   ├── controllers/     # Route handlers (user, task, quiz, doubt, chat, message)
│   ├── middleware/      # Auth, RBAC, centralized error handler, rate limiters, Multer upload
│   ├── models/          # Mongoose schemas with validation & indexes
│   ├── routes/          # Express API routers (/api/v1/*)
│   ├── tests/           # Jest + Supertest + MongoMemoryServer test suites
│   ├── utils/           # Error handler, JWT/cookie helper, Nodemailer, input validators
│   ├── app.js           # Express app, Helmet, CORS, sanitization, routes
│   └── server.js        # Process bootstrap & DB startup
├── socket/
│   ├── tests/           # Socket.IO auth & real-time messaging tests
│   ├── index.js         # Authenticated Socket.IO server
│   └── .env.example
├── frontend/
│   ├── public/          # Static assets & SPA redirects
│   ├── src/
│   │   ├── components/  # Dashboards, Chat, Quiz, Timetable, Doubt, Leaderboard, Profile
│   │   ├── pages/       # Homepage, Login, Register, ForgotPassword, ResetPassword, Notfound
│   │   ├── tests/       # Vitest + React Testing Library tests
│   │   └── utils/       # Axios API client & authenticated Socket singleton
│   ├── .env.example
│   ├── .env.production
│   └── vercel.json      # Vercel SPA rewrite configuration
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/config/config.env` or hosting env vars)
| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | No (default `5000`) | HTTP port |
| `NODE_ENV` | Yes | `development`, `test`, or `production` |
| `DB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Strong secret used to sign JWTs and socket receipts |
| `JWT_EXPIRE` | No (default `5d`) | JWT lifetime |
| `COOKIE_EXPIRE` | No (default `5`) | Cookie expiration in days |
| `FRONTEND_URL` | Yes (prod) | Public frontend URL used in password reset links |
| `ALLOWED_ORIGINS` | Yes (prod) | Comma-separated CORS allowlist (e.g. `https://tracker-ksb7.vercel.app`) |
| `SOCKET_URL` | Recommended | Internal/public URL of the Socket.IO server for `/internal/emit` |
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.0-flash` |
| `SMTP_SERVICE` | Yes (for email) | Mail service (e.g. `gmail`) |
| `SMTP_HOST` | Yes (for email) | SMTP hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Yes (for email) | SMTP port (e.g. `465`) |
| `SMTP_EMAIL` | Yes (for email) | Sender email address |
| `SMTP_PASSWORD` | Yes (for email) | SMTP app password |

### Socket Server (`socket/.env` or hosting env vars)
| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | No (default `8000`) | Socket server port (Render injects `PORT` automatically) |
| `JWT_SECRET` | Yes | **Must match backend `JWT_SECRET`** |
| `ALLOWED_ORIGINS` | Yes (prod) | Comma-separated CORS allowlist |

### Frontend (`frontend/.env` / Vercel env vars)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000` or `https://tracker-backend-wels.onrender.com`) |
| `VITE_SOCKET_URL` | Socket server URL (e.g. `http://localhost:8000` or `https://tracker-socket-1gc6.onrender.com`) |

---

## 🚀 Local Development Setup

### 1. Clone and Prepare Environment Files
```bash
git clone https://github.com/himanshi20004/Tracker.git
cd Tracker

cp backend/config/config.env.example backend/config/config.env
cp socket/.env.example socket/.env
cp frontend/.env.example frontend/.env
```
Fill in `DB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and SMTP settings in `backend/config/config.env`, and use the same `JWT_SECRET` in `socket/.env`.

### 2. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Install & Run Socket Server
```bash
cd socket
npm install
npm run dev
```

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Configuration & Indexes

Mongoose manages collections in MongoDB Atlas:
- `UserParth`: `email` (unique), `{ points: -1 }`
- `Task`: `{ deadline: 1 }`, `{ createdAt: -1 }`
- `CompletedTask`: `{ user: 1, task: 1 }` (unique compound index)
- `Quiz`: `{ createdAt: -1 }`, `{ deadline: 1 }`
- `Score`: `{ user: 1, quiz: 1 }` (unique compound index)
- `Chat`: `{ participants: 1 }`
- `Message`: `{ conversationId: 1, createdAt: 1 }`
- `Resource`: `{ createdAt: -1 }`

---

## 📡 API Documentation (`/api/v1`)

### Auth & Profile
- `POST /register` — Public student registration (`role` forced to `user`; admin rejected with `403`).
- `POST /login` — Authenticate and receive JWT + HTTP-only cookie.
- `GET /logout` — Clear auth cookie.
- `GET /me` — Get current authenticated user profile (protected).
- `PUT /me/update` — Update `username` and `email` (protected).
- `PUT /password/update` — Verify `oldPassword` and update password (protected).
- `POST /password/forgot` — Request reset link email.
- `PUT /password/reset/:token` — Reset password using hashed single-use token.
- `PATCH /user/update` — Safe profile update only (rejects `points`, `completedTasks`, `role` with `403`).
- `GET /leaderboard` — Paginated student leaderboard (protected).
- `GET /users` — Chat contact list (`_id`, `username`, `role`) (protected).

### Admin Management (`admin` role required)
- `GET /admin/users` — Paginated user list (sanitized, no passwords).
- `GET /admin/user/:id` — Get single user details.
- `PUT /admin/user/:id` — Update user role (`user` / `admin`) or profile.

### Tasks
- `GET /task` — List tasks (protected).
- `GET /task/:id` — Get single task (protected).
- `POST /task` — Create task (`admin`).
- `PUT /task/:id` — Update task (`admin`).
- `DELETE /task/:id` — Delete task (`admin`).
- `POST /complete-task` — Atomically mark task complete and award points (protected).
- `POST /details` — Fetch task details by ID list (protected).

### Quizzes
- `POST /postquizzes` — Create quiz (`admin`).
- `GET /getquizzes` — List quizzes (`correctAnswer` stripped for students) (protected).
- `GET /quizzes/:quizId` — Get quiz (`correctAnswer` stripped for students) (protected).
- `POST /quizzes/:quizId/submit` — Atomically submit quiz and compute score server-side (student).

### Timetable, Resources, AI & Chat (all protected)
- `GET|POST|PUT /timetable/:userId` & `DELETE /timetable/:userId/:eventId?date=YYYY-MM-DD` — Owner-only timetable CRUD.
- `POST /resource` (`admin`, PDF <= 10MB) & `GET /resources` (authenticated).
- `POST /solveDoubt` — Rate-limited AI doubt solver.
- `POST /api/v1/send/:receiverId` & `GET /api/v1/read/:receiverId` — Persist & retrieve messages.

---

## 🧪 Testing

### Backend Tests (Jest + Supertest + MongoDB Memory Server)
```bash
cd backend
npm test
```

### Socket Tests (Jest + Socket.IO Client)
```bash
cd socket
npm test
```

### Frontend Tests, Lint & Build (Vitest + ESLint + Vite)
```bash
cd frontend
npm test
npm run lint
npm run build
```

---

## 🌐 Deployment Notes (Vercel & Render)

1. **Backend (Render Web Service):**
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Required env vars: `DB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `FRONTEND_URL`, `SOCKET_URL`, `GEMINI_API_KEY`, `NODE_ENV=production`, and `SMTP_*` variables.
2. **Socket Server (Render Web Service):**
   - Root directory: `socket`
   - Build command: `npm install`
   - Start command: `npm start`
   - Required env vars: `JWT_SECRET` (**must match backend**), `ALLOWED_ORIGINS`.
3. **Frontend (Vercel):**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - `vercel.json` handles SPA client-side route rewrites.
