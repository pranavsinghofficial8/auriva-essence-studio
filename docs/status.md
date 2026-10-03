# Status and next steps

Where the project stands as of 2026-10-03. Read this first when picking the work up; update it
whenever an item below is done or a new one appears. How the code works is in `CLAUDE.md` and the
other docs in this folder; what changed and when is in `changelog.md`.

## Where things stand

- **Storefront:** feature-complete as a front end, including the Razorpay pay step. Every page reads and writes data through
  `src/lib/api/`, which uses an in-browser mock until the backend is connected.
- **Backend:** being built by a separate developer against `backend-handoff.md` (also shared as
  a Claude Docs page, ["Auriva backend handoff"](https://claude.ai/code/artifact/639b5039-f7a3-44c6-98cf-14ab6b38d134),
  with a decisions table and go-live checklist). To connect it, set `VITE_API_URL`; no page changes
  are needed.
- **Tooling:** developed only in Claude Code (the Lovable sync was dropped on 2026-10-02). npm and
  `package-lock.json`. Work is committed and pushed straight to `main` when the owner asks.
- **Checks:** `npx tsc --noEmit` is clean and `npm run build` passes. `npm run lint` has 6
  pre-existing Prettier-only errors (see Known issues in `CLAUDE.md`).

## Waiting on decisions or inputs from the owner

| Item              | What's needed                                                                                                                                                                                                                   | Then                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting           | Where to deploy now that Lovable is gone. The build targets Cloudflare Workers (nitro), so that's the easiest fit; Vercel or Netlify also work. The old site at `auriva-essence-studio.lovable.app` no longer receives changes. | Set up deploys; set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in the build environment.                                                 |
| Domain            | The real domain (e.g. auriva.in).                                                                                                                                                                                               | Replace the `lovable.app` canonical and `og:url` links in `routes/about.tsx`, `routes/journal/index.tsx` and `routes/journal/$slug.tsx`. |
| Payments          | Razorpay chosen and the pay step built (2026-10-03). Needed: a Razorpay account and a **test Key Id** to try it now; later KYC and live keys for the backend developer (`payments.md`).                                         | The backend implements `POST /orders` with Razorpay, `POST /orders/:id/payment` and the webhook (`backend-handoff.md`). Blocks launch.   |
| Google sign-in    | Done locally (client ID set up and tested on 2026-10-03). For launch: add the live address and domain to the client's JavaScript origins and publish the consent screen (see `google-sign-in.md`).                              | Set `VITE_GOOGLE_CLIENT_ID` in the host's build environment. The backend must implement `POST /auth/google`.                             |
| Fragrance photos  | Photos evoking Jasmine, Palo Santo, Sandalwood, Oudh, and Camphor & Tulsi (landscape). The other five have one.                                                                                                                 | Add each to `src/assets/` and set `ritualImage` for that product in `lib/auriva-catalog.ts`.                                             |
| Backend decisions | Guest checkout, shipping and tax, content management, emails, order ids (the decisions table in `backend-handoff.md`).                                                                                                          | Adjust `types.ts`, the handoff doc and the UI as each is decided.                                                                        |
| Bulk & gifting    | Check the copy in the contact page's new section: it offers gift notes, custom packaging and pricing for larger quantities, and promises a reply within two working days. Change anything you can't offer.                      | Edit `OFFER` and the intro in `routes/contact.tsx`. The backend delivers `POST /enquiries/bulk` to the studio inbox.                     |

## Not built yet

- **Payments, backend half** (above). The storefront's pay step is built.
- **The homepage "Pause." section** described in the `README.md` brief.
- **Password reset and email verification** (no UI or endpoints yet).
- **Stock / sold-out states** (not modelled; see the Product notes in `backend-handoff.md`).

## When the backend goes live

Follow "Going live" in `backend-handoff.md`. On the frontend: set `VITE_API_URL`, click through
sign-up → bag → checkout → order confirmation against the real API, then delete
`src/lib/api/mock.ts` and the `usingMockApi` branches in `src/lib/api/index.ts`, and strip the
data (not the types) from `lib/auriva-catalog.ts` and `lib/auriva-journal.ts`.

## Optional clean-ups

- Fix the 6 Prettier errors with `npx eslint . --fix` and `npx prettier --write src/styles.css`.
- Replace `@lovable.dev/vite-tanstack-config` with an explicit Vite config if it ever gets in the
  way. It's the build setup and works without Lovable.

## Owner's working preferences

- Check every visual change at phone (375px), tablet (768px) and desktop widths before calling
  it done.
- Keep every page in the homepage's typography voice (lowercase light headings, `label-track`
  labels, square buttons; see `CLAUDE.md`).
- Explain changes in plain language; the owner isn't deep in the code.
