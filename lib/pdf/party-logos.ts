import type { PoliticalParty } from "@/lib/schemas";

let base = "/parties";

/**
 * Where the bundled party logos (public/parties/*.png) are loaded from: "/parties" in the browser,
 * or an absolute directory when rendering in Node (scripts/render-samples.tsx), like registerFonts().
 */
export function setPartyLogoBase(dir: string): void {
  base = dir;
}

/** The bundled logo of a party, or null for "other". */
export function partyLogoSrc(party: PoliticalParty): string | null {
  return party === "other" ? null : `${base}/${party}.png`;
}
