import type { Author, Publication } from "@/lib/schemas";

/** A run of text with inline styling; templates render these as nested <Text>. */
export interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type CitationStyle = "apa" | "ieee";

/* ------------------------------------------------------------------ */
/* Author parsing & matching                                           */
/* ------------------------------------------------------------------ */

/** "Rahman, Mehraz" or "Mehraz Rahman" → { family: "Rahman", given: "Mehraz" }. */
export function parseAuthor(raw: string): Author {
  const s = raw.trim().replace(/\s+/g, " ");
  if (s.includes(",")) {
    const [family, ...rest] = s.split(",");
    return { family: family.trim(), given: rest.join(",").trim() };
  }
  const parts = s.split(" ");
  if (parts.length === 1) return { family: parts[0], given: "" };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
}

/** "Rahman, M.; Smith, John A." → structured authors (empty entries dropped). */
export function parseAuthorList(raw: string): Author[] {
  return raw
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean)
    .map(parseAuthor);
}

export function authorListToString(authors: Author[]): string {
  return authors.map((a) => (a.given ? `${a.family}, ${a.given}` : a.family)).join("; ");
}

/** "Mehraz Abdul" → "M. A."; already-initialled input ("M.A.") is normalised the same way. */
export function initials(given: string): string {
  return given
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) =>
      part
        .split("-")
        .map((p) => `${p[0].toUpperCase()}.`)
        .join("-"),
    )
    .join(" ");
}

const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** True when `author` refers to the CV owner (family name equal, first initial compatible). */
export function isSelf(author: Author, selves: Author[]): boolean {
  const family = norm(author.family);
  if (!family) return false;
  const firstInitial = norm(author.given).charAt(0);
  return selves.some((s) => {
    if (norm(s.family) !== family) return false;
    const selfInitial = norm(s.given).charAt(0);
    return !selfInitial || !firstInitial || selfInitial === firstInitial;
  });
}

