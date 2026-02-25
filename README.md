# Portugal Project

React + Vite client with an Express API server, managed as an npm workspaces monorepo.

## Tech stack

- Client: React 18, Vite, React Router, Tailwind CSS
- Server: Express, CORS, dotenv

## Project structure

- client/: React app (Vite)
- server/: Express API
- package.json: workspace scripts

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Environment variables

### Client (Supabase)

Create client/.env.local:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note: The checked-in .env.example lists SUPABASE*URL and SUPABASE_ANON_KEY without the VITE* prefix. Vite only exposes variables that start with VITE*. Use the VITE* names shown above for the client.

### Server

Optional server/.env:

```
PORT=5000
```

## Install dependencies

From the repo root:

```
npm install
```

This installs dependencies for both client and server via npm workspaces.

## Run in development

From the repo root:

```
npm run dev
```

This starts:

- Client dev server on http://localhost:5173
- API server on http://localhost:5000

## Run individually

Client only:

```
npm run dev:client
```

Server only:

```
npm run dev:server
```

## Build the client

```
npm run build
```

## Lint the client

```
npm run lint
```

## Health check

```
GET http://localhost:5000/api/health
```

Should return a JSON health response.
