import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { errorMessage, getJournalPostPage, shareRitualStory } from "@/lib/api";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const page = await getJournalPostPage(params.slug);
    if (!page) throw notFound();
    return page;
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
      {errorMessage(error)}
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
  const { post, more: others } = Route.useLoaderData();
  const share = useMutation({ mutationFn: shareRitualStory });

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main>
        <article className="mx-auto w-full max-w-[820px] bg-ivory px-6 pt-40 pb-12 sm:px-10 sm:pt-48">
          <p className="label-track text-muted-foreground">
            {post.category} · {post.readTime} read
          </p>
          <h1 className="mt-6 text-[38px] leading-[1.1] lowercase sm:text-[58px]">{post.title}</h1>
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
              <h2 className="text-[26px] leading-snug lowercase sm:text-[34px]">{s.heading}</h2>
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

          <section className="mt-20 bg-stone p-8 sm:p-12">
            <p className="label-track text-muted-foreground">your ritual</p>
            <h2 className="mt-5 text-[28px] lowercase">what moment do you return to?</h2>
            {share.isSuccess ? (
              <p className="mt-8 text-[18px] lowercase">thank you for sharing it with us.</p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  share.mutate({
                    name: String(form.get("name") ?? "").trim(),
                    story: String(form.get("story") ?? "").trim(),
                    postSlug: post.slug,
                  });
                }}
                className="mt-8 space-y-6"
              >
                <input
                  required
                  name="name"
                  aria-label="Name"
                  placeholder="name"
                  className="w-full border-0 border-b border-taupe bg-transparent px-0 py-3 outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
                <textarea
                  required
                  name="story"
                  aria-label="Your ritual or story"
                  placeholder="your ritual or story"
                  rows={3}
                  className="w-full resize-none border-0 border-b border-taupe bg-transparent px-0 py-3 outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
                {share.error ? (
                  <p role="alert" className="text-[15px] text-destructive">
                    {errorMessage(share.error)}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={share.isPending}
                  className="label-track border border-foreground/40 px-8 py-4 transition-colors duration-700 hover:bg-foreground hover:text-background disabled:opacity-50"
                >
                  {share.isPending ? "sharing…" : "share your ritual"}
                </button>
              </form>
            )}
          </section>
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
