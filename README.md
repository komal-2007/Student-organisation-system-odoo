# Skyline — Student Organization System

Hackathon project for managing student organizations.

The backend lives in [`backend/`](backend/). See [backend/README.md](backend/README.md) for install and run instructions.

## Local frontend development

The Vite frontend runs at `http://localhost:3000`; the Skyline API runs at `http://localhost:3001`.

1. Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_SUPABASE_URL` plus either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` using public Supabase project settings. Never put a service-role key or other secret in frontend configuration or source code. `.env.local` is local-only and Git-ignored.
2. Set `PORT=3001`, `CORS_ORIGIN="http://localhost:3000"`, and the backend-required values in `backend/.env`; preserve local database credentials.
3. Run `npm --prefix backend run dev` and `npm --prefix frontend run dev`.

The frontend API base defaults to `http://localhost:3001/api`; set `VITE_API_BASE_URL` in `frontend/.env.local` only to override it.
