import { useEffect, useRef, useState } from "react";

import { googleClientId, loadGoogleIdentity } from "@/lib/google-auth";

/**
 * Google's official "Continue with Google" button followed by an "or" divider, for the top of
 * a sign-in form. It hands Google's ID token (`credential`) to `onCredential`, which sends it
 * to the backend to verify (`api.signInWithGoogle`). Shows `error` under the button. Renders
 * nothing in production until VITE_GOOGLE_CLIENT_ID is set.
 */
export function GoogleSignIn({
  onCredential,
  error: signInError = null,
  pending = false,
}: {
  onCredential: (credential: string) => void;
  error?: string | null;
  pending?: boolean;
}) {
  const slot = useRef<HTMLDivElement | null>(null);
  const handler = useRef(onCredential);
  handler.current = onCredential;
  const [loadError, setLoadError] = useState<string | null>(null);
  const error = loadError ?? signInError;

  useEffect(() => {
    if (!googleClientId) return;
    const clientId = googleClientId;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        const el = slot.current;
        if (cancelled || !el) return;
        google.initialize({
          client_id: clientId,
          ux_mode: "popup",
          itp_support: true,
          use_fedcm_for_button: true,
          callback: ({ credential }) => handler.current(credential),
        });
        // Google's button has a fixed width (200–400px), set once to fit its column.
        google.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          logo_alignment: "center",
          width: Math.max(200, Math.min(400, Math.round(el.clientWidth))),
        });
      })
      .catch(() => {
        if (!cancelled)
          setLoadError("Google sign-in couldn't load. Please use your email instead.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!googleClientId) {
    return import.meta.env.DEV ? (
      <p className="border border-dashed border-border p-4 text-[13px] text-muted-foreground">
        Google sign-in is hidden until <code>VITE_GOOGLE_CLIENT_ID</code> is set (see
        docs/google-sign-in.md). Visitors won't see this note.
      </p>
    ) : null;
  }

  return (
    <div>
      <div
        ref={slot}
        aria-busy={pending}
        className={`flex min-h-[44px] w-full justify-center transition-opacity duration-500 ${
          pending ? "pointer-events-none opacity-50" : ""
        }`}
      />
      {pending ? (
        <p className="mt-3 text-center text-[14px] text-muted-foreground">signing you in…</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-center text-[14px] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-8 flex items-center gap-4" aria-hidden="true">
        <span className="hairline flex-1" />
        <span className="label-track text-muted-foreground">or</span>
        <span className="hairline flex-1" />
      </div>
    </div>
  );
}
