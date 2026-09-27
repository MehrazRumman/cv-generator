/** True when the string has visible characters. */
export const hasText = (value: string | null | undefined): value is string => !!value && value.trim() !== "";

/** Trimmed, non-empty items only (textarea "one per line" lists keep blank lines while editing). */
export const cleanList = (items: readonly string[]): string[] => items.map((i) => i.trim()).filter(Boolean);

/** Joins the non-empty parts with a separator: joinParts([a, "", b], " · ") → "a · b". */
export const joinParts = (parts: readonly (string | null | undefined)[], separator: string): string =>
  parts
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(separator);

/** "https://www.linkedin.com/in/me/" → "linkedin.com/in/me" for display. */
export const displayUrl = (url: string): string =>
  url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

/** Adds https:// when the user typed a bare domain, so PDF links are clickable. */
export const hrefFor = (url: string): string => (/^[a-z]+:/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
