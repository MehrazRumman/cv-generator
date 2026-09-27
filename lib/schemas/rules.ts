import { z } from "zod";

/**
 * Every document schema is built from a rule set so one definition can be parsed two ways:
 *
 * - `strictRules`: what the form enforces before a PDF is downloaded (required fields, formats).
 * - `draftRules`:  structure only. Used when loading from localStorage or importing JSON,
 *                  so a half-finished document (empty name, half-typed email) is never rejected.
 *
 * Both rule sets return `z.ZodString`, so strict and draft schemas infer identical TS types.
 */
export interface Rules {
  strict: boolean;
  /** Non-empty after trimming. */
  required: (message: string) => z.ZodString;
  /** "" or a valid email. */
  email: () => z.ZodString;
  /** "" or a URL; protocol optional ("github.com/me" is fine). */
  url: () => z.ZodString;
  /** "" | "YYYY" | "YYYY-MM" — month is optional everywhere dates appear. */
  partialDate: () => z.ZodString;
  /** "" | "YYYY-MM-DD" — used for date of birth and declaration date. */
  isoDate: () => z.ZodString;
  /** "" | "YYYY". */
  year: () => z.ZodString;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?[^\s./]+\.[^\s]+$/i;
const PARTIAL_DATE_RE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const ISO_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const YEAR_RE = /^\d{4}$/;

const emptyOr = (re: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || re.test(v), message);

export const strictRules: Rules = {
  strict: true,
  required: (message) => z.string().trim().min(1, message),
  email: () => emptyOr(EMAIL_RE, "Enter a valid email address"),
  url: () => emptyOr(URL_RE, "Enter a valid link, e.g. linkedin.com/in/your-name"),
  partialDate: () => emptyOr(PARTIAL_DATE_RE, "Use YYYY or YYYY-MM"),
  isoDate: () => emptyOr(ISO_DATE_RE, "Use a valid date (YYYY-MM-DD)"),
  year: () => emptyOr(YEAR_RE, "Use a 4-digit year"),
};

export const draftRules: Rules = {
  strict: false,
  required: () => z.string(),
  email: () => z.string(),
  url: () => z.string(),
  partialDate: () => z.string(),
  isoDate: () => z.string(),
  year: () => z.string(),
};
