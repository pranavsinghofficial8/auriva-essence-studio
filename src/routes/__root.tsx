import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="label-track text-muted-foreground">404</p>
        <h1 className="mt-6 text-[38px] leading-tight font-extralight sm:text-[52px]">
          this page has drifted away
        </h1>
        <p className="mt-6 text-[17px] leading-[1.8] text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="label-track mt-10 inline-block border border-foreground/40 px-10 py-4 transition-all duration-700 hover:border-foreground hover:bg-foreground hover:text-background"
        >
          return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-[34px] leading-tight font-extralight sm:text-[44px]">
          this page didn't load
        </h1>
        <p className="mt-6 text-[17px] leading-[1.8] text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="label-track bg-foreground px-10 py-4 text-background transition-opacity duration-500 hover:opacity-85"
          >
            try again
          </button>
          <a
            href="/"
            className="label-track border border-foreground/40 px-10 py-4 transition-all duration-700 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            return home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Auriva — From Petal to Presence" },
      {
        name: "description",
        content:
          "Auriva crafts incense and home fragrance for everyday rituals. From petal to presence.",
      },
      { name: "author", content: "Auriva" },
      { property: "og:title", content: "Auriva — From Petal to Presence" },
      {
        property: "og:description",
        content:
          "Auriva crafts incense and home fragrance for everyday rituals. From petal to presence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,200..700;1,200..700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
