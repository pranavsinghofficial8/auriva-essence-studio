import { z } from "zod";

/** An Indian mobile: 10 digits starting 6–9, optionally +91. Spaces and hyphens are stripped. */
export const indianMobile = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"));
