# Vercel Deployment Setup Guide

Your project has been configured for Vercel deployment. This guide walks you through the deployment process.

## Configuration Files Created

- **`vercel.json`** - Main Vercel configuration with build settings and API routing
- **`server/api/index.js`** - Serverless function wrapper for your Express backend
- **`.env.example`** - Environment variable template

## Step 1: Prepare Your Repository

Ensure your code is committed to GitHub:

```bash
git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

## Step 2: Set Up Vercel Project

### Option A: Using Vercel Dashboard (Recommended for First-Time Setup)

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create a free account
3. Click **"Add New..."** → **"Project"**
4. Select **"Import Git Repository"**
5. Choose your GitHub repository (portugal-project)
6. Vercel will auto-detect the monorepo structure
7. Click **"Deploy"** (configuration will be read from `vercel.json`)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

## Step 3: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**:

**Frontend Variables** (prefixed with `VITE_` for client access):
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend Variables** (only accessible on server):
```
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 4: Update Your Domain Configuration

### For Custom Domains

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `tukinlisbon.com`)
3. Update your DNS provider with Vercel's nameservers

### For Preview Deployments

Vercel automatically generates preview URLs for every push to non-main branches:
- Format: `https://<project>-<branch>.<team>.vercel.app`
- These are useful for testing before merging to production

## Step 5: Update External Services

### Stripe Webhook Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Update webhook endpoint URL to: `https://your-domain.vercel.app/api/stripe-webhook`
4. Ensure the webhook secret is set in your Vercel environment variables

### CORS Configuration

Your `server/index.js` has been updated to automatically allow:
- All Vercel preview URLs: `*.vercel.app`
- Your custom domains (already configured)
- Localhost for local development

If you add new domains, update the `allowedOrigins` array in `server/index.js`.

## Deployment Architecture

### Frontend (React + Vite)
- Built to: `client/dist`
- Served from Vercel's global CDN
- Automatically cached and optimized

### Backend (Express API)
- Deployed as serverless functions in `server/api/index.js`
- Cold starts optimized with Node.js 18+
- Automatic scaling with traffic

### Database
- Supabase PostgreSQL (hosted separately)
- Redis wrapper for caching (configured in Supabase)

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel dashboard
- [ ] Visit your deployment URL and verify frontend loads
- [ ] Test API endpoints: `https://your-domain.vercel.app/api/health`
- [ ] Verify Supabase connection from frontend (check browser console)
- [ ] Update Stripe webhook to point to Vercel API URL
- [ ] Test booking flow end-to-end
- [ ] Check Vercel logs for any errors: `vercel logs <project-url>`
- [ ] Set up custom domain in Vercel and DNS provider
- [ ] Enable auto-deployments: Settings → Git → Deploy on push

## Monitoring & Logs

### View Deployment Logs

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# View logs for your project
vercel logs

# View logs for a specific deployment
vercel logs <deployment-url>
```

### Real-time Monitoring

1. Go to Vercel dashboard → **Deployments**
2. Click on the latest deployment
3. View **Logs**, **Runtime Logs**, and **Build Logs**

## Performance Optimization

Your configuration includes:

- **Brotli & Gzip Compression** - Pre-compressed assets for faster delivery
- **Code Splitting** - Automatic chunking of vendor libraries
- **Cache Headers** - API endpoints set to no-cache for freshness
- **Rate Limiting** - 100 requests per 15 minutes per IP on API
- **Helmet Security** - Essential security headers on all responses

## Troubleshooting

### Build Fails

**Issue**: Build command fails on Vercel
**Solution**:
1. Check that `npm run build` works locally
2. Verify Node.js version: Vercel uses Node 18+ by default
3. Check `vercel.json` buildCommand matches your setup

### API Routes Return 404

**Issue**: `/api/*` routes not found
**Solution**:
1. Verify `vercel.json` rewrites are correct
2. Ensure `server/api/index.js` exists
3. Check that your Express routes are registered on `app` in `server/index.js`

### CORS Errors in Browser

**Issue**: Browser console shows CORS errors
**Solution**:
1. Verify your domain is in `allowedOrigins` in `server/index.js`
2. For Vercel preview URLs, the regex `/https:\/\/.*\.vercel\.app$/` should match
3. Check that `VITE_` variables are properly set in environment

### Supabase Connection Fails

**Issue**: Cannot connect to Supabase from frontend
**Solution**:
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Check Supabase project URL is correct
3. Ensure RLS policies allow anonymous reads (if needed)
4. Check browser console for detailed errors

### Stripe Webhook Not Firing

**Issue**: Payment events not being processed
**Solution**:
1. Update Stripe webhook endpoint to your Vercel domain
2. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
3. Check Vercel logs for webhook errors: `vercel logs`
4. Test webhook from Stripe dashboard using "Send a test event"

## Local Development vs. Production

### Local Development

```bash
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5173
```

### Production (Vercel)

```bash
# Preview deployment (non-main branch)
https://<project>-<branch>.vercel.app

# Production deployment (main branch)
https://<project>.vercel.app
```

## Next Steps

1. Connect repository to Vercel
2. Set environment variables
3. Deploy and test
4. Configure custom domain
5. Update Stripe webhooks
6. Monitor performance in Vercel dashboard

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express on Vercel](https://vercel.com/docs/frameworks/express)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/cli)

---

**Last Updated**: March 12, 2026