/** The owner's name plus any aliases, as authors to match against. */
export function selfAuthors(fullName: string, aliases: string[]): Author[] {
  return [fullName, ...aliases].map((a) => a.trim()).filter(Boolean).map(parseAuthor);
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

function joinAuthors(names: Segment[], lastSeparator: string, twoSeparator: string): Segment[] {
  const out: Segment[] = [];
  names.forEach((name, i) => {
    if (i > 0) {
      if (names.length === 2) out.push({ text: twoSeparator });
      else out.push({ text: i === names.length - 1 ? lastSeparator : ", " });
    }
    out.push(name);
  });
  return out;
}

function apaAuthors(authors: Author[], selves: Author[]): Segment[] {
  const names = authors.map((a) => ({
    text: a.given ? `${a.family}, ${initials(a.given)}` : a.family,
    bold: isSelf(a, selves),
  }));
  // APA 7: up to 20 authors; beyond that, first 19, an ellipsis, then the last author.
  const shown = names.length > 20 ? [...names.slice(0, 19), { text: "…" }, names[names.length - 1]] : names;
  return joinAuthors(shown, ", & ", ", & ");
}

function ieeeAuthors(authors: Author[], selves: Author[]): Segment[] {
  const names = authors.map((a) => ({
    text: a.given ? `${initials(a.given)} ${a.family}` : a.family,
    bold: isSelf(a, selves),
  }));
  // IEEE: more than six authors → first author et al.
  const shown = names.length > 6 ? [names[0], { text: " et al." }] : names;
  if (names.length > 6) return shown;
  return joinAuthors(shown, ", and ", " and ");
}

const clean = (s: string) => s.trim();
const endWithPeriod = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);
const doiUrl = (doi: string) => (/^https?:\/\//.test(doi) ? doi : `https://doi.org/${doi.replace(/^doi:\s*/i, "")}`);

function apaYear(p: Publication): string {
  if (p.status === "in-press") return "in press";
  if (p.status === "accepted") return "accepted";
  return clean(p.year) || "n.d.";
}

function apa(p: Publication, selves: Author[]): Segment[] {
  const s: Segment[] = [...apaAuthors(p.authors, selves)];
  const last = s[s.length - 1];
  const authorsEndWithPeriod = last && /\.$/.test(last.text);
  s.push({ text: `${authorsEndWithPeriod ? "" : "."} (${apaYear(p)}). ` });

  const title = clean(p.title);
  const venue = clean(p.venue);
  const pages = clean(p.pages);
  switch (p.kind) {
    case "journal": {
      s.push({ text: `${endWithPeriod(title)} ` });
      if (venue) {
        s.push({ text: venue, italic: true });
        if (clean(p.volume)) s.push({ text: ", " }, { text: clean(p.volume), italic: true });
        if (clean(p.issue)) s.push({ text: `(${clean(p.issue)})` });
        if (pages) s.push({ text: `, ${pages}` });
        s.push({ text: ". " });
      }
      break;
    }
    case "conference": {
      s.push({ text: `${endWithPeriod(title)} ` });
      if (venue) {
        s.push({ text: "In " }, { text: venue, italic: true });
        if (pages) s.push({ text: ` (pp. ${pages})` });
        s.push({ text: ". " });
      }
      if (clean(p.publisher)) s.push({ text: `${endWithPeriod(clean(p.publisher))} ` });
      break;
    }
    case "chapter": {
      s.push({ text: `${endWithPeriod(title)} ` });
      if (venue) {
        s.push({ text: "In " });
        if (clean(p.editors)) s.push({ text: `${clean(p.editors)} (Ed${p.editors.includes(",") || p.editors.includes("&") ? "s" : ""}.), ` });
        s.push({ text: venue, italic: true });
        if (pages) s.push({ text: ` (pp. ${pages})` });
        s.push({ text: ". " });
      }
      if (clean(p.publisher)) s.push({ text: `${endWithPeriod(clean(p.publisher))} ` });
      break;
    }
    case "preprint": {
      s.push({ text: title, italic: true }, { text: " [Preprint]. " });
      if (venue) s.push({ text: `${endWithPeriod(venue)} ` });
      break;
    }
  }
  if (clean(p.doi)) s.push({ text: doiUrl(clean(p.doi)) });
  else if (clean(p.url)) s.push({ text: clean(p.url) });
  return trimEnd(s);
}

function ieee(p: Publication, selves: Author[]): Segment[] {
  const s: Segment[] = [...ieeeAuthors(p.authors, selves)];
  const title = clean(p.title);
  const venue = clean(p.venue);
  const pages = clean(p.pages);
  const year = p.status === "published" ? clean(p.year) : p.status === "in-press" ? "in press" : "accepted for publication";
  s.push({ text: `, “${title},” ` });
  const tail: string[] = [];
  switch (p.kind) {
    case "journal":
      if (venue) s.push({ text: venue, italic: true });
      if (clean(p.volume)) tail.push(`vol. ${clean(p.volume)}`);
      if (clean(p.issue)) tail.push(`no. ${clean(p.issue)}`);
      if (pages) tail.push(`pp. ${pages}`);
      if (year) tail.push(year);
      break;
    case "conference":
      if (venue) s.push({ text: "in " }, { text: venue, italic: true });
      if (clean(p.location)) tail.push(clean(p.location));
      if (year) tail.push(year);
      if (pages) tail.push(`pp. ${pages}`);
      break;
    case "chapter":
      if (venue) s.push({ text: "in " }, { text: venue, italic: true });
      if (clean(p.editors)) tail.push(`${clean(p.editors)}, Ed${p.editors.includes(",") || p.editors.includes("&") ? "s" : ""}.`);
      if (clean(p.publisher)) tail.push(clean(p.publisher));
      if (year) tail.push(year);
      if (pages) tail.push(`pp. ${pages}`);
      break;
    case "preprint":
      if (venue) s.push({ text: venue, italic: true });
      if (year) tail.push(year);
      break;
  }
  if (tail.length) s.push({ text: `${venue ? ", " : ""}${tail.join(", ")}` });
  if (clean(p.doi)) s.push({ text: `, doi: ${clean(p.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}` });
  s.push({ text: "." });
  if (!clean(p.doi) && clean(p.url)) s.push({ text: ` [Online]. Available: ${clean(p.url)}` });
  return s;
}

function trimEnd(segments: Segment[]): Segment[] {
  const out = [...segments];
  const last = out[out.length - 1];
  if (last) out[out.length - 1] = { ...last, text: last.text.replace(/\s+$/, "") };
  return out;
}

/** Formats one publication as styled segments; the owner's name is bolded wherever it appears. */
export function formatCitation(p: Publication, style: CitationStyle, selves: Author[]): Segment[] {
  return style === "ieee" ? ieee(p, selves) : apa(p, selves);
}

/** Flattens segments to a plain string (tests, accessibility). */
export function segmentsToText(segments: Segment[]): string {
  return segments.map((s) => s.text).join("");
}
