# ZapTalk Frontend

## Setup

1. Install dependencies with `npm ci`.
2. Create a `.env` file from `.env.example`.
3. Set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth web client ID.
4. Run the app with `npm run dev`.

## Google Sign-In

Google Sign-In requires a configured Vite environment variable:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

If `VITE_GOOGLE_CLIENT_ID` is missing, the app now disables the Google sign-in button and shows a configuration message instead of throwing a runtime error.
