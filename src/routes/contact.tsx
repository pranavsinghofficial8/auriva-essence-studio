import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Auriva — Write to the Maison" },
      {
        name: "description",
        content:
          "Questions about a fragrance, an order or a collaboration? Write to Auriva and we will answer personally, unhurried and in full.",
      },
      { property: "og:title", content: "Contact Auriva" },
      {
        property: "og:description",
        content: "Write to the Auriva maison — fragrance, orders and collaborations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main>
        <section className="mx-auto w-full max-w-[1600px] px-6 pt-36 pb-20 sm:px-10 sm:pt-44">
          <p className="label-track text-muted-foreground">contact</p>
          <h1 className="mt-6 max-w-[14ch] text-[40px] leading-[1.02] lowercase sm:text-[76px]">
            write to the maison
          </h1>
          <p className="mt-8 max-w-xl text-muted-foreground">
            A fragrance question, an order, a stockist enquiry or a collaboration — leave a note
            and someone from the studio will reply within two working days.
          </p>
        </section>

        <section className="bg-secondary">
          <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_1fr] lg:gap-28">
            <div className="space-y-10">
              {[
                { label: "email", value: "hello@auriva.in" },
                { label: "studio", value: "Auriva Fragrance Studio, Kolkata, India" },
                { label: "hours", value: "Monday to Friday · 10:00 – 18:00 IST" },
                { label: "instagram", value: "@auriva.in" },
              ].map((row) => (
                <div key={row.label} className="border-t border-border pt-5">
                  <p className="label-track text-muted-foreground">{row.label}</p>
                  <p className="mt-2 text-[19px]">{row.value}</p>
                </div>
              ))}
            </div>

            {sent ? (
              <div className="flex flex-col justify-center bg-background p-12">
                <p className="label-track text-taupe">received</p>
                <p className="mt-5 text-[24px] lowercase">thank you for writing.</p>
                <p className="mt-4 text-muted-foreground">
                  Your note is with the studio. We answer every message personally.
                </p>
              </div>
            ) : (
              <form
                className="space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                {[
                  { id: "name", label: "your name", type: "text" },
                  { id: "email", label: "email", type: "email" },
                  { id: "subject", label: "subject", type: "text" },
                ].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="label-track text-muted-foreground">
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      name={f.id}
                      type={f.type}
                      required
                      className="mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="label-track text-muted-foreground">
                    message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="mt-3 w-full resize-none border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="label-track bg-foreground px-12 py-5 text-background transition-opacity duration-500 hover:opacity-85"
                >
                  send note
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
