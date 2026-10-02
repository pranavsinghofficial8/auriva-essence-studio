import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { GoogleSignIn } from "@/components/auriva/GoogleSignIn";
import { errorMessage } from "@/lib/api";
import { useAuthActions } from "@/lib/api/hooks";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — Auriva" },
      {
        name: "description",
        content:
          "Sign in to your Auriva account to keep your bag, revisit your rituals and complete checkout.",
      },
      { property: "og:title", content: "Sign In — Auriva" },
      { property: "og:description", content: "Sign in or create your Auriva account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signUp, signInWithGoogle } = useAuthActions();

  const toBag = () => navigate({ to: "/cart" });
  const formAction = mode === "signin" ? signIn : signUp;
  const pending = formAction.isPending || signInWithGoogle.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithGoogle.reset();
    if (mode === "signin") {
      signIn.mutate({ email: email.trim(), password }, { onSuccess: toBag });
    } else {
      signUp.mutate({ name: name.trim(), email: email.trim(), password }, { onSuccess: toBag });
    }
  };

  const switchMode = () => {
    signIn.reset();
    signUp.reset();
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto grid w-full max-w-[1600px] gap-20 px-6 pt-36 pb-28 sm:px-10 sm:pt-44 lg:grid-cols-2 lg:gap-32">
        <div>
          <p className="label-track text-muted-foreground">account</p>
          <h1 className="mt-6 text-[40px] leading-[1.05] lowercase sm:text-[64px]">
            {mode === "signin" ? "welcome back" : "join the maison"}
          </h1>
          <p className="mt-8 max-w-md text-muted-foreground">
            Your account keeps your bag and your rituals in one place.
          </p>
        </div>

        <div className="w-full max-w-md space-y-8 self-center">
          <GoogleSignIn
            pending={signInWithGoogle.isPending}
            error={signInWithGoogle.error ? errorMessage(signInWithGoogle.error) : null}
            onCredential={(credential) => {
              signIn.reset();
              signUp.reset();
              signInWithGoogle.mutate(credential, { onSuccess: toBag });
            }}
          />

          <form onSubmit={submit} className="space-y-8">
            {mode === "signup" ? (
              <div>
                <label htmlFor="name" className="label-track text-muted-foreground">
                  your name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="label-track text-muted-foreground">
                email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-track text-muted-foreground">
                password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
              />
            </div>

            {formAction.error ? (
              <p role="alert" className="text-[15px] text-destructive">
                {errorMessage(formAction.error)}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="label-track w-full bg-foreground px-10 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50"
            >
              {formAction.isPending
                ? mode === "signin"
                  ? "signing in…"
                  : "creating your account…"
                : mode === "signin"
                  ? "sign in"
                  : "create account"}
            </button>

            <button
              type="button"
              onClick={switchMode}
              className="label-track text-muted-foreground transition-colors duration-500 hover:text-foreground"
            >
              {mode === "signin"
                ? "new here? create an account"
                : "already have an account? sign in"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
