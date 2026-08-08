import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { getJournalPost, journalPosts, type JournalPost } from "@/lib/auriva-journal";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = getJournalPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Journal — Auriva" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    const url = `https://auriva-essence-studio.lovable.app/journal/${post.slug}`;
    return {
      meta: [
        { title: `${post.title} — Auriva Journal` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Organization", name: "Auriva" },
          }),
        },
      ],
    };
  },
  component: JournalArticle,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-6" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[24px]">That journal entry doesn't exist.</p>
      <Link to="/journal" className="label-track border-b border-foreground/40 pb-1">
        Back to the journal
      </Link>
    </div>
  ),
});

function JournalArticle() {
  const { post } = Route.useLoaderData() as { post: JournalPost };
  const others = journalPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main>
        <article className="mx-auto w-full max-w-[820px] px-6 pt-36 pb-8 sm:px-10 sm:pt-44">
          <p className="label-track text-muted-foreground">
            {post.category} · {post.readTime} read
          </p>
          <h1 className="mt-6 text-[34px] leading-[1.1] sm:text-[52px]">{post.title}</h1>
          <p className="mt-6 text-[18px] text-muted-foreground italic">{post.intro}</p>
        </article>

        <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            width={1200}
            height={900}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mx-auto w-full max-w-[820px] px-6 py-16 sm:px-10 sm:py-24">
          {post.sections.map((s) => (
            <section key={s.heading} className="mb-14 last:mb-0">
              <h2 className="text-[24px] leading-snug sm:text-[30px]">{s.heading}</h2>
              <div className="mt-5 space-y-5">
                {s.body.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="mt-16 border-t border-border pt-10">
            <Link
              to="/shop"
              className="label-track border-b border-foreground/40 pb-1 transition-opacity duration-300 hover:opacity-60"
            >
              Shop the collection →
            </Link>
          </div>
        </div>

        <section className="border-t border-border bg-mist py-20">
          <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10">
            <p className="label-track text-muted-foreground">Keep reading</p>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to="/journal/$slug"
                  params={{ slug: o.slug }}
                  className="group block"
                >
                  <div className="overflow-hidden bg-background">
                    <img
                      src={o.image}
                      alt={o.title}
                      loading="lazy"
                      width={1200}
                      height={900}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-5 text-[19px] leading-snug transition-opacity duration-300 group-hover:opacity-60">
                    {o.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
