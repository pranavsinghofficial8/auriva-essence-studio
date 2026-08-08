import { createFileRoute, Link } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { journalPosts } from "@/lib/auriva-journal";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Journal — Auriva" },
      {
        name: "description",
        content:
          "Notes on scent, ritual and slower days — guides to Auriva's fragrances, how to time your incense, and the traditions behind the brand.",
      },
      { property: "og:title", content: "Journal — Auriva" },
      {
        property: "og:description",
        content: "Notes on scent, ritual and slower days from the Auriva maison.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://auriva-essence-studio.lovable.app/journal" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://auriva-essence-studio.lovable.app/journal" }],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1600px] px-6 pt-36 pb-24 sm:px-10 sm:pt-44 sm:pb-32">
        <header className="text-center">
          <p className="label-track text-muted-foreground">Journal</p>
          <h1 className="mt-6 text-[38px] leading-[1.05] sm:text-[64px]">
            Notes on scent &amp; slower days
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Short readings on fragrance, ritual and the traditions Auriva is built from.
          </p>
        </header>

        <div className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {journalPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link to="/journal/$slug" params={{ slug: post.slug }} className="block">
                <div className="overflow-hidden bg-mist">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <p className="label-track mt-6 text-muted-foreground">
                  {post.category} · {post.readTime}
                </p>
                <h2 className="mt-3 text-[22px] leading-snug transition-opacity duration-300 group-hover:opacity-60">
                  {post.title}
                </h2>
                <p className="mt-3 text-[15px] text-muted-foreground">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
