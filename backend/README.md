# B-Trans backend

Node.js + Express API backed by MongoDB, with JWT login.

## Setup

1. Install MongoDB locally, or create a free cluster at mongodb.com/atlas and copy its connection string.
2. `cd server`
3. `npm install`
4. `cp .env.example .env` and fill in `MONGODB_URI` and a random `JWT_SECRET`.
5. `npm run dev` — starts the API on `http://localhost:4000`.

The first account you register via `POST /api/auth/register` automatically becomes `admin`. Every account after that must be created by an admin (send the admin's token in the `Authorization` header).

## Data model

- **User** — login credentials (`admin` or `driver` role).
- **Driver** — permanent/substitute driver shown on the Drivers page.
- **Vehicle** — fleet vehicle: plate, assigned driver, last STK date, STK interval (1 or 2 years), in-service flag + reason.
- **LogStop** — one document per driver per day, storing stop count and hours, used to build the monthly report.

## API

All routes except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/drivers` | list |
| POST/PATCH/DELETE | `/api/drivers[/:id]` | admin only |
| GET | `/api/vehicles` | list |
| POST/PATCH/DELETE | `/api/vehicles[/:id]` | admin only |
| GET | `/api/logstops?driver=&year=&month=` | list entries |
| PUT | `/api/logstops` | upsert one day: `{ driver, date, stops, hours }` |
| GET | `/api/report?year=&month=` | totals per driver for that month |

## Deploying

Any Node host works (Render, Railway, Fly.io). Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` (your deployed frontend URL) as environment variables there — don't commit `.env`.
