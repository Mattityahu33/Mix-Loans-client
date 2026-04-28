# Mix Loans Frontend Deployment (Vercel)

## Overview
- Frontend location: `client/`
- Framework: Vite + React
- Backend API: `https://mix-loans.onrender.com`
- Architecture: React frontend (Vercel) -> Render backend API -> Supabase PostgreSQL

## Vercel Project Settings
- Project root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Required Environment Variables
Set these in Vercel for Production (and Preview if needed):

```env
VITE_API_BASE_URL=https://mix-loans.onrender.com
VITE_API_URL=https://mix-loans.onrender.com
```

`VITE_API_BASE_URL` is the primary variable used by the app API client.

## API Configuration Notes
- The frontend API helper builds requests from:
  - `baseURL: ${VITE_API_BASE_URL}/api`
- Service calls should remain route-only, for example:
  - `/auth/login`
  - `/clients`
  - `/loans`
  - `/payments`
  - `/collateral`
  - `/dashboard/*`
  - `/settings`
  - `/notifications`
- Avoid duplicate path patterns like `/api/api/...`.

## React Router Refresh Fix
This project includes `vercel.json` with a rewrite to `index.html` so direct URL refreshes work on client-side routes.

## Security Reminder
- Do not place database credentials in frontend env vars or source files.
- Do not expose Supabase service keys, Postgres connection strings, JWT secrets, or backend private secrets in Vercel frontend env.
- Frontend must call only the backend API (`https://mix-loans.onrender.com`) for data operations.

## Common Vercel Issues and Fixes
- 404 on page refresh:
  - Ensure `vercel.json` rewrite to `index.html` exists in `client/`.
- API requests fail in production:
  - Confirm `VITE_API_BASE_URL` is set in Vercel and redeploy.
  - Confirm value is exactly `https://mix-loans.onrender.com` (no trailing spaces).
- Wrong endpoint shape:
  - Ensure API client base URL ends with only one `/api` and service methods use route paths like `/clients`.
