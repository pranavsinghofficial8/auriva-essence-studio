import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { signIn } from "@/lib/auriva-store";

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn({ name: name.trim() || email.split("@")[0] || "friend", email: email.trim() });
    navigate({ to: "/cart" });
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
            Your account keeps your bag and your rituals in one place. This demo account lives
            only in your browser — no details ever leave this device.
          </p>
        </div>

        <form onSubmit={submit} className="max-w-md space-y-8 self-center">
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
              required
              className="mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
            />
          </div>

          <button
            type="submit"
            className="label-track w-full bg-foreground px-10 py-5 text-background transition-opacity duration-500 hover:opacity-85"
          >
            {mode === "signin" ? "sign in" : "create account"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="label-track text-muted-foreground transition-colors duration-500 hover:text-foreground"
          >
            {mode === "signin" ? "new here? create an account" : "already have an account? sign in"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
