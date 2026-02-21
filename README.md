# Junah.blue

Full-stack marketplace for Junah beats, licensing contracts, and apparel.

## Stack

- Frontend: React + TypeScript + Tailwind + Framer Motion
- Backend: Node.js + Express + MongoDB
- Storage: AWS S3 (beat files + signed agreement PDFs)
- Payments: Stripe Checkout + Stripe webhooks
- Fulfillment: Printify API
- Email: AWS SES

## Required Pages

- `/` Homepage (artist bio + featured beats/apparel)
- `/apparel` Apparel storefront + checkout
- `/beats` Beat marketplace + contract-gated checkout
- `/dashboard` Producer dashboard (owner-only)
- `/licensing` Legal resource center
- `/login` Producer login

## Quick Start (Docker)

1. Copy `.env.example` to `.env` and fill credentials.
2. Start services:
   ```bash
   docker-compose up --build
   ```
3. Open:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`
   - Health: `http://localhost:5000/api/health`
   - Stripe webhook forwarder logs: `docker logs -f junah-stripe-webhook-dev`

If dependencies changed and containers still fail with `ERR_MODULE_NOT_FOUND`, reset persistent dependency volumes and rebuild:

```bash
docker-compose down -v
docker-compose up --build
```

## Stripe Webhook In Dev

`docker-compose.yml` includes a `stripe-webhook` service that runs:

```bash
stripe listen --forward-to http://backend:5000/api/webhooks/stripe --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_failed,payment_intent.payment_failed,payment_intent.canceled,charge.refunded,charge.dispute.created,charge.dispute.updated,charge.dispute.closed
```

One-time setup on your machine:

1. Authenticate Stripe CLI config (creates `~/.config/stripe`):
   ```bash
   docker run -v ~/.config/stripe:/root/.config/stripe -it stripe/stripe-cli:latest login
   ```
2. Set `STRIPE_WEBHOOK_SECRET` in `.env` to the signing secret printed by the running webhook listener.

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm start
```

## VPS Deployment (Single Server + Nginx)

1. Copy `.env.example` to `.env` and set production values (`FRONTEND_ORIGIN=https://junah.blue`, `REACT_APP_API_URL=https://api.junah.blue`).
2. Use deployment files in `deploy/`:
   - `deploy/docker-compose.prod.yml`
   - `deploy/nginx.conf`
3. Run from `deploy/`:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
4. Add TLS certificates (Certbot or your preferred ACME flow) and map them to the Nginx container.

## DigitalOcean App Platform Deployment (GHCR Images)

This repo now includes CI workflows to build/test frontend + backend and publish Docker images to GitHub Container Registry (GHCR):

- `.github/workflows/build-frontend.yaml`
- `.github/workflows/build-backend.yaml`
- `.github/workflows/docker.yaml`

Published image names:

- `ghcr.io/<github-owner>/junah-blue-frontend:latest`
- `ghcr.io/<github-owner>/junah-blue-backend:latest`

### 1. Push to `main` to publish images

`docker.yaml` runs on every push to `main` and pushes both images to GHCR using `GITHUB_TOKEN`.

### 2. Make GHCR images readable by DigitalOcean

If your GHCR packages are private, create a GitHub Personal Access Token (classic) with at least:

- `read:packages`

Then use that credential in DigitalOcean when connecting GHCR.

### 3. App Specs with env mapping

Two App Platform specs are included:

- `deploy/digitalocean/frontend-app.yaml`
- `deploy/digitalocean/backend-app.yaml`

They include all required runtime env vars from `.env.example`, so backend/frontend startup is compatible with current config.

Before deploying, update:

- `image.repository` in both files (replace `your-github-username`)
- all `replace-with-*` env placeholders

### 4. Deploy using `doctl` (optional)

```bash
doctl apps create --spec deploy/digitalocean/frontend-app.yaml
doctl apps create --spec deploy/digitalocean/backend-app.yaml
```

For updates:

```bash
doctl apps update <frontend-app-id> --spec deploy/digitalocean/frontend-app.yaml
doctl apps update <backend-app-id> --spec deploy/digitalocean/backend-app.yaml
```

## Bootstrapping

On backend startup, bootstrap creates:

- Owner account (if `OWNER_PASSWORD` or `OWNER_PASSWORD_HASH` is provided)
- Default artist profile
- Starter contract templates (`exclusive`, `non-exclusive`, `split`)

Run explicitly:

```bash
cd backend
npm run seed
```

Backfill payment state fields for existing documents:

```bash
cd backend
npm run backfill:payments
```

## Important Environment Variables

See `.env.example` for full list.

- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_BEATS`
- `S3_BUCKET_CONTRACTS`
- `SES_FROM_EMAIL`
- `PRINTIFY_API_TOKEN`
- `PRINTIFY_SHOP_ID`
- `OWNER_EMAIL`
- `OWNER_PASSWORD` or `OWNER_PASSWORD_HASH`

## API Groups

- Public: `/api/public/*`
- Auth: `/api/auth/*`
- Owner: `/api/owner/*`
- Stripe webhook: `/api/webhooks/stripe`
