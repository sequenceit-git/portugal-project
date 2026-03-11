# Vercel Deployment Guide

This project is configured to deploy on Vercel with both a React frontend and Express API backend.

## Prerequisites

- A Vercel account (free or paid)
- GitHub, GitLab, or Bitbucket repository
- Node.js 18+ (recommended)

## Environment Variables

Add these to your Vercel Project Settings > Environment Variables:

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Deployment Steps

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." > "Project"
   - Import your GitHub/GitLab/Bitbucket repository

2. **Configure environment variables:**
   - In Project Settings, add all required environment variables
   - Keep sensitive keys in production environment only

3. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Vercel will automatically deploy on every push to `main` branch

## Monorepo Structure

This project uses npm workspaces:
- `client/` - React + Vite frontend
- `server/` - Express API backend

## Post-Deployment Checklist

- [ ] Update `CORS_ORIGINS` in server to include your Vercel domain
- [ ] Configure Stripe webhook to point to your Vercel API URL
- [ ] Test Supabase connection from deployed frontend
- [ ] Verify environment variables are set correctly
- [ ] Check logs for any errors: `vercel logs <project-url>`

## Local Development

```bash
npm install
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:5173/api

## Troubleshooting

### Build fails
- Ensure `npm run build` works locally
- Check Node.js version compatibility

### API calls fail
- Verify CORS settings in `server/index.js`
- Check environment variables are exposed to frontend (VITE_ prefix)
- Ensure API URL is correctly configured in client

### Static files not found
- Frontend build output goes to `client/dist`
- Verify `vercel.json` routes are correct
