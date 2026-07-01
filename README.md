# MusicWave

MusicWave is a full-stack music streaming web app with a Spotify/YouTube Music inspired dark UI. It uses YouTube Data API v3 only for metadata/search and the official visible YouTube IFrame Player API for playback.

## Compliance Notes

- YouTube API calls happen only on the Express backend.
- Playback happens through the official YouTube IFrame Player API in a visible mini-player.
- The app does not download, proxy, convert, extract, or directly stream YouTube media.
- There are no MP3 download or audio extraction features.

## Tech Stack

- Client: React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Axios
- Server: Node.js, Express, TypeScript, Prisma, Supabase Database, JWT, bcrypt, Zod, Helmet, CORS, rate limiting
- External APIs: YouTube Data API v3, YouTube IFrame Player API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

3. Configure `server/.env` with your Supabase database URLs:

```env
DATABASE_URL="postgresql://postgres.your-project-ref:your-password@aws-0-your-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"
JWT_SECRET="replace-with-a-long-random-secret"
YOUTUBE_API_KEY="your-youtube-data-api-v3-key"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

Use your Supabase project database settings:

- `DATABASE_URL`: Supabase Transaction Pooler connection string. It is used by the running server.
- `DIRECT_URL`: Supabase Direct Connection string. Prisma uses it for migrations.
- Replace `your-project-ref`, `your-region`, and `your-password` with values from your Supabase project.
- No local PostgreSQL server is required. Supabase itself is PostgreSQL-compatible, so Prisma must keep `provider = "postgresql"` in `server/prisma/schema.prisma`.

4. Configure `client/.env`:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

5. Generate Prisma client and apply the schema to Supabase:

```bash
npm run prisma:generate
npm run prisma:migrate
```

For an already-created Supabase database in production, use Prisma migrations with your Supabase `DIRECT_URL`.

6. Create approved users manually:

```bash
npm run create:user -- --name "Anbanand" --email "you@example.com" --password "StrongPass123!"
```

Only users created this way can sign in. Public account creation is disabled.
You can optionally set initial language preferences:

```bash
npm run create:user -- --name "Anbanand" --email "you@example.com" --password "StrongPass123!" --languages "Tamil,English,Hindi"
```

7. Optional demo user:

```bash
npm run seed
```

Demo credentials:

- Email: `demo@musicwave.local`
- Password: `password123`

8. Run the server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

Client: `http://localhost:5173`

Server: `http://localhost:4000`

## API Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/music/search?q=`
- `GET /api/music/trending`
- `GET /api/music/details/:videoId`
- `POST /api/playlists`
- `GET /api/playlists`
- `GET /api/playlists/:id`
- `PUT /api/playlists/:id`
- `DELETE /api/playlists/:id`
- `POST /api/playlists/:id/songs`
- `DELETE /api/playlists/:id/songs/:videoId`
- `POST /api/liked`
- `DELETE /api/liked/:videoId`
- `GET /api/liked`
- `GET /api/recommendations`

## YouTube API Key

Create a YouTube Data API v3 key in Google Cloud Console, enable YouTube Data API v3, and place the key in `server/.env` as `YOUTUBE_API_KEY`. The key is never exposed to the browser.
