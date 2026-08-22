# 📱 Life OS — Mobile-First Task & Calendar App

> **Intern Assignment:** Build a responsive, mobile-first task management and scheduling web application.

[![CI](https://github.com/YOUR_USERNAME/life-os/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/life-os/actions)

## 🚀 Live Demo

**Production:** IN PROGRESS

---

## ✨ Features

| Feature                     | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| ⚡ **Quick Task Capture**   | Add tasks in 3 seconds via mobile bottom sheet            |
| 📅 **Interactive Calendar** | Day/Week/Month views with color dot indicators            |
| 🔥 **Streak Engine**        | Track consecutive productive days (PLG feature)           |
| 🚀 **Viral Referral**       | Share achievements + referral links on social media       |
| 🛡️ **RBAC Auth**            | Admin vs User separation, server-side enforced            |
| 📊 **Admin Dashboard**      | DAU/MAU analytics, feedback management, announcements     |
| ⚡ **Real-time Sync**       | Convex WebSocket backend — instant updates across devices |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS v4 + Radix UI
- **Auth:** Clerk (`@clerk/nextjs`) with OAuth Google/GitHub
- **Backend:** Convex (Reactive real-time database)
- **Testing:** Vitest + React Testing Library
- **Deployment:** Cloudflare Pages (nodejs_compat)
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```
life-os/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing Page (/)
│   │   ├── app/
│   │   │   ├── page.tsx          # Task List (/app)
│   │   │   ├── calendar/         # Calendar View (/app/calendar)
│   │   │   └── settings/         # Settings + Feedback (/app/settings)
│   │   └── admin/
│   │       └── page.tsx          # Admin Dashboard (/admin)
│   ├── components/
│   │   ├── tasks/                # TaskCard, QuickCapture, TaskFilter
│   │   ├── streak/               # StreakBar, ShareModal (PLG)
│   │   └── layout/               # MobileNav, AnnouncementBanner
│   └── lib/
│       └── utils.ts              # Utilities
├── convex/
│   ├── schema.ts                 # Database schema (6 tables)
│   ├── helpers.ts                # requireAdmin(), streak calc
│   ├── users.ts                  # User CRUD + analytics
│   ├── tasks.ts                  # Task CRUD + calendar data
│   ├── categories.ts             # Category CRUD
│   ├── feedbacks.ts              # Feedback submission/management
│   ├── announcements.ts          # System announcements
│   └── http.ts                   # Clerk webhook handler
└── tests/
    ├── unit/                     # Task transitions, streak engine
    └── integration/              # Admin RBAC, data isolation
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/life-os.git
cd life-os
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Clerk and Convex keys
```

### 3. Setup Convex

```bash
# Initialize Convex (creates convex/_generated/ and adds NEXT_PUBLIC_CONVEX_URL)
npx convex dev

# Set server-side secrets
npx convex env set CLERK_WEBHOOK_SIGNING_SECRET whsec_your_secret
npx convex env set ADMIN_EMAIL your-email@example.com
```

### 4. Setup Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
2. Add endpoint: `https://your-deployment.convex.site/clerk-webhook`
3. Events: `user.created`, `user.updated`
4. Copy signing secret → `npx convex env set CLERK_WEBHOOK_SIGNING_SECRET whsec_...`

### 5. Run Development

```bash
npm run dev
# App: http://localhost:3000
```

---

## 🧪 Testing

```bash
npm run test:run    # Run all tests once
npm run test        # Watch mode
npm run typecheck   # TypeScript strict check
```

**Test Coverage:**

- ✅ Task state transitions (todo → in_progress → completed)
- ✅ Streak engine (consecutive days, reset, chain calculation)
- ✅ Admin RBAC guard (user/admin/unauthenticated paths)
- ✅ Multi-tenant data isolation (ownership checks)
- ✅ Referral code generation (uniqueness, character validation)

---

## ☁️ Cloudflare Deployment

### Environment Variables (Cloudflare Pages Settings)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY = sk_live_...
NEXT_PUBLIC_CONVEX_URL = https://your-prod.convex.cloud
NEXT_PUBLIC_APP_URL = https://life-os.pages.dev
```

### Cloudflare Pages Config

- **Framework preset:** Next.js
- **Build command:** `npm run build`
- **Build output:** `.next`
- **Node.js compatibility flags:** `nodejs_compat` ✅

---

## 🛡️ Security Architecture

- **Server-side RBAC:** `requireAdmin(ctx)` guard on ALL admin mutations
- **Multi-tenant isolation:** Every query filters `userId === ctx.auth.getUserIdentity().subject`
- **JWT scoping:** `ConvexProviderWithClerk` ensures Convex uses Clerk session tokens
- **No client-side trust:** Admin checks NEVER rely on React state/UI alone

---

## 📊 Route Overview

| Route           | Access        | Description                         |
| --------------- | ------------- | ----------------------------------- |
| `/`             | Public        | Landing page with interactive demo  |
| `/sign-in`      | Public        | Clerk sign-in                       |
| `/sign-up`      | Public        | Clerk sign-up                       |
| `/app`          | Authenticated | Task list, streak, quick capture    |
| `/app/calendar` | Authenticated | Interactive calendar                |
| `/app/settings` | Authenticated | Profile + feedback form             |
| `/admin`        | Admin only    | Analytics, feedbacks, announcements |

---

## 📄 License

MIT — Built for Life OS Intern Assignment 2026.
