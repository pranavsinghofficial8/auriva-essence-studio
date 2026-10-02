/**
 * "Continue with Google" through Google Identity Services, entirely in the browser.
 *
 * Google authenticates the visitor and hands back an ID token (a signed JWT). With no server,
 * we can't verify the signature, so we sanity-check its audience, issuer, expiry and email and
 * read the profile from it. That's enough to identify someone in this demo shop (accounts live
 * in localStorage), but it is NOT proof of identity for anything security-sensitive such as
 * real orders or payments. Those need server-side verification of the token.
 *
 * Setup: create an OAuth "Web application" client in Google Cloud Console and put its client ID
 * in VITE_GOOGLE_CLIENT_ID (see docs/google-sign-in.md). Without it the button is hidden.
 */

export const googleClientId: string | undefined =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || undefined;

type CredentialResponse = { credential: string };

type GoogleIdentity = {
  initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
    use_fedcm_for_button?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
  disableAutoSelect(): void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptLoading: Promise<GoogleIdentity> | undefined;

/** Load Google's script once and resolve with its `accounts.id` API. */
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);

  scriptLoading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error("Google sign-in didn't initialise"));
    };
    script.onerror = () => {
      scriptLoading = undefined; // allow a retry on the next mount
      script.remove();
      reject(new Error("Couldn't load Google sign-in"));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

export type GoogleProfile = { name: string; email: string; picture?: string };

type IdTokenClaims = {
  iss?: string;
  aud?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
};

/** Decode a base64url JWT segment as UTF-8 JSON (names can contain non-ASCII letters). */
function decodeSegment(segment: string): unknown {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * Read the visitor's profile from Google's ID token, or null if the token isn't for this site,
 * isn't from Google, has expired, or has no verified email.
 */
export function readGoogleCredential(credential: string): GoogleProfile | null {
  try {
    const payload = credential.split(".")[1];
    if (!payload) return null;
    const claims = decodeSegment(payload) as IdTokenClaims;

    const fromGoogle =
      claims.iss === "accounts.google.com" || claims.iss === "https://accounts.google.com";
    const forThisSite = !!googleClientId && claims.aud === googleClientId;
    const unexpired = typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
    if (!fromGoogle || !forThisSite || !unexpired) return null;
    if (!claims.email || claims.email_verified === false) return null;

    return {
      name: claims.name || claims.given_name || claims.email.split("@")[0] || "friend",
      email: claims.email,
      ...(claims.picture ? { picture: claims.picture } : {}),
    };
  } catch {
    return null;
  }
}

/** Stop Google from silently signing the visitor back in after they sign out. */
export function forgetGoogleSession() {
  if (typeof window !== "undefined") window.google?.accounts?.id?.disableAutoSelect();
}
