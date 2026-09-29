import type { PoliticalDocument, PoliticalParty } from "@/lib/schemas";
import { templateInfo } from "@/templates/catalog";

export interface PartyInfo {
  id: PoliticalParty;
  name: { en: string; bn: string };
  short: string;
  /** The party's election symbol, drawn by templates/political/emblems.tsx. */
  symbol: { en: string; bn: string } | null;
  /** Main colour (used as the accent) and a second colour for stripes. */
  colors: { primary: string; secondary: string };
}

/**
 * Names, election symbols and colours of the parties with a built-in theme (sources: party flags and
 * the Election Commission's symbol list). The symbols are simple original drawings, not party logos;
 * users can upload an official logo in the form.
 */
export const PARTIES: Record<PoliticalParty, PartyInfo> = {
  bnp: {
    id: "bnp",
    name: { en: "Bangladesh Nationalist Party (BNP)", bn: "বাংলাদেশ জাতীয়তাবাদী দল (বিএনপি)" },
    short: "BNP",
    symbol: { en: "Sheaf of paddy", bn: "ধানের শীষ" },
    colors: { primary: "#0b6b3a", secondary: "#d62027" },
  },
  "awami-league": {
    id: "awami-league",
    name: { en: "Bangladesh Awami League", bn: "বাংলাদেশ আওয়ামী লীগ" },
    short: "Awami League",
    symbol: { en: "Boat", bn: "নৌকা" },
    colors: { primary: "#006a4e", secondary: "#e21b23" },
  },
  jamaat: {
    id: "jamaat",
    name: { en: "Bangladesh Jamaat-e-Islami", bn: "বাংলাদেশ জামায়াতে ইসলামী" },
    short: "Jamaat-e-Islami",
    symbol: { en: "Scales", bn: "দাঁড়িপাল্লা" },
    colors: { primary: "#2e8b3d", secondary: "#14532d" },
  },
  other: {
    id: "other",
    name: { en: "", bn: "" },
    short: "Independent / other",
    symbol: null,
    colors: { primary: "#1f3a5f", secondary: "#b8860b" },
  },
};

/** The party name to print: the typed name wins, then the built-in one in the label language. */
export function partyName(party: PoliticalParty, typed: string, lang: "en" | "bn"): string {
  return typed.trim() || PARTIES[party].name[lang];
}

/**
 * True when the document's accent is one set automatically (its party's colour or the template's
 * default) rather than picked by the user, so it may follow a change of party.
 */
export function isPartyAccent(doc: Pick<PoliticalDocument, "settings" | "data">): boolean {
  const accent = doc.settings.accentColor.toLowerCase();
  return accent === PARTIES[doc.data.party].colors.primary || accent === templateInfo("political", doc.settings.templateId).accent.toLowerCase();
}
