import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import {
  ApiError,
  errorMessage,
  sendBulkEnquiry,
  sendContactMessage,
  type BulkEnquiry,
  type BulkEnquiryKind,
  type BulkQuantity,
  type CategorySlug,
} from "@/lib/api";
import { indianMobile } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Auriva — Write to the Maison" },
      {
        name: "description",
        content:
          "Questions about a fragrance, an order or a collaboration, or a bulk or corporate gifting enquiry? Write to Auriva and we will answer personally, unhurried and in full.",
      },
      { property: "og:title", content: "Contact Auriva" },
      {
        property: "og:description",
        content: "Write to the Auriva maison — fragrance, orders, gifting and bulk enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const send = useMutation({ mutationFn: sendContactMessage });
  const sent = send.isSuccess;

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
            A fragrance question, an order, a stockist enquiry or a collaboration — leave a note and
            someone from the studio will reply within two working days.
          </p>
          <Link
            to="/contact"
            hash="bulk"
            viewTransition={false}
            hashScrollIntoView={{ behavior: "smooth", block: "start" }}
            className="group label-track mt-10 inline-flex items-center gap-3 border-b border-foreground/40 pb-1"
          >
            bulk &amp; gifting enquiries
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
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
                  const form = new FormData(e.currentTarget);
                  const field = (key: string) => String(form.get(key) ?? "").trim();
                  send.mutate({
                    name: field("name"),
                    email: field("email"),
                    subject: field("subject"),
                    message: field("message"),
                  });
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
                {send.error ? (
                  <p role="alert" className="text-[15px] text-destructive">
                    {errorMessage(send.error)}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={send.isPending}
                  className="label-track bg-foreground px-12 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50"
                >
                  {send.isPending ? "sending…" : "send note"}
                </button>
              </form>
            )}
          </div>
        </section>

        <BulkEnquirySection />
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------ bulk & gifting ------------------------------ */

const KINDS: { value: BulkEnquiryKind; label: string }[] = [
  { value: "corporate", label: "Corporate gifting" },
  { value: "celebration", label: "Wedding or celebration" },
  { value: "hospitality", label: "Hotel, spa or studio" },
  { value: "retail", label: "Retail or stockist" },
  { value: "other", label: "Something else" },
];

const QUANTITIES: BulkQuantity[] = ["25-50", "50-100", "100-250", "250-500", "500+"];

const COLLECTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "incense-sticks", label: "Incense sticks" },
  { slug: "incense-cones", label: "Incense cones" },
  { slug: "bambooless-sticks", label: "Bambooless sticks" },
];

const OFFER = [
  {
    title: "your own assortment",
    body: "Any mix of fragrances across the three collections, chosen with you for the occasion.",
  },
  {
    title: "a personal touch",
    body: "Hand-written gift notes or custom packaging, on request.",
  },
  {
    title: "considered pricing",
    body: "Pricing for larger quantities, with timelines agreed before anything is made.",
  },
];

/** Rules for the bulk form. The backend re-validates; see docs/backend-handoff.md. */
const bulkSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  organisation: z.string().trim(),
  email: z.string().trim().email("Enter a valid email"),
  phone: indianMobile,
  kind: z.enum(["corporate", "celebration", "hospitality", "retail", "other"], {
    message: "Choose what it's for",
  }),
  quantity: z.enum(["25-50", "50-100", "100-250", "250-500", "500+"], {
    message: "Choose a rough quantity",
  }),
  neededBy: z.string(),
  city: z.string().trim().min(2, "Enter the delivery city"),
  message: z.string().trim().max(2000, "Please keep it under 2,000 characters"),
});

type BulkField = keyof z.input<typeof bulkSchema>;

const fieldClass =
  "mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground aria-[invalid=true]:border-destructive";

/** Today as YYYY-MM-DD in the visitor's time zone, the earliest "needed by" date. */
const today = () => new Date().toLocaleDateString("en-CA");

