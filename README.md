# Real Time News Platform

A full-stack news broadcasting platform

> Demonstrate Firebase Cloud Messaging (FCM) integration.

## Features

1. Admin Panel

- User management — view all users, their subscriptions and token status
- Topic management — create/delete topics
- News management - create/edit/delete news
- Send Notification to single user, topic or all user
- Schedule notifications (E.g. At 12 PM particular news article release on this channel)
- View notification history & delivery stats
- See which tokens are active/dead
- Manual Token refresh

2. User Panel (for now user can only view news )

- User authentication to tie token to users
- Subscribe/unsubscribe to topics (Sports, Tech, Finance, etc.)
- Notification Preferences Settings (mute/unmute, time period)
- Click Action -- redirect to relavent news page
- Notification inbox — users can see past notifications even if they missed the push

3. Background / System

- Auto token refresh (`onTokenRefresh`)
- Dead token cleanup on send failure
- Retry mechanism — auto retry failed notifications

## Future

- Email fallback — if push fails, send email instead
- Push analytics per news article — which article got most engagement
- Role-based admin access — super admin vs editor

---

## Local Development Setup

### Prerequisites

| Tool             | Version |
| ---------------- | ------- |
| Node.js          | 20+     |
| pnpm             | 9+      |
| PostgreSQL       | 15+     |
| Firebase project | —       |

### 1 — Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com) and create (or open) a Web project.
2. Enable **Authentication → Email/Password** sign-in provider.
3. Enable **Cloud Messaging**.
4. **Service account key** (for the backend):  
   Project settings → Service accounts → **Generate new private key** → download JSON.  
   Paste the entire JSON object (one line) as the value of `FIREBASE_PRIVATE_KEY` in `backend/.env`.
5. **Web app config** (for both client apps):  
   Project settings → Your apps → Web → SDK setup → copy the `firebaseConfig` values into  
   `frontend/.env` and `admin/.env`.
6. **VAPID key** (for FCM push in the browser):  
   Project settings → Cloud Messaging → Web Push certificates → **Generate key pair** →  
   copy the key string into `VITE_FIREBASE_VAPID_KEY` in `frontend/.env`.

### 2 — Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Frontend user app
cp frontend/.env.example frontend/.env
# Admin app
cp admin/.env.example admin/.env
```

Then fill in every value that contains a placeholder (see the comments inside each `.env.example`).

### 3 — Install Dependencies

```bash
cd backend  && pnpm install
cd ../frontend && pnpm install
cd ../admin    && pnpm install
```

### 4 — Database Setup

```bash
cd backend
# Apply all migrations (creates tables)
pnpm prisma migrate dev
# (Optional) open Prisma Studio to inspect data
pnpm prisma studio
```

### 5 — Start the Apps

Open **three terminals** and run each command in its own tab:

```bash
# Terminal 1 — Backend API  (http://localhost:5000)
cd backend
pnpm dev

# Terminal 2 — Frontend user app  (http://localhost:5173)
cd frontend
pnpm dev

# Terminal 3 — Admin app  (http://localhost:5174)
cd admin
pnpm dev
```

> **Startup order matters**: start the backend first so the Vite proxies have somewhere to point.

### 6 — First-time Admin Account

Use Firebase Authentication to sign up via the user app (`/register`), then manually set the `role` field of that user to `"ADMIN"` in your database (e.g. via Prisma Studio or psql) before logging in to the admin panel.

### 7 — Push Notification Notes

- Browser push requires **HTTPS in production**. For local development `localhost` is treated as a secure origin, so push works on `http://localhost`.
- The service worker (`/firebase-messaging-sw.js`) is loaded automatically by `FCMManager` on the user app. It receives the Firebase config via `postMessage`, so no secrets are hardcoded in the worker file.
- Background notifications (tab in background / closed) are handled by the service worker. Foreground notifications (tab is active) are shown as native `Notification` toasts by `FCMManager`.
- If the browser blocks notifications, the user must manually grant permission in the browser's site settings.
