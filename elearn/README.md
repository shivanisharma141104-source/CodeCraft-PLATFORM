# Coding E-Learning Platform

A full-stack e-learning platform built with React, Express, and Vite.

---

## 🚀 Deployment Guide

### Required Environment Variables

Set these on your hosting platform **before** deploying:

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ YES | Must be `production` |
| `JWT_SECRET` | ✅ YES | Long random secret string |
| `GEMINI_API_KEY` | ✅ YES | From Google AI Studio |
| `APP_URL` | Optional | Your public app URL |
| `PORT` | Optional | Defaults to 3000 |

> **Generate a JWT_SECRET:**
> ```
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### Build & Start

```bash
npm install
npm run build      # Builds frontend to dist/ and bundles server
npm start          # Runs the production server
```

### Development

```bash
npm install
npm run dev        # Starts with Vite hot-reload
```

---

### Deploying to Render / Railway / Fly.io

1. Set all environment variables listed above in the platform's dashboard
2. Set **Build Command:** `npm install && npm run build`
3. Set **Start Command:** `npm start`
4. Make sure `NODE_ENV=production` is set — this is the most common reason the app doesn't work after deployment

---

### ⚠️ Data Persistence Warning

This app stores data in `database.json` on disk. Most cloud platforms have **ephemeral storage**, meaning this file is deleted on every redeploy. For production use, migrate to a real database like PostgreSQL or Supabase.

