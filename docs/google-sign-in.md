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

## Current setup

Done on 2026-10-03. The Google Cloud project is **Auriva**, with a **Web application** OAuth
client. The consent screen is **External** and still in **Testing**, so only the test users
listed under **Audience** can sign in. Its Authorized JavaScript origins are
`http://localhost:8080` and `http://localhost`. The client ID is in the owner's `.env.local`
(git-ignored), and a real sign-in has been tested locally.

Still to do before launch:

- Add the deployed address and the real domain to **Authorized JavaScript origins** (see
  `status.md`, Hosting and Domain).
- Set `VITE_GOOGLE_CLIENT_ID` in the host's build environment.
- Publish the consent screen (**Audience → Publish app**) so anyone can sign in.
- The backend implements `POST /auth/google`.

The site never uses the **client secret**. Don't put it in `.env` files or the code.

## Set it up from scratch (about 5 minutes)

Google moved these screens into **Google Auth Platform** in 2025; older guides that say
"choose External on the OAuth consent screen" refer to the previous layout.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or pick a project.
2. **APIs & Services → OAuth consent screen** opens **Google Auth Platform**. Click **Get
   started** and fill in its four parts:
   - **App Information:** the app name (Auriva) and a support email.
   - **Audience:** choose **External**.
   - **Contact Information:** your email.
   - **Finish:** accept the policy, then **Create**.

   You don't need any extra scopes; the defaults (email, profile, openid) are what the button
   uses. While the app is in "Testing", only test users can sign in: add them under
   **Audience → Test users**. Publish the app when you go live.

3. **Clients → Create client**: choose **Web application**.
4. Under **Authorized JavaScript origins**, add every address the site runs on:
   - `http://localhost:8080` and `http://localhost` (local development)
   - wherever the site is deployed (hosting isn't chosen yet), e.g. a
     `https://<name>.workers.dev` address
   - the real domain once there is one, e.g. `https://auriva.in` and `https://www.auriva.in`

   You can add origins later; there's no need to create a new client. You don't need redirect
   URIs; the button uses a popup.

5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
6. Give it to the site:
   - **Local:** create `.env.local` (git-ignored) with
     `VITE_GOOGLE_CLIENT_ID=<your client id>`, then restart `npm run dev`.
   - **Deployed:** the client ID is public (it's visible in the page to every visitor),
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
