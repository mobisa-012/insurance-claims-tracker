## Jubilee Group Full Stack Engineer Insurance Claims Tracker

A simple claims tracker that lets a claims officer log in, capture a claim, view submitted claims, and update a claim's status.

**Stack:** Node.js, TypeScript, Express, Prisma, PostgreSQL (backend) · Next.js + Tailwind CSS (frontend) · JWT cookie auth.

### Project Structure
```
insurance-claims-tracker/
├── prisma/
│   ├── schema.prisma      # User + Claim models, ClaimType/ClaimStatus enums
│   └── seed.ts             # creates a demo login user
├── src/                    # backend (Express API)
│   ├── server.ts / app.ts
│   ├── config.ts            # env vars (validated with zod)
│   ├── controllers/, routes/, validators/, middleware/, utils/
└── frontend/                # Next.js app (App Router) + Tailwind CSS
    └── src/
        ├── app/               # login, claims, dashboard pages
        ├── components/        # StatusBadge, Modal, ClaimFormModal, ClaimDetailsModal
        ├── context/           # AuthContext (current user, login/logout, route guard)
        └── lib/api.ts          # fetch wrapper
```

### Prerequisites
- Node.js 18+
- A PostgreSQL database (this project is set up against a [Railway](https://railway.app) Postgres instance)

### Database Setup
1. Get your Postgres connection string. **If using Railway**, open your Postgres service → **Connect** tab → copy the **Public Network** string (the `...railway.internal` one only works from inside Railway, not from your machine).
2. In the project root, copy `.env.example` to `.env` and fill it in:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=some-long-random-string
   PORT=3000
   CORS_ORIGIN=http://localhost:3001
   ```
3. Create the tables and seed a demo login user:
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```
   The seed script prints a demo username/password — use it to log in.

### Running the Backend
```bash
npm install
npm run dev
```
API runs at http://localhost:3000.

### Running the Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
```
Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
```bash
npm run dev
```
Open http://localhost:3001/login and sign in with the demo credentials from `npm run db:seed`.

### API Endpoints
All `/api/claims*` and `/api/dashboard*` routes require an authenticated session (JWT cookie set by `/api/auth/login`).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in with `{ username, password }`, sets an httpOnly JWT cookie |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/me` | Returns the current logged-in user |
| POST | `/api/claims` | Create a claim (status is always set to `SUBMITTED`) |
| GET | `/api/claims` | List claims — query params: `status`, `policyNumber`, `claimNumber`, `page`, `pageSize` |
| GET | `/api/claims/:id` | Get a single claim's details |
| PATCH | `/api/claims/:id/status` | Update a claim's status — body: `{ status }` |
| GET | `/api/dashboard/summary` | Claim counts grouped by status, plus total |

Claim fields: `claimNumber`, `policyNumber`, `customerName`, `claimType` (`MOTOR`, `HEALTH`, `TRAVEL`, `PROPERTY`, `OTHER`), `claimAmount` (positive number), `incidentDate`, `description`. Status values: `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PAID`.

### Assumptions
1.  No self-registration — a single demo user is created via `npm run db:seed`. There's no signup flow or user management UI.
2.  No role-based permissions — any logged-in user can view and manage all claims.
3.  Status updates are unrestricted — a claim can move from any status to any other status; there's no enforced workflow order.
4. `claimNumber` must be unique; creating a duplicate returns a 409 error.
5.  Auth uses a single httpOnly JWT cookie (not a Bearer token), so the frontend and backend must run on different ports with CORS configured to allow credentials (see `CORS_ORIGIN`).
6.  No file/attachment uploads on claims — out of scope for the stated requirements.