function BulkEnquirySection() {
  const send = useMutation({ mutationFn: sendBulkEnquiry });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<BulkField, string>>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  const serverFields = send.error instanceof ApiError ? (send.error.fields ?? {}) : {};
  const errorFor = (field: BulkField) => fieldErrors[field] ?? serverFields[field];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (key: BulkField) => String(form.get(key) ?? "");
    const parsed = bulkSchema.safeParse(
      Object.fromEntries(
        (
          [
            "name",
            "organisation",
            "email",
            "phone",
            "kind",
            "quantity",
            "neededBy",
            "city",
            "message",
          ] as const
        ).map((key) => [key, value(key)]),
      ),
    );
    if (!parsed.success) {
      const errors: Partial<Record<BulkField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as BulkField;
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      // The form is long: bring the first field to fix into view.
      e.currentTarget
        .querySelector<HTMLElement>(`[name="${parsed.error.issues[0]?.path[0] as string}"]`)
        ?.focus();
      return;
    }
    setFieldErrors({});
    const { organisation, neededBy, message, ...rest } = parsed.data;
    const enquiry: BulkEnquiry = {
      ...rest,
      ...(organisation ? { organisation } : {}),
      ...(neededBy ? { neededBy } : {}),
      ...(message ? { message } : {}),
      collections: form.getAll("collections").map(String) as CategorySlug[],
      customPackaging: form.get("customPackaging") === "on",
    };
    send.mutate(enquiry, {
      onSuccess: () => setSentTo(enquiry.name.split(" ")[0]?.toLowerCase() ?? ""),
    });
  };

  const error = (field: BulkField) =>
    errorFor(field) ? (
      <p id={`${field}-error`} className="mt-2 text-[13px] text-destructive">
        {errorFor(field)}
      </p>
    ) : null;

  const describedBy = (field: BulkField) => (errorFor(field) ? `${field}-error` : undefined);

  const input = (
    field: BulkField,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={`bulk-${field}`} className="label-track text-muted-foreground">
        {label}
      </label>
      <input
        id={`bulk-${field}`}
        name={field}
        aria-invalid={!!errorFor(field)}
        aria-describedby={describedBy(field)}
        className={`${fieldClass} placeholder:text-muted-foreground/60`}
        {...props}
      />
      {error(field)}
    </div>
  );

  const select = (field: BulkField, label: string, options: { value: string; label: string }[]) => (
    <div>
      <label htmlFor={`bulk-${field}`} className="label-track text-muted-foreground">
        {label}
      </label>
      <select
        id={`bulk-${field}`}
        name={field}
        defaultValue=""
        aria-invalid={!!errorFor(field)}
        aria-describedby={describedBy(field)}
        className={`${fieldClass} appearance-none`}
      >
        <option value="" disabled>
          choose
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error(field)}
    </div>
  );

  return (
    <section id="bulk" className="scroll-mt-20 bg-background">
      <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-6 py-24 sm:px-10 sm:py-32 lg:grid-cols-[1fr_1fr] lg:gap-28">
        <div>
          <p className="label-track text-muted-foreground">bulk &amp; gifting</p>
          <h2 className="mt-6 max-w-[16ch] text-[34px] leading-[1.1] lowercase sm:text-[42px]">
            for gifting, celebrations and spaces
          </h2>
          <p className="mt-8 max-w-lg text-muted-foreground">
            Auriva in quantity: corporate gifts, wedding favours, and the hotels, spas and studios
            that want their rooms to hold a quiet hour. Tell us what you have in mind and we will
            reply within two working days with options, pricing and timelines.
          </p>
          <ul className="mt-14 max-w-lg">
            {OFFER.map((item, i) => (
              <li key={item.title} className="flex gap-6 border-t border-border py-6">
                <span className="label-track pt-1.5 text-muted-foreground">0{i + 1}</span>
                <div>
                  <p className="text-[19px] lowercase">{item.title}</p>
                  <p className="mt-2 text-[15px] leading-[1.8] text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {sentTo !== null ? (
          <div className="flex flex-col justify-center bg-secondary p-12" aria-live="polite">
            <p className="label-track text-taupe">enquiry received</p>
            <p className="mt-5 text-[24px] lowercase">thank you{sentTo ? `, ${sentTo}` : ""}.</p>
            <p className="mt-4 text-muted-foreground">
              Your enquiry is with the studio. We will write back within two working days with
              options and pricing.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-10">
            <div className="grid gap-8 sm:grid-cols-2">
              {input("name", "your name", { autoComplete: "name" })}
              {input("organisation", "organisation", {
                autoComplete: "organization",
                placeholder: "optional",
              })}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {input("email", "email", { type: "email", autoComplete: "email" })}
              {input("phone", "mobile number", {
                type: "tel",
                autoComplete: "tel",
                inputMode: "tel",
                placeholder: "98765 43210",
              })}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {select("kind", "it's for", KINDS)}
              {select(
                "quantity",
                "quantity (boxes)",
                QUANTITIES.map((q) => ({ value: q, label: q.replace("-", "–") })),
              )}
            </div>

            <fieldset>
              <legend className="label-track text-muted-foreground">collections</legend>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Choose any, or none if you'd like help choosing.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {COLLECTIONS.map((c) => (
                  <label
                    key={c.slug}
                    className="cursor-pointer border border-border px-5 py-3 text-[15px] transition-colors duration-500 hover:border-foreground has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:outline has-focus-visible:outline-1 has-focus-visible:outline-offset-2"
                  >
                    <input type="checkbox" name="collections" value={c.slug} className="sr-only" />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-8 sm:grid-cols-2">
              {input("neededBy", "needed by", { type: "date", min: today() })}
              {input("city", "delivery city", { autoComplete: "address-level2" })}
            </div>

            <label className="flex cursor-pointer items-start gap-4 text-[16px]">
              <input
                type="checkbox"
                name="customPackaging"
                className="mt-1 size-4 shrink-0 accent-foreground"
              />
              <span>I'd like gift notes or custom packaging</span>
            </label>

            <div>
              <label htmlFor="bulk-message" className="label-track text-muted-foreground">
                tell us more (optional)
              </label>
              <textarea
                id="bulk-message"
                name="message"
                rows={4}
                maxLength={2000}
                aria-invalid={!!errorFor("message")}
                aria-describedby={describedBy("message")}
                placeholder="The occasion, a budget per box, fragrances you love…"
                className={`${fieldClass} resize-none placeholder:text-muted-foreground/60`}
              />
              {error("message")}
            </div>

            {send.error && !Object.keys(serverFields).length ? (
              <p role="alert" className="text-[15px] text-destructive">
                {errorMessage(send.error)}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={send.isPending}
              className="label-track w-full bg-foreground px-12 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50 sm:w-auto"
            >
              {send.isPending ? "sending…" : "send enquiry"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
