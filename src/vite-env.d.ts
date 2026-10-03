/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL, e.g. https://api.auriva.in. Unset = in-browser mock. See docs/backend-handoff.md. */
  readonly VITE_API_URL?: string;
  /** OAuth client ID for "Continue with Google" (public, not a secret). See docs/google-sign-in.md. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Razorpay test key id for the mock's payments (public). Unused once VITE_API_URL is set. See docs/payments.md. */
  readonly VITE_RAZORPAY_KEY_ID?: string;
}
