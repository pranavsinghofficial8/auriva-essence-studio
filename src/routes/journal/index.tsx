import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { errorMessage, getJournalPosts, shareRitualStory } from "@/lib/api";

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
  loader: async () => ({ journalPosts: await getJournalPosts() }),
  component: JournalIndex,
});

function JournalIndex() {
  const { journalPosts } = Route.useLoaderData();
  const share = useMutation({ mutationFn: shareRitualStory });

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main>
        <header className="bg-ivory px-6 pt-40 pb-24 text-center sm:px-10 sm:pt-52 sm:pb-32">
          <p className="label-track text-muted-foreground">journal</p>
          <h1 className="mx-auto mt-7 max-w-4xl text-[42px] leading-[1.08] lowercase sm:text-[72px]">
            notes for a slower life
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-muted-foreground">
            Everyday rituals for the spaces between waking, working, gathering and rest.
          </p>
        </header>

        <section className="grid gap-px bg-stone-deep px-px pb-px sm:grid-cols-2 lg:grid-cols-3">
          {journalPosts.map((post) => (
            <article key={post.slug} className="group bg-parchment p-6 pb-10 sm:p-8">
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
                <p className="label-track mt-7 text-muted-foreground">
                  {post.category} · {post.readTime}
                </p>
                <h2 className="mt-3 text-[24px] leading-snug lowercase transition-opacity duration-700 group-hover:opacity-60">
                  {post.title}
                </h2>
                <p className="mt-3 text-[15px] text-muted-foreground">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </section>

        <section className="bg-stone px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
            <div>
              <p className="label-track text-muted-foreground">your ritual</p>
              <h2 className="mt-6 max-w-lg text-[34px] leading-tight lowercase sm:text-[48px]">
                tell us about the moment you return to.
              </h2>
            </div>
            {share.isSuccess ? (
              <div className="flex items-center border-l border-taupe pl-8 text-[22px] lowercase">
                thank you. your ritual is now part of ours.
              </div>
            ) : (
              <form
                className="space-y-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  share.mutate({
                    name: String(form.get("name") ?? "").trim(),
                    story: String(form.get("story") ?? "").trim(),
                  });
                }}
              >
                <label className="block">
                  <span className="label-track text-muted-foreground">name</span>
                  <input
                    required
                    name="name"
                    className="mt-3 w-full border-0 border-b border-taupe bg-transparent px-0 py-3 outline-none focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="label-track text-muted-foreground">your ritual or story</span>
                  <textarea
                    required
                    name="story"
                    rows={4}
                    className="mt-3 w-full resize-none border-0 border-b border-taupe bg-transparent px-0 py-3 outline-none focus:border-foreground"
                  />
                </label>
                {share.error ? (
                  <p role="alert" className="text-[15px] text-destructive">
                    {errorMessage(share.error)}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={share.isPending}
                  className="label-track border border-foreground/40 px-9 py-4 transition-colors duration-700 hover:bg-foreground hover:text-background disabled:opacity-50"
                >
                  {share.isPending ? "sharing…" : "share your ritual"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
