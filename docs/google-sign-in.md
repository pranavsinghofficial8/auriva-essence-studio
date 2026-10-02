# Google sign-in

The sign-in page (`/auth`) offers Google's official **Continue with Google** button above the
email form. Google authenticates the visitor in a popup and returns an ID token, which the
frontend sends to the backend (`POST /auth/google`, see `backend-handoff.md`) to verify and turn
into a session. Until the backend exists, the in-browser mock decodes the token instead.

## How it works

| Piece                                                       | File                                          |
| ----------------------------------------------------------- | --------------------------------------------- |
| Loads Google's script (and decodes tokens for the mock)     | `src/lib/google-auth.ts`                      |
| Button, "or" divider, pending and error messages            | `src/components/auriva/GoogleSignIn.tsx`      |
| Sends the token with `signInWithGoogle` and goes to `/cart` | `src/routes/auth.tsx`, `src/lib/api/hooks.ts` |
| `POST /auth/google` (real backend) or the mock's check      | `src/lib/api/index.ts`, `src/lib/api/mock.ts` |
| Shows the profile photo and "signed in with Google"         | `src/routes/account.tsx`                      |

**Real backend:** it must verify the token's signature, audience (the client ID), issuer, expiry
and `email_verified`. The exact rules are in `backend-handoff.md`.

**Mock (no backend yet):** the token is accepted only if it's for this site's client ID, issued
by Google, unexpired and carries a verified email, but its signature can't be checked in the
browser. That's fine for development, but it isn't proof of identity.

If `VITE_GOOGLE_CLIENT_ID` isn't set, the button is hidden. In development a small note explains
why; visitors never see it.

## Set it up (about 5 minutes)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or pick a project.
2. **APIs & Services → OAuth consent screen**: choose **External**, and fill in the app name
   (Auriva), the support email and the developer contact. You don't need any extra scopes; the
   defaults (email, profile, openid) are what the button uses. While the app is in "Testing",
   only the test users you add can sign in, so publish it when you go live.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**: choose **Web
   application**.
4. Under **Authorized JavaScript origins**, add every address the site runs on:
   - `http://localhost:8080` and `http://localhost` (local development)
   - your Lovable URL, e.g. `https://auriva-essence-studio.lovable.app`
   - any custom domain, e.g. `https://auriva.com`

   You don't need redirect URIs; the button uses a popup.

5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
6. Give it to the site:
   - **Local:** create `.env.local` (git-ignored) with
     `VITE_GOOGLE_CLIENT_ID=<your client id>`, then restart `npm run dev`.
   - **Deployed (Lovable):** the client ID is public (it's visible in the page to every visitor),
     so it's safe to commit. Add the same line to a committed `.env` file, or set
     `VITE_GOOGLE_CLIENT_ID` in your host's build environment. It's read at build time.

`.env.example` lists the variable.

## Troubleshooting

- **The button doesn't appear:** the client ID isn't set, or the dev server wasn't restarted
  after setting it.
- **"origin_mismatch" / "The given origin is not allowed":** add the exact address (scheme,
  host and port) to Authorized JavaScript origins. Changes can take a few minutes to apply.
- **"Access blocked: app is in testing":** add yourself as a test user, or publish the consent
  screen.
- **The popup closes and nothing happens:** check the browser console. The site shows "Google
  sign-in didn't complete" if the token fails the checks above.
