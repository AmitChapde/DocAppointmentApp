# Doctor Booking Application

This repository contains a monorepo for a simple doctor booking application: an Express + Prisma backend and a React + Vite frontend.

**Contents**

- **server/** — Node.js + Express API, Prisma schema and migrations
- **client/** — React + Vite frontend

---

**A. Deployment Explanation (Step-by-Step)**

1. Project Setup

1.1 Folder Structure (Monorepo)

```
repo-root/
├─ server/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ index.js
│  │  └─ controllers/...
│  ├─ package.json
│  └─ .env
├─ client/
│  ├─ src/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ package.json
│  └─ .env
└─ README.md
```

server: Node.js (Express) + Prisma + PostgreSQL

client: React + Vite

1.2 Dependencies (high level)

- server: Node.js 18+ (recommended 20), express, cors, helmet,morgan, prisma, @prisma/client, dotenv
- client: Vite, React, (axios or fetch), Material UI

  1.3 Installation Steps (Local)

Clone and install

server

```
cd server
npm ci
```

client

```
cd client
npm ci
```

Prepare env files (examples below)

Initialize database (local)

```
cd server
npx prisma generate
npx prisma migrate dev --name init
```

Run locally

```
# server (dev)
npm run dev
# client (Vite)
cd client && npm run dev
```

2. Environment Variables

Below are the variables used by this project.

Example variables

- `DATABASE_URL` (server) — PostgreSQL connection string
- `NODE_ENV` (Both) — development|production
- `PORT` (server) — PORT 
- `BOOKING_HOLD_SECONDS`(server) - Booking simulation time
- `VITE_API_URL` (client) — deployed server base URL (must include protocol)

Local server `.env` (server/.env)

```
DATABASE_URL=postgres://user:pass@localhost:5432/doctor_app
JWT_SECRET=replace-with-secure-random
NODE_ENV=development
```

Local client `.env` (client/.env)

```
VITE_API_URL=http://localhost:3000
```

2.2 How they were configured on hosting

Render

Open your Render project → Service (server) →Enviornment Variables and add `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`. make sure your server reads `process.env.PORT`.

Vercel (client)

Project settings → Environment Variables → add `VITE_API_URL` with the server public URL (include `https://`). For Vite, only variables prefixed with `VITE_` are exposed to the browser.

3. Backend Deployment

Platform: Render

- New → GitHub Repo → select repository/branch
- Set Root Directory to `server`
- Build command:

```
npm ci && npx prisma generate
```

- Start command (if you want migrations on deploy):

```
npx prisma migrate deploy && node src/index.js
```

Variables: set `DATABASE_URL`, , `NODE_ENV`

Notes:

- Ensure the server listens on `process.env.PORT`.
- If using an external DB (Neon/Supabase/RDS), use that connection string.

Testing server after deployment

```
curl -i https://<your-server-url>/api/health
```

Also use Postman with a collection variable `base_url` pointing to your deployed URL and test endpoints ( `/api/doctors`, `/api/appointments`).

4. Frontend Deployment

Platform: Vercel 

Vercel steps

- Import Project → select `client` as root
- Install: `npm ci`
- Build: `npm run build`
- Output Directory: `dist`
- Env Var: `VITE_API_URL` = `https://<your-server-url>`
- Deploy and verify the public URL loads

Updating API base URL

client uses `import.meta.env.VITE_API_URL` (ensure it includes `https://`). Example usage:

```js
const base = import.meta.env.VITE_API_URL;
const res = await fetch(`${base}/api/appointments`);
```

5. Connecting client & server

The client calls REST endpoints hosted at `VITE_API_URL`.

CORS example (Express):

```js
import cors from "cors";
const allowed = ["http://localhost:5173", "https://your-client.vercel.app"];
app.use(cors({ origin: allowed, credentials: true }));
```

Verify live API calls by opening the deployed client, using DevTools Network tab, and confirming requests go to your server and return 2xx/4xx codes.

6. Validation

Functional checks in production

- Doctors: list/search returns expected results
- Appointments: book, list, cancel
- Error handling and 401/403 flows

Deployed URLs

- server API: https://docappointmentapp-wqgg.onrender.com
- client:[https://doc-appointment-q86hexjwg-amit-chapdes-projects.vercel.app](https://doc-appointment-app-pi.vercel.app/slots)

---

**B. Full Product Explanation (Feature Walkthrough)**

1. Product Objective

Simplify discovering doctors and booking appointments online. End users: patients, doctors/clinic staff, and optional admin for oversight.

2. Architecture Overview

Tech stack

- client: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Hosting: Render(server), Vercel (client)

High-level: client calls REST APIs, Express uses Prisma for DB.

3. Feature-by-Feature Demo (summary)

- Patient flow: Browse Doctors → Pick slot → Book → View/Cancel
- Doctor flow: Login → Manage profile → Define available slots → View bookings
- Admin flow: Manage doctors/users, monitor data

  ### API Endpoints (Detailed)

#### GET /api/doctors

- Purpose: List doctors with optional filters and pagination (specialty, location, page, limit).
- Query params (example): `?specialty=cardiology&location=NYC&page=1&limit=20`
- Auth: No

#### GET /api/doctors/:id

- Purpose: Get a single doctor's public profile and availability.
- Path params: `:id` (doctor id)
- Auth: No

#### POST /api/doctors/:id/slots

- Purpose: (Doctor-only) Create availability slots in bulk for the specified doctor.
- Path params: `:id` (doctor id)
- Request body (example):

```json
{
  "slots": [{ "start": "2025-12-15T09:00:00Z", "end": "2025-12-15T09:30:00Z" }]
}
```

- Auth: Yes (doctor)

#### GET /api/doctors/:id/slots

- Purpose: Fetch available time slots for a doctor within an optional date range.
- Path params: `:id` (doctor id)
- Query params (example): `?from=2025-12-15&to=2025-12-20`
- Auth: No (or limited)

#### POST /api/appointments

- Purpose: Book an appointment (patient creates a booking for a chosen slot).
- Request body (example):

```json
{
  "doctorId": "<id>",
  "slotStart": "2025-12-15T09:00:00Z",
  "slotEnd": "2025-12-15T09:30:00Z",
  "reason": "Consultation"
}
```

- Auth: Yes (patient)

#### GET /api/appointments/me

- Purpose: List appointments for the currently authenticated patient (with optional filters).
- Query params (example): `?status=pending&from=2025-12-01&to=2025-12-31`
- Auth: Yes (patient)

#### GET /api/appointments/doctor

- Purpose: List appointments for the currently authenticated doctor (with optional filters).
- Query params (example): `?status=confirmed&from=2025-12-01&to=2025-12-31`
- Auth: Yes (doctor)

#### PATCH /api/appointments/:id

- Purpose: Update an appointment (reschedule or change status). Allowed by owner (patient) or doctor as per rules.
- Path params: `:id` (appointment id)
- Request body (example):

```json
{
  "slotStart": "2025-12-16T10:00:00Z",
  "slotEnd": "2025-12-16T10:30:00Z",
  "status": "confirmed"
}
```

- Auth: Yes (owner/patient or doctor)

#### POST /api/appointments/:id/cancel

- Purpose: Cancel an appointment (soft-cancel or change status).
- Path params: `:id` (appointment id)
- Request body (optional):

```json
{ "cancelReason": "patient unavailable" }
```

#### GET /api/health

- Purpose: Health-check endpoint for deployment and monitoring (returns status, optionally version).
- Request body/params: none
- Auth: No

Bonus features

- Slot generation to avoid overlaps
- Search/filter by specialization or availability

4. Innovation & Design Decisions

- Separation of concerns for independent scaling
- Prisma for safe schema evolution
- Deploy-time `prisma migrate deploy` keeps DB in sync
- Config-driven CORS and env vars for different environments

5. Testing & Debugging

Approach

- Manual testing with Postman

Common issues & fixes

- CORS blocked: add client origin to backend CORS
- DB errors: validate `DATABASE_URL` and migrations
- Wrong API URL: set `VITE_API_URL` to the production backend URL (include `https://`)

---

Appendix: Useful Commands

Backend

```
cd server && npm ci
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
npm run dev
npm start
```

client

```
cd client
npm ci
npm run dev
npm run build
npm run preview
```

# DocAppointmentApp
