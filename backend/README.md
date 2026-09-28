# B-Trans backend

Node.js + Express + TypeScript API backed by MongoDB, with JWT login.

## Setup

1. Install MongoDB locally, or create a free cluster at mongodb.com/atlas and copy its connection string.
2. `cd backend`
3. `npm install`
4. `cp .env.example .env` and fill in `MONGODB_URI` and a random `JWT_SECRET`. The `RESEND_API_KEY` / `REMINDER_*` vars are only needed for the STK/vignette email reminders (see below) — safe to leave blank otherwise.
5. `npm run dev` — starts the API on `http://localhost:4000`.

The first account you register via `POST /api/auth/register` automatically becomes `admin`. Every account after that must also be created by an admin (send the admin's token in the `Authorization` header) — there is only the one `admin` role.

## Testing

```
npm test
```
Vitest + Supertest, against an in-memory MongoDB instance (`mongodb-memory-server`) — no real database needed.

## Data model

- **User** — admin login credentials.
- **Driver** — permanent/substitute driver shown on the Drivers page.
- **Vehicle** — fleet vehicle: plate, photo, assigned driver, last STK date, STK interval (1/2/4 years), highway vignette purchase date + duration, in-service flag + reason.
- **LogStop** — one document per driver per day, storing stop count, used to build the monthly report.
- **Applicant** — a careers-form submission from the public site.

## API

All routes except `/api/auth/register`, `/api/auth/login`, `POST /api/applicants`, and `/api/vehicles/check-reminders` require `Authorization: Bearer <token>`.

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | current user |
| POST | `/api/auth/logout` | invalidates the current token server-side |
| GET | `/api/drivers` | list |
| POST/PATCH/DELETE | `/api/drivers[/:id]` | admin only |
| GET | `/api/vehicles` | list |
| POST/PATCH/DELETE | `/api/vehicles[/:id]` | admin only |
| POST | `/api/vehicles/check-reminders` | requires `x-reminder-secret` header (matches `REMINDER_SECRET`); emails a summary if any vehicle's STK or vignette is due within 30 days or overdue |
| GET | `/api/logstops?driver=&year=&month=` | list entries |
| PUT | `/api/logstops` | upsert one day: `{ driver, date, stops }` |
| DELETE | `/api/logstops/:id` | |
| GET | `/api/report?year=&month=` | totals per driver for that month |
| POST | `/api/applicants` | public careers-form submission |
| GET | `/api/applicants` | admin only |

## STK / vignette email reminders

`POST /api/vehicles/check-reminders` is meant to be called on a schedule (see `.github/workflows/reminders.yml` — a daily GitHub Actions cron), not from the frontend. It sends email via [Resend](https://resend.com). Set `RESEND_API_KEY`, `REMINDER_EMAIL_TO`, `REMINDER_EMAIL_FROM`, and `REMINDER_SECRET` as environment variables — the same `REMINDER_SECRET` must be set as a GitHub Actions secret alongside `BACKEND_URL`.

## Deploying

Any Node host works (Render, Railway, Fly.io). Build with `npm run build` (compiles TypeScript to `dist/`) and start with `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your deployed frontend URL), and the `RESEND_API_KEY`/`REMINDER_*` vars as environment variables there — don't commit `.env`.
