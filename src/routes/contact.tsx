import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { z } from "zod";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import {
  ApiError,
  errorMessage,
  sendBulkEnquiry,
  sendContactMessage,
  type BulkEnquiryKind,
  type BulkQuantity,
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
            A fragrance question, an order, a collaboration or gifting in quantity — leave a note
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

            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------------------- form ----------------------------------- */

type Mode = "note" | "bulk";

const KINDS: { value: BulkEnquiryKind; label: string }[] = [
  { value: "corporate", label: "Corporate gifting" },
  { value: "celebration", label: "Wedding or celebration" },
  { value: "hospitality", label: "Hotel, spa or studio" },
  { value: "retail", label: "Retail or stockist" },
  { value: "other", label: "Something else" },
];

const QUANTITIES: BulkQuantity[] = ["25-50", "50-100", "100-250", "250-500", "500+"];

/** Both kinds of message; the backend re-validates (see docs/backend-handoff.md). */
const common = {
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
};

const noteSchema = z.object({
  ...common,
  subject: z.string().trim().min(2, "Add a subject"),
  message: z.string().trim().min(2, "Write your message"),
});

const bulkSchema = z.object({
  ...common,
  phone: indianMobile,
  kind: z.enum(["corporate", "celebration", "hospitality", "retail", "other"], {
    message: "Choose what it's for",
  }),
  quantity: z.enum(["25-50", "50-100", "100-250", "250-500", "500+"], {
    message: "Choose a rough quantity",
  }),
  neededBy: z.string(),
  message: z.string().trim().max(2000, "Please keep it under 2,000 characters"),
});

const FIELDS = {
  note: ["name", "email", "subject", "message"],
  bulk: ["name", "email", "phone", "kind", "quantity", "neededBy", "message"],
} as const;

type Field = (typeof FIELDS)[Mode][number];

const fieldClass =
  "mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground aria-[invalid=true]:border-destructive placeholder:text-muted-foreground/60";

/** Today as YYYY-MM-DD in the visitor's time zone, the earliest "needed by" date. */
const today = () => new Date().toLocaleDateString("en-CA");

/**
 * One form for both a general note (`POST /contact`) and a bulk or gifting enquiry
 * (`POST /enquiries/bulk`), switched at the top. `/contact#bulk` opens it on bulk.
 */
function ContactForm() {
  const hash = useLocation({ select: (l) => l.hash });
  const [mode, setMode] = useState<Mode>("note");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const note = useMutation({ mutationFn: sendContactMessage });
  const bulk = useMutation({ mutationFn: sendBulkEnquiry });
  const send = mode === "note" ? note : bulk;

  // Arriving at /contact#bulk (e.g. from the footer) opens the bulk form.
  useEffect(() => {
    if (hash === "bulk") setMode("bulk");
  }, [hash]);

  const switchTo = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    note.reset();
    bulk.reset();
  };

  const serverFields = send.error instanceof ApiError ? (send.error.fields ?? {}) : {};
  const errorFor = (field: Field) =>
    fieldErrors[field] ?? (serverFields as Partial<Record<Field, string>>)[field];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(FIELDS[mode].map((k) => [k, String(form.get(k) ?? "")]));
    const parsed = (mode === "note" ? noteSchema : bulkSchema).safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as Field] ??= issue.message;
      setFieldErrors(errors);
      // Bring the first field to fix into view.
      e.currentTarget
        .querySelector<HTMLElement>(`[name="${String(parsed.error.issues[0]?.path[0])}"]`)
        ?.focus();
      return;
    }
    setFieldErrors({});
    if (mode === "note") {
      note.mutate(noteSchema.parse(values));
    } else {
      const { neededBy, message, ...rest } = bulkSchema.parse(values);
      bulk.mutate({ ...rest, ...(neededBy ? { neededBy } : {}), ...(message ? { message } : {}) });
    }
  };

  if (send.isSuccess) {
    return (
      <div className="flex flex-col justify-center bg-background p-12" aria-live="polite">
        <p className="label-track text-muted-foreground">received</p>
        <p className="mt-5 text-[24px] lowercase">
          {mode === "note" ? "thank you for writing." : "thank you for your enquiry."}
        </p>
        <p className="mt-4 text-muted-foreground">
          {mode === "note"
            ? "Your note is with the studio. We answer every message personally."
            : "It's with the studio. We will write back within two working days with options and pricing."}
        </p>
      </div>
    );
  }

  const error = (field: Field) =>
    errorFor(field) ? (
      <p id={`${field}-error`} className="mt-2 text-[13px] text-destructive">
        {errorFor(field)}
      </p>
    ) : null;

  const a11y = (field: Field) => ({
    "aria-invalid": !!errorFor(field),
    "aria-describedby": errorFor(field) ? `${field}-error` : undefined,
  });

  const input = (
    field: Field,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={field} className="label-track text-muted-foreground">
        {label}
      </label>
      <input id={field} name={field} className={fieldClass} {...a11y(field)} {...props} />
      {error(field)}
    </div>
  );

  const select = (field: Field, label: string, options: { value: string; label: string }[]) => (
    <div>
      <label htmlFor={field} className="label-track text-muted-foreground">
        {label}
      </label>
      <select
        id={field}
        name={field}
        defaultValue=""
        className={`${fieldClass} appearance-none`}
        {...a11y(field)}
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
    <form id="bulk" onSubmit={submit} noValidate className="scroll-mt-28 space-y-8">
      <fieldset>
        <legend className="sr-only">What are you writing about?</legend>
        <div className="flex gap-8 border-b border-border">
          {(
            [
              ["note", "a note"],
              ["bulk", "bulk & gifting"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="label-track -mb-px cursor-pointer border-b pb-4 text-muted-foreground transition-colors duration-500 hover:text-foreground has-checked:border-foreground has-checked:text-foreground has-focus-visible:outline has-focus-visible:outline-1 has-focus-visible:outline-offset-4 border-transparent"
            >
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => switchTo(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "bulk" ? (
        <p className="text-[15px] leading-[1.8] text-muted-foreground">
          Gifts for a team, favours for a wedding, or Auriva for your hotel, spa or studio. Tell us
          roughly what you need and we will reply with options and pricing.
        </p>
      ) : null}

      {input("name", "your name", { autoComplete: "name" })}
      {input("email", "email", { type: "email", autoComplete: "email" })}

      {mode === "note" ? (
        input("subject", "subject")
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2">
            {input("phone", "mobile number", {
              type: "tel",
              autoComplete: "tel",
              inputMode: "tel",
              placeholder: "98765 43210",
            })}
            {select("kind", "it's for", KINDS)}
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {select(
              "quantity",
              "quantity (boxes)",
              QUANTITIES.map((q) => ({ value: q, label: q.replace("-", "–") })),
            )}
            {input("neededBy", "needed by", { type: "date", min: today() })}
          </div>
        </>
      )}

      <div>
        <label htmlFor="message" className="label-track text-muted-foreground">
          {mode === "note" ? "message" : "tell us more (optional)"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={mode === "note" ? 5 : 4}
          maxLength={2000}
          placeholder={
            mode === "bulk"
              ? "Fragrances or collections, gift notes or packaging, delivery city, budget…"
              : undefined
          }
          className={`${fieldClass} resize-none`}
          {...a11y("message")}
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
        className="label-track bg-foreground px-12 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50"
      >
        {send.isPending ? "sending…" : mode === "note" ? "send note" : "send enquiry"}
      </button>
    </form>
  );
}
