# Ember

A real-time chat PWA built with React, Socket.io, and Node.js.

## Features

- Real-time direct messages and group chats
- Typing indicators and online presence tracking
- Google OAuth sign-in
- Progressive Web App — installable on iOS and Android, works offline
- Animated splash screen, ember flame design system

## Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.io-client, `@react-oauth/google`  
**Backend:** Node.js, Express, Socket.io, MongoDB  
**PWA:** `vite-plugin-pwa`, Workbox, Web App Manifest

## Setup

1. `npm ci`
2. Copy `.env.example` → `.env`
3. Set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth web client ID
4. `npm run dev`

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID (from Google Cloud Console) |
| `VITE_API_URL` | Backend API base URL |

## PWA Icons

Icons are generated from `public/favicon.svg` using:

```bash
npx @vite-pwa/assets-generator@latest --preset minimal-2023 public/favicon.svg
```

Re-run this any time you update the favicon SVG.

## Deployment

Hosted on Vercel. Push to `main` to trigger a redeploy.  
Add all `VITE_*` environment variables in **Vercel → Settings → Environment Variables**.
