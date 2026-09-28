# B-Trans App

A full-stack web app built for B-Trans, a road freight company based in Sverepec, Slovakia — developed over a 10-week internship. It ships two things: a public marketing site for the company, and an admin panel the owner uses daily to track drivers, vehicles, and delivery stops.

**Live:** [b-trans-app.vercel.app](https://b-trans-app.vercel.app) · API: `b-trans-backend.onrender.com` (free-tier host, may take a few seconds to wake up on first request)

## What it does

**Public site** — company info, services, and a careers form for driver applicants, in Slovak.

**Admin panel** (JWT-authenticated, admin-only registration):
- **Overview** — calendar heatmap of daily stops, a monthly per-driver report, and a styled multi-sheet Excel export (summary + day-by-day breakdown)
- **Log stops** — enter each driver's stop count per day, editable retroactively for the whole month
- **Drivers** — manage permanent staff and substitute drivers separately
- **Vehicles** — fleet tracking with photo upload (client-resized, stored in MongoDB), STK (roadworthiness inspection) due dates, and Slovak highway vignette expiry tracking
- **Automated reminders** — a scheduled GitHub Actions job hits a secret-protected backend endpoint daily; if any vehicle's STK or vignette is due within 30 days (or overdue), it emails a summary via Resend

## Tech stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS v4, React Router, ExcelJS (lazy-loaded for exports)

**Backend** — Node.js, Express, TypeScript (NodeNext ESM), MongoDB via Mongoose, JWT auth with rate limiting (`express-rate-limit`) and security headers (`helmet`)

**Testing & CI** — Vitest across both apps (Testing Library on the frontend, Supertest + `mongodb-memory-server` on the backend), with a GitHub Actions workflow that builds and tests both on every push/PR

## Notable engineering details

- Full TypeScript coverage on both ends, migrated from a plain-JS prototype
- JWT logout that actually invalidates old tokens (`tokenVersion` check), not just client-side token deletion
- Locked-down CORS, rate-limited auth routes, and register-enumeration protection
- All user-facing strings, including API error messages, localized in Slovak
- Vehicle photos are resized client-side (canvas) before upload to keep MongoDB documents small, since the free hosting tier has no persistent file storage
- Excel export is code-split so the ~1MB `exceljs` library only loads when a user actually clicks "Export"

## Project structure

Monorepo with two independently deployable apps:

- [`frontend/`](frontend/) — React app, deployed to Vercel
- [`backend/`](backend/) — Express API, deployed to Render

Each has its own `package.json`, README, and test suite — see those for local setup instructions. When configuring a host, point it at the correct root directory (`frontend` or `backend`).
